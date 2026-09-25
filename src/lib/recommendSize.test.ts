// Run with: npm test (Node's built-in test runner; Node strips the TS types).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recommendSize } from './recommendSize.ts';
import { BRANDS, SIZE_CHARTS, brandFromName } from '../data/sizeCharts.ts';

const CANONICAL_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', '1XL', '2XL', '3XL', '4XL', '5XL'];

test('guide example: bust M, waist M, hips L → L', () => {
  // Cherokee mujer: bust M 94–99, waist M 74–79, hips L 107–114
  const result = recommendSize({ gender: 'mujer', brand: 'cherokee', bust: 96, waist: 76, hips: 110 });
  assert.equal(result.status, 'ok');
  assert.deepEqual(
    result.measures.map((m) => m.size),
    ['M', 'M', 'L']
  );
  assert.equal(result.status === 'ok' && result.size, 'L');
});

test('gap: 87 cm between XS (…86) and S (89…) → S', () => {
  const result = recommendSize({ gender: 'mujer', brand: 'cherokee', bust: 87, waist: 65, hips: 90 });
  assert.equal(result.status, 'ok');
  assert.deepEqual(
    result.measures.map((m) => m.size),
    ['S', 'XS', 'XS']
  );
  assert.equal(result.status === 'ok' && result.size, 'S');
});

test('below the smallest minimum → smallest size', () => {
  const result = recommendSize({ gender: 'mujer', brand: 'cherokee', bust: 70, waist: 50, hips: 80 });
  assert.equal(result.status === 'ok' && result.size, 'XXS');

  const men = recommendSize({ gender: 'hombre', brand: 'dickies', bust: 80, waist: 60 });
  assert.equal(men.status === 'ok' && men.size, 'XS');
});

test('above the largest maximum → out of range', () => {
  // Cherokee mujer 5XL hips max is 163
  const result = recommendSize({ gender: 'mujer', brand: 'cherokee', bust: 96, waist: 76, hips: 170 });
  assert.equal(result.status, 'out-of-range');
  assert.deepEqual(result.status === 'out-of-range' && result.outOfRange, ['hips']);
});

test('Healing Hands men above 4XL → out of range (no 5XL), other brands give 5XL', () => {
  // HH hombre 4XL: chest 147–152, waist 130–137
  const hh = recommendSize({ gender: 'hombre', brand: 'healing-hands', bust: 158, waist: 140 });
  assert.equal(hh.status, 'out-of-range');
  assert.deepEqual(hh.status === 'out-of-range' && hh.outOfRange, ['bust', 'waist']);

  const cherokee = recommendSize({ gender: 'hombre', brand: 'cherokee', bust: 158, waist: 140 });
  assert.equal(cherokee.status === 'ok' && cherokee.size, '5XL');

  // Largest size still reachable
  const hh4xl = recommendSize({ gender: 'hombre', brand: 'healing-hands', bust: 150, waist: 135 });
  assert.equal(hh4xl.status === 'ok' && hh4xl.size, '4XL');
});

test('shared boundary and overlapping ranges → the larger size', () => {
  // HH mujer bust: XS 76–84, S 84–89 → 84 is in both
  const boundary = recommendSize({ gender: 'mujer', brand: 'healing-hands', bust: 84, waist: 55, hips: 80 });
  assert.equal(boundary.status === 'ok' && boundary.size, 'S');

  // HH mujer bust: XL 102–109, 1XL 112–117, 2XL 109–124 → 110 lands in 2XL
  const overlap = recommendSize({ gender: 'mujer', brand: 'healing-hands', bust: 110, waist: 55, hips: 80 });
  assert.equal(overlap.status === 'ok' && overlap.size, '2XL');
});

test('MedCouture mujer XXS single values: ≤80 → XXS, 82–83 → XS', () => {
  const small = recommendSize({ gender: 'mujer', brand: 'medcouture', bust: 80, waist: 55, hips: 80 });
  assert.equal(small.status === 'ok' && small.size, 'XXS');
  const gap = recommendSize({ gender: 'mujer', brand: 'medcouture', bust: 82, waist: 55, hips: 80 });
  assert.equal(gap.status === 'ok' && gap.size, 'XS');
});

test('men: hips are never used', () => {
  const result = recommendSize({ gender: 'hombre', brand: 'medcouture', bust: 100, waist: 83, hips: 999 });
  assert.equal(result.status === 'ok' && result.size, 'M');
  assert.deepEqual(
    result.measures.map((m) => m.measure),
    ['bust', 'waist']
  );
});

test('invalid input throws', () => {
  assert.throws(() => recommendSize({ gender: 'mujer', brand: 'dickies', bust: 90, waist: 70 }));
  assert.throws(() => recommendSize({ gender: 'hombre', brand: 'dickies', bust: -1, waist: 70 }));
  assert.throws(() => recommendSize({ gender: 'hombre', brand: 'dickies', bust: Number.NaN, waist: 70 }));
});

test('charts: sizes ordered smallest → largest, valid ranges, women have hips', () => {
  for (const brand of BRANDS) {
    for (const gender of ['mujer', 'hombre'] as const) {
      const rows = SIZE_CHARTS[brand][gender];
      const order = rows.map((r) => CANONICAL_ORDER.indexOf(r.size));
      assert.ok(order.every((idx) => idx !== -1), `${brand}/${gender}: unknown size`);
      assert.ok(
        order.every((idx, i) => i === 0 || idx > order[i - 1]),
        `${brand}/${gender}: sizes out of order`
      );
      for (const row of rows) {
        for (const range of [row.bust, row.waist, row.hips]) {
          if (range) assert.ok(range[0] <= range[1], `${brand}/${gender}/${row.size}: min > max`);
        }
        if (gender === 'mujer') assert.ok(row.hips, `${brand}/mujer/${row.size}: missing hips`);
      }
    }
  }
});

test('brandFromName: maps catalog brand names to charts, unknown brands → null', () => {
  assert.equal(brandFromName('Healing Hands'), 'healing-hands');
  assert.equal(brandFromName('Hearling Hands'), 'healing-hands'); // current spelling in the brands table
  assert.equal(brandFromName('HH Works'), 'healing-hands');
  assert.equal(brandFromName('Cherokee Archive'), 'cherokee');
  assert.equal(brandFromName('MedCouture'), 'medcouture');
  assert.equal(brandFromName('Med Couture'), 'medcouture');
  assert.equal(brandFromName('Dickies'), 'dickies');
  assert.equal(brandFromName('Skechers'), null);
  assert.equal(brandFromName('FIGS'), null);
  assert.equal(brandFromName(null), null);
});
