// Size charts for the "Asesor de tallaje" modal. Source of truth: the sizing
// guide (guia-tallaje-ecommerce.md, section 4). All values are cm. Healing Hands
// was converted from inches (× 2.54, rounded to the whole cm); the other three
// brands were already in cm. Values are loaded exactly as given — the items
// marked TODO(verify) are pending confirmation with the supplier and must not be
// "fixed" here without that confirmation.

export type Gender = 'mujer' | 'hombre';
export type Brand = 'healing-hands' | 'cherokee' | 'medcouture' | 'dickies';
export type Range = [min: number, max: number]; // en cm

export interface SizeRow {
  size: string; // 'XXS' ... '5XL'
  bust: Range; // busto (mujer) o pecho (hombre)
  waist: Range;
  hips?: Range; // usado solo en mujer (en hombre es solo referencia)
}

export type SizeCharts = Record<Brand, Record<Gender, SizeRow[]>>;

export const BRAND_LABELS: Record<Brand, string> = {
  'healing-hands': 'Healing Hands',
  cherokee: 'Cherokee',
  medcouture: 'MedCouture',
  dickies: 'Dickies',
};

export const BRANDS: Brand[] = ['healing-hands', 'cherokee', 'medcouture', 'dickies'];

// Rows are ordered smallest → largest; the array index is used to compare sizes.
export const SIZE_CHARTS: SizeCharts = {
  'healing-hands': {
    // Combines HH Works and Purple Label / 360 / Healing Hands, taking the lowest
    // and highest value of both lines.
    // TODO(verify): combining two lines makes some neighbouring sizes overlap
    // (e.g. bust 2XL 109–124 vs XL 102–109). The "larger size wins" rule resolves
    // it without changes, but confirm the ranges with the supplier.
    mujer: [
      { size: 'XXS', bust: [69, 79], waist: [53, 61], hips: [79, 86] },
      { size: 'XS', bust: [76, 84], waist: [61, 66], hips: [86, 91] },
      { size: 'S', bust: [84, 89], waist: [66, 71], hips: [91, 97] },
      { size: 'M', bust: [89, 94], waist: [71, 76], hips: [97, 102] },
      { size: 'L', bust: [94, 102], waist: [76, 84], hips: [102, 109] },
      { size: 'XL', bust: [102, 109], waist: [84, 91], hips: [109, 117] },
      // TODO(verify): Purple Label has no 1XL data in the catalog ("?"); this row
      // uses HH Works only.
      { size: '1XL', bust: [112, 117], waist: [93, 98], hips: [118, 123] },
      { size: '2XL', bust: [109, 124], waist: [91, 104], hips: [117, 130] },
      { size: '3XL', bust: [119, 132], waist: [102, 112], hips: [127, 137] },
      { size: '4XL', bust: [130, 140], waist: [112, 122], hips: [137, 147] },
      // TODO(verify): hips 142–157 — the catalog prints 56–62", which overlaps
      // 4XL (55–58"). Likely a print error; if so the correct range is 147–157.
      { size: '5XL', bust: [140, 150], waist: [122, 132], hips: [142, 157] },
    ],
    // All lines of the brand. No 5XL for men.
    hombre: [
      { size: 'XS', bust: [81, 86], waist: [69, 71], hips: [81, 86] },
      { size: 'S', bust: [91, 94], waist: [74, 79], hips: [89, 94] },
      { size: 'M', bust: [97, 102], waist: [81, 86], hips: [97, 102] },
      { size: 'L', bust: [107, 112], waist: [89, 97], hips: [104, 112] },
      { size: 'XL', bust: [117, 122], waist: [99, 107], hips: [114, 122] },
      { size: '2XL', bust: [127, 132], waist: [109, 117], hips: [124, 132] },
      { size: '3XL', bust: [137, 142], waist: [119, 127], hips: [135, 142] },
      { size: '4XL', bust: [147, 152], waist: [130, 137], hips: [145, 152] },
    ],
  },
  cherokee: {
    mujer: [
      { size: 'XXS', bust: [79, 81], waist: [58, 61], hips: [84, 86] },
      { size: 'XS', bust: [84, 86], waist: [64, 66], hips: [89, 91] },
      { size: 'S', bust: [89, 91], waist: [69, 71], hips: [94, 97] },
      { size: 'M', bust: [94, 99], waist: [74, 79], hips: [99, 104] },
      { size: 'L', bust: [102, 109], waist: [81, 89], hips: [107, 114] },
      { size: 'XL', bust: [112, 119], waist: [91, 99], hips: [117, 124] },
      { size: '2XL', bust: [122, 130], waist: [102, 109], hips: [127, 135] },
      { size: '3XL', bust: [132, 140], waist: [112, 119], hips: [137, 145] },
      { size: '4XL', bust: [142, 150], waist: [122, 130], hips: [147, 155] },
      { size: '5XL', bust: [152, 160], waist: [132, 140], hips: [155, 163] },
    ],
    hombre: [
      { size: 'XS', bust: [84, 89], waist: [66, 71], hips: [81, 86] },
      { size: 'S', bust: [91, 97], waist: [74, 79], hips: [89, 94] },
      { size: 'M', bust: [99, 104], waist: [81, 86], hips: [97, 102] },
      { size: 'L', bust: [107, 114], waist: [89, 97], hips: [104, 112] },
      { size: 'XL', bust: [117, 124], waist: [99, 104], hips: [114, 122] },
      { size: '2XL', bust: [127, 135], waist: [107, 114], hips: [124, 132] },
      { size: '3XL', bust: [137, 145], waist: [117, 124], hips: [135, 142] },
      { size: '4XL', bust: [147, 155], waist: [127, 135], hips: [145, 152] },
      { size: '5XL', bust: [157, 165], waist: [137, 145], hips: [155, 163] },
    ],
  },
  medcouture: {
    mujer: [
      // TODO(verify): the catalog gives single values (81 / 61 / 86), not ranges.
      // With the current logic 80 cm or less → XXS, and 82–83 cm → XS.
      { size: 'XXS', bust: [81, 81], waist: [61, 61], hips: [86, 86] },
      { size: 'XS', bust: [84, 86], waist: [64, 66], hips: [89, 91] },
      { size: 'S', bust: [89, 91], waist: [69, 71], hips: [94, 97] },
      { size: 'M', bust: [94, 99], waist: [74, 79], hips: [99, 104] },
      { size: 'L', bust: [102, 109], waist: [81, 89], hips: [107, 114] },
      { size: 'XL', bust: [112, 119], waist: [91, 99], hips: [117, 124] },
      { size: '2XL', bust: [122, 130], waist: [102, 109], hips: [127, 135] },
      { size: '3XL', bust: [132, 140], waist: [112, 119], hips: [137, 145] },
      { size: '4XL', bust: [142, 150], waist: [122, 132], hips: [147, 157] },
      // TODO(verify): hips 160–170 — the jump from 4XL (147–157) is larger than
      // in the other brands.
      { size: '5XL', bust: [152, 160], waist: [132, 140], hips: [160, 170] },
    ],
    hombre: [
      { size: 'XS', bust: [81, 86], waist: [69, 71], hips: [81, 86] },
      { size: 'S', bust: [89, 94], waist: [71, 76], hips: [89, 94] },
      { size: 'M', bust: [97, 102], waist: [81, 86], hips: [97, 102] },
      { size: 'L', bust: [107, 112], waist: [89, 94], hips: [107, 112] },
      { size: 'XL', bust: [117, 122], waist: [99, 104], hips: [117, 122] },
      { size: '2XL', bust: [127, 132], waist: [109, 114], hips: [127, 132] },
      { size: '3XL', bust: [137, 142], waist: [119, 124], hips: [137, 142] },
      { size: '4XL', bust: [147, 152], waist: [130, 135], hips: [147, 152] },
      { size: '5XL', bust: [157, 163], waist: [140, 145], hips: [157, 163] },
    ],
  },
  dickies: {
    mujer: [
      { size: 'XXS', bust: [79, 81], waist: [58, 61], hips: [84, 86] },
      { size: 'XS', bust: [84, 86], waist: [64, 66], hips: [89, 91] },
      { size: 'S', bust: [89, 91], waist: [69, 71], hips: [94, 97] },
      { size: 'M', bust: [94, 99], waist: [74, 79], hips: [99, 104] },
      { size: 'L', bust: [102, 109], waist: [81, 89], hips: [107, 114] },
      { size: 'XL', bust: [112, 119], waist: [91, 99], hips: [117, 124] },
      { size: '2XL', bust: [122, 130], waist: [102, 109], hips: [127, 135] },
      { size: '3XL', bust: [132, 140], waist: [112, 119], hips: [137, 145] },
      { size: '4XL', bust: [142, 150], waist: [122, 130], hips: [147, 155] },
      { size: '5XL', bust: [152, 160], waist: [132, 140], hips: [157, 165] },
    ],
    hombre: [
      { size: 'XS', bust: [89, 91], waist: [64, 66], hips: [84, 89] },
      { size: 'S', bust: [91, 97], waist: [69, 74], hips: [91, 97] },
      { size: 'M', bust: [99, 104], waist: [76, 84], hips: [99, 104] },
      { size: 'L', bust: [107, 114], waist: [84, 91], hips: [107, 114] },
      { size: 'XL', bust: [117, 124], waist: [94, 102], hips: [117, 124] },
      { size: '2XL', bust: [127, 135], waist: [104, 112], hips: [127, 135] },
      { size: '3XL', bust: [137, 145], waist: [114, 122], hips: [137, 145] },
      { size: '4XL', bust: [147, 155], waist: [124, 132], hips: [147, 155] },
      { size: '5XL', bust: [157, 165], waist: [135, 145], hips: [157, 165] },
    ],
  },
};

// Maps a free-text brand name (e.g. products.brandName from Supabase) to a chart
// key. Prefix match so sub-lines ("Cherokee Archive", "HH Works") use their
// brand's chart. "Hearling Hands" is how the brand is currently spelled in the
// `brands` table (typo) — kept as an alias so preselection works either way.
// Returns null for brands without a chart, so the user picks one instead.
const BRAND_NAME_PREFIXES: [prefix: string, brand: Brand][] = [
  ['healinghands', 'healing-hands'],
  ['hearlinghands', 'healing-hands'],
  ['hhworks', 'healing-hands'],
  ['cherokee', 'cherokee'],
  ['medcouture', 'medcouture'],
  ['dickies', 'dickies'],
];

export function brandFromName(name: string | null | undefined): Brand | null {
  if (!name) return null;
  const normalized = name.toLowerCase().replace(/[^a-z]/g, '');
  return BRAND_NAME_PREFIXES.find(([prefix]) => normalized.startsWith(prefix))?.[1] ?? null;
}
