<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	// Dynamic GSAP import (only in browser)
	let gsap: any;

	interface Props {
		images: string[];
		imageModelMap: Map<string, string>;
		onImageClick: (url: string, index: number) => void;
	}

	let { images, imageModelMap, onImageClick }: Props = $props();

	let gridEl: HTMLDivElement;
	let col1El: HTMLDivElement;
	let col2El: HTMLDivElement;
	let col3El: HTMLDivElement;
	let col4El: HTMLDivElement;

	// Split images into 4 columns
	let columns = $derived.by(() => {
		const cols: string[][] = [[], [], [], []];
		images.forEach((img, i) => {
			cols[i % 4].push(img);
		});
		return cols;
	});

	// Helper to get friendly model name
	function getModelLabel(modelId: string | undefined): string {
		if (!modelId) return '';
		const labels: Record<string, string> = {
			'seedream/4.5-text-to-image': 'Seedream',
			'seedream/4.5-edit': 'Edit',
			'z-image': 'Z-Img',
			'flux-2/pro-image-to-image': 'Flux I2I',
			'nano-banana-pro': 'Nano B.'
		};
		return labels[modelId] || modelId;
	}

	// Parallax scroll handlers
	let yTo1: any, yTo2: any, yTo3: any, yTo4: any;
	let incr = 0;
	let maxScroll = 0;

	// Touch scroll tracking
	let touchStartY = 0;
	let lastTouchY = 0;

	function handleWheel(e: WheelEvent) {
		if (!yTo1 || !yTo2 || !yTo3 || !yTo4) {
			console.log('[MasonryGrid] handleWheel - quickTo not ready');
			return;
		}

		incr -= e.deltaY / 2; // Faster response

		// Clamp to prevent over-scrolling (not infinite)
		incr = Math.max(-maxScroll, Math.min(0, incr));

		console.log('[MasonryGrid] Scroll incr:', incr.toFixed(0), 'deltaY:', e.deltaY);

		// Each column moves at different speeds
		yTo1(incr * 1.0);
		yTo2(incr * 0.85);
		yTo3(incr * 1.15);
		yTo4(incr * 0.7);
	}

	// Touch event handlers for iPad/mobile
	function handleTouchStart(e: TouchEvent) {
		if (e.touches.length === 1) {
			touchStartY = e.touches[0].clientY;
			lastTouchY = touchStartY;
		}
	}

	function handleTouchMove(e: TouchEvent) {
		if (!yTo1 || !yTo2 || !yTo3 || !yTo4 || e.touches.length !== 1) return;

		const currentY = e.touches[0].clientY;
		const deltaY = lastTouchY - currentY; // Inverted for natural scroll direction
		lastTouchY = currentY;

		incr -= deltaY * 1.5; // Adjust sensitivity for touch

		// Clamp to prevent over-scrolling
		incr = Math.max(-maxScroll, Math.min(0, incr));

		// Each column moves at different speeds
		yTo1(incr * 1.0);
		yTo2(incr * 0.85);
		yTo3(incr * 1.15);
		yTo4(incr * 0.7);
	}

	onMount(async () => {
		// Load GSAP only in browser
		const gsapModule = await import('gsap');
		gsap = gsapModule.gsap;

		// Wait for columns to render
		await new Promise((resolve) => setTimeout(resolve, 100));

		if (col1El && col2El && col3El && col4El) {
			// Calculate max scroll based on content height
			const heights = [
				col1El.scrollHeight,
				col2El.scrollHeight,
				col3El.scrollHeight,
				col4El.scrollHeight
			];
			maxScroll = Math.max(...heights) - gridEl.clientHeight;

			console.log(
				'[MasonryGrid] Setting up parallax scroll, maxScroll:',
				maxScroll,
				'gridHeight:',
				gridEl.clientHeight
			);

			// Create quickTo functions for smooth parallax - power3 for smooth deceleration
			yTo1 = gsap.quickTo(col1El, 'y', {
				duration: 0.4,
				ease: 'power3'
			});
			yTo2 = gsap.quickTo(col2El, 'y', {
				duration: 0.6,
				ease: 'power3'
			});
			yTo3 = gsap.quickTo(col3El, 'y', {
				duration: 0.5,
				ease: 'power3'
			});
			yTo4 = gsap.quickTo(col4El, 'y', {
				duration: 0.3,
				ease: 'power3'
			});

			// Animate images in
			const allCards = gridEl.querySelectorAll('.image-card');
			gsap.fromTo(
				allCards,
				{ opacity: 0, y: 30 },
				{
					opacity: 1,
					y: 0,
					duration: 0.5,
					stagger: 0.05,
					ease: 'power3.out'
				}
			);
		}

		// Add wheel listener to grid
		gridEl?.addEventListener('wheel', handleWheel, { passive: true });

		// Add touch listeners for iPad/mobile
		gridEl?.addEventListener('touchstart', handleTouchStart, { passive: true });
		gridEl?.addEventListener('touchmove', handleTouchMove, { passive: true });
	});

	onDestroy(() => {
		gridEl?.removeEventListener('wheel', handleWheel);
		gridEl?.removeEventListener('touchstart', handleTouchStart);
		gridEl?.removeEventListener('touchmove', handleTouchMove);
	});

	// Handle image hover
	function handleMouseEnter(el: HTMLDivElement) {
		if (!gsap) return;
		gsap.to(el, {
			scale: 1.02,
			boxShadow: '0 8px 32px rgba(201, 254, 110, 0.15)',
			duration: 0.15,
			ease: 'power1.out'
		});
	}

	function handleMouseLeave(el: HTMLDivElement) {
		if (!gsap) return;
		gsap.to(el, {
			scale: 1,
			boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
			duration: 0.3,
			ease: 'power1.out'
		});
	}
</script>

<div class="masonry-grid" bind:this={gridEl}>
	<div class="column" bind:this={col1El}>
		{#each columns[0] as image, i}
			{@const originalIndex = i * 4}
			<div
				class="image-card"
				onclick={() => onImageClick(image, originalIndex)}
				onmouseenter={(e) => handleMouseEnter(e.currentTarget)}
				onmouseleave={(e) => handleMouseLeave(e.currentTarget)}
				role="button"
				tabindex="0"
				onkeydown={(e) =>
					(e.key === 'Enter' || e.key === ' ') && onImageClick(image, originalIndex)}
			>
				<img src={image} alt="Generated" loading="lazy" />
				{#if imageModelMap.get(image)}
					<span class="model-tag">{getModelLabel(imageModelMap.get(image))}</span>
				{/if}
			</div>
		{/each}
	</div>
	<div class="column" bind:this={col2El}>
		{#each columns[1] as image, i}
			{@const originalIndex = i * 4 + 1}
			<div
				class="image-card"
				onclick={() => onImageClick(image, originalIndex)}
				onmouseenter={(e) => handleMouseEnter(e.currentTarget)}
				onmouseleave={(e) => handleMouseLeave(e.currentTarget)}
				role="button"
				tabindex="0"
				onkeydown={(e) =>
					(e.key === 'Enter' || e.key === ' ') && onImageClick(image, originalIndex)}
			>
				<img src={image} alt="Generated" loading="lazy" />
				{#if imageModelMap.get(image)}
					<span class="model-tag">{getModelLabel(imageModelMap.get(image))}</span>
				{/if}
			</div>
		{/each}
	</div>
	<div class="column" bind:this={col3El}>
		{#each columns[2] as image, i}
			{@const originalIndex = i * 4 + 2}
			<div
				class="image-card"
				onclick={() => onImageClick(image, originalIndex)}
				onmouseenter={(e) => handleMouseEnter(e.currentTarget)}
				onmouseleave={(e) => handleMouseLeave(e.currentTarget)}
				role="button"
				tabindex="0"
				onkeydown={(e) =>
					(e.key === 'Enter' || e.key === ' ') && onImageClick(image, originalIndex)}
			>
				<img src={image} alt="Generated" loading="lazy" />
				{#if imageModelMap.get(image)}
					<span class="model-tag">{getModelLabel(imageModelMap.get(image))}</span>
				{/if}
			</div>
		{/each}
	</div>
	<div class="column" bind:this={col4El}>
		{#each columns[3] as image, i}
			{@const originalIndex = i * 4 + 3}
			<div
				class="image-card"
				onclick={() => onImageClick(image, originalIndex)}
				onmouseenter={(e) => handleMouseEnter(e.currentTarget)}
				onmouseleave={(e) => handleMouseLeave(e.currentTarget)}
				role="button"
				tabindex="0"
				onkeydown={(e) =>
					(e.key === 'Enter' || e.key === ' ') && onImageClick(image, originalIndex)}
			>
				<img src={image} alt="Generated" loading="lazy" />
				{#if imageModelMap.get(image)}
					<span class="model-tag">{getModelLabel(imageModelMap.get(image))}</span>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	.masonry-grid {
		display: flex;
		gap: 1.2vw;
		padding: 1.2vw;
		overflow: hidden;
		height: 100%;
		/* Allow touch scrolling */
		touch-action: pan-y;
		-webkit-overflow-scrolling: touch;
	}

	.column {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 1.2vw;
	}

	.image-card {
		position: relative;
		border-radius: 8px;
		overflow: hidden;
		cursor: pointer;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
		flex-shrink: 0;
	}

	.image-card img {
		display: block;
		width: 100%;
		height: auto;
	}

	.model-tag {
		position: absolute;
		bottom: 8px;
		left: 8px;
		padding: 4px 8px;
		background: rgba(18, 18, 18, 0.85);
		backdrop-filter: blur(4px);
		border-radius: 4px;
		font-size: 11px;
		font-weight: 600;
		color: var(--color-node-product, #c9fe6e);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	/* Responsive - reduce columns on smaller screens */
	@media (max-width: 1000px) {
		.masonry-grid {
			/* Hide last 2 columns on medium screens */
		}
		.column:nth-child(3),
		.column:nth-child(4) {
			display: none;
		}
	}
</style>
