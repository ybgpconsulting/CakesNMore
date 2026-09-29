import React from 'react';
import { SEO } from '../components/common/SEO';
import { BestsellerSection } from '../components/home/BestsellerSection';
import { CategoryCards } from '../components/home/CategoryCards';
import { FeaturedSection } from '../components/home/FeaturedSection';
import { Hero } from '../components/home/Hero';
import { OccasionSection } from '../components/home/OccasionSection';
import { StoreLocationSection } from '../components/home/StoreLocationSection';
import { WhyChooseUs } from '../components/home/WhyChooseUs';
import { useStore } from '../context/StoreContext';
import { getProductionUrl } from '../utils/seo';

export const HomePage: React.FC = () => {
  const { settings, homepageConfig } = useStore();

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': ['Bakery', 'Florist', 'LocalBusiness'],
    name: settings.businessName || 'Cakes N More',
    description: settings.metaDescription,
    telephone: settings.phone,
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
  };

  return (
    <div>
      <SEO
        title={settings.websiteTitle || 'Cakes N More in Sector 76 Noida | Cakes, Flowers & Gifts'}
        description={settings.metaDescription}
        schema={localBusinessSchema}
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

      {/* 7. Store Section (Sector 76 Location, Address, Map, WhatsApp, Call) */}
      <StoreLocationSection />
    </div>
  );
};
