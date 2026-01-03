<script lang="ts">
	import BaseNode from './BaseNode.svelte';
	import type { BackgroundNodeData } from '$lib/types';
	import { updateNodeData } from '$lib/stores/canvas';

	interface Props {
		id: string;
		data: BackgroundNodeData;
	}

	let { id, data }: Props = $props();

	// Background styles
	const styles = [
		{ id: 'seamless', label: 'Seamless', prompt: 'seamless backdrop' },
		{ id: 'textured', label: 'Textured', prompt: 'textured background' },
		{ id: 'clean', label: 'Clean', prompt: 'clean minimal background' },
		{ id: 'minimal', label: 'Minimal', prompt: 'minimalist simple background' }
	];

	// Solid color swatches
	const solidColors = [
		{ hex: '#FFFFFF', label: 'White' },
		{ hex: '#F5F5F5', label: 'Off-White' },
		{ hex: '#E0E0E0', label: 'Light Gray' },
		{ hex: '#9E9E9E', label: 'Gray' },
		{ hex: '#424242', label: 'Dark Gray' },
		{ hex: '#212121', label: 'Charcoal' },
		{ hex: '#000000', label: 'Black' },
		{ hex: '#FFEBEE', label: 'Blush' },
		{ hex: '#E3F2FD', label: 'Light Blue' },
		{ hex: '#E8F5E9', label: 'Mint' },
		{ hex: '#FFF3E0', label: 'Peach' },
		{ hex: '#F3E5F5', label: 'Lavender' },
		{ hex: '#FFFDE7', label: 'Cream' },
		{ hex: '#ECEFF1', label: 'Cool Gray' },
		{ hex: '#FCE4EC', label: 'Pink' },
		{ hex: '#E0F7FA', label: 'Aqua' }
	];

	// Gradient presets
	const gradients = [
		{ id: 'sunset', colors: ['#FF6B6B', '#FEC89A'], label: 'Sunset' },
		{ id: 'ocean', colors: ['#667eea', '#764ba2'], label: 'Ocean' },
		{ id: 'forest', colors: ['#11998e', '#38ef7d'], label: 'Forest' },
		{ id: 'twilight', colors: ['#2c3e50', '#fd746c'], label: 'Twilight' },
		{ id: 'cotton-candy', colors: ['#ff9a9e', '#fecfef'], label: 'Cotton Candy' },
		{ id: 'midnight', colors: ['#232526', '#414345'], label: 'Midnight' },
		{ id: 'golden', colors: ['#F2C94C', '#F2994A'], label: 'Golden' },
		{ id: 'ice', colors: ['#74ebd5', '#ACB6E5'], label: 'Ice' }
	];

	// Environment backgrounds
	const environments = [
		{ id: '', label: 'None' },
		{ id: 'studio', label: 'Studio', prompt: 'professional photography studio background' },
		{ id: 'nature', label: 'Nature', prompt: 'natural outdoor environment background' },
		{ id: 'urban', label: 'Urban', prompt: 'urban city environment background' },
		{ id: 'interior', label: 'Interior', prompt: 'interior room setting background' },
		{ id: 'abstract', label: 'Abstract', prompt: 'abstract artistic background' },
		{ id: 'sky', label: 'Sky', prompt: 'sky and clouds background' },
		{ id: 'beach', label: 'Beach', prompt: 'beach and ocean background' },
		{ id: 'mountains', label: 'Mountains', prompt: 'mountain landscape background' }
	];

	function handleChange(field: string, value: any) {
		updateNodeData(id, { [field]: value });
	}

	function handleGradientSelect(gradient: (typeof gradients)[0]) {
		updateNodeData(id, { gradientColors: gradient.colors });
	}
</script>

<BaseNode {id} nodeType="background">
	<!-- Style Selection -->
	<div class="field">
		<span class="field-label">Style</span>
		<div class="toggle-row">
			{#each styles as style}
				<button
					type="button"
					class="toggle-btn"
					class:active={data.style === style.id}
					onclick={() => handleChange('style', style.id)}
				>
					{style.label}
				</button>
			{/each}
		</div>
	</div>

	<!-- Solid Color Swatches -->
	<div class="field">
		<span class="field-label">Solid Color</span>
		<div class="color-swatches">
			{#each solidColors as color}
				<button
					class="color-swatch"
					class:active={data.solidColor === color.hex}
					style="background-color: {color.hex}"
					onclick={() => handleChange('solidColor', color.hex)}
					title={color.label}
					aria-label={color.label}
				></button>
			{/each}
		</div>
	</div>

	<!-- Gradient Swatches -->
	<div class="field">
		<span class="field-label">Gradient</span>
		<div class="gradient-swatches">
			{#each gradients as gradient}
				<button
					class="gradient-swatch"
					class:active={data.gradientColors?.[0] === gradient.colors[0]}
					style="background: linear-gradient(135deg, {gradient.colors[0]}, {gradient.colors[1]})"
					onclick={() => handleGradientSelect(gradient)}
					title={gradient.label}
					aria-label={gradient.label}
				></button>
			{/each}
		</div>
	</div>

	<!-- Environment Selection -->
	<div class="field">
		<label for="env-{id}">Environment</label>
		<select
			id="env-{id}"
			value={data.environment}
			onchange={(e) => handleChange('environment', (e.target as HTMLSelectElement).value)}
		>
			{#each environments as env}
				<option value={env.id}>{env.label}</option>
			{/each}
		</select>
	</div>

	<!-- Custom Prompt -->
	<div class="field">
		<label for="custom-{id}">Custom Background</label>
		<textarea
			id="custom-{id}"
			class="nodrag"
			value={data.customPrompt}
			oninput={(e) => handleChange('customPrompt', (e.target as HTMLTextAreaElement).value)}
			placeholder="Describe your background..."
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

	.field label,
	.field-label {
		font-size: 10px;
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.toggle-row {
		display: flex;
		gap: 4px;
	}

	.toggle-btn {
		flex: 1;
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
		border-color: var(--color-node-background, #607d8b);
	}

	.toggle-btn.active {
		background-color: var(--color-node-background, #607d8b);
		border-color: var(--color-node-background, #607d8b);
		color: var(--color-bg-canvas);
	}

	.color-swatches,
	.gradient-swatches {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}

	.color-swatch {
		width: 24px;
		height: 24px;
		border-radius: 4px;
		border: 2px solid transparent;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.color-swatch:hover {
		transform: scale(1.1);
	}

	.color-swatch.active {
		border-color: var(--color-node-background, #607d8b);
		box-shadow: 0 0 0 2px var(--color-bg-ui);
	}

	.gradient-swatch {
		width: 40px;
		height: 24px;
		border-radius: 4px;
		border: 2px solid transparent;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.gradient-swatch:hover {
		transform: scale(1.05);
	}

	.gradient-swatch.active {
		border-color: var(--color-node-background, #607d8b);
		box-shadow: 0 0 0 2px var(--color-bg-ui);
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
