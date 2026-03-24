<script lang="ts">
	import BaseNode from './BaseNode.svelte';
	import type { VideoUploadNodeData, VideoFrame } from '$lib/types';
	import { updateNodeData } from '$lib/stores/canvas';
	import { user, isLoggedIn } from '$lib/stores/auth';
	import { toasts } from '$lib/stores/toasts';

	interface Props {
		id: string;
		data: VideoUploadNodeData;
	}

	let { id, data }: Props = $props();

	const FRAME_LABELS = ['First Frame', 'Last Frame'];
	const FRAME_COLORS = ['#7B68EE', '#00FA9A'];

	// Upload to Supabase Storage
	async function uploadToSupabase(file: File): Promise<string> {
		const formData = new FormData();
		formData.append('file', file);
		formData.append('userId', $user?.id || '');

		const response = await fetch('/api/upload', {
			method: 'POST',
			body: formData
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || 'Upload failed');
		}

		const result = await response.json();
		return result.publicUrl;
	}

	// Upload to Litterbox (fallback)
	async function uploadToLitterbox(file: File): Promise<string> {
		const formData = new FormData();
		formData.append('reqtype', 'fileupload');
		formData.append('time', '1h');
		formData.append('fileToUpload', file);

		const response = await fetch('https://litterbox.catbox.moe/resources/internals/api.php', {
			method: 'POST',
			body: formData
		});

		if (!response.ok) throw new Error('Upload failed');
		const url = await response.text();
		return url.trim();
	}

	async function uploadFrame(file: File): Promise<string> {
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

	async function handleFileSelect(event: Event, slotIndex: number) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
			alert('Please upload JPEG, PNG, or WebP images only');
			return;
		}

		if (file.size > 10 * 1024 * 1024) {
			alert('File size must be under 10MB');
			return;
		}

		const previewUrl = URL.createObjectURL(file);
		const newFrames = [...data.frames];

		// Ensure we have both slots
		while (newFrames.length <= slotIndex) {
			newFrames.push({ previewUrl: '', isUploading: false, label: FRAME_LABELS[newFrames.length] });
		}

		newFrames[slotIndex] = {
			file,
			previewUrl,
			isUploading: true,
			label: FRAME_LABELS[slotIndex]
		};

		updateNodeData(id, { frames: newFrames });

		try {
			const hostedUrl = await uploadFrame(file);
			const updatedFrames = [...data.frames];
			if (updatedFrames[slotIndex]) {
				updatedFrames[slotIndex] = { ...updatedFrames[slotIndex], hostedUrl, isUploading: false };
				updateNodeData(id, { frames: updatedFrames });
			}
		} catch (error) {
			const updatedFrames = [...data.frames];
			if (updatedFrames[slotIndex]) {
				updatedFrames[slotIndex] = { ...updatedFrames[slotIndex], isUploading: false };
				updateNodeData(id, { frames: updatedFrames });
			}
			alert('Upload failed. Please try again.');
		}

		input.value = '';
	}

	function removeFrame(index: number) {
		const newFrames = [...data.frames];
		newFrames[index] = { previewUrl: '', isUploading: false, label: FRAME_LABELS[index] };
		updateNodeData(id, { frames: newFrames });
	}

	let uploadedCount = $derived(data.frames.filter((f) => f.hostedUrl).length);
</script>

<BaseNode {id} nodeType="video-upload">
	<div class="info-row">
		<span class="hint">Optional: set first/last frames for Kling 3.0</span>
	</div>

	<div class="frames-grid">
		{#each { length: 2 } as _, i}
			{@const frame = data.frames[i]}
			{@const color = FRAME_COLORS[i]}
			{@const label = FRAME_LABELS[i]}

			<div class="frame-slot" style="--frame-color: {color}">
				<div class="slot-header">
					<span class="slot-label" style="color: {color}">{label}</span>
					{#if frame?.hostedUrl}
						<button class="remove-btn" onclick={() => removeFrame(i)} aria-label="Remove frame">×</button>
					{/if}
				</div>

				{#if frame?.previewUrl}
					<div class="frame-preview">
						{#if frame.isUploading}
							<div class="uploading">
								<div class="spinner"></div>
							</div>
						{/if}
						<img src={frame.previewUrl} alt={label} />
						{#if frame.hostedUrl}
							<div class="status uploaded">✓</div>
						{/if}
					</div>
				{:else}
					<label class="upload-trigger">
						<input
							type="file"
							accept="image/jpeg,image/png,image/webp"
							onchange={(e) => handleFileSelect(e, i)}
						/>
						<span class="plus">+</span>
						<span class="trigger-hint">{i === 0 ? 'Required*' : 'Optional'}</span>
					</label>
				{/if}
			</div>
		{/each}
	</div>

	<div class="info">
		{uploadedCount} / 2 frames uploaded
		{#if uploadedCount === 0}
			• No frames — text-only generation
		{/if}
	</div>
</BaseNode>

<style>
	.info-row {
		margin-bottom: 8px;
	}

	.hint {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.frames-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-sm);
	}

	.frame-slot {
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
	}

	.remove-btn {
		width: 14px;
		height: 14px;
		border-radius: var(--radius-full);
		background-color: var(--color-error);
		border: none;
		color: white;
		font-size: 10px;
		line-height: 1;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
	}

	.frame-preview {
		position: relative;
		width: 100%;
		aspect-ratio: 16/9;
		border-radius: var(--radius-sm);
		overflow: hidden;
		border: 2px solid var(--frame-color);
		background-color: var(--color-bg-canvas);
	}

	.frame-preview img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.uploading {
		position: absolute;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1;
	}

	.spinner {
		width: 16px;
		height: 16px;
		border: 2px solid #333;
		border-top-color: var(--frame-color);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.status {
		position: absolute;
		bottom: 2px;
		right: 2px;
		width: 16px;
		height: 16px;
		border-radius: var(--radius-full);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 10px;
	}

	.status.uploaded {
		background-color: var(--color-success);
		color: var(--color-bg-canvas);
	}

	.upload-trigger {
		width: 100%;
		aspect-ratio: 16/9;
		border: 2px dashed var(--frame-color);
		border-radius: var(--radius-sm);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all var(--transition-fast);
		background-color: transparent;
		gap: 2px;
	}

	.upload-trigger:hover {
		background-color: rgba(255, 255, 255, 0.05);
	}

	.upload-trigger input {
		display: none;
	}

	.plus {
		font-size: var(--text-xl);
		color: var(--frame-color);
		opacity: 0.5;
		line-height: 1;
	}

	.trigger-hint {
		font-size: 8px;
		color: var(--frame-color);
		opacity: 0.6;
		text-transform: uppercase;
		letter-spacing: 0.4px;
	}

	.upload-trigger:hover .plus,
	.upload-trigger:hover .trigger-hint {
		opacity: 1;
	}

	.info {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		text-align: center;
		margin-top: var(--space-sm);
	}
</style>
