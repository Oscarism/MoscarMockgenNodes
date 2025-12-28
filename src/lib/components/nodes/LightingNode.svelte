<script lang="ts">
	import BaseNode from './BaseNode.svelte';
	import type { LightingNodeData } from '$lib/types';
	import { lightingCategories } from '$lib/data/presets';
	import { updateNodeData } from '$lib/stores/canvas';

	interface Props {
		id: string;
		data: LightingNodeData;
	}

	let { id, data }: Props = $props();

	// Get available settings for selected light type
	let availableSettings = $derived(
		lightingCategories.find((c) => c.id === data.lightType)?.options || []
	);

	function handleTypeChange(event: Event) {
		const lightType = (event.target as HTMLSelectElement).value as LightingNodeData['lightType'];
		const settings = lightingCategories.find((c) => c.id === lightType)?.options || [];
		const firstSetting = settings[0]?.id || '';

		updateNodeData(id, {
			lightType,
			setting: firstSetting
		});
	}

	function handleSettingChange(event: Event) {
		const setting = (event.target as HTMLSelectElement).value;
		updateNodeData(id, { setting });
	}
</script>

<BaseNode {id} nodeType="lighting">
	<div class="field">
		<label for="type-{id}">Light Type</label>
		<select id="type-{id}" value={data.lightType} onchange={handleTypeChange}>
			{#each lightingCategories as category}
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
