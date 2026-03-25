// ============================================
// MOSCAR - Kling 3.0 Motion Control API Route
// ============================================

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { validatePrompt, validateRequiredString, apiError } from '$lib/server/validation';

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
    const imageErr = validateRequiredString(imageUrl, 'Reference image URL (imageUrl)');
    if (imageErr) return imageErr;

    const videoErr = validateRequiredString(videoUrl, 'Motion video URL (videoUrl)');
    if (videoErr) return videoErr;

    const promptErr = validatePrompt(prompt, 2500, false);
    if (promptErr) return promptErr;

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
    return json(data);

  } catch (error) {
    console.error('Motion control API error:', error);
    return json(
      { code: 500, msg: 'Internal server error' },
      { status: 500 }
    );
  }
};
