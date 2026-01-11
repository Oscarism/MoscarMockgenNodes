<script lang="ts">
	import { addNode } from '$lib/stores/canvas';
	import type { NodeType } from '$lib/types';
	import { NODE_COLORS, NODE_NAMES } from '$lib/types';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
	}

	let { isOpen, onClose }: Props = $props();

	// Grouped node types for the palette
	const nodeGroups: { name: string; types: NodeType[] }[] = [
		{
			name: 'Starter',
			types: ['product', 'photography', 'image', 'reference', 'batch', 'custom']
		},
		{
			name: 'Subject',
			types: ['human', 'clothing', 'pose', 'plant', 'animal', 'accessory', 'expression']
		},
		{
			name: 'Scene',
			types: [
				'scene',
				'background',
				'style',
				'branding',
				'texture',
				'lighting',
				'camera',
				'furniture'
			]
		},
		{
			name: 'Output',
			types: ['output', 'quality', 'variation', 'refine', 'upscale']
		}
	];

	function handleAddNode(type: NodeType) {
		const x = 200 + Math.random() * 100;
		const y = 100 + Math.random() * 100;
		addNode(type, { x, y });
		onClose();
	}
</script>

{#if isOpen}
	<div class="node-palette">
		<div class="palette-grid">
			{#each nodeGroups as group}
				<div class="palette-column">
					<div class="group-header">{group.name}</div>
					{#each group.types as type}
						<button
							class="node-option"
							onclick={() => handleAddNode(type)}
							style="--node-color: {NODE_COLORS[type]}"
						>
							<span class="node-dot"></span>
							{NODE_NAMES[type]}
						</button>
					{/each}
				</div>
			{/each}
		</div>
	</div>
{/if}

<style>
	.node-palette {
		position: absolute;
		top: calc(100% + 8px);
		min-width: 580px;
		right: 50%;
		left: auto;
		transform: translateX(50%);
		background-color: #222222;
		border-radius: var(--radius-lg);
		padding: var(--space-sm);
		z-index: var(--z-dropdown);
		animation: slideUpCentered 0.2s ease-out;
	}

	.palette-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--space-md);
		padding: var(--space-sm);
	}

	.palette-column {
		display: flex;
		flex-direction: column;
		gap: var(--space-tiny);
	}

	.group-header {
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		padding: var(--space-sm) var(--space-sm);
		font-weight: var(--font-semibold);
		border-bottom: 1px solid #444;
		margin-bottom: var(--space-tiny);
	}

	.node-option {
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		text-align: left;
		border-radius: var(--radius-md);
		background-color: transparent;
		border: none;
		cursor: pointer;
		transition: background-color var(--transition-fast);
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		white-space: nowrap;
	}

	.node-option:hover {
		background-color: #333333;
	}

	.node-dot {
		width: 10px;
		height: 10px;
		border-radius: var(--radius-full);
		background-color: var(--node-color);
	}

	@keyframes slideUpCentered {
		from {
			opacity: 0;
			transform: translateX(50%) translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateX(50%) translateY(0);
		}
	}
</style>
