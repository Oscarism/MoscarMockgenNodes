<script lang="ts">
	import BaseNode from './BaseNode.svelte';
	import type { RefineNodeData } from '$lib/types';
	import { updateNodeData } from '$lib/stores/canvas';
	import { generationState, startEdit } from '$lib/stores/generation';
	import { aspectRatioOptions } from '$lib/data/presets';

	interface Props {
		id: string;
		data: RefineNodeData;
	}

	let { id, data }: Props = $props();

	// Get generated images for selection
	let availableImages = $derived($generationState.generatedImages);
	let isRefining = $derived($generationState.isGenerating);

	function handleImageSelect(event: Event) {
		const originalImageUrl = (event.target as HTMLSelectElement).value;
		updateNodeData(id, { originalImageUrl });
	}

	function handleInstructionsChange(event: Event) {
		const instructions = (event.target as HTMLTextAreaElement).value;
		updateNodeData(id, { instructions });
	}

	async function handleRefine() {
		if (isRefining || !data.originalImageUrl || !data.instructions) return;

		await startEdit(
			data.originalImageUrl,
			data.instructions,
			'1:1', // Default aspect ratio for edits
			'basic'
		);
	}
</script>

<BaseNode {id} nodeType="refine" showOutput={false}>
	<div class="field">
		<label for="image-{id}">Source Image</label>
		{#if availableImages.length > 0}
			<select id="image-{id}" value={data.originalImageUrl} onchange={handleImageSelect}>
				<option value="">Select an image...</option>
				{#each availableImages as imageUrl, i}
					<option value={imageUrl}>Generated Image {i + 1}</option>
				{/each}
			</select>
		{:else}
			<div class="no-images">Generate images first using the Output node</div>
		{/if}
	</div>

	{#if data.originalImageUrl}
		<div class="image-preview">
			<img src={data.originalImageUrl} alt="Source" />
		</div>
	{/if}

	<div class="field">
		<label for="instructions-{id}">Edit Instructions</label>
		<textarea
			id="instructions-{id}"
			value={data.instructions}
			oninput={handleInstructionsChange}
			placeholder="Describe the changes you want..."
			rows={3}
		></textarea>
	</div>

	<button
		class="refine-btn"
		onclick={handleRefine}
		disabled={isRefining || !data.originalImageUrl || !data.instructions}
	>
		{#if isRefining}
			<span class="spinner"></span>
			Refining...
		{:else}
			Refine Image
		{/if}
	</button>
</BaseNode>

<style>
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
		min-height: 60px;
	}

	.no-images {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		font-style: italic;
		padding: var(--space-sm);
		background-color: var(--color-bg-canvas);
		border-radius: var(--radius-sm);
		text-align: center;
	}

	.image-preview {
		border-radius: var(--radius-sm);
		overflow: hidden;
		background-color: var(--color-bg-canvas);
	}

	.image-preview img {
		width: 100%;
		height: auto;
		display: block;
	}

	.refine-btn {
		width: 100%;
		padding: var(--space-md);
		background-color: var(--color-node-refine);
		border: none;
		border-radius: var(--radius-md);
		color: var(--color-bg-canvas);
		font-weight: var(--font-bold);
		font-size: var(--text-base);
		cursor: pointer;
		transition: all var(--transition-fast);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
	}

	.refine-btn:hover:not(:disabled) {
		transform: scale(1.02);
		box-shadow: 0 0 20px rgba(110, 254, 133, 0.4);
	}

	.refine-btn:active:not(:disabled) {
		transform: scale(0.98);
	}

	.refine-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.spinner {
		width: 16px;
		height: 16px;
		border: 2px solid var(--color-bg-canvas);
		border-top-color: transparent;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
