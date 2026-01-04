<script lang="ts">
	import BaseNode from './BaseNode.svelte';
	import type { ProductNodeData } from '$lib/types';
	import { productCategories, getProductsByCategory } from '$lib/data/products';
	import { updateNodeData } from '$lib/stores/canvas';

	interface Props {
		id: string;
		data: ProductNodeData;
	}

	let { id, data }: Props = $props();

	// Check if using custom product
	let isCustom = $derived(
		data.product === '__custom__' || (data.customSpecs !== undefined && data.customSpecs.length > 0)
	);

	// Get available products for selected category
	let availableProducts = $derived(getProductsByCategory(data.category));

	function handleCategoryChange(event: Event) {
		const category = (event.target as HTMLSelectElement).value;
		const products = getProductsByCategory(category);
		const firstProduct = products[0]?.name || '';

		updateNodeData(id, {
			category,
			product: firstProduct,
			customSpecs: ''
		});
	}

	function handleProductChange(event: Event) {
		const product = (event.target as HTMLSelectElement).value;
		if (product === '__custom__') {
			updateNodeData(id, { product, customSpecs: data.customSpecs || '' });
		} else {
			updateNodeData(id, { product, customSpecs: '' });
		}
	}

	function handleCustomChange(event: Event) {
		const customSpecs = (event.target as HTMLInputElement).value;
		updateNodeData(id, { customSpecs });
	}

	function handleAutoEnhanceToggle() {
		const currentValue = data.autoEnhance !== false;
		updateNodeData(id, { autoEnhance: !currentValue });
	}

	// Get display name for preview
	let displayName = $derived(() => {
		if (data.product === '__custom__' && data.customSpecs) {
			return data.customSpecs;
		}
		return data.product;
	});
</script>

<BaseNode {id} nodeType="product" showInput={false}>
	<div class="field">
		<label for="category-{id}">Category</label>
		<select id="category-{id}" value={data.category} onchange={handleCategoryChange}>
			{#each productCategories as category}
				<option value={category.name}>{category.name}</option>
			{/each}
		</select>
	</div>

	<div class="field">
		<label for="product-{id}">Product</label>
		<select id="product-{id}" value={data.product} onchange={handleProductChange}>
			{#each availableProducts as product}
				<option value={product.name}>{product.name}</option>
			{/each}
			<option value="__custom__">✏️ Custom Product...</option>
		</select>
	</div>

	{#if data.product === '__custom__'}
		<div class="field">
			<label for="custom-{id}">Custom Product Name</label>
			<input
				type="text"
				id="custom-{id}"
				placeholder="e.g., vintage leather satchel"
				value={data.customSpecs || ''}
				oninput={handleCustomChange}
			/>
		</div>
	{/if}

	<label class="toggle-row">
		<input
			type="checkbox"
			checked={data.autoEnhance !== false}
			onchange={handleAutoEnhanceToggle}
		/>
		<span>Auto-enhance prompt</span>
	</label>

	<div class="preview">
		<span class="preview-label">Selected:</span>
		<span class="preview-value">{displayName()}</span>
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

	.field select,
	.field input {
		padding: var(--space-sm);
		background-color: var(--color-bg-canvas);
		border: 1px solid var(--color-text-muted);
		border-radius: var(--radius-sm);
		color: var(--color-text-primary);
		font-size: var(--text-sm);
	}

	.toggle-row {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		cursor: pointer;
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
	}

	.toggle-row input[type='checkbox'] {
		width: 14px;
		height: 14px;
		accent-color: var(--color-node-product);
	}

	.preview {
		margin-top: var(--space-sm);
		padding: var(--space-sm);
		background-color: var(--color-bg-canvas);
		border-radius: var(--radius-sm);
		font-size: var(--text-sm);
	}

	.preview-label {
		color: var(--color-text-secondary);
	}

	.preview-value {
		color: var(--color-node-product);
		font-weight: var(--font-medium);
	}
</style>
