import React, { useState } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import { useDeliveryAvailability } from '../../context/DeliveryContext';
import { useStore } from '../../context/StoreContext';
import { DeliverySettings } from '../../types';

interface FaqItem {
  question: string;
  answer: string;
}

export const getLocalFaqs = (
  deliverySettings: Pick<DeliverySettings, 'enabled' | 'radiusKm'>
): FaqItem[] => [
  {
    question: 'Are Cakes N More cakes eggless?',
    answer:
      'Cakes N More presents its cake range as eggless. For ingredient details or other dietary requirements, check the individual product information and contact the store before ordering.',
  },
  {
    question: 'How can I check delivery availability and timing?',
    answer: deliverySettings.enabled
      ? `Delivery is configured for addresses within up to ${deliverySettings.radiusKm} km of the store. Use the delivery checker to verify your address; the team can confirm an estimated delivery time for your order.`
      : 'Delivery is currently disabled in the store settings. Contact the store to ask about collection or future delivery availability.',
  },
  {
    question: 'Can I pick up an order from the store?',
    answer:
      'The store address and current opening hours are listed in the location section below. Call ahead to confirm arrangements before visiting.',
  },
  {
    question: 'Can I request a customized cake or message?',
    answer:
      'Customization options are shown on products where available. Share any additional request with the store on WhatsApp so the team can confirm what is possible and any applicable details.',
  },
  {
    question: 'Are all flowers and bouquets always available?',
    answer:
      'Flower selection can vary. Browse the current catalogue and contact the store to confirm availability before placing an order.',
  },
];

export const LocalSeoFaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { deliverySettings } = useDeliveryAvailability();
  const { settings } = useStore();
  const faqs = getLocalFaqs(deliverySettings);
  const configuredAreas = deliverySettings.specialDeliveryAreas || [];

  const toggleFaq = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="border-t border-[#E8E2D5] bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="editorial-card mb-14 rounded-3xl border border-[#E8E2D5] bg-[#FAF7F0] p-6 shadow-xs sm:mb-20 sm:p-10 lg:p-14">
          <span className="eyebrow-tag mb-2 block text-[#C5A46D]">
            Cakes, Flowers &amp; Gifts in Sector 76
          </span>
          <h2 className="mb-4 font-serif text-2xl font-bold tracking-tight text-[#30251F] sm:text-4xl">
            A local catalogue for thoughtful celebrations
          </h2>

          <div className="grid grid-cols-1 gap-6 text-sm leading-relaxed text-[#81776C] sm:gap-8 md:grid-cols-2">
            <p>
              Browse the current Cakes N More catalogue for cakes, flowers and gifts. Product
              descriptions and available options provide details for each item. For ingredient,
              customization or availability questions, contact the store before ordering.
            </p>
            <p>
              Find us at <strong className="font-semibold text-[#30251F]">{settings.address}</strong>.
              Delivery eligibility is checked against the current store settings; contact the team
              to confirm timing for your order.
            </p>
          </div>

          {deliverySettings.enabled && (
            <div className="mt-8 border-t border-[#E8E2D5] pt-6">
              <p className="eyebrow-tag mb-3 flex items-center gap-1.5 text-[10px] text-[#81776C]">
                <MapPin className="h-3.5 w-3.5 text-[#C5A46D]" />
                <span>
                  Configured delivery radius: up to {deliverySettings.radiusKm} km. Check your
                  address for eligibility.
                </span>
              </p>
              {configuredAreas.length > 0 && (
                <div className="flex flex-wrap gap-2" aria-label="Areas listed in delivery settings">
                  {configuredAreas.map((area) => (
                    <span
                      key={area}
                      className="rounded-full border border-[#E8E2D5] bg-white px-3 py-1.5 text-xs font-medium text-[#30251F]"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center sm:mb-14">
            <span className="eyebrow-tag mb-2 block text-[#C5A46D]">Common questions</span>
            <h3 className="font-serif text-3xl font-bold tracking-tight text-[#30251F] sm:text-4xl">
              Frequently Asked Questions
            </h3>
            <p className="mt-2 text-sm text-[#81776C]">
              Product details, delivery checks and ordering with Cakes N More.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={faq.question}
                  className="overflow-hidden rounded-2xl border border-[#E8E2D5] bg-[#FAF7F0] transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left font-serif text-base font-bold text-[#30251F] transition-colors hover:text-[#C5A46D] sm:text-lg"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-[#81776C] transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#30251F]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-[#E8E2D5] px-6 pb-6 pt-4 text-sm leading-relaxed text-[#81776C]">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
