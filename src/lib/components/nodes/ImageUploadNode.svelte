<script lang="ts">
	import BaseNode from './BaseNode.svelte';
	import type { ImageUploadNodeData, UploadedImage } from '$lib/types';
	import { IMAGE_SLOT_COLORS } from '$lib/types';
	import { updateNodeData } from '$lib/stores/canvas';
	import { user, isLoggedIn } from '$lib/stores/auth';
	import { toasts } from '$lib/stores/toasts';

	interface Props {
		id: string;
		data: ImageUploadNodeData;
	}

	let { id, data }: Props = $props();
	let fileInputs: HTMLInputElement[] = $state([]);

	const MAX_IMAGES = 8;

	// Get current number of images
	let imageCount = $derived(data.images.length);

	// Upload to Supabase Storage (for logged-in users)
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
		console.log('[Upload] Supabase upload success:', result.publicUrl);
		return result.publicUrl;
	}

	// Upload to Litterbox (fallback for anonymous users)
	async function uploadToLitterbox(file: File): Promise<string> {
		const formData = new FormData();
		formData.append('reqtype', 'fileupload');
		formData.append('time', '1h'); // 1 hour expiry
		formData.append('fileToUpload', file);

		const response = await fetch('https://litterbox.catbox.moe/resources/internals/api.php', {
			method: 'POST',
			body: formData
		});

		if (!response.ok) {
			throw new Error('Upload failed');
		}

		const url = await response.text();
		console.log('[Upload] Litterbox upload success:', url.trim());
		return url.trim();
	}

	// Smart upload - uses Supabase if logged in, Litterbox if not
	async function uploadImage(file: File): Promise<string> {
		if ($isLoggedIn) {
			try {
				return await uploadToSupabase(file);
			} catch (error) {
				console.warn('Supabase upload failed, falling back to Litterbox:', error);
				toasts.warning('Cloud upload failed, using temporary storage');
				return await uploadToLitterbox(file);
			}
		} else {
			return await uploadToLitterbox(file);
		}
	}

	async function handleFileSelect(event: Event, slotIndex: number) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		// Check file type
		if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
			alert('Please upload JPEG, PNG, or WebP images only');
			return;
		}

		// Check file size (10MB max)
		if (file.size > 10 * 1024 * 1024) {
			alert('File size must be under 10MB');
			return;
		}

		// Create preview URL
		const previewUrl = URL.createObjectURL(file);

		// Update the images array
		const newImages = [...data.images];

		// Ensure we have enough slots
		while (newImages.length <= slotIndex) {
			newImages.push({ previewUrl: '', isUploading: false });
		}

		// Set uploading state
		newImages[slotIndex] = {
			file,
			previewUrl,
			isUploading: true
		};

		updateNodeData(id, { images: newImages });

		try {
			// Upload using smart upload (Supabase if logged in, Litterbox if not)
			const hostedUrl = await uploadImage(file);

			// Update with hosted URL
			const updatedImages = [...data.images];
			if (updatedImages[slotIndex]) {
				updatedImages[slotIndex] = {
					...updatedImages[slotIndex],
					hostedUrl,
					isUploading: false
				};
				updateNodeData(id, { images: updatedImages });
			}
		} catch (error) {
			console.error('Upload failed:', error);
			// Mark as failed
			const updatedImages = [...data.images];
			if (updatedImages[slotIndex]) {
				updatedImages[slotIndex].isUploading = false;
			}
			updateNodeData(id, { images: updatedImages });
			alert('Upload failed. Please try again.');
		}

		// Clear input
		input.value = '';
	}

	function removeImage(index: number) {
		const newImages = data.images.filter((_, i) => i !== index);
		updateNodeData(id, { images: newImages });
	}

	function getSlotLabel(index: number): string {
		return `Image ${index + 1}`;
	}
</script>

<BaseNode {id} nodeType="image">
	<div class="image-grid">
		{#each { length: MAX_IMAGES } as _, i}
			{@const image = data.images[i]}
			{@const color = IMAGE_SLOT_COLORS[i]}

			<div class="image-slot" style="--slot-color: {color}">
				<div class="slot-header">
					<span class="slot-label" style="color: {color}">{getSlotLabel(i)}</span>
					{#if image?.hostedUrl}
						<button class="remove-btn" onclick={() => removeImage(i)} aria-label="Remove image"
							>×</button
						>
					{/if}
				</div>

				{#if image?.previewUrl}
					<div class="image-preview">
						{#if image.isUploading}
							<div class="uploading">
								<div class="spinner"></div>
							</div>
						{/if}
						<img src={image.previewUrl} alt="Image {i + 1}" />
						{#if image.hostedUrl}
							<div class="status uploaded">✓</div>
						{/if}
					</div>
				{:else}
					<label class="upload-trigger">
						<input
							type="file"
							accept="image/jpeg,image/png,image/webp"
							onchange={(e) => handleFileSelect(e, i)}
							bind:this={fileInputs[i]}
						/>
						<span class="plus">+</span>
					</label>
				{/if}
			</div>
		{/each}
	</div>

	<div class="info">
		{imageCount} / {MAX_IMAGES} images
		{#if imageCount > 0}
			• {data.images.filter((img) => img.hostedUrl).length} uploaded
		{/if}
	</div>
</BaseNode>

<style>
	.image-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--space-sm);
	}

	.image-slot {
		display: flex;
		flex-direction: column;
		gap: 2px;
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

	.image-preview {
		position: relative;
		width: 100%;
		aspect-ratio: 1;
		border-radius: var(--radius-sm);
		overflow: hidden;
		border: 2px solid var(--slot-color);
		background-color: var(--color-bg-canvas);
	}

	.image-preview img {
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
		border-top-color: var(--slot-color);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
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
		aspect-ratio: 1;
		border: 2px dashed var(--slot-color);
		border-radius: var(--radius-sm);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all var(--transition-fast);
		background-color: transparent;
	}

	.upload-trigger:hover {
		background-color: rgba(255, 255, 255, 0.05);
	}

	.upload-trigger input {
		display: none;
	}

	.plus {
		font-size: var(--text-xl);
		color: var(--slot-color);
		opacity: 0.5;
	}

	.upload-trigger:hover .plus {
		opacity: 1;
	}

	.info {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		text-align: center;
		margin-top: var(--space-sm);
	}
</style>
