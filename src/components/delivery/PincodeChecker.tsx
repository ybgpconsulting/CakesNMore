import React, { useState } from 'react';
import { Navigation, Map, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

interface PincodeCheckerProps {
  onUseGps: () => void;
  onOpenMap: () => void;
  onCancel: () => void;
  allowedPincodes?: string[];
}

// Common Noida / Greater Noida delivery postal codes
const NOIDA_PINCODES = [
  '201301', // Sector 76, Central Noida
  '201304', // Expressway, Sector 128-137
  '201305', // Sector 50, 41, 49
  '201306', // Greater Noida West / Techzone
  '201307', // Sector 62, 63
  '201308', // Greater Noida / Bisrakh
  '201309', // Greater Noida
  '201310', // Greater Noida Surajpur
];

export const PincodeChecker: React.FC<PincodeCheckerProps> = ({
  onUseGps,
  onOpenMap,
  onCancel,
  allowedPincodes = NOIDA_PINCODES,
}) => {
  const [pincode, setPincode] = useState('');
  const [checkedState, setCheckedState] = useState<{
    checked: boolean;
    isNoidaArea: boolean;
    message: string;
  } | null>(null);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pincode.trim().replace(/[^0-9]/g, '');

    if (cleanPin.length !== 6) {
      setCheckedState({
        checked: true,
        isNoidaArea: false,
        message: 'Please enter a valid 6-digit Indian postal pincode.',
      });
      return;
    }

    const activeAllowedPincodes =
      allowedPincodes && allowedPincodes.length > 0 ? allowedPincodes : NOIDA_PINCODES;
    const isMatch = activeAllowedPincodes.includes(cleanPin);

    if (isMatch) {
      setCheckedState({
        checked: true,
        isNoidaArea: true,
        message: `Pincode ${cleanPin} is listed in our current service area.`,
      });
    } else {
      setCheckedState({
        checked: true,
        isNoidaArea: false,
        message: `Pincode ${cleanPin} is not included in our current service-area list.`,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-serif text-xl font-bold text-[#30251F]">Verify by Postal Pincode</h4>
        <p className="text-xs text-[#81776C]">
          Enter your 6-digit pincode to check serviceability from our Sector 76 boutique.
        </p>
      </div>

      <form onSubmit={handleCheck} className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="e.g. 201301"
            value={pincode}
            onChange={(e) => {
              setPincode(e.target.value);
              if (checkedState) setCheckedState(null);
            }}
            className="flex-1 px-4 py-3 bg-[#FFFFFF] border border-[#E8E2D5] rounded-2xl text-sm font-semibold text-[#30251F] placeholder:text-[#81776C]/60 focus:outline-none focus:border-[#30251F] focus:ring-1 focus:ring-[#30251F]"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-[#30251F] hover:bg-[#201814] text-[#FAF7F0] font-serif font-bold text-xs rounded-2xl shadow-xs transition-all cursor-pointer"
          >
            Verify
          </button>
        </div>
      </form>

      {/* Verification Notice */}
      {checkedState && (
        <div className="animate-in fade-in duration-200 space-y-3">
          {checkedState.isNoidaArea ? (
            <div className="bg-[#244438]/10 border border-[#244438]/25 rounded-2xl p-4 space-y-3">
              <div className="flex items-start gap-2.5 text-[#244438]">
                <CheckCircle2 className="w-5 h-5 text-[#244438] shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-serif font-bold text-base text-[#244438]">{checkedState.message}</p>
                  <p className="text-[#81776C] leading-relaxed">
                    <strong>Note:</strong> A pincode covers a wide area. Confirm exact eligibility with your current location or a pin on the map:
                  </p>
                </div>
              </div>

              {/* Exact Coordinate Confirmation Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={onUseGps}
                  className="w-full py-2.5 px-3 rounded-full bg-[#30251F] hover:bg-[#201814] text-[#FAF7F0] text-xs font-serif font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#C5A46D]" />
                  <span>Use Current Location</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenMap}
                  className="w-full py-2.5 px-3 bg-[#FFFFFF] border border-[#E8E2D5] hover:border-[#30251F] active:scale-95 text-[#30251F] rounded-full text-xs font-serif font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Map className="w-3.5 h-3.5 text-[#C5A46D]" />
                  <span>Choose Pin on Map</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#FFFFFF] border border-[#E8E2D5] rounded-2xl p-4 space-y-3">
              <div className="flex items-start gap-2.5 text-[#81776C]">
                <AlertCircle className="w-5 h-5 text-[#C5A46D] shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-serif font-bold text-base text-[#30251F]">{checkedState.message}</p>
                  <p className="text-[#81776C] leading-relaxed">
                    Delivery availability depends on your exact location and the current store settings. If you may be near the service-area boundary, check your coordinates on the map or contact the store.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenMap}
                className="w-full py-2.5 px-3 bg-[#FAF7F0] border border-[#E8E2D5] hover:border-[#30251F] text-[#30251F] rounded-full text-xs font-serif font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Map className="w-3.5 h-3.5 text-[#C5A46D]" />
                <span>Verify on Map Anyway</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Back to main choices */}
      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-[#81776C] hover:text-[#30251F] transition-colors cursor-pointer"
        >
          ← Return to options
        </button>
      </div>
    </div>
  );
};
