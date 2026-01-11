<script lang="ts">
	import { generationHistory } from '$lib/stores/generation';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
	}

	let { isOpen, onClose }: Props = $props();
</script>

{#if isOpen}
	<div class="history-panel">
		<div class="history-header">
			<h3>Generation History</h3>
			<button class="close-btn" onclick={onClose}>×</button>
		</div>
		<div class="history-content">
			{#if $generationHistory.length === 0}
				<p class="empty">No generations yet</p>
			{:else}
				{#each $generationHistory as record}
					<div
						class="history-item"
						class:success={record.state === 'success'}
						class:fail={record.state === 'fail'}
					>
						<div class="history-time">
							{new Date(record.timestamp).toLocaleTimeString()}
						</div>
						<div class="history-prompt">{record.prompt.slice(0, 100)}...</div>
						<div class="history-status">{record.state}</div>
					</div>
				{/each}
			{/if}
		</div>
	</div>
{/if}

<style>
	.history-panel {
		position: fixed;
		top: var(--topbar-height);
		right: 0;
		width: 320px;
		max-height: calc(100vh - var(--topbar-height));
		background-color: #222222;
		border-left: 1px solid #333333;
		z-index: var(--z-dropdown);
		display: flex;
		flex-direction: column;
		animation: slideIn 0.3s ease-out;
	}

	@keyframes slideIn {
		from {
			transform: translateX(100%);
		}
		to {
			transform: translateX(0);
		}
	}

	.history-header {
		padding: var(--space-lg);
		border-bottom: 1px solid #333333;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.history-header h3 {
		font-size: var(--text-lg);
		font-weight: var(--font-medium);
	}

	.close-btn {
		width: 28px;
		height: 28px;
		border-radius: var(--radius-full);
		background-color: #333333;
		border: none;
		color: var(--color-text-primary);
		font-size: var(--text-lg);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.close-btn:hover {
		background-color: var(--color-error);
	}

	.history-content {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-md);
	}

	.history-content .empty {
		color: var(--color-text-muted);
		text-align: center;
		padding: var(--space-xl);
	}

	.history-item {
		padding: var(--space-md);
		background-color: #1a1a1a;
		border-radius: var(--radius-md);
		margin-bottom: var(--space-sm);
	}

	.history-item.success {
		border-left: 3px solid var(--color-success);
	}

	.history-item.fail {
		border-left: 3px solid var(--color-error);
	}

	.history-time {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.history-prompt {
		font-size: var(--text-sm);
		color: var(--color-text-primary);
		margin: var(--space-tiny) 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.history-status {
		font-size: var(--text-xs);
		text-transform: uppercase;
	}
</style>
