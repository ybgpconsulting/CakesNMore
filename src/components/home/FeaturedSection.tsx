import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../products/ProductCard';

export const FeaturedSection: React.FC = () => {
  const { getFeaturedProducts } = useStore();
  const featuredProducts = getFeaturedProducts();

  if (featuredProducts.length === 0) return null;

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
              Distinguished bakes and floral compositions handcrafted for life’s most cherished celebrations.
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

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {featuredProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
