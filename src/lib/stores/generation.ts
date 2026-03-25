// ============================================
// MOSCAR - Generation Store (API State)
// ============================================

import { writable, derived, get } from 'svelte/store';
import type { GenerationRecord, AspectRatio, Quality, GenerationModel } from '$lib/types';
import { modelSupportsImages } from '$lib/data/models';
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
    return;
  }

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

  // Debounced database sync to prevent race conditions from rapid hide/unhide
  let syncTimer: ReturnType<typeof setTimeout> | null = null;
  let pendingSync: Set<string> | null = null;

  function syncToDatabase(hiddenSet: Set<string>) {
    pendingSync = hiddenSet;
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(async () => {
      const user = auth.getUser();
      if (user && pendingSync) {
        const { saveHiddenImages } = await import('$lib/services/database');
        await saveHiddenImages(user.id, [...pendingSync]);
      }
      pendingSync = null;
      syncTimer = null;
    }, 300);
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
      }
    }
  };
}

export const hiddenImages = createHiddenImagesStore();

// Register login handler (replaces circular dynamic import in auth store)
auth.onLogin(async () => {
  await fetchUserHistory();
  await hiddenImages.loadFromDatabase();
});

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
    }
    return visible;
  }
);

/**
 * Add a single media URL (image or video) to the gallery/drawer.
 * Call this from video generation nodes after successful completion.
 */
export function addMediaToGallery(url: string, label?: string): void {
  generationState.update(s => ({
    ...s,
    generatedImages: [url, ...s.generatedImages]
  }));
  // Ensure drawer opens so user sees the result
  setDrawerMode('expanded');
}



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
  // Find all variation blocks {option1|option2|option3}
  const variationRegex = /\{([^}]+\|[^}]+)\}/g;
  const matches: { block: string; options: string[] }[] = [];
  let match;
  
  while ((match = variationRegex.exec(prompt)) !== null) {
    const options = match[1].split('|').map(s => s.trim()).filter(s => s);
    matches.push({ block: match[0], options });
  }
  
  if (matches.length === 0) {
    // No variations, return prompt repeated count times
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
  }
  
  return prompts;
}

/**
 * Start a batch generation for one model (convenience wrapper)
 */
export async function startBatchGeneration(
  prompt: string,
  aspectRatio: AspectRatio,
  quality: Quality,
  batchCount: number,
  model: GenerationModel = 'nano-banana-2',
  imageUrls: string[] = [],
  resolution: string = '1K'
): Promise<void> {
  return startMultiModelBatchGeneration(prompt, aspectRatio, quality, batchCount, [model], imageUrls, resolution);
}

/**
 * Start a batch generation across one or more models.
 * Each model × each prompt variant = one API task.
 */
export async function startMultiModelBatchGeneration(
  prompt: string,
  aspectRatio: AspectRatio,
  quality: Quality,
  batchCount: number,
  models: GenerationModel[] = ['nano-banana-2'],
  imageUrls: string[] = [],
  resolution: string = '1K'
): Promise<void> {
  const prompts = expandVariations(prompt, batchCount);
  const DELAY_BETWEEN_REQUESTS = 600;

  generationState.update(s => ({
    ...s,
    isGenerating: true,
    progress: 'submitted',
    error: null
  }));

  const taskIds: string[] = [];

  try {
    for (const model of models) {
      const sendImages = modelSupportsImages(model);

      for (let i = 0; i < prompts.length; i++) {
        const currentPrompt = prompts[i];

        // Delay between requests (not before the first)
        if (taskIds.length > 0) {
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
        }

        try {
          const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: currentPrompt,
              aspectRatio,
              quality,
              resolution,
              model,
              imageUrls: sendImages ? imageUrls : undefined
            })
          });

          const data = await response.json();

          if (!response.ok || data.code !== 200) {
            const errorMsg = data.msg || data.message || `Failed for ${model}`;
            toasts.error(`${model.split('/').pop() || model}: ${errorMsg}`);
            continue;
          }

          const taskId = data.data.taskId;
          taskIds.push(taskId);

          const historyRecord: GenerationRecord = {
            id: taskId,
            timestamp: Date.now(),
            prompt: currentPrompt,
            aspectRatio,
            quality,
            taskId,
            state: 'waiting',
            model
          };

          generationHistory.update(h => [historyRecord, ...h]);

          const user = auth.getUser();
          if (user) {
            saveGeneration(user.id, historyRecord);
          }
        } catch (modelError) {
          toasts.error(`${model.split('/').pop() || model}: ${modelError instanceof Error ? modelError.message : 'Failed'}`);
        }
      }
    }

    generationState.update(s => ({
      ...s,
      currentTaskId: taskIds[0] || null,
      progress: 'processing'
    }));

    await Promise.all(taskIds.map(taskId => pollForCompletion(taskId)));

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
 * Update history and database for a completed/failed task
 */
function saveTaskResult(taskId: string, state: 'success' | 'fail', imageUrls?: string[], error?: string) {
  generationHistory.update(h =>
    h.map(record =>
      record.taskId === taskId
        ? { ...record, state, resultUrls: imageUrls, errorMessage: error }
        : record
    )
  );

  const user = auth.getUser();
  if (user) {
    updateGeneration(taskId, state, imageUrls, error);
  }
}

/**
 * Poll for task completion with exponential backoff
 */
async function pollForCompletion(taskId: string): Promise<void> {
  const MAX_DURATION = 300_000; // 5 minutes
  const startTime = Date.now();
  let interval = 2000; // Start at 2s
  let hasWarnedTimeout = false;

  while (Date.now() - startTime < MAX_DURATION) {
    await new Promise(resolve => setTimeout(resolve, interval));

    // Exponential backoff: 2s → 3s → 4.5s → ... capped at 8s
    interval = Math.min(interval * 1.5, 8000);

    // Warn user after 65s
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    if (elapsed >= 65 && !hasWarnedTimeout) {
      hasWarnedTimeout = true;
      toasts.info('Generation taking longer than usual, please wait...');
    }

    try {
      const response = await fetch(`/api/status?taskId=${taskId}`);
      if (!response.ok) continue;

      const data = await response.json();
      if (data.code !== 200) continue;

      const state = data.data.state;

      if (state === 'success') {
        const resultJson = JSON.parse(data.data.resultJson || '{}');
        const tempImageUrls: string[] = resultJson.resultUrls || [];

        // Upload to permanent storage for logged-in users
        const user = auth.getUser();
        let imageUrls = tempImageUrls;
        if (user && tempImageUrls.length > 0) {
          imageUrls = await uploadMultipleToStorage(tempImageUrls, user.id);
        }

        generationState.update(s => ({
          ...s,
          generatedImages: [...imageUrls, ...s.generatedImages]
        }));

        saveTaskResult(taskId, 'success', imageUrls);
        return;
      }

      if (state === 'fail') {
        const errorMsg = data.data.failMsg || 'Generation failed';
        const failCode = data.data.failCode || '';
        const fullError = failCode ? `[${failCode}] ${errorMsg}` : errorMsg;

        toasts.error(`Task failed: ${fullError}`);
        generationState.update(s => ({ ...s, error: fullError }));
        saveTaskResult(taskId, 'fail', undefined, fullError);
        return;
      }
    } catch (error) {
      // Continue polling despite transient errors
    }
  }

  // Timeout
  const timeoutError = `Generation timed out after ${Math.round((Date.now() - startTime) / 1000)}s`;
  toasts.error(timeoutError);
  saveTaskResult(taskId, 'fail', undefined, timeoutError);
}

/**
 * Start an edit/refine task (routes through /api/generate with an I2I model)
 */
export async function startEdit(
  imageUrl: string,
  prompt: string,
  aspectRatio: AspectRatio,
  quality: Quality,
  model: GenerationModel = 'seedream/5-lite-image-to-image'
): Promise<void> {
  return startBatchGeneration(prompt, aspectRatio, quality, 1, model, [imageUrl]);
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
