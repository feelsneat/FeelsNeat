'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DigitalStorePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch('/api/ecommerce/products?type=digital');
        const data = await res.json();
        setProducts(data.products || []);
        setCategories(data.categories || []);
      } catch (error) {
        console.error('Failed to load digital products:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  return (
    <main className="min-h-screen bg-[#0A0A0C] text-[#F4F4F5] pt-28 pb-24 px-4 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 border-b border-white/10 pb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-black tracking-[0.25em] uppercase text-emerald-400">Digital Store</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight">Digital Download Library</h1>
          <p className="mt-3 max-w-2xl text-sm text-zinc-400">
            Practical templates, planners, prompt packs, worksheets, and useful digital resources built for focus, clarity, and momentum.
          </p>
        </div>

        {categories.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {categories.filter((cat) => cat.categoryType === 'DIGITAL' || cat.name.toLowerCase().includes('digital')).map((category) => (
              <span key={category.id} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-zinc-300">
                {category.name}
              </span>
            ))}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-sm text-zinc-400">Loading digital products…</div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-10 text-center text-sm text-zinc-400">
            No digital products are published yet. Please add products in the admin panel.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <Link key={product.id} href={`/digital-store/product/${product.slug}`} className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:border-emerald-500/60 hover:bg-white/[0.05]">
                <div className="aspect-[4/3] overflow-hidden bg-zinc-900">
                  <img src={product.images?.[0] || '/logo.png'} alt={product.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <div className="space-y-4 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-emerald-300">
                      {product.digitalProductType || product.productType || 'DIGITAL'}
                    </span>
                    <span className="text-sm font-bold text-white">₹{product.sellingPrice}</span>
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-white">{product.title}</h2>
                    <p className="mt-2 text-sm text-zinc-400">{product.shortDescription || product.description?.slice(0, 120)}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
                    <span>{product.downloadableFiles?.length || 0} files</span>
                    <span className="text-emerald-300">View product →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
