<script lang="ts">
	import type { GenerationRecord } from '$lib/types';

	interface Props {
		records: GenerationRecord[];
		onImageClick: (url: string, record: GenerationRecord) => void;
	}

	let { records, onImageClick }: Props = $props();

	// Flatten all images from records (skip first 20 since MasonryGrid shows those)
	let allImages = $derived.by(() => {
		const images: { url: string; record: GenerationRecord }[] = [];

		for (const record of records) {
			if (!record.resultUrls?.length) continue;
			for (const url of record.resultUrls) {
				images.push({ url, record });
			}
		}

		// Skip first 20 (shown in MasonryGrid), return rest
		return images.slice(20);
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
</script>

{#if allImages.length > 0}
	<div class="history-section">
		<div class="section-header">
			<span class="label">Previous Generations</span>
			<span class="count">{allImages.length}</span>
		</div>
		<div class="image-grid">
			{#each allImages as img}
				<button
					class="image-card"
					onclick={() => onImageClick(img.url, img.record)}
					aria-label="View image"
				>
					<img src={img.url} alt="Generation" loading="lazy" />
					{#if img.record.model}
						<span class="model-tag">{getModelLabel(img.record.model)}</span>
					{/if}
				</button>
			{/each}
		</div>
	</div>
{/if}

<style>
	.history-section {
		padding: 0 16px 24px;
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 16px 0 12px;
		border-top: 1px solid rgba(255, 255, 255, 0.08);
	}

	.label {
		font-size: 13px;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: var(--color-text-muted, #666);
	}

	.count {
		font-size: 11px;
		color: var(--color-text-muted, #888);
		padding: 2px 8px;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 10px;
	}

	.image-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
		gap: 10px;
	}

	.image-card {
		position: relative;
		aspect-ratio: 1;
		border: none;
		padding: 0;
		background: rgba(255, 255, 255, 0.03);
		cursor: pointer;
		border-radius: 8px;
		overflow: hidden;
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}

	.image-card:hover {
		transform: scale(1.03);
		box-shadow: 0 6px 20px rgba(201, 254, 110, 0.12);
	}

	.image-card img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.model-tag {
		position: absolute;
		bottom: 4px;
		left: 4px;
		padding: 2px 5px;
		background: rgba(18, 18, 18, 0.8);
		backdrop-filter: blur(4px);
		border-radius: 3px;
		font-size: 9px;
		font-weight: 600;
		color: var(--color-node-product, #c9fe6e);
		text-transform: uppercase;
		letter-spacing: 0.3px;
	}
</style>
