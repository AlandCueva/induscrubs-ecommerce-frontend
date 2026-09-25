// Pure size recommendation for the "Asesor de tallaje" (no UI dependencies).
// Rule agreed with the owner: when in doubt, recommend the larger size.
import { SIZE_CHARTS } from '../data/sizeCharts.ts';
import type { Brand, Gender, SizeCharts, SizeRow } from '../data/sizeCharts.ts';

export type Measure = 'bust' | 'waist' | 'hips';

export interface SizeAdvisorInput {
  gender: Gender;
  brand: Brand;
  bust: number; // busto (mujer) o pecho (hombre), cm
  waist: number; // cm
  hips?: number; // cm — required for mujer, ignored for hombre
}

export interface MeasureSize {
  measure: Measure;
  value: number;
  size: string | null; // null = above the largest size's maximum
}

export type SizeRecommendation =
  | { status: 'ok'; size: string; row: SizeRow; measures: MeasureSize[] }
  | { status: 'out-of-range'; outOfRange: Measure[]; measures: MeasureSize[] };

// Men: only chest and waist count. Women: bust, waist and hips.
export function measuresFor(gender: Gender): Measure[] {
  return gender === 'mujer' ? ['bust', 'waist', 'hips'] : ['bust', 'waist'];
}

// Index of the size a single measure falls into, or null when it is above the
// largest size's maximum. Rows must be ordered smallest → largest.
//  - Inside one or more ranges → the largest of those sizes.
//  - In a gap between sizes → the next larger size.
//  - Below the smallest size's minimum → the smallest size.
export function sizeIndexForMeasure(rows: SizeRow[], measure: Measure, value: number): number | null {
  const ranges = rows.map((row) => row[measure]);
  const last = ranges[ranges.length - 1];
  if (!last) return null;
  if (value > last[1]) return null;

  let containingIdx = -1;
  let outgrownIdx = -1; // largest size whose maximum is below the value
  ranges.forEach((range, idx) => {
    if (!range) return;
    const [min, max] = range;
    if (value >= min && value <= max) containingIdx = idx;
    if (max < value) outgrownIdx = idx;
  });

  if (containingIdx !== -1) return containingIdx;
  // Gap or below-minimum: the size right after the largest one already outgrown
  // (0 when nothing has been outgrown).
  return outgrownIdx + 1;
}

export function recommendSize(input: SizeAdvisorInput, charts: SizeCharts = SIZE_CHARTS): SizeRecommendation {
  const rows = charts[input.brand]?.[input.gender];
  if (!rows || rows.length === 0) {
    throw new Error(`No size chart for ${input.brand} / ${input.gender}`);
  }

  const measures: MeasureSize[] = measuresFor(input.gender).map((measure) => {
    const value = input[measure];
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
      throw new Error(`Invalid ${measure} measurement: ${String(value)}`);
    }
    const idx = sizeIndexForMeasure(rows, measure, value);
    return { measure, value, size: idx === null ? null : rows[idx].size };
  });

  const outOfRange = measures.filter((m) => m.size === null).map((m) => m.measure);
  if (outOfRange.length > 0) {
    return { status: 'out-of-range', outOfRange, measures };
  }

  // Final size = the largest of the per-measure sizes. It always comes from this
  // brand's own table, so a size the brand lacks (e.g. 5XL for Healing Hands
  // men) can only surface as a measure above the largest size → out of range.
  const finalIdx = Math.max(...measures.map((m) => rows.findIndex((row) => row.size === m.size)));
  const row = rows[finalIdx];
  return { status: 'ok', size: row.size, row, measures };
}
