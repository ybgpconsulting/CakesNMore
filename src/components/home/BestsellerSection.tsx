import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../products/ProductCard';

export const BestsellerSection: React.FC = () => {
  const { getBestsellerProducts } = useStore();
  const [activeTab, setActiveTab] = useState<'all' | 'cakes' | 'flowers' | 'combos'>('all');
  const allBestsellers = getBestsellerProducts();

  if (allBestsellers.length === 0) return null;

  const filteredBestsellers = allBestsellers.filter((p) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'cakes') return p.categoryId === 'cat-cakes' || p.categorySlug === 'cakes';
    if (activeTab === 'flowers') return p.categoryId === 'cat-flowers' || p.categorySlug === 'flowers';
    if (activeTab === 'combos') return p.categoryId === 'cat-combos' || p.categorySlug === 'combos' || p.categorySlug === 'gifts';
    return true;
  });

  const displayedProducts = filteredBestsellers.length > 0 ? filteredBestsellers : allBestsellers;

  return (
    <section className="py-16 sm:py-24 bg-[#FAF7F0] border-b border-[#E8E2D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <span className="eyebrow-tag text-[#C5A46D] block mb-2">Most Requested In Sector 76</span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#30251F] tracking-tight">
              Popular Favourites
            </h2>
            <p className="text-sm sm:text-base text-[#81776C] mt-2 max-w-xl font-normal">
              Our neighborhood’s most celebrated eggless celebration cakes, velvety Dutch roses, and curated gifting treats.
            </p>
          </div>

          <Link
            to="/shop?filter=bestseller"
            className="btn-editorial-secondary inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold self-start md:self-auto"
          >
            <span>View All Bestsellers</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#C5A46D]" />
          </Link>
        </div>

        {/* Clean Editorial Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mb-8 sm:mb-10 pb-1">
          {[
            { id: 'all', label: 'All Favourites' },
            { id: 'cakes', label: 'Artisanal Cakes' },
            { id: 'flowers', label: 'Fresh Blooms' },
            { id: 'combos', label: 'Celebration Combos' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
                activeTab === tab.id
                  ? 'btn-editorial-primary'
                  : 'bg-white border border-[#E8E2D5] text-[#81776C] hover:text-[#30251F] hover:border-[#DFC79E]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 2-Col Mobile Grid / 4-Col Desktop Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {displayedProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
