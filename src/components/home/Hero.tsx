import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useDeliveryAvailability } from '../../context/DeliveryContext';
import { generateWhatsAppUrl, safeCtaUrl, WHATSAPP_ORDER_MESSAGE } from '../../utils/urls';

export const Hero: React.FC = () => {
  const { homepageConfig, settings, products } = useStore();
  const { openDeliveryGate, deliverySettings, verifiedLocation } = useDeliveryAvailability();
  const heroProduct = products.find((product) => product.available && product.images?.[0]);
  const heroImage =
    homepageConfig.heroImage || heroProduct?.images[0] || '/social-share-1200x630.jpg';

  const whatsappUrl = generateWhatsAppUrl(settings.whatsappNumber, WHATSAPP_ORDER_MESSAGE);

  return (
    <section className="editorial-hero overflow-hidden border-b border-[#E8CECB]">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-12 lg:gap-12 lg:px-8 lg:py-16">
        <div className="order-1 lg:col-span-5">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E8CECB] bg-white/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#81776C]">
              <MapPin className="h-3.5 w-3.5 text-[#C5A46D]" />
              Sector 76, Noida
            </span>
            <button
              type="button"
              onClick={openDeliveryGate}
              className="inline-flex max-w-fit items-center whitespace-nowrap rounded-full border border-[#E8CECB] bg-white/70 px-1.5 py-1 text-[10px] font-semibold text-[#593A32] underline decoration-[#C5A46D] underline-offset-4 transition-colors hover:border-[#C5A46D] hover:text-[#C5A46D]"
            >
              {verifiedLocation?.verified
                ? 'Delivery location confirmed'
                : deliverySettings.enabled
                  ? 'Check delivery'
                  : 'Ask about delivery'}
            </button>
          </div>

          <h1 className="max-w-xl font-serif text-4xl font-semibold leading-[1.04] tracking-tight text-[#593A32] sm:text-5xl lg:text-6xl">
            {homepageConfig.heroTitle || 'Cakes, Flowers & Gifts for Every Celebration'}
          </h1>

          <p className="mt-5 max-w-lg text-sm leading-relaxed text-[#755D52] sm:text-base">
            {homepageConfig.heroSubtitle ||
              'Browse cakes, flowers and gifts in our Sector 76, Noida catalogue.'}
          </p>

          <div className="mt-7 flex w-full flex-wrap items-center gap-3">
            <Link
              to={safeCtaUrl(homepageConfig.heroCtaLink) || '/shop'}
              className="btn-editorial-primary editorial-shimmer group inline-flex h-12 w-fit max-w-full items-center gap-2 rounded-xl px-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C44D70] focus-visible:ring-offset-2"
            >
              <span className="min-w-0 truncate">
                <span className="block truncate text-sm font-semibold">
                  {homepageConfig.heroCtaText || 'Shop the collection'}
                </span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex h-12 w-fit max-w-full items-center gap-2 rounded-xl border border-[#128C49] bg-[#25D366] px-4 text-left text-[#123923] shadow-[0_4px_12px_rgba(37,211,102,0.2)] transition-all hover:-translate-y-0.5 hover:bg-[#20C45E] hover:shadow-[0_8px_16px_rgba(37,211,102,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#128C49] focus-visible:ring-offset-2"
            >
              <span className="min-w-0 truncate">
                <span className="block text-sm font-semibold">
                  Order on WhatsApp
                </span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>

        <div className="relative order-2 lg:col-span-7">
          <img
            src={heroImage}
            alt={heroProduct?.name || 'A selection from the Cakes N More catalogue'}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            width={1200}
            height={560}
            className="h-56 w-full rounded-[1.5rem] object-cover shadow-[0_18px_50px_rgba(130,79,65,0.16)] sm:h-80 sm:rounded-[2rem] lg:h-[30rem]"
          />
          <div className="pointer-events-none absolute inset-0 rounded-[1.5rem] border border-white/50 sm:rounded-[2rem]" />
        </div>
      </div>
    </section>
  );
};
