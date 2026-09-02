export interface CartItem {
  id: string;
  productId: string;
  name: string;
  size: string;
  colorId?: string;
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
