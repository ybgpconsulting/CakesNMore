import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { OCCASIONS } from '../../data/initialData';
import { useStore } from '../../context/StoreContext';

export const OccasionSection: React.FC = () => {
  const { categories, products } = useStore();

  const getOccasionImage = (categorySlug: string, fallbackImage: string) => {
    const category = categories.find((item) => item.slug === categorySlug);
    const product = products.find(
      (item) =>
        item.available &&
        (item.categorySlug === categorySlug || item.categoryId === category?.id) &&
        item.images?.[0]
    );
    return product?.images[0] || category?.image || fallbackImage;
  };

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-[#E8E2D5]">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
          <span className="eyebrow-tag text-[#C5A46D] block mb-2">Milestones &amp; Celebrations</span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#30251F] tracking-tight">
            Shop by Occasion
          </h2>
          <p className="text-sm sm:text-base text-[#81776C] mt-2 font-normal">
            Explore the current catalogue for birthdays, anniversaries and other occasions.
          </p>
        </div>

        <div className="grid auto-rows-[12rem] grid-cols-2 gap-3 sm:auto-rows-[14rem] sm:grid-cols-6 sm:gap-4 lg:auto-rows-[15rem] lg:grid-cols-12 lg:gap-5">
          {OCCASIONS.map((occ, index) => (
            <Link
              key={occ.slug}
              to={`/category/${occ.categorySlug}`}
              aria-label={`${occ.name}: ${occ.description}`}
              className={`group relative flex min-h-0 flex-col justify-end overflow-hidden rounded-2xl border border-[#E8E2D5] bg-[#FAF7F0] p-4 shadow-2xs transition-all duration-500 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A46D] focus-visible:ring-offset-2 sm:rounded-3xl sm:p-5 ${
                index === 0
                  ? 'col-span-2 row-span-2 sm:col-span-3 lg:col-span-6'
                  : index === 4
                    ? 'col-span-2 sm:col-span-3 lg:col-span-6'
                    : 'col-span-1 sm:col-span-3 lg:col-span-6'
              }`}
            >
              <img
                src={getOccasionImage(occ.categorySlug, occ.image)}
                alt=""
                loading="lazy"
                decoding="async"
                width={640}
                height={720}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#30251F]/80 via-[#30251F]/25 to-transparent transition-opacity group-hover:from-[#30251F]/90" />

              {/* Text content */}
              <div className="relative z-10 text-white">
                <h3 className="font-serif text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-[#DFC79E] transition-colors leading-tight">
                  {occ.name}
                </h3>
                <p className="text-[11px] text-[#FAF7F0]/80 line-clamp-1 mt-0.5 font-normal">
                  {occ.description}
                </p>
                <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#DFC79E] group-hover:translate-x-1 transition-transform">
                  <span>Explore</span>
                  <ArrowRight className="w-3 h-3 text-[#C5A46D]" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
