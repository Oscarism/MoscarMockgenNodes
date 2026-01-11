<script lang="ts">
	import {
		nodes,
		edges,
		clearCanvas,
		downloadCanvas,
		loadCanvasFromFile
	} from '$lib/stores/canvas';
	import { generationState, drawerState, visibleImages } from '$lib/stores/generation';
	import { auth, user, isLoggedIn } from '$lib/stores/auth';
	import LoginModal from './LoginModal.svelte';
	import NodePalette from './NodePalette.svelte';
	import HistoryPanel from './HistoryPanel.svelte';
	import SaveCanvasDialog from './SaveCanvasDialog.svelte';
	import LoadCanvasDialog from './LoadCanvasDialog.svelte';

	let showNodePalette = $state(false);
	let showHistory = $state(false);
	let showLoginModal = $state(false);
	let showUserMenu = $state(false);
	let showSaveDialog = $state(false);
	let showLoadDialog = $state(false);
	let fileInput: HTMLInputElement;

	// Count visible images (same as OutputDrawer to stay in sync)
	let imageCount = $derived($visibleImages.length);

	function handleLocalSave() {
		downloadCanvas($nodes, $edges);
	}

	function handleLocalLoad() {
		fileInput?.click();
	}

	async function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) {
			await loadCanvasFromFile(file);
		}
		input.value = '';
	}

	function handleReset() {
		console.log('[TopBar] handleReset called - clearing canvas directly');
		clearCanvas();
		console.log('[TopBar] clearCanvas completed');
	}

	function handleShowHistory() {
		showHistory = !showHistory;
	}

	function handleViewImages() {
		drawerState.update((s) => ({ ...s, mode: 'expanded' }));
	}
</script>

<header class="topbar">
	<!-- LEFT: Logo -->
	<div class="left-section">
		<div class="logo">MOSCAR</div>
	</div>

	<!-- CENTER: Nodes, History, Load, Save, Reset -->
	<div class="center-section">
		<div class="dropdown-container">
			<button class="toolbar-btn" onclick={() => (showNodePalette = !showNodePalette)}>
				Nodes
			</button>
			<NodePalette isOpen={showNodePalette} onClose={() => (showNodePalette = false)} />
		</div>

		<button class="toolbar-btn" onclick={handleShowHistory}>History</button>

		{#if $isLoggedIn}
			<button class="toolbar-btn" onclick={() => (showLoadDialog = true)}> Load </button>
			<button class="toolbar-btn" onclick={() => (showSaveDialog = true)}> Save </button>
		{:else}
			<button class="toolbar-btn" onclick={handleLocalLoad}>Load</button>
			<button class="toolbar-btn" onclick={handleLocalSave}>Save</button>
		{/if}
		<button class="toolbar-btn danger" onclick={handleReset}>Reset</button>
	</div>

	<!-- RIGHT: View Generations + Auth -->
	<div class="right-section">
		<button class="toolbar-btn" onclick={handleViewImages}>
			View Generations {#if imageCount > 0}({imageCount}){/if}
		</button>

		{#if $isLoggedIn}
			<div class="user-dropdown-container">
				<button class="user-btn" onclick={() => (showUserMenu = !showUserMenu)}>
					<span class="user-avatar">{$user?.email?.[0]?.toUpperCase() || 'U'}</span>
				</button>
				{#if showUserMenu}
					<div class="user-menu">
						<div class="user-email">{$user?.email}</div>
						<button
							class="menu-item"
							onclick={() => {
								auth.signOut();
								showUserMenu = false;
							}}
						>
							Sign Out
						</button>
					</div>
				{/if}
			</div>
		{:else}
			<a href="/login" class="toolbar-btn accent">Sign In</a>
		{/if}
	</div>
</header>

<LoginModal isOpen={showLoginModal} onClose={() => (showLoginModal = false)} />
<HistoryPanel isOpen={showHistory} onClose={() => (showHistory = false)} />
<SaveCanvasDialog isOpen={showSaveDialog} onClose={() => (showSaveDialog = false)} />
<LoadCanvasDialog isOpen={showLoadDialog} onClose={() => (showLoadDialog = false)} />

<input
	type="file"
	accept=".json"
	bind:this={fileInput}
	onchange={handleFileSelect}
	style="display: none"
/>

<style>
	.topbar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: var(--topbar-height);
		background-color: transparent;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 var(--space-lg);
		z-index: var(--z-ui);
	}

	.left-section,
	.center-section,
	.right-section {
		display: flex;
		align-items: center;
		gap: var(--space-md);
	}

	.center-section {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
	}

	.logo {
		font-family: var(--font-mono);
		font-size: var(--text-xl);
		font-weight: var(--font-normal);
		color: var(--color-node-product);
		letter-spacing: 0px;
	}

	.dropdown-container {
		position: relative;
	}

	.toolbar-btn {
		padding: var(--space-sm) var(--space-md);
		border: none;
		border-radius: var(--radius-md);
		background-color: #222222;
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.toolbar-btn:hover {
		background-color: #333333;
	}

	.toolbar-btn.danger:hover {
		background-color: var(--color-error);
	}

	.toolbar-btn.accent {
		/* Same as regular toolbar-btn - no special styling */
	}

	.toolbar-btn.accent:hover {
		/* Same as regular toolbar-btn hover */
	}

	.user-dropdown-container {
		position: relative;
	}

	.user-btn {
		height: 36px;
		padding: 0 12px;
		border-radius: var(--radius-md, 8px);
		border: 1px solid var(--color-text-muted);
		background-color: var(--color-bg-ui);
		color: var(--color-text-secondary);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		font-weight: var(--font-semibold);
		font-size: var(--text-sm);
		transition: all 0.2s ease;
	}

	.user-btn:hover {
		background-color: rgba(255, 255, 255, 0.1);
		border-color: var(--color-node-product);
		color: var(--color-text-primary);
	}

	.user-avatar {
		font-size: var(--text-sm);
	}

	.user-menu {
		position: absolute;
		top: calc(100% + 8px);
		right: 0;
		background-color: var(--color-bg-ui);
		border: 1px solid var(--color-text-muted);
		border-radius: var(--radius-md);
		min-width: 180px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		z-index: 1000;
		overflow: hidden;
	}

	.user-email {
		padding: var(--space-md);
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		border-bottom: 1px solid var(--color-text-muted);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.menu-item {
		display: block;
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		background: transparent;
		border: none;
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		text-align: left;
		cursor: pointer;
	}

	.menu-item:hover {
		background-color: var(--color-bg-canvas);
	}
</style>
