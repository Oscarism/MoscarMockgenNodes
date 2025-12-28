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
    maxPromptLength: 1000,
    validRatios: ['1:1', '4:3', '3:4', '16:9', '9:16'],
    supportsQuality: false,
    supportsResolution: false,
    supportsImages: false,
    imageUrlField: 'image_urls'
  },
  'flux-2/pro-text-to-image': {
    maxPromptLength: 5000,
    validRatios: ['1:1', '4:3', '3:4', '16:9', '9:16', '3:2', '2:3', 'auto'],
    supportsQuality: false,
    supportsResolution: true,
    supportsImages: false,
    imageUrlField: 'input_urls'
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
  'flux-2/flex-text-to-image': {
    maxPromptLength: 5000,
    validRatios: ['1:1', '4:3', '3:4', '16:9', '9:16', '3:2', '2:3', 'auto'],
    supportsQuality: false,
    supportsResolution: true,
    supportsImages: false,
    imageUrlField: 'input_urls'
  },
  'flux-2/flex-image-to-image': {
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

    // Validate prompt
    if (!prompt || typeof prompt !== 'string') {
      return json({ code: 400, msg: 'Prompt is required' }, { status: 400 });
    }

    if (prompt.length > config.maxPromptLength) {
      return json(
        { code: 400, msg: `Prompt exceeds ${config.maxPromptLength} character limit for ${selectedModel}` },
        { status: 400 }
      );
    }

    // Validate aspect ratio
    if (!config.validRatios.includes(aspectRatio)) {
      return json({ code: 400, msg: `Invalid aspect ratio for ${selectedModel}` }, { status: 400 });
    }

    // Validate quality (only for models that support it)
    if (config.supportsQuality && !['basic', 'high'].includes(quality)) {
      return json({ code: 400, msg: 'Invalid quality setting' }, { status: 400 });
    }

    // Validate resolution (only for models that support it)
    if (config.supportsResolution && resolution && !['1K', '2K', '4K'].includes(resolution)) {
      return json({ code: 400, msg: 'Invalid resolution setting' }, { status: 400 });
    }

    // Build the input object based on model
    const input: Record<string, any> = {
      prompt,
      aspect_ratio: aspectRatio
    };

    // Add quality only if supported (Seedream models)
    if (config.supportsQuality) {
      input.quality = quality || 'basic';
    }

    // Add resolution only if supported (Flux models)
    if (config.supportsResolution) {
      input.resolution = resolution || '1K';
    }

    // Add image URLs for models that support it
    if (config.supportsImages) {
      if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
         // Use the correct field name for the model
         if ((config as any).imageUrlField) {
             input[(config as any).imageUrlField] = imageUrls;
         }
      } else if ('requiresImages' in config && config.requiresImages) {
        // Only error if images are strictly required
        return json(
          { code: 400, msg: `${selectedModel} requires at least one image URL` },
          { status: 400 }
        );
      }
    }

    // Call API
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
