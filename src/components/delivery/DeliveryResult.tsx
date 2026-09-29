import React from 'react';
import { CheckCircle2, XCircle, MapPin, ArrowRight, RotateCcw } from 'lucide-react';
import { WhatsAppIcon } from '../common/WhatsAppIcon';
import { formatDistanceKm } from '../../utils/distance';
import { generateWhatsAppUrl } from '../../utils/urls';
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
    `Hi Cakes N More Sector 76 Noida, I am checking delivery for my location (approx ${formattedDist} away). Can you deliver cakes/flowers to my area?`
  );

  if (isAvailable) {
    return (
      <div className="text-center py-2 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Success Icon Badge */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-emerald-50 text-emerald-600 border-2 border-emerald-200 flex items-center justify-center shadow-sm">
          <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
        </div>

        {/* Heading & Text */}
        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
            ✓ Delivery Available
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#29141B]">
            Great news! We deliver to your location.
          </h3>
          <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto">
            Your location is approximately{' '}
            <strong className="text-gray-900 font-bold">{formattedDist}</strong> from our store:
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#EADBDA] text-xs font-semibold text-[#831843]">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>{settings.storeName || 'Cakes N More – Sector 76, Noida'}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 space-y-3">
          <button
            type="button"
            onClick={onContinueShopping}
            className="w-full py-4 px-6 rounded-2xl bg-[#831843] hover:bg-[#6b1336] active:scale-95 text-white font-bold text-base shadow-lg shadow-[#831843]/20 flex items-center justify-center gap-2 transition-all"
          >
            <span>Start Shopping</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onCheckAnotherLocation}
            className="text-xs text-gray-500 hover:text-gray-800 flex items-center justify-center gap-1 mx-auto py-1"
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
      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-amber-50 text-amber-600 border-2 border-amber-200 flex items-center justify-center shadow-sm">
        <XCircle className="w-10 h-10 sm:w-12 sm:h-12" />
      </div>

      {/* Heading & Details */}
      <div className="space-y-2">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
          Outside Standard Delivery Area
        </span>
        <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#29141B]">
          Sorry, We Don't Deliver Here Yet
        </h3>
        <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto">
          Your location is approximately{' '}
          <strong className="text-amber-700 font-bold">{formattedDist}</strong> from our store.
        </p>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          Our standard fresh cake and flower delivery radius is{' '}
          <strong className="text-gray-700 font-semibold">within {settings.radiusKm} km of Sector 76, Noida</strong> to preserve peak oven freshness and flower vitality.
        </p>
      </div>

      {/* Actions */}
      <div className="pt-2 space-y-3">
        <button
          type="button"
          onClick={onCheckAnotherLocation}
          className="w-full py-3.5 px-6 rounded-2xl bg-[#831843] hover:bg-[#6b1336] active:scale-95 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Check Another Location</span>
        </button>

        <a
          href={whatsappInquiryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] active:scale-95 text-white font-bold text-sm shadow flex items-center justify-center gap-2 transition-all"
        >
          <WhatsAppIcon className="w-4 h-4" />
          <span>Special Inquiry on WhatsApp</span>
        </a>
      </div>
    </div>
  );
};
