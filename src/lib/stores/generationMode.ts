// ============================================
// MOSCAR - Generation Mode Store
// Manages active generation mode and presets
// ============================================

import { writable, derived } from 'svelte/store';

// ============================================
// Type Definitions
// ============================================

export type GenerationMode = 'product' | 'photography' | 'alteration';

export type PhotographyPreset = 
  | 'none' 
  | 'portrait' 
  | 'landscape' 
  | 'macro' 
  | 'street' 
  | 'fashion'
  | 'food'
  | 'architecture'
  | 'wildlife';

export interface ModeState {
  mode: GenerationMode;
  photographyPreset: PhotographyPreset;
  autoEnhance: boolean;
}

// ============================================
// Mode-Specific Prompt Presets
// ============================================

export interface PromptPreset {
  prefix: string[];
  suffix: string[];
}

export const PRODUCT_MODE_PRESET: PromptPreset = {
  prefix: [
    'Professional product photography',
    'High resolution commercial mockup',
    '8K quality'
  ],
  suffix: [
    'realistic shadows and lighting',
    'photorealistic materials and textures',
    'professional studio quality'
  ]
};

export const PHOTOGRAPHY_PRESETS: Record<PhotographyPreset, PromptPreset> = {
  none: {
    prefix: ['Professional photography', 'high quality'],
    suffix: ['sharp focus', 'natural colors']
  },
  portrait: {
    prefix: ['Professional portrait photography', 'high quality'],
    suffix: ['natural skin tones', 'beautiful lighting', 'sharp focus on subject', 'pleasing bokeh']
  },
  landscape: {
    prefix: ['Stunning landscape photography', 'high resolution'],
    suffix: ['dramatic natural lighting', 'vivid colors', 'sharp detail throughout', 'professional composition']
  },
  macro: {
    prefix: ['Professional macro photography', 'extreme close-up'],
    suffix: ['incredible detail', 'shallow depth of field', 'sharp focus on subject', 'soft background blur']
  },
  street: {
    prefix: ['Candid street photography', 'documentary style'],
    suffix: ['authentic atmosphere', 'natural lighting', 'compelling composition', 'decisive moment']
  },
  fashion: {
    prefix: ['High-end fashion photography', 'editorial style'],
    suffix: ['professional lighting', 'stylish composition']
  },
  food: {
    prefix: ['Professional food photography', 'appetizing presentation'],
    suffix: ['mouth-watering detail', 'perfect lighting', 'fresh appearance', 'styled to perfection']
  },
  architecture: {
    prefix: ['Professional architectural photography', 'high resolution'],
    suffix: ['perfect perspective', 'balanced exposure', 'sharp detail', 'dramatic lighting']
  },
  wildlife: {
    prefix: ['Professional wildlife photography', 'nature documentary quality'],
    suffix: ['natural behavior captured', 'sharp focus', 'beautiful natural lighting', 'authentic environment']
  }
};

// Alteration mode has no automatic additions
export const ALTERATION_MODE_PRESET: PromptPreset = {
  prefix: [],
  suffix: []
};

// ============================================
// Store
// ============================================

const initialState: ModeState = {
  mode: 'product',
  photographyPreset: 'none',
  autoEnhance: true
};

function createModeStore() {
  const { subscribe, set, update } = writable<ModeState>(initialState);

  return {
    subscribe,
    
    setMode: (mode: GenerationMode) => {
      update(state => ({ ...state, mode }));
    },
    
    setPhotographyPreset: (preset: PhotographyPreset) => {
      update(state => ({ ...state, photographyPreset: preset }));
    },
    
    setAutoEnhance: (enabled: boolean) => {
      update(state => ({ ...state, autoEnhance: enabled }));
    },
    
    reset: () => set(initialState)
  };
}

export const modeState = createModeStore();

// ============================================
// Derived Helpers
// ============================================

/**
 * Get the active preset based on current mode and settings
 */
export function getActivePreset(state: ModeState): PromptPreset {
  // If auto-enhance is disabled, return empty preset
  if (!state.autoEnhance) {
    return { prefix: [], suffix: [] };
  }
  
  switch (state.mode) {
    case 'product':
      return PRODUCT_MODE_PRESET;
    case 'photography':
      return PHOTOGRAPHY_PRESETS[state.photographyPreset] || PHOTOGRAPHY_PRESETS.none;
    case 'alteration':
      return ALTERATION_MODE_PRESET;
    default:
      return PRODUCT_MODE_PRESET;
  }
}

// Derived store for the active preset
export const activePreset = derived(modeState, $state => getActivePreset($state));

// ============================================
// Mode Display Names
// ============================================

export const MODE_LABELS: Record<GenerationMode, string> = {
  product: 'Product Mockup',
  photography: 'Photography',
  alteration: 'Image Edit'
};

export const PRESET_LABELS: Record<PhotographyPreset, string> = {
  none: 'General',
  portrait: 'Portrait',
  landscape: 'Landscape',
  macro: 'Macro',
  street: 'Street',
  fashion: 'Fashion',
  food: 'Food',
  architecture: 'Architecture',
  wildlife: 'Wildlife'
};
