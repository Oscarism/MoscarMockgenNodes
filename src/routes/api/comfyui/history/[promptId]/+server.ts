import { json } from '@sveltejs/kit';
import { COMFY_API_URL } from '$env/static/private';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const { promptId } = params;

		// Forward to ComfyUI
		const response = await fetch(`${COMFY_API_URL}/history/${promptId}`);

		if (!response.ok) {
			const error = await response.text();
			console.error('[ComfyUI Proxy] History failed:', error);
			return json({ error: 'History fetch failed' }, { status: response.status });
		}

		const result = await response.json();
		return json(result);
	} catch (error) {
		console.error('[ComfyUI Proxy] History error:', error);
		return json({ error: 'Proxy error' }, { status: 500 });
	}
};
