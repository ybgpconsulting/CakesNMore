import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, MapPin, ShoppingBag, Store } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useDeliveryAvailability } from '../../context/DeliveryContext';
import { useStore } from '../../context/StoreContext';
import { generateWhatsAppUrl, WHATSAPP_ORDER_MESSAGE } from '../../utils/urls';
import { WhatsAppIcon } from './WhatsAppIcon';

export const MobileBottomNav: React.FC = () => {
  const { totalQuantity } = useCart();
  const { settings } = useStore();
  const { openDeliveryGate, verifiedLocation } = useDeliveryAvailability();
  const location = useLocation();

  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const whatsappUrl = generateWhatsAppUrl(settings.whatsappNumber, WHATSAPP_ORDER_MESSAGE);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav
      aria-label="Mobile Bottom App Dock"
      className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl border-t border-[#E8E2D5] z-40 px-3 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom,0px))] shadow-[0_-4px_20px_rgba(48,37,31,0.05)]"
    >
      <div className="flex items-center justify-between max-w-md mx-auto">
        {/* Home */}
        <Link
          to="/"
          className={`flex-1 flex flex-col items-center justify-center py-1 text-[10px] font-medium transition-all active:scale-95 ${
            isActive('/') && location.pathname === '/'
              ? 'text-[#30251F] font-semibold'
              : 'text-[#81776C] hover:text-[#30251F]'
          }`}
        >
          <div className="relative">
            <Home className="w-5 h-5 mb-0.5" />
            {isActive('/') && location.pathname === '/' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#30251F]" />
            )}
          </div>
          <span className="mt-0.5">Home</span>
        </Link>

        {/* Menu / Catalog */}
        <Link
          to="/shop"
          className={`flex-1 flex flex-col items-center justify-center py-1 text-[10px] font-medium transition-all active:scale-95 ${
            isActive('/shop') ? 'text-[#30251F] font-semibold' : 'text-[#81776C] hover:text-[#30251F]'
          }`}
        >
          <div className="relative">
            <Store className="w-5 h-5 mb-0.5" />
            {isActive('/shop') && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#30251F]" />
            )}
          </div>
          <span className="mt-0.5">Shop</span>
        </Link>

        {/* 1-Tap Delivery Verification Gate */}
        <button
          type="button"
          onClick={openDeliveryGate}
          className="flex-1 flex flex-col items-center justify-center py-1 text-[10px] font-medium text-[#81776C] hover:text-[#30251F] transition-all active:scale-95"
          aria-label="Check delivery availability"
        >
          <div className="relative">
            <MapPin className="w-5 h-5 mb-0.5 text-[#C5A46D]" />
            <span
              className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
                verifiedLocation?.verified ? 'bg-[#244438]' : 'bg-[#C5A46D] animate-ping'
              }`}
            />
          </div>
          <span className="mt-0.5">
            {verifiedLocation?.verified ? 'Sec 76 ✓' : 'Delivery'}
          </span>
        </button>

        {/* WhatsApp Direct Concierge */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex flex-col items-center justify-center py-1 text-[10px] font-medium text-[#81776C] hover:text-[#244438] transition-all active:scale-95"
          aria-label="WhatsApp Concierge"
        >
          <WhatsAppIcon className="w-5 h-5 mb-0.5 text-[#244438]" />
          <span className="mt-0.5">WhatsApp</span>
        </a>

        {/* Bag / Cart */}
        <Link
          to="/cart"
          className={`relative flex-1 flex flex-col items-center justify-center py-1 text-[10px] font-medium transition-all active:scale-95 ${
            isActive('/cart') ? 'text-[#30251F] font-semibold' : 'text-[#81776C] hover:text-[#30251F]'
          }`}
          aria-label={`Shopping Bag (${totalQuantity})`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 mb-0.5" />
            {totalQuantity > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#30251F] text-white text-[9px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center ring-2 ring-white shadow-xs">
                {totalQuantity}
              </span>
            )}
            {isActive('/cart') && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#30251F]" />
            )}
          </div>
          <span className="mt-0.5">Bag</span>
        </Link>
      </div>
    </nav>
  );
};
