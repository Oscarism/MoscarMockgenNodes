<script lang="ts">
	import BaseNode from './BaseNode.svelte';
	import type { PoseNodeData } from '$lib/types';
	import { updateNodeData } from '$lib/stores/canvas';

	interface Props {
		id: string;
		data: PoseNodeData;
	}

	let { id, data }: Props = $props();

	// Style/Mood options
	const styleMoods = [
		{ id: 'confident', label: 'Confident', prompt: 'confident powerful pose' },
		{ id: 'relaxed', label: 'Relaxed', prompt: 'relaxed natural pose' },
		{ id: 'professional', label: 'Professional', prompt: 'professional composed pose' },
		{ id: 'playful', label: 'Playful', prompt: 'playful energetic pose' },
		{ id: 'elegant', label: 'Elegant', prompt: 'elegant graceful pose' },
		{ id: 'casual', label: 'Casual', prompt: 'casual everyday pose' },
		{ id: 'dramatic', label: 'Dramatic', prompt: 'dramatic expressive pose' },
		{ id: 'minimal', label: 'Minimal', prompt: 'minimal understated pose' }
	];

	// Body pose options
	const bodyPoses = [
		{ id: 'standing', label: 'Standing', prompt: 'standing upright' },
		{ id: 'sitting', label: 'Sitting', prompt: 'sitting comfortably' },
		{ id: 'leaning', label: 'Leaning', prompt: 'leaning casually' },
		{ id: 'hand-on-hip', label: 'Hand on Hip', prompt: 'hand on hip' },
		{ id: 'hand-on-neck', label: 'Hand on Neck', prompt: 'hand touching neck' },
		{ id: 'arms-crossed', label: 'Arms Crossed', prompt: 'arms crossed' },
		{ id: 'hands-in-pockets', label: 'Hands in Pockets', prompt: 'hands in pockets' },
		{ id: 'walking', label: 'Walking', prompt: 'walking in motion' },
		{ id: 'reaching', label: 'Reaching', prompt: 'reaching upward' },
		{ id: 'crouching', label: 'Crouching', prompt: 'crouching low' },
		{ id: 'lying-down', label: 'Lying Down', prompt: 'lying down relaxed' },
		{ id: 'jumping', label: 'Jumping', prompt: 'jumping in air' },
		{ id: 'dancing', label: 'Dancing', prompt: 'dancing movement' },
		{ id: 'stretching', label: 'Stretching', prompt: 'stretching body' },
		{ id: 'kneeling', label: 'Kneeling', prompt: 'kneeling down' }
	];

	function handleChange(field: string, value: string) {
		updateNodeData(id, { [field]: value });
	}
</script>

<BaseNode {id} nodeType="pose">
	<!-- Style/Mood Selection -->
	<div class="field">
		<label for="mood-{id}">Style / Mood</label>
		<div class="toggle-grid">
			{#each styleMoods as mood}
				<button
					type="button"
					class="toggle-btn"
					class:active={data.styleMood === mood.id}
					onclick={() => handleChange('styleMood', mood.id)}
				>
					{mood.label}
				</button>
			{/each}
		</div>
	</div>

	<!-- Body Pose Selection -->
	<div class="field">
		<label for="pose-{id}">Body Pose</label>
		<select
			id="pose-{id}"
			value={data.bodyPose}
			onchange={(e) => handleChange('bodyPose', (e.target as HTMLSelectElement).value)}
		>
			{#each bodyPoses as pose}
				<option value={pose.id}>{pose.label}</option>
			{/each}
		</select>
	</div>

	<!-- Custom Pose -->
	<div class="field">
		<label for="custom-{id}">Custom Pose Details</label>
		<textarea
			id="custom-{id}"
			class="nodrag"
			value={data.customPose}
			oninput={(e) => handleChange('customPose', (e.target as HTMLTextAreaElement).value)}
			placeholder="Add custom pose details..."
			rows={2}
		></textarea>
	</div>
</BaseNode>

<style>
	.field {
		display: flex;
		flex-direction: column;
		gap: 4px;
		margin-bottom: var(--space-sm);
	}

	.field label {
		font-size: 10px;
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.toggle-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}

	.toggle-btn {
		flex: 1 0 22%;
		padding: 6px 8px;
		background-color: var(--color-bg-canvas);
		border: 1px solid var(--color-text-muted);
		border-radius: var(--radius-sm);
		color: var(--color-text-primary);
		cursor: pointer;
		font-size: 10px;
		transition: all var(--transition-fast);
		text-align: center;
	}

	.toggle-btn:hover {
		border-color: var(--color-node-pose, #e91e63);
	}

	.toggle-btn.active {
		background-color: var(--color-node-pose, #e91e63);
		border-color: var(--color-node-pose, #e91e63);
		color: var(--color-bg-canvas);
	}

	.field select {
		padding: 6px 8px;
		font-size: 12px;
	}

	.field textarea {
		resize: vertical;
		min-height: 40px;
		font-size: 11px;
	}
</style>
