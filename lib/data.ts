export const IMAGES = {
  mainHero: '/packagings/main_hero.png',
  mango: '/packagings/mango_hero.png',
  banana: '/packagings/banana_hero.png',
  pineapple: '/packagings/pineapple-hero.png',
  strawberry: '/packagings/strawberry_hero.png',
  lemon: '/packagings/lemon-hero.png',
  chocoStrawberry: '/packagings/chocolate-hero.png',
};

export interface Product {
  id: string;
  name: string;
  image: string;
  color: string;
  darkColor: string;
  desc: string;
  price: number;
  isDark?: boolean;
}

export const PRODUCTS: Product[] = [
  { id: 'mango', name: 'Mango', image: IMAGES.mango, color: '#FDE68A', darkColor: '#D97706', desc: 'Tropical sweetness, perfectly preserved.', price: 4.99 },
  { id: 'banana', name: 'Banana', image: IMAGES.banana, color: '#FEF08A', darkColor: '#CA8A04', desc: 'The classic crunch you never knew you needed.', price: 4.99 },
  { id: 'strawberry', name: 'Strawberry', image: IMAGES.strawberry, color: '#FECDD3', darkColor: '#BE123C', desc: 'Sweet, tart, and undeniably crispy.', price: 5.99 },
  { id: 'pineapple', name: 'Pineapple', image: IMAGES.pineapple, color: '#FEF9C3', darkColor: '#A16207', desc: 'A zesty explosion in every bite.', price: 5.49 },
  { id: 'lemon', name: 'Lemon', image: IMAGES.lemon, color: '#D9F99D', darkColor: '#4D7C0F', desc: 'Tangy, sharp, and refreshingly crunchy.', price: 4.99 },
  { id: 'choco-strawberry', name: 'Choco Strawberry', image: IMAGES.chocoStrawberry, color: '#FEE2E2', darkColor: '#451A03', desc: 'Premium chocolate meets tart strawberry.', price: 6.99, isDark: true },
];

export const springConfig = { stiffness: 70, damping: 20, restDelta: 0.001 };
export const fastSpring = { stiffness: 150, damping: 20 };
