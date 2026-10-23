import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  MapPin,
  Menu,
  Phone,
  Search,
  ShoppingBag,
  Sparkles,
  X,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useDeliveryAvailability } from '../../context/DeliveryContext';
import { useStore } from '../../context/StoreContext';
import { WhatsAppIcon } from './WhatsAppIcon';
import { safeExternalUrl } from '../../utils/urls';

export const Header: React.FC = () => {
  const { totalQuantity } = useCart();
  const { openDeliveryGate, verifiedLocation } = useDeliveryAvailability();
  const { settings, categories, homepageConfig } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchModal(false);
      setSearchQuery('');
    }
  };

  const cleanWhatsAppNumber = settings.whatsappNumber.replace(/[^0-9]/g, '') || '919999517599';
  const directWhatsAppUrl = `https://wa.me/${cleanWhatsAppNumber}?text=${encodeURIComponent(
    'Hi Cakes N More Sector 76! I would like to inquire about fresh celebration cakes and flowers.'
  )}`;

  const navLinks = [
    { name: 'Shop All', path: '/shop' },
    { name: 'Cakes', path: '/category/cakes' },
    { name: 'Flowers', path: '/category/flowers' },
    { name: 'Gifts & Hampers', path: '/category/gifts' },
    { name: 'About', path: '/about' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="editorial-header sticky top-0 z-40 transition-all duration-300">
      {/* Optional Top Announcement Strip (Single clean line) */}
      {homepageConfig.promoBannerActive && (
        <div className="bg-[#FAF7F0] border-b border-[#E8E2D5] text-[#81776C] text-[11px] font-medium py-1.5 px-4 text-center tracking-wide flex items-center justify-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-[#30251F]">
            <Sparkles className="w-3 h-3 text-[#C5A46D]" />
            {settings.bannerAnnouncement || homepageConfig.promoBannerText}
          </span>
          {settings.phone && (
            <a
              href={`tel:${settings.phone.replace(/[^0-9+]/g, '')}`}
              className="hidden md:inline-flex items-center gap-1 text-[#81776C] hover:text-[#30251F] transition-colors"
            >
              • Call: {settings.phone}
            </a>
          )}
        </div>
      )}

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="my-2 sm:my-3 flex h-16 items-center justify-between gap-3 rounded-full border border-[#C5A46D]/80 bg-white/80 px-3 shadow-[0_5px_18px_rgba(130,79,65,0.08)] sm:h-20 sm:gap-4 sm:px-5">
          
          {/* Brand Identity */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex flex-col group">
              <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#30251F] group-hover:text-[#4A3B32] transition-colors leading-none">
                Cakes N More
              </span>
              <span className="eyebrow-tag text-[9px] sm:text-[10px] text-[#81776C] mt-1">
                Atelier &amp; Florist • Sector 76 Noida
              </span>
            </Link>

            {/* Desktop Location Pill */}
            <button
              type="button"
              onClick={openDeliveryGate}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E8E2D5] hover:border-[#C5A46D] text-[#81776C] hover:text-[#30251F] text-xs font-medium transition-all shadow-xs"
              title="Verify delivery availability in Noida"
            >
              <MapPin className="w-3.5 h-3.5 text-[#C5A46D]" />
              <span>{verifiedLocation?.verified ? 'Delivering to Sec 76 ✓' : 'Noida Sector 76'}</span>
              <ChevronDown className="w-3 h-3 text-[#B4ACA2]" />
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`px-3.5 py-2 rounded-full text-xs font-medium tracking-wide transition-all ${
                  isActive(item.path)
                    ? 'text-[#30251F] font-semibold bg-[#FFFFFF] shadow-xs border border-[#E8E2D5]'
                    : 'text-[#81776C] hover:text-[#30251F] hover:bg-white/60'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Action Icons & Ordering */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger */}
            <button
              type="button"
              onClick={() => setShowSearchModal(true)}
              aria-label="Search cakes and flowers"
              className="p-2 sm:p-2.5 text-[#81776C] hover:text-[#30251F] hover:bg-white rounded-full border border-transparent hover:border-[#E8E2D5] transition-all"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Delivery gate trigger on mobile */}
            <button
              type="button"
              onClick={openDeliveryGate}
              className="lg:hidden p-2 text-[#81776C] hover:text-[#30251F] hover:bg-white rounded-full border border-transparent transition-all"
              aria-label="Delivery location"
            >
              <MapPin className="w-4 h-4 text-[#C5A46D]" />
            </button>

            {/* Shopping Bag / Cart */}
            <Link
              to="/cart"
              aria-label={`Shopping bag with ${totalQuantity} creations`}
              className="relative p-2 sm:p-2.5 text-[#81776C] hover:text-[#30251F] hover:bg-white rounded-full border border-transparent hover:border-[#E8E2D5] transition-all"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              {totalQuantity > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 bg-[#30251F] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {totalQuantity}
                </span>
              )}
            </Link>

            {/* WhatsApp Concierge CTA */}
            <a
              href={directWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-editorial-primary editorial-shimmer hidden sm:inline-flex items-center gap-2 px-4.5 py-2.5 rounded-full text-xs font-semibold tracking-wide"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 text-white" />
              <span>WhatsApp Order</span>
            </a>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              className="md:hidden p-2 text-[#30251F] hover:bg-white rounded-full border border-[#E8E2D5] transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Editorial & Clean) */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[64px] bottom-0 bg-[#FAF7F0] z-50 overflow-y-auto border-t border-[#E8E2D5] p-6 pb-28 flex flex-col justify-between animate-in fade-in duration-200">
          <div className="space-y-6">
            {/* Search Input in Drawer */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search cakes, flowers, hampers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#E8E2D5] rounded-xl text-sm text-[#30251F] placeholder-[#9E958A] focus:outline-none focus:border-[#C5A46D]"
              />
              <Search className="w-4 h-4 text-[#81776C] absolute left-3.5 top-3.5" />
            </form>

            {/* Main Nav Links */}
            <nav className="flex flex-col space-y-1">
              {navLinks.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-base font-serif font-bold transition-all ${
                    isActive(item.path)
                      ? 'bg-white text-[#30251F] shadow-xs border border-[#E8E2D5]'
                      : 'text-[#81776C] hover:text-[#30251F] hover:bg-white/60'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Categories Quick List */}
            {categories.length > 0 && (
              <div className="pt-2 border-t border-[#E8E2D5]">
                <p className="eyebrow-tag mb-3">Browse Categories</p>
                <div className="grid grid-cols-2 gap-2">
                  {categories.filter((c) => c.active).map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/category/${cat.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-3 bg-white border border-[#E8E2D5] rounded-xl text-xs font-medium text-[#30251F] hover:border-[#C5A46D] transition-colors flex items-center justify-between"
                    >
                      <span>{cat.name}</span>
                      <span className="text-[10px] text-[#B4ACA2]">→</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Drawer Footer & Actions */}
          <div className="pt-6 border-t border-[#E8E2D5] space-y-3">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                openDeliveryGate();
              }}
              className="w-full py-3 px-4 rounded-xl bg-white border border-[#E8E2D5] text-xs font-medium text-[#30251F] flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4 text-[#C5A46D]" />
              <span>Verify Delivery to Your Address</span>
            </button>

            <a
              href={directWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-editorial-whatsapp w-full py-3.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 text-white"
            >
              <WhatsAppIcon className="w-4 h-4 text-white" />
              <span>Order on WhatsApp Concierge</span>
            </a>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-[#30251F]/40 backdrop-blur-sm flex items-start justify-center pt-20 px-4 animate-in fade-in duration-150">
          <div
            className="bg-[#FAF7F0] border border-[#E8E2D5] rounded-3xl w-full max-w-xl p-6 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D5]">
              <span className="eyebrow-tag">Search Collection</span>
              <button
                type="button"
                onClick={() => setShowSearchModal(false)}
                className="text-[#81776C] hover:text-[#30251F] p-1 rounded-full hover:bg-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSearch} className="mt-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type cake flavour, flower bouquet, hamper..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-[#E8E2D5] rounded-2xl text-sm sm:text-base text-[#30251F] placeholder-[#9E958A] focus:outline-none focus:border-[#C5A46D] shadow-xs"
                />
                <Search className="w-5 h-5 text-[#81776C] absolute left-3.5 top-3.5" />
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="text-[#81776C] self-center text-[11px] font-semibold uppercase tracking-wider">Trending:</span>
                {['Truffle Cake', 'Dutch Roses', 'Pinata Cake', 'Anniversary Hamper', 'Lilies', 'Bento Cake'].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      navigate(`/shop?search=${encodeURIComponent(term)}`);
                      setShowSearchModal(false);
                    }}
                    className="px-3 py-1.5 bg-white hover:bg-[#F7EFEF] border border-[#E8E2D5] rounded-full text-[#30251F] text-xs font-medium transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="btn-editorial-primary w-full mt-5 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider"
              >
                View Results
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
