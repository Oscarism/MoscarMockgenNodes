<script lang="ts">
	import { addNode, nodes } from '$lib/stores/canvas';
	import type { NodeType } from '$lib/types';
	import { NODE_COLORS, NODE_NAMES } from '$lib/types';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
	}

	let { isOpen, onClose }: Props = $props();

	// Description for each node — shown in the info bar on hover
	const NODE_DESC: Record<NodeType, string> = {
		output:          'Trigger generation. Enhance the prompt with AI, pick batch count, and generate. Always required.',
		quality:         'Choose model(s), aspect ratio, quality and resolution. Always required.',
		product:         'Define the main product subject — category, specs, and default prompt text.',
		photography:     'Pick a photography style preset (editorial, beauty, lifestyle…). Auto-enhances the compiled prompt.',
		image:           'Upload one or more images as I2I input or visual reference for compatible models.',
		reference:       'Named reference images (Image 1, Image 2…) the model uses to match a specific style or subject.',
		custom:          'Write free-form prompt text to add anything not covered by structured nodes.',
		batch:           'Queue a set of images and run the same prompt across all of them — great for product line variants.',
		human:           'Add a human subject — gender, ethnicity, age, body type, hair, skin and more.',
		clothing:        'Dress the human subject — garment type, style, color and fit.',
		pose:            'Set body language and pose for a human subject.',
		expression:      'Control facial expression, mood, smile intensity, eye contact and head tilt.',
		animal:          'Add an animal subject with species, breed, age, coat and behavior.',
		plant:           'Add a plant or botanical element.',
		accessory:       'Add accessories — jewelry, bags, hats — with material, style and placement control.',
		scene:           'Describe the environment and setting: indoor, outdoor, urban, nature, abstract.',
		background:      'Set background color, gradient, environment, time of day, atmospheric mood and blur.',
		lighting:        'Define light source, direction and quality — golden hour, studio strobe, dramatic rim.',
		camera:          'Control shot angle, subject distance and depth of field.',
		style:           'Set the overall artistic style, color palette and design movement.',
		texture:         'Add texture and material surface detail — rough concrete, brushed metal, soft fabric.',
		furniture:       'Add a furniture piece to the scene with style, material and setting options.',
		branding:        'Overlay custom text or a logo with font, size, color and placement control.',
		variation:       'Generate multiple prompt variants in one run. Use {option A|option B|option C} syntax in any node.',
		refine:          'Give natural-language edit instructions to refine or alter an existing generated image.',
		upscale:         'Upscale a generated image to 4K, 5K or 6K using the SeedVR2 model via ComfyUI.',
		compare:         'Place two images side by side with a draggable slider — before/after or model A vs B.',
		'video-upload':  'Upload video frames to use as motion reference.',
		'video-quality': 'Set video model (Kling 3.0), generation mode (std/pro), duration and aspect ratio.',
		'video-output':  'Trigger video generation from connected video nodes.',
		'motion-control':'Guide video motion direction using an image and a reference video clip.'
	};

	const nodeGroups: { name: string; hint: string; types: NodeType[] }[] = [
		{
			name: 'Core',
			hint: 'Always required',
			types: ['output', 'quality']
		},
		{
			name: 'Start',
			hint: 'Inputs & subjects',
			types: ['product', 'photography', 'image', 'reference', 'custom', 'batch']
		},
		{
			name: 'Subject',
			hint: 'People, animals & things',
			types: ['human', 'clothing', 'pose', 'expression', 'animal', 'plant', 'accessory']
		},
		{
			name: 'Scene',
			hint: 'Environment & style',
			types: ['scene', 'background', 'lighting', 'camera', 'style', 'texture', 'furniture', 'branding']
		},
		{
			name: 'Creative',
			hint: 'Variations, edits & post',
			types: ['variation', 'refine', 'upscale', 'compare']
		},
		{
			name: 'Video',
			hint: 'Video generation',
			types: ['video-upload', 'video-quality', 'video-output', 'motion-control']
		}
	];

	let hoveredType = $state<NodeType | null>(null);

	function handleAddNode(type: NodeType) {
		const GAP = 40;
		const DEFAULT_W = 320;
		const DEFAULT_H = 200;

		const existing = $nodes;
		let x: number;
		let y: number;

		if (existing.length === 0) {
			x = 180;
			y = 120;
		} else {
			// Find the rightmost right-edge across all nodes
			let maxRight = -Infinity;
			let avgY = 0;
			for (const n of existing) {
				const w = n.measured?.width ?? DEFAULT_W;
				const right = n.position.x + w;
				if (right > maxRight) maxRight = right;
				avgY += n.position.y + (n.measured?.height ?? DEFAULT_H) / 2;
			}
			avgY /= existing.length;
			x = maxRight + GAP;
			y = avgY - DEFAULT_H / 2;
		}

		addNode(type, { x, y });
		onClose();
	}
</script>

{#if isOpen}
	<!-- Backdrop -->
	<div class="backdrop" onclick={onClose} aria-hidden="true"></div>

	<!-- Palette panel -->
	<div class="palette">

		<!-- Node columns -->
		<div class="palette-grid">
			{#each nodeGroups as group}
				<div class="palette-col" class:col-core={group.name === 'Core'}>
					<div class="col-header">
						<span class="col-name">{group.name}</span>
					</div>
					{#each group.types as type}
						<button
							class="node-btn"
							class:node-btn-core={group.name === 'Core'}
							onclick={() => handleAddNode(type)}
							onmouseenter={() => (hoveredType = type)}
							onmouseleave={() => (hoveredType = null)}
							style="--node-color: {NODE_COLORS[type]}"
						>
							<span class="node-swatch"></span>
							<span class="node-name">{NODE_NAMES[type]}</span>
						</button>
					{/each}
				</div>
			{/each}
		</div>

		<!-- Description bar -->
		<div class="info-bar">
			{#if hoveredType}
				<span class="info-label" style="color: {NODE_COLORS[hoveredType]}">{NODE_NAMES[hoveredType]}</span>
				<span class="info-sep">—</span>
				<span class="info-desc">{NODE_DESC[hoveredType]}</span>
			{:else}
				<span class="info-placeholder">Hover a node to see what it does</span>
			{/if}
		</div>

	</div>
{/if}

<style>
	/* ── Backdrop ──────────────────────────────── */
	.backdrop {
		position: fixed;
		inset: 0;
		z-index: calc(var(--z-dropdown) - 1);
	}

	/* ── Palette panel ─────────────────────────── */
	.palette {
		position: absolute;
		top: calc(100% + 8px);
		left: 50%;
		transform: translateX(-50%);
		z-index: var(--z-dropdown);

		/* Glassmorphism */
		background: rgba(22, 22, 22, 0.88);
		backdrop-filter: blur(18px);
		-webkit-backdrop-filter: blur(18px);
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: var(--radius-xl);
		box-shadow:
			0 24px 48px rgba(0, 0, 0, 0.6),
			inset 0 1px 0 rgba(255, 255, 255, 0.04);

		overflow: hidden;
		animation: paletteIn 0.18s cubic-bezier(0.2, 0, 0, 1);
	}

	@keyframes paletteIn {
		from {
			opacity: 0;
			transform: translateX(-50%) translateY(6px);
		}
		to {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
	}

	/* ── Grid ──────────────────────────────────── */
	.palette-grid {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		gap: 0;
		padding: var(--space-md);
		padding-bottom: var(--space-sm);
	}

	/* ── Column ────────────────────────────────── */
	.palette-col {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 0 var(--space-sm);
	}

	/* Divider between Core and the rest */
	.palette-col:nth-child(2) {
		border-left: 1px solid rgba(255, 255, 255, 0.06);
	}

	.col-header {
		display: flex;
		flex-direction: column;
		gap: 1px;
		padding: var(--space-sm) var(--space-sm) var(--space-sm);
		margin-bottom: 2px;
	}

	.col-name {
		font-size: var(--text-xs);
		font-weight: var(--font-bold);
		color: var(--color-text-primary);
		text-transform: uppercase;
		letter-spacing: 0.6px;
	}

	/* ── Node button ───────────────────────────── */
	.node-btn {
		width: 100%;
		padding: 6px var(--space-sm);
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		background: transparent;
		border: none;
		border-radius: var(--radius-md);
		cursor: pointer;
		text-align: left;
		transition: background var(--transition-fast);
		white-space: nowrap;
	}

	.node-btn:hover {
		background: rgba(255, 255, 255, 0.06);
	}

	.node-swatch {
		width: 8px;
		height: 8px;
		border-radius: 2px;
		background-color: var(--node-color);
		flex-shrink: 0;
		opacity: 0.9;
	}

	.node-name {
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
		transition: color var(--transition-fast);
		line-height: 1.3;
	}

	.node-btn:hover .node-name {
		color: var(--color-text-primary);
	}

	/* Core nodes slightly more prominent */
	.node-btn-core .node-swatch {
		width: 10px;
		height: 10px;
	}

	.node-btn-core .node-name {
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--color-text-primary);
	}

	/* ── Info bar ──────────────────────────────── */
	.info-bar {
		display: flex;
		align-items: baseline;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-lg);
		border-top: 1px solid rgba(255, 255, 255, 0.05);
		min-height: 36px;
	}

	.info-label {
		font-size: var(--text-xs);
		font-weight: var(--font-bold);
		white-space: nowrap;
		flex-shrink: 0;
	}

	.info-sep {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		flex-shrink: 0;
	}

	.info-desc {
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
		line-height: 1.4;
	}

	.info-placeholder {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		font-style: italic;
	}
</style>
