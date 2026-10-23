import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  Map,
  Mail,
  X,
  AlertCircle,
  Loader2,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useDeliveryAvailability } from '../../context/DeliveryContext';
import { PincodeChecker } from './PincodeChecker';
import { LocationPicker } from './LocationPicker';
import { DeliveryResult } from './DeliveryResult';

type GateView = 'gate' | 'map' | 'pincode' | 'result';

export const DeliveryAvailabilityGate: React.FC = () => {
  const {
    deliveryGateOpen,
    closeDeliveryGate,
    verifiedLocation,
    deliverySettings,
    verifyCoordinates,
    clearDeliveryVerification,
  } = useDeliveryAvailability();

  const [activeView, setActiveView] = useState<GateView>(() =>
    verifiedLocation && verifiedLocation.verified ? 'result' : 'gate'
  );
  const [gpsLoading, setGpsLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  if (!deliveryGateOpen) return null;

  const handleUseCurrentLocation = () => {
    setGpsLoading(true);
    setGeoError(null);

    if (!('geolocation' in navigator)) {
      setGeoError('Geolocation is not supported by your browser. Please select your location on the map.');
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        verifyCoordinates(latitude, longitude, 'gps', 'Current Device Location');
        setGpsLoading(false);
        setActiveView('result');
      },
      (error) => {
        setGpsLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGeoError('Location permission denied. Please allow location access or choose your location on the map.');
            break;
          case error.POSITION_UNAVAILABLE:
            setGeoError('Location information is unavailable. Please choose your location on the map.');
            break;
          case error.TIMEOUT:
            setGeoError('Location request timed out. Please try again or choose your location on the map.');
            break;
          default:
            setGeoError('Unable to detect location. Please select your address on the map.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60000,
      }
    );
  };

  const handleMapConfirm = (lat: number, lon: number) => {
    verifyCoordinates(lat, lon, 'map', 'Selected Location Pin');
    setActiveView('result');
  };

  const handleCheckAnotherLocation = () => {
    clearDeliveryVerification();
    setGeoError(null);
    setActiveView('gate');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delivery-gate-heading"
      className="fixed inset-0 z-[100] bg-[#30251F]/65 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="bg-[#FAF7F0] text-[#30251F] w-full max-w-lg rounded-t-[32px] sm:rounded-3xl shadow-2xl border border-[#E8E2D5] overflow-hidden max-h-[92dvh] pb-[max(0rem,env(safe-area-inset-bottom,0px))] flex flex-col">
        {/* Mobile Drag Handle */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1">
          <span className="w-10 h-1 rounded-full bg-[#D8D2C5]" />
        </div>

        {/* Brand Banner Bar */}
        <div className="bg-[#FFFFFF] text-[#30251F] px-5 sm:px-6 py-3.5 flex items-center justify-between border-b border-[#E8E2D5]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#C5A46D]/15 flex items-center justify-center border border-[#C5A46D]/30">
              <Sparkles className="w-4 h-4 text-[#C5A46D]" />
            </div>
            <div>
              <span className="font-serif font-bold tracking-wider text-base text-[#30251F]">Cakes N More</span>
              <span className="text-[10px] text-[#C5A46D] block -mt-0.5 uppercase tracking-widest font-sans font-semibold">
                Sector 76 Noida
              </span>
            </div>
          </div>

          {/* Close button if user already verified previously */}
          {verifiedLocation && verifiedLocation.verified && (
            <button
              type="button"
              onClick={closeDeliveryGate}
              className="p-1.5 rounded-full text-[#81776C] hover:text-[#30251F] hover:bg-[#FAF7F0] transition-colors"
              aria-label="Close delivery gate"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content Container */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6">
          {/* VIEW: RESULT */}
          {activeView === 'result' && verifiedLocation && (
            <DeliveryResult
              verifiedLocation={verifiedLocation}
              settings={deliverySettings}
              onContinueShopping={closeDeliveryGate}
              onCheckAnotherLocation={handleCheckAnotherLocation}
            />
          )}

          {/* VIEW: MAP PICKER */}
          {activeView === 'map' && (
            <LocationPicker
              storeLat={deliverySettings.storeLatitude}
              storeLon={deliverySettings.storeLongitude}
              radiusKm={deliverySettings.radiusKm}
              deliveryEnabled={deliverySettings.enabled}
              initialLat={verifiedLocation?.latitude}
              initialLon={verifiedLocation?.longitude}
              onConfirmLocation={handleMapConfirm}
              onCancel={() => setActiveView('gate')}
            />
          )}

          {/* VIEW: PINCODE CHECKER */}
          {activeView === 'pincode' && (
            <PincodeChecker
              allowedPincodes={deliverySettings.allowedPincodes}
              onUseGps={handleUseCurrentLocation}
              onOpenMap={() => setActiveView('map')}
              onCancel={() => setActiveView('gate')}
            />
          )}

          {/* VIEW: DEFAULT GATE SELECTION */}
          {activeView === 'gate' && (
            <div className="text-center space-y-6">
              {/* Floral & Store Header */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A46D] bg-[#C5A46D]/10 border border-[#C5A46D]/20 px-3.5 py-1 rounded-full inline-block">
                  Artisanal Cakes • Flowers • Gifts
                </span>

                <h2
                  id="delivery-gate-heading"
                  className="font-serif text-3xl sm:text-4xl font-bold text-[#30251F] tracking-tight"
                >
                  Verify Delivery Availability
                </h2>

                <p className="text-sm sm:text-base text-[#81776C] max-w-sm mx-auto leading-relaxed">
                  We prepare our gourmet cakes and fresh blooms daily within{' '}
                  <strong className="text-[#30251F] font-bold">{deliverySettings.radiusKm} km</strong> of our Sector 76, Noida store.
                </p>

                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFFFFF] border border-[#E8E2D5] text-xs font-semibold text-[#30251F]">
                  <MapPin className="w-3.5 h-3.5 text-[#C5A46D]" />
                  <span>{deliverySettings.storeName || 'Cakes N More – Sector 76, Noida'}</span>
                </div>
              </div>

              {/* Geolocation error notice */}
              {geoError && (
                <div className="bg-[#FFF8E6] border border-[#C5A46D]/40 rounded-2xl p-3.5 text-xs text-left text-[#856404] flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-[#C5A46D] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold">{geoError}</p>
                    <p className="text-[#81776C]">
                      You can easily use option 2 to drop your pin on the map below.
                    </p>
                  </div>
                </div>
              )}

              {/* Three Options */}
              <div className="space-y-3 pt-1">
                {/* OPTION 1: CURRENT LOCATION (PRIMARY) */}
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={gpsLoading}
                  className="w-full py-4 px-6 rounded-full bg-[#30251F] hover:bg-[#201814] text-[#FAF7F0] font-serif text-sm sm:text-base font-bold tracking-wide shadow-md flex items-center justify-center gap-2.5 transition-all disabled:opacity-75 cursor-pointer"
                >
                  {gpsLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-[#C5A46D]" />
                      <span>Detecting your location...</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4 fill-current text-[#C5A46D]" />
                      <span>Use My Current Location</span>
                    </>
                  )}
                </button>

                <div className="relative py-1 flex items-center justify-center">
                  <div className="border-t border-[#E8E2D5] w-full" />
                  <span className="bg-[#FAF7F0] px-3 text-[10px] font-bold text-[#81776C] uppercase tracking-[0.2em] absolute">
                    or
                  </span>
                </div>

                {/* OPTION 2: CHOOSE ON MAP */}
                <button
                  type="button"
                  onClick={() => setActiveView('map')}
                  className="w-full py-3.5 px-6 rounded-full bg-[#FFFFFF] hover:bg-[#F3EFE6] border border-[#E8E2D5] hover:border-[#30251F] active:scale-98 text-[#30251F] font-serif text-sm font-bold tracking-wide shadow-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer"
                >
                  <Map className="w-4 h-4 text-[#C5A46D]" />
                  <span>Choose Location on Map</span>
                </button>

                {/* OPTION 3: ENTER PINCODE */}
                <button
                  type="button"
                  onClick={() => setActiveView('pincode')}
                  className="w-full py-3 px-6 rounded-full bg-[#FFFFFF] hover:bg-[#F3EFE6] border border-[#E8E2D5] active:scale-98 text-[#81776C] hover:text-[#30251F] font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-[#C5A46D]" />
                  <span>Enter Postal Pincode (e.g. 201301)</span>
                </button>
              </div>

              {/* Privacy assurance */}
              <p className="text-[11px] text-[#81776C] leading-snug">
                🔒 We only use your location to calculate delivery distance. Your coordinates are never shared or stored permanently without an order.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
