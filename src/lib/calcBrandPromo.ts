import type { CartItem } from '../types';
import type { BrandPromotion } from './brandPromotions';

export interface BrandPromoGroup {
  singleItemPrice: number;
  pairPrice: number;
  brandNames: string[];
  units: number;
  pairs: number;
  singles: number;
  regularTotal: number;
  promoTotal: number;
  savings: number;
}

export interface CartPricing {
  /** Sum of item.price * qty, before any promo. */
  regularSubtotal: number;
  groups: BrandPromoGroup[];
  promoSavings: number;
  /** regularSubtotal - promoSavings. */
  subtotal: number;
}

const toCents = (n: number) => Math.round(n * 100);
const fromCents = (c: number) => c / 100;

export function findPromoForBrand(
  promotions: BrandPromotion[],
  brandId: string | null | undefined
): BrandPromotion | undefined {
  if (!brandId) return undefined;
  return promotions.find((p) => p.brandId === brandId);
}

// "$65" for whole amounts, "$65.50" otherwise.
export function formatPromoPrice(value: number): string {
  return Number.isInteger(value) ? `$${value}` : `$${value.toFixed(2)}`;
}

// Matches cart items to active promotions on brand_id and pools every matching
// unit (any product, size or color) into one count N per price tier:
//   total = floor(N / 2) * pairPrice + (N % 2) * singleItemPrice
// Promotions that share the same single/pair prices form one tier, so units
// from different promo brands combine. A tier is only applied when it is
// cheaper than the regular prices of its units. Non-matching items are untouched.
export function calcBrandPromo(items: CartItem[], promotions: BrandPromotion[]): CartPricing {
  const regularCents = items.reduce((sum, item) => sum + toCents(item.price) * item.qty, 0);

  const promoByBrandId = new Map(promotions.map((p) => [p.brandId, p]));
  const tiers = new Map<
    string,
    { single: number; pair: number; brands: Set<string>; units: number; regularCents: number }
  >();

  for (const item of items) {
    const promo = item.brandId ? promoByBrandId.get(item.brandId) : undefined;
    if (!promo) continue;
    const key = `${promo.singleItemPrice}|${promo.pairPrice}`;
    let tier = tiers.get(key);
    if (!tier) {
      tier = {
        single: promo.singleItemPrice,
        pair: promo.pairPrice,
        brands: new Set(),
        units: 0,
        regularCents: 0,
      };
      tiers.set(key, tier);
    }
    tier.brands.add(promo.brandName);
    tier.units += item.qty;
    tier.regularCents += toCents(item.price) * item.qty;
  }

  const groups: BrandPromoGroup[] = [];
  for (const tier of tiers.values()) {
    const pairs = Math.floor(tier.units / 2);
    const singles = tier.units % 2;
    const promoCents = pairs * toCents(tier.pair) + singles * toCents(tier.single);
    if (promoCents >= tier.regularCents) continue;
    groups.push({
      singleItemPrice: tier.single,
      pairPrice: tier.pair,
      brandNames: [...tier.brands].sort(),
      units: tier.units,
      pairs,
      singles,
      regularTotal: fromCents(tier.regularCents),
      promoTotal: fromCents(promoCents),
      savings: fromCents(tier.regularCents - promoCents),
    });
  }

  const savingsCents = groups.reduce((sum, g) => sum + toCents(g.savings), 0);
  return {
    regularSubtotal: fromCents(regularCents),
    groups,
    promoSavings: fromCents(savingsCents),
    subtotal: fromCents(regularCents - savingsCents),
  };
}
