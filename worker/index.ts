/// <reference types="@cloudflare/workers-types" />

import {
  INITIAL_CATEGORIES,
  INITIAL_DELIVERY_SETTINGS,
  INITIAL_HOMEPAGE_CONFIG,
  INITIAL_PRODUCTS,
  INITIAL_SETTINGS,
} from '../src/data/initialData';
import { Category, DeliverySettings, HomepageConfig, Product, StoreSettings, WeightPriceOption } from '../src/types';

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
const MAX_JSON_BYTES = 2 * 1024 * 1024;
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

function sitemapUrl(
  path: string,
  lastmod?: string,
  changefreq = 'weekly',
  priority = '0.8',
  images?: Array<{ loc: string; title?: string }>
): string {
  const lastmodXml = lastmod ? `\n    <lastmod>${xmlEscape(lastmod.slice(0, 10))}</lastmod>` : '';
  const imagesXml = (images || [])
    .filter((img) => img && img.loc)
    .map(
      (img) =>
        `\n    <image:image>\n      <image:loc>${xmlEscape(
          img.loc.startsWith('/') ? `${PRODUCTION_ORIGIN}${img.loc}` : img.loc
        )}</image:loc>${img.title ? `\n      <image:title>${xmlEscape(img.title)}</image:title>` : ''}\n    </image:image>`
    )
    .join('');
  return `  <url>\n    <loc>${xmlEscape(`${PRODUCTION_ORIGIN}${path}`)}</loc>${lastmodXml}\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>${imagesXml}\n  </url>`;
}

async function buildSitemap(env: Env): Promise<Response> {
  await seedIfEmpty(env);
  const [categories, products, homepageSetting, storeSetting] = await Promise.all([
    env.DB.prepare('SELECT slug, name, image FROM categories WHERE active = 1 ORDER BY display_order ASC, name ASC').all<{ slug: string; name: string; image?: string }>(),
    env.DB.prepare('SELECT slug, name, images_json, updated_at FROM products WHERE available = 1 ORDER BY display_order ASC, name ASC').all<{ slug: string; name: string; images_json?: string; updated_at: string }>(),
    env.DB.prepare('SELECT updated_at FROM settings WHERE key = ?').bind('homepage').first<{ updated_at: string }>(),
    env.DB.prepare('SELECT updated_at FROM settings WHERE key = ?').bind('store').first<{ updated_at: string }>(),
  ]);
  const productLastmod = products.results.map((product) => product.updated_at).filter(Boolean).sort().at(-1);
  const homeImage = [{ loc: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1200&auto=format&fit=crop', title: 'Cakes N More Sector 76 Noida' }];
  const urls = [
    sitemapUrl('/', homepageSetting?.updated_at || storeSetting?.updated_at, 'daily', '1.0', homeImage),
    sitemapUrl('/shop', productLastmod, 'daily', '0.9'),
    ...categories.results.map((category) => {
      const images = category.image ? [{ loc: category.image, title: `${category.name} Sector 76 Noida` }] : undefined;
      return sitemapUrl(`/category/${encodeURIComponent(category.slug)}`, undefined, 'weekly', '0.9', images);
    }),
    ...products.results.map((product) => {
      let productImages: Array<{ loc: string; title?: string }> = [];
      try {
        const parsed = JSON.parse(product.images_json || '[]');
        if (Array.isArray(parsed) && parsed.length > 0) {
          productImages = parsed.map((loc: string) => ({ loc, title: `${product.name} - Cakes N More Sector 76 Noida` }));
        }
      } catch {}
      return sitemapUrl(`/product/${encodeURIComponent(product.slug)}`, product.updated_at, 'weekly', '0.8', productImages);
    }),
    sitemapUrl('/about', undefined, 'monthly', '0.7'),
    sitemapUrl('/contact', undefined, 'monthly', '0.8'),
    sitemapUrl('/shipping-and-delivery', undefined, 'monthly', '0.6'),
    sitemapUrl('/returns-policy', undefined, 'monthly', '0.6'),
    sitemapUrl('/terms-and-conditions', undefined, 'monthly', '0.5'),
    sitemapUrl('/privacy-policy', undefined, 'monthly', '0.5'),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join('\n')}\n</urlset>\n`;
  return new Response(body, { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=300' } });
}

function robotsResponse(): Response {
  return new Response(
    `    User-agent: *
    Allow: /
    Disallow: /admin/
    Disallow: /api/

Sitemap: https://cakesnmorenoida.in/sitemap.xml
`,
    {
      headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600' },
    }
  );
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

function validateWeightPrices(val: unknown): WeightPriceOption[] | undefined {
  if (!Array.isArray(val) || val.length === 0 || val.length > 20) return undefined;
  const list: WeightPriceOption[] = [];
  for (const item of val) {
    if (!isRecord(item)) return undefined;
    const w = text(item.weight, 80);
    const p = numberValue(item.price, 0, 10000000);
    const op = item.oldPrice == null ? undefined : numberValue(item.oldPrice, 0, 10000000);
    if (!w || p === undefined || (item.oldPrice != null && op === undefined)) return undefined;
    list.push({ weight: w, price: p, oldPrice: op });
  }
  return list;
}

function validateProduct(value: unknown): Product | null {
  if (!isRecord(value) || !hasOnlyKeys(value, ['id', 'name', 'slug', 'description', 'price', 'oldPrice', 'sku', 'categoryId', 'categoryName', 'categorySlug', 'images', 'featured', 'bestseller', 'available', 'displayOrder', 'weightOptions', 'weightPrices', 'selectedWeight', 'allowFlavourSelection', 'allowCustomMessage', 'customMessagePlaceholder', 'createdAt', 'updatedAt'])) return null;
  const item = value;
  const id = text(item.id, 120); const name = text(item.name, 160); const slug = text(item.slug, 160); const description = text(item.description, 5000, false); const categoryId = text(item.categoryId, 120); const images = stringArray(item.images, 20, 2048);
  const price = numberValue(item.price, 0, 10000000); const oldPrice = item.oldPrice == null ? undefined : numberValue(item.oldPrice, 0, 10000000);
  const featured = booleanValue(item.featured); const bestseller = booleanValue(item.bestseller); const available = booleanValue(item.available); const displayOrder = numberValue(item.displayOrder, 0, 1000000);
  if (!id || !name || !slug || description === undefined || !categoryId || !images || images.some((image) => !imageReference(image)) || price === undefined || (item.oldPrice != null && oldPrice === undefined) || featured === undefined || bestseller === undefined || available === undefined || displayOrder === undefined || !validDate(item.createdAt) || !validDate(item.updatedAt)) return null;
  const sku = item.sku == null ? undefined : text(item.sku, 120, false);
  const categoryName = item.categoryName == null ? undefined : text(item.categoryName, 160, false); const categorySlug = item.categorySlug == null ? undefined : text(item.categorySlug, 160, false);
  const weightOptions = item.weightOptions == null ? undefined : stringArray(item.weightOptions, 20, 80);
  const weightPrices = item.weightPrices == null ? undefined : validateWeightPrices(item.weightPrices);
  const selectedWeight = item.selectedWeight == null ? undefined : text(item.selectedWeight, 80, false); const allowFlavourSelection = item.allowFlavourSelection == null ? undefined : booleanValue(item.allowFlavourSelection); const allowCustomMessage = item.allowCustomMessage == null ? undefined : booleanValue(item.allowCustomMessage); const customMessagePlaceholder = item.customMessagePlaceholder == null ? undefined : text(item.customMessagePlaceholder, 300, false);
  if ((item.sku != null && sku === undefined) || (item.categoryName != null && categoryName === undefined) || (item.categorySlug != null && categorySlug === undefined) || (item.weightOptions != null && !weightOptions) || (item.weightPrices != null && !weightPrices) || (item.selectedWeight != null && selectedWeight === undefined) || (item.allowFlavourSelection != null && allowFlavourSelection === undefined) || (item.allowCustomMessage != null && allowCustomMessage === undefined) || (item.customMessagePlaceholder != null && customMessagePlaceholder === undefined)) return null;
  return { id, name, slug, description, price, oldPrice, sku, categoryId, categoryName, categorySlug, images, featured, bestseller, available, displayOrder, weightOptions, weightPrices, selectedWeight, allowFlavourSelection, allowCustomMessage, customMessagePlaceholder, createdAt: String(item.createdAt), updatedAt: String(item.updatedAt) };
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
  if (enabled === undefined || radiusKm === undefined || !storeName || latitude === undefined || longitude === undefined || !message || optionalNumbers.some((key) => value[key] != null && numberValue(value[key], 0, 10000000) === undefined) || (value.allowedPincodes != null && !stringArray(value.allowedPincodes, 1000, 20)) || (value.specialDeliveryAreas != null && !stringArray(value.specialDeliveryAreas, 1000, 200))) return null;
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

function safeJsonParse<T>(raw: unknown, fallback: T): T {
  try { return raw ? JSON.parse(String(raw)) as T : fallback; } catch { return fallback; }
}

function productFromRow(row: Record<string, unknown>): Product {
  const parsedWeightData = row.weight_options_json ? safeJsonParse<unknown[] | undefined>(row.weight_options_json, undefined) : undefined;
  let weightOptions: string[] | undefined;
  let weightPrices: WeightPriceOption[] | undefined;
  if (Array.isArray(parsedWeightData) && parsedWeightData.length > 0) {
    if (typeof parsedWeightData[0] === 'object' && parsedWeightData[0] !== null && 'weight' in (parsedWeightData[0] as object)) {
      weightPrices = parsedWeightData as WeightPriceOption[];
      weightOptions = weightPrices.map((wp) => wp.weight);
    } else if (typeof parsedWeightData[0] === 'string') {
      weightOptions = parsedWeightData as string[];
    }
  }

  return {
    id: String(row.id), name: String(row.name), slug: String(row.slug), description: String(row.description || ''),
    price: Number(row.price), oldPrice: row.old_price == null ? undefined : Number(row.old_price),
    categoryId: String(row.category_id), categoryName: row.category_name ? String(row.category_name) : undefined,
    categorySlug: row.category_slug ? String(row.category_slug) : undefined,
    images: safeJsonParse<string[]>(row.images_json, []), featured: asBoolean(row.featured),
    bestseller: asBoolean(row.bestseller), available: asBoolean(row.available), displayOrder: Number(row.display_order),
    weightOptions,
    weightPrices,
    selectedWeight: row.selected_weight ? String(row.selected_weight) : undefined,
    allowCustomMessage: row.allow_custom_message == null ? undefined : asBoolean(row.allow_custom_message),
    allowFlavourSelection: row.allow_flavour_selection == null ? undefined : asBoolean(row.allow_flavour_selection),
    customMessagePlaceholder: row.custom_message_placeholder ? String(row.custom_message_placeholder) : undefined,
    createdAt: String(row.created_at), updatedAt: String(row.updated_at),
  };
}

function categoryFromRow(row: Record<string, unknown>): Category {
  return { id: String(row.id), name: String(row.name), slug: String(row.slug), description: String(row.description || ''), image: String(row.image || ''), active: asBoolean(row.active), displayOrder: Number(row.display_order) };
}

function serializeWeightOptions(item: Product): string | null {
  if (item.weightPrices && item.weightPrices.length > 0) {
    return JSON.stringify(item.weightPrices);
  }
  return item.weightOptions ? JSON.stringify(item.weightOptions) : null;
}

async function seedIfEmpty(env: Env): Promise<void> {
  const existing = await env.DB.prepare('SELECT id FROM products LIMIT 1').first();
  if (existing) return;
  const now = new Date().toISOString();
  const statements = [
    ...INITIAL_CATEGORIES.map((item) => env.DB.prepare('INSERT OR IGNORE INTO categories (id,name,slug,description,image,active,display_order) VALUES (?,?,?,?,?,?,?)').bind(item.id, item.name, item.slug, item.description, item.image, item.active ? 1 : 0, item.displayOrder)),
    ...INITIAL_PRODUCTS.map((item) => env.DB.prepare('INSERT OR IGNORE INTO products (id,name,slug,description,price,old_price,category_id,category_name,category_slug,images_json,featured,bestseller,available,display_order,weight_options_json,selected_weight,allow_flavour_selection,allow_custom_message,custom_message_placeholder,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(item.id, item.name, item.slug, item.description, item.price, item.oldPrice ?? null, item.categoryId, item.categoryName ?? null, item.categorySlug ?? null, JSON.stringify(item.images), item.featured ? 1 : 0, item.bestseller ? 1 : 0, item.available ? 1 : 0, item.displayOrder, serializeWeightOptions(item), item.selectedWeight ?? null, item.allowFlavourSelection == null ? null : item.allowFlavourSelection ? 1 : 0, item.allowCustomMessage == null ? null : item.allowCustomMessage ? 1 : 0, item.customMessagePlaceholder ?? null, item.createdAt || now, item.updatedAt || now)),
    env.DB.prepare('INSERT OR IGNORE INTO settings (key,value_json,updated_at) VALUES (?,?,?)').bind('store', JSON.stringify(INITIAL_SETTINGS), now),
    env.DB.prepare('INSERT OR IGNORE INTO settings (key,value_json,updated_at) VALUES (?,?,?)').bind('delivery', JSON.stringify(INITIAL_DELIVERY_SETTINGS), now),
    env.DB.prepare('INSERT OR IGNORE INTO settings (key,value_json,updated_at) VALUES (?,?,?)').bind('homepage', JSON.stringify(INITIAL_HOMEPAGE_CONFIG), now),
  ];
  await env.DB.batch(statements);
}

async function setting<T>(env: Env, key: string, fallback: T): Promise<T> {
  const row = await env.DB.prepare('SELECT value_json FROM settings WHERE key = ?').bind(key).first<{ value_json: string }>();
  return row ? safeJsonParse(row.value_json, fallback) : fallback;
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

async function verifyPassword(password: string, stored?: string): Promise<boolean> {
  if (!stored) return false;
  const [algorithm, iterationsText, saltText, hashText] = stored.split('$');
  if (algorithm !== 'pbkdf2_sha256' || !iterationsText || !saltText || !hashText) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const salt = new Uint8Array(fromBase64Url(saltText));
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: Number(iterationsText), hash: 'SHA-256' }, key, 256);
  const actual = base64Url(bits);
  return actual === hashText;
}

function sessionCookie(value: string, maxAge = SESSION_TTL_SECONDS, isSecure = false): string {
  const secure = isSecure ? '; Secure' : '';
  return `${COOKIE_NAME}=${value}; Path=/; Max-Age=${maxAge}; Expires=${new Date(Date.now() + maxAge * 1000).toUTCString()}; HttpOnly${secure}; SameSite=Lax`;
}

function allowedOrigin(request: Request, env: Env): string | null {
  const origin = request.headers.get('Origin');
  if (!origin) return null;
  if (env.CORS_ORIGIN) {
    const configuredOrigins = env.CORS_ORIGIN.split(',').map((value) => value.trim()).filter(Boolean);
    return configuredOrigins.includes(origin) ? origin : null;
  }
  const devOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'];
  return devOrigins.includes(origin) ? origin : null;
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
  const rawText = await request.text();
  if (rawText.length > MAX_JSON_BYTES) throw new Error('Payload too large.');
  return JSON.parse(rawText) as T;
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
  const path = url.pathname.replace(/^\/api\/?/, '').replace(/\/+$/, '');
  const method = request.method;
  const isSecure = url.protocol === 'https:' || request.headers.get('x-forwarded-proto') === 'https';

  if (path === 'auth/login' && method === 'POST') {
    if (!env.ADMIN_PASSWORD_HASH || !env.SESSION_SECRET) {
      return error('Administrator authentication is not configured. Please set ADMIN_PASSWORD_HASH and SESSION_SECRET.', 500);
    }
    let body: { email?: string; password?: string };
    try { body = await readJson(request); } catch { return error('Invalid login request.', 400); }
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const keys = requestRateKeys(request, email);
    if (await isLoginBlocked(env, keys[0]) || await isLoginBlocked(env, keys[1])) return error('Too many unsuccessful login attempts. Please try again later.', 429);
    if (!email || email.length > 320 || !body.password || body.password.length > 1024 || email !== env.ADMIN_EMAIL.toLowerCase() || !(await verifyPassword(body.password, env.ADMIN_PASSWORD_HASH))) { await Promise.all(keys.map((key) => recordLoginFailure(env, key))); return error('Invalid email or password.', 401); }
    await Promise.all(keys.map((key) => clearLoginFailures(env, key)));
    const session = await createSession(env, env.ADMIN_EMAIL.toLowerCase());
    return json({ user: { uid: 'cloudflare-admin', email: env.ADMIN_EMAIL, displayName: 'Store Admin', isAdmin: true } }, 200, { 'set-cookie': sessionCookie(session, SESSION_TTL_SECONDS, isSecure), 'cache-control': 'no-store' });
  }
  if (path === 'auth/logout' && method === 'POST') return json({ ok: true }, 200, { 'set-cookie': sessionCookie('', 0, isSecure) });
  if (path === 'auth/me' && method === 'GET') {
    const user = await isAdmin(request, env)
      ? { uid: 'cloudflare-admin', email: env.ADMIN_EMAIL, displayName: 'Store Admin', isAdmin: true }
      : null;
    return json({ user });
  }

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
    try {
      await env.DB.prepare(
        `INSERT INTO products (id,name,slug,description,price,old_price,category_id,category_name,category_slug,images_json,featured,bestseller,available,display_order,weight_options_json,selected_weight,allow_flavour_selection,allow_custom_message,custom_message_placeholder,created_at,updated_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
         ON CONFLICT(id) DO UPDATE SET
           name=excluded.name,
           slug=excluded.slug,
           description=excluded.description,
           price=excluded.price,
           old_price=excluded.old_price,
           category_id=excluded.category_id,
           category_name=excluded.category_name,
           category_slug=excluded.category_slug,
           images_json=excluded.images_json,
           featured=excluded.featured,
           bestseller=excluded.bestseller,
           available=excluded.available,
           display_order=excluded.display_order,
           weight_options_json=excluded.weight_options_json,
           selected_weight=excluded.selected_weight,
           allow_flavour_selection=excluded.allow_flavour_selection,
           allow_custom_message=excluded.allow_custom_message,
           custom_message_placeholder=excluded.custom_message_placeholder,
           updated_at=excluded.updated_at`
      ).bind(item.id, item.name, item.slug, item.description, item.price, item.oldPrice ?? null, item.categoryId, item.categoryName ?? null, item.categorySlug ?? null, JSON.stringify(item.images), item.featured ? 1 : 0, item.bestseller ? 1 : 0, item.available ? 1 : 0, item.displayOrder, serializeWeightOptions(item), item.selectedWeight ?? null, item.allowFlavourSelection == null ? null : item.allowFlavourSelection ? 1 : 0, item.allowCustomMessage == null ? null : item.allowCustomMessage ? 1 : 0, item.customMessagePlaceholder ?? null, item.createdAt || now, now).run();
    } catch (err) {
      console.error('Product save failed.', { productId: item.id }, err);
      const diagnostic = err instanceof Error ? `${err.message} ${String(err.cause ?? '')}` : String(err);
      if (/no column named allow_flavour_selection/i.test(diagnostic)) {
        return error('Product storage needs a database migration. Please contact the administrator.', 503);
      }
      if (/unique constraint failed:\s*products\.slug/i.test(diagnostic)) {
        return error('Another product already uses this URL slug. Change the product slug and try again.', 409);
      }
      return error('Product could not be saved. No changes were made. Please try again.', 500);
    }
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

  if (path === 'admin/menu-import/history' && method === 'GET') {
    try {
      const rows = await env.DB.prepare(
        'SELECT id, imported_at, file_name, file_format, total_items, created_count, updated_count, skipped_count, categories_created_count, errors_json FROM menu_import_history ORDER BY imported_at DESC LIMIT 50'
      ).all();
      if (rows && rows.results && rows.results.length > 0) {
        return json(
          rows.results.map((r) => ({
            id: String(r.id),
            importedAt: String(r.imported_at),
            fileName: r.file_name ? String(r.file_name) : undefined,
            fileFormat: String(r.file_format),
            totalItems: Number(r.total_items),
            createdCount: Number(r.created_count),
            updatedCount: Number(r.updated_count),
            skippedCount: Number(r.skipped_count),
            categoriesCreatedCount: Number(r.categories_created_count),
            errors: safeJsonParse<string[]>(r.errors_json, []),
          }))
        );
      }
    } catch {
      // Fallback to settings if table not available or empty
    }
    const history = await setting<Record<string, unknown>[]>(env, 'menu_import_history', []);
    return json(history);
  }

  if (path === 'admin/menu-import' && method === 'POST' && body) {
    const fileName = typeof body.fileName === 'string' ? body.fileName.slice(0, 200) : 'menu_import';
    const fileFormat = body.fileFormat === 'csv' || body.fileFormat === 'json' ? body.fileFormat : 'csv';
    const rawCategories = Array.isArray(body.categoriesToCreate) ? body.categoriesToCreate : [];
    const rawProductsToCreate = Array.isArray(body.productsToCreate) ? body.productsToCreate : [];
    const rawProductsToUpdate = Array.isArray(body.productsToUpdate) ? body.productsToUpdate : [];
    const skippedCount = typeof body.skippedCount === 'number' && Number.isFinite(body.skippedCount) ? body.skippedCount : 0;

    // Pre-validate all items before executing any SQL statements
    const validationErrors: string[] = [];

    const validatedCategories: Category[] = [];
    for (let i = 0; i < rawCategories.length; i++) {
      const valid = validateCategory(rawCategories[i]);
      if (!valid) {
        validationErrors.push(`Category at index ${i} failed validation`);
      } else {
        validatedCategories.push(valid);
      }
    }

    const validatedProductsToCreate: Product[] = [];
    for (let i = 0; i < rawProductsToCreate.length; i++) {
      const valid = validateProduct(rawProductsToCreate[i]);
      if (!valid) {
        const name = (rawProductsToCreate[i] as JsonObject)?.name || `item #${i}`;
        validationErrors.push(`Product to create at index ${i} ("${name}") failed validation`);
      } else {
        validatedProductsToCreate.push(valid);
      }
    }

    const validatedProductsToUpdate: Product[] = [];
    for (let i = 0; i < rawProductsToUpdate.length; i++) {
      const valid = validateProduct(rawProductsToUpdate[i]);
      if (!valid) {
        const name = (rawProductsToUpdate[i] as JsonObject)?.name || `item #${i}`;
        validationErrors.push(`Product to update at index ${i} ("${name}") failed validation`);
      } else {
        validatedProductsToUpdate.push(valid);
      }
    }

    // Fail early: if any item across any chunk is invalid, reject the import before any D1 writes occur
    if (validationErrors.length > 0) {
      return error(
        `Import validation failed (${validationErrors.length} errors): ${validationErrors.slice(0, 5).join('; ')}`,
        422
      );
    }

    const statements: D1PreparedStatement[] = [];

    for (const cat of validatedCategories) {
      statements.push(
        env.DB.prepare(
          'INSERT OR REPLACE INTO categories (id,name,slug,description,image,active,display_order) VALUES (?,?,?,?,?,?,?)'
        ).bind(cat.id, cat.name, cat.slug, cat.description, cat.image, cat.active ? 1 : 0, cat.displayOrder)
      );
    }

    for (const item of [...validatedProductsToCreate, ...validatedProductsToUpdate]) {
      statements.push(
        env.DB.prepare(
          'INSERT OR REPLACE INTO products (id,name,slug,description,price,old_price,category_id,category_name,category_slug,images_json,featured,bestseller,available,display_order,weight_options_json,selected_weight,allow_flavour_selection,allow_custom_message,custom_message_placeholder,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
        ).bind(
          item.id,
          item.name,
          item.slug,
          item.description,
          item.price,
          item.oldPrice ?? null,
          item.categoryId,
          item.categoryName ?? null,
          item.categorySlug ?? null,
          JSON.stringify(item.images),
          item.featured ? 1 : 0,
          item.bestseller ? 1 : 0,
          item.available ? 1 : 0,
          item.displayOrder,
          serializeWeightOptions(item),
          item.selectedWeight ?? null,
          item.allowFlavourSelection == null ? null : item.allowFlavourSelection ? 1 : 0,
          item.allowCustomMessage == null ? null : item.allowCustomMessage ? 1 : 0,
          item.customMessagePlaceholder ?? null,
          item.createdAt || now,
          now
        )
      );
    }

    // Execute in transaction-safe batches of 50
    const BATCH_CHUNK_SIZE = 50;
    for (let i = 0; i < statements.length; i += BATCH_CHUNK_SIZE) {
      const chunk = statements.slice(i, i + BATCH_CHUNK_SIZE);
      await env.DB.batch(chunk);
    }

    const historyRecord = {
      id: `imp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      importedAt: now,
      fileName,
      fileFormat,
      totalItems: validatedProductsToCreate.length + validatedProductsToUpdate.length + skippedCount,
      createdCount: validatedProductsToCreate.length,
      updatedCount: validatedProductsToUpdate.length,
      skippedCount,
      categoriesCreatedCount: validatedCategories.length,
      errors: [] as string[],
    };

    try {
      await env.DB.prepare(
        'INSERT INTO menu_import_history (id, imported_at, file_name, file_format, total_items, created_count, updated_count, skipped_count, categories_created_count, errors_json) VALUES (?,?,?,?,?,?,?,?,?,?)'
      ).bind(
        historyRecord.id,
        historyRecord.importedAt,
        historyRecord.fileName,
        historyRecord.fileFormat,
        historyRecord.totalItems,
        historyRecord.createdCount,
        historyRecord.updatedCount,
        historyRecord.skippedCount,
        historyRecord.categoriesCreatedCount,
        JSON.stringify(historyRecord.errors)
      ).run();
    } catch (err) {
      console.error('Failed to insert into menu_import_history table:', err);
    }

    const existingHistory = await setting<Record<string, unknown>[]>(env, 'menu_import_history', []);
    const updatedHistory = [historyRecord, ...existingHistory].slice(0, 50);
    await saveSetting(env, 'menu_import_history', updatedHistory);

    return json({ ok: true, summary: historyRecord });
  }

  return error('Not found', 404);
}

async function saveSetting(env: Env, key: string, value: unknown): Promise<Response> {
  await env.DB.prepare('INSERT OR REPLACE INTO settings (key,value_json,updated_at) VALUES (?,?,?)').bind(key, JSON.stringify(value), new Date().toISOString()).run();
  return json({ ok: true });
}

async function handleMedia(request: Request, env: Env, url: URL): Promise<Response> {
  const mediaPath = url.pathname.replace(/\/+$/, '');
  if (url.pathname.startsWith('/media/') && request.method === 'GET') {
    const key = mediaKey(decodeURIComponent(url.pathname.slice(7)));
    if (!key) return error('Invalid media key.', 400);
    const object = await env.MEDIA.get(key);
    return object ? new Response(object.body, { headers: { 'content-type': object.httpMetadata?.contentType || 'application/octet-stream', 'cache-control': 'public, max-age=31536000, immutable' } }) : error('Media not found', 404);
  }
  if (!(await isAdmin(request, env))) return error('Unauthorized', 401);
  if (mediaPath === '/api/media/upload' && request.method === 'POST') {
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
    return json({ url: `/media/${key}`, key });
  }
  if (mediaPath === '/api/media' && request.method === 'DELETE') {
    let body: { key?: unknown }; try { body = await readJson(request); } catch { return error('Invalid media delete request.', 400); }
    const key = mediaKey(body.key); if (!key) return error('Invalid media key.', 422);
    await env.MEDIA.delete(key); return json({ ok: true });
  }
  return error('Not found', 404);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function injectSsrMeta(
  html: string,
  meta: {
    title: string;
    description: string;
    keywords?: string;
    canonical: string;
    image?: string;
    imageAlt?: string;
    type?: string;
    robots?: string;
    schema?: Record<string, unknown>;
  }
): string {
  let result = html;

  result = result.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`);
  result = result.replace(
    /<meta\s+name=["']description["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`
  );
  if (meta.keywords) {
    result = result.replace(
      /<meta\s+name=["']keywords["']\s+content=["'][^"']*["']\s*\/?>/i,
      `<meta name="keywords" content="${escapeHtml(meta.keywords)}" />`
    );
  }
  result = result.replace(
    /<link\s+rel=["']canonical["']\s+href=["'][^"']*["']\s*\/?>/i,
    `<link rel="canonical" href="${escapeHtml(meta.canonical)}" />`
  );
  if (meta.robots) {
    result = result.replace(
      /<meta\s+name=["']robots["']\s+content=["'][^"']*["']\s*\/?>/i,
      `<meta name="robots" content="${escapeHtml(meta.robots)}" />`
    );
  }

  result = result.replace(
    /<meta\s+property=["']og:title["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`
  );
  result = result.replace(
    /<meta\s+property=["']og:description["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`
  );
  result = result.replace(
    /<meta\s+property=["']og:url["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta property="og:url" content="${escapeHtml(meta.canonical)}" />`
  );
  if (meta.image) {
    result = result.replace(
      /<meta\s+property=["']og:image["']\s+content=["'][^"']*["']\s*\/?>/i,
      `<meta property="og:image" content="${escapeHtml(meta.image)}" />`
    );
    result = result.replace(
      /<meta\s+property=["']og:image:secure_url["']\s+content=["'][^"']*["']\s*\/?>/i,
      `<meta property="og:image:secure_url" content="${escapeHtml(meta.image)}" />`
    );
  }
  if (meta.imageAlt) {
    result = result.replace(
      /<meta\s+property=["']og:image:alt["']\s+content=["'][^"']*["']\s*\/?>/i,
      `<meta property="og:image:alt" content="${escapeHtml(meta.imageAlt)}" />`
    );
  }
  if (meta.type) {
    result = result.replace(
      /<meta\s+property=["']og:type["']\s+content=["'][^"']*["']\s*\/?>/i,
      `<meta property="og:type" content="${escapeHtml(meta.type)}" />`
    );
  }

  result = result.replace(
    /<meta\s+name=["']twitter:title["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`
  );
  result = result.replace(
    /<meta\s+name=["']twitter:description["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`
  );
  if (meta.image) {
    result = result.replace(
      /<meta\s+name=["']twitter:image["']\s+content=["'][^"']*["']\s*\/?>/i,
      `<meta name="twitter:image" content="${escapeHtml(meta.image)}" />`
    );
  }
  if (meta.imageAlt) {
    result = result.replace(
      /<meta\s+name=["']twitter:image:alt["']\s+content=["'][^"']*["']\s*\/?>/i,
      `<meta name="twitter:image:alt" content="${escapeHtml(meta.imageAlt)}" />`
    );
  }

  if (meta.schema) {
    const schemaJson = JSON.stringify(meta.schema).replace(/</g, '\\u003c');
    const schemaScript = `\n    <!-- Server-rendered JSON-LD schema for ${escapeHtml(meta.title)} -->\n    <script type="application/ld+json" id="server-page-schema">${schemaJson}</script>\n  `;
    result = result.replace('</head>', `${schemaScript}</head>`);
  }

  return result;
}

function htmlResponse(assetRes: Response, html: string): Response {
  const headers = new Headers(assetRes.headers);
  headers.delete('content-length');
  headers.delete('content-encoding');
  headers.delete('etag');
  headers.set('content-type', 'text/html; charset=utf-8');
  return new Response(html, { status: assetRes.status, statusText: assetRes.statusText, headers });
}

async function handleHtmlWithSsrSeo(request: Request, env: Env, url: URL): Promise<Response> {
  const assetRes = await env.ASSETS.fetch(request);
  const contentType = assetRes.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return assetRes;
  }

  try {
    const html = await assetRes.clone().text();
    return await renderHtmlWithSsrSeo(assetRes, html, env, url);
  } catch (err) {
    console.error(`SSR SEO rendering failed for ${url.pathname}; returning the original asset response.`, err);
    return assetRes;
  }
}

async function renderHtmlWithSsrSeo(assetRes: Response, sourceHtml: string, env: Env, url: URL): Promise<Response> {
  let html = sourceHtml;
  const pathname = url.pathname.replace(/\/+$/, '') || '/';

  // Admin routes: enforce noindex, nofollow
  if (pathname.startsWith('/admin')) {
    html = html.replace(
      /<meta\s+name=["']robots["']\s+content=["'][^"']*["']\s*\/?>/i,
      '<meta name="robots" content="noindex,nofollow" />'
    );
    return htmlResponse(assetRes, html);
  }

  // Product detail pages
  if (pathname.startsWith('/product/')) {
    const slug = decodeURIComponent(pathname.replace(/^\/product\//, ''));
    let product: any = null;
    try {
      product = await env.DB.prepare('SELECT * FROM products WHERE slug = ? OR id = ?').bind(slug, slug).first();
    } catch (err) {
      console.warn('SSR product lookup failed; using initial product data when available.', err);
    }
    if (!product) {
      product = INITIAL_PRODUCTS.find((p) => p.slug === slug || p.id === slug);
    }

    if (product) {
      let images: string[] = [];
      if (typeof product.images_json === 'string') {
        try {
          const parsedImages: unknown = JSON.parse(product.images_json);
          if (Array.isArray(parsedImages)) images = parsedImages.filter((image): image is string => typeof image === 'string');
        } catch (err) {
          console.warn('SSR product image data could not be parsed.', err);
        }
      } else if (Array.isArray(product.images)) {
        images = product.images;
      }
      const primaryImage = images[0] || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1200&auto=format&fit=crop';
      const fullImageUrl = primaryImage.startsWith('/') ? `${PRODUCTION_ORIGIN}${primaryImage}` : primaryImage;
      const productUrl = `${PRODUCTION_ORIGIN}/product/${encodeURIComponent(product.slug || slug)}`;
      const categoryId = product.category_id || product.categoryId;
      const categorySlug = product.category_slug || product.categorySlug;
      const isCake = categoryId === 'cat-cakes' || categorySlug === 'cakes';
      const title = `${product.name} | Cakes N More, Sector 76 Noida`;
      const description = isCake
        ? `Order ${product.name}, a freshly prepared 100% eggless cake from Cakes N More in Sector 76, Noida. View prices, choose options, and check delivery availability.`
        : `Order ${product.name} from Cakes N More in Sector 76, Noida. View product details, check delivery availability, and place your order via WhatsApp.`;
      const keywords = [
        `${product.name.toLowerCase()} noida`,
        `order ${product.name.toLowerCase()} sector 76 noida`,
        ...(isCake ? ['eggless cake delivery sector 76 noida', 'birthday cake delivery noida'] : []),
        `fresh ${String(product.category_name || product.categoryName || 'products').toLowerCase()} delivery noida`,
      ].join(', ');

      const productSchema = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Product',
            url: productUrl,
            name: product.name,
            image: images.map(img => img.startsWith('/') ? `${PRODUCTION_ORIGIN}${img}` : img),
            description: product.description,
            sku: product.id,
            brand: { '@type': 'Brand', name: 'Cakes N More' },
            itemCondition: 'https://schema.org/NewCondition',
            offers: {
              '@type': 'Offer',
              url: productUrl,
              priceCurrency: 'INR',
              price: product.price,
              availability: product.available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
              seller: {
                '@type': 'Organization',
                '@id': `${PRODUCTION_ORIGIN}/#localbusiness`,
                name: 'Cakes N More',
                url: `${PRODUCTION_ORIGIN}/`,
              },
            },
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${PRODUCTION_ORIGIN}/` },
              { '@type': 'ListItem', position: 2, name: 'Shop', item: `${PRODUCTION_ORIGIN}/shop` },
              ...(product.category_slug || product.categorySlug
                ? [{ '@type': 'ListItem', position: 3, name: product.category_name || product.categoryName || 'Category', item: `${PRODUCTION_ORIGIN}/category/${product.category_slug || product.categorySlug}` }]
                : []),
              { '@type': 'ListItem', position: (product.category_slug || product.categorySlug) ? 4 : 3, name: product.name, item: productUrl },
            ],
          },
        ],
      };

      html = injectSsrMeta(html, {
        title,
        description,
        keywords,
        canonical: productUrl,
        image: fullImageUrl,
        imageAlt: `${product.name} from Cakes N More, Sector 76 Noida`,
        type: 'product',
        schema: productSchema,
      });

      return htmlResponse(assetRes, html);
    }
  }

  // Category pages
  if (pathname.startsWith('/category/')) {
    const slug = decodeURIComponent(pathname.replace(/^\/category\//, ''));
    let category: any = null;
    try {
      category = await env.DB.prepare('SELECT * FROM categories WHERE slug = ? OR id = ?').bind(slug, slug).first();
    } catch (err) {
      console.warn('SSR category lookup failed; using initial category data when available.', err);
    }
    if (!category) {
      category = INITIAL_CATEGORIES.find((c) => c.slug === slug || c.id === slug);
    }

    if (category) {
      const categoryUrl = `${PRODUCTION_ORIGIN}/category/${encodeURIComponent(category.slug || slug)}`;
      const isCakeCategory = category.slug === 'cakes' || category.id === 'cat-cakes';
      const title = `${category.name} Delivery in Sector 76 Noida | Cakes N More`;
      const description = `Order ${isCakeCategory ? 'fresh 100% eggless cakes' : `fresh ${category.name.toLowerCase()}`} in Sector 76, Noida. ${category.description || ''} Check delivery availability and order via WhatsApp.`;
      const keywords = [
        `${category.name.toLowerCase()} delivery sector 76 noida`,
        `best ${category.name.toLowerCase()} noida`,
        `online ${category.name.toLowerCase()} shop noida`,
        ...(isCakeCategory ? ['eggless cakes noida'] : []),
      ].join(', ');
      const fullImageUrl = category.image?.startsWith('/') ? `${PRODUCTION_ORIGIN}${category.image}` : category.image;

      const categorySchema = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'CollectionPage',
            '@id': categoryUrl,
            name: `${category.name} Delivery in Sector 76 Noida`,
            description: category.description,
            url: categoryUrl,
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${PRODUCTION_ORIGIN}/` },
              { '@type': 'ListItem', position: 2, name: 'Shop', item: `${PRODUCTION_ORIGIN}/shop` },
              { '@type': 'ListItem', position: 3, name: category.name, item: categoryUrl },
            ],
          },
        ],
      };

      html = injectSsrMeta(html, {
        title,
        description,
        keywords,
        canonical: categoryUrl,
        image: fullImageUrl,
        imageAlt: `${category.name} in Sector 76 Noida - Cakes N More`,
        type: 'website',
        schema: categorySchema,
      });

      return htmlResponse(assetRes, html);
    }
  }

  // Other standard public pages
  const staticRouteMeta: Record<string, { title: string; description: string; keywords?: string; schema?: any }> = {
    '/shop': {
      title: 'Online Bakery & Florist in Sector 76 Noida | Cakes N More',
      description: 'Browse eggless celebration cakes, fresh flowers, and gift hampers in Sector 76 Noida. Check delivery availability and order via WhatsApp.',
      keywords: 'buy cakes online noida, order cakes online sector 76 noida, fresh flowers delivery noida, eggless birthday cakes noida, gift hampers noida',
      schema: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'CollectionPage',
            '@id': `${PRODUCTION_ORIGIN}/shop`,
            name: 'Online Bakery & Flower Shop in Sector 76 Noida',
            description: 'Browse our complete catalogue of 100% eggless celebration cakes, exotic flowers, and gift hampers in Sector 76, Noida.',
            url: `${PRODUCTION_ORIGIN}/shop`,
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${PRODUCTION_ORIGIN}/` },
              { '@type': 'ListItem', position: 2, name: 'Shop', item: `${PRODUCTION_ORIGIN}/shop` },
            ],
          },
        ],
      },
    },
    '/about': {
      title: 'About Us | Cakes N More Sector 76 Noida',
      description: 'Learn about Cakes N More in Sector 76 Noida. Your neighborhood boutique bakery, flower shop and luxury gift studio at Amrapali Crystal Home.',
      keywords: 'about cakes n more noida, bakery in sector 76 noida, eggless patisserie noida, cake shop near mithaas amrapali silicon city',
      schema: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'AboutPage',
            '@id': `${PRODUCTION_ORIGIN}/about`,
            name: 'About Cakes N More Sector 76 Noida',
            description: 'About Cakes N More - premier 100% eggless bakery and boutique florist in Sector 76 Noida.',
            url: `${PRODUCTION_ORIGIN}/about`,
            mainEntity: {
              '@id': `${PRODUCTION_ORIGIN}/#localbusiness`,
            },
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${PRODUCTION_ORIGIN}/` },
              { '@type': 'ListItem', position: 2, name: 'About Us', item: `${PRODUCTION_ORIGIN}/about` },
            ],
          },
        ],
      },
    },
    '/contact': {
      title: 'Contact & Location | Cakes N More Noida Sector 76',
      description: 'Visit Cakes N More at Shop 29, Ground Floor, Amrapali Crystal Home, Sector 76, Noida. Call +91 9999517599 to ask about products and delivery availability.',
      keywords: 'contact cakes n more noida, bakery phone number sector 76 noida, shop 29 amrapali crystal home noida',
      schema: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'ContactPage',
            '@id': `${PRODUCTION_ORIGIN}/contact`,
            name: 'Contact Cakes N More Sector 76 Noida',
            url: `${PRODUCTION_ORIGIN}/contact`,
            mainEntity: {
              '@id': `${PRODUCTION_ORIGIN}/#localbusiness`,
            },
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${PRODUCTION_ORIGIN}/` },
              { '@type': 'ListItem', position: 2, name: 'Contact Us', item: `${PRODUCTION_ORIGIN}/contact` },
            ],
          },
        ],
      },
    },
    '/shipping-and-delivery': {
      title: 'Shipping & Delivery Policy | Cakes N More Sector 76 Noida',
      description: 'Learn about delivery availability, delivery areas, and packaging for orders from Cakes N More in Sector 76, Noida.',
    },
    '/returns-policy': {
      title: 'Returns & Refunds Policy | Cakes N More Sector 76 Noida',
      description: 'Return, refund, and replacement policy for fresh cakes, floral arrangements, and perishable gifts at Cakes N More Sector 76 Noida.',
    },
    '/terms-and-conditions': {
      title: 'Terms & Conditions | Cakes N More Sector 76 Noida',
      description: 'Terms and conditions governing online ordering, product fulfillment, and delivery at Cakes N More Sector 76 Noida.',
    },
    '/privacy-policy': {
      title: 'Privacy Policy | Cakes N More Sector 76 Noida',
      description: 'How Cakes N More collects, uses, and protects customer information on this website and order channels.',
    },
  };

  if (pathname === '/') {
    let storeSettings = INITIAL_SETTINGS;
    try {
      storeSettings = await setting(env, 'store', INITIAL_SETTINGS);
    } catch (err) {
      console.warn('SSR homepage metadata lookup failed; using initial store metadata.', err);
    }
    const canonical = `${PRODUCTION_ORIGIN}/`;
    html = injectSsrMeta(html, {
      title: storeSettings.websiteTitle,
      description: storeSettings.metaDescription,
      canonical,
    });
    return htmlResponse(assetRes, html);
  }

  if (pathname === '/cart') {
    const canonical = `${PRODUCTION_ORIGIN}/cart`;
    html = injectSsrMeta(html, {
      title: 'Your Cart | Cakes N More Sector 76 Noida',
      description: 'Review your selected items before contacting Cakes N More to confirm your order.',
      canonical,
      robots: 'noindex,nofollow',
    });
    return htmlResponse(assetRes, html);
  }

  const routeConfig = staticRouteMeta[pathname];
  if (routeConfig) {
    const canonical = `${PRODUCTION_ORIGIN}${pathname}`;
    html = injectSsrMeta(html, {
      title: routeConfig.title,
      description: routeConfig.description,
      keywords: routeConfig.keywords,
      canonical,
      schema: routeConfig.schema,
    });
    return htmlResponse(assetRes, html);
  }

  html = injectSsrMeta(html, {
    title: 'Page Not Found | Cakes N More Sector 76 Noida',
    description: 'This page could not be found. Browse cakes, flowers, and gifts from Cakes N More in Sector 76, Noida.',
    canonical: `${PRODUCTION_ORIGIN}${pathname}`,
    robots: 'noindex,follow',
  });
  return htmlResponse(assetRes, html);
}

export default { async fetch(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  try {
    if (url.pathname === '/sitemap.xml' && request.method === 'GET') return await buildSitemap(env);
    if (url.pathname === '/robots.txt' && request.method === 'GET') return robotsResponse();
    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/media/') || url.pathname === '/api') {
      if (request.method === 'OPTIONS') return withCors(new Response(null, { status: 204 }), request, env);
      if (url.pathname.startsWith('/api/') || url.pathname === '/api') await seedIfEmpty(env);
      const normalizedPath = url.pathname.replace(/\/+$/, '') || '/';
      const isMedia = url.pathname.startsWith('/media/') || normalizedPath === '/api/media' || normalizedPath === '/api/media/upload';
      const response = isMedia
        ? await handleMedia(request, env, url)
        : await handleApi(request, env, url);
      return withCors(response, request, env);
    }
    const isStaticAsset = /\.(?:js|css|png|jpg|jpeg|gif|svg|ico|webp|avif|woff|woff2|ttf|eot|json|map|txt|xml)$/i.test(url.pathname);
    if (!isStaticAsset && request.method === 'GET') {
      return await handleHtmlWithSsrSeo(request, env, url);
    }
    return env.ASSETS.fetch(request);
  } catch (err) { console.error(err); return error('Internal server error', 500); }
} };
