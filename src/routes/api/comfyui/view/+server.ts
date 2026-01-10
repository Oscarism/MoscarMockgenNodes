import { COMFY_API_URL } from '$env/static/private';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const filename = url.searchParams.get('filename');
		const type = url.searchParams.get('type') || 'output';

		if (!filename) {
			return new Response('Missing filename parameter', { status: 400 });
		}

		// Forward to ComfyUI with 5-minute timeout
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 300000); // 5 min timeout

		try {
			const response = await fetch(
				`${COMFY_API_URL}/view?filename=${encodeURIComponent(filename)}&type=${type}`,
				{ signal: controller.signal }
			);

			clearTimeout(timeout);

			if (!response.ok) {
				console.error('[ComfyUI Proxy] View failed:', response.status);
				return new Response('Image fetch failed', { status: response.status });
			}

			// Stream the image back
			const blob = await response.blob();
			return new Response(blob, {
				headers: {
					'Content-Type': response.headers.get('Content-Type') || 'image/png',
					'Cache-Control': 'public, max-age=3600'
				}
			});
		} finally {
			clearTimeout(timeout);
		}
	} catch (error) {
		console.error('[ComfyUI Proxy] View error:', error);
		return new Response('Proxy error', { status: 500 });
	}
};
