<script lang="ts">
	import BaseNode from './BaseNode.svelte';
	import type { TextureNodeData } from '$lib/types';
	import { texturePresets } from '$lib/data/presets';
	import { updateNodeData } from '$lib/stores/canvas';

	interface Props {
		id: string;
		data: TextureNodeData;
	}

	let { id, data }: Props = $props();

	function handleTextureChange(event: Event) {
		const textureType = (event.target as HTMLSelectElement).value;
		updateNodeData(id, { textureType });
	}

	function handleCustomChange(event: Event) {
		const customTexture = (event.target as HTMLInputElement).value;
		updateNodeData(id, { customTexture });
	}
</script>

<BaseNode {id} nodeType="texture">
	<div class="field">
		<label for="texture-{id}">Texture / Material</label>
		<select id="texture-{id}" value={data.textureType} onchange={handleTextureChange}>
			{#each texturePresets as texture}
				<option value={texture.id}>{texture.label}</option>
			{/each}
		</select>
		<span class="hint">
			{texturePresets.find((p) => p.id === data.textureType)?.prompt || 'Select a texture'}
		</span>
	</div>

	<div class="field">
		<label for="custom-{id}">Custom Material (Optional)</label>
		<input
			type="text"
			id="custom-{id}"
			value={data.customTexture || ''}
			oninput={handleCustomChange}
			placeholder="e.g. brushed aluminum"
		/>
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

	.hint {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		font-style: italic;
	}
</style>
