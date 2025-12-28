// ============================================
// MOSCAR - Canvas Store (XYFlow State)
// Using $state for proper XYFlow integration
// ============================================

import { writable, derived, get } from 'svelte/store';
import type { PromptNode, PromptEdge, NodeType, PromptNodeData } from '$lib/types';
import { DEFAULT_NODE_DATA, NODE_COLORS } from '$lib/types';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// Core Canvas State
// Using writable stores but with careful update patterns
// ============================================
export const nodes = writable<PromptNode[]>([]);
export const edges = writable<PromptEdge[]>([]);
export const selectedNodeId = writable<string | null>(null);

// ============================================
// Node Management Functions
// ============================================

/**
 * Create a new node of the specified type at the given position
 */
export function createNode(
  nodeType: NodeType, 
  position: { x: number; y: number } = { x: 100, y: 100 }
): PromptNode {
  const id = uuidv4();
  const data = { ...DEFAULT_NODE_DATA[nodeType] } as PromptNodeData;
  
  return {
    id,
    type: nodeType,
    position,
    data,
  };
}

/**
 * Add a new node to the canvas
 * Uses spreading to preserve existing node positions
 */
export function addNode(nodeType: NodeType, position?: { x: number; y: number }): string {
  const node = createNode(nodeType, position);
  
  // Get current nodes and add new one WITHOUT modifying existing
  nodes.update(currentNodes => {
    // Important: Create a new array reference but don't touch existing nodes
    return [...currentNodes, node];
  });
  
  return node.id;
}

/**
 * Update a node's data WITHOUT affecting position
 * This is crucial - we only update the data property, not the entire node
 */
export function updateNodeData(nodeId: string, dataUpdates: Partial<PromptNodeData>): void {
  nodes.update(currentNodes => {
    return currentNodes.map(node => {
      if (node.id !== nodeId) {
        return node; // Return same reference for unmodified nodes
      }
      // Only create new reference for the modified node
      return {
        ...node,
        data: { ...node.data, ...dataUpdates } as PromptNodeData
      };
    });
  });
}

/**
 * Update a node's position (called from XYFlow drag events)
 */
export function updateNodePosition(nodeId: string, position: { x: number; y: number }): void {
  nodes.update(currentNodes => {
    return currentNodes.map(node => {
      if (node.id !== nodeId) {
        return node;
      }
      return { ...node, position };
    });
  });
}

/**
 * Remove a node and its connections
 */
export function removeNode(nodeId: string): void {
  nodes.update(n => n.filter(node => node.id !== nodeId));
  edges.update(e => e.filter(edge => edge.source !== nodeId && edge.target !== nodeId));
  
  // Clear selection if deleted node was selected
  selectedNodeId.update(id => id === nodeId ? null : id);
}

/**
 * Add an edge connection between nodes
 */
export function addEdge(sourceId: string, targetId: string): void {
  const id = `${sourceId}-${targetId}`;
  
  // Prevent duplicate edges
  edges.update(e => {
    if (e.some(edge => edge.id === id)) return e;
    return [...e, { id, source: sourceId, target: targetId }];
  });
}

/**
 * Remove an edge
 */
export function removeEdge(edgeId: string): void {
  edges.update(e => e.filter(edge => edge.id !== edgeId));
}

/**
 * Clear all nodes and edges
 */
export function clearCanvas(): void {
  console.log('[Canvas] clearCanvas called - resetting all state');
  nodes.set([]);
  edges.set([]);
  selectedNodeId.set(null);
  console.log('[Canvas] clearCanvas complete - nodes and edges now empty');
}

/**
 * Get nodes connected to a specific node
 */
export function getConnectedNodes(nodeId: string, edgeList: PromptEdge[], nodeList: PromptNode[]): PromptNode[] {
  const connectedIds = edgeList
    .filter(edge => edge.target === nodeId)
    .map(edge => edge.source);
  
  return nodeList.filter(node => connectedIds.includes(node.id));
}

// ============================================
// Derived Stores
// ============================================

/**
 * Get the output node if it exists
 */
export const outputNode = derived(nodes, $nodes => 
  $nodes.find(n => n.data.type === 'output')
);

/**
 * Check if a node is connected to the output
 */
export const connectedToOutput = derived([nodes, edges], ([$nodes, $edges]) => {
  const output = $nodes.find(n => n.data.type === 'output');
  if (!output) return new Set<string>();
  
  // BFS to find all nodes connected to output
  const connected = new Set<string>();
  const queue = [output.id];
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    connected.add(current);
    
    // Find nodes that connect TO current node
    const incomingEdges = $edges.filter(e => e.target === current);
    for (const edge of incomingEdges) {
      if (!connected.has(edge.source)) {
        queue.push(edge.source);
      }
    }
  }
  
  return connected;
});

/**
 * Get the accent color for a node type
 */
export function getNodeColor(nodeType: NodeType): string {
  return NODE_COLORS[nodeType];
}

// ============================================
// Canvas State Export/Import
// ============================================

export interface CanvasExport {
  nodes: PromptNode[];
  edges: PromptEdge[];
  version: string;
  exportedAt: number;
}

/**
 * Export canvas state as JSON
 */
export function exportCanvas(nodeList: PromptNode[], edgeList: PromptEdge[]): CanvasExport {
  return {
    nodes: nodeList,
    edges: edgeList,
    version: '1.0.0',
    exportedAt: Date.now()
  };
}

/**
 * Import canvas state from JSON
 */
export function importCanvas(data: CanvasExport): void {
  if (!data.nodes || !data.edges) {
    throw new Error('Invalid canvas data');
  }
  
  nodes.set(data.nodes);
  edges.set(data.edges);
  selectedNodeId.set(null);
}

/**
 * Download canvas as JSON file
 */
export function downloadCanvas(nodeList: PromptNode[], edgeList: PromptEdge[]): void {
  const data = exportCanvas(nodeList, edgeList);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `moscar-canvas-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Load canvas from file
 */
export async function loadCanvasFromFile(file: File): Promise<void> {
  const text = await file.text();
  const data = JSON.parse(text) as CanvasExport;
  importCanvas(data);
}
