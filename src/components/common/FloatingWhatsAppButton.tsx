import React from 'react';
import { useLocation } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { WhatsAppIcon } from './WhatsAppIcon';

const PREFILLED_MESSAGE = 'Hi! I visited your website and would like to place an order in Sector 76 Noida.';

export const FloatingWhatsAppButton: React.FC = () => {
  const { settings } = useStore();
  const location = useLocation();

  // Hide on admin routes and cart to keep interface completely uncluttered
  if (location.pathname.startsWith('/admin') || location.pathname === '/cart') {
    return null;
  }

  // On product detail page, mobile already provides a dedicated sticky purchase bar with WhatsApp
  const isProductPage = location.pathname.startsWith('/product/');

  const cleanWhatsAppNumber = settings.whatsappNumber.replace(/[^0-9]/g, '') || '919999517599';
  const whatsappUrl = `https://wa.me/${cleanWhatsAppNumber}?text=${encodeURIComponent(PREFILLED_MESSAGE)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp with Cakes N More"
      title="Place an order on WhatsApp"
      className={`fixed right-4 sm:right-6 bottom-[calc(64px+max(0.4rem,env(safe-area-inset-bottom,0px)))] sm:bottom-6 z-40 h-13 w-13 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-emerald-950/20 transition-all hover:scale-105 hover:bg-[#20bd5a] focus:outline-none focus:ring-4 focus:ring-[#25D366]/30 active:scale-95 ${
        isProductPage ? 'hidden lg:flex' : 'flex'
      }`}
    >
      <WhatsAppIcon className="h-6 w-6 sm:h-7 sm:w-7" />
    </a>
  );
};