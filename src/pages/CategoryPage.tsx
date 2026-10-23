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

  const categoryKeywordsMap: Record<string, string> = {
    cakes: 'eggless cake delivery sector 76 noida, birthday cakes noida 76, anniversary cakes noida, chocolate truffle cake noida, red velvet cake noida, photo cake noida, bento cake noida, pinata cake noida, best cake shop sector 76 noida',
    flowers: 'fresh flower delivery sector 76 noida, florist in sector 76 noida, rose bouquet delivery noida, lilies bouquet noida, orchids delivery noida, exotic flowers noida',
    combos: 'cake and flower combo noida, birthday combo delivery noida sector 76, flowers and teddy hamper noida',
    plants: 'indoor plants delivery noida, air purifying plants noida 76, lucky bamboo money plant noida, potted plant gifts noida',
    chocolates: 'artisanal chocolates noida, chocolate gift hampers noida, premium chocolate delivery sector 76 noida',
    gifts: 'gift hampers sector 76 noida, birthday gifts delivery noida, anniversary personalized gifts noida',
  };

  const categoryKeywords = currentCategory
    ? categoryKeywordsMap[currentCategory.slug.toLowerCase()] ||
      `${currentCategory.name.toLowerCase()} delivery sector 76 noida, best ${currentCategory.name.toLowerCase()} noida, online ${currentCategory.name.toLowerCase()} shop noida`
    : '';
  const isCakeCategory = currentCategory?.slug === 'cakes' || currentCategory?.id === 'cat-cakes';

  const categorySchema = currentCategory
    ? {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'CollectionPage',
            '@id': getProductionUrl(`/category/${currentCategory.slug}`),
            name: `${currentCategory.name} Delivery in Sector 76 Noida`,
            description: currentCategory.description,
            url: getProductionUrl(`/category/${currentCategory.slug}`),
          },
          {
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
          },
          ...(categoryProducts.length > 0
            ? [
                {
                  '@type': 'ItemList',
                  itemListElement: categoryProducts.slice(0, 16).map((item, idx) => ({
                    '@type': 'ListItem',
                    position: idx + 1,
                    name: item.name,
                    url: getProductionUrl(`/product/${item.slug}`),
                    image: item.images?.[0] ? (item.images[0].startsWith('/') ? getProductionUrl(item.images[0]) : item.images[0]) : undefined,
                  })),
                },
              ]
            : []),
        ],
      }
    : undefined;

  if (!currentCategory) {
    return (
      <div className="min-h-[60vh] bg-[#FAF7F0] flex flex-col items-center justify-center p-6 text-center text-[#30251F]">
        <h2 className="font-serif text-3xl font-bold text-[#30251F] mb-2">Collection Not Found</h2>
        <p className="text-[#81776C] mb-6">The category you are looking for does not exist or has been archived.</p>
        <Link
          to="/shop"
          className="px-6 py-3 rounded-full bg-[#30251F] hover:bg-[#201814] text-[#FAF7F0] font-serif text-xs font-semibold cursor-pointer"
        >
          View All Creations
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#30251F] py-8 sm:py-16">
      <SEO
        title={`${currentCategory.name} Delivery in Sector 76 Noida | Cakes N More`}
        description={`Order ${isCakeCategory ? 'fresh 100% eggless cakes' : `fresh ${currentCategory.name.toLowerCase()}`} in Sector 76, Noida. ${currentCategory.description} Check delivery availability and order via WhatsApp.`}
        keywords={categoryKeywords}
        image={currentCategory.image}
        imageAlt={`${currentCategory.name} Delivery in Sector 76 Noida - Cakes N More`}
        schema={categorySchema}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-[#81776C] mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-[#30251F] flex items-center gap-1 transition-colors">
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-[#C5A46D]" />
          <Link to="/shop" className="hover:text-[#30251F] transition-colors">
            Catalogue
          </Link>
          <ChevronRight className="w-3 h-3 text-[#C5A46D]" />
          <span className="text-[#30251F] font-semibold">{currentCategory.name}</span>
        </nav>

        {/* Category Editorial Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden mb-10 shadow-xs border border-[#E8E2D5] bg-[#FFFFFF]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 p-6 sm:p-10 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FAF7F0] text-[#C5A46D] border border-[#E8E2D5] text-[11px] font-bold uppercase tracking-[0.2em]">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A46D]" />
                <span>Sector 76 Specialty Collection</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-5xl font-normal text-[#30251F] tracking-tight">
                {currentCategory.name}
              </h1>
              <p className="text-sm sm:text-base text-[#81776C] max-w-xl leading-relaxed font-normal">
                {currentCategory.description}
              </p>
              <div className="pt-2 text-xs text-[#244438] font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#244438]" />
                <span>Handcrafted fresh on order at our Sector 76 boutique.</span>
              </div>
            </div>

            <div className="md:col-span-4 h-48 md:h-full min-h-[220px] bg-[#FAF7F0] overflow-hidden">
              <img
                src={currentCategory.image}
                alt={`${currentCategory.name} in Sector 76 Noida - Cakes N More`}
                loading="lazy"
                decoding="async"
                width={400}
                height={300}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          </div>
        </div>

        {/* Quick Category Switcher Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
          {categories
            .filter((c) => c.active)
            .map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 active:scale-95 duration-200 cursor-pointer ${
                  cat.id === currentCategory.id
                    ? 'bg-[#30251F] text-[#FAF7F0] shadow-sm'
                    : 'bg-[#FFFFFF] text-[#81776C] border border-[#E8E2D5] hover:border-[#30251F] hover:text-[#30251F]'
                }`}
              >
                {cat.name}
              </Link>
            ))}
        </div>

        {/* Toolbar: Count & Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-[#FFFFFF] p-4 sm:p-5 rounded-2xl border border-[#E8E2D5] shadow-xs">
          <p className="text-xs sm:text-sm text-[#81776C] font-medium">
            Presenting <strong className="text-[#30251F] font-semibold">{categoryProducts.length}</strong> {currentCategory.name.toLowerCase()} creations
          </p>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#81776C] font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort category products"
              className="bg-[#FAF7F0] border border-[#E8E2D5] rounded-full px-3.5 py-1.5 text-xs font-medium text-[#30251F] focus:outline-none focus:border-[#30251F] focus:ring-1 focus:ring-[#30251F] cursor-pointer"
            >
              <option value="recommended" className="bg-white">Curated Recommendation</option>
              <option value="price-low" className="bg-white">Price: Low to High</option>
              <option value="price-high" className="bg-white">Price: High to Low</option>
              <option value="name-asc" className="bg-white">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {categoryProducts.length === 0 ? (
          <div className="bg-[#FFFFFF] rounded-3xl p-12 text-center border border-[#E8E2D5] shadow-xs space-y-4">
            <p className="text-[#81776C] font-serif text-xl">No items currently listed under this category.</p>
            <Link
              to="/shop"
              className="inline-flex items-center px-6 py-2.5 rounded-full bg-[#30251F] text-[#FAF7F0] font-serif text-xs font-semibold cursor-pointer"
            >
              Browse other collections
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {categoryProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Local Category SEO Reassurance Block */}
        <section className="mt-16 bg-[#FFFFFF] rounded-3xl p-6 sm:p-10 border border-[#E8E2D5] shadow-xs">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#30251F] mb-3">
            Why Order {currentCategory.name} from Cakes N More Sector 76 Noida?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-[#81776C] leading-relaxed">
            <p>
              At <strong className="text-[#30251F]">Cakes N More</strong>, our {currentCategory.name.toLowerCase()} are curated with pure artisanal dedication.
              Conveniently located at <em className="text-[#30251F] not-italic font-medium">Shop 29, Ground Floor, Amrapali Crystal Home Shopping Arcade</em> (Sector 76 Noida),
              we serve families and celebration hosts across Amrapali Silicon City, Amrapali Crystal Homes, Aditya Urban Casa,
              JM Orchid, and surrounding Noida sectors (74, 75, 77, 78, 79, 50).
            </p>
            <p>
              Need express delivery or a bespoke creation? Add items to your bag or connect directly on WhatsApp
              (<a href="tel:+919999517599" className="text-[#30251F] font-semibold hover:underline">+91 9999517599</a>)
              for immediate concierge assistance with custom messages, floral designs, or delivery scheduling.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
