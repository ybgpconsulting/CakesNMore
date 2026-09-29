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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#EADBDA] shadow-sm">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
            Store Categories
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage your store sections: Cakes, Flowers, Bouquets, Gifts, Plants, Hampers.
          </p>
        </div>

        <button
          onClick={() => openForm()}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#831843] hover:bg-[#6b1336] text-white font-bold text-sm shadow-md transition-all"
        >
          <Plus className="w-5 h-5" />
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
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          )}
          <span>{actionNotice.text}</span>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-3xl p-5 border border-[#EADBDA] shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100 mb-4">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                <span
                  className={`absolute top-3 right-3 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase shadow ${
                    cat.active ? 'bg-emerald-500 text-white' : 'bg-gray-500 text-white'
                  }`}
                >
                  {cat.active ? 'Active' : 'Hidden'}
                </span>
              </div>

              <h3 className="font-serif text-xl font-bold text-gray-900">{cat.name}</h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{cat.description}</p>
              <p className="text-[11px] text-[#831843] font-mono mt-2">slug: /{cat.slug}</p>
            </div>

            <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => openForm(cat)}
                className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-[#831843] text-gray-700 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => handleDelete(cat)}
                className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-rose-600 text-gray-700 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
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
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 id="category-modal-title" className="font-serif text-xl font-bold text-gray-900">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Cakes"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#831843] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Slug (URL path)
                </label>
                <input
                  type="text"
                  placeholder="cakes"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#831843] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#831843] focus:outline-none"
                />
              </div>

              {/* Category Image */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Banner Image URL
                  </label>
                  <label className="cursor-pointer text-xs font-bold text-[#831843] hover:underline flex items-center gap-1">
                    {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>Upload Image</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
                <input
                  type="url"
                  required
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#831843] focus:outline-none"
                />
                {image && (
                  <div className="mt-2 aspect-video rounded-xl overflow-hidden bg-gray-100 max-h-32 border">
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-xs font-bold text-gray-800">Category Active in Navigation</span>
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 text-[#831843] rounded"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#831843] hover:bg-[#6b1336] text-white text-xs font-bold shadow"
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
