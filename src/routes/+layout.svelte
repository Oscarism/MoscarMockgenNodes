<script lang="ts">
	import '$lib/../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { auth, isLoggedIn, user } from '$lib/stores/auth';
	import { fetchUserHistory } from '$lib/stores/generation';
	import { loadFromCloud } from '$lib/stores/canvas';
	import { onMount } from 'svelte';

	let { children } = $props();

	// Initialize auth on mount and load user data if already logged in
	onMount(async () => {
		await auth.initialize();

		// If user is already logged in (page refresh), load their data
		const currentUser = auth.getUser();
		if (currentUser) {
			console.log('[Layout] User already logged in, loading data...');
			await fetchUserHistory();
			// Optionally load their canvas too
			// await loadFromCloud(currentUser.id);
		}
	});
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
