<script lang="ts">
	import { toasts, type Toast } from '$lib/stores/toasts';
	import { flip } from 'svelte/animate';
	import { fade, fly } from 'svelte/transition';

	let items = $derived($toasts);

	function getIcon(type: Toast['type']): string {
		switch (type) {
			case 'success':
				return '✓';
			case 'error':
				return '✕';
			case 'warning':
				return '⚠';
			case 'info':
				return 'ℹ';
			default:
				return '';
		}
	}
</script>

{#if items.length > 0}
	<div class="toast-container">
		{#each items as toast (toast.id)}
			<div
				class="toast {toast.type}"
				animate:flip={{ duration: 200 }}
				in:fly={{ x: 300, duration: 300 }}
				out:fade={{ duration: 200 }}
			>
				<span class="icon">{getIcon(toast.type)}</span>
				<span class="message">{toast.message}</span>
				<button class="close-btn" onclick={() => toasts.remove(toast.id)} aria-label="Close">
					×
				</button>
			</div>
		{/each}
	</div>
{/if}

<style>
	.toast-container {
		position: fixed;
		top: 70px;
		right: 16px;
		z-index: 9999;
		display: flex;
		flex-direction: column;
		gap: 8px;
		max-width: 400px;
		pointer-events: none;
	}

	.toast {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		padding: 12px 16px;
		border-radius: 8px;
		background-color: var(--color-bg-ui, #1a1a1a);
		border: 1px solid;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
		pointer-events: auto;
		min-width: 280px;
	}

	.toast.success {
		border-color: var(--color-success, #2ecc71);
		background: linear-gradient(135deg, rgba(46, 204, 113, 0.15), rgba(46, 204, 113, 0.05));
	}

	.toast.error {
		border-color: var(--color-error, #ff6b6b);
		background: linear-gradient(135deg, rgba(255, 107, 107, 0.15), rgba(255, 107, 107, 0.05));
	}

	.toast.warning {
		border-color: #f39c12;
		background: linear-gradient(135deg, rgba(243, 156, 18, 0.15), rgba(243, 156, 18, 0.05));
	}

	.toast.info {
		border-color: #3498db;
		background: linear-gradient(135deg, rgba(52, 152, 219, 0.15), rgba(52, 152, 219, 0.05));
	}

	.icon {
		font-size: 16px;
		line-height: 1;
		flex-shrink: 0;
		width: 20px;
		height: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
	}

	.toast.success .icon {
		color: var(--color-success, #2ecc71);
	}

	.toast.error .icon {
		color: var(--color-error, #ff6b6b);
	}

	.toast.warning .icon {
		color: #f39c12;
	}

	.toast.info .icon {
		color: #3498db;
	}

	.message {
		flex: 1;
		font-size: 13px;
		line-height: 1.4;
		color: var(--color-text-primary, #fff);
		word-break: break-word;
	}

	.close-btn {
		flex-shrink: 0;
		width: 20px;
		height: 20px;
		border: none;
		background: transparent;
		color: var(--color-text-muted, #888);
		font-size: 18px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
		transition: all 0.15s ease;
		padding: 0;
		margin: -2px -4px -2px 0;
	}

	.close-btn:hover {
		background-color: rgba(255, 255, 255, 0.1);
		color: var(--color-text-primary, #fff);
	}
</style>
