<script lang="ts">
	import BaseNode from './BaseNode.svelte';
	import type { VariationNodeData } from '$lib/types';
	import { updateNodeData } from '$lib/stores/canvas';

	interface Props {
		id: string;
		data: VariationNodeData;
	}

	let { id, data }: Props = $props();

	function handleVariationChange(index: number, event: Event) {
		const value = (event.target as HTMLInputElement).value;
		const newVariations = [...data.variations];
		newVariations[index] = value;
		updateNodeData(id, { variations: newVariations });
	}

	function addVariation() {
		updateNodeData(id, { variations: [...data.variations, ''] });
	}

	function removeVariation(index: number) {
		if (data.variations.length <= 1) return;
		const newVariations = data.variations.filter((_, i) => i !== index);
		updateNodeData(id, { variations: newVariations });
	}

	// Generate the {v1|v2|v3} format for preview
	let variationPreview = $derived(
		data.variations.filter((v) => v.trim()).length > 0
			? `{${data.variations.filter((v) => v.trim()).join('|')}}`
			: '(no variations)'
	);
</script>

<BaseNode {id} nodeType="variation">
	<div class="variations-list">
		{#each data.variations as variation, index}
			<div class="variation-row">
				<input
					type="text"
					class="nodrag"
					value={variation}
					oninput={(e) => handleVariationChange(index, e)}
					placeholder="Variation {index + 1}"
				/>
				<button
					class="remove-btn"
					onclick={() => removeVariation(index)}
					disabled={data.variations.length <= 1}
					aria-label="Remove variation"
				>
					×
				</button>
			</div>
		{/each}
	</div>

	<button class="add-btn" onclick={addVariation}> + Add Variation </button>

	<div class="preview">
		<span class="preview-label">Output:</span>
		<div class="preview-value">{variationPreview}</div>
	</div>
</BaseNode>

<style>
	.variations-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		max-height: 200px;
		overflow-y: auto;
	}

	.variation-row {
		display: flex;
		gap: var(--space-sm);
		align-items: center;
	}

	.variation-row input {
		flex: 1;
		padding: var(--space-sm);
		background-color: var(--color-bg-canvas);
		border: 1px solid var(--color-text-muted);
		border-radius: var(--radius-sm);
		color: var(--color-text-primary);
	}

	.variation-row input:focus {
		border-color: var(--color-node-variation, #f9e79f);
		outline: none;
	}

	.remove-btn {
		width: 24px;
		height: 24px;
		border-radius: var(--radius-sm);
		background-color: var(--color-bg-canvas);
		border: 1px solid var(--color-text-muted);
		color: var(--color-text-secondary);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 16px;
	}

	.remove-btn:hover:not(:disabled) {
		border-color: var(--color-error);
		color: var(--color-error);
	}

	.remove-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.add-btn {
		width: 100%;
		padding: var(--space-sm);
		margin-top: var(--space-sm);
		background-color: var(--color-bg-canvas);
		border: 1px dashed var(--color-text-muted);
		border-radius: var(--radius-sm);
		color: var(--color-text-secondary);
		cursor: pointer;
		font-size: var(--text-sm);
	}

	.add-btn:hover {
		border-color: var(--color-node-variation, #f9e79f);
		color: var(--color-node-variation, #f9e79f);
	}

	.preview {
		margin-top: var(--space-sm);
		padding: var(--space-sm);
		background-color: var(--color-bg-canvas);
		border-radius: var(--radius-sm);
		font-size: var(--text-sm);
		font-family: var(--font-mono);
	}

	.preview-label {
		color: var(--color-text-secondary);
		display: block;
		margin-bottom: 2px;
	}

	.preview-value {
		color: var(--color-node-variation, #f9e79f);
		font-weight: var(--font-medium);
		word-break: break-all;
	}
</style>
