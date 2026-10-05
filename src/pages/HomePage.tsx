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

export const HomePage: React.FC = () => {
  const { settings } = useStore();

  const homePageSchema = {
    '@context': 'https://schema.org',
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
