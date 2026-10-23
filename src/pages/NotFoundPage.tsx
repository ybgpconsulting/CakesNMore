import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Cake, Compass, Flower2, Gift, Home, MapPin, Search } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { WhatsAppIcon } from '../components/common/WhatsAppIcon';
import { useStore } from '../context/StoreContext';
import { generateWhatsAppUrl, WHATSAPP_ORDER_MESSAGE } from '../utils/urls';

export const NotFoundPage: React.FC = () => {
  const { settings } = useStore();
  const whatsappUrl = generateWhatsAppUrl(
    settings.whatsappNumber,
    'Hi Cakes N More, I was looking for a page or item on your website that could not be found. Could you please help me with what is available?'
  );

  return (
    <div className="min-h-[75vh] bg-[#FAF7F0] text-[#30251F] py-16 sm:py-24 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <SEO
        title="Page Not Found (404) | Cakes N More Sector 76 Noida"
        description="The page you are looking for could not be found. Browse freshly baked 100% eggless celebration cakes, floral bouquets, and gift hampers in Sector 76, Noida."
        noindex={true}
        robots="noindex,nofollow"
      />

      <div className="max-w-2xl w-full text-center space-y-8 bg-white rounded-3xl p-8 sm:p-14 border border-[#E8E2D5] shadow-[0_12px_40px_rgba(48,37,31,0.06)]">
        {/* Decorative Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF7F0] border border-[#E8E2D5] text-[#C5A46D] text-xs font-bold uppercase tracking-[0.2em]">
          <Compass className="w-3.5 h-3.5 text-[#C5A46D]" />
          <span>Error 404 • Page Not Found</span>
        </div>

        {/* Heading & Explanation */}
        <div className="space-y-3">
          <h1 className="font-serif text-4xl sm:text-6xl font-normal text-[#30251F] tracking-tight">
            Lost in the Sweetness?
          </h1>
          <p className="text-sm sm:text-base text-[#81776C] max-w-lg mx-auto leading-relaxed">
            The confection, floral arrangement or page you requested doesn’t exist or has moved. Explore our popular collections below or contact our boutique atelier in Sector 76, Noida.
          </p>
        </div>

        {/* Quick Nav Destination Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <Link
            to="/category/cakes"
            className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-[#FAF7F0] border border-[#E8E2D5] hover:border-[#C5A46D] hover:bg-white transition-all shadow-2xs hover:shadow-sm"
          >
            <div className="w-10 h-10 rounded-full bg-white border border-[#E8E2D5] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Cake className="w-5 h-5 text-[#C5A46D]" />
            </div>
            <span className="font-serif font-bold text-sm text-[#30251F]">Eggless Cakes</span>
            <span className="text-[11px] text-[#81776C] mt-0.5">Freshly Baked</span>
          </Link>

          <Link
            to="/category/flowers"
            className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-[#FAF7F0] border border-[#E8E2D5] hover:border-[#C5A46D] hover:bg-white transition-all shadow-2xs hover:shadow-sm"
          >
            <div className="w-10 h-10 rounded-full bg-white border border-[#E8E2D5] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Flower2 className="w-5 h-5 text-[#C5A46D]" />
            </div>
            <span className="font-serif font-bold text-sm text-[#30251F]">Fresh Blooms</span>
            <span className="text-[11px] text-[#81776C] mt-0.5">Morning Cut Stems</span>
          </Link>

          <Link
            to="/shop"
            className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-[#FAF7F0] border border-[#E8E2D5] hover:border-[#C5A46D] hover:bg-white transition-all shadow-2xs hover:shadow-sm"
          >
            <div className="w-10 h-10 rounded-full bg-white border border-[#E8E2D5] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Gift className="w-5 h-5 text-[#C5A46D]" />
            </div>
            <span className="font-serif font-bold text-sm text-[#30251F]">All Creations</span>
            <span className="text-[11px] text-[#81776C] mt-0.5">Full Catalogue</span>
          </Link>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-[#E8E2D5]">
          <Link
            to="/"
            className="btn-editorial-primary editorial-shimmer inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-xs font-semibold tracking-wider text-white"
          >
            <Home className="w-4 h-4 text-[#C5A46D]" />
            <span>Return to Storefront</span>
          </Link>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-editorial-whatsapp inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-xs font-semibold tracking-wider text-white"
          >
            <WhatsAppIcon className="w-4 h-4 text-white" />
            <span>Ask on WhatsApp</span>
          </a>
        </div>

        {/* Local Address Reminder */}
        <div className="pt-2 text-xs text-[#81776C] flex items-center justify-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#C5A46D] shrink-0" />
          <span>Shop No. 29, Ground Floor, Amrapali Crystal Home, Sector 76, Noida</span>
        </div>
      </div>
    </div>
  );
};
