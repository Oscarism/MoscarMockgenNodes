<script lang="ts">
	import BaseNode from './BaseNode.svelte';
	import NodeField from './NodeField.svelte';
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

	function handleChange(field: string, value: string) {
		updateNodeData(id, { [field]: value });
	}
</script>

<BaseNode {id} nodeType="animal">
	<NodeField {id} label="Species" field="species" value={data.species} options={animalSpecies} showAny={false} onchange={handleChange} />

	{#if breedOptions.length > 0}
		<NodeField {id} label="Breed" field="breed" value={data.breed || ''} options={breedOptions} anyLabel="Any breed" onchange={handleChange} />
	{/if}

	<div class="row">
		<NodeField {id} label="Age" field="age" value={data.age} options={animalAges} showAny={false} onchange={handleChange} />
		<NodeField {id} label="Behavior" field="behavior" value={data.behavior} options={animalBehaviors} showAny={false} onchange={handleChange} />
	</div>

	<div class="row">
		<NodeField {id} label="Coat Color" field="coatColor" value={data.coatColor} options={coatColors} showAny={false} onchange={handleChange} />
		<NodeField {id} label="Coat Type" field="coatType" value={data.coatType} options={coatTypes} showAny={false} onchange={handleChange} />
	</div>

	<NodeField {id} label="Accessory" field="accessory" value={data.accessory || ''} options={petAccessories} anyLabel="None" onchange={handleChange} />

	<div class="field">
		<label for="custom-{id}">Custom Details</label>
		<textarea
			id="custom-{id}"
			value={data.customPrompt || ''}
			oninput={(e) => handleChange('customPrompt', (e.target as HTMLTextAreaElement).value)}
			placeholder="Add specific animal details..."
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
