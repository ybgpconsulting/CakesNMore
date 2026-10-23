import React from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  ExternalLink,
  Facebook,
  Instagram,
  MapPin,
  Phone,
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
    <footer className="bg-[#30251F] text-[#FAF7F0] pt-14 pb-28 md:pb-12 border-t border-[#4A3B32]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Brand Col 1 & 2 */}
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-1">
              <h3 className="font-serif text-3xl font-bold text-white tracking-tight leading-tight">
                Cakes N More
              </h3>
              <p className="eyebrow-tag text-[10px] text-[#C5A46D]">
                Artisanal Atelier &amp; Botanical Florist • Sector 76 Noida
              </p>
            </div>

            <p className="text-sm text-[#B4ACA2] leading-relaxed max-w-sm pt-1">
              100% pure vegetarian handcrafted celebration cakes, fresh morning flowers, indoor plants, and luxury gift hampers prepared at Shop 29, Ground Floor, Amrapali Crystal Home, Sector 76, Noida.
            </p>

            {/* Social & WhatsApp */}
            <div className="pt-2 flex items-center gap-3">
              {settings.instagramUrl && (
                <a
                  href={safeExternalUrl(settings.instagramUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Instagram"
                  className="w-9 h-9 rounded-full bg-[#4A3B32] hover:bg-[#C5A46D] text-white flex items-center justify-center transition-colors"
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
                  className="w-9 h-9 rounded-full bg-[#4A3B32] hover:bg-[#C5A46D] text-white flex items-center justify-center transition-colors"
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
                  className="w-9 h-9 rounded-full bg-[#4A3B32] hover:bg-[#C5A46D] text-white flex items-center justify-center transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp"
                className="w-9 h-9 rounded-full bg-[#244438] text-white flex items-center justify-center hover:bg-[#1A332A] transition-colors"
              >
                <WhatsAppIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigate Col 3 */}
          <div className="space-y-3">
            <h4 className="eyebrow-tag text-[11px] text-[#C5A46D]">Explore</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-[#B4ACA2] hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-[#B4ACA2] hover:text-white transition-colors">
                  Complete Catalogue
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-[#B4ACA2] hover:text-white transition-colors">
                  Our Story &amp; Craft
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-[#B4ACA2] hover:text-white transition-colors">
                  Visit Sector 76 Store
                </Link>
              </li>
              <li>
                <Link to="/shipping-and-delivery" className="text-[#B4ACA2] hover:text-white transition-colors">
                  Delivery Guidelines
                </Link>
              </li>
              <li>
                <Link to="/returns-policy" className="text-[#B4ACA2] hover:text-white transition-colors">
                  Returns &amp; Cancellations
                </Link>
              </li>
            </ul>
          </div>

          {/* Collections Col 4 */}
          <div className="space-y-3">
            <h4 className="eyebrow-tag text-[11px] text-[#C5A46D]">Collections</h4>
            <ul className="space-y-2.5 text-sm">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link to={`/category/${cat.slug}`} className="text-[#B4ACA2] hover:text-white transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/terms-and-conditions" className="text-xs text-[#81776C] hover:text-white transition-colors pt-1 block">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-xs text-[#81776C] hover:text-white transition-colors block">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Boutique Visit Col 5 */}
          <div className="space-y-3">
            <h4 className="eyebrow-tag text-[11px] text-[#C5A46D]">Visit Atelier</h4>
            <div className="space-y-3 text-xs text-[#B4ACA2]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C5A46D] shrink-0 mt-0.5" />
                <p className="leading-relaxed">{settings.address}</p>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#C5A46D] shrink-0" />
                <a href={`tel:${settings.phone}`} className="hover:text-white font-medium">
                  {settings.phone}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <WhatsAppIcon className="w-4 h-4 shrink-0 text-[#E8CECB]" />
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white text-[#E8CECB] font-medium"
                >
                  WhatsApp: {settings.whatsappNumber}
                </a>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#C5A46D] shrink-0 mt-0.5" />
                <span>{settings.openingHours}</span>
              </div>

              <div className="pt-1">
                <a
                  href={safeExternalUrl(settings.mapsUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#C5A46D] hover:underline font-medium"
                >
                  <span>Google Maps Directions</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {(settings.zomatoUrl || settings.swiggyUrl || settings.magicpinUrl) && (
                <div className="pt-3 border-t border-[#4A3B32] space-y-1.5">
                  <p className="eyebrow-tag text-[10px] text-[#C5A46D]">Delivery Partners</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
                    {settings.zomatoUrl && <a href={safeExternalUrl(settings.zomatoUrl)} target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline">Zomato</a>}
                    {settings.swiggyUrl && <a href={safeExternalUrl(settings.swiggyUrl)} target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline">Swiggy</a>}
                    {settings.magicpinUrl && <a href={safeExternalUrl(settings.magicpinUrl)} target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline">Magicpin</a>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Local Service Areas */}
        <div className="pt-6 border-t border-[#4A3B32] mb-6">
          <p className="text-[11px] text-[#81776C] leading-relaxed">
            <strong className="text-[#C5A46D]">Fresh Doorstep Delivery Across Noida:</strong> Sector 76, Sector 75, Sector 74, Sector 77, Sector 78, Sector 79, Sector 50, Sector 51, Amrapali Silicon City, Amrapali Crystal Homes, Mahagun Moderne, Supertech Capetown, Aditya Urban Casa, and Central Noida. 100% Pure Vegetarian Eggless Cakes • Midnight Delivery • Hand-Tied Morning Blooms.
          </p>
        </div>

        {/* Bottom Credits & Developer */}
        <div className="pt-6 border-t border-[#4A3B32] flex flex-col sm:flex-row items-center justify-between text-xs text-[#81776C] gap-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2">
            <p>© {currentYear} Cakes N More. All rights reserved. Sector 76, Noida, UP 201301.</p>
            <div className="flex items-center gap-3 text-[11px]">
              <Link to="/shipping-and-delivery" className="hover:text-white transition-colors">Shipping</Link>
              <span>•</span>
              <Link to="/returns-policy" className="hover:text-white transition-colors">Returns</Link>
              <span>•</span>
              <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link>
              <span>•</span>
              <Link to="/terms-and-conditions" className="hover:text-white transition-colors">Terms</Link>
            </div>
          </div>
          <a
            href="https://ybgp.in"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Looking to grow your business? Your business growth partner. Designed and developed by YBGP. Visit ybgp.in"
            className="flex items-center gap-3 rounded-md text-right text-[#B4ACA2] transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A46D] focus-visible:ring-offset-4 focus-visible:ring-offset-[#30251F]"
          >
            <span className="flex flex-col items-end gap-0.5">
              <span className="font-semibold text-white text-[11px]">Looking to grow your business?</span>
              <span className="text-[#81776C] text-[10px]">Designed and developed by YBGP</span>
            </span>
            <img src="/ybgp-logo.png" alt="YBGP - Your Business Growth Partner logo" width={72} height={36} className="h-8 w-auto rounded-xs bg-white px-1" />
          </a>
        </div>
      </div>
    </footer>
  );
};
