import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const CategoryCards: React.FC = () => {
  const { categories, products } = useStore();

  const activeCategories = categories
    .filter((category) => category.active)
    .sort((a, b) => a.displayOrder - b.displayOrder);
  const primaryCategories = activeCategories.slice(0, 6);
  const getCategoryImage = (categoryId: string, image: string) =>
    image ||
    products.find((product) => product.categoryId === categoryId && product.images?.[0])?.images[0] ||
    '/social-share-1200x630.jpg';

  return (
    <section className="border-b border-[#E8E2D5] bg-[#FAF7F0] py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
          <div>
            <span className="eyebrow-tag mb-1 block text-[#C5A46D]">Find your favourite</span>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-[#30251F] sm:text-3xl">
              Shop by Category
            </h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#593A32] transition-colors hover:text-[#C44D70] sm:text-sm"
          >
            All products <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
          {primaryCategories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-[#E8E2D5] bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A46D] focus-visible:ring-offset-2 sm:rounded-3xl"
            >
              <div className="relative aspect-[1.15/1] w-full overflow-hidden bg-[#FAF7F0] sm:aspect-[1.2/1] lg:aspect-[1.35/1]">
                <img
                  src={getCategoryImage(category.id, category.image)}
                  alt={`${category.name} at Cakes N More Sector 76 Noida`}
                  loading="lazy"
                  decoding="async"
                  width={600}
                  height={800}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#30251F]/75 via-[#30251F]/25 to-transparent transition-opacity group-hover:opacity-90" />
                <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-2 p-4 text-white sm:p-5">
                  <div className="min-w-0">
                    <span className="mb-1 block text-[9px] font-semibold uppercase tracking-[0.16em] text-white/75">
                      Explore
                    </span>
                    <h3 className="truncate font-serif text-xl font-bold leading-tight sm:text-2xl">
                      {category.name}
                    </h3>
                  </div>
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
};
