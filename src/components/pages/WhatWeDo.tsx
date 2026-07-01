import { Metadata } from 'next';
import { getServices } from '@/lib/cms';
import { LucideIcon } from '@/components/ui/LucideIcon';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'What We Do',
  description: 'Our core services, digital products, resources, and engineering approach.',
};

export default async function WhatWeDoPage() {
  const services = await getServices();

  return (
    <main className="flex-1 w-full bg-background py-20 sm:py-28 border-b border-zinc-200/50 relative">
      {/* Morphing background shapes */}
      <div className="morphing-blob absolute top-10 right-10 opacity-30" />
      <div className="morphing-blob absolute bottom-20 left-10 opacity-20" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 relative z-10">
        {/* Page Header */}
        <div className="max-w-3xl mb-20 scroll-reveal">
          <span className="text-[10px] font-black text-accent-custom uppercase tracking-widest block mb-3">Capabilities</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground uppercase">
            What We Do
          </h1>
          <p className="mt-6 text-base sm:text-lg text-neutral-gray leading-relaxed font-medium">
            We focus on creating value through simplicity. Whether it is refreshing a product's presentation, building a digital template, or designing a productivity tracker, we structure solutions that are clean and useful.
          </p>
        </div>

        {/* Detailed Services list with thin border layout */}
        <div className="space-y-16 border-t border-zinc-200 pt-16">
          {services.map((service, index) => (
            <div 
              key={service.slug}
              id={service.slug}
              className={`grid md:grid-cols-12 gap-8 items-start pt-16 border-t border-zinc-200 scroll-reveal ${
                index === 0 ? 'border-t-0 pt-0' : ''
              }`}
            >
              {/* Icon & Title */}
              <div className="md:col-span-4 flex items-center md:items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 border border-zinc-200 text-accent-custom shadow-3xs">
                  <LucideIcon name={service.icon} className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground uppercase tracking-tight leading-tight">{service.title}</h2>
                  <span className="text-[9px] text-accent-custom uppercase tracking-widest font-black block mt-1.5">Capability 0{index + 1}</span>
                </div>
              </div>

              {/* Service description */}
              <div className="md:col-span-8 space-y-8">
                <p className="text-base font-bold text-foreground leading-relaxed uppercase tracking-tight">
                  {service.summary}
                </p>

                {/* Main Service Image Graphic */}
                {service.image && (
                  <div className="w-full aspect-[2.1/1] rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100/50 shadow-3xs">
                    <img 
                      src={service.image} 
                      alt={service.title} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                {/* Detailed description */}
                <div 
                  className="text-sm text-neutral-gray space-y-6 leading-relaxed prose max-w-none font-medium"
                  dangerouslySetInnerHTML={{ __html: service.content }}
                />

                {/* Service Gallery Images */}
                {service.additionalImages && service.additionalImages.length > 0 && (
                  <div className="pt-4 space-y-4">
                    <h4 className="text-[9px] font-black text-neutral-gray uppercase tracking-widest">Capability Gallery</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {service.additionalImages.map((imgUrl, imgIdx) => (
                        <div key={imgIdx} className="aspect-[1.5/1] rounded-lg overflow-hidden border border-zinc-200 bg-zinc-50 shadow-3xs">
                          <img 
                            src={imgUrl} 
                            alt={`${service.title} gallery image ${imgIdx + 1}`} 
                            className="h-full w-full object-cover hover:scale-102 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags and Action Links */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-zinc-200">
                  <div className="flex flex-wrap gap-1">
                    {(service.tags || []).map((tag) => (
                      <span key={tag} className="inline-flex items-center rounded-md bg-zinc-100 border border-zinc-200 px-2.5 py-0.5 text-[9px] font-black uppercase text-foreground/70">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {service.externalUrl && (
                    <a 
                      href={service.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-foreground hover:text-accent-custom transition-colors"
                    >
                      Explore resource <LucideIcon name="ArrowUpRight" className="h-3.5 w-3.5 text-accent-custom" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
