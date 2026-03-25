// ============================================
// MOSCAR - Image Generation API Route
// ============================================

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import type { GenerationModel } from '$lib/types';
import { MODEL_REGISTRY, ALL_MODELS } from '$lib/data/models';
import { validatePrompt, validateAspectRatio, validateOneOf, apiError } from '$lib/server/validation';

const API_KEY = env.KIE_API_KEY;
const API_BASE_URL = 'https://api.kie.ai/api/v1/jobs';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { prompt, aspectRatio, quality, resolution, model, imageUrls } = await request.json();

    // Validate model
    const selectedModel: GenerationModel = ALL_MODELS.includes(model) ? model : 'nano-banana-2';
    const config = MODEL_REGISTRY[selectedModel];

    // Validate prompt
    const promptErr = validatePrompt(prompt, config.maxPrompt);
    if (promptErr) return promptErr;

    // Validate aspect ratio
    const ratioErr = validateAspectRatio(aspectRatio, config.ratios);
    if (ratioErr) return ratioErr;

    // Validate quality (only for models that support it)
    if (config.supportsQuality) {
      const qualityErr = validateOneOf(quality, ['basic', 'high'], 'quality');
      if (qualityErr) return qualityErr;
    }

    // Validate resolution (only for models that support it)
    if (config.supportsResolution && resolution) {
      const resErr = validateOneOf(resolution, ['1K', '2K', '4K'], 'resolution');
      if (resErr) return resErr;
    }

    // Build the input object
    const input: Record<string, any> = { prompt };

    // Aspect ratio / image_size
    if (config.usesImageSize) {
      input.image_size = aspectRatio;
    } else {
      input.aspect_ratio = aspectRatio;
    }

    // Quality
    if (config.supportsQuality) {
      input.quality = quality || 'basic';
    }

    // Resolution
    if (config.supportsResolution) {
      input.resolution = resolution || '1K';
    }

    // Output format
    if (config.requiresOutputFormat) {
      input.output_format = 'png';
    }

    // Image URLs
    if (config.supportsImageInput) {
      if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
        input[config.imageUrlField] = config.singleImageUrl ? imageUrls[0] : imageUrls;
      } else if (config.requiresImage) {
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
    return json(data);

  } catch (error) {
    console.error('[GenerateAPI] Error:', error);
    return json(
      { code: 500, msg: 'Internal server error' },
      { status: 500 }
    );
  }
};
