<script lang="ts">
	import BaseNode from './BaseNode.svelte';
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

	function handleChange(field: keyof ExpressionNodeData) {
		return (event: Event) => {
			const value = (event.target as HTMLSelectElement | HTMLTextAreaElement).value;
			updateNodeData(id, { [field]: value });
		};
	}
</script>

<BaseNode {id} nodeType="expression">
	<div class="row">
		<div class="field half">
			<label for="mood-{id}">Mood</label>
			<select id="mood-{id}" value={data.mood} onchange={handleChange('mood')}>
				{#each moodPresets as mood}
					<option value={mood.id}>{mood.label}</option>
				{/each}
			</select>
		</div>
		<div class="field half">
			<label for="smile-{id}">Smile</label>
			<select id="smile-{id}" value={data.smile} onchange={handleChange('smile')}>
				{#each smilePresets as smile}
					<option value={smile.id}>{smile.label}</option>
				{/each}
			</select>
		</div>
	</div>

	<div class="row">
		<div class="field half">
			<label for="eye-{id}">Eye Contact</label>
			<select id="eye-{id}" value={data.eyeContact} onchange={handleChange('eyeContact')}>
				{#each eyeContactPresets as eye}
					<option value={eye.id}>{eye.label}</option>
				{/each}
			</select>
		</div>
		<div class="field half">
			<label for="energy-{id}">Energy</label>
			<select id="energy-{id}" value={data.energy} onchange={handleChange('energy')}>
				{#each energyPresets as energy}
					<option value={energy.id}>{energy.label}</option>
				{/each}
			</select>
		</div>
	</div>

	<div class="row">
		<div class="field half">
			<label for="eyebrows-{id}">Eyebrows</label>
			<select id="eyebrows-{id}" value={data.eyebrows} onchange={handleChange('eyebrows')}>
				{#each eyebrowPresets as brow}
					<option value={brow.id}>{brow.label}</option>
				{/each}
			</select>
		</div>
		<div class="field half">
			<label for="mouth-{id}">Mouth</label>
			<select id="mouth-{id}" value={data.mouthPosition} onchange={handleChange('mouthPosition')}>
				{#each mouthPresets as mouth}
					<option value={mouth.id}>{mouth.label}</option>
				{/each}
			</select>
		</div>
	</div>

	<div class="field">
		<label for="head-{id}">Head Position</label>
		<select id="head-{id}" value={data.headPosition} onchange={handleChange('headPosition')}>
			{#each headPositionPresets as head}
				<option value={head.id}>{head.label}</option>
			{/each}
		</select>
	</div>

	<div class="field">
		<label for="custom-{id}">Custom Details</label>
		<textarea
			id="custom-{id}"
			value={data.customPrompt || ''}
			onchange={handleChange('customPrompt')}
			placeholder="Add specific expression details..."
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
