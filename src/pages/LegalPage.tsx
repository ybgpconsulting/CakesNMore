import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, FileText, Truck, RotateCcw } from 'lucide-react';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { SEO } from '../components/common/SEO';
import { getProductionUrl } from '../utils/seo';

type PolicyKey = 'privacy' | 'terms' | 'shipping' | 'returns';

interface LegalPageProps {
  page: PolicyKey;
}

const policyContent: Record<
  PolicyKey,
  {
    title: string;
    description: string;
    intro: string;
    icon: typeof ShieldCheck;
    sections: Array<{ heading: string; body: string[] }>;
  }
> = {
  privacy: {
    title: 'Privacy Policy',
    description: 'How Cakes N More collects, uses, and protects customer information on this store.',
    icon: ShieldCheck,
    intro:
      'We value your trust and are committed to protecting the personal information you share with us while placing orders or contacting our boutique atelier.',
    sections: [
      {
        heading: 'Information We Collect',
        body: [
          'We may collect your name, mobile number, delivery address, order details, and any notes included in WhatsApp or web checkout requests.',
          'We may also collect delivery radius and location coordinates solely to determine if your address falls within our local service area.',
        ],
      },
      {
        heading: 'How We Use Your Information',
        body: [
          'We use your information strictly to process and confirm product orders, coordinate delivery logistics, and respond to bespoke customer requests.',
          'We may use your details for customer support, service improvement, order documentation, and direct WhatsApp communication when needed.',
        ],
      },
      {
        heading: 'Data Protection & Integrity',
        body: [
          'We do not sell, rent, or trade customer data with third parties for marketing purposes.',
          'We take reasonable physical and digital measures to keep your personal data secure and limit access to authorized personnel only.',
        ],
      },
      {
        heading: 'Cookies & Browser Storage',
        body: [
          'The website stores cart items and verified delivery preferences in your browser’s local storage to ensure a smooth shopping experience.',
          'Delivery verification coordinates are used only to compute distance against our Sector 76 hub and are never stored permanently without a confirmed order.',
        ],
      },
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    description: 'Store terms for ordering, payment, fulfillment, and customer expectations.',
    icon: FileText,
    intro:
      'These terms govern the use of our website and the ordering process for Cakes N More. By browsing our catalogue or placing an order, you agree to the conditions below.',
    sections: [
      {
        heading: 'Ordering and Availability',
        body: [
          'All product availability is subject to stock, daily freshness standards, and order confirmation by our boutique team.',
          'We reserve the right to revise or decline an order if the requested product is out of stock or outside our safe delivery radius.',
        ],
      },
      {
        heading: 'Pricing and Custom Orders',
        body: [
          'Prices may vary based on selected weight, size variants, custom inscriptions, or seasonal floral availability.',
          'Custom cake requests, specific floral color palettes, and curated gift hampers are prepared based on the exact instructions provided in your order.',
        ],
      },
      {
        heading: 'Customer Responsibility',
        body: [
          'Customers are responsible for providing correct delivery addresses, gate access details, reachable phone numbers, and clear delivery instructions.',
          'We are not liable for delivery delays or failed drop-offs resulting from incorrect recipient numbers or unreachable recipients at the premises.',
        ],
      },
      {
        heading: 'Website Content & Imagery',
        body: [
          'The site is intended for browsing and ordering in good faith. We strive for 100% accuracy in stock and pricing at all times.',
          'Handcrafted cakes and fresh flowers may have minor artistic variations in decoration or bloom tone from representative catalogue photography.',
        ],
      },
    ],
  },
  shipping: {
    title: 'Shipping & Delivery',
    description: 'Delivery eligibility and order fulfillment details for Cakes N More.',
    icon: Truck,
    intro:
      'Delivery availability is determined by your verified address and current store settings. Check whether your location is eligible before placing a delivery order.',
    sections: [
      {
        heading: 'Service Area & Eligibility',
        body: [
          'Use the delivery checker to verify your address against the current store radius and service conditions. A postal code is only a preliminary check; exact location verification determines eligibility.',
          'Availability may change. The store will confirm whether an order can be delivered to the requested address.',
        ],
      },
      {
        heading: 'Preparation & Delivery Timing',
        body: [
          'Preparation and arrival times vary by product, order details, store availability, and travel conditions.',
          'Contact the store to confirm an estimated time before placing a time-sensitive order.',
        ],
      },
      {
        heading: 'Delivery Instructions & Security Checkpoints',
        body: [
          'Please specify tower numbers, society gates, and flat details clearly on checkout.',
          'We recommend verifying your delivery eligibility with our pin check before proceeding to order.',
        ],
      },
    ],
  },
  returns: {
    title: 'Returns & Refunds',
    description: 'Return and refund guidance for custom orders, damaged items, and order cancellations.',
    icon: RotateCcw,
    intro:
      'This page outlines the store’s process for order cancellations and requests about perishable items. Contact the store promptly if there is an issue with an order.',
    sections: [
      {
        heading: 'Damaged or Incorrect Items',
        body: [
          'Fresh cakes and floral bouquets are perishable. Please inspect your delivery upon arrival.',
          'If an item arrives damaged in transit, incorrect, or spoiled, notify us within 2 hours of delivery with photographic evidence on WhatsApp.',
        ],
      },
      {
        heading: 'Custom & Personalized Creations',
        body: [
          'Custom cake designs, photo prints, personalized inscriptions, and bespoke floral hampers cannot be canceled once preparation has commenced.',
          'In genuine cases of error on our part, we will offer a replacement or store credit promptly.',
        ],
      },
      {
        heading: 'Order Cancellation',
        body: [
          'Orders may be canceled without charge prior to baking or floral stem preparation.',
          'Once our chef has begun sponge preparation or our florist has trimmed custom stems, cancellations cannot be accepted.',
        ],
      },
    ],
  },
};

const canonicalMap: Record<PolicyKey, string> = {
  privacy: '/privacy-policy',
  terms: '/terms-and-conditions',
  shipping: '/shipping-and-delivery',
  returns: '/returns-policy',
};

export const LegalPage: React.FC<LegalPageProps> = ({ page }) => {
  const content = policyContent[page];
  const Icon = content.icon;

  const legalSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': getProductionUrl(canonicalMap[page]),
        name: `${content.title} | Cakes N More Sector 76 Noida`,
        description: content.description,
        url: getProductionUrl(canonicalMap[page]),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: getProductionUrl('/') },
          { '@type': 'ListItem', position: 2, name: content.title, item: getProductionUrl(canonicalMap[page]) },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#30251F] py-12 sm:py-20">
      <SEO
        title={`${content.title} | Cakes N More Sector 76 Noida`}
        description={content.description}
        canonical={canonicalMap[page]}
        schema={legalSchema}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: content.title }]} />

        <div className="bg-white rounded-3xl border border-[#E8E2D5] shadow-sm p-6 sm:p-12">
          <div className="mb-10 pb-8 border-b border-[#E8E2D5]">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF7F0] text-[#30251F] border border-[#E8E2D5] text-[11px] font-bold uppercase tracking-[0.2em] mb-4">
              <Icon className="w-3.5 h-3.5 text-[#C5A46D]" />
              <span>Cakes N More Policy</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-normal text-[#30251F] tracking-tight">
              {content.title}
            </h1>
            <p className="text-sm sm:text-base text-[#81776C] mt-3 max-w-2xl leading-relaxed">
              {content.intro}
            </p>
          </div>

          <div className="space-y-10">
            {content.sections.map((section) => (
              <section key={section.heading} className="space-y-3">
                <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#30251F]">
                  {section.heading}
                </h2>
                <div className="space-y-3 text-sm sm:text-base text-[#81776C] leading-relaxed">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-[#E8E2D5] text-xs sm:text-sm text-[#81776C]">
            <p>
              For urgent order inquiries, custom delivery questions, or assistance, please message our concierge on WhatsApp or call{' '}
              <a href="tel:+919999517599" className="text-[#30251F] font-bold hover:underline">
                +91 9999517599
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
