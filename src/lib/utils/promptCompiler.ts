// ============================================
// MOSCAR - Prompt Compiler Utility
// Traverses connected nodes and builds final prompt
// ============================================

import type { 
  PromptNode, 
  PromptEdge, 
  ProductNodeData,
  SceneNodeData,
  StyleNodeData,
  BrandingNodeData,
  LightingNodeData,
  CameraNodeData,
  QualityNodeData,
  CustomPromptNodeData,
  ImageUploadNodeData,
  HumanNodeData,
  ClothingNodeData,
  VariationNodeData,
  PlantNodeData,
  TextureNodeData,
  PoseNodeData,
  BackgroundNodeData
} from '$lib/types';
import { productCategories, getProductsByCategory } from '$lib/data/products';
import { 
  sceneCategories, 
  stylePresets, 
  colorPalettes,
  designMovements,
  lightingCategories,
  cameraAngles,
  cameraDistances,
  depthOfFieldOptions,
  plantPresets,
  texturePresets
} from '$lib/data/presets';

// ============================================
// Prompt Segment Generators
// ============================================

function compileProductSegment(data: ProductNodeData): string {
  const products = getProductsByCategory(data.category);
  const product = products.find(p => p.name === data.product);
  
  if (product) {
    return product.defaultPrompt;
  }
  
  return `${data.product} from ${data.category}`;
}

function compileSceneSegment(data: SceneNodeData): string {
  const category = sceneCategories.find(c => c.id === data.environment);
  if (category) {
    const setting = category.options.find(o => o.id === data.setting || o.label === data.setting);
    if (setting) {
      return setting.prompt;
    }
  }
  
  return data.customSetting || `${data.environment} setting`;
}

function compileStyleSegment(data: StyleNodeData): string {
  const segments: string[] = [];
  
  const style = stylePresets.find(s => s.id === data.style || s.label === data.style);
  if (style) {
    segments.push(style.prompt);
  }
  
  const palette = colorPalettes.find(p => p.id === data.palette || p.label === data.palette);
  if (palette) {
    segments.push(palette.prompt);
  }
  
  if (data.designMovement) {
    const movement = designMovements.find(m => m.id === data.designMovement || m.label === data.designMovement);
    if (movement) {
      segments.push(movement.prompt);
    }
  }
  
  return segments.join(', ');
}

function compileBrandingSegment(data: BrandingNodeData): string {
  if (!data.text.trim()) {
    return '';
  }
  
  const segments: string[] = [];
  
  // Text content
  segments.push(`displaying "${data.text}"`);
  
  // Placement
  const placementMap: Record<string, string> = {
    'center': 'centered on the product',
    'corner': 'placed in the corner',
    'full-coverage': 'covering the full surface',
    'custom': data.customPlacement || ''
  };
  if (placementMap[data.placement]) {
    segments.push(placementMap[data.placement]);
  }
  
  // Font style
  const fontMap: Record<string, string> = {
    'bold': 'with bold typography',
    'minimal': 'with minimal clean typography',
    'decorative': 'with decorative stylized font',
    'modern': 'with modern contemporary font'
  };
  if (fontMap[data.fontStyle]) {
    segments.push(fontMap[data.fontStyle]);
  }
  
  return segments.join(', ');
}

function compileLightingSegment(data: LightingNodeData): string {
  const category = lightingCategories.find(c => c.id === data.lightType);
  if (category) {
    const setting = category.options.find(o => o.id === data.setting || o.label === data.setting);
    if (setting) {
      return setting.prompt;
    }
  }
  
  return `${data.lightType} lighting`;
}

function compileCameraSegment(data: CameraNodeData): string {
  const segments: string[] = [];
  
  const angle = cameraAngles.find(a => a.id === data.angle || a.label === data.angle);
  if (angle) {
    segments.push(angle.prompt);
  }
  
  const distance = cameraDistances.find(d => d.id === data.distance || d.label === data.distance);
  if (distance) {
    segments.push(distance.prompt);
  }
  
  const dof = depthOfFieldOptions.find(d => d.id === data.depthOfField);
  if (dof) {
    segments.push(dof.prompt);
  }
  
  return segments.join(', ');
}

function compileHumanSegment(data: HumanNodeData): string {
  const parts = [];
  
  // Age range (extract just the category, e.g., "young adult" from "Young Adult (20-29)")
  if (data.ageRange) {
    const ageMatch = data.ageRange.match(/^([^(]+)/);
    if (ageMatch) parts.push(ageMatch[1].trim().toLowerCase());
  }
  
  // Ethnicity
  if (data.ethnicity) parts.push(data.ethnicity.toLowerCase());
  
  // Gender
  parts.push(data.gender === 'male' ? 'male' : 'female');
  
  // Body type (skip if average)
  if (data.bodyType && data.bodyType !== 'Average') parts.push(data.bodyType.toLowerCase());
  
  parts.push('person');
  
  // Hair
  if (data.hairStyle && data.hairStyle !== 'None') {
    parts.push(`with ${data.hairColor?.toLowerCase() || ''} ${data.hairStyle?.toLowerCase()} hair`.trim());
  }
  
  // Skin tone
  if (data.skinTone) {
    parts.push(`${data.skinTone} skin tone`);
  }
  
  // Skin imperfections (for realism)
  if (data.skinImperfections && data.skinImperfections !== 'None') {
    parts.push(`with ${data.skinImperfections.toLowerCase()}`);
  }
  
  // Expression (skip if neutral)
  if (data.expression && data.expression !== 'Neutral') {
    parts.push(`${data.expression.toLowerCase()} expression`);
  }
  
  // Pose (skip if standing)
  if (data.pose && data.pose !== 'Standing') parts.push(`in ${data.pose.toLowerCase()} pose`);
  
  // Custom prompt addition
  if (data.customPrompt && data.customPrompt.trim()) {
    parts.push(data.customPrompt.trim());
  }
  
  return parts.join(', ');
}

function compileClothingSegment(data: ClothingNodeData): string {
  return `wearing ${data.color} ${data.style} ${data.clothingType}`;
}

function compileVariationSegment(data: VariationNodeData): string {
  const filtered = data.variations.filter(v => v.trim());
  if (filtered.length === 0) return '';
  if (filtered.length === 1) return filtered[0];
  return `{${filtered.join('|')}}`;
}

function compilePlantSegment(data: PlantNodeData): string {
  if (data.customPlant && data.customPlant.trim()) {
    return data.customPlant.trim();
  }
  const preset = plantPresets.find(p => p.id === data.plantType);
  return preset?.prompt || data.plantType;
}

function compileTextureSegment(data: TextureNodeData): string {
  if (data.customTexture && data.customTexture.trim()) {
    return data.customTexture.trim();
  }
  const preset = texturePresets.find(p => p.id === data.textureType);
  return preset?.prompt || data.textureType;
}

function compilePoseSegment(data: PoseNodeData): string {
  const parts: string[] = [];
  
  // Style/mood mapping
  const moodPrompts: Record<string, string> = {
    'confident': 'confident powerful pose',
    'relaxed': 'relaxed natural pose',
    'professional': 'professional composed pose',
    'playful': 'playful energetic pose',
    'elegant': 'elegant graceful pose',
    'casual': 'casual everyday pose',
    'dramatic': 'dramatic expressive pose',
    'minimal': 'minimal understated pose'
  };
  
  // Body pose mapping
  const posePrompts: Record<string, string> = {
    'standing': 'standing upright',
    'sitting': 'sitting comfortably',
    'leaning': 'leaning casually',
    'hand-on-hip': 'hand on hip',
    'hand-on-neck': 'hand touching neck',
    'arms-crossed': 'arms crossed',
    'hands-in-pockets': 'hands in pockets',
    'walking': 'walking in motion',
    'reaching': 'reaching upward',
    'crouching': 'crouching low',
    'lying-down': 'lying down relaxed',
    'jumping': 'jumping in air',
    'dancing': 'dancing movement',
    'stretching': 'stretching body',
    'kneeling': 'kneeling down'
  };
  
  if (data.styleMood && moodPrompts[data.styleMood]) {
    parts.push(moodPrompts[data.styleMood]);
  }
  
  if (data.bodyPose && posePrompts[data.bodyPose]) {
    parts.push(posePrompts[data.bodyPose]);
  }
  
  if (data.customPose && data.customPose.trim()) {
    parts.push(data.customPose.trim());
  }
  
  return parts.join(', ');
}

function compileBackgroundSegment(data: BackgroundNodeData): string {
  const parts: string[] = [];
  
  // Style mapping
  const stylePrompts: Record<string, string> = {
    'seamless': 'seamless backdrop',
    'textured': 'textured background',
    'clean': 'clean minimal background',
    'minimal': 'minimalist simple background'
  };
  
  // Environment mapping
  const envPrompts: Record<string, string> = {
    'studio': 'professional photography studio background',
    'nature': 'natural outdoor environment background',
    'urban': 'urban city environment background',
    'interior': 'interior room setting background',
    'abstract': 'abstract artistic background',
    'sky': 'sky and clouds background',
    'beach': 'beach and ocean background',
    'mountains': 'mountain landscape background'
  };
  
  if (data.style && stylePrompts[data.style]) {
    parts.push(stylePrompts[data.style]);
  }
  
  // Add color if solid color is set and not white
  if (data.solidColor && data.solidColor !== '#FFFFFF') {
    parts.push(`${data.solidColor} colored background`);
  }
  
  // Add gradient if set
  if (data.gradientColors && data.gradientColors.length >= 2) {
    parts.push(`gradient from ${data.gradientColors[0]} to ${data.gradientColors[1]}`);
  }
  
  // Add environment
  if (data.environment && envPrompts[data.environment]) {
    parts.push(envPrompts[data.environment]);
  }
  
  // Add custom prompt
  if (data.customPrompt && data.customPrompt.trim()) {
    parts.push(data.customPrompt.trim());
  }
  
  return parts.join(', ');
}

// ============================================
// Quality Descriptors (Best Practices)
// ============================================

const QUALITY_PREFIXES = [
  'Professional product photography',
  'High resolution commercial mockup',
  '8K quality',
];

const QUALITY_SUFFIXES = [
  'realistic shadows and lighting',
  'photorealistic materials and textures',
  'professional studio quality'
];

// ============================================
// Main Prompt Compiler
// ============================================

export interface CompiledPrompt {
  prompt: string;
  segments: { nodeType: string; content: string }[];
  characterCount: number;
  warnings: string[];
}

/**
 * Compile a prompt from all nodes connected to the output node
 */
export function compilePrompt(
  nodes: PromptNode[], 
  edges: PromptEdge[],
  includeQualityDescriptors: boolean = true
): CompiledPrompt {
  const segments: { nodeType: string; content: string }[] = [];
  const warnings: string[] = [];
  
  // Find the output node
  const outputNode = nodes.find(n => n.data.type === 'output');
  if (!outputNode) {
    return {
      prompt: '',
      segments: [],
      characterCount: 0,
      warnings: ['No output node found']
    };
  }
  
  // Get all nodes connected to the output in connection order
  const connectedNodes = getOrderedConnectedNodes(outputNode.id, edges, nodes);
  
  // Compile each node
  for (const node of connectedNodes) {
    let content = '';
    
    switch (node.data.type) {
      case 'product':
        content = compileProductSegment(node.data as ProductNodeData);
        break;
      case 'scene':
        content = compileSceneSegment(node.data as SceneNodeData);
        break;
      case 'style':
        content = compileStyleSegment(node.data as StyleNodeData);
        break;
      case 'branding':
        content = compileBrandingSegment(node.data as BrandingNodeData);
        break;
      case 'lighting':
        content = compileLightingSegment(node.data as LightingNodeData);
        break;
      case 'camera':
        content = compileCameraSegment(node.data as CameraNodeData);
        break;
      case 'custom':
        content = (node.data as CustomPromptNodeData).promptText || '';
        break;
      case 'image':
        // Image node adds reference to uploaded images
        const imageData = node.data as ImageUploadNodeData;
        const uploadedCount = imageData.images.filter(img => img.hostedUrl).length;
        if (uploadedCount > 0) {
          content = `with ${uploadedCount} reference image${uploadedCount > 1 ? 's' : ''}`;
        }
        break;
      case 'human':
        content = compileHumanSegment(node.data as HumanNodeData);
        break;
      case 'clothing':
        content = compileClothingSegment(node.data as ClothingNodeData);
        break;
      case 'variation':
        content = compileVariationSegment(node.data as VariationNodeData);
        break;
      case 'plant':
        content = compilePlantSegment(node.data as PlantNodeData);
        break;
      case 'texture':
        content = compileTextureSegment(node.data as TextureNodeData);
        break;
      case 'pose':
        content = compilePoseSegment(node.data as PoseNodeData);
        break;
      case 'background':
        content = compileBackgroundSegment(node.data as BackgroundNodeData);
        break;
      // Quality node doesn't add to prompt text, only affects API params
    }
    
    if (content.trim()) {
      segments.push({
        nodeType: node.data.type,
        content: content.trim()
      });
    }
  }
  
  // Build final prompt
  let promptParts: string[] = [];
  
  // Add quality prefix
  if (includeQualityDescriptors) {
    promptParts.push(QUALITY_PREFIXES.join(', '));
  }
  
  // Add node segments
  promptParts.push(...segments.map(s => s.content));
  
  // Add quality suffix
  if (includeQualityDescriptors) {
    promptParts.push(QUALITY_SUFFIXES.join(', '));
  }
  
  const finalPrompt = promptParts.join('. ');
  
  // Check length
  if (finalPrompt.length > 3000) {
    warnings.push(`Prompt exceeds 3000 characters (${finalPrompt.length}). Consider simplifying.`);
  }
  
  // Check for product node
  if (!connectedNodes.some(n => n.data.type === 'product')) {
    warnings.push('No product node connected. Consider adding one for better results.');
  }
  
  return {
    prompt: finalPrompt,
    segments,
    characterCount: finalPrompt.length,
    warnings
  };
}

/**
 * Get the quality settings from connected quality node
 */
export function getQualitySettings(
  nodes: PromptNode[], 
  edges: PromptEdge[]
): { aspectRatio: string; quality: 'basic' | 'high'; model: string; models: string[]; resolution: string } {
  const outputNode = nodes.find(n => n.data.type === 'output');
  if (!outputNode) {
    return { aspectRatio: '1:1', quality: 'basic', model: 'seedream/4.5-text-to-image', models: ['seedream/4.5-text-to-image'], resolution: '1K' };
  }
  
  const connectedNodeIds = getConnectedNodeIds(outputNode.id, edges);
  const qualityNode = nodes.find(
    n => connectedNodeIds.has(n.id) && n.data.type === 'quality'
  );
  
  if (qualityNode) {
    const data = qualityNode.data as QualityNodeData;
    return {
      aspectRatio: data.aspectRatio,
      quality: data.quality,
      model: data.model || 'seedream/4.5-text-to-image',
      models: data.models || [data.model || 'seedream/4.5-text-to-image'],
      resolution: (data as any).resolution || '1K'
    };
  }
  
  return { aspectRatio: '1:1', quality: 'basic', model: 'seedream/4.5-text-to-image', models: ['seedream/4.5-text-to-image'], resolution: '1K' };
}

/**
 * Get uploaded image URLs from connected image nodes
 */
export function getUploadedImageUrls(
  nodes: PromptNode[], 
  edges: PromptEdge[]
): string[] {
  const outputNode = nodes.find(n => n.data.type === 'output');
  if (!outputNode) {
    return [];
  }
  
  const connectedNodeIds = getConnectedNodeIds(outputNode.id, edges);
  const imageNodes = nodes.filter(
    n => connectedNodeIds.has(n.id) && n.data.type === 'image'
  );
  
  const urls: string[] = [];
  for (const node of imageNodes) {
    const data = node.data as ImageUploadNodeData;
    for (const slot of data.images) {
      if (slot && slot.hostedUrl) {
        urls.push(slot.hostedUrl);
      }
    }
  }
  
  return urls;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Get all node IDs connected to a target node (traversing backwards through edges)
 * Returns nodes in reverse connection order (closest to output first)
 */
function getConnectedNodeIds(targetId: string, edges: PromptEdge[]): Set<string> {
  const connected = new Set<string>();
  const queue = [targetId];
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    
    // Find all edges pointing TO current
    const incomingEdges = edges.filter(e => e.target === current);
    
    for (const edge of incomingEdges) {
      if (!connected.has(edge.source)) {
        connected.add(edge.source);
        queue.push(edge.source);
      }
    }
  }
  
  return connected;
}

/**
 * Get connected nodes in chain order (from start of chain to output)
 * This traverses the graph and returns nodes in the order they should appear in the prompt
 */
function getOrderedConnectedNodes(targetId: string, edges: PromptEdge[], nodes: PromptNode[]): PromptNode[] {
  // First, get all connected node IDs
  const connectedIds = getConnectedNodeIds(targetId, edges);
  
  // Build adjacency list (source -> targets)
  const adjacency = new Map<string, string[]>();
  const inDegree = new Map<string, number>();
  
  // Initialize
  for (const id of connectedIds) {
    adjacency.set(id, []);
    inDegree.set(id, 0);
  }
  
  // Build graph
  for (const edge of edges) {
    if (connectedIds.has(edge.source) && (connectedIds.has(edge.target) || edge.target === targetId)) {
      adjacency.get(edge.source)?.push(edge.target);
      if (connectedIds.has(edge.target)) {
        inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
      }
    }
  }
  
  // Find nodes with no incoming edges (start of chains)
  const startNodes: string[] = [];
  for (const [id, degree] of inDegree.entries()) {
    if (degree === 0) {
      startNodes.push(id);
    }
  }
  
  // Topological sort (Kahn's algorithm)
  const orderedIds: string[] = [];
  const queue = [...startNodes];
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    orderedIds.push(current);
    
    const targets = adjacency.get(current) || [];
    for (const target of targets) {
      if (!connectedIds.has(target)) continue; // Skip output node
      const newDegree = (inDegree.get(target) || 1) - 1;
      inDegree.set(target, newDegree);
      if (newDegree === 0) {
        queue.push(target);
      }
    }
  }
  
  // Map IDs to nodes
  const orderedNodes = orderedIds
    .map(id => nodes.find(n => n.id === id))
    .filter((n): n is PromptNode => n !== undefined);
  
  console.log('[PromptCompiler] Node order:', orderedNodes.map(n => n.data.type));
  
  return orderedNodes;
}

/**
 * Estimate token count (rough approximation)
 */
export function estimateTokens(text: string): number {
  // Rough estimate: ~4 characters per token for English
  return Math.ceil(text.length / 4);
}

/**
 * Get all uploaded image URLs from connected image nodes
 * Returns array of hosted URLs ready for the Edit API
 */
export function getImageUrls(
  nodes: PromptNode[], 
  edges: PromptEdge[]
): string[] {
  const outputNode = nodes.find(n => n.data.type === 'output');
  if (!outputNode) {
    return [];
  }
  
  const connectedNodeIds = getConnectedNodeIds(outputNode.id, edges);
  const imageNodes = nodes.filter(
    n => connectedNodeIds.has(n.id) && n.data.type === 'image'
  );
  
  const urls: string[] = [];
  
  for (const node of imageNodes) {
    const data = node.data as ImageUploadNodeData;
    for (const image of data.images) {
      if (image.hostedUrl) {
        urls.push(image.hostedUrl);
      }
    }
  }
  
  return urls;
}
