import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Clock,
  Heart,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from 'lucide-react';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { SEO } from '../components/common/SEO';
import { ProductCard } from '../components/products/ProductCard';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { WhatsAppIcon } from '../components/common/WhatsAppIcon';
import { getProductionUrl } from '../utils/seo';
import { getWeightPrice } from '../utils/productPricing';
import { CAKE_FLAVOURS } from '../data/cakeFlavours';
import { useDeliveryAvailability } from '../context/DeliveryContext';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { products, settings } = useStore();
  const { addToCart, generateSingleProductWhatsAppUrl, totalQuantity } = useCart();
  const { openDeliveryGate, verifiedLocation } = useDeliveryAvailability();

  const product = useMemo(() => {
    return products.find((p) => p.slug === slug || p.id === slug);
  }, [products, slug]);

  const isCake = product?.categoryId === 'cat-cakes' || product?.categorySlug === 'cakes';

  const [activeImage, setActiveImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedWeight, setSelectedWeight] = useState<string | undefined>(undefined);
  const [selectedFlavour, setSelectedFlavour] = useState<string | undefined>(undefined);
  const [customMessage, setCustomMessage] = useState<string>('');

  // Sync initial state when product loads
  React.useEffect(() => {
    if (product) {
      setActiveImage(product.images?.[0] || '');
      setSelectedWeight(product.weightOptions?.[0]);
      setSelectedFlavour(undefined);
      setQuantity(1);
      setCustomMessage('');
    }
  }, [product]);

  const currentPricing = useMemo(() => {
    if (!product) return { price: 0 };
    return getWeightPrice(product, selectedWeight);
  }, [product, selectedWeight]);

  if (!product) {
    return (
      <div className="min-h-[60vh] bg-[#FAF7F0] flex flex-col items-center justify-center p-6 text-center text-[#30251F]">
        <h2 className="font-serif text-3xl font-bold text-[#30251F] mb-2">Creation Not Found</h2>
        <p className="text-[#81776C] mb-6">The item you are searching for is no longer available in our boutique.</p>
        <Link
          to="/shop"
          className="btn-editorial-primary px-6 py-3 rounded-full text-xs font-semibold"
        >
          Explore All Products
        </Link>
      </div>
    );
  }

  const discountPercent =
    currentPricing.oldPrice && currentPricing.oldPrice > currentPricing.price
      ? Math.round(((currentPricing.oldPrice - currentPricing.price) / currentPricing.oldPrice) * 100)
      : 0;

  const handleAddToCart = () => {
    if (!product.available || (product.allowFlavourSelection && !selectedFlavour)) return;
    addToCart(product, quantity, selectedWeight, customMessage, currentPricing.price, selectedFlavour);
  };

  const directWhatsAppUrl = generateSingleProductWhatsAppUrl(
    product,
    settings,
    quantity,
    selectedWeight,
    customMessage,
    currentPricing.price,
    selectedFlavour
  );

  // Related products from same category
  const relatedProducts = products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4);

  const productUrl = getProductionUrl(`/product/${product.slug}`);
  const productImages = product.images.map((image) => (image.startsWith('/') ? getProductionUrl(image) : image));
  const mainImage = activeImage || product.images[0] || '/social-share-1200x630.jpg';
  const productKeywords = [
    `${product.name.toLowerCase()} noida`,
    `order ${product.name.toLowerCase()} sector 76 noida`,
    `${product.name.toLowerCase()} price`,
    ...(isCake ? ['eggless cake delivery sector 76 noida', 'birthday cake delivery noida'] : []),
    `fresh ${product.categoryName?.toLowerCase() || 'products'} delivery noida`,
    'cakes n more noida',
  ].join(', ');

  const productSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        url: productUrl,
        name: product.name,
        image: productImages,
        description: product.description,
        sku: product.id,
        brand: { '@type': 'Brand', name: 'Cakes N More' },
        itemCondition: 'https://schema.org/NewCondition',
        offers: {
          '@type': 'Offer',
          url: productUrl,
          priceCurrency: 'INR',
          price: currentPricing.price,
          availability: product.available
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          itemCondition: 'https://schema.org/NewCondition',
          seller: {
            '@type': 'Organization',
            '@id': `${getProductionUrl('/')}#localbusiness`,
            name: 'Cakes N More',
            url: getProductionUrl('/'),
          },
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: getProductionUrl('/') },
          { '@type': 'ListItem', position: 2, name: 'Shop', item: getProductionUrl('/shop') },
          ...(product.categorySlug
            ? [{ '@type': 'ListItem', position: 3, name: product.categoryName || 'Category', item: getProductionUrl(`/category/${product.categorySlug}`) }]
            : []),
          { '@type': 'ListItem', position: product.categorySlug ? 4 : 3, name: product.name, item: productUrl },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#30251F] pt-4 pb-36 sm:py-16">
      <SEO
        title={`${product.name} | Cakes N More, Sector 76 Noida`}
        description={
          isCake
            ? `Order ${product.name}, a freshly prepared 100% eggless cake from Cakes N More in Sector 76, Noida. View prices, choose options, and check delivery availability.`
            : `Order ${product.name} from Cakes N More in Sector 76, Noida. View product details, check delivery availability, and place your order via WhatsApp.`
        }
        keywords={productKeywords}
        image={product.images?.[0]}
        imageAlt={`${product.name} ${isCake ? 'eggless cake' : 'product'} from Cakes N More, Sector 76 Noida`}
        schema={productSchema}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: 'Shop', path: '/shop' },
            ...(product.categorySlug && product.categoryName
              ? [{ label: product.categoryName, path: `/category/${product.categorySlug}` }]
              : []),
            { label: product.name },
          ]}
        />
        
        {/* Product Showcase Grid */}
        <div className="mb-16 rounded-3xl border border-[#E8E2D5] bg-white p-3 shadow-xs sm:p-7 lg:p-8">
          <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-12 lg:gap-10">
            
            {/* Gallery Column (6 cols) */}
            <div className="min-w-0 space-y-4 lg:col-span-7">
              {/* Primary Image View */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-[#E8E2D5] bg-[#FAF7F0] shadow-inner sm:aspect-[5/4] lg:aspect-[4/3]">
                <img
                  src={mainImage}
                  alt={`${product.name} - ${isCake ? '100% eggless cake' : product.categoryName || 'product'} from Cakes N More Sector 76 Noida`}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  width={600}
                  height={600}
                  className="w-full h-full object-cover transition-all duration-300"
                />

                {discountPercent > 0 && (
                  <span className="absolute top-4 left-4 bg-[#E8CECB] text-[#30251F] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md shadow-sm">
                    {discountPercent}% OFF
                  </span>
                )}

                {!product.available && (
                  <div className="absolute inset-0 bg-[#30251F]/60 backdrop-blur-sm flex items-center justify-center">
                    <span className="bg-[#FAF7F0] text-[#30251F] border border-[#E8E2D5] font-serif font-bold text-sm px-5 py-2.5 rounded-full uppercase tracking-wider shadow-lg">
                      Sold Out
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnails row */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImage(img)}
                      aria-label={`View ${product.name} photo ${idx + 1}`}
                      className={`w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                        activeImage === img
                          ? 'border-[#30251F] scale-105 shadow-sm'
                          : 'border-[#E8E2D5] opacity-60 hover:opacity-100 hover:border-[#C5A46D]'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} photo ${idx + 1}`}
                        loading="lazy"
                        decoding="async"
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details & Selection Column (6 cols) */}
            <div className="flex min-w-0 flex-col justify-between space-y-6 rounded-3xl border border-[#E8E2D5] bg-[#FAF7F0] p-5 sm:p-7 lg:sticky lg:top-28 lg:col-span-5 lg:self-start lg:p-8">
              <div>
                {/* Category & Availability Badge */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-bold text-[#C5A46D] uppercase tracking-[0.18em]">
                    {product.categoryName || 'Catalogue'}
                  </span>
                  <span className="text-[#E8E2D5]">•</span>
                  {product.available ? (
                    <span className="text-xs bg-[#244438]/10 text-[#244438] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border border-[#244438]/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#244438] inline-block" />
                      Available to order
                    </span>
                  ) : (
                    <span className="text-xs bg-[#FAF7F0] text-[#81776C] font-semibold px-2.5 py-0.5 rounded-full border border-[#E8E2D5]">
                      Currently Unavailable
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#30251F] tracking-tight leading-snug">
                  {product.name}
                </h1>

                {/* Price Display */}
                <div className="flex items-baseline gap-3 mt-3">
                  <span className="font-serif text-3xl sm:text-4xl font-bold text-[#30251F]">₹{currentPricing.price}</span>
                  {currentPricing.oldPrice && currentPricing.oldPrice > currentPricing.price && (
                    <>
                      <span className="text-base text-[#81776C] line-through">₹{currentPricing.oldPrice}</span>
                      <span className="text-xs bg-[#E8CECB] text-[#30251F] font-bold px-2.5 py-0.5 rounded-md">
                        Save ₹{currentPricing.oldPrice - currentPricing.price}
                      </span>
                    </>
                  )}
                </div>

                {/* 100% Eggless Vegetarian Guarantee */}
                {isCake && (
                  <div className="mt-3.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#244438]/10 border border-[#244438]/20 text-[#244438] text-xs font-semibold">
                    <span className="w-3.5 h-3.5 border border-[#244438] p-0.5 flex items-center justify-center rounded-[2px] bg-transparent shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#244438]"></span>
                    </span>
                    <span>100% Eggless • Pure Vegetarian Patisserie</span>
                  </div>
                )}

                {/* Description */}
                <div className="mt-4 pt-4 border-t border-[#E8E2D5]">
                  <p className="text-sm text-[#81776C] leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Weight Options */}
                {product.weightOptions && product.weightOptions.length > 0 && (
                  <div className="mt-5">
                    <label className="block text-[11px] font-bold text-[#81776C] uppercase tracking-[0.14em] mb-2">
                      Select Size / Weight
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {product.weightOptions.map((weight) => {
                        const wp = getWeightPrice(product, weight);
                        const hasCustomRate = Boolean(product.weightPrices && product.weightPrices.length > 0);
                        return (
                          <button
                            key={weight}
                            type="button"
                            onClick={() => setSelectedWeight(weight)}
                            className={`px-4 py-2 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 cursor-pointer ${
                              selectedWeight === weight
                                ? 'bg-[#30251F] text-[#FAF7F0] border-[#30251F] shadow-sm'
                                : 'bg-[#FAF7F0] text-[#81776C] border border-[#E8E2D5] hover:border-[#30251F] hover:text-[#30251F]'
                            }`}
                          >
                            <span>{weight}</span>
                            {hasCustomRate && (
                              <span className={`text-[11px] font-semibold ${selectedWeight === weight ? 'text-[#FAF7F0]/80' : 'text-[#81776C]'}`}>
                                (₹{wp.price})
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {product.allowFlavourSelection && (
                  <div className="mt-5">
                    <label htmlFor="cake-flavour" className="block text-[11px] font-bold text-[#81776C] uppercase tracking-[0.14em] mb-2">
                      Select Cake Flavour *
                    </label>
                    <select
                      id="cake-flavour"
                      required
                      value={selectedFlavour || ''}
                      onChange={(event) => setSelectedFlavour(event.target.value || undefined)}
                      className="w-full px-4 py-2.5 bg-[#FAF7F0] border border-[#E8E2D5] text-[#30251F] rounded-xl text-sm focus:border-[#30251F] focus:ring-1 focus:ring-[#30251F] focus:outline-none cursor-pointer"
                    >
                      <option value="" disabled className="bg-white">Choose an artisanal flavour</option>
                      {CAKE_FLAVOURS.map((flavour) => (
                        <option key={flavour} value={flavour} className="bg-white">{flavour}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Custom Message on Cake / Card */}
                {product.allowCustomMessage && (
                  <div className="mt-5">
                    <label className="block text-[11px] font-bold text-[#81776C] uppercase tracking-[0.14em] mb-1.5">
                      Custom Inscription or Card Note (Complimentary)
                    </label>
                    <input
                      type="text"
                      maxLength={100}
                      placeholder={product.customMessagePlaceholder || 'E.g., Happy 25th Anniversary Mom & Dad!'}
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#FAF7F0] border border-[#E8E2D5] text-[#30251F] placeholder-[#81776C]/60 rounded-xl text-sm focus:border-[#30251F] focus:ring-1 focus:ring-[#30251F] focus:outline-none"
                    />
                    <p className="text-[11px] text-[#81776C] mt-1">
                      Our pastry artists will hand-pipe this onto a fine chocolate plaque or write it on our complimentary gift card.
                    </p>
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="mt-6 flex items-center gap-4">
                  <span className="text-[11px] font-bold text-[#81776C] uppercase tracking-[0.14em]">Quantity</span>
                  <div className="flex items-center border border-[#E8E2D5] rounded-full bg-[#FAF7F0] px-1">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-2 text-[#81776C] hover:text-[#30251F] transition-colors cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-4 text-sm font-semibold text-[#30251F]">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                      className="p-2 text-[#81776C] hover:text-[#30251F] transition-colors cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-[#E8E2D5] space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Add to Cart */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!product.available || (product.allowFlavourSelection && !selectedFlavour)}
                    className="w-full py-4 px-6 rounded-full bg-[#30251F] hover:bg-[#201814] text-[#FAF7F0] font-serif text-sm font-bold tracking-wide flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag (₹{currentPricing.price * quantity})</span>
                  </button>

                  {/* Order on WhatsApp Prominent Button */}
                  <a
                    href={product.available ? directWhatsAppUrl : undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-disabled={!product.available || (product.allowFlavourSelection && !selectedFlavour)}
                    onClick={(event) => {
                      if (!product.available || (product.allowFlavourSelection && !selectedFlavour)) event.preventDefault();
                    }}
                    className={`w-full py-4 px-6 rounded-full font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 ${
                      product.available && (!product.allowFlavourSelection || selectedFlavour)
                        ? 'bg-[#244438] hover:bg-[#1a3229] text-white cursor-pointer'
                        : 'bg-[#E8E2D5] text-[#81776C] cursor-not-allowed'
                    }`}
                  >
                    <WhatsAppIcon className="w-4 h-4 text-white" />
                    <span>{!product.available ? 'Currently Unavailable' : product.allowFlavourSelection && !selectedFlavour ? 'Select a Flavour to Order' : 'WhatsApp Concierge'}</span>
                  </a>
                </div>

                {/* Delivery Notes & Trust info */}
                  <div className="mt-4 grid grid-cols-1 gap-3 rounded-2xl border border-[#E8E2D5] bg-white p-4 text-xs text-[#81776C] sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={openDeliveryGate}
                      className="flex min-h-10 items-center gap-2 text-left transition-colors hover:text-[#30251F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A46D]"
                    >
                      <Truck className="h-4 w-4 shrink-0 text-[#30251F]" />
                      <span>
                        {verifiedLocation?.verified
                          ? 'Delivery address verified'
                          : 'Check delivery eligibility'}
                      </span>
                    </button>
                    {isCake && (
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 shrink-0 text-[#C5A46D]" />
                        <span>100% Eggless Pure Veg</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0 text-[#244438]" />
                      <span>Boutique Pickup: Shop 29</span>
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products from same category */}
        {relatedProducts.length > 0 && (
          <section className="pt-6">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#E8E2D5]">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#30251F]">
                More from {product.categoryName || 'This Collection'}
              </h2>
              <Link
                to={`/category/${product.categorySlug || 'cakes'}`}
                className="text-xs sm:text-sm font-semibold text-[#30251F] hover:text-[#C5A46D] hover:underline"
              >
                View Collection →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sticky Mobile Purchase Action Bar */}
      <div
        className={`fixed inset-x-0 z-30 border-t border-[#E8E2D5] bg-white/95 p-2.5 text-[#30251F] shadow-lg backdrop-blur-xl lg:hidden sm:p-3 ${
          totalQuantity > 0
            ? 'bottom-[calc(8.25rem+env(safe-area-inset-bottom,0px))]'
            : 'bottom-[calc(56px+max(0.6rem,env(safe-area-inset-bottom,0px)))]'
        }`}
      >
        <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
          <div className="flex flex-col shrink-0">
            <span className="text-[10px] uppercase font-bold text-[#81776C]">Total Price</span>
            <span className="font-serif text-lg font-bold text-[#30251F] leading-none">
              ₹{currentPricing.price * quantity}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-grow justify-end">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!product.available || (product.allowFlavourSelection && !selectedFlavour)}
              className="flex min-h-12 flex-1 items-center justify-center gap-1.5 rounded-full bg-[#30251F] px-3 py-2.5 font-serif text-xs font-bold text-[#FAF7F0] transition-all active:scale-95 disabled:opacity-50"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add to Bag</span>
            </button>

            <a
              href={product.available ? directWhatsAppUrl : undefined}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!product.available || (product.allowFlavourSelection && !selectedFlavour)}
              onClick={(event) => {
                if (!product.available || (product.allowFlavourSelection && !selectedFlavour)) event.preventDefault();
              }}
              className={`flex min-h-12 items-center justify-center gap-1.5 rounded-full px-3.5 py-2.5 text-xs font-semibold text-white transition-all ${
                product.available && (!product.allowFlavourSelection || selectedFlavour)
                  ? 'bg-[#244438] active:scale-95 cursor-pointer'
                  : 'bg-[#E8E2D5] text-[#81776C] cursor-not-allowed'
              }`}
            >
              <WhatsAppIcon className="w-3.5 h-3.5 text-white" />
              <span>{!product.available ? 'Unavailable' : product.allowFlavourSelection && !selectedFlavour ? 'Choose Flavour' : 'WhatsApp'}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
