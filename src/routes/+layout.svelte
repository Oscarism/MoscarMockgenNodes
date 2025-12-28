<script lang="ts">
	import '$lib/../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<title>MOSCAR - AI Mockup Generator</title>
	<meta
		name="description"
		content="A node-based visual prompt builder for generating professional product mockups using AI."
	/>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		overflow: hidden;
	}
</style>
