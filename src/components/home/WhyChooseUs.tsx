import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Cake, Check, Gift, Heart, MapPin, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { WhatsAppIcon } from '../common/WhatsAppIcon';
import { useStore } from '../../context/StoreContext';

const ICON_MAP: Record<string, React.ReactNode> = {
  Cake: <Cake className="w-5 h-5 text-[#30251F]" />,
  Gift: <Gift className="w-5 h-5 text-[#30251F]" />,
  MapPin: <MapPin className="w-5 h-5 text-[#30251F]" />,
  MessageCircle: <WhatsAppIcon className="w-5 h-5 text-[#244438]" />,
  Truck: <Truck className="w-5 h-5 text-[#30251F]" />,
};

export const WhyChooseUs: React.FC = () => {
  const { homepageConfig, products, settings } = useStore();
  const points = homepageConfig.whyUsPoints || [];
  const editorialProduct = products.find(
    (product) => product.available && product.images.some(Boolean)
  );
  const editorialImage =
    editorialProduct?.images.find(Boolean) || '/social-share-1200x630.jpg';
  const shortAddress = settings.address.split(',').slice(0, 2).join(', ');

  return (
    <section className="py-16 sm:py-24 bg-[#FAF7F0] border-b border-[#E8E2D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24">
        
        {/* Part 1: Brand Story — Rich Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Visual Atelier Showcase */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden border border-[#E8E2D5] aspect-[4/3] sm:aspect-[16/11] bg-white shadow-md">
              <img
                src={editorialImage}
                alt={editorialProduct?.name || 'A selection from the Cakes N More catalogue'}
                loading="lazy"
                decoding="async"
                width={700}
                height={500}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Small accent floating stat pill */}
            <div className="absolute -bottom-4 right-4 sm:right-8 bg-white p-4 rounded-2xl border border-[#E8E2D5] shadow-lg flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FAF7F0] border border-[#C5A46D] flex items-center justify-center">
                <Heart className="w-5 h-5 text-[#C5A46D] fill-[#C5A46D]/20" />
              </div>
              <div>
                <p className="font-serif font-bold text-sm text-[#30251F]">Cakes N More</p>
                <p className="line-clamp-2 text-xs text-[#81776C]">{shortAddress}</p>
              </div>
            </div>
          </div>

          {/* Narrative Content */}
          <div className="lg:col-span-6 space-y-5 text-left">
            <span className="eyebrow-tag text-[#C5A46D]">About the Store</span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#30251F] tracking-tight leading-[1.15]">
              Cakes N More in Sector 76
            </h2>
            <p className="text-sm sm:text-base text-[#81776C] leading-relaxed">
              Cakes N More is a neighborhood bakery and florist in Sector 76, Noida. Browse the current catalogue for cakes, flowers and gifts, with product details and available options listed on each item.
            </p>
            <p className="text-sm sm:text-base text-[#81776C] leading-relaxed">
              For ingredient, customization or availability questions, contact the store before ordering. Delivery eligibility can be checked against the current store settings.
            </p>

            <div className="pt-2">
              <Link
                to="/about"
                className="btn-editorial-secondary inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-semibold"
              >
                <span>About Cakes N More</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#C5A46D]" />
              </Link>
            </div>
          </div>

        </div>

        {/* Part 2: Why Cakes N More — Genuine Selling Points */}
        <div className="pt-8 sm:pt-12 border-t border-[#E8E2D5]">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="eyebrow-tag text-[#C5A46D] block mb-2">Explore the Catalogue</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#30251F] tracking-tight">
              Browse the Current Selection
            </h2>
            <p className="text-sm sm:text-base text-[#81776C] mt-2 font-normal">
              Explore the current catalogue and contact the store with any questions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
            {points.map((pt, idx) => (
              <div
                key={idx}
                className="editorial-card bg-white rounded-2xl p-6 border border-[#E8E2D5] flex flex-col items-start"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-[#E8E2D5] flex items-center justify-center mb-4 text-[#30251F]">
                  {ICON_MAP[pt.icon] || <ShieldCheck className="w-5 h-5 text-[#30251F]" />}
                </div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#30251F] mb-1.5 leading-snug">
                  {pt.title}
                </h3>
                <p className="text-xs text-[#81776C] leading-relaxed font-normal">
                  {pt.description}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
