'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LucideIcon } from '@/components/ui/LucideIcon';
import { addToCart } from '@/lib/ecommerce/cart';

interface ProductDetailPageProps {
  slug: string;
}

export default function ProductDetailPage({ slug }: ProductDetailPageProps) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState<string | null>('desc');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const res = await fetch(`/api/ecommerce/products?slug=${slug}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data.product);
          if (data.product?.hasVariants && data.product.variants?.length > 0) {
            setSelectedVariantId(data.product.variants[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0A0A0C] text-white pt-32 pb-24 px-4 sm:px-8 max-w-7xl mx-auto flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-zinc-400 font-bold uppercase tracking-wider">
          <LucideIcon name="Loader2" className="h-5 w-5 animate-spin text-[#E30613]" />
          <span>Loading product details...</span>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-[#0A0A0C] text-white pt-32 pb-24 px-4 sm:px-8 max-w-2xl mx-auto text-center">
        <div className="border border-white/10 rounded-2xl bg-white/5 p-12">
          <LucideIcon name="AlertCircle" className="h-12 w-12 text-[#E30613] mx-auto mb-4" />
          <h1 className="text-2xl font-bold uppercase tracking-tight">Product Not Found</h1>
          <p className="text-zinc-400 text-sm mt-2 mb-6">
            The object you are searching for might have been retired or moved.
          </p>
          <Link
            href="/shop"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#E30613] px-6 text-xs font-black uppercase tracking-wider text-white hover:bg-white hover:text-black transition-colors"
          >
            Return to Shop
          </Link>
        </div>
      </main>
    );
  }

  // Active Variant & Price Resolution
  const activeVariant = product.hasVariants
    ? product.variants.find((v: any) => v.id === selectedVariantId) || product.variants[0]
    : null;

  const currentPrice = activeVariant ? activeVariant.sellingPrice : product.sellingPrice;
  const currentCompareAt = activeVariant ? activeVariant.compareAtPrice : product.compareAtPrice;
  const currentSku = activeVariant ? activeVariant.sku : product.sku;
  const currentStock = activeVariant ? activeVariant.stockQuantity : product.stockQuantity;

  const hasDiscount = currentCompareAt && currentCompareAt > currentPrice;
  const discountPercent = hasDiscount
    ? Math.round(((currentCompareAt - currentPrice) / currentCompareAt) * 100)
    : 0;

  const images = product.images && product.images.length > 0
    ? product.images
    : ['/images/placeholder.jpg'];

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      variantId: activeVariant?.id,
      sku: currentSku,
      title: product.title,
      variantTitle: activeVariant?.title,
      unitPrice: currentPrice,
      quantity,
      image: images[selectedImageIndex] || images[0],
      maxStock: currentStock || 50,
    });

    setToastMessage(`Added ${quantity} × ${product.title} to cart!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    window.location.href = '/checkout';
  };

  const toggleAccordion = (id: string) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  const handleAffiliateClick = () => {
    if (product.affiliateDetails?.affiliateUrl) {
      window.open(
        `/api/ecommerce/affiliate/click?productId=${encodeURIComponent(product.id)}&redirect=true`,
        '_blank',
        'noopener,noreferrer'
      );
    }
  };

  const isAffiliate = product.fulfillmentType === 'AFFILIATE';

  return (
    <main className="min-h-screen bg-[#0A0A0C] text-[#F4F4F5] pt-28 pb-24 px-4 sm:px-6 lg:px-12 relative overflow-hidden">
      {/* Background accents */}
      <div className="morphing-blob absolute top-24 right-1/4 opacity-15 pointer-events-none" />
      <div className="morphing-blob-large absolute bottom-20 left-10 opacity-10 pointer-events-none" />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#E30613] text-white px-5 py-3.5 rounded-xl shadow-2xl font-bold text-xs uppercase tracking-wider animate-slide-up">
          <LucideIcon name="Check" className="h-4 w-4" />
          <span>{toastMessage}</span>
          <Link href="/cart" className="underline font-black ml-2 hover:text-black">
            View Cart
          </Link>
        </div>
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-8">
          <Link href="/" className="hover:text-zinc-300">Home</Link>
          <LucideIcon name="ChevronRight" className="h-3 w-3 text-zinc-600" />
          <Link href="/shop" className="hover:text-zinc-300">Shop</Link>
          <LucideIcon name="ChevronRight" className="h-3 w-3 text-zinc-600" />
          <span className="text-white truncate max-w-xs">{product.title}</span>
        </nav>

        {/* Product Grid */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left: Media Gallery */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Main Featured Image Display */}
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-black/60 border border-white/15 shadow-2xl">
              <img
                src={images[selectedImageIndex] || images[0]}
                alt={product.title}
                className="w-full h-full object-cover object-center transition-all duration-500"
              />
              {hasDiscount && (
                <span className="absolute top-4 left-4 bg-[#E30613] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-md shadow-md">
                  Save {discountPercent}%
                </span>
              )}
            </div>

            {/* Thumbnails Row */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative h-20 w-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      selectedImageIndex === idx
                        ? 'border-[#E30613] opacity-100 scale-102'
                        : 'border-white/15 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Purchasing Details */}
          <div className="lg:col-span-5 flex flex-col">
            {/* Header / SKU / Stock */}
            <div className="border-b border-white/10 pb-6 mb-6">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-zinc-400 mb-2 uppercase tracking-wider">
                <span>SKU: {currentSku}</span>
                <span className="inline-flex items-center gap-1.5 text-emerald-400 text-[11px] font-sans">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  In Stock ({currentStock} available)
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white leading-tight mb-3">
                {product.title}
              </h1>

              {/* Price Banner */}
              <div className="flex items-baseline gap-3 mt-2">
                <span className="text-3xl font-black text-white tracking-tight">
                  ₹{currentPrice}
                </span>
                {hasDiscount && (
                  <span className="text-base font-semibold text-zinc-500 line-through">
                    ₹{currentCompareAt}
                  </span>
                )}
                <span className="text-[10px] uppercase font-bold text-zinc-400 ml-1">
                  {isAffiliate ? '(Reference Price)' : '(Taxes Included)'}
                </span>
              </div>
              {isAffiliate && (
                <p className="mt-3 text-xs leading-relaxed text-zinc-400">
                  Check the latest price and offers on {product.affiliateDetails?.merchantName || 'the partner site'}.
                </p>
              )}
            </div>

            {/* Variant Picker (If variable product) */}
            {!isAffiliate && product.hasVariants && product.variants?.length > 0 && (
              <div className="mb-6 space-y-3">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-300 block">
                  Select Configuration
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {product.variants.map((variant: any) => {
                    const isSelected = selectedVariantId === variant.id;
                    return (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariantId(variant.id)}
                        className={`p-3 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#E30613] bg-[#E30613]/10 text-white shadow-sm'
                            : 'border-white/15 bg-white/5 text-zinc-400 hover:text-white hover:border-white/30'
                        }`}
                      >
                        <div className="uppercase tracking-wider font-extrabold">{variant.title}</div>
                        <div className="text-[11px] text-zinc-400 mt-1">₹{variant.sellingPrice}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            {!isAffiliate && <div className="mb-8 flex items-center gap-4">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
                Quantity:
              </label>
              <div className="flex items-center border border-white/20 rounded-xl bg-white/5 overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-10 w-10 flex items-center justify-center text-zinc-300 hover:bg-white/10 transition-colors"
                >
                  <LucideIcon name="Minus" className="h-3.5 w-3.5" />
                </button>
                <span className="h-10 w-12 flex items-center justify-center text-sm font-black text-white font-mono">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(currentStock || 50, quantity + 1))}
                  className="h-10 w-10 flex items-center justify-center text-zinc-300 hover:bg-white/10 transition-colors"
                >
                  <LucideIcon name="Plus" className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              {isAffiliate ? (
                <a
                  href={`/api/ecommerce/affiliate/click?productId=${encodeURIComponent(product.id)}&redirect=true`}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="flex-1 h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-widest transition-all shadow-lg"
                >
                  <LucideIcon name="ExternalLink" className="h-4 w-4" />
                  <span>{product.affiliateDetails?.buttonText || 'View Deal'} ↗</span>
                </a>
              ) : (
                <>
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 h-12 inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-sm"
                  >
                    <LucideIcon name="ShoppingCart" className="h-4 w-4" />
                    <span>Add to Cart</span>
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-[#E30613] hover:bg-white hover:text-black text-white font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg"
                  >
                    <LucideIcon name="Zap" className="h-4 w-4" />
                    <span>Buy Now</span>
                  </button>
                </>
              )}
            </div>

            {isAffiliate ? (
              <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 mb-8 text-xs leading-relaxed text-amber-100">
                {product.affiliateDetails?.disclaimerText ||
                  'FeelsNeat Curated Partner: When you purchase through links on our site, we may earn an affiliate commission at no extra cost to you. We only recommend products that meet our design and quality standards.'}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3 p-4 rounded-xl border border-white/10 bg-white/5 mb-8 text-center">
                <div>
                  <LucideIcon name="ShieldCheck" className="h-5 w-5 text-[#E30613] mx-auto mb-1" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 block">Verified Quality</span>
                </div>
                <div>
                  <LucideIcon name="Truck" className="h-5 w-5 text-[#E30613] mx-auto mb-1" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 block">Express Delivery</span>
                </div>
                <div>
                  <LucideIcon name="RotateCcw" className="h-5 w-5 text-[#E30613] mx-auto mb-1" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 block">7-Day Return</span>
                </div>
              </div>
            )}

            {/* Accordions */}
            <div className="border-t border-white/10 divide-y divide-white/10">
              {/* Description */}
              <div>
                <button
                  onClick={() => toggleAccordion('desc')}
                  className="w-full py-4 flex items-center justify-between text-xs font-black uppercase tracking-wider text-white hover:text-[#E30613] transition-colors"
                >
                  <span>Description & Details</span>
                  <LucideIcon
                    name={activeAccordion === 'desc' ? 'ChevronUp' : 'ChevronDown'}
                    className="h-4 w-4"
                  />
                </button>
                {activeAccordion === 'desc' && (
                  <div className="pb-6 text-sm text-zinc-400 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </div>
                )}
              </div>

              {/* Dimensions */}
              {product.dimensions && (
                <div>
                  <button
                    onClick={() => toggleAccordion('dims')}
                    className="w-full py-4 flex items-center justify-between text-xs font-black uppercase tracking-wider text-white hover:text-[#E30613] transition-colors"
                  >
                    <span>Dimensions & Weight</span>
                    <LucideIcon
                      name={activeAccordion === 'dims' ? 'ChevronUp' : 'ChevronDown'}
                      className="h-4 w-4"
                    />
                  </button>
                  {activeAccordion === 'dims' && (
                    <div className="pb-6 text-xs text-zinc-400 space-y-1.5 font-mono">
                      <div>Length: {product.dimensions.lengthCm} cm</div>
                      <div>Width: {product.dimensions.widthCm} cm</div>
                      <div>Height: {product.dimensions.heightCm} cm</div>
                      {product.weightGrams && <div>Weight: {product.weightGrams} grams</div>}
                    </div>
                  )}
                </div>
              )}

              {/* Shipping & Delivery */}
              {!isAffiliate && <div>
                <button
                  onClick={() => toggleAccordion('ship')}
                  className="w-full py-4 flex items-center justify-between text-xs font-black uppercase tracking-wider text-white hover:text-[#E30613] transition-colors"
                >
                  <span>Shipping & Fulfillment</span>
                  <LucideIcon
                    name={activeAccordion === 'ship' ? 'ChevronUp' : 'ChevronDown'}
                    className="h-4 w-4"
                  />
                </button>
                {activeAccordion === 'ship' && (
                  <div className="pb-6 text-xs text-zinc-400 space-y-2 leading-relaxed">
                    <p>
                      • Orders are dispatched within 24-48 business hours with live courier tracking.
                    </p>
                    <p>
                      • Free shipping across India on orders above ₹999.
                    </p>
                    <p>
                      • Standard domestic transit time is 3-6 business days depending on location.
                    </p>
                  </div>
                )}
              </div>}

              {/* Returns & Exchange */}
              {!isAffiliate && <div>
                <button
                  onClick={() => toggleAccordion('returns')}
                  className="w-full py-4 flex items-center justify-between text-xs font-black uppercase tracking-wider text-white hover:text-[#E30613] transition-colors"
                >
                  <span>Returns & Guarantee</span>
                  <LucideIcon
                    name={activeAccordion === 'returns' ? 'ChevronUp' : 'ChevronDown'}
                    className="h-4 w-4"
                  />
                </button>
                {activeAccordion === 'returns' && (
                  <div className="pb-6 text-xs text-zinc-400 space-y-2 leading-relaxed">
                    <p>
                      • FeelsNeat offers a 7-day replacement guarantee for any manufacturing defects or transit damage.
                    </p>
                    <p>
                      • To initiate a return, reach out to support with your Order ID.
                    </p>
                  </div>
                )}
              </div>}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
