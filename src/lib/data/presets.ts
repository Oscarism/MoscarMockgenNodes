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
      { id: 'textured', label: 'Textured Background', prompt: 'subtle textured studio backdrop' },
      { id: 'cream-bg', label: 'Cream Background', prompt: 'warm cream studio background, off-white seamless backdrop' },
      { id: 'pastel-bg', label: 'Pastel Background', prompt: 'soft pastel colored studio background, gentle hue' },
      { id: 'paper-sweep', label: 'Paper Sweep', prompt: 'curved paper sweep backdrop, seamless studio roll' },
      { id: 'cyclorama', label: 'Cyclorama', prompt: 'cyclorama studio, curved wall to floor, infinite backdrop' },
      { id: 'spotlight', label: 'Spotlight Pool', prompt: 'dark studio with spotlight pool, dramatic isolation' },
      { id: 'two-tone', label: 'Two-Tone Split', prompt: 'two-tone split background, contrasting color halves' }
    ]
  },
  {
    id: 'surfaces',
    label: 'Surfaces & Tabletops',
    options: [
      { id: 'marble-surface', label: 'Marble Surface', prompt: 'marble tabletop surface, elegant veined stone, flat lay ready' },
      { id: 'wood-surface', label: 'Wood Surface', prompt: 'natural wood table surface, warm grain texture, rustic tabletop' },
      { id: 'concrete-surface', label: 'Concrete Surface', prompt: 'concrete surface, raw industrial tabletop, minimal gray' },
      { id: 'linen-surface', label: 'Linen Fabric', prompt: 'linen fabric surface, soft textile backdrop, natural wrinkles' },
      { id: 'terrazzo-surface', label: 'Terrazzo', prompt: 'terrazzo surface, speckled composite, modern flat lay backdrop' },
      { id: 'tile-surface', label: 'Tile Surface', prompt: 'ceramic tile surface, geometric pattern, clean grout lines' },
      { id: 'paper-surface', label: 'Paper Texture', prompt: 'textured paper surface, craft backdrop, matte finish' },
      { id: 'velvet-surface', label: 'Velvet Fabric', prompt: 'velvet fabric surface, rich plush texture, luxury backdrop' },
      { id: 'sand-surface', label: 'Sand Surface', prompt: 'fine sand surface, beach texture, natural granular backdrop' },
      { id: 'water-surface', label: 'Water Surface', prompt: 'shallow water surface, ripples and reflections, product in water' },
      { id: 'mirror-surface', label: 'Mirror Surface', prompt: 'reflective mirror surface, product reflection, glossy backdrop' },
      { id: 'acrylic-surface', label: 'Acrylic/Plexi', prompt: 'clear acrylic surface, glossy plexi, modern reflective platform' }
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
      { id: 'gym', label: 'Gym/Fitness', prompt: 'gym environment, fitness studio, workout space' },
      { id: 'bedroom', label: 'Bedroom', prompt: 'bedroom interior, cozy bed setting, intimate space' },
      { id: 'bathroom', label: 'Bathroom', prompt: 'clean bathroom setting, spa-like interior, fresh tiles' },
      { id: 'kitchen', label: 'Kitchen', prompt: 'modern kitchen interior, countertop setting, culinary space' },
      { id: 'living-room', label: 'Living Room', prompt: 'living room setting, sofa and decor, comfortable lounge' },
      { id: 'balcony', label: 'Balcony/Terrace', prompt: 'balcony terrace setting, outdoor urban living, city views' },
      { id: 'pool', label: 'Poolside', prompt: 'poolside setting, water and loungers, summer leisure' },
      { id: 'rooftop', label: 'Rooftop', prompt: 'rooftop setting, urban skyline backdrop, elevated outdoor' },
      { id: 'commute', label: 'Commute/Transit', prompt: 'commute setting, subway or transit, on-the-go lifestyle' }
    ]
  },
  {
    id: 'action',
    label: 'Action & Usage',
    options: [
      { id: 'wearing', label: 'Person Wearing', prompt: 'person wearing the product, natural pose' },
      { id: 'holding', label: 'Hand Holding', prompt: 'hand holding the product, realistic grip' },
      { id: 'flat-lay', label: 'Flat Lay', prompt: 'flat lay composition, top-down product arrangement' },
      { id: 'hanging', label: 'Hanging/Displayed', prompt: 'product hanging or displayed on rack' },
      { id: 'in-use', label: 'In Use', prompt: 'product being actively used, action shot' },
      { id: 'unboxing', label: 'Unboxing', prompt: 'product unboxing scene, packaging visible' },
      { id: 'applying', label: 'Applying', prompt: 'person applying product, skincare or makeup application' },
      { id: 'pouring', label: 'Pouring', prompt: 'product being poured, liquid in motion, dynamic splash' },
      { id: 'stacked', label: 'Stacked/Grouped', prompt: 'products stacked or grouped together, collection display' },
      { id: 'floating', label: 'Floating', prompt: 'product floating in air, levitation effect, zero gravity' },
      { id: 'shelf', label: 'On Shelf', prompt: 'product displayed on shelf, retail presentation' },
      { id: 'bag-spill', label: 'Bag Spill', prompt: 'contents spilling from bag, whats in my bag flat lay' }
    ]
  },
  {
    id: 'retail',
    label: 'Retail & Commercial',
    options: [
      { id: 'store-window', label: 'Store Window', prompt: 'store window display, retail showcase, visual merchandising' },
      { id: 'boutique', label: 'Boutique', prompt: 'boutique interior, curated retail space, upscale shopping' },
      { id: 'department-store', label: 'Department Store', prompt: 'department store setting, luxury retail counter' },
      { id: 'pop-up', label: 'Pop-Up Shop', prompt: 'pop-up shop setting, temporary retail, trendy installation' },
      { id: 'showroom', label: 'Showroom', prompt: 'product showroom, professional display space, exhibition' },
      { id: 'trade-show', label: 'Trade Show', prompt: 'trade show booth, exhibition stand, professional display' },
      { id: 'salon', label: 'Salon/Spa', prompt: 'salon spa interior, beauty treatment space, professional service' },
      { id: 'pharmacy', label: 'Pharmacy', prompt: 'pharmacy drugstore setting, health retail environment' },
      { id: 'grocery', label: 'Grocery/Market', prompt: 'grocery market setting, fresh produce, food retail' },
      { id: 'restaurant', label: 'Restaurant', prompt: 'restaurant table setting, dining environment, hospitality' }
    ]
  },
  {
    id: 'seasonal',
    label: 'Seasonal & Holiday',
    options: [
      { id: 'spring', label: 'Spring', prompt: 'spring setting, fresh blooms, pastel colors, new growth' },
      { id: 'summer', label: 'Summer', prompt: 'summer setting, bright sunlight, warm weather, outdoor vibes' },
      { id: 'autumn', label: 'Autumn/Fall', prompt: 'autumn fall setting, warm leaves, cozy harvest atmosphere' },
      { id: 'winter', label: 'Winter', prompt: 'winter setting, snow and frost, cold weather, cozy indoor' },
      { id: 'christmas', label: 'Christmas', prompt: 'Christmas holiday setting, festive decorations, red and green, gifts' },
      { id: 'valentines', label: 'Valentines', prompt: 'Valentines Day setting, romantic pink and red, hearts and roses' },
      { id: 'halloween', label: 'Halloween', prompt: 'Halloween setting, spooky autumn, orange and black, pumpkins' },
      { id: 'new-year', label: 'New Year', prompt: 'New Year celebration setting, gold and silver, champagne, confetti' },
      { id: 'easter', label: 'Easter', prompt: 'Easter spring setting, pastel eggs, fresh flowers, soft colors' },
      { id: 'back-to-school', label: 'Back to School', prompt: 'back to school setting, notebooks and supplies, academic' }
    ]
  },
  {
    id: 'location',
    label: 'Locations',
    options: [
      { id: 'nyc', label: 'New York City', prompt: 'New York City backdrop, urban NYC environment' },
      { id: 'london', label: 'London', prompt: 'London setting, British urban environment' },
      { id: 'paris', label: 'Paris', prompt: 'Parisian setting, French urban environment' },
      { id: 'tokyo', label: 'Tokyo', prompt: 'Tokyo setting, neon urban environment' },
      { id: 'forest', label: 'Forest', prompt: 'forest setting, trees and natural greenery' },
      { id: 'mountain', label: 'Mountain', prompt: 'mountain landscape backdrop, elevated terrain' },
      { id: 'desert', label: 'Desert', prompt: 'desert landscape, sandy terrain, warm tones' },
      { id: 'tropical', label: 'Tropical', prompt: 'tropical setting, palm trees, lush paradise, exotic location' },
      { id: 'mediterranean', label: 'Mediterranean', prompt: 'Mediterranean setting, coastal village, terracotta and blue' },
      { id: 'countryside', label: 'Countryside', prompt: 'countryside setting, rolling hills, rural pastoral landscape' },
      { id: 'lake', label: 'Lakeside', prompt: 'lakeside setting, calm water, natural reflection, serene' },
      { id: 'vineyard', label: 'Vineyard', prompt: 'vineyard setting, wine country, grape vines, rustic elegance' },
      { id: 'ski-resort', label: 'Ski Resort', prompt: 'ski resort setting, snowy slopes, alpine winter' },
      { id: 'warehouse', label: 'Warehouse', prompt: 'warehouse setting, industrial space, raw brick and beams' }
    ]
  },
  {
    id: 'abstract',
    label: 'Abstract & Creative',
    options: [
      { id: 'geometric', label: 'Geometric Shapes', prompt: 'abstract geometric shapes backdrop, blocks and forms, modern display' },
      { id: 'podium', label: 'Podium/Pedestal', prompt: 'product on podium pedestal, elevated display platform, showcase' },
      { id: 'arches', label: 'Arches', prompt: 'architectural arches backdrop, curved forms, gallery aesthetic' },
      { id: 'curtain', label: 'Draped Fabric', prompt: 'draped fabric curtain backdrop, flowing textile, soft folds' },
      { id: 'cloud', label: 'Clouds', prompt: 'fluffy clouds backdrop, dreamy sky setting, ethereal floating' },
      { id: 'water-splash', label: 'Water Splash', prompt: 'dynamic water splash, liquid motion, fresh and clean' },
      { id: 'smoke', label: 'Smoke/Mist', prompt: 'atmospheric smoke or mist, mysterious haze, dramatic fog' },
      { id: 'neon-glow', label: 'Neon Glow', prompt: 'neon light backdrop, glowing tubes, colorful urban night' },
      { id: 'holographic', label: 'Holographic', prompt: 'holographic iridescent backdrop, rainbow reflections, futuristic' },
      { id: 'floral-arrangement', label: 'Floral Surround', prompt: 'surrounded by flowers, lush floral arrangement, botanical frame' }
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
  { id: 'rustic', label: 'Rustic', prompt: 'rustic aesthetic, raw and authentic, handmade feel' },

  // New additions
  { id: 'editorial', label: 'Editorial', prompt: 'editorial aesthetic, high fashion magazine style, artistic and curated' },
  { id: 'bohemian', label: 'Bohemian', prompt: 'bohemian aesthetic, free-spirited, eclectic mix, wanderlust vibes' },
  { id: 'industrial', label: 'Industrial', prompt: 'industrial aesthetic, raw metal and concrete, factory chic, exposed elements' },
  { id: 'cozy', label: 'Cozy / Hygge', prompt: 'cozy hygge aesthetic, warm and inviting, soft textures, comfortable atmosphere' },
  { id: 'bold', label: 'Bold / Graphic', prompt: 'bold graphic aesthetic, strong visual impact, high contrast, attention-grabbing' },
  { id: 'ethereal', label: 'Ethereal / Dreamy', prompt: 'ethereal dreamy aesthetic, soft and airy, otherworldly glow, romantic haze' },
  { id: 'moody', label: 'Dark / Moody', prompt: 'dark moody aesthetic, dramatic shadows, atmospheric tension, cinematic depth' },
  { id: 'coastal', label: 'Coastal', prompt: 'coastal aesthetic, beach vibes, ocean tones, relaxed seaside atmosphere' },
  { id: 'y2k', label: 'Y2K', prompt: 'Y2K aesthetic, early 2000s style, chrome and gloss, cyber futurism, pink and silver' },
  { id: 'clinical', label: 'Clinical / Clean', prompt: 'clinical clean aesthetic, sterile precision, medical white, sharp and pristine' }
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
  { id: 'neon', label: 'Neon', prompt: 'neon bright colors, fluorescent and electric' },

  // Premium & luxury
  { id: 'black-gold', label: 'Black & Gold', prompt: 'black and gold color palette, luxury premium aesthetic, elegant contrast' },
  { id: 'black-white', label: 'Black & White', prompt: 'black and white only, high contrast, bold graphic' },
  { id: 'cream-luxury', label: 'Cream & Ivory', prompt: 'cream and ivory tones, soft white, understated luxury' },
  { id: 'champagne', label: 'Champagne', prompt: 'champagne and rose gold tones, warm metallic elegance, sophisticated shimmer' },

  // Bold advertising
  { id: 'primary', label: 'Primary Bold', prompt: 'primary colors, bold red blue yellow, graphic and punchy' },
  { id: 'complementary', label: 'Complementary Pop', prompt: 'complementary color contrast, opposite colors, dynamic tension' },
  { id: 'duotone', label: 'Duotone', prompt: 'duotone color treatment, two-color palette, modern graphic style' },
  { id: 'gradient', label: 'Gradient Blend', prompt: 'smooth color gradient, blended tones, modern fade effect' },
  { id: 'pop-bright', label: 'Pop Bright', prompt: 'bright pop colors, candy tones, playful and energetic' },

  // Trendy & modern
  { id: 'gen-z', label: 'Gen-Z Brights', prompt: 'Gen-Z color palette, lime green, hot pink, electric blue, bold clashing' },
  { id: 'y2k', label: 'Y2K', prompt: 'Y2K color palette, chrome silver, baby pink, cyber blue, futuristic 2000s' },
  { id: 'vaporwave', label: 'Vaporwave', prompt: 'vaporwave colors, pink and cyan gradient, purple haze, retro digital' },
  { id: 'cyberpunk', label: 'Cyberpunk', prompt: 'cyberpunk palette, neon pink, electric blue, dark contrast, futuristic night' },

  // Natural & organic
  { id: 'botanical', label: 'Botanical', prompt: 'botanical greens, leafy natural tones, fresh organic palette' },
  { id: 'ocean', label: 'Ocean', prompt: 'ocean color palette, deep blues, teals, seafoam, coastal tones' },
  { id: 'sunset', label: 'Sunset', prompt: 'sunset colors, warm orange to pink gradient, golden hour tones' },
  { id: 'desert', label: 'Desert', prompt: 'desert palette, terracotta, sand, burnt orange, warm arid tones' },
  { id: 'forest', label: 'Forest', prompt: 'forest palette, deep greens, moss, bark brown, woodland natural' },

  // Seasonal
  { id: 'spring', label: 'Spring Fresh', prompt: 'spring colors, fresh greens, soft pinks, light airy pastels' },
  { id: 'summer', label: 'Summer Vibrant', prompt: 'summer colors, bright coral, turquoise, sunny yellow, tropical energy' },
  { id: 'autumn', label: 'Autumn Harvest', prompt: 'autumn colors, burnt orange, deep red, mustard, warm fall foliage' },
  { id: 'winter', label: 'Winter Cool', prompt: 'winter colors, icy blues, silver, deep navy, crisp cold tones' },
  { id: 'holiday', label: 'Holiday Festive', prompt: 'holiday colors, red and green, gold accents, festive celebration' },

  // Mood-based
  { id: 'romantic', label: 'Romantic', prompt: 'romantic palette, blush pink, dusty rose, soft mauve, intimate warmth' },
  { id: 'moody-dark', label: 'Moody Dark', prompt: 'moody dark palette, deep charcoal, burgundy, forest, dramatic shadows' },
  { id: 'fresh-clean', label: 'Fresh & Clean', prompt: 'fresh clean colors, white, light blue, mint, crisp and hygienic' },
  { id: 'retro', label: 'Retro Vintage', prompt: 'retro color palette, mustard yellow, burnt orange, avocado green, 70s vintage' },
  { id: 'muted', label: 'Muted Tones', prompt: 'muted desaturated colors, dusty soft tones, understated and calm' }
];

export interface DesignMovement {
  id: string;
  label: string;
  prompt: string;
}

export const designMovements: DesignMovement[] = [
  { id: 'bauhaus', label: 'Bauhaus', prompt: 'Bauhaus design, geometric forms, primary colors, functional modernism, clean lines' },
  { id: 'memphis', label: 'Memphis', prompt: 'Memphis design, bold clashing patterns, squiggles and terrazzo, playful 1980s postmodern' },
  { id: 'international', label: 'International Style', prompt: 'International style design, strict grid systems, sans-serif typography, clean rational layout' },
  { id: 'brutalist', label: 'Brutalist', prompt: 'brutalist design, raw concrete aesthetic, bold monolithic forms, unpolished and imposing' },
  { id: 'art-deco', label: 'Art Deco', prompt: 'Art Deco style, geometric elegance, gold accents, symmetrical patterns, 1920s glamour' },
  { id: 'nordic', label: 'Nordic Minimal', prompt: 'Nordic minimal design, light wood tones, soft neutrals, cozy functional simplicity, hygge warmth' },
  { id: 'zen', label: 'Zen Minimal', prompt: 'Zen minimalist aesthetic, negative space, asymmetric balance, natural materials, tranquil simplicity' },
  { id: 'art-nouveau', label: 'Art Nouveau', prompt: 'Art Nouveau style, organic flowing curves, floral motifs, ornate decorative lines, nature-inspired elegance' },
  { id: 'mid-century', label: 'Mid-Century Modern', prompt: 'Mid-Century Modern design, atomic age aesthetic, organic curves, tapered legs, retro 1950s-60s optimism' },
  { id: 'de-stijl', label: 'De Stijl', prompt: 'De Stijl design, primary colors with black and white, rectangular forms, Mondrian-inspired grid abstraction' },
  { id: 'victorian', label: 'Victorian', prompt: 'Victorian design aesthetic, ornate decorative details, rich dark colors, elaborate patterns, gilded opulence' },
  { id: 'pop-art', label: 'Pop Art', prompt: 'Pop Art style, bold primary colors, Ben-Day dots, comic book aesthetic, mass media inspired' },
  { id: 'wabi-sabi', label: 'Wabi-Sabi', prompt: 'Wabi-Sabi aesthetic, embracing imperfection, weathered natural textures, muted earth tones, humble beauty' },
  { id: 'futurism', label: 'Futurism', prompt: 'Futurist design, dynamic motion lines, speed and energy, angular sharp forms, technological optimism' },

  // Simple / Minimal styles
  { id: 'minimalist', label: 'Minimalist', prompt: 'minimalist design, essential elements only, maximum whitespace, stripped-back simplicity' },
  { id: 'clean-modern', label: 'Clean Modern', prompt: 'clean modern aesthetic, crisp edges, neutral palette, uncluttered and polished' },
  { id: 'soft-minimal', label: 'Soft Minimal', prompt: 'soft minimal style, rounded forms, muted pastels, gentle and airy' },
  { id: 'monochrome', label: 'Monochrome', prompt: 'monochrome design, single color palette, tonal variations, cohesive and focused' },
  { id: 'organic-modern', label: 'Organic Modern', prompt: 'organic modern design, soft curves, natural materials, warm neutral tones' },
  { id: 'utilitarian', label: 'Utilitarian', prompt: 'utilitarian design, pure function-driven, no decoration, honest materials' },
  { id: 'quiet-luxury', label: 'Quiet Luxury', prompt: 'quiet luxury aesthetic, understated elegance, premium materials, subtle refinement' },
  { id: 'muji', label: 'No-Brand Minimal', prompt: 'no-brand minimal style, anonymous design, natural tones, humble functional objects' }
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
      { id: 'dappled', label: 'Dappled Light', prompt: 'dappled sunlight through trees, natural patterns' },
      { id: 'harsh-sun', label: 'Harsh Sunlight', prompt: 'harsh direct sunlight, strong shadows, high contrast midday sun' },
      { id: 'window-light', label: 'Window Light', prompt: 'natural window light, soft directional, indoor natural lighting' },
      { id: 'cloudy-diffused', label: 'Cloudy Diffused', prompt: 'cloudy sky diffused light, flat even illumination, no shadows' },
      { id: 'sunrise', label: 'Sunrise', prompt: 'early sunrise lighting, soft pink and orange hues, morning glow' },
      { id: 'moonlight', label: 'Moonlight', prompt: 'moonlight illumination, pale blue night lighting, subtle and dim' }
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
      { id: 'beauty', label: 'Beauty Light', prompt: 'beauty dish lighting, flattering and smooth' },
      { id: 'butterfly', label: 'Butterfly Light', prompt: 'butterfly lighting, overhead frontal, glamour portrait style' },
      { id: 'split', label: 'Split Light', prompt: 'split lighting, half face illuminated, half in shadow' },
      { id: 'rembrandt', label: 'Rembrandt', prompt: 'Rembrandt lighting, triangle cheek highlight, classic portrait' },
      { id: 'loop', label: 'Loop Light', prompt: 'loop lighting, slight nose shadow, natural portrait lighting' },
      { id: 'clamshell', label: 'Clamshell', prompt: 'clamshell lighting, soft beauty setup, fill from below' },
      { id: 'strip-light', label: 'Strip Light', prompt: 'strip light, narrow highlight streaks, sleek product lighting' }
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
      { id: 'fluorescent', label: 'Fluorescent', prompt: 'fluorescent lighting, cool office environment' },
      { id: 'fairy-lights', label: 'Fairy Lights', prompt: 'fairy string lights, soft twinkling bokeh, whimsical glow' },
      { id: 'firelight', label: 'Firelight', prompt: 'fireplace lighting, warm dancing orange glow, cozy flickering' },
      { id: 'led-strip', label: 'LED Strip', prompt: 'LED strip accent lighting, modern colored edge glow' },
      { id: 'lantern', label: 'Lantern Light', prompt: 'lantern lighting, warm contained glow, rustic ambiance' }
    ]
  },
  {
    id: 'dark-moody',
    label: 'Dark & Moody',
    options: [
      { id: 'low-ambient', label: 'Low Ambient', prompt: 'low ambient lighting, dim atmospheric, barely lit environment' },
      { id: 'chiaroscuro', label: 'Chiaroscuro', prompt: 'chiaroscuro lighting, extreme dark and light contrast, Renaissance drama' },
      { id: 'noir', label: 'Film Noir', prompt: 'film noir lighting, high contrast black and white style, dramatic shadows' },
      { id: 'silhouette', label: 'Silhouette', prompt: 'silhouette lighting, backlit dark figure, subject in shadow' },
      { id: 'single-source', label: 'Single Source', prompt: 'single light source, deep shadows, isolated illumination' },
      { id: 'underlit', label: 'Underlit', prompt: 'underlit from below, eerie upward shadows, dramatic horror style' },
      { id: 'spotlight-dark', label: 'Spotlight in Dark', prompt: 'spotlight in darkness, isolated pool of light, black surroundings' },
      { id: 'foggy-dark', label: 'Dark & Foggy', prompt: 'dark foggy atmosphere, diffused light through haze, mysterious mood' },
      { id: 'twilight-dark', label: 'Deep Twilight', prompt: 'deep twilight darkness, minimal fading light, dusk shadows' },
      { id: 'shadows', label: 'Heavy Shadows', prompt: 'heavy shadow lighting, obscured details, dark moody atmosphere' }
    ]
  },
  {
    id: 'creative',
    label: 'Creative & Stylized',
    options: [
      { id: 'colored-gel', label: 'Colored Gels', prompt: 'colored gel lighting, vibrant tinted light, creative color cast' },
      { id: 'cyberpunk', label: 'Cyberpunk', prompt: 'cyberpunk lighting, pink and blue neon, futuristic night aesthetic' },
      { id: 'vaporwave', label: 'Vaporwave', prompt: 'vaporwave lighting, purple and teal gradients, retro synthwave glow' },
      { id: 'golden-backlit', label: 'Golden Backlit', prompt: 'golden backlight, sun flare behind subject, glowing edges' },
      { id: 'volumetric', label: 'Volumetric', prompt: 'volumetric lighting, god rays, visible light beams through atmosphere' },
      { id: 'ring-light', label: 'Ring Light', prompt: 'ring light, even frontal glow, catchlight circles in eyes' },
      { id: 'bi-color', label: 'Bi-Color Split', prompt: 'bi-color split lighting, two contrasting colors from opposite sides' },
      { id: 'blacklight', label: 'Blacklight UV', prompt: 'blacklight UV lighting, glowing fluorescent, ultraviolet reactive' },
      { id: 'strobe', label: 'Strobe Effect', prompt: 'strobe light effect, frozen motion, sharp flash illumination' },
      { id: 'projection', label: 'Projected Light', prompt: 'projected pattern lighting, shapes and textures cast on subject' }
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
  { id: 'dutch', label: 'Dutch Angle', prompt: 'dutch angle, tilted dynamic perspective' },

  // Creative additions
  { id: 'worms-eye', label: "Worm's Eye", prompt: "worm's eye view, extreme low angle looking straight up, dramatic" },
  { id: 'over-shoulder', label: 'Over Shoulder', prompt: 'over the shoulder perspective, foreground framing, depth layers' },
  { id: 'pov', label: 'POV / First Person', prompt: 'point of view shot, first person perspective, subjective angle' },
  { id: 'isometric', label: 'Isometric', prompt: 'isometric angle, 30 degree fixed perspective, technical illustration style' },
  { id: 'hero-angle', label: 'Hero Angle', prompt: 'hero angle, low dramatic upward view, powerful and imposing' },
  { id: 'through-frame', label: 'Through Frame', prompt: 'shot through foreground element, natural frame within frame, peering through' },
  { id: 'rear', label: 'Rear View', prompt: 'rear view, behind the subject, back perspective' },
  { id: 'overhead-45', label: 'Overhead 45°', prompt: '45 degree overhead angle, between eye level and top-down, flatlay friendly' }
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
  { id: 'establishing', label: 'Establishing', prompt: 'establishing shot, full context visible' },
  { id: 'detail', label: 'Detail Crop', prompt: 'tight detail crop, abstract partial view, texture focus' },
  { id: 'tabletop', label: 'Tabletop', prompt: 'tabletop distance, overhead flat lay perspective, full arrangement visible' },
  { id: 'hero', label: 'Hero Shot', prompt: 'hero shot distance, product prominent, dramatic framing' },
  { id: 'environmental', label: 'Environmental', prompt: 'environmental shot, product small in larger lifestyle scene' },

  // People-specific framing
  { id: 'face-closeup', label: 'Face Close-up', prompt: 'face close-up, head shot, facial features prominent' },
  { id: 'headshot', label: 'Headshot', prompt: 'headshot framing, head and shoulders, portrait crop' },
  { id: 'bust', label: 'Bust Shot', prompt: 'bust shot, chest up framing, upper body portrait' },
  { id: 'three-quarter', label: '3/4 Body', prompt: 'three-quarter body shot, waist to head framing, mid-length portrait' },
  { id: 'full-body', label: 'Full Body', prompt: 'full body shot, head to toe visible, complete figure' },
  { id: 'cowboy', label: 'Cowboy Shot', prompt: 'cowboy shot, mid-thigh up framing, American shot' }
];

export interface DepthOfField {
  id: string;
  label: string;
  prompt: string;
}

export const depthOfFieldOptions: DepthOfField[] = [
  { id: 'shallow', label: 'Shallow (Bokeh)', prompt: 'shallow depth of field, blurred background, bokeh effect' },
  { id: 'medium', label: 'Medium', prompt: 'medium depth of field, some background blur' },
  { id: 'deep', label: 'Deep (Sharp)', prompt: 'deep depth of field, everything in focus, sharp throughout' },

  // New additions
  { id: 'extreme_bokeh', label: 'Extreme Bokeh', prompt: 'extremely shallow depth of field, heavy creamy bokeh, dreamy blur' },
  { id: 'tilt_shift', label: 'Tilt-Shift', prompt: 'tilt-shift effect, selective focus plane, miniature look' },
  { id: 'soft_focus', label: 'Soft Focus', prompt: 'soft focus effect, gentle diffused blur, ethereal glow' },
  { id: 'macro', label: 'Macro', prompt: 'macro depth of field, extreme close-up focus, tiny detail sharp' },
  { id: 'foreground_blur', label: 'Foreground Blur', prompt: 'blurred foreground elements, sharp background, layered depth' },
  { id: 'cinematic', label: 'Cinematic', prompt: 'cinematic depth of field, anamorphic bokeh, film-like focus falloff' }
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
  { id: 'cactus', label: 'Cactus', prompt: 'cactus plant, desert vibe' },

  // New additions
  { id: 'eucalyptus', label: 'Eucalyptus', prompt: 'eucalyptus branches, silver-green leaves, elegant sprigs' },
  { id: 'olive', label: 'Olive Branch', prompt: 'olive branch with leaves, Mediterranean greenery' },
  { id: 'lavender', label: 'Lavender', prompt: 'lavender sprigs, purple flowers, calming botanical' },
  { id: 'pothos', label: 'Pothos', prompt: 'pothos vine, trailing heart-shaped leaves' },
  { id: 'ivy', label: 'Ivy', prompt: 'ivy vine, cascading green leaves, classic trailing plant' },
  { id: 'bamboo', label: 'Bamboo', prompt: 'bamboo stalks, minimal zen aesthetic, green shoots' },
  { id: 'herbs', label: 'Herbs', prompt: 'fresh herb sprigs, rosemary and mint, aromatic greenery' },
  { id: 'babysbreath', label: "Baby's Breath", prompt: "baby's breath flowers, delicate white blooms, airy accent" },
  { id: 'peony', label: 'Peony', prompt: 'peony blooms, lush pink or white petals, romantic floral' },
  { id: 'leaf_scatter', label: 'Scattered Leaves', prompt: 'scattered botanical leaves, flat lay greenery arrangement' }
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
  { id: 'ceramic', label: 'Ceramic', prompt: 'ceramic material, smooth glazed finish' },

  // New additions
  { id: 'velvet', label: 'Velvet', prompt: 'velvet texture, soft plush pile, rich light-absorbing surface' },
  { id: 'rust', label: 'Rust', prompt: 'rusted metal texture, oxidized iron, corroded orange-brown patina' },
  { id: 'gold', label: 'Gold', prompt: 'gold texture, luxurious yellow metal, reflective precious surface' },
  { id: 'denim', label: 'Denim', prompt: 'denim texture, blue twill weave, cotton jean fabric' },
  { id: 'carbon_fiber', label: 'Carbon Fiber', prompt: 'carbon fiber texture, woven black composite weave pattern' },
  { id: 'fur', label: 'Fur', prompt: 'fur texture, soft animal hair strands, fluffy and warm' },
  { id: 'ice', label: 'Ice', prompt: 'ice texture, frozen crystalline surface, cold translucent frost' },
  { id: 'sand', label: 'Sand', prompt: 'sand texture, fine granular surface, warm beach particles' },
  { id: 'rubber', label: 'Rubber', prompt: 'rubber texture, matte elastic surface, flexible grip material' },
  { id: 'holographic', label: 'Holographic', prompt: 'holographic texture, rainbow iridescent film, shifting prismatic colors' }
];
