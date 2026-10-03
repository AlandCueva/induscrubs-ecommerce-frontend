import test from 'node:test';
import assert from 'node:assert/strict';
import { calcBrandPromo } from './calcBrandPromo.ts';
import type { CartItem } from '../types.ts';
import type { BrandPromotion } from './brandPromotions.ts';

const promos: BrandPromotion[] = [
  { id: 'p1', brandId: 'ava', brandName: 'Ava Therese', singleItemPrice: 65, pairPrice: 100 },
  { id: 'p2', brandId: 'heart', brandName: 'HeartSoul', singleItemPrice: 65, pairPrice: 100 },
];

const item = (id: string, brandId: string | null, price: number, qty = 1): CartItem => ({
  id,
  productId: id,
  name: id,
  size: 'M',
  brandId,
  price,
  qty,
});

test('one matching unit prices at the single-item price', () => {
  const r = calcBrandPromo([item('a', 'ava', 70)], promos);
  assert.equal(r.subtotal, 65);
  assert.equal(r.promoSavings, 5);
});

test('two units price at the pair price', () => {
  const r = calcBrandPromo([item('a', 'ava', 70, 2)], promos);
  assert.equal(r.subtotal, 100);
  assert.equal(r.groups[0].pairs, 1);
  assert.equal(r.groups[0].singles, 0);
});

test('units pool across products and promo brands: 3 units = 100 + 65', () => {
  const r = calcBrandPromo([item('a', 'ava', 70), item('b', 'heart', 75, 2)], promos);
  assert.equal(r.groups.length, 1);
  assert.equal(r.groups[0].units, 3);
  assert.equal(r.subtotal, 165);
  assert.equal(r.promoSavings, 70 + 150 - 165);
});

test('non-matching items are untouched', () => {
  const r = calcBrandPromo([item('a', 'ava', 70, 2), item('d', 'dickies', 50), item('n', null, 30)], promos);
  assert.equal(r.subtotal, 100 + 50 + 30);
  assert.equal(r.regularSubtotal, 140 + 50 + 30);
});

test('promo is skipped when it would not be cheaper', () => {
  const r = calcBrandPromo([item('a', 'ava', 40, 2)], promos);
  assert.equal(r.groups.length, 0);
  assert.equal(r.subtotal, 80);
});

test('no promotions leaves the cart unchanged', () => {
  const r = calcBrandPromo([item('a', 'ava', 70)], []);
  assert.equal(r.subtotal, 70);
  assert.equal(r.groups.length, 0);
});
