<script lang="ts">
	import { Handle, Position } from '@xyflow/svelte';
	import type { NodeType } from '$lib/types';
	import { NODE_COLORS, NODE_NAMES } from '$lib/types';
	import { connectedToOutput, selectedNodeId } from '$lib/stores/canvas';
	import { onMount } from 'svelte';

	interface Props {
		id: string;
		nodeType: NodeType;
		children?: import('svelte').Snippet;
		showInput?: boolean;
		showOutput?: boolean;
	}

	let { id, nodeType, children, showInput = true, showOutput = true }: Props = $props();

	// Use $derived for values that depend on props
	let color = $derived(NODE_COLORS[nodeType]);
	let name = $derived(NODE_NAMES[nodeType]);

	// Check if connected to output
	let isConnected = $derived($connectedToOutput.has(id));
	let isSelected = $derived($selectedNodeId === id);
</script>

<div
	class="node-wrapper"
	class:connected={isConnected}
	class:selected={isSelected}
	style="--node-color: {color}"
>
	<!-- Input Handle -->
	{#if showInput}
		<Handle
			type="target"
			position={Position.Left}
			class="handle-port"
			style="background-color: var(--color-bg-ui); border-color: {color};"
		/>
	{/if}

	<!-- Node Content -->
	<div class="node-container">
		<div class="node-header">
			<span class="node-title">{name}</span>
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
			class="handle-port"
			style="background-color: var(--color-bg-ui); border-color: {color};"
		/>
	{/if}
</div>

<style>
	.node-wrapper {
		background-color: var(--color-bg-ui);
		border-radius: var(--radius-lg);
		min-width: 280px;
		max-width: 380px;
		box-shadow: var(--shadow-medium);
		transition:
			transform var(--transition-fast),
			box-shadow var(--transition-fast),
			border-color var(--transition-normal);
		animation: nodeEntrance 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

		/* Default: disconnected state */
		border: 2px dashed var(--node-color);
		opacity: 0.85;
	}

	.node-wrapper.connected {
		border-style: solid;
		opacity: 1;
	}

	.node-wrapper.selected {
		box-shadow:
			0 0 0 2px var(--node-color),
			var(--shadow-strong);
	}

	.node-wrapper:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-strong);
	}

	.node-container {
		display: flex;
		flex-direction: column;
	}

	.node-header {
		padding: var(--space-md) var(--space-lg);
		border-bottom: 1px solid var(--color-bg-canvas);
	}

	.node-title {
		font-size: var(--text-lg);
		font-weight: var(--font-medium);
		color: var(--node-color);
	}

	.node-content {
		padding: var(--space-lg);
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	/* Handle styling is done via global CSS and inline styles */
	:global(.handle-port) {
		width: 18px !important;
		height: 18px !important;
		border: 2px solid !important;
		transition:
			transform var(--transition-fast),
			background-color var(--transition-fast);
	}

	:global(.handle-port:hover) {
		transform: scale(1.3);
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
