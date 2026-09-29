import React, { useState } from 'react';
import { CheckCircle2, LayoutDashboard, Loader2, Save, Sparkles, Upload } from 'lucide-react';
import { SEO } from '../../components/common/SEO';
import { useStore } from '../../context/StoreContext';
import { uploadProductImage } from '../../services/mediaApi';
import { HomepageConfig } from '../../types';
import { safeCtaUrl, safeImageUrl } from '../../utils/urls';

export const AdminHomepagePage: React.FC = () => {
  const { homepageConfig, updateHomepage } = useStore();

  const [formData, setFormData] = useState<HomepageConfig>({ ...homepageConfig });
  const [isUploading, setIsUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  React.useEffect(() => {
    setFormData({ ...homepageConfig });
  }, [homepageConfig]);

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadProductImage(file, 'homepage');
      setFormData((prev) => ({ ...prev, heroImage: url }));
    } catch (err: any) {
      alert(err?.message || 'Hero image upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePointChange = (index: number, field: 'title' | 'description', value: string) => {
    const points = [...formData.whyUsPoints];
    points[index] = { ...points[index], [field]: value };
    setFormData((prev) => ({ ...prev, whyUsPoints: points }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    if (!safeImageUrl(formData.heroImage)) {
      setSaveError('Hero image must use a valid http or https URL.');
      return;
    }
    if (safeCtaUrl(formData.heroCtaLink) === '/shop' && formData.heroCtaLink.trim() !== '/shop') {
      setSaveError('CTA link must be an internal path or valid http/https URL.');
      return;
    }
    try {
      await updateHomepage(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setSaveError('Could not save homepage changes. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <SEO title="Homepage Content Management | Cakes N More Admin" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#EADBDA] shadow-sm">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
            Homepage Content Editor
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Control the hero banner, promo announcements, and store value highlights.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#831843] hover:bg-[#6b1336] text-white font-bold text-sm shadow-md transition-all active:scale-95"
        >
          <Save className="w-5 h-5" />
          <span>Save All Homepage Changes</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Homepage updates published live successfully!</span>
        </div>
      )}
      {saveError && <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">{saveError}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Top Promo Banner Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBDA] shadow-sm space-y-4">
          <h2 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#831843]" />
            <span>Top Announcement Banner</span>
          </h2>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200">
            <div>
              <p className="text-xs font-bold text-gray-900">Enable Announcement Banner</p>
              <p className="text-[11px] text-gray-500">Shows a top header banner across all pages</p>
            </div>
            <input
              type="checkbox"
              checked={formData.promoBannerActive}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, promoBannerActive: e.target.checked }))
              }
              className="w-5 h-5 text-[#831843] rounded"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Banner Text Content
            </label>
            <input
              type="text"
              value={formData.promoBannerText}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, promoBannerText: e.target.value }))
              }
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#831843] focus:outline-none"
            />
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBDA] shadow-sm space-y-4">
          <h2 className="font-serif text-lg font-bold text-gray-900">Hero Section</h2>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Main Headline *
            </label>
            <input
              type="text"
              required
              value={formData.heroTitle}
              onChange={(e) => setFormData((prev) => ({ ...prev, heroTitle: e.target.value }))}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#831843] focus:outline-none font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Subtitle / Supporting Text
            </label>
            <textarea
              rows={2}
              value={formData.heroSubtitle}
              onChange={(e) => setFormData((prev) => ({ ...prev, heroSubtitle: e.target.value }))}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#831843] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                CTA Button Text
              </label>
              <input
                type="text"
                value={formData.heroCtaText}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, heroCtaText: e.target.value }))
                }
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#831843] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                CTA Button Link
              </label>
              <input
                type="text"
                value={formData.heroCtaLink}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, heroCtaLink: e.target.value }))
                }
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#831843] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Hero Image
              </label>
              <label className="cursor-pointer text-xs font-bold text-[#831843] hover:underline flex items-center gap-1">
                {isUploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>Upload New Hero Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleHeroImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            <input
              type="url"
              value={formData.heroImage}
              onChange={(e) => setFormData((prev) => ({ ...prev, heroImage: e.target.value }))}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#831843] focus:outline-none"
            />
            {formData.heroImage && (
              <div className="mt-3 aspect-[16/6] rounded-2xl overflow-hidden bg-gray-100 border">
                <img
                  src={formData.heroImage}
                  alt="Hero Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* Why Choose Us Points */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBDA] shadow-sm space-y-4">
          <h2 className="font-serif text-lg font-bold text-gray-900">Why Choose Us Points (5 Highlights)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.whyUsPoints.map((pt, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                <p className="text-xs font-bold text-[#831843] uppercase">Highlight #{idx + 1}</p>
                <input
                  type="text"
                  value={pt.title}
                  onChange={(e) => handlePointChange(idx, 'title', e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold"
                  placeholder="Title"
                />
                <textarea
                  rows={2}
                  value={pt.description}
                  onChange={(e) => handlePointChange(idx, 'description', e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs"
                  placeholder="Description"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="px-8 py-3.5 rounded-2xl bg-[#831843] hover:bg-[#6b1336] text-white font-bold text-sm shadow-md"
          >
            Save All Homepage Changes
          </button>
        </div>
      </form>
    </div>
  );
};
