// ============================================
// MOSCAR - Image Edit API Route
// ============================================

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

const SEEDREAM_API_KEY = env.KIE_API_KEY;
const API_BASE_URL = 'https://api.kie.ai/api/v1/jobs';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { imageUrl, prompt, aspectRatio, quality } = await request.json();

    // Validate inputs
    if (!imageUrl || typeof imageUrl !== 'string') {
      return json({ code: 400, msg: 'Image URL is required' }, { status: 400 });
    }

    if (!prompt || typeof prompt !== 'string') {
      return json({ code: 400, msg: 'Prompt is required' }, { status: 400 });
    }

    if (prompt.length > 3000) {
      return json({ code: 400, msg: 'Prompt exceeds 3000 character limit' }, { status: 400 });
    }

    const validRatios = ['1:1', '4:3', '3:4', '16:9', '9:16', '2:3', '3:2', '21:9'];
    if (!validRatios.includes(aspectRatio)) {
      return json({ code: 400, msg: 'Invalid aspect ratio' }, { status: 400 });
    }

    if (!['basic', 'high'].includes(quality)) {
      return json({ code: 400, msg: 'Invalid quality setting' }, { status: 400 });
    }

    // Call SeeDream Edit API
    const response = await fetch(`${API_BASE_URL}/createTask`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SEEDREAM_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'seedream/4.5-edit',
        input: {
          prompt,
          image_urls: [imageUrl],
          aspect_ratio: aspectRatio,
          quality
        }
      })
    });

    const data = await response.json();

    // Forward the response
    return json(data);

  } catch (error) {
    console.error('Edit API error:', error);
    return json(
      { code: 500, msg: 'Internal server error' },
      { status: 500 }
    );
  }
};
