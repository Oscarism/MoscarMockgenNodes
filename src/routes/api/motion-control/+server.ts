// ============================================
// MOSCAR - Kling 3.0 Motion Control API Route
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
      imageUrl,             // uploaded reference image URL
      videoUrl,             // uploaded motion video URL
      characterOrientation, // 'video' | 'image'
      backgroundSource,     // 'input_video' | 'input_image'
    } = await request.json();

    // Validate required fields
    if (!imageUrl || typeof imageUrl !== 'string') {
      return json({ code: 400, msg: 'Reference image URL (imageUrl) is required' }, { status: 400 });
    }

    if (!videoUrl || typeof videoUrl !== 'string') {
      return json({ code: 400, msg: 'Motion video URL (videoUrl) is required' }, { status: 400 });
    }

    if (prompt && prompt.length > 2500) {
      return json({ code: 400, msg: 'Prompt exceeds 2500 character limit' }, { status: 400 });
    }

    // Build input payload.
    // Note: 'mode' is intentionally omitted — the field is optional and the
    // API rejects every tested value ('std', 'pro', '720p', '1080p').
    // The API will apply its own default quality setting.
    const input: Record<string, any> = {
      input_urls: [imageUrl],
      video_urls: [videoUrl],
      character_orientation: characterOrientation || 'video',
      background_source: backgroundSource || 'input_video'
    };

    if (prompt && prompt.trim()) {
      input.prompt = prompt.trim();
    }

    console.log(`[MotionControlAPI] Calling Kling 3.0 motion-control:`, JSON.stringify(input, null, 2));

    const response = await fetch(`${API_BASE_URL}/createTask`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'kling-3.0/motion-control',
        input
      })
    });

    const data = await response.json();
    console.log(`[MotionControlAPI] Response:`, JSON.stringify(data, null, 2));

    return json(data);

  } catch (error) {
    console.error('Motion control API error:', error);
    return json(
      { code: 500, msg: 'Internal server error' },
      { status: 500 }
    );
  }
};
