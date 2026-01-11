<script lang="ts">
	import { saveToCloud, currentCanvasName } from '$lib/stores/canvas';
	import { user } from '$lib/stores/auth';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
	}

	let { isOpen, onClose }: Props = $props();

	let canvasName = $state($currentCanvasName || 'Untitled Canvas');
	let setAsDefault = $state(false);
	let isSaving = $state(false);

	// Reset form when dialog opens
	$effect(() => {
		if (isOpen) {
			canvasName = $currentCanvasName || 'Untitled Canvas';
			setAsDefault = false;
		}
	});

	async function handleSave() {
		if (!$user || !canvasName.trim()) return;

		isSaving = true;
		try {
			await saveToCloud($user.id, canvasName.trim());
			onClose();
		} finally {
			isSaving = false;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			onClose();
		} else if (event.key === 'Enter' && !isSaving) {
			handleSave();
		}
	}
</script>

{#if isOpen}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div class="dialog-overlay" role="dialog" aria-modal="true" onkeydown={handleKeydown}>
		<div class="dialog-backdrop" onclick={onClose}></div>
		<div class="dialog-content">
			<div class="dialog-header">
				<h2>Save Canvas</h2>
				<button class="close-btn" onclick={onClose}>×</button>
			</div>

			<div class="dialog-body">
				<div class="form-group">
					<label for="canvas-name">Canvas Name</label>
					<input
						id="canvas-name"
						type="text"
						bind:value={canvasName}
						placeholder="Enter a name for your canvas"
						disabled={isSaving}
					/>
				</div>

				<label class="checkbox-group">
					<input type="checkbox" bind:checked={setAsDefault} disabled={isSaving} />
					<span>Set as default canvas</span>
				</label>
			</div>

			<div class="dialog-footer">
				<button class="btn btn-secondary" onclick={onClose} disabled={isSaving}>Cancel</button>
				<button
					class="btn btn-primary"
					onclick={handleSave}
					disabled={isSaving || !canvasName.trim()}
				>
					{isSaving ? 'Saving...' : 'Save'}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.dialog-overlay {
		position: fixed;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: var(--z-modal, 1000);
	}

	.dialog-backdrop {
		position: absolute;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(4px);
	}

	.dialog-content {
		position: relative;
		background-color: #222222;
		border-radius: var(--radius-lg);
		width: 100%;
		max-width: 420px;
		margin: var(--space-lg);
		animation: dialogIn 0.2s ease-out;
	}

	@keyframes dialogIn {
		from {
			opacity: 0;
			transform: scale(0.95) translateY(-10px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	.dialog-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-lg);
		border-bottom: 1px solid #333;
	}

	.dialog-header h2 {
		font-size: var(--text-lg);
		font-weight: var(--font-medium);
		color: var(--color-text-primary);
		margin: 0;
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

	.dialog-body {
		padding: var(--space-lg);
	}

	.form-group {
		margin-bottom: var(--space-lg);
	}

	.form-group label {
		display: block;
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		margin-bottom: var(--space-sm);
	}

	.form-group input[type='text'] {
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		background-color: #1a1a1a;
		border: 1px solid #444;
		border-radius: var(--radius-md);
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		transition: border-color var(--transition-fast);
	}

	.form-group input[type='text']:focus {
		outline: none;
		border-color: var(--color-node-product);
	}

	.form-group input[type='text']:disabled {
		opacity: 0.6;
	}

	.checkbox-group {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		cursor: pointer;
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
	}

	.checkbox-group input[type='checkbox'] {
		width: 16px;
		height: 16px;
		cursor: pointer;
	}

	.dialog-footer {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-sm);
		padding: var(--space-lg);
		border-top: 1px solid #333;
	}

	.btn {
		padding: var(--space-sm) var(--space-lg);
		border: none;
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-secondary {
		background-color: #333333;
		color: var(--color-text-primary);
	}

	.btn-secondary:hover:not(:disabled) {
		background-color: #444444;
	}

	.btn-primary {
		background-color: var(--color-node-product);
		color: #000;
	}

	.btn-primary:hover:not(:disabled) {
		filter: brightness(1.1);
	}
</style>
