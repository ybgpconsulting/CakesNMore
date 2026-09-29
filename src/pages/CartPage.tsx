import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Home,
  MapPin,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Store,
  Trash2,
  Truck,
} from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { useCart } from '../context/CartContext';
import { useDeliveryAvailability } from '../context/DeliveryContext';
import { useStore } from '../context/StoreContext';
import { CustomerDeliveryAddress } from '../types';
import { formatDistanceKm } from '../utils/distance';
import { WhatsAppIcon } from '../components/common/WhatsAppIcon';

export const CartPage: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, subtotal, totalQuantity, generateWhatsAppOrderUrl } =
    useCart();
  const { settings } = useStore();
  const { verifiedLocation, deliverySettings, openDeliveryGate } = useDeliveryAvailability();

  const isDeliveryVerified = Boolean(
    deliverySettings.enabled && verifiedLocation && verifiedLocation.verified
  );

  // Address fields per Requirement 16
  const [customerAddress, setCustomerAddress] = useState<CustomerDeliveryAddress>({
    name: '',
    mobile: '',
    houseFlat: '',
    buildingSociety: '',
    streetArea: '',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pincode: verifiedLocation?.pincode || '201301',
    deliveryInstructions: '',
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const handleAddressChange = (field: keyof CustomerDeliveryAddress, value: string) => {
    setCustomerAddress((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!customerAddress.name.trim()) {
      errors.name = 'Please enter customer / recipient name.';
    }
    if (!customerAddress.mobile.trim() || customerAddress.mobile.replace(/[^0-9]/g, '').length < 10) {
      errors.mobile = 'Please enter a valid 10-digit mobile number.';
    }
    if (!customerAddress.houseFlat.trim()) {
      errors.houseFlat = 'Please enter house/flat or unit number.';
    }
    if (!customerAddress.buildingSociety.trim()) {
      errors.buildingSociety = 'Please enter building/society name.';
    }
    if (!customerAddress.streetArea.trim()) {
      errors.streetArea = 'Please enter street or sector area in Noida.';
    }
    const cleanPincode = customerAddress.pincode.replace(/\D/g, '');
    if (!/^\d{6}$/.test(cleanPincode)) {
      errors.pincode = 'Please enter a valid 6-digit pincode.';
    } else if (
      deliverySettings.allowedPincodes?.length &&
      !deliverySettings.allowedPincodes.includes(cleanPincode)
    ) {
      errors.pincode = 'This pincode is outside the configured delivery area.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleWhatsAppCheckout = () => {
    if (!isDeliveryVerified) {
      openDeliveryGate();
      return;
    }

    if (!validateForm()) {
      const firstErrorEl = document.getElementById('customer-delivery-address-form');
      firstErrorEl?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const whatsappUrl = generateWhatsAppOrderUrl(
      settings,
      customerAddress.deliveryInstructions,
      {
        customerAddress,
        verifiedLocation,
        radiusKm: deliverySettings.radiusKm,
      }
    );

    const win = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    if (!win) {
      window.location.href = whatsappUrl;
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center">
        <SEO title="Your Cart is Empty | Cakes N More Sector 76 Noida" />
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-md border border-[#EADBDA] mb-4 text-[#831843]">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2">Your Cart is Empty</h1>
        <p className="text-gray-500 max-w-sm mb-6 text-sm">
          Looks like you haven&apos;t added any celebratory cakes or fresh flower bouquets to your cart yet.
        </p>
        <Link
          to="/shop"
          className="px-8 py-3.5 rounded-full bg-[#831843] hover:bg-[#6b1336] text-white font-bold text-sm shadow-md transition-all"
        >
          Browse Our Catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-4 pb-36 sm:py-12">
      <SEO
        title={`Review Order (${totalQuantity} items) | Cakes N More Noida Sector 76`}
        description="Review your selected celebration cakes and flowers before WhatsApp confirmation. Fast delivery across Sector 76, Noida."
        noindex={true}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-gray-800 flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <Link to="/shop" className="hover:text-gray-800">
            Shop
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="text-gray-900 font-semibold">Review Order &amp; WhatsApp Checkout</span>
        </nav>

        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#29141B] tracking-tight mb-8">
          Review Your Order
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBDA] shadow-sm divide-y divide-gray-100">
              {cart.map((item, index) => {
                const itemSubtotal = item.product.price * item.quantity;
                const imageSrc =
                  item.product.images?.[0] ||
                  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=300&auto=format&fit=crop';

                return (
                  <div key={index} className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Item visual + Details */}
                    <div className="flex items-start sm:items-center gap-4">
                      <img
                        src={imageSrc}
                        alt={item.product.name}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shrink-0 border border-gray-100"
                      />

                      <div className="space-y-1">
                        <Link
                          to={`/product/${item.product.slug}`}
                          className="font-serif text-base sm:text-lg font-bold text-gray-900 hover:text-[#831843] transition-colors line-clamp-1"
                        >
                          {item.product.name}
                        </Link>

                        <div className="text-xs text-gray-500 space-y-0.5">
                          {item.selectedWeight && (
                            <p>
                              Weight: <strong className="text-gray-700">{item.selectedWeight}</strong>
                            </p>
                          )}
                          {(item.product.categoryId === 'cat-cakes' || item.product.categorySlug === 'cakes') && (
                            <p>
                              Type: <strong className="text-emerald-700">100% Eggless</strong>
                            </p>
                          )}
                          {item.customMessage && (
                            <p className="text-[#831843] font-medium italic">
                              Message: &ldquo;{item.customMessage}&rdquo;
                            </p>
                          )}
                        </div>

                        <p className="text-xs text-gray-400">₹{item.product.price} each</p>
                      </div>
                    </div>

                    {/* Quantity + Subtotal + Remove */}
                    <div className="flex items-center justify-between w-full sm:w-auto gap-6 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-0 border-gray-50">
                      {/* Quantity Controller */}
                      <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50">
                        <button
                          type="button"
                          onClick={() => updateQuantity(index, item.quantity - 1)}
                          className="p-1.5 text-gray-600 hover:text-gray-900"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold text-gray-800">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(index, item.quantity + 1)}
                          className="p-1.5 text-gray-600 hover:text-gray-900"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right min-w-[70px]">
                        <span className="text-base font-bold text-gray-900">₹{itemSubtotal}</span>
                      </div>

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(index)}
                        className="p-2 text-gray-400 hover:text-rose-600 rounded-lg transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Delivery Verification Notice / Gate Status */}
            {!isDeliveryVerified ? (
              <div className="bg-amber-50 border-2 border-dashed border-amber-300 rounded-3xl p-6 sm:p-7 text-amber-900 space-y-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-800">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-serif text-lg font-bold text-amber-950">
                      Please check delivery availability before placing your order
                    </h3>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      We prepare our celebration cakes and floral bouquets fresh from our Sector 76, Noida store. Please confirm your delivery location within {deliverySettings.radiusKm} km before finalizing your order on WhatsApp.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={openDeliveryGate}
                  className="w-full sm:w-auto px-6 py-3.5 bg-[#831843] hover:bg-[#6b1336] active:scale-95 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Check Delivery Availability</span>
                </button>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-4 sm:p-5 text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      ✓ Delivery Verified
                    </div>
                    <div className="text-xs text-gray-700">
                      Approximately{' '}
                      <strong className="text-gray-900">{formatDistanceKm(verifiedLocation!.distanceKm)}</strong> from Cakes N More Sector 76 Store (Within {deliverySettings.radiusKm} km limit).
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={openDeliveryGate}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#831843] hover:underline shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Change Location</span>
                </button>
              </div>
            )}

            {/* Customer Actual Delivery Address Form (Requirement 16) */}
            <div
              id="customer-delivery-address-form"
              className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBDA] shadow-sm space-y-5"
            >
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-gray-900">
                  Recipient &amp; Delivery Address Details
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Enter your complete delivery address in Noida. These details will be formatted directly into your WhatsApp message.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Customer / Recipient Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={customerAddress.name}
                    onChange={(e) => handleAddressChange('name', e.target.value)}
                    className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#831843] ${
                      formErrors.name ? 'border-rose-400 bg-rose-50/50' : 'border-gray-200'
                    }`}
                  />
                  {formErrors.name && <p className="text-[11px] text-rose-600 mt-1">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={customerAddress.mobile}
                    onChange={(e) => handleAddressChange('mobile', e.target.value)}
                    className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#831843] ${
                      formErrors.mobile ? 'border-rose-400 bg-rose-50/50' : 'border-gray-200'
                    }`}
                  />
                  {formErrors.mobile && <p className="text-[11px] text-rose-600 mt-1">{formErrors.mobile}</p>}
                </div>
              </div>

              {/* House/Flat & Building/Society */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    House / Flat / Unit Number *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Flat 402, Tower B"
                    value={customerAddress.houseFlat}
                    onChange={(e) => handleAddressChange('houseFlat', e.target.value)}
                    className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#831843] ${
                      formErrors.houseFlat ? 'border-rose-400 bg-rose-50/50' : 'border-gray-200'
                    }`}
                  />
                  {formErrors.houseFlat && <p className="text-[11px] text-rose-600 mt-1">{formErrors.houseFlat}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Building / Society Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Amrapali Silicon City / Crystal Home"
                    value={customerAddress.buildingSociety}
                    onChange={(e) => handleAddressChange('buildingSociety', e.target.value)}
                    className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#831843] ${
                      formErrors.buildingSociety ? 'border-rose-400 bg-rose-50/50' : 'border-gray-200'
                    }`}
                  />
                  {formErrors.buildingSociety && <p className="text-[11px] text-rose-600 mt-1">{formErrors.buildingSociety}</p>}
                </div>
              </div>

              {/* Street/Area & Pincode */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Street / Sector Area in Noida *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sector 76, Central Noida"
                    value={customerAddress.streetArea}
                    onChange={(e) => handleAddressChange('streetArea', e.target.value)}
                    className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#831843] ${
                      formErrors.streetArea ? 'border-rose-400 bg-rose-50/50' : 'border-gray-200'
                    }`}
                  />
                  {formErrors.streetArea && <p className="text-[11px] text-rose-600 mt-1">{formErrors.streetArea}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 201301"
                    value={customerAddress.pincode}
                    onChange={(e) => handleAddressChange('pincode', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#831843]"
                  />
                </div>
              </div>

              {/* City & State (Read-only defaults for Sector 76, Noida) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={customerAddress.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-xs text-gray-700 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={customerAddress.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-xs text-gray-700 font-medium"
                  />
                </div>
              </div>

              {/* Delivery Instructions */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Delivery Instructions / Special Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Deliver between 6:00 PM - 7:00 PM. Please include birthday candles and knife."
                  value={customerAddress.deliveryInstructions}
                  onChange={(e) => handleAddressChange('deliveryInstructions', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#831843]"
                />
              </div>
            </div>

            {/* Back to Shopping button */}
            <div className="flex justify-between items-center pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-[#831843] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Continue Shopping</span>
              </Link>

              <button
                type="button"
                onClick={clearCart}
                className="text-xs text-rose-600 hover:underline"
              >
                Clear Entire Cart
              </button>
            </div>
          </div>

          {/* Right Column: Order Summary & WhatsApp Action */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBDA] shadow-sm sticky top-24 space-y-6">
              <h2 className="font-serif text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Total Items</span>
                  <span className="font-medium text-gray-900">{totalQuantity}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Items Subtotal</span>
                  <span className="font-medium text-gray-900">₹{subtotal}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Delivery Status</span>
                  {isDeliveryVerified ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified ({formatDistanceKm(verifiedLocation!.distanceKm)})
                    </span>
                  ) : (
                    <span className="text-amber-700 font-semibold text-xs">
                      Verification required
                    </span>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
                  <span className="text-base font-bold text-gray-900">Estimated Total</span>
                  <span className="text-2xl font-extrabold text-[#831843]">₹{subtotal}</span>
                </div>
              </div>

              {/* Verification Prompt or WhatsApp Button */}
              <div className="space-y-3 pt-2">
                {!isDeliveryVerified ? (
                  <div className="space-y-2">
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <span>Please check delivery availability before placing your order.</span>
                    </div>

                    <button
                      type="button"
                      onClick={openDeliveryGate}
                      className="w-full py-4 px-6 rounded-2xl bg-[#831843] hover:bg-[#6b1336] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>Check Delivery Availability</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleWhatsAppCheckout}
                    className="w-full py-4 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-base shadow-lg hover:shadow-xl flex items-center justify-center gap-2.5 transition-all active:scale-95 cursor-pointer"
                  >
                    <WhatsAppIcon className="w-5 h-5" />
                    <span>Order on WhatsApp</span>
                  </button>
                )}

                <p className="text-[11px] text-gray-500 text-center leading-snug">
                  Clicking opens WhatsApp with your complete itemized order and verified delivery address pre-filled to confirm delivery with our store team.
                </p>
              </div>

              {/* Local Trust Badges */}
              <div className="pt-4 border-t border-gray-100 space-y-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-[#831843] shrink-0" />
                  <span>Store: Shop 29, Crystal Home, Sector 76 Noida</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#831843] shrink-0" />
                  <span>Fresh doorstep delivery within {deliverySettings.radiusKm} km</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#831843] shrink-0" />
                  <span>Direct WhatsApp verification &amp; UPI confirmation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Checkout Bar */}
      <div className="lg:hidden fixed bottom-[calc(56px+max(0.4rem,env(safe-area-inset-bottom,0px)))] inset-x-0 bg-white/98 backdrop-blur-md border-t border-[#EADBDA] p-3 shadow-[0_-6px_25px_rgba(0,0,0,0.08)] z-30">
        <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
          <div className="flex flex-col shrink-0">
            <span className="text-[10px] uppercase font-bold text-gray-400">Total ({totalQuantity} items)</span>
            <span className="text-xl font-extrabold text-[#831843] leading-none">
              ₹{subtotal}
            </span>
          </div>

          {!isDeliveryVerified ? (
            <button
              type="button"
              onClick={openDeliveryGate}
              className="flex-1 py-3 px-4 rounded-xl bg-[#831843] hover:bg-[#6b1336] active:scale-95 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all"
            >
              <MapPin className="w-4 h-4" />
              <span>Check Delivery</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleWhatsAppCheckout}
              className="flex-1 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] active:scale-95 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>Order on WhatsApp</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
