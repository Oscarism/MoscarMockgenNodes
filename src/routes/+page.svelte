<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';

	import { nodes, edges, addEdge, selectedNodeId, removeEdge } from '$lib/stores/canvas';
	import { drawerState } from '$lib/stores/generation';
	import type { PromptNode, PromptEdge, NodeType } from '$lib/types';
	import { NODE_COLORS } from '$lib/types';

	// UI Components (always import)
	import TopBar from '$lib/components/ui/TopBar.svelte';
	import PromptPreview from '$lib/components/ui/PromptPreview.svelte';
	import OutputDrawer from '$lib/components/ui/OutputDrawer.svelte';
	import ToastContainer from '$lib/components/ui/ToastContainer.svelte';

	// Track if mounted
	let mounted = $state(false);

	// Dynamically imported XYFlow components
	let SvelteFlow: any = $state(null);
	let Background: any = $state(null);
	let BackgroundVariant: any = $state(null);
	let MiniMap: any = $state(null);
	let Controls: any = $state(null);
	let nodeTypes: any = $state(null);

	// Local state for SvelteFlow
	// We use $state.raw for nodes/edges to improve performance as recommended by SvelteFlow
	let currentNodes = $state.raw<PromptNode[]>([]);
	let currentEdges = $state.raw<PromptEdge[]>([]);

	// Initial sync from store
	onMount(() => {
		currentNodes = get(nodes);
		currentEdges = get(edges);
		lastNodeCount = currentNodes.length;
		lastEdgeCount = currentEdges.length;

		// Dynamic import to avoid SSR issues
		(async () => {
			const xyflow = await import('@xyflow/svelte');
			await import('@xyflow/svelte/dist/style.css');

			SvelteFlow = xyflow.SvelteFlow;
			Background = xyflow.Background;
			BackgroundVariant = xyflow.BackgroundVariant;
			MiniMap = xyflow.MiniMap;
			Controls = xyflow.Controls;

			// Node Components (dynamic import)
			const [
				ProductNode,
				SceneNode,
				StyleNode,
				BrandingNode,
				LightingNode,
				CameraNode,
				QualityNode,
				OutputNode,
				RefineNode,
				CustomPromptNode,
				ImageUploadNode,
				HumanNode,
				ClothingNode,
				VariationNode,
				PlantNode,
				TextureNode,
				PoseNode,
				BackgroundNode,
				PhotographyNode,
				BatchProcessorNode
			] = await Promise.all([
				import('$lib/components/nodes/ProductNode.svelte'),
				import('$lib/components/nodes/SceneNode.svelte'),
				import('$lib/components/nodes/StyleNode.svelte'),
				import('$lib/components/nodes/BrandingNode.svelte'),
				import('$lib/components/nodes/LightingNode.svelte'),
				import('$lib/components/nodes/CameraNode.svelte'),
				import('$lib/components/nodes/QualityNode.svelte'),
				import('$lib/components/nodes/OutputNode.svelte'),
				import('$lib/components/nodes/RefineNode.svelte'),
				import('$lib/components/nodes/CustomPromptNode.svelte'),
				import('$lib/components/nodes/ImageUploadNode.svelte'),
				import('$lib/components/nodes/HumanNode.svelte'),
				import('$lib/components/nodes/ClothingNode.svelte'),
				import('$lib/components/nodes/VariationNode.svelte'),
				import('$lib/components/nodes/PlantNode.svelte'),
				import('$lib/components/nodes/TextureNode.svelte'),
				import('$lib/components/nodes/PoseNode.svelte'),
				import('$lib/components/nodes/BackgroundNode.svelte'),
				import('$lib/components/nodes/PhotographyNode.svelte'),
				import('$lib/components/nodes/BatchProcessorNode.svelte')
			]);

			nodeTypes = {
				product: ProductNode.default,
				scene: SceneNode.default,
				style: StyleNode.default,
				branding: BrandingNode.default,
				lighting: LightingNode.default,
				camera: CameraNode.default,
				quality: QualityNode.default,
				output: OutputNode.default,
				refine: RefineNode.default,
				custom: CustomPromptNode.default,
				image: ImageUploadNode.default,
				human: HumanNode.default,
				clothing: ClothingNode.default,
				variation: VariationNode.default,
				plant: PlantNode.default,
				texture: TextureNode.default,
				pose: PoseNode.default,
				background: BackgroundNode.default,
				photography: PhotographyNode.default,
				batch: BatchProcessorNode.default
			};

			mounted = true;
		})();
	});

	// Track node count to detect additions
	let lastNodeCount = $state(0);

	// Sync DATA updates from store TO local (for updateNodeData calls)
	// Also handle new node additions when store.length increases
	$effect(() => {
		const storeNodes = $nodes;
		const storeCount = storeNodes.length;

		console.log(
			'[Sync] Effect triggered - Store nodes:',
			storeCount,
			'Local nodes:',
			currentNodes.length
		);

		// Handle reset (store is empty)
		if (storeCount === 0 && currentNodes.length > 0) {
			console.log('[Sync] RESET detected - clearing local nodes');
			currentNodes = [];
			lastNodeCount = 0;
			return;
		}

		// Check if this is a full canvas replace (like file load)
		const localNodeIds = new Set(currentNodes.map((n) => n.id));
		const storeNodeIds = new Set(storeNodes.map((n) => n.id));
		const existingCount = storeNodes.filter((n) => localNodeIds.has(n.id)).length;

		// If less than half of store nodes exist locally, it's a full replace
		if (storeCount > 0 && existingCount < storeCount / 2) {
			console.log('[Sync] FULL REPLACE detected');
			currentNodes = storeNodes;
			lastNodeCount = storeCount;
			return;
		}

		// Handle deletions - remove local nodes that don't exist in store
		if (storeCount < currentNodes.length) {
			console.log('[Sync] DELETION detected - filtering local nodes');
			currentNodes = currentNodes.filter((n) => storeNodeIds.has(n.id));
			lastNodeCount = storeCount;
		}

		// Detect if nodes were added
		if (storeCount > lastNodeCount) {
			console.log('[Sync] ADDITION detected - adding new nodes');
			for (const storeNode of storeNodes) {
				const existsLocally = currentNodes.some((n) => n.id === storeNode.id);
				if (!existsLocally) {
					currentNodes = [...currentNodes, storeNode];
				}
			}
		}
		lastNodeCount = storeCount;

		// Only sync data updates for nodes that already exist locally
		let needsUpdate = false;
		const newNodes = currentNodes.map((localNode) => {
			const storeNode = storeNodes.find((n) => n.id === localNode.id);
			if (storeNode && JSON.stringify(localNode.data) !== JSON.stringify(storeNode.data)) {
				needsUpdate = true;
				return { ...localNode, data: { ...storeNode.data } };
			}
			return localNode;
		});

		if (needsUpdate) {
			currentNodes = newNodes;
		}
	});

	// Track edge count to detect additions
	let lastEdgeCount = $state(0);

	$effect(() => {
		const storeEdges = $edges;
		const storeCount = storeEdges.length;

		// Handle reset (store is empty)
		if (storeCount === 0 && currentEdges.length > 0) {
			currentEdges = [];
			lastEdgeCount = 0;
			return;
		}

		// Check if this is a full canvas replace (like file load)
		const localEdgeIds = new Set(currentEdges.map((e) => e.id));
		const storeEdgeIds = new Set(storeEdges.map((e) => e.id));
		const existingCount = storeEdges.filter((e) => localEdgeIds.has(e.id)).length;

		// If less than half of store edges exist locally, it's a full replace
		if (storeCount > 0 && existingCount < storeCount / 2) {
			currentEdges = storeEdges;
			lastEdgeCount = storeCount;
			return;
		}

		// Handle deletions
		if (storeCount < currentEdges.length) {
			currentEdges = currentEdges.filter((e) => storeEdgeIds.has(e.id));
			lastEdgeCount = storeCount;
		}

		// Detect if an edge was added
		if (storeCount > lastEdgeCount) {
			for (const storeEdge of storeEdges) {
				const existsLocally = currentEdges.some((e) => e.id === storeEdge.id);
				if (!existsLocally) {
					currentEdges = [...currentEdges, storeEdge];
				}
			}
		}
		lastEdgeCount = storeCount;
	});

	// ============================================
	// LOCAL → STORE SYNC (for SvelteFlow mutations like delete)
	// ============================================
	// Track local node count to detect SvelteFlow-initiated deletions
	let prevLocalNodeCount = $state(0);

	$effect(() => {
		const localCount = currentNodes.length;
		const storeCount = $nodes.length;

		// Detect if SvelteFlow deleted nodes (local decreased, store stayed same or higher)
		if (localCount < prevLocalNodeCount && localCount < storeCount) {
			console.log('[LocalSync] SvelteFlow deleted nodes - syncing to store', {
				local: localCount,
				store: storeCount,
				prev: prevLocalNodeCount
			});

			// Get IDs of nodes that exist in local
			const localNodeIds = new Set(currentNodes.map((n) => n.id));

			// Update store to only include nodes that exist locally
			nodes.update((storeNodes) => storeNodes.filter((n) => localNodeIds.has(n.id)));
		}

		prevLocalNodeCount = localCount;
	});

	// Drawer mode for adjusting canvas height
	let drawerMode = $derived($drawerState.mode);

	// Handle node changes from SvelteFlow - update Store
	function handleNodesChange(changes: any) {
		console.log(
			'[NodesChange] Changes received:',
			changes?.length,
			changes?.map((c: any) => c.type)
		);

		// Process changes explicitly
		for (const change of changes || []) {
			if (change.type === 'remove') {
				const nodeId = change.id;
				console.log('[NodesChange] REMOVE event for node:', nodeId);

				// Explicitly remove from store
				nodes.update((n) => n.filter((node) => node.id !== nodeId));
				edges.update((e) => e.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
			} else if (change.type === 'position' && change.position) {
				// Position update - just let SvelteFlow handle it, we'll sync later if needed
			}
		}

		// DON'T sync all nodes here - it causes race conditions
		// Only sync position changes periodically or on specific events
	}

	function handleEdgesChange(changes: any) {
		// Sync current edges to store
		edges.set(currentEdges);
	}

	// Handle new connections
	function handleConnect(connection: any) {
		if (connection?.source && connection?.target) {
			// This updates store directly
			addEdge(connection.source, connection.target);
		}
	}

	// Handle edge click - delete the connection
	function handleEdgeClick(event: any) {
		const edge = event?.edge;
		if (edge?.id) {
			removeEdge(edge.id);
		}
	}

	// Handle node selection - must set 'selected' property for delete to work
	function handleNodeClick(event: any) {
		const node = event?.node;
		if (node?.id) {
			selectedNodeId.set(node.id);
			// Update nodes to mark this one as selected
			currentNodes = currentNodes.map((n) => ({
				...n,
				selected: n.id === node.id
			}));
		}
	}

	function handlePaneClick() {
		selectedNodeId.set(null);
		// Clear selection from all nodes
		currentNodes = currentNodes.map((n) => ({
			...n,
			selected: false
		}));
	}

	// Handle selection change events
	function handleSelectionChange(params: any) {
		// Selection changed - could be used for multi-select in future
	}

	// Zoom control handlers
	let flowInstance: any = $state(null);

	function handleZoomIn() {
		console.log('[Zoom] handleZoomIn called, flowInstance:', !!flowInstance);
		if (flowInstance) {
			console.log('[Zoom] flowInstance methods:', Object.keys(flowInstance || {}));
			const viewport = flowInstance.getViewport?.();
			console.log('[Zoom] Current viewport:', viewport);
			if (viewport) {
				const newZoom = Math.min(viewport.zoom * 1.2, 2);
				console.log('[Zoom] Setting new zoom:', newZoom);
				flowInstance.setViewport?.({ ...viewport, zoom: newZoom });
			}
		}
	}

	function handleZoomOut() {
		console.log('[Zoom] handleZoomOut called, flowInstance:', !!flowInstance);
		if (flowInstance) {
			const viewport = flowInstance.getViewport?.();
			if (viewport) {
				const newZoom = Math.max(viewport.zoom * 0.8, 0.1);
				flowInstance.setViewport?.({ ...viewport, zoom: newZoom });
			}
		}
	}

	function handleFitView() {
		console.log('[Zoom] handleFitView called, flowInstance:', !!flowInstance);
		flowInstance?.fitView?.({ padding: 0.2 });
	}

	// Get minimap node color based on type
	function getMinimapNodeColor(node: any): string {
		const data = node.data;
		const nodeType = data?.type as NodeType;
		return NODE_COLORS[nodeType] || '#888888';
	}
</script>

<div
	class="app-container"
	class:drawer-expanded={drawerMode === 'expanded'}
	class:drawer-fullscreen={drawerMode === 'fullscreen'}
>
	<TopBar />

	<main class="canvas-container">
		{#if mounted && SvelteFlow && nodeTypes}
			<SvelteFlow
				bind:nodes={currentNodes}
				bind:edges={currentEdges}
				{nodeTypes}
				onnodeschange={handleNodesChange}
				onedgeschange={handleEdgesChange}
				onconnect={handleConnect}
				onnodeclick={handleNodeClick}
				onedgeclick={handleEdgeClick}
				onpaneclick={handlePaneClick}
				onselectionchange={handleSelectionChange}
				bind:this={flowInstance}
				fitView={false}
				deleteKeyCode={['Backspace', 'Delete']}
				selectionKeyCode={null}
				multiSelectionKeyCode={['Control', 'Meta']}
				defaultEdgeOptions={{ type: 'default', animated: true }}
				snapToGrid={true}
				snapGrid={[24, 24]}
				minZoom={0.1}
				maxZoom={2}
			>
				<Background variant={BackgroundVariant?.Dots} gap={24} size={1} />
				<MiniMap nodeColor={getMinimapNodeColor} pannable zoomable />
				{#if Controls}
					<Controls />
				{/if}
			</SvelteFlow>
		{:else}
			<div class="loading">
				<div class="spinner"></div>
				<p>Loading canvas...</p>
			</div>
		{/if}
	</main>

	{#if drawerMode === 'collapsed'}
		<PromptPreview />
	{/if}

	<OutputDrawer />
	<ToastContainer />
</div>

<style>
	.app-container {
		width: 100vw;
		height: 100vh;
		display: flex;
		flex-direction: column;
		background-color: var(--color-bg-canvas);
		overflow: hidden;
	}

	.canvas-container {
		flex: 1;
		margin-top: var(--topbar-height);
		position: relative;
		transition: height var(--transition-drawer);
	}

	.app-container.drawer-expanded .canvas-container {
		height: calc(100vh - var(--topbar-height) - 40vh);
	}

	.app-container.drawer-fullscreen .canvas-container {
		height: 0;
		overflow: hidden;
	}

	.loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: var(--color-text-muted);
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 3px solid var(--color-bg-ui);
		border-top-color: var(--color-node-product);
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 16px;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* XYFlow container styling */
	:global(.svelte-flow) {
		width: 100%;
		height: 100%;
	}

	/* Custom edge styling - clickable */
	:global(.svelte-flow__edge-path) {
		stroke: var(--color-text-muted);
		stroke-width: 2;
		cursor: pointer;
	}

	:global(.svelte-flow__edge:hover .svelte-flow__edge-path) {
		stroke: var(--color-error);
		stroke-width: 3;
	}

	:global(.svelte-flow__edge.animated .svelte-flow__edge-path) {
		stroke-dasharray: 5;
		animation: dashdraw 0.5s linear infinite;
	}

	@keyframes dashdraw {
		from {
			stroke-dashoffset: 10;
		}
		to {
			stroke-dashoffset: 0;
		}
	}

	/* Minimap styling */
	:global(.svelte-flow__minimap) {
		right: 16px;
		bottom: 130px;
		width: 180px;
		height: 120px;
		background-color: var(--color-bg-ui) !important;
		border: 1px solid var(--color-text-muted);
		border-radius: var(--radius-lg);
	}

	/* Hide default attribution */
	:global(.svelte-flow__attribution) {
		display: none;
	}

	/* Style SvelteFlow Controls to match our design */
	:global(.svelte-flow__controls) {
		display: flex;
		flex-direction: column;
		gap: 8px;
		bottom: 130px;
		left: 16px;
		box-shadow: none;
		background: transparent;
		border: none;
	}

	:global(.svelte-flow__controls button) {
		width: 40px;
		height: 40px;
		border-radius: 8px;
		background-color: var(--color-bg-ui);
		border: 1px solid var(--color-text-muted);
		color: var(--color-text-primary);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.15s ease;
		padding: 0;
	}

	:global(.svelte-flow__controls button:hover) {
		border-color: var(--color-node-product);
		color: var(--color-node-product);
		background-color: var(--color-bg-ui);
	}

	:global(.svelte-flow__controls button svg) {
		width: 16px;
		height: 16px;
		fill: currentColor;
	}

	:global(.svelte-flow__controls button path) {
		fill: currentColor;
	}
</style>
