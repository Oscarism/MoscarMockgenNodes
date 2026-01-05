<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	// Dynamic GSAP import (only in browser)
	let gsap: any;

	interface Props {
		imageUrl: string;
		modelLabel: string;
		isOpen: boolean;
		onClose: () => void;
		onDownload: () => void;
		onHide?: () => void;
	}

	let { imageUrl, modelLabel, isOpen, onClose, onDownload, onHide }: Props = $props();

	let overlayEl: HTMLDivElement;
	let contentEl: HTMLDivElement;

	// Handle escape key
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && isOpen) {
			onClose();
		}
	}

	// Animate on open
	$effect(() => {
		if (isOpen && overlayEl && contentEl) {
			gsap.fromTo(overlayEl, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' });
			gsap.fromTo(
				contentEl,
				{ opacity: 0, scale: 0.9, y: 20 },
				{ opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'power3.out', delay: 0.1 }
			);
		}
	});

	function handleClose() {
		if (overlayEl && contentEl) {
			gsap.to(contentEl, {
				opacity: 0,
				scale: 0.95,
				y: 10,
				duration: 0.2,
				ease: 'power2.in'
			});
			gsap.to(overlayEl, {
				opacity: 0,
				duration: 0.25,
				ease: 'power2.in',
				onComplete: onClose
			});
		} else {
			onClose();
		}
	}

	onMount(async () => {
		// Load GSAP only in browser
		const gsapModule = await import('gsap');
		gsap = gsapModule.gsap;

		window.addEventListener('keydown', handleKeydown);
	});

	onDestroy(() => {
		if (browser) {
			window.removeEventListener('keydown', handleKeydown);
		}
	});
</script>

{#if isOpen}
	<div
		class="lightbox-overlay"
		bind:this={overlayEl}
		onclick={handleClose}
		role="dialog"
		aria-modal="true"
		aria-label="Image viewer"
	>
		<div class="lightbox-content" bind:this={contentEl} onclick={(e) => e.stopPropagation()}>
			<div class="image-container">
				<img src={imageUrl} alt="Generated image" class="lightbox-image" />

				<!-- Model tag - bottom left -->
				<div class="model-tag">{modelLabel}</div>
			</div>

			<!-- Controls - right side -->
			<div class="controls">
				<button class="control-btn" onclick={onDownload} aria-label="Download image">
					<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
						<path
							d="M10 3V12M10 12L6 8M10 12L14 8M3 17H17"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</button>
				{#if onHide}
					<button
						class="control-btn delete-btn"
						onclick={() => {
							if (confirm('Delete this image permanently?\n\nThis action cannot be undone.')) {
								onHide();
							}
						}}
						aria-label="Delete image"
					>
						<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
							<path
								d="M3 5H17M7 5V3C7 2.44772 7.44772 2 8 2H12C12.5523 2 13 2.44772 13 3V5M15 5V17C15 17.5523 14.5523 18 14 18H6C5.44772 18 5 17.5523 5 17V5H15Z"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
							<path
								d="M8 9V14M12 9V14"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
							/>
						</svg>
					</button>
				{/if}
				<button class="control-btn close-btn" onclick={handleClose} aria-label="Close">
					<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
						<path
							d="M5 15L15 5M5 5L15 15"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
						/>
					</svg>
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.lightbox-overlay {
		position: fixed;
		inset: 0;
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.85);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
	}

	.lightbox-content {
		position: relative;
		display: flex;
		align-items: flex-end;
		gap: 16px;
		padding: 20px;
		max-width: 95vw;
		max-height: 95vh;
	}

	.image-container {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.lightbox-image {
		max-width: 90vw;
		max-height: 90vh;
		width: auto;
		height: auto;
		border-radius: 12px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
		object-fit: contain;
	}

	.model-tag {
		position: absolute;
		bottom: 16px;
		left: 16px;
		padding: 6px 12px;
		background: rgba(18, 18, 18, 0.8);
		backdrop-filter: blur(4px);
		border: 1px solid rgba(201, 254, 110, 0.3);
		border-radius: 6px;
		font-size: 13px;
		font-weight: 500;
		color: var(--color-node-product, #c9fe6e);
	}

	.controls {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 8px;
		background: rgba(18, 18, 18, 0.6);
		backdrop-filter: blur(8px);
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.control-btn {
		width: 44px;
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 8px;
		color: #fff;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.control-btn:hover {
		background: rgba(201, 254, 110, 0.2);
		border-color: var(--color-node-product, #c9fe6e);
		color: var(--color-node-product, #c9fe6e);
		transform: scale(1.05);
	}

	.close-btn:hover {
		background: rgba(254, 110, 110, 0.2);
		border-color: var(--color-error, #fe6e6e);
		color: var(--color-error, #fe6e6e);
	}

	.delete-btn:hover {
		background: rgba(254, 110, 110, 0.2);
		border-color: var(--color-error, #fe6e6e);
		color: var(--color-error, #fe6e6e);
	}
</style>
