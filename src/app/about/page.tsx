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
    <main className="flex-1 w-full bg-background py-16 sm:py-24 border-b border-border-custom">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Page Header */}
        <div className="mb-16">
          <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest block mb-3">Philosophy</span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground leading-none">
            {pageData.title}
          </h1>
          <p className="mt-6 text-lg text-foreground/75 leading-relaxed font-medium">
            {pageData.subtitle}
          </p>
        </div>

        {/* Content Section */}
        <div 
          className="text-base text-foreground/80 space-y-6 leading-relaxed prose max-w-none mb-16"
          dangerouslySetInnerHTML={{ __html: pageData.content }}
        />

        {/* Philosophy Details Grid */}
        <div className="grid md:grid-cols-2 gap-8 pt-12 border-t border-border-custom">
          <div className="space-y-3">
            <h2 className="text-base font-extrabold text-foreground">
              {pageData.philosophyTitle || 'Philosophy'}
            </h2>
            <p className="text-sm text-foreground/70 leading-relaxed">
              {pageData.philosophyText}
            </p>
          </div>
          <div className="space-y-3">
            <h2 className="text-base font-extrabold text-foreground">
              {pageData.teamTitle || 'Our Values'}
            </h2>
            <p className="text-sm text-foreground/70 leading-relaxed">
              {pageData.teamText}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
