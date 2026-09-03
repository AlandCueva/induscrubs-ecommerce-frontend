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
  sortOrder: number;
}

export interface ColorPaletteTile extends ProductColorOption {
  imageUrl: string;
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

// Canonical size display order (mirrors the DB "sizes" table sort_order).
export const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

// "Nuevos Ingresos" has no dedicated flag in the schema — placeholder rule
// (owner-confirmed default): products created within this many days count as new.
const NEW_ARRIVALS_WINDOW_DAYS = 30;

// Discount indicator label for product cards/PDP. The DB's generated
// `final_price` column only factors in `discount_amount` (has_discount &&
// discount_amount != null), so that pair is the real source of truth for
// "is a discount active." `discount_percent` exists as a separate stored
// column the admin fills in alongside it — we prefer it for the label text
// since it reflects the admin's stated intent, falling back to deriving the
// percent from price/finalPrice only if it wasn't populated.
export function getDiscountBadgeLabel(product: Product): string | null {
  if (!product.hasDiscount || product.finalPrice >= product.price) return null;
  const percent =
    product.discountPercent != null
      ? Math.round(product.discountPercent)
      : Math.round((1 - product.finalPrice / product.price) * 100);
  if (percent <= 0) return null;
  return `-${percent}%`;
}

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
  product_colors ( colors ( id, name, hex, color_group, sort_order ) )
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
  product_colors: {
    colors: { id: string; name: string; hex: string; color_group: string; sort_order: number } | null;
  }[];
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
      .map((c) => ({ id: c.id, name: c.name, hex: c.hex, colorGroup: c.color_group, sortOrder: c.sort_order }))
      .sort((a, b) => a.sortOrder - b.sortOrder),
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

// "Productos recomendados" (PDP) default rule: same price band as the
// current product, ±20% of its final (effective) price, inclusive. Nearest
// price first, newest first as the tiebreak. Owner can override the band.
const RECOMMENDED_PRICE_BAND = 0.2;
const RECOMMENDED_LIMIT = 10;

export async function fetchRecommendedProducts(
  product: Product,
  limit: number = RECOMMENDED_LIMIT
): Promise<Product[]> {
  const low = product.finalPrice * (1 - RECOMMENDED_PRICE_BAND);
  const high = product.finalPrice * (1 + RECOMMENDED_PRICE_BAND);

  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .neq('id', product.id)
    .gte('final_price', low)
    .lte('final_price', high)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data as unknown as RawProductRow[])
    .map(mapRow)
    .sort((a, b) => Math.abs(a.finalPrice - product.finalPrice) - Math.abs(b.finalPrice - product.finalPrice))
    .slice(0, limit);
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('product_categories').select('id, name').order('name');

  if (error) throw error;
  return data;
}

export async function fetchColors(): Promise<ProductColorOption[]> {
  const { data, error } = await supabase
    .from('colors')
    .select('id, name, hex, color_group, sort_order')
    .order('sort_order');

  if (error) throw error;
  return data.map((c) => ({
    id: c.id,
    name: c.name,
    hex: c.hex,
    colorGroup: c.color_group,
    sortOrder: c.sort_order,
  }));
}

// Picks one real tagged product photo per color (most recently added), for
// tile-style color pickers. Colors with no tagged photo yet are omitted
// entirely — same "hide, don't placeholder" rule as brands with no logo.
export async function fetchColorPaletteTiles(): Promise<ColorPaletteTile[]> {
  const [colors, { data: images, error }] = await Promise.all([
    fetchColors(),
    supabase
      .from('product_images')
      .select('color_id, url, created_at')
      .not('color_id', 'is', null)
      .order('created_at', { ascending: false }),
  ]);

  if (error) throw error;

  const photoByColorId = new Map<string, string>();
  for (const img of images) {
    if (img.color_id && !photoByColorId.has(img.color_id)) {
      photoByColorId.set(img.color_id, img.url);
    }
  }

  return colors
    .filter((c) => photoByColorId.has(c.id))
    .map((c) => ({ ...c, imageUrl: photoByColorId.get(c.id)! }));
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
