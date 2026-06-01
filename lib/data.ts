export const IMAGES = {
  mainHero: '/packagings/main_hero.png',
  mango: '/packagings/mango_hero.png',
  banana: '/packagings/banana_hero.png',
  pineapple: '/packagings/pineapple-hero.png',
  strawberry: '/packagings/strawberry_hero.png',
  lemon: '/packagings/lemon-hero.png',
  chocoStrawberry: '/packagings/chocolate-hero.png',
};

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface ProductDetails {
  calories: string;
  sugar: string;
  shelfLife: string;
  ingredients: string;
  origin: string;
}

export interface Product {
  id: string;
  name: string;
  image: string;
  color: string;
  darkColor: string;
  desc: string;
  price: number;
  originalPrice: number;
  category: 'Regular frozen' | 'chocolate coated fruits' | 'Fruit Powder' | 'Bulk order Listing' | 'Combo of Products';
  isDark?: boolean;
  gallery: string[];
  details: ProductDetails;
  reviews: Review[];
  stock?: number;
  reserved?: number;
}

export const PRODUCTS: Product[] = [
  // Regular Frozen Category
  { 
    id: 'mango', 
    name: 'Mango', 
    image: IMAGES.mango, 
    color: '#FDE68A', 
    darkColor: '#D97706', 
    desc: 'Tropical sweetness, perfectly preserved.', 
    price: 4.99, 
    originalPrice: 5.99,
    category: 'Regular frozen',
    gallery: [IMAGES.mango, IMAGES.mainHero],
    details: { calories: '90 kcal', sugar: '16g', shelfLife: '18 Months', ingredients: '100% Organic Freeze-Dried Mango Slices', origin: 'Ecuador' },
    reviews: [
      { id: 'm1', userName: 'Emma Watson', rating: 5, comment: 'Hands down the best snack! Crunchy, sweet, and pure mango bliss.', date: 'May 18, 2026' },
      { id: 'm2', userName: 'Liam Neeson', rating: 4, comment: 'Very intense mango flavor, feels extremely healthy. Will order again.', date: 'April 29, 2026' }
    ]
  },
  { 
    id: 'banana', 
    name: 'Banana', 
    image: IMAGES.banana, 
    color: '#FEF08A', 
    darkColor: '#CA8A04', 
    desc: 'The classic crunch you never knew you needed.', 
    price: 4.99, 
    originalPrice: 5.99,
    category: 'Regular frozen',
    gallery: [IMAGES.banana, IMAGES.mainHero],
    details: { calories: '105 kcal', sugar: '18g', shelfLife: '18 Months', ingredients: '100% Organic Freeze-Dried Banana Slices', origin: 'Costa Rica' },
    reviews: [
      { id: 'b1', userName: 'Tim Cook', rating: 5, comment: 'Excellent texture. Great for cereal bowls or snacking on-the-go.', date: 'May 05, 2026' }
    ]
  },
  { 
    id: 'strawberry', 
    name: 'Strawberry', 
    image: IMAGES.strawberry, 
    color: '#FECDD3', 
    darkColor: '#BE123C', 
    desc: 'Sweet, tart, and undeniably crispy.', 
    price: 5.99, 
    originalPrice: 6.99,
    category: 'Regular frozen',
    gallery: [IMAGES.strawberry, IMAGES.mainHero],
    details: { calories: '60 kcal', sugar: '10g', shelfLife: '18 Months', ingredients: '100% Organic Freeze-Dried Strawberry Slices', origin: 'California' },
    reviews: [
      { id: 's1', userName: 'Jessica Alba', rating: 5, comment: 'Unbelievable texture. It melts in your mouth and pops with tart strawberry flavor.', date: 'May 20, 2026' },
      { id: 's2', userName: 'Robert Downey', rating: 5, comment: 'My kids love these so much! Incredible healthy alternative to candy.', date: 'May 11, 2026' }
    ]
  },
  { 
    id: 'pineapple', 
    name: 'Pineapple', 
    image: IMAGES.pineapple, 
    color: '#FEF9C3', 
    darkColor: '#A16207', 
    desc: 'A zesty explosion in every bite.', 
    price: 5.49, 
    originalPrice: 6.49,
    category: 'Regular frozen',
    gallery: [IMAGES.pineapple, IMAGES.mainHero],
    details: { calories: '80 kcal', sugar: '14g', shelfLife: '18 Months', ingredients: '100% Organic Freeze-Dried Pineapple Chunks', origin: 'Hawaii' },
    reviews: [
      { id: 'p1', userName: 'Gal Gadot', rating: 4, comment: 'Extremely tangy! Feels like a burst of tropical summer in every crunch.', date: 'May 22, 2026' }
    ]
  },
  { 
    id: 'lemon', 
    name: 'Lemon', 
    image: IMAGES.lemon, 
    color: '#D9F99D', 
    darkColor: '#4D7C0F', 
    desc: 'Tangy, sharp, and refreshingly crunchy.', 
    price: 4.99, 
    originalPrice: 5.99,
    category: 'Regular frozen',
    gallery: [IMAGES.lemon, IMAGES.mainHero],
    details: { calories: '30 kcal', sugar: '4g', shelfLife: '18 Months', ingredients: '100% Organic Freeze-Dried Lemon Slices', origin: 'Spain' },
    reviews: [
      { id: 'l1', userName: 'Gordon Ramsay', rating: 5, comment: 'Perfect addition to a cup of hot water or iced tea. Crispy, sour, and absolutely phenomenal.', date: 'May 27, 2026' }
    ]
  },

  // Chocolate Coated Fruits Category
  { 
    id: 'choco-strawberry', 
    name: 'Choco Strawberry', 
    image: IMAGES.chocoStrawberry, 
    color: '#FEE2E2', 
    darkColor: '#451A03', 
    desc: 'Premium chocolate meets tart strawberry.', 
    price: 6.99, 
    originalPrice: 8.49,
    category: 'chocolate coated fruits', 
    isDark: true,
    gallery: [IMAGES.chocoStrawberry, IMAGES.strawberry, IMAGES.mainHero],
    details: { calories: '140 kcal', sugar: '15g', shelfLife: '12 Months', ingredients: 'Freeze-Dried Strawberries, Premium Dark Belgian Chocolate (Cocoa Mass, Sugar, Cocoa Butter)', origin: 'Belgium / California' },
    reviews: [
      { id: 'cs1', userName: 'Sophia Loren', rating: 5, comment: 'Chocolate and strawberry is a match made in heaven. The crunch is sublime.', date: 'May 25, 2026' },
      { id: 'cs2', userName: 'Christian Bale', rating: 4, comment: 'Incredibly delicious, though I wish there were more pieces in a single bag.', date: 'May 14, 2026' }
    ]
  },
  { 
    id: 'choco-banana', 
    name: 'Choco Banana', 
    image: IMAGES.banana, 
    color: '#FEF3C7', 
    darkColor: '#78350F', 
    desc: 'Slices of banana covered in rich chocolate.', 
    price: 6.99, 
    originalPrice: 7.99,
    category: 'chocolate coated fruits',
    gallery: [IMAGES.banana, IMAGES.chocoStrawberry],
    details: { calories: '160 kcal', sugar: '16g', shelfLife: '12 Months', ingredients: 'Freeze-Dried Banana Slices, Dark Milk Chocolate Coating', origin: 'Ecuador / Belgium' },
    reviews: []
  },
  { 
    id: 'choco-mango', 
    name: 'Choco Mango', 
    image: IMAGES.mango, 
    color: '#FFEDD5', 
    darkColor: '#9A3412', 
    desc: 'Freeze-dried mango half-dipped in Belgian chocolate.', 
    price: 7.49, 
    originalPrice: 8.99,
    category: 'chocolate coated fruits',
    gallery: [IMAGES.mango, IMAGES.chocoStrawberry],
    details: { calories: '150 kcal', sugar: '17g', shelfLife: '12 Months', ingredients: 'Freeze-Dried Mango Chews, Premium White & Dark Chocolate', origin: 'Mexico' },
    reviews: []
  },

  // Fruit Powder Category
  { 
    id: 'strawberry-powder', 
    name: 'Strawberry Powder', 
    image: IMAGES.strawberry, 
    color: '#FCE7F3', 
    darkColor: '#9D174D', 
    desc: '100% pure freeze-dried strawberry powder.', 
    price: 8.99, 
    originalPrice: 10.99,
    category: 'Fruit Powder',
    gallery: [IMAGES.strawberry, IMAGES.mainHero],
    details: { calories: '70 kcal', sugar: '11g', shelfLife: '24 Months', ingredients: '100% Organic Freeze-Dried Strawberry Dust', origin: 'USA' },
    reviews: [
      { id: 'sp1', userName: 'Martha Stewart', rating: 5, comment: 'Absolutely brilliant for frosting coloring and flavoring. The taste is remarkably pure.', date: 'May 02, 2026' }
    ]
  },
  { 
    id: 'mango-powder', 
    name: 'Mango Powder', 
    image: IMAGES.mango, 
    color: '#FEF3C7', 
    darkColor: '#B45309', 
    desc: 'Rich tropical mango ground into concentrated powder.', 
    price: 8.99, 
    originalPrice: 10.99,
    category: 'Fruit Powder',
    gallery: [IMAGES.mango, IMAGES.mainHero],
    details: { calories: '75 kcal', sugar: '13g', shelfLife: '24 Months', ingredients: '100% Organic Freeze-Dried Mango Dust', origin: 'Mexico' },
    reviews: []
  },
  { 
    id: 'lemon-powder', 
    name: 'Lemon Powder', 
    image: IMAGES.lemon, 
    color: '#FEF9C3', 
    darkColor: '#854D0E', 
    desc: 'Zesty freeze-dried lemon powder.', 
    price: 7.99, 
    originalPrice: 9.49,
    category: 'Fruit Powder',
    gallery: [IMAGES.lemon, IMAGES.mainHero],
    details: { calories: '35 kcal', sugar: '3g', shelfLife: '24 Months', ingredients: '100% Organic Freeze-Dried Lemon Dust', origin: 'Spain' },
    reviews: []
  },

  // Bulk order Listing Category
  { 
    id: 'bulk-frozen-pack', 
    name: 'Bulk Frozen Mix Pack', 
    image: IMAGES.mainHero, 
    color: '#E0F2FE', 
    darkColor: '#0369A1', 
    desc: '1kg family-sized value pack of assorted freeze-dried fruits.', 
    price: 49.99, 
    originalPrice: 59.99,
    category: 'Bulk order Listing',
    gallery: [IMAGES.mainHero, IMAGES.mango, IMAGES.strawberry],
    details: { calories: '85 kcal per serving', sugar: '14g', shelfLife: '18 Months', ingredients: 'Organic Freeze-Dried Assorted Fruit Blend (Mango, Strawberry, Banana)', origin: 'Multisource' },
    reviews: []
  },
  { 
    id: 'bulk-variety-box', 
    name: 'Bulk Variety Box', 
    image: IMAGES.mainHero, 
    color: '#F1F5F9', 
    darkColor: '#334155', 
    desc: 'Box of 24 individual single-serving pouches.', 
    price: 59.99, 
    originalPrice: 71.99,
    category: 'Bulk order Listing',
    gallery: [IMAGES.mainHero, IMAGES.pineapple, IMAGES.lemon],
    details: { calories: 'Varies', sugar: 'Varies', shelfLife: '18 Months', ingredients: '24 pouches of assortments (Mango, Banana, Strawberry, Lemon, Pineapple)', origin: 'Multisource' },
    reviews: []
  },

  // Combo of Products Category
  { 
    id: 'taster-combo-pack', 
    name: 'Taster Combo Pack', 
    image: IMAGES.mainHero, 
    color: '#E0F2FE', 
    darkColor: '#0369A1', 
    desc: 'Includes 5 signature packs of Mango, Banana, Strawberry, Pineapple, and Lemon.', 
    price: 22.99, 
    originalPrice: 24.99,
    category: 'Combo of Products',
    gallery: [IMAGES.mainHero, IMAGES.strawberry, IMAGES.lemon],
    details: { calories: 'Varies by pack', sugar: 'Varies by pack', shelfLife: '18 Months', ingredients: '5 pouch variety pack of 100% freeze-dried fruits', origin: 'Multisource' },
    reviews: []
  },
  { 
    id: 'choco-lover-combo', 
    name: 'Choco Lover\'s Combo', 
    image: IMAGES.chocoStrawberry, 
    color: '#FAE8FF', 
    darkColor: '#701A75', 
    desc: 'Double chocolate-coated strawberries and double chocolate bananas.', 
    price: 18.99, 
    originalPrice: 22.99,
    category: 'Combo of Products',
    gallery: [IMAGES.chocoStrawberry, IMAGES.banana],
    details: { calories: '150 kcal average', sugar: '16g', shelfLife: '12 Months', ingredients: 'Assortment of Choco Strawberry and Choco Banana pouches', origin: 'Multisource' },
    reviews: []
  },
];

export const springConfig = { stiffness: 120, damping: 24, restDelta: 0.001 };
export const fastSpring = { stiffness: 200, damping: 25 };
