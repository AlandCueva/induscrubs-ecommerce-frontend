export type ColorType = 'permanent' | 'limited';

export interface ProductColor {
  id: string;
  name: string;
  hex: string;
  borderHex?: string;
  type: ColorType;
  inStock: boolean;
}

export type ProductSize = 'XXS' | 'XS' | 'S' | 'M' | 'L' | 'XL' | '2XL' | '3XL';

export interface ProductReview {
  id: string;
  author: string;
  role: string;
  hospital: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  fitRating: 'pequena' | 'justa' | 'grande';
  sizePurchased: ProductSize;
  colorPurchased: string;
  verified: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  gender: 'Dama' | 'Caballero' | 'Unisex';
  price: number;
  originalPrice?: number;
  isNew?: boolean;
  rating: number;
  reviewCount: number;
  defaultColorId: string;
  colors: ProductColor[];
  sizes: ProductSize[];
  images: {
    url: string;
    alt: string;
    colorId?: string;
    isMain?: boolean;
  }[];
  detailImages?: string[]; // 1:1 detail images
  description: string;
  fabricTech: string[];
  features: string[];
  modelInfo: string;
  fitDistribution: {
    pequena: number; // percentage
    justa: number;   // percentage
    grande: number;  // percentage
  };
  reviews: ProductReview[];
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  size: string;
  price: number;
  qty: number;
  image?: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  subtitle: string;
  itemCount: number;
  imageUrl: string;
  isTodo?: boolean; // Clearly marked TODO category
}

export interface StoreInfo {
  address: string;
  city: string;
  postalCode: string;
  country: string;
  whatsapp: string;
  whatsappDisplay: string;
  phone: string;
  hoursWeekday: string;
  hoursSaturday: string;
  hoursSunday: string;
  instagram: string;
  sinceYear: number;
}
