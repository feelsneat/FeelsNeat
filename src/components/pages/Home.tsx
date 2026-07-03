import { getPage, getProducts } from '@/lib/cms';
import { fetchSubstackFeed } from '@/lib/substack';
import { ProductShowcase } from '@/components/interactive/ProductShowcase';
import { SubstackFeed } from '@/components/interactive/SubstackFeed';
import { LucideIcon } from '@/components/ui/LucideIcon';

export const runtime = 'edge';

export default async function HomePage() {
  const homeData = await getPage('home');
  const products = await getProducts();
  const posts = await fetchSubstackFeed();
  const latestPosts = posts.slice(0, 3);

  return (
    <div className="flex flex-col w-full bg-[#0A0A0C] overflow-hidden relative">
      {/* Background graphic elements */}
      <div className="morphing-blob absolute top-12 left-10 opacity-30" />
      <div className="morphing-blob absolute bottom-40 right-10 opacity-20" />

      {/* 
        HERO SECTION & LEAD CAPTURE
        Centered, minimalist layout focused on lead generation via Substack.
      */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center py-24 sm:py-32 px-4 sm:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-slide-up">
          {/* Brand Pill badge */}
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E30613]/10 border border-[#E30613]/25 px-3.5 py-1 text-[10px] font-black text-[#E30613] uppercase tracking-widest">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E30613] animate-ping" />
              Better Starts Here
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#F4F4F5] uppercase leading-none max-w-3xl mx-auto">
            Your life, career, and projects.<br />
            <span className="text-[#E30613]">Neatly structured.</span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-[#F4F4F5] leading-relaxed font-medium max-w-2xl mx-auto">
            We build professional systems, frameworks, and visual trackers to help modern professionals adapt, organize, and thrive.
          </p>

          {/* Customized Substack Embed Card */}
          <div className="pt-6 flex justify-center w-full">
            <div className="w-full max-w-[480px] rounded-2xl border border-white/10 bg-white p-4 sm:p-5 shadow-lg relative z-20">
              <iframe
                src="https://feelsneat.substack.com/embed"
                width="100%"
                height="320"
                style={{ border: 'none', background: 'white' }}
                frameBorder="0"
                scrolling="no"
                title="FeelsNeat Substack Newsletter Embed"
                className="rounded-xl overflow-hidden"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 
        PREMIUM ETSY DIGITAL PRODUCT SHOWCASE
        Multi-column tabbed selector grid with mockups and listing warnings.
      */}
      <section className="py-28 bg-[#0A0A0C] border-t border-b border-white/10 relative z-10 scroll-reveal">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          {/* Section Header */}
          <div className="max-w-2xl mb-16">
            <span className="text-[10px] font-black text-[#E30613] uppercase tracking-widest block mb-2">
              Shop & Templates
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#F4F4F5] uppercase tracking-tight">
              Premium Digital Products
            </h2>
            <p className="mt-3 text-sm text-[#F4F4F5] leading-relaxed">
              Meticulously organized planners, spreadsheet calculators, and workspace documents designed to bring immediate structure to your routine.
            </p>
          </div>

          {/* Showcase Tabs */}
          <ProductShowcase products={products} />
        </div>
      </section>

      {/* 
        DYNAMIC CMS SECTION - LIVE SUBSTACK RSS BLOG STREAM
        Fetches Substack feed on client side dynamically with skeleton loader.
      */}
      <section className="py-28 relative z-10 scroll-reveal">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-4">
            <div className="max-w-2xl">
              <span className="text-[10px] font-black text-[#E30613] uppercase tracking-widest block mb-2">
                Observations
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#F4F4F5] uppercase tracking-tight">
                Live Content Engine
              </h2>
              <p className="mt-3 text-sm text-[#F4F4F5] leading-relaxed">
                Guides, workflow breakdowns, and system insights streamed live from our publication journal.
              </p>
            </div>
            <a
              href="https://feelsneat.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-black text-[#F4F4F5] hover:text-[#E30613] uppercase tracking-wider transition-colors shrink-0"
            >
              All Articles <LucideIcon name="ExternalLink" className="h-3.5 w-3.5 text-[#E30613]" />
            </a>
          </div>

          {/* RSS Stream component */}
          <SubstackFeed posts={latestPosts} />
        </div>
      </section>

      {/* 
        PHILOSOPHY & VALUES SUMMARY SECTION
        Simple, clean paragraph block demonstrating brand vision.
      */}
      <section className="py-28 bg-[#0D0D10] border-t border-white/5 relative z-10 scroll-reveal">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid md:grid-cols-12 gap-8 md:gap-16 items-start">
            <div className="md:col-span-4 space-y-2">
              <span className="text-[10px] font-black text-[#E30613] uppercase tracking-widest block">Philosophy</span>
              <h2 className="text-xl sm:text-2xl font-black text-[#F4F4F5] uppercase tracking-tight leading-none">
                {homeData.title}
              </h2>
            </div>
            <div 
              className="text-sm text-[#F4F4F5] md:col-span-8 space-y-6 leading-relaxed prose max-w-none"
              dangerouslySetInnerHTML={{ __html: homeData.content }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
