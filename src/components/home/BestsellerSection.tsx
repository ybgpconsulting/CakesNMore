import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../products/ProductCard';

export const BestsellerSection: React.FC = () => {
  const { categories, getBestsellerProducts } = useStore();
  const [activeTab, setActiveTab] = useState<'all' | 'cakes' | 'flowers' | 'combos'>('all');
  const allBestsellers = getBestsellerProducts();
  const tabs = [
    { id: 'all', label: 'All bestsellers' },
    { id: 'cakes', label: 'Artisanal Cakes' },
    { id: 'flowers', label: 'Fresh Blooms' },
    { id: 'combos', label: 'Celebration Combos' },
  ] as const;

  if (allBestsellers.length === 0) return null;

  const filteredBestsellers = allBestsellers.filter((product) => {
    if (activeTab === 'all') return true;
    const category = categories.find((item) => item.id === product.categoryId);
    const slug = (product.categorySlug || category?.slug || product.categoryName || '').toLowerCase();
    if (activeTab === 'cakes') return slug === 'cake' || slug === 'cakes';
    if (activeTab === 'flowers') return slug.includes('flower') || slug.includes('bouquet');
    if (activeTab === 'combos') return ['combo', 'combos', 'gift', 'gifts', 'hamper', 'hampers'].includes(slug);
    return true;
  });

  return (
    <section className="py-16 sm:py-24 bg-[#FAF7F0] border-b border-[#E8E2D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <span className="eyebrow-tag text-[#C5A46D] block mb-2">Store-selected bestsellers</span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#30251F] tracking-tight">
              Current Bestsellers
            </h2>
            <p className="text-sm sm:text-base text-[#81776C] mt-2 max-w-xl font-normal">
              Browse the products currently marked as bestsellers, with their available options and prices.
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
        <div
          role="tablist"
          aria-label="Filter bestsellers by category"
          className="mb-8 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar sm:mb-10"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
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

        {filteredBestsellers.length > 0 ? (
          <div className="-mx-4 flex min-w-0 snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:gap-6 sm:px-6 lg:-mx-8 lg:px-8">
            {filteredBestsellers.slice(0, 10).map((product) => (
              <div key={product.id} className="w-[min(78vw,17rem)] flex-none snap-start sm:w-72">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-[#E8E2D5] bg-white p-6 text-sm text-[#81776C]">
            No bestsellers are currently listed in this collection.
          </p>
        )}
      </div>
    </section>
  );
};
