import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { WhatsAppIcon } from '../common/WhatsAppIcon';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import { getWeightPrice } from '../../utils/productPricing';
import { CAKE_FLAVOURS } from '../../data/cakeFlavours';

interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const { addToCart, generateSingleProductWhatsAppUrl } = useCart();
  const { settings } = useStore();
  const isCake = product.categoryId === 'cat-cakes' || product.categorySlug === 'cakes';

  const [selectedImage, setSelectedImage] = useState<string>(
    product.images?.[0] || '/social-share-1200x630.jpg'
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedWeight, setSelectedWeight] = useState<string | undefined>(product.weightOptions?.[0]);
  const [selectedFlavour, setSelectedFlavour] = useState<string | undefined>(undefined);
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

  const currentPricing = getWeightPrice(product, selectedWeight);

  const discountPercent =
    currentPricing.oldPrice && currentPricing.oldPrice > currentPricing.price
      ? Math.round(((currentPricing.oldPrice - currentPricing.price) / currentPricing.oldPrice) * 100)
      : 0;

  const handleAddToCart = () => {
    if (!product.available || (product.allowFlavourSelection && !selectedFlavour)) return;
    addToCart(product, quantity, selectedWeight, customMessage, currentPricing.price, selectedFlavour);
    onClose();
  };

  const directWhatsAppUrl = generateSingleProductWhatsAppUrl(
    product,
    settings,
    quantity,
    selectedWeight,
    customMessage,
    currentPricing.price,
    selectedFlavour
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-view-title"
      className="fixed inset-0 z-50 bg-[#30251F]/65 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
    >
      <div className="relative bg-[#FAF7F0] rounded-t-[32px] sm:rounded-3xl max-w-3xl w-full max-h-[90dvh] overflow-y-auto shadow-2xl border-t sm:border border-[#E8E2D5] animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-250 text-[#30251F]">
        {/* Mobile Drag Handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <span className="w-10 h-1 rounded-full bg-[#D8D2C5]" />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          ref={closeButtonRef}
          aria-label="Close modal"
          className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10 p-2 rounded-full bg-[#FFFFFF] hover:bg-[#F3EFE6] text-[#81776C] hover:text-[#30251F] shadow-sm transition-colors border border-[#E8E2D5]"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Images Section */}
          <div className="p-6 bg-[#FFFFFF] flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#E8E2D5]">
            <div className="aspect-square rounded-2xl overflow-hidden bg-[#FAF7F0] shadow-sm border border-[#E8E2D5]">
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
                      selectedImage === img ? 'border-[#30251F] scale-105 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100 hover:border-[#C5A46D]'
                    }`}
                  >
                    <img src={img} alt={`${product.name} thumbnail ${idx + 1}`} width={56} height={56} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Content & Ordering Section */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-4 bg-[#FAF7F0]">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-bold text-[#C5A46D] uppercase tracking-[0.18em]">
                  {product.categoryName || 'Catalogue'}
                </span>
                {product.available ? (
                  <span className="text-[10px] bg-[#244438]/10 text-[#244438] font-semibold px-2 py-0.5 rounded-full border border-[#244438]/20">
                    In Stock
                  </span>
                ) : (
                  <span className="text-[10px] bg-[#E8E2D5] text-[#81776C] font-semibold px-2 py-0.5 rounded-full">
                    Sold Out
                  </span>
                )}
              </div>

              <h2 id="quick-view-title" className="font-serif text-2xl sm:text-3xl font-bold text-[#30251F] leading-snug">
                {product.name}
              </h2>

              <div className="flex items-baseline gap-2.5 mt-2">
                <span className="font-serif text-2xl sm:text-3xl font-bold text-[#30251F]">₹{currentPricing.price}</span>
                {currentPricing.oldPrice && currentPricing.oldPrice > currentPricing.price && (
                  <>
                    <span className="text-sm text-[#81776C] line-through">₹{currentPricing.oldPrice}</span>
                    <span className="text-xs bg-[#E8CECB] text-[#30251F] font-bold px-2 py-0.5 rounded-md">
                      {discountPercent}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* 100% Eggless Vegetarian Guarantee */}
              {isCake && (
                <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#244438]/10 border border-[#244438]/20 text-[#244438] text-xs font-semibold w-fit">
                  <span className="w-3.5 h-3.5 border border-[#244438] p-0.5 flex items-center justify-center rounded-[2px] bg-transparent shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#244438]"></span>
                  </span>
                  <span>100% Eggless • Pure Vegetarian</span>
                </div>
              )}

              <p className="text-xs sm:text-sm text-[#81776C] mt-3 leading-relaxed line-clamp-3">
                {product.description}
              </p>

              {/* Weight Options */}
              {product.weightOptions && product.weightOptions.length > 0 && (
                <div className="mt-4">
                  <label className="block text-[11px] font-bold text-[#81776C] uppercase tracking-[0.14em] mb-1.5">
                    Select Weight
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.weightOptions.map((weight) => {
                      const wp = getWeightPrice(product, weight);
                      const hasRate = Boolean(product.weightPrices && product.weightPrices.length > 0);
                      return (
                        <button
                          key={weight}
                          type="button"
                          onClick={() => setSelectedWeight(weight)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${
                            selectedWeight === weight
                              ? 'bg-[#30251F] text-[#FAF7F0] border-[#30251F] shadow-sm'
                              : 'bg-[#FFFFFF] text-[#81776C] border-[#E8E2D5] hover:border-[#30251F] hover:text-[#30251F]'
                          }`}
                        >
                          <span>{weight}</span>
                          {hasRate && (
                            <span className={selectedWeight === weight ? 'text-[#FAF7F0]/80 text-[11px]' : 'text-[#81776C] text-[11px]'}>
                              (₹{wp.price})
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {product.allowFlavourSelection && (
                <div className="mt-3.5">
                  <label htmlFor="quick-view-cake-flavour" className="block text-[11px] font-bold text-[#81776C] uppercase tracking-[0.14em] mb-1.5">
                    Select Cake Flavour *
                  </label>
                  <select
                    id="quick-view-cake-flavour"
                    required
                    value={selectedFlavour || ''}
                    onChange={(event) => setSelectedFlavour(event.target.value || undefined)}
                    className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#E8E2D5] text-[#30251F] rounded-xl text-xs sm:text-sm focus:border-[#30251F] focus:ring-1 focus:ring-[#30251F] focus:outline-none"
                  >
                    <option value="" disabled className="bg-white">Choose an artisanal flavour</option>
                    {CAKE_FLAVOURS.map((flavour) => (
                      <option key={flavour} value={flavour} className="bg-white">{flavour}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Custom Message Field */}
              {product.allowCustomMessage && (
                <div className="mt-3.5">
                  <label className="block text-[11px] font-bold text-[#81776C] uppercase tracking-[0.14em] mb-1">
                    Custom Inscription or Card Note
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    placeholder={product.customMessagePlaceholder || 'E.g., Happy Birthday Amit!'}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#E8E2D5] text-[#30251F] placeholder-[#81776C]/60 rounded-xl text-xs sm:text-sm focus:border-[#30251F] focus:ring-1 focus:ring-[#30251F] focus:outline-none"
                  />
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mt-4 flex items-center gap-4">
                <span className="text-[11px] font-bold text-[#81776C] uppercase tracking-[0.14em]">Quantity</span>
                <div className="flex items-center border border-[#E8E2D5] rounded-full bg-[#FFFFFF] px-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-1.5 text-[#81776C] hover:text-[#30251F] transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-sm font-semibold text-[#30251F]">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                    className="p-1.5 text-[#81776C] hover:text-[#30251F] transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons: Add to Cart & Order on WhatsApp */}
            <div className="space-y-2.5 pt-4 border-t border-[#E8E2D5]">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!product.available || (product.allowFlavourSelection && !selectedFlavour)}
                className="w-full py-3.5 px-4 rounded-full bg-[#30251F] hover:bg-[#201814] text-[#FAF7F0] font-serif font-bold text-sm tracking-wide shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Bag (₹{currentPricing.price * quantity})</span>
              </button>

              <a
                href={product.available ? directWhatsAppUrl : undefined}
                target="_blank"
                rel="noopener noreferrer"
                aria-disabled={!product.available || (product.allowFlavourSelection && !selectedFlavour)}
                onClick={(event) => {
                  if (!product.available || (product.allowFlavourSelection && !selectedFlavour)) event.preventDefault();
                }}
                className={`w-full py-3 px-4 rounded-full font-semibold text-sm shadow-sm flex items-center justify-center gap-2 transition-all ${
                  product.available && (!product.allowFlavourSelection || selectedFlavour)
                    ? 'bg-[#244438] hover:bg-[#1a3229] text-white cursor-pointer'
                    : 'bg-[#E8E2D5] text-[#81776C] cursor-not-allowed'
                }`}
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>{!product.available ? 'Currently Unavailable' : product.allowFlavourSelection && !selectedFlavour ? 'Select a Flavour to Order' : 'Instant Order on WhatsApp'}</span>
              </a>

              <div className="text-center pt-1">
                <Link
                  to={`/product/${product.slug}`}
                  onClick={onClose}
                  className="text-xs text-[#30251F] hover:text-[#C5A46D] hover:underline font-medium"
                >
                  View full product details &amp; tasting notes →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
