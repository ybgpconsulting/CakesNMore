import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clock,
  Heart,
  Home,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { ProductCard } from '../components/products/ProductCard';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { WhatsAppIcon } from '../components/common/WhatsAppIcon';
import { getProductionUrl } from '../utils/seo';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { products, settings } = useStore();
  const { addToCart, generateSingleProductWhatsAppUrl } = useCart();

  const product = useMemo(() => {
    return products.find((p) => p.slug === slug || p.id === slug);
  }, [products, slug]);

  const isCake = product?.categoryId === 'cat-cakes' || product?.categorySlug === 'cakes';

  const [activeImage, setActiveImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedWeight, setSelectedWeight] = useState<string | undefined>(undefined);
  const [customMessage, setCustomMessage] = useState<string>('');

  // Sync initial state when product loads
  React.useEffect(() => {
    if (product) {
      setActiveImage(product.images?.[0] || '');
      setSelectedWeight(product.weightOptions?.[0]);
      setQuantity(1);
      setCustomMessage('');
    }
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="font-serif text-3xl font-bold text-gray-900 mb-2">Product Not Found</h2>
        <p className="text-gray-500 mb-6">The item you are searching for is no longer available.</p>
        <Link
          to="/shop"
          className="px-6 py-3 rounded-xl bg-[#831843] text-white font-bold text-sm shadow hover:bg-[#6b1336]"
        >
          Explore All Products
        </Link>
      </div>
    );
  }

  const discountPercent =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 0;

  const handleAddToCart = () => {
    if (!product.available) return;
    addToCart(product, quantity, selectedWeight, customMessage);
  };

  const directWhatsAppUrl = generateSingleProductWhatsAppUrl(
    product,
    settings,
    quantity,
    selectedWeight,
    customMessage
  );

  // Related products from same category
  const relatedProducts = products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4);

  const productUrl = getProductionUrl(`/product/${product.slug}`);
  const productImages = product.images.map((image) => (image.startsWith('/') ? getProductionUrl(image) : image));
  const productKeywords = [
    `${product.name.toLowerCase()} noida`,
    `order ${product.name.toLowerCase()} sector 76 noida`,
    `${product.name.toLowerCase()} price`,
    `eggless ${product.name.toLowerCase()}`,
    `online ${product.name.toLowerCase()} delivery noida`,
    `fresh ${product.categoryName?.toLowerCase() || 'cakes'} sector 76 noida`,
    'midnight cake delivery noida',
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
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          reviewCount: '48',
          bestRating: '5',
          worstRating: '1',
        },
        offers: {
          '@type': 'Offer',
          url: productUrl,
          priceCurrency: 'INR',
          price: product.price,
          availability: product.available
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          seller: {
            '@type': 'LocalBusiness',
            name: 'Cakes N More',
            url: getProductionUrl('/'),
          },
          hasMerchantReturnPolicy: {
            '@type': 'MerchantReturnPolicy',
            applicableCountry: 'IN',
            merchantReturnLink: getProductionUrl('/returns-policy'),
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
    <div className="min-h-screen bg-[#FAF8F5] pt-4 pb-36 sm:py-12">
      <SEO
        title={`${product.name} in Sector 76 Noida | Cakes N More`}
        description={`Order ${product.name} freshly prepared in Sector 76 Noida. ₹${product.price}. Same-day delivery, personalized message options, and fast WhatsApp order confirmation.`}
        keywords={productKeywords}
        image={product.images?.[0]}
        schema={productSchema}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6 flex-wrap" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-gray-800 flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <Link to="/shop" className="hover:text-gray-800">
            Shop
          </Link>
          {product.categorySlug && (
            <>
              <ChevronRight className="w-3 h-3 text-gray-400" />
              <Link to={`/category/${product.categorySlug}`} className="hover:text-gray-800">
                {product.categoryName}
              </Link>
            </>
          )}
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="text-gray-900 font-semibold truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product Showcase Grid */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#EADBDA] shadow-sm mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Gallery Column (5 cols) */}
            <div className="lg:col-span-6 space-y-4">
              {/* Primary Image View with zoom feel */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#FAF8F5] border border-gray-100 shadow-inner">
                <img
                  src={activeImage || product.images?.[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />

                {discountPercent > 0 && (
                  <span className="absolute top-4 left-4 bg-[#831843] text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-lg shadow">
                    {discountPercent}% OFF
                  </span>
                )}

                {!product.available && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <span className="bg-white text-gray-900 font-bold text-sm px-4 py-2 rounded-full uppercase tracking-wider shadow">
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
                      className={`w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                        activeImage === img
                          ? 'border-[#831843] scale-105 shadow-sm'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details & Selection Column (6 cols) */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
              <div>
                {/* Category & Availability Badge */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-[#831843] uppercase tracking-wider">
                    {product.categoryName || 'Catalogue'}
                  </span>
                  <span className="text-gray-300">•</span>
                  {product.available ? (
                    <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      In Stock for Sector 76
                    </span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-600 font-semibold px-2.5 py-0.5 rounded-full">
                      Currently Unavailable
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#29141B] tracking-tight leading-snug">
                  {product.name}
                </h1>

                {/* Price Display */}
                <div className="flex items-baseline gap-3 mt-3">
                  <span className="text-3xl font-extrabold text-gray-950">₹{product.price}</span>
                  {product.oldPrice && product.oldPrice > product.price && (
                    <>
                      <span className="text-base text-gray-400 line-through">₹{product.oldPrice}</span>
                      <span className="text-xs bg-[#FCE7F3] text-[#831843] font-bold px-2 py-0.5 rounded">
                        Save ₹{product.oldPrice - product.price}
                      </span>
                    </>
                  )}
                </div>

                {/* 100% Eggless Vegetarian Guarantee */}
                {isCake && <div className="mt-3.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs">
                    <span className="w-3.5 h-3.5 border-2 border-emerald-700 p-0.5 flex items-center justify-center rounded-xs bg-white shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-700"></span>
                    </span>
                    <span>100% Eggless • Pure Vegetarian Bakery</span>
                </div>}

                {/* Description */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Weight Options */}
                {product.weightOptions && product.weightOptions.length > 0 && (
                  <div className="mt-5">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Select Size / Weight
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {product.weightOptions.map((weight) => (
                        <button
                          key={weight}
                          type="button"
                          onClick={() => setSelectedWeight(weight)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                            selectedWeight === weight
                              ? 'bg-[#831843] text-white border-[#831843] shadow-sm'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          {weight}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Message on Cake / Card */}
                {product.allowCustomMessage && (
                  <div className="mt-5">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Message on Cake or Greeting Card (Free)
                    </label>
                    <input
                      type="text"
                      maxLength={100}
                      placeholder={product.customMessagePlaceholder || 'E.g., Happy 25th Anniversary Mom & Dad!'}
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#831843] focus:outline-none"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                      Our pastry artists will hand-pipe this onto the chocolate tag or calligraph on the complimentary gift card.
                    </p>
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="mt-6 flex items-center gap-4">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Quantity</span>
                  <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-2 text-gray-600 hover:text-gray-900"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 text-sm font-bold text-gray-900">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                      className="p-2 text-gray-600 hover:text-gray-900"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-gray-100 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Add to Cart */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!product.available}
                    className="w-full py-4 px-6 rounded-2xl bg-[#831843] hover:bg-[#6b1336] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span>Add to Cart (₹{product.price * quantity})</span>
                  </button>

                  {/* Order on WhatsApp Prominent Button */}
                  <a
                    href={product.available ? directWhatsAppUrl : undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-disabled={!product.available}
                    onClick={(event) => {
                      if (!product.available) event.preventDefault();
                    }}
                    className={`w-full py-4 px-6 rounded-2xl text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 ${
                      product.available ? 'bg-[#25D366] hover:bg-[#20bd5a]' : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    <WhatsAppIcon className="w-5 h-5" />
                    <span>{product.available ? 'Order on WhatsApp' : 'Currently Unavailable'}</span>
                  </a>
                </div>

                {/* Delivery Notes & Trust info */}
                <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#EADBDA] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-600 mt-4">
                  {isCake && <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#831843] shrink-0" />
                    <span>Same-Day Sector 76 Delivery</span>
                  </div>}
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#831843] shrink-0" />
                    <span>100% Eggless Fresh Bake</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#831843] shrink-0" />
                    <span>Store Pickup: Shop 29</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products from same category */}
        {relatedProducts.length > 0 && (
          <section className="pt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#29141B]">
                More from {product.categoryName || 'This Collection'}
              </h2>
              <Link
                to={`/category/${product.categorySlug || 'cakes'}`}
                className="text-xs sm:text-sm font-bold text-[#831843] hover:underline"
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
      <div className="lg:hidden fixed bottom-[calc(56px+max(0.4rem,env(safe-area-inset-bottom,0px)))] inset-x-0 bg-white/98 backdrop-blur-md border-t border-[#EADBDA] p-3 shadow-[0_-6px_25px_rgba(0,0,0,0.08)] z-30">
        <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
          <div className="flex flex-col shrink-0">
            <span className="text-[10px] uppercase font-bold text-gray-400">Total Price</span>
            <span className="text-lg font-extrabold text-[#831843] leading-none">
              ₹{product.price * quantity}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-grow justify-end">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!product.available}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#831843] hover:bg-[#6b1336] active:scale-95 text-white font-bold text-xs shadow flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>

            <a
              href={product.available ? directWhatsAppUrl : undefined}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!product.available}
              onClick={(event) => {
                if (!product.available) event.preventDefault();
              }}
              className={`py-2.5 px-3.5 rounded-xl text-white font-bold text-xs shadow flex items-center justify-center gap-1.5 transition-all ${
                product.available ? 'bg-[#25D366] hover:bg-[#20bd5a] active:scale-95' : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>{product.available ? 'WhatsApp' : 'Unavailable'}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
