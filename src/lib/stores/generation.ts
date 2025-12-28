// ============================================
// MOSCAR - Generation Store (API State)
// ============================================

import { writable, derived, get } from 'svelte/store';
import type { GenerationRecord, AspectRatio, Quality, GenerationModel } from '$lib/types';

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
// Derived Stores
// ============================================

export const isGenerating = derived(generationState, $state => $state.isGenerating);
export const currentImages = derived(generationState, $state => $state.generatedImages);
export const generationError = derived(generationState, $state => $state.error);

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
 */
function expandVariations(prompt: string, count: number): string[] {
  // Match {option1|option2|option3} pattern
  const variationMatch = prompt.match(/\{([^}]+)\}/);
  
  if (!variationMatch) {
    // No variations, return prompt repeated count times
    return Array(count).fill(prompt);
  }
  
  const variationBlock = variationMatch[0];
  const options = variationMatch[1].split('|').map(s => s.trim()).filter(s => s);
  
  if (options.length === 0) {
    return Array(count).fill(prompt.replace(variationBlock, ''));
  }
  
  // Generate prompts by cycling through variations
  const prompts: string[] = [];
  for (let i = 0; i < count; i++) {
    const option = options[i % options.length];
    prompts.push(prompt.replace(variationBlock, option));
  }
  
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
    'flux-2/flex-image-to-image',
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
        state: 'waiting'
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
        
        // Don't auto-open drawer - user can click "View Generated Images" if they want
        
        return;
        
      } else if (state === 'fail') {
        const errorMsg = data.data.failMsg || 'Generation failed';
        
        generationState.update(s => ({
          ...s,
          isGenerating: false,
          progress: 'error',
          error: errorMsg
        }));
        
        // Update history
        generationHistory.update(h => 
          h.map(record => 
            record.taskId === taskId 
              ? { ...record, state: 'fail', errorMessage: errorMsg }
              : record
          )
        );
        
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
