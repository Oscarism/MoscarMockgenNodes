<script lang="ts">
	import BaseNode from './BaseNode.svelte';
	import type { ReferenceImageNodeData, ReferenceImage } from '$lib/types';
	import { referenceLabelCategories } from '$lib/data/referenceLabels';
	import { updateNodeData } from '$lib/stores/canvas';
	import { IMAGE_SLOT_COLORS } from '$lib/types';
	import { user, isLoggedIn } from '$lib/stores/auth';
	import { toasts } from '$lib/stores/toasts';

	interface Props {
		id: string;
		data: ReferenceImageNodeData;
	}

	let { id, data }: Props = $props();

	const MAX_IMAGES = 4;

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
		console.log('[ReferenceNode] Supabase upload success:', result.publicUrl);
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
		console.log('[ReferenceNode] Litterbox upload success:', url.trim());
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

	async function handleFileSelect(slotIndex: number, event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		// Check file type
		if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
			toasts.error('Please upload JPEG, PNG, or WebP images only');
			return;
		}

		// Check file size (10MB max)
		if (file.size > 10 * 1024 * 1024) {
			toasts.error('File size must be under 10MB');
			return;
		}

		// Create preview URL
		const previewUrl = URL.createObjectURL(file);

		// Ensure we have enough slots in the array
		const newImages = [...data.images];
		while (newImages.length <= slotIndex) {
			newImages.push({
				previewUrl: '',
				isUploading: false,
				label: 'product'
			});
		}

		// Set uploading state
		newImages[slotIndex] = {
			file,
			previewUrl,
			hostedUrl: undefined,
			isUploading: true,
			label: newImages[slotIndex]?.label || 'product'
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
				toasts.success(`Reference image ${slotIndex + 1} uploaded`);
			}
		} catch (error) {
			console.error('Upload failed:', error);
			// Mark as failed
			const updatedImages = [...data.images];
			if (updatedImages[slotIndex]) {
				updatedImages[slotIndex].isUploading = false;
			}
			updateNodeData(id, { images: updatedImages });
			toasts.error('Upload failed. Please try again.');
		}

		// Reset input so same file can be selected again
		input.value = '';
	}

	function handleLabelChange(slotIndex: number, event: Event) {
		const label = (event.target as HTMLSelectElement).value;
		const newImages = [...data.images];
		if (newImages[slotIndex]) {
			newImages[slotIndex] = { ...newImages[slotIndex], label };
			updateNodeData(id, { images: newImages });
		}
	}

	function handleRemoveImage(slotIndex: number) {
		const newImages = [...data.images];
		// Revoke object URL to prevent memory leak
		if (newImages[slotIndex]?.previewUrl) {
			URL.revokeObjectURL(newImages[slotIndex].previewUrl);
		}
		newImages.splice(slotIndex, 1);
		updateNodeData(id, { images: newImages });
	}

	function handleCustomPromptChange(event: Event) {
		const value = (event.target as HTMLTextAreaElement).value;
		updateNodeData(id, { customPrompt: value });
	}

	// Get slot color for visual distinction
	function getSlotColor(index: number): string {
		return IMAGE_SLOT_COLORS[index] || '#888888';
	}

	// Count uploaded images
	let uploadedCount = $derived(data.images.filter((img) => img?.hostedUrl).length);
</script>

<BaseNode {id} nodeType="reference">
	<div class="slots-container">
		{#each Array(MAX_IMAGES) as _, index}
			{@const image = data.images[index]}
			{@const color = getSlotColor(index)}
			<div class="image-slot" style="--slot-color: {color}">
				<div class="slot-header">
					<span class="slot-number" style="color: {color}">Ref {index + 1}</span>
					{#if image?.hostedUrl}
						<button class="remove-btn" onclick={() => handleRemoveImage(index)}>×</button>
					{/if}
				</div>

				{#if image?.previewUrl}
					<div class="image-preview">
						{#if image.isUploading}
							<div class="uploading">
								<div class="spinner"></div>
							</div>
						{/if}
						<img src={image.previewUrl} alt="Reference {index + 1}" />
						{#if image.hostedUrl}
							<div class="status uploaded">✓</div>
						{/if}
					</div>
					<div class="label-select">
						<select value={image.label || 'product'} onchange={(e) => handleLabelChange(index, e)}>
							{#each referenceLabelCategories as category}
								<optgroup label={category.label}>
									{#each category.options as option}
										<option value={option.id}>{option.label}</option>
									{/each}
								</optgroup>
							{/each}
						</select>
					</div>
				{:else}
					<label class="upload-area">
						<input
							type="file"
							accept="image/jpeg,image/png,image/webp"
							onchange={(e) => handleFileSelect(index, e)}
						/>
						<span class="upload-icon">+</span>
					</label>
				{/if}
			</div>
		{/each}
	</div>

	<div class="info">
		{data.images.length} / {MAX_IMAGES} images • {uploadedCount} uploaded
	</div>

	<div class="field">
		<label for="custom-{id}">Instructions</label>
		<textarea
			id="custom-{id}"
			value={data.customPrompt || ''}
			onchange={handleCustomPromptChange}
			placeholder="e.g., Match warm tones from image 1 with composition of image 2"
			rows="2"
		></textarea>
	</div>
</BaseNode>

<style>
	.slots-container {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-sm);
		margin-bottom: var(--space-sm);
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

	.slot-number {
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

	.upload-area {
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

	.upload-area:hover {
		background: rgba(255, 255, 255, 0.05);
	}

	.upload-area input {
		display: none;
	}

	.upload-icon {
		font-size: var(--text-xl);
		color: var(--slot-color);
		opacity: 0.5;
	}

	.upload-area:hover .upload-icon {
		opacity: 1;
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

	.label-select {
		padding: 2px 0;
	}

	.label-select select {
		width: 100%;
		font-size: var(--text-xs);
		padding: 2px 4px;
	}

	.info {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		text-align: center;
		margin-bottom: var(--space-sm);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-tiny);
	}

	.field label {
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	textarea {
		resize: vertical;
		min-height: 40px;
	}
</style>
