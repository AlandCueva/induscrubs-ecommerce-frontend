import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export interface BrandPromotion {
  id: string;
  brandId: string;
  brandName: string;
  singleItemPrice: number;
  pairPrice: number;
}

// Active rows only; RLS lets anon read this table.
export async function fetchBrandPromotions(): Promise<BrandPromotion[]> {
  const { data, error } = await supabase
    .from('brand_promotions')
    .select('id, brand, brand_id, single_item_price, pair_price')
    .eq('active', true)
    .order('brand');

  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    brandId: row.brand_id,
    brandName: row.brand,
    singleItemPrice: Number(row.single_item_price),
    pairPrice: Number(row.pair_price),
  }));
}

// One request per page load, shared by the PDP, home banner, cart drawer and
// checkout. A failed request is not pinned, so the next mount can retry.
let promotionsRequest: Promise<BrandPromotion[]> | null = null;

function loadBrandPromotions(): Promise<BrandPromotion[]> {
  if (!promotionsRequest) {
    promotionsRequest = fetchBrandPromotions().catch((err) => {
      promotionsRequest = null;
      throw err;
    });
  }
  return promotionsRequest;
}

// Any failure resolves to "no promotions", so a broken fetch only hides the
// promo and never affects browsing or checkout.
export function useBrandPromotions(): { promotions: BrandPromotion[]; isLoading: boolean } {
  const [promotions, setPromotions] = useState<BrandPromotion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    loadBrandPromotions()
      .then((rows) => {
        if (!cancelled) setPromotions(rows);
      })
      .catch(() => {
        if (!cancelled) setPromotions([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { promotions, isLoading };
}
