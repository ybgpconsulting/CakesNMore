import React from 'react';
import { SEO } from '../components/common/SEO';
import { BestsellerSection } from '../components/home/BestsellerSection';
import { CategoryCards } from '../components/home/CategoryCards';
import { FeaturedSection } from '../components/home/FeaturedSection';
import { Hero } from '../components/home/Hero';
import { LocalSeoFaqSection, getLocalFaqs } from '../components/home/LocalSeoFaqSection';
import { OccasionSection } from '../components/home/OccasionSection';
import { StoreLocationSection } from '../components/home/StoreLocationSection';
import { WhyChooseUs } from '../components/home/WhyChooseUs';
import { useDeliveryAvailability } from '../context/DeliveryContext';
import { useStore } from '../context/StoreContext';
import { getProductionUrl } from '../utils/seo';

export const HomePage: React.FC = () => {
  const { settings } = useStore();
  const { deliverySettings } = useDeliveryAvailability();
  const faqs = getLocalFaqs(deliverySettings);

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

  const homeSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': getProductionUrl('/'),
        name: settings.websiteTitle || 'Cakes N More in Sector 76 Noida | 100% Eggless Cakes, Flowers & Gifts',
        description: settings.metaDescription,
        url: getProductionUrl('/'),
        about: { '@id': `${getProductionUrl('/')}#localbusiness` },
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    ],
  };

  return (
    <div>
      <SEO
        title={settings.websiteTitle || 'Cakes N More in Sector 76 Noida | 100% Eggless Cakes, Flowers & Gifts'}
        description={settings.metaDescription}
        keywords={homeKeywords}
        canonical={getProductionUrl('/')}
        schema={homeSchema}
      />

      <Hero />
      <CategoryCards />
      <FeaturedSection />
      <BestsellerSection />
      <OccasionSection />
      <WhyChooseUs />
      <LocalSeoFaqSection />
      <StoreLocationSection />
    </div>
  );
};
