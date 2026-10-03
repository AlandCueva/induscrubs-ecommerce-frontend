// Brand combo promo (brand_promotions), priced server-side from the persisted
// order lines. Mirrors src/lib/calcBrandPromo.ts on the client so the checkout
// preview and the stored order agree. Pure: no Deno/Supabase imports.

export interface PromoRow {
  brandId: string;
  brand: string;
  singleItemPrice: number;
  pairPrice: number;
}

export interface PromoLine {
  brandId: string | null;
  quantity: number;
  unitPrice: number;
}

export interface PromoResult {
  amount: number;
  units: number;
  brands: string[];
}

const toCents = (n: number) => Math.round(n * 100);

// Pools every matching unit into one count N per price tier (rows sharing the
// same single/pair prices form one tier):
//   total = floor(N / 2) * pairPrice + (N % 2) * singleItemPrice
// A tier is only applied when cheaper than the regular price of its units.
// Returns the amount to take off the items subtotal.
export function calcPromoAmount(lines: PromoLine[], promos: PromoRow[]): PromoResult {
  const promoByBrandId = new Map(promos.map((p) => [p.brandId, p]));
  const tiers = new Map<
    string,
    { single: number; pair: number; brands: Set<string>; units: number; regularCents: number }
  >();

  for (const line of lines) {
    const promo = line.brandId ? promoByBrandId.get(line.brandId) : undefined;
    if (!promo) continue;
    const key = `${promo.singleItemPrice}|${promo.pairPrice}`;
    let tier = tiers.get(key);
    if (!tier) {
      tier = { single: promo.singleItemPrice, pair: promo.pairPrice, brands: new Set(), units: 0, regularCents: 0 };
      tiers.set(key, tier);
    }
    tier.brands.add(promo.brand);
    tier.units += line.quantity;
    tier.regularCents += toCents(line.unitPrice) * line.quantity;
  }

  let savingsCents = 0;
  let units = 0;
  const brands = new Set<string>();
  for (const tier of tiers.values()) {
    const promoCents =
      Math.floor(tier.units / 2) * toCents(tier.pair) + (tier.units % 2) * toCents(tier.single);
    if (promoCents >= tier.regularCents) continue;
    savingsCents += tier.regularCents - promoCents;
    units += tier.units;
    tier.brands.forEach((b) => brands.add(b));
  }

  return { amount: savingsCents / 100, units, brands: [...brands].sort() };
}
