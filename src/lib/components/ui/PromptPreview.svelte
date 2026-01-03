<script lang="ts">
	import { nodes, edges } from '$lib/stores/canvas';
	import { compilePrompt, estimateTokens } from '$lib/utils/promptCompiler';
	import { promptOptimizer } from '$lib/stores/promptOptimizer';

	// Compile prompt from connected nodes
	let compiled = $derived(compilePrompt($nodes, $edges));
	let tokenEstimate = $derived(estimateTokens(compiled.prompt));

	// Optimizer state
	let optimizer = $derived($promptOptimizer);
	let hasEnhancement = $derived(optimizer.optimizedPrompt !== null);
	let isStale = $derived(optimizer.isStale);
	let enhancedTokens = $derived(
		optimizer.optimizedPrompt ? estimateTokens(optimizer.optimizedPrompt) : 0
	);

	// Track last checked prompt to prevent repeated calls
	let lastCheckedPrompt = $state('');

	// Check for prompt changes and mark stale (with guard to prevent loop)
	$effect(() => {
		const currentPrompt = compiled.prompt;
		if (hasEnhancement && !isStale && currentPrompt !== lastCheckedPrompt) {
			lastCheckedPrompt = currentPrompt;
			if (currentPrompt !== optimizer.originalPrompt) {
				promptOptimizer.checkPromptChanged(currentPrompt);
			}
		}
	});

	// Get model names for display
	function getModelDisplayNames(models: string[]): string {
		const nameMap: Record<string, string> = {
			'seedream/4.5-text-to-image': 'Seedream',
			'seedream/4.5-edit': 'Seedream Edit',
			'z-image': 'Z-Image',
			'flux-2/pro-image-to-image': 'Flux I2I',
			'nano-banana-pro': 'Nano Banana'
		};
		return models.map((m) => nameMap[m] || m).join(', ');
	}

	// Expand state
	let isExpanded = $state(false);

	function toggleExpand() {
		isExpanded = !isExpanded;
	}
</script>

<div class="prompt-preview" class:expanded={isExpanded} class:has-enhancement={hasEnhancement}>
	<!-- Original Prompt Section -->
	<div class="section original-section">
		<div class="header">
			<div class="header-left">
				<span class="label">NODE PROMPT</span>
				{#if hasEnhancement && !isStale}
					<span class="badge" class:active={!optimizer.useEnhanced}>
						{optimizer.useEnhanced ? '' : 'Using'}
					</span>
				{/if}
			</div>
			<div class="header-right">
				<div class="stats">
					<span>{compiled.characterCount} chars</span>
					<span>~{tokenEstimate} tokens</span>
				</div>
				<button
					class="expand-btn"
					onclick={toggleExpand}
					aria-label={isExpanded ? 'Collapse' : 'Expand'}
				>
					{#if isExpanded}
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
							<path
								d="M6 2V6H2M14 6H10V2M10 14V10H14M2 10H6V14"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
							/>
						</svg>
					{:else}
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
							<path
								d="M2 6V2H6M10 2H14V6M14 10V14H10M6 14H2V10"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
							/>
						</svg>
					{/if}
				</button>
			</div>
		</div>

		<div class="content">
			{#if compiled.prompt}
				<p class:dimmed={hasEnhancement && optimizer.useEnhanced && !isStale}>{compiled.prompt}</p>
			{:else}
				<p class="empty">Connect nodes to the Output node to build your prompt...</p>
			{/if}
		</div>
	</div>

	<!-- Enhanced Prompt Section (visible when enhancement exists) -->
	{#if hasEnhancement}
		<div class="section enhanced-section" class:stale={isStale}>
			<div class="header">
				<div class="header-left">
					<span class="label enhanced-label">
						ENHANCED PROMPT
						{#if optimizer.targetModels.length > 0}
							<span class="model-target">for {getModelDisplayNames(optimizer.targetModels)}</span>
						{/if}
					</span>
					{#if !isStale}
						<span class="badge" class:active={optimizer.useEnhanced}>
							{optimizer.useEnhanced ? 'Using' : ''}
						</span>
					{/if}
				</div>
				<div class="header-right">
					{#if !isStale}
						<div class="stats">
							<span>{optimizer.optimizedPrompt?.length || 0} chars</span>
							<span>~{enhancedTokens} tokens</span>
						</div>
					{/if}
					<button class="redo-btn" onclick={() => promptOptimizer.redo()} title="Re-enhance">
						Redo
					</button>
				</div>
			</div>

			{#if isStale}
				<div class="stale-warning">
					<span class="stale-icon">!</span>
					<span>Nodes have changed. Re-enhance to update the optimized prompt.</span>
				</div>
			{:else}
				<div class="content enhanced-content">
					<p>{optimizer.optimizedPrompt}</p>
					{#if optimizer.reasoning}
						<p class="reasoning">{optimizer.reasoning}</p>
					{/if}
				</div>

				<!-- Toggle buttons -->
				<div class="toggle-bar">
					<button
						class="toggle-btn"
						class:active={!optimizer.useEnhanced}
						onclick={() => promptOptimizer.useOriginal()}
					>
						Use Node Prompt
					</button>
					<button
						class="toggle-btn"
						class:active={optimizer.useEnhanced}
						onclick={() => promptOptimizer.useOptimized()}
					>
						Use Enhanced
					</button>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Optimizing indicator -->
	{#if optimizer.isOptimizing}
		<div class="optimizing-bar">
			<div class="spinner-small"></div>
			<span>Enhancing prompt with AI...</span>
		</div>
	{/if}

	{#if compiled.warnings.length > 0}
		<div class="warnings">
			{#each compiled.warnings as warning}
				<span class="warning">{warning}</span>
			{/each}
		</div>
	{/if}
</div>

<style>
	.prompt-preview {
		position: fixed;
		bottom: 16px;
		left: 50%;
		transform: translateX(-50%);
		width: 100%;
		max-width: 700px;
		background-color: var(--color-bg-ui);
		border: 1px solid var(--color-text-muted);
		border-radius: var(--radius-lg);
		z-index: var(--z-ui);
		animation: slideUp 0.3s ease-out;
		overflow: hidden;
	}

	.prompt-preview.has-enhancement {
		max-width: 800px;
	}

	.section {
		border-bottom: 1px solid var(--color-bg-canvas);
	}

	.section:last-of-type {
		border-bottom: none;
	}

	.enhanced-section {
		background: linear-gradient(135deg, rgba(201, 254, 110, 0.05), rgba(110, 201, 254, 0.05));
	}

	.enhanced-section.stale {
		background: linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 152, 0, 0.05));
	}

	.header {
		padding: var(--space-sm) var(--space-lg);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: var(--space-md);
	}

	.label {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		letter-spacing: 1px;
	}

	.enhanced-label {
		color: var(--color-node-product);
	}

	.model-target {
		font-family: var(--font-sans);
		font-size: 10px;
		color: var(--color-text-secondary);
		letter-spacing: 0;
		margin-left: 4px;
	}

	.badge {
		font-size: 10px;
		padding: 2px 6px;
		border-radius: var(--radius-sm);
		background-color: transparent;
		color: var(--color-text-muted);
	}

	.badge.active {
		background-color: var(--color-node-product);
		color: var(--color-bg-canvas);
	}

	.stats {
		display: flex;
		gap: var(--space-md);
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
	}

	.expand-btn,
	.redo-btn {
		background: transparent;
		border: 1px solid var(--color-text-muted);
		color: var(--color-text-secondary);
		cursor: pointer;
		padding: 4px 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-sm);
		transition: all var(--transition-fast);
		font-size: 11px;
	}

	.expand-btn {
		border: none;
		padding: 4px;
	}

	.expand-btn:hover,
	.redo-btn:hover {
		color: var(--color-text-primary);
		background-color: var(--color-bg-canvas);
		border-color: var(--color-text-secondary);
	}

	.content {
		padding: var(--space-sm) var(--space-lg);
		max-height: 60px;
		overflow-y: auto;
		transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.prompt-preview.expanded .content {
		max-height: 200px;
	}

	.enhanced-content {
		max-height: 80px;
	}

	.prompt-preview.expanded .enhanced-content {
		max-height: 250px;
	}

	.content p {
		font-size: var(--text-sm);
		line-height: 1.5;
		color: var(--color-text-primary);
		margin: 0;
	}

	.content p.dimmed {
		color: var(--color-text-muted);
	}

	.content .empty {
		color: var(--color-text-muted);
		font-style: italic;
	}

	.reasoning {
		margin-top: var(--space-sm) !important;
		font-size: var(--text-xs) !important;
		color: var(--color-text-secondary) !important;
		font-style: italic;
	}

	.stale-warning {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-md) var(--space-lg);
		color: #ff9800;
		font-size: var(--text-sm);
	}

	.stale-icon {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background-color: #ff9800;
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		font-size: 12px;
		flex-shrink: 0;
	}

	.toggle-bar {
		display: flex;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-lg);
		background-color: rgba(0, 0, 0, 0.2);
	}

	.toggle-btn {
		flex: 1;
		padding: var(--space-sm) var(--space-md);
		background-color: transparent;
		border: 1px solid var(--color-text-muted);
		border-radius: var(--radius-md);
		color: var(--color-text-secondary);
		cursor: pointer;
		font-size: var(--text-sm);
		transition: all var(--transition-fast);
	}

	.toggle-btn:hover {
		border-color: var(--color-node-product);
		color: var(--color-text-primary);
	}

	.toggle-btn.active {
		background-color: var(--color-node-product);
		border-color: var(--color-node-product);
		color: var(--color-bg-canvas);
	}

	.optimizing-bar {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-lg);
		background: linear-gradient(90deg, rgba(201, 254, 110, 0.1), rgba(110, 201, 254, 0.1));
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
	}

	.spinner-small {
		width: 14px;
		height: 14px;
		border: 2px solid var(--color-bg-canvas);
		border-top-color: var(--color-node-product);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.warnings {
		padding: var(--space-sm) var(--space-lg);
		border-top: 1px solid var(--color-bg-canvas);
		display: flex;
		gap: var(--space-sm);
		flex-wrap: wrap;
	}

	.warning {
		font-size: var(--text-xs);
		color: var(--color-warning);
		padding: 2px var(--space-sm);
		background-color: rgba(254, 194, 110, 0.1);
		border-radius: var(--radius-sm);
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateX(-50%) translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
	}
</style>
