<script lang="ts">
	import BaseNode from './BaseNode.svelte';
	import type { OutputNodeData, PromptNode, PromptEdge, GenerationModel } from '$lib/types';
	import { nodes, edges, updateNodeData } from '$lib/stores/canvas';
	import { generationState, startBatchGeneration } from '$lib/stores/generation';
	import {
		compilePrompt,
		getQualitySettings,
		getUploadedImageUrls,
		estimateTokens
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

	// Batch count options
	const batchOptions = [1, 2, 3, 4, 6, 8];

	function handleBatchChange(event: Event) {
		const batchCount = parseInt((event.target as HTMLSelectElement).value);
		updateNodeData(id, { batchCount });
	}

	async function handleGenerate() {
		if (isGenerating || !compiled.prompt) return;

		// Models that require images
		const modelsRequiringImages = [
			'seedream/4.5-edit',
			'flux-2/pro-image-to-image',
			'flux-2/flex-image-to-image'
		];

		// Check if image model is selected but no images uploaded
		if (modelsRequiringImages.includes(qualitySettings.model) && imageUrls.length === 0) {
			alert(
				'This model requires at least one uploaded image. Please add images to an Image Upload node.'
			);
			return;
		}

		await startBatchGeneration(
			compiled.prompt,
			qualitySettings.aspectRatio as any,
			qualitySettings.quality,
			data.batchCount || 1,
			qualitySettings.model as GenerationModel,
			imageUrls,
			qualitySettings.resolution
		);
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

	<div class="settings-row">
		<div class="settings-display">
			<span class="setting model"
				>{qualitySettings.model === 'seedream/4.5-edit'
					? 'Edit'
					: qualitySettings.model === 'z-image'
						? 'Z-Img'
						: qualitySettings.model === 'flux-2/pro-text-to-image'
							? 'Flux Pro'
							: qualitySettings.model === 'flux-2/pro-image-to-image'
								? 'Flux I2I'
								: qualitySettings.model === 'flux-2/flex-text-to-image'
									? 'Flex'
									: qualitySettings.model === 'flux-2/flex-image-to-image'
										? 'Flex I2I'
										: qualitySettings.model === 'nano-banana-pro'
											? 'Nano B.'
											: 'Seedream'}</span
			>
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

	<button class="generate-btn" onclick={handleGenerate} disabled={isGenerating || !compiled.prompt}>
		{#if isGenerating}
			<span class="spinner"></span>
			Generating...
		{:else}
			Generate {data.batchCount > 1 ? `${data.batchCount} Images` : 'Mockup'}
		{/if}
	</button>

	{#if $generationState.error}
		<div class="error">{$generationState.error}</div>
	{/if}
</BaseNode>

<style>
	/* Make output node wider */
	:global(.output-node-wrapper) {
		min-width: 320px !important;
		max-width: 380px !important;
	}

	.prompt-preview {
		display: flex;
		flex-direction: column;
		gap: var(--space-tiny);
	}

	.prompt-preview .label {
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
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

	.generate-btn {
		width: 100%;
		padding: var(--space-md);
		background-color: var(--color-node-output);
		border: none;
		border-radius: var(--radius-md);
		color: var(--color-bg-canvas);
		font-weight: var(--font-bold);
		font-size: var(--text-base);
		cursor: pointer;
		transition: all var(--transition-fast);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
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
</style>
