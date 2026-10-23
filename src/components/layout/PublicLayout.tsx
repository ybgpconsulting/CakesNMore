import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { Footer } from '../common/Footer';
import { FloatingWhatsAppButton } from '../common/FloatingWhatsAppButton';
import { Header } from '../common/Header';
import { MobileBottomNav } from '../common/MobileBottomNav';
import { Toast } from '../common/Toast';
import { useCart } from '../../context/CartContext';

export const PublicLayout: React.FC = () => {
  const { totalQuantity, subtotal } = useCart();
  const location = useLocation();

  const showFloatingCart =
    totalQuantity > 0 &&
    location.pathname !== '/cart' &&
    !location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#30251F] selection:bg-[#E8CECB] selection:text-[#30251F]">
      <Header />
      <main className="flex-grow pb-28 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile App Floating Cart Checkout Pill */}
      {showFloatingCart && (
        <div className="md:hidden fixed bottom-[calc(56px+max(0.6rem,env(safe-area-inset-bottom,0px)))] inset-x-3 max-w-md mx-auto z-40 animate-in slide-in-from-bottom-4 duration-300">
          <Link
            to="/cart"
            className="btn-editorial-primary editorial-shimmer flex items-center justify-between px-4 py-3 rounded-2xl shadow-[0_10px_30px_rgba(48,37,31,0.22)] active:scale-[0.98] transition-all border border-[#C5A46D]/30"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center font-bold text-xs text-white">
                <ShoppingBag className="w-4 h-4 text-[#C5A46D]" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold leading-tight text-white">
                  {totalQuantity} {totalQuantity === 1 ? 'Creation' : 'Creations'} in Bag
                </span>
                <span className="text-[11px] text-[#E8CECB] font-medium leading-tight mt-0.5">
                  ₹{subtotal} • Same-Day Noida Delivery
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white bg-white/15 px-3 py-1.5 rounded-full">
              <span>View Bag</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C5A46D]" />
            </div>
          </Link>
        </div>
      )}

      <Footer />
      <MobileBottomNav />
      <FloatingWhatsAppButton />
      <Toast />
    </div>
  );
};
