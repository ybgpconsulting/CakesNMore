import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Edit2,
  FolderTree,
  ImagePlus,
  Loader2,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { SEO } from '../../components/common/SEO';
import { useStore } from '../../context/StoreContext';
import { uploadProductImage } from '../../services/mediaApi';
import { Category } from '../../types';

export const AdminCategoriesPage: React.FC = () => {
  const { categories, upsertCategory, deleteCategoryById } = useStore();

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(1);
  const [isUploading, setIsUploading] = useState(false);

  const openForm = (cat?: Category) => {
    if (cat) {
      setEditingCategory(cat);
      setName(cat.name);
      setSlug(cat.slug);
      setImage(cat.image);
      setDescription(cat.description || '');
      setActive(cat.active);
      setDisplayOrder(cat.displayOrder || 1);
    } else {
      setEditingCategory(null);
      setName('');
      setSlug('');
      setImage('https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop');
      setDescription('');
      setActive(true);
      setDisplayOrder(categories.length + 1);
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadProductImage(file, 'categories');
      setImage(url);
    } catch (err: any) {
      setActionNotice({ type: 'error', text: err?.message || 'Image upload failed.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setActionNotice({ type: 'error', text: 'Category name is required.' });
      return;
    }

    const cleanSlug =
      slug.trim() ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    const newCat: Category = {
      id: editingCategory?.id || `cat_${Date.now()}`,
      name: name.trim(),
      slug: cleanSlug,
      image: image.trim(),
      description: description.trim(),
      active,
      displayOrder: Number(displayOrder),
    };

    try {
      await upsertCategory(newCat);
      setIsModalOpen(false);
      setActionNotice({ type: 'success', text: `Category "${newCat.name}" saved.` });
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err: any) {
      setActionNotice({ type: 'error', text: err?.message || 'Failed to save category.' });
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!window.confirm(`Are you sure you want to delete "${cat.name}"?`)) return;
    const res = await deleteCategoryById(cat.id);
    if (!res.success) {
      setActionNotice({ type: 'error', text: res.error || 'Failed to delete category.' });
    } else {
      setActionNotice({ type: 'success', text: `Category "${cat.name}" deleted.` });
    }
    setTimeout(() => setActionNotice(null), 3500);
  };

  return (
    <div className="space-y-6">
      <SEO title="Category Management | Cakes N More Admin" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D5] shadow-sm">
        <div>
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#C5A46D]">Catalogue Taxonomies</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#30251F] mt-1">
            Store Categories
          </h1>
          <p className="text-xs text-[#81776C] mt-1">
            Manage your store sections: Cakes, Flowers, Bouquets, Gifts, Plants, Hampers.
          </p>
        </div>

        <button
          onClick={() => openForm()}
          className="btn-editorial-primary inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-xs font-bold tracking-wider shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 text-[#C5A46D]" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Action Notification */}
      {actionNotice && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm ${
            actionNotice.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {actionNotice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{actionNotice.text}</span>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-3xl p-5 border border-[#E8E2D5] shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#FAF7F0] mb-4 border border-[#E8E2D5]">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                <span
                  className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase shadow-xs ${
                    cat.active
                      ? 'bg-[#244438] text-white'
                      : 'bg-[#81776C] text-white'
                  }`}
                >
                  {cat.active ? 'Active' : 'Hidden'}
                </span>
              </div>

              <h3 className="font-serif text-xl font-normal text-[#30251F]">{cat.name}</h3>
              <p className="text-xs text-[#81776C] mt-1 line-clamp-2">{cat.description}</p>
              <p className="text-[11px] text-[#30251F] font-mono mt-2 bg-[#FAF7F0] px-2.5 py-1 rounded-lg border border-[#E8E2D5] inline-block font-semibold">
                /{cat.slug}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-[#E8E2D5] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => openForm(cat)}
                className="px-3.5 py-1.5 rounded-xl bg-[#FAF7F0] hover:bg-[#30251F] text-[#30251F] hover:text-white border border-[#E8E2D5] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => handleDelete(cat)}
                className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Category Edit/Create Modal */}
      {isModalOpen && (
        <div role="dialog" aria-modal="true" aria-labelledby="category-modal-title" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#E8E2D5] space-y-5 text-[#30251F]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D5]">
              <div>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#C5A46D]">Category Editor</span>
                <h3 id="category-modal-title" className="font-serif text-xl font-normal text-[#30251F] mt-0.5">
                  {editingCategory ? 'Edit Category' : 'Create Category'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-[#81776C] hover:text-[#30251F]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#30251F] uppercase tracking-wider mb-1.5">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Cakes"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl text-xs sm:text-sm text-[#30251F] focus:border-[#30251F] focus:bg-white focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#30251F] uppercase tracking-wider mb-1.5">
                  Slug (URL path)
                </label>
                <input
                  type="text"
                  placeholder="cakes"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl text-xs sm:text-sm text-[#30251F] focus:border-[#30251F] focus:bg-white focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#30251F] uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl text-xs sm:text-sm text-[#30251F] focus:border-[#30251F] focus:bg-white focus:outline-none transition-colors"
                />
              </div>

              {/* Category Image */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold text-[#30251F] uppercase tracking-wider">
                    Banner Image URL
                  </label>
                  <label className="cursor-pointer text-xs font-bold text-[#30251F] hover:text-[#C5A46D] flex items-center gap-1 transition-colors">
                    {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C5A46D]" /> : <Upload className="w-3.5 h-3.5 text-[#C5A46D]" />}
                    <span>Upload Image</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
                <input
                  type="url"
                  required
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl text-xs text-[#30251F] focus:border-[#30251F] focus:bg-white focus:outline-none transition-colors"
                />
                {image && (
                  <div className="mt-2 aspect-video rounded-xl overflow-hidden bg-[#FAF7F0] max-h-32 border border-[#E8E2D5]">
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-3.5 bg-[#FAF7F0] rounded-xl border border-[#E8E2D5]">
                <span className="text-xs font-bold text-[#30251F]">Category Active in Navigation</span>
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 text-[#30251F] rounded accent-[#30251F]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#E8E2D5]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 rounded-full text-xs font-bold text-[#81776C] border border-[#E8E2D5] hover:bg-[#FAF7F0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-editorial-primary px-6 py-2 rounded-full text-xs font-bold tracking-wider shadow-sm"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
