// ============================================
// Prompt Optimizer Store
// Manages enhanced prompt state and optimization flow
// ============================================

import { writable, get } from 'svelte/store';
import type { GenerationModel } from '$lib/types';
import { toasts } from './toasts';

export interface PromptOptimizerState {
  isOptimizing: boolean;
  originalPrompt: string;
  optimizedPrompt: string | null;
  reasoning: string | null;
  useEnhanced: boolean;
  error: string | null;
  targetModels: GenerationModel[];
  isStale: boolean; // True when nodes changed since last enhancement
}

const initialState: PromptOptimizerState = {
  isOptimizing: false,
  originalPrompt: '',
  optimizedPrompt: null,
  reasoning: null,
  useEnhanced: false,
  error: null,
  targetModels: [],
  isStale: false
};

function createPromptOptimizerStore() {
  const { subscribe, set, update } = writable<PromptOptimizerState>(initialState);

  return {
    subscribe,

    /**
     * Optimize a prompt for the given models
     */
    async optimize(prompt: string, models: GenerationModel[]): Promise<boolean> {
      update(s => ({
        ...s,
        isOptimizing: true,
        originalPrompt: prompt,
        optimizedPrompt: null,
        reasoning: null,
        error: null,
        targetModels: models,
        isStale: false
      }));

      try {
        const response = await fetch('/api/optimize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, models })
        });

        const data = await response.json();

        if (!response.ok || data.error) {
          throw new Error(data.error || 'Optimization failed');
        }

        update(s => ({
          ...s,
          isOptimizing: false,
          optimizedPrompt: data.optimizedPrompt,
          reasoning: data.reasoning,
          useEnhanced: true, // Default to enhanced after optimization
          error: null,
          isStale: false
        }));

        toasts.success('Prompt enhanced successfully!');
        return true;

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        update(s => ({
          ...s,
          isOptimizing: false,
          error: errorMessage
        }));

        toasts.error(`Enhancement failed: ${errorMessage}`);
        return false;
      }
    },

    /**
     * Redo optimization with current original prompt
     */
    async redo(): Promise<boolean> {
      const state = get({ subscribe });
      if (!state.originalPrompt) return false;
      
      return this.optimize(state.originalPrompt, state.targetModels);
    },

    /**
     * Select to use the enhanced prompt
     */
    useOptimized() {
      update(s => ({ ...s, useEnhanced: true }));
    },

    /**
     * Select to use the original prompt
     */
    useOriginal() {
      update(s => ({ ...s, useEnhanced: false }));
    },

    /**
     * Toggle between enhanced and original
     */
    toggle() {
      update(s => ({ ...s, useEnhanced: !s.useEnhanced }));
    },

    /**
     * Get the currently selected prompt (enhanced or original)
     */
    getActivePrompt(): string {
      const state = get({ subscribe });
      if (state.useEnhanced && state.optimizedPrompt && !state.isStale) {
        return state.optimizedPrompt;
      }
      return state.originalPrompt;
    },

    /**
     * Check if enhancement is available (and not stale)
     */
    hasEnhancement(): boolean {
      const state = get({ subscribe });
      return !!state.optimizedPrompt && !state.isStale;
    },

    /**
     * Clear all state
     */
    clear() {
      set(initialState);
    },

    /**
     * Check if the current prompt matches the enhanced prompt's original
     * If different, mark as stale
     */
    checkPromptChanged(currentPrompt: string) {
      update(s => {
        if (s.optimizedPrompt && s.originalPrompt !== currentPrompt) {
          return { ...s, isStale: true };
        }
        return s;
      });
    },

    /**
     * Mark as stale when nodes change
     */
    markStale() {
      update(s => {
        if (s.optimizedPrompt) {
          return { ...s, isStale: true };
        }
        return s;
      });
    }
  };
}

export const promptOptimizer = createPromptOptimizerStore();
