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
    <div className="space-y-6 text-[#30251F]">
      <SEO title="Homepage Content Management | Cakes N More Admin" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D5] shadow-sm">
        <div>
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#C5A46D]">Storefront Showcase</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#30251F] mt-1">
            Homepage Content Editor
          </h1>
          <p className="text-xs text-[#81776C] mt-1">
            Control the editorial hero banner, announcement strip, and authentic value highlights.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          className="btn-editorial-primary inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-xs font-bold tracking-wider shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Save className="w-4 h-4 text-[#C5A46D]" />
          <span>Save All Homepage Changes</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Homepage updates published live successfully!</span>
        </div>
      )}
      {saveError && <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">{saveError}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Top Promo Banner Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D5] shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C5A46D]" />
            <h2 className="font-serif text-lg font-normal text-[#30251F]">
              Top Announcement Banner
            </h2>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#FAF7F0] rounded-2xl border border-[#E8E2D5]">
            <div>
              <p className="text-xs font-bold text-[#30251F]">Enable Announcement Banner</p>
              <p className="text-[11px] text-[#81776C]">Shows a subtle top header notification across all pages</p>
            </div>
            <input
              type="checkbox"
              checked={formData.promoBannerActive}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, promoBannerActive: e.target.checked }))
              }
              className="w-5 h-5 text-[#30251F] rounded accent-[#30251F]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#30251F] uppercase tracking-wider mb-1.5">
              Banner Text Content
            </label>
            <input
              type="text"
              value={formData.promoBannerText}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, promoBannerText: e.target.value }))
              }
              className="w-full px-4 py-2.5 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl text-xs sm:text-sm text-[#30251F] focus:border-[#30251F] focus:bg-white focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D5] shadow-sm space-y-4">
          <h2 className="font-serif text-lg font-normal text-[#30251F]">Hero Section</h2>

          <div>
            <label className="block text-[11px] font-bold text-[#30251F] uppercase tracking-wider mb-1.5">
              Main Headline *
            </label>
            <input
              type="text"
              required
              value={formData.heroTitle}
              onChange={(e) => setFormData((prev) => ({ ...prev, heroTitle: e.target.value }))}
              className="w-full px-4 py-2.5 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl text-xs sm:text-sm text-[#30251F] font-bold focus:border-[#30251F] focus:bg-white focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#30251F] uppercase tracking-wider mb-1.5">
              Subtitle / Supporting Text
            </label>
            <textarea
              rows={2}
              value={formData.heroSubtitle}
              onChange={(e) => setFormData((prev) => ({ ...prev, heroSubtitle: e.target.value }))}
              className="w-full px-4 py-2.5 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl text-xs sm:text-sm text-[#30251F] focus:border-[#30251F] focus:bg-white focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#30251F] uppercase tracking-wider mb-1.5">
                CTA Button Text
              </label>
              <input
                type="text"
                value={formData.heroCtaText}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, heroCtaText: e.target.value }))
                }
                className="w-full px-4 py-2.5 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl text-xs sm:text-sm text-[#30251F] focus:border-[#30251F] focus:bg-white focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#30251F] uppercase tracking-wider mb-1.5">
                CTA Button Link
              </label>
              <input
                type="text"
                value={formData.heroCtaLink}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, heroCtaLink: e.target.value }))
                }
                className="w-full px-4 py-2.5 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl text-xs sm:text-sm text-[#30251F] focus:border-[#30251F] focus:bg-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold text-[#30251F] uppercase tracking-wider">
                Hero Image
              </label>
              <label className="cursor-pointer text-xs font-bold text-[#30251F] hover:text-[#C5A46D] flex items-center gap-1 transition-colors">
                {isUploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C5A46D]" />
                ) : (
                  <Upload className="w-3.5 h-3.5 text-[#C5A46D]" />
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
              className="w-full px-4 py-2.5 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl text-xs text-[#30251F] focus:border-[#30251F] focus:bg-white focus:outline-none transition-colors"
            />
            {formData.heroImage && (
              <div className="mt-3 aspect-[16/6] rounded-2xl overflow-hidden bg-[#FAF7F0] border border-[#E8E2D5]">
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
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D5] shadow-sm space-y-4">
          <h2 className="font-serif text-lg font-normal text-[#30251F]">Why Choose Us Points (5 Highlights)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.whyUsPoints.map((pt, idx) => (
              <div key={idx} className="p-4 bg-[#FAF7F0] rounded-2xl border border-[#E8E2D5] space-y-2">
                <p className="text-[11px] font-bold text-[#C5A46D] uppercase tracking-wider">Highlight #{idx + 1}</p>
                <input
                  type="text"
                  value={pt.title}
                  onChange={(e) => handlePointChange(idx, 'title', e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-[#E8E2D5] rounded-xl text-xs font-bold text-[#30251F] focus:border-[#30251F] focus:outline-none"
                  placeholder="Title"
                />
                <textarea
                  rows={2}
                  value={pt.description}
                  onChange={(e) => handlePointChange(idx, 'description', e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-[#E8E2D5] rounded-xl text-xs text-[#30251F] focus:border-[#30251F] focus:outline-none"
                  placeholder="Description"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="btn-editorial-primary px-8 py-3.5 rounded-full text-xs font-bold tracking-wider shadow-sm cursor-pointer"
          >
            Save All Homepage Changes
          </button>
        </div>
      </form>
    </div>
  );
};
