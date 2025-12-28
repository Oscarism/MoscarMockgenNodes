<script lang="ts">
	import BaseNode from './BaseNode.svelte';
	import type { CameraNodeData } from '$lib/types';
	import { cameraAngles, cameraDistances, depthOfFieldOptions } from '$lib/data/presets';
	import { updateNodeData } from '$lib/stores/canvas';

	interface Props {
		id: string;
		data: CameraNodeData;
	}

	let { id, data }: Props = $props();

	function handleAngleChange(event: Event) {
		const angle = (event.target as HTMLSelectElement).value;
		updateNodeData(id, { angle });
	}

	function handleDistanceChange(event: Event) {
		const distance = (event.target as HTMLSelectElement).value;
		updateNodeData(id, { distance });
	}

	function handleDofChange(event: Event) {
		const depthOfField = (event.target as HTMLSelectElement)
			.value as CameraNodeData['depthOfField'];
		updateNodeData(id, { depthOfField });
	}
</script>

<BaseNode {id} nodeType="camera">
	<div class="field">
		<label for="angle-{id}">Angle</label>
		<select id="angle-{id}" value={data.angle} onchange={handleAngleChange}>
			{#each cameraAngles as angle}
				<option value={angle.id}>{angle.label}</option>
			{/each}
		</select>
	</div>

	<div class="field">
		<label for="distance-{id}">Distance</label>
		<select id="distance-{id}" value={data.distance} onchange={handleDistanceChange}>
			{#each cameraDistances as distance}
				<option value={distance.id}>{distance.label}</option>
			{/each}
		</select>
	</div>

	<div class="field">
		<label for="dof-{id}">Depth of Field</label>
		<select id="dof-{id}" value={data.depthOfField} onchange={handleDofChange}>
			{#each depthOfFieldOptions as dof}
				<option value={dof.id}>{dof.label}</option>
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
