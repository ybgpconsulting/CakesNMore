import React, { useState } from 'react';
import {
  Navigation,
  Map,
  Mail,
  MapPin,
  Sparkles,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react';
import { useDeliveryAvailability } from '../../context/DeliveryContext';
import { DeliveryResult } from './DeliveryResult';
import { LocationPicker } from './LocationPicker';
import { PincodeChecker } from './PincodeChecker';

type ActiveView = 'gate' | 'map' | 'pincode' | 'result';

export const DeliveryAvailabilityGate: React.FC = () => {
  const {
    deliverySettings,
    verifiedLocation,
    deliveryGateOpen,
    closeDeliveryGate,
    verifyCoordinates,
    clearDeliveryVerification,
  } = useDeliveryAvailability();

  const [activeView, setActiveView] = useState<ActiveView>(() =>
    verifiedLocation ? 'result' : 'gate'
  );
  const [gpsLoading, setGpsLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // If gate is closed, render nothing
  if (!deliveryGateOpen) {
    return null;
  }

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser. Please choose your location on the map.');
      return;
    }

    setGpsLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsLoading(false);
        const { latitude, longitude } = position.coords;
        verifyCoordinates(latitude, longitude, 'gps', 'Current GPS Location');
        setActiveView('result');
      },
      (error) => {
        setGpsLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGeoError('Location permission was not granted. Please choose your location on the map or check your pincode.');
            break;
          case error.POSITION_UNAVAILABLE:
            setGeoError("We couldn't determine your location. Please choose your address on the map.");
            break;
          case error.TIMEOUT:
            setGeoError('Location detection took too long. Please try again or select your location on the map.');
            break;
          default:
            setGeoError('An error occurred while finding your location. Please choose your location on the map.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
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
      className="fixed inset-0 z-[100] bg-black/65 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#EADBDA] overflow-hidden max-h-[92dvh] pb-[max(0rem,env(safe-area-inset-bottom,0px))] flex flex-col">
        {/* Brand Banner Bar */}
        <div className="bg-gradient-to-r from-[#831843] via-[#9d174d] to-[#831843] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <span className="font-serif font-extrabold tracking-wider text-base">Cakes N More</span>
              <span className="text-[10px] text-pink-200 block -mt-1 uppercase tracking-widest">
                Sector 76 Noida
              </span>
            </div>
          </div>

          {/* Close button if user already verified previously */}
          {verifiedLocation && verifiedLocation.verified && (
            <button
              type="button"
              onClick={closeDeliveryGate}
              className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
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
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#831843] bg-[#FDF2F8] px-3 py-1 rounded-full inline-block">
                  Cakes • Flowers • Gifts
                </span>

                <h2
                  id="delivery-gate-heading"
                  className="font-serif text-3xl sm:text-4xl font-extrabold text-[#29141B] tracking-tight"
                >
                  Do We Deliver To You?
                </h2>

                <p className="text-sm sm:text-base text-gray-600 max-w-sm mx-auto leading-relaxed">
                  We deliver cakes, flowers, gifts &amp; more within{' '}
                  <strong className="text-gray-900 font-bold">{deliverySettings.radiusKm} km</strong> of our Sector 76, Noida store.
                </p>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FAF8F5] border border-[#EADBDA] text-xs font-semibold text-gray-700">
                  <MapPin className="w-3.5 h-3.5 text-[#831843]" />
                  <span>{deliverySettings.storeName || 'Cakes N More – Sector 76, Noida'}</span>
                </div>
              </div>

              {/* Geolocation error notice */}
              {geoError && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-left text-amber-900 flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold">{geoError}</p>
                    <p className="text-amber-800">
                      You can easily use option 2 to drop your pin on the map below.
                    </p>
                  </div>
                </div>
              )}

              {/* Three Options per Requirement */}
              <div className="space-y-3 pt-1">
                {/* OPTION 1: CURRENT LOCATION (PRIMARY) */}
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={gpsLoading}
                  className="w-full py-4 px-6 rounded-2xl bg-[#831843] hover:bg-[#6b1336] active:scale-95 text-white font-bold text-base shadow-lg shadow-[#831843]/20 flex items-center justify-center gap-2.5 transition-all disabled:opacity-75 cursor-pointer"
                >
                  {gpsLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Detecting your location...</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="w-5 h-5 fill-white" />
                      <span>Use My Current Location</span>
                    </>
                  )}
                </button>

                <div className="relative py-1 flex items-center justify-center">
                  <div className="border-t border-gray-200 w-full" />
                  <span className="bg-white px-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest absolute">
                    or
                  </span>
                </div>

                {/* OPTION 2: CHOOSE ON MAP */}
                <button
                  type="button"
                  onClick={() => setActiveView('map')}
                  className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-[#FAF8F5] border-2 border-[#831843] active:scale-95 text-[#831843] font-bold text-sm shadow-sm flex items-center justify-center gap-2.5 transition-all"
                >
                  <Map className="w-4 h-4" />
                  <span>Choose Location on Map</span>
                </button>

                {/* OPTION 3: ENTER PINCODE */}
                <button
                  type="button"
                  onClick={() => setActiveView('pincode')}
                  className="w-full py-3 px-6 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-200 active:scale-95 text-gray-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Mail className="w-3.5 h-3.5 text-gray-500" />
                  <span>Enter Postal Pincode (e.g. 201301)</span>
                </button>
              </div>

              {/* Privacy assurance */}
              <p className="text-[11px] text-gray-400 leading-snug">
                🔒 We only use your location to calculate delivery distance. Your coordinates are never shared or stored permanently without an order.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
