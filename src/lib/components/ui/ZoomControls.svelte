<script lang="ts">
	interface Props {
		onZoomIn: () => void;
		onZoomOut: () => void;
		onFitView: () => void;
	}

	let { onZoomIn, onZoomOut, onFitView }: Props = $props();
</script>

<div class="zoom-controls">
	<button class="zoom-btn" onclick={onZoomIn} title="Zoom In">
		<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
			<path d="M8 3V13M3 8H13" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
		</svg>
	</button>
	<button class="zoom-btn" onclick={onZoomOut} title="Zoom Out">
		<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
			<path d="M3 8H13" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
		</svg>
	</button>
	<button class="zoom-btn fit" onclick={onFitView} title="Fit View">
		<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
			<path
				d="M2 6V2H6M10 2H14V6M14 10V14H10M6 14H2V10"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
			/>
		</svg>
	</button>
</div>

<style>
	.zoom-controls {
		position: fixed;
		bottom: 130px;
		left: 16px;
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		z-index: var(--z-ui);
	}

	.zoom-btn {
		width: 40px;
		height: 40px;
		border-radius: var(--radius-md);
		background-color: var(--color-bg-ui);
		border: 1px solid var(--color-text-muted);
		color: var(--color-text-primary);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.zoom-btn:hover {
		border-color: var(--color-node-product);
		color: var(--color-node-product);
	}
</style>
