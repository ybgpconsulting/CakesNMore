import React from 'react';
import { MapPin, Check, AlertCircle } from 'lucide-react';
import { useDeliveryAvailability } from '../../context/DeliveryContext';
import { formatDistanceKm } from '../../utils/distance';

interface DeliveryLocationBadgeProps {
  className?: string;
  compact?: boolean;
}

export const DeliveryLocationBadge: React.FC<DeliveryLocationBadgeProps> = ({
  className = '',
  compact = false,
}) => {
  const { verifiedLocation, openDeliveryGate } = useDeliveryAvailability();

  if (!verifiedLocation) {
    return (
      <button
        type="button"
        onClick={openDeliveryGate}
        aria-label="Check delivery availability"
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#1E2230] text-[#FF6B4A] border border-[#2A2F3E] hover:border-[#FF6B4A]/50 active:scale-95 transition-all cursor-pointer ${className}`}
      >
        <MapPin className="w-3.5 h-3.5 text-[#FF6B4A] shrink-0" />
        <span>Check Delivery</span>
      </button>
    );
  }

  const isEligible = verifiedLocation.verified;
  const distText = formatDistanceKm(verifiedLocation.distanceKm);

  return (
    <button
      type="button"
      onClick={openDeliveryGate}
      title="Click to change your delivery location"
      aria-label={`Delivery location: ${distText}. Click to change.`}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer ${
        isEligible
          ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 hover:bg-[#10B981]/25'
          : 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 hover:bg-[#F59E0B]/25'
      } ${className}`}
    >
      <MapPin className={`w-3.5 h-3.5 shrink-0 ${isEligible ? 'text-[#10B981]' : 'text-[#F59E0B]'}`} />
      <span>{compact ? distText : `Delivery: ${distText}`}</span>
      {isEligible ? (
        <Check className="w-3 h-3 text-[#10B981]" />
      ) : (
        <AlertCircle className="w-3 h-3 text-[#F59E0B]" />
      )}
    </button>
  );
};
