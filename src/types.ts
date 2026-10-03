export type AppView = 'home' | 'catalog' | 'pdp' | 'cart' | 'b2b' | 'favorites' | 'legal';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  size: string;
  colorId?: string;
  brandId?: string | null;
  price: number;
  qty: number;
  image?: string;
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
