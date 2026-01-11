<script lang="ts">
	import {
		loadUserCanvases,
		savedCanvases,
		nodes,
		edges,
		currentCanvasId,
		currentCanvasName,
		presetCanvases,
		loadPresetCanvases
	} from '$lib/stores/canvas';
	import { loadCanvas, deleteCanvas, type DbCanvas } from '$lib/services/canvasDatabase';
	import { user } from '$lib/stores/auth';
	import { toasts } from '$lib/stores/toasts';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
	}

	let { isOpen, onClose }: Props = $props();

	type TabType = 'saves' | 'presets';
	let activeTab = $state<TabType>('saves');
	let selectedCanvasId = $state<string | null>(null);
	let isLoading = $state(false);
	let isDeleting = $state<string | null>(null);

	// Load canvases when dialog opens
	$effect(() => {
		if (isOpen && $user) {
			loadUserCanvases($user.id);
			loadPresetCanvases();
			selectedCanvasId = null;
		}
	});

	async function handleLoad() {
		if (!selectedCanvasId) return;

		isLoading = true;
		try {
			const canvas = await loadCanvas(selectedCanvasId);
			if (canvas) {
				nodes.set(canvas.nodes);
				edges.set(canvas.edges);
				currentCanvasId.set(canvas.id);
				currentCanvasName.set(canvas.name);
				toasts.success(`Loaded: ${canvas.name}`);
				onClose();
			} else {
				toasts.error('Failed to load canvas');
			}
		} finally {
			isLoading = false;
		}
	}

	async function handleDelete(canvasId: string, event: MouseEvent) {
		event.stopPropagation();

		if (!confirm('Are you sure you want to delete this canvas?')) return;

		isDeleting = canvasId;
		try {
			const success = await deleteCanvas(canvasId);
			if (success && $user) {
				await loadUserCanvases($user.id);
				if (selectedCanvasId === canvasId) {
					selectedCanvasId = null;
				}
				toasts.success('Canvas deleted');
			} else {
				toasts.error('Failed to delete canvas');
			}
		} finally {
			isDeleting = null;
		}
	}

	function formatDate(date: Date): string {
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			onClose();
		}
	}
</script>

{#if isOpen}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div class="dialog-overlay" role="dialog" aria-modal="true" onkeydown={handleKeydown}>
		<div class="dialog-backdrop" onclick={onClose}></div>
		<div class="dialog-content">
			<div class="dialog-header">
				<h2>Load Canvas</h2>
				<button class="close-btn" onclick={onClose}>×</button>
			</div>

			<div class="tabs">
				<button
					class="tab"
					class:active={activeTab === 'saves'}
					onclick={() => (activeTab = 'saves')}
				>
					My Saves
				</button>
				<button
					class="tab"
					class:active={activeTab === 'presets'}
					onclick={() => (activeTab = 'presets')}
				>
					Presets
				</button>
			</div>

			<div class="dialog-body">
				{#if activeTab === 'saves'}
					{#if $savedCanvases.length === 0}
						<p class="empty">No saved canvases yet</p>
					{:else}
						<div class="canvas-list">
							{#each $savedCanvases as canvas}
								<!-- svelte-ignore a11y_no_static_element_interactions -->
								<div
									class="canvas-item"
									class:selected={selectedCanvasId === canvas.id}
									onclick={() => (selectedCanvasId = canvas.id)}
									onkeypress={(e) => e.key === 'Enter' && (selectedCanvasId = canvas.id)}
									role="option"
									aria-selected={selectedCanvasId === canvas.id}
									tabindex="0"
								>
									<div class="canvas-info">
										<div class="canvas-name">
											{#if canvas.isDefault}
												<span class="default-star">★</span>
											{/if}
											{canvas.name}
										</div>
										<div class="canvas-meta">
											{canvas.nodeCount} nodes · {formatDate(canvas.updatedAt)}
										</div>
									</div>
									<button
										class="delete-btn"
										onclick={(e) => handleDelete(canvas.id, e)}
										disabled={isDeleting === canvas.id}
										title="Delete canvas"
									>
										{isDeleting === canvas.id ? '...' : '×'}
									</button>
								</div>
							{/each}
						</div>
					{/if}
				{:else if $presetCanvases.length === 0}
					<p class="empty">No preset templates available</p>
				{:else}
					<div class="canvas-list">
						{#each $presetCanvases as preset}
							<button
								class="canvas-item"
								class:selected={selectedCanvasId === preset.id}
								onclick={() => (selectedCanvasId = preset.id)}
							>
								<div class="canvas-info">
									<div class="canvas-name">{preset.name}</div>
									{#if preset.description}
										<div class="canvas-meta">{preset.description}</div>
									{/if}
								</div>
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<div class="dialog-footer">
				<button class="btn btn-secondary" onclick={onClose}>Cancel</button>
				<button
					class="btn btn-primary"
					onclick={handleLoad}
					disabled={!selectedCanvasId || isLoading}
				>
					{isLoading ? 'Loading...' : 'Load'}
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
		max-width: 500px;
		max-height: 80vh;
		margin: var(--space-lg);
		display: flex;
		flex-direction: column;
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

	.tabs {
		display: flex;
		border-bottom: 1px solid #333;
	}

	.tab {
		flex: 1;
		padding: var(--space-md);
		background: transparent;
		border: none;
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
		cursor: pointer;
		transition: all var(--transition-fast);
		position: relative;
	}

	.tab:hover {
		color: var(--color-text-primary);
		background-color: rgba(255, 255, 255, 0.05);
	}

	.tab.active {
		color: var(--color-node-product);
	}

	.tab.active::after {
		content: '';
		position: absolute;
		bottom: -1px;
		left: 0;
		right: 0;
		height: 2px;
		background-color: var(--color-node-product);
	}

	.dialog-body {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-md);
		min-height: 200px;
	}

	.empty {
		color: var(--color-text-muted);
		text-align: center;
		padding: var(--space-xl);
	}

	.canvas-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.canvas-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-md);
		background-color: #1a1a1a;
		border: 1px solid transparent;
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all var(--transition-fast);
		text-align: left;
		width: 100%;
	}

	.canvas-item:hover {
		background-color: #252525;
	}

	.canvas-item.selected {
		border-color: var(--color-node-product);
		background-color: rgba(255, 193, 7, 0.1);
	}

	.canvas-info {
		flex: 1;
		min-width: 0;
	}

	.canvas-name {
		font-size: var(--text-sm);
		color: var(--color-text-primary);
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.default-star {
		color: var(--color-node-product);
	}

	.canvas-meta {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		margin-top: var(--space-tiny);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.delete-btn {
		width: 24px;
		height: 24px;
		border-radius: var(--radius-full);
		background-color: transparent;
		border: none;
		color: var(--color-text-muted);
		font-size: var(--text-md);
		cursor: pointer;
		transition: all var(--transition-fast);
		flex-shrink: 0;
	}

	.delete-btn:hover:not(:disabled) {
		background-color: var(--color-error);
		color: white;
	}

	.delete-btn:disabled {
		opacity: 0.5;
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
