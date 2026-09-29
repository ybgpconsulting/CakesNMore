import { Category, DuplicateResolutionAction, ImportItemRaw, ParsedImportItem, Product, WeightPriceOption } from '../types';
import { parseWeightPricesString } from './productPricing';

/**
 * Standard category fallback images from approved Unsplash photography
 */
export const CATEGORY_IMAGE_DEFAULTS: Record<string, string> = {
  cakes: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop',
  flowers: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?q=80&w=800&auto=format&fit=crop',
  combos: 'https://images.unsplash.com/photo-1587899897387-091ebd01a6b2?q=80&w=800&auto=format&fit=crop',
  plants: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=800&auto=format&fit=crop',
  chocolates: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=800&auto=format&fit=crop',
  gifts: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop',
  default: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop',
};

/**
 * Slug generator
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'item';
}

/**
 * Normalize text for fuzzy matching (case-insensitive, trims extra spaces and punctuation)
 */
export function normalizeForMatch(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Robust RFC 4180 CSV parser
 * Supports:
 * - Commas, semicolons, tabs (auto-detected)
 * - Quoted fields with escaped quotes ("")
 * - Commas within quotes
 * - Multi-line strings in quoted fields
 * - Strips UTF-8 BOM
 */
export function parseCsvRows(csvText: string): string[][] {
  const cleanText = csvText.replace(/^\uFEFF/, '').trim();
  if (!cleanText) return [];

  // Auto-detect delimiter from the first line
  const firstLine = cleanText.split(/\r\n|\n|\r/)[0] || '';
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;

  let delimiter = ',';
  if (semicolonCount > commaCount && semicolonCount > tabCount) {
    delimiter = ';';
  } else if (tabCount > commaCount && tabCount > semicolonCount) {
    delimiter = '\t';
  }

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;

  while (i < cleanText.length) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote
          currentField += '"';
          i += 2;
          continue;
        } else {
          // End of quoted field
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        currentField += char;
        i++;
        continue;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
        continue;
      } else if (char === delimiter) {
        currentRow.push(currentField.trim());
        currentField = '';
        i++;
        continue;
      } else if (char === '\r') {
        if (nextChar === '\n') {
          i++;
        }
        currentRow.push(currentField.trim());
        if (currentRow.some((f) => f.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
        i++;
        continue;
      } else if (char === '\n') {
        currentRow.push(currentField.trim());
        if (currentRow.some((f) => f.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
        i++;
        continue;
      } else {
        currentField += char;
        i++;
        continue;
      }
    }
  }

  // Push remaining field and row
  currentRow.push(currentField.trim());
  if (currentRow.some((f) => f.length > 0)) {
    rows.push(currentRow);
  }

  return rows;
}

/**
 * Flexible column header aliases to support different POS and restaurant menu exports
 */
const COLUMN_ALIASES: Record<string, string[]> = {
  category: [
    'category',
    'category_name',
    'category name',
    'categoryname',
    'item_category',
    'item category',
    'menu_category',
    'menu category',
    'department',
    'dept',
    'group',
    'section',
  ],
  name: [
    'name',
    'product_name',
    'product name',
    'productname',
    'item_name',
    'item name',
    'itemname',
    'title',
    'dish_name',
    'dish name',
    'item',
    'product',
  ],
  description: [
    'description',
    'desc',
    'item_description',
    'item description',
    'details',
    'detail',
    'about',
    'summary',
  ],
  price: [
    'price',
    'selling_price',
    'selling price',
    'item_price',
    'item price',
    'rate',
    'mrp',
    'amount',
    'cost',
  ],
  oldPrice: [
    'old_price',
    'old price',
    'oldprice',
    'compare_at_price',
    'compare at price',
    'original_price',
    'original price',
    'mrp_old',
    'list_price',
    'strike_price',
  ],
  sku: [
    'sku',
    'item_code',
    'item code',
    'product_code',
    'product code',
    'barcode',
    'code',
    'item_id',
    'item id',
  ],
  images: [
    'images',
    'image',
    'image_url',
    'image url',
    'image_urls',
    'photos',
    'photo',
    'picture',
    'picture_url',
  ],
  available: [
    'available',
    'availability',
    'in_stock',
    'in stock',
    'status',
    'is_available',
    'is available',
    'active',
    'stock',
    'enabled',
  ],
  weightOptions: [
    'weight_options',
    'weight options',
    'weightoptions',
    'weights',
    'variants',
    'variant_options',
    'options',
    'sizes',
    'size',
    'portion',
  ],
};

function matchColumnHeader(header: string): string | null {
  const normalized = header.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  for (const [canonicalKey, aliases] of Object.entries(COLUMN_ALIASES)) {
    if (aliases.some((alias) => alias.replace(/[^a-z0-9]/g, ' ').trim() === normalized)) {
      return canonicalKey;
    }
  }
  return null;
}

/**
 * Parse CSV raw text into array of ImportItemRaw
 */
export function parseCsvMenu(csvText: string): ImportItemRaw[] {
  const rows = parseCsvRows(csvText);
  if (rows.length < 2) {
    throw new Error('CSV file must contain a header row and at least one data row.');
  }

  const headerRow = rows[0];
  const headerMap: Record<number, string> = {};

  headerRow.forEach((col, idx) => {
    const canonicalKey = matchColumnHeader(col);
    if (canonicalKey) {
      headerMap[idx] = canonicalKey;
    }
  });

  // Verify at least name or price column was identified
  const recognizedKeys = Object.values(headerMap);
  if (!recognizedKeys.includes('name') && !recognizedKeys.includes('price')) {
    throw new Error(
      `Could not identify required columns ("Name" or "Price") in CSV header. Found columns: ${headerRow.join(', ')}`
    );
  }

  const rawItems: ImportItemRaw[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    // Skip empty lines
    if (row.length === 0 || row.every((c) => !c.trim())) continue;

    const raw: Partial<ImportItemRaw> = {};

    row.forEach((cell, idx) => {
      const field = headerMap[idx];
      if (field) {
        (raw as Record<string, unknown>)[field] = cell.trim();
      }
    });

    rawItems.push({
      category: String(raw.category || 'Cakes').trim(),
      name: String(raw.name || '').trim(),
      description: raw.description ? String(raw.description).trim() : '',
      price: raw.price !== undefined ? raw.price : '',
      oldPrice: raw.oldPrice !== undefined ? raw.oldPrice : undefined,
      sku: raw.sku ? String(raw.sku).trim() : undefined,
      images: raw.images !== undefined ? raw.images : '',
      available: raw.available !== undefined ? raw.available : true,
      weightOptions: raw.weightOptions !== undefined ? raw.weightOptions : '',
    });
  }

  return rawItems;
}

/**
 * Parse JSON raw text into array of ImportItemRaw
 */
export function parseJsonMenu(jsonText: string): ImportItemRaw[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch (err) {
    throw new Error(`Invalid JSON syntax: ${(err as Error).message}`);
  }

  let itemsArray: unknown[] = [];

  if (Array.isArray(parsed)) {
    itemsArray = parsed;
  } else if (parsed && typeof parsed === 'object') {
    const obj = parsed as Record<string, unknown>;
    if (Array.isArray(obj.products)) {
      itemsArray = obj.products;
    } else if (Array.isArray(obj.items)) {
      itemsArray = obj.items;
    } else if (Array.isArray(obj.menu)) {
      itemsArray = obj.menu;
    } else if (Array.isArray(obj.data)) {
      itemsArray = obj.data;
    } else {
      throw new Error(
        'JSON must be an array of products or an object containing a "products", "items", or "menu" array.'
      );
    }
  }

  if (itemsArray.length === 0) {
    throw new Error('JSON contains no items to import.');
  }

  return itemsArray.map((item, idx) => {
    if (!item || typeof item !== 'object') {
      throw new Error(`Item at index ${idx} is not a valid JSON object.`);
    }
    const rec = item as Record<string, unknown>;

    // Find fields checking aliases
    const findField = (canonicalKey: string): unknown => {
      const aliases = COLUMN_ALIASES[canonicalKey] || [canonicalKey];
      for (const alias of aliases) {
        if (rec[alias] !== undefined) return rec[alias];
        // camelCase
        const camel = alias.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        if (rec[camel] !== undefined) return rec[camel];
      }
      return undefined;
    };

    return {
      category: String(findField('category') || 'Cakes').trim(),
      name: String(findField('name') || '').trim(),
      description: String(findField('description') || '').trim(),
      price: findField('price') as string | number,
      oldPrice: findField('oldPrice') as string | number | undefined,
      sku: findField('sku') ? String(findField('sku')).trim() : undefined,
      images: findField('images') as string | string[] | undefined,
      available: findField('available') !== undefined ? (findField('available') as boolean | string) : true,
      weightOptions: findField('weightOptions') as string | string[] | undefined,
    };
  });
}

/**
 * Clean & normalize price inputs (strips currency signs like ₹, Rs., commas, and trailing /-)
 */
export function cleanPriceNumber(val: unknown): number | null {
  if (val == null) return null;
  if (typeof val === 'number') {
    return Number.isFinite(val) ? val : null;
  }
  const cleanStr = String(val)
    .replace(/\b(rs|inr)\b\.?/gi, '')
    .replace(/[₹$€£\s]/g, '')
    .replace(/\/-$/, '')
    .replace(/,/g, '')
    .trim();
  const num = parseFloat(cleanStr);
  return Number.isFinite(num) ? num : null;
}

/**
 * Clean & normalize boolean values
 */
export function cleanBooleanValue(val: unknown): boolean {
  if (val === true || val === 1) return true;
  if (val === false || val === 0) return false;
  if (typeof val === 'string') {
    const s = val.toLowerCase().trim();
    if (['true', '1', 'yes', 'y', 'in_stock', 'in stock', 'available', 'active'].includes(s)) {
      return true;
    }
    if (['false', '0', 'no', 'n', 'out_of_stock', 'out of stock', 'unavailable', 'inactive'].includes(s)) {
      return false;
    }
  }
  return true; // Default to available
}

export interface CleanImageOptions {
  allowGenericFallback?: boolean;
  categorySlug?: string;
}

/**
 * Parse image URLs string or array.
 * Note (Requirement 6): Generic fallback images are NOT automatically published
 * to production. Missing images return [] unless allowGenericFallback is explicitly set.
 */
export function cleanImageUrls(val: unknown, options?: CleanImageOptions | string): string[] {
  let urls: string[] = [];
  const opts: CleanImageOptions = typeof options === 'string' ? { categorySlug: options } : options || {};

  if (Array.isArray(val)) {
    urls = val.map((v) => String(v).trim()).filter(Boolean);
  } else if (typeof val === 'string' && val.trim()) {
    // Split by comma, pipe, newline or semicolon
    urls = val
      .split(/[,|\n;]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  // Filter and validate URLs
  const validUrls = urls.filter((url) => {
    if (url.startsWith('/media/')) return true;
    try {
      const u = new URL(url);
      return ['http:', 'https:'].includes(u.protocol);
    } catch {
      return false;
    }
  });

  if (validUrls.length === 0 && opts.allowGenericFallback) {
    const slug = opts.categorySlug || 'default';
    const fallback = CATEGORY_IMAGE_DEFAULTS[slug] || CATEGORY_IMAGE_DEFAULTS.default;
    return [fallback];
  }

  return validUrls;
}

/**
 * Parse weight options string or array
 */
export function cleanWeightOptions(val: unknown): string[] | undefined {
  if (Array.isArray(val)) {
    const items = val.map((v) => String(v).trim()).filter(Boolean);
    return items.length > 0 ? items : undefined;
  }
  if (typeof val === 'string' && val.trim()) {
    const items = val
      .split(/[,|\n;]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    return items.length > 0 ? items : undefined;
  }
  return undefined;
}

export interface ValidationSummary {
  total: number;
  validNewCount: number;
  duplicateCount: number;
  invalidCount: number;
  missingImageCount: number;
  newCategories: Category[];
}

export interface ValidateImportOptions {
  allowGenericFallback?: boolean;
}

/**
 * Validates, maps, and matches imported raw items against current catalogue
 */
export function validateAndMatchImportItems(
  rawItems: ImportItemRaw[],
  existingProducts: Product[],
  existingCategories: Category[],
  options: ValidateImportOptions = {}
): { items: ParsedImportItem[]; summary: ValidationSummary } {
  const newCategoriesMap = new Map<string, Category>();
  const parsedItems: ParsedImportItem[] = [];

  // Track internal names seen in this batch to detect internal duplicate rows
  const seenInternalSkus = new Set<string>();
  const seenInternalKeys = new Set<string>();

  rawItems.forEach((raw, idx) => {
    const rowNumber = idx + 1;
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Validate Product Name
    const name = (raw.name || '').trim();
    if (!name) {
      errors.push('Product name is required.');
    } else if (name.length > 160) {
      errors.push('Product name exceeds 160 characters.');
    }

    // 2. Validate Category & resolve/create category metadata
    const rawCategory = (raw.category || 'Cakes').trim();
    let categoryId = '';
    let categoryName = rawCategory;
    let categorySlug = slugify(rawCategory);
    let isNewCategory = false;

    if (!rawCategory) {
      errors.push('Category is required.');
    } else {
      // Find matching existing category
      const matchedCat = existingCategories.find(
        (c) =>
          c.id.toLowerCase() === rawCategory.toLowerCase() ||
          c.slug.toLowerCase() === categorySlug.toLowerCase() ||
          normalizeForMatch(c.name) === normalizeForMatch(rawCategory)
      );

      if (matchedCat) {
        categoryId = matchedCat.id;
        categoryName = matchedCat.name;
        categorySlug = matchedCat.slug;
      } else {
        // Auto-create category if not exists
        isNewCategory = true;
        categoryId = `cat-${categorySlug}`;
        if (!newCategoriesMap.has(categoryId)) {
          newCategoriesMap.set(categoryId, {
            id: categoryId,
            name: categoryName,
            slug: categorySlug,
            description: `Handcrafted ${categoryName} freshly prepared in Sector 76 Noida.`,
            image: CATEGORY_IMAGE_DEFAULTS[categorySlug] || CATEGORY_IMAGE_DEFAULTS.default,
            active: true,
            displayOrder: existingCategories.length + newCategoriesMap.size + 1,
          });
        }
      }
    }

    // 3. Validate Price
    const priceNum = cleanPriceNumber(raw.price);
    let price = 0;
    if (priceNum === null) {
      errors.push('Price must be a valid number.');
    } else if (priceNum <= 0) {
      errors.push('Price must be greater than 0.');
    } else if (priceNum > 1000000) {
      errors.push('Price exceeds maximum allowed limit (₹1,000,000).');
    } else {
      price = Math.round(priceNum);
    }

    // 4. Validate Old Price (Optional)
    let oldPrice: number | undefined = undefined;
    if (raw.oldPrice !== undefined && raw.oldPrice !== null && String(raw.oldPrice).trim() !== '') {
      const oldPriceNum = cleanPriceNumber(raw.oldPrice);
      if (oldPriceNum === null) {
        warnings.push('Old price was formatted incorrectly and was omitted.');
      } else if (oldPriceNum > 0) {
        oldPrice = Math.round(oldPriceNum);
        if (oldPrice <= price) {
          warnings.push('Old price is less than or equal to current price.');
        }
      }
    }

    // 5. Images (Requirement 6: generic fallback NOT auto-published unless explicitly configured)
    const rawImagesString = Array.isArray(raw.images) ? raw.images.join(',') : String(raw.images || '');
    if (rawImagesString.trim()) {
      const rawImageParts = rawImagesString.split(/[,|\n;]/).map((s) => s.trim()).filter(Boolean);
      for (const part of rawImageParts) {
        if (!part.startsWith('/media/')) {
          try {
            const u = new URL(part);
            if (!['http:', 'https:'].includes(u.protocol)) {
              errors.push(`Invalid image URL scheme: "${part}" (must be http or https).`);
            }
          } catch {
            errors.push(`Malformed image URL: "${part}".`);
          }
        }
      }
    }
    const images = cleanImageUrls(raw.images, {
      allowGenericFallback: options.allowGenericFallback,
      categorySlug,
    });
    const hasMissingImage = images.length === 0;
    if (hasMissingImage) {
      warnings.push('No product image provided. Flagged for admin review (generic fallback will not be auto-published).');
    }

    // 6. Availability & Weights
    const available = cleanBooleanValue(raw.available);
    const parsedWeightPrices = parseWeightPricesString(raw.weightPrices || raw.weightOptions, price ?? undefined);
    let weightPrices: WeightPriceOption[] | undefined;
    let weightOptions: string[] | undefined;

    if (parsedWeightPrices && parsedWeightPrices.length > 0) {
      weightPrices = parsedWeightPrices;
      weightOptions = parsedWeightPrices.map((wp) => wp.weight);
      if (price === null || price === 0) {
        price = Math.min(...parsedWeightPrices.map((wp) => wp.price));
      }
    } else {
      weightOptions = cleanWeightOptions(raw.weightOptions);
    }
    const description = (raw.description || '').trim();
    const sku = raw.sku ? raw.sku.trim() : undefined;

    // 7. Duplicate Detection against existing database catalogue
    let isDuplicate = false;
    let duplicateMatchId: string | undefined = undefined;
    let duplicateMatchName: string | undefined = undefined;
    let duplicateMatchType: 'sku' | 'name_category' | undefined = undefined;

    // Step A: SKU match
    if (sku) {
      const skuLower = sku.toLowerCase();
      const matchedBySku = existingProducts.find(
        (p) =>
          p.sku?.toLowerCase() === skuLower ||
          p.id.toLowerCase() === skuLower ||
          p.id.toLowerCase() === `prod-${skuLower}` ||
          p.id.toLowerCase() === `sku_${skuLower}`
      );
      if (matchedBySku) {
        isDuplicate = true;
        duplicateMatchId = matchedBySku.id;
        duplicateMatchName = matchedBySku.name;
        duplicateMatchType = 'sku';
      }
    }

    // Step B: Normalized Name + Category match (if not matched by SKU)
    if (!isDuplicate && name) {
      const normName = normalizeForMatch(name);
      const matchedByName = existingProducts.find((p) => {
        const matchesName = normalizeForMatch(p.name) === normName;
        const matchesCategory =
          p.categoryId === categoryId ||
          p.categorySlug === categorySlug ||
          normalizeForMatch(p.categoryName || '') === normalizeForMatch(categoryName);
        return matchesName && matchesCategory;
      });

      if (matchedByName) {
        isDuplicate = true;
        duplicateMatchId = matchedByName.id;
        duplicateMatchName = matchedByName.name;
        duplicateMatchType = 'name_category';
      }
    }

    // Step C: Check for duplicate within the uploaded file itself
    if (sku) {
      if (seenInternalSkus.has(sku.toLowerCase())) {
        warnings.push(`Duplicate SKU "${sku}" already appeared in an earlier row of this file.`);
      } else {
        seenInternalSkus.add(sku.toLowerCase());
      }
    }
    const internalKey = `${normalizeForMatch(name)}::${categorySlug}`;
    if (name) {
      if (seenInternalKeys.has(internalKey)) {
        warnings.push(`Product with name "${name}" in category "${categoryName}" already appeared earlier in this file.`);
      } else {
        seenInternalKeys.add(internalKey);
      }
    }

    // 8. Assign overall row status
    let status: 'valid_new' | 'duplicate' | 'invalid' = 'valid_new';
    if (errors.length > 0) {
      status = 'invalid';
    } else if (isDuplicate) {
      status = 'duplicate';
    }

    const itemSlug = slugify(name);

    parsedItems.push({
      rowNumber,
      raw,
      name,
      slug: itemSlug,
      categoryName,
      categorySlug,
      categoryId,
      isNewCategory,
      description,
      price,
      oldPrice,
      sku,
      images,
      available,
      weightOptions,
      weightPrices,
      featured: false,
      bestseller: false,
      displayOrder: existingProducts.length + idx + 1,
      status,
      errors,
      warnings,
      duplicateMatchId,
      duplicateMatchName,
      duplicateMatchType,
      duplicateAction: 'skip', // default for duplicate rows
      selected: status !== 'invalid', // select valid items by default
      hasMissingImage,
      needsImageReview: hasMissingImage,
    });
  });

  const validNewCount = parsedItems.filter((i) => i.status === 'valid_new').length;
  const duplicateCount = parsedItems.filter((i) => i.status === 'duplicate').length;
  const invalidCount = parsedItems.filter((i) => i.status === 'invalid').length;
  const missingImageCount = parsedItems.filter((i) => i.hasMissingImage).length;

  return {
    items: parsedItems,
    summary: {
      total: parsedItems.length,
      validNewCount,
      duplicateCount,
      invalidCount,
      missingImageCount,
      newCategories: Array.from(newCategoriesMap.values()),
    },
  };
}

/**
 * Generate Sample CSV Template for download
 */
export function generateSampleCsvTemplate(): string {
  return [
    'Category,Product Name,Description,Price,Old Price,SKU,Images,Availability,Weight Options',
    'Cakes,Eggless Belgian Dark Truffle Cake,"Handcrafted moist sponge layered with silky Belgian dark chocolate ganache",699,799,CK-BEL-01,https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800,in_stock,"500g, 1kg, 2kg"',
    'Cakes,Fresh Fruit & Almond Gateau,"Pure vanilla sponge frosted with light cream and loaded with seasonal kiwis, berries and roasted almonds",749,849,CK-FRT-02,https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=800,in_stock,"500g, 1kg"',
    'Flowers,Classic Red Dutch Roses (12 Stems),"Twelve fresh crimson Dutch roses tied with golden satin ribbon and luxury paper wrapping",599,699,FL-ROS-12,https://images.unsplash.com/photo-1561181286-d3fee7d55364?q=80&w=800,in_stock,',
    'Flowers,Graceful Asiatic White Lilies (6 Stems),"Six pristine white Asiatic lily stems with fresh greenery in signature boutique wrap",899,999,FL-LIL-06,https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=800,in_stock,',
    'Combos,Deluxe Birthday Celebration Combo,"1/2 kg Chocolate Truffle Cake paired with a bouquet of 10 red roses and greeting card",1299,1499,CM-BDY-01,https://images.unsplash.com/photo-1587899897387-091ebd01a6b2?q=80&w=800,in_stock,"500g Cake"',
    'Chocolates,Artisanal Assorted Praline Box,"Box of 12 handcrafted gourmet chocolates in dark, milk and hazelnut flavors",449,499,CH-PRL-12,https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=800,in_stock,"12 pcs"',
  ].join('\r\n');
}

/**
 * Generate Sample JSON Template for download
 */
export function generateSampleJsonTemplate(): string {
  const sample = [
    {
      category: 'Cakes',
      name: 'Eggless Belgian Dark Truffle Cake',
      description: 'Handcrafted moist sponge layered with silky Belgian dark chocolate ganache',
      price: 699,
      oldPrice: 799,
      sku: 'CK-BEL-01',
      images: ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800'],
      available: true,
      weightOptions: ['500g', '1kg', '2kg'],
    },
    {
      category: 'Cakes',
      name: 'Red Velvet Cream Cheese Cake',
      description: 'Velvety crimson sponge layered with authentic cream cheese frosting',
      price: 749,
      oldPrice: 849,
      sku: 'CK-RVC-02',
      images: ['https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?q=80&w=800'],
      available: true,
      weightOptions: ['500g', '1kg'],
    },
    {
      category: 'Flowers',
      name: 'Classic Red Dutch Roses (12 Stems)',
      description: 'Twelve fresh crimson Dutch roses tied with golden satin ribbon',
      price: 599,
      oldPrice: 699,
      sku: 'FL-ROS-12',
      images: ['https://images.unsplash.com/photo-1561181286-d3fee7d55364?q=80&w=800'],
      available: true,
      weightOptions: [],
    },
    {
      category: 'Combos',
      name: 'Deluxe Birthday Celebration Combo',
      description: '1/2 kg Chocolate Truffle Cake paired with a bouquet of 10 red roses',
      price: 1299,
      oldPrice: 1499,
      sku: 'CM-BDY-01',
      images: ['https://images.unsplash.com/photo-1587899897387-091ebd01a6b2?q=80&w=800'],
      available: true,
      weightOptions: ['500g Cake'],
    },
  ];
  return JSON.stringify(sample, null, 2);
}
