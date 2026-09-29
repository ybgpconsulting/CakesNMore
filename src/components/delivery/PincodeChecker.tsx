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
        message: `Pincode ${cleanPin} is located in our general Noida / Gautam Buddha Nagar service zone!`,
      });
    } else {
      setCheckedState({
        checked: true,
        isNoidaArea: false,
        message: `Pincode ${cleanPin} is outside our Sector 76 Noida primary delivery territory.`,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-serif text-lg font-bold text-gray-900">Check by Postal Pincode</h4>
        <p className="text-xs text-gray-500">
          Enter your 6-digit pincode to check general serviceability in Noida.
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
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#831843] focus:border-[#831843]"
          />
          <button
            type="submit"
            className="px-5 py-3 bg-[#831843] hover:bg-[#6b1336] active:scale-95 text-white font-bold text-xs rounded-xl shadow transition-all"
          >
            Check
          </button>
        </div>
      </form>

      {/* Verification Notice per requirement */}
      {checkedState && (
        <div className="animate-in fade-in duration-200 space-y-3">
          {checkedState.isNoidaArea ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-start gap-2.5 text-emerald-900">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-sm text-emerald-800">{checkedState.message}</p>
                  <p className="text-gray-600 leading-relaxed">
                    <strong>Important:</strong> A pincode covers a wide geographical area and does not guarantee an exact 10 km radius. To confirm your exact delivery eligibility, please use your Current Location or choose your address on the map:
                  </p>
                </div>
              </div>

              {/* Exact Coordinate Confirmation Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={onUseGps}
                  className="w-full py-2.5 px-3 bg-[#831843] hover:bg-[#6b1336] active:scale-95 text-white rounded-xl text-xs font-bold shadow flex items-center justify-center gap-1.5 transition-all"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Use Current Location</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenMap}
                  className="w-full py-2.5 px-3 bg-white border border-[#831843] hover:bg-[#FDF2F8] active:scale-95 text-[#831843] rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all"
                >
                  <Map className="w-4 h-4" />
                  <span>Choose Pin on Map</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-start gap-2.5 text-amber-900">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-sm text-amber-800">{checkedState.message}</p>
                  <p className="text-gray-600 leading-relaxed">
                    Our fresh cake and flower delivery operates within a 10 km radius of Sector 76, Noida. If you are near our store border, you can still verify your exact coordinates on the map.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenMap}
                className="w-full py-2.5 px-3 bg-white border border-amber-700 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <Map className="w-4 h-4" />
                <span>Verify on Map Anyway</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Back to main choices */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="w-full py-2.5 text-xs font-bold text-gray-500 hover:text-gray-800"
        >
          ← Back to Location Options
        </button>
      </div>
    </div>
  );
};
