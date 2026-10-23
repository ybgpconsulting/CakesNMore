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
      {
        '@type': 'ItemList',
        itemListElement: products.filter((item) => item.available).slice(0, 16).map((item, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: item.name,
          url: getProductionUrl(`/product/${item.slug}`),
          image: item.images?.[0] ? (item.images[0].startsWith('/') ? getProductionUrl(item.images[0]) : item.images[0]) : undefined,
        })),
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
    <div className="min-h-screen bg-[#FAF7F0] text-[#30251F] py-8 sm:py-16">
      <SEO
        title="Shop Fresh Cakes, Flower Bouquets & Hampers | Cakes N More Sector 76 Noida"
        description="Browse our complete catalogue of freshly prepared celebration cakes, flower arrangements, indoor plants and luxury gifts in Sector 76, Noida with easy WhatsApp checkout."
        keywords={shopKeywords}
        imageAlt="Online Bakery and Florist Shop in Sector 76 Noida - Cakes N More"
        schema={shopSchema}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Page Title Header */}
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#C5A46D] uppercase tracking-[0.2em] mb-3 px-3.5 py-1 rounded-full bg-[#FFFFFF] border border-[#E8E2D5] shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A46D]" />
            <span>Complete Delivery Catalogue</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-[#30251F] tracking-tight">
            Artisanal Bakes &amp; Botanical Floristry
          </h1>
          <p className="text-sm sm:text-base text-[#81776C] mt-3 max-w-2xl font-normal leading-relaxed">
            100% pure vegetarian handcrafted celebration cakes, hand-tied morning blooms, and luxury gifting confections in Sector 76 Noida.
          </p>
        </div>

        {/* Search & Top Action Bar */}
        <div className="bg-[#FFFFFF] rounded-2xl p-4 sm:p-5 border border-[#E8E2D5] shadow-xs mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:max-w-md">
            <input
              type="text"
              placeholder="Search artisanal cakes, fresh roses, gifts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F0] border border-[#E8E2D5] text-[#30251F] placeholder-[#81776C]/60 rounded-full text-xs sm:text-sm focus:outline-none focus:border-[#30251F] focus:ring-1 focus:ring-[#30251F] transition-all"
            />
            <Search className="w-4 h-4 text-[#81776C] absolute left-3.5 top-3" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-[#81776C] hover:text-[#30251F] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#30251F] text-[#FAF7F0] shadow-sm'
                  : 'bg-[#FAF7F0] text-[#81776C] border border-[#E8E2D5] hover:border-[#30251F] hover:text-[#30251F]'
              }`}
            >
              All Creations
            </button>
            {categories
              .filter((c) => c.active)
              .map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    selectedCategory === cat.slug
                      ? 'bg-[#30251F] text-[#FAF7F0] shadow-sm'
                      : 'bg-[#FAF7F0] text-[#81776C] border border-[#E8E2D5] hover:border-[#30251F] hover:text-[#30251F]'
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
              className="bg-[#FAF7F0] border border-[#E8E2D5] rounded-full px-3.5 py-2 text-xs font-medium text-[#30251F] focus:outline-none focus:border-[#30251F] focus:ring-1 focus:ring-[#30251F] cursor-pointer"
            >
              <option value="recommended" className="bg-white">Curated Recommendation</option>
              <option value="price-low" className="bg-white">Price: Low to High</option>
              <option value="price-high" className="bg-white">Price: High to Low</option>
              <option value="name-asc" className="bg-white">Alphabetical (A - Z)</option>
            </select>

            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="md:hidden flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#30251F] text-[#FAF7F0] text-xs font-semibold shadow-xs cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Main Grid + Sidebar Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden md:block md:col-span-3 bg-[#FFFFFF] rounded-2xl p-6 border border-[#E8E2D5] shadow-xs h-fit space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D5]">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#C5A46D]" />
                <h3 className="font-serif text-lg font-bold text-[#30251F]">Filter Catalogue</h3>
              </div>
              <button
                onClick={resetFilters}
                className="text-xs text-[#81776C] hover:text-[#30251F] hover:underline flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Price Filter Slider */}
            <div>
              <div className="flex justify-between text-[11px] font-bold text-[#81776C] uppercase tracking-[0.14em] mb-2">
                <span>Max Budget</span>
                <span className="text-[#30251F] font-serif font-bold text-sm">Up to ₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min={300}
                max={3000}
                step={50}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#30251F] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#81776C] mt-1 font-medium">
                <span>₹300</span>
                <span>₹1,500</span>
                <span>₹3,000</span>
              </div>
            </div>

            {/* Tags / Badges Filter */}
            <div className="space-y-2.5 pt-3 border-t border-[#E8E2D5]">
              <label className="block text-[11px] font-bold text-[#81776C] uppercase tracking-[0.14em] mb-2">
                Special Collections
              </label>
              <label className="flex items-center gap-2.5 text-xs font-medium text-[#30251F] cursor-pointer hover:text-[#C5A46D] transition-colors">
                <input
                  type="checkbox"
                  checked={featuredOnly}
                  onChange={(e) => setFeaturedOnly(e.target.checked)}
                  className="rounded bg-[#FAF7F0] border-[#E8E2D5] text-[#30251F] focus:ring-[#30251F]"
                />
                <span>Featured Creations Only</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs font-medium text-[#30251F] cursor-pointer hover:text-[#C5A46D] transition-colors">
                <input
                  type="checkbox"
                  checked={bestsellerOnly}
                  onChange={(e) => setBestsellerOnly(e.target.checked)}
                  className="rounded bg-[#FAF7F0] border-[#E8E2D5] text-[#30251F] focus:ring-[#30251F]"
                />
                <span>Bestsellers Only</span>
              </label>
            </div>

            {/* Local Store Assurance */}
            <div className="pt-4 border-t border-[#E8E2D5] text-xs text-[#81776C] space-y-1.5 bg-[#FAF7F0] p-4 rounded-xl border">
              <p className="font-semibold text-[#30251F] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#244438]" />
                Sector 76 Instant Fulfillment
              </p>
              <p className="leading-relaxed">Every cake is baked fresh on order. Flowers are arranged by master florists at our Sector 76 boutique.</p>
            </div>
          </aside>

          {/* Mobile Filter Drawer Modal */}
          {showMobileFilters && (
            <div className="md:hidden fixed inset-0 z-50 bg-[#30251F]/65 backdrop-blur-md flex items-end justify-center">
              <div className="bg-[#FAF7F0] w-full rounded-t-[32px] max-h-[85dvh] overflow-y-auto p-6 pb-[max(1.5rem,calc(env(safe-area-inset-bottom,0px)+1rem))] border-t border-[#E8E2D5] shadow-2xl animate-in slide-in-from-bottom duration-200 text-[#30251F]">
                <div className="flex justify-center pb-2">
                  <span className="w-10 h-1 rounded-full bg-[#D8D2C5]" />
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D5]">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[#C5A46D]" />
                    <h3 className="font-serif text-lg font-bold text-[#30251F]">Filter Catalogue</h3>
                  </div>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-1.5 text-[#81776C] hover:text-[#30251F] rounded-full cursor-pointer"
                    aria-label="Close filters"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6 py-4">
                  {/* Price Filter Slider */}
                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-[#81776C] uppercase tracking-[0.14em] mb-2">
                      <span>Max Budget</span>
                      <span className="text-[#30251F] font-serif font-bold text-sm">Up to ₹{maxPrice}</span>
                    </div>
                    <input
                      type="range"
                      min={300}
                      max={3000}
                      step={50}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full accent-[#30251F] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-[#81776C] mt-1 font-medium">
                      <span>₹300</span>
                      <span>₹1,500</span>
                      <span>₹3,000</span>
                    </div>
                  </div>

                  {/* Collections Filter */}
                  <div className="space-y-3 pt-2">
                    <span className="block text-[11px] font-bold text-[#81776C] uppercase tracking-[0.14em]">
                      Special Collections
                    </span>
                    <label className="flex items-center gap-3 text-sm font-medium text-[#30251F] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={featuredOnly}
                        onChange={(e) => setFeaturedOnly(e.target.checked)}
                        className="w-4 h-4 rounded bg-[#FFFFFF] border-[#E8E2D5] text-[#30251F] focus:ring-[#30251F]"
                      />
                      <span>Featured Creations Only</span>
                    </label>
                    <label className="flex items-center gap-3 text-sm font-medium text-[#30251F] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bestsellerOnly}
                        onChange={(e) => setBestsellerOnly(e.target.checked)}
                        className="w-4 h-4 rounded bg-[#FFFFFF] border-[#E8E2D5] text-[#30251F] focus:ring-[#30251F]"
                      />
                      <span>Bestsellers Only</span>
                    </label>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E8E2D5] flex items-center gap-3">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="flex-1 py-3 border border-[#E8E2D5] bg-[#FFFFFF] rounded-full text-xs font-bold text-[#81776C] hover:text-[#30251F] active:scale-95 transition-all cursor-pointer"
                  >
                    Reset All
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMobileFilters(false)}
                    className="flex-1 py-3 rounded-full bg-[#30251F] hover:bg-[#201814] text-[#FAF7F0] font-serif text-xs font-bold shadow-xs active:scale-95 transition-transform cursor-pointer"
                  >
                    Show Results ({filteredProducts.length})
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Product Grid Area */}
          <main className="md:col-span-9">
            {filteredProducts.length === 0 ? (
              <div className="bg-[#FFFFFF] rounded-3xl p-12 text-center border border-[#E8E2D5] shadow-xs space-y-4">
                <div className="w-16 h-16 bg-[#FAF7F0] text-[#C5A46D] rounded-full flex items-center justify-center mx-auto border border-[#E8E2D5]">
                  <Search className="w-7 h-7" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#30251F]">No items match your criteria</h3>
                <p className="text-sm text-[#81776C] max-w-md mx-auto">
                  Try clearing your search or adjusting your price filters to explore all available creations in our catalogue.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 rounded-full bg-[#30251F] text-[#FAF7F0] font-serif text-xs font-semibold cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4 text-xs text-[#81776C]">
                  <span>
                    Presenting <strong className="text-[#30251F] font-semibold">{filteredProducts.length}</strong> creations
                  </span>
                </div>

                {/* Responsive Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
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
