// ============================================
// MOSCAR - Preset Data for Scene, Style, Lighting, Camera Nodes
// ============================================

// ============================================
// Scene / Context Presets
// ============================================
export interface ScenePreset {
  id: string;
  label: string;
  prompt: string;
}

export interface SceneCategory {
  id: string;
  label: string;
  options: ScenePreset[];
}

export const sceneCategories: SceneCategory[] = [
  {
    id: 'studio',
    label: 'Studio',
    options: [
      { id: 'white-bg', label: 'White Background', prompt: 'clean white studio background, seamless backdrop' },
      { id: 'gray-bg', label: 'Gray Background', prompt: 'neutral gray studio background, seamless backdrop' },
      { id: 'black-bg', label: 'Black Background', prompt: 'deep black studio background, seamless dark backdrop' },
      { id: 'gradient', label: 'Gradient Background', prompt: 'smooth gradient studio background' },
      { id: 'colored', label: 'Colored Background', prompt: 'solid colored studio background' },
      { id: 'textured', label: 'Textured Background', prompt: 'subtle textured studio backdrop' }
    ]
  },
  {
    id: 'lifestyle',
    label: 'Lifestyle',
    options: [
      { id: 'cafe', label: 'Cafe', prompt: 'cozy cafe setting, warm ambiance, coffee shop interior' },
      { id: 'office', label: 'Office', prompt: 'modern office environment, professional workspace' },
      { id: 'outdoor', label: 'Outdoor', prompt: 'natural outdoor setting, open air environment' },
      { id: 'urban', label: 'Urban Street', prompt: 'urban street scene, city environment, sidewalk' },
      { id: 'home', label: 'Home Interior', prompt: 'home interior setting, comfortable living space' },
      { id: 'garden', label: 'Garden', prompt: 'garden setting, natural greenery, outdoor space' },
      { id: 'beach', label: 'Beach', prompt: 'beach setting, sand and ocean, coastal environment' },
      { id: 'gym', label: 'Gym/Fitness', prompt: 'gym environment, fitness studio, workout space' }
    ]
  },
  {
    id: 'action',
    label: 'Action / Usage',
    options: [
      { id: 'wearing', label: 'Person Wearing', prompt: 'person wearing the product, natural pose' },
      { id: 'holding', label: 'Hand Holding', prompt: 'hand holding the product, realistic grip' },
      { id: 'flat-lay', label: 'Flat Lay', prompt: 'flat lay composition, top-down product arrangement' },
      { id: 'hanging', label: 'Hanging/Displayed', prompt: 'product hanging or displayed on rack' },
      { id: 'in-use', label: 'In Use', prompt: 'product being actively used, action shot' },
      { id: 'unboxing', label: 'Unboxing', prompt: 'product unboxing scene, packaging visible' }
    ]
  },
  {
    id: 'location',
    label: 'Specific Location',
    options: [
      { id: 'nyc', label: 'New York City', prompt: 'New York City backdrop, urban NYC environment' },
      { id: 'london', label: 'London', prompt: 'London setting, British urban environment' },
      { id: 'paris', label: 'Paris', prompt: 'Parisian setting, French urban environment' },
      { id: 'tokyo', label: 'Tokyo', prompt: 'Tokyo setting, Japanese urban environment' },
      { id: 'forest', label: 'Forest', prompt: 'forest setting, trees and natural greenery' },
      { id: 'mountain', label: 'Mountain', prompt: 'mountain landscape backdrop, elevated terrain' },
      { id: 'desert', label: 'Desert', prompt: 'desert landscape, sandy terrain, warm tones' }
    ]
  }
];

// ============================================
// Style / Aesthetic Presets
// ============================================
export interface StylePreset {
  id: string;
  label: string;
  prompt: string;
}

export const stylePresets: StylePreset[] = [
  { id: 'minimalist', label: 'Minimalist', prompt: 'minimalist aesthetic, clean and simple, less is more' },
  { id: 'urban', label: 'Urban / Street', prompt: 'urban street style, gritty aesthetic, streetwear vibe' },
  { id: 'luxury', label: 'Luxury', prompt: 'luxury aesthetic, premium feel, high-end presentation' },
  { id: 'vintage', label: 'Vintage', prompt: 'vintage aesthetic, retro feel, nostalgic atmosphere' },
  { id: 'modern', label: 'Modern', prompt: 'modern aesthetic, contemporary design, current trends' },
  { id: 'organic', label: 'Organic / Natural', prompt: 'organic natural aesthetic, earthy tones, sustainable feel' },
  { id: 'tech', label: 'Tech / Futuristic', prompt: 'tech aesthetic, futuristic feel, digital modern' },
  { id: 'playful', label: 'Playful / Fun', prompt: 'playful aesthetic, fun and vibrant, youthful energy' },
  { id: 'elegant', label: 'Elegant', prompt: 'elegant aesthetic, sophisticated and refined' },
  { id: 'rustic', label: 'Rustic', prompt: 'rustic aesthetic, raw and authentic, handmade feel' }
];

export interface ColorPalette {
  id: string;
  label: string;
  prompt: string;
}

export const colorPalettes: ColorPalette[] = [
  { id: 'neutral', label: 'Neutral', prompt: 'neutral color palette, whites, grays, and blacks' },
  { id: 'warm', label: 'Warm Tones', prompt: 'warm color palette, oranges, reds, and yellows' },
  { id: 'cool', label: 'Cool Tones', prompt: 'cool color palette, blues, greens, and purples' },
  { id: 'monochrome', label: 'Monochrome', prompt: 'monochromatic color scheme, single color variations' },
  { id: 'vibrant', label: 'Vibrant', prompt: 'vibrant saturated colors, bold and eye-catching' },
  { id: 'pastel', label: 'Pastel', prompt: 'soft pastel colors, muted and gentle tones' },
  { id: 'earth', label: 'Earth Tones', prompt: 'earthy color palette, browns, greens, and tans' },
  { id: 'neon', label: 'Neon', prompt: 'neon bright colors, fluorescent and electric' }
];

export interface DesignMovement {
  id: string;
  label: string;
  prompt: string;
}

export const designMovements: DesignMovement[] = [
  { id: 'bauhaus', label: 'Bauhaus', prompt: 'Bauhaus design influence, geometric and functional' },
  { id: 'memphis', label: 'Memphis', prompt: 'Memphis design style, bold patterns and colors' },
  { id: 'swiss', label: 'Swiss / International', prompt: 'Swiss International style, grid-based and clean' },
  { id: 'brutalist', label: 'Brutalist', prompt: 'brutalist design aesthetic, raw and bold' },
  { id: 'art-deco', label: 'Art Deco', prompt: 'Art Deco style, geometric elegance and glamour' },
  { id: 'scandinavian', label: 'Scandinavian', prompt: 'Scandinavian design, simple and functional' },
  { id: 'japanese', label: 'Japanese Minimal', prompt: 'Japanese minimalist aesthetic, zen and balanced' }
];

// ============================================
// Lighting Presets
// ============================================
export interface LightingPreset {
  id: string;
  label: string;
  prompt: string;
}

export interface LightingCategory {
  id: string;
  label: string;
  options: LightingPreset[];
}

export const lightingCategories: LightingCategory[] = [
  {
    id: 'natural',
    label: 'Natural Light',
    options: [
      { id: 'golden-hour', label: 'Golden Hour', prompt: 'golden hour lighting, warm sunset glow' },
      { id: 'overcast', label: 'Overcast', prompt: 'soft overcast diffused natural light' },
      { id: 'bright-daylight', label: 'Bright Daylight', prompt: 'bright natural daylight, clear and vibrant' },
      { id: 'blue-hour', label: 'Blue Hour', prompt: 'blue hour lighting, cool twilight tones' },
      { id: 'dappled', label: 'Dappled Light', prompt: 'dappled sunlight through trees, natural patterns' }
    ]
  },
  {
    id: 'studio',
    label: 'Studio Lighting',
    options: [
      { id: 'soft-box', label: 'Soft Box', prompt: 'soft box studio lighting, even and diffused' },
      { id: 'dramatic', label: 'Dramatic', prompt: 'dramatic studio lighting, strong shadows and contrast' },
      { id: 'high-key', label: 'High Key', prompt: 'high key lighting, bright and minimal shadows' },
      { id: 'low-key', label: 'Low Key', prompt: 'low key lighting, dark with selective highlights' },
      { id: 'rim-light', label: 'Rim Light', prompt: 'rim lighting, backlit edge definition' },
      { id: 'beauty', label: 'Beauty Light', prompt: 'beauty dish lighting, flattering and smooth' }
    ]
  },
  {
    id: 'ambient',
    label: 'Ambient Light',
    options: [
      { id: 'warm-ambient', label: 'Warm Ambient', prompt: 'warm ambient lighting, cozy interior glow' },
      { id: 'cool-ambient', label: 'Cool Ambient', prompt: 'cool ambient lighting, modern and crisp' },
      { id: 'neon', label: 'Neon Glow', prompt: 'neon lighting, colorful urban glow' },
      { id: 'candlelit', label: 'Candlelit', prompt: 'candlelight ambiance, soft flickering warmth' },
      { id: 'tungsten', label: 'Tungsten', prompt: 'tungsten indoor lighting, warm orange tones' },
      { id: 'fluorescent', label: 'Fluorescent', prompt: 'fluorescent lighting, cool office environment' }
    ]
  }
];

// ============================================
// Camera / Perspective Presets
// ============================================
export interface CameraAngle {
  id: string;
  label: string;
  prompt: string;
}

export const cameraAngles: CameraAngle[] = [
  { id: 'front', label: 'Front View', prompt: 'front view, straight-on perspective' },
  { id: 'three-quarter', label: '3/4 View', prompt: 'three-quarter angle view, dynamic perspective' },
  { id: 'side', label: 'Side View', prompt: 'side profile view, lateral perspective' },
  { id: 'top-down', label: 'Top Down', prompt: 'top-down bird\'s eye view, overhead perspective' },
  { id: 'eye-level', label: 'Eye Level', prompt: 'eye level perspective, natural viewpoint' },
  { id: 'low-angle', label: 'Low Angle', prompt: 'low angle view, looking up at subject' },
  { id: 'high-angle', label: 'High Angle', prompt: 'high angle view, looking down at subject' },
  { id: 'dutch', label: 'Dutch Angle', prompt: 'dutch angle, tilted dynamic perspective' }
];

export interface CameraDistance {
  id: string;
  label: string;
  prompt: string;
}

export const cameraDistances: CameraDistance[] = [
  { id: 'extreme-close', label: 'Extreme Close-up', prompt: 'extreme close-up, macro detail shot' },
  { id: 'close-up', label: 'Close-up', prompt: 'close-up shot, detailed product view' },
  { id: 'medium-close', label: 'Medium Close', prompt: 'medium close shot, product fills frame' },
  { id: 'medium', label: 'Medium', prompt: 'medium shot, product with some context' },
  { id: 'medium-wide', label: 'Medium Wide', prompt: 'medium wide shot, product in environment' },
  { id: 'wide', label: 'Wide Shot', prompt: 'wide shot, full scene with product' },
  { id: 'establishing', label: 'Establishing', prompt: 'establishing shot, full context visible' }
];

export interface DepthOfField {
  id: string;
  label: string;
  prompt: string;
}

export const depthOfFieldOptions: DepthOfField[] = [
  { id: 'shallow', label: 'Shallow (Bokeh)', prompt: 'shallow depth of field, blurred background, bokeh effect' },
  { id: 'medium', label: 'Medium', prompt: 'medium depth of field, some background blur' },
  { id: 'deep', label: 'Deep (Sharp)', prompt: 'deep depth of field, everything in focus, sharp throughout' }
];

// ============================================
// Quality / Aspect Ratio Presets
// ============================================
export interface AspectRatioOption {
  id: string;
  label: string;
  value: string;
  description: string;
}

export const aspectRatioOptions: AspectRatioOption[] = [
  { id: '1:1', label: '1:1 Square', value: '1:1', description: 'Perfect for social media' },
  { id: '4:3', label: '4:3 Standard', value: '4:3', description: 'Traditional photo ratio' },
  { id: '3:4', label: '3:4 Portrait', value: '3:4', description: 'Portrait orientation' },
  { id: '16:9', label: '16:9 Widescreen', value: '16:9', description: 'Video and presentation' },
  { id: '9:16', label: '9:16 Vertical', value: '9:16', description: 'Stories and reels' },
  { id: '2:3', label: '2:3 Photo', value: '2:3', description: 'Classic photo print' },
  { id: '3:2', label: '3:2 Landscape', value: '3:2', description: 'DSLR standard ratio' },
  { id: '4:5', label: '4:5 Social', value: '4:5', description: 'Social portrait' },
  { id: '5:4', label: '5:4 Landscape', value: '5:4', description: 'Social landscape' },
  { id: '21:9', label: '21:9 Ultrawide', value: '21:9', description: 'Cinematic banner' }
];

export interface QualityOption {
  id: string;
  label: string;
  value: 'basic' | 'high';
  description: string;
}

export const qualityOptions: QualityOption[] = [
  { id: 'basic', label: 'Basic (2K)', value: 'basic', description: 'Standard resolution, faster generation' },
  { id: 'high', label: 'High (4K)', value: 'high', description: 'Maximum resolution, production quality' }
];

// ============================================
// Plant Presets
// ============================================
export interface PlantPreset {
  id: string;
  label: string;
  prompt: string;
}

export const plantPresets: PlantPreset[] = [
  { id: 'monstera', label: 'Monstera', prompt: 'monstera plant, large tropical leaves' },
  { id: 'palm', label: 'Palm Tree', prompt: 'indoor palm tree, tropical vibe' },
  { id: 'fern', label: 'Fern', prompt: 'lush green fern plant' },
  { id: 'succulent', label: 'Succulent', prompt: 'small succulent plant in pot' },
  { id: 'fiddle', label: 'Fiddle Leaf', prompt: 'fiddle leaf fig tree, tall indoor plant' },
  { id: 'snake', label: 'Snake Plant', prompt: 'snake plant (sansevieria), modern vertical leaves' },
  { id: 'flowers', label: 'Fresh Flowers', prompt: 'vase of fresh flowers, colorful and vibrant' },
  { id: 'dried', label: 'Dried Flowers', prompt: 'arrangement of dried flowers, pampas grass, boho style' },
  { id: 'bonsai', label: 'Bonsai', prompt: 'bonsai tree, artistic and zen' },
  { id: 'cactus', label: 'Cactus', prompt: 'cactus plant, desert vibe' }
];

// ============================================
// Texture Presets
// ============================================
export interface TexturePreset {
  id: string;
  label: string;
  prompt: string;
}

export const texturePresets: TexturePreset[] = [
  { id: 'leather', label: 'Leather', prompt: 'leather texture, premium and detailed' },
  { id: 'wood', label: 'Wood', prompt: 'natural wood texture, grain details' },
  { id: 'marble', label: 'Marble', prompt: 'marble material, elegant veining, smooth surface' },
  { id: 'concrete', label: 'Concrete', prompt: 'concrete texture, industrial and raw gray' },
  { id: 'fabric', label: 'Fabric/Textile', prompt: 'fabric texture, woven textile detail' },
  { id: 'metal', label: 'Metal', prompt: 'metallic texture, brushed or polished finish' },
  { id: 'glass', label: 'Glass', prompt: 'glass material, transparent and reflective' },
  { id: 'plastic', label: 'Plastic', prompt: 'plastic material, smooth synthetic surface' },
  { id: 'stone', label: 'Stone', prompt: 'natural stone texture, rough and organic' },
  { id: 'ceramic', label: 'Ceramic', prompt: 'ceramic material, smooth glazed finish' }
];
