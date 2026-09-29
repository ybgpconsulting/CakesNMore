import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const CategoryCards: React.FC = () => {
  const { categories } = useStore();

  const activeCategories = categories.filter((c) => c.active);

  return (
    <section className="py-14 sm:py-20 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="text-xs font-bold text-[#831843] uppercase tracking-widest">
            Handcrafted With Love
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#29141B] mt-2">
            Explore Our Specialties
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            From oven-fresh designer cakes to morning-cut floral arrangements and curated luxury hampers.
          </p>
        </div>

        {/* 6 Category Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {activeCategories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="group relative flex flex-col items-center bg-white rounded-2xl p-3 sm:p-4 border border-[#ECE2DC] hover:border-[#D1B8B3] hover:shadow-[0_8px_25px_rgba(131,24,67,0.08)] active:scale-95 transition-all duration-300"
            >
              {/* Image Circle with zoom */}
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#F7F2EE] mb-3">
                <img
                  src={category.image}
                  alt={category.name}
                  loading="lazy"
                  decoding="async"
                  width={240}
                  height={240}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 text-[#831843] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Category Name */}
              <h3 className="font-serif text-base sm:text-lg font-bold text-gray-900 group-hover:text-[#831843] transition-colors text-center">
                {category.name}
              </h3>
              <p className="text-[11px] text-gray-500 text-center line-clamp-1 mt-0.5">
                {category.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
