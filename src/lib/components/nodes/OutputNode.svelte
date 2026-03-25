<script lang="ts">
	import BaseNode from './BaseNode.svelte';
	import type { OutputNodeData, GenerationModel } from '$lib/types';
	import { nodes, edges, updateNodeData } from '$lib/stores/canvas';
	import {
		generationState,
		startMultiModelBatchGeneration,
		startBatchGeneration
	} from '$lib/stores/generation';
	import { promptOptimizer } from '$lib/stores/promptOptimizer';
	import { uploadImageToHost } from '$lib/services/imageHost';
	import { toasts } from '$lib/stores/toasts';
	import {
		compilePrompt,
		getQualitySettings,
		getUploadedImageUrls,
		getBatchImages
	} from '$lib/utils/promptCompiler';
	import {
		getModelLabel,
		MODELS_SUPPORTING_IMAGES,
		MODELS_REQUIRING_IMAGES,
		modelSupportsImages
	} from '$lib/data/models';

	interface Props {
		id: string;
		data: OutputNodeData;
	}

	let { id, data }: Props = $props();

	let compiled = $derived(compilePrompt($nodes, $edges));
	let qualitySettings = $derived(getQualitySettings($nodes, $edges));
	let imageUrls = $derived(getUploadedImageUrls($nodes, $edges));
	let isGenerating = $derived($generationState.isGenerating);

	let optimizer = $derived($promptOptimizer);
	let hasEnhancement = $derived(optimizer.optimizedPrompt !== null && !optimizer.isStale);
	let isStale = $derived(optimizer.isStale);
	let isOptimizing = $derived(optimizer.isOptimizing);

	let batchImages = $derived(getBatchImages($nodes, $edges));
	let hasBatchImages = $derived(batchImages.length > 0);
	let isProcessingBatch = $state(false);
	let errorDismissed = $state(false);

	let selectedModels = $derived(qualitySettings.models || [qualitySettings.model]);
	let unsupportedModels = $derived(
		hasBatchImages ? selectedModels.filter((m) => !modelSupportsImages(m)) : []
	);
	let hasUnsupportedModel = $derived(unsupportedModels.length > 0 && hasBatchImages);
	let supportedModelsForBatch = $derived(
		selectedModels.filter((m) => modelSupportsImages(m))
	);

	const batchOptions = [1, 2, 3, 4, 6, 8];

	function handleBatchChange(event: Event) {
		const batchCount = parseInt((event.target as HTMLSelectElement).value);
		updateNodeData(id, { batchCount });
	}

	async function handleEnhance() {
		if (isOptimizing || !compiled.prompt) return;
		const models = qualitySettings.models || [qualitySettings.model];
		await promptOptimizer.optimize(compiled.prompt, models as GenerationModel[]);
	}

	$effect(() => {
		if ($generationState.isGenerating) errorDismissed = false;
	});

	async function handleGenerate() {
		if (isGenerating || !compiled.prompt) return;
		errorDismissed = false;

		const imageModelsSelected = selectedModels.filter((m) => MODELS_REQUIRING_IMAGES.includes(m as GenerationModel));
		if (imageModelsSelected.length > 0 && imageUrls.length === 0) {
			toasts.error(
				`${imageModelsSelected.map(getModelLabel).join(', ')} require an uploaded image.`
			);
			return;
		}

		const promptToUse =
			hasEnhancement && optimizer.useEnhanced ? optimizer.optimizedPrompt : compiled.prompt;

		await startMultiModelBatchGeneration(
			promptToUse!,
			qualitySettings.aspectRatio as any,
			qualitySettings.quality,
			data.batchCount || 1,
			selectedModels as GenerationModel[],
			imageUrls,
			qualitySettings.resolution
		);
	}

	async function handleProcessBatch() {
		if (isProcessingBatch || !compiled.prompt || batchImages.length === 0) return;
		if (supportedModelsForBatch.length === 0) {
			toasts.error('No selected models support image-to-image.');
			return;
		}

		isProcessingBatch = true;
		const toastId = toasts.progress(`Starting batch...`, 0, batchImages.length);
		const promptToUse =
			hasEnhancement && optimizer.useEnhanced ? optimizer.optimizedPrompt : compiled.prompt;

		try {
			for (let i = 0; i < batchImages.length; i++) {
				toasts.updateProgress(toastId, i + 1, batchImages.length, `Processing ${i + 1} of ${batchImages.length}...`);
				const img = batchImages[i];
				try {
					let hostedUrl = img.hostedUrl;
					if (!hostedUrl && img.file) hostedUrl = await uploadImageToHost(img.file);
					if (!hostedUrl) continue;
					for (const model of supportedModelsForBatch) {
						await startBatchGeneration(
							promptToUse!, qualitySettings.aspectRatio as any,
							qualitySettings.quality, 1,
							model as GenerationModel, [hostedUrl], qualitySettings.resolution
						);
					}
				} catch (e) {
					console.error(`Batch item ${i} failed:`, e);
				}
			}
			toasts.remove(toastId);
			toasts.success(`Batch complete — ${batchImages.length} images processed.`);
		} catch (e) {
			toasts.remove(toastId);
			toasts.error(`Batch failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
		} finally {
			isProcessingBatch = false;
		}
	}
</script>

<BaseNode {id} nodeType="output" showOutput={false}>

	<!-- Models -->
	<div class="field">
		<span class="label">Models</span>
		<div class="value-list">
			{#each selectedModels as m}
				<span class="value-item model-value">{getModelLabel(m)}</span>
			{/each}
		</div>
	</div>

	<!-- Settings summary -->
	<div class="field">
		<span class="label">Settings</span>
		<div class="value-list">
			<span class="value-item">{qualitySettings.aspectRatio}</span>
			{#if qualitySettings.model === 'nano-banana-2'}
				<span class="value-item">{qualitySettings.resolution}</span>
			{:else if qualitySettings.model?.startsWith('seedream/5-lite')}
				<span class="value-item">{qualitySettings.quality === 'high' ? '4K' : '2K'}</span>
			{/if}
			{#if imageUrls.length > 0}
				<span class="value-item img-value">{imageUrls.length} image{imageUrls.length > 1 ? 's' : ''} attached</span>
			{/if}
		</div>
	</div>

	<!-- Batch -->
	<div class="field">
		<label for="batch-{id}" class="label">Batch count</label>
		<select id="batch-{id}" value={data.batchCount || 1} onchange={handleBatchChange}>
			{#each batchOptions as count}
				<option value={count}>{count}</option>
			{/each}
		</select>
		<span class="hint">Images to generate per model</span>
	</div>

	<!-- Warnings -->
	{#if compiled.warnings.length > 0}
		{#each compiled.warnings as w}
			<div class="warning-item">{w}</div>
		{/each}
	{/if}

	{#if hasUnsupportedModel}
		<div class="warning-item">
			{unsupportedModels.map(getModelLabel).join(', ')} {unsupportedModels.length > 1 ? 'do' : 'does'} not support image-to-image
		</div>
	{/if}

	<!-- Enhance -->
	<div class="field">
		<span class="label">AI Enhancement</span>

		{#if isOptimizing}
			<button class="action-btn" disabled>
				<span class="spinner"></span>
				Enhancing...
			</button>
		{:else if hasEnhancement}
			<div class="enhance-status">
				<span class="hint">Enhancement ready</span>
				<button
					class="toggle-btn"
					class:active={optimizer.useEnhanced}
					onclick={() => optimizer.useEnhanced ? promptOptimizer.useOriginal() : promptOptimizer.useOptimized()}
				>
					{optimizer.useEnhanced ? 'Using enhanced prompt' : 'Using original prompt'}
				</button>
			</div>
			<button
				class="action-btn"
				onclick={handleEnhance}
				disabled={isOptimizing || isGenerating || !compiled.prompt}
			>
				Re-enhance
			</button>
		{:else if isStale}
			<div class="warning-item">Nodes changed — enhancement is outdated</div>
			<button
				class="action-btn"
				onclick={handleEnhance}
				disabled={isOptimizing || isGenerating || !compiled.prompt}
			>
				Re-enhance
			</button>
		{:else}
			<button
				class="action-btn"
				onclick={handleEnhance}
				disabled={isOptimizing || isGenerating || !compiled.prompt}
			>
				Enhance Prompt
			</button>
		{/if}
	</div>

	<!-- Generate -->
	<button
		class="generate-btn"
		class:using-enhanced={hasEnhancement && optimizer.useEnhanced}
		onclick={handleGenerate}
		disabled={isGenerating || !compiled.prompt}
	>
		{#if isGenerating}
			<span class="spinner"></span>
			Generating...
		{:else if hasEnhancement && optimizer.useEnhanced}
			Generate with Enhanced
		{:else}
			Generate
		{/if}
	</button>

	<!-- Batch processor -->
	{#if hasBatchImages}
		<div class="field">
			<div class="batch-header">
				<span class="label">Batch Queue</span>
				<span class="hint">{batchImages.length} images</span>
			</div>
			<button
				class="action-btn"
				onclick={handleProcessBatch}
				disabled={isProcessingBatch || isGenerating || !compiled.prompt || supportedModelsForBatch.length === 0}
			>
				{#if isProcessingBatch}
					<span class="spinner"></span>
					Processing...
				{:else if supportedModelsForBatch.length === 0}
					No compatible model selected
				{:else}
					Process Batch ({batchImages.length})
				{/if}
			</button>
		</div>
	{/if}

	<!-- Error -->
	{#if $generationState.error && !errorDismissed}
		<div class="error-panel">
			<span class="error-text">{$generationState.error}</span>
			<button class="error-dismiss" onclick={() => (errorDismissed = true)}>Dismiss</button>
		</div>
	{/if}

</BaseNode>

<style>
	.label {
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.hint {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-tiny);
	}

	/* Value display rows */
	.value-list {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.value-item {
		font-size: var(--text-sm);
		color: var(--color-text-primary);
		padding: var(--space-sm);
		background-color: var(--color-bg-canvas);
		border-radius: var(--radius-sm);
	}

	.model-value {
		color: var(--color-node-quality);
		font-weight: var(--font-medium);
	}

	.img-value {
		color: var(--color-node-image);
	}

	/* Batch header */
	.batch-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	/* Select */
	select {
		padding: var(--space-sm);
		background-color: var(--color-bg-canvas);
		border: 1px solid var(--color-text-muted);
		border-radius: var(--radius-sm);
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		cursor: pointer;
	}

	/* Warnings */
	.warning-item {
		font-size: var(--text-xs);
		color: var(--color-warning);
		padding: var(--space-tiny) var(--space-sm);
		background-color: rgba(254, 194, 110, 0.1);
		border-radius: var(--radius-sm);
		line-height: 1.4;
	}

	/* Enhancement status */
	.enhance-status {
		display: flex;
		flex-direction: column;
		gap: var(--space-tiny);
	}

	/* Toggle button — same style as quality-btn / model-btn in other nodes */
	.toggle-btn {
		padding: var(--space-sm) var(--space-md);
		background-color: var(--color-bg-canvas);
		border: 1px solid var(--color-text-muted);
		border-radius: var(--radius-md);
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		cursor: pointer;
		text-align: left;
		transition: all var(--transition-fast);
	}

	.toggle-btn:hover {
		border-color: var(--color-node-output);
	}

	.toggle-btn.active {
		background-color: var(--color-node-output);
		border-color: var(--color-node-output);
		color: var(--color-bg-canvas);
	}

	/* Generic action button — same style as quality-btn */
	.action-btn {
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		background-color: var(--color-bg-canvas);
		border: 1px solid var(--color-text-muted);
		border-radius: var(--radius-md);
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
		transition: all var(--transition-fast);
	}

	.action-btn:hover:not(:disabled) {
		border-color: var(--color-node-output);
		color: var(--color-node-output);
	}

	.action-btn:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	/* Generate — the primary action, solid fill */
	.generate-btn {
		width: 100%;
		padding: var(--space-md);
		background-color: var(--color-node-output);
		border: 1px solid var(--color-node-output);
		border-radius: var(--radius-md);
		color: var(--color-bg-canvas);
		font-weight: var(--font-bold);
		font-size: var(--text-sm);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
		transition: all var(--transition-fast);
	}

	.generate-btn.using-enhanced {
		background-color: var(--color-node-refine);
		border-color: var(--color-node-refine);
	}

	.generate-btn:hover:not(:disabled) {
		opacity: 0.88;
	}

	.generate-btn:active:not(:disabled) {
		opacity: 0.75;
	}

	.generate-btn:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	/* Error */
	.error-panel {
		display: flex;
		align-items: flex-start;
		gap: var(--space-sm);
		padding: var(--space-sm);
		background-color: rgba(254, 110, 110, 0.1);
		border-radius: var(--radius-sm);
	}

	.error-text {
		flex: 1;
		font-size: var(--text-xs);
		color: var(--color-error, #fe6e6e);
		line-height: 1.4;
	}

	.error-dismiss {
		background: none;
		border: none;
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		cursor: pointer;
		padding: 0;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.error-dismiss:hover {
		color: var(--color-text-primary);
	}

	/* Spinner */
	.spinner {
		width: 13px;
		height: 13px;
		border: 2px solid currentColor;
		border-top-color: transparent;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		opacity: 0.6;
		flex-shrink: 0;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}
</style>
