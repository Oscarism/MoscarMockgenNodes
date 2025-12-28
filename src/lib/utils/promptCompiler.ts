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
  TextureNodeData
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
  
  // Get all nodes connected to the output (traverse backwards)
  const connectedNodeIds = getConnectedNodeIds(outputNode.id, edges);
  const connectedNodes = nodes.filter(n => connectedNodeIds.has(n.id));
  
  // Sort by node type priority
  const nodeOrder: Record<string, number> = {
    'product': 10,
    'human': 12,
    'clothing': 14,
    'branding': 20,
    'scene': 30,
    'plant': 35,
    'texture': 37,
    'style': 40,
    'lighting': 50,
    'camera': 60,
    'custom': 70,
    'variation': 75,
    'image': 80,
    'quality': 90
  };
  
  connectedNodes.sort((a, b) => {
    const orderA = nodeOrder[a.data.type] || 99;
    const orderB = nodeOrder[b.data.type] || 99;
    return orderA - orderB;
  });
  
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
): { aspectRatio: string; quality: 'basic' | 'high'; model: string; resolution: string } {
  const outputNode = nodes.find(n => n.data.type === 'output');
  if (!outputNode) {
    return { aspectRatio: '1:1', quality: 'basic', model: 'seedream/4.5-text-to-image', resolution: '1K' };
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
      resolution: (data as any).resolution || '1K'
    };
  }
  
  return { aspectRatio: '1:1', quality: 'basic', model: 'seedream/4.5-text-to-image', resolution: '1K' };
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
