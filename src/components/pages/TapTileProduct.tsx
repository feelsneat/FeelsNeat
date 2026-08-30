'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LucideIcon } from '@/components/ui/LucideIcon';
import { TAP_TILES_CATEGORIES } from './TapTiles';

interface TapTileProductProps {
  categorySlug: string;
}

export default function TapTileProductPage({ categorySlug }: TapTileProductProps) {
  // Safe category lookup
  const category = (TAP_TILES_CATEGORIES as any)[categorySlug] || TAP_TILES_CATEGORIES.nostalgia;

  // Visual images list mockups
  const imagesList = categorySlug === 'pets' 
    ? [
        '/images/tap-tiles/pets-hero.jpg',
        '/images/tap-tiles/pets-detail-1.jpg',
        '/images/tap-tiles/pets-detail-2.jpg',
        '/images/tap-tiles/pets-detail-3.jpg'
      ]
    : [
        category.image,
        '/images/tap-tiles/boys-magnet.jpg', // Fridge closeup
        '/images/tap-tiles/friends.jpg', // Keychain closeup
        '/images/tap-tiles/hero-mockup.jpg'  // Grid collection
      ];

  const [activeImage, setActiveImage] = useState(imagesList[0]);
  const [selectedFormat, setSelectedFormat] = useState<'magnet' | 'keychain'>('magnet');

  return (
    <main className="flex-1 w-full bg-[#0A0A0C] text-[#F4F4F5] relative overflow-hidden py-24 sm:py-32">
      {/* Background blobs */}
      <div className="morphing-blob absolute top-10 left-5 opacity-20" />
      <div className="morphing-blob absolute bottom-20 right-5 opacity-15" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 relative z-10">
        {/* Category breadcrumb */}
        <div className="mb-8">
          <Link
            href="/tap-tiles"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#F4F4F5]/60 hover:text-[#E30613] transition-colors"
          >
            <LucideIcon name="ArrowLeft" className="h-3 w-3" /> Back to Tap Tiles
          </Link>
        </div>

        {/* Product Info Block */}
        <div className="grid lg:grid-cols-12 gap-12 items-start mb-20">
          {/* Product Gallery (Left) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-lg aspect-square bg-[#0E0E12] select-none">
              <img
                src={activeImage}
                alt={`${category.title} photographic mini artwork display mockup`}
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
                  className={`relative rounded-lg overflow-hidden border aspect-square bg-white/5 cursor-pointer transition-all ${
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
                <span className="block text-[10px] font-black text-[#F4F4F5]/60 uppercase tracking-wider mb-1">Dimensions</span>
                <span className="text-xs font-bold text-[#F4F4F5] uppercase">~2x2 inches</span>
              </div>
              <div className="p-3 rounded-xl border border-white/5 bg-white/5 text-center">
                <span className="block text-[10px] font-black text-[#F4F4F5]/60 uppercase tracking-wider mb-1">Thickness</span>
                <span className="text-xs font-bold text-[#F4F4F5] uppercase">~3 mm Rigid</span>
              </div>
              <div className="p-3 rounded-xl border border-white/5 bg-white/5 text-center">
                <span className="block text-[10px] font-black text-[#F4F4F5]/60 uppercase tracking-wider mb-1">NFC Chip</span>
                <span className="text-xs font-bold text-[#F4F4F5] uppercase">Embedded NTAG</span>
              </div>
            </div>
          </div>

          {/* Product Details (Right) */}
          <div className="lg:col-span-6 space-y-8 text-left">
            <div>
              <span className="text-xs font-black text-[#E30613] uppercase tracking-widest block mb-2 font-mono">
                {category.positioning}
              </span>
              <h1 className="text-3xl font-extrabold uppercase tracking-tight leading-none mb-4">
                {category.title}
              </h1>
              <p className="text-sm sm:text-base text-[#F4F4F5]/90 leading-relaxed font-semibold">
                {category.subtitle}
              </p>
            </div>

            <p className="text-sm sm:text-base text-[#F4F4F5]/80 leading-relaxed font-medium">
              {category.description} Each physical tile is custom-crafted from premium photographic print material, mounted onto a rigid wood composite base, and carries a completely invisible embedded NFC chip pre-programmed with your target link destination.
            </p>

            {/* Configurable Product Format Selector */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <h3 className="text-xs font-bold tracking-wider uppercase text-[#F4F4F5]">Available Format Types</h3>
              
              <div className="grid gap-3 sm:grid-cols-2">
                {/* Format Magnet */}
                <button
                  type="button"
                  onClick={() => setSelectedFormat('magnet')}
                  className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer select-none ${
                    selectedFormat === 'magnet'
                      ? 'border-[#E30613] bg-[#E30613]/5'
                      : 'border-white/10 bg-[#0E0E12] hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-start w-full">
                    <div>
                      <span className="block text-[8px] font-black text-[#E30613] uppercase tracking-wider mb-1">Attach to Fridge</span>
                      <h4 className="text-xs font-black uppercase text-[#F4F4F5]">Magnet Version</h4>
                    </div>
                    <span className="text-xs font-black text-[#F4F4F5] bg-white/5 border border-white/10 px-2.5 py-0.5 rounded tracking-wider">
                      {categorySlug === 'pets' ? '₹149' : '₹99'}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#F4F4F5]/60 mt-4">UPI/Manual Checkout</span>
                </button>
                {/* Format Keychain */}
                <button
                  type="button"
                  onClick={() => setSelectedFormat('keychain')}
                  className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer select-none ${
                    selectedFormat === 'keychain'
                      ? 'border-[#E30613] bg-[#E30613]/5'
                      : 'border-white/10 bg-[#0E0E12] hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-start w-full">
                    <div>
                      <span className="block text-[8px] font-black text-[#E30613] uppercase tracking-wider mb-1">Carry with You</span>
                      <h4 className="text-xs font-black uppercase text-[#F4F4F5]">Keychain Version</h4>
                    </div>
                    <span className="text-xs font-black text-[#F4F4F5] bg-white/5 border border-white/10 px-2.5 py-0.5 rounded tracking-wider">
                      {categorySlug === 'pets' ? '₹199' : '₹49'}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#F4F4F5]/60 mt-4">UPI/Manual Checkout</span>
                </button>
              </div>
            </div>

            {categorySlug === 'pets' && (
              <div className="space-y-4 pt-4 border-t border-white/5 text-left">
                <h3 className="text-xs font-bold tracking-wider uppercase text-[#F4F4F5]">Choose How Your Tap Tile Opens</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="p-4 rounded-xl border border-white/5 bg-[#0E0E12] space-y-2">
                    <span className="text-[8px] font-black text-[#E30613] uppercase tracking-wider block">Option A</span>
                    <h4 className="text-xs font-black uppercase text-[#F4F4F5]">FeelsNeat Pet Profile</h4>
                    <p className="text-[11px] text-[#F4F4F5]/70 leading-relaxed font-medium">
                      We'll create and host a personalized secure online profile for your pet (₹99 for 1 year). Perfect for quick contact info and rescue details.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-white/5 bg-[#0E0E12] space-y-2">
                    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-wider block">Option B</span>
                    <h4 className="text-xs font-black uppercase text-[#F4F4F5]">Your Own Link</h4>
                    <p className="text-[11px] text-[#F4F4F5]/70 leading-relaxed font-medium">
                      Already have a pet website, online document, or custom link? We'll program it directly into your tag (No hosting charge).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="pt-6 flex flex-col sm:flex-row gap-4">
              <Link
                href={`/create?type=tap_tiles&product=${categorySlug}&format=${selectedFormat}`}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-[#E30613] hover:bg-white hover:text-black px-8 text-xs font-black uppercase tracking-widest text-white transition-colors duration-300 shadow-md cursor-pointer text-center"
              >
                {category.cta}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
