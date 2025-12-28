<script lang="ts">
	import { nodes, edges } from '$lib/stores/canvas';
	import { compilePrompt, estimateTokens } from '$lib/utils/promptCompiler';

	// Compile prompt from connected nodes
	let compiled = $derived(compilePrompt($nodes, $edges));
	let tokenEstimate = $derived(estimateTokens(compiled.prompt));

	// Expand state
	let isExpanded = $state(false);

	function toggleExpand() {
		isExpanded = !isExpanded;
	}
</script>

<div class="prompt-preview" class:expanded={isExpanded}>
	<div class="header">
		<span class="label">LIVE PROMPT PREVIEW</span>
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
			<p>{compiled.prompt}</p>
		{:else}
			<p class="empty">Connect nodes to the Output node to build your prompt...</p>
		{/if}
	</div>

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
		max-width: 600px;
		background-color: var(--color-bg-ui);
		border: 1px solid var(--color-text-muted);
		border-radius: var(--radius-lg);
		z-index: var(--z-ui);
		animation: slideUp 0.3s ease-out;
	}

	.header {
		padding: var(--space-sm) var(--space-lg);
		border-bottom: 1px solid var(--color-bg-canvas);
		display: flex;
		justify-content: space-between;
		align-items: center;
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

	.stats {
		display: flex;
		gap: var(--space-md);
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
	}

	.expand-btn {
		background: transparent;
		border: none;
		color: var(--color-text-secondary);
		cursor: pointer;
		padding: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-sm);
		transition: all var(--transition-fast);
	}

	.expand-btn:hover {
		color: var(--color-text-primary);
		background-color: var(--color-bg-canvas);
	}

	.content {
		padding: var(--space-md) var(--space-lg);
		max-height: 80px;
		overflow-y: auto;
		transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.prompt-preview.expanded .content {
		max-height: 400px;
	}

	.content p {
		font-size: var(--text-sm);
		line-height: 1.5;
		color: var(--color-text-primary);
		margin: 0;
	}

	.content .empty {
		color: var(--color-text-muted);
		font-style: italic;
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
