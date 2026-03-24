// ============================================
// MOSCAR - Kling Video Generation API Route
// ============================================

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

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
    if (!prompt || typeof prompt !== 'string') {
      return json({ code: 400, msg: 'Prompt is required' }, { status: 400 });
    }

    if (prompt.length > 2500) {
      return json({ code: 400, msg: 'Prompt exceeds 2500 character limit' }, { status: 400 });
    }

    const validRatios = ['16:9', '9:16', '1:1'];
    if (!validRatios.includes(aspectRatio)) {
      return json({ code: 400, msg: `Invalid aspect ratio. Must be one of: ${validRatios.join(', ')}` }, { status: 400 });
    }

    const validModes = ['std', 'pro'];
    if (!validModes.includes(mode)) {
      return json({ code: 400, msg: 'Invalid mode. Must be std or pro' }, { status: 400 });
    }

    const durationNum = parseInt(duration, 10);
    if (isNaN(durationNum) || durationNum < 3 || durationNum > 15) {
      return json({ code: 400, msg: 'Duration must be between 3 and 15 seconds' }, { status: 400 });
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

    console.log(`[VideoAPI] Calling Kling 3.0 with input:`, JSON.stringify(input, null, 2));

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
    console.log(`[VideoAPI] Response:`, JSON.stringify(data, null, 2));

    return json(data);

  } catch (error) {
    console.error('Video generation API error:', error);
    return json(
      { code: 500, msg: 'Internal server error' },
      { status: 500 }
    );
  }
};
