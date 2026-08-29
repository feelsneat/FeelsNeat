'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LucideIcon } from '@/components/ui/LucideIcon';
import { MEMORY_CATEGORIES, PRODUCT_PRICES } from './Memories';

interface MemoryProductProps {
  categorySlug: string;
}

export default function MemoryProductPage({ categorySlug }: MemoryProductProps) {
  // Safe category lookup
  const category = (MEMORY_CATEGORIES as any)[categorySlug] || MEMORY_CATEGORIES.travel;

  const mainImage = categorySlug === 'travel'
    ? '/images/memories/travel-product.jpg'
    : category.image;

  const imagesList = [
    mainImage,
    '/images/memories/travel-product-closeup.jpg',
    '/images/memories/memory-collection.jpg',
    '/images/memories/memory-how-it-works.jpg'
  ];

  const [activeImage, setActiveImage] = useState(imagesList[0]);

  return (
    <main className="flex-1 w-full bg-[#0A0A0C] text-[#F4F4F5] relative overflow-hidden py-24 sm:py-32">
      {/* Background blobs */}
      <div className="morphing-blob absolute top-10 left-5 opacity-20" />
      <div className="morphing-blob absolute bottom-20 right-5 opacity-15" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 relative z-10">
        {/* Category breadcrumb */}
        <div className="mb-8">
          <Link
            href="/memories"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#F4F4F5]/60 hover:text-[#E30613] transition-colors"
          >
            <LucideIcon name="ArrowLeft" className="h-3 w-3" /> Back to Memories
          </Link>
        </div>

        {/* Product Info Block */}
        <div className="grid lg:grid-cols-12 gap-12 items-start mb-20">
          {/* Product Gallery (Left) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-lg aspect-[4/3] bg-[#0E0E12] select-none">
              <img
                src={activeImage}
                alt={`${category.title} photographic wall display mockup`}
                className="w-full h-full object-cover transition-all duration-300"
              />
            </div>

            {/* Thumbnail Selectors */}
            <div className="grid grid-cols-4 gap-2">
              {imagesList.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImage(img)}
                  className={`relative rounded-lg overflow-hidden border aspect-[4/3] bg-white/5 cursor-pointer transition-all ${
                    activeImage === img ? 'border-[#E30613] scale-102' : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <img src={img} alt={`Gallery view thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            
            {/* Visual Specs summary cards */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="p-3 rounded-xl border border-white/5 bg-white/5 text-center">
                <span className="block text-[10px] font-black text-[#F4F4F5]/60 uppercase tracking-wider mb-1">Thickness</span>
                <span className="text-sm font-bold text-[#F4F4F5] uppercase">~3 mm Rigid</span>
              </div>
              <div className="p-3 rounded-xl border border-white/5 bg-white/5 text-center">
                <span className="block text-[10px] font-black text-[#F4F4F5]/60 uppercase tracking-wider mb-1">Finish</span>
                <span className="text-sm font-bold text-[#F4F4F5] uppercase">Matte/Lustre</span>
              </div>
              <div className="p-3 rounded-xl border border-white/5 bg-white/5 text-center">
                <span className="block text-[10px] font-black text-[#F4F4F5]/60 uppercase tracking-wider mb-1">Mounting</span>
                <span className="text-sm font-bold text-[#F4F4F5] uppercase">Wall Mounted</span>
              </div>
            </div>
          </div>

          {/* Product Details (Right) */}
          <div className="lg:col-span-6 space-y-8 text-left">
            <div>
              <span className="text-xs font-black text-[#E30613] uppercase tracking-widest block mb-2">
                {category.positioning}
              </span>
              <h1 className="text-3xl font-extrabold uppercase tracking-tight leading-none mb-4">
                {category.title} Canvas
              </h1>
              <p className="text-sm sm:text-base text-[#F4F4F5]/90 leading-relaxed font-semibold">
                {category.subtitle}
              </p>
            </div>

            <p className="text-sm sm:text-base text-[#F4F4F5]/80 leading-relaxed font-medium">
              {category.description} Each physical photo panel is precision mounted and carries a hidden NFC microchip pre-programmed with your shared album URL.
            </p>

            {/* Configurable Product Sizes Grid */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <h3 className="text-xs font-bold tracking-wider uppercase text-[#F4F4F5]">Available Canvas Sizes</h3>
              
              <div className="grid gap-3 sm:grid-cols-3">
                {/* Size Mini */}
                <div className="p-4 rounded-xl border border-white/10 bg-[#0E0E12] flex flex-col justify-between">
                  <div className="flex justify-between items-start w-full">
                    <div>
                      <span className="block text-[8px] font-black text-[#E30613] uppercase tracking-wider mb-1">4x4 inches</span>
                      <h4 className="text-xs font-black uppercase text-[#F4F4F5]">Mini</h4>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className="text-[10px] text-[#F4F4F5]/40 line-through font-semibold font-mono">{PRODUCT_PRICES.mini.original}</span>
                      <span className="text-xs font-black text-[#F4F4F5] bg-white/5 border border-white/10 px-2.5 py-0.5 rounded tracking-wider mt-0.5">{PRODUCT_PRICES.mini.current}</span>
                    </div>
                  </div>
                </div>
                {/* Size Standard */}
                <div className="p-4 rounded-xl border border-white/10 bg-[#0E0E12] flex flex-col justify-between">
                  <div className="flex justify-between items-start w-full">
                    <div>
                      <span className="block text-[8px] font-black text-[#E30613] uppercase tracking-wider mb-1">6x6 inches</span>
                      <h4 className="text-xs font-black uppercase text-[#F4F4F5]">Standard</h4>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className="text-[10px] text-[#F4F4F5]/40 line-through font-semibold font-mono">{PRODUCT_PRICES.standard.original}</span>
                      <span className="text-xs font-black text-[#F4F4F5] bg-white/5 border border-white/10 px-2.5 py-0.5 rounded tracking-wider mt-0.5">{PRODUCT_PRICES.standard.current}</span>
                    </div>
                  </div>
                </div>
                {/* Size Landscape */}
                <div className="p-4 rounded-xl border border-white/10 bg-[#0E0E12] flex flex-col justify-between">
                  <div className="flex justify-between items-start w-full">
                    <div>
                      <span className="block text-[8px] font-black text-[#E30613] uppercase tracking-wider mb-1">8x6 inches</span>
                      <h4 className="text-xs font-black uppercase text-[#F4F4F5]">Landscape</h4>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className="text-[10px] text-[#F4F4F5]/40 line-through font-semibold font-mono">{PRODUCT_PRICES.landscape.original}</span>
                      <span className="text-xs font-black text-[#F4F4F5] bg-white/5 border border-white/10 px-2.5 py-0.5 rounded tracking-wider mt-0.5">{PRODUCT_PRICES.landscape.current}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-6 flex flex-col sm:flex-row gap-4">
              <Link
                href={`/create?type=${category.slug}`}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-[#E30613] hover:bg-white hover:text-black px-8 text-xs font-black uppercase tracking-widest text-white transition-colors duration-300 shadow-md cursor-pointer text-center"
              >
                {category.cta}
              </Link>
            </div>
          </div>
        </div>

        {/* SPECIFICATIONS & FEATURES DETAILS BLOCK */}
        <div className="grid md:grid-cols-2 gap-12 border-t border-white/10 pt-16 text-left">
          {/* Left Description: Product Construction */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F4F4F5] border-b border-white/5 pb-2">Physical Specifications</h3>
            
            <ul className="space-y-4 text-xs text-[#F4F4F5]/80 font-medium">
              <li className="flex gap-3">
                <LucideIcon name="CheckCircle2" className="h-4.5 w-4.5 text-[#E30613] shrink-0" />
                <span>**Premium Photographic Print**: Lustre/matte print finish preserving vibrant hues and contrast details.</span>
              </li>
              <li className="flex gap-3">
                <LucideIcon name="CheckCircle2" className="h-4.5 w-4.5 text-[#E30613] shrink-0" />
                <span>**Rigid MDF Mounting**: Mounted securely onto 3 mm rigid backing board for a sleek visual shadow profile.</span>
              </li>
              <li className="flex gap-3">
                <LucideIcon name="CheckCircle2" className="h-4.5 w-4.5 text-[#E30613] shrink-0" />
                <span>**Hidden NFC Microchip**: Seamlessly attached flat to the back of the artwork, completely invisible from the front.</span>
              </li>
              <li className="flex gap-3">
                <LucideIcon name="CheckCircle2" className="h-4.5 w-4.5 text-[#E30613] shrink-0" />
                <span>**Flush Wall Mounting**: Designed to mount directly flat on the wall (wall adhesive strips included).</span>
              </li>
            </ul>
          </div>

          {/* Right Description: NFC Workflow */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F4F4F5] border-b border-white/5 pb-2">One-Tap Interaction Workflow</h3>
            
            <div className="space-y-4 relative">
              {/* Step line workflow */}
              <div className="flex gap-4 items-start">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E30613]/10 border border-[#E30613]/30 text-[#E30613] text-[10px] font-black shrink-0">1</div>
                <div>
                  <h4 className="text-xs font-black uppercase text-[#F4F4F5]">Share Google Photos Link</h4>
                  <p className="text-[11px] text-[#F4F4F5]/70 mt-1 uppercase font-semibold">Voluntarily paste your shared album link during ordering. No password required.</p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E30613]/10 border border-[#E30613]/30 text-[#E30613] text-[10px] font-black shrink-0">2</div>
                <div>
                  <h4 className="text-xs font-black uppercase text-[#F4F4F5]">We Mount & Configure NFC</h4>
                  <p className="text-[11px] text-[#F4F4F5]/70 mt-1 uppercase font-semibold">We build the rigid physical panel and program the NFC tag with the shared URL.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E30613]/10 border border-[#E30613]/30 text-[#E30613] text-[10px] font-black shrink-0">3</div>
                <div>
                  <h4 className="text-xs font-black uppercase text-[#F4F4F5]">Tap Canvas to Launch Album</h4>
                  <p className="text-[11px] text-[#F4F4F5]/70 mt-1 uppercase font-semibold">Tap the front face of the artwork with any NFC-enabled smartphone to launch the album.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
