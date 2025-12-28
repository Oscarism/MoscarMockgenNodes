<script lang="ts">
	import BaseNode from './BaseNode.svelte';
	import type { PlantNodeData } from '$lib/types';
	import { plantPresets } from '$lib/data/presets';
	import { updateNodeData } from '$lib/stores/canvas';

	interface Props {
		id: string;
		data: PlantNodeData;
	}

	let { id, data }: Props = $props();

	function handlePlantChange(event: Event) {
		const plantType = (event.target as HTMLSelectElement).value;
		updateNodeData(id, { plantType });
	}

	function handleCustomChange(event: Event) {
		const customPlant = (event.target as HTMLInputElement).value;
		updateNodeData(id, { customPlant });
	}
</script>

<BaseNode {id} nodeType="plant">
	<div class="field">
		<label for="plant-{id}">Plant Type</label>
		<select id="plant-{id}" value={data.plantType} onchange={handlePlantChange}>
			{#each plantPresets as plant}
				<option value={plant.id}>{plant.label}</option>
			{/each}
		</select>
		<span class="hint">
			{plantPresets.find((p) => p.id === data.plantType)?.prompt || 'Select a plant'}
		</span>
	</div>

	<div class="field">
		<label for="custom-{id}">Custom Plant (Optional)</label>
		<input
			type="text"
			id="custom-{id}"
			value={data.customPlant || ''}
			oninput={handleCustomChange}
			placeholder="e.g. cherry blossom"
		/>
	</div>
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

	.hint {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		font-style: italic;
	}
</style>
