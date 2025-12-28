<script lang="ts">
	import BaseNode from './BaseNode.svelte';
	import type { CustomPromptNodeData } from '$lib/types';
	import { updateNodeData } from '$lib/stores/canvas';

	interface Props {
		id: string;
		data: CustomPromptNodeData;
	}

	let { id, data }: Props = $props();

	function handleTextChange(event: Event) {
		const promptText = (event.target as HTMLTextAreaElement).value;
		updateNodeData(id, { promptText });
	}
</script>

<BaseNode {id} nodeType="custom">
	<div class="field">
		<label for="prompt-{id}">Custom Prompt Text</label>
		<textarea
			id="prompt-{id}"
			value={data.promptText}
			oninput={handleTextChange}
			placeholder="Enter any custom prompt text..."
			rows={4}
			class="nodrag"
		></textarea>
	</div>

	{#if data.promptText}
		<div class="char-count">
			{data.promptText.length} characters
		</div>
	{/if}
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

	textarea {
		resize: vertical;
		min-height: 80px;
		background-color: var(--color-bg-canvas);
		border: 1px solid var(--color-text-muted);
		border-radius: var(--radius-sm);
		padding: var(--space-sm);
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		font-family: var(--font-primary);
	}

	textarea:focus {
		outline: none;
		border-color: var(--color-node-custom);
	}

	.char-count {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		text-align: right;
	}
</style>
