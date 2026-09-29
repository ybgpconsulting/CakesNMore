import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, Home, Sparkles } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { ProductCard } from '../components/products/ProductCard';
import { useStore } from '../context/StoreContext';
import { getProductionUrl } from '../utils/seo';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { categories, products } = useStore();
  const [sortBy, setSortBy] = useState<string>('recommended');

  const currentCategory = categories.find((c) => c.slug === slug || c.id === slug);

  const categoryProducts = useMemo(() => {
    if (!currentCategory) return [];

    return products
      .filter((p) => p.available)
      .filter((p) => p.categoryId === currentCategory.id || p.categoryName?.toLowerCase() === currentCategory.name.toLowerCase())
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        return a.displayOrder - b.displayOrder;
      });
  }, [products, currentCategory, sortBy]);

  const breadcrumbSchema = currentCategory
    ? {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: getProductionUrl('/') },
          { '@type': 'ListItem', position: 2, name: 'Shop', item: getProductionUrl('/shop') },
          {
            '@type': 'ListItem',
            position: 3,
            name: currentCategory.name,
            item: getProductionUrl(`/category/${currentCategory.slug}`),
          },
        ],
      }
      : null;

  if (!currentCategory) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="font-serif text-3xl font-bold text-gray-900 mb-2">Category Not Found</h2>
        <p className="text-gray-500 mb-6">The category you are looking for does not exist.</p>
        <Link
          to="/shop"
          className="px-6 py-3 rounded-xl bg-[#831843] text-white font-bold text-sm"
        >
          View All Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 sm:py-12">
      <SEO
        title={`${currentCategory.name} Delivery in Sector 76 Noida | Cakes N More`}
        description={`Order fresh ${currentCategory.name.toLowerCase()} in Sector 76, Noida. ${currentCategory.description} Handcrafted and delivered with love via WhatsApp order.`}
        schema={{ '@context': 'https://schema.org', '@graph': [breadcrumbSchema] }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-gray-800 flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <Link to="/shop" className="hover:text-gray-800">
            Shop
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="text-gray-900 font-semibold">{currentCategory.name}</span>
        </nav>

        {/* Category Banner */}
        <div className="relative rounded-3xl overflow-hidden mb-10 shadow-md border border-[#EADBDA] bg-white">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 p-6 sm:p-10 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FCE7F3] text-[#831843] text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sector 76 Specialty Collection</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#29141B] tracking-tight">
                {currentCategory.name}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 max-w-xl leading-relaxed">
                {currentCategory.description}
              </p>
              <div className="pt-2 text-xs text-gray-500">
                Same-day doorstep delivery available throughout Sector 76 and nearby Noida sectors.
              </div>
            </div>

            <div className="md:col-span-4 h-48 md:h-full min-h-[180px] bg-gray-100 overflow-hidden">
              <img
                src={currentCategory.image}
                alt={currentCategory.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Toolbar: Count & Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white p-4 rounded-2xl border border-[#EADBDA] shadow-sm">
          <p className="text-xs sm:text-sm text-gray-600 font-medium">
            Showing <strong className="text-gray-900">{categoryProducts.length}</strong> {currentCategory.name.toLowerCase()} items
          </p>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort category products"
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#831843]"
            >
              <option value="recommended">Recommended</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name-asc">Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {categoryProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#EADBDA]">
            <p className="text-gray-600 font-serif text-xl mb-4">No items currently listed under this category.</p>
            <Link
              to="/shop"
              className="inline-flex items-center px-6 py-2.5 bg-[#831843] text-white rounded-xl text-xs font-bold hover:bg-[#6b1336]"
            >
              Browse other categories
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {categoryProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
