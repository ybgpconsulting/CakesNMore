import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { OCCASIONS } from '../../data/initialData';

export const OccasionSection: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 bg-white border-b border-[#E8E2D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
          <span className="eyebrow-tag text-[#C5A46D] block mb-2">Milestones &amp; Celebrations</span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#30251F] tracking-tight">
            Shop by Occasion
          </h2>
          <p className="text-sm sm:text-base text-[#81776C] mt-2 font-normal">
            Bespoke celebration cakes and hand-tied blooms tailored to mark life's memorable moments.
          </p>
        </div>

        {/* Occasions Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {OCCASIONS.map((occ) => (
            <Link
              key={occ.slug}
              to={`/category/${occ.categorySlug}`}
              className="group relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[3/4] flex flex-col justify-end p-4 sm:p-5 transition-all duration-500 hover:-translate-y-1.5 shadow-2xs hover:shadow-xl border border-[#E8E2D5] bg-[#FAF7F0]"
            >
              <img
                src={occ.image}
                alt={`${occ.name} at Cakes N More Sector 76 Noida`}
                loading="lazy"
                decoding="async"
                width={360}
                height={480}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#30251F]/80 via-[#30251F]/25 to-transparent transition-opacity group-hover:from-[#30251F]/90" />

              {/* Text content */}
              <div className="relative z-10 text-white">
                <span className="eyebrow-tag text-[9px] text-[#E8CECB] block mb-0.5">
                  Milestone
                </span>
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
