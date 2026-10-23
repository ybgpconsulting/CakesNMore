import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Clock, Heart, MapPin } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useDeliveryAvailability } from '../../context/DeliveryContext';
import { safeCtaUrl } from '../../utils/urls';
import { WhatsAppIcon } from '../common/WhatsAppIcon';

export const Hero: React.FC = () => {
  const { homepageConfig, settings } = useStore();
  const { openDeliveryGate, verifiedLocation } = useDeliveryAvailability();

  const cleanWhatsAppNumber = settings.whatsappNumber.replace(/[^0-9]/g, '') || '919999517599';
  const whatsappUrl = `https://wa.me/${cleanWhatsAppNumber}?text=${encodeURIComponent(
    'Hi Cakes N More! I would like to place an order for fresh cakes/flowers in Sector 76, Noida.'
  )}`;

  return (
    <section className="editorial-hero relative overflow-hidden border-b border-[#E8CECB] px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:pb-24 lg:pt-20">
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">
        <div className="mb-7 flex flex-wrap items-center justify-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E8CECB] bg-white/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#81776C] shadow-sm sm:text-[11px]">
            <MapPin className="h-3.5 w-3.5 text-[#C5A46D]" />
            Sector 76, Noida Atelier
          </span>
          <button
            type="button"
            onClick={openDeliveryGate}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#C5A46D]/60 bg-white/70 px-3 py-1.5 text-[10px] font-medium tracking-wide text-[#30251F] shadow-sm transition-colors hover:bg-white sm:text-[11px]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#244438]" />
            {verifiedLocation?.verified ? 'Delivering to Sec 76 ✓' : 'Check Delivery Radius'}
          </button>
        </div>

        <h1 className="max-w-4xl font-serif text-5xl font-semibold leading-[1.03] tracking-tight text-[#593A32] sm:text-6xl lg:text-7xl">
          {homepageConfig.heroTitle || (
            <>
              Sweet moments,
              <br />
              <span className="font-normal italic text-[#F0447E]">made special</span>
            </>
          )}
        </h1>

        <div className="my-6 flex w-full max-w-md items-center gap-3 text-[#C5A46D] sm:my-7">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#C5A46D]/70 to-[#C5A46D]/70" />
          <Heart className="h-5 w-5 fill-white stroke-[1.5]" />
          <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[#C5A46D]/70 to-[#C5A46D]/70" />
        </div>

        <p className="max-w-2xl text-base leading-relaxed text-[#8C6B5D] sm:text-lg">
          {homepageConfig.heroSubtitle ||
            "Freshly baked cakes, beautiful flowers and thoughtful gifts made to make your day extra special. Handcrafted with 100% pure vegetarian recipes in Sector 76, Noida."}
        </p>

        <div className="mt-8 flex w-full max-w-xl flex-col gap-3 sm:mt-10 sm:flex-row sm:justify-center sm:gap-4">
          <Link
            to={safeCtaUrl(homepageConfig.heroCtaLink) || '/shop'}
            className="btn-editorial-secondary editorial-shimmer inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full px-7 py-4 text-sm font-semibold tracking-wide text-[#F0447E] sm:w-auto sm:min-w-64 sm:text-base"
          >
            <span>{homepageConfig.heroCtaText || 'Explore treats'}</span>
            <ArrowRight className="h-4 w-4 text-[#C5A46D]" />
          </Link>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-editorial-primary inline-flex min-h-14 w-full items-center justify-center gap-2.5 rounded-full px-7 py-4 text-sm font-semibold tracking-wide sm:w-auto sm:min-w-64 sm:text-base"
          >
            <WhatsAppIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Plan a party</span>
          </a>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-[#C5A46D]/30 pt-5 text-xs font-medium text-[#755D52] sm:mt-10 sm:gap-x-8">
          <span className="inline-flex items-center gap-2">
            <Check className="h-4 w-4 text-[#C5A46D]" />
            100% Pure Veg
          </span>
          <span className="inline-flex items-center gap-2">
            <Check className="h-4 w-4 text-[#C5A46D]" />
            Baked to Order
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#C5A46D]" />
            Same-Day Noida
          </span>
        </div>

        <div className="mt-12 w-full max-w-4xl overflow-hidden rounded-[2rem] border border-[#C5A46D]/60 bg-white p-2 shadow-[0_18px_50px_rgba(130,79,65,0.12)] sm:mt-16 sm:rounded-[2.5rem]">
          <img
            src={
              homepageConfig.heroImage ||
              'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1200&auto=format&fit=crop'
            }
            alt="Handcrafted celebration cakes and fresh flowers from Cakes N More"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            width={1200}
            height={560}
            className="h-56 w-full rounded-[1.5rem] object-cover sm:h-80 sm:rounded-[2rem] lg:h-[26rem]"
          />
        </div>
      </div>
    </section>
  );
};
