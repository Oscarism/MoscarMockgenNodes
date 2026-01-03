<script lang="ts">
	import {
		nodes,
		edges,
		addNode,
		clearCanvas,
		downloadCanvas,
		loadCanvasFromFile,
		saveToCloud,
		loadFromCloud
	} from '$lib/stores/canvas';
	import { generationHistory, generationState, drawerState } from '$lib/stores/generation';
	import { auth, user, isLoggedIn } from '$lib/stores/auth';
	import type { NodeType } from '$lib/types';
	import { NODE_COLORS, NODE_NAMES } from '$lib/types';
	import LoginModal from './LoginModal.svelte';
	import { toasts } from '$lib/stores/toasts';

	let showDropdown = $state(false);
	let showNodePalette = $state(false);
	let showHistory = $state(false);
	let showLoginModal = $state(false);
	let showUserMenu = $state(false);
	let fileInput: HTMLInputElement;

	// Count generated images
	let imageCount = $derived($generationState.generatedImages.length);

	const nodeTypes: NodeType[] = [
		'product',
		'scene',
		'style',
		'branding',
		'lighting',
		'camera',
		'quality',
		'custom',
		'image',
		'human',
		'clothing',
		'pose',
		'variation',
		'plant',
		'texture',
		'background',
		'output',
		'refine'
	];

	function handleAddNode(type: NodeType) {
		const x = 200 + Math.random() * 100;
		const y = 100 + Math.random() * 100;
		addNode(type, { x, y });
		showNodePalette = false;
	}

	function handleSave() {
		downloadCanvas($nodes, $edges);
	}

	function handleLoad() {
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
		// Force a page-level state reset
		console.log('[TopBar] clearCanvas completed');
	}

	function handleShowHistory() {
		showHistory = !showHistory;
		showDropdown = false;
	}

	function handleViewImages() {
		drawerState.update((s) => ({ ...s, mode: 'expanded' }));
	}

	// Cloud save/load state
	let isSaving = $state(false);
	let isLoadingCloud = $state(false);

	async function handleCloudSave() {
		if (!$user) {
			toasts.error('Please sign in to save to cloud');
			return;
		}
		isSaving = true;
		try {
			await saveToCloud($user.id);
		} finally {
			isSaving = false;
		}
	}

	async function handleCloudLoad() {
		if (!$user) {
			toasts.error('Please sign in to load from cloud');
			return;
		}
		isLoadingCloud = true;
		try {
			const loaded = await loadFromCloud($user.id);
			if (!loaded) {
				toasts.info('No saved canvas found');
			}
		} finally {
			isLoadingCloud = false;
		}
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

			{#if showNodePalette}
				<div class="node-palette">
					<div class="palette-header">Add Node</div>
					{#each nodeTypes as type}
						<button
							class="node-option"
							onclick={() => handleAddNode(type)}
							style="--node-color: {NODE_COLORS[type]}"
						>
							<span class="node-dot"></span>
							{NODE_NAMES[type]}
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<button class="toolbar-btn" onclick={handleShowHistory}>History</button>
		{#if $isLoggedIn}
			<button class="toolbar-btn" onclick={handleCloudLoad} disabled={isLoadingCloud}>
				{isLoadingCloud ? '...' : 'Load'}
			</button>
			<button class="toolbar-btn" onclick={handleCloudSave} disabled={isSaving}>
				{isSaving ? '...' : 'Save'}
			</button>
		{:else}
			<button class="toolbar-btn" onclick={handleLoad}>Load</button>
			<button class="toolbar-btn" onclick={handleSave}>Save</button>
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

<!-- History Panel -->
{#if showHistory}
	<div class="history-panel">
		<div class="history-header">
			<h3>Generation History</h3>
			<button class="close-btn" onclick={() => (showHistory = false)}>×</button>
		</div>
		<div class="history-content">
			{#if $generationHistory.length === 0}
				<p class="empty">No generations yet</p>
			{:else}
				{#each $generationHistory as record}
					<div
						class="history-item"
						class:success={record.state === 'success'}
						class:fail={record.state === 'fail'}
					>
						<div class="history-time">
							{new Date(record.timestamp).toLocaleTimeString()}
						</div>
						<div class="history-prompt">{record.prompt.slice(0, 100)}...</div>
						<div class="history-status">{record.state}</div>
					</div>
				{/each}
			{/if}
		</div>
	</div>
{/if}

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

	.toolbar-btn.circle {
		width: 36px;
		height: 36px;
		padding: 0;
		border-radius: var(--radius-full);
		font-size: var(--text-xl);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.dropdown-container {
		position: relative;
	}

	.dropdown-menu,
	.node-palette {
		position: absolute;
		top: calc(100% + 8px);
		left: 0;
		background-color: #222222;
		border-radius: var(--radius-lg);
		padding: var(--space-sm);
		min-width: 160px;
		z-index: var(--z-dropdown);
		animation: slideUp 0.2s ease-out;
	}

	.dropdown-menu button,
	.node-palette button {
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		text-align: left;
		border-radius: var(--radius-md);
		background-color: transparent;
		border: none;
		cursor: pointer;
		transition: background-color var(--transition-fast);
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		color: var(--color-text-primary);
		font-size: var(--text-sm);
	}

	.dropdown-menu button:hover,
	.node-palette button:hover {
		background-color: #333333;
	}

	.palette-header {
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		padding: var(--space-sm) var(--space-md);
		border-bottom: 1px solid #333333;
		margin-bottom: var(--space-sm);
	}

	.node-palette {
		min-width: 200px;
		right: 0;
		left: auto;
	}

	.node-option {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.node-dot {
		width: 10px;
		height: 10px;
		border-radius: var(--radius-full);
		background-color: var(--node-color);
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

	.history-panel {
		position: fixed;
		top: var(--topbar-height);
		right: 0;
		width: 320px;
		max-height: calc(100vh - var(--topbar-height));
		background-color: #222222;
		border-left: 1px solid #333333;
		z-index: var(--z-dropdown);
		display: flex;
		flex-direction: column;
		animation: slideIn 0.3s ease-out;
	}

	@keyframes slideIn {
		from {
			transform: translateX(100%);
		}
		to {
			transform: translateX(0);
		}
	}

	.history-header {
		padding: var(--space-lg);
		border-bottom: 1px solid #333333;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.history-header h3 {
		font-size: var(--text-lg);
		font-weight: var(--font-medium);
	}

	.close-btn {
		width: 28px;
		height: 28px;
		border-radius: var(--radius-full);
		background-color: #333333;
		border: none;
		color: var(--color-text-primary);
		font-size: var(--text-lg);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.close-btn:hover {
		background-color: var(--color-error);
	}

	.history-content {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-md);
	}

	.history-content .empty {
		color: var(--color-text-muted);
		text-align: center;
		padding: var(--space-xl);
	}

	.history-item {
		padding: var(--space-md);
		background-color: #1a1a1a;
		border-radius: var(--radius-md);
		margin-bottom: var(--space-sm);
	}

	.history-item.success {
		border-left: 3px solid var(--color-success);
	}

	.history-item.fail {
		border-left: 3px solid var(--color-error);
	}

	.history-time {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.history-prompt {
		font-size: var(--text-sm);
		color: var(--color-text-primary);
		margin: var(--space-tiny) 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.history-status {
		font-size: var(--text-xs);
		text-transform: uppercase;
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
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
