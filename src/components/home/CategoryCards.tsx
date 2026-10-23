import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const CategoryCards: React.FC = () => {
  const { categories } = useStore();

  const primaryEditorialPanels = [
    {
      id: 'panel-cakes',
      title: 'Artisanal Cakes',
      eyebrow: 'Bakery Atelier',
      subtitle: '100% pure vegetarian cakes, cheesecakes & custom photo designs.',
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=900&auto=format&fit=crop',
      link: '/category/cakes',
      ratio: 'aspect-[4/5] lg:aspect-[3/4]',
    },
    {
      id: 'panel-flowers',
      title: 'Fresh Blooms',
      eyebrow: 'Botanical Floristry',
      subtitle: 'Morning-cut Dutch roses, Asiatic lilies & hand-tied floral bouquets.',
      image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?q=80&w=900&auto=format&fit=crop',
      link: '/category/flowers',
      ratio: 'aspect-[4/5] lg:aspect-[3/4]',
    },
    {
      id: 'panel-gifts',
      title: 'Gifts & Hampers',
      eyebrow: 'Thoughtful Gifting',
      subtitle: 'Curated celebration hampers, premium chocolates & indoor plants.',
      image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=900&auto=format&fit=crop',
      link: '/category/gifts',
      ratio: 'aspect-[4/5] lg:aspect-[3/4]',
    },
  ];

  const activeCategories = categories.filter((c) => c.active);

  return (
    <section className="py-16 sm:py-24 bg-[#FAF7F0] border-b border-[#E8E2D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-16 gap-4">
          <div>
            <span className="eyebrow-tag text-[#C5A46D] block mb-2">Curated Collections</span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#30251F] tracking-tight">
              Shop by Category
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#81776C] max-w-md font-normal">
            Three dedicated ateliers under one roof in Sector 76 Noida. Handcrafted on order for memorable moments.
          </p>
        </div>

        {/* 3 Visually Distinct Editorial Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {primaryEditorialPanels.map((panel) => (
            <Link
              key={panel.id}
              to={panel.link}
              className="group relative rounded-3xl overflow-hidden bg-white border border-[#E8E2D5] shadow-xs hover:shadow-xl transition-all duration-500 flex flex-col"
            >
              <div className={`relative ${panel.ratio} w-full overflow-hidden bg-[#FAF7F0]`}>
                <img
                  src={panel.image}
                  alt={`${panel.title} at Cakes N More Sector 76 Noida`}
                  loading="lazy"
                  decoding="async"
                  width={600}
                  height={800}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#30251F]/70 via-[#30251F]/15 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                
                {/* Floating Top Arrow */}
                <div className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md text-[#30251F] flex items-center justify-center shadow-md group-hover:bg-[#30251F] group-hover:text-white transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <ArrowUpRight className="w-4 h-4" />
                </div>

                {/* Bottom Overlay Content */}
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <p className="eyebrow-tag text-[10px] text-[#E8CECB] mb-1">{panel.eyebrow}</p>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold leading-tight mb-1 text-white">
                    {panel.title}
                  </h3>
                  <p className="text-xs text-[#FAF7F0]/85 line-clamp-2 font-normal leading-relaxed">
                    {panel.subtitle}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Secondary Category Chips for Full Catalogue Coverage */}
        {activeCategories.length > 3 && (
          <div className="mt-10 sm:mt-12 pt-8 border-t border-[#E8E2D5] flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <span className="eyebrow-tag text-[#81776C] mr-2">Also Explore:</span>
            {activeCategories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="px-4 py-2 rounded-full bg-white border border-[#E8E2D5] hover:border-[#30251F] text-[#30251F] text-xs font-medium transition-all shadow-2xs hover:shadow-xs active:scale-95"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
