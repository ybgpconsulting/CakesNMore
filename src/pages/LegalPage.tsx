import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/common/SEO';

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
    sections: Array<{ heading: string; body: string[] }>;
  }
> = {
  privacy: {
    title: 'Privacy Policy',
    description: 'How Cakes N More collects, uses, and protects customer information on this store.',
    intro:
      'We value your trust and are committed to protecting the personal information you share with us while placing orders or contacting our store.',
    sections: [
      {
        heading: 'Information We Collect',
        body: [
          'We may collect your name, mobile number, delivery address, order details, and any notes included in WhatsApp or web checkout requests.',
          'We may also collect delivery radius and location information only to determine if your address is within our local service area.',
        ],
      },
      {
        heading: 'How We Use Your Information',
        body: [
          'We use your information to process and confirm product orders, coordinate delivery, and respond to customer requests.',
          'We may use your details for customer support, service improvement, order documentation, and direct WhatsApp communication when needed.',
        ],
      },
      {
        heading: 'Data Protection',
        body: [
          'We do not sell, rent, or trade customer data with third parties for marketing purposes.',
          'We take reasonable steps to keep your personal data secure and limit access to authorized personnel only.',
        ],
      },
      {
        heading: 'Cookies and Local Storage',
        body: [
          'The website may store preference and cart data in the browser to provide a smoother shopping experience.',
          'Delivery verification data is used only to check service eligibility and is not shared permanently with third parties without a confirmed order.',
        ],
      },
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    description: 'Store terms for ordering, payment, fulfillment, and customer expectations.',
    intro:
      'These terms govern the use of our website and the ordering process for Cakes N More. By placing an order, you agree to the conditions below.',
    sections: [
      {
        heading: 'Ordering and Availability',
        body: [
          'All product availability is subject to stock, freshness, and order confirmation by our team.',
          'We reserve the right to reject or revise an order if the requested product is unavailable, out of stock, or outside our delivery capability.',
        ],
      },
      {
        heading: 'Pricing and Custom Orders',
        body: [
          'Prices may change depending on product selection, customizations, or seasonal variation.',
          'Custom cake requests, floral arrangements, and gift combinations are prepared based on the details provided in the order.'
        ],
      },
      {
        heading: 'Customer Responsibility',
        body: [
          'Customers are responsible for providing correct delivery information, reachable contact numbers, and clear order instructions.',
          'We are not liable for delays or failed delivery caused by incorrect addresses, missed contacts, or unforeseen third-party issues after dispatch.',
        ],
      },
      {
        heading: 'Website Use',
        body: [
          'The site is intended for browsing and ordering in good faith. We do not guarantee uninterrupted access or error-free operation at all times.',
          'Product images, text, and descriptions are for illustrative and informational purposes and may vary slightly from the actual item delivered.',
        ],
      },
    ],
  },
  shipping: {
    title: 'Shipping & Delivery',
    description: 'Local delivery rules, service radius, and order fulfillment details for Cakes N More.',
    intro:
      'We proudly serve the Sector 76, Noida area and nearby localities. Delivery availability depends on your exact location and current order timing.',
    sections: [
      {
        heading: 'Service Area',
        body: [
          'Our standard local delivery radius is within 10 km of our Sector 76, Noida store, subject to operational conditions and time windows.',
          'Delivery may be restricted in certain zones due to traffic, route conditions, weather, or temporary store limitations.',
        ],
      },
      {
        heading: 'Timelines',
        body: [
          'Most standard orders are prepared and dispatched the same day when confirmed in time.',
          'Same-day delivery is subject to order timing, product readiness, and last-mile logistics feasibility.',
        ],
      },
      {
        heading: 'Delivery Notes',
        body: [
          'Customers must provide a correct address, landmark or building details, and a reachable phone number for delivery coordination.',
          'We recommend confirming your delivery pin or postal code before finalizing the order to avoid service issues.',
        ],
      },
    ],
  },
  returns: {
    title: 'Returns & Refunds',
    description: 'Return and refund guidance for custom orders, damaged items, and order cancellations.',
    intro:
      'Because our products are handmade, personalized, and freshness-sensitive, each order is handled with care. This policy explains our return and refund approach.',
    sections: [
      {
        heading: 'Freshness and Quality',
        body: [
          'Fresh cakes, flowers, and arrangements are highly time-sensitive products. Any concerns should be reported as soon as possible after delivery.',
          'If a product is clearly damaged, incorrect, or substantially different from what was ordered, please contact us immediately.',
        ],
      },
      {
        heading: 'Custom Orders',
        body: [
          'Custom cake designs, personalized messages, and bespoke arrangements are typically non-returnable unless they are delivered in a damaged or incorrect condition.',
          'If an issue is reported promptly, we will review the item and work toward a fair resolution.',
        ],
      },
      {
        heading: 'Cancellation',
        body: [
          'Orders may be canceled before preparation begins, subject to our current production stage and timing.',
          'Once the product has been baked, packed, or dispatched, cancellation may not be possible.',
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

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 sm:py-16">
      <SEO
        title={`${content.title} | Cakes N More Sector 76 Noida`}
        description={content.description}
        canonical={canonicalMap[page]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#831843] hover:underline">
            ← Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-[#EADBDA] shadow-sm p-6 sm:p-10">
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#FCE7F3] text-[#831843] text-xs font-bold uppercase tracking-wider px-3 py-1.5">
              Cakes N More Policies
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#29141B] tracking-tight mt-4">
              {content.title}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-3 max-w-2xl leading-relaxed">
              {content.intro}
            </p>
          </div>

          <div className="space-y-8">
            {content.sections.map((section) => (
              <section key={section.heading} className="border-t border-[#F0E6E1] pt-6 first:border-t-0 first:pt-0">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                  {section.heading}
                </h2>
                <div className="space-y-3 text-sm sm:text-base text-gray-700 leading-relaxed">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-10 pt-6 border-t border-[#F0E6E1] text-sm text-gray-600">
            <p>
              For urgent order issues or questions, please contact us on WhatsApp or at{' '}
              <a href="tel:+919999517599" className="text-[#831843] font-semibold hover:underline">
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
