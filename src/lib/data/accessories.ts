// ============================================
// Accessories Presets
// ============================================

export interface AccessoryPreset {
	id: string;
	label: string;
	prompt: string;
}

export interface AccessoryCategory {
	id: string;
	label: string;
	items: AccessoryPreset[];
}

// Jewelry
export const jewelryTypes: AccessoryPreset[] = [
	{ id: 'necklace', label: 'Necklace', prompt: 'necklace, neck jewelry, pendant chain' },
	{ id: 'earrings', label: 'Earrings', prompt: 'earrings, ear jewelry, ear accessories' },
	{ id: 'bracelet', label: 'Bracelet', prompt: 'bracelet, wrist jewelry, bangle' },
	{ id: 'ring', label: 'Ring', prompt: 'ring, finger jewelry, band' },
	{ id: 'watch', label: 'Watch', prompt: 'wristwatch, timepiece, luxury watch' },
	{ id: 'anklet', label: 'Anklet', prompt: 'anklet, ankle bracelet, ankle jewelry' },
	{ id: 'brooch', label: 'Brooch', prompt: 'brooch, pin jewelry, decorative pin' },
	{ id: 'cufflinks', label: 'Cufflinks', prompt: 'cufflinks, shirt cuff jewelry, formal accessory' },
	{ id: 'body-jewelry', label: 'Body Jewelry', prompt: 'body jewelry, body chain, decorative body piece' }
];

// Bags
export const bagTypes: AccessoryPreset[] = [
	{ id: 'handbag', label: 'Handbag', prompt: 'handbag, purse, ladies bag' },
	{ id: 'tote', label: 'Tote Bag', prompt: 'tote bag, large open bag, carry-all' },
	{ id: 'crossbody', label: 'Crossbody Bag', prompt: 'crossbody bag, shoulder strap bag, messenger' },
	{ id: 'clutch', label: 'Clutch', prompt: 'clutch bag, evening bag, small handheld' },
	{ id: 'backpack', label: 'Backpack', prompt: 'backpack, rucksack, back-worn bag' },
	{ id: 'wallet', label: 'Wallet', prompt: 'wallet, billfold, card holder' },
	{ id: 'briefcase', label: 'Briefcase', prompt: 'briefcase, business bag, professional case' },
	{ id: 'duffel', label: 'Duffel Bag', prompt: 'duffel bag, gym bag, sports bag' },
	{ id: 'luggage', label: 'Luggage', prompt: 'luggage, suitcase, travel bag' },
	{ id: 'belt-bag', label: 'Belt Bag', prompt: 'belt bag, fanny pack, waist bag' },
	{ id: 'bucket', label: 'Bucket Bag', prompt: 'bucket bag, drawstring bag, rounded base' },
	{ id: 'satchel', label: 'Satchel', prompt: 'satchel, structured bag, top handle' }
];

// Eyewear
export const eyewearTypes: AccessoryPreset[] = [
	{ id: 'sunglasses', label: 'Sunglasses', prompt: 'sunglasses, shades, sun eyewear' },
	{ id: 'aviator', label: 'Aviator', prompt: 'aviator sunglasses, teardrop lens, pilot style' },
	{ id: 'cat-eye', label: 'Cat Eye', prompt: 'cat eye sunglasses, winged frames, retro feminine' },
	{ id: 'round', label: 'Round', prompt: 'round sunglasses, circular frames, vintage style' },
	{ id: 'wayfarer', label: 'Wayfarer', prompt: 'wayfarer sunglasses, classic square, timeless' },
	{ id: 'oversized', label: 'Oversized', prompt: 'oversized sunglasses, large frames, statement eyewear' },
	{ id: 'sport', label: 'Sport', prompt: 'sport sunglasses, athletic eyewear, wraparound' },
	{ id: 'reading', label: 'Reading Glasses', prompt: 'reading glasses, optical frames, clear lens' },
	{ id: 'blue-light', label: 'Blue Light Glasses', prompt: 'blue light glasses, computer glasses, screen protection' }
];

// Headwear
export const headwearTypes: AccessoryPreset[] = [
	{ id: 'baseball-cap', label: 'Baseball Cap', prompt: 'baseball cap, ball cap, casual hat' },
	{ id: 'beanie', label: 'Beanie', prompt: 'beanie, knit hat, winter cap' },
	{ id: 'fedora', label: 'Fedora', prompt: 'fedora hat, felt hat, classic brim' },
	{ id: 'bucket-hat', label: 'Bucket Hat', prompt: 'bucket hat, fisherman hat, casual brim' },
	{ id: 'beret', label: 'Beret', prompt: 'beret, french cap, artist hat' },
	{ id: 'sun-hat', label: 'Sun Hat', prompt: 'sun hat, wide brim, summer hat' },
	{ id: 'visor', label: 'Visor', prompt: 'visor, sun visor, sport headwear' },
	{ id: 'headband', label: 'Headband', prompt: 'headband, hair band, head accessory' },
	{ id: 'hair-clips', label: 'Hair Clips', prompt: 'hair clips, hair accessories, decorative clips' },
	{ id: 'scrunchie', label: 'Scrunchie', prompt: 'scrunchie, hair tie, fabric elastic' }
];

// Scarves & Wraps
export const scarfTypes: AccessoryPreset[] = [
	{ id: 'silk', label: 'Silk Scarf', prompt: 'silk scarf, luxury scarf, smooth fabric wrap' },
	{ id: 'wool', label: 'Wool Scarf', prompt: 'wool scarf, winter scarf, warm knit' },
	{ id: 'infinity', label: 'Infinity Scarf', prompt: 'infinity scarf, loop scarf, circular wrap' },
	{ id: 'bandana', label: 'Bandana', prompt: 'bandana, printed square, tied fabric' },
	{ id: 'shawl', label: 'Shawl', prompt: 'shawl, wrap, shoulder drape' },
	{ id: 'pashmina', label: 'Pashmina', prompt: 'pashmina, cashmere wrap, elegant drape' },
	{ id: 'necktie', label: 'Necktie', prompt: 'necktie, formal tie, business neckwear' },
	{ id: 'bow-tie', label: 'Bow Tie', prompt: 'bow tie, formal bow, dapper neckwear' }
];

// Belts
export const beltTypes: AccessoryPreset[] = [
	{ id: 'leather', label: 'Leather Belt', prompt: 'leather belt, classic belt, genuine leather' },
	{ id: 'designer', label: 'Designer Belt', prompt: 'designer belt, logo buckle, luxury brand belt' },
	{ id: 'chain', label: 'Chain Belt', prompt: 'chain belt, metal link belt, decorative chain' },
	{ id: 'woven', label: 'Woven Belt', prompt: 'woven belt, braided belt, elastic weave' },
	{ id: 'wide', label: 'Wide Belt', prompt: 'wide belt, statement belt, waist cincher' },
	{ id: 'skinny', label: 'Skinny Belt', prompt: 'skinny belt, thin belt, delicate strap' }
];

// Shoes
export const shoeTypes: AccessoryPreset[] = [
	{ id: 'heels', label: 'High Heels', prompt: 'high heels, stilettos, elevated pumps' },
	{ id: 'sneakers', label: 'Sneakers', prompt: 'sneakers, athletic shoes, casual trainers' },
	{ id: 'boots', label: 'Boots', prompt: 'boots, ankle boots, tall boots' },
	{ id: 'loafers', label: 'Loafers', prompt: 'loafers, slip-on shoes, casual leather' },
	{ id: 'sandals', label: 'Sandals', prompt: 'sandals, open-toe shoes, strappy footwear' },
	{ id: 'flats', label: 'Flats', prompt: 'flat shoes, ballet flats, low profile' },
	{ id: 'mules', label: 'Mules', prompt: 'mules, backless shoes, slide-on' },
	{ id: 'oxfords', label: 'Oxfords', prompt: 'oxford shoes, lace-up formal, dress shoes' }
];

// Materials
export const accessoryMaterials: AccessoryPreset[] = [
	{ id: 'gold', label: 'Gold', prompt: 'gold material, golden finish, warm metallic' },
	{ id: 'silver', label: 'Silver', prompt: 'silver material, silver finish, cool metallic' },
	{ id: 'rose-gold', label: 'Rose Gold', prompt: 'rose gold material, pink gold, warm blush metal' },
	{ id: 'platinum', label: 'Platinum', prompt: 'platinum material, white metal, premium finish' },
	{ id: 'leather', label: 'Leather', prompt: 'genuine leather, leather material, natural hide' },
	{ id: 'suede', label: 'Suede', prompt: 'suede material, soft napped leather, velvety texture' },
	{ id: 'canvas', label: 'Canvas', prompt: 'canvas material, sturdy fabric, cotton weave' },
	{ id: 'vegan-leather', label: 'Vegan Leather', prompt: 'vegan leather, faux leather, cruelty-free material' },
	{ id: 'steel', label: 'Stainless Steel', prompt: 'stainless steel, brushed metal, durable finish' },
	{ id: 'crystal', label: 'Crystal', prompt: 'crystal, gemstone, sparkling stones' },
	{ id: 'pearl', label: 'Pearl', prompt: 'pearl, iridescent, lustrous gem' },
	{ id: 'diamond', label: 'Diamond', prompt: 'diamond, brilliant cut, precious stone' },
	{ id: 'fabric', label: 'Fabric', prompt: 'fabric material, textile, woven cloth' }
];

// Styles
export const accessoryStyles: AccessoryPreset[] = [
	{ id: 'luxury', label: 'Luxury', prompt: 'luxury style, high-end, premium designer' },
	{ id: 'minimalist', label: 'Minimalist', prompt: 'minimalist style, simple, clean design' },
	{ id: 'statement', label: 'Statement', prompt: 'statement piece, bold, eye-catching' },
	{ id: 'vintage', label: 'Vintage', prompt: 'vintage style, retro, classic era' },
	{ id: 'bohemian', label: 'Bohemian', prompt: 'bohemian style, boho, free-spirited' },
	{ id: 'casual', label: 'Casual', prompt: 'casual style, everyday, relaxed' },
	{ id: 'formal', label: 'Formal', prompt: 'formal style, elegant, dressy' },
	{ id: 'sporty', label: 'Sporty', prompt: 'sporty style, athletic, active' },
	{ id: 'edgy', label: 'Edgy', prompt: 'edgy style, bold, unconventional' },
	{ id: 'classic', label: 'Classic', prompt: 'classic style, timeless, traditional' }
];

// Placement & Display
export const accessoryPlacements: AccessoryPreset[] = [
	{ id: 'worn', label: 'Worn/Modeled', prompt: 'worn on model, being worn, on body' },
	{ id: 'flat-lay', label: 'Flat Lay', prompt: 'flat lay display, laid flat, top-down arrangement' },
	{ id: 'hanging', label: 'Hanging', prompt: 'hanging display, suspended, on hook' },
	{ id: 'stand', label: 'Display Stand', prompt: 'on display stand, jewelry stand, holder' },
	{ id: 'mannequin', label: 'On Mannequin', prompt: 'on mannequin, bust display, form' },
	{ id: 'gift-box', label: 'In Gift Box', prompt: 'in gift box, packaging, presented' },
	{ id: 'scattered', label: 'Scattered', prompt: 'scattered arrangement, multiple pieces, spread' },
	{ id: 'stacked', label: 'Stacked', prompt: 'stacked display, layered, multiple items' },
	{ id: 'closeup', label: 'Close-Up Detail', prompt: 'close-up shot, detail view, macro' },
	{ id: 'held', label: 'Held in Hand', prompt: 'held in hand, hand model, grip shot' }
];

// Categories for dropdown grouping
export const accessoryCategories: AccessoryCategory[] = [
	{ id: 'jewelry', label: 'Jewelry', items: jewelryTypes },
	{ id: 'bags', label: 'Bags & Luggage', items: bagTypes },
	{ id: 'eyewear', label: 'Eyewear', items: eyewearTypes },
	{ id: 'headwear', label: 'Headwear', items: headwearTypes },
	{ id: 'scarves', label: 'Scarves & Wraps', items: scarfTypes },
	{ id: 'belts', label: 'Belts', items: beltTypes },
	{ id: 'shoes', label: 'Shoes', items: shoeTypes }
];
