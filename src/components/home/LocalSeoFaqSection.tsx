import React, { useState } from 'react';
import { ChevronDown, HelpCircle, MapPin, Sparkles, Truck, Utensils } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

export const LOCAL_FAQS: FaqItem[] = [
  {
    question: 'Are all cakes at Cakes N More 100% eggless and pure vegetarian?',
    answer:
      'Yes, absolutely! Every single cake, pastry, bento cake, and dessert baked at Cakes N More Sector 76 Noida is 100% eggless and prepared in a strictly vegetarian bakery environment using premium dairy creams, rich chocolates, and fresh fruits.',
  },
  {
    question: 'How fast is your cake and flower delivery in Sector 76 Noida?',
    answer:
      'We offer same-day express delivery within 2 hours across Sector 76 and nearby Noida sectors. Standard orders can also be scheduled for your preferred time slot, including morning, afternoon, or evening party timings.',
  },
  {
    question: 'Do you offer midnight cake and flower delivery in Noida?',
    answer:
      'Yes! We specialize in midnight surprise deliveries between 11:30 PM and 12:15 AM across Sector 76 and surrounding sectors (74, 75, 77, 78, 79, 120, 121, 50). We recommend booking your midnight order at least 4 hours in advance via WhatsApp.',
  },
  {
    question: 'Which societies in Sector 76 Noida do you deliver to?',
    answer:
      'We provide direct doorstep delivery to all societies in Sector 76 including Amrapali Silicon City, Amrapali Crystal Homes, Aditya Urban Casa, JM Orchid, Sethi Max Royal, Skytech Matrott, as well as adjacent societies like Mahagun Moderne, Supertech Capetown, and Prateek Wisteria.',
  },
  {
    question: 'Can I customize my cake with photos, custom names, or special messages?',
    answer:
      'Yes! You can add personalized greeting messages or names directly on the cake for free. For edible photo cakes, tier cakes, pinata cakes, or customized fondant designs, simply connect with our bakers on WhatsApp (+91 9999517599) with your design reference.',
  },
  {
    question: 'Where is the physical Cakes N More store located in Sector 76?',
    answer:
      'Our physical boutique is located at Shop No. 29, Ground Floor, Amrapali Crystal Home Shopping Arcade, near Mithaas and Amrapali Silicon City, Sector 76, Noida, Uttar Pradesh 201301. You can visit us for cake tastings, flower selections, or order pickup.',
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
    'Sethi Max Royal',
    'Skytech Matrott',
    'Mahagun Moderne (Sec 78)',
    'Supertech Capetown (Sec 74)',
    'Prateek Wisteria (Sec 77)',
    'Antriksh Golf View',
    'Express Zenith (Sec 77)',
    'Civitech Sampriti (Sec 77)',
  ];

  return (
    <section className="py-14 sm:py-20 bg-[#FAF8F5] border-t border-[#F0EAE5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Local SEO Informational Content Block */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-[#EADBDA] shadow-sm mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FCE7F3] text-[#831843] text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Noida Sector 76 Premier Patisserie &amp; Florist</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#29141B] tracking-tight mb-4">
            Best Bakery in Sector 76 Noida – 100% Eggless Cakes &amp; Fresh Blooms
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700 leading-relaxed">
            <p>
              Looking for freshly baked cakes and exquisite floral arrangements in Sector 76 Noida? 
              <strong> Cakes N More</strong> brings premium artisanal baking right to your doorstep. 
              Conveniently located at <em>Shop 29, Amrapali Crystal Home Shopping Arcade</em> (near Mithaas, Amrapali Silicon City), 
              we pride ourselves on offering <strong>100% eggless, pure vegetarian celebration cakes</strong> crafted with the finest ingredients.
            </p>
            <p>
              From chocolate truffle, red velvet, and seasonal fresh fruit cakes to bento cakes, pull-me-up cakes, 
              and photo cakes, each confection is made on order to guarantee optimal freshness. Pair your cake with 
              fragrant Dutch roses, exotic lilies, or mixed floral bouquets, perfect for birthdays, anniversaries, and milestones.
            </p>
          </div>

          {/* Delivery Coverage Badge Cloud */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-600 mb-3">
              <MapPin className="w-4 h-4 text-[#831843]" />
              <span>Prompt Doorstep Delivery Across Sector 76 &amp; Neighborhood Societies:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {deliverySocieties.map((society) => (
                <span
                  key={society}
                  className="px-3 py-1 rounded-lg bg-[#FAF5F2] border border-[#EADBDA] text-xs text-gray-800 font-medium hover:border-[#831843] transition-colors"
                >
                  📍 {society}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* FAQs Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5F2] text-[#831843] text-xs font-bold uppercase tracking-wider mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#29141B] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            Everything you need to know about our cakes, flower bouquets, delivery timings, and order process.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto space-y-3">
          {LOCAL_FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-[#EADBDA] overflow-hidden shadow-xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                  className="w-full text-left px-5 sm:px-6 py-4 flex items-center justify-between gap-4 font-serif text-base sm:text-lg font-bold text-gray-900 hover:text-[#831843] transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#831843]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-[#FAF8F5]/40 animate-in fade-in duration-150">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
