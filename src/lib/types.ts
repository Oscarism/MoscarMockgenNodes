// ============================================
// MOSCAR - Node-Based Prompt Builder
// TypeScript Type Definitions
// ============================================

import type { Node, Edge } from '@xyflow/svelte';

// ============================================
// Node Type Identifiers
// ============================================
export type NodeType =
	| 'product'
	| 'scene'
	| 'style'
	| 'branding'
	| 'lighting'
	| 'camera'
	| 'quality'
	| 'output'
	| 'refine'
	| 'custom'
	| 'image'
	| 'human'
	| 'clothing'
	| 'variation'
	| 'plant'
	| 'texture'
	| 'pose'
	| 'background'
	| 'photography'
	| 'batch';

// ============================================
// Node Data Types
// ============================================
export interface ProductNodeData {
	type: 'product';
	category: string;
	product: string;
	customSpecs?: string;
	autoEnhance?: boolean;
}

export interface SceneNodeData {
	type: 'scene';
	environment: 'studio' | 'lifestyle' | 'action' | 'location';
	setting: string;
	customSetting?: string;
}

export interface StyleNodeData {
	type: 'style';
	style: string;
	palette: string;
	designMovement?: string;
}

export interface BrandingNodeData {
	type: 'branding';
	text: string;
	placement: 'center' | 'corner' | 'full-coverage' | 'custom';
	fontStyle: 'bold' | 'minimal' | 'decorative' | 'modern';
	customPlacement?: string;
}

export interface LightingNodeData {
	type: 'lighting';
	lightType: 'natural' | 'studio' | 'ambient';
	setting: string;
}

export interface CameraNodeData {
	type: 'camera';
	angle: string;
	distance: string;
	depthOfField: 'shallow' | 'deep' | 'medium';
}

export type GenerationModel = 
  | 'seedream/4.5-text-to-image' 
  | 'seedream/4.5-edit' 
  | 'z-image'
  | 'flux-2/pro-image-to-image'
  | 'nano-banana-pro';

export interface QualityNodeData {
	type: 'quality';
	model: GenerationModel; // Kept for backwards compatibility
	models: GenerationModel[]; // New: array for multi-model selection
	aspectRatio: AspectRatio;
	quality: 'basic' | 'high';
}

export interface OutputNodeData {
	type: 'output';
	isGenerating: boolean;
	batchCount: number;
	lastPrompt?: string;
	lastTaskId?: string;
}

export interface RefineNodeData {
	type: 'refine';
	originalImageUrl: string;
	instructions: string;
	isRefining: boolean;
}

export interface CustomPromptNodeData {
	type: 'custom';
	promptText: string;
}

export interface UploadedImage {
	file?: File;
	previewUrl: string;
	hostedUrl?: string;
	isUploading: boolean;
}

export interface ImageUploadNodeData {
	type: 'image';
	images: UploadedImage[];
}

export interface HumanNodeData {
	type: 'human';
	gender: 'male' | 'female';
	ethnicity: string;
	ageRange: string;
	bodyType: string;
	pose: string;
	expression: string;
	hairStyle: string;
	hairColor: string;
	skinTone: string;
	skinImperfections: string;
	customPrompt: string;
}

export interface ClothingNodeData {
	type: 'clothing';
	clothingType: string;
	style: string;
	color: string;
}

export interface VariationNodeData {
	type: 'variation';
	variations: string[];
}

export interface PlantNodeData {
	type: 'plant';
	plantType: string;
	customPlant?: string;
}

export interface TextureNodeData {
	type: 'texture';
	textureType: string;
	customTexture?: string;
}

export interface PoseNodeData {
	type: 'pose';
	styleMood: string;
	bodyPose: string;
	customPose?: string;
}

export interface BackgroundNodeData {
	type: 'background';
	style: string;
	solidColor?: string;
	gradientColors?: string[];
	environment?: string;
	timeOfDay?: string;
	mood?: string;
	blur?: number;
	customPrompt?: string;
}

export interface PhotographyNodeData {
	type: 'photography';
	preset: string;
	autoEnhance: boolean;
	customPrompt?: string;
}

export interface BatchImage {
	file?: File;
	previewUrl: string;
	hostedUrl?: string;
	status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
	error?: string;
}

export interface BatchProcessorNodeData {
	type: 'batch';
	images: BatchImage[];
	prompt?: string;
}

// Image slot colors for up to 8 images
export const IMAGE_SLOT_COLORS = [
	'#FF6B6B', // Red
	'#4ECDC4', // Teal
	'#45B7D1', // Blue
	'#96CEB4', // Green
	'#FFEAA7', // Yellow
	'#DDA0DD', // Plum
	'#98D8C8', // Mint
	'#F7DC6F'  // Gold
];

// Union type for all node data
export type PromptNodeData =
	| ProductNodeData
	| SceneNodeData
	| StyleNodeData
	| BrandingNodeData
	| LightingNodeData
	| CameraNodeData
	| QualityNodeData
	| OutputNodeData
	| RefineNodeData
	| CustomPromptNodeData
	| ImageUploadNodeData
	| HumanNodeData
	| ClothingNodeData
	| VariationNodeData
	| PlantNodeData
	| TextureNodeData
	| PoseNodeData
	| BackgroundNodeData
	| PhotographyNodeData
	| BatchProcessorNodeData;

// ============================================
// XYFlow Node Types
// ============================================
export type PromptNode = Node<PromptNodeData & Record<string, unknown>, NodeType>;
export type PromptEdge = Edge;

// ============================================
// API Types
// ============================================
export type AspectRatio = '1:1' | '4:3' | '3:4' | '16:9' | '9:16' | '2:3' | '3:2' | '21:9' | '4:5' | '5:4' | 'auto';
export type Quality = 'basic' | 'high';

export interface CreateTaskRequest {
	model: string;
	input: {
		prompt: string;
		aspect_ratio: AspectRatio;
		quality: Quality;
		image_urls?: string[];
	};
	callBackUrl?: string;
}

export interface CreateTaskResponse {
	code: number;
	msg: string;
	data: {
		taskId: string;
	};
}

export interface TaskStatusResponse {
	code: number;
	msg: string;
	data: {
		taskId: string;
		model: string;
		state: 'waiting' | 'success' | 'fail';
		param: string;
		resultJson: string | null;
		failCode: string | null;
		failMsg: string | null;
		costTime: number | null;
		completeTime: number | null;
		createTime: number;
	};
}

export interface TaskResult {
	resultUrls?: string[];
	resultObject?: Record<string, unknown>;
}

// ============================================
// Generation History
// ============================================
export interface GenerationRecord {
	id: string;
	timestamp: number;
	prompt: string;
	aspectRatio: AspectRatio;
	quality: Quality;
	taskId: string;
	state: 'waiting' | 'success' | 'fail';
	resultUrls?: string[];
	errorMessage?: string;
	model?: string; // Track which model was used for this generation
	nodeConfiguration?: string; // JSON stringified node config
}

// ============================================
// App State Types
// ============================================
export interface CanvasState {
	nodes: PromptNode[];
	edges: PromptEdge[];
	selectedNodeId: string | null;
}

export interface GenerationState {
	isGenerating: boolean;
	currentTaskId: string | null;
	pollingInterval: number | null;
	generatedImages: string[];
	history: GenerationRecord[];
	error: string | null;
}

export interface DrawerState {
	mode: 'collapsed' | 'expanded' | 'fullscreen';
	selectedImageIndex: number | null;
}

// ============================================
// Node Color Mapping
// ============================================
export const NODE_COLORS: Record<NodeType, string> = {
	product: '#C9FE6E', // Lime
	scene: '#6EFEC9', // Mint
	style: '#C96EFE', // Purple
	branding: '#FEC26E', // Orange
	lighting: '#FEFE6E', // Yellow
	camera: '#6EC9FE', // Cyan
	quality: '#FE6EC9', // Pink
	output: '#FE6E6E', // Red
	refine: '#6EFE85', // Green
	custom: '#FFFFFF', // White
	image: '#FF9F43',  // Orange/Amber
	human: '#FFC312',  // Sunflower
	clothing: '#12CBC4', // Turquoise
	variation: '#F9E79F', // Yellow
	plant: '#2ecc71', // Emerald Green
	texture: '#95a5a6', // Concrete Gray
	pose: '#E91E63', // Pink/Magenta
	background: '#607D8B', // Blue Grey
	photography: '#3498db', // Bright Blue
	batch: '#FF9F43' // Orange
};

// ============================================
// Node Display Names
// ============================================
export const NODE_NAMES: Record<NodeType, string> = {
	product: 'Product Selection',
	scene: 'Scene / Context',
	style: 'Style / Aesthetic',
	branding: 'Branding / Text',
	lighting: 'Lighting',
	camera: 'Camera / Perspective',
	quality: 'Quality Settings',
	output: 'Generate Output',
	refine: 'Refine / Edit',
	custom: 'Custom Prompt',
	image: 'Image Upload',
	human: 'Human Character',
	clothing: 'Clothing / Outfit',
	variation: 'Variations',
	plant: 'Plants',
	texture: 'Textures & Materials',
	pose: 'Pose / Body Language',
	background: 'Background',
	photography: 'Photography',
	batch: 'Batch Processor'
};

// ============================================
// Default Node Data
// ============================================
export const DEFAULT_NODE_DATA: Record<NodeType, PromptNodeData> = {
	product: {
		type: 'product',
		category: 'Apparel & Bags',
		product: 'T-Shirt'
	},
	scene: {
		type: 'scene',
		environment: 'studio',
		setting: 'white background'
	},
	style: {
		type: 'style',
		style: 'Minimalist',
		palette: 'neutral'
	},
	branding: {
		type: 'branding',
		text: '',
		placement: 'center',
		fontStyle: 'modern'
	},
	lighting: {
		type: 'lighting',
		lightType: 'studio',
		setting: 'soft box'
	},
	camera: {
		type: 'camera',
		angle: 'front',
		distance: 'medium',
		depthOfField: 'medium'
	},
	quality: {
		type: 'quality',
		model: 'seedream/4.5-text-to-image',
		models: ['seedream/4.5-text-to-image'],
		aspectRatio: '1:1',
		quality: 'basic'
	},
	output: {
		type: 'output',
		isGenerating: false,
		batchCount: 1
	},
	refine: {
		type: 'refine',
		originalImageUrl: '',
		instructions: '',
		isRefining: false
	},
	custom: {
		type: 'custom',
		promptText: ''
	},
	image: {
		type: 'image',
		images: []
	},
	human: {
		type: 'human',
		gender: 'female',
		ethnicity: 'Caucasian',
		ageRange: 'Young Adult (20-29)',
		bodyType: 'Average',
		pose: 'Standing',
		expression: 'Neutral',
		hairStyle: 'Long',
		hairColor: 'Brown',
		skinTone: 'medium',
		skinImperfections: 'None',
		customPrompt: ''
	},
	clothing: {
		type: 'clothing',
		clothingType: 'T-Shirt',
		style: 'Casual',
		color: 'White'
	},
	variation: {
		type: 'variation',
		variations: ['option 1', 'option 2']
	},
	plant: {
		type: 'plant',
		plantType: 'monstera',
		customPlant: ''
	},
	texture: {
		type: 'texture',
		textureType: 'wood',
		customTexture: ''
	},
	pose: {
		type: 'pose',
		styleMood: 'confident',
		bodyPose: 'standing',
		customPose: ''
	},
	background: {
		type: 'background',
		style: 'clean',
		solidColor: '#FFFFFF',
		gradientColors: undefined,
		environment: '',
		timeOfDay: '',
		mood: '',
		blur: 0,
		customPrompt: ''
	},
	photography: {
		type: 'photography',
		preset: 'none',
		autoEnhance: true,
		customPrompt: ''
	},
	batch: {
		type: 'batch',
		images: [],
		prompt: ''
	}
};
