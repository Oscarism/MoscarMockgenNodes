<script lang="ts">
	import BaseNode from './BaseNode.svelte';
	import NodeField from './NodeField.svelte';
	import type { HumanNodeData } from '$lib/types';
	import {
		bodyTypes,
		poses,
		expressions,
		ethnicities,
		hairStyles,
		hairColors,
		skinTones,
		skinImperfections,
		ageRanges
	} from '$lib/data/human';
	import { updateNodeData } from '$lib/stores/canvas';

	interface Props {
		id: string;
		data: HumanNodeData;
	}

	let { id, data }: Props = $props();

	function handleChange(field: string, value: string) {
		updateNodeData(id, { [field]: value });
	}

	function handleGenderChange(gender: 'male' | 'female' | '') {
		updateNodeData(id, { gender });
	}
</script>

<BaseNode {id} nodeType="human">
	<!-- Gender Toggle -->
	<div class="gender-toggle">
		<button class="gender-btn" class:active={!data.gender} onclick={() => handleGenderChange('')}>
			Any
		</button>
		<button
			class="gender-btn"
			class:active={data.gender === 'female'}
			onclick={() => handleGenderChange('female')}
		>
			♀ Female
		</button>
		<button
			class="gender-btn"
			class:active={data.gender === 'male'}
			onclick={() => handleGenderChange('male')}
		>
			♂ Male
		</button>
	</div>

	<div class="fields-grid">
		<NodeField {id} label="Ethnicity" field="ethnicity" value={data.ethnicity || ''} options={ethnicities} onchange={handleChange} />
		<NodeField {id} label="Age Range" field="ageRange" value={data.ageRange || ''} options={ageRanges} onchange={handleChange} />
		<NodeField {id} label="Body Type" field="bodyType" value={data.bodyType || ''} options={bodyTypes} onchange={handleChange} />
		<NodeField {id} label="Pose" field="pose" value={data.pose || ''} options={poses} onchange={handleChange} />
		<NodeField {id} label="Expression" field="expression" value={data.expression || ''} options={expressions} onchange={handleChange} />
		<NodeField {id} label="Hair Style" field="hairStyle" value={data.hairStyle || ''} options={hairStyles} onchange={handleChange} />
		<NodeField {id} label="Hair Color" field="hairColor" value={data.hairColor || ''} options={hairColors} onchange={handleChange} />
		<NodeField {id} label="Skin Features" field="skinImperfections" value={data.skinImperfections || ''} options={skinImperfections} onchange={handleChange} />
	</div>

	<!-- Skin Tone Swatches -->
	<div class="field skin-field">
		<label>Skin Tone</label>
		<div class="skin-swatches">
			<button
				class="skin-swatch any-swatch"
				class:active={!data.skinTone}
				onclick={() => handleChange('skinTone', '')}
				title="Any"
				aria-label="Any skin tone">?</button
			>
			{#each skinTones as tone}
				<button
					class="skin-swatch"
					class:active={data.skinTone === tone.id}
					style="background-color: {tone.hex}"
					onclick={() => handleChange('skinTone', tone.id)}
					title={tone.label}
					aria-label={tone.label}
				></button>
			{/each}
		</div>
	</div>

	<!-- Custom Description -->
	<div class="field">
		<label for="custom-{id}">Custom Details</label>
		<textarea
			id="custom-{id}"
			class="nodrag"
			value={data.customPrompt || ''}
			oninput={(e) => handleChange('customPrompt', (e.target as HTMLTextAreaElement).value)}
			placeholder="Add custom details..."
			rows={2}
		></textarea>
	</div>
</BaseNode>

<style>
	.gender-toggle {
		display: flex;
		gap: var(--space-sm);
		margin-bottom: var(--space-sm);
	}

	.gender-btn {
		flex: 1;
		padding: var(--space-sm);
		background-color: var(--color-bg-canvas);
		border: 1px solid var(--color-text-muted);
		border-radius: var(--radius-sm);
		color: var(--color-text-secondary);
		cursor: pointer;
		font-size: var(--text-sm);
		transition: all var(--transition-fast);
	}

	.gender-btn:hover {
		border-color: var(--color-node-human);
	}

	.gender-btn.active {
		background-color: var(--color-node-human);
		color: var(--color-bg-canvas);
		border-color: var(--color-node-human);
	}

	.fields-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-sm);
		margin-bottom: var(--space-sm);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.field label {
		font-size: 10px;
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.field textarea {
		resize: vertical;
		min-height: 32px;
		font-size: 11px;
	}

	.skin-field {
		margin-bottom: var(--space-sm);
	}

	.skin-swatches {
		display: flex;
		gap: 4px;
		flex-wrap: wrap;
	}

	.skin-swatch {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		border: 2px solid transparent;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.skin-swatch:hover {
		transform: scale(1.1);
	}

	.skin-swatch.active {
		border-color: var(--color-node-human);
		box-shadow: 0 0 0 2px var(--color-bg-ui);
	}

	.any-swatch {
		background-color: var(--color-bg-canvas);
		border: 2px dashed var(--color-text-muted);
		font-size: 12px;
		font-weight: bold;
		color: var(--color-text-muted);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.any-swatch.active {
		border-style: solid;
		border-color: var(--color-node-human);
		color: var(--color-node-human);
	}
</style>
