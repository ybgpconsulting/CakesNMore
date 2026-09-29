/// <reference types="@cloudflare/workers-types" />

import {
  INITIAL_CATEGORIES,
  INITIAL_DELIVERY_SETTINGS,
  INITIAL_HOMEPAGE_CONFIG,
  INITIAL_PRODUCTS,
  INITIAL_SETTINGS,
} from '../src/data/initialData';
import { Category, DeliverySettings, HomepageConfig, Product, StoreSettings } from '../src/types';

interface Env {
  DB: D1Database;
  MEDIA: R2Bucket;
  ASSETS: Fetcher;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD_HASH: string;
  SESSION_SECRET: string;
  CORS_ORIGIN?: string;
}

type JsonObject = Record<string, unknown>;
const PRODUCTION_ORIGIN = 'https://cakesnmorenoida.in';
const COOKIE_NAME = 'fnp_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 12;
const MAX_JSON_BYTES = 128 * 1024;
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const LOGIN_WINDOW_SECONDS = 15 * 60;
const LOGIN_MAX_FAILURES = 5;
const MEDIA_KEY_PATTERN = /^(products|categories|homepage)\/[0-9a-f-]{36}-[A-Za-z0-9._-]{1,100}\.(?:jpg|jpeg|png|webp|avif)$/i;

function json(data: unknown, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
  });
}

function error(message: string, status = 400): Response {
  return json({ error: message }, status);
}

function xmlEscape(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function sitemapUrl(path: string, lastmod?: string): string {
  const lastmodXml = lastmod ? `\n    <lastmod>${xmlEscape(lastmod)}</lastmod>` : '';
  return `  <url>\n    <loc>${xmlEscape(`${PRODUCTION_ORIGIN}${path}`)}</loc>${lastmodXml}\n  </url>`;
}

async function buildSitemap(env: Env): Promise<Response> {
  await seedIfEmpty(env);
  const [categories, products, homepageSetting, storeSetting] = await Promise.all([
    env.DB.prepare('SELECT slug FROM categories WHERE active = 1 ORDER BY display_order ASC, name ASC').all<{ slug: string }>(),
    env.DB.prepare('SELECT slug, updated_at FROM products WHERE available = 1 ORDER BY display_order ASC, name ASC').all<{ slug: string; updated_at: string }>(),
    env.DB.prepare('SELECT updated_at FROM settings WHERE key = ?').bind('homepage').first<{ updated_at: string }>(),
    env.DB.prepare('SELECT updated_at FROM settings WHERE key = ?').bind('store').first<{ updated_at: string }>(),
  ]);
  const productLastmod = products.results.map((product) => product.updated_at).filter(Boolean).sort().at(-1);
  const urls = [
    sitemapUrl('/', homepageSetting?.updated_at || storeSetting?.updated_at),
    sitemapUrl('/shop', productLastmod),
    ...categories.results.map((category) => sitemapUrl(`/category/${encodeURIComponent(category.slug)}`)),
    ...products.results.map((product) => sitemapUrl(`/product/${encodeURIComponent(product.slug)}`, product.updated_at)),
    sitemapUrl('/about'),
    sitemapUrl('/contact'),
    sitemapUrl('/privacy-policy'),
    sitemapUrl('/terms-and-conditions'),
    sitemapUrl('/shipping-and-delivery'),
    sitemapUrl('/returns-policy'),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
  return new Response(body, { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=300' } });
}

function robotsResponse(): Response {
  return new Response('User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /admin/*\n\nSitemap: https://cakesnmorenoida.in/sitemap.xml\n', {
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600' },
  });
}

function asBoolean(value: unknown): boolean {
  return value === true || value === 1;
}

function isRecord(value: unknown): value is JsonObject { return typeof value === 'object' && value !== null && !Array.isArray(value); }
function hasOnlyKeys(value: JsonObject, keys: string[]): boolean { return Object.keys(value).every((key) => keys.includes(key)); }
function text(value: unknown, max: number, required = true): string | undefined { return typeof value === 'string' && value.trim().length <= max && (!required || value.trim().length > 0) ? value.trim() : undefined; }
function numberValue(value: unknown, min: number, max: number): number | undefined { return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max ? value : undefined; }
function booleanValue(value: unknown): boolean | undefined { return typeof value === 'boolean' ? value : undefined; }
function urlValue(value: unknown, required = false): string | undefined { if (typeof value !== 'string' || value.length > 2048 || (!required && value === '')) return required ? undefined : ''; try { const parsed = new URL(value); return ['http:', 'https:'].includes(parsed.protocol) ? value : undefined; } catch { return undefined; } }
function stringArray(value: unknown, maxItems: number, maxLength: number): string[] | undefined { return Array.isArray(value) && value.length <= maxItems && value.every((item) => typeof item === 'string' && item.length <= maxLength) ? value : undefined; }
function validDate(value: unknown): boolean { return typeof value === 'string' && !Number.isNaN(Date.parse(value)); }
function imageReference(value: unknown): string | undefined { if (typeof value !== 'string' || value.length > 2048) return undefined; if (value.startsWith('/media/')) return mediaKey(decodeURIComponent(value.slice(7))) ? value : undefined; return urlValue(value, true); }

function validateProduct(value: unknown): Product | null {
  if (!isRecord(value) || !hasOnlyKeys(value, ['id', 'name', 'slug', 'description', 'price', 'oldPrice', 'categoryId', 'categoryName', 'categorySlug', 'images', 'featured', 'bestseller', 'available', 'displayOrder', 'weightOptions', 'selectedWeight', 'allowCustomMessage', 'customMessagePlaceholder', 'createdAt', 'updatedAt'])) return null;
  const item = value;
  const id = text(item.id, 120); const name = text(item.name, 160); const slug = text(item.slug, 160); const description = text(item.description, 5000, false); const categoryId = text(item.categoryId, 120); const images = stringArray(item.images, 20, 2048);
  const price = numberValue(item.price, 0, 10000000); const oldPrice = item.oldPrice === undefined ? undefined : numberValue(item.oldPrice, 0, 10000000);
  const featured = booleanValue(item.featured); const bestseller = booleanValue(item.bestseller); const available = booleanValue(item.available); const displayOrder = numberValue(item.displayOrder, 0, 1000000);
  if (!id || !name || !slug || description === undefined || !categoryId || !images || images.some((image) => !imageReference(image)) || price === undefined || (item.oldPrice !== undefined && oldPrice === undefined) || featured === undefined || bestseller === undefined || available === undefined || displayOrder === undefined || !validDate(item.createdAt) || !validDate(item.updatedAt)) return null;
  const categoryName = item.categoryName === undefined ? undefined : text(item.categoryName, 160, false); const categorySlug = item.categorySlug === undefined ? undefined : text(item.categorySlug, 160, false);
  const weightOptions = item.weightOptions === undefined ? undefined : stringArray(item.weightOptions, 20, 80); const selectedWeight = item.selectedWeight === undefined ? undefined : text(item.selectedWeight, 80, false); const allowCustomMessage = item.allowCustomMessage === undefined ? undefined : booleanValue(item.allowCustomMessage); const customMessagePlaceholder = item.customMessagePlaceholder === undefined ? undefined : text(item.customMessagePlaceholder, 300, false);
  if ((item.categoryName !== undefined && categoryName === undefined) || (item.categorySlug !== undefined && categorySlug === undefined) || (item.weightOptions !== undefined && !weightOptions) || (item.selectedWeight !== undefined && selectedWeight === undefined) || (item.allowCustomMessage !== undefined && allowCustomMessage === undefined) || (item.customMessagePlaceholder !== undefined && customMessagePlaceholder === undefined)) return null;
  return { id, name, slug, description, price, oldPrice, categoryId, categoryName, categorySlug, images, featured, bestseller, available, displayOrder, weightOptions, selectedWeight, allowCustomMessage, customMessagePlaceholder, createdAt: String(item.createdAt), updatedAt: String(item.updatedAt) };
}

function validateCategory(value: unknown): Category | null {
  if (!isRecord(value) || !hasOnlyKeys(value, ['id', 'name', 'slug', 'description', 'image', 'active', 'displayOrder'])) return null;
  const id = text(value.id, 120); const name = text(value.name, 160); const slug = text(value.slug, 160); const description = text(value.description, 2000, false); const image = imageReference(value.image); const active = booleanValue(value.active); const displayOrder = numberValue(value.displayOrder, 0, 1000000);
  return id && name && slug && description !== undefined && image && active !== undefined && displayOrder !== undefined ? { id, name, slug, description, image, active, displayOrder } : null;
}

const STORE_KEYS = ['businessName', 'phone', 'whatsappNumber', 'email', 'address', 'mapsUrl', 'instagramUrl', 'facebookUrl', 'twitterUrl', 'zomatoUrl', 'swiggyUrl', 'magicpinUrl', 'openingHours', 'whatsappMessage', 'websiteTitle', 'metaDescription', 'logo', 'bannerAnnouncement'];
function validateStore(value: unknown): StoreSettings | null {
  if (!isRecord(value) || !hasOnlyKeys(value, STORE_KEYS)) return null;
  const strings: Record<string, string | undefined> = {}; for (const key of STORE_KEYS) strings[key] = text(value[key], key === 'whatsappMessage' ? 5000 : 2000, ['zomatoUrl', 'swiggyUrl', 'magicpinUrl', 'logo'].includes(key) ? false : true);
  const urls = ['mapsUrl', 'instagramUrl', 'facebookUrl', 'twitterUrl', 'zomatoUrl', 'swiggyUrl', 'magicpinUrl', 'logo']; if (urls.some((key) => strings[key] && !urlValue(strings[key], key === 'mapsUrl'))) return null;
  if (!strings.businessName || !strings.phone || !strings.whatsappNumber || !/^\d{10,15}$/.test(strings.whatsappNumber.replace(/\D/g, '')) || !strings.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(strings.email) || !strings.address || !strings.mapsUrl || !strings.openingHours || !strings.whatsappMessage || !strings.websiteTitle || !strings.metaDescription || !strings.bannerAnnouncement) return null;
  return strings as unknown as StoreSettings;
}

function validateHomepage(value: unknown): HomepageConfig | null {
  if (!isRecord(value) || !hasOnlyKeys(value, ['heroTitle', 'heroSubtitle', 'heroImage', 'heroCtaText', 'heroCtaLink', 'promoBannerActive', 'promoBannerText', 'whyUsPoints', 'footerNote']) || !Array.isArray(value.whyUsPoints) || value.whyUsPoints.length > 20) return null;
  const strings = ['heroTitle', 'heroSubtitle', 'heroImage', 'heroCtaText', 'heroCtaLink', 'promoBannerText', 'footerNote']; const result: Record<string, unknown> = {}; for (const key of strings) result[key] = text(value[key], key === 'heroSubtitle' ? 2000 : 500);
  const points = value.whyUsPoints.map((point) => isRecord(point) && hasOnlyKeys(point, ['title', 'description', 'icon']) && text(point.title, 200) && text(point.description, 1000) && text(point.icon, 100) ? { title: point.title as string, description: point.description as string, icon: point.icon as string } : null);
  const ctaLink = typeof result.heroCtaLink === 'string' && (result.heroCtaLink.startsWith('/') && !result.heroCtaLink.startsWith('//') || !!urlValue(result.heroCtaLink, true));
  if (strings.some((key) => !result[key]) || !imageReference(result.heroImage) || !ctaLink || booleanValue(value.promoBannerActive) === undefined || points.some((point) => !point)) return null;
  return { ...result, promoBannerActive: value.promoBannerActive, whyUsPoints: points as HomepageConfig['whyUsPoints'] } as HomepageConfig;
}

function validateDelivery(value: unknown): DeliverySettings | null {
  if (!isRecord(value) || !hasOnlyKeys(value, ['enabled', 'radiusKm', 'storeName', 'storeLatitude', 'storeLongitude', 'deliveryMessage', 'minOrderValue', 'deliveryCharge', 'freeDeliveryThreshold', 'allowedPincodes', 'specialDeliveryAreas'])) return null;
  const enabled = booleanValue(value.enabled); const radiusKm = numberValue(value.radiusKm, 0, 500); const storeName = text(value.storeName, 200); const latitude = numberValue(value.storeLatitude, -90, 90); const longitude = numberValue(value.storeLongitude, -180, 180); const message = text(value.deliveryMessage, 2000); const optionalNumbers = ['minOrderValue', 'deliveryCharge', 'freeDeliveryThreshold'];
  if (enabled === undefined || radiusKm === undefined || !storeName || latitude === undefined || longitude === undefined || !message || optionalNumbers.some((key) => value[key] !== undefined && numberValue(value[key], 0, 10000000) === undefined) || (value.allowedPincodes !== undefined && !stringArray(value.allowedPincodes, 1000, 20)) || (value.specialDeliveryAreas !== undefined && !stringArray(value.specialDeliveryAreas, 1000, 200))) return null;
  return { enabled, radiusKm, storeName, storeLatitude: latitude, storeLongitude: longitude, deliveryMessage: message, minOrderValue: value.minOrderValue as number | undefined, deliveryCharge: value.deliveryCharge as number | undefined, freeDeliveryThreshold: value.freeDeliveryThreshold as number | undefined, allowedPincodes: value.allowedPincodes as string[] | undefined, specialDeliveryAreas: value.specialDeliveryAreas as string[] | undefined };
}

function mediaKey(value: unknown): string | null { return typeof value === 'string' && value.length <= 180 && MEDIA_KEY_PATTERN.test(value) ? value : null; }

async function detectImageType(file: File): Promise<'image/jpeg' | 'image/png' | 'image/webp' | 'image/avif' | null> {
  const bytes = new Uint8Array(await file.slice(0, 32).arrayBuffer());
  const ascii = (start: number, length: number) => String.fromCharCode(...bytes.slice(start, start + length));
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes.length >= 8 && bytes[0] === 0x89 && ascii(1, 3) === 'PNG' && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) return 'image/png';
  if (bytes.length >= 12 && ascii(0, 4) === 'RIFF' && ascii(8, 4) === 'WEBP') return 'image/webp';
  if (bytes.length >= 12 && ascii(4, 4) === 'ftyp' && ['avif', 'avis'].includes(ascii(8, 4))) return 'image/avif';
  return null;
}

function productFromRow(row: Record<string, unknown>): Product {
  return {
    id: String(row.id), name: String(row.name), slug: String(row.slug), description: String(row.description || ''),
    price: Number(row.price), oldPrice: row.old_price == null ? undefined : Number(row.old_price),
    categoryId: String(row.category_id), categoryName: row.category_name ? String(row.category_name) : undefined,
    categorySlug: row.category_slug ? String(row.category_slug) : undefined,
    images: JSON.parse(String(row.images_json || '[]')), featured: asBoolean(row.featured),
    bestseller: asBoolean(row.bestseller), available: asBoolean(row.available), displayOrder: Number(row.display_order),
    weightOptions: row.weight_options_json ? JSON.parse(String(row.weight_options_json)) : undefined,
    selectedWeight: row.selected_weight ? String(row.selected_weight) : undefined,
    allowCustomMessage: row.allow_custom_message == null ? undefined : asBoolean(row.allow_custom_message),
    customMessagePlaceholder: row.custom_message_placeholder ? String(row.custom_message_placeholder) : undefined,
    createdAt: String(row.created_at), updatedAt: String(row.updated_at),
  };
}

function categoryFromRow(row: Record<string, unknown>): Category {
  return { id: String(row.id), name: String(row.name), slug: String(row.slug), description: String(row.description || ''), image: String(row.image || ''), active: asBoolean(row.active), displayOrder: Number(row.display_order) };
}

async function seedIfEmpty(env: Env): Promise<void> {
  const existing = await env.DB.prepare('SELECT id FROM products LIMIT 1').first();
  if (existing) return;
  const now = new Date().toISOString();
  const statements = [
    ...INITIAL_CATEGORIES.map((item) => env.DB.prepare('INSERT OR IGNORE INTO categories (id,name,slug,description,image,active,display_order) VALUES (?,?,?,?,?,?,?)').bind(item.id, item.name, item.slug, item.description, item.image, item.active ? 1 : 0, item.displayOrder)),
    ...INITIAL_PRODUCTS.map((item) => env.DB.prepare('INSERT OR IGNORE INTO products (id,name,slug,description,price,old_price,category_id,category_name,category_slug,images_json,featured,bestseller,available,display_order,weight_options_json,selected_weight,allow_custom_message,custom_message_placeholder,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(item.id, item.name, item.slug, item.description, item.price, item.oldPrice ?? null, item.categoryId, item.categoryName ?? null, item.categorySlug ?? null, JSON.stringify(item.images), item.featured ? 1 : 0, item.bestseller ? 1 : 0, item.available ? 1 : 0, item.displayOrder, item.weightOptions ? JSON.stringify(item.weightOptions) : null, item.selectedWeight ?? null, item.allowCustomMessage == null ? null : item.allowCustomMessage ? 1 : 0, item.customMessagePlaceholder ?? null, item.createdAt || now, item.updatedAt || now)),
    env.DB.prepare('INSERT OR IGNORE INTO settings (key,value_json,updated_at) VALUES (?,?,?)').bind('store', JSON.stringify(INITIAL_SETTINGS), now),
    env.DB.prepare('INSERT OR IGNORE INTO settings (key,value_json,updated_at) VALUES (?,?,?)').bind('delivery', JSON.stringify(INITIAL_DELIVERY_SETTINGS), now),
    env.DB.prepare('INSERT OR IGNORE INTO settings (key,value_json,updated_at) VALUES (?,?,?)').bind('homepage', JSON.stringify(INITIAL_HOMEPAGE_CONFIG), now),
  ];
  await env.DB.batch(statements);
}

async function setting<T>(env: Env, key: string, fallback: T): Promise<T> {
  const row = await env.DB.prepare('SELECT value_json FROM settings WHERE key = ?').bind(key).first<{ value_json: string }>();
  return row ? JSON.parse(row.value_json) as T : fallback;
}

function base64Url(bytes: ArrayBuffer | Uint8Array): string {
  const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = ''; data.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4);
  const binary = atob(padded); return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function hmac(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return base64Url(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value)));
}

async function createSession(env: Env, email: string): Promise<string> {
  const payload = base64Url(new TextEncoder().encode(JSON.stringify({ email, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS })));
  return `${payload}.${await hmac(payload, env.SESSION_SECRET)}`;
}

async function isAdmin(request: Request, env: Env): Promise<boolean> {
  const cookie = request.headers.get('Cookie')?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE_NAME}=`));
  if (!cookie || !env.SESSION_SECRET) return false;
  const token = cookie.slice(COOKIE_NAME.length + 1).split('.');
  if (token.length !== 2 || (await hmac(token[0], env.SESSION_SECRET)).replace(/=+$/, '') !== token[1].replace(/=+$/, '')) return false;
  try {
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(token[0])));
    return payload.email === env.ADMIN_EMAIL.toLowerCase() && payload.exp > Math.floor(Date.now() / 1000);
  } catch { return false; }
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algorithm, iterationsText, saltText, hashText] = stored.split('$');
  if (algorithm !== 'pbkdf2_sha256' || !iterationsText || !saltText || !hashText) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const salt = new Uint8Array(fromBase64Url(saltText));
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: Number(iterationsText), hash: 'SHA-256' }, key, 256);
  const actual = base64Url(bits);
  return actual === hashText;
}

function sessionCookie(value: string, maxAge = SESSION_TTL_SECONDS): string {
  return `${COOKIE_NAME}=${value}; Path=/; Max-Age=${maxAge}; Expires=${new Date(Date.now() + maxAge * 1000).toUTCString()}; HttpOnly; Secure; SameSite=None`;
}

function allowedOrigin(request: Request, env: Env): string | null {
  const origin = request.headers.get('Origin');
  if (!origin || !env.CORS_ORIGIN) return null;
  const configuredOrigins = env.CORS_ORIGIN.split(',').map((value) => value.trim()).filter(Boolean);
  return configuredOrigins.includes(origin) ? origin : null;
}

function withCors(response: Response, request: Request, env: Env): Response {
  const origin = allowedOrigin(request, env);
  if (!origin) return response;
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Access-Control-Allow-Credentials', 'true');
  headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
  headers.append('Vary', 'Origin');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

async function readJson<T>(request: Request): Promise<T> {
  const length = Number(request.headers.get('content-length') || 0);
  if (length > MAX_JSON_BYTES) throw new Error('Payload too large.');
  return await request.json<T>();
}

function requestRateKeys(request: Request, email: string): string[] {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  return [`ip:${ip}`.slice(0, 300), `account:${email.toLowerCase().trim()}`.slice(0, 350)];
}

async function isLoginBlocked(env: Env, key: string): Promise<boolean> {
  const row = await env.DB.prepare('SELECT window_started_at, failures FROM login_rate_limits WHERE key = ?').bind(key).first<{ window_started_at: number; failures: number }>();
  if (!row) return false;
  const now = Math.floor(Date.now() / 1000);
  if (now - row.window_started_at >= LOGIN_WINDOW_SECONDS) { await env.DB.prepare('DELETE FROM login_rate_limits WHERE key = ?').bind(key).run(); return false; }
  return row.failures >= LOGIN_MAX_FAILURES;
}

async function recordLoginFailure(env: Env, key: string): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  await env.DB.prepare('INSERT INTO login_rate_limits (key, window_started_at, failures) VALUES (?, ?, 1) ON CONFLICT(key) DO UPDATE SET failures = failures + 1').bind(key, now).run();
}

async function clearLoginFailures(env: Env, key: string): Promise<void> { await env.DB.prepare('DELETE FROM login_rate_limits WHERE key = ?').bind(key).run(); }

async function handleApi(request: Request, env: Env, url: URL): Promise<Response> {
  const path = url.pathname.replace(/^\/api\/?/, '');
  const method = request.method;

  if (path === 'auth/login' && method === 'POST') {
    let body: { email?: string; password?: string };
    try { body = await readJson(request); } catch { return error('Invalid login request.', 400); }
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const keys = requestRateKeys(request, email);
    if (await isLoginBlocked(env, keys[0]) || await isLoginBlocked(env, keys[1])) return error('Too many unsuccessful login attempts. Please try again later.', 429);
    if (!email || email.length > 320 || !body.password || body.password.length > 1024 || email !== env.ADMIN_EMAIL.toLowerCase() || !(await verifyPassword(body.password, env.ADMIN_PASSWORD_HASH))) { await Promise.all(keys.map((key) => recordLoginFailure(env, key))); return error('Invalid email or password.', 401); }
    await Promise.all(keys.map((key) => clearLoginFailures(env, key)));
    const session = await createSession(env, env.ADMIN_EMAIL.toLowerCase());
    return json({ user: { uid: 'cloudflare-admin', email: env.ADMIN_EMAIL, displayName: 'Store Admin', isAdmin: true } }, 200, { 'set-cookie': sessionCookie(session), 'cache-control': 'no-store' });
  }
  if (path === 'auth/logout' && method === 'POST') return json({ ok: true }, 200, { 'set-cookie': sessionCookie('', 0) });
  if (path === 'auth/me' && method === 'GET') return (await isAdmin(request, env)) ? json({ user: { uid: 'cloudflare-admin', email: env.ADMIN_EMAIL, displayName: 'Store Admin', isAdmin: true } }) : error('Unauthorized', 401);

  if (path === 'products' && method === 'GET') {
    const rows = await env.DB.prepare('SELECT * FROM products ORDER BY display_order ASC, name ASC').all();
    return json(rows.results.length ? rows.results.map(productFromRow) : INITIAL_PRODUCTS);
  }
  if (path.startsWith('products/') && method === 'GET') {
    const row = await env.DB.prepare('SELECT * FROM products WHERE slug = ?').bind(decodeURIComponent(path.slice(9))).first<Record<string, unknown>>();
    return row ? json(productFromRow(row)) : (INITIAL_PRODUCTS.find((product) => product.slug === decodeURIComponent(path.slice(9))) ? json(INITIAL_PRODUCTS.find((product) => product.slug === decodeURIComponent(path.slice(9)))) : error('Product not found', 404));
  }
  if (path === 'categories' && method === 'GET') {
    const rows = await env.DB.prepare('SELECT * FROM categories ORDER BY display_order ASC, name ASC').all();
    return json(rows.results.length ? rows.results.map(categoryFromRow) : INITIAL_CATEGORIES);
  }
  if (path === 'settings/store' && method === 'GET') return json(await setting(env, 'store', INITIAL_SETTINGS));
  if (path === 'settings/delivery' && method === 'GET') return json(await setting(env, 'delivery', INITIAL_DELIVERY_SETTINGS));
  if (path === 'homepage/config' && method === 'GET') return json(await setting(env, 'homepage', INITIAL_HOMEPAGE_CONFIG));

  if (!(await isAdmin(request, env))) return error('Unauthorized', 401);
  let body: JsonObject | null = null;
  if (method !== 'DELETE') { try { body = await readJson<JsonObject>(request); } catch { return error('Invalid or oversized JSON payload.', 400); } }
  const now = new Date().toISOString();

  if (path === 'products' && method === 'PUT' && body) {
    const item = validateProduct(body);
    if (!item) return error('Invalid product payload.', 422);
    await env.DB.prepare('INSERT OR REPLACE INTO products (id,name,slug,description,price,old_price,category_id,category_name,category_slug,images_json,featured,bestseller,available,display_order,weight_options_json,selected_weight,allow_custom_message,custom_message_placeholder,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(item.id, item.name, item.slug, item.description, item.price, item.oldPrice ?? null, item.categoryId, item.categoryName ?? null, item.categorySlug ?? null, JSON.stringify(item.images), item.featured ? 1 : 0, item.bestseller ? 1 : 0, item.available ? 1 : 0, item.displayOrder, item.weightOptions ? JSON.stringify(item.weightOptions) : null, item.selectedWeight ?? null, item.allowCustomMessage == null ? null : item.allowCustomMessage ? 1 : 0, item.customMessagePlaceholder ?? null, item.createdAt || now, now).run();
    return json({ ok: true });
  }
  if (path.startsWith('products/') && method === 'DELETE') { await env.DB.prepare('DELETE FROM products WHERE id = ?').bind(path.slice(9)).run(); return json({ ok: true }); }
  if (path === 'categories' && method === 'PUT' && body) {
    const item = validateCategory(body);
    if (!item) return error('Invalid category payload.', 422);
    await env.DB.prepare('INSERT OR REPLACE INTO categories (id,name,slug,description,image,active,display_order) VALUES (?,?,?,?,?,?,?)').bind(item.id, item.name, item.slug, item.description, item.image, item.active ? 1 : 0, item.displayOrder).run();
    return json({ ok: true });
  }
  if (path.startsWith('categories/') && method === 'DELETE') { await env.DB.prepare('DELETE FROM categories WHERE id = ?').bind(path.slice(11)).run(); return json({ ok: true }); }
  if (path === 'settings/store' && method === 'PUT' && body) { const item = validateStore(body); return item ? saveSetting(env, 'store', item) : error('Invalid store settings payload.', 422); }
  if (path === 'settings/delivery' && method === 'PUT' && body) { const item = validateDelivery(body); return item ? saveSetting(env, 'delivery', item) : error('Invalid delivery settings payload.', 422); }
  if (path === 'homepage/config' && method === 'PUT' && body) { const item = validateHomepage(body); return item ? saveSetting(env, 'homepage', item) : error('Invalid homepage payload.', 422); }
  return error('Not found', 404);
}

async function saveSetting(env: Env, key: string, value: unknown): Promise<Response> {
  await env.DB.prepare('INSERT OR REPLACE INTO settings (key,value_json,updated_at) VALUES (?,?,?)').bind(key, JSON.stringify(value), new Date().toISOString()).run();
  return json({ ok: true });
}

async function handleMedia(request: Request, env: Env, url: URL): Promise<Response> {
  if (url.pathname.startsWith('/media/') && request.method === 'GET') {
    const key = mediaKey(decodeURIComponent(url.pathname.slice(7)));
    if (!key) return error('Invalid media key.', 400);
    const object = await env.MEDIA.get(key);
    return object ? new Response(object.body, { headers: { 'content-type': object.httpMetadata?.contentType || 'application/octet-stream', 'cache-control': 'public, max-age=31536000, immutable' } }) : error('Media not found', 404);
  }
  if (!(await isAdmin(request, env))) return error('Unauthorized', 401);
  if (url.pathname === '/api/media/upload' && request.method === 'POST') {
    const form = await request.formData(); const file = form.get('file'); const folder = String(form.get('folder') || 'products');
    if (!(file instanceof File)) return error('Image file is required.');
    if (!['products', 'categories', 'homepage'].includes(folder)) return error('Invalid media folder.', 422);
    if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) return error('Image must be between 1 byte and 10 MB.', 413);
    const detectedType = await detectImageType(file);
    const extension = file.name.toLowerCase().split('.').pop();
    const extensionType: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', avif: 'image/avif' };
    if (!detectedType || file.type !== detectedType || extensionType[extension || ''] !== detectedType) return error('Image MIME type and file content do not match.', 415);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-100); const key = `${folder}/${crypto.randomUUID()}-${safeName}`;
    await env.MEDIA.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: detectedType } });
    return json({ url: `${url.origin}/media/${key}`, key });
  }
  if (url.pathname === '/api/media' && request.method === 'DELETE') {
    let body: { key?: unknown }; try { body = await readJson(request); } catch { return error('Invalid media delete request.', 400); }
    const key = mediaKey(body.key); if (!key) return error('Invalid media key.', 422);
    await env.MEDIA.delete(key); return json({ ok: true });
  }
  return error('Not found', 404);
}

export default { async fetch(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  try {
    if (url.pathname === '/sitemap.xml' && request.method === 'GET') return await buildSitemap(env);
    if (url.pathname === '/robots.txt' && request.method === 'GET') return robotsResponse();
    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/media/')) {
      if (request.method === 'OPTIONS') return withCors(new Response(null, { status: 204 }), request, env);
      if (url.pathname.startsWith('/api/')) await seedIfEmpty(env);
      const response = url.pathname.startsWith('/media/') || url.pathname === '/api/media' || url.pathname === '/api/media/upload'
        ? await handleMedia(request, env, url)
        : await handleApi(request, env, url);
      return withCors(response, request, env);
    }
    return env.ASSETS.fetch(request);
  } catch (err) { console.error(err); return error('Internal server error', 500); }
} };
