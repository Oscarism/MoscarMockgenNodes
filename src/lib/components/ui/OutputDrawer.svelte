<script lang="ts">
	import { onMount } from 'svelte';
	import {
		generationState,
		drawerState,
		setDrawerMode,
		generationHistory,
		hiddenImages,
		visibleImages
	} from '$lib/stores/generation';
	import ImageLightbox from './ImageLightbox.svelte';
	import { toasts } from '$lib/stores/toasts';

	// Dynamic GSAP import (only in browser)
	let gsap: any;
	import MasonryGrid from './MasonryGrid.svelte';
	import WeeklyHistoryList from './WeeklyHistoryList.svelte';
	import type { GenerationRecord } from '$lib/types';

	let mode = $derived($drawerState.mode);
	let images = $derived($visibleImages); // Use visible images (excludes hidden)
	let allImages = $derived($generationState.generatedImages); // All images for count
	let isGenerating = $derived($generationState.isGenerating);
	let history = $derived($generationHistory);
	let hidden = $derived($hiddenImages);

	// Split recent 20 images vs older (from visible images only)
	let recentImages = $derived(images.slice(0, 20));
	let olderRecords = $derived.by(() => {
		// Get records that have resultUrls and exclude the most recent 20 images
		const recentSet = new Set(recentImages);
		return history.filter((r) => {
			if (!r.resultUrls?.length) return false;
			// Check if any of this record's images are NOT in recent and not hidden
			return r.resultUrls.some((url) => !recentSet.has(url) && !hidden.has(url));
		});
	});

	// Create a map from image URL to model name
	let imageModelMap = $derived.by(() => {
		const map = new Map<string, string>();
		for (const record of history) {
			if (record.resultUrls && record.model) {
				for (const url of record.resultUrls) {
					map.set(url, record.model);
				}
			}
		}
		return map;
	});

	// Lightbox state
	let lightboxOpen = $state(false);
	let lightboxImage = $state('');
	let lightboxModel = $state('');

	// Helper to get friendly model name
	function getModelLabel(modelId: string | undefined): string {
		if (!modelId) return 'Unknown';
		const labels: Record<string, string> = {
			'seedream/4.5-text-to-image': 'Seedream',
			'seedream/4.5-edit': 'Seedream Edit',
			'z-image': 'Z-Image',
			'flux-2/pro-image-to-image': 'Flux I2I',
			'nano-banana-pro': 'Nano Banana'
		};
		return labels[modelId] || modelId;
	}

	function openLightbox(url: string) {
		lightboxImage = url;
		lightboxModel = getModelLabel(imageModelMap.get(url));
		lightboxOpen = true;
	}

	function closeLightbox() {
		lightboxOpen = false;
	}

	function downloadCurrentImage() {
		if (!lightboxImage) return;
		const uniqueId = Math.random().toString(36).substring(2, 10).toUpperCase();
		const timestamp = Date.now().toString(36).toUpperCase();
		const a = document.createElement('a');
		a.href = lightboxImage;
		a.download = `MOSCAR-${uniqueId}${timestamp}.webp`;
		a.target = '_blank';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}

	function handleHistoryImageClick(url: string, record: GenerationRecord) {
		openLightbox(url);
	}

	function hideCurrentImage() {
		if (!lightboxImage) return;
		hiddenImages.hide(lightboxImage);
		toasts.success('Image hidden from gallery');
		closeLightbox();
	}

	// Drawer element ref for animation
	let drawerEl: HTMLDivElement;

	// Load GSAP on mount
	onMount(async () => {
		console.log('[OutputDrawer] Loading GSAP...');
		const gsapModule = await import('gsap');
		gsap = gsapModule.gsap;
		console.log('[OutputDrawer] GSAP loaded:', gsap);
	});

	// Animate drawer open/close
	$effect(() => {
		console.log(
			'[OutputDrawer] $effect triggered, mode:',
			mode,
			'gsap:',
			!!gsap,
			'drawerEl:',
			!!drawerEl
		);

		if (!drawerEl || !gsap) {
			console.log('[OutputDrawer] Skipping animation - missing', !drawerEl ? 'drawerEl' : 'gsap');
			return;
		}

		console.log('[OutputDrawer] Running GSAP animation for mode:', mode);

		if (mode === 'collapsed') {
			gsap.to(drawerEl, {
				y: '100%',
				opacity: 0,
				duration: 0.4,
				ease: 'power3.inOut'
			});
		} else if (mode === 'expanded') {
			gsap.to(drawerEl, {
				y: 0,
				opacity: 1,
				height: '45vh',
				duration: 0.5,
				ease: 'power3.out'
			});
		} else if (mode === 'fullscreen') {
			gsap.to(drawerEl, {
				y: 0,
				opacity: 1,
				height: '100vh',
				duration: 0.5,
				ease: 'power3.out'
			});
		}
	});
</script>

<!-- Drawer Container -->
<div
	class="drawer"
	class:visible={mode !== 'collapsed'}
	class:fullscreen={mode === 'fullscreen'}
	bind:this={drawerEl}
>
	<!-- Transparent Fixed Header -->
	<header class="drawer-header">
		<div class="header-left">
			<h3>Generated Images</h3>
			<span class="count">{images.length}{hidden.size > 0 ? ` (${hidden.size} hidden)` : ''}</span>
		</div>
		<div class="header-right">
			{#if mode === 'expanded'}
				<button
					class="header-btn"
					onclick={() => setDrawerMode('fullscreen')}
					aria-label="Expand to fullscreen"
				>
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
						<path
							d="M2 6V2H6M10 2H14V6M14 10V14H10M6 14H2V10"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
						/>
					</svg>
				</button>
			{:else if mode === 'fullscreen'}
				<button
					class="header-btn"
					onclick={() => setDrawerMode('expanded')}
					aria-label="Collapse from fullscreen"
				>
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
						<path
							d="M6 2V6H2M14 6H10V2M10 14V10H14M2 10H6V14"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
						/>
					</svg>
				</button>
			{/if}
			<button
				class="header-btn close-btn"
				onclick={() => setDrawerMode('collapsed')}
				aria-label="Close drawer"
			>
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
					<path
						d="M4 12L12 4M4 4L12 12"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
					/>
				</svg>
			</button>
		</div>
	</header>

	<!-- Scrollable Content -->
	<div class="drawer-content">
		{#if images.length === 0}
			<div class="empty-state">
				{#if isGenerating}
					<div class="generating">
						<div class="spinner"></div>
						<p>Generating your mockup...</p>
					</div>
				{:else}
					<p>No images generated yet.</p>
					<p class="hint">Connect nodes and click "Generate" to create images.</p>
				{/if}
			</div>
		{:else}
			<!-- Recent Images - Masonry Grid -->
			{#if recentImages.length > 0}
				<MasonryGrid
					images={recentImages}
					{imageModelMap}
					onImageClick={(url, i) => openLightbox(url)}
				/>
			{/if}

			<!-- Older Images - Weekly List -->
			{#if olderRecords.length > 0}
				<WeeklyHistoryList records={olderRecords} onImageClick={handleHistoryImageClick} />
			{/if}
		{/if}
	</div>
</div>

<!-- Image Lightbox -->
<ImageLightbox
	imageUrl={lightboxImage}
	modelLabel={lightboxModel}
	isOpen={lightboxOpen}
	onClose={closeLightbox}
	onDownload={downloadCurrentImage}
	onHide={hideCurrentImage}
/>

<style>
	.drawer {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 45vh;
		background: #121212;
		border-top: 1px solid #c9fe6e;
		z-index: var(--z-drawer, 300);
		display: flex;
		flex-direction: column;
		transform: translateY(100%);
		opacity: 0;
		transition:
			transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
			opacity 0.3s ease,
			height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		pointer-events: none;
	}

	.drawer.visible {
		transform: translateY(0);
		opacity: 1;
		pointer-events: auto;
	}

	.drawer.fullscreen {
		height: 100vh;
	}

	/* Transparent pinned header */
	.drawer-header {
		position: sticky;
		top: 0;
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 20px;
		background: rgba(18, 18, 18, 0.85);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border-bottom: 1px solid rgba(201, 254, 110, 0.15);
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.header-left h3 {
		margin: 0;
		font-size: 15px;
		font-weight: 600;
		color: #fff;
	}

	.count {
		padding: 3px 10px;
		background: rgba(201, 254, 110, 0.15);
		border-radius: 12px;
		font-size: 12px;
		font-weight: 600;
		color: var(--color-node-product, #c9fe6e);
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.header-btn {
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 8px;
		color: #fff;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.header-btn:hover {
		background: rgba(201, 254, 110, 0.15);
		border-color: var(--color-node-product, #c9fe6e);
		color: var(--color-node-product, #c9fe6e);
	}

	.close-btn:hover {
		background: rgba(254, 110, 110, 0.15);
		border-color: var(--color-error, #fe6e6e);
		color: var(--color-error, #fe6e6e);
	}

	/* Scrollable content */
	.drawer-content {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		/* iOS touch scrolling fix */
		-webkit-overflow-scrolling: touch;
		touch-action: pan-y;
		overscroll-behavior: contain;
	}

	/* Empty state */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		min-height: 200px;
		text-align: center;
		color: var(--color-text-secondary, #888);
	}

	.empty-state p {
		margin: 4px 0;
	}

	.empty-state .hint {
		font-size: 13px;
		color: var(--color-text-muted, #666);
	}

	.generating {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
	}

	.spinner {
		width: 32px;
		height: 32px;
		border: 3px solid rgba(201, 254, 110, 0.2);
		border-top-color: var(--color-node-product, #c9fe6e);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
