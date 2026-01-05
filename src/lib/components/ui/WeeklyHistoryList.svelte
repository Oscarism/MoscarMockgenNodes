<script lang="ts">
	import { onMount } from 'svelte';
	import type { GenerationRecord } from '$lib/types';

	// Dynamic GSAP import (only in browser)
	let gsap: any;

	onMount(async () => {
		const gsapModule = await import('gsap');
		gsap = gsapModule.gsap;
	});

	interface Props {
		records: GenerationRecord[];
		onImageClick: (url: string, record: GenerationRecord) => void;
		onLoadMore?: () => void;
		hasMore?: boolean;
	}

	let { records, onImageClick, onLoadMore, hasMore = false }: Props = $props();

	// Group records by week
	interface WeekGroup {
		label: string;
		startDate: Date;
		images: { url: string; record: GenerationRecord }[];
	}

	let weekGroups = $derived.by((): WeekGroup[] => {
		const groups = new Map<string, WeekGroup>();

		for (const record of records) {
			if (!record.resultUrls?.length) continue;

			const date = new Date(record.timestamp);
			const weekStart = getWeekStart(date);
			const weekEnd = new Date(weekStart);
			weekEnd.setDate(weekEnd.getDate() + 6);

			const key = weekStart.toISOString();
			const label = formatWeekLabel(weekStart, weekEnd);

			if (!groups.has(key)) {
				groups.set(key, { label, startDate: weekStart, images: [] });
			}

			for (const url of record.resultUrls) {
				groups.get(key)!.images.push({ url, record });
			}
		}

		// Sort by date descending
		return Array.from(groups.values()).sort(
			(a, b) => b.startDate.getTime() - a.startDate.getTime()
		);
	});

	function getWeekStart(date: Date): Date {
		const d = new Date(date);
		const day = d.getDay();
		const diff = d.getDate() - day + (day === 0 ? -6 : 1);
		d.setDate(diff);
		d.setHours(0, 0, 0, 0);
		return d;
	}

	function formatWeekLabel(start: Date, end: Date): string {
		const months = [
			'Jan',
			'Feb',
			'Mar',
			'Apr',
			'May',
			'Jun',
			'Jul',
			'Aug',
			'Sep',
			'Oct',
			'Nov',
			'Dec'
		];
		const startMonth = months[start.getMonth()];
		const endMonth = months[end.getMonth()];

		if (startMonth === endMonth) {
			return `${startMonth} ${start.getDate()} - ${end.getDate()}`;
		}
		return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}`;
	}

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

<div class="weekly-list">
	{#each weekGroups as week}
		<div class="week-section">
			<div class="week-header">
				<span class="week-label">{week.label}</span>
				<span class="count">{week.images.length} images</span>
			</div>
			<div class="image-grid">
				{#each week.images as img}
					<button
						class="image-card"
						onclick={() => onImageClick(img.url, img.record)}
						aria-label="View image from {week.label}"
					>
						<img src={img.url} alt="Generation thumbnail" loading="lazy" />
						{#if img.record.model}
							<span class="model-tag">{getModelLabel(img.record.model)}</span>
						{/if}
					</button>
				{/each}
			</div>
		</div>
	{/each}

	{#if hasMore && onLoadMore}
		<button class="load-more-btn" onclick={onLoadMore}> Load More </button>
	{/if}
</div>

<style>
	.weekly-list {
		padding: 0 20px;
		font-family: var(--font-primary, 'DM Sans', sans-serif);
	}

	.week-section {
		margin-top: 24px;
	}

	.week-header {
		display: flex;
		align-items: center;
		gap: 12px;
		padding-bottom: 12px;
		border-bottom: 1px solid rgba(201, 254, 110, 0.2);
		margin-bottom: 16px;
	}

	.week-label {
		font-size: 14px;
		font-weight: 600;
		color: var(--color-text-primary, #fff);
	}

	.count {
		font-size: 12px;
		color: var(--color-text-muted, #666);
		padding: 2px 10px;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 10px;
	}

	.image-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: 12px;
	}

	.image-card {
		position: relative;
		aspect-ratio: 1;
		border: none;
		padding: 0;
		background: transparent;
		cursor: pointer;
		border-radius: 8px;
		overflow: hidden;
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}

	.image-card:hover {
		transform: scale(1.03);
		box-shadow: 0 8px 24px rgba(201, 254, 110, 0.15);
	}

	.image-card img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.model-tag {
		position: absolute;
		bottom: 6px;
		left: 6px;
		padding: 3px 6px;
		background: rgba(18, 18, 18, 0.85);
		backdrop-filter: blur(4px);
		border-radius: 4px;
		font-size: 10px;
		font-weight: 600;
		color: var(--color-node-product, #c9fe6e);
		text-transform: uppercase;
		letter-spacing: 0.3px;
	}

	.load-more-btn {
		display: block;
		width: 100%;
		margin: 24px 0;
		padding: 12px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(201, 254, 110, 0.2);
		border-radius: 8px;
		color: var(--color-text-primary, #fff);
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.load-more-btn:hover {
		background: rgba(201, 254, 110, 0.1);
		border-color: var(--color-node-product, #c9fe6e);
	}
</style>
