import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { WhatsAppIcon } from '../common/WhatsAppIcon';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';

interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const { addToCart, generateSingleProductWhatsAppUrl } = useCart();
  const { settings } = useStore();
  const isCake = product.categoryId === 'cat-cakes' || product.categorySlug === 'cakes';

  const [selectedImage, setSelectedImage] = useState<string>(
    product.images?.[0] || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop'
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedWeight, setSelectedWeight] = useState<string | undefined>(product.weightOptions?.[0]);
  const [customMessage, setCustomMessage] = useState<string>('');
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const discountPercent =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 0;

  const handleAddToCart = () => {
    if (!product.available) return;
    addToCart(product, quantity, selectedWeight, customMessage);
    onClose();
  };

  const directWhatsAppUrl = generateSingleProductWhatsAppUrl(
    product,
    settings,
    quantity,
    selectedWeight,
    customMessage
  );

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="quick-view-title" className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative bg-white rounded-3xl max-w-3xl w-full max-h-[90dvh] overflow-y-auto shadow-2xl border border-gray-100 my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          ref={closeButtonRef}
          aria-label="Close modal"
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-gray-100 text-gray-700 shadow transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Images Section */}
          <div className="p-6 bg-[#FAF8F5] flex flex-col justify-between">
            <div className="aspect-square rounded-2xl overflow-hidden bg-white shadow-inner">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail selector if multiple images */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      selectedImage === img ? 'border-[#831843] scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Content & Ordering Section */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-[#831843] uppercase tracking-wider">
                  {product.categoryName || 'Catalogue'}
                </span>
                {product.available ? (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Fresh in Store
                  </span>
                ) : (
                  <span className="text-[10px] bg-gray-200 text-gray-700 font-bold px-2 py-0.5 rounded-full">
                    Sold Out
                  </span>
                )}
              </div>

              <h2 id="quick-view-title" className="font-serif text-2xl font-bold text-gray-900 leading-snug">
                {product.name}
              </h2>

              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-extrabold text-gray-950">₹{product.price}</span>
                {product.oldPrice && product.oldPrice > product.price && (
                  <>
                    <span className="text-sm text-gray-400 line-through">₹{product.oldPrice}</span>
                    <span className="text-xs bg-[#FCE7F3] text-[#831843] font-bold px-2 py-0.5 rounded">
                      {discountPercent}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* 100% Eggless Vegetarian Guarantee */}
              {isCake && <div className="mt-2.5 inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold w-fit">
                  <span className="w-3 h-3 border-2 border-emerald-700 p-0.5 flex items-center justify-center rounded-xs bg-white shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-700"></span>
                  </span>
                  <span>100% Eggless • Pure Veg</span>
              </div>}

              <p className="text-xs sm:text-sm text-gray-600 mt-3 leading-relaxed line-clamp-3">
                {product.description}
              </p>

              {/* Weight Options */}
              {product.weightOptions && product.weightOptions.length > 0 && (
                <div className="mt-4">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Select Weight
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.weightOptions.map((weight) => (
                      <button
                        key={weight}
                        type="button"
                        onClick={() => setSelectedWeight(weight)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                          selectedWeight === weight
                            ? 'bg-[#831843] text-white border-[#831843]'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        {weight}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Message Field */}
              {product.allowCustomMessage && (
                <div className="mt-3">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Custom Message on Cake or Greeting Card
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    placeholder={product.customMessagePlaceholder || 'E.g., Happy Birthday Amit!'}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#831843] focus:outline-none"
                  />
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mt-4 flex items-center gap-4">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Quantity</span>
                <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-1.5 text-gray-600 hover:text-gray-900"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-3 text-sm font-bold text-gray-800">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                    className="p-1.5 text-gray-600 hover:text-gray-900"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons: Add to Cart & Order on WhatsApp */}
            <div className="space-y-2 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!product.available}
                className="w-full py-3 px-4 rounded-xl bg-[#831843] hover:bg-[#6b1336] text-white font-bold text-sm shadow flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart (₹{product.price * quantity})</span>
              </button>

              <a
                href={product.available ? directWhatsAppUrl : undefined}
                target="_blank"
                rel="noopener noreferrer"
                aria-disabled={!product.available}
                onClick={(event) => {
                  if (!product.available) event.preventDefault();
                }}
                className={`w-full py-3 px-4 rounded-xl text-white font-bold text-sm shadow flex items-center justify-center gap-2 transition-all ${
                  product.available ? 'bg-[#25D366] hover:bg-[#20bd5a]' : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>{product.available ? 'Instant Order on WhatsApp' : 'Currently Unavailable'}</span>
              </a>

              <div className="text-center pt-1">
                <Link
                  to={`/product/${product.slug}`}
                  onClick={onClose}
                  className="text-xs text-gray-500 hover:text-[#831843] underline font-medium"
                >
                  View full product details &amp; customer reviews →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
