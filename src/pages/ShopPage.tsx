import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, RotateCcw, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { ProductCard } from '../components/products/ProductCard';
import { useStore } from '../context/StoreContext';
import { getProductionUrl } from '../utils/seo';

export const ShopPage: React.FC = () => {
  const { products, categories } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters State
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'all';
  const initialFilter = searchParams.get('filter') || ''; // 'featured' or 'bestseller'

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<string>('recommended');
  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [featuredOnly, setFeaturedOnly] = useState<boolean>(initialFilter === 'featured');
  const [bestsellerOnly, setBestsellerOnly] = useState<boolean>(initialFilter === 'bestseller');
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

  const shopSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': getProductionUrl('/shop'),
        name: 'Online Bakery & Flower Shop in Sector 76 Noida',
        description: 'Browse our complete catalogue of 100% eggless celebration cakes, exotic flowers, and gift hampers in Sector 76, Noida.',
        url: getProductionUrl('/shop'),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: getProductionUrl('/') },
          { '@type': 'ListItem', position: 2, name: 'Shop', item: getProductionUrl('/shop') },
        ],
      },
    ],
  };

  const shopKeywords = [
    'buy cakes online noida',
    'order cakes online sector 76 noida',
    'fresh flowers delivery noida',
    'eggless birthday cakes noida',
    'gift hampers noida',
    'anniversary flower bouquets noida',
    'red velvet cake noida',
    'chocolate truffle cake noida 76',
    'midnight cake delivery noida',
  ].join(', ');

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search matching
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = p.name.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchCat = p.categoryName?.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchCat) return false;
        }

        // Category filter
        if (selectedCategory !== 'all') {
          const matchedCategory = categories.find(
            (c) => c.slug === selectedCategory || c.id === selectedCategory
          );
          if (matchedCategory && p.categoryId !== matchedCategory.id) {
            return false;
          }
        }

        // Price filter
        if (p.price > maxPrice) {
          return false;
        }

        // Featured & Bestseller flags
        if (featuredOnly && !p.featured) return false;
        if (bestsellerOnly && !p.bestseller) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        return a.displayOrder - b.displayOrder;
      });
  }, [
    products,
    categories,
    searchQuery,
    selectedCategory,
    maxPrice,
    featuredOnly,
    bestsellerOnly,
    sortBy,
  ]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('recommended');
    setMaxPrice(3000);
    setFeaturedOnly(false);
    setBestsellerOnly(false);
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 sm:py-12">
      <SEO
        title="Shop Fresh Cakes, Flower Bouquets & Hampers | Cakes N More Sector 76 Noida"
        description="Browse our complete catalogue of freshly prepared celebration cakes, flower arrangements, indoor plants and luxury gifts in Sector 76, Noida with easy WhatsApp checkout."
        keywords={shopKeywords}
        schema={shopSchema}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title & Breadcrumb */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#29141B] tracking-tight">
            Our Complete Catalogue
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Artisanal bakery items, fresh floral stems, plants, and bespoke gifts in Sector 76 Noida.
          </p>
        </div>

        {/* Search & Top Action Bar */}
        <div className="bg-white rounded-2xl p-4 border border-[#EADBDA] shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:max-w-md">
            <input
              type="text"
              placeholder="Search cakes, roses, gifts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#831843]"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-[#831843] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Items
            </button>
            {categories
              .filter((c) => c.active)
              .map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === cat.slug
                      ? 'bg-[#831843] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
          </div>

          {/* Sort Dropdown & Mobile Filter Toggle */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort products"
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#831843]"
            >
              <option value="recommended">Recommended</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name-asc">Alphabetical (A - Z)</option>
            </select>

            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="md:hidden flex items-center gap-1.5 px-3 py-2 bg-[#831843] text-white rounded-xl text-xs font-semibold"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Main Grid + Sidebar Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden md:block md:col-span-3 bg-white rounded-2xl p-5 border border-[#EADBDA] shadow-sm h-fit space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#831843]" />
                <h3 className="font-serif text-lg font-bold text-gray-900">Filter Catalogue</h3>
              </div>
              <button
                onClick={resetFilters}
                className="text-xs text-[#831843] hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Price Filter Slider */}
            <div>
              <div className="flex justify-between text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                <span>Max Budget</span>
                <span className="text-[#831843]">Up to ₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min={300}
                max={3000}
                step={50}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#831843] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>₹300</span>
                <span>₹1,500</span>
                <span>₹3,000</span>
              </div>
            </div>

            {/* Tags / Badges Filter */}
            <div className="space-y-2 pt-3 border-t border-gray-100">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Special Collections
              </label>
              <label className="flex items-center gap-2.5 text-xs font-medium text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featuredOnly}
                  onChange={(e) => setFeaturedOnly(e.target.checked)}
                  className="rounded text-[#831843] focus:ring-[#831843]"
                />
                <span>Featured Creations Only</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs font-medium text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bestsellerOnly}
                  onChange={(e) => setBestsellerOnly(e.target.checked)}
                  className="rounded text-[#831843] focus:ring-[#831843]"
                />
                <span>Bestsellers Only</span>
              </label>
            </div>

            {/* Local Store Assurance */}
            <div className="pt-4 border-t border-gray-100 text-xs text-gray-500 space-y-1">
              <p className="font-semibold text-gray-700">📍 Local Sector 76 Fulfillment</p>
              <p>Every cake is baked freshly on order. Flowers are arranged by master florists at our Sector 76 store.</p>
            </div>
          </aside>

          {/* Mobile Filter Drawer Modal */}
          {showMobileFilters && (
            <div className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center">
              <div className="bg-white w-full rounded-t-3xl max-h-[85dvh] overflow-y-auto p-5 pb-[max(1.5rem,calc(env(safe-area-inset-bottom,0px)+1rem))] border-t border-gray-200 shadow-2xl animate-in slide-in-from-bottom duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[#831843]" />
                    <h3 className="font-serif text-lg font-bold text-gray-900">Filter Catalogue</h3>
                  </div>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full"
                    aria-label="Close filters"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6 py-4">
                  {/* Price Filter Slider */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      <span>Max Budget</span>
                      <span className="text-[#831843]">Up to ₹{maxPrice}</span>
                    </div>
                    <input
                      type="range"
                      min={300}
                      max={3000}
                      step={50}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full accent-[#831843] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                      <span>₹300</span>
                      <span>₹1,500</span>
                      <span>₹3,000</span>
                    </div>
                  </div>

                  {/* Collections Filter */}
                  <div className="space-y-3 pt-2">
                    <span className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Special Collections
                    </span>
                    <label className="flex items-center gap-3 text-sm font-medium text-gray-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={featuredOnly}
                        onChange={(e) => setFeaturedOnly(e.target.checked)}
                        className="w-4 h-4 rounded text-[#831843] focus:ring-[#831843]"
                      />
                      <span>Featured Creations Only</span>
                    </label>
                    <label className="flex items-center gap-3 text-sm font-medium text-gray-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bestsellerOnly}
                        onChange={(e) => setBestsellerOnly(e.target.checked)}
                        className="w-4 h-4 rounded text-[#831843] focus:ring-[#831843]"
                      />
                      <span>Bestsellers Only</span>
                    </label>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="flex-1 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 active:scale-95 transition-transform"
                  >
                    Reset All
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMobileFilters(false)}
                    className="flex-1 py-3 bg-[#831843] text-white rounded-xl text-xs font-bold shadow active:scale-95 transition-transform"
                  >
                    Show Results ({filteredProducts.length})
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Product Grid Area (4 per row desktop, 3 tablet, 2 mobile) */}
          <main className="md:col-span-9">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#EADBDA] space-y-4">
                <div className="w-16 h-16 bg-[#FDF2F8] text-[#831843] rounded-full flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-gray-800">No items match your criteria</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Try clearing your search or adjusting your price filters to see all available products in our catalogue.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 bg-[#831843] text-white rounded-xl text-xs font-bold hover:bg-[#6b1336] transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
                  <span>
                    Showing <strong className="text-gray-900">{filteredProducts.length}</strong> products
                  </span>
                </div>

                {/* Responsive Grid conforming strictly to spec:
                    Desktop (lg): 4 products per row (or 3 in 9-col container)
                    Tablet (sm): 3 products
                    Mobile: 2 products per row
                */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
