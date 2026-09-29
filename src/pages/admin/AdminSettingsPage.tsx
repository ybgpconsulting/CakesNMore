import React, { useState } from 'react';
import { CheckCircle2, Globe, MapPin, Phone, Save, Settings, Share2, Sparkles, Truck } from 'lucide-react';
import { SEO } from '../../components/common/SEO';
import { useStore } from '../../context/StoreContext';
import { StoreSettings } from '../../types';
import { safeExternalUrl } from '../../utils/urls';

export const AdminSettingsPage: React.FC = () => {
  const { settings, updateSettings } = useStore();

  const [formData, setFormData] = useState<StoreSettings>({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  React.useEffect(() => {
    setFormData({ ...settings });
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    if (!/^[0-9+()\-\s]{10,30}$/.test(formData.phone.trim())) {
      setSaveError('Please enter a valid store phone number.');
      return;
    }
    if (!/^\d{10,15}$/.test(formData.whatsappNumber.replace(/\D/g, ''))) {
      setSaveError('Please enter a valid WhatsApp number with country code.');
      return;
    }
    if (!safeExternalUrl(formData.mapsUrl)) {
      setSaveError('Please enter a valid Google Maps URL.');
      return;
    }
    if ([formData.instagramUrl, formData.facebookUrl, formData.twitterUrl, formData.zomatoUrl, formData.swiggyUrl, formData.magicpinUrl].some((url) => url && !safeExternalUrl(url))) {
      setSaveError('All external links must use http or https URLs.');
      return;
    }
    try {
      await updateSettings(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setSaveError('Could not save store settings. Please try again.');
    }
  };

  const handleChange = (field: keyof StoreSettings, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <SEO title="Store Settings | Cakes N More Admin" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#EADBDA] shadow-sm">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
            Store &amp; Contact Settings
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Update phone numbers, WhatsApp order destination, store address, and SEO metadata.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#831843] hover:bg-[#6b1336] text-white font-bold text-sm shadow-md transition-all active:scale-95"
        >
          <Save className="w-5 h-5" />
          <span>Save Store Settings</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Store settings successfully updated!</span>
        </div>
      )}
      {saveError && <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">{saveError}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Store Details & WhatsApp */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBDA] shadow-sm space-y-4">
          <h2 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
            <Phone className="w-5 h-5 text-[#831843]" />
            <span>Store Identity &amp; WhatsApp Order Destination</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Business Name *
              </label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => handleChange('businessName', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#831843] focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Store Phone Number *
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#831843] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                WhatsApp Order Number (with Country Code) *
              </label>
              <input
                type="text"
                required
                placeholder="919999517599"
                value={formData.whatsappNumber}
                onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-emerald-50/60 border border-emerald-200 rounded-xl text-sm font-bold text-emerald-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Customer clicks &ldquo;Order on WhatsApp&rdquo; will direct to this number.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Store Contact Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#831843] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Store Physical Address *
            </label>
            <textarea
              rows={2}
              required
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#831843] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Opening Hours
              </label>
              <input
                type="text"
                value={formData.openingHours}
                onChange={(e) => handleChange('openingHours', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#831843] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Google Maps Navigation URL
              </label>
              <input
                type="url"
                value={formData.mapsUrl}
                onChange={(e) => handleChange('mapsUrl', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#831843] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBDA] shadow-sm space-y-4">
          <h2 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#831843]" />
            <span>Social Media Presence</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Instagram Profile Link
              </label>
              <input
                type="url"
                value={formData.instagramUrl || ''}
                onChange={(e) => handleChange('instagramUrl', e.target.value)}
                placeholder="https://instagram.com/cakesnmore_noida"
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Facebook Page Link
              </label>
              <input
                type="url"
                value={formData.facebookUrl || ''}
                onChange={(e) => handleChange('facebookUrl', e.target.value)}
                placeholder="https://facebook.com/cakesnmore.noida"
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Twitter / X Profile Link
              </label>
              <input
                type="url"
                value={formData.twitterUrl || ''}
                onChange={(e) => handleChange('twitterUrl', e.target.value)}
                placeholder="https://x.com/cakesnmore_noida"
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
              />
            </div>
          </div>
        </div>

        {/* Delivery Partner Links */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBDA] shadow-sm space-y-4">
          <h2 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#831843]" />
            <span>Delivery Partner Links</span>
          </h2>
          <p className="text-xs text-gray-500">
            Add your live restaurant or store URLs. Empty fields stay hidden on the website.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {([
              ['zomatoUrl', 'Zomato URL', 'https://www.zomato.com/...'],
              ['swiggyUrl', 'Swiggy URL', 'https://www.swiggy.com/...'],
              ['magicpinUrl', 'Magicpin URL', 'https://magicpin.in/...'],
            ] as const).map(([field, label, placeholder]) => (
              <div key={field}>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  {label}
                </label>
                <input
                  type="url"
                  value={formData[field] || ''}
                  onChange={(e) => handleChange(field, e.target.value)}
                  placeholder={placeholder}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#831843] focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* SEO & Meta Tags */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBDA] shadow-sm space-y-4">
          <h2 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#831843]" />
            <span>Search Engine Optimization (SEO) &amp; Meta Tags</span>
          </h2>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Website Meta Title (Browser Tab &amp; Google Search)
            </label>
            <input
              type="text"
              value={formData.websiteTitle}
              onChange={(e) => handleChange('websiteTitle', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#831843] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Meta Description (Search Snippet)
            </label>
            <textarea
              rows={2}
              value={formData.metaDescription}
              onChange={(e) => handleChange('metaDescription', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#831843] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Global Header Banner Announcement
            </label>
            <input
              type="text"
              value={formData.bannerAnnouncement}
              onChange={(e) => handleChange('bannerAnnouncement', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#831843] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="px-8 py-3.5 rounded-2xl bg-[#831843] hover:bg-[#6b1336] text-white font-bold text-sm shadow-md"
          >
            Save Store Settings
          </button>
        </div>
      </form>
    </div>
  );
};
