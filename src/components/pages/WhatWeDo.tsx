import { Metadata } from 'next';
import { getServices } from '@/lib/cms';
import { LucideIcon } from '@/components/ui/LucideIcon';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'What We Do',
  description: 'Our core services, prototyping capabilities, experiments, and engineering approach.',
};

export default async function WhatWeDoPage() {
  const services = await getServices();

  return (
    <main className="flex-1 w-full bg-background py-16 sm:py-24 border-b border-border-custom">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Page Header */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest block mb-3">Capabilities</span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            What We Do
          </h1>
          <p className="mt-6 text-lg text-foreground/75 leading-relaxed font-medium">
            We focus on creating value through simplicity. Whether it is refreshing a product's presentation or building a high-performance edge application, we design solutions that are clean and useful.
          </p>
        </div>

        {/* Detailed Services list */}
        <div className="space-y-12 sm:space-y-16">
          {services.map((service, index) => (
            <div 
              key={service.slug}
              className={`grid md:grid-cols-12 gap-8 items-start pt-12 border-t border-border-custom ${
                index === 0 ? 'border-t-0 pt-0' : ''
              }`}
            >
              {/* Icon & Title */}
              <div className="md:col-span-4 flex items-center md:items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-foreground text-background">
                  <LucideIcon name={service.icon} className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-foreground">{service.title}</h2>
                  <span className="text-[10px] text-foreground/50 uppercase tracking-widest font-semibold block mt-1">Service 0{index + 1}</span>
                </div>
              </div>

              {/* Service description */}
              <div className="md:col-span-8 space-y-6">
                <p className="text-base font-semibold text-foreground/80 leading-relaxed">
                  {service.summary}
                </p>
                <div 
                  className="text-sm text-foreground/70 space-y-4 leading-relaxed prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: service.content }}
                />
                
                {/* Optional Image or External Resource link */}
                {service.externalUrl && (
                  <div className="pt-2">
                    <a 
                      href={service.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-foreground hover:underline"
                    >
                      Explore service resource <LucideIcon name="ArrowUpRight" className="h-3.5 w-3.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
