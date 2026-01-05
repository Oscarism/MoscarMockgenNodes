<script lang="ts">
	import BaseNode from './BaseNode.svelte';
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
		<!-- Ethnicity -->
		<div class="field">
			<label for="ethnicity-{id}">Ethnicity</label>
			<select
				id="ethnicity-{id}"
				value={data.ethnicity || ''}
				onchange={(e) => handleChange('ethnicity', (e.target as HTMLSelectElement).value)}
			>
				<option value="">Any</option>
				{#each ethnicities as eth}
					<option value={eth}>{eth}</option>
				{/each}
			</select>
		</div>

		<!-- Age -->
		<div class="field">
			<label for="age-{id}">Age Range</label>
			<select
				id="age-{id}"
				value={data.ageRange || ''}
				onchange={(e) => handleChange('ageRange', (e.target as HTMLSelectElement).value)}
			>
				<option value="">Any</option>
				{#each ageRanges as age}
					<option value={age}>{age}</option>
				{/each}
			</select>
		</div>

		<!-- Body Type -->
		<div class="field">
			<label for="body-{id}">Body Type</label>
			<select
				id="body-{id}"
				value={data.bodyType || ''}
				onchange={(e) => handleChange('bodyType', (e.target as HTMLSelectElement).value)}
			>
				<option value="">Any</option>
				{#each bodyTypes as type}
					<option value={type}>{type}</option>
				{/each}
			</select>
		</div>

		<!-- Pose -->
		<div class="field">
			<label for="pose-{id}">Pose</label>
			<select
				id="pose-{id}"
				value={data.pose || ''}
				onchange={(e) => handleChange('pose', (e.target as HTMLSelectElement).value)}
			>
				<option value="">Any</option>
				{#each poses as pose}
					<option value={pose}>{pose}</option>
				{/each}
			</select>
		</div>

		<!-- Expression -->
		<div class="field">
			<label for="expr-{id}">Expression</label>
			<select
				id="expr-{id}"
				value={data.expression || ''}
				onchange={(e) => handleChange('expression', (e.target as HTMLSelectElement).value)}
			>
				<option value="">Any</option>
				{#each expressions as expr}
					<option value={expr}>{expr}</option>
				{/each}
			</select>
		</div>

		<!-- Hair Style -->
		<div class="field">
			<label for="hairstyle-{id}">Hair Style</label>
			<select
				id="hairstyle-{id}"
				value={data.hairStyle || ''}
				onchange={(e) => handleChange('hairStyle', (e.target as HTMLSelectElement).value)}
			>
				<option value="">Any</option>
				{#each hairStyles as style}
					<option value={style}>{style}</option>
				{/each}
			</select>
		</div>

		<!-- Hair Color -->
		<div class="field">
			<label for="haircolor-{id}">Hair Color</label>
			<select
				id="haircolor-{id}"
				value={data.hairColor || ''}
				onchange={(e) => handleChange('hairColor', (e.target as HTMLSelectElement).value)}
			>
				<option value="">Any</option>
				{#each hairColors as color}
					<option value={color}>{color}</option>
				{/each}
			</select>
		</div>

		<!-- Skin Imperfections -->
		<div class="field">
			<label for="imperfections-{id}">Skin Features</label>
			<select
				id="imperfections-{id}"
				value={data.skinImperfections || ''}
				onchange={(e) => handleChange('skinImperfections', (e.target as HTMLSelectElement).value)}
			>
				<option value="">Any</option>
				{#each skinImperfections as imp}
					<option value={imp}>{imp}</option>
				{/each}
			</select>
		</div>
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

	.field select {
		padding: 4px 6px;
		font-size: 11px;
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
