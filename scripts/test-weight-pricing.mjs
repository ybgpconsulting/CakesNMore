import assert from 'node:assert';
import { execSync } from 'node:child_process';
import {
  getLowestPrice,
  getWeightPrice,
  hasMultipleWeightPrices,
  parseWeightPricesString,
  formatWeightPricesString,
} from '../src/utils/productPricing.ts';

console.log('🧪 Starting Weight-Wise Pricing Automated Test Suite...\n');

// ---------------------------------------------------------------------------
// 1. Test getLowestPrice
// ---------------------------------------------------------------------------
console.log('▶ Test 1: getLowestPrice calculation');
const cakeWithWeights = {
  id: 'prod-test-cake',
  name: 'Test Truffle Cake',
  slug: 'test-truffle-cake',
  description: 'Rich chocolate',
  price: 599,
  oldPrice: 699,
  categoryId: 'cat-cakes',
  images: ['https://images.unsplash.com/photo-1578985545062-69928b1d9587'],
  featured: false,
  bestseller: false,
  available: true,
  displayOrder: 1,
  weightOptions: ['500g', '1kg', '2kg'],
  weightPrices: [
    { weight: '500g', price: 549, oldPrice: 649 },
    { weight: '1kg', price: 999, oldPrice: 1199 },
    { weight: '2kg', price: 1899 },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const lowest = getLowestPrice(cakeWithWeights);
assert.strictEqual(lowest.price, 549, 'Lowest price should be 549');
assert.strictEqual(lowest.oldPrice, 649, 'Lowest oldPrice should be 649');

const standardProduct = {
  ...cakeWithWeights,
  weightPrices: undefined,
  price: 499,
  oldPrice: 599,
};
const standardLowest = getLowestPrice(standardProduct);
assert.strictEqual(standardLowest.price, 499, 'Standard product lowest price should be base price 499');
assert.strictEqual(standardLowest.oldPrice, 599, 'Standard product lowest oldPrice should be base oldPrice 599');
console.log('  ✔ getLowestPrice returns lowest tier price and handles fallbacks accurately.');

// ---------------------------------------------------------------------------
// 2. Test getWeightPrice for specific selections
// ---------------------------------------------------------------------------
console.log('\n▶ Test 2: getWeightPrice reactive variant matching');
const price500g = getWeightPrice(cakeWithWeights, '500g');
assert.strictEqual(price500g.price, 549);
assert.strictEqual(price500g.oldPrice, 649);

const price1kg = getWeightPrice(cakeWithWeights, '1kg');
assert.strictEqual(price1kg.price, 999);
assert.strictEqual(price1kg.oldPrice, 1199);

const price2kg = getWeightPrice(cakeWithWeights, '2kg');
assert.strictEqual(price2kg.price, 1899);

// Case-insensitivity and whitespace trim
const priceCaseInsensitive = getWeightPrice(cakeWithWeights, '  1Kg  ');
assert.strictEqual(priceCaseInsensitive.price, 999, 'Should match case-insensitively and trimmed');

// Unknown weight fallback to lowest
const priceUnknown = getWeightPrice(cakeWithWeights, '3kg');
assert.strictEqual(priceUnknown.price, 549, 'Unknown weight should default to lowest variant');
console.log('  ✔ getWeightPrice resolves exact rates for 500g, 1kg, 2kg and handles case variations.');

// ---------------------------------------------------------------------------
// 3. Test hasMultipleWeightPrices
// ---------------------------------------------------------------------------
console.log('\n▶ Test 3: hasMultipleWeightPrices detection');
assert.strictEqual(hasMultipleWeightPrices(cakeWithWeights), true);
assert.strictEqual(hasMultipleWeightPrices(standardProduct), false);
assert.strictEqual(hasMultipleWeightPrices({ ...cakeWithWeights, weightPrices: [{ weight: '500g', price: 549 }] }), false);
console.log('  ✔ hasMultipleWeightPrices correctly detects multi-tier variants.');

// ---------------------------------------------------------------------------
// 4. Test parseWeightPricesString & formatWeightPricesString
// ---------------------------------------------------------------------------
console.log('\n▶ Test 4: String and object parsing for weight-wise pricing');
const parsedColon = parseWeightPricesString('500g: 500, 1kg: 950, 2kg: 1800');
assert.deepStrictEqual(parsedColon, [
  { weight: '500g', price: 500, oldPrice: undefined },
  { weight: '1kg', price: 950, oldPrice: undefined },
  { weight: '2kg', price: 1800, oldPrice: undefined },
]);

const parsedWithCurrency = parseWeightPricesString('500gm - ₹500, 1kg - ₹950');
assert.strictEqual(parsedWithCurrency?.length, 2);
assert.strictEqual(parsedWithCurrency?.[0].weight, '500gm');
assert.strictEqual(parsedWithCurrency?.[0].price, 500);
assert.strictEqual(parsedWithCurrency?.[1].weight, '1kg');
assert.strictEqual(parsedWithCurrency?.[1].price, 950);

const parsedWithOldPrice = parseWeightPricesString('500g:500:600, 1kg:950:1100');
assert.strictEqual(parsedWithOldPrice?.[0].price, 500);
assert.strictEqual(parsedWithOldPrice?.[0].oldPrice, 600);
assert.strictEqual(parsedWithOldPrice?.[1].price, 950);
assert.strictEqual(parsedWithOldPrice?.[1].oldPrice, 1100);

const formatted = formatWeightPricesString(parsedWithOldPrice);
assert.strictEqual(formatted, '500g: 500:600, 1kg: 950:1100');
console.log('  ✔ String parsing and formatting correctly handle weights, rates, currency signs, and old prices.');

// ---------------------------------------------------------------------------
// 5. Real Local Cloudflare D1 Database Persistence & Schema Roundtrip
// ---------------------------------------------------------------------------
console.log('\n▶ Test 5: Local Cloudflare D1 Database roundtrip with weight-wise prices');
function executeD1(sql) {
  const raw = execSync(`npx wrangler d1 execute cakesnmore --local --command "${sql.replace(/"/g, '\\"')}" --json`, {
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  const parsed = JSON.parse(raw);
  return parsed[0]?.results || [];
}

const testProdId = `prod-weight-test-${Date.now().toString(36)}`;
const testWeightsJson = JSON.stringify([
  { weight: '500g', price: 499, oldPrice: 599 },
  { weight: '1kg', price: 899, oldPrice: 1099 },
  { weight: '2kg', price: 1699 },
]);
const nowIso = new Date().toISOString();

// Insert product with weight-wise prices serialized into weight_options_json
executeD1(
  `INSERT OR REPLACE INTO products (id, name, slug, description, price, old_price, category_id, category_name, category_slug, images_json, featured, bestseller, available, display_order, weight_options_json, created_at, updated_at) VALUES ('${testProdId}', 'Audit Butterscotch Cake', 'audit-butterscotch-cake', 'Delicious butterscotch crunch', 499, 599, 'cat-cakes', 'Cakes', 'cakes', '[]', 0, 0, 1, 50, '${testWeightsJson}', '${nowIso}', '${nowIso}');`
);

const row = executeD1(`SELECT id, name, price, weight_options_json FROM products WHERE id = '${testProdId}';`)[0];
assert.ok(row, 'Product must exist in D1');
assert.strictEqual(row.price, 499, 'Starting price should be lowest rate (499)');

const parsedFromDb = JSON.parse(row.weight_options_json);
assert.strictEqual(parsedFromDb.length, 3, 'Must have 3 weight price options');
assert.strictEqual(parsedFromDb[0].weight, '500g');
assert.strictEqual(parsedFromDb[0].price, 499);
assert.strictEqual(parsedFromDb[1].weight, '1kg');
assert.strictEqual(parsedFromDb[1].price, 899);
assert.strictEqual(parsedFromDb[2].weight, '2kg');
assert.strictEqual(parsedFromDb[2].price, 1699);

// Clean up test product
executeD1(`DELETE FROM products WHERE id = '${testProdId}';`);
console.log('  ✔ D1 database successfully stores, queries, and preserves weight-wise pricing in weight_options_json without table migrations.');

console.log('\n🎉 ALL WEIGHT-WISE PRICING TESTS PASSED PERFECTLY WITH 100% SUCCESS!');
