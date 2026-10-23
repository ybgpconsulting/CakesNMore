import React from 'react';
import { Clock, ExternalLink, MapPin, Navigation, Phone, Store } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useDeliveryAvailability } from '../../context/DeliveryContext';
import { WhatsAppIcon } from '../common/WhatsAppIcon';
import { generateWhatsAppUrl, safeExternalUrl, WHATSAPP_ORDER_MESSAGE } from '../../utils/urls';

export const StoreLocationSection: React.FC = () => {
  const { settings } = useStore();
  const { openDeliveryGate, verifiedLocation } = useDeliveryAvailability();

  const cleanPhone = settings.phone.replace(/[^0-9+]/g, '') || '+919999517599';
  const whatsappUrl = generateWhatsAppUrl(settings.whatsappNumber, WHATSAPP_ORDER_MESSAGE);

  return (
    <section className="py-16 sm:py-24 bg-[#FAF7F0] border-t border-[#E8E2D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="editorial-card bg-white rounded-3xl p-6 sm:p-10 lg:p-14 border border-[#E8E2D5] shadow-xs">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Header Tag */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="eyebrow-tag text-[#C5A46D] block mb-2">Store Location</span>
                <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#30251F] tracking-tight">
                  Visit Cakes N More
                </h2>
                <p className="text-sm sm:text-base text-[#81776C] mt-1">
                  Amrapali Crystal Home Arcade • Sector 76, Central Noida
                </p>
              </div>

            </div>

            {/* Address & Landmark Showcase */}
            <div className="bg-[#FAF7F0] rounded-2xl p-6 border border-[#E8E2D5] space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E8E2D5] flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5 text-[#C5A46D]" />
                </div>
                <div>
                  <p className="eyebrow-tag text-[10px] text-[#81776C]">Address &amp; Landmark</p>
                  <p className="font-serif text-lg sm:text-xl text-[#30251F] font-bold leading-relaxed mt-1">
                    {settings.address}
                  </p>
                  <p className="text-xs text-[#30251F] bg-white border border-[#E8E2D5] rounded-lg px-3 py-1.5 mt-2.5 inline-block font-medium">
                    📍 Direct Landmark: Near Mithaas, Shopping Arcade, Amrapali Silicon City
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-[#E8E2D5] text-xs text-[#81776C]">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#C5A46D]" />
                  <span>Call: <strong className="text-[#30251F]">{settings.phone}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#C5A46D]" />
                  <span>{settings.openingHours}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3.5 pt-2">
              <a
                href={`tel:${cleanPhone}`}
                className="btn-editorial-secondary inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide"
              >
                <Phone className="w-4 h-4 text-[#81776C]" />
                <span>Call the Store</span>
              </a>

              <a
                href={safeExternalUrl(settings.mapsUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-editorial-primary editorial-shimmer inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide"
              >
                <Navigation className="w-4 h-4 text-[#C5A46D]" />
                <span>Google Maps Directions</span>
              </a>

              <button
                type="button"
                onClick={openDeliveryGate}
                className="btn-editorial-secondary inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide"
              >
                <MapPin className="w-4 h-4 text-[#C5A46D]" />
                <span>{verifiedLocation?.verified ? 'Sec 76 Delivery Verified ✓' : 'Verify My Delivery Address'}</span>
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-editorial-whatsapp inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide"
              >
                <WhatsAppIcon className="w-4 h-4 text-white" />
                <span>WhatsApp Concierge</span>
              </a>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
