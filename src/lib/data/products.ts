// ============================================
// MOSCAR - Product Categories Data
// Based on Mockup.Maison's 2993+ products
// ============================================

export interface ProductCategory {
  name: string;
  description: string;
  products: Product[];
}

export interface Product {
  name: string;
  keywords: string[];
  defaultPrompt: string;
}

export const productCategories: ProductCategory[] = [
  {
    name: 'Apparel & Bags',
    description: 'Clothing, wearables, and bag mockups',
    products: [
      {
        name: 'T-Shirt',
        keywords: ['casual', 'cotton', 'crew neck'],
        defaultPrompt: 'cotton t-shirt with realistic fabric texture and natural draping'
      },
      {
        name: 'Hoodie',
        keywords: ['casual', 'warm', 'streetwear'],
        defaultPrompt: 'hoodie sweatshirt with soft fabric texture and relaxed fit'
      },
      {
        name: 'Cap',
        keywords: ['headwear', 'baseball', 'snapback'],
        defaultPrompt: 'baseball cap with structured crown and curved brim'
      },
      {
        name: 'Tote Bag',
        keywords: ['bag', 'canvas', 'shopping'],
        defaultPrompt: 'canvas tote bag with sturdy handles and flat surface for branding'
      },
      {
        name: 'Leggings',
        keywords: ['athletic', 'yoga', 'fitness'],
        defaultPrompt: 'athletic leggings with stretchy fabric and seamless design'
      },
      {
        name: 'Socks',
        keywords: ['footwear', 'athletic', 'crew'],
        defaultPrompt: 'crew socks with ribbed cuff and comfortable fit'
      },
      {
        name: 'Tank Top',
        keywords: ['sleeveless', 'athletic', 'summer'],
        defaultPrompt: 'tank top with scoop neck and relaxed fit'
      },
      {
        name: 'Polo Shirt',
        keywords: ['collar', 'business casual', 'golf'],
        defaultPrompt: 'polo shirt with collar and buttoned placket'
      },
      {
        name: 'Jacket',
        keywords: ['outerwear', 'layering', 'casual'],
        defaultPrompt: 'jacket with zipper front and comfortable fit'
      },
      {
        name: 'Backpack',
        keywords: ['bag', 'carry', 'travel'],
        defaultPrompt: 'backpack with padded straps and multiple compartments'
      }
    ]
  },
  {
    name: 'Devices',
    description: 'Tech device mockups including phones, laptops, tablets',
    products: [
      {
        name: 'iPhone Pro',
        keywords: ['smartphone', 'apple', 'mobile'],
        defaultPrompt: 'iPhone Pro with edge-to-edge display and realistic screen reflections'
      },
      {
        name: 'iPhone Max',
        keywords: ['smartphone', 'apple', 'large display'],
        defaultPrompt: 'iPhone Pro Max with large display and premium finish'
      },
      {
        name: 'iPhone mini',
        keywords: ['smartphone', 'apple', 'compact'],
        defaultPrompt: 'iPhone mini with compact form factor'
      },
      {
        name: 'MacBook Pro 13"',
        keywords: ['laptop', 'apple', 'portable'],
        defaultPrompt: 'MacBook Pro 13-inch with retina display and aluminum body'
      },
      {
        name: 'MacBook Pro 15"',
        keywords: ['laptop', 'apple', 'professional'],
        defaultPrompt: 'MacBook Pro 15-inch with large display and slim profile'
      },
      {
        name: 'MacBook Pro 16"',
        keywords: ['laptop', 'apple', 'workstation'],
        defaultPrompt: 'MacBook Pro 16-inch with immersive display and powerful design'
      },
      {
        name: 'iPad Pro',
        keywords: ['tablet', 'apple', 'creative'],
        defaultPrompt: 'iPad Pro with edge-to-edge liquid retina display'
      },
      {
        name: 'Apple Watch',
        keywords: ['smartwatch', 'wearable', 'fitness'],
        defaultPrompt: 'Apple Watch with always-on display and premium band'
      },
      {
        name: 'Studio Display',
        keywords: ['monitor', 'apple', 'professional'],
        defaultPrompt: 'Apple Studio Display with 5K retina screen and aluminum stand'
      },
      {
        name: 'iMac',
        keywords: ['desktop', 'apple', 'all-in-one'],
        defaultPrompt: 'iMac with colorful design and slim profile'
      }
    ]
  },
  {
    name: 'Packaging',
    description: 'Product packaging and container mockups',
    products: [
      {
        name: 'Box',
        keywords: ['cardboard', 'shipping', 'product'],
        defaultPrompt: 'product box with clean edges and matte finish'
      },
      {
        name: 'Bottle',
        keywords: ['container', 'liquid', 'beverage'],
        defaultPrompt: 'bottle with smooth surface and clear label area'
      },
      {
        name: 'Pouch',
        keywords: ['flexible', 'food', 'resealable'],
        defaultPrompt: 'stand-up pouch with zipper closure and flat label area'
      },
      {
        name: 'Jar',
        keywords: ['glass', 'container', 'cosmetic'],
        defaultPrompt: 'jar with lid and clean label surface'
      },
      {
        name: 'Can',
        keywords: ['metal', 'beverage', 'food'],
        defaultPrompt: 'aluminum can with 360-degree label wrap'
      },
      {
        name: 'Paper Bag',
        keywords: ['kraft', 'shopping', 'retail'],
        defaultPrompt: 'paper shopping bag with twisted handles'
      },
      {
        name: 'Tube',
        keywords: ['squeeze', 'cosmetic', 'cream'],
        defaultPrompt: 'tube packaging with flip-top cap'
      },
      {
        name: 'Carton',
        keywords: ['milk', 'juice', 'beverage'],
        defaultPrompt: 'beverage carton with gable top design'
      }
    ]
  },
  {
    name: 'Print Materials',
    description: 'Printed marketing and stationery mockups',
    products: [
      {
        name: 'Poster',
        keywords: ['wall', 'art', 'advertising'],
        defaultPrompt: 'poster with high-quality paper and smooth surface'
      },
      {
        name: 'Business Card',
        keywords: ['card', 'professional', 'networking'],
        defaultPrompt: 'business card with premium cardstock and clean edges'
      },
      {
        name: 'Magazine',
        keywords: ['publication', 'editorial', 'glossy'],
        defaultPrompt: 'magazine with glossy cover and realistic page thickness'
      },
      {
        name: 'Book',
        keywords: ['hardcover', 'publication', 'reading'],
        defaultPrompt: 'book with spine and realistic page edges'
      },
      {
        name: 'Flyer',
        keywords: ['handout', 'promotional', 'single page'],
        defaultPrompt: 'flyer on premium paper with vibrant print quality'
      },
      {
        name: 'Letterhead',
        keywords: ['stationery', 'corporate', 'document'],
        defaultPrompt: 'letterhead on quality paper with professional finish'
      },
      {
        name: 'Brochure',
        keywords: ['folded', 'marketing', 'informational'],
        defaultPrompt: 'tri-fold brochure with crisp folds and glossy finish'
      },
      {
        name: 'Menu',
        keywords: ['restaurant', 'food', 'hospitality'],
        defaultPrompt: 'menu with elegant typography and quality paper'
      }
    ]
  },
  {
    name: 'Out of Home',
    description: 'Billboard, signage, and outdoor advertising mockups',
    products: [
      {
        name: 'Billboard',
        keywords: ['outdoor', 'large format', 'advertising'],
        defaultPrompt: 'large billboard with realistic urban context'
      },
      {
        name: 'Urban Poster',
        keywords: ['street', 'wheatpaste', 'guerilla'],
        defaultPrompt: 'street poster on urban wall with authentic texture'
      },
      {
        name: 'Storefront',
        keywords: ['retail', 'shop', 'window'],
        defaultPrompt: 'storefront with window display and signage area'
      },
      {
        name: 'Sign',
        keywords: ['wayfinding', 'directional', 'mounted'],
        defaultPrompt: 'mounted sign with clean surface and realistic mounting'
      },
      {
        name: 'A-Frame',
        keywords: ['sidewalk', 'sandwich board', 'portable'],
        defaultPrompt: 'A-frame sidewalk sign with chalkboard or poster surface'
      },
      {
        name: 'Bus Shelter',
        keywords: ['transit', 'outdoor', 'advertising'],
        defaultPrompt: 'bus shelter advertising panel with backlit display'
      },
      {
        name: 'Banner',
        keywords: ['hanging', 'fabric', 'promotional'],
        defaultPrompt: 'hanging banner with fabric texture and grommets'
      }
    ]
  },
  {
    name: 'Stationery',
    description: 'Office and personal stationery mockups',
    products: [
      {
        name: 'Pencil',
        keywords: ['writing', 'wood', 'office'],
        defaultPrompt: 'wooden pencil with eraser and natural finish'
      },
      {
        name: 'Notebook',
        keywords: ['writing', 'journal', 'pages'],
        defaultPrompt: 'notebook with quality cover and lined pages'
      },
      {
        name: 'Envelope',
        keywords: ['mail', 'correspondence', 'paper'],
        defaultPrompt: 'envelope with clean surface and proper proportions'
      },
      {
        name: 'Greeting Card',
        keywords: ['card', 'folded', 'celebration'],
        defaultPrompt: 'folded greeting card with quality cardstock'
      },
      {
        name: 'Tape',
        keywords: ['washi', 'decorative', 'adhesive'],
        defaultPrompt: 'decorative tape roll with pattern visible'
      },
      {
        name: 'Pen',
        keywords: ['writing', 'ballpoint', 'office'],
        defaultPrompt: 'pen with sleek design and clip detail'
      },
      {
        name: 'Stamp',
        keywords: ['rubber', 'ink', 'marking'],
        defaultPrompt: 'rubber stamp with wooden handle'
      }
    ]
  },
  {
    name: 'Food & Beverage',
    description: 'Food packaging and drinkware mockups',
    products: [
      {
        name: 'Coffee Cup',
        keywords: ['paper', 'hot drink', 'takeaway'],
        defaultPrompt: 'paper coffee cup with lid and sleeve'
      },
      {
        name: 'Mug',
        keywords: ['ceramic', 'hot drink', 'handle'],
        defaultPrompt: 'ceramic mug with comfortable handle'
      },
      {
        name: 'Water Bottle',
        keywords: ['reusable', 'hydration', 'sports'],
        defaultPrompt: 'reusable water bottle with leak-proof cap'
      },
      {
        name: 'Beer Bottle',
        keywords: ['glass', 'beverage', 'alcohol'],
        defaultPrompt: 'beer bottle with label area and realistic glass'
      },
      {
        name: 'Pizza Box',
        keywords: ['cardboard', 'food', 'delivery'],
        defaultPrompt: 'pizza box with corrugated cardboard texture'
      },
      {
        name: 'Food Container',
        keywords: ['takeout', 'meal prep', 'storage'],
        defaultPrompt: 'food container with clear lid and secure closure'
      },
      {
        name: 'Wine Bottle',
        keywords: ['glass', 'beverage', 'elegant'],
        defaultPrompt: 'wine bottle with elegant label and cork'
      },
      {
        name: 'Tumbler',
        keywords: ['insulated', 'drink', 'travel'],
        defaultPrompt: 'insulated tumbler with lid and straw'
      }
    ]
  },
  {
    name: 'Beauty & Personal',
    description: 'Cosmetic and personal care product mockups',
    products: [
      {
        name: 'Candle',
        keywords: ['wax', 'scented', 'home'],
        defaultPrompt: 'candle in glass jar with cotton wick'
      },
      {
        name: 'Diffuser',
        keywords: ['scent', 'aromatherapy', 'home'],
        defaultPrompt: 'reed diffuser with glass bottle and sticks'
      },
      {
        name: 'Cream Tube',
        keywords: ['cosmetic', 'skincare', 'squeeze'],
        defaultPrompt: 'cosmetic cream tube with flip-top cap'
      },
      {
        name: 'Spray Bottle',
        keywords: ['mist', 'perfume', 'cosmetic'],
        defaultPrompt: 'spray bottle with fine mist nozzle'
      },
      {
        name: 'Serum Bottle',
        keywords: ['dropper', 'skincare', 'glass'],
        defaultPrompt: 'serum bottle with dropper and amber glass'
      },
      {
        name: 'Lipstick',
        keywords: ['makeup', 'cosmetic', 'color'],
        defaultPrompt: 'lipstick tube with bullet and cap'
      },
      {
        name: 'Compact Mirror',
        keywords: ['makeup', 'portable', 'beauty'],
        defaultPrompt: 'compact mirror with powder compartment'
      },
      {
        name: 'Soap Bar',
        keywords: ['bath', 'natural', 'cleansing'],
        defaultPrompt: 'bar soap with natural texture and packaging'
      }
    ]
  },
  {
    name: 'Hospitality',
    description: 'Restaurant and hotel industry mockups',
    products: [
      {
        name: 'Menu',
        keywords: ['restaurant', 'food', 'dining'],
        defaultPrompt: 'restaurant menu with elegant typography'
      },
      {
        name: 'Coaster',
        keywords: ['drink', 'bar', 'protective'],
        defaultPrompt: 'drink coaster with absorbent surface'
      },
      {
        name: 'Napkin',
        keywords: ['dining', 'paper', 'cloth'],
        defaultPrompt: 'folded napkin with quality texture'
      },
      {
        name: 'Towel',
        keywords: ['bath', 'hotel', 'soft'],
        defaultPrompt: 'folded towel with soft cotton texture'
      },
      {
        name: 'Apron',
        keywords: ['kitchen', 'chef', 'service'],
        defaultPrompt: 'apron with adjustable straps and front pocket'
      },
      {
        name: 'Placemat',
        keywords: ['dining', 'table', 'setting'],
        defaultPrompt: 'placemat with clean surface and quality material'
      },
      {
        name: 'Table Tent',
        keywords: ['tabletop', 'advertising', 'restaurant'],
        defaultPrompt: 'table tent card with sturdy fold'
      }
    ]
  },
  {
    name: 'Miscellaneous',
    description: 'Various other product mockups',
    products: [
      {
        name: 'Lighter',
        keywords: ['flame', 'promotional', 'pocket'],
        defaultPrompt: 'disposable lighter with wraparound label'
      },
      {
        name: 'Matches',
        keywords: ['fire', 'promotional', 'box'],
        defaultPrompt: 'matchbox with striking surface and printed cover'
      },
      {
        name: 'Keycard',
        keywords: ['hotel', 'access', 'plastic'],
        defaultPrompt: 'hotel keycard with magnetic stripe'
      },
      {
        name: 'Badge',
        keywords: ['ID', 'lanyard', 'identification'],
        defaultPrompt: 'ID badge with lanyard and clear holder'
      },
      {
        name: 'Hard Hat',
        keywords: ['safety', 'construction', 'protective'],
        defaultPrompt: 'safety hard hat with suspension system'
      },
      {
        name: 'Door Hanger',
        keywords: ['do not disturb', 'hotel', 'hanging'],
        defaultPrompt: 'door hanger with die-cut handle opening'
      },
      {
        name: 'USB Drive',
        keywords: ['storage', 'promotional', 'tech'],
        defaultPrompt: 'USB flash drive with branded surface'
      },
      {
        name: 'Phone Case',
        keywords: ['protective', 'accessory', 'mobile'],
        defaultPrompt: 'phone case with smooth surface and precise cutouts'
      }
    ]
  }
];

// Helper function to get all products as flat list
export function getAllProducts(): { category: string; product: Product }[] {
  return productCategories.flatMap(cat => 
    cat.products.map(prod => ({ category: cat.name, product: prod }))
  );
}

// Helper function to get products by category
export function getProductsByCategory(categoryName: string): Product[] {
  const category = productCategories.find(c => c.name === categoryName);
  return category?.products ?? [];
}
