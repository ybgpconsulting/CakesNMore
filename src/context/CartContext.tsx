import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, CustomerDeliveryAddress, Product, StoreSettings, VerifiedLocation } from '../types';
import { formatDistanceKm, getGoogleMapsLocationUrl } from '../utils/distance';
import { getWeightPrice } from '../utils/productPricing';
import { generateWhatsAppUrl, normalizeWhatsAppNumber } from '../utils/urls';
import { useStore } from './StoreContext';

interface CartContextType {
  cart: CartItem[];
  addToCart: (
    product: Product,
    quantity?: number,
    selectedWeight?: string,
    customMessage?: string,
    unitPrice?: number
  ) => void;
  removeFromCart: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  totalQuantity: number;
  toastMessage: string | null;
  hideToast: () => void;
  getItemUnitPrice: (item: CartItem) => number;
  generateWhatsAppOrderUrl: (
    settings: StoreSettings,
    customerNotes?: string,
    deliveryPayload?: {
      customerAddress?: CustomerDeliveryAddress;
      verifiedLocation?: VerifiedLocation | null;
      radiusKm?: number;
    }
  ) => string;
  generateSingleProductWhatsAppUrl: (
    product: Product,
    settings: StoreSettings,
    quantity?: number,
    weight?: string,
    customMessage?: string,
    unitPrice?: number
  ) => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'fnp_noida76_cart_v1';

function readStoredCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is CartItem => {
      if (!item || typeof item !== 'object') return false;
      const candidate = item as Partial<CartItem>;
      return Boolean(
        candidate.product &&
        typeof candidate.product.id === 'string' &&
        typeof candidate.product.name === 'string' &&
        typeof candidate.product.price === 'number' &&
        Number.isFinite(candidate.product.price) &&
        typeof candidate.quantity === 'number' &&
        Number.isFinite(candidate.quantity) &&
        candidate.quantity > 0
      );
    });
  } catch {
    localStorage.removeItem(CART_STORAGE_KEY);
    return [];
  }
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { products } = useStore();
  const [cart, setCart] = useState<CartItem[]>(() => {
    return readStoredCart();
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn('Could not save cart to localStorage', e);
    }
  }, [cart]);

  useEffect(() => {
    const currentProducts = new Map(products.map((product) => [product.id, product]));
    setCart((previous) => {
      const reconciled = previous.flatMap((item) => {
        const currentProduct = currentProducts.get(item.product.id);
        if (!currentProduct || !currentProduct.available) return [];
        return [{ ...item, product: currentProduct }];
      });
      const unchanged = reconciled.length === previous.length && reconciled.every(
        (item, index) => item.product === previous[index].product
      );
      return unchanged ? previous : reconciled;
    });
  }, [products]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 3000);
  };

  const hideToast = () => setToastMessage(null);

  const getItemUnitPrice = (item: CartItem): number => {
    if (typeof item.unitPrice === 'number' && Number.isFinite(item.unitPrice) && item.unitPrice >= 0) {
      return item.unitPrice;
    }
    return getWeightPrice(item.product, item.selectedWeight).price;
  };

  const addToCart = (
    product: Product,
    quantity = 1,
    selectedWeight?: string,
    customMessage?: string,
    unitPrice?: number
  ) => {
    if (!product.available) {
      showToast(`"${product.name}" is currently unavailable`);
      return;
    }
    const safeQuantity = Math.max(1, Math.min(99, Math.floor(quantity || 1)));
    const sanitizedProduct: Product = {
      ...product,
      price: Math.max(0, Number(product.price) || 0),
    };
    const effectiveUnitPrice = typeof unitPrice === 'number' && Number.isFinite(unitPrice) && unitPrice >= 0
      ? unitPrice
      : getWeightPrice(product, selectedWeight).price;

    setCart((prev) => {
      // Find if identical product with exact same variations already in cart
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedWeight === selectedWeight &&
          item.customMessage === customMessage
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity = Math.min(99, updated[existingIndex].quantity + safeQuantity);
        if (updated[existingIndex].unitPrice === undefined) {
          updated[existingIndex].unitPrice = effectiveUnitPrice;
        }
        return updated;
      } else {
        return [
          ...prev,
          {
            product: sanitizedProduct,
            quantity: safeQuantity,
            selectedWeight,
            customMessage,
            unitPrice: effectiveUnitPrice,
          },
        ];
      }
    });

    showToast(`Added "${product.name}" to cart`);
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, quantity: number) => {
    const safeQuantity = Math.floor(quantity);
    if (safeQuantity <= 0) {
      removeFromCart(index);
      return;
    }
    setCart((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index].quantity = Math.min(99, safeQuantity);
      }
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + getItemUnitPrice(item) * Math.max(1, Math.floor(item.quantity) || 1),
    0
  );
  const totalQuantity = cart.reduce((sum, item) => sum + Math.max(1, Math.floor(item.quantity) || 1), 0);

  /**
   * Generates the compliant WhatsApp Order message and returns the wa.me URL
   */
  const generateWhatsAppOrderUrl = (
    settings: StoreSettings,
    customerNotes = '',
    deliveryPayload?: {
      customerAddress?: CustomerDeliveryAddress;
      verifiedLocation?: VerifiedLocation | null;
      radiusKm?: number;
    }
  ): string => {
    const cleanNumber = normalizeWhatsAppNumber(settings?.whatsappNumber);

    // Format products list
    const productLines = cart.map((item, index) => {
      const optionsParts = [];
      if (item.selectedWeight) optionsParts.push(`Weight: ${item.selectedWeight}`);
      if (item.product.categoryId === 'cat-cakes' || item.product.categorySlug === 'cakes') {
        optionsParts.push(`Type: 100% Eggless`);
      }
      if (item.customMessage) optionsParts.push(`Message on Cake/Card: "${item.customMessage}"`);
      const optionsText = optionsParts.length > 0 ? `\n   (${optionsParts.join(', ')})` : '';

      const itemPrice = getItemUnitPrice(item);
      const itemSubtotal = itemPrice * item.quantity;
      return `${index + 1}. ${item.product.name}${optionsText}\n   Qty: ${item.quantity}\n   Price: ₹${itemPrice}\n   Subtotal: ₹${itemSubtotal}`;
    });

    const productsBlock = productLines.join('\n\n');

    let deliveryBlock = '';
    const addr = deliveryPayload?.customerAddress;
    const loc = deliveryPayload?.verifiedLocation;
    const radius = deliveryPayload?.radiusKm || 10;

    if (addr) {
      const distFormatted = loc ? formatDistanceKm(loc.distanceKm) : 'Within standard range';
      const mapsUrl = loc ? getGoogleMapsLocationUrl(loc.latitude, loc.longitude) : '';

      deliveryBlock = `DELIVERY DETAILS

Customer Name: ${addr.name}
Mobile: ${addr.mobile}

Address:
House/Flat: ${addr.houseFlat}
Society/Building: ${addr.buildingSociety}
Area: ${addr.streetArea}
City: ${addr.city}
State: ${addr.state}
Pincode: ${addr.pincode}
${
  loc
    ? `
Delivery Location:
Latitude: ${loc.latitude.toFixed(6)}
Longitude: ${loc.longitude.toFixed(6)}

Distance from Cakes N More Store:
${distFormatted}

Delivery Status:
Verified – Within ${radius} km

Google Maps Location:
${mapsUrl}
`
    : ''
}`;
    }

    const notesBlock = customerNotes.trim()
      ? `Special Instructions / Notes:\n${customerNotes.trim()}`
      : '';

    // Generate formatted message matching prompt specs
    const messageParts = [
      'Hi, I would like to place an order from Cakes N More (Sector 76 Noida).',
      deliveryBlock,
      `Order Details:\n\n${productsBlock}`,
      `Total: ₹${subtotal}`,
      notesBlock,
      'Please confirm product availability and delivery details.',
    ].filter(Boolean);

    const message = messageParts.join('\n\n');
    return generateWhatsAppUrl(cleanNumber, message);
  };

  /**
   * Quick order directly for a single product from the Product Detail Page
   */
  const generateSingleProductWhatsAppUrl = (
    product: Product,
    settings: StoreSettings,
    quantity = 1,
    weight?: string,
    customMessage?: string,
    unitPrice?: number
  ): string => {
    const cleanNumber = normalizeWhatsAppNumber(settings?.whatsappNumber);

    const effectiveUnitPrice = typeof unitPrice === 'number' && Number.isFinite(unitPrice) && unitPrice >= 0
      ? unitPrice
      : getWeightPrice(product, weight).price;

    const optionsParts = [];
    if (weight) optionsParts.push(`Weight: ${weight}`);
    if (product.categoryId === 'cat-cakes' || product.categorySlug === 'cakes') {
      optionsParts.push(`Type: 100% Eggless`);
    }
    if (customMessage) optionsParts.push(`Message: "${customMessage}"`);
    const optionsText = optionsParts.length > 0 ? `\n   (${optionsParts.join(', ')})` : '';

    const total = effectiveUnitPrice * quantity;

    const message = `Hi, I would like to order directly from Cakes N More (Sector 76 Noida).

Product: ${product.name}${optionsText}
Quantity: ${quantity}
Price: ₹${effectiveUnitPrice} each
Total Amount: ₹${total}

Please confirm availability and delivery to Sector 76, Noida.`;

    return generateWhatsAppUrl(cleanNumber, message);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        totalQuantity,
        toastMessage,
        hideToast,
        getItemUnitPrice,
        generateWhatsAppOrderUrl,
        generateSingleProductWhatsAppUrl,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
