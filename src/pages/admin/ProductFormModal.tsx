import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  ImagePlus,
  Loader2,
  Plus,
  Star,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { deleteProductImage, mediaKeyFromUrl, uploadProductImage } from '../../services/mediaApi';
import { Category, Product, WeightPriceOption } from '../../types';

interface ProductFormModalProps {
  product?: Product | null;
  categories: Category[];
  onSave: (product: Product) => Promise<void>;
  onClose: () => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  categories,
  onSave,
  onClose,
}) => {
  const isEdit = !!product;

  const [name, setName] = useState(product?.name || '');
  const [categoryId, setCategoryId] = useState(product?.categoryId || categories[0]?.id || 'cakes');
  const [price, setPrice] = useState<number>(product?.price || 599);
  const [oldPrice, setOldPrice] = useState<number | undefined>(product?.oldPrice);
  const [description, setDescription] = useState(product?.description || '');
  const [images, setImages] = useState<string[]>(
    product?.images && product.images.length > 0
      ? [...product.images]
      : ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop']
  );
  const [available, setAvailable] = useState(product ? product.available : true);
  const [featured, setFeatured] = useState(product?.featured || false);
  const [bestseller, setBestseller] = useState(product?.bestseller || false);
  const [displayOrder, setDisplayOrder] = useState<number>(product?.displayOrder || 1);

  // Variations & Options
  const [hasWeightPricing, setHasWeightPricing] = useState<boolean>(() => {
    return Boolean(product?.weightPrices && product.weightPrices.length > 0);
  });

  const [weightPrices, setWeightPrices] = useState<WeightPriceOption[]>(() => {
    if (product?.weightPrices && product.weightPrices.length > 0) {
      return product.weightPrices.map((wp) => ({ ...wp }));
    }
    if (product?.weightOptions && product.weightOptions.length > 0) {
      return product.weightOptions.map((w) => ({
        weight: w,
        price: product.price || 599,
        oldPrice: product.oldPrice,
      }));
    }
    return [
      { weight: '500g', price: product?.price || 599 },
      { weight: '1kg', price: (product?.price || 599) * 2 - 100 },
    ];
  });

  const [weightOptionsStr, setWeightOptionsStr] = useState(
    product?.weightOptions?.join(', ') || '500g, 1kg, 1.5kg'
  );
  const [allowCustomMessage, setAllowCustomMessage] = useState(
    product?.allowCustomMessage ?? true
  );
  const [customMessagePlaceholder, setCustomMessagePlaceholder] = useState(
    product?.customMessagePlaceholder || 'Name or greeting on cake/card'
  );

  // Image Upload State
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setFormError(null);

    try {
      const uploadPromises = Array.from(files).map((file) => uploadProductImage(file, 'products'));
      const uploadedUrls = await Promise.all(uploadPromises);
      setImages((prev) => [...prev, ...uploadedUrls]);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to upload image.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleAddUrl = () => {
    if (imageUrlInput.trim()) {
      setImages((prev) => [...prev, imageUrlInput.trim()]);
      setImageUrlInput('');
    }
  };

  const handleRemoveImage = async (index: number) => {
    const image = images[index];
    setImages((prev) => prev.filter((_, i) => i !== index));
    const key = mediaKeyFromUrl(image);
    if (key) await deleteProductImage(key).catch((error) => console.warn('Could not delete R2 image:', error));
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const [chosen] = copy.splice(index, 1);
      copy.unshift(chosen);
      return copy;
    });
  };

  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    setImages((prev) => {
      const copy = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= copy.length) return prev;
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Product title is required.');
      return;
    }
    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      setFormError('Please enter a valid price (must be 0 or greater).');
      return;
    }
    if (oldPrice !== undefined && oldPrice !== null && (isNaN(Number(oldPrice)) || Number(oldPrice) < 0)) {
      setFormError('Original price must be a valid positive number if provided.');
      return;
    }
    if (images.length === 0) {
      setFormError('Please add at least one product photo.');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedCategoryObj = categories.find((c) => c.id === categoryId);
      const generatedSlug =
        product?.slug ||
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') +
          '-' +
          Math.floor(100 + Math.random() * 900);

      let finalWeightPrices: WeightPriceOption[] | undefined;
      let finalWeightOptions: string[] | undefined;
      let finalPrice = Number(price);
      let finalOldPrice = oldPrice ? Number(oldPrice) : undefined;

      if (hasWeightPricing) {
        const validOptions = weightPrices
          .map((wp) => ({
            weight: wp.weight.trim(),
            price: Number(wp.price),
            oldPrice: wp.oldPrice ? Number(wp.oldPrice) : undefined,
          }))
          .filter((wp) => wp.weight.length > 0 && !isNaN(wp.price) && wp.price >= 0);

        if (validOptions.length === 0) {
          setFormError('Please configure at least one valid weight/size with price, or disable weight pricing.');
          setIsSubmitting(false);
          return;
        }

        finalWeightPrices = validOptions;
        finalWeightOptions = validOptions.map((wp) => wp.weight);
        // Base price is lowest variant price so catalog defaults to lowest rate
        const minRate = Math.min(...validOptions.map((wp) => wp.price));
        finalPrice = minRate;
      } else {
        const parsedWeights = weightOptionsStr
          .split(',')
          .map((w) => w.trim())
          .filter(Boolean);
        finalWeightOptions = parsedWeights.length > 0 ? parsedWeights : undefined;
      }

      const updatedProduct: Product = {
        id: product?.id || `prod_${Date.now()}`,
        name: name.trim(),
        slug: generatedSlug,
        categoryId: categoryId,
        categoryName: selectedCategoryObj?.name || 'Cakes',
        categorySlug: selectedCategoryObj?.slug || 'cakes',
        price: finalPrice,
        oldPrice: finalOldPrice,
        description: description.trim(),
        images,
        available,
        featured,
        bestseller,
        weightOptions: finalWeightOptions,
        weightPrices: finalWeightPrices,
        allowCustomMessage,
        customMessagePlaceholder: customMessagePlaceholder.trim() || undefined,
        displayOrder: Number(displayOrder),
        createdAt: product?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await onSave(updatedProduct);
      onClose();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="product-form-modal-title" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="relative bg-white rounded-2xl sm:rounded-3xl max-w-3xl w-full max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)] overflow-y-auto p-4 sm:p-8 shadow-2xl border border-gray-100 my-2 sm:my-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h2 id="product-form-modal-title" className="font-serif text-2xl font-bold text-gray-900">
              {isEdit ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="text-xs text-gray-500">
              Update catalogue information, stock availability, and image gallery.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {formError && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Row 1: Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Product Title *
              </label>
              <input
                type="text"
                required
                placeholder="E.g., Belgian Chocolate Truffle Cake"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#831843] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#831843] focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Price & Old Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                required
                min={1}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#831843] focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Original / Old Price (₹) (Optional)
              </label>
              <input
                type="number"
                placeholder="E.g., 799"
                value={oldPrice || ''}
                onChange={(e) => setOldPrice(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#831843] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Display Order
              </label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#831843] focus:outline-none"
              />
            </div>
          </div>

          {/* Row 3: Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Description *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Describe freshness, ingredients, packaging, and presentation..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#831843] focus:outline-none"
            />
          </div>

          {/* Row 4: Image Management (Upload, Preview, Primary selection, Delete, Reorder) */}
          <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Product Images ({images.length})
                </h4>
                <p className="text-[11px] text-gray-500">
                  The first image is the Primary photo shown in product cards.
                </p>
              </div>

              {/* Upload Input Button */}
              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-[#831843] text-white text-xs font-bold rounded-xl hover:bg-[#6b1336] shadow transition-colors">
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Upload Image Files</span>
                  </>
                )}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>

            {/* Direct Image URL input */}
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="Or paste image web link URL (https://...)"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
              />
              <button
                type="button"
                onClick={handleAddUrl}
                className="px-4 py-2 bg-gray-800 text-white rounded-xl text-xs font-bold hover:bg-gray-700"
              >
                Add Link
              </button>
            </div>

            {/* Thumbnail previews */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className={`relative rounded-xl overflow-hidden border-2 bg-white aspect-square shadow-sm ${
                    idx === 0 ? 'border-[#831843] ring-2 ring-[#FCE7F3]' : 'border-gray-200'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />

                  {/* Primary Badge */}
                  {idx === 0 && (
                    <span className="absolute top-1 left-1 bg-[#831843] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow">
                      PRIMARY
                    </span>
                  )}

                  {/* Image Controls Overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-black/70 backdrop-blur-xs p-1 flex items-center justify-around text-white">
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(idx)}
                        title="Set as Primary"
                        className="p-1 hover:text-amber-400 text-gray-300"
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => handleMoveImage(idx, 'up')}
                        title="Move left"
                        className="p-1 hover:text-white text-gray-300"
                      >
                        <ArrowUp className="w-3.5 h-3.5 rotate-[-90deg]" />
                      </button>
                    )}
                    {idx < images.length - 1 && (
                      <button
                        type="button"
                        onClick={() => handleMoveImage(idx, 'down')}
                        title="Move right"
                        className="p-1 hover:text-white text-gray-300"
                      >
                        <ArrowDown className="w-3.5 h-3.5 rotate-[-90deg]" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      title="Delete image"
                      className="p-1 hover:text-rose-400 text-gray-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 5: Weight-Wise Pricing / Size Options */}
          <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-gray-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Weight-Wise Pricing Options
                </h4>
                <p className="text-[11px] text-gray-500">
                  Set separate rates for weights (e.g. 500gm, 1kg, 2kg). The lowest rate will automatically show in the menu as &ldquo;From ₹...&rdquo;.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasWeightPricing}
                  onChange={(e) => setHasWeightPricing(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#831843]"></div>
                <span className="ml-2 text-xs font-semibold text-gray-700">Separate Rates</span>
              </label>
            </div>

            {hasWeightPricing ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  {weightPrices.map((wp, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-gray-200">
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                          Size / Weight
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 500g, 1kg"
                          value={wp.weight}
                          onChange={(e) => {
                            const copy = [...weightPrices];
                            copy[idx].weight = e.target.value;
                            setWeightPrices(copy);
                          }}
                          className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-[#831843] focus:outline-none"
                        />
                      </div>

                      <div className="w-28 sm:w-32">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                          Rate (₹) *
                        </label>
                        <input
                          type="number"
                          placeholder="Rate"
                          min={0}
                          value={wp.price}
                          onChange={(e) => {
                            const copy = [...weightPrices];
                            copy[idx].price = Number(e.target.value);
                            setWeightPrices(copy);
                          }}
                          className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-900 focus:ring-1 focus:ring-[#831843] focus:outline-none"
                        />
                      </div>

                      <div className="w-28 sm:w-32">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                          Old Rate (₹)
                        </label>
                        <input
                          type="number"
                          placeholder="Optional"
                          min={0}
                          value={wp.oldPrice || ''}
                          onChange={(e) => {
                            const copy = [...weightPrices];
                            copy[idx].oldPrice = e.target.value ? Number(e.target.value) : undefined;
                            setWeightPrices(copy);
                          }}
                          className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-[#831843] focus:outline-none text-gray-500"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (weightPrices.length > 1) {
                            setWeightPrices(weightPrices.filter((_, i) => i !== idx));
                          }
                        }}
                        disabled={weightPrices.length <= 1}
                        className="p-2 text-gray-400 hover:text-rose-600 disabled:opacity-30 rounded-lg self-end mb-0.5"
                        aria-label="Remove option"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setWeightPrices([...weightPrices, { weight: '', price: price || 599 }]);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#831843] bg-pink-50 hover:bg-pink-100 rounded-xl transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Another Weight Option</span>
                </button>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Weight / Size Options (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="500g, 1kg, 2kg"
                  value={weightOptionsStr}
                  onChange={(e) => setWeightOptionsStr(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#831843] focus:outline-none"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Customers can select among these weights at the base price of ₹{price}.
                </p>
              </div>
            )}
          </div>

          {/* Row 6: Custom Message Toggle */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-gray-900 block">Allow Custom Message on Cake or Card</span>
              <span className="text-[11px] text-gray-500">Provides text field for customer to add piping message</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={allowCustomMessage}
                onChange={(e) => setAllowCustomMessage(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#831843]"></div>
            </label>
          </div>

          {/* Row 7: Flags (In Stock, Featured, Bestseller) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer">
              <input
                type="checkbox"
                checked={available}
                onChange={(e) => setAvailable(e.target.checked)}
                className="w-4 h-4 text-[#831843] rounded"
              />
              <span className="text-xs font-bold text-gray-800">In Stock for Order</span>
            </label>

            <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 text-[#831843] rounded"
              />
              <span className="text-xs font-bold text-gray-800">Show on Featured</span>
            </label>

            <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer">
              <input
                type="checkbox"
                checked={bestseller}
                onChange={(e) => setBestseller(e.target.checked)}
                className="w-4 h-4 text-[#831843] rounded"
              />
              <span className="text-xs font-bold text-gray-800">Show on Bestsellers</span>
            </label>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#831843] hover:bg-[#6b1336] text-white text-xs font-bold shadow-md transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Product...</span>
                </>
              ) : (
                <span>Save Product</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
