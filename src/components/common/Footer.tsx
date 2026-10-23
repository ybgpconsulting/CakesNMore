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
import { generateWhatsAppUrl, safeExternalUrl, WHATSAPP_ORDER_MESSAGE } from '../../utils/urls';
import { WhatsAppIcon } from './WhatsAppIcon';

export const Footer: React.FC = () => {
  const { settings, categories } = useStore();
  const currentYear = new Date().getFullYear();

  const instagramUrl = safeExternalUrl(settings.instagramUrl);
  const facebookUrl = safeExternalUrl(settings.facebookUrl);
  const twitterUrl = safeExternalUrl(settings.twitterUrl);
  const zomatoUrl = safeExternalUrl(settings.zomatoUrl);
  const swiggyUrl = safeExternalUrl(settings.swiggyUrl);
  const whatsappUrl = generateWhatsAppUrl(settings.whatsappNumber, WHATSAPP_ORDER_MESSAGE);

  return (
    <footer className="border-t border-[#4A3B32] bg-[#30251F] pb-28 pt-14 text-[#FAF7F0] md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 grid grid-cols-1 items-start gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_0.9fr_1fr] lg:gap-12">
          
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-serif text-3xl font-semibold leading-tight tracking-tight text-white">
                Cakes N More
              </h3>
              <p className="eyebrow-tag text-[10px] leading-relaxed text-[#C5A46D]">
                Cakes, flowers &amp; thoughtful gifts · Sector 76, Noida
              </p>
            </div>

            <p className="max-w-sm pt-1 text-sm leading-relaxed text-[#B4ACA2]">
              Thoughtful cakes, fresh flowers, plants and gifts for the moments worth celebrating.
            </p>

            <div className="flex items-center gap-2.5 pt-2">
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Instagram"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#5A473C] text-white transition-colors hover:border-[#C5A46D] hover:bg-[#C5A46D]"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Facebook"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#5A473C] text-white transition-colors hover:border-[#C5A46D] hover:bg-[#C5A46D]"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {twitterUrl && (
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Twitter/X"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#5A473C] text-white transition-colors hover:border-[#C5A46D] hover:bg-[#C5A46D]"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
            </div>

            {(zomatoUrl || swiggyUrl) && (
              <div className="grid max-w-sm grid-cols-2 gap-3 pt-1">
                {zomatoUrl && (
                  <a
                    href={zomatoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Order from Cakes N More on Zomato"
                    className="group flex min-h-16 items-center gap-3 rounded-xl border border-[#5A473C] bg-[#3A2E27] px-3 py-2.5 transition-all hover:-translate-y-0.5 hover:border-[#E23744]/70 hover:bg-[#43332D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E23744] focus-visible:ring-offset-2 focus-visible:ring-offset-[#30251F]"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white">
                      <img
                        src="https://cdn.simpleicons.org/zomato/E23744"
                        alt=""
                        width={24}
                        height={24}
                        loading="lazy"
                        className="h-6 w-6"
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[10px] text-[#B4ACA2]">Order on</span>
                      <span className="block text-sm font-semibold text-white">Zomato</span>
                    </span>
                    <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0 text-[#E23744] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                )}
                {swiggyUrl && (
                  <a
                    href={swiggyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Order from Cakes N More on Swiggy"
                    className="group flex min-h-16 items-center gap-3 rounded-xl border border-[#5A473C] bg-[#3A2E27] px-3 py-2.5 transition-all hover:-translate-y-0.5 hover:border-[#FC8019]/70 hover:bg-[#43332D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FC8019] focus-visible:ring-offset-2 focus-visible:ring-offset-[#30251F]"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white">
                      <img
                        src="https://cdn.simpleicons.org/swiggy/FC8019"
                        alt=""
                        width={24}
                        height={24}
                        loading="lazy"
                        className="h-6 w-6"
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[10px] text-[#B4ACA2]">Order on</span>
                      <span className="block text-sm font-semibold text-white">Swiggy</span>
                    </span>
                    <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0 text-[#FC8019] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h4 className="eyebrow-tag text-[11px] text-[#C5A46D]">Collections</h4>
            <ul className="space-y-3 text-sm">
              {categories
                .filter((category) => category.active)
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((cat) => (
                <li key={cat.id}>
                  <Link to={`/category/${cat.slug}`} className="text-[#B4ACA2] transition-colors hover:text-white">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="eyebrow-tag text-[11px] text-[#C5A46D]">Visit Atelier</h4>
            <div className="space-y-4 text-xs text-[#B4ACA2]">
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#C5A46D]" />
                <p className="leading-relaxed">{settings.address}</p>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-[#C5A46D]" />
                <a href={`tel:${settings.phone}`} className="hover:text-white font-medium">
                  {settings.phone}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <WhatsAppIcon className="h-4 w-4 shrink-0 text-[#E8CECB]" />
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
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#C5A46D]" />
                <span>{settings.openingHours}</span>
              </div>

              <div className="border-t border-[#4A3B32] pt-3">
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

            </div>
          </div>
        </div>

        <div className="relative flex flex-col items-center gap-4 border-t border-[#4A3B32] pt-6 text-xs text-[#81776C] sm:flex-row">
          <p>© {currentYear} Cakes N More. All rights reserved.</p>
          <nav aria-label="Legal information" className="flex w-full items-center justify-center gap-3 text-[11px] sm:absolute sm:left-1/2 sm:w-auto sm:-translate-x-1/2">
            <Link to="/shipping-and-delivery" className="hover:text-white transition-colors">Shipping</Link>
            <span aria-hidden="true">•</span>
            <Link to="/returns-policy" className="hover:text-white transition-colors">Returns</Link>
            <span aria-hidden="true">•</span>
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link>
            <span aria-hidden="true">•</span>
            <Link to="/terms-and-conditions" className="hover:text-white transition-colors">Terms</Link>
          </nav>
          <a
            href="https://ybgp.in"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Looking to grow your business? Your business growth partner. Designed and developed by YBGP. Visit ybgp.in"
            className="flex items-center gap-3 rounded-md text-right text-[#B4ACA2] transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A46D] focus-visible:ring-offset-4 focus-visible:ring-offset-[#30251F] sm:ml-auto"
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
