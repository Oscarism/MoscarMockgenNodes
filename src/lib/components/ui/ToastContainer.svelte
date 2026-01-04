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
			case 'progress':
				return '⟳';
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
				<span class="icon" class:spinning={toast.type === 'progress'}>{getIcon(toast.type)}</span>
				<div class="content">
					<span class="message">{toast.message}</span>
					{#if toast.progress && toast.progress.total > 0}
						<div class="progress-bar">
							<div
								class="progress-fill"
								style="width: {(toast.progress.current / toast.progress.total) * 100}%"
							></div>
						</div>
						<span class="progress-text">
							{toast.progress.current} / {toast.progress.total}
						</span>
					{/if}
				</div>
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
		border-radius: 12px;
		border: 1px solid;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
		pointer-events: auto;
		min-width: 280px;
		/* Glassmorphism blur effect */
		backdrop-filter: blur(30px);
		-webkit-backdrop-filter: blur(30px);
	}

	.toast.success {
		border-color: var(--color-success, #2ecc71);
		background: linear-gradient(135deg, rgba(46, 204, 113, 0.2), rgba(46, 204, 113, 0.08));
	}

	.toast.error {
		border-color: var(--color-error, #ff6b6b);
		background: linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(255, 107, 107, 0.08));
	}

	.toast.warning {
		border-color: #f39c12;
		background: linear-gradient(135deg, rgba(243, 156, 18, 0.2), rgba(243, 156, 18, 0.08));
	}

	.toast.info {
		border-color: #3498db;
		background: linear-gradient(135deg, rgba(52, 152, 219, 0.2), rgba(52, 152, 219, 0.08));
	}

	.toast.progress {
		border-color: #9b59b6;
		background: linear-gradient(135deg, rgba(155, 89, 182, 0.2), rgba(155, 89, 182, 0.08));
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

	.icon.spinning {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
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

	.toast.progress .icon {
		color: #9b59b6;
	}

	.content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.message {
		font-size: 13px;
		line-height: 1.4;
		color: var(--color-text-primary, #fff);
		word-break: break-word;
	}

	.progress-bar {
		height: 4px;
		background: rgba(255, 255, 255, 0.15);
		border-radius: 2px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: #9b59b6;
		transition: width 0.3s ease;
	}

	.progress-text {
		font-size: 11px;
		color: var(--color-text-muted, #888);
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
