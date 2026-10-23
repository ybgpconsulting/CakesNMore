import React, { useState } from 'react';
import { Clock, ExternalLink, Mail, MapPin, Navigation, Phone, Send, Sparkles, Store } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { useStore } from '../context/StoreContext';
import {
  generateWhatsAppUrl,
  normalizeWhatsAppNumber,
  safeExternalUrl,
  WHATSAPP_ORDER_MESSAGE,
} from '../utils/urls';
import { WhatsAppIcon } from '../components/common/WhatsAppIcon';
import { getProductionUrl } from '../utils/seo';

export const ContactPage: React.FC = () => {
  const { settings } = useStore();

  const [inquiryName, setInquiryName] = useState('');
  const [inquiryOccasion, setInquiryOccasion] = useState('Birthday');
  const [inquiryDate, setInquiryDate] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');

  const cleanPhone = settings.phone.replace(/[^0-9+]/g, '') || '+919999517599';
  const cleanWhatsApp = normalizeWhatsAppNumber(settings.whatsappNumber);
  const whatsappUrl = generateWhatsAppUrl(cleanWhatsApp, WHATSAPP_ORDER_MESSAGE);
  const deliveryPartners = [
    { name: 'Zomato', url: settings.zomatoUrl, logo: 'https://cdn.simpleicons.org/zomato/E23744' },
    { name: 'Swiggy', url: settings.swiggyUrl, logo: 'https://cdn.simpleicons.org/swiggy/FC8019' },
    { name: 'Magicpin', url: settings.magicpinUrl, logo: 'https://cdn.simpleicons.org/magicpin/EF4F5F' },
  ].filter((partner) => partner.url && safeExternalUrl(partner.url));

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Hi Cakes N More (Sector 76 Noida),

Inquiry Details:
Name: ${inquiryName || 'Customer'}
Occasion: ${inquiryOccasion}
Required Date: ${inquiryDate || 'Today'}
Message / Custom Requirement:
${inquiryMessage || 'I would like to inquire about cake and flower delivery options.'}

Please let me know availability and pricing.`;

    const url = generateWhatsAppUrl(cleanWhatsApp, text);
    const win = window.open(url, '_blank', 'noopener,noreferrer');
    if (!win) {
      window.location.href = url;
    }
  };

  const contactSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ContactPage',
        '@id': getProductionUrl('/contact'),
        name: 'Contact Cakes N More Sector 76 Noida',
        url: getProductionUrl('/contact'),
        mainEntity: {
          '@id': `${getProductionUrl('/')}#localbusiness`,
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: getProductionUrl('/') },
          { '@type': 'ListItem', position: 2, name: 'Contact Us', item: getProductionUrl('/contact') },
        ],
      },
    ],
  };

  const contactKeywords = [
    'contact cakes n more noida',
    'bakery phone number sector 76 noida',
    'shop 29 amrapali crystal home noida',
    'cake shop near mithaas noida',
    'florist contact number noida 76',
    'cakes n more whatsapp order number',
    'bakery near sector 76 metro station noida',
  ].join(', ');

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#30251F] py-12 sm:py-20">
      <SEO
        title="Contact & Boutique Location | Cakes N More Noida Sector 76"
        description="Visit Cakes N More at Shop 29, Ground Floor, Amrapali Crystal Home, Sector 76, Noida. Call +91 9999517599 to ask about products and delivery availability."
        keywords={contactKeywords}
        imageAlt="Contact Cakes N More Sector 76 Noida Store and Map"
        schema={contactSchema}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-[#30251F] border border-[#E8E2D5] text-[11px] font-bold uppercase tracking-[0.2em] mb-4 shadow-sm">
            <Store className="w-3.5 h-3.5 text-[#C5A46D]" />
            <span>Store Concierge &amp; Visit</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-normal text-[#30251F] tracking-tight">
            Connect With Our Boutique
          </h1>
          <p className="text-sm sm:text-base text-[#81776C] mt-3 leading-relaxed">
            We are delighted to assist you with bespoke celebration cakes, artisanal floral arrangements, and festive hampers in Sector 76, Noida.
          </p>
        </div>

        {/* Quick Action Capsules */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto mb-14">
          <a
            href={`tel:${cleanPhone}`}
            className="btn-editorial-primary flex items-center justify-center gap-2 rounded-full px-5 py-4 text-xs font-bold tracking-wider"
          >
            <Phone className="w-4 h-4" />
            <span>Call the Store</span>
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-editorial-whatsapp flex items-center justify-center gap-2 rounded-full px-5 py-4 text-xs font-bold tracking-wider"
          >
            <WhatsAppIcon className="w-4 h-4 text-white" />
            <span>Chat on WhatsApp</span>
          </a>
          <a
            href={safeExternalUrl(settings.mapsUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-full bg-white border border-[#E8E2D5] px-5 py-4 text-xs font-bold tracking-wider text-[#30251F] shadow-sm hover:border-[#30251F] hover:bg-[#FAF7F0] transition-colors"
          >
            <Navigation className="w-4 h-4 text-[#C5A46D]" />
            <span>Get Directions</span>
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          {/* Left Column: Contact Cards */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Address Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E8E2D5] shadow-sm space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#FAF7F0] text-[#30251F] border border-[#E8E2D5] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-[#30251F]" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-normal text-[#30251F]">Boutique Address</h3>
                  <p className="text-xs sm:text-sm text-[#81776C] leading-relaxed mt-1">
                    {settings.address}
                  </p>
                  <p className="text-xs text-[#30251F] bg-[#FAF7F0] border border-[#E8E2D5] rounded-lg px-2.5 py-1 mt-2.5 inline-block font-medium">
                    📍 Landmark: Near Mithaas, Amrapali Silicon City Arcade
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={safeExternalUrl(settings.mapsUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-[#FAF7F0] hover:bg-[#E8E2D5] text-xs font-bold text-[#30251F] border border-[#E8E2D5] flex items-center justify-center gap-2 transition-colors"
                >
                  <Navigation className="w-4 h-4 text-[#C5A46D]" />
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#81776C]" />
                </a>
              </div>
            </div>

            {/* Direct Calling & WhatsApp */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E8E2D5] shadow-sm space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#FAF7F0] text-[#30251F] border border-[#E8E2D5] flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-[#30251F]" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-normal text-[#30251F]">Direct Telephone Concierge</h3>
                  <a href={`tel:${cleanPhone}`} className="text-sm font-bold text-[#30251F] hover:underline">
                    {settings.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-[#E8E2D5]">
                <div className="w-10 h-10 rounded-full bg-[#FAF7F0] text-[#244438] border border-[#E8E2D5] flex items-center justify-center shrink-0">
                  <WhatsAppIcon className="w-5 h-5 text-[#244438]" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-normal text-[#30251F]">WhatsApp Orders &amp; Custom Bakes</h3>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-[#244438] hover:underline"
                  >
                    +91 {cleanWhatsApp.slice(-10)}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-[#E8E2D5]">
                <div className="w-10 h-10 rounded-full bg-[#FAF7F0] text-[#C5A46D] border border-[#E8E2D5] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-[#C5A46D]" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-normal text-[#30251F]">Operating Hours</h3>
                  <p className="text-xs text-[#81776C]">{settings.openingHours}</p>
                </div>
              </div>
            </div>

            {deliveryPartners.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E8E2D5] space-y-4 shadow-sm">
                <div>
                  <h3 className="font-serif text-lg font-normal text-[#30251F]">Order on Delivery Apps</h3>
                  <p className="text-xs text-[#81776C] mt-1">Visit Cakes N More on these current delivery platform listings.</p>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {deliveryPartners.map((partner) => (
                    <a
                      key={partner.name}
                      href={safeExternalUrl(partner.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col sm:flex-row items-center justify-center gap-2 rounded-xl bg-[#FAF7F0] border border-[#E8E2D5] px-2 py-3 text-[11px] font-bold text-[#30251F] hover:border-[#30251F] hover:bg-white transition-colors"
                    >
                      <img src={partner.logo} alt={`${partner.name} delivery partner`} width={20} height={20} className="w-5 h-5 object-contain" />
                      <span>{partner.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Custom Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E8E2D5] shadow-sm">
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#C5A46D]">Custom Orders</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#30251F] mt-1 mb-2">
                Send a Bespoke Inquiry
              </h2>
              <p className="text-xs sm:text-sm text-[#81776C] mb-8 leading-relaxed">
                Planning a themed celebration, tiered wedding cake, or luxury corporate hamper order? Send your requirements directly to our master artisans via WhatsApp.
              </p>

              <form onSubmit={handleInquirySubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-bold text-[#30251F] uppercase tracking-[0.14em] mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="E.g., Priya Sharma"
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      className="w-full px-4 py-3 bg-[#FAF7F0] border border-[#E8E2D5] text-[#30251F] placeholder-[#81776C]/60 rounded-xl text-xs sm:text-sm focus:border-[#30251F] focus:bg-white focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#30251F] uppercase tracking-[0.14em] mb-2">
                      Occasion
                    </label>
                    <select
                      value={inquiryOccasion}
                      onChange={(e) => setInquiryOccasion(e.target.value)}
                      className="w-full px-4 py-3 bg-[#FAF7F0] border border-[#E8E2D5] text-[#30251F] rounded-xl text-xs sm:text-sm focus:border-[#30251F] focus:bg-white focus:outline-none transition-colors"
                    >
                      <option value="Birthday Celebration">Birthday Celebration</option>
                      <option value="Anniversary">Anniversary</option>
                      <option value="Romantic / Date Night">Romantic / Date Night</option>
                      <option value="Wedding / Engagement">Wedding / Engagement</option>
                      <option value="Corporate / Bulk Order">Corporate / Bulk Order</option>
                      <option value="Get Well Soon / General">Get Well Soon / General</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#30251F] uppercase tracking-[0.14em] mb-2">
                    Event / Delivery Date
                  </label>
                  <input
                    type="date"
                    value={inquiryDate}
                    onChange={(e) => setInquiryDate(e.target.value)}
                    className="w-full px-4 py-3 bg-[#FAF7F0] border border-[#E8E2D5] text-[#30251F] rounded-xl text-xs sm:text-sm focus:border-[#30251F] focus:bg-white focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#30251F] uppercase tracking-[0.14em] mb-2">
                    Your Requirements / Custom Cake Design Request
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe desired flavour, weight (e.g. 1kg Truffle), specific flower palette, or custom topper requests..."
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    className="w-full px-4 py-3 bg-[#FAF7F0] border border-[#E8E2D5] text-[#30251F] placeholder-[#81776C]/60 rounded-xl text-xs sm:text-sm focus:border-[#30251F] focus:bg-white focus:outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-full btn-editorial-whatsapp font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <WhatsAppIcon className="w-5 h-5 text-white" />
                  <span>Send Inquiry via WhatsApp</span>
                </button>
              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
