import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Edit2,
  FileSpreadsheet,
  Filter,
  Package,
  Plus,
  Search,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { SEO } from '../../components/common/SEO';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import { ProductFormModal } from './ProductFormModal';

export const AdminProductsPage: React.FC = () => {
  const { products, categories, upsertProduct, deleteProductById, toggleProductAvailability } =
    useStore();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const showSuccessNotice = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.categoryName?.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (selectedCategory !== 'all') {
        const catObj = categories.find((c) => c.slug === selectedCategory || c.id === selectedCategory);
        if (catObj && p.categoryId !== catObj.id) return false;
      }
      return true;
    });
  }, [products, categories, search, selectedCategory]);

  const handleSaveProduct = async (product: Product) => {
    await upsertProduct(product);
    showSuccessNotice(`Product "${product.name}" successfully saved.`);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProductId) return;
    const target = products.find((p) => p.id === deletingProductId);
    await deleteProductById(deletingProductId);
    setDeletingProductId(null);
    showSuccessNotice(`Product "${target?.name || ''}" was deleted.`);
  };

  const inStockCount = products.filter((p) => p.available).length;
  const outOfStockCount = products.length - inStockCount;

  return (
    <div className="space-y-6">
      <SEO title="Product Management | Cakes N More Admin" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D5] shadow-sm">
        <div>
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#C5A46D]">Inventory Atelier</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#30251F] mt-1">
            Product Catalogue Management
          </h1>
          <p className="text-xs text-[#81776C] mt-1">
            Update cakes, bouquets, plants, hampers, pricing tiers, and real-time stock availability.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/import-menu"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#FAF7F0] hover:bg-[#E8E2D5] border border-[#E8E2D5] text-[#30251F] font-bold text-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#244438]" />
            <span>Import Menu (CSV / JSON)</span>
          </Link>

          <button
            onClick={() => {
              setEditingProduct(null);
              setIsFormOpen(true);
            }}
            className="btn-editorial-primary inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs font-bold tracking-wider shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Action Success Toast */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E8E2D5] shadow-sm">
          <span className="text-[11px] font-bold text-[#81776C] uppercase tracking-wider">Total Products</span>
          <p className="font-serif text-3xl font-normal text-[#30251F] mt-1">{products.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#E8E2D5] shadow-sm">
          <span className="text-[11px] font-bold text-[#244438] uppercase tracking-wider">Available for Order</span>
          <p className="font-serif text-3xl font-normal text-[#244438] mt-1">{inStockCount}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#E8E2D5] shadow-sm">
          <span className="text-[11px] font-bold text-[#81776C] uppercase tracking-wider">Sold Out / Hidden</span>
          <p className="font-serif text-3xl font-normal text-[#81776C] mt-1">{outOfStockCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8E2D5] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <input
            type="text"
            placeholder="Search products by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl text-xs text-[#30251F] focus:border-[#30251F] focus:bg-white focus:outline-none transition-colors"
          />
          <Search className="w-4 h-4 text-[#81776C] absolute left-3.5 top-3" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-[#81776C] shrink-0 uppercase tracking-wider">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#30251F] focus:outline-none focus:border-[#30251F]"
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-[#E8E2D5] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F0] border-b border-[#E8E2D5] text-[#81776C] uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="py-4 px-5">Item</th>
                <th className="py-4 px-5">Category</th>
                <th className="py-4 px-5">Price</th>
                <th className="py-4 px-5">Badges</th>
                <th className="py-4 px-5 text-center">In Stock?</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2D5]/60 font-medium text-[#30251F]">
              {filteredProducts.map((p) => {
                const img =
                  p.images?.[0] ||
                  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=200&auto=format&fit=crop';

                return (
                  <tr key={p.id} className="hover:bg-[#FAF7F0]/50 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={img}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover border border-[#E8E2D5] shrink-0"
                        />
                        <div>
                          <p className="font-bold text-[#30251F] text-sm">{p.name}</p>
                          <p className="text-[10px] text-[#81776C]">ID: {p.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-5 text-[#81776C] font-semibold">{p.categoryName || 'General'}</td>

                    <td className="py-4 px-5">
                      {p.weightPrices && p.weightPrices.length > 0 ? (
                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-[10px] text-[#81776C] font-normal">From</span>
                            <span className="font-bold text-[#30251F]">
                              ₹{Math.min(...p.weightPrices.map((wp) => wp.price))}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#C5A46D] bg-[#FAF7F0] border border-[#E8E2D5] px-2 py-0.5 rounded-full font-bold inline-block mt-0.5">
                            {p.weightPrices.length} sizes
                          </span>
                        </div>
                      ) : (
                        <>
                          <span className="font-bold text-[#30251F]">₹{p.price}</span>
                          {p.oldPrice && (
                            <span className="text-[10px] text-[#81776C] line-through ml-1">
                              ₹{p.oldPrice}
                            </span>
                          )}
                        </>
                      )}
                    </td>

                    <td className="py-4 px-5">
                      <div className="flex flex-wrap gap-1">
                        {p.featured && (
                          <span className="bg-[#244438]/10 text-[#244438] border border-[#244438]/20 text-[9px] font-bold px-2 py-0.5 rounded-full">
                            FEATURED
                          </span>
                        )}
                        {p.bestseller && (
                          <span className="bg-[#C5A46D]/15 text-[#8A6D3B] border border-[#C5A46D]/30 text-[9px] font-bold px-2 py-0.5 rounded-full">
                            BESTSELLER
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Quick Status Toggle */}
                    <td className="py-4 px-5 text-center">
                      <button
                        type="button"
                        onClick={() => toggleProductAvailability(p.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                          p.available
                            ? 'bg-[#244438]/10 text-[#244438] border border-[#244438]/20 hover:bg-[#244438]/20'
                            : 'bg-gray-100 text-[#81776C] border border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {p.available ? 'In Stock' : 'Out of Stock'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProduct(p);
                            setIsFormOpen(true);
                          }}
                          className="p-2 bg-[#FAF7F0] hover:bg-[#30251F] text-[#30251F] hover:text-white rounded-xl border border-[#E8E2D5] transition-colors cursor-pointer"
                          title="Edit product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingProductId(p.id)}
                          className="p-2 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white rounded-xl border border-rose-200 transition-colors cursor-pointer"
                          title="Delete product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isFormOpen && (
        <ProductFormModal
          product={editingProduct}
          categories={categories}
          onSave={handleSaveProduct}
          onClose={() => {
            setIsFormOpen(false);
            setEditingProduct(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingProductId && (
        <div role="dialog" aria-modal="true" aria-labelledby="product-delete-modal-title" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-4 shadow-xl border border-[#E8E2D5] animate-in fade-in duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 id="product-delete-modal-title" className="font-serif text-xl font-normal text-[#30251F]">Delete Product?</h3>
              <p className="text-xs text-[#81776C]">
                Are you sure you want to remove this item from the store catalogue? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setDeletingProductId(null)}
                className="flex-1 py-2.5 rounded-full border border-[#E8E2D5] text-xs font-bold text-[#81776C] hover:bg-[#FAF7F0]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
