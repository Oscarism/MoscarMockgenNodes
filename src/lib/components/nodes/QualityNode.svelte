<script lang="ts">
	import BaseNode from './BaseNode.svelte';
	import type { QualityNodeData, AspectRatio, GenerationModel } from '$lib/types';
	import { aspectRatioOptions, qualityOptions } from '$lib/data/presets';
	import { MODEL_REGISTRY, ALL_MODELS, getModelRatios } from '$lib/data/models';
	import { updateNodeData } from '$lib/stores/canvas';

	interface Props {
		id: string;
		data: QualityNodeData;
	}

	let { id, data }: Props = $props();

	const modelOptions = ALL_MODELS.map(m => ({
		value: m,
		label: MODEL_REGISTRY[m].shortLabel,
		description: MODEL_REGISTRY[m].description,
	}));

	// Resolution options for different models
	const resolutionOptions = [
		{ value: '1K', label: '1K', description: 'Standard resolution' },
		{ value: '2K', label: '2K', description: 'High resolution' },
		{ value: '4K', label: '4K', description: 'Ultra high resolution' }
	];

	// Get current selected models array (with fallback for backwards compatibility)
	let selectedModels = $derived(data.models || [data.model] || ['nano-banana-2']);

	// Compute intersection of aspect ratios supported by ALL selected models
	let compatibleRatios = $derived.by(() => {
		if (selectedModels.length === 0) return aspectRatioOptions.map((r) => r.value);

		let intersection = new Set(getModelRatios(selectedModels[0] as GenerationModel));

		for (let i = 1; i < selectedModels.length; i++) {
			const ratioList = getModelRatios(selectedModels[i] as GenerationModel);
			intersection = new Set([...intersection].filter((ratio) => ratioList.includes(ratio)));
		}

		return [...intersection];
	});

	// Filter aspect ratio options to only show compatible ones
	let availableRatios = $derived.by(() => {
		const baseRatios = aspectRatioOptions.filter((r) => compatibleRatios.includes(r.value));

		// Add auto option if compatible
		if (compatibleRatios.includes('auto')) {
			return [
				...baseRatios,
				{ value: 'auto', label: 'Auto', description: 'Match first input image' }
			];
		}

		return baseRatios;
	});

	// Check if current aspect ratio is compatible with all selected models
	let aspectRatioWarning = $derived.by(() => {
		if (!data.aspectRatio) return null;
		if (compatibleRatios.includes(data.aspectRatio)) return null;

		// Find which models don't support the current ratio
		const incompatibleModels = selectedModels.filter((model) => {
			const supported = getModelRatios(model as GenerationModel);
			return !supported.includes(data.aspectRatio);
		});

		if (incompatibleModels.length === 0) return null;

		const modelNames = incompatibleModels
			.map((m) => MODEL_REGISTRY[m as GenerationModel]?.shortLabel || m)
			.join(', ');

		return `⚠️ ${data.aspectRatio} not supported by: ${modelNames}. Select a different ratio or remove incompatible models.`;
	});

	// RESOLUTIONS
	let currentResolutionOptions = $derived(resolutionOptions);

	// Model capability checks (derived from registry)
	let supportsQuality = $derived(
		selectedModels.some((m) => MODEL_REGISTRY[m as GenerationModel]?.supportsQuality)
	);
	let supportsResolution = $derived(
		selectedModels.some((m) => MODEL_REGISTRY[m as GenerationModel]?.supportsResolution)
	);
	let requiresImages = $derived(
		selectedModels.some((m) => MODEL_REGISTRY[m as GenerationModel]?.requiresImage)
	);

	let currentQualityOptions = $derived(qualityOptions);

	function handleRatioChange(event: Event) {
		const aspectRatio = (event.target as HTMLSelectElement).value as AspectRatio;
		updateNodeData(id, { aspectRatio });
	}

	function handleModelToggle(model: GenerationModel) {
		const currentModels = [...selectedModels];
		const index = currentModels.indexOf(model);

		if (index > -1) {
			// Remove if already selected (but keep at least one)
			if (currentModels.length > 1) {
				currentModels.splice(index, 1);
			}
		} else {
			// Add if not selected
			currentModels.push(model);
		}

		updateNodeData(id, {
			models: currentModels,
			model: currentModels[0] // Keep first selected as primary for backwards compat
		});
	}
</script>

<BaseNode {id} nodeType="quality">
	<div class="field">
		<span class="label"
			>Models <span class="selected-count">({selectedModels.length} selected)</span></span
		>
		<div class="model-toggle">
			{#each modelOptions as option}
				<button
					type="button"
					class="model-btn"
					class:active={selectedModels.includes(option.value)}
					onclick={() => handleModelToggle(option.value)}
				>
					{option.label}
				</button>
			{/each}
		</div>
		<span class="hint"> Click multiple models to generate with each </span>
	</div>

	<div class="field">
		<label for="ratio-{id}">Aspect Ratio</label>
		<select id="ratio-{id}" value={data.aspectRatio} onchange={handleRatioChange}>
			{#each availableRatios as ratio}
				<option value={ratio.value}>{ratio.label}</option>
			{/each}
		</select>
		{#if aspectRatioWarning}
			<span class="warning">{aspectRatioWarning}</span>
		{:else}
			<span class="hint">
				{aspectRatioOptions.find((r) => r.value === data.aspectRatio)?.description ||
					(data.aspectRatio === 'auto' ? 'Match first input image' : '')}
			</span>
		{/if}
	</div>

	{#if supportsQuality}
		<div class="field">
			<label for="quality-{id}">Quality</label>
			<div class="quality-toggle">
				{#each currentQualityOptions as option}
					<button
						type="button"
						class="quality-btn"
						class:active={data.quality === option.value}
						onclick={() => updateNodeData(id, { quality: option.value })}
					>
						{option.label}
					</button>
				{/each}
			</div>
			<span class="hint">
				{currentQualityOptions.find((q) => q.value === data.quality)?.description || ''}
			</span>
		</div>
	{/if}

	{#if supportsResolution}
		<div class="field">
			<span class="label">Resolution</span>
			<div class="quality-toggle">
				{#each currentResolutionOptions as option}
					<button
						type="button"
						class="quality-btn"
						class:active={(data as any).resolution === option.value ||
							(!(data as any).resolution && option.value === '1K')}
						onclick={() => updateNodeData(id, { resolution: option.value } as any)}
					>
						{option.label}
					</button>
				{/each}
			</div>
			<span class="hint">
				{currentResolutionOptions.find(
					(r: { value: string }) => r.value === ((data as any).resolution || '1K')
				)?.description || ''}
			</span>
		</div>
	{/if}
</BaseNode>

<style>
	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-tiny);
	}

	.field label,
	.field .label {
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.hint {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		margin-top: 2px;
	}

	.warning {
		font-size: var(--text-xs);
		color: var(--color-error, #ff6b6b);
		margin-top: 2px;
		padding: 4px 6px;
		background-color: rgba(255, 107, 107, 0.1);
		border-radius: var(--radius-sm);
		line-height: 1.3;
	}

	.quality-toggle {
		display: flex;
		gap: var(--space-sm);
	}

	.quality-btn {
		flex: 1;
		padding: var(--space-sm) var(--space-md);
		background-color: var(--color-bg-canvas);
		border: 1px solid var(--color-text-muted);
		border-radius: var(--radius-md);
		color: var(--color-text-primary);
		cursor: pointer;
		transition: all var(--transition-fast);
		font-size: var(--text-sm);
	}

	.quality-btn:hover {
		border-color: var(--color-node-quality);
	}

	.quality-btn.active {
		background-color: var(--color-node-quality);
		border-color: var(--color-node-quality);
		color: var(--color-bg-canvas);
	}

	.model-toggle {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.model-btn {
		flex: 1 0 22%; /* Aim for 4 items per row */
		padding: var(--space-sm) var(--space-sm);
		background-color: var(--color-bg-canvas);
		border: 1px solid var(--color-text-muted);
		border-radius: var(--radius-md);
		color: var(--color-text-primary);
		cursor: pointer;
		transition: all var(--transition-fast);
		font-size: 11px;
		white-space: nowrap;
		text-align: center;
	}

	.model-btn:hover {
		border-color: var(--color-node-quality);
	}

	.model-btn.active {
		background-color: var(--color-node-quality);
		border-color: var(--color-node-quality);
		color: var(--color-bg-canvas);
	}
</style>
