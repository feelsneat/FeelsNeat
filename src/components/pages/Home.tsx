import { getPage, getServices } from '@/lib/cms';
import { fetchSubstackFeed } from '@/lib/substack';
import { SubstackFeed } from '@/components/interactive/SubstackFeed';
import { LucideIcon } from '@/components/ui/LucideIcon';
import Link from 'next/link';

export const runtime = 'edge';

export default async function HomePage() {
  const homeData = await getPage('home');
  const services = await getServices();
  const posts = await fetchSubstackFeed();
  const latestPosts = posts.slice(0, 3);

  return (
    <div className="flex flex-col w-full bg-[#0A0A0C] overflow-hidden relative">
      {/* Background graphic elements */}
      <div className="morphing-blob absolute top-12 left-10 opacity-30" />
      <div className="morphing-blob absolute bottom-40 right-10 opacity-20" />

      {/* HERO SECTION & LEAD CAPTURE */}
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

      {/* SECTION 2: PROFESSIONAL SERVICES SECTION */}
      <section className="py-28 bg-[#0A0A0C] border-t border-white/10 relative z-10 scroll-reveal">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-16">
          {/* Section Header */}
          <div className="max-w-2xl text-left">
            <span className="text-sm font-black text-[#E30613] uppercase tracking-widest block mb-2">
              Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#F4F4F5] uppercase tracking-tight">
              Professional Services
            </h2>
            <p className="mt-3 text-base text-[#F4F4F5]/75 font-semibold">
              We design and build tailormade structures, codebases, and automation integrations for modern operations.
            </p>
          </div>

          {/* Stacked Horizontal Services List */}
          <div className="space-y-8">
            {services.map((service, index) => (
              <div 
                key={service.slug}
                className="rounded-2xl border border-white/5 bg-[#0E0E12]/80 p-8 flex flex-col md:flex-row gap-8 items-center hover:border-white/10 transition-all duration-300"
              >
                {/* Image block */}
                <div className="w-full md:w-1/2 aspect-[1.5/1] rounded-xl overflow-hidden border border-white/10 bg-white/5 relative">
                  {service.image ? (
                    <img 
                      src={service.image} 
                      alt={service.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[#0E0E12] flex items-center justify-center">
                      <LucideIcon name={service.icon || 'Code'} className="h-10 w-10 text-[#E30613]/80" />
                    </div>
                  )}
                </div>

                {/* Content block */}
                <div className="w-full md:w-1/2 space-y-6 text-left">
                  <span className="text-xs font-black text-[#E30613] uppercase tracking-widest block">
                    Capability 0{index + 1}
                  </span>
                  
                  <h3 className="text-2xl font-black text-[#F4F4F5] uppercase tracking-tight leading-none">
                    {service.title}
                  </h3>
                  
                  <div className="space-y-4">
                    <p className="text-sm sm:text-base text-[#F4F4F5]/85 leading-relaxed font-bold uppercase tracking-tight">
                      {service.summary}
                    </p>
                    <div className="text-sm sm:text-base text-[#F4F4F5]/75 space-y-2 leading-relaxed font-semibold"
                      dangerouslySetInnerHTML={{ __html: service.content }}
                    />
                  </div>

                  <div className="pt-4 flex gap-4">
                    <Link 
                      href={`/create?service=${service.slug}`}
                      className="inline-flex h-10 items-center justify-center rounded-lg bg-[#E30613] hover:bg-zinc-900 text-xs font-black uppercase tracking-wider text-white px-6 transition-colors duration-300 shadow-md"
                    >
                      Request Service
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: PHYSICAL MEMORIES ARTWORK SECTION */}
      <section className="py-28 bg-[#0D0D10] border-t border-b border-white/5 relative z-10 scroll-reveal">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-16">
          {/* Section Header */}
          <div className="max-w-2xl text-left">
            <span className="text-sm font-black text-[#E30613] uppercase tracking-widest block mb-2">
              Physical Canvas
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#F4F4F5] uppercase tracking-tight">
              FeelsNeat Memories Artwork
            </h2>
            <p className="mt-3 text-base text-[#F4F4F5]/75 font-semibold">
              Premium mounted wall art panels pre-programmed with custom NFC microchips linking directly to your shared photo albums.
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#0A0A0C]/80 p-8 flex flex-col md:flex-row gap-8 items-center hover:border-white/10 transition-all duration-300">
            <div className="w-full md:w-1/2 aspect-[1.5/1] rounded-xl overflow-hidden border border-white/10 bg-white/5 relative">
              <img 
                src="/images/memories/memories-hero.jpg" 
                alt="FeelsNeat Memories wall canvas installation mockup" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-full md:w-1/2 space-y-6 text-left">
              <span className="text-xs font-black text-[#E30613] uppercase tracking-widest block">Interactive Photo Prints</span>
              <h3 className="text-2xl font-black text-[#F4F4F5] uppercase tracking-tight leading-none">
                Personalized Memory Canvas
              </h3>
              <p className="text-sm sm:text-base text-[#F4F4F5]/75 leading-relaxed font-semibold">
                Select from Travel, Wedding, Relationship, or Family layouts. Each physical panel features rigid MDF mounting, matte photo prints, and a hidden NFC transmitter.
              </p>
              <div className="pt-4 flex gap-4">
                <Link
                  href="/memories"
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-[#E30613] hover:bg-zinc-900 text-xs font-black uppercase tracking-wider text-white px-6 transition-colors duration-300 shadow-md"
                >
                  Explore Memories Collection
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3.5: FEELSNEAT TAP TILES SECTION */}
      <section className="py-28 bg-[#0A0A0C] border-b border-white/5 relative z-10 scroll-reveal">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-16">
          {/* Section Header */}
          <div className="max-w-2xl text-left">
            <span className="text-sm font-black text-[#E30613] uppercase tracking-widest block mb-2">
              Collectible Mini Art
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#F4F4F5] uppercase tracking-tight">
              FeelsNeat Tap Tiles
            </h2>
            <p className="mt-3 text-base text-[#F4F4F5]/75 font-semibold">
              Personalized 2x2 inch art tiles equipped with pre-programmed NFC chips. One tap opens your chosen song, playlist, video, or link.
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#0D0D10]/80 p-8 flex flex-col md:flex-row-reverse gap-8 items-center hover:border-white/10 transition-all duration-300">
            <div className="w-full md:w-1/2 aspect-[1.5/1] rounded-xl overflow-hidden border border-white/10 bg-white/5 relative select-none">
              <div className="absolute inset-0 bg-cover bg-center opacity-70" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=600')" }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-left">
                <span className="text-[8px] font-black text-[#E30613] tracking-widest uppercase">Tap Tile Mockup</span>
                <p className="text-xs font-bold text-white uppercase mt-0.5">"The group chat in physical form."</p>
              </div>
            </div>
            <div className="w-full md:w-1/2 space-y-6 text-left">
              <span className="text-xs font-black text-[#E30613] uppercase tracking-widest block">Interactive Mini Collectibles</span>
              <h3 className="text-2xl font-black text-[#F4F4F5] uppercase tracking-tight leading-none">
                Small Art. One Tap. A Whole Memory.
              </h3>
              <p className="text-sm sm:text-base text-[#F4F4F5]/75 leading-relaxed font-semibold">
                Available as magnets or keychains. Combine retro snapshots, quotes, or jokes with Spotify songs, YouTube clips, or shared Google Photos albums.
              </p>
              <div className="pt-4 flex gap-4">
                <Link
                  href="/tap-tiles"
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-[#E30613] hover:bg-zinc-900 text-xs font-black uppercase tracking-wider text-white px-6 transition-colors duration-300 shadow-md"
                >
                  Explore Tap Tiles
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: SUBSTACK ARTICLES STREAM */}
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

      {/* SECTION 5: PHILOSOPHY */}
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
