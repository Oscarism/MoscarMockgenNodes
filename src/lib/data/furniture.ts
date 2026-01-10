// ============================================
// Furniture / Objects Presets
// ============================================

export interface FurniturePreset {
	id: string;
	label: string;
	prompt: string;
}

export interface FurnitureCategory {
	id: string;
	label: string;
	items: FurniturePreset[];
}

// Seating
export const seatingTypes: FurniturePreset[] = [
	{ id: 'sofa', label: 'Sofa', prompt: 'sofa, couch, upholstered seating' },
	{ id: 'armchair', label: 'Armchair', prompt: 'armchair, accent chair, single seat' },
	{ id: 'dining-chair', label: 'Dining Chair', prompt: 'dining chair, table chair, wooden seat' },
	{ id: 'office-chair', label: 'Office Chair', prompt: 'office chair, desk chair, ergonomic seating' },
	{ id: 'bar-stool', label: 'Bar Stool', prompt: 'bar stool, counter height, tall seat' },
	{ id: 'bench', label: 'Bench', prompt: 'bench, long seat, shared seating' },
	{ id: 'ottoman', label: 'Ottoman', prompt: 'ottoman, footstool, padded rest' },
	{ id: 'lounge-chair', label: 'Lounge Chair', prompt: 'lounge chair, recliner, relaxation seating' },
	{ id: 'bean-bag', label: 'Bean Bag', prompt: 'bean bag chair, casual seating, soft form' },
	{ id: 'rocking-chair', label: 'Rocking Chair', prompt: 'rocking chair, rocker, motion seating' }
];

// Tables
export const tableTypes: FurniturePreset[] = [
	{ id: 'dining-table', label: 'Dining Table', prompt: 'dining table, eating surface, meal table' },
	{ id: 'coffee-table', label: 'Coffee Table', prompt: 'coffee table, living room table, low table' },
	{ id: 'side-table', label: 'Side Table', prompt: 'side table, end table, accent table' },
	{ id: 'desk', label: 'Desk', prompt: 'desk, work surface, writing table' },
	{ id: 'console-table', label: 'Console Table', prompt: 'console table, entry table, narrow table' },
	{ id: 'nightstand', label: 'Nightstand', prompt: 'nightstand, bedside table, night table' },
	{ id: 'bar-table', label: 'Bar Table', prompt: 'bar table, pub table, high top' },
	{ id: 'vanity', label: 'Vanity', prompt: 'vanity table, makeup table, dressing table' }
];

// Storage
export const storageTypes: FurniturePreset[] = [
	{ id: 'bookshelf', label: 'Bookshelf', prompt: 'bookshelf, book case, shelving unit' },
	{ id: 'cabinet', label: 'Cabinet', prompt: 'cabinet, storage cabinet, enclosed shelving' },
	{ id: 'dresser', label: 'Dresser', prompt: 'dresser, chest of drawers, bedroom storage' },
	{ id: 'wardrobe', label: 'Wardrobe', prompt: 'wardrobe, armoire, clothing storage' },
	{ id: 'sideboard', label: 'Sideboard', prompt: 'sideboard, buffet, dining storage' },
	{ id: 'media-console', label: 'Media Console', prompt: 'media console, TV stand, entertainment center' },
	{ id: 'floating-shelf', label: 'Floating Shelf', prompt: 'floating shelf, wall shelf, mounted storage' },
	{ id: 'basket', label: 'Storage Basket', prompt: 'storage basket, woven basket, decorative storage' }
];

// Lighting Objects
export const lightingObjects: FurniturePreset[] = [
	{ id: 'table-lamp', label: 'Table Lamp', prompt: 'table lamp, desk lamp, portable light' },
	{ id: 'floor-lamp', label: 'Floor Lamp', prompt: 'floor lamp, standing lamp, tall light' },
	{ id: 'pendant', label: 'Pendant Light', prompt: 'pendant light, hanging lamp, suspended fixture' },
	{ id: 'chandelier', label: 'Chandelier', prompt: 'chandelier, ornate ceiling light, decorative fixture' },
	{ id: 'wall-sconce', label: 'Wall Sconce', prompt: 'wall sconce, mounted light, wall fixture' },
	{ id: 'candle', label: 'Candle', prompt: 'candle, candlestick, wax light, ambient glow' },
	{ id: 'lantern', label: 'Lantern', prompt: 'lantern, portable light, enclosed flame' },
	{ id: 'string-lights', label: 'String Lights', prompt: 'string lights, fairy lights, decorative bulbs' }
];

// Decor Objects
export const decorObjects: FurniturePreset[] = [
	{ id: 'vase', label: 'Vase', prompt: 'vase, flower vessel, decorative container' },
	{ id: 'mirror', label: 'Mirror', prompt: 'mirror, reflective glass, wall mirror' },
	{ id: 'clock', label: 'Clock', prompt: 'clock, timepiece, wall clock, decorative time' },
	{ id: 'picture-frame', label: 'Picture Frame', prompt: 'picture frame, photo frame, wall art frame' },
	{ id: 'sculpture', label: 'Sculpture', prompt: 'sculpture, decorative statue, art object' },
	{ id: 'plant-pot', label: 'Plant Pot', prompt: 'plant pot, planter, ceramic pot' },
	{ id: 'books', label: 'Books', prompt: 'books, stacked books, decorative reading' },
	{ id: 'tray', label: 'Decorative Tray', prompt: 'decorative tray, serving tray, styled arrangement' },
	{ id: 'bowl', label: 'Decorative Bowl', prompt: 'decorative bowl, fruit bowl, centerpiece' },
	{ id: 'pillow', label: 'Throw Pillow', prompt: 'throw pillow, accent cushion, decorative pillow' },
	{ id: 'blanket', label: 'Throw Blanket', prompt: 'throw blanket, decorative blanket, cozy textile' },
	{ id: 'rug', label: 'Rug', prompt: 'rug, area rug, floor covering' }
];

// Electronics
export const electronicsTypes: FurniturePreset[] = [
	{ id: 'laptop', label: 'Laptop', prompt: 'laptop computer, notebook, portable computer' },
	{ id: 'smartphone', label: 'Smartphone', prompt: 'smartphone, mobile phone, cell phone' },
	{ id: 'tablet', label: 'Tablet', prompt: 'tablet, digital tablet, touch screen device' },
	{ id: 'headphones', label: 'Headphones', prompt: 'headphones, over-ear headphones, audio device' },
	{ id: 'earbuds', label: 'Earbuds', prompt: 'earbuds, wireless earbuds, in-ear headphones' },
	{ id: 'speaker', label: 'Speaker', prompt: 'speaker, bluetooth speaker, audio speaker' },
	{ id: 'camera', label: 'Camera', prompt: 'camera, digital camera, photography equipment' },
	{ id: 'television', label: 'Television', prompt: 'television, TV, flat screen, display' },
	{ id: 'monitor', label: 'Monitor', prompt: 'computer monitor, display screen, desktop display' },
	{ id: 'keyboard', label: 'Keyboard', prompt: 'keyboard, computer keyboard, typing device' },
	{ id: 'smartwatch', label: 'Smartwatch', prompt: 'smartwatch, wearable tech, digital watch' }
];

// Kitchenware
export const kitchenwareTypes: FurniturePreset[] = [
	{ id: 'mug', label: 'Mug', prompt: 'mug, coffee mug, ceramic cup' },
	{ id: 'glass', label: 'Glass', prompt: 'drinking glass, glassware, beverage glass' },
	{ id: 'plate', label: 'Plate', prompt: 'plate, dinner plate, ceramic dish' },
	{ id: 'bowl', label: 'Bowl', prompt: 'bowl, serving bowl, kitchen bowl' },
	{ id: 'cutlery', label: 'Cutlery', prompt: 'cutlery, silverware, fork knife spoon' },
	{ id: 'pot', label: 'Pot', prompt: 'cooking pot, saucepan, cookware' },
	{ id: 'pan', label: 'Pan', prompt: 'frying pan, skillet, cooking pan' },
	{ id: 'kettle', label: 'Kettle', prompt: 'kettle, tea kettle, water boiler' },
	{ id: 'coffee-maker', label: 'Coffee Maker', prompt: 'coffee maker, coffee machine, brewing device' },
	{ id: 'blender', label: 'Blender', prompt: 'blender, food processor, mixing appliance' },
	{ id: 'cutting-board', label: 'Cutting Board', prompt: 'cutting board, chopping board, prep surface' },
	{ id: 'wine-glass', label: 'Wine Glass', prompt: 'wine glass, stemware, elegant glass' }
];

// Styles
export const furnitureStyles: FurniturePreset[] = [
	{ id: 'modern', label: 'Modern', prompt: 'modern style, contemporary design, current aesthetic' },
	{ id: 'minimalist', label: 'Minimalist', prompt: 'minimalist style, simple, clean lines' },
	{ id: 'scandinavian', label: 'Scandinavian', prompt: 'scandinavian style, nordic design, light and airy' },
	{ id: 'industrial', label: 'Industrial', prompt: 'industrial style, raw materials, urban loft' },
	{ id: 'mid-century', label: 'Mid-Century', prompt: 'mid-century modern, retro 50s 60s, vintage modern' },
	{ id: 'rustic', label: 'Rustic', prompt: 'rustic style, natural wood, farmhouse' },
	{ id: 'bohemian', label: 'Bohemian', prompt: 'bohemian style, boho, eclectic layered' },
	{ id: 'traditional', label: 'Traditional', prompt: 'traditional style, classic, timeless design' },
	{ id: 'art-deco', label: 'Art Deco', prompt: 'art deco style, geometric, glamorous 1920s' },
	{ id: 'japandi', label: 'Japandi', prompt: 'japandi style, japanese scandinavian fusion, zen minimal' },
	{ id: 'coastal', label: 'Coastal', prompt: 'coastal style, beach house, nautical' },
	{ id: 'luxury', label: 'Luxury', prompt: 'luxury style, high-end, premium materials, opulent' }
];

// Materials
export const furnitureMaterials: FurniturePreset[] = [
	{ id: 'wood', label: 'Wood', prompt: 'wood material, wooden, natural timber' },
	{ id: 'metal', label: 'Metal', prompt: 'metal material, metallic, steel or iron' },
	{ id: 'glass', label: 'Glass', prompt: 'glass material, transparent, clear surface' },
	{ id: 'marble', label: 'Marble', prompt: 'marble material, stone, veined surface' },
	{ id: 'leather', label: 'Leather', prompt: 'leather material, genuine leather, upholstered' },
	{ id: 'fabric', label: 'Fabric', prompt: 'fabric material, upholstered, textile covered' },
	{ id: 'velvet', label: 'Velvet', prompt: 'velvet material, plush, luxurious soft' },
	{ id: 'rattan', label: 'Rattan', prompt: 'rattan material, wicker, woven natural' },
	{ id: 'ceramic', label: 'Ceramic', prompt: 'ceramic material, pottery, fired clay' },
	{ id: 'concrete', label: 'Concrete', prompt: 'concrete material, cement, raw industrial' },
	{ id: 'brass', label: 'Brass', prompt: 'brass material, golden metal, warm metallic' },
	{ id: 'acrylic', label: 'Acrylic', prompt: 'acrylic material, lucite, clear plastic' }
];

// Settings
export const furnitureSettings: FurniturePreset[] = [
	{ id: 'studio', label: 'Studio', prompt: 'studio setting, clean backdrop, isolated' },
	{ id: 'room', label: 'Room Setting', prompt: 'room setting, interior context, styled space' },
	{ id: 'outdoor', label: 'Outdoor', prompt: 'outdoor setting, exterior, garden or patio' },
	{ id: 'white-bg', label: 'White Background', prompt: 'white background, clean, minimal backdrop' },
	{ id: 'lifestyle', label: 'Lifestyle Context', prompt: 'lifestyle setting, in-use context, real environment' },
	{ id: 'showroom', label: 'Showroom', prompt: 'showroom setting, curated display, retail presentation' }
];

// Categories for dropdown grouping
export const furnitureCategories: FurnitureCategory[] = [
	{ id: 'seating', label: 'Seating', items: seatingTypes },
	{ id: 'tables', label: 'Tables', items: tableTypes },
	{ id: 'storage', label: 'Storage', items: storageTypes },
	{ id: 'lighting', label: 'Lighting Objects', items: lightingObjects },
	{ id: 'decor', label: 'Decor Objects', items: decorObjects },
	{ id: 'electronics', label: 'Electronics', items: electronicsTypes },
	{ id: 'kitchenware', label: 'Kitchenware', items: kitchenwareTypes }
];
