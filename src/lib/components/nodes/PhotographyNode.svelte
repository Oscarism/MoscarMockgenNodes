<script lang="ts">
	import BaseNode from './BaseNode.svelte';
	import type { PhotographyNodeData } from '$lib/types';
	import { updateNodeData } from '$lib/stores/canvas';
	import {
		PHOTOGRAPHY_PRESETS,
		PRESET_LABELS,
		type PhotographyPreset
	} from '$lib/stores/generationMode';

	interface Props {
		id: string;
		data: PhotographyNodeData;
	}

	let { id, data }: Props = $props();

	// Available presets
	const presets: PhotographyPreset[] = [
		'none',
		'portrait',
		'landscape',
		'macro',
		'street',
		'fashion',
		'food',
		'architecture',
		'wildlife'
	];

	function handlePresetChange(event: Event) {
		const preset = (event.target as HTMLSelectElement).value as PhotographyPreset;
		updateNodeData(id, { preset });
	}

	function handleAutoEnhanceToggle() {
		updateNodeData(id, { autoEnhance: !data.autoEnhance });
	}

	function handleCustomPromptChange(event: Event) {
		const customPrompt = (event.target as HTMLTextAreaElement).value;
		updateNodeData(id, { customPrompt });
	}

	// Get the current preset's prompt additions for preview
	let presetKey = $derived((data.preset || 'none') as PhotographyPreset);
	let presetInfo = $derived(PHOTOGRAPHY_PRESETS[presetKey]);
	let previewText = $derived(() => {
		if (!data.autoEnhance) return 'No automatic additions';
		const parts = [];
		if (presetInfo.prefix.length > 0) parts.push(presetInfo.prefix.join(', '));
		if (presetInfo.suffix.length > 0) parts.push(presetInfo.suffix.join(', '));
		return parts.join(' ... ') || 'General photography';
	});
</script>

<BaseNode {id} nodeType="photography">
	<div class="field">
		<label for="preset-{id}">Photography Style</label>
		<select id="preset-{id}" value={data.preset || 'none'} onchange={handlePresetChange}>
			{#each presets as preset}
				<option value={preset}>{PRESET_LABELS[preset]}</option>
			{/each}
		</select>
	</div>

	<label class="toggle-row">
		<input
			type="checkbox"
			checked={data.autoEnhance !== false}
			onchange={handleAutoEnhanceToggle}
		/>
		<span>Auto-enhance prompt</span>
	</label>

	<div class="field">
		<label for="custom-{id}">Additional Details</label>
		<textarea
			id="custom-{id}"
			placeholder="Add custom photography details..."
			value={data.customPrompt || ''}
			onchange={handleCustomPromptChange}
			rows="2"
		></textarea>
	</div>

	<div class="preview">
		<span class="preview-label">Adds:</span>
		<span class="preview-value">{previewText()}</span>
	</div>
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

	.field select,
	.field textarea {
		padding: var(--space-sm);
		background-color: var(--color-bg-canvas);
		border: 1px solid var(--color-text-muted);
		border-radius: var(--radius-sm);
		color: var(--color-text-primary);
		font-size: var(--text-sm);
	}

	.field textarea {
		resize: vertical;
		min-height: 50px;
	}

	.toggle-row {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		cursor: pointer;
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
	}

	.toggle-row input[type='checkbox'] {
		width: 14px;
		height: 14px;
		accent-color: var(--color-node-camera);
	}

	.preview {
		padding: var(--space-sm);
		background-color: var(--color-bg-canvas);
		border-radius: var(--radius-sm);
		font-size: var(--text-xs);
		max-height: 60px;
		overflow-y: auto;
	}

	.preview-label {
		color: var(--color-text-muted);
	}

	.preview-value {
		color: var(--color-text-secondary);
		font-style: italic;
	}
</style>
