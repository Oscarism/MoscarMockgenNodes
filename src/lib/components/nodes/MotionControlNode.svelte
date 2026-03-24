<script lang="ts">
	import BaseNode from './BaseNode.svelte';
	import type { MotionControlNodeData } from '$lib/types';
	import { updateNodeData } from '$lib/stores/canvas';
	import { user, isLoggedIn } from '$lib/stores/auth';
	import { toasts } from '$lib/stores/toasts';
	import { addMediaToGallery } from '$lib/stores/generation';

	interface Props {
		id: string;
		data: MotionControlNodeData;
	}

	let { id, data }: Props = $props();

	// ============================================
	// Upload helpers
	// ============================================
	async function uploadToSupabase(file: File): Promise<string> {
		const formData = new FormData();
		formData.append('file', file);
		formData.append('userId', $user?.id || '');
		const response = await fetch('/api/upload', { method: 'POST', body: formData });
		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || 'Upload failed');
		}
		const result = await response.json();
		return result.publicUrl;
	}

	async function uploadToLitterbox(file: File, hours = '1h'): Promise<string> {
		const formData = new FormData();
		formData.append('reqtype', 'fileupload');
		formData.append('time', hours);
		formData.append('fileToUpload', file);
		const response = await fetch('https://litterbox.catbox.moe/resources/internals/api.php', {
			method: 'POST',
			body: formData
		});
		if (!response.ok) throw new Error('Litterbox upload failed');
		return (await response.text()).trim();
	}

	async function smartUpload(file: File): Promise<string> {
		if ($isLoggedIn) {
			try {
				return await uploadToSupabase(file);
			} catch {
				toasts.warning('Cloud upload failed, using temporary storage');
				return await uploadToLitterbox(file);
			}
		}
		return await uploadToLitterbox(file);
	}

	// ============================================
	// Image upload (JPEG/PNG/JPG, max 10MB)
	// ============================================
	async function handleImageSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
		if (!validTypes.includes(file.type)) {
			alert('Image must be JPEG or PNG format');
			return;
		}
		if (file.size > 10 * 1024 * 1024) {
			alert('Image must be under 10MB');
			return;
		}

		const previewUrl = URL.createObjectURL(file);
		updateNodeData(id, { imagePreviewUrl: previewUrl, imageHostedUrl: undefined, imageUploading: true });

		try {
			const hostedUrl = await smartUpload(file);
			updateNodeData(id, { imageHostedUrl: hostedUrl, imageUploading: false });
			toasts.success('Reference image uploaded ✓');
		} catch (error) {
			updateNodeData(id, { imageUploading: false });
			alert('Image upload failed. Please try again.');
		}
		input.value = '';
	}

	function removeImage() {
		updateNodeData(id, { imagePreviewUrl: undefined, imageHostedUrl: undefined });
	}

	// ============================================
	// Video upload (MP4/MOV, max 100MB)
	// ============================================
	async function handleVideoSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		const validTypes = ['video/mp4', 'video/quicktime', 'video/mov'];
		if (!validTypes.includes(file.type) && !file.name.match(/\.(mp4|mov|qt)$/i)) {
			alert('Video must be MP4 or QuickTime (MOV) format');
			return;
		}
		if (file.size > 100 * 1024 * 1024) {
			alert('Video must be under 100MB');
			return;
		}

		// For video, we create an object URL for preview only (can't show inline easily)
		const previewUrl = URL.createObjectURL(file);
		updateNodeData(id, {
			videoPreviewUrl: previewUrl,
			videoHostedUrl: undefined,
			videoUploading: true
		});

		toasts.info('Uploading video... this may take a moment');

		try {
			const hostedUrl = await smartUpload(file);
			updateNodeData(id, { videoHostedUrl: hostedUrl, videoUploading: false });
			toasts.success('Motion video uploaded ✓');
		} catch (error) {
			updateNodeData(id, { videoUploading: false });
			alert('Video upload failed. Please try again.');
		}
		input.value = '';
	}

	function removeVideo() {
		updateNodeData(id, {
			videoPreviewUrl: undefined,
			videoHostedUrl: undefined
		});
	}

	// ============================================
	// Generate
	// ============================================
	async function generate() {
		if (!data.imageHostedUrl) {
			toasts.error('Please upload a reference image first.');
			return;
		}
		if (!data.videoHostedUrl) {
			toasts.error('Please upload a motion reference video first.');
			return;
		}

		updateNodeData(id, {
			isGenerating: true,
			progress: 'submitted',
			generatedVideoUrl: undefined,
			errorMessage: undefined
		});

		try {
			const response = await fetch('/api/motion-control', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					prompt: data.prompt || '',
					imageUrl: data.imageHostedUrl,
					videoUrl: data.videoHostedUrl,
					mode: data.mode,
					characterOrientation: data.characterOrientation,
					backgroundSource: data.backgroundSource
				})
			});

			const taskData = await response.json();
			if (taskData.code !== 200) {
				throw new Error(taskData.msg || 'Failed to start generation');
			}

			const taskId = taskData.data.taskId;
			updateNodeData(id, { currentTaskId: taskId, progress: 'processing' });
			toasts.info('Motion control generation started...');

			await pollForVideo(taskId);
		} catch (error) {
			const msg = error instanceof Error ? error.message : 'Unknown error';
			toasts.error(`Motion control failed: ${msg}`);
			updateNodeData(id, { isGenerating: false, progress: 'error', errorMessage: msg });
		}
	}

	async function pollForVideo(taskId: string) {
		const maxAttempts = 90;
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
					const videoUrls: string[] =
						resultJson.resultUrls || resultJson.works?.map((w: any) => w.resource) || [];
					const videoUrl = videoUrls[0];

					if (videoUrl) {
						updateNodeData(id, {
							isGenerating: false,
							progress: 'complete',
							generatedVideoUrl: videoUrl
						});
						addMediaToGallery(videoUrl);
						toasts.success('Motion control video ready!');
					} else {
						throw new Error('No video URL in response');
					}
					return;
				} else if (state === 'fail') {
					throw new Error(statusData.data.failMsg || 'Generation failed');
				}
			} catch (pollErr) {
				if (pollErr instanceof Error) {
					updateNodeData(id, {
						isGenerating: false,
						progress: 'error',
						errorMessage: pollErr.message
					});
					toasts.error(`Motion control failed: ${pollErr.message}`);
					return;
				}
			}
		}

		updateNodeData(id, { isGenerating: false, progress: 'error', errorMessage: 'Timed out' });
		toasts.error('Motion control generation timed out');
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

	let canGenerate = $derived(!!(data.imageHostedUrl && data.videoHostedUrl));
	let progressLabel = $derived.by(() => {
		switch (data.progress) {
			case 'submitted': return 'Submitting task...';
			case 'processing': return 'Generating motion video (1–3 min)...';
			case 'complete': return 'Video ready!';
			case 'error': return 'Failed';
			default: return '';
		}
	});
</script>

<BaseNode {id} nodeType="motion-control">
	<!-- Model Badge -->
	<div class="model-badge">Kling 3.0 · Motion Control</div>

	<!-- Two upload slots side by side -->
	<div class="uploads-grid">
		<!-- Reference Image -->
		<div class="upload-slot" style="--slot-color: #FF1493">
			<div class="slot-header">
				<span class="slot-label">Reference Image</span>
				{#if data.imageHostedUrl}
					<button class="remove-btn" onclick={removeImage} aria-label="Remove image">×</button>
				{/if}
			</div>

			{#if data.imagePreviewUrl}
				<div class="preview-box img-preview">
					{#if data.imageUploading}
						<div class="spinner-overlay"><div class="spinner"></div></div>
					{/if}
					<img src={data.imagePreviewUrl} alt="Reference" />
					{#if data.imageHostedUrl}
						<div class="check">✓</div>
					{/if}
				</div>
			{:else}
				<label class="upload-trigger">
					<input type="file" accept="image/jpeg,image/png,image/jpg" onchange={handleImageSelect} />
					<span class="plus">+</span>
					<span class="req">Required</span>
					<span class="format">JPG / PNG · max 10MB</span>
				</label>
			{/if}
		</div>

		<!-- Motion Video -->
		<div class="upload-slot" style="--slot-color: #7B68EE">
			<div class="slot-header">
				<span class="slot-label">Motion Video</span>
				{#if data.videoHostedUrl}
					<button class="remove-btn" onclick={removeVideo} aria-label="Remove video">×</button>
				{/if}
			</div>

			{#if data.videoPreviewUrl}
				<div class="preview-box video-preview">
					{#if data.videoUploading}
						<div class="spinner-overlay"><div class="spinner"></div></div>
					{/if}
					<!-- svelte-ignore a11y_media_has_caption -->
					<video src={data.videoPreviewUrl} muted playsinline class="video-thumb"></video>
					{#if data.videoHostedUrl}
						<div class="check">✓</div>
					{:else if data.videoUploading}
						<div class="uploading-label">Uploading...</div>
					{/if}
				</div>
			{:else}
				<label class="upload-trigger">
					<input type="file" accept="video/mp4,video/quicktime,.mp4,.mov" onchange={handleVideoSelect} />
					<span class="plus">+</span>
					<span class="req">Required</span>
					<span class="format">MP4 / MOV · max 100MB</span>
				</label>
			{/if}
		</div>
	</div>

	<!-- Optional Prompt -->
	<div class="field">
		<label for="mc-prompt-{id}" class="field-label">Prompt (optional)</label>
		<textarea
			id="mc-prompt-{id}"
			class="prompt-input"
			placeholder="Describe the animation content... (max 2500 chars)"
			maxlength="2500"
			rows="2"
			value={data.prompt}
			oninput={(e) => updateNodeData(id, { prompt: (e.target as HTMLTextAreaElement).value })}
		></textarea>
	</div>

	<!-- Settings Row -->
	<div class="settings-grid">
		<!-- Mode -->
		<div class="field">
			<span class="field-label">Mode</span>
			<div class="btn-group">
				<button
					type="button"
					class="opt-btn"
					class:active={data.mode === 'std'}
					onclick={() => updateNodeData(id, { mode: 'std' })}
				>Std 720p</button>
				<button
					type="button"
					class="opt-btn"
					class:active={data.mode === 'pro'}
					onclick={() => updateNodeData(id, { mode: 'pro' })}
				>Pro 1080p</button>
			</div>
		</div>

		<!-- Character Orientation -->
		<div class="field">
			<span class="field-label">Character Ref</span>
			<div class="btn-group">
				<button
					type="button"
					class="opt-btn"
					class:active={data.characterOrientation === 'video'}
					onclick={() => updateNodeData(id, { characterOrientation: 'video' })}
				>Video</button>
				<button
					type="button"
					class="opt-btn"
					class:active={data.characterOrientation === 'image'}
					onclick={() => updateNodeData(id, { characterOrientation: 'image' })}
				>Image</button>
			</div>
		</div>

		<!-- Background Source -->
		<div class="field">
			<span class="field-label">Background</span>
			<div class="btn-group">
				<button
					type="button"
					class="opt-btn"
					class:active={data.backgroundSource === 'input_video'}
					onclick={() => updateNodeData(id, { backgroundSource: 'input_video' })}
				>Video BG</button>
				<button
					type="button"
					class="opt-btn"
					class:active={data.backgroundSource === 'input_image'}
					onclick={() => updateNodeData(id, { backgroundSource: 'input_image' })}
				>Image BG</button>
			</div>
		</div>
	</div>

	<!-- Generate / Result -->
	{#if data.generatedVideoUrl}
		<div class="result-section">
			<!-- svelte-ignore a11y_media_has_caption -->
			<video
				src={data.generatedVideoUrl}
				controls
				playsinline
				class="result-video"
			></video>
			<div class="result-actions">
				<a
					href={data.generatedVideoUrl}
					target="_blank"
					rel="noopener noreferrer"
					download
					class="btn btn-secondary"
				>Download</a>
				<button type="button" class="btn btn-outline" onclick={reset}>New</button>
			</div>
		</div>
	{:else if data.isGenerating}
		<div class="progress-area">
			<div class="mc-spinner"></div>
			<span class="progress-text">{progressLabel}</span>
			{#if data.currentTaskId}
				<span class="task-id">Task: {data.currentTaskId.slice(-12)}</span>
			{/if}
		</div>
	{:else if data.progress === 'error'}
		<div class="error-area">
			<span class="error-msg">{data.errorMessage || 'Generation failed'}</span>
			<div class="error-actions">
				<button type="button" class="btn btn-primary" onclick={generate}>Retry</button>
				<button type="button" class="btn btn-outline small" onclick={reset}>Reset</button>
			</div>
		</div>
	{:else}
		<button
			type="button"
			class="generate-btn"
			class:disabled={!canGenerate}
			disabled={!canGenerate}
			onclick={generate}
		>
			{canGenerate ? 'Generate Motion Video' : 'Upload image & video first'}
		</button>
	{/if}
</BaseNode>

<style>
	.model-badge {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 10px;
		background: rgba(255, 20, 147, 0.12);
		border: 1px solid rgba(255, 20, 147, 0.4);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		color: var(--color-text-primary);
		font-weight: var(--font-medium);
		margin-bottom: 2px;
	}

	.uploads-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-sm);
	}

	.upload-slot {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.slot-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		min-height: 18px;
	}

	.slot-label {
		font-size: 9px;
		font-weight: var(--font-bold);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: var(--slot-color);
	}

	.remove-btn {
		width: 14px;
		height: 14px;
		border-radius: var(--radius-full);
		background-color: var(--color-error);
		border: none;
		color: white;
		font-size: 10px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
	}

	.preview-box {
		position: relative;
		width: 100%;
		aspect-ratio: 1;
		border-radius: var(--radius-sm);
		overflow: hidden;
		border: 2px solid var(--slot-color);
		background: #111;
	}

	.img-preview img,
	.video-thumb {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.video-preview {
		aspect-ratio: 9/16;
	}

	.spinner-overlay {
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.65);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2;
	}

	.spinner {
		width: 18px;
		height: 18px;
		border: 2px solid #333;
		border-top-color: var(--slot-color);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.check {
		position: absolute;
		bottom: 3px;
		right: 3px;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: var(--color-success, #2ecc71);
		color: #000;
		font-size: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 3;
	}

	.uploading-label {
		position: absolute;
		bottom: 3px;
		left: 3px;
		font-size: 8px;
		color: #fff;
		background: rgba(0,0,0,0.6);
		padding: 1px 4px;
		border-radius: 3px;
		z-index: 3;
	}

	.upload-trigger {
		width: 100%;
		aspect-ratio: 1;
		border: 2px dashed var(--slot-color);
		border-radius: var(--radius-sm);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: background var(--transition-fast);
		background: transparent;
		gap: 2px;
	}

	.upload-trigger:hover {
		background: rgba(255, 255, 255, 0.05);
	}

	.upload-trigger input {
		display: none;
	}

	.plus {
		font-size: var(--text-xl);
		color: var(--slot-color);
		opacity: 0.6;
		line-height: 1;
	}

	.req {
		font-size: 8px;
		color: var(--slot-color);
		text-transform: uppercase;
		letter-spacing: 0.3px;
		opacity: 0.8;
	}

	.format {
		font-size: 8px;
		color: var(--color-text-muted);
		text-align: center;
		line-height: 1.2;
	}

	.upload-trigger:hover .plus { opacity: 1; }

	.field {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.field-label {
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.prompt-input {
		background: var(--color-bg-canvas);
		border: 1px solid var(--color-text-muted);
		border-radius: var(--radius-sm);
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		padding: var(--space-sm);
		resize: none;
		font-family: inherit;
		transition: border-color var(--transition-fast);
		width: 100%;
		box-sizing: border-box;
	}

	.prompt-input:focus {
		outline: none;
		border-color: #FF1493;
	}

	.settings-grid {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.btn-group {
		display: flex;
		gap: 4px;
	}

	.opt-btn {
		flex: 1;
		padding: 4px 6px;
		background: var(--color-bg-canvas);
		border: 1px solid var(--color-text-muted);
		border-radius: var(--radius-sm);
		color: var(--color-text-primary);
		cursor: pointer;
		font-size: 10px;
		transition: all var(--transition-fast);
		text-align: center;
		white-space: nowrap;
	}

	.opt-btn:hover { border-color: #FF1493; }

	.opt-btn.active {
		background: #FF1493;
		border-color: #FF1493;
		color: #fff;
		font-weight: var(--font-bold);
	}

	.generate-btn {
		width: 100%;
		padding: var(--space-md);
		background-color: #FF1493;
		border: none;
		border-radius: var(--radius-md);
		color: #fff;
		font-size: var(--text-sm);
		font-weight: var(--font-bold);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.generate-btn:hover:not(.disabled) {
		opacity: 0.9;
		transform: translateY(-1px);
	}

	.generate-btn.disabled {
		background: var(--color-bg-canvas);
		border: 1px solid var(--color-text-muted);
		color: var(--color-text-muted);
		cursor: not-allowed;
		font-size: var(--text-xs);
	}

	.progress-area {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm) 0;
	}

	.mc-spinner {
		width: 32px;
		height: 32px;
		border: 3px solid rgba(255, 20, 147, 0.3);
		border-top-color: #FF1493;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	.progress-text {
		font-size: var(--text-xs);
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
	}

	.error-actions {
		display: flex;
		gap: var(--space-sm);
	}

	.result-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.result-video {
		width: 100%;
		border-radius: var(--radius-md);
		background: #000;
		display: block;
		max-height: 200px;
	}

	.result-actions {
		display: flex;
		gap: var(--space-sm);
	}

	.btn {
		flex: 1;
		padding: var(--space-sm) var(--space-md);
		border-radius: var(--radius-sm);
		font-size: var(--text-sm);
		cursor: pointer;
		border: 1px solid var(--color-text-muted);
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		transition: all var(--transition-fast);
	}

	.btn-primary {
		background: #FF1493;
		border-color: #FF1493;
		color: #fff;
	}

	.btn-secondary {
		background: var(--color-bg-canvas);
		color: var(--color-text-primary);
	}

	.btn-outline {
		background: transparent;
		color: var(--color-text-muted);
	}

	.btn.small {
		font-size: var(--text-xs);
		padding: 4px 10px;
		flex: unset;
	}
</style>
