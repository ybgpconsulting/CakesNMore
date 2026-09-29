/**
 * Core TypeScript definitions for Cakes N More (Sector 76 Noida)
 */

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  oldPrice?: number;
  sku?: string;
  categoryId: string;
  categoryName?: string;
  categorySlug?: string;
  images: string[];
  featured: boolean;
  bestseller: boolean;
  available: boolean;
  displayOrder: number;
  // Product options/attributes for future-readiness
  weightOptions?: string[]; // e.g. ['500g', '1kg', '2kg']
  selectedWeight?: string;
  allowCustomMessage?: boolean;
  customMessagePlaceholder?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  active: boolean;
  displayOrder: number;
}

export interface StoreSettings {
  businessName: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  mapsUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  twitterUrl: string;
  zomatoUrl?: string;
  swiggyUrl?: string;
  magicpinUrl?: string;
  openingHours: string;
  whatsappMessage: string;
  websiteTitle: string;
  metaDescription: string;
  logo: string;
  bannerAnnouncement: string;
}

export interface HomepageConfig {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  heroCtaText: string;
  heroCtaLink: string;
  promoBannerActive: boolean;
  promoBannerText: string;
  whyUsPoints: {
    title: string;
    description: string;
    icon: string;
  }[];
  footerNote: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedWeight?: string;
  customMessage?: string;
}

export interface AdminUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
  isAdmin: boolean;
}

export interface RecordedOrder {
  id: string;
  customerPhone?: string;
  customerName?: string;
  items: {
    productName: string;
    quantity: number;
    price: number;
    options?: string;
  }[];
  totalAmount: number;
  status: 'whatsapp_sent' | 'confirmed' | 'delivered' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface DeliverySettings {
  enabled: boolean;
  radiusKm: number;
  storeName: string;
  storeLatitude: number;
  storeLongitude: number;
  deliveryMessage: string;
  minOrderValue?: number;
  deliveryCharge?: number;
  freeDeliveryThreshold?: number;
  allowedPincodes?: string[];
  specialDeliveryAreas?: string[];
}

export type DeliveryStatus = 'unknown' | 'checking' | 'available' | 'unavailable' | 'error';

export interface VerifiedLocation {
  verified: boolean;
  latitude: number;
  longitude: number;
  distanceKm: number;
  pincode?: string;
  source: 'gps' | 'map' | 'manual';
  addressText?: string;
  checkedAt: number;
}

export interface CustomerDeliveryAddress {
  name: string;
  mobile: string;
  houseFlat: string;
  buildingSociety: string;
  streetArea: string;
  city: string;
  state: string;
  pincode: string;
  deliveryInstructions: string;
}

export type DuplicateResolutionAction = 'skip' | 'update' | 'create_new';

export interface ImportItemRaw {
  category: string;
  name: string;
  description?: string;
  price: string | number;
  oldPrice?: string | number;
  sku?: string;
  images?: string | string[];
  available?: string | boolean | number;
  weightOptions?: string | string[];
}

export interface ParsedImportItem {
  rowNumber: number;
  raw: ImportItemRaw;
  name: string;
  slug: string;
  categoryName: string;
  categorySlug: string;
  categoryId: string;
  isNewCategory: boolean;
  description: string;
  price: number;
  oldPrice?: number;
  sku?: string;
  images: string[];
  available: boolean;
  weightOptions?: string[];
  featured: boolean;
  bestseller: boolean;
  displayOrder: number;
  status: 'valid_new' | 'duplicate' | 'invalid';
  errors: string[];
  warnings: string[];
  duplicateMatchId?: string;
  duplicateMatchName?: string;
  duplicateMatchType?: 'sku' | 'name_category';
  duplicateAction: DuplicateResolutionAction;
  selected: boolean;
}

export interface ImportHistoryRecord {
  id: string;
  importedAt: string;
  fileName: string;
  fileFormat: string;
  totalItems: number;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  categoriesCreatedCount: number;
  errors: string[];
}

export interface MenuImportPayload {
  fileName: string;
  fileFormat: 'csv' | 'json';
  categoriesToCreate: Category[];
  productsToCreate: Product[];
  productsToUpdate: Product[];
  skippedCount: number;
}

export interface MenuImportResponse {
  ok: boolean;
  summary: ImportHistoryRecord;
}
