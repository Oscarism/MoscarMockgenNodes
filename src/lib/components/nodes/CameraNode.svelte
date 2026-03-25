<script lang="ts">
	import BaseNode from './BaseNode.svelte';
	import NodeField from './NodeField.svelte';
	import type { CameraNodeData } from '$lib/types';
	import { cameraAngles, cameraDistances, depthOfFieldOptions } from '$lib/data/presets';
	import { updateNodeData } from '$lib/stores/canvas';

	interface Props {
		id: string;
		data: CameraNodeData;
	}

	let { id, data }: Props = $props();

	function handleChange(field: string, value: string) {
		updateNodeData(id, { [field]: value });
	}
</script>

<BaseNode {id} nodeType="camera">
	<NodeField {id} label="Angle" field="angle" value={data.angle} options={cameraAngles} showAny={false} onchange={handleChange} />
	<NodeField {id} label="Distance" field="distance" value={data.distance} options={cameraDistances} showAny={false} onchange={handleChange} />
	<NodeField {id} label="Depth of Field" field="depthOfField" value={data.depthOfField} options={depthOfFieldOptions} showAny={false} onchange={handleChange} />
</BaseNode>
