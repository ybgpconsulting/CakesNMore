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
    <div className="space-y-6 text-[#30251F]">
      <SEO title="Store Settings | Cakes N More Admin" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D5] shadow-sm">
        <div>
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#C5A46D]">Store Identity &amp; Channel Hub</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#30251F] mt-1">
            Store &amp; Contact Settings
          </h1>
          <p className="text-xs text-[#81776C] mt-1">
            Update phone numbers, WhatsApp order destination, store address, and SEO metadata.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          className="btn-editorial-primary inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-xs font-bold tracking-wider shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Save className="w-4 h-4 text-[#C5A46D]" />
          <span>Save Store Settings</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Store settings successfully updated!</span>
        </div>
      )}
      {saveError && <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold animate-in fade-in">{saveError}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Store Details & WhatsApp */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D5] shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#E8E2D5]">
            <Phone className="w-5 h-5 text-[#C5A46D]" />
            <h2 className="font-serif text-lg font-normal text-[#30251F]">
              Store Identity &amp; WhatsApp Order Destination
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#30251F] uppercase tracking-wider mb-1.5">
                Business Name *
              </label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => handleChange('businessName', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl text-xs sm:text-sm text-[#30251F] font-bold focus:border-[#30251F] focus:bg-white focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#30251F] uppercase tracking-wider mb-1.5">
                Store Phone Number *
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl text-xs sm:text-sm text-[#30251F] focus:border-[#30251F] focus:bg-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#30251F] uppercase tracking-wider mb-1.5">
                WhatsApp Order Number (with Country Code) *
              </label>
              <input
                type="text"
                required
                placeholder="919999517599"
                value={formData.whatsappNumber}
                onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-[#244438]/30 rounded-xl text-xs sm:text-sm font-bold text-[#244438] focus:border-[#244438] focus:bg-white focus:outline-none transition-colors"
              />
              <p className="text-[11px] text-[#81776C] mt-1">
                Customer clicks &ldquo;Order on WhatsApp&rdquo; will direct straight to this concierge number.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#30251F] uppercase tracking-wider mb-1.5">
                Store Contact Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl text-xs sm:text-sm text-[#30251F] focus:border-[#30251F] focus:bg-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#30251F] uppercase tracking-wider mb-1.5">
              Store Physical Address *
            </label>
            <textarea
              rows={2}
              required
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl text-xs sm:text-sm text-[#30251F] focus:border-[#30251F] focus:bg-white focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#30251F] uppercase tracking-wider mb-1.5">
                Opening Hours
              </label>
              <input
                type="text"
                value={formData.openingHours}
                onChange={(e) => handleChange('openingHours', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl text-xs sm:text-sm text-[#30251F] focus:border-[#30251F] focus:bg-white focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#30251F] uppercase tracking-wider mb-1.5">
                Google Maps Navigation URL
              </label>
              <input
                type="url"
                value={formData.mapsUrl}
                onChange={(e) => handleChange('mapsUrl', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl text-xs sm:text-sm text-[#30251F] focus:border-[#30251F] focus:bg-white focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D5] shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#E8E2D5]">
            <Share2 className="w-5 h-5 text-[#C5A46D]" />
            <h2 className="font-serif text-lg font-normal text-[#30251F]">
              Social Media Channels
            </h2>
          </div>
          <p className="text-xs text-[#81776C]">
            Social links appear in the website footer only when a valid URL is added here.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#30251F] uppercase tracking-wider mb-1">
                Instagram Profile Link
              </label>
              <input
                type="url"
                value={formData.instagramUrl || ''}
                onChange={(e) => handleChange('instagramUrl', e.target.value)}
                placeholder="https://instagram.com/cakesnmore_noida"
                className="w-full px-3.5 py-2 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl text-xs text-[#30251F] focus:outline-none focus:border-[#30251F]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#30251F] uppercase tracking-wider mb-1">
                Facebook Page Link
              </label>
              <input
                type="url"
                value={formData.facebookUrl || ''}
                onChange={(e) => handleChange('facebookUrl', e.target.value)}
                placeholder="https://facebook.com/cakesnmore.noida"
                className="w-full px-3.5 py-2 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl text-xs text-[#30251F] focus:outline-none focus:border-[#30251F]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#30251F] uppercase tracking-wider mb-1">
                Twitter / X Profile Link
              </label>
              <input
                type="url"
                value={formData.twitterUrl || ''}
                onChange={(e) => handleChange('twitterUrl', e.target.value)}
                placeholder="https://x.com/cakesnmore_noida"
                className="w-full px-3.5 py-2 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl text-xs text-[#30251F] focus:outline-none focus:border-[#30251F]"
              />
            </div>
          </div>
        </div>

        {/* Delivery Partner Links */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D5] shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#E8E2D5]">
            <Truck className="w-5 h-5 text-[#C5A46D]" />
            <h2 className="font-serif text-lg font-normal text-[#30251F]">
              Delivery Partner Links
            </h2>
          </div>
          <p className="text-xs text-[#81776C]">
            Add your verified restaurant or cloud storefront URLs. Empty fields stay hidden on the website.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {([
              ['zomatoUrl', 'Zomato URL', 'https://www.zomato.com/...'],
              ['swiggyUrl', 'Swiggy URL', 'https://www.swiggy.com/...'],
              ['magicpinUrl', 'Magicpin URL', 'https://magicpin.in/...'],
            ] as const).map(([field, label, placeholder]) => (
              <div key={field}>
                <label className="block text-[11px] font-bold text-[#30251F] uppercase tracking-wider mb-1">
                  {label}
                </label>
                <input
                  type="url"
                  value={formData[field] || ''}
                  onChange={(e) => handleChange(field, e.target.value)}
                  placeholder={placeholder}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl text-xs text-[#30251F] focus:border-[#30251F] focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* SEO & Meta Tags */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D5] shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#E8E2D5]">
            <Globe className="w-5 h-5 text-[#C5A46D]" />
            <h2 className="font-serif text-lg font-normal text-[#30251F]">
              Search Engine Optimization (SEO) &amp; Meta Tags
            </h2>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#30251F] uppercase tracking-wider mb-1.5">
              Website Meta Title (Browser Tab &amp; Google Search)
            </label>
            <input
              type="text"
              value={formData.websiteTitle}
              onChange={(e) => handleChange('websiteTitle', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl text-xs sm:text-sm text-[#30251F] focus:border-[#30251F] focus:bg-white focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#30251F] uppercase tracking-wider mb-1.5">
              Meta Description (Search Snippet)
            </label>
            <textarea
              rows={2}
              value={formData.metaDescription}
              onChange={(e) => handleChange('metaDescription', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl text-xs sm:text-sm text-[#30251F] focus:border-[#30251F] focus:bg-white focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#30251F] uppercase tracking-wider mb-1.5">
              Global Header Banner Announcement
            </label>
            <input
              type="text"
              value={formData.bannerAnnouncement}
              onChange={(e) => handleChange('bannerAnnouncement', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl text-xs sm:text-sm text-[#30251F] focus:border-[#30251F] focus:bg-white focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="btn-editorial-primary px-8 py-3.5 rounded-full text-xs font-bold tracking-wider shadow-sm cursor-pointer"
          >
            Save Store Settings
          </button>
        </div>
      </form>
    </div>
  );
};
