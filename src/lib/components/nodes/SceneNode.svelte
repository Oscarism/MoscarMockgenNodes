<script lang="ts">
	import BaseNode from './BaseNode.svelte';
	import type { SceneNodeData } from '$lib/types';
	import { sceneCategories } from '$lib/data/presets';
	import { updateNodeData } from '$lib/stores/canvas';

	interface Props {
		id: string;
		data: SceneNodeData;
	}

	let { id, data }: Props = $props();

	// Get available settings for selected environment
	let availableSettings = $derived(
		sceneCategories.find((c) => c.id === data.environment)?.options || []
	);

	function handleEnvironmentChange(event: Event) {
		const environment = (event.target as HTMLSelectElement).value as SceneNodeData['environment'];
		const settings = sceneCategories.find((c) => c.id === environment)?.options || [];
		const firstSetting = settings[0]?.id || '';

		updateNodeData(id, {
			environment,
			setting: firstSetting
		});
	}

	function handleSettingChange(event: Event) {
		const setting = (event.target as HTMLSelectElement).value;
		updateNodeData(id, { setting });
	}
</script>

<BaseNode {id} nodeType="scene">
	<div class="field">
		<label for="environment-{id}">Environment</label>
		<select id="environment-{id}" value={data.environment} onchange={handleEnvironmentChange}>
			{#each sceneCategories as category}
				<option value={category.id}>{category.label}</option>
			{/each}
		</select>
	</div>

	<div class="field">
		<label for="setting-{id}">Setting</label>
		<select id="setting-{id}" value={data.setting} onchange={handleSettingChange}>
			{#each availableSettings as setting}
				<option value={setting.id}>{setting.label}</option>
			{/each}
		</select>
	</div>
</BaseNode>

<style>
	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-tiny);
	}

	.field label {
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
</style>
