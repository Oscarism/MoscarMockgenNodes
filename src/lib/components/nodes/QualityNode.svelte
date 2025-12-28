<script lang="ts">
	import BaseNode from './BaseNode.svelte';
	import type { QualityNodeData, AspectRatio, GenerationModel } from '$lib/types';
	import { aspectRatioOptions, qualityOptions } from '$lib/data/presets';
	import { updateNodeData } from '$lib/stores/canvas';

	interface Props {
		id: string;
		data: QualityNodeData;
	}

	let { id, data }: Props = $props();

	const modelOptions: { value: GenerationModel; label: string; description: string }[] = [
		{
			value: 'seedream/4.5-text-to-image',
			label: 'Seedream',
			description: 'Text-to-image, 2K/4K'
		},
		{ value: 'seedream/4.5-edit', label: 'Edit', description: 'Image editing' },
		{ value: 'z-image', label: 'Z-Image', description: 'Realistic portraits' },
		{ value: 'flux-2/pro-text-to-image', label: 'Flux Pro', description: 'Pro text-to-image' },
		{ value: 'flux-2/pro-image-to-image', label: 'Flux I2I', description: 'Pro image editing' },
		{ value: 'flux-2/flex-text-to-image', label: 'Flex', description: 'Flex text-to-image' },
		{ value: 'flux-2/flex-image-to-image', label: 'Flex I2I', description: 'Flex image editing' },
		{ value: 'nano-banana-pro', label: 'Nano B.', description: 'Versatile T2I/I2I with 4K' }
	];

	// Model-specific aspect ratio restrictions
	const zImageRatios = ['1:1', '4:3', '3:4', '16:9', '9:16'];
	const fluxRatios = ['1:1', '4:3', '3:4', '16:9', '9:16', '3:2', '2:3', 'auto'];
	const nanoBananaRatios = [
		'1:1',
		'4:3',
		'3:4',
		'16:9',
		'9:16',
		'3:2',
		'2:3',
		'21:9',
		'4:5',
		'5:4',
		'auto'
	];

	// Resolution options for different models
	const resolutionOptions = [
		{ value: '1K', label: '1K', description: 'Standard resolution' },
		{ value: '2K', label: '2K', description: 'High resolution' },
		{ value: '4K', label: '4K', description: 'Ultra high resolution' }
	];

	// Filter aspect ratios based on model
	let availableRatios = $derived(() => {
		if (data.model === 'z-image') {
			return aspectRatioOptions.filter((r) => zImageRatios.includes(r.value));
		}
		if (data.model?.startsWith('flux-2/')) {
			// Flux supports auto ratio
			return [
				...aspectRatioOptions.filter((r) => fluxRatios.includes(r.value)),
				{ value: 'auto', label: 'Auto', description: 'Match first input image' }
			];
		}
		if (data.model === 'nano-banana-pro') {
			// Nano Banana supports more ratios
			return [
				...aspectRatioOptions.filter((r) => nanoBananaRatios.includes(r.value)),
				{ value: 'auto', label: 'Auto', description: 'Match first input image' }
			];
		}
		return aspectRatioOptions;
	});

	// RESOLUTIONS
	let currentResolutionOptions = $derived(() => {
		if (data.model === 'nano-banana-pro') {
			return resolutionOptions;
		}
		// Flux only supports 1K/2K
		return resolutionOptions.filter((r) => r.value !== '4K');
	});

	// Model capability checks
	let isFluxModel = $derived(data.model?.startsWith('flux-2/'));
	let isNanoBanana = $derived(data.model === 'nano-banana-pro');
	let supportsQuality = $derived(!isFluxModel && !isNanoBanana && data.model !== 'z-image');
	let supportsResolution = $derived(isFluxModel || isNanoBanana);

	let requiresImages = $derived(
		data.model === 'seedream/4.5-edit' || data.model === 'flux-2/pro-image-to-image'
	);

	function handleRatioChange(event: Event) {
		const aspectRatio = (event.target as HTMLSelectElement).value as AspectRatio;
		updateNodeData(id, { aspectRatio });
	}

	function handleModelChange(model: GenerationModel) {
		const updates: Partial<QualityNodeData> = { model };

		// Reset aspect ratio if not supported by new model
		if (model === 'z-image' && !zImageRatios.includes(data.aspectRatio)) {
			updates.aspectRatio = '1:1';
		}

		updateNodeData(id, updates);
	}
</script>

<BaseNode {id} nodeType="quality">
	<div class="field">
		<span class="label">Model</span>
		<div class="model-toggle">
			{#each modelOptions as option}
				<button
					type="button"
					class="model-btn"
					class:active={data.model === option.value}
					onclick={() => handleModelChange(option.value)}
				>
					{option.label}
				</button>
			{/each}
		</div>
		<span class="hint">
			{modelOptions.find((m) => m.value === data.model)?.description || ''}
		</span>
	</div>

	<div class="field">
		<label for="ratio-{id}">Aspect Ratio</label>
		<select id="ratio-{id}" value={data.aspectRatio} onchange={handleRatioChange}>
			{#each availableRatios() as ratio}
				<option value={ratio.value}>{ratio.label}</option>
			{/each}
		</select>
		<span class="hint">
			{aspectRatioOptions.find((r) => r.value === data.aspectRatio)?.description ||
				(data.aspectRatio === 'auto' ? 'Match first input image' : '')}
		</span>
	</div>

	{#if supportsQuality}
		<div class="field">
			<label for="quality-{id}">Quality</label>
			<div class="quality-toggle">
				{#each qualityOptions as option}
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
				{qualityOptions.find((q) => q.value === data.quality)?.description || ''}
			</span>
		</div>
	{/if}

	{#if supportsResolution}
		<div class="field">
			<span class="label">Resolution</span>
			<div class="quality-toggle">
				{#each currentResolutionOptions() as option}
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
				{currentResolutionOptions().find((r) => r.value === ((data as any).resolution || '1K'))
					?.description || ''}
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
