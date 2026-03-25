<script lang="ts">
	import BaseNode from './BaseNode.svelte';
	import NodeField from './NodeField.svelte';
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

	function handleChange(field: string, value: string) {
		updateNodeData(id, { [field]: value });
	}
</script>

<BaseNode {id} nodeType="branding">
	<div class="field">
		<label for="text-{id}">Brand Text / Logo</label>
		<input
			type="text"
			id="text-{id}"
			value={data.text}
			oninput={(e) => handleChange('text', (e.target as HTMLInputElement).value)}
			placeholder="Enter brand name or text..."
		/>
	</div>

	<NodeField {id} label="Placement" field="placement" value={data.placement} options={placements} showAny={false} onchange={handleChange} />
	<NodeField {id} label="Font Style" field="fontStyle" value={data.fontStyle} options={fontStyles} showAny={false} onchange={handleChange} />

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
