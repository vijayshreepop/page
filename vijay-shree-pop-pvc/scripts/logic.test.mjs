import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildOrder, quantityError } from '../src/lib/pricing.js';
import { addItem, parseCart } from '../src/lib/cart.js';
import { orderMessage, enquiryMessage, waUrl } from '../src/lib/whatsapp.js';
import { validateCustomer, normalizeMobile, validPin } from '../src/lib/forms.js';
import { productsToCsv, mergeCsv, blankProduct } from '../src/lib/csv.js';
import { validateAll } from '../src/lib/schema.js';
import { filterProducts, safeLink } from '../src/lib/catalog.js';
import { fingerprint, reconcile } from '../src/lib/sync.js';

// Test fixtures are defined here, so editing your catalogue never breaks these tests.
const make = (o) => ({ ...blankProduct(), category: 'panels', unit: 'Piece', pricingMode: 'fixed', price: 100, ...o });
const categories = [{ id: 'panels', name: 'Wall Panels', description: '', image: '', subcategories: ['Fluted'] }];
const products = [
  make({ id: 'a', code: 'A-1', name: 'Alpha & #1', price: 850, discountPrice: 800, dateAdded: '2026-01-01' }),
  make({ id: 'b', code: 'B-1', name: 'Beta', unit: 'Square Foot', price: 0.1, dateAdded: '2026-03-01', subcategory: 'Fluted' }),
  make({ id: 'q', code: 'Q-1', name: 'Quote item', pricingMode: 'quote', price: null }),
  make({ id: 'o', code: 'O-1', name: 'Gone', availability: 'out_of_stock' }),
  make({ id: 's', code: 'S-1', name: 'Scarce', stockQuantity: 3 }),
];
const customer = { name: 'Test Buyer', mobile: '98765 43210', email: 'buyer@example.com', address: '12 Sample Street, Area', city: 'Surat', state: 'Gujarat', pin: '395010', company: '', gst: '', instructions: 'Call first\nPlease' };

test('published data files are valid', () => {
  const data = Object.fromEntries(['products', 'categories', 'settings', 'gallery'].map((n) => [n, JSON.parse(readFileSync(new URL(`../public/data/${n}.json`, import.meta.url)))]));
  assert.deepEqual(validateAll(data), []);
});
test('totals, discount and decimal rounding', () => {
  const o = buildOrder([{ id: 'a', qty: 2 }, { id: 'b', qty: 3 }], products);
  assert.deepEqual([o.subtotal, o.discount, o.total, o.count, o.valid], [1700.3, 100, 1600.3, 2, true]);
});
test('unavailable, quote, deleted and over-stock items block an order', () => {
  for (const item of [{ id: 'q', qty: 1 }, { id: 'o', qty: 1 }, { id: 'zzz', qty: 1 }, { id: 's', qty: 4 }, { id: 'a', qty: 1.5 }, { id: 'a', qty: 0 }])
    assert.equal(buildOrder([item], products).valid, false, JSON.stringify(item));
  assert.equal(quantityError(products[1], 12.25), '');
  assert.equal(buildOrder([], products).valid, false);
});
test('cart merges quantities, respects stock and survives bad storage', () => {
  let r = addItem([], products[4], 2);
  r = addItem(r.cart, products[4], 2);
  assert.match(r.error, /Only 3/);
  assert.deepEqual(r.cart, [{ id: 's', qty: 2 }]);
  assert.deepEqual(parseCart('not json'), []);
  assert.deepEqual(parseCart('[{"id":"a","qty":-1},null,{"id":"b","qty":2}]'), [{ id: 'b', qty: 2 }]);
});
test('order message is complete and encoded', () => {
  const message = orderMessage({ company: 'VIJAY SHREE POP & PVC', order: buildOrder([{ id: 'a', qty: 2 }], products), customer, categoryName: () => 'Wall Panels' });
  for (const part of ['NEW CUSTOMER ORDER', 'Alpha & #1', 'Code: A-1', 'Category: Wall Panels', 'Quantity: 2', 'Unit: Piece', '₹800', 'Subtotal: ₹1,600', 'Full Name: Test Buyer', '+91 9876543210', 'buyer@example.com', 'City: Surat', 'State: Gujarat', 'PIN Code: 395010', 'Additional Instructions: Call first Please', 'Total Items: 1', 'Discount: ₹100', 'Estimated Total: ₹1,600'])
    assert.ok(message.includes(part), part);
  const url = waUrl('919429093121', message);
  assert.ok(url.startsWith('https://wa.me/919429093121?text='));
  assert.equal(new URL(url).searchParams.get('text'), message);
});
test('enquiry message', () => {
  const m = enquiryMessage({ company: 'VIJAY SHREE POP & PVC', product: products[2], form: { ...customer, quantity: '10', message: 'Rate?' }, categoryName: () => 'Wall Panels' });
  for (const part of ['PRODUCT PRICE ENQUIRY', 'Product Code: Q-1', 'Required Quantity: 10 Piece', 'Customer Message: Rate?']) assert.ok(m.includes(part), part);
});
test('mobile, PIN and customer validation', () => {
  for (const v of ['9876543210', '+91 98765-43210', '09876543210', '919876543210']) assert.equal(normalizeMobile(v), '9876543210');
  for (const v of ['12345', '5876543210', '98765432101', 'abc']) assert.equal(normalizeMobile(v), '');
  assert.ok(validPin('395010') && !validPin('095010') && !validPin('39501'));
  assert.deepEqual(validateCustomer(customer), {});
  assert.equal(Object.keys(validateCustomer({})).length, 7);
});
test('search, filters and sorting', () => {
  const ids = (f) => filterProducts(products, categories, f).map((p) => p.id);
  assert.deepEqual(ids({ q: 'b-1' }), ['b']);
  assert.deepEqual(ids({ q: 'fluted' }), ['b']);
  assert.equal(ids({ q: 'wall panels' }).length, 5);
  assert.deepEqual(ids({ type: 'quote' }), ['q']);
  assert.deepEqual(ids({ availability: 'out_of_stock' }), ['o']);
  assert.deepEqual(ids({ min: '500', max: '900' }), ['a']);
  assert.equal(ids({ sort: 'price-asc' })[0], 'b');
  assert.equal(ids({ sort: 'price-asc' }).at(-1), 'q');
  assert.equal(ids({ sort: 'price-desc' })[0], 'a');
  assert.equal(ids({ sort: 'price-desc' }).at(-1), 'q');
  assert.equal(safeLink('javascript:alert(1)'), '');
});
test('CSV round trip, update, add and formula protection', () => {
  const tricky = [make({ id: 'x', code: 'X', name: '=HYPERLINK("a")', description: 'Line 1\nsaid "hi", ok', specifications: [{ label: 'Finish', value: 'Matte' }], images: ['a.webp', 'b.webp'] })];
  const csv = productsToCsv(tricky);
  assert.ok(csv.includes("'=HYPERLINK"));
  const back = mergeCsv(tricky, csv);
  assert.deepEqual(back.products, tricky);
  const m = mergeCsv(products, 'code,price\r\nA-1,900\r\n');
  assert.deepEqual([m.updated, m.added, m.products[0].price, m.products[0].name], [1, 0, 900, 'Alpha & #1']);
  assert.equal(mergeCsv(products, 'code,name,category\nNEW-1,New,panels\n').added, 1);
  assert.throws(() => mergeCsv(products, 'name\nx'), /code/);
});
test('validation catches bad products', () => {
  const bad = [make({ id: 'a', code: 'A', name: 'A', price: 0 }), make({ id: 'a', code: 'a', name: 'B', category: 'nope', discountPrice: 500 })];
  const errors = validateAll({ products: bad, categories, gallery: [], settings: {} }).join(' ');
  for (const part of ['price above 0', 'used twice', 'does not exist', 'lower than']) assert.ok(errors.includes(part), part);
});
test('draft keeps edited files and follows published changes elsewhere', () => {
  const pub1 = { products: [1], categories: [1], settings: { a: 1 }, gallery: [] };
  const draft = { data: { ...pub1, products: [2] }, base: fingerprint(pub1) };
  const pub2 = { ...pub1, products: [3], gallery: [9] };
  const r = reconcile(draft, pub2);
  assert.deepEqual([r.data.products, r.data.gallery], [[2], [9]]);
  assert.equal(r.base.products, fingerprint(pub1).products);
});
