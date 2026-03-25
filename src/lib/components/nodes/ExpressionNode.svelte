<script lang="ts">
	import BaseNode from './BaseNode.svelte';
	import NodeField from './NodeField.svelte';
	import type { ExpressionNodeData } from '$lib/types';
	import {
		moodPresets,
		smilePresets,
		eyeContactPresets,
		energyPresets,
		eyebrowPresets,
		mouthPresets,
		headPositionPresets
	} from '$lib/data/expressions';
	import { updateNodeData } from '$lib/stores/canvas';

	interface Props {
		id: string;
		data: ExpressionNodeData;
	}

	let { id, data }: Props = $props();

	function handleChange(field: string, value: string) {
		updateNodeData(id, { [field]: value });
	}
</script>

<BaseNode {id} nodeType="expression">
	<div class="row">
		<NodeField {id} label="Mood" field="mood" value={data.mood} options={moodPresets} showAny={false} onchange={handleChange} />
		<NodeField {id} label="Smile" field="smile" value={data.smile} options={smilePresets} showAny={false} onchange={handleChange} />
	</div>

	<div class="row">
		<NodeField {id} label="Eye Contact" field="eyeContact" value={data.eyeContact} options={eyeContactPresets} showAny={false} onchange={handleChange} />
		<NodeField {id} label="Energy" field="energy" value={data.energy} options={energyPresets} showAny={false} onchange={handleChange} />
	</div>

	<div class="row">
		<NodeField {id} label="Eyebrows" field="eyebrows" value={data.eyebrows} options={eyebrowPresets} showAny={false} onchange={handleChange} />
		<NodeField {id} label="Mouth" field="mouthPosition" value={data.mouthPosition} options={mouthPresets} showAny={false} onchange={handleChange} />
	</div>

	<NodeField {id} label="Head Position" field="headPosition" value={data.headPosition} options={headPositionPresets} showAny={false} onchange={handleChange} />

	<div class="field">
		<label for="custom-{id}">Custom Details</label>
		<textarea
			id="custom-{id}"
			value={data.customPrompt || ''}
			oninput={(e) => handleChange('customPrompt', (e.target as HTMLTextAreaElement).value)}
			placeholder="Add specific expression details..."
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
