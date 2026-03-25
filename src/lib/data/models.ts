// ============================================
// Central Model Registry — single source of truth
// All model metadata lives here. Import from this file.
// ============================================

import type { GenerationModel } from '$lib/types';

export interface ModelConfig {
  /** Full display name (e.g. "Nano Banana 2") */
  label: string;
  /** Short display name for compact UI (e.g. "Nano B2") */
  shortLabel: string;
  /** One-line description */
  description: string;
  /** Max prompt character length */
  maxPrompt: number;
  /** Supported aspect ratios */
  ratios: string[];
  /** Supports quality toggle (basic/high) */
  supportsQuality: boolean;
  /** Supports resolution selection (1K/2K/4K) */
  supportsResolution: boolean;
  /** Can accept image URLs as input */
  supportsImageInput: boolean;
  /** Requires at least one image URL */
  requiresImage: boolean;
  /** API field name for image URLs */
  imageUrlField: string;
  /** Uses `image_size` param instead of `aspect_ratio` */
  usesImageSize: boolean;
  /** Sends single image URL string instead of array */
  singleImageUrl: boolean;
  /** Requires output_format in API payload */
  requiresOutputFormat: boolean;
  /** Optimizer type for prompt enhancement */
  optimizerType: 'nano-banana' | 'seedream' | 'qwen';
}

export const MODEL_REGISTRY: Record<GenerationModel, ModelConfig> = {
  'nano-banana-2': {
    label: 'Nano Banana 2',
    shortLabel: 'Nano B2',
    description: 'Nano Banana 2 — 20K prompt, exotic ratios',
    maxPrompt: 20000,
    ratios: ['1:1', '4:3', '3:4', '16:9', '9:16', '2:3', '3:2', '21:9', '4:5', '5:4', '1:4', '1:8', '4:1', '8:1', 'auto'],
    supportsQuality: false,
    supportsResolution: true,
    supportsImageInput: true,
    requiresImage: false,
    imageUrlField: 'image_input',
    usesImageSize: false,
    singleImageUrl: false,
    requiresOutputFormat: true,
    optimizerType: 'nano-banana',
  },
  'seedream/5-lite-text-to-image': {
    label: 'Seedream 5 T2I',
    shortLabel: 'SD5 T2I',
    description: 'Seedream 5 Lite text-to-image',
    maxPrompt: 2995,
    ratios: ['1:1', '4:3', '3:4', '16:9', '9:16', '2:3', '3:2', '21:9'],
    supportsQuality: true,
    supportsResolution: false,
    supportsImageInput: false,
    requiresImage: false,
    imageUrlField: 'image_urls',
    usesImageSize: false,
    singleImageUrl: false,
    requiresOutputFormat: false,
    optimizerType: 'seedream',
  },
  'seedream/5-lite-image-to-image': {
    label: 'Seedream 5 I2I',
    shortLabel: 'SD5 I2I',
    description: 'Seedream 5 Lite image-to-image (requires image)',
    maxPrompt: 2996,
    ratios: ['1:1', '4:3', '3:4', '16:9', '9:16', '2:3', '3:2', '21:9'],
    supportsQuality: true,
    supportsResolution: false,
    supportsImageInput: true,
    requiresImage: true,
    imageUrlField: 'image_urls',
    usesImageSize: false,
    singleImageUrl: false,
    requiresOutputFormat: false,
    optimizerType: 'seedream',
  },
  'qwen2/text-to-image': {
    label: 'Qwen T2I',
    shortLabel: 'Qwen T2I',
    description: 'Qwen2 text-to-image, 800 char prompt',
    maxPrompt: 800,
    ratios: ['1:1', '3:4', '4:3', '9:16', '16:9'],
    supportsQuality: false,
    supportsResolution: false,
    supportsImageInput: false,
    requiresImage: false,
    imageUrlField: 'image_urls',
    usesImageSize: true,
    singleImageUrl: false,
    requiresOutputFormat: true,
    optimizerType: 'qwen',
  },
  'qwen2/image-edit': {
    label: 'Qwen Edit',
    shortLabel: 'Qwen Edit',
    description: 'Qwen2 image editing (requires image)',
    maxPrompt: 800,
    ratios: ['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'],
    supportsQuality: false,
    supportsResolution: false,
    supportsImageInput: true,
    requiresImage: true,
    imageUrlField: 'image_url',
    usesImageSize: true,
    singleImageUrl: true,
    requiresOutputFormat: true,
    optimizerType: 'qwen',
  },
};

// ============================================
// Derived helpers — use these instead of hardcoding
// ============================================

/** All generation model IDs */
export const ALL_MODELS = Object.keys(MODEL_REGISTRY) as GenerationModel[];

/** Get full label for a model ID */
export function getModelLabel(modelId: string | undefined): string {
  if (!modelId) return 'Unknown';
  return (MODEL_REGISTRY as Record<string, ModelConfig>)[modelId]?.label ?? modelId;
}

/** Get short label for a model ID */
export function getModelShortLabel(modelId: string | undefined): string {
  if (!modelId) return '?';
  return (MODEL_REGISTRY as Record<string, ModelConfig>)[modelId]?.shortLabel ?? modelId;
}

/** Models that accept image input */
export const MODELS_SUPPORTING_IMAGES: GenerationModel[] =
  ALL_MODELS.filter(m => MODEL_REGISTRY[m].supportsImageInput);

/** Models that require image input */
export const MODELS_REQUIRING_IMAGES: GenerationModel[] =
  ALL_MODELS.filter(m => MODEL_REGISTRY[m].requiresImage);

/** Get aspect ratios for a model */
export function getModelRatios(modelId: GenerationModel): string[] {
  return MODEL_REGISTRY[modelId]?.ratios ?? [];
}

/** Check if a model supports image input */
export function modelSupportsImages(modelId: string): boolean {
  return MODELS_SUPPORTING_IMAGES.includes(modelId as GenerationModel);
}
