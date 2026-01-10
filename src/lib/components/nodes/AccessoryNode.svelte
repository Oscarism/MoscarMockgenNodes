<script lang="ts">
	import BaseNode from './BaseNode.svelte';
	import type { AccessoryNodeData } from '$lib/types';
	import {
		accessoryCategories,
		accessoryMaterials,
		accessoryStyles,
		accessoryPlacements
	} from '$lib/data/accessories';
	import { updateNodeData } from '$lib/stores/canvas';

	interface Props {
		id: string;
		data: AccessoryNodeData;
	}

	let { id, data }: Props = $props();

	// Get items for the selected category
	let categoryItems = $derived(
		accessoryCategories.find((c) => c.id === data.category)?.items || []
	);

	function handleChange(field: keyof AccessoryNodeData) {
		return (event: Event) => {
			const value = (event.target as HTMLSelectElement | HTMLTextAreaElement).value;
			updateNodeData(id, { [field]: value });
		};
	}
</script>

<BaseNode {id} nodeType="accessory">
	<div class="row">
		<div class="field half">
			<label for="category-{id}">Category</label>
			<select id="category-{id}" value={data.category} onchange={handleChange('category')}>
				{#each accessoryCategories as category}
					<option value={category.id}>{category.label}</option>
				{/each}
			</select>
		</div>
		<div class="field half">
			<label for="item-{id}">Item</label>
			<select id="item-{id}" value={data.item} onchange={handleChange('item')}>
				{#each categoryItems as item}
					<option value={item.id}>{item.label}</option>
				{/each}
			</select>
		</div>
	</div>

	<div class="row">
		<div class="field half">
			<label for="material-{id}">Material</label>
			<select id="material-{id}" value={data.material} onchange={handleChange('material')}>
				{#each accessoryMaterials as material}
					<option value={material.id}>{material.label}</option>
				{/each}
			</select>
		</div>
		<div class="field half">
			<label for="style-{id}">Style</label>
			<select id="style-{id}" value={data.style} onchange={handleChange('style')}>
				{#each accessoryStyles as style}
					<option value={style.id}>{style.label}</option>
				{/each}
			</select>
		</div>
	</div>

	<div class="field">
		<label for="placement-{id}">Display/Placement</label>
		<select id="placement-{id}" value={data.placement} onchange={handleChange('placement')}>
			{#each accessoryPlacements as placement}
				<option value={placement.id}>{placement.label}</option>
			{/each}
		</select>
	</div>

	<div class="field">
		<label for="custom-{id}">Custom Details</label>
		<textarea
			id="custom-{id}"
			value={data.customPrompt || ''}
			onchange={handleChange('customPrompt')}
			placeholder="Add specific accessory details..."
			rows="2"
		></textarea>
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

	.row {
		display: flex;
		gap: var(--space-sm);
	}

	.half {
		flex: 1;
	}

	textarea {
		resize: vertical;
		min-height: 40px;
	}
</style>
