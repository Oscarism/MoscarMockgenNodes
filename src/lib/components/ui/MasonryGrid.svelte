<script lang="ts">
	interface Props {
		images: string[];
		imageModelMap: Map<string, string>;
		onImageClick: (url: string, index: number) => void;
	}

	let { images, imageModelMap, onImageClick }: Props = $props();

	// Show only first 20 images
	let displayImages = $derived(images.slice(0, 20));

	// Split images into 4 columns for masonry layout
	let columns = $derived.by(() => {
		const cols: string[][] = [[], [], [], []];
		displayImages.forEach((img, i) => {
			cols[i % 4].push(img);
		});
		return cols;
	});

	import { getModelShortLabel } from '$lib/data/models';
	function getModelLabel(modelId: string | undefined): string {
		if (!modelId) return '';
		return getModelShortLabel(modelId);
	}

	// Calculate original index for click handler
	function getOriginalIndex(colIndex: number, rowIndex: number): number {
		return rowIndex * 4 + colIndex;
	}

	// Detect if a URL is a video
	function isVideoUrl(url: string): boolean {
		return /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url);
	}
</script>

<div class="masonry-grid">
	{#each columns as column, colIndex}
		<div class="column">
			{#each column as image, rowIndex}
				{@const originalIndex = getOriginalIndex(colIndex, rowIndex)}
				<button
					class="image-card"
					onclick={() => onImageClick(image, originalIndex)}
					aria-label="View generated media"
				>
					{#if isVideoUrl(image)}
						<!-- svelte-ignore a11y_media_has_caption -->
						<video src={image} muted playsinline preload="metadata" class="video-thumb"></video>
						<span class="video-badge">▶</span>
					{:else}
						<img src={image} alt="Generated" loading="lazy" />
					{/if}
					{#if imageModelMap.get(image)}
						<span class="model-tag">{getModelLabel(imageModelMap.get(image))}</span>
					{/if}
				</button>
			{/each}
		</div>
	{/each}
</div>

<style>
	.masonry-grid {
		display: flex;
		gap: 12px;
		padding: 16px;
	}

	.column {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.image-card {
		position: relative;
		border: none;
		padding: 0;
		background: transparent;
		border-radius: 10px;
		overflow: hidden;
		cursor: pointer;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}

	.image-card:hover {
		transform: scale(1.02);
		box-shadow: 0 8px 24px rgba(201, 254, 110, 0.15);
	}

	.image-card img,
	.image-card .video-thumb {
		display: block;
		width: 100%;
		height: auto;
	}

	.video-badge {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.6);
		border: 2px solid rgba(255, 255, 255, 0.6);
		color: #fff;
		font-size: 13px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding-left: 2px;
		pointer-events: none;
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

	/* Responsive - 2 columns on smaller screens */
	@media (max-width: 800px) {
		.column:nth-child(3),
		.column:nth-child(4) {
			display: none;
		}
	}
</style>
