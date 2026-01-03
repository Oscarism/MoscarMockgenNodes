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

	// Refs for animation
	let rowEls: HTMLLIElement[] = [];
	let timelines: any[] = [];
	let lastIndexEntered = 0;
	let isInitialized = false;

	// Initialize timelines after GSAP loads and rows render
	function initializeTimelines() {
		if (!gsap || isInitialized || rowEls.length === 0) return;

		console.log('[WeeklyHistoryList] Initializing timelines for', rowEls.length, 'rows');

		timelines = rowEls.map((rowEl, index) => {
			if (!rowEl) return null;

			const medias = rowEl.querySelectorAll('.media');
			const tl = gsap.timeline({ paused: index !== 0 });

			tl.to(medias, {
				y: 0,
				opacity: 1,
				stagger: {
					each: 0.04,
					from: 'random'
				},
				duration: 0.4,
				ease: 'power4.out'
			});

			return tl;
		});

		isInitialized = true;
	}

	// Handle row hover with timelines
	function handleRowEnter(index: number, rowEl: HTMLLIElement) {
		if (!gsap) return;

		// Initialize if not done yet
		if (!isInitialized) initializeTimelines();

		// Reverse the previously active row's media (fast reverse)
		if (timelines[lastIndexEntered]) {
			timelines[lastIndexEntered].timeScale(3).reverse();
		}

		// Update last entered index
		lastIndexEntered = index;

		// Play this row's media timeline (normal speed)
		if (timelines[index]) {
			timelines[index].timeScale(1).play();
		}

		// Collapse all rows, expand this one
		gsap.to(rowEls.filter(Boolean), {
			flex: '1 1 50px',
			duration: 0.2,
			ease: 'power2.inOut'
		});

		gsap.to(rowEl, {
			flex: '1 1 130px',
			duration: 0.2,
			ease: 'power2.inOut'
		});
	}

	// Optional: handle mouse leave (keep row expanded until another is entered)
	function handleRowLeave(index: number, rowEl: HTMLLIElement) {
		// No action needed - row stays expanded until another is moused over
	}
</script>

<div class="weekly-list">
	<p class="section-label">Previous Generations</p>
	<ul>
		{#each weekGroups as week, i}
			<li
				bind:this={rowEls[i]}
				onmouseenter={(e) => handleRowEnter(i, e.currentTarget)}
				onmouseleave={(e) => handleRowLeave(i, e.currentTarget)}
			>
				<span class="week-label">{week.label}</span>
				<span class="count">{week.images.length}</span>
				<span class="medias">
					{#each week.images.slice(0, 8) as img, j}
						<button
							class="media"
							onclick={() => onImageClick(img.url, img.record)}
							aria-label="View image from {week.label}"
						>
							<img src={img.url} alt="Generation thumbnail" loading="lazy" />
						</button>
					{/each}
					{#if week.images.length > 8}
						<span class="more-count">+{week.images.length - 8}</span>
					{/if}
				</span>
			</li>
		{/each}
	</ul>

	{#if hasMore && onLoadMore}
		<button class="load-more-btn" onclick={onLoadMore}> Load More </button>
	{/if}
</div>

<style>
	.weekly-list {
		padding: 0;
		font-family: var(--font-primary, 'DM Sans', sans-serif);
	}

	.section-label {
		padding: 16px 24px 8px;
		font-size: 12px;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 1px;
		color: var(--color-text-muted, #666);
		opacity: 0.6;
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		border-bottom: 1px solid rgba(201, 254, 110, 0.2);
	}

	li {
		flex: 1 1 50px;
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 0 24px;
		border-top: 1px solid rgba(201, 254, 110, 0.2);
		overflow: hidden;
		transition: flex 0.3s ease;
	}

	li:first-child {
		flex: 1 1 130px;
	}

	.week-label {
		font-size: 14px;
		font-weight: 500;
		color: var(--color-text-primary, #fff);
		min-width: 120px;
	}

	.count {
		font-size: 12px;
		color: var(--color-text-muted, #666);
		padding: 2px 8px;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 10px;
	}

	.medias {
		display: flex;
		gap: 10px;
		margin-left: auto;
		overflow: hidden;
	}

	.media {
		width: 80px;
		height: 80px;
		border: none;
		padding: 0;
		background: transparent;
		cursor: pointer;
		transform: translateY(100%);
		opacity: 0;
		transition: transform 0.3s ease;
	}

	.media img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 6px;
	}

	.media:hover img {
		opacity: 0.8;
	}

	li:first-child .media {
		transform: translateY(0);
		opacity: 1;
	}

	.more-count {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 80px;
		height: 80px;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 6px;
		font-size: 14px;
		font-weight: 600;
		color: var(--color-text-secondary, #888);
	}

	.load-more-btn {
		display: block;
		width: calc(100% - 48px);
		margin: 16px 24px;
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
