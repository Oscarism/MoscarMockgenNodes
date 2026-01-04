<script lang="ts">
	import BaseNode from './BaseNode.svelte';
	import type { BatchProcessorNodeData, BatchImage } from '$lib/types';
	import { updateNodeData } from '$lib/stores/canvas';
	import { validateImageFile } from '$lib/services/imageHost';
	import { toasts } from '$lib/stores/toasts';

	interface Props {
		id: string;
		data: BatchProcessorNodeData;
	}

	let { id, data }: Props = $props();

	// Local state
	let isDragOver = $state(false);

	// Handle file selection
	function handleFiles(files: FileList | File[]) {
		const fileArray = Array.from(files);
		const newImages: BatchImage[] = [...(data.images || [])];

		for (const file of fileArray) {
			const validation = validateImageFile(file);
			if (!validation.valid) {
				toasts.warning(validation.error || 'Invalid file');
				continue;
			}

			newImages.push({
				file,
				previewUrl: URL.createObjectURL(file),
				status: 'pending'
			});
		}

		updateNodeData(id, { images: newImages } as any);
	}

	// Handle drag events
	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		isDragOver = true;
	}

	function handleDragLeave() {
		isDragOver = false;
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragOver = false;
		if (event.dataTransfer?.files) {
			handleFiles(event.dataTransfer.files);
		}
	}

	// Handle file input change
	function handleInputChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files) {
			handleFiles(input.files);
		}
		input.value = '';
	}

	// Remove image from queue
	function removeImage(index: number) {
		const images: BatchImage[] = [...(data.images || [])];
		const removed = images.splice(index, 1)[0];
		if (removed?.previewUrl) {
			URL.revokeObjectURL(removed.previewUrl);
		}
		updateNodeData(id, { images } as any);
	}

	// Clear all images
	function clearAll() {
		for (const img of data.images || []) {
			if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
		}
		updateNodeData(id, { images: [] } as any);
	}

	// Computed
	let imageCount = $derived((data.images || []).length);
	let completedCount = $derived(
		(data.images || []).filter((i: BatchImage) => i.status === 'complete').length
	);
</script>

<BaseNode {id} nodeType="batch" showInput={false}>
	<div class="batch-info">
		<span class="info-text"
			>Add images for batch processing. Connect to Output node to process.</span
		>
	</div>

	<!-- Drop Zone -->
	<div
		class="drop-zone"
		class:drag-over={isDragOver}
		class:has-items={imageCount > 0}
		ondragover={handleDragOver}
		ondragleave={handleDragLeave}
		ondrop={handleDrop}
		role="button"
		tabindex="0"
	>
		{#if imageCount === 0}
			<div class="drop-content">
				<span class="drop-icon">📁</span>
				<label class="browse-btn">
					Add Images
					<input type="file" accept="image/*" multiple onchange={handleInputChange} hidden />
				</label>
			</div>
		{:else}
			<div class="thumbnail-grid">
				{#each data.images || [] as img, i}
					<div
						class="thumbnail"
						class:processing={img.status === 'processing' || img.status === 'uploading'}
						class:complete={img.status === 'complete'}
						class:error={img.status === 'error'}
					>
						<img src={img.previewUrl} alt="Batch item" />
						<button class="remove-btn" onclick={() => removeImage(i)}>×</button>
						{#if img.status === 'uploading'}
							<div class="status-badge uploading">↑</div>
						{:else if img.status === 'processing'}
							<div class="status-badge processing">⟳</div>
						{:else if img.status === 'complete'}
							<div class="status-badge complete">✓</div>
						{:else if img.status === 'error'}
							<div class="status-badge error">!</div>
						{/if}
					</div>
				{/each}
				<label class="add-more">
					<span>+</span>
					<input type="file" accept="image/*" multiple onchange={handleInputChange} hidden />
				</label>
			</div>
		{/if}
	</div>

	<!-- Stats -->
	{#if imageCount > 0}
		<div class="stats-row">
			<span class="stat">{imageCount} images queued</span>
			{#if completedCount > 0}
				<span class="stat complete">{completedCount} done</span>
			{/if}
			<button class="clear-btn" onclick={clearAll}>Clear</button>
		</div>
	{/if}
</BaseNode>

<style>
	.batch-info {
		margin-bottom: var(--space-sm);
	}

	.info-text {
		font-size: var(--text-xs);
		color: white;
		opacity: 0.9;
	}

	.drop-zone {
		border: 2px dashed var(--color-text-muted);
		border-radius: var(--radius-md);
		padding: var(--space-md);
		min-height: 80px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all var(--transition-fast);
	}

	.drop-zone.drag-over {
		border-color: var(--color-node-image);
		background: rgba(255, 159, 67, 0.1);
	}

	.drop-zone.has-items {
		padding: var(--space-sm);
	}

	.drop-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-sm);
		color: var(--color-text-muted);
	}

	.drop-icon {
		font-size: 24px;
	}

	.browse-btn {
		padding: 6px 12px;
		background: var(--color-node-image);
		color: var(--color-bg-canvas);
		border-radius: var(--radius-sm);
		cursor: pointer;
		font-size: var(--text-xs);
		font-weight: 500;
	}

	.thumbnail-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 4px;
		width: 100%;
	}

	.thumbnail {
		position: relative;
		aspect-ratio: 1;
		border-radius: 4px;
		overflow: hidden;
		background: var(--color-bg-canvas);
	}

	.thumbnail img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.thumbnail.processing {
		opacity: 0.7;
	}

	.thumbnail.complete {
		box-shadow: 0 0 0 2px var(--color-success);
	}

	.thumbnail.error {
		box-shadow: 0 0 0 2px var(--color-error);
	}

	.remove-btn {
		position: absolute;
		top: 2px;
		right: 2px;
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.7);
		color: white;
		border: none;
		cursor: pointer;
		font-size: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: opacity var(--transition-fast);
	}

	.thumbnail:hover .remove-btn {
		opacity: 1;
	}

	.status-badge {
		position: absolute;
		bottom: 2px;
		right: 2px;
		width: 14px;
		height: 14px;
		border-radius: 50%;
		font-size: 8px;
		font-weight: 600;
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.status-badge.uploading {
		background: var(--color-warning);
	}

	.status-badge.processing {
		background: #9b59b6;
		animation: spin 1s linear infinite;
	}

	.status-badge.complete {
		background: var(--color-success);
	}

	.status-badge.error {
		background: var(--color-error);
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.add-more {
		aspect-ratio: 1;
		border: 2px dashed var(--color-text-muted);
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color: var(--color-text-muted);
		font-size: 16px;
	}

	.add-more:hover {
		border-color: var(--color-node-image);
		color: var(--color-node-image);
	}

	.stats-row {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		font-size: var(--text-xs);
		color: white;
	}

	.stat {
		color: white;
	}

	.stat.complete {
		color: var(--color-success);
	}

	.clear-btn {
		margin-left: auto;
		padding: 2px 6px;
		background: rgba(255, 255, 255, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: var(--radius-sm);
		color: white;
		font-size: var(--text-xs);
		cursor: pointer;
	}

	.clear-btn:hover {
		background: rgba(255, 255, 255, 0.3);
	}
</style>
