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
		{ value: 'seedream/5-lite-text-to-image', label: 'SD5 T2I', description: 'Seedream 5 Lite T2I' },
		{ value: 'seedream/5-lite-image-to-image', label: 'SD5 I2I', description: 'Seedream 5 Lite I2I' },
		{ value: 'z-image', label: 'Z-Image', description: 'Realistic portraits' },
		{ value: 'flux-2/pro-image-to-image', label: 'Flux I2I', description: 'Pro image editing' },
		{ value: 'nano-banana-pro', label: 'Nano B.', description: 'Versatile T2I/I2I with 4K' },
		{ value: 'nano-banana-2', label: 'Nano B2', description: 'Nano Banana 2 — 20K prompt, exotic ratios' },
		{ value: 'grok-imagine/image-to-image', label: 'Grok I2I', description: 'Grok image-to-image, 390K prompt' },
		{ value: 'gpt-image/1.5-image-to-image', label: 'GPT I2I', description: 'GPT-Image 1.5 image editing' },
		{ value: 'qwen2/text-to-image', label: 'Qwen T2I', description: 'Qwen2 text-to-image, 800 char prompt' },
		{ value: 'qwen2/image-edit', label: 'Qwen Edit', description: 'Qwen2 image editing' }
	];

	// Quality options for GPT-Image models (uses medium/high instead of basic/high)
	const gptImageQualityOptions = [
		{ id: 'medium', label: 'Medium', value: 'medium' as const, description: 'Balanced quality, faster' },
		{ id: 'high', label: 'High', value: 'high' as const, description: 'Slow, maximum detail' }
	];

	// Comprehensive model-to-aspect-ratio mapping
	const modelRatios: Record<GenerationModel, string[]> = {
		'seedream/4.5-text-to-image': ['1:1', '4:3', '3:4', '16:9', '9:16', '2:3', '3:2', '21:9'],
		'seedream/4.5-edit': ['1:1', '4:3', '3:4', '16:9', '9:16', '2:3', '3:2', '21:9'],
		'seedream/5-lite-text-to-image': ['1:1', '4:3', '3:4', '16:9', '9:16', '2:3', '3:2', '21:9'],
		'seedream/5-lite-image-to-image': ['1:1', '4:3', '3:4', '16:9', '9:16', '2:3', '3:2', '21:9'],
		'z-image': ['1:1', '4:3', '3:4', '16:9', '9:16'],
		'flux-2/pro-image-to-image': ['1:1', '4:3', '3:4', '16:9', '9:16', '3:2', '2:3', 'auto'],
		'nano-banana-pro': [
			'1:1', '4:3', '3:4', '16:9', '9:16', '3:2', '2:3', '21:9', '4:5', '5:4', 'auto'
		],
		'nano-banana-2': [
			'1:1', '4:3', '3:4', '16:9', '9:16', '2:3', '3:2', '21:9',
			'4:5', '5:4', '1:4', '1:8', '4:1', '8:1', 'auto'
		],
		// Grok ignores aspect_ratio — map to all standard ratios so it doesn't collapse
		// the intersection when combined with other models. Server never sends aspect_ratio for it.
		'grok-imagine/image-to-image': ['1:1', '4:3', '3:4', '16:9', '9:16', '2:3', '3:2', '21:9', 'auto'],
		// GPT-Image only supports 3 ratios
		'gpt-image/1.5-image-to-image': ['1:1', '2:3', '3:2'],
		// Qwen2 models use image_size instead of aspect_ratio (handled server-side)
		'qwen2/text-to-image': ['1:1', '3:4', '4:3', '9:16', '16:9'],
		'qwen2/image-edit': ['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9']
	};

	// Legacy individual arrays for backwards compatibility
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

	// Get current selected models array (with fallback for backwards compatibility)
	let selectedModels = $derived(data.models || [data.model] || ['seedream/4.5-text-to-image']);

	// Compute intersection of aspect ratios supported by ALL selected models
	let compatibleRatios = $derived.by(() => {
		if (selectedModels.length === 0) return aspectRatioOptions.map((r) => r.value);

		// Get ratios supported by the first model
		let intersection = new Set(modelRatios[selectedModels[0] as GenerationModel] || []);

		// Intersect with each subsequent model's supported ratios
		for (let i = 1; i < selectedModels.length; i++) {
			const modelRatioList = modelRatios[selectedModels[i] as GenerationModel] || [];
			intersection = new Set([...intersection].filter((ratio) => modelRatioList.includes(ratio)));
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
			const supported = modelRatios[model as GenerationModel] || [];
			return !supported.includes(data.aspectRatio);
		});

		if (incompatibleModels.length === 0) return null;

		const modelNames = incompatibleModels
			.map((m) => {
				const option = modelOptions.find((o) => o.value === m);
				return option?.label || m;
			})
			.join(', ');

		return `⚠️ ${data.aspectRatio} not supported by: ${modelNames}. Select a different ratio or remove incompatible models.`;
	});

	// RESOLUTIONS
	let currentResolutionOptions = $derived.by(() => {
		const anyNanoBanana = selectedModels.includes('nano-banana-pro');
		if (anyNanoBanana) {
			return resolutionOptions;
		}
		// Flux only supports 1K/2K
		return resolutionOptions.filter((r) => r.value !== '4K');
	});

	// Model capability checks (based on any selected model)
	let isFluxModel = $derived(selectedModels.some((m) => m?.startsWith('flux-2/')));
	let isNanoBanana = $derived(selectedModels.includes('nano-banana-pro') || selectedModels.includes('nano-banana-2'));
	let supportsQuality = $derived(
		selectedModels.some((m) =>
			m === 'seedream/4.5-text-to-image' ||
			m === 'seedream/4.5-edit' ||
			m === 'seedream/5-lite-text-to-image' ||
			m === 'seedream/5-lite-image-to-image'
		)
	);
	let supportsResolution = $derived(isFluxModel || isNanoBanana);

	let requiresImages = $derived(
		selectedModels.includes('seedream/4.5-edit') ||
			selectedModels.includes('seedream/5-lite-image-to-image') ||
			selectedModels.includes('flux-2/pro-image-to-image') ||
			selectedModels.includes('grok-imagine/image-to-image') ||
			selectedModels.includes('gpt-image/1.5-image-to-image') ||
			selectedModels.includes('qwen2/image-edit')
	);

	// GPT-Image uses medium/high quality instead of basic/high.
	// Show the right buttons based on what models are selected.
	let isGptImageOnly = $derived(
		selectedModels.length === 1 && selectedModels[0] === 'gpt-image/1.5-image-to-image'
	);
	let currentQualityOptions = $derived(isGptImageOnly ? gptImageQualityOptions : qualityOptions);

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

		// Reset aspect ratio if z-image is selected and current ratio not supported
		let updates: Partial<QualityNodeData> = {
			models: currentModels,
			model: currentModels[0] // Keep first selected as primary for backwards compat
		};

		if (currentModels.includes('z-image') && !zImageRatios.includes(data.aspectRatio)) {
			updates.aspectRatio = '1:1';
		}

		updateNodeData(id, updates);
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
