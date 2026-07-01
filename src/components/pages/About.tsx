import { Metadata } from 'next';
import { getPage } from '@/lib/cms';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Our core philosophy, history, and the principles that guide our work at FeelsNeat.',
};

export default async function AboutPage() {
  const pageData = await getPage('about');

  return (
    <main className="flex-1 w-full bg-background py-20 sm:py-28 border-b border-zinc-200/50 relative">
      {/* Morphing background shapes */}
      <div className="morphing-blob absolute top-10 right-10 opacity-30" />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 relative z-10">
        {/* Page Header */}
        <div className="mb-20 scroll-reveal">
          <span className="text-[10px] font-black text-accent-custom uppercase tracking-widest block mb-3">Philosophy</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-none uppercase">
            {pageData.title}
          </h1>
          <p className="mt-6 text-base sm:text-lg text-neutral-gray leading-relaxed font-medium">
            {pageData.subtitle}
          </p>
        </div>

        {/* Content Section */}
        <div 
          className="text-sm sm:text-base text-neutral-gray space-y-6 leading-relaxed prose max-w-none mb-20 scroll-reveal"
          dangerouslySetInnerHTML={{ __html: pageData.content }}
        />

        {/* Philosophy Details Grid */}
        <div className="grid md:grid-cols-2 gap-12 pt-16 border-t border-zinc-200 scroll-reveal">
          <div className="space-y-4">
            <span className="text-[9px] font-black text-accent-custom uppercase tracking-widest block">Approach</span>
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">
              {pageData.philosophyTitle || 'Philosophy'}
            </h2>
            <p className="text-xs text-neutral-gray leading-relaxed font-medium">
              {pageData.philosophyText}
            </p>
          </div>
          <div className="space-y-4">
            <span className="text-[9px] font-black text-accent-custom uppercase tracking-widest block">Core Values</span>
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">
              {pageData.teamTitle || 'Our Values'}
            </h2>
            <p className="text-xs text-neutral-gray leading-relaxed font-medium">
              {pageData.teamText}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
