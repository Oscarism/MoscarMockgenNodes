<script lang="ts">
	import BaseNode from './BaseNode.svelte';
	import type { BrandingNodeData } from '$lib/types';
	import { updateNodeData } from '$lib/stores/canvas';

	interface Props {
		id: string;
		data: BrandingNodeData;
	}

	let { id, data }: Props = $props();

	const placements = [
		{ id: 'center', label: 'Center' },
		{ id: 'corner', label: 'Corner' },
		{ id: 'full-coverage', label: 'Full Coverage' },
		{ id: 'custom', label: 'Custom' }
	];

	const fontStyles = [
		{ id: 'bold', label: 'Bold' },
		{ id: 'minimal', label: 'Minimal' },
		{ id: 'decorative', label: 'Decorative' },
		{ id: 'modern', label: 'Modern' }
	];

	function handleTextChange(event: Event) {
		const text = (event.target as HTMLInputElement).value;
		updateNodeData(id, { text });
	}

	function handlePlacementChange(event: Event) {
		const placement = (event.target as HTMLSelectElement).value as BrandingNodeData['placement'];
		updateNodeData(id, { placement });
	}

	function handleFontStyleChange(event: Event) {
		const fontStyle = (event.target as HTMLSelectElement).value as BrandingNodeData['fontStyle'];
		updateNodeData(id, { fontStyle });
	}
</script>

<BaseNode {id} nodeType="branding">
	<div class="field">
		<label for="text-{id}">Brand Text / Logo</label>
		<input
			type="text"
			id="text-{id}"
			value={data.text}
			oninput={handleTextChange}
			placeholder="Enter brand name or text..."
		/>
	</div>

	<div class="field">
		<label for="placement-{id}">Placement</label>
		<select id="placement-{id}" value={data.placement} onchange={handlePlacementChange}>
			{#each placements as placement}
				<option value={placement.id}>{placement.label}</option>
			{/each}
		</select>
	</div>

	<div class="field">
		<label for="font-{id}">Font Style</label>
		<select id="font-{id}" value={data.fontStyle} onchange={handleFontStyleChange}>
			{#each fontStyles as style}
				<option value={style.id}>{style.label}</option>
			{/each}
		</select>
	</div>

	{#if data.text}
		<div class="preview">
			<span class="preview-text">"{data.text}"</span>
		</div>
	{/if}
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

	.preview {
		margin-top: var(--space-sm);
		padding: var(--space-sm);
		background-color: var(--color-bg-canvas);
		border-radius: var(--radius-sm);
		text-align: center;
	}

	.preview-text {
		color: var(--color-node-branding);
		font-weight: var(--font-medium);
		font-style: italic;
	}
</style>
