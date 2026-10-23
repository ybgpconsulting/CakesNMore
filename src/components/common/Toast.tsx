import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const Toast: React.FC = () => {
  const { toastMessage, hideToast } = useCart();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-[calc(68px+max(0.6rem,env(safe-area-inset-bottom,0px)))] lg:bottom-8 right-4 sm:right-8 left-4 sm:left-auto z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="bg-[#161924]/95 backdrop-blur-xl text-[#F3F4F8] px-4 py-3 rounded-2xl shadow-2xl border border-[#232838] flex items-center gap-3 max-w-sm mx-auto sm:mx-0">
        <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0" />
        <span className="text-sm font-medium leading-snug">{toastMessage}</span>
        <div className="flex items-center gap-2 ml-auto shrink-0 pl-2">
          <Link
            to="/cart"
            onClick={hideToast}
            className="btn-primary-luxury text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all shadow-md"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Bag</span>
          </Link>
          <button
            onClick={hideToast}
            className="text-[#9CA3B4] hover:text-[#F1F3F8] p-1 rounded-full transition-colors"
            aria-label="Dismiss toast"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
