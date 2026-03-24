// ============================================
// MOSCAR - Image Generation API Route
// ============================================

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

const API_KEY = env.KIE_API_KEY;
const API_BASE_URL = 'https://api.kie.ai/api/v1/jobs';

// Model configurations
const MODEL_CONFIG = {
  'seedream/4.5-text-to-image': {
    maxPromptLength: 3000,
    validRatios: ['1:1', '4:3', '3:4', '16:9', '9:16', '2:3', '3:2', '21:9'],
    supportsQuality: true,
    supportsResolution: false,
    supportsImages: false,
    imageUrlField: 'image_urls'
  },
  'seedream/4.5-edit': {
    maxPromptLength: 3000,
    validRatios: ['1:1', '4:3', '3:4', '16:9', '9:16', '2:3', '3:2', '21:9'],
    supportsQuality: true,
    supportsResolution: false,
    supportsImages: true,
    requiresImages: true,
    imageUrlField: 'image_urls'
  },
  'z-image': {
    maxPromptLength: 2000,
    validRatios: ['1:1', '4:3', '3:4', '16:9', '9:16'],
    supportsQuality: false,
    supportsResolution: false,
    supportsImages: false,
    imageUrlField: 'image_urls'
  },
  'flux-2/pro-image-to-image': {
    maxPromptLength: 5000,
    validRatios: ['1:1', '4:3', '3:4', '16:9', '9:16', '3:2', '2:3', 'auto'],
    supportsQuality: false,
    supportsResolution: true,
    supportsImages: true,
    requiresImages: true,
    imageUrlField: 'input_urls'
  },
  'nano-banana-pro': {
    maxPromptLength: 10000,
    validRatios: ['1:1', '4:3', '3:4', '16:9', '9:16', '3:2', '2:3', '21:9', '4:5', '5:4', 'auto'],
    supportsQuality: false,
    supportsResolution: true,
    supportsImages: true,
    requiresImages: false,
    imageUrlField: 'image_input'
  },
  'nano-banana-2': {
    maxPromptLength: 20000,
    validRatios: ['1:1', '4:3', '3:4', '16:9', '9:16', '2:3', '3:2', '21:9', '4:5', '5:4', '1:4', '1:8', '4:1', '8:1', 'auto'],
    supportsQuality: false,
    supportsResolution: true,
    supportsImages: true,
    requiresImages: false,
    imageUrlField: 'image_input'
  },
  'seedream/5-lite-image-to-image': {
    maxPromptLength: 2996,
    validRatios: ['1:1', '4:3', '3:4', '16:9', '9:16', '2:3', '3:2', '21:9'],
    supportsQuality: true,
    supportsResolution: false,
    supportsImages: true,
    requiresImages: true,
    imageUrlField: 'image_urls'
  },
  'seedream/5-lite-text-to-image': {
    maxPromptLength: 2995,
    validRatios: ['1:1', '4:3', '3:4', '16:9', '9:16', '2:3', '3:2', '21:9'],
    supportsQuality: true,
    supportsResolution: false,
    supportsImages: false,
    requiresImages: false,
    imageUrlField: 'image_urls'
  },
  'grok-imagine/image-to-image': {
    maxPromptLength: 390000,
    validRatios: [],            // No aspect ratio parameter for this model
    supportsQuality: false,
    supportsResolution: false,
    supportsImages: true,
    requiresImages: true,
    requiresPrompt: false,      // Prompt is optional for grok-imagine
    supportsAspectRatio: false, // Does not accept aspect_ratio in the API payload
    imageUrlField: 'image_urls'
  },
  'gpt-image/1.5-image-to-image': {
    maxPromptLength: 3000,
    validRatios: ['1:1', '2:3', '3:2'],
    supportsQuality: true,
    qualityValues: ['medium', 'high'], // Non-standard: uses medium/high instead of basic/high
    supportsResolution: false,
    supportsImages: true,
    requiresImages: true,
    imageUrlField: 'input_urls'         // Non-standard field name
  },
  'qwen2/text-to-image': {
    maxPromptLength: 800,
    validRatios: ['1:1', '3:4', '4:3', '9:16', '16:9'],
    supportsQuality: false,
    supportsResolution: false,
    supportsImages: false,
    usesImageSize: true,                // Uses `image_size` instead of `aspect_ratio`
    imageUrlField: 'image_urls'
  },
  'qwen2/image-edit': {
    maxPromptLength: 800,
    validRatios: ['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'],
    supportsQuality: false,
    supportsResolution: false,
    supportsImages: true,
    requiresImages: true,
    usesImageSize: true,                // Uses `image_size` instead of `aspect_ratio`
    qwenSingleImageUrl: true,           // image_url is a string, not array
    imageUrlField: 'image_url'
  }
} as const;

type ModelName = keyof typeof MODEL_CONFIG;

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { prompt, aspectRatio, quality, resolution, model, imageUrls } = await request.json();

    // Validate model
    const validModels = Object.keys(MODEL_CONFIG);
    const selectedModel: ModelName = validModels.includes(model) ? model : 'seedream/4.5-text-to-image';
    const config = MODEL_CONFIG[selectedModel];

    // Validate prompt (optional for some models like grok-imagine)
    const promptRequired = !('requiresPrompt' in config) || (config as any).requiresPrompt !== false;
    if (promptRequired && (!prompt || typeof prompt !== 'string')) {
      return json({ code: 400, msg: 'Prompt is required' }, { status: 400 });
    }

    if (prompt && prompt.length > config.maxPromptLength) {
      return json(
        { code: 400, msg: `Prompt exceeds ${config.maxPromptLength} character limit for ${selectedModel}` },
        { status: 400 }
      );
    }

    // Validate aspect ratio (skip for models that don't use it)
    const supportsAspectRatio = !('supportsAspectRatio' in config) || (config as any).supportsAspectRatio !== false;
    if (supportsAspectRatio && !(config.validRatios as readonly string[]).includes(aspectRatio)) {
      return json({ code: 400, msg: `Invalid aspect ratio for ${selectedModel}` }, { status: 400 });
    }

    // Validate quality (only for models that support it)
    // Some models use non-standard quality values (e.g. gpt-image uses medium/high)
    const validQualityValues = (config as any).qualityValues || ['basic', 'high'];
    if (config.supportsQuality && !validQualityValues.includes(quality)) {
      return json({ code: 400, msg: `Invalid quality setting for ${selectedModel}` }, { status: 400 });
    }

    // Validate resolution (only for models that support it)
    if (config.supportsResolution && resolution && !['1K', '2K', '4K'].includes(resolution)) {
      return json({ code: 400, msg: 'Invalid resolution setting' }, { status: 400 });
    }

    // Build the input object based on model
    const input: Record<string, any> = {};

    // Add prompt (always include if provided, even if empty string for optional-prompt models)
    if (prompt && typeof prompt === 'string') {
      input.prompt = prompt;
    }

    // Add aspect_ratio only for models that support it
    if (supportsAspectRatio) {
      // Qwen2 models use `image_size` field instead of `aspect_ratio`
      if ((config as any).usesImageSize) {
        input.image_size = aspectRatio;
      } else {
        input.aspect_ratio = aspectRatio;
      }
    }

    // Add quality only if supported; use model's first valid quality value as default
    if (config.supportsQuality) {
      const qualityDefault = (config as any).qualityValues?.[0] || 'basic';
      input.quality = quality || qualityDefault;
    }

    // Add resolution only if supported (Flux/Nano Banana models)
    if (config.supportsResolution) {
      input.resolution = resolution || '1K';
    }

    // Add output_format for Nano Banana models
    if (selectedModel === 'nano-banana-pro' || selectedModel === 'nano-banana-2') {
      input.output_format = 'png';
    }

    // Add image URLs for models that support it
    if (config.supportsImages) {
      if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
         // Use the correct field name for the model
         if ((config as any).imageUrlField) {
             // Qwen2 image-edit expects a single string URL, not an array
             if ((config as any).qwenSingleImageUrl) {
               input[(config as any).imageUrlField] = imageUrls[0];
             } else {
               input[(config as any).imageUrlField] = imageUrls;
             }
         }
      } else if ('requiresImages' in config && config.requiresImages) {
        // Only error if images are strictly required
        return json(
          { code: 400, msg: `${selectedModel} requires at least one image URL` },
          { status: 400 }
        );
      } else if (selectedModel === 'nano-banana-pro') {
        // Nano Banana needs empty array if no images
        input.image_input = [];
      }
    }

    // Call API
    console.log(`[GenerateAPI] Calling Kie AI for model: ${selectedModel}`);
    console.log(`[GenerateAPI] Input:`, JSON.stringify(input, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/createTask`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: selectedModel,
        input
      })
    });

    const data = await response.json();
    console.log(`[GenerateAPI] Response:`, JSON.stringify(data, null, 2));

    // Forward the response
    return json(data);

  } catch (error) {
    console.error('Generation API error:', error);
    return json(
      { code: 500, msg: 'Internal server error' },
      { status: 500 }
    );
  }
};
