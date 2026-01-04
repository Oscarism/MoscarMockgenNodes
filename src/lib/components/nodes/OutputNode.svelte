<script lang="ts">
	import BaseNode from './BaseNode.svelte';
	import type { OutputNodeData, GenerationModel, BatchImage } from '$lib/types';
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
		estimateTokens,
		getBatchImages
	} from '$lib/utils/promptCompiler';

	interface Props {
		id: string;
		data: OutputNodeData;
	}

	let { id, data }: Props = $props();

	// Compile prompt from connected nodes
	let compiled = $derived(compilePrompt($nodes, $edges));
	let qualitySettings = $derived(getQualitySettings($nodes, $edges));
	let imageUrls = $derived(getUploadedImageUrls($nodes, $edges));
	let tokenEstimate = $derived(estimateTokens(compiled.prompt));
	let isGenerating = $derived($generationState.isGenerating);

	// Optimizer state
	let optimizer = $derived($promptOptimizer);
	let hasEnhancement = $derived(optimizer.optimizedPrompt !== null && !optimizer.isStale);
	let isStale = $derived(optimizer.isStale);
	let isOptimizing = $derived(optimizer.isOptimizing);

	// Batch processing state
	let batchImages = $derived(getBatchImages($nodes, $edges));
	let hasBatchImages = $derived(batchImages.length > 0);
	let isProcessingBatch = $state(false);

	// Models that support image-to-image
	const IMAGE_TO_IMAGE_MODELS = [
		'seedream/4.5-edit',
		'flux-2/pro-image-to-image',
		'nano-banana-pro'
	];

	// Check if selected models support batch/image-to-image
	let selectedModels = $derived(qualitySettings.models || [qualitySettings.model]);
	let unsupportedModels = $derived(
		hasBatchImages ? selectedModels.filter((m) => !IMAGE_TO_IMAGE_MODELS.includes(m)) : []
	);
	let hasUnsupportedModel = $derived(unsupportedModels.length > 0 && hasBatchImages);
	let supportedModelsForBatch = $derived(
		selectedModels.filter((m) => IMAGE_TO_IMAGE_MODELS.includes(m))
	);

	// Batch count options
	const batchOptions = [1, 2, 3, 4, 6, 8];

	function handleBatchChange(event: Event) {
		const batchCount = parseInt((event.target as HTMLSelectElement).value);
		updateNodeData(id, { batchCount });
	}

	// Enhance prompt with AI
	async function handleEnhance() {
		if (isOptimizing || !compiled.prompt) return;
		const selectedModels = qualitySettings.models || [qualitySettings.model];
		await promptOptimizer.optimize(compiled.prompt, selectedModels as GenerationModel[]);
	}

	async function handleGenerate() {
		if (isGenerating || !compiled.prompt) return;

		// Models that require images
		const modelsRequiringImages = ['seedream/4.5-edit', 'flux-2/pro-image-to-image'];

		// Get selected models (with fallback)
		const selectedModels = qualitySettings.models || [qualitySettings.model];

		// Check if any selected image model requires images but none uploaded
		const imageModelsSelected = selectedModels.filter((m) => modelsRequiringImages.includes(m));
		if (imageModelsSelected.length > 0 && imageUrls.length === 0) {
			alert(
				`The following models require at least one uploaded image: ${imageModelsSelected.join(', ')}. Please add images to an Image Upload node.`
			);
			return;
		}

		// Use enhanced prompt if available and selected, otherwise use original
		const promptToUse =
			hasEnhancement && optimizer.useEnhanced ? optimizer.optimizedPrompt : compiled.prompt;

		console.log(
			`[OutputNode] Generating with ${hasEnhancement && optimizer.useEnhanced ? 'ENHANCED' : 'ORIGINAL'} prompt`
		);
		console.log(`[OutputNode] Batch count: ${data.batchCount || 1}`);
		console.log(`[OutputNode] Prompt: ${promptToUse?.substring(0, 100)}...`);

		// Start multi-model batch generation
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

	// Process batch images one at a time
	async function handleProcessBatch() {
		if (isProcessingBatch || !compiled.prompt || batchImages.length === 0) return;

		// Only use models that support image-to-image
		if (supportedModelsForBatch.length === 0) {
			toasts.error(
				'No selected models support image-to-image. Please select Seedream Edit, Nano, or Flux I2I.'
			);
			return;
		}

		isProcessingBatch = true;
		const toastId = toasts.progress(`Starting batch processing...`, 0, batchImages.length);

		// Use enhanced prompt if available
		const promptToUse =
			hasEnhancement && optimizer.useEnhanced ? optimizer.optimizedPrompt : compiled.prompt;

		try {
			for (let i = 0; i < batchImages.length; i++) {
				const img = batchImages[i];

				// Update progress toast
				toasts.updateProgress(
					toastId,
					i + 1,
					batchImages.length,
					`Processing image ${i + 1} of ${batchImages.length}...`
				);

				try {
					// Upload image if not already uploaded
					let hostedUrl = img.hostedUrl;
					if (!hostedUrl && img.file) {
						hostedUrl = await uploadImageToHost(img.file);
					}

					if (!hostedUrl) {
						console.error(`Batch item ${i} has no hosted URL`);
						continue;
					}

					// Start generation for this single image with each supported model
					for (const model of supportedModelsForBatch) {
						await startBatchGeneration(
							promptToUse!,
							qualitySettings.aspectRatio as any,
							qualitySettings.quality,
							1, // Single image per batch item
							model as GenerationModel,
							[hostedUrl],
							qualitySettings.resolution
						);
					}
				} catch (error) {
					console.error(`Batch item ${i} failed:`, error);
				}
			}

			// Complete
			toasts.remove(toastId);
			toasts.success(`Batch complete! Processed ${batchImages.length} images.`);
		} catch (error) {
			toasts.remove(toastId);
			toasts.error(`Batch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
		} finally {
			isProcessingBatch = false;
		}
	}
</script>

<BaseNode {id} nodeType="output" showOutput={false}>
	<div class="prompt-preview">
		<span class="label">Compiled Prompt</span>
		<div class="prompt-text">
			{#if compiled.prompt}
				{compiled.prompt}
			{:else}
				<span class="empty">Connect nodes to build your prompt...</span>
			{/if}
		</div>
	</div>

	<div class="stats">
		<div class="stat">
			<span class="stat-label">Characters</span>
			<span class="stat-value" class:warning={compiled.characterCount > 2500}>
				{compiled.characterCount} / 3000
			</span>
		</div>
		<div class="stat">
			<span class="stat-label">Est. Tokens</span>
			<span class="stat-value">~{tokenEstimate}</span>
		</div>
	</div>

	{#if compiled.warnings.length > 0}
		<div class="warnings">
			{#each compiled.warnings as warning}
				<div class="warning-item">{warning}</div>
			{/each}
		</div>
	{/if}

	{#if hasUnsupportedModel}
		<div class="model-warning">
			<span class="warning-icon">⚠️</span>
			<span
				>Model{unsupportedModels.length > 1 ? 's' : ''}
				<strong
					>{unsupportedModels
						.map((m) =>
							m === 'seedream/4.5-text-to-image' ? 'Seedream T2I' : m === 'z-image' ? 'Z-Image' : m
						)
						.join(', ')}</strong
				>
				do{unsupportedModels.length === 1 ? 'es' : ''} not support image-to-image</span
			>
		</div>
	{/if}

	<div class="settings-row">
		<div class="settings-display">
			{#each qualitySettings.models || [qualitySettings.model] as modelId}
				<span class="setting model"
					>{modelId === 'seedream/4.5-edit'
						? 'Edit'
						: modelId === 'seedream/4.5-text-to-image'
							? 'Seedream'
							: modelId === 'z-image'
								? 'Z-Img'
								: modelId === 'flux-2/pro-image-to-image'
									? 'Flux I2I'
									: modelId === 'nano-banana-pro'
										? 'Nano B.'
										: modelId}</span
				>
			{/each}
			<span class="setting">{qualitySettings.aspectRatio}</span>
			{#if qualitySettings.model?.startsWith('flux-2/') || qualitySettings.model === 'nano-banana-pro'}
				<span class="setting">{qualitySettings.resolution}</span>
			{:else if qualitySettings.model !== 'z-image'}
				<span class="setting">{qualitySettings.quality === 'high' ? '4K' : '2K'}</span>
			{/if}
			{#if imageUrls.length > 0}
				<span class="setting images">{imageUrls.length} img</span>
			{/if}
		</div>
		<div class="batch-control">
			<label for="batch-{id}">Batch:</label>
			<select id="batch-{id}" value={data.batchCount || 1} onchange={handleBatchChange}>
				{#each batchOptions as count}
					<option value={count}>{count}x</option>
				{/each}
			</select>
		</div>
	</div>

	<!-- Action Buttons -->
	<div class="action-buttons">
		<button
			class="enhance-btn"
			onclick={handleEnhance}
			disabled={isOptimizing || isGenerating || !compiled.prompt}
		>
			{#if isOptimizing}
				<span class="spinner"></span>
				Enhancing...
			{:else if optimizer.optimizedPrompt && !isStale}
				Re-enhance
			{:else if isStale}
				Re-enhance (Changed)
			{:else}
				Enhance Prompt
			{/if}
		</button>

		<button
			class="generate-btn"
			class:enhanced={hasEnhancement && optimizer.useEnhanced}
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
	</div>

	{#if hasBatchImages}
		<div class="batch-section">
			<div class="batch-info">
				<span class="batch-label">Batch Queue</span>
				<span class="batch-count">{batchImages.length} images</span>
			</div>
			<button
				class="process-batch-btn"
				onclick={handleProcessBatch}
				disabled={isProcessingBatch ||
					isGenerating ||
					!compiled.prompt ||
					supportedModelsForBatch.length === 0}
			>
				{#if isProcessingBatch}
					<span class="spinner"></span>
					Processing Batch...
				{:else if supportedModelsForBatch.length === 0}
					No Supported Model
				{:else}
					Process Batch ({batchImages.length})
				{/if}
			</button>
		</div>
	{/if}

	{#if $generationState.error}
		<div class="error">{$generationState.error}</div>
	{/if}
</BaseNode>

<style>
	.label {
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.prompt-preview {
		display: flex;
		flex-direction: column;
		gap: var(--space-tiny);
	}

	.prompt-text {
		background-color: var(--color-bg-canvas);
		border-radius: var(--radius-sm);
		padding: var(--space-sm);
		font-size: var(--text-sm);
		line-height: 1.4;
		max-height: 120px;
		overflow-y: auto;
		color: var(--color-text-primary);
	}

	.prompt-text .empty {
		color: var(--color-text-muted);
		font-style: italic;
	}

	.stats {
		display: flex;
		gap: var(--space-lg);
		padding: var(--space-sm) 0;
	}

	.stat {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.stat-label {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.stat-value {
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--color-text-primary);
	}

	.stat-value.warning {
		color: var(--color-warning);
	}

	.warnings {
		display: flex;
		flex-direction: column;
		gap: var(--space-tiny);
	}

	.warning-item {
		font-size: var(--text-xs);
		color: var(--color-warning);
		padding: var(--space-tiny) var(--space-sm);
		background-color: rgba(254, 194, 110, 0.1);
		border-radius: var(--radius-sm);
	}

	.settings-row {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		margin-bottom: var(--space-sm);
	}

	.settings-display {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.setting {
		font-size: 10px;
		color: var(--color-text-secondary);
		padding: 4px 8px;
		background-color: var(--color-bg-canvas);
		border-radius: var(--radius-sm);
	}

	.setting.model {
		background-color: var(--color-node-quality);
		color: var(--color-bg-canvas);
	}

	.setting.images {
		background-color: var(--color-node-image);
		color: var(--color-bg-canvas);
	}

	.batch-control {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.batch-control label {
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
	}

	.batch-control select {
		padding: var(--space-tiny) var(--space-sm);
		font-size: var(--text-sm);
		background-color: var(--color-node-output);
		color: var(--color-bg-canvas);
		border: none;
		border-radius: var(--radius-sm);
		font-weight: var(--font-medium);
		cursor: pointer;
	}

	.action-buttons {
		display: flex;
		gap: var(--space-sm);
		margin-top: var(--space-sm);
	}

	.enhance-btn {
		flex: 0 0 auto;
		padding: var(--space-sm) var(--space-md);
		background: linear-gradient(135deg, #667eea, #764ba2);
		border: none;
		border-radius: var(--radius-md);
		color: white;
		font-weight: var(--font-medium);
		font-size: var(--text-sm);
		cursor: pointer;
		transition: all var(--transition-fast);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
	}

	.enhance-btn:hover:not(:disabled) {
		transform: scale(1.02);
		box-shadow: 0 0 15px rgba(102, 126, 234, 0.4);
	}

	.enhance-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.generate-btn {
		flex: 1;
		padding: var(--space-md);
		background-color: var(--color-node-output);
		border: none;
		border-radius: var(--radius-md);
		color: var(--color-bg-canvas);
		font-weight: var(--font-bold);
		font-size: var(--text-sm);
		cursor: pointer;
		transition: all var(--transition-fast);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
	}

	.generate-btn.enhanced {
		background: linear-gradient(135deg, var(--color-node-product), var(--color-node-refine));
	}

	.generate-btn:hover:not(:disabled) {
		transform: scale(1.02);
		box-shadow: 0 0 20px rgba(254, 110, 110, 0.4);
	}

	.generate-btn:active:not(:disabled) {
		transform: scale(0.98);
	}

	.generate-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.spinner {
		width: 16px;
		height: 16px;
		border: 2px solid var(--color-bg-canvas);
		border-top-color: transparent;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.error {
		font-size: var(--text-xs);
		color: var(--color-error);
		padding: var(--space-sm);
		background-color: rgba(254, 110, 110, 0.1);
		border-radius: var(--radius-sm);
		text-align: center;
	}

	.model-warning {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm);
		background-color: rgba(254, 194, 110, 0.15);
		border: 1px solid rgba(254, 194, 110, 0.4);
		border-radius: var(--radius-sm);
		font-size: var(--text-xs);
		color: var(--color-warning);
	}

	.model-warning strong {
		color: var(--color-text-primary);
	}

	.warning-icon {
		font-size: 14px;
	}

	.batch-section {
		margin-top: var(--space-md);
		padding-top: var(--space-md);
		border-top: 1px solid var(--color-text-muted);
	}

	.batch-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-sm);
	}

	.batch-label {
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.batch-count {
		font-size: var(--text-xs);
		color: var(--color-node-image);
		font-weight: var(--font-medium);
	}

	.process-batch-btn {
		width: 100%;
		padding: var(--space-sm);
		background: linear-gradient(135deg, var(--color-node-image), #e67e22);
		border: none;
		border-radius: var(--radius-md);
		color: white;
		font-weight: var(--font-bold);
		font-size: var(--text-sm);
		cursor: pointer;
		transition: all var(--transition-fast);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
	}

	.process-batch-btn:hover:not(:disabled) {
		transform: scale(1.02);
		box-shadow: 0 0 15px rgba(255, 159, 67, 0.4);
	}

	.process-batch-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		background: var(--color-text-muted);
	}
</style>
