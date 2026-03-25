<script lang="ts">
	import BaseNode from './BaseNode.svelte';
	import NodeField from './NodeField.svelte';
	import type { StyleNodeData } from '$lib/types';
	import { stylePresets, colorPalettes, designMovements } from '$lib/data/presets';
	import { updateNodeData } from '$lib/stores/canvas';

	interface Props {
		id: string;
		data: StyleNodeData;
	}

	let { id, data }: Props = $props();

	function handleChange(field: string, value: string) {
		updateNodeData(id, { [field]: value });
	}
</script>

<BaseNode {id} nodeType="style">
	<NodeField {id} label="Style" field="style" value={data.style} options={stylePresets} showAny={false} onchange={handleChange} />
	<NodeField {id} label="Color Palette" field="palette" value={data.palette} options={colorPalettes} showAny={false} onchange={handleChange} />
	<NodeField {id} label="Design Movement (Optional)" field="designMovement" value={data.designMovement || ''} options={designMovements} anyLabel="None" onchange={handleChange} />
</BaseNode>
