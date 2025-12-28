// ============================================
// MOSCAR - Task Status Polling API Route
// ============================================

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

const SEEDREAM_API_KEY = env.KIE_API_KEY;
const API_BASE_URL = 'https://api.kie.ai/api/v1/jobs';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const taskId = url.searchParams.get('taskId');

    if (!taskId) {
      return json({ code: 400, msg: 'taskId is required' }, { status: 400 });
    }

    // Call SeeDream API to get task status
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    const response = await fetch(`${API_BASE_URL}/recordInfo?taskId=${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${env.KIE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    const data = await response.json();

    // Forward the response
    return json(data);

  } catch (error) {
    console.error('Status API error:', error);
    return json(
      { code: 500, msg: 'Internal server error' },
      { status: 500 }
    );
  }
};
