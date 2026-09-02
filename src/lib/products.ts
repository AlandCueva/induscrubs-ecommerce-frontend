import { supabase } from './supabaseClient';

export interface ProductImage {
  url: string;
  sortOrder: number;
  colorId: string | null;
}

export interface ProductVariant {
  sizeCode: string;
  colorId: string;
  stock: number;
}

export interface ProductColorOption {
  id: string;
  name: string;
  hex: string;
  colorGroup: string; // 'Permanentes' | 'Edición limitada'
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  hasDiscount: boolean;
  discountPercent: number | null;
  discountAmount: number | null;
  finalPrice: number;
  categoryId: string;
  categoryName: string;
  brandId: string | null;
  brandName: string | null;
  gender: 'Mujer' | 'Hombre' | 'Unisex';
  createdAt: string;
  images: ProductImage[];
  colors: ProductColorOption[];
  variants: ProductVariant[];
  sizeCodes: string[];
}

export interface Category {
  id: string;
  name: string;
}

export interface Brand {
  id: string;
  name: string;
  logoUrl: string | null;
}

export interface Size {
  code: string;
  sortOrder: number;
}

// "Nuevos Ingresos" has no dedicated flag in the schema — placeholder rule
// (owner-confirmed default): products created within this many days count as new.
const NEW_ARRIVALS_WINDOW_DAYS = 30;

export function isNewArrival(createdAt: string): boolean {
  const createdMs = new Date(createdAt).getTime();
  const diffDays = (Date.now() - createdMs) / (1000 * 60 * 60 * 24);
  return diffDays <= NEW_ARRIVALS_WINDOW_DAYS;
}

const PRODUCT_SELECT = `
  id, name, description, price, category_id, gender, has_discount,
  discount_percent, discount_amount, final_price, created_at, brand_id,
  product_categories ( id, name ),
  brands ( id, name, logo_url ),
  product_images ( url, sort_order, color_id ),
  product_variants ( size_code, color_id, stock ),
  product_sizes ( size_code ),
  product_colors ( colors ( id, name, hex, color_group ) )
`;

interface RawProductRow {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  gender: 'Mujer' | 'Hombre' | 'Unisex';
  has_discount: boolean;
  discount_percent: number | null;
  discount_amount: number | null;
  final_price: number | null;
  created_at: string;
  brand_id: string | null;
  product_categories: { id: string; name: string } | null;
  brands: { id: string; name: string; logo_url: string | null } | null;
  product_images: { url: string; sort_order: number; color_id: string | null }[];
  product_variants: { size_code: string; color_id: string; stock: number }[];
  product_sizes: { size_code: string }[];
  product_colors: { colors: { id: string; name: string; hex: string; color_group: string } | null }[];
}

function mapRow(row: RawProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    hasDiscount: row.has_discount,
    discountPercent: row.discount_percent,
    discountAmount: row.discount_amount,
    finalPrice: row.final_price ?? row.price,
    categoryId: row.category_id,
    categoryName: row.product_categories?.name ?? '',
    brandId: row.brand_id,
    brandName: row.brands?.name ?? null,
    gender: row.gender,
    createdAt: row.created_at,
    images: [...row.product_images]
      .map((img) => ({ url: img.url, sortOrder: img.sort_order, colorId: img.color_id }))
      .sort((a, b) => a.sortOrder - b.sortOrder),
    variants: row.product_variants.map((v) => ({
      sizeCode: v.size_code,
      colorId: v.color_id,
      stock: v.stock,
    })),
    colors: row.product_colors
      .map((pc) => pc.colors)
      .filter((c): c is NonNullable<typeof c> => c !== null)
      .map((c) => ({ id: c.id, name: c.name, hex: c.hex, colorGroup: c.color_group })),
    sizeCodes: row.product_sizes.map((s) => s.size_code),
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as unknown as RawProductRow[]).map(mapRow);
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapRow(data as unknown as RawProductRow);
}

// Search scope (owner-confirmed default): product name + description only.
export async function searchProducts(query: string): Promise<Product[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const escaped = trimmed.replace(/[%,]/g, '');
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .or(`name.ilike.%${escaped}%,description.ilike.%${escaped}%`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as unknown as RawProductRow[]).map(mapRow);
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('product_categories').select('id, name').order('name');

  if (error) throw error;
  return data;
}

export async function fetchColors(): Promise<ProductColorOption[]> {
  const { data, error } = await supabase
    .from('colors')
    .select('id, name, hex, color_group')
    .order('color_group')
    .order('name');

  if (error) throw error;
  return data.map((c) => ({ id: c.id, name: c.name, hex: c.hex, colorGroup: c.color_group }));
}

export async function fetchSizes(): Promise<Size[]> {
  const { data, error } = await supabase.from('sizes').select('code, sort_order').order('sort_order');

  if (error) throw error;
  return data.map((s) => ({ code: s.code, sortOrder: s.sort_order }));
}

export async function fetchBrands(): Promise<Brand[]> {
  const { data, error } = await supabase.from('brands').select('id, name, logo_url').order('name');

  if (error) throw error;
  return data.map((b) => ({ id: b.id, name: b.name, logoUrl: b.logo_url }));
}
