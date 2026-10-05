import React from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  ExternalLink,
  Facebook,
  Heart,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Store,
  Twitter,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { safeExternalUrl } from '../../utils/urls';
import { WhatsAppIcon } from './WhatsAppIcon';

export const Footer: React.FC = () => {
  const { settings, categories } = useStore();
  const currentYear = new Date().getFullYear();

  const cleanWhatsAppNumber = settings.whatsappNumber.replace(/[^0-9]/g, '') || '919999517599';
  const whatsappUrl = `https://wa.me/${cleanWhatsAppNumber}?text=${encodeURIComponent(
    'Hi, I would like to inquire about products at Cakes N More, Sector 76 Noida.'
  )}`;

  return (
    <footer className="premium-footer bg-[#1C1618] text-[#D8C7C5] pt-10 pb-24 sm:pb-10 border-t border-[#312527]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-8 mb-8">
          {/* Brand & Overview (Col 1 & 2) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#9D174D] text-white flex items-center justify-center">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-2xl font-bold text-white tracking-tight leading-none">
                  Cakes N More
                </h3>
                <p className="text-xs text-[#E8A598] tracking-wider uppercase font-medium mt-1">
                  Sector 76, Noida • Uttar Pradesh
                </p>
              </div>
            </div>

            <p className="text-sm text-[#A89897] leading-relaxed max-w-sm pt-1">
              Fresh 100% eggless celebration cakes, exotic flower bouquets, indoor plants and luxury gift hampers from our neighborhood boutique bakery in Sector 76, Noida.
            </p>

            <div className="pt-2 flex items-center gap-3">
              {settings.instagramUrl && (
                <a
                  href={safeExternalUrl(settings.instagramUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Instagram"
                  className="w-9 h-9 rounded-full bg-[#2A1E22] hover:bg-[#9D174D] text-white flex items-center justify-center transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings.facebookUrl && (
                <a
                  href={safeExternalUrl(settings.facebookUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Facebook"
                  className="w-9 h-9 rounded-full bg-[#2A1E22] hover:bg-[#9D174D] text-white flex items-center justify-center transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {settings.twitterUrl && (
                <a
                  href={safeExternalUrl(settings.twitterUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Twitter/X"
                  className="w-9 h-9 rounded-full bg-[#2A1E22] hover:bg-[#9D174D] text-white flex items-center justify-center transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp"
                className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                <WhatsAppIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links (Col 3) */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-[#E8A598] font-bold">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Our Store
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact & Map
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition-colors">
                  Review Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories (Col 4) */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-[#E8A598] font-bold">Catalogue</h4>
            <ul className="space-y-2 text-sm">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link to={`/category/${cat.slug}`} className="hover:text-white transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details (Col 5) */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-[#E8A598] font-bold">Store Visit</h4>
            <div className="space-y-2.5 text-xs text-[#B5A5A4]">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#E8A598] shrink-0 mt-0.5" />
                <p className="leading-snug">{settings.address}</p>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#E8A598] shrink-0" />
                <a href={`tel:${settings.phone}`} className="hover:text-white font-medium">
                  {settings.phone}
                </a>
              </div>

              <div className="flex items-center gap-2">
                <WhatsAppIcon className="w-4 h-4 shrink-0" />
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white text-[#25D366] font-medium"
                >
                  WhatsApp: {settings.whatsappNumber}
                </a>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#E8A598] shrink-0 mt-0.5" />
                <span>{settings.openingHours}</span>
              </div>

              <div className="pt-1">
                <a
                  href={safeExternalUrl(settings.mapsUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#FBCFE8] hover:underline"
                >
                  <span>Get Google Maps Directions</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {(settings.zomatoUrl || settings.swiggyUrl || settings.magicpinUrl) && (
                <div className="pt-3 border-t border-[#312527] space-y-2">
                  <p className="text-[10px] uppercase tracking-widest text-[#E8A598] font-bold">Order on delivery apps</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
                    {settings.zomatoUrl && <a href={safeExternalUrl(settings.zomatoUrl)} target="_blank" rel="noopener noreferrer" className="text-[#FBCFE8] hover:text-white hover:underline">Zomato</a>}
                    {settings.swiggyUrl && <a href={safeExternalUrl(settings.swiggyUrl)} target="_blank" rel="noopener noreferrer" className="text-[#FBCFE8] hover:text-white hover:underline">Swiggy</a>}
                    {settings.magicpinUrl && <a href={safeExternalUrl(settings.magicpinUrl)} target="_blank" rel="noopener noreferrer" className="text-[#FBCFE8] hover:text-white hover:underline">Magicpin</a>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Local Keywords & Delivery Reach Ribbon */}
        <div className="pt-6 border-t border-[#312527] mb-4">
          <p className="text-[11px] text-[#A89897] leading-relaxed">
            <strong className="text-[#E8A598]">Local Doorstep Delivery Across Noida:</strong> Sector 76, Sector 75, Sector 74, Sector 77, Sector 78, Sector 79, Sector 50, Sector 51, Amrapali Silicon City, Amrapali Crystal Homes, Mahagun Moderne, Supertech Capetown, Aditya Urban Casa, and Central Noida. 100% Eggless Cakes • Midnight Delivery • Fresh Flowers.
          </p>
        </div>

        {/* Bottom Sub-bar */}
        <div className="pt-5 border-t border-[#312527] flex flex-col sm:flex-row items-center justify-between text-xs text-[#8A797A] gap-3">
          <p>© {currentYear} Cakes N More. All rights reserved. Sector 76, Noida, UP 201301.</p>
          <a
            href="https://ybgp.in"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Looking to grow your business? Your business growth partner. Designed and developed by YBGP. Visit ybgp.in"
            className="flex items-center gap-3 rounded-md text-right text-[#D8C7C5] transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A598] focus-visible:ring-offset-4 focus-visible:ring-offset-[#1C1618]"
          >
            <span className="flex flex-col items-end gap-1">
              <span className="font-semibold text-white">Looking to grow your business?</span>
              <span className="text-[#A89897]">Designed and developed by YBGP</span>
            </span>
            <img src="/ybgp-logo.png" alt="" className="h-9 w-auto" />
          </a>

        </div>
      </div>
    </footer>
  );
};
