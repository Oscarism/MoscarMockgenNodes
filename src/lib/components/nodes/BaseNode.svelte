<script lang="ts">
	import { Handle, Position } from '@xyflow/svelte';
	import type { NodeType } from '$lib/types';
	import { NODE_COLORS, NODE_NAMES } from '$lib/types';
	import {
		connectedToOutput,
		selectedNodeId,
		removeNode,
		resetNode,
		toggleBypass,
		bypassedNodes
	} from '$lib/stores/canvas';

	interface Props {
		id: string;
		nodeType: NodeType;
		children?: import('svelte').Snippet;
		showInput?: boolean;
		showOutput?: boolean;
		width?: number;
	}

	let { id, nodeType, children, showInput = true, showOutput = true, width }: Props = $props();

	// Use $derived for values that depend on props
	let color = $derived(NODE_COLORS[nodeType]);
	let name = $derived(NODE_NAMES[nodeType]);

	// Check if connected to output
	let isConnected = $derived($connectedToOutput.has(id));
	let isSelected = $derived($selectedNodeId === id);

	// Check bypass state from derived store (efficient - doesn't re-render all nodes)
	let bypassed = $derived($bypassedNodes.has(id));

	function handleBypass(e: Event) {
		e.stopPropagation();
		toggleBypass(id);
	}

	function handleReset(e: Event) {
		e.stopPropagation();
		resetNode(id);
	}

	function handleDelete(e: Event) {
		e.stopPropagation();
		removeNode(id);
	}
</script>

<div
	class="node-wrapper"
	class:connected={isConnected}
	class:selected={isSelected}
	class:bypassed
	style="--node-color: {color}; {width ? `min-width: ${width}px; max-width: ${width}px;` : ''}"
>
	<!-- Input Handle -->
	{#if showInput}
		<Handle
			type="target"
			position={Position.Left}
			style="background-color: {color};"
		/>
	{/if}

	<!-- Node Content -->
	<div class="node-container">
		<div class="node-header">
			<span class="node-title">{name}</span>
			<div class="node-controls">
				<button
					class="control-btn bypass-btn"
					class:active={bypassed}
					onclick={handleBypass}
					title={bypassed ? 'Enable node' : 'Bypass node'}
					aria-label={bypassed ? 'Enable node' : 'Bypass node'}
				>
					<svg
						width="12"
						height="12"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<circle cx="12" cy="12" r="10" />
						<line x1="4" y1="4" x2="20" y2="20" />
					</svg>
				</button>
				<button
					class="control-btn reset-btn"
					onclick={handleReset}
					title="Reset to defaults"
					aria-label="Reset to defaults"
				>
					<svg
						width="12"
						height="12"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
						<path d="M3 3v5h5" />
					</svg>
				</button>
				<button
					class="control-btn delete-btn"
					onclick={handleDelete}
					title="Delete node"
					aria-label="Delete node"
				>
					<svg
						width="12"
						height="12"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>
			</div>
		</div>
		<div class="node-content nodrag">
			{#if children}
				{@render children()}
			{/if}
		</div>
	</div>

	<!-- Output Handle -->
	{#if showOutput}
		<Handle
			type="source"
			position={Position.Right}
			style="background-color: {color};"
		/>
	{/if}
</div>

<style>
	.node-wrapper {
		position: relative;
		border-radius: var(--radius-lg);
		min-width: 280px;
		max-width: 380px;
		animation: nodeEntrance 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

		/* Glassmorphism base */
		background: rgba(28, 28, 28, 0.72);
		backdrop-filter: blur(14px);
		-webkit-backdrop-filter: blur(14px);
		border: 1px solid rgba(255, 255, 255, 0.04);

		/* Disconnected: faint inner glow */
		box-shadow:
			inset 0 0 28px color-mix(in srgb, var(--node-color) 8%, transparent),
			inset 0 0 0 1px color-mix(in srgb, var(--node-color) 14%, transparent),
			var(--shadow-medium);

		opacity: 0.82;
		transition:
			box-shadow var(--transition-normal),
			opacity var(--transition-fast);
	}

	.node-wrapper.connected {
		opacity: 1;
		box-shadow:
			inset 0 0 40px color-mix(in srgb, var(--node-color) 14%, transparent),
			inset 0 0 0 1px color-mix(in srgb, var(--node-color) 28%, transparent),
			var(--shadow-medium);
	}

	.node-wrapper.selected {
		opacity: 1;
		box-shadow:
			inset 0 0 56px color-mix(in srgb, var(--node-color) 22%, transparent),
			inset 0 0 0 1px color-mix(in srgb, var(--node-color) 50%, transparent),
			0 0 24px color-mix(in srgb, var(--node-color) 12%, transparent),
			var(--shadow-strong);
	}

	.node-wrapper.bypassed {
		opacity: 0.35;
	}

	.node-wrapper:hover {
		box-shadow:
			inset 0 0 40px color-mix(in srgb, var(--node-color) 12%, transparent),
			inset 0 0 0 1px color-mix(in srgb, var(--node-color) 22%, transparent),
			var(--shadow-strong);
	}

	/* Handle glow when node is connected */
	.node-wrapper.connected :global(.svelte-flow__handle-left) {
		opacity: 1 !important;
		box-shadow: -6px 0 12px 1px color-mix(in srgb, var(--node-color) 70%, transparent) !important;
	}

	.node-wrapper.connected :global(.svelte-flow__handle-right) {
		opacity: 1 !important;
		box-shadow: 6px 0 12px 1px color-mix(in srgb, var(--node-color) 70%, transparent) !important;
	}

	.node-container {
		display: flex;
		flex-direction: column;
	}

	.node-header {
		padding: var(--space-md) var(--space-lg);
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.node-title {
		font-size: var(--text-lg);
		font-weight: var(--font-medium);
		color: var(--node-color);
	}

	.node-controls {
		display: flex;
		gap: 4px;
		opacity: 0;
		transition: opacity var(--transition-fast);
	}

	.node-wrapper:hover .node-controls {
		opacity: 1;
	}

	.control-btn {
		width: 22px;
		height: 22px;
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-bg-canvas);
		border: 1px solid var(--color-text-muted);
		border-radius: var(--radius-sm);
		color: var(--color-text-muted);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.control-btn:hover {
		color: var(--color-text-primary);
		border-color: var(--color-text-secondary);
	}

	.bypass-btn.active {
		background: var(--color-warning, #f59e0b);
		border-color: var(--color-warning, #f59e0b);
		color: var(--color-bg-canvas);
	}

	.reset-btn:hover {
		border-color: var(--color-node-product);
		color: var(--color-node-product);
	}

	.delete-btn:hover {
		background: var(--color-error, #ef4444);
		border-color: var(--color-error, #ef4444);
		color: white;
	}

	.node-content {
		padding: var(--space-lg);
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}


	@keyframes nodeEntrance {
		from {
			opacity: 0;
			transform: scale(0.8);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
</style>
