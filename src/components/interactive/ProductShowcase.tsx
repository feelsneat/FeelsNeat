'use client';

import { useState } from 'react';
import { PRODUCTS, DigitalProduct } from '@/lib/products';
import { LucideIcon } from '../ui/LucideIcon';

type TabCategory = 'notion' | 'trackers' | 'resumes';

export function ProductShowcase() {
  const [activeTab, setActiveTab] = useState<TabCategory>('notion');

  // Filter items based on active category
  const filteredProducts = PRODUCTS.filter((p) => p.category === activeTab);

  // Tab definitions
  const tabs = [
    { id: 'notion' as TabCategory, label: 'Notion Templates', icon: 'Cpu' },
    { id: 'trackers' as TabCategory, label: 'Spreadsheet Trackers', icon: 'BarChart' },
    { id: 'resumes' as TabCategory, label: 'Printables & Resumes', icon: 'FileText' },
  ];

  return (
    <div className="space-y-12">
      {/* Centered Tab Buttons */}
      <div className="flex justify-center border-b border-zinc-200">
        <div className="flex space-x-8 sm:space-x-12">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 text-xs font-black uppercase tracking-wider transition-colors relative cursor-pointer ${
                  isActive
                    ? 'text-foreground'
                    : 'text-neutral-gray hover:text-foreground'
                }`}
              >
                <LucideIcon name={tab.icon} className={`h-4 w-4 ${isActive ? 'text-accent-custom' : 'text-neutral-gray/70'}`} />
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-custom rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid md:grid-cols-2 gap-10">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="group flex flex-col rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-3xs hover:border-accent-custom hover:shadow-2xs transition-all duration-300 relative overflow-hidden"
          >
            {/* Minimalist Device Mockup Placeholder Frame */}
            <div className="w-full aspect-[16/10] rounded-xl bg-zinc-100/70 border border-zinc-200/40 relative overflow-hidden flex flex-col items-center justify-center p-6 mb-6 select-none group-hover:bg-zinc-100 transition-colors duration-300">
              {/* Device Frame Bezels Simulation */}
              <div className="absolute top-3 left-3 flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
              </div>
              
              {/* Product title inside frame */}
              <div className="p-6 bg-white border border-zinc-200/50 rounded-lg shadow-3xs max-w-[85%] text-center transform group-hover:scale-102 transition-transform duration-300">
                <span className="text-[8px] font-black text-accent-custom uppercase tracking-widest block mb-1">
                  {product.category === 'notion' ? 'Notion Framework' : product.category === 'trackers' ? 'Spreadsheet Utility' : 'Document Template'}
                </span>
                <span className="text-xs font-bold text-foreground tracking-tight uppercase block leading-snug">
                  {product.title}
                </span>
              </div>

              {/* Instant download alert badge inside preview */}
              <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 bg-accent-blue/10 border border-accent-blue/20 text-[7px] font-black uppercase text-accent-blue tracking-wider px-2 py-0.5 rounded-md">
                <LucideIcon name="Download" className="h-2 w-2" /> Digital Asset
              </span>
            </div>

            {/* Title Row */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="text-[10px] font-black text-accent-custom uppercase tracking-wider block mb-1">
                  {product.category === 'notion' ? 'System Workspace' : product.category === 'trackers' ? 'Google Sheets' : 'Printable PDF'}
                </span>
                <h3 className="text-lg font-bold text-foreground tracking-tight uppercase leading-snug">
                  {product.title}
                </h3>
              </div>
              <div className="flex flex-col items-end">
                <span className="inline-flex items-center rounded-lg bg-zinc-50 border border-zinc-200 px-3 py-1 text-xs font-black text-foreground shadow-3xs">
                  {product.price}
                </span>
              </div>
            </div>

            {/* Features Checklist */}
            <ul className="space-y-2 mb-6">
              {product.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-neutral-gray font-medium">
                  <LucideIcon name="Check" className="h-3.5 w-3.5 text-accent-custom shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {/* Bottom Row warning and CTA */}
            <div className="pt-4 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-auto">
              {/* No Physical Products Warning Badge */}
              <span className="inline-flex items-center gap-1.5 text-[8px] font-black uppercase text-accent-blue bg-accent-blue/5 border border-accent-blue/15 px-2.5 py-1 rounded-md">
                <LucideIcon name="AlertCircle" className="h-3 w-3" />
                Instant Digital Download — No Physical Delivery
              </span>

              {/* CTA Link to Etsy Listing */}
              <a
                href={product.etsyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center justify-center rounded-lg bg-foreground hover:bg-accent-custom text-background hover:text-white px-5 text-xs font-black uppercase tracking-wider transition-colors duration-300 cursor-pointer shadow-3xs ml-auto sm:ml-0"
              >
                View on Etsy
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
