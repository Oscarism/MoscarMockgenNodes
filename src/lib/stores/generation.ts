// ============================================
// MOSCAR - Generation Store (API State)
// ============================================

import { writable, derived, get } from 'svelte/store';
import type { GenerationRecord, AspectRatio, Quality, GenerationModel } from '$lib/types';
import { toasts } from './toasts';
import { auth } from './auth';
import { saveGeneration, updateGeneration, loadGenerationHistory } from '$lib/services/database';

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
    }
    
    toasts.success(`Loaded ${records.length} generations from your history`);
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
// Hidden Images (persisted in localStorage)
// Hides images from UI without deleting from database
// ============================================
function createHiddenImagesStore() {
  // Load from localStorage if available
  const storedHidden: string[] = typeof localStorage !== 'undefined' 
    ? JSON.parse(localStorage.getItem('moscar-hidden-images') || '[]')
    : [];
  
  const { subscribe, update, set } = writable<Set<string>>(new Set(storedHidden));
  
  // Save to localStorage whenever the store changes
  function save(hiddenSet: Set<string>) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('moscar-hidden-images', JSON.stringify([...hiddenSet]));
    }
  }
  
  return {
    subscribe,
    
    /**
     * Hide an image from the UI
     */
    hide: (imageUrl: string) => {
      update(hidden => {
        hidden.add(imageUrl);
        save(hidden);
        return hidden;
      });
    },
    
    /**
     * Unhide an image (make visible again)
     */
    unhide: (imageUrl: string) => {
      update(hidden => {
        hidden.delete(imageUrl);
        save(hidden);
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
  ([$state, $hidden]) => $state.generatedImages.filter(url => !$hidden.has(url))
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

        if (!response.ok) {
          throw new Error(data.msg || data.message || `Failed to start generation for ${model}`);
        }
        
        if (data.code !== 200) {
          throw new Error(data.msg || data.message || 'API error');
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
  const maxAttempts = 60; // 5 minutes max
  let attempts = 0;
  let pollInterval = 2000; // Start with 2 seconds
  
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, pollInterval));
    attempts++;
    
    // Increase interval after 15 attempts (30 seconds)
    if (attempts > 15) pollInterval = 5000;
    
    try {
      const response = await fetch(`/api/status?taskId=${taskId}`);
      
      if (!response.ok) {
        console.error('Failed to poll status');
        continue;
      }
      
      const data = await response.json();
      
      if (data.code !== 200) {
        console.error('API error during polling:', data.msg);
        continue;
      }
      
      const state = data.data.state;
      
      if (state === 'success') {
        // Parse result
        const resultJson = JSON.parse(data.data.resultJson || '{}');
        const imageUrls = resultJson.resultUrls || [];
        
        generationState.update(s => ({
          ...s,
          isGenerating: false,
          progress: 'complete',
          generatedImages: [...imageUrls, ...s.generatedImages]
        }));
        
        // Update history
        generationHistory.update(h => 
          h.map(record => 
            record.taskId === taskId 
              ? { ...record, state: 'success', resultUrls: imageUrls }
              : record
          )
        );

        // Update database for logged-in users
        const user = auth.getUser();
        if (user) {
          updateGeneration(taskId, 'success', imageUrls).then(success => {
            if (success) {
              console.log(`[Generation] Updated database with ${imageUrls.length} result URLs`);
            }
          });
        }
        
        // Don't auto-open drawer - user can click "View Generated Images" if they want
        
        return;
        
      } else if (state === 'fail') {
        const errorMsg = data.data.failMsg || 'Generation failed';
        const failCode = data.data.failCode || '';
        const fullError = failCode ? `[${failCode}] ${errorMsg}` : errorMsg;
        
        // Show toast with detailed error
        toasts.error(`Task failed: ${fullError}`);
        
        generationState.update(s => ({
          ...s,
          isGenerating: false,
          progress: 'error',
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
      console.error('Polling error:', error);
      // Continue polling despite errors
    }
  }
  
  // Timeout
  generationState.update(s => ({
    ...s,
    isGenerating: false,
    progress: 'error',
    error: 'Generation timed out'
  }));
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
