import { json } from '@sveltejs/kit';
import { COMFY_API_URL } from '$env/static/private';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();

		// Forward to ComfyUI
		const response = await fetch(`${COMFY_API_URL}/prompt`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		});

		if (!response.ok) {
			const error = await response.text();
			console.error('[ComfyUI Proxy] Prompt failed:', error);
			return json({ error: 'Prompt queue failed' }, { status: response.status });
		}

		const result = await response.json();
		return json(result);
	} catch (error) {
		console.error('[ComfyUI Proxy] Prompt error:', error);
		return json({ error: 'Proxy error' }, { status: 500 });
	}
};
