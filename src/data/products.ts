import { ProductColor, CategoryInfo, StoreInfo } from '../types';

export const STORE_INFO: StoreInfo = {
  address: 'Sucre y Juan de Salinas, Loja, Ecuador 110102',
  city: 'Loja',
  postalCode: '110102',
  country: 'Ecuador',
  whatsapp: '593988223950',
  whatsappDisplay: '0988223950',
  phone: '0988223950',
  hoursWeekday: 'Lunes a Viernes 08:30 – 19:00',
  hoursSaturday: 'Sábados 09:00 – 14:00',
  hoursSunday: 'Domingos cerrado',
  instagram: 'induscrubsec',
  sinceYear: 2013,
};

// Permanent & Limited Color Palettes (Color is the primary navigation axis)
export const PERMANENT_COLORS: ProductColor[] = [
  { id: 'c-navy', name: 'Azul Marino Quirúrgico', hex: '#1C315E', type: 'permanent', inStock: true },
  { id: 'c-ceil', name: 'Ceil Blue Médico', hex: '#6EA0DC', type: 'permanent', inStock: true },
  { id: 'c-teal-deep', name: 'Verde Quirúrgico Clásico', hex: '#165B54', type: 'permanent', inStock: true },
  { id: 'c-black', name: 'Negro Azabache', hex: '#1C1E21', type: 'permanent', inStock: true },
  { id: 'c-burgundy', name: 'Vino Borgoña', hex: '#581825', type: 'permanent', inStock: true },
  { id: 'c-graphite', name: 'Gris Grafito', hex: '#444B54', type: 'permanent', inStock: true },
];

export const LIMITED_COLORS: ProductColor[] = [
  { id: 'c-sage', name: 'Verde Salvia Austral', hex: '#7A9A8B', type: 'limited', inStock: true },
  { id: 'c-terracotta', name: 'Terracota Andino', hex: '#9E4E36', type: 'limited', inStock: true },
  { id: 'c-dusty-rose', name: 'Rosa Clínico Palo', hex: '#C2848E', type: 'limited', inStock: true },
  { id: 'c-lavender', name: 'Lila Lavanda', hex: '#9B92B3', type: 'limited', inStock: true },
  { id: 'c-olive', name: 'Olivo Sierra', hex: '#5E6B4B', type: 'limited', inStock: true },
  { id: 'c-sky', name: 'Celeste Glaciar', hex: '#8FBAD6', type: 'limited', inStock: true },
];

export const ALL_COLORS: ProductColor[] = [...PERMANENT_COLORS, ...LIMITED_COLORS];

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'sets-completos',
    name: 'Sets Quirúrgicos Completos',
    subtitle: 'Top anatómico + Pantalón jogger o recto',
    itemCount: 18,
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&h=600&q=80',
    isTodo: false,
  },
  {
    id: 'scrub-tops',
    name: 'Filipinas & Tops Médicos',
    subtitle: 'Cortes ergonómicos con bolsillos reforzados',
    itemCount: 14,
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&h=600&q=80',
    isTodo: false,
  },
  {
    id: 'scrub-pants',
    name: 'Pantalones & Joggers Clínicos',
    subtitle: 'Cintura elástica, 6 bolsillos y stretch 4-way',
    itemCount: 12,
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&h=600&q=80',
    isTodo: false,
  },
  {
    id: 'batas-chaquetas',
    name: 'Batas & Chaquetas Médicas',
    subtitle: 'Protección antifluido certificada para consultorio',
    itemCount: 8,
    imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&h=600&q=80',
    isTodo: false,
  },
  {
    id: 'gorros-accesorios',
    name: 'Gorros Quirúrgicos & Cofias',
    subtitle: 'Ajuste elástico transpirable con botón para mascarilla',
    itemCount: 9,
    imageUrl: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=600&h=600&q=80',
    isTodo: true, // Marked TODO category
  },
  {
    id: 'linea-estetica-spa',
    name: 'Línea Estética & Cosmetología',
    subtitle: 'Confección elegante para dermatología y spas',
    itemCount: 6,
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&h=600&q=80',
    isTodo: true, // Marked TODO category
  },
];

export const SIZING_CHART_CM = [
  { size: 'XXS', chest: '80 - 84', waist: '60 - 64', hip: '86 - 90', heightRec: '150 - 158' },
  { size: 'XS', chest: '85 - 89', waist: '65 - 69', hip: '91 - 95', heightRec: '155 - 163' },
  { size: 'S', chest: '90 - 95', waist: '70 - 75', hip: '96 - 101', heightRec: '160 - 170' },
  { size: 'M', chest: '96 - 102', waist: '76 - 82', hip: '102 - 107', heightRec: '165 - 175' },
  { size: 'L', chest: '103 - 109', waist: '83 - 89', hip: '108 - 114', heightRec: '170 - 180' },
  { size: 'XL', chest: '110 - 117', waist: '90 - 97', hip: '115 - 122', heightRec: '175 - 185' },
  { size: '2XL', chest: '118 - 126', waist: '98 - 106', hip: '123 - 130', heightRec: '175 - 190' },
  { size: '3XL', chest: '127 - 135', waist: '107 - 116', hip: '131 - 139', heightRec: '175 - 190' },
];

export interface ProductVariant {
  color: string;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  category: string;
  sizes: string[];
  description?: string;
  variants?: { color: string; image: string }[];
}

export const PRODUCTS: Product[] = [
  {
    id: 'cherokee-scrub-set-blue',
    name: 'Cherokee Scrub Set Blue',
    price: '$65.00',
    image: 'https://ik.imagekit.io/fjlcsp6fz/Induscrubs/InduscrubsImages/scrubsetblue.webp?updatedAt=1787858171217',
    category: 'Sets Quirúrgicos Completos',
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    description: 'Corte moderno, transpirable de principio a fin de turno. Bolsillos funcionales, tela resistente a manchas y ajuste pensado para moverte sin límites durante guardias largas.',
  },
  {
    id: 'greys-anatomy-scrub-set-green',
    name: "Grey's Anatomy Scrub Set Green",
    price: '$70.00',
    image: 'https://ik.imagekit.io/fjlcsp6fz/Induscrubs/InduscrubsImages/srubgagreen.jfif?updatedAt=1787858166685',
    category: 'Sets Quirúrgicos Completos',
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    description: 'Confort superior y diseño ergonómico de la línea Grey\'s Anatomy. Tela premium ultra suave con tecnología de absorción de humedad y máxima durabilidad.',
  },
  {
    id: 'sketchers-scrub-set-purple',
    name: 'Skechers Scrub Set Purple',
    price: '$68.00',
    image: 'https://ik.imagekit.io/fjlcsp6fz/Induscrubs/InduscrubsImages/sketcherspurple.jpg',
    category: 'Sets Quirúrgicos Completos',
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    description: 'Flexibilidad de 4 vías y tejido ecológico ligero. Diseñado para profesionales de la salud que buscan estilo contemporáneo y rendimiento activo.',
  },
  {
    id: 'sketchers-scrub-set-cream',
    name: 'Skechers Scrub Set Cream',
    price: '$62.00',
    image: 'https://ik.imagekit.io/fjlcsp6fz/Induscrubs/InduscrubsImages/sketcherscream.jpg',
    category: 'Sets Quirúrgicos Completos',
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    description: 'Tonalidad crema sofisticada con ajuste suave y relajado. Resistente a arrugas y de secado rápido para mantenerte impecable todo el día.',
  },
  {
    id: 'sketchers-scrub-set-black',
    name: 'Skechers Scrub Set Black',
    price: '$67.00',
    image: 'https://ik.imagekit.io/fjlcsp6fz/Induscrubs/InduscrubsImages/sketchersblack.webp',
    category: 'Sets Quirúrgicos Completos',
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    description: 'Corte moderno, transpirable de principio a fin de turno. Bolsillos funcionales, tela resistente a manchas y ajuste pensado para moverte sin límites durante guardias largas.',
    variants: [
      {
        color: 'Red',
        image: 'https://ik.imagekit.io/fjlcsp6fz/Induscrubs/InduscrubsImages/scrubcred.webp',
      },
      {
        color: 'Blue',
        image: 'https://ik.imagekit.io/fjlcsp6fz/Induscrubs/InduscrubsImages/scrubcblue.webp',
      },
    ],
  },
  {
    id: 'cherokee-scrub-set-purple',
    name: 'Cherokee Scrub Set Purple',
    price: '$72.00',
    image: 'https://ik.imagekit.io/fjlcsp6fz/Induscrubs/InduscrubsImages/cherokeepurple.jpg',
    category: 'Sets Quirúrgicos Completos',
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    description: 'Estilo clásico con refuerzo de doble costura y múltiples compartimentos de fácil acceso. El balance perfecto entre funcionalidad clínica y elegancia.',
  },
];

