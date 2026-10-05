import React, { useState } from 'react';
import { Clock, ExternalLink, Mail, MapPin, Navigation, Phone, Send, Store } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { useStore } from '../context/StoreContext';
import { generateWhatsAppUrl, normalizeWhatsAppNumber, safeExternalUrl } from '../utils/urls';
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
  const whatsappUrl = generateWhatsAppUrl(cleanWhatsApp);
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
    <div className="min-h-screen bg-[#FAF8F5] py-12 sm:py-16">
      <SEO
        title="Contact & Location | Cakes N More Noida Sector 76"
        description="Visit Cakes N More at Shop 29, Ground Floor, Amrapali Crystal Home, Sector 76, Noida. Call +91 9999517599 for quick WhatsApp orders and same-day delivery."
        keywords={contactKeywords}
        schema={contactSchema}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FCE7F3] text-[#831843] text-xs font-bold uppercase tracking-wider mb-2">
            <Store className="w-3.5 h-3.5" />
            <span>Store Location &amp; Contact</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#29141B]">
            Get in Touch With Us
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            We are here to assist you with customized celebration cakes, midnight flower deliveries, and corporate gifts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-4xl mx-auto mb-10">
          <a href={`tel:${cleanPhone}`} className="flex items-center justify-center gap-2 rounded-2xl bg-[#831843] px-4 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[#6b1336] transition-colors">
            <Phone className="w-4 h-4" />
            <span>Call the store</span>
          </a>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[#20bd5a] transition-colors">
            <WhatsAppIcon className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </a>
          <a href={safeExternalUrl(settings.mapsUrl)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-2xl bg-white border border-[#EADBDA] px-4 py-3.5 text-sm font-bold text-[#831843] shadow-sm hover:bg-[#FDF2F8] transition-colors">
            <Navigation className="w-4 h-4" />
            <span>Get directions</span>
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Left Column: Contact Cards */}
          <div className="lg:col-span-5 space-y-4">
            {/* Address Card */}
            <div className="bg-white rounded-3xl p-6 border border-[#EADBDA] shadow-sm space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAF5F2] text-[#831843] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-gray-900">Store Address</h3>
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mt-1">
                    {settings.address}
                  </p>
                  <p className="text-xs text-amber-800 bg-amber-50 rounded-md px-2 py-1 mt-2 inline-block font-medium">
                    Landmark: Near Mithaas, Amrapali Silicon City
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={safeExternalUrl(settings.mapsUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#FAF8F5] hover:bg-gray-100 text-xs font-bold text-gray-800 border border-gray-200 flex items-center justify-center gap-2 transition-colors"
                >
                  <Navigation className="w-4 h-4 text-[#831843]" />
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                </a>
              </div>
            </div>

            {/* Direct Calling & WhatsApp */}
            <div className="bg-white rounded-3xl p-6 border border-[#EADBDA] shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAF5F2] text-[#831843] flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-gray-900">Direct Phone Call</h3>
                  <a href={`tel:${cleanPhone}`} className="text-sm font-bold text-[#831843] hover:underline">
                    {settings.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#25D366] flex items-center justify-center shrink-0">
                  <WhatsAppIcon className="w-5 h-5 rounded-full bg-[#25D366] p-1" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-gray-900">WhatsApp Orders &amp; Inquiry</h3>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-[#25D366] hover:underline"
                  >
                    +91 {cleanWhatsApp.slice(-10)}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-600 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-gray-900">Operating Hours</h3>
                  <p className="text-xs text-gray-600">{settings.openingHours}</p>
                  <p className="text-[11px] text-emerald-600 font-semibold">Open 7 Days a Week</p>
                </div>
              </div>
            </div>

            {deliveryPartners.length > 0 && (
              <div className="bg-[#FFF8F2] rounded-3xl p-6 border border-[#F0E0D6] space-y-3">
                <div>
                  <h3 className="font-serif text-lg font-bold text-gray-900">Order from your preferred app</h3>
                  <p className="text-xs text-gray-600 mt-1">Choose a delivery partner and order directly from their store page.</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {deliveryPartners.map((partner) => (
                    <a key={partner.name} href={safeExternalUrl(partner.url)} target="_blank" rel="noopener noreferrer" className="flex flex-col sm:flex-row items-center justify-center gap-1.5 rounded-xl bg-white border border-[#EADBDA] px-2 py-2.5 text-[11px] font-bold text-gray-800 hover:border-[#831843] hover:text-[#831843] transition-colors">
                      <img src={partner.logo} alt="" className="w-5 h-5 object-contain" />
                      <span>{partner.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Custom Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBDA] shadow-sm">
              <h2 className="font-serif text-2xl font-bold text-gray-900 mb-1">
                Send a Custom Inquiry
              </h2>
              <p className="text-xs text-gray-500 mb-6">
                Planning a special birthday theme, wedding decor, or corporate hamper bulk order? Send us a quick note directly via WhatsApp.
              </p>

              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="E.g., Priya Sharma"
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#831843] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Occasion
                    </label>
                    <select
                      value={inquiryOccasion}
                      onChange={(e) => setInquiryOccasion(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#831843] focus:outline-none"
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
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Event / Delivery Date
                  </label>
                  <input
                    type="date"
                    value={inquiryDate}
                    onChange={(e) => setInquiryDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#831843] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Your Requirements / Custom Cake Design Request
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe flavour, weight (e.g. 1kg Truffle), specific flower colors, or custom topper requests..."
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#831843] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm shadow flex items-center justify-center gap-2 transition-all"
                >
                  <WhatsAppIcon className="w-5 h-5" />
                  <span>Send Inquiry via WhatsApp</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Full-width Map Section */}
      </div>
    </div>
  );
};
