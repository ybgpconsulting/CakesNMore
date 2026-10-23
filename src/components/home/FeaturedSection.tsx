import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../products/ProductCard';
import { getLowestPrice, hasMultipleWeightPrices } from '../../utils/productPricing';

export const FeaturedSection: React.FC = () => {
  const { getFeaturedProducts } = useStore();
  const featuredProducts = getFeaturedProducts();

  if (featuredProducts.length === 0) return null;
  const [signatureProduct, ...supportingProducts] = featuredProducts;
  const signaturePrice = getLowestPrice(signatureProduct);
  const hasPriceOptions = hasMultipleWeightPrices(signatureProduct);

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-[#E8E2D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-16 gap-4">
          <div>
            <span className="eyebrow-tag text-[#C5A46D] block mb-2">Curated With Passion</span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#30251F] tracking-tight">
              Signature Collections
            </h2>
            <p className="text-sm sm:text-base text-[#81776C] mt-2 max-w-xl font-normal">
              A featured creation, alongside a few more picks from the current catalogue.
            </p>
          </div>

          <Link
            to="/shop?filter=featured"
            className="btn-editorial-secondary inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold self-start md:self-auto"
          >
            <span>Explore Signature Range</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#C5A46D]" />
          </Link>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          <article className="grid min-w-0 overflow-hidden rounded-3xl border border-[#E8E2D5] bg-[#FAF7F0] shadow-sm sm:grid-cols-2 lg:col-span-7">
            <Link
              to={`/product/${signatureProduct.slug}`}
              className="group relative block min-h-72 overflow-hidden bg-[#E8E2D5] sm:min-h-[30rem]"
              aria-label={`View ${signatureProduct.name}`}
            >
              <img
                src={signatureProduct.images?.[0] || '/social-share-1200x630.jpg'}
                alt={signatureProduct.name}
                loading="lazy"
                decoding="async"
                width={700}
                height={900}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#30251F]">
                Featured pick
              </span>
            </Link>

            <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-9">
              <span className="eyebrow-tag text-[#C5A46D]">
                {signatureProduct.categoryName || 'From the catalogue'}
              </span>
              <h3 className="mt-2 font-serif text-2xl font-bold leading-tight text-[#30251F] sm:text-3xl">
                {signatureProduct.name}
              </h3>
              <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-[#81776C]">
                {signatureProduct.description}
              </p>

              <div className="mt-6 flex items-baseline gap-2">
                {hasPriceOptions && <span className="text-xs text-[#81776C]">From</span>}
                <span className="font-serif text-2xl font-bold text-[#30251F]">
                  ₹{signaturePrice.price}
                </span>
                {signaturePrice.oldPrice && signaturePrice.oldPrice > signaturePrice.price && (
                  <span className="text-sm text-[#81776C] line-through">
                    ₹{signaturePrice.oldPrice}
                  </span>
                )}
              </div>

              <Link
                to={`/product/${signatureProduct.slug}`}
                className="btn-editorial-primary mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold sm:w-fit"
              >
                <span>View this creation</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>

          {supportingProducts.length > 0 && (
            <div className="grid min-w-0 grid-cols-2 gap-3 sm:gap-5 lg:col-span-5">
              {supportingProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
