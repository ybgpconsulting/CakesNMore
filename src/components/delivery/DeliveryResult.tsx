import React from 'react';
import { CheckCircle2, XCircle, MapPin, ArrowRight, RotateCcw } from 'lucide-react';
import { WhatsAppIcon } from '../common/WhatsAppIcon';
import { formatDistanceKm } from '../../utils/distance';
import { generateWhatsAppUrl, WHATSAPP_ORDER_MESSAGE } from '../../utils/urls';
import { useStore } from '../../context/StoreContext';
import { DeliverySettings, VerifiedLocation } from '../../types';

interface DeliveryResultProps {
  verifiedLocation: VerifiedLocation;
  settings: DeliverySettings;
  onContinueShopping: () => void;
  onCheckAnotherLocation: () => void;
}

export const DeliveryResult: React.FC<DeliveryResultProps> = ({
  verifiedLocation,
  settings,
  onContinueShopping,
  onCheckAnotherLocation,
}) => {
  const { settings: storeSettings } = useStore();
  const isAvailable = verifiedLocation.verified;
  const formattedDist = formatDistanceKm(verifiedLocation.distanceKm);

  const whatsappInquiryUrl = generateWhatsAppUrl(
    storeSettings.whatsappNumber,
    WHATSAPP_ORDER_MESSAGE
  );

  if (isAvailable) {
    return (
      <div className="text-center py-2 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Success Icon Badge */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-[#244438]/10 text-[#244438] border border-[#244438]/25 flex items-center justify-center shadow-md">
          <CheckCircle2 className="w-9 h-9 sm:w-11 sm:h-11" />
        </div>

        {/* Heading & Text */}
        <div className="space-y-2">
          <span className="inline-block px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] bg-[#244438]/10 text-[#244438] border border-[#244438]/25">
            ✓ Delivery Radius Verified
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#30251F]">
            Delighted to Serve Your Address
          </h3>
          <p className="text-sm sm:text-base text-[#81776C] max-w-md mx-auto">
            Your location is approximately{' '}
            <strong className="text-[#30251F] font-semibold">{formattedDist}</strong> from our boutique store:
          </p>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFFFFF] border border-[#E8E2D5] text-xs font-semibold text-[#30251F]">
            <MapPin className="w-3.5 h-3.5 text-[#C5A46D] shrink-0" />
            <span>{settings.storeName || 'Cakes N More – Sector 76, Noida'}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 space-y-3">
          <button
            type="button"
            onClick={onContinueShopping}
            className="w-full py-4 px-6 rounded-full bg-[#30251F] hover:bg-[#201814] text-[#FAF7F0] font-serif text-sm sm:text-base font-bold tracking-wide shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Explore Creations</span>
            <ArrowRight className="w-4 h-4 text-[#C5A46D]" />
          </button>

          <button
            type="button"
            onClick={onCheckAnotherLocation}
            className="text-xs text-[#81776C] hover:text-[#30251F] flex items-center justify-center gap-1.5 mx-auto py-1 font-medium transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Check a different address</span>
          </button>
        </div>
      </div>
    );
  }

  // Outside delivery area state
  return (
    <div className="text-center py-2 space-y-6 animate-in fade-in zoom-in-95 duration-200">
      {/* Unavailable Icon Badge */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-[#FFFFFF] text-[#30251F] border border-[#E8E2D5] flex items-center justify-center shadow-md">
        <XCircle className="w-9 h-9 sm:w-11 sm:h-11 text-[#81776C]" />
      </div>

      {/* Heading & Details */}
      <div className="space-y-2">
        <span className="inline-block px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] bg-[#E8CECB] text-[#30251F]">
          Outside Standard Delivery Radius
        </span>
        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#30251F]">
          Outside the Configured Delivery Area
        </h3>
        <p className="text-sm sm:text-base text-[#81776C] max-w-md mx-auto">
          Your location is approximately{' '}
          <strong className="text-[#30251F] font-bold">{formattedDist}</strong> from our boutique.
        </p>
        <p className="text-xs text-[#81776C] max-w-sm mx-auto leading-relaxed">
          Your location is outside the current configured delivery radius of{' '}
          <strong className="font-semibold text-[#30251F]">{settings.radiusKm} km</strong>.
          Contact the store to ask about available alternatives.
        </p>
      </div>

      {/* Actions */}
      <div className="pt-2 space-y-3">
        <button
          type="button"
          onClick={onCheckAnotherLocation}
          className="w-full py-3.5 px-6 rounded-full bg-[#30251F] hover:bg-[#201814] text-[#FAF7F0] font-serif text-sm font-bold tracking-wide shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Check Another Address</span>
        </button>

        <a
          href={whatsappInquiryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 px-6 rounded-full bg-[#244438] hover:bg-[#1a3229] text-white font-serif text-sm font-bold tracking-wide shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <WhatsAppIcon className="w-4 h-4 text-white" />
          <span>Special Inquiry on WhatsApp</span>
        </a>
      </div>
    </div>
  );
};
