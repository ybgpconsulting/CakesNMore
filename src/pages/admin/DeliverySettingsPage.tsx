import React, { useState } from 'react';
import {
  Truck,
  Save,
  CheckCircle2,
  Navigation,
  Map,
  AlertCircle,
  ShieldCheck,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { SEO } from '../../components/common/SEO';
import { LocationPicker } from '../../components/delivery/LocationPicker';
import { useDeliveryAvailability } from '../../context/DeliveryContext';
import { DeliverySettings } from '../../types';

export const DeliverySettingsPage: React.FC = () => {
  const { deliverySettings, updateSettings } = useDeliveryAvailability();

  const [formData, setFormData] = useState<DeliverySettings>({ ...deliverySettings });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);

  // Sync state if initial settings loaded later
  React.useEffect(() => {
    setFormData({ ...deliverySettings });
  }, [deliverySettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);

    try {
      await updateSettings(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: any) {
      console.error('Failed to save delivery settings', err);
      setSaveError(err.message || 'Failed to update delivery settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        setFormData((prev) => ({
          ...prev,
          storeLatitude: Number(pos.coords.latitude.toFixed(6)),
          storeLongitude: Number(pos.coords.longitude.toFixed(6)),
        }));
      },
      (err) => {
        setGpsLoading(false);
        alert(`Could not fetch location: ${err.message}`);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleMapConfirm = (lat: number, lon: number) => {
    setFormData((prev) => ({
      ...prev,
      storeLatitude: Number(lat.toFixed(6)),
      storeLongitude: Number(lon.toFixed(6)),
    }));
    setShowMapModal(false);
  };

  return (
    <div className="space-y-6 text-[#30251F]">
      <SEO title="Delivery Settings | Cakes N More Admin" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D5] shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#FAF7F0] text-[#30251F] border border-[#E8E2D5] mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C5A46D]" />
            <span>Admin Control Panel</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#30251F]">
            Delivery Radius &amp; Store Location
          </h1>
          <p className="text-xs text-[#81776C] mt-1">
            Configure the delivery availability gate, store GPS coordinates, and service radius.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="btn-editorial-primary inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-xs font-bold tracking-wider shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#C5A46D]" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-[#C5A46D]" />
              <span>Save Delivery Settings</span>
            </>
          )}
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Delivery settings updated successfully and applied to the live storefront!</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Status & Radius */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D5] shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#E8E2D5]">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF7F0] text-[#30251F] border border-[#E8E2D5] flex items-center justify-center">
              <Truck className="w-5 h-5 text-[#C5A46D]" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-normal text-[#30251F]">Delivery Availability Status</h2>
              <p className="text-xs text-[#81776C]">Enable or disable delivery checks and set the service radius.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            {/* Delivery Enabled Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl border border-[#E8E2D5] bg-[#FAF7F0]">
              <div>
                <label className="text-xs font-bold text-[#30251F] block uppercase tracking-wider">Delivery System Status</label>
                <span className="text-xs text-[#81776C]">
                  {formData.enabled ? 'Delivery checking active' : 'Delivery temporarily suspended'}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={(e) => setFormData((prev) => ({ ...prev, enabled: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#30251F]"></div>
              </label>
            </div>

            {/* Delivery Radius */}
            <div>
              <label className="block text-[11px] font-bold text-[#30251F] uppercase tracking-wider mb-2">
                Delivery Radius (KM)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={50}
                  step={0.5}
                  value={formData.radiusKm}
                  onChange={(e) => setFormData((prev) => ({ ...prev, radiusKm: Number(e.target.value) || 10 }))}
                  className="w-full px-4 py-3 rounded-xl border border-[#E8E2D5] bg-[#FAF7F0] text-sm font-bold text-[#30251F] focus:outline-none focus:border-[#30251F] focus:bg-white transition-colors"
                  required
                />
                <span className="px-4 py-3 rounded-xl bg-[#FAF7F0] border border-[#E8E2D5] text-[#30251F] font-bold text-sm">
                  KM
                </span>
              </div>
              <p className="text-[11px] text-[#81776C] mt-1">
                Customers further than this distance from store coordinates will be classified as outside delivery area.
              </p>
            </div>
          </div>
        </div>

        {/* Store GPS Coordinates */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D5] shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D5] flex-wrap gap-3">
            <div>
              <h2 className="font-serif text-lg font-normal text-[#30251F]">Cakes N More Store GPS Coordinates</h2>
              <p className="text-xs text-[#81776C]">
                The configured radius is calculated from these store coordinates.
              </p>
            </div>

            {/* Action buttons to set location */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={gpsLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FAF7F0] border border-[#E8E2D5] text-xs font-bold text-[#30251F] hover:bg-[#E8E2D5] active:scale-95 transition-all cursor-pointer"
              >
                {gpsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5 text-[#C5A46D]" />}
                <span>Use Current Location</span>
              </button>

              <button
                type="button"
                onClick={() => setShowMapModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#30251F] text-white text-xs font-bold hover:bg-[#1E1714] active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                <Map className="w-3.5 h-3.5 text-[#C5A46D]" />
                <span>Choose on Map</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#30251F] uppercase tracking-wider mb-2">
                Store Name / Identifier
              </label>
              <input
                type="text"
                value={formData.storeName}
                onChange={(e) => setFormData((prev) => ({ ...prev, storeName: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-[#E8E2D5] bg-[#FAF7F0] text-sm text-[#30251F] focus:outline-none focus:border-[#30251F] focus:bg-white transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#30251F] uppercase tracking-wider mb-2">
                Store Latitude
              </label>
              <input
                type="number"
                step="any"
                value={formData.storeLatitude}
                onChange={(e) => setFormData((prev) => ({ ...prev, storeLatitude: Number(e.target.value) }))}
                className="w-full px-4 py-3 rounded-xl border border-[#E8E2D5] bg-[#FAF7F0] text-sm font-mono text-[#30251F] focus:outline-none focus:border-[#30251F] focus:bg-white transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#30251F] uppercase tracking-wider mb-2">
                Store Longitude
              </label>
              <input
                type="number"
                step="any"
                value={formData.storeLongitude}
                onChange={(e) => setFormData((prev) => ({ ...prev, storeLongitude: Number(e.target.value) }))}
                className="w-full px-4 py-3 rounded-xl border border-[#E8E2D5] bg-[#FAF7F0] text-sm font-mono text-[#30251F] focus:outline-none focus:border-[#30251F] focus:bg-white transition-colors"
                required
              />
            </div>
          </div>

          {/* Customer Facing Message */}
          <div>
            <label className="block text-[11px] font-bold text-[#30251F] uppercase tracking-wider mb-2">
              Customer-Facing Delivery Message
            </label>
            <textarea
              rows={2}
              value={formData.deliveryMessage}
              onChange={(e) => setFormData((prev) => ({ ...prev, deliveryMessage: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-[#E8E2D5] bg-[#FAF7F0] text-sm text-[#30251F] focus:outline-none focus:border-[#30251F] focus:bg-white transition-colors"
              required
            />
            <p className="text-[11px] text-[#81776C] mt-1">
              Displayed on the first-screen delivery availability modal to all visiting customers.
            </p>
          </div>
        </div>

        {/* Future / Advanced Delivery Parameters */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D5] shadow-sm space-y-4">
          <h2 className="font-serif text-lg font-normal text-[#30251F]">
            Optional Policy &amp; Pincode Filters
          </h2>
          <p className="text-xs text-[#81776C]">
            Prepared fields for future delivery fee rules and postal code screening.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-[11px] font-bold text-[#30251F] uppercase tracking-wider mb-1">
                Min Order Value (₹)
              </label>
              <input
                type="number"
                min={0}
                value={formData.minOrderValue || 0}
                onChange={(e) => setFormData((prev) => ({ ...prev, minOrderValue: Number(e.target.value) || 0 }))}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E2D5] bg-[#FAF7F0] text-sm font-mono text-[#30251F] focus:outline-none focus:border-[#30251F] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#30251F] uppercase tracking-wider mb-1">
                Standard Delivery Charge (₹)
              </label>
              <input
                type="number"
                min={0}
                value={formData.deliveryCharge || 0}
                onChange={(e) => setFormData((prev) => ({ ...prev, deliveryCharge: Number(e.target.value) || 0 }))}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E2D5] bg-[#FAF7F0] text-sm font-mono text-[#30251F] focus:outline-none focus:border-[#30251F] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#30251F] uppercase tracking-wider mb-1">
                Free Delivery Threshold (₹)
              </label>
              <input
                type="number"
                min={0}
                value={formData.freeDeliveryThreshold || 0}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, freeDeliveryThreshold: Number(e.target.value) || 0 }))
                }
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E2D5] bg-[#FAF7F0] text-sm font-mono text-[#30251F] focus:outline-none focus:border-[#30251F] focus:bg-white"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-[11px] font-bold text-[#30251F] uppercase tracking-wider mb-1">
              Allowed Pincodes (Comma separated)
            </label>
            <input
              type="text"
              value={formData.allowedPincodes?.join(', ') || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  allowedPincodes: e.target.value
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean),
                }))
              }
              placeholder="201301, 201304, 201305, 201306, 201307, 201308"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E8E2D5] bg-[#FAF7F0] text-sm font-mono text-[#30251F] focus:outline-none focus:border-[#30251F] focus:bg-white"
            />
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-editorial-primary px-8 py-4 rounded-full text-xs font-bold tracking-wider shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-[#C5A46D]" />
                <span>Saving Delivery Settings...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5 text-[#C5A46D]" />
                <span>Save All Changes</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Map Picker Modal for Admin to pick Store Location */}
      {showMapModal && (
        <div role="dialog" aria-modal="true" aria-labelledby="store-location-modal-title" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-[#E8E2D5]">
            <h2 id="store-location-modal-title" className="sr-only">Select Cakes N More Store Location</h2>
            <LocationPicker
              title="Select Cakes N More Store Location"
              storeLat={formData.storeLatitude}
              storeLon={formData.storeLongitude}
              radiusKm={formData.radiusKm}
              deliveryEnabled={formData.enabled}
              initialLat={formData.storeLatitude}
              initialLon={formData.storeLongitude}
              onConfirmLocation={handleMapConfirm}
              onCancel={() => setShowMapModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
