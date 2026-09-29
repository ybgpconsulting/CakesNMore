import React from 'react';
import { SEO } from '../components/common/SEO';
import { BestsellerSection } from '../components/home/BestsellerSection';
import { CategoryCards } from '../components/home/CategoryCards';
import { FeaturedSection } from '../components/home/FeaturedSection';
import { Hero } from '../components/home/Hero';
import { LOCAL_FAQS, LocalSeoFaqSection } from '../components/home/LocalSeoFaqSection';
import { OccasionSection } from '../components/home/OccasionSection';
import { StoreLocationSection } from '../components/home/StoreLocationSection';
import { WhyChooseUs } from '../components/home/WhyChooseUs';
import { useStore } from '../context/StoreContext';
import { getProductionUrl } from '../utils/seo';

export const HomePage: React.FC = () => {
  const { settings } = useStore();

  const homePageSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Bakery', 'Florist', 'LocalBusiness'],
        '@id': 'https://cakesnmorenoida.in/#localbusiness',
        name: settings.businessName || 'Cakes N More',
        description: settings.metaDescription,
        telephone: settings.phone,
        email: settings.email || 'contact@cakesnmorenoida.in',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Shop No. 29, Ground Floor, Amrapali Crystal Home, Shopping Arcade, near Mithaas, Amrapali Silicon City',
          addressLocality: 'Sector 76, Noida',
          addressRegion: 'Uttar Pradesh',
          postalCode: '201301',
          addressCountry: 'IN',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: '28.5684',
          longitude: '77.3824',
        },
        url: getProductionUrl('/'),
        openingHours: 'Mo-Su 09:00-23:00',
        priceRange: '₹₹',
        servesCuisine: '100% Eggless Cakes, Vegetarian Bakery, Desserts, Fresh Flowers',
        areaServed: [
          { '@type': 'City', name: 'Noida' },
          { '@type': 'PostalCode', postalCode: '201301' },
          { '@type': 'AdministrativeArea', name: 'Sector 76 Noida' },
          { '@type': 'AdministrativeArea', name: 'Sector 75 Noida' },
          { '@type': 'AdministrativeArea', name: 'Sector 74 Noida' },
          { '@type': 'AdministrativeArea', name: 'Sector 77 Noida' },
          { '@type': 'AdministrativeArea', name: 'Sector 78 Noida' },
          { '@type': 'AdministrativeArea', name: 'Sector 50 Noida' },
        ],
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          reviewCount: '248',
          bestRating: '5',
          worstRating: '1',
        },
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://cakesnmorenoida.in/#faq',
        mainEntity: LOCAL_FAQS.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
      {
        '@type': 'WebSite',
        '@id': 'https://cakesnmorenoida.in/#website',
        url: getProductionUrl('/'),
        name: 'Cakes N More Sector 76 Noida',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${getProductionUrl('/shop')}?search={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  const homeKeywords = [
    'cake delivery sector 76 noida',
    'best bakery in sector 76 noida',
    '100% eggless cakes noida',
    'online cake delivery noida',
    'midnight cake delivery noida',
    'birthday cake delivery noida sector 76',
    'flower delivery sector 76 noida',
    'florist in sector 76 noida',
    'cakes and flowers combo noida',
    'amrapali silicon city cake shop',
    'amrapali crystal homes florist bakery',
    'bakery near sector 76 metro station noida',
    'customized photo cakes noida',
    'pinata cake noida',
    'bento cake noida',
  ].join(', ');

  return (
    <div>
      <SEO
        title={settings.websiteTitle || 'Cakes N More in Sector 76 Noida | 100% Eggless Cakes, Flowers & Gifts'}
        description={settings.metaDescription}
        keywords={homeKeywords}
        schema={homePageSchema}
      />

      {/* 1. Hero */}
      <Hero />

      {/* 2. Category Cards */}
      <CategoryCards />

      {/* 3. Featured Products */}
      <FeaturedSection />

      {/* 4. Bestsellers */}
      <BestsellerSection />

      {/* 5. Shop by Occasion */}
      <OccasionSection />

      {/* 6. Why Choose Us */}
      <WhyChooseUs />

      {/* 7. Local SEO & FAQ Section */}
      <LocalSeoFaqSection />

      {/* 8. Store Section (Sector 76 Location, Address, Map, WhatsApp, Call) */}
      <StoreLocationSection />
    </div>
  );
};
