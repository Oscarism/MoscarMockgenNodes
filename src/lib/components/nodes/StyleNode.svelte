<script lang="ts">
	import BaseNode from './BaseNode.svelte';
	import type { StyleNodeData } from '$lib/types';
	import { stylePresets, colorPalettes, designMovements } from '$lib/data/presets';
	import { updateNodeData } from '$lib/stores/canvas';

	interface Props {
		id: string;
		data: StyleNodeData;
	}

	let { id, data }: Props = $props();

	function handleStyleChange(event: Event) {
		const style = (event.target as HTMLSelectElement).value;
		updateNodeData(id, { style });
	}

	function handlePaletteChange(event: Event) {
		const palette = (event.target as HTMLSelectElement).value;
		updateNodeData(id, { palette });
	}

	function handleMovementChange(event: Event) {
		const designMovement = (event.target as HTMLSelectElement).value || undefined;
		updateNodeData(id, { designMovement });
	}
</script>

<BaseNode {id} nodeType="style">
	<div class="field">
		<label for="style-{id}">Style</label>
		<select id="style-{id}" value={data.style} onchange={handleStyleChange}>
			{#each stylePresets as preset}
				<option value={preset.id}>{preset.label}</option>
			{/each}
		</select>
	</div>

	<div class="field">
		<label for="palette-{id}">Color Palette</label>
		<select id="palette-{id}" value={data.palette} onchange={handlePaletteChange}>
			{#each colorPalettes as palette}
				<option value={palette.id}>{palette.label}</option>
			{/each}
		</select>
	</div>

	<div class="field">
		<label for="movement-{id}">Design Movement (Optional)</label>
		<select id="movement-{id}" value={data.designMovement || ''} onchange={handleMovementChange}>
			<option value="">None</option>
			{#each designMovements as movement}
				<option value={movement.id}>{movement.label}</option>
			{/each}
		</select>
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
</style>
