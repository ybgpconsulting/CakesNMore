import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import test from 'node:test';
import worker from '../worker/index.ts';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS } from '../src/data/initialData.ts';

const html = `<!doctype html>
<html><head>
<title>Original title</title>
<meta name="description" content="Original description" />
<meta name="keywords" content="original" />
<link rel="canonical" href="https://cakesnmorenoida.in/" />
<meta name="robots" content="index,follow" />
<meta property="og:title" content="Original title" />
<meta property="og:description" content="Original description" />
<meta property="og:url" content="https://cakesnmorenoida.in/" />
<meta property="og:image" content="https://example.com/image.jpg" />
<meta property="og:image:secure_url" content="https://example.com/image.jpg" />
<meta property="og:image:alt" content="Original image" />
<meta property="og:type" content="website" />
<meta name="twitter:title" content="Original title" />
<meta name="twitter:description" content="Original description" />
<meta name="twitter:image" content="https://example.com/image.jpg" />
<meta name="twitter:image:alt" content="Original image" />
</head><body><div id="root"></div></body></html>`;

function createEnv({ database = {} } = {}) {
  const assetResponses = [];
  const statement = {
    bind() { return this; },
    async first() { return null; },
    async all() { return { results: [] }; },
    async run() { return { success: true }; },
  };
  const env = {
    DB: {
      prepare(query) { return database.prepare ? database.prepare(query) : { ...statement }; },
      async batch() { return []; },
    },
    MEDIA: {},
    ASSETS: {
      async fetch(request) {
        const isCss = new URL(request.url).pathname.endsWith('.css');
        const response = isCss
          ? new Response('body { color: red; }', { headers: { 'content-type': 'text/css; charset=utf-8' } })
          : new Response(html, {
            headers: {
              'content-type': 'text/html; charset=utf-8',
              'content-length': '9999',
              'content-encoding': 'gzip',
              etag: '"stale-asset-tag"',
            },
          });
        assetResponses.push(response);
        return response;
      },
    },
    ADMIN_EMAIL: 'admin@example.com',
    ADMIN_PASSWORD_HASH: '',
    SESSION_SECRET: 'worker-test-session-secret',
    assetResponses,
  };
  return env;
}

async function request(pathname, env = createEnv(), init = {}) {
  const response = await worker.fetch(new Request(`https://cakesnmorenoida.in${pathname}`, init), env);
  return { response, env };
}

function adminCookie(env) {
  const payload = Buffer.from(JSON.stringify({
    email: env.ADMIN_EMAIL.toLowerCase(),
    exp: Math.floor(Date.now() / 1000) + 3600,
  })).toString('base64url');
  const signature = createHmac('sha256', env.SESSION_SECRET).update(payload).digest('base64url');
  return `fnp_admin_session=${payload}.${signature}`;
}

function jsonLdFrom(htmlText) {
  const script = htmlText.match(/<script type="application\/ld\+json" id="server-page-schema">(.*?)<\/script>/s);
  assert.ok(script, 'expected server-rendered JSON-LD');
  return JSON.parse(script[1]);
}

test('GET / returns valid HTML without consuming the fallback asset response', async () => {
  const { response, env } = await request('/');
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /text\/html/);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('x-frame-options'), 'SAMEORIGIN');
  assert.equal(response.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
  assert.equal(env.assetResponses[0].bodyUsed, false);
  const body = await response.text();
  assert.match(body, /<html>/);
  assert.match(body, /<title>Cakes N More in Sector 76 Noida \| 100% Eggless Cakes, Flowers &amp; Gifts<\/title>/);
  assert.match(body, new RegExp(`<meta name="description" content="${INITIAL_SETTINGS.metaDescription}" \\/>`));
  assert.match(body, /<h1[^>]*>\s*Cakes N More \| 100% Eggless Cakes/);
});

test('GET /cart is excluded from search indexing in the server response', async () => {
  const { response } = await request('/cart');
  const body = await response.text();
  assert.match(body, /<meta name="robots" content="noindex,nofollow" \/>/);
  assert.match(body, /<link rel="canonical" href="https:\/\/cakesnmorenoida\.in\/cart" \/>/);
});

test('unknown routes return 404 and do not inherit indexable homepage metadata', async () => {
  const { response } = await request('/unknown-route');
  assert.equal(response.status, 404);
  const body = await response.text();
  assert.match(body, /<title>Page Not Found \| Cakes N More Sector 76 Noida<\/title>/);
  assert.match(body, /<meta name="robots" content="noindex,nofollow" \/>/);
  assert.match(body, /<h1[^>]*>Page Not Found<\/h1>/);
});

test('GET /shop returns SSR SEO HTML and drops stale entity/body headers', async () => {
  const { response, env } = await request('/shop');
  assert.equal(response.status, 200);
  const body = await response.text();
  assert.match(body, /<title>Online Bakery &amp; Florist in Sector 76 Noida \| Cakes N More<\/title>/);
  assert.match(body, /<link rel="canonical" href="https:\/\/cakesnmorenoida\.in\/shop" \/>/);
  assert.equal(response.headers.has('content-length'), false);
  assert.equal(response.headers.has('content-encoding'), false);
  assert.equal(response.headers.has('etag'), false);
  assert.equal(env.assetResponses[0].bodyUsed, false);
});

test('GET /category/cakes returns category SEO and CollectionPage JSON-LD', async () => {
  const { response } = await request('/category/cakes');
  assert.equal(response.status, 200);
  const body = await response.text();
  assert.match(body, /<link rel="canonical" href="https:\/\/cakesnmorenoida\.in\/category\/cakes" \/>/);
  assert.ok(jsonLdFrom(body)['@graph'].some((entry) => entry['@type'] === 'CollectionPage'));
});

test('a product page returns Product JSON-LD without reusing the source body', async () => {
  const product = INITIAL_PRODUCTS[0];
  const { response, env } = await request(`/product/${encodeURIComponent(product.slug)}`);
  assert.equal(response.status, 200);
  const body = await response.text();
  assert.match(body, new RegExp(`<link rel="canonical" href="https://cakesnmorenoida\\.in/product/${product.slug}" \\/>`));
  const graph = jsonLdFrom(body)['@graph'];
  const productSchema = graph.find((entry) => entry['@type'] === 'Product');
  assert.ok(productSchema);
  assert.equal(productSchema.name, product.name);
  assert.equal(productSchema.offers.priceCurrency, 'INR');
  assert.equal(productSchema.offers.shippingDetails, undefined);
  assert.equal(productSchema.offers.hasMerchantReturnPolicy, undefined);
  assert.equal(productSchema.offers.priceValidUntil, undefined);
  assert.equal(env.assetResponses[0].bodyUsed, false);
});

test('product descriptions cannot break out of the server-rendered JSON-LD script', async () => {
  const maliciousDescription = 'Rich cake</script><script>globalThis.pwned=true</script>';
  const product = { ...INITIAL_PRODUCTS[0], description: maliciousDescription };
  const env = createEnv({
    database: {
      prepare() {
        return {
          bind() { return this; },
          async first() { return product; },
          async all() { return { results: [] }; },
          async run() { return { success: true }; },
        };
      },
    },
  });
  const { response } = await request(`/product/${encodeURIComponent(product.slug)}`, env);
  const body = await response.text();
  const graph = jsonLdFrom(body)['@graph'];
  const productSchema = graph.find((entry) => entry['@type'] === 'Product');

  assert.equal(productSchema.description, maliciousDescription);
  assert.doesNotMatch(body, /<\/script><script>globalThis\.pwned=true<\/script>/);
  assert.match(body, /Rich cake\\u003c\/script>\\u003cscript>/);
});

test('non-cake product metadata does not claim the product is an eggless cake', async () => {
  const product = INITIAL_PRODUCTS.find((item) => item.categoryId !== 'cat-cakes');
  assert.ok(product);
  const { response } = await request(`/product/${encodeURIComponent(product.slug)}`);
  const body = await response.text();
  assert.match(body, new RegExp(`<title>${product.name} \\| Cakes N More, Sector 76 Noida<\\/title>`));
  const keywords = body.match(/<meta name="keywords" content="([^"]*)" \/>/);
  assert.ok(keywords);
  assert.doesNotMatch(keywords[1], /eggless/i);
});

test('robots policy applies the private-path exclusions to all crawlers', async () => {
  const { response } = await request('/robots.txt');
  const body = await response.text();
  assert.match(body, /User-agent: \*\s+Allow: \/\s+Disallow: \/admin\/\s+Disallow: \/api\//);
  assert.doesNotMatch(body, /User-agent: Googlebot/i);
});

test('GET /api/auth/me returns an empty user for a guest session without an auth error', async () => {
  const { response } = await request('/api/auth/me');
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { user: null });
});

test('product writes require an authenticated admin', async () => {
  const product = { ...INITIAL_PRODUCTS[0] };
  const { response } = await request('/api/products', createEnv(), {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(product),
  });
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: 'Unauthorized' });
});

test('product writes use an atomic upsert and persist optional nulls', async () => {
  let capturedQuery = '';
  let capturedValues = [];
  const env = createEnv({
    database: {
      prepare(query) {
        return {
          bind(...values) { capturedValues = values; return this; },
          async first() { return { id: 'existing-product' }; },
          async all() { return { results: [] }; },
          async run() { capturedQuery = query; return { success: true }; },
        };
      },
    },
  });
  const product = {
    ...INITIAL_PRODUCTS[0],
    id: 'existing-product',
    price: 1234,
    description: 'Updated product description',
    categoryId: 'cat-cakes',
    available: false,
    images: ['https://example.com/product.webp'],
    oldPrice: undefined,
    weightOptions: undefined,
    weightPrices: undefined,
    selectedWeight: undefined,
    allowFlavourSelection: false,
    allowCustomMessage: undefined,
    customMessagePlaceholder: undefined,
  };
  const { response } = await request('/api/products', env, {
    method: 'PUT',
    headers: { 'content-type': 'application/json', cookie: adminCookie(env) },
    body: JSON.stringify(product),
  });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.match(capturedQuery, /ON CONFLICT\(id\) DO UPDATE/);
  assert.doesNotMatch(capturedQuery, /INSERT OR REPLACE/);
  assert.equal(capturedValues[0], 'existing-product');
  assert.equal(capturedValues[3], 'Updated product description');
  assert.equal(capturedValues[4], 1234);
  assert.equal(capturedValues[5], null);
  assert.equal(capturedValues[6], 'cat-cakes');
  assert.equal(capturedValues[9], JSON.stringify(['https://example.com/product.webp']));
  assert.equal(capturedValues[12], 0);
  assert.equal(capturedValues[14], null);
  assert.equal(capturedValues[15], null);
  assert.equal(capturedValues[17], null);
  assert.equal(capturedValues[18], null);
});

test('product validation errors return 422 without executing a write', async () => {
  let writeExecuted = false;
  const env = createEnv({
    database: {
      prepare(query) {
        return {
          bind() { return this; },
          async first() { return { id: 'existing-product' }; },
          async all() { return { results: [] }; },
          async run() { if (query.startsWith('INSERT INTO products')) writeExecuted = true; return { success: true }; },
        };
      },
    },
  });
  const { response } = await request('/api/products', env, {
    method: 'PUT',
    headers: { 'content-type': 'application/json', cookie: adminCookie(env) },
    body: JSON.stringify({ ...INITIAL_PRODUCTS[0], price: 'not-a-number' }),
  });

  assert.equal(response.status, 422);
  assert.equal(writeExecuted, false);
});

test('product database errors are logged and return a safe migration diagnostic', async () => {
  const env = createEnv({
    database: {
      prepare(query) {
        return {
          bind() { return this; },
          async first() { return { id: 'existing-product' }; },
          async all() { return { results: [] }; },
          async run() {
            if (query.startsWith('INSERT INTO products')) {
              throw new Error('D1_ERROR: table products has no column named allow_flavour_selection: SQLITE_ERROR');
            }
            return { success: true };
          },
        };
      },
    },
  });
  const loggedErrors = [];
  const originalConsoleError = console.error;
  console.error = (...args) => loggedErrors.push(args);
  try {
    const { response } = await request('/api/products', env, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', cookie: adminCookie(env) },
      body: JSON.stringify({ ...INITIAL_PRODUCTS[0], id: 'existing-product' }),
    });
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), {
      error: 'Product storage needs a database migration. Please contact the administrator.',
    });
    assert.match(String(loggedErrors[0]?.[2]), /no column named allow_flavour_selection/);
  } finally {
    console.error = originalConsoleError;
  }
});

test('GET /api/products returns valid JSON and propagates database failures as errors', async () => {
  const { response } = await request('/api/products');
  assert.equal(response.status, 200);
  assert.ok(Array.isArray(await response.json()));

  const failedEnv = createEnv({
    database: {
      prepare() {
        return {
          async first() { return { id: 'existing-product' }; },
          async all() { throw new Error('database unavailable'); },
          bind() { return this; },
        };
      },
    },
  });
  const failedResponse = await worker.fetch(
    new Request('https://cakesnmorenoida.in/api/products'),
    failedEnv
  );
  assert.equal(failedResponse.status, 500);
  assert.deepEqual(await failedResponse.json(), { error: 'Internal server error' });
});

test('static asset requests continue to use the asset binding', async () => {
  const { response } = await request('/assets/site.css');
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'text/css; charset=utf-8');
  assert.equal(await response.text(), 'body { color: red; }');
});
