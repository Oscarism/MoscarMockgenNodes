<script lang="ts">
	import BaseNode from './BaseNode.svelte';
	import NodeField from './NodeField.svelte';
	import type { FurnitureNodeData } from '$lib/types';
	import {
		furnitureCategories,
		furnitureStyles,
		furnitureMaterials,
		furnitureSettings
	} from '$lib/data/furniture';
	import { updateNodeData } from '$lib/stores/canvas';

	interface Props {
		id: string;
		data: FurnitureNodeData;
	}

	let { id, data }: Props = $props();

	// Get items for the selected category
	let categoryItems = $derived(
		furnitureCategories.find((c) => c.id === data.category)?.items || []
	);

	function handleChange(field: string, value: string) {
		updateNodeData(id, { [field]: value });
	}
</script>

<BaseNode {id} nodeType="furniture">
	<div class="row">
		<NodeField {id} label="Category" field="category" value={data.category} options={furnitureCategories} showAny={false} onchange={handleChange} />
		<NodeField {id} label="Item" field="item" value={data.item} options={categoryItems} showAny={false} onchange={handleChange} />
	</div>

	<div class="row">
		<NodeField {id} label="Style" field="style" value={data.style} options={furnitureStyles} showAny={false} onchange={handleChange} />
		<NodeField {id} label="Material" field="material" value={data.material} options={furnitureMaterials} showAny={false} onchange={handleChange} />
	</div>

	<NodeField {id} label="Setting" field="setting" value={data.setting} options={furnitureSettings} showAny={false} onchange={handleChange} />

	<div class="field">
		<label for="custom-{id}">Custom Details</label>
		<textarea
			id="custom-{id}"
			value={data.customPrompt || ''}
			oninput={(e) => handleChange('customPrompt', (e.target as HTMLTextAreaElement).value)}
			placeholder="Add specific furniture details..."
			rows="2"
		></textarea>
	</div>
</BaseNode>

<style>
	.row {
		display: flex;
		gap: var(--space-sm);
	}

	.row :global(.field) {
		flex: 1;
	}

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

	textarea {
		resize: vertical;
		min-height: 40px;
	}
</style>
