<script lang="ts">
	type OptionItem = string | { id: string; label: string };

	interface Props {
		id: string;
		label: string;
		field: string;
		value: string;
		options: OptionItem[];
		anyLabel?: string;
		showAny?: boolean;
		onchange: (field: string, value: string) => void;
	}

	let { id, label, field, value, options, anyLabel = 'Any', showAny = true, onchange }: Props = $props();

	function getOptionId(opt: OptionItem): string {
		return typeof opt === 'string' ? opt : opt.id;
	}

	function getOptionLabel(opt: OptionItem): string {
		return typeof opt === 'string' ? opt : opt.label;
	}
</script>

<div class="field">
	<label for="{field}-{id}">{label}</label>
	<select
		id="{field}-{id}"
		{value}
		onchange={(e) => onchange(field, (e.target as HTMLSelectElement).value)}
	>
		{#if showAny}
			<option value="">{anyLabel}</option>
		{/if}
		{#each options as opt}
			<option value={getOptionId(opt)}>{getOptionLabel(opt)}</option>
		{/each}
	</select>
</div>

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

	.field select {
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		background-color: var(--color-bg-canvas);
		border: 1px solid var(--color-text-muted);
		border-radius: var(--radius-md);
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		cursor: pointer;
		transition: border-color var(--transition-fast);
	}

	.field select:focus {
		outline: none;
		border-color: var(--color-node-human, #e0a0ff);
	}
</style>
