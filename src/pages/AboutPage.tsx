import React from 'react';
import { Link } from 'react-router-dom';
import { Award, Cake, Clock, Heart, MapPin, Phone, ShieldCheck, Sparkles, Store, ArrowRight } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { useStore } from '../context/StoreContext';
import { getProductionUrl } from '../utils/seo';

export const AboutPage: React.FC = () => {
  const { settings, products } = useStore();
  const catalogueProduct = products.find(
    (product) => product.available && product.images.some(Boolean)
  );
  const catalogueImage =
    catalogueProduct?.images.find(Boolean) || '/social-share-1200x630.jpg';

  const aboutSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        '@id': getProductionUrl('/about'),
        name: 'About Cakes N More Sector 76 Noida',
        description: 'About Cakes N More - premier 100% eggless bakery and boutique florist in Sector 76 Noida.',
        url: getProductionUrl('/about'),
        mainEntity: {
          '@id': `${getProductionUrl('/')}#localbusiness`,
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: getProductionUrl('/') },
          { '@type': 'ListItem', position: 2, name: 'About Us', item: getProductionUrl('/about') },
        ],
      },
    ],
  };

  const aboutKeywords = [
    'about cakes n more noida',
    'bakery in sector 76 noida',
    'eggless patisserie noida',
    'cake shop near mithaas amrapali silicon city',
    'florist in sector 76 noida',
    'flower shop noida 201301',
  ].join(', ');

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#30251F] py-12 sm:py-20">
      <SEO
        title="Our Story & Atelier | Cakes N More Noida Sector 76"
        description="Learn about Cakes N More in Sector 76 Noida. Your neighborhood boutique bakery, flower shop and luxury gift studio at Amrapali Crystal Home."
        keywords={aboutKeywords}
        imageAlt="About Cakes N More Bakery & Florist Sector 76 Noida"
        schema={aboutSchema}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* Header Block */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF7F0] text-[#30251F] border border-[#E8E2D5] text-[11px] font-bold uppercase tracking-[0.2em] shadow-sm">
            <Store className="w-3.5 h-3.5 text-[#C5A46D]" />
            <span>Serving Sector 76 &amp; Central Noida</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-[#30251F] tracking-tight leading-tight">
            Crafting Sweet Moments <br className="hidden sm:block" />
            <span className="italic font-normal text-[#81776C]">&amp; Fresh Blooms</span>
          </h1>
          <p className="text-sm sm:text-base text-[#81776C] max-w-2xl mx-auto leading-relaxed">
            Welcome to Cakes N More at {settings.address}.
          </p>
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-[#E8E2D5] shadow-[0_4px_25px_rgba(48,37,31,0.05)] grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-5 text-[#81776C] text-sm sm:text-base leading-relaxed">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#C5A46D]">About Cakes N More</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#30251F]">
              Cakes, Flowers &amp; Gifts
            </h2>
            <p>
              Cakes N More is located in Sector 76, Noida. The current catalogue brings together
              bakery, flower and gift items in one place.
            </p>
            <p>
              Browse the current catalogue for celebrations, gifts and everyday moments. Product
              details show available options; contact the store with questions about ingredients,
              customization or availability.
            </p>
            <p>
              Delivery eligibility is checked against current store settings. The team can confirm
              timing and collection details for a specific order.
            </p>
          </div>

          <div className="md:col-span-5 aspect-[4/5] rounded-2xl overflow-hidden shadow-md border border-[#E8E2D5]">
            <img
              src={catalogueImage}
              alt={catalogueProduct?.name || 'A selection from the Cakes N More catalogue'}
              loading="lazy"
              decoding="async"
              width={600}
              height={750}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-7 border border-[#E8E2D5] text-center space-y-3.5 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#FAF7F0] text-[#244438] flex items-center justify-center mx-auto border border-[#E8E2D5]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-normal text-[#30251F]">Eggless Cake Range</h3>
            <p className="text-xs sm:text-sm text-[#81776C] leading-relaxed">
              Cakes are presented as eggless. Check individual product details and contact the store with dietary questions.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-7 border border-[#E8E2D5] text-center space-y-3.5 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#FAF7F0] text-[#30251F] flex items-center justify-center mx-auto border border-[#E8E2D5]">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-normal text-[#30251F]">Product Details</h3>
            <p className="text-xs sm:text-sm text-[#81776C] leading-relaxed">
              Check each catalogue listing for its description, current availability and selectable options.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-7 border border-[#E8E2D5] text-center space-y-3.5 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#FAF7F0] text-[#C5A46D] flex items-center justify-center mx-auto border border-[#E8E2D5]">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-normal text-[#30251F]">Local Store</h3>
            <p className="text-xs sm:text-sm text-[#81776C] leading-relaxed">
              Contact the Sector 76 store to ask about a product, a custom request or order arrangements.
            </p>
          </div>
        </div>

        {/* Action Banner */}
        <div className="bg-[#30251F] text-[#FAF7F0] rounded-3xl p-8 sm:p-12 text-center space-y-5 shadow-xl">
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#C5A46D]">Visit or Order</span>
          <h2 className="font-serif text-2xl sm:text-4xl font-normal tracking-tight">
            Visit Our Store or Order Online
          </h2>
          <p className="text-xs sm:text-sm text-[#FAF7F0]/80 max-w-xl mx-auto leading-relaxed">
            Check delivery eligibility for your address, or contact the store to confirm timing and collection details.
          </p>
          <div className="pt-3 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/shop"
              className="btn-editorial-primary px-8 py-3.5 rounded-full text-xs font-bold font-sans tracking-wide inline-flex items-center gap-2"
            >
              <span>Explore Catalogue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact"
              className="px-8 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-[#FAF7F0] border border-white/20 text-xs font-bold font-sans tracking-wide transition-all"
            >
              Store Location &amp; Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
