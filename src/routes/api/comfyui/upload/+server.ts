import { json } from '@sveltejs/kit';
import { COMFY_API_URL } from '$env/static/private';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();

		// Forward to ComfyUI
		const response = await fetch(`${COMFY_API_URL}/upload/image`, {
			method: 'POST',
			body: formData
		});

		if (!response.ok) {
			const error = await response.text();
			console.error('[ComfyUI Proxy] Upload failed:', error);
			return json({ error: 'Upload failed' }, { status: response.status });
		}

		const result = await response.json();
		return json(result);
	} catch (error) {
		console.error('[ComfyUI Proxy] Upload error:', error);
		return json({ error: 'Proxy error' }, { status: 500 });
	}
};
