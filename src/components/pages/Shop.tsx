'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LucideIcon } from '@/components/ui/LucideIcon';
import { addToCart } from '@/lib/ecommerce/cart';

interface ShopPageProps {
  initialCategory?: string;
  initialCollection?: string;
}

export default function ShopPage({ initialCategory, initialCollection }: ShopPageProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedCollection, setSelectedCollection] = useState<string>(initialCollection || 'all');
  const [selectedType, setSelectedType] = useState<'all' | 'dropship' | 'affiliate'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'featured' | 'price_asc' | 'price_desc'>('featured');
  const [addedToast, setAddedToast] = useState<string | null>(null);

  useEffect(() => {
    async function loadShopData() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory !== 'all') params.set('category', selectedCategory);
        if (selectedCollection !== 'all') params.set('collection', selectedCollection);
        if (selectedType !== 'all') params.set('type', selectedType);
        if (searchQuery.trim()) params.set('search', searchQuery.trim());
        if (sortOption !== 'featured') params.set('sort', sortOption);

        const res = await fetch(`/api/ecommerce/products?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
          if (data.categories) setCategories(data.categories);
          if (data.collections) setCollections(data.collections);
        }
      } catch (err) {
        console.error('Failed to load shop catalog:', err);
      } finally {
        setLoading(false);
      }
    }

    loadShopData();
  }, [selectedCategory, selectedCollection, selectedType, searchQuery, sortOption]);

  const handleQuickAdd = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If product has variants, send to product details
    if (product.hasVariants && product.variants?.length > 0) {
      window.location.href = `/shop/product/${product.slug}`;
      return;
    }

    addToCart({
      productId: product.id,
      sku: product.sku,
      title: product.title,
      unitPrice: product.sellingPrice,
      quantity: 1,
      image: product.images[0] || '',
      maxStock: product.stockQuantity || 50,
    });

    setAddedToast(`Added "${product.title}" to cart!`);
    setTimeout(() => setAddedToast(null), 2500);
  };

  const handleAffiliateClick = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.affiliateDetails?.affiliateUrl) {
      window.open(
        `/api/ecommerce/affiliate/click?productId=${encodeURIComponent(product.id)}&redirect=true`,
        '_blank',
        'noopener,noreferrer'
      );
    } else {
      window.location.href = `/shop/product/${product.slug}`;
    }
  };

  return (
    <main className="min-h-screen bg-[#0A0A0C] text-[#F4F4F5] pt-28 pb-24 px-4 sm:px-6 lg:px-12 relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="morphing-blob absolute top-20 left-1/4 opacity-15 pointer-events-none" />
      <div className="morphing-blob-large absolute bottom-10 right-10 opacity-10 pointer-events-none" />

      {/* Floating toast notification */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#E30613] text-white px-5 py-3 rounded-xl shadow-2xl font-bold text-xs uppercase tracking-wider animate-slide-up">
          <LucideIcon name="Check" className="h-4 w-4" />
          <span>{addedToast}</span>
          <Link href="/cart" className="underline font-black ml-2 hover:text-black">
            View Cart
          </Link>
        </div>
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Title Section */}
        <div className="border-b border-white/10 pb-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-[#E30613]" />
              <span className="text-[10px] font-black tracking-widest text-[#E30613] uppercase">
                FeelsNeat Curated Objects
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white">
              The Shop
            </h1>
            <p className="text-sm text-zinc-400 mt-2 max-w-xl">
              Minimalist design objects, ambient wireless lighting, and tactile workspace essentials engineered for calm focus.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/track"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white transition-colors"
            >
              <LucideIcon name="Truck" className="h-3.5 w-3.5 text-[#E30613]" />
              <span>Track Order</span>
            </Link>
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#E30613] hover:bg-white hover:text-black text-xs font-black uppercase tracking-wider text-white transition-colors shadow-sm"
            >
              <LucideIcon name="ShoppingBag" className="h-3.5 w-3.5" />
              <span>Open Cart</span>
            </Link>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="space-y-6 mb-12">
          {/* Search bar & Sorting */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-md">
              <LucideIcon
                name="Search"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400"
              />
              <input
                type="text"
                placeholder="Search products, lighting, desk mats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/15 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#E30613] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  <LucideIcon name="X" className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Sorting Select */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap">
                Sort By:
              </span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
                className="h-11 px-3 rounded-xl bg-white/5 border border-white/15 text-xs font-bold uppercase tracking-wider text-white focus:outline-none focus:border-[#E30613] cursor-pointer"
              >
                <option value="featured" className="bg-[#0A0A0C]">Featured</option>
                <option value="price_asc" className="bg-[#0A0A0C]">Price: Low to High</option>
                <option value="price_desc" className="bg-[#0A0A0C]">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Product Type Toggle */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#E30613] mr-2 whitespace-nowrap">Browse:</span>
            {(['all', 'dropship', 'affiliate'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  selectedType === type
                    ? 'bg-[#E30613] text-white shadow-sm'
                    : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                }`}
              >
                {type === 'all' ? 'All Items' : type === 'dropship' ? 'FeelsNeat Fulfilled' : 'Curated Partner Deals'}
              </button>
            ))}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-white text-black shadow-sm'
                  : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat.slug
                    ? 'bg-white text-black shadow-sm'
                    : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Collection Tabs */}
          {collections.length > 0 && (
            <div className="flex items-center gap-2 border-t border-white/5 pt-4 overflow-x-auto pb-2 scrollbar-none">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#E30613] mr-2 whitespace-nowrap">
                Collections:
              </span>
              <button
                onClick={() => setSelectedCollection('all')}
                className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCollection === 'all'
                    ? 'bg-[#E30613] text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                All
              </button>
              {collections.map((col) => (
                <button
                  key={col.id}
                  onClick={() => setSelectedCollection(col.slug)}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap cursor-pointer ${
                    selectedCollection === col.slug
                      ? 'bg-[#E30613] text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {col.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 animate-pulse h-96"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-white/15 rounded-2xl bg-white/5">
            <LucideIcon name="Package" className="h-10 w-10 text-zinc-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold uppercase tracking-wider text-white">
              No products found
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Try adjusting your category filters or search terms.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedCollection('all');
                setSearchQuery('');
              }}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold uppercase tracking-wider text-white transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => {
              const hasDiscount =
                product.compareAtPrice && product.compareAtPrice > product.sellingPrice;
              const discountPercent = hasDiscount
                ? Math.round(
                    ((product.compareAtPrice - product.sellingPrice) /
                      product.compareAtPrice) *
                      100
                  )
                : 0;

              return (
                <div
                  key={product.id}
                  className="group rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-[#E30613]/50 transition-all duration-300 p-5 flex flex-col relative overflow-hidden shadow-sm hover:shadow-xl"
                >
                  {/* Image Container with Badges */}
                  <Link
                    href={`/shop/product/${product.slug}`}
                    className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-black/40 border border-white/10 mb-5 block group"
                  >
                    {product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        <LucideIcon name="Image" className="h-10 w-10" />
                      </div>
                    )}

                    {/* Discount badge (dropship only) */}
                    {hasDiscount && product.fulfillmentType !== 'AFFILIATE' && (
                      <span className="absolute top-3 left-3 bg-[#E30613] text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-md">
                        Save {discountPercent}%
                      </span>
                    )}

                    {/* Affiliate partner badge */}
                    {product.fulfillmentType === 'AFFILIATE' && (
                      <span className="absolute top-3 left-3 bg-amber-500/90 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-md flex items-center gap-1">
                        <LucideIcon name="ExternalLink" className="h-3 w-3" />
                        {product.affiliateDetails?.platform || 'Partner'} Deal
                      </span>
                    )}

                    {/* Variant indicator (dropship only) */}
                    {product.hasVariants && product.fulfillmentType !== 'AFFILIATE' && (
                      <span className="absolute top-3 right-3 bg-black/80 backdrop-blur-md border border-white/20 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                        {product.variants?.length || 0} Options
                      </span>
                    )}
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">
                      <span>{product.sku}</span>
                      {product.fulfillmentType === 'AFFILIATE' ? (
                        <span className="text-amber-400 flex items-center gap-1">
                          <LucideIcon name="ExternalLink" className="h-3 w-3" />
                          {product.affiliateDetails?.merchantName || 'Partner'}
                        </span>
                      ) : (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          In Stock
                        </span>
                      )}
                    </div>

                    <Link href={`/shop/product/${product.slug}`} className="group-hover:text-[#E30613] transition-colors">
                      <h3 className="text-base font-bold uppercase tracking-tight text-white leading-snug line-clamp-1 mb-1.5">
                        {product.title}
                      </h3>
                    </Link>

                    {product.shortDescription && (
                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                        {product.shortDescription}
                      </p>
                    )}

                    {/* Price Row & CTA */}
                    <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                      <div className="flex items-baseline gap-2">
                        {product.fulfillmentType === 'AFFILIATE' ? (
                          <>
                            <span className="text-lg font-black text-white tracking-tight">
                              ₹{product.sellingPrice}
                            </span>
                            <span className="text-[9px] font-bold text-amber-400 uppercase">Ref. Price</span>
                          </>
                        ) : (
                          <>
                            <span className="text-lg font-black text-white tracking-tight">
                              ₹{product.sellingPrice}
                            </span>
                            {hasDiscount && (
                              <span className="text-xs font-semibold text-zinc-500 line-through">
                                ₹{product.compareAtPrice}
                              </span>
                            )}
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/shop/product/${product.slug}`}
                          className="h-9 px-3.5 inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/5 hover:bg-white/15 text-[11px] font-bold uppercase tracking-wider text-white transition-colors"
                        >
                          View
                        </Link>
                        {product.fulfillmentType === 'AFFILIATE' ? (
                          <button
                            onClick={(e) => handleAffiliateClick(product, e)}
                            title={product.affiliateDetails?.buttonText || 'View Deal'}
                            className="h-9 w-9 inline-flex items-center justify-center rounded-lg bg-amber-500 hover:bg-amber-400 text-white transition-colors cursor-pointer shadow-sm"
                          >
                            <LucideIcon name="ExternalLink" className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={(e) => handleQuickAdd(product, e)}
                            title={product.hasVariants ? 'Select options' : 'Add to Cart'}
                            className="h-9 w-9 inline-flex items-center justify-center rounded-lg bg-[#E30613] hover:bg-white hover:text-black text-white transition-colors cursor-pointer shadow-sm"
                          >
                            <LucideIcon name="Plus" className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
