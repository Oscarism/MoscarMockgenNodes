<script lang="ts">
	import BaseNode from './BaseNode.svelte';
	import type { AnimalNodeData } from '$lib/types';
	import {
		animalSpecies,
		dogBreeds,
		catBreeds,
		animalAges,
		animalBehaviors,
		coatColors,
		coatTypes,
		petAccessories
	} from '$lib/data/animals';
	import { updateNodeData } from '$lib/stores/canvas';

	interface Props {
		id: string;
		data: AnimalNodeData;
	}

	let { id, data }: Props = $props();

	// Determine which breeds to show based on species
	let breedOptions = $derived(
		data.species === 'dog' ? dogBreeds : data.species === 'cat' ? catBreeds : []
	);

	function handleChange(field: keyof AnimalNodeData) {
		return (event: Event) => {
			const value = (event.target as HTMLSelectElement | HTMLTextAreaElement).value;
			updateNodeData(id, { [field]: value });
		};
	}
</script>

<BaseNode {id} nodeType="animal">
	<div class="field">
		<label for="species-{id}">Species</label>
		<select id="species-{id}" value={data.species} onchange={handleChange('species')}>
			{#each animalSpecies as species}
				<option value={species.id}>{species.label}</option>
			{/each}
		</select>
	</div>

	{#if breedOptions.length > 0}
		<div class="field">
			<label for="breed-{id}">Breed</label>
			<select id="breed-{id}" value={data.breed || ''} onchange={handleChange('breed')}>
				<option value="">Any breed</option>
				{#each breedOptions as breed}
					<option value={breed.id}>{breed.label}</option>
				{/each}
			</select>
		</div>
	{/if}

	<div class="row">
		<div class="field half">
			<label for="age-{id}">Age</label>
			<select id="age-{id}" value={data.age} onchange={handleChange('age')}>
				{#each animalAges as age}
					<option value={age.id}>{age.label}</option>
				{/each}
			</select>
		</div>
		<div class="field half">
			<label for="behavior-{id}">Behavior</label>
			<select id="behavior-{id}" value={data.behavior} onchange={handleChange('behavior')}>
				{#each animalBehaviors as behavior}
					<option value={behavior.id}>{behavior.label}</option>
				{/each}
			</select>
		</div>
	</div>

	<div class="row">
		<div class="field half">
			<label for="coat-color-{id}">Coat Color</label>
			<select id="coat-color-{id}" value={data.coatColor} onchange={handleChange('coatColor')}>
				{#each coatColors as color}
					<option value={color.id}>{color.label}</option>
				{/each}
			</select>
		</div>
		<div class="field half">
			<label for="coat-type-{id}">Coat Type</label>
			<select id="coat-type-{id}" value={data.coatType} onchange={handleChange('coatType')}>
				{#each coatTypes as type}
					<option value={type.id}>{type.label}</option>
				{/each}
			</select>
		</div>
	</div>

	<div class="field">
		<label for="accessory-{id}">Accessory</label>
		<select id="accessory-{id}" value={data.accessory || ''} onchange={handleChange('accessory')}>
			<option value="">None</option>
			{#each petAccessories as acc}
				<option value={acc.id}>{acc.label}</option>
			{/each}
		</select>
	</div>

	<div class="field">
		<label for="custom-{id}">Custom Details</label>
		<textarea
			id="custom-{id}"
			value={data.customPrompt || ''}
			onchange={handleChange('customPrompt')}
			placeholder="Add specific animal details..."
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
