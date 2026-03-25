// ============================================
// MOSCAR - Kling Video Generation API Route
// ============================================

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { validatePrompt, validateAspectRatio, validateOneOf, apiError } from '$lib/server/validation';

const API_KEY = env.KIE_API_KEY;
const API_BASE_URL = 'https://api.kie.ai/api/v1/jobs';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const {
      prompt,
      aspectRatio,
      mode,
      duration,
      sound,
      imageUrls,  // [firstFrameUrl, lastFrameUrl?]
    } = await request.json();

    // Validate required fields
    const promptErr = validatePrompt(prompt, 2500);
    if (promptErr) return promptErr;

    const ratioErr = validateAspectRatio(aspectRatio, ['16:9', '9:16', '1:1']);
    if (ratioErr) return ratioErr;

    const modeErr = validateOneOf(mode, ['std', 'pro'], 'mode');
    if (modeErr) return modeErr;

    const durationNum = parseInt(duration, 10);
    if (isNaN(durationNum) || durationNum < 3 || durationNum > 15) {
      return apiError('Duration must be between 3 and 15 seconds');
    }

    // Build input payload
    const input: Record<string, any> = {
      prompt,
      aspect_ratio: aspectRatio,
      mode,
      duration: String(durationNum),
      sound: Boolean(sound),
      multi_shots: false,
      multi_prompt: []
    };

    // Add frame image URLs if provided
    if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
      input.image_urls = imageUrls.filter(Boolean);
    }

    const response = await fetch(`${API_BASE_URL}/createTask`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'kling-3.0/video',
        input
      })
    });

    const data = await response.json();
    return json(data);

  } catch (error) {
    console.error('Video generation API error:', error);
    return json(
      { code: 500, msg: 'Internal server error' },
      { status: 500 }
    );
  }
};
