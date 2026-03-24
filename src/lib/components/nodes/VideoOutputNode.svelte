<script lang="ts">
	import { get } from 'svelte/store';
	import BaseNode from './BaseNode.svelte';
	import type { VideoOutputNodeData, VideoQualityNodeData, VideoUploadNodeData } from '$lib/types';
	import { updateNodeData } from '$lib/stores/canvas';
	import { nodes, edges } from '$lib/stores/canvas';
	import { toasts } from '$lib/stores/toasts';
	import { addMediaToGallery } from '$lib/stores/generation';

	interface Props {
		id: string;
		data: VideoOutputNodeData;
	}

	let { id, data }: Props = $props();

	let promptText = $state('');

	// ============================================
	// Traverse connected nodes to build the prompt
	// ============================================
	function buildVideoPrompt(): { prompt: string; imageUrls: string[]; qualitySettings: VideoQualityNodeData | null } {
		const allNodes = get(nodes);
		const allEdges = get(edges);

		// BFS backwards from this output node
		const visited = new Set<string>();
		const queue = [id];
		const connectedNodes: any[] = [];

		while (queue.length > 0) {
			const current = queue.shift()!;
			if (visited.has(current)) continue;
			visited.add(current);

			const node = allNodes.find((n) => n.id === current);
			if (node && node.id !== id) connectedNodes.push(node);

			const incoming = allEdges.filter((e) => e.target === current);
			for (const edge of incoming) {
				if (!visited.has(edge.source)) queue.push(edge.source);
			}
		}

		// Find video settings node
		const qualityNode = connectedNodes.find((n) => n.data.type === 'video-quality');
		const qualitySettings: VideoQualityNodeData | null = qualityNode?.data || null;

		// Find video upload node (frames)
		const uploadNode = connectedNodes.find((n) => n.data.type === 'video-upload');
		const frames: string[] = [];
		if (uploadNode?.data?.frames) {
			for (const frame of uploadNode.data.frames) {
				if (frame.hostedUrl) frames.push(frame.hostedUrl);
			}
		}

		// Find standard custom/prompt/text nodes to build prompt
		const promptParts: string[] = [];
		for (const node of connectedNodes) {
			const d = node.data;
			if (d.type === 'custom' && d.promptText) {
				promptParts.push(d.promptText);
			} else if (d.type === 'scene' && d.setting) {
				promptParts.push(`Scene: ${d.setting}`);
			} else if (d.type === 'style' && d.style) {
				promptParts.push(`Style: ${d.style}`);
			} else if (d.type === 'human') {
				const parts: string[] = [];
				if (d.gender) parts.push(d.gender);
				if (d.ethnicity) parts.push(d.ethnicity);
				if (d.ageRange) parts.push(`${d.ageRange} years old`);
				if (parts.length > 0) promptParts.push(parts.join(', '));
			}
		}

		return {
			prompt: promptParts.join('. '),
			imageUrls: frames,
			qualitySettings
		};
	}

	// ============================================
	// Generate video
	// ============================================
	async function generateVideo() {
		const { prompt, imageUrls, qualitySettings } = buildVideoPrompt();

		if (!prompt && imageUrls.length === 0) {
			toasts.error('Connect a Custom Prompt node or add frame images before generating.');
			return;
		}

		const finalPrompt = prompt || 'cinematic video';
		promptText = finalPrompt;

		updateNodeData(id, {
			isGenerating: true,
			progress: 'submitted',
			errorMessage: undefined,
			generatedVideoUrl: undefined
		});

		try {
			const response = await fetch('/api/video', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					prompt: finalPrompt,
					aspectRatio: qualitySettings?.aspectRatio || '16:9',
					mode: qualitySettings?.mode || 'pro',
					duration: qualitySettings?.duration || '5',
					sound: qualitySettings?.sound || false,
					imageUrls: imageUrls.length > 0 ? imageUrls : undefined
				})
			});

			const taskData = await response.json();

			if (taskData.code !== 200) {
				throw new Error(taskData.msg || 'Failed to start video generation');
			}

			const taskId = taskData.data.taskId;
			updateNodeData(id, { currentTaskId: taskId, progress: 'processing' });
			toasts.info('Video generation started, polling for result...');

			await pollForVideo(taskId);
		} catch (error) {
			const msg = error instanceof Error ? error.message : 'Unknown error';
			toasts.error(`Video generation failed: ${msg}`);
			updateNodeData(id, { isGenerating: false, progress: 'error', errorMessage: msg });
		}
	}

	// ============================================
	// Poll task status
	// ============================================
	async function pollForVideo(taskId: string) {
		const maxAttempts = 90; // 7.5 min max (videos take longer)
		let attempts = 0;
		let interval = 3000;

		while (attempts < maxAttempts) {
			await new Promise((r) => setTimeout(r, interval));
			attempts++;

			if (attempts > 20) interval = 6000;

			try {
				const res = await fetch(`/api/status?taskId=${taskId}`);
				if (!res.ok) continue;

				const statusData = await res.json();
				if (statusData.code !== 200) continue;

				const state = statusData.data.state;

				if (state === 'success') {
					const resultJson = JSON.parse(statusData.data.resultJson || '{}');
					// Video result URLs may be in resultUrls or works array
					const videoUrls: string[] = resultJson.resultUrls || resultJson.works?.map((w: any) => w.resource) || [];
					const videoUrl = videoUrls[0];

					if (videoUrl) {
						updateNodeData(id, {
							isGenerating: false,
							progress: 'complete',
							generatedVideoUrl: videoUrl
						});
						addMediaToGallery(videoUrl);
						toasts.success('Video generated successfully!');
					} else {
						throw new Error('No video URL in response');
					}
					return;
				} else if (state === 'fail') {
					const failMsg = statusData.data.failMsg || 'Generation failed';
					throw new Error(failMsg);
				}
			} catch (pollError) {
				if (pollError instanceof Error && pollError.message !== 'undefined') {
					// Propagate actual errors, not just poll hiccups
					updateNodeData(id, { isGenerating: false, progress: 'error', errorMessage: pollError.message });
					toasts.error(`Video failed: ${pollError.message}`);
					return;
				}
			}
		}

		// Timeout
		updateNodeData(id, { isGenerating: false, progress: 'error', errorMessage: 'Timed out waiting for video' });
		toasts.error('Video generation timed out');
	}

	function reset() {
		updateNodeData(id, {
			isGenerating: false,
			progress: 'idle',
			generatedVideoUrl: undefined,
			errorMessage: undefined,
			currentTaskId: undefined
		});
	}

	let progressLabel = $derived.by(() => {
		switch (data.progress) {
			case 'submitted': return 'Submitting task...';
			case 'processing': return 'Generating video (this takes 1–3 min)...';
			case 'complete': return 'Video ready!';
			case 'error': return 'Generation failed';
			default: return '';
		}
	});
</script>

<BaseNode {id} nodeType="video-output">
	{#if data.generatedVideoUrl}
		<!-- Video Result -->
		<div class="video-container">
			<!-- svelte-ignore a11y_media_has_caption -->
			<video
				src={data.generatedVideoUrl}
				controls
				playsinline
				class="video-player"
			></video>
		</div>
		<div class="action-row">
			<a
				href={data.generatedVideoUrl}
				target="_blank"
				rel="noopener noreferrer"
				download
				class="btn btn-secondary"
			>
				Download
			</a>
			<button type="button" class="btn btn-outline" onclick={reset}>New Video</button>
		</div>
	{:else}
		<!-- Generate Button / Progress -->
		<div class="generate-area">
			{#if data.isGenerating}
				<div class="progress-area">
					<div class="video-spinner"></div>
					<p class="progress-text">{progressLabel}</p>
					{#if data.currentTaskId}
						<span class="task-id">Task: {data.currentTaskId.slice(-12)}</span>
					{/if}
				</div>
			{:else if data.progress === 'error'}
				<div class="error-area">
					<p class="error-msg">{data.errorMessage || 'Generation failed'}</p>
					<button type="button" class="btn btn-primary" onclick={generateVideo}>Retry</button>
					<button type="button" class="btn btn-outline small" onclick={reset}>Reset</button>
				</div>
			{:else}
				<button type="button" class="btn btn-primary generate-btn" onclick={generateVideo}>
					Generate Video
				</button>
				<p class="gen-hint">Connect nodes: Custom Prompt + Video Settings + (optional) Video Frames</p>
			{/if}
		</div>
	{/if}
</BaseNode>

<style>
	.video-container {
		width: 100%;
		border-radius: var(--radius-md);
		overflow: hidden;
		background: #000;
		margin-bottom: var(--space-sm);
	}

	.video-player {
		width: 100%;
		display: block;
		max-height: 200px;
	}

	.action-row {
		display: flex;
		gap: var(--space-sm);
	}

	.generate-area {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-md) 0;
	}

	.btn {
		padding: var(--space-sm) var(--space-md);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		cursor: pointer;
		transition: all var(--transition-fast);
		border: none;
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-weight: var(--font-medium);
	}

	.btn-primary {
		background-color: #FF6347;
		color: #000;
		font-weight: var(--font-bold);
	}

	.btn-primary:hover {
		opacity: 0.9;
		transform: translateY(-1px);
	}

	.btn-secondary {
		background-color: var(--color-bg-canvas);
		border: 1px solid var(--color-text-muted);
		color: var(--color-text-primary);
		flex: 1;
	}

	.btn-outline {
		background: transparent;
		border: 1px solid var(--color-text-muted);
		color: var(--color-text-muted);
		flex: 1;
	}

	.btn-outline.small {
		font-size: var(--text-xs);
		padding: 4px 10px;
		flex: unset;
	}

	.generate-btn {
		width: 100%;
		padding: var(--space-md);
		font-size: var(--text-base);
	}

	.gen-hint {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		text-align: center;
		line-height: 1.4;
	}

	.progress-area {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-md) 0;
	}

	.video-spinner {
		width: 36px;
		height: 36px;
		border: 3px solid rgba(255, 99, 71, 0.3);
		border-top-color: #FF6347;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.progress-text {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		text-align: center;
		margin: 0;
	}

	.task-id {
		font-size: 10px;
		color: var(--color-text-muted);
		font-family: monospace;
	}

	.error-area {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-sm);
	}


	.error-msg {
		font-size: var(--text-xs);
		color: var(--color-error, #ff6b6b);
		text-align: center;
		margin: 0;
		max-width: 200px;
	}
</style>
