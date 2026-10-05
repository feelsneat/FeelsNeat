'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { addToCart } from '@/lib/ecommerce/cart';

interface DigitalProductDetailProps {
  slug: string;
}

export default function DigitalProductDetailPage({ slug }: DigitalProductDetailProps) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetch(`/api/ecommerce/products?slug=${encodeURIComponent(slug)}&type=digital`);
        const data = await res.json();
        setProduct(data.product || null);
      } catch (error) {
        console.error('Failed to load digital product detail:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0A0A0C] text-white pt-32 pb-24 px-4 flex items-center justify-center">
        <div className="text-sm uppercase tracking-[0.22em] text-zinc-400">Loading product…</div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-[#0A0A0C] text-white pt-32 pb-24 px-4 flex items-center justify-center">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
          <h1 className="text-2xl font-black uppercase tracking-tight">Product not found</h1>
          <Link href="/digital-store" className="mt-5 inline-block rounded-lg bg-emerald-500 px-5 py-3 text-xs font-black uppercase tracking-[0.22em] text-black">
            Back to store
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A0A0C] text-[#F4F4F5] pt-28 pb-24 px-4 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <nav className="mb-8 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">
          <Link href="/digital-store" className="hover:text-white">Digital Store</Link>
          <span>/</span>
          <span className="text-white">{product.title}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-start">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <img src={product.images?.[0] || '/logo.png'} alt={product.title} className="h-full min-h-[420px] w-full object-cover" />
          </div>

          <div className="space-y-6">
            <span className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300">
              {product.digitalProductType || product.productType || 'DIGITAL'}
            </span>

            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight text-white">{product.title}</h1>
              <p className="mt-3 text-sm text-zinc-400">{product.shortDescription}</p>
            </div>

            <div className="flex items-end gap-3">
              <span className="text-3xl font-black text-white">₹{product.sellingPrice}</span>
              {product.compareAtPrice && product.compareAtPrice > product.sellingPrice && (
                <span className="text-lg text-zinc-500 line-through">₹{product.compareAtPrice}</span>
              )}
            </div>

            <button
              onClick={() => {
                addToCart({
                  productId: product.id,
                  sku: product.sku,
                  title: product.title,
                  unitPrice: product.sellingPrice,
                  quantity: 1,
                  image: product.images?.[0] || '',
                  maxStock: product.stockQuantity || 9999,
                  isDigital: true,
                });
                window.location.href = '/checkout';
              }}
              className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-500 px-5 py-3 text-xs font-black uppercase tracking-[0.22em] text-black transition hover:bg-white"
            >
              Buy now
            </button>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <h2 className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-400">Includes</h2>
              <ul className="mt-4 space-y-3 text-sm text-zinc-300">
                {(product.downloadableFiles?.length ? product.downloadableFiles : [{ title: 'Downloadable File', filename: 'digital-product-file.zip' }]).map((file: any, index: number) => (
                  <li key={index} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                    <span>{file.title || file.filename}</span>
                    <span className="text-[10px] uppercase tracking-[0.18em] text-emerald-300">{file.filename?.split('.').pop()?.toUpperCase() || 'FILE'}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-400">Description</h2>
          <div className="mt-4 text-sm leading-7 text-zinc-300" dangerouslySetInnerHTML={{ __html: product.description || '<p>No description available.</p>' }} />
        </div>
      </div>
    </main>
  );
}
