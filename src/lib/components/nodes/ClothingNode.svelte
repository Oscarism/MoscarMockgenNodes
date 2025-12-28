<script lang="ts">
	import BaseNode from './BaseNode.svelte';
	import type { ClothingNodeData } from '$lib/types';
	import { clothingTypes, clothingStyles, clothingColors } from '$lib/data/clothing';
	import { updateNodeData } from '$lib/stores/canvas';

	interface Props {
		id: string;
		data: ClothingNodeData;
	}

	let { id, data }: Props = $props();

	function handleTypeChange(event: Event) {
		const clothingType = (event.target as HTMLSelectElement).value;
		updateNodeData(id, { clothingType });
	}

	function handleStyleChange(event: Event) {
		const style = (event.target as HTMLSelectElement).value;
		updateNodeData(id, { style });
	}

	function handleColorChange(event: Event) {
		const color = (event.target as HTMLSelectElement).value;
		updateNodeData(id, { color });
	}
</script>

<BaseNode {id} nodeType="clothing">
	<div class="field">
		<label for="type-{id}">Clothing Type</label>
		<select id="type-{id}" value={data.clothingType} onchange={handleTypeChange}>
			{#each clothingTypes as type}
				<option value={type}>{type}</option>
			{/each}
		</select>
	</div>

	<div class="field">
		<label for="style-{id}">Style</label>
		<select id="style-{id}" value={data.style} onchange={handleStyleChange}>
			{#each clothingStyles as style}
				<option value={style}>{style}</option>
			{/each}
		</select>
	</div>

	<div class="field">
		<label for="color-{id}">Color</label>
		<select id="color-{id}" value={data.color} onchange={handleColorChange}>
			{#each clothingColors as color}
				<option value={color}>{color}</option>
			{/each}
		</select>
	</div>

	<div class="preview">
		<span class="preview-label">Outfit:</span>
		<div class="preview-value">{data.color} {data.style} {data.clothingType}</div>
	</div>
</BaseNode>

<style>
	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-tiny);
		margin-bottom: var(--space-sm);
	}

	.field label {
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.preview {
		margin-top: var(--space-sm);
		padding: var(--space-sm);
		background-color: var(--color-bg-canvas);
		border-radius: var(--radius-sm);
		font-size: var(--text-sm);
	}

	.preview-label {
		color: var(--color-text-secondary);
		display: block;
		margin-bottom: 2px;
	}

	.preview-value {
		color: var(--color-node-clothing);
		font-weight: var(--font-medium);
	}
</style>
