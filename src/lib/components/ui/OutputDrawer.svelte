<script lang="ts">
	import { generationState, drawerState, setDrawerMode, selectImage } from '$lib/stores/generation';

	let mode = $derived($drawerState.mode);
	let selectedIndex = $derived($drawerState.selectedImageIndex);
	let images = $derived($generationState.generatedImages);
	let isGenerating = $derived($generationState.isGenerating);

	function handleImageClick(index: number) {
		selectImage(index);
	}

	function closeFullscreen() {
		selectImage(null);
		setDrawerMode('expanded');
	}

	function downloadImage(url: string, index: number) {
		// Generate unique alphanumeric ID
		const uniqueId = Math.random().toString(36).substring(2, 10).toUpperCase();
		const timestamp = Date.now().toString(36).toUpperCase();

		const a = document.createElement('a');
		a.href = url;
		a.download = `MOSCAR-${uniqueId}${timestamp}.webp`;
		a.target = '_blank';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}
</script>

<!-- Main Drawer -->
{#if mode !== 'collapsed'}
	<div class="drawer" class:expanded={mode === 'expanded'} class:fullscreen={mode === 'fullscreen'}>
		<!-- Drawer Header -->
		<div class="drawer-header">
			<div class="header-left">
				<h3>Generated Mockups</h3>
				<span class="count">{images.length} images</span>
			</div>
			<div class="header-right">
				{#if mode === 'expanded'}
					<button
						class="header-btn"
						onclick={() => setDrawerMode('fullscreen')}
						aria-label="Enter fullscreen"
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
						aria-label="Exit fullscreen"
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
					class="header-btn close"
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
		</div>

		<!-- Drawer Content -->
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
						<p class="hint">Connect nodes and click "Generate Mockup" to create images.</p>
					{/if}
				</div>
			{:else if selectedIndex !== null && mode === 'fullscreen'}
				<!-- Fullscreen Single Image View -->
				<div class="fullscreen-view">
					<button
						class="nav-btn prev"
						onclick={() => selectImage(Math.max(0, selectedIndex - 1))}
						disabled={selectedIndex === 0}
						aria-label="Previous image"
					>
						‹
					</button>
					<div class="fullscreen-image">
						<img src={images[selectedIndex]} alt="Generated mockup {selectedIndex + 1}" />
					</div>
					<button
						class="nav-btn next"
						onclick={() => selectImage(Math.min(images.length - 1, selectedIndex + 1))}
						disabled={selectedIndex === images.length - 1}
						aria-label="Next image"
					>
						›
					</button>
					<div class="fullscreen-controls">
						<button
							class="control-btn"
							onclick={() => downloadImage(images[selectedIndex], selectedIndex)}
						>
							<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
								<path
									d="M8 2V10M8 10L4 6M8 10L12 6M2 14H14"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
								/>
							</svg>
							Download
						</button>
						<button class="control-btn" onclick={closeFullscreen}> Close </button>
					</div>
				</div>
			{:else}
				<!-- Image Grid -->
				<div class="image-grid">
					{#each images as image, i}
						<div
							class="image-card"
							onclick={() => handleImageClick(i)}
							role="button"
							tabindex="0"
							onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && handleImageClick(i)}
						>
							<img src={image} alt="Generated mockup {i + 1}" />
							<div class="image-overlay">
								<button
									class="overlay-btn"
									onclick={(e) => {
										e.stopPropagation();
										downloadImage(image, i);
									}}
									aria-label="Download image"
								>
									<svg width="14" height="14" viewBox="0 0 16 16" fill="none">
										<path
											d="M8 2V10M8 10L4 6M8 10L12 6M2 14H14"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
										/>
									</svg>
								</button>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.drawer {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: var(--color-bg-ui);
		border-top: 1px solid var(--color-text-muted);
		z-index: var(--z-drawer);
		display: flex;
		flex-direction: column;
		transition: height var(--transition-drawer);
	}

	.drawer.expanded {
		height: 40vh;
	}

	.drawer.fullscreen {
		height: 100vh;
	}

	.drawer-header {
		padding: var(--space-md) var(--space-lg);
		border-bottom: 1px solid var(--color-bg-canvas);
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-shrink: 0;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: var(--space-md);
	}

	.header-left h3 {
		font-size: var(--text-lg);
		font-weight: var(--font-medium);
	}

	.count {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
	}

	.header-right {
		display: flex;
		gap: var(--space-sm);
	}

	.header-btn {
		width: 32px;
		height: 32px;
		border-radius: var(--radius-md);
		background-color: var(--color-bg-canvas);
		color: var(--color-text-primary);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.header-btn:hover {
		background-color: var(--color-bg-hover);
	}

	.header-btn.close:hover {
		background-color: var(--color-error);
	}

	.drawer-content {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-lg);
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: var(--color-text-muted);
		text-align: center;
	}

	.generating {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-md);
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 3px solid var(--color-bg-canvas);
		border-top-color: var(--color-node-product);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.hint {
		font-size: var(--text-sm);
		margin-top: var(--space-sm);
	}

	.image-grid {
		column-count: 3;
		column-gap: var(--space-lg);
	}

	@media (max-width: 1200px) {
		.image-grid {
			column-count: 2;
		}
	}

	@media (max-width: 768px) {
		.image-grid {
			column-count: 1;
		}
	}

	.image-card {
		position: relative;
		border-radius: var(--radius-lg);
		overflow: hidden;
		background-color: var(--color-bg-canvas);
		cursor: pointer;
		transition: transform var(--transition-fast);
		break-inside: avoid;
		margin-bottom: var(--space-lg);
	}

	.image-card:hover {
		transform: scale(1.02);
	}

	.image-card img {
		width: 100%;
		height: auto;
		display: block;
	}

	.image-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
		opacity: 0;
		transition: opacity var(--transition-fast);
		display: flex;
		align-items: flex-end;
		justify-content: flex-end;
		padding: var(--space-sm);
	}

	.image-card:hover .image-overlay {
		opacity: 1;
	}

	.overlay-btn {
		width: 32px;
		height: 32px;
		border-radius: var(--radius-md);
		background-color: var(--color-bg-ui);
		color: var(--color-text-primary);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
	}

	.fullscreen-view {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		gap: var(--space-lg);
		position: relative;
	}

	.fullscreen-image {
		max-width: 80%;
		max-height: calc(100% - 80px);
	}

	.fullscreen-image img {
		max-width: 100%;
		max-height: 100%;
		border-radius: var(--radius-lg);
	}

	.nav-btn {
		width: 48px;
		height: 48px;
		border-radius: var(--radius-full);
		background-color: var(--color-bg-canvas);
		color: var(--color-text-primary);
		font-size: 24px;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.nav-btn:hover:not(:disabled) {
		background-color: var(--color-bg-hover);
	}

	.nav-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.fullscreen-controls {
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: var(--space-md);
		padding: var(--space-md);
	}

	.control-btn {
		padding: var(--space-sm) var(--space-lg);
		background-color: var(--color-bg-canvas);
		border-radius: var(--radius-md);
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		transition: all var(--transition-fast);
	}

	.control-btn:hover {
		background-color: var(--color-bg-hover);
	}
</style>
