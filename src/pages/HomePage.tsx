import React from 'react';
import { SEO } from '../components/common/SEO';
import { BestsellerSection } from '../components/home/BestsellerSection';
import { CategoryCards } from '../components/home/CategoryCards';
import { FeaturedSection } from '../components/home/FeaturedSection';
import { Hero } from '../components/home/Hero';
import { OccasionSection } from '../components/home/OccasionSection';
import { useStore } from '../context/StoreContext';

export const HomePage: React.FC = () => {
  const { settings } = useStore();

  const homeKeywords = [
    'cake delivery sector 76 noida',
    'best bakery in sector 76 noida',
    '100% eggless cakes noida',
    'online cake delivery noida',
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
      />

      <Hero />
      <CategoryCards />
      <FeaturedSection />
      <BestsellerSection />
      <OccasionSection />
    </div>
  );
};
