// ============================================
// MOSCAR - Generation Store (API State)
// ============================================

import { writable, derived, get } from 'svelte/store';
import type { GenerationRecord, AspectRatio, Quality, GenerationModel } from '$lib/types';
import { toasts } from './toasts';
import { auth } from './auth';
import { saveGeneration, updateGeneration, loadGenerationHistory } from '$lib/services/database';
import { uploadMultipleToStorage } from '$lib/services/imageStorage';

// ============================================
// Generation State
// ============================================
export interface GenerationState {
  isGenerating: boolean;
  currentTaskId: string | null;
  progress: 'idle' | 'submitted' | 'processing' | 'complete' | 'error';
  generatedImages: string[];
  error: string | null;
}

export const generationState = writable<GenerationState>({
  isGenerating: false,
  currentTaskId: null,
  progress: 'idle',
  generatedImages: [],
  error: null
});

// ============================================
// Generation History (Session-based)
// ============================================
export const generationHistory = writable<GenerationRecord[]>([]);

/**
 * Fetch user's generation history from database
 * Call this when user logs in
 */
export async function fetchUserHistory(): Promise<void> {
  const user = auth.getUser();
  if (!user) {
    console.log('[History] No user logged in, skipping fetch');
    return;
  }

  console.log('[History] Loading history for user:', user.id);
  const records = await loadGenerationHistory(user.id);
  
  if (records.length > 0) {
    generationHistory.set(records);
    
    // Also populate generatedImages from successful records
    const allImages: string[] = [];
    for (const record of records) {
      if (record.resultUrls) {
        allImages.push(...record.resultUrls);
      }
    }
    
    if (allImages.length > 0) {
      generationState.update(s => ({
        ...s,
        generatedImages: allImages
      }));
      toasts.success(`Loaded ${allImages.length} images from your history`);
    }
  }
}

// ============================================
// Drawer State
// ============================================
export type DrawerMode = 'collapsed' | 'expanded' | 'fullscreen';

export const drawerState = writable<{
  mode: DrawerMode;
  selectedImageIndex: number | null;
}>({
  mode: 'collapsed',
  selectedImageIndex: null
});

// ============================================
// Hidden Images (persisted to database for logged-in users)
// Hides images from UI without deleting from database
// ============================================
function createHiddenImagesStore() {
  // Load from localStorage initially (fallback for non-logged-in users)
  const storedHidden: string[] = typeof localStorage !== 'undefined' 
    ? JSON.parse(localStorage.getItem('moscar-hidden-images') || '[]')
    : [];
  
  const { subscribe, update, set } = writable<Set<string>>(new Set(storedHidden));
  
  // Save to localStorage (fallback)
  function saveToLocal(hiddenSet: Set<string>) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('moscar-hidden-images', JSON.stringify([...hiddenSet]));
    }
  }
  
  // Async save to database for logged-in users
  async function syncToDatabase(hiddenSet: Set<string>) {
    const user = auth.getUser();
    if (user) {
      const { saveHiddenImages } = await import('$lib/services/database');
      await saveHiddenImages(user.id, [...hiddenSet]);
    }
  }
  
  return {
    subscribe,
    
    /**
     * Hide an image (delete from UI)
     */
    hide: (imageUrl: string) => {
      update(hidden => {
        hidden.add(imageUrl);
        saveToLocal(hidden);
        syncToDatabase(hidden); // Async save to database
        return hidden;
      });
    },
    
    /**
     * Unhide an image (make visible again)
     */
    unhide: (imageUrl: string) => {
      update(hidden => {
        hidden.delete(imageUrl);
        saveToLocal(hidden);
        syncToDatabase(hidden);
        return hidden;
      });
    },
    
    /**
     * Check if an image is hidden
     */
    isHidden: (imageUrl: string): boolean => {
      const hidden = get({ subscribe });
      return hidden.has(imageUrl);
    },
    
    /**
     * Clear all hidden images
     */
    clearAll: () => {
      set(new Set());
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('moscar-hidden-images');
      }
      syncToDatabase(new Set());
    },
    
    /**
     * Load hidden images from database for logged-in user
     * Call this after user logs in
     */
    loadFromDatabase: async () => {
      const user = auth.getUser();
      if (!user) return;
      
      const { loadHiddenImages } = await import('$lib/services/database');
      const hiddenUrls = await loadHiddenImages(user.id);
      
      if (hiddenUrls.length > 0) {
        set(new Set(hiddenUrls));
        saveToLocal(new Set(hiddenUrls)); // Also update localStorage
        console.log(`[HiddenImages] Loaded ${hiddenUrls.length} hidden images from database`);
      }
    }
  };
}

export const hiddenImages = createHiddenImagesStore();

// ============================================
// Derived Stores
// ============================================

export const isGenerating = derived(generationState, $state => $state.isGenerating);
export const currentImages = derived(generationState, $state => $state.generatedImages);
export const generationError = derived(generationState, $state => $state.error);

// Visible images (filtered out hidden ones)
export const visibleImages = derived(
  [generationState, hiddenImages],
  ([$state, $hidden]) => {
    const visible = $state.generatedImages.filter(url => !$hidden.has(url));
    // Log when there's a difference (some images hidden)
    if ($state.generatedImages.length !== visible.length) {
      console.log(`[VisibleImages] Total: ${$state.generatedImages.length}, Hidden: ${$hidden.size}, Visible: ${visible.length}`);
    }
    return visible;
  }
);

// ============================================
// Generation Actions
// ============================================

/**
 * Start a generation task
 */
export async function startGeneration(
  prompt: string, 
  aspectRatio: AspectRatio, 
  quality: Quality
): Promise<void> {
  // Update state to generating
  generationState.update(s => ({
    ...s,
    isGenerating: true,
    progress: 'submitted',
    error: null
  }));

  try {
    // Call our API endpoint
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, aspectRatio, quality })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to start generation');
    }

    const data = await response.json();
    
    if (data.code !== 200) {
      throw new Error(data.msg || 'API error');
    }

    const taskId = data.data.taskId;
    
    generationState.update(s => ({
      ...s,
      currentTaskId: taskId,
      progress: 'processing'
    }));

    // Add to history
    const historyRecord: GenerationRecord = {
      id: taskId,
      timestamp: Date.now(),
      prompt,
      aspectRatio,
      quality,
      taskId,
      state: 'waiting'
    };
    
    generationHistory.update(h => [historyRecord, ...h]);

    // Start polling
    await pollForCompletion(taskId);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    generationState.update(s => ({
      ...s,
      isGenerating: false,
      progress: 'error',
      error: errorMessage
    }));
  }
}

/**
 * Expand variations in prompt. Converts {a|b|c} syntax to array of prompts.
 * Supports multiple variation blocks - each block cycles independently.
 */
function expandVariations(prompt: string, count: number): string[] {
  console.log(`[Generation] expandVariations called - count: ${count}, prompt: ${prompt.substring(0, 100)}...`);
  
  // Find all variation blocks {option1|option2|option3}
  const variationRegex = /\{([^}]+\|[^}]+)\}/g;
  const matches: { block: string; options: string[] }[] = [];
  let match;
  
  while ((match = variationRegex.exec(prompt)) !== null) {
    const options = match[1].split('|').map(s => s.trim()).filter(s => s);
    matches.push({ block: match[0], options });
    console.log(`[Generation] Found variation block: ${match[0]} with ${options.length} options`);
  }
  
  if (matches.length === 0) {
    // No variations, return prompt repeated count times
    console.log(`[Generation] No variations found, returning ${count} identical prompts`);
    return Array(count).fill(prompt);
  }
  
  // Generate prompts by cycling through variations
  const prompts: string[] = [];
  for (let i = 0; i < count; i++) {
    let expandedPrompt = prompt;
    
    // Replace each variation block with the appropriate option
    for (const { block, options } of matches) {
      const option = options[i % options.length];
      expandedPrompt = expandedPrompt.replace(block, option);
    }
    
    prompts.push(expandedPrompt);
    console.log(`[Generation] Prompt ${i + 1}: ${expandedPrompt.substring(0, 80)}...`);
  }
  
  console.log(`[Generation] Generated ${prompts.length} prompts from variations`);
  return prompts;
}

/**
 * Start a batch generation (multiple images)
 */
export async function startBatchGeneration(
  prompt: string, 
  aspectRatio: AspectRatio, 
  quality: Quality,
  batchCount: number,
  model: GenerationModel = 'seedream/4.5-text-to-image',
  imageUrls: string[] = [],
  resolution: string = '1K'
): Promise<void> {
  // Expand variations into individual prompts
  const prompts = expandVariations(prompt, batchCount);
  
  // Update state to generating
  generationState.update(s => ({
    ...s,
    isGenerating: true,
    progress: 'submitted',
    error: null
  }));

  const taskIds: string[] = [];
  const DELAY_BETWEEN_REQUESTS = 500; // 500ms delay between requests

  // Determine if model supports/requires images
  const modelsSupportingImages = [
    'seedream/4.5-edit', 
    'flux-2/pro-image-to-image',
    'nano-banana-pro'
  ];
  const shouldSendImages = modelsSupportingImages.includes(model);

  try {
    // Send all generation requests with slight delays
    for (let i = 0; i < prompts.length; i++) {
      const currentPrompt = prompts[i];
      
      // Add delay between requests (not for the first one)
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: currentPrompt, 
          aspectRatio, 
          quality,
          resolution,
          model,
          imageUrls: shouldSendImages ? imageUrls : undefined
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to start generation ${i + 1}`);
      }

      const data = await response.json();
      
      if (data.code !== 200) {
        throw new Error(data.msg || 'API error');
      }

      const taskId = data.data.taskId;
      taskIds.push(taskId);

      // Add to history
      const historyRecord: GenerationRecord = {
        id: taskId,
        timestamp: Date.now(),
        prompt: currentPrompt,
        aspectRatio,
        quality,
        taskId,
        state: 'waiting',
        model: model // Track which model was used
      };
      
      generationHistory.update(h => [historyRecord, ...h]);

      // Save to database for logged-in users
      const user = auth.getUser();
      if (user) {
        saveGeneration(user.id, historyRecord).then(dbId => {
          if (dbId) {
            console.log(`[BatchGeneration] Saved to database with ID: ${dbId}`);
          }
        });
      }
    }

    generationState.update(s => ({
      ...s,
      currentTaskId: taskIds[0],
      progress: 'processing'
    }));

    // Poll all tasks concurrently
    await Promise.all(taskIds.map(taskId => pollForCompletion(taskId)));

    // All done
    generationState.update(s => ({
      ...s,
      isGenerating: false,
      progress: 'complete'
    }));

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    toasts.error(`Generation failed: ${errorMessage}`);
    generationState.update(s => ({
      ...s,
      isGenerating: false,
      progress: 'error',
      error: errorMessage
    }));
  }
}

/**
 * Start a multi-model batch generation (generates for each selected model)
 */
export async function startMultiModelBatchGeneration(
  prompt: string, 
  aspectRatio: AspectRatio, 
  quality: Quality,
  batchCount: number,
  models: GenerationModel[] = ['seedream/4.5-text-to-image'],
  imageUrls: string[] = [],
  resolution: string = '1K'
): Promise<void> {
  console.log(`[Generation] startMultiModelBatchGeneration called`);
  console.log(`[Generation] Models: ${models.join(', ')}`);
  console.log(`[Generation] Batch count: ${batchCount}`);
  console.log(`[Generation] Prompt: ${prompt.substring(0, 150)}...`);
  
  // Expand variations into individual prompts
  const prompts = expandVariations(prompt, batchCount);
  
  // Update state to generating
  generationState.update(s => ({
    ...s,
    isGenerating: true,
    progress: 'submitted',
    error: null
  }));

  const taskIds: string[] = [];
  const DELAY_BETWEEN_REQUESTS = 800; // 800ms delay between requests

  // Models that support image input
  const modelsSupportingImages = [
    'seedream/4.5-edit', 
    'flux-2/pro-image-to-image',
    'nano-banana-pro'
  ];

  try {
    // Loop through each model
    for (const model of models) {
      const shouldSendImages = modelsSupportingImages.includes(model);
      
      // Send generation requests for each prompt with each model
      for (let i = 0; i < prompts.length; i++) {
        const currentPrompt = prompts[i];
        
        // Add delay between requests (not for the first one)
        if (taskIds.length > 0) {
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
        }

        try {
          const requestBody = { 
            prompt: currentPrompt, 
            aspectRatio, 
            quality,
            resolution,
            model,
            imageUrls: shouldSendImages ? imageUrls : undefined
          };
          
          console.log(`[Generation] Sending API request for ${model}:`, {
            promptLength: currentPrompt.length,
            aspectRatio,
            model
          });

          const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
          });

          const data = await response.json();
          console.log(`[Generation] API response for ${model}:`, data);

          if (!response.ok || data.code !== 200) {
            const errorMsg = data.msg || data.message || `Failed to start generation for ${model}`;
            console.error(`[Generation] Model ${model} failed:`, errorMsg);
            toasts.error(`${model.split('/').pop() || model} failed: ${errorMsg}`);
            continue; // Skip this model but continue with others
          }

          const taskId = data.data.taskId;
          taskIds.push(taskId);

          // Add to history with model info
          const historyRecord: GenerationRecord = {
            id: taskId,
            timestamp: Date.now(),
            prompt: currentPrompt,
            aspectRatio,
            quality,
            taskId,
            state: 'waiting',
            model: model
          };
          
          generationHistory.update(h => [historyRecord, ...h]);

          // Save to database for logged-in users
          const user = auth.getUser();
          if (user) {
            saveGeneration(user.id, historyRecord).then(dbId => {
              if (dbId) {
                console.log(`[Generation] Saved to database with ID: ${dbId}`);
              }
            });
          }
        } catch (modelError) {
          console.error(`[Generation] Exception for model ${model}:`, modelError);
          toasts.error(`${model.split('/').pop() || model}: ${modelError instanceof Error ? modelError.message : 'Failed'}`);
          // Continue with next model
        }
      }
    }

    generationState.update(s => ({
      ...s,
      currentTaskId: taskIds[0],
      progress: 'processing'
    }));

    // Poll all tasks concurrently
    await Promise.all(taskIds.map(taskId => pollForCompletion(taskId)));

    // All done
    toasts.success(`Generated ${taskIds.length} image${taskIds.length !== 1 ? 's' : ''} successfully!`);
    generationState.update(s => ({
      ...s,
      isGenerating: false,
      progress: 'complete'
    }));

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    toasts.error(`Generation failed: ${errorMessage}`);
    generationState.update(s => ({
      ...s,
      isGenerating: false,
      progress: 'error',
      error: errorMessage
    }));
  }
}

/**
 * Poll for task completion
 */
async function pollForCompletion(taskId: string): Promise<void> {
  const maxAttempts = 60; // 5 minutes max (60 * 5s = 5min avg)
  const startTime = Date.now();
  let attempts = 0;
  let pollInterval = 2000; // Start with 2 seconds
  let hasWarnedTimeout = false;
  
  console.log(`[Poll] Starting polling for task ${taskId.substring(0, 12)}...`);
  
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, pollInterval));
    attempts++;
    
    // Calculate elapsed time
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    
    // Log progress every 10 attempts
    if (attempts % 10 === 0) {
      console.log(`[Poll] Task ${taskId.substring(0, 8)}... attempt ${attempts}/${maxAttempts} (${elapsed}s elapsed)`);
    }
    
    // Warn user at 65 seconds
    if (elapsed >= 65 && !hasWarnedTimeout) {
      hasWarnedTimeout = true;
      console.log(`[Poll] Task ${taskId.substring(0, 8)}... taking longer than expected (${elapsed}s)`);
      toasts.info('Generation taking longer than usual, please wait...');
    }
    
    // Increase interval after 15 attempts (30 seconds)
    if (attempts > 15) pollInterval = 5000;
    
    try {
      const response = await fetch(`/api/status?taskId=${taskId}`);
      
      if (!response.ok) {
        console.error(`[Poll] Failed to poll status for ${taskId.substring(0, 8)}...`);
        continue;
      }
      
      const data = await response.json();
      
      if (data.code !== 200) {
        console.error(`[Poll] API error for ${taskId.substring(0, 8)}...:`, data.msg);
        continue;
      }
      
      const state = data.data.state;
      
      if (state === 'success') {
        const completionTime = Math.round((Date.now() - startTime) / 1000);
        console.log(`[Poll] Task ${taskId.substring(0, 8)}... completed successfully in ${completionTime}s`);
        
        // Parse result
        const resultJson = JSON.parse(data.data.resultJson || '{}');
        const tempImageUrls = resultJson.resultUrls || [];
        
        console.log(`[Poll] Task ${taskId.substring(0, 8)}... raw result URLs:`, tempImageUrls.length, tempImageUrls);
        
        if (tempImageUrls.length === 0) {
          console.warn(`[Poll] Task ${taskId.substring(0, 8)}... completed but returned NO images!`);
        }
        
        // Upload images to permanent Supabase Storage for logged-in users
        const user = auth.getUser();
        let imageUrls = tempImageUrls;
        
        if (user && tempImageUrls.length > 0) {
          console.log(`[Generation] Uploading ${tempImageUrls.length} images to permanent storage...`);
          imageUrls = await uploadMultipleToStorage(tempImageUrls, user.id);
          console.log(`[Generation] Uploaded to Supabase Storage (${imageUrls.length}):`, imageUrls);
        }
        
        // Get current count before update
        const currentState = get(generationState);
        console.log(`[Poll] Before update: ${currentState.generatedImages.length} images in store`);
        
        generationState.update(s => ({
          ...s,
          generatedImages: [...imageUrls, ...s.generatedImages]
        }));
        
        // Log after update
        const afterState = get(generationState);
        console.log(`[Poll] After update: ${afterState.generatedImages.length} images in store (+${imageUrls.length})`);
        
        // Update history
        generationHistory.update(h => 
          h.map(record => 
            record.taskId === taskId 
              ? { ...record, state: 'success', resultUrls: imageUrls }
              : record
          )
        );

        // Update database with permanent URLs for logged-in users
        if (user) {
          updateGeneration(taskId, 'success', imageUrls).then(success => {
            if (success) {
              console.log(`[Generation] Updated database with ${imageUrls.length} permanent URLs`);
            } else {
              console.error(`[Generation] FAILED to update database for task ${taskId.substring(0, 8)}...`);
            }
          });
        }
        
        // Don't auto-open drawer - user can click "View Generated Images" if they want
        
        return;
        
      } else if (state === 'fail') {
        const errorMsg = data.data.failMsg || 'Generation failed';
        const failCode = data.data.failCode || '';
        const fullError = failCode ? `[${failCode}] ${errorMsg}` : errorMsg;
        
        console.log(`[Poll] Task ${taskId.substring(0, 8)}... failed: ${fullError}`);
        
        // Show toast with detailed error
        toasts.error(`Task failed: ${fullError}`);
        
        // Don't set isGenerating to false here - caller handles it after all tasks complete
        generationState.update(s => ({
          ...s,
          error: fullError
        }));
        
        // Update history
        generationHistory.update(h => 
          h.map(record => 
            record.taskId === taskId 
              ? { ...record, state: 'fail', errorMessage: fullError }
              : record
          )
        );

        // Update database for logged-in users
        const userForFail = auth.getUser();
        if (userForFail) {
          updateGeneration(taskId, 'fail', undefined, fullError);
        }
        
        return;
      }
      
      // Still waiting, continue polling
      
    } catch (error) {
      console.error(`[Poll] Polling error for ${taskId.substring(0, 8)}...:`, error);
      // Continue polling despite errors
    }
  }
  
  // Timeout - update history and show error
  const timeoutError = `Generation timed out after ${Math.round((Date.now() - startTime) / 1000)}s`;
  console.error(`[Poll] ${timeoutError} for task ${taskId.substring(0, 8)}...`);
  
  toasts.error(timeoutError);
  
  // Update history to reflect timeout
  generationHistory.update(h => 
    h.map(record => 
      record.taskId === taskId 
        ? { ...record, state: 'fail', errorMessage: timeoutError }
        : record
    )
  );
  
  // Update database for logged-in users
  const userForTimeout = auth.getUser();
  if (userForTimeout) {
    updateGeneration(taskId, 'fail', undefined, timeoutError);
  }
  
  // Note: isGenerating is now handled by the caller after Promise.all completes
}

/**
 * Start an edit/refine task
 */
export async function startEdit(
  imageUrl: string,
  prompt: string,
  aspectRatio: AspectRatio,
  quality: Quality
): Promise<void> {
  generationState.update(s => ({
    ...s,
    isGenerating: true,
    progress: 'submitted',
    error: null
  }));

  try {
    const response = await fetch('/api/edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl, prompt, aspectRatio, quality })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to start edit');
    }

    const data = await response.json();
    
    if (data.code !== 200) {
      throw new Error(data.msg || 'API error');
    }

    const taskId = data.data.taskId;
    
    generationState.update(s => ({
      ...s,
      currentTaskId: taskId,
      progress: 'processing'
    }));

    // Poll for completion
    await pollForCompletion(taskId);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    generationState.update(s => ({
      ...s,
      isGenerating: false,
      progress: 'error',
      error: errorMessage
    }));
  }
}

/**
 * Clear generation error
 */
export function clearError(): void {
  generationState.update(s => ({
    ...s,
    error: null
  }));
}

/**
 * Clear all generated images
 */
export function clearImages(): void {
  generationState.update(s => ({
    ...s,
    generatedImages: []
  }));
}

/**
 * Set drawer mode
 */
export function setDrawerMode(mode: DrawerMode): void {
  drawerState.update(s => ({
    ...s,
    mode
  }));
}

/**
 * Select image for fullscreen
 */
export function selectImage(index: number | null): void {
  drawerState.update(s => ({
    ...s,
    selectedImageIndex: index,
    mode: index !== null ? 'fullscreen' : s.mode
  }));
}
