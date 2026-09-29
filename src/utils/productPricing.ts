import { Product, WeightPriceOption } from '../types';

/**
 * Calculates the lowest starting price for a product.
 * If weight-wise prices are defined (e.g. 500gm = ₹500, 1kg = ₹900),
 * this returns the minimum price to display in menus and product cards.
 */
export function getLowestPrice(product: Product): { price: number; oldPrice?: number } {
  if (product.weightPrices && product.weightPrices.length > 0) {
    let minEntry = product.weightPrices[0];
    for (const entry of product.weightPrices) {
      if (entry.price < minEntry.price) {
        minEntry = entry;
      }
    }
    return {
      price: minEntry.price,
      oldPrice: minEntry.oldPrice ?? (product.oldPrice && product.oldPrice > minEntry.price ? product.oldPrice : undefined),
    };
  }

  return {
    price: product.price,
    oldPrice: product.oldPrice,
  };
}

/**
 * Gets the price for a specific selected weight option.
 * If no matching weight is found, falls back to the lowest variant price or base product price.
 */
export function getWeightPrice(
  product: Product,
  selectedWeight?: string
): { price: number; oldPrice?: number } {
  if (product.weightPrices && product.weightPrices.length > 0) {
    if (selectedWeight) {
      const normalizedSelected = selectedWeight.toLowerCase().trim();
      const match = product.weightPrices.find(
        (wp) => wp.weight.toLowerCase().trim() === normalizedSelected
      );
      if (match) {
        return {
          price: match.price,
          oldPrice: match.oldPrice,
        };
      }
    }
    // Default to lowest variant price
    return getLowestPrice(product);
  }

  return {
    price: product.price,
    oldPrice: product.oldPrice,
  };
}

/**
 * Checks whether a product has multiple weight/size options with distinct prices.
 */
export function hasMultipleWeightPrices(product: Product): boolean {
  return Boolean(product.weightPrices && product.weightPrices.length > 1);
}

/**
 * Parses weight prices from comma/pipe-separated strings, objects, or text.
 * Examples supported:
 * - "500g: 500, 1kg: 900, 2kg: 1700"
 * - "500gm - ₹500, 1kg - ₹900"
 * - "500g:500:600, 1kg:900:1100" (weight:price:oldPrice)
 */
export function parseWeightPricesString(
  val: unknown,
  fallbackBasePrice?: number
): WeightPriceOption[] | undefined {
  if (!val) return undefined;

  // Already parsed array of objects
  if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object' && val[0] !== null) {
    const list: WeightPriceOption[] = [];
    for (const item of val) {
      const rec = item as Record<string, unknown>;
      const weight = String(rec.weight || '').trim();
      const price = Number(rec.price);
      const oldPrice = rec.oldPrice != null ? Number(rec.oldPrice) : undefined;
      if (weight && !isNaN(price) && price >= 0) {
        list.push({ weight, price, oldPrice: oldPrice && oldPrice > price ? oldPrice : undefined });
      }
    }
    return list.length > 0 ? list : undefined;
  }

  // String format
  if (typeof val === 'string' && val.trim()) {
    const parts = val.split(/[,|\n;]/).map((s) => s.trim()).filter(Boolean);
    const list: WeightPriceOption[] = [];

    for (const part of parts) {
      // Check if price is included e.g. "500g: 500" or "500gm - ₹500"
      if (part.includes(':') || part.includes('-') || part.includes('=')) {
        const separator = part.includes(':') ? ':' : part.includes('=') ? '=' : '-';
        const segments = part.split(separator).map((s) => s.trim());
        const weight = segments[0];
        const rawPrice = segments[1]?.replace(/[₹$€£\s,Rs.]/gi, '');
        const rawOldPrice = segments[2]?.replace(/[₹$€£\s,Rs.]/gi, '');

        const price = Number(rawPrice);
        const oldPrice = rawOldPrice ? Number(rawOldPrice) : undefined;

        if (weight && !isNaN(price) && price >= 0) {
          list.push({
            weight,
            price,
            oldPrice: oldPrice && oldPrice > price ? oldPrice : undefined,
          });
          continue;
        }
      }

      // No price specified on this segment (e.g. just "500g")
      const weight = part.trim();
      if (weight && fallbackBasePrice !== undefined && fallbackBasePrice >= 0) {
        list.push({
          weight,
          price: fallbackBasePrice,
        });
      }
    }

    return list.length > 0 ? list : undefined;
  }

  return undefined;
}

/**
 * Formats WeightPriceOption array into editable string format.
 * E.g. "500g: 500, 1kg: 900, 2kg: 1700"
 */
export function formatWeightPricesString(options?: WeightPriceOption[]): string {
  if (!options || options.length === 0) return '';
  return options
    .map((opt) => (opt.oldPrice ? `${opt.weight}: ${opt.price}:${opt.oldPrice}` : `${opt.weight}: ${opt.price}`))
    .join(', ');
}
