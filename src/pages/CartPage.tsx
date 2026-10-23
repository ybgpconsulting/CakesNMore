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
  Sparkles,
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
  const { cart, removeFromCart, updateQuantity, clearCart, subtotal, totalQuantity, generateWhatsAppOrderUrl, getItemUnitPrice } =
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
      <div className="min-h-[70vh] bg-[#FAF7F0] text-[#30251F] flex flex-col items-center justify-center p-6 text-center">
        <SEO title="Your Shopping Bag is Empty | Cakes N More Sector 76 Noida" noindex={true} />
        <div className="w-20 h-20 bg-[#FFFFFF] rounded-full flex items-center justify-center shadow-xs border border-[#E8E2D5] mb-4 text-[#C5A46D]">
          <ShoppingBag className="w-9 h-9" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#30251F] mb-2">Your Shopping Bag is Empty</h1>
        <p className="text-[#81776C] max-w-sm mb-6 text-sm">
          You haven&apos;t added any celebratory cakes or fresh flower bouquets to your bag yet.
        </p>
        <Link
          to="/shop"
          className="px-8 py-3.5 rounded-full bg-[#30251F] hover:bg-[#201814] text-[#FAF7F0] text-xs font-serif font-bold tracking-wider cursor-pointer"
        >
          Explore Atelier Catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#30251F] pt-4 pb-36 sm:py-16">
      <SEO
        title={`Review Order (${totalQuantity} items) | Cakes N More Noida Sector 76`}
        description="Review your selected items before confirming delivery availability and your order with Cakes N More via WhatsApp."
        noindex={true}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#81776C] mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-[#30251F] flex items-center gap-1 transition-colors">
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-[#C5A46D]" />
          <Link to="/shop" className="hover:text-[#30251F] transition-colors">
            Catalogue
          </Link>
          <ChevronRight className="w-3 h-3 text-[#C5A46D]" />
          <span className="text-[#30251F] font-semibold">Shopping Bag &amp; Concierge Checkout</span>
        </nav>

        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#30251F] tracking-tight mb-8">
          Review Your Selection
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-8 space-y-5">
            <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-8 border border-[#E8E2D5] shadow-xs divide-y divide-[#E8E2D5]">
              {cart.map((item, index) => {
                const itemPrice = getItemUnitPrice(item);
                const itemSubtotal = itemPrice * item.quantity;
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
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shrink-0 border border-[#E8E2D5]"
                      />

                      <div className="space-y-1">
                        <Link
                          to={`/product/${item.product.slug}`}
                          className="font-serif text-base sm:text-lg font-bold text-[#30251F] hover:text-[#C5A46D] transition-colors line-clamp-1"
                        >
                          {item.product.name}
                        </Link>

                        <div className="text-xs text-[#81776C] space-y-0.5">
                          {item.selectedWeight && (
                            <p>
                              Weight: <strong className="text-[#30251F] font-semibold">{item.selectedWeight}</strong>
                            </p>
                          )}
                          {item.selectedFlavour && (
                            <p>
                              Flavour: <strong className="text-[#30251F] font-semibold">{item.selectedFlavour}</strong>
                            </p>
                          )}
                          {(item.product.categoryId === 'cat-cakes' || item.product.categorySlug === 'cakes') && (
                            <p>
                              Specification: <strong className="text-[#244438] font-semibold">100% Eggless</strong>
                            </p>
                          )}
                          {item.customMessage && (
                            <p className="text-[#30251F] font-medium italic">
                              Inscription: &ldquo;{item.customMessage}&rdquo;
                            </p>
                          )}
                        </div>

                        <p className="text-xs text-[#81776C]">₹{itemPrice} each</p>
                      </div>
                    </div>

                    {/* Quantity + Subtotal + Remove */}
                    <div className="flex items-center justify-between w-full sm:w-auto gap-6 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-0 border-[#E8E2D5]">
                      {/* Quantity Controller */}
                      <div className="flex items-center border border-[#E8E2D5] rounded-full bg-[#FAF7F0] px-1">
                        <button
                          type="button"
                          onClick={() => updateQuantity(index, item.quantity - 1)}
                          className="p-1.5 text-[#81776C] hover:text-[#30251F] transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-semibold text-[#30251F]">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(index, item.quantity + 1)}
                          className="p-1.5 text-[#81776C] hover:text-[#30251F] transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right min-w-[70px]">
                        <span className="font-serif text-base sm:text-lg font-bold text-[#30251F]">₹{itemSubtotal}</span>
                      </div>

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(index)}
                        className="p-2 text-[#81776C] hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
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
              <div className="bg-[#FFFFFF] border border-[#C5A46D]/40 rounded-3xl p-6 sm:p-7 text-[#30251F] space-y-4 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#FAF7F0] border border-[#E8E2D5] flex items-center justify-center shrink-0 text-[#C5A46D]">
                    <MapPin className="w-5 h-5 text-[#C5A46D]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-serif text-lg font-bold text-[#30251F]">
                      Please verify delivery radius before finalizing
                    </h3>
                    <p className="text-xs text-[#81776C] leading-relaxed">
                      We prepare our celebration cakes and floral bouquets fresh from our Sector 76, Noida boutique. Please verify your address is within our {deliverySettings.radiusKm} km radius before sending your order to WhatsApp.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={openDeliveryGate}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#30251F] hover:bg-[#201814] text-[#FAF7F0] text-xs font-serif font-bold tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <MapPin className="w-4 h-4 text-[#C5A46D]" />
                  <span>Verify Delivery Radius</span>
                </button>
              </div>
            ) : (
              <div className="bg-[#244438]/10 border border-[#244438]/20 rounded-3xl p-4 sm:p-5 text-[#244438] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#FFFFFF] border border-[#244438]/20 flex items-center justify-center shrink-0 text-[#244438]">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-[#244438]">
                      ✓ Delivery Address Verified
                    </div>
                    <div className="text-xs text-[#81776C]">
                      Approximately{' '}
                      <strong className="text-[#30251F] font-semibold">{formatDistanceKm(verifiedLocation!.distanceKm)}</strong> from Cakes N More Sector 76 Store (Within {deliverySettings.radiusKm} km radius).
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={openDeliveryGate}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#30251F] hover:text-[#C5A46D] hover:underline shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Change Location</span>
                </button>
              </div>
            )}

            {/* Customer Actual Delivery Address Form (Requirement 16) */}
            <div
              id="customer-delivery-address-form"
              className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-8 border border-[#E8E2D5] shadow-xs space-y-5"
            >
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#30251F]">
                  Recipient &amp; Delivery Destination
                </h3>
                <p className="text-xs text-[#81776C] mt-1">
                  Enter your doorstep address in Noida. These details will be formatted directly into your WhatsApp concierge dispatch message.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#81776C] uppercase tracking-[0.14em] mb-1">
                    Customer / Recipient Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={customerAddress.name}
                    onChange={(e) => handleAddressChange('name', e.target.value)}
                    className={`w-full px-4 py-2.5 bg-[#FAF7F0] border rounded-xl text-xs sm:text-sm text-[#30251F] placeholder-[#81776C]/60 focus:outline-none focus:border-[#30251F] focus:ring-1 focus:ring-[#30251F] ${
                      formErrors.name ? 'border-rose-400 bg-rose-50/50' : 'border-[#E8E2D5]'
                    }`}
                  />
                  {formErrors.name && <p className="text-[11px] text-rose-500 mt-1">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#81776C] uppercase tracking-[0.14em] mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={customerAddress.mobile}
                    onChange={(e) => handleAddressChange('mobile', e.target.value)}
                    className={`w-full px-4 py-2.5 bg-[#FAF7F0] border rounded-xl text-xs sm:text-sm text-[#30251F] placeholder-[#81776C]/60 focus:outline-none focus:border-[#30251F] focus:ring-1 focus:ring-[#30251F] ${
                      formErrors.mobile ? 'border-rose-400 bg-rose-50/50' : 'border-[#E8E2D5]'
                    }`}
                  />
                  {formErrors.mobile && <p className="text-[11px] text-rose-500 mt-1">{formErrors.mobile}</p>}
                </div>
              </div>

              {/* House/Flat & Building/Society */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#81776C] uppercase tracking-[0.14em] mb-1">
                    House / Flat / Unit Number *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Flat 402, Tower B"
                    value={customerAddress.houseFlat}
                    onChange={(e) => handleAddressChange('houseFlat', e.target.value)}
                    className={`w-full px-4 py-2.5 bg-[#FAF7F0] border rounded-xl text-xs sm:text-sm text-[#30251F] placeholder-[#81776C]/60 focus:outline-none focus:border-[#30251F] focus:ring-1 focus:ring-[#30251F] ${
                      formErrors.houseFlat ? 'border-rose-400 bg-rose-50/50' : 'border-[#E8E2D5]'
                    }`}
                  />
                  {formErrors.houseFlat && <p className="text-[11px] text-rose-500 mt-1">{formErrors.houseFlat}</p>}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#81776C] uppercase tracking-[0.14em] mb-1">
                    Building / Society Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Amrapali Silicon City / Crystal Home"
                    value={customerAddress.buildingSociety}
                    onChange={(e) => handleAddressChange('buildingSociety', e.target.value)}
                    className={`w-full px-4 py-2.5 bg-[#FAF7F0] border rounded-xl text-xs sm:text-sm text-[#30251F] placeholder-[#81776C]/60 focus:outline-none focus:border-[#30251F] focus:ring-1 focus:ring-[#30251F] ${
                      formErrors.buildingSociety ? 'border-rose-400 bg-rose-50/50' : 'border-[#E8E2D5]'
                    }`}
                  />
                  {formErrors.buildingSociety && <p className="text-[11px] text-rose-500 mt-1">{formErrors.buildingSociety}</p>}
                </div>
              </div>

              {/* Street/Area & Pincode */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-[#81776C] uppercase tracking-[0.14em] mb-1">
                    Street / Sector Area in Noida *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sector 76, Central Noida"
                    value={customerAddress.streetArea}
                    onChange={(e) => handleAddressChange('streetArea', e.target.value)}
                    className={`w-full px-4 py-2.5 bg-[#FAF7F0] border rounded-xl text-xs sm:text-sm text-[#30251F] placeholder-[#81776C]/60 focus:outline-none focus:border-[#30251F] focus:ring-1 focus:ring-[#30251F] ${
                      formErrors.streetArea ? 'border-rose-400 bg-rose-50/50' : 'border-[#E8E2D5]'
                    }`}
                  />
                  {formErrors.streetArea && <p className="text-[11px] text-rose-500 mt-1">{formErrors.streetArea}</p>}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#81776C] uppercase tracking-[0.14em] mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 201301"
                    value={customerAddress.pincode}
                    onChange={(e) => handleAddressChange('pincode', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#FAF7F0] border border-[#E8E2D5] text-[#30251F] placeholder-[#81776C]/60 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#30251F] focus:ring-1 focus:ring-[#30251F]"
                  />
                </div>
              </div>

              {/* City & State */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#81776C] uppercase tracking-[0.14em] mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={customerAddress.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl text-xs sm:text-sm text-[#30251F] font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#81776C] uppercase tracking-[0.14em] mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={customerAddress.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl text-xs sm:text-sm text-[#30251F] font-medium"
                  />
                </div>
              </div>

              {/* Delivery Instructions */}
              <div>
                <label className="block text-[11px] font-bold text-[#81776C] uppercase tracking-[0.14em] mb-1">
                  Delivery Instructions / Inscriptions / Knife &amp; Candle Request
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Deliver between 6:00 PM - 7:00 PM. Please include birthday candles and cake knife."
                  value={customerAddress.deliveryInstructions}
                  onChange={(e) => handleAddressChange('deliveryInstructions', e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FAF7F0] border border-[#E8E2D5] text-[#30251F] placeholder-[#81776C]/60 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#30251F] focus:ring-1 focus:ring-[#30251F]"
                />
              </div>
            </div>

            {/* Back to Shopping button */}
            <div className="flex justify-between items-center pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#81776C] hover:text-[#30251F] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Catalogue</span>
              </Link>

              <button
                type="button"
                onClick={clearCart}
                className="text-xs text-[#81776C] hover:text-rose-600 hover:underline cursor-pointer"
              >
                Clear Entire Bag
              </button>
            </div>
          </div>

          {/* Right Column: Order Summary & WhatsApp Action */}
          <div className="lg:col-span-4">
            <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-8 border border-[#E8E2D5] shadow-xs sticky top-24 space-y-6">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#30251F] border-b border-[#E8E2D5] pb-3">
                Order Summary
              </h2>

              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between text-[#81776C]">
                  <span>Total Items</span>
                  <span className="font-semibold text-[#30251F]">{totalQuantity}</span>
                </div>

                <div className="flex justify-between text-[#81776C]">
                  <span>Items Subtotal</span>
                  <span className="font-semibold text-[#30251F]">₹{subtotal}</span>
                </div>

                <div className="flex justify-between text-[#81776C]">
                  <span>Delivery Status</span>
                  {isDeliveryVerified ? (
                    <span className="text-[#244438] font-semibold flex items-center gap-1 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified ({formatDistanceKm(verifiedLocation!.distanceKm)})
                    </span>
                  ) : (
                    <span className="text-[#C5A46D] font-semibold text-xs">
                      Verification required
                    </span>
                  )}
                </div>

                <div className="pt-3.5 border-t border-[#E8E2D5] flex justify-between items-baseline">
                  <span className="text-base font-serif font-bold text-[#30251F]">Estimated Total</span>
                  <span className="font-serif text-3xl font-bold text-[#30251F]">₹{subtotal}</span>
                </div>
              </div>

              {/* Verification Prompt or WhatsApp Button */}
              <div className="space-y-3 pt-2">
                {!isDeliveryVerified ? (
                  <div className="space-y-2">
                    <div className="p-3 bg-[#FAF7F0] border border-[#E8E2D5] rounded-2xl text-xs text-[#81776C] flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-[#C5A46D] shrink-0 mt-0.5" />
                      <span>Please check delivery availability before completing your order.</span>
                    </div>

                    <button
                      type="button"
                      onClick={openDeliveryGate}
                      className="w-full py-4 px-6 rounded-full bg-[#30251F] hover:bg-[#201814] text-[#FAF7F0] font-serif text-sm font-bold tracking-wide flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <MapPin className="w-4 h-4 text-[#C5A46D]" />
                      <span>Verify Delivery Radius</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleWhatsAppCheckout}
                    className="w-full py-4 px-6 rounded-full bg-[#244438] hover:bg-[#1a3229] text-white font-serif text-base font-bold tracking-wide shadow-md flex items-center justify-center gap-2.5 transition-all active:scale-98 cursor-pointer"
                  >
                    <WhatsAppIcon className="w-5 h-5 text-white" />
                    <span>Complete Order via WhatsApp</span>
                  </button>
                )}

                <p className="text-[11px] text-[#81776C] text-center leading-snug">
                  Clicking opens WhatsApp with your complete itemized order and verified delivery address pre-filled for immediate confirmation with our store team.
                </p>
              </div>

              {/* Local Trust Badges */}
              <div className="pt-4 border-t border-[#E8E2D5] space-y-2 text-xs text-[#81776C] bg-[#FAF7F0] p-4 rounded-xl border">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-[#30251F] shrink-0" />
                  <span>Boutique: Shop 29, Crystal Home, Sector 76 Noida</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#244438] shrink-0" />
                  <span>Doorstep delivery within {deliverySettings.radiusKm} km radius</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#C5A46D] shrink-0" />
                  <span>Personal WhatsApp concierge &amp; direct UPI verification</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Checkout Bar */}
      <div className="lg:hidden fixed bottom-[calc(56px+max(0.6rem,env(safe-area-inset-bottom,0px)))] inset-x-0 bg-[#FFFFFF]/95 backdrop-blur-xl border-t border-[#E8E2D5] p-3 shadow-lg z-30 text-[#30251F]">
        <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
          <div className="flex flex-col shrink-0">
            <span className="text-[10px] uppercase font-bold text-[#81776C]">Total ({totalQuantity} items)</span>
            <span className="font-serif text-xl font-bold text-[#30251F] leading-none">
              ₹{subtotal}
            </span>
          </div>

          {!isDeliveryVerified ? (
            <button
              type="button"
              onClick={openDeliveryGate}
              className="flex-1 py-3 px-4 rounded-full active:scale-95 bg-[#30251F] text-[#FAF7F0] font-serif font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-[#C5A46D]" />
              <span>Verify Delivery</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleWhatsAppCheckout}
              className="flex-1 py-3 px-4 rounded-full bg-[#244438] active:scale-95 text-white font-serif font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <WhatsAppIcon className="w-4 h-4 text-white" />
              <span>Order on WhatsApp</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
