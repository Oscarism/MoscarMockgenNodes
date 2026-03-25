<script lang="ts">
	import BaseNode from './BaseNode.svelte';
	import NodeField from './NodeField.svelte';
	import type { ClothingNodeData } from '$lib/types';
	import { clothingTypes, clothingStyles, clothingColors } from '$lib/data/clothing';
	import { updateNodeData } from '$lib/stores/canvas';

	interface Props {
		id: string;
		data: ClothingNodeData;
	}

	let { id, data }: Props = $props();

	function handleChange(field: string, value: string) {
		updateNodeData(id, { [field]: value });
	}
</script>

<BaseNode {id} nodeType="clothing">
	<NodeField {id} label="Clothing Type" field="clothingType" value={data.clothingType} options={clothingTypes} showAny={false} onchange={handleChange} />
	<NodeField {id} label="Style" field="style" value={data.style} options={clothingStyles} showAny={false} onchange={handleChange} />
	<NodeField {id} label="Color" field="color" value={data.color} options={clothingColors} showAny={false} onchange={handleChange} />

	<div class="preview">
		<span class="preview-label">Outfit:</span>
		<div class="preview-value">{data.color} {data.style} {data.clothingType}</div>
	</div>
</BaseNode>

<style>
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
