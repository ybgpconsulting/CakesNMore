import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Sparkles, Star } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { safeCtaUrl } from '../../utils/urls';
import { WhatsAppIcon } from '../common/WhatsAppIcon';

export const Hero: React.FC = () => {
  const { homepageConfig, settings } = useStore();

  const cleanWhatsAppNumber = settings.whatsappNumber.replace(/[^0-9]/g, '') || '919999517599';
  const whatsappUrl = `https://wa.me/${cleanWhatsAppNumber}?text=${encodeURIComponent(
    'Hi Cakes N More! I would like to place an order for fresh cakes/flowers in Sector 76, Noida.'
  )}`;

  return (
    <section className="premium-hero relative overflow-hidden py-8 sm:py-14 lg:py-20 border-b border-[#F0E6E1]">
      {/* Subtle organic background aura */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-[#FCE7F3]/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-[#FEF3C7]/30 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          {/* Left Text Column */}
          <div className="premium-reveal lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left">
            {/* Sector 76 Local Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FCE7F3] text-[#831843] text-[11px] sm:text-xs font-bold tracking-wide uppercase shadow-sm">
              <Sparkles className="w-3.5 h-3.5 fill-[#831843]" />
              <span>Florist &amp; Bakery • Sector 76, Noida • 100% Pure Veg</span>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#29141B] tracking-tight leading-[1.15]">
              {homepageConfig.heroTitle || 'Cakes, Flowers & Gifts for Every Celebration'}
            </h1>

            {/* Supporting Text */}
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              {homepageConfig.heroSubtitle ||
                'Make every occasion special with freshly prepared cakes, beautiful flowers and thoughtful gifts.'}
            </p>

            {/* Action Buttons: Primary CTA & Secondary WhatsApp CTA */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
              <Link
                to={safeCtaUrl(homepageConfig.heroCtaLink)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-[#831843] hover:bg-[#6b1336] text-white font-bold text-sm sm:text-base shadow-lg shadow-[#831843]/20 active:scale-95 transition-all"
              >
                <span>{homepageConfig.heroCtaText || 'Shop Now'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 sm:py-4 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm sm:text-base shadow-md active:scale-95 transition-all"
              >
                <WhatsAppIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Order on WhatsApp</span>
              </a>
            </div>

            {/* Highlights Bar */}
            <div className="pt-4 sm:pt-6 grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-lg mx-auto lg:mx-0 text-left border-t border-[#EADBDA]/80">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#831843] shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-gray-800">Fresh Daily</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#831843] shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-gray-800">Fast Delivery</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#831843] shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-gray-800">Local Pickup</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700 shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-gray-800">100% Pure Veg</span>
              </div>
            </div>
          </div>

          {/* Right Visual Column (Hero Image with Organic Badge & Customer Rating) */}
          <div className="premium-reveal lg:col-span-5 relative mt-4 lg:mt-0">
            <div className="relative mx-auto max-w-sm sm:max-w-md lg:max-w-none">
              {/* Decorative Frame with Optimized Aspect Ratio */}
              <div className="premium-image-frame relative rounded-3xl overflow-hidden border-4 border-white aspect-[4/3] sm:aspect-[4/5] bg-gray-100 shadow-xl">
                <img
                  src={
                    homepageConfig.heroImage ||
                    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=900&auto=format&fit=crop'
                  }
                  alt="Fresh Cakes and Flower Bouquets in Sector 76 Noida"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  width={800}
                  height={600}
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-xs uppercase tracking-wider text-[#FCE7F3] font-bold">Amrapali Crystal Home</p>
                  <p className="font-serif text-lg font-bold">Sector 76, Noida Central</p>
                </div>
              </div>

              {/* Floating Rating Card */}
              <div className="absolute -bottom-5 -left-2 sm:-left-6 bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-2.5 sm:gap-3 z-10">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#FEF3C7] text-[#B45309] flex items-center justify-center font-bold text-base sm:text-lg">
                  ★
                </div>
                <div>
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs font-bold text-gray-900 mt-0.5">Top-Rated Local Store</p>
                  <p className="text-[10px] text-gray-500">500+ celebrations in Sector 76</p>
                </div>
              </div>

              {/* Floating Express Delivery Pill - Smooth subtle pulse instead of jarring bounce */}
              <div className="absolute -top-3 -right-2 sm:-right-3 bg-[#831843] text-white px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl shadow-lg text-[11px] sm:text-xs font-bold flex items-center gap-1.5 z-10">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>⚡ 60-Min Express Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
