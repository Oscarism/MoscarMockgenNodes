<script lang="ts">
	import BaseNode from './BaseNode.svelte';
	import type { VideoQualityNodeData, VideoAspectRatio, VideoMode, VideoDuration } from '$lib/types';
	import { updateNodeData } from '$lib/stores/canvas';

	interface Props {
		id: string;
		data: VideoQualityNodeData;
	}

	let { id, data }: Props = $props();

	const modeOptions: { value: VideoMode; label: string; description: string }[] = [
		{ value: 'std', label: 'Standard', description: '720p – faster, fewer credits' },
		{ value: 'pro', label: 'Pro', description: '1080p – higher quality' }
	];

	const aspectRatioOptions: { value: VideoAspectRatio; label: string; resolution: { std: string; pro: string } }[] =
		[
			{ value: '16:9', label: '16:9', resolution: { std: '1280×720', pro: '1920×1080' } },
			{ value: '9:16', label: '9:16', resolution: { std: '720×1280', pro: '1080×1920' } },
			{ value: '1:1', label: '1:1', resolution: { std: '720×720', pro: '1080×1080' } }
		];

	const durations: VideoDuration[] = ['3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'];

	let currentResolution = $derived.by(() => {
		const ratio = aspectRatioOptions.find((r) => r.value === data.aspectRatio);
		return ratio ? ratio.resolution[data.mode] : '';
	});
</script>

<BaseNode {id} nodeType="video-quality">
	<!-- Model Badge -->
	<div class="field">
		<span class="label">Model</span>
		<div class="model-badge">Kling 3.0</div>
	</div>

	<!-- Mode -->
	<div class="field">
		<span class="label">Mode</span>
		<div class="toggle-row">
			{#each modeOptions as opt}
				<button
					type="button"
					class="toggle-btn"
					class:active={data.mode === opt.value}
					onclick={() => updateNodeData(id, { mode: opt.value })}
				>
					{opt.label}
				</button>
			{/each}
		</div>
		<span class="hint">{modeOptions.find((m) => m.value === data.mode)?.description}</span>
	</div>

	<!-- Aspect Ratio -->
	<div class="field">
		<span class="label">Aspect Ratio</span>
		<div class="toggle-row">
			{#each aspectRatioOptions as opt}
				<button
					type="button"
					class="toggle-btn"
					class:active={data.aspectRatio === opt.value}
					onclick={() => updateNodeData(id, { aspectRatio: opt.value })}
				>
					{opt.label}
				</button>
			{/each}
		</div>
		{#if currentResolution}
			<span class="hint">Output: {currentResolution}</span>
		{/if}
	</div>

	<!-- Duration -->
	<div class="field">
		<label for="duration-{id}">Duration</label>
		<div class="duration-row">
			<input
				id="duration-{id}"
				type="range"
				min="3"
				max="15"
				step="1"
				value={parseInt(data.duration)}
				oninput={(e) =>
					updateNodeData(id, { duration: String((e.target as HTMLInputElement).value) as VideoDuration })}
			/>
			<span class="duration-value">{data.duration}s</span>
		</div>
	</div>

	<!-- Sound -->
	<div class="field field-row">
		<span class="label">Sound Effects</span>
		<button
			type="button"
			class="sound-toggle"
			class:active={data.sound}
			onclick={() => updateNodeData(id, { sound: !data.sound })}
			aria-pressed={data.sound}
		>
			{data.sound ? 'On' : 'Off'}
		</button>
	</div>
</BaseNode>

<style>
	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-tiny);
	}

	.field-row {
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
	}

	.field label,
	.field .label {
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.hint {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		margin-top: 2px;
	}

	.model-badge {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 10px;
		background: rgba(255, 99, 71, 0.12);
		border: 1px solid rgba(255, 99, 71, 0.4);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		color: var(--color-text-primary);
		font-weight: var(--font-medium);
	}

	.toggle-row {
		display: flex;
		gap: 6px;
	}

	.toggle-btn {
		flex: 1;
		padding: var(--space-sm) var(--space-sm);
		background-color: var(--color-bg-canvas);
		border: 1px solid var(--color-text-muted);
		border-radius: var(--radius-md);
		color: var(--color-text-primary);
		cursor: pointer;
		transition: all var(--transition-fast);
		font-size: var(--text-sm);
		text-align: center;
	}

	.toggle-btn:hover {
		border-color: #FF6347;
	}

	.toggle-btn.active {
		background-color: #FF6347;
		border-color: #FF6347;
		color: #000;
		font-weight: var(--font-bold);
	}

	.duration-row {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.duration-row input[type='range'] {
		flex: 1;
		accent-color: #FF6347;
	}

	.duration-value {
		font-size: var(--text-sm);
		color: var(--color-text-primary);
		font-weight: var(--font-bold);
		min-width: 28px;
		text-align: right;
	}

	.sound-toggle {
		padding: 4px 12px;
		background-color: var(--color-bg-canvas);
		border: 1px solid var(--color-text-muted);
		border-radius: var(--radius-md);
		color: var(--color-text-primary);
		cursor: pointer;
		transition: all var(--transition-fast);
		font-size: var(--text-sm);
	}

	.sound-toggle:hover {
		border-color: #FF6347;
	}

	.sound-toggle.active {
		background-color: #FF6347;
		border-color: #FF6347;
		color: #000;
		font-weight: var(--font-bold);
	}
</style>
