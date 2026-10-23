import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Plus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Product } from '../../types';
import { getLowestPrice, hasMultipleWeightPrices } from '../../utils/productPricing';
import { QuickViewModal } from './QuickViewModal';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const lowest = getLowestPrice(product);
  const hasVariants = hasMultipleWeightPrices(product);

  const discountPercent =
    lowest.oldPrice && lowest.oldPrice > lowest.price
      ? Math.round(((lowest.oldPrice - lowest.price) / lowest.oldPrice) * 100)
      : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.available) return;
    if (hasVariants || product.allowFlavourSelection) {
      setQuickViewOpen(true);
      return;
    }
    const defaultWeight = product.weightOptions?.[0];
    addToCart(product, 1, defaultWeight, undefined, lowest.price);
  };

  const primaryImage =
    product.images && product.images.length > 0
      ? product.images[0]
      : '/social-share-1200x630.jpg';

  const secondaryImage =
    product.images && product.images.length > 1 ? product.images[1] : primaryImage;

  const isCake = product.categoryId === 'cat-cakes' || product.categorySlug === 'cakes';

  return (
    <>
      <div
        className="editorial-card group relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-[#E8E2D5] hover:border-[#DFC79E] flex flex-col h-full transition-all duration-300 shadow-2xs hover:shadow-xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Product Image Frame */}
        <Link to={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-[#FAF7F0]">
          <img
            src={isHovered && secondaryImage !== primaryImage ? secondaryImage : primaryImage}
            alt={`${product.name} - Cakes N More Sector 76 Noida`}
            loading="lazy"
            decoding="async"
            width={400}
            height={400}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-104"
          />

          {/* Floating Pill Badges */}
          <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
            {discountPercent > 0 && (
              <span className="bg-[#E8CECB] text-[#30251F] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-2xs">
                {discountPercent}% OFF
              </span>
            )}
            {product.featured && (
              <span className="bg-white/95 text-[#30251F] border border-[#E8E2D5] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-2xs">
                Featured
              </span>
            )}
            {product.bestseller && (
              <span className="bg-white/95 text-[#30251F] border border-[#E8E2D5] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-2xs">
                Bestseller
              </span>
            )}
          </div>

          {/* Pure Veg / Eggless Green Mark in top-right */}
          {isCake && (
            <div
              className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-10 bg-white/90 backdrop-blur-sm p-1.5 rounded-md border border-[#E8E2D5] flex items-center gap-1 shadow-2xs"
              title="100% Pure Vegetarian / Eggless"
            >
              <span className="w-3.5 h-3.5 border border-[#244438] rounded-[2px] flex items-center justify-center shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#244438]" />
              </span>
            </div>
          )}

          {/* Out of Stock Overlay */}
          {!product.available && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center z-20">
              <span className="bg-[#30251F] text-white font-serif font-bold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                Sold Out
              </span>
            </div>
          )}

          {/* Quick View Button for Desktop */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setQuickViewOpen(true);
            }}
            aria-label={`Quick view ${product.name}`}
            className="hidden sm:flex absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white/95 text-[#30251F] hover:bg-[#30251F] hover:text-white shadow-md items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 border border-[#E8E2D5]"
          >
            <Eye className="w-4 h-4" />
          </button>
        </Link>

        {/* Product Details Content */}
        <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between bg-white">
          <div>
            {product.categoryName && (
              <span className="eyebrow-tag text-[10px] text-[#81776C] block truncate mb-1">
                {product.categoryName}
              </span>
            )}

            <Link
              to={`/product/${product.slug}`}
              className="font-serif text-base sm:text-lg font-bold text-[#30251F] hover:text-[#C5A46D] line-clamp-1 transition-colors leading-snug"
            >
              {product.name}
            </Link>

            <p className="text-xs text-[#81776C] line-clamp-2 mt-1.5 leading-relaxed font-normal">
              {product.description}
            </p>

            {/* Quick Weight preview tags */}
            {product.weightOptions && product.weightOptions.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar">
                {product.weightOptions.slice(0, 3).map((w) => (
                  <span
                    key={w}
                    className="text-[10px] font-medium text-[#81776C] bg-[#FAF7F0] px-2 py-0.5 rounded-md border border-[#E8E2D5]"
                  >
                    {w}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Price & Action Row */}
          <div className="mt-4 pt-3 border-t border-[#F0EBE1] flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              {hasVariants && (
                <span className="text-[11px] text-[#81776C] font-normal">From</span>
              )}
              <span className="font-serif text-base sm:text-xl font-bold text-[#30251F]">
                ₹{lowest.price}
              </span>
              {lowest.oldPrice && lowest.oldPrice > lowest.price && (
                <span className="text-xs text-[#B4ACA2] line-through font-normal">
                  ₹{lowest.oldPrice}
                </span>
              )}
            </div>

            {/* Action Button */}
            <button
              onClick={handleAddToCart}
              disabled={!product.available}
              aria-label={hasVariants ? `Select options for ${product.name}` : `Add ${product.name} to cart`}
              className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all active:scale-95 cursor-pointer ${
                product.available
                  ? 'btn-editorial-primary'
                  : 'bg-[#F0EBE1] text-[#9E958A] cursor-not-allowed border border-transparent'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{hasVariants ? 'Options' : 'Add'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewOpen && (
        <QuickViewModal product={product} onClose={() => setQuickViewOpen(false)} />
      )}
    </>
  );
};
