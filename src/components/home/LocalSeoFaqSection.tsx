import React, { useState } from 'react';
import { ChevronDown, MapPin, Sparkles } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

export const LOCAL_FAQS: FaqItem[] = [
  {
    question: 'Are all cakes at Cakes N More 100% eggless?',
    answer:
      'Yes, absolutely! Every single cake, pastry, brownie, and confection at Cakes N More is 100% eggless and pure vegetarian. We craft our recipes using premium dairy cream, fine Belgian chocolates, and fresh fruits, guaranteeing rich flavour and light crumb texture without egg products.',
  },
  {
    question: 'Do you offer same-day delivery in Sector 76, Noida?',
    answer:
      'Yes! We provide same-day doorstep delivery within a 10 km radius of our Sector 76 store, covering Sector 76, 75, 74, 77, 78, 79, 50, and surrounding Noida neighborhoods. To ensure absolute oven-freshness, please confirm delivery radius on our website before ordering via WhatsApp.',
  },
  {
    question: 'Can I pick up my cake directly from your store?',
    answer:
      'Certainly! Our boutique is located at Shop 29, Ground Floor, Amrapali Crystal Home Shopping Arcade, Sector 76, Noida (near Mithaas, Amrapali Silicon City). You are warmly invited to visit, sample flavours, consult with our master bakers, or pick up your order directly.',
  },
  {
    question: 'How do I place an order for customized or photo cakes?',
    answer:
      'You can select any cake design on our website, specify custom weight and complimentary cake messages, and tap "WhatsApp Concierge". Our team will immediately verify your customization, share live pictures if needed, and confirm payment via UPI or direct transfer.',
  },
  {
    question: 'How fresh are the flowers used in your bouquets and combos?',
    answer:
      'We receive fresh-cut Dutch roses, Asiatic lilies, orchids, carnations, and seasonal blooms every morning from vetted growers. Each floral bouquet is arranged by skilled florists only after your order is confirmed, ensuring prolonged vase life and radiant petals.',
  },
  {
    question: 'What delivery radius does Cakes N More cover in Noida?',
    answer:
      'Our primary delivery service radius is up to 10 km from Shop 29, Amrapali Crystal Home, Sector 76, Noida. This covers prominent residential societies like Amrapali Silicon City, Amrapali Crystal Homes, Aditya Urban Casa, JM Orchid, Mahagun Moderne, Supertech Capetown, and nearby Noida sectors.',
  },
];

export const LocalSeoFaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  const deliverySocieties = [
    'Amrapali Silicon City',
    'Amrapali Crystal Homes',
    'Aditya Urban Casa',
    'JM Orchid',
    'Mahagun Moderne (Sector 78)',
    'Supertech Capetown (Sector 74)',
    'Antriksh Golf View (Sector 78)',
    'Civitech Sampriti (Sector 77)',
    'Prateek Wisteria (Sector 77)',
    'Sector 50 Noida',
  ];

  return (
    <section className="py-16 sm:py-24 bg-white border-t border-[#E8E2D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Local SEO Content Block */}
        <div className="editorial-card bg-[#FAF7F0] rounded-3xl p-6 sm:p-10 lg:p-14 border border-[#E8E2D5] shadow-xs mb-14 sm:mb-20">
          <span className="eyebrow-tag text-[#C5A46D] block mb-2">
            Sector 76 Noida Pâtisserie &amp; Florist
          </span>

          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#30251F] tracking-tight mb-4">
            Artisanal 100% Eggless Bakery &amp; Fresh Floral Studio in Sector 76
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 text-sm text-[#81776C] leading-relaxed font-normal">
            <p>
              Looking for freshly baked celebration cakes and exquisite floral arrangements in Sector 76 Noida? 
              <strong className="text-[#30251F]"> Cakes N More</strong> brings European patisserie standards and fresh botanicals right to your doorstep. 
              Our kitchen operates under stringent 100% vegetarian culinary protocols, ensuring every chocolate truffle, 
              red velvet, and seasonal fruit cake is entirely egg-free and delightfully fluffy.
            </p>
            <p>
              Located conveniently at <em className="text-[#30251F] not-italic font-semibold">Shop No. 29, Ground Floor, Amrapali Crystal Home Shopping Arcade</em>, 
              we are right next to Mithaas and seconds away from Amrapali Silicon City. We proudly cater to celebrations, birthdays, 
              weddings, and milestones with doorstep delivery in 60-90 minutes across central Noida.
            </p>
          </div>

          {/* Societies Served Pills */}
          <div className="mt-8 pt-6 border-t border-[#E8E2D5]">
            <p className="eyebrow-tag text-[10px] text-[#81776C] mb-3 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#C5A46D]" />
              <span>Prompt Doorstep Delivery Across Prominent Societies:</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {deliverySocieties.map((society) => (
                <span
                  key={society}
                  className="px-3 py-1.5 rounded-full bg-white border border-[#E8E2D5] text-xs text-[#30251F] font-medium shadow-2xs"
                >
                  {society}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Accordion Section */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <span className="eyebrow-tag text-[#C5A46D] block mb-2">Common Questions</span>
            <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[#30251F] tracking-tight">
              Frequently Asked Questions
            </h3>
            <p className="text-sm text-[#81776C] mt-2 font-normal">
              Clear answers regarding eggless certification, same-day delivery radius, and customized orders.
            </p>
          </div>

          <div className="space-y-3">
            {LOCAL_FAQS.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className="bg-[#FAF7F0] rounded-2xl border border-[#E8E2D5] overflow-hidden transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left font-serif text-base sm:text-lg font-bold text-[#30251F] hover:text-[#C5A46D] transition-colors cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#81776C] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#30251F]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 pt-1 text-sm text-[#81776C] leading-relaxed border-t border-[#E8E2D5] font-normal">
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
