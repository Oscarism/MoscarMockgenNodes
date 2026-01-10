// ============================================
// Reference Image Labels Presets
// ============================================

export interface ReferenceLabel {
	id: string;
	label: string;
	prompt: string;
}

export interface ReferenceLabelCategory {
	id: string;
	label: string;
	options: ReferenceLabel[];
}

// Subject Reference Labels
export const subjectReferenceLabels: ReferenceLabel[] = [
	{ id: 'product', label: 'Product', prompt: 'use this image as the main product reference' },
	{ id: 'model', label: 'Model/Person', prompt: 'use this image as the human model reference' },
	{ id: 'clothing', label: 'Clothing Item', prompt: 'use this image as the clothing/garment reference' },
	{ id: 'accessory', label: 'Accessory', prompt: 'use this image as the accessory reference' },
	{ id: 'object', label: 'Object/Prop', prompt: 'use this image as the object reference' }
];

// Environment Reference Labels
export const environmentReferenceLabels: ReferenceLabel[] = [
	{ id: 'background', label: 'Background', prompt: 'use this image as the background reference' },
	{ id: 'scene', label: 'Scene/Setting', prompt: 'use this image as the overall scene reference' },
	{ id: 'location', label: 'Location', prompt: 'use this image as the location reference' },
	{ id: 'surface', label: 'Surface/Texture', prompt: 'use this image as the surface texture reference' }
];

// Style Reference Labels
export const styleReferenceLabels: ReferenceLabel[] = [
	{ id: 'mood', label: 'Mood/Vibe', prompt: 'use this image as the mood and atmosphere reference' },
	{ id: 'color-palette', label: 'Color Palette', prompt: 'use this image as the color palette reference' },
	{ id: 'lighting', label: 'Lighting Style', prompt: 'use this image as the lighting style reference' },
	{ id: 'composition', label: 'Composition', prompt: 'use this image as the composition layout reference' },
	{ id: 'aesthetic', label: 'Overall Aesthetic', prompt: 'use this image as the overall aesthetic reference' }
];

// Detail Reference Labels
export const detailReferenceLabels: ReferenceLabel[] = [
	{ id: 'texture', label: 'Texture Detail', prompt: 'use this image as the texture detail reference' },
	{ id: 'pattern', label: 'Pattern', prompt: 'use this image as the pattern reference' },
	{ id: 'material', label: 'Material', prompt: 'use this image as the material finish reference' },
	{ id: 'logo', label: 'Logo/Branding', prompt: 'use this image as the logo branding reference' }
];

// All categories for dropdown grouping
export const referenceLabelCategories: ReferenceLabelCategory[] = [
	{ id: 'subject', label: 'Subject Reference', options: subjectReferenceLabels },
	{ id: 'environment', label: 'Environment Reference', options: environmentReferenceLabels },
	{ id: 'style', label: 'Style Reference', options: styleReferenceLabels },
	{ id: 'detail', label: 'Detail Reference', options: detailReferenceLabels }
];

// Flat list of all labels for easy lookup
export const allReferenceLabels: ReferenceLabel[] = [
	...subjectReferenceLabels,
	...environmentReferenceLabels,
	...styleReferenceLabels,
	...detailReferenceLabels
];
