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

	// Get available products for selected category
	let availableProducts = $derived(getProductsByCategory(data.category));

	function handleCategoryChange(event: Event) {
		const category = (event.target as HTMLSelectElement).value;
		const products = getProductsByCategory(category);
		const firstProduct = products[0]?.name || '';

		updateNodeData(id, {
			category,
			product: firstProduct
		});
	}

	function handleProductChange(event: Event) {
		const product = (event.target as HTMLSelectElement).value;
		updateNodeData(id, { product });
	}
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
		</select>
	</div>

	<div class="preview">
		<span class="preview-label">Selected:</span>
		<span class="preview-value">{data.product}</span>
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
