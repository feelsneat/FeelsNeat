import { Metadata } from 'next';
import Link from 'next/link';
import { getServices, getProducts } from '@/lib/cms';
import { LucideIcon } from '@/components/ui/LucideIcon';
import { fetchSubstackFeed, SubstackPost } from '@/lib/substack';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Output',
  description: 'A complete index of services, digital templates, and product lines by FeelsNeat.',
};

export default async function OurWorkPage() {
  const services = await getServices();
  const products = await getProducts();
  const posts = await fetchSubstackFeed();

  // Helper to format dates cleanly on the server
  const formatDate = (dateStr: string) => {
    try {
      const dateObj = new Date(dateStr.replace(' ', 'T'));
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Inspects content metadata to return clean format indicators (Articles, Videos, Podcasts)
  const getFormatInfo = (post: SubstackPost) => {
    const cats = (post.categories || []).map((c) => c.toLowerCase());
    const contentLower = (post.content || '').toLowerCase();
    
    const isVideo = 
      cats.includes('video') || 
      contentLower.includes('youtube.com/embed') || 
      contentLower.includes('youtu.be') || 
      contentLower.includes('<iframe') && contentLower.includes('video');
      
    const isPodcast = 
      cats.includes('podcast') || 
      cats.includes('audio') || 
      contentLower.includes('<audio') || 
      contentLower.includes('player.substack.com');

    if (isVideo) {
      return { label: 'Video Guide', icon: 'Youtube' };
    }
    if (isPodcast) {
      return { label: 'Podcast Episode', icon: 'Volume2' };
    }
    return { label: 'Article', icon: 'BookOpen' };
  };

  return (
    <main className="flex-1 w-full bg-[#0A0A0C] py-20 sm:py-28 border-b border-white/10 relative">
      {/* Background blobs */}
      <div className="morphing-blob absolute top-10 left-10 opacity-20" />
      <div className="morphing-blob-large absolute bottom-10 right-10 opacity-25" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 relative z-10 space-y-24">
        
        {/* PAGE HEADER */}
        <div className="max-w-3xl scroll-reveal">
          <span className="text-sm font-black text-[#E30613] uppercase tracking-widest block mb-3">Portfolio & Capabilities</span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-[#F4F4F5] uppercase">
            Output
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-[#F4F4F5]/80 leading-relaxed font-semibold">
            A comprehensive catalog of everything we design, prototype, and engineer. Below you will find our professional consultation services, instant digital tools, physical art categories, and technical observations.
          </p>
        </div>

        {/* SECTION 1: CAPABILITY SERVICES */}
        <section id="services" className="space-y-10 scroll-reveal border-t border-white/10 pt-16">
          <div className="max-w-2xl text-left">
            <span className="text-sm font-black text-[#E30613] uppercase tracking-widest block mb-2">Capabilities</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#F4F4F5] uppercase tracking-tight">
              Professional Services
            </h2>
            <p className="mt-3 text-base text-[#F4F4F5]/75 font-semibold">
              We design and build tailormade structures, codebases, and interface systems for modern business operations.
            </p>
          </div>

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
        </section>

        {/* SECTION 2: DIGITAL PRODUCTS */}
        <section id="products" className="space-y-10 scroll-reveal border-t border-white/10 pt-16">
          <div className="max-w-2xl text-left">
            <span className="text-sm font-black text-[#E30613] uppercase tracking-widest block mb-2">Instant Downloads</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#F4F4F5] uppercase tracking-tight">
              Digital Products & Templates
            </h2>
            <p className="mt-3 text-base text-[#F4F4F5]/75 font-semibold">
              Meticulously structured Notion setups, bookkeeping spreadsheets, and LaTeX templates available for instant setup.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {products.map((product) => (
              <div 
                key={product.id}
                className="flex flex-col rounded-2xl border border-white/5 bg-[#0E0E12]/80 overflow-hidden hover:border-white/10 transition-all duration-300 shadow-sm p-6 justify-between min-h-[350px]"
              >
                {/* Header info */}
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-black text-[#E30613] uppercase tracking-widest bg-[#E30613]/5 border border-[#E30613]/15 px-2.5 py-0.5 rounded">
                      {product.category}
                    </span>
                    <span className="text-base font-black text-[#F4F4F5]">
                      {product.price}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-black text-[#F4F4F5] uppercase tracking-tight leading-snug">
                    {product.title}
                  </h3>
                  
                  <ul className="space-y-2 text-sm text-[#F4F4F5]/80 font-semibold list-disc pl-5 uppercase">
                    {(product.features || []).slice(0, 3).map((feat, idx) => (
                      <li key={idx}>{feat}</li>
                    ))}
                  </ul>
                </div>

                {/* Bottom Row CTA */}
                <div className="pt-6 border-t border-white/5 flex items-center justify-between mt-6">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#F4F4F5]/60">
                    <LucideIcon name="DownloadCloud" className="h-5 w-5 text-[#E30613]" /> Digital Copy
                  </span>
                  <Link
                    href={`/create?product=${product.id}`}
                    className="inline-flex h-10 items-center justify-center rounded-lg bg-white hover:bg-[#E30613] text-black hover:text-white px-4 text-xs font-black uppercase tracking-wider transition-colors duration-300 cursor-pointer shadow-md"
                  >
                    Order Template
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: NFC MEMORIES ARTWORK */}
        <section id="memories" className="space-y-10 scroll-reveal border-t border-white/10 pt-16">
          <div className="max-w-2xl text-left">
            <span className="text-sm font-black text-[#E30613] uppercase tracking-widest block mb-2">Physical Canvas</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#F4F4F5] uppercase tracking-tight">
              FeelsNeat Memories Artwork
            </h2>
            <p className="mt-3 text-base text-[#F4F4F5]/75 font-semibold">
              Premium mounted wall art panels pre-programmed with custom NFC microchips linking directly to your shared photo albums.
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#0E0E12]/80 p-8 flex flex-col md:flex-row gap-8 items-center hover:border-white/10 transition-all duration-300">
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
        </section>

        {/* SECTION 4: FEELSNEAT TAP TILES */}
        <section id="tap-tiles" className="space-y-10 scroll-reveal border-t border-white/10 pt-16">
          <div className="max-w-2xl text-left">
            <span className="text-sm font-black text-[#E30613] uppercase tracking-widest block mb-2">Collectible Mini Art</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#F4F4F5] uppercase tracking-tight">
              FeelsNeat Tap Tiles
            </h2>
            <p className="mt-3 text-base text-[#F4F4F5] font-semibold leading-relaxed">
              Personalized 2x2 inch art tiles equipped with pre-programmed NFC chips. One tap opens your chosen song, playlist, video, or link.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0D0D10] p-8 flex flex-col md:flex-row-reverse gap-8 items-center hover:border-white/20 transition-all duration-300">
            <div className="w-full md:w-1/2 aspect-[1.5/1] rounded-xl overflow-hidden border border-white/10 bg-white/5 relative select-none">
              <img 
                src="/images/tap-tiles/main-mockup.jpg" 
                alt="FeelsNeat Tap Tiles magnets and keychains" 
                className="w-full h-full object-cover opacity-100 group-hover:scale-102 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 text-left pointer-events-none">
                <span className="text-[8px] font-black text-[#E30613] tracking-widest uppercase">Tap Tile Mockups</span>
                <p className="text-xs font-bold text-white uppercase mt-0.5">"Magnets & Keychains in physical form."</p>
              </div>
            </div>
            <div className="w-full md:w-1/2 space-y-6 text-left">
              <span className="text-xs font-black text-[#E30613] uppercase tracking-widest block">Interactive Mini Collectibles</span>
              <h3 className="text-2xl font-black text-[#F4F4F5] uppercase tracking-tight leading-none">
                Small Art. One Tap. A Whole Memory.
              </h3>
              <p className="text-sm sm:text-base text-[#F4F4F5]/90 leading-relaxed font-semibold">
                Available as magnets or keychains. Combine retro snapshots, quotes, or jokes with Spotify songs, YouTube clips, or shared Google Photos albums.
              </p>
              <div className="pt-4 flex gap-4">
                <Link
                  href="/tap-tiles"
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-[#E30613] hover:bg-white hover:text-black text-xs font-black uppercase tracking-wider text-white px-6 transition-colors duration-300 shadow-md"
                >
                  Explore Tap Tiles Collection
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: OBSERVATIONS (Merged) */}
        <section id="observations" className="space-y-10 scroll-reveal border-t border-white/10 pt-16">
          <div className="max-w-2xl text-left">
            <span className="text-sm font-black text-[#E30613] uppercase tracking-widest block mb-2">Reflections</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#F4F4F5] uppercase tracking-tight">
              Observations
            </h2>
            <p className="mt-3 text-base text-[#F4F4F5]/75 font-semibold">
              A curated index of our thoughts, research, and technical notes from the FeelsNeat journey, hosted on Substack.
            </p>
          </div>

          <div className="grid gap-6">
            {posts.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-white/5">
                <p className="text-xs text-[#F4F4F5]/60 italic uppercase tracking-wider">No publications found.</p>
              </div>
            ) : (
              posts.map((post) => {
                const format = getFormatInfo(post);
                return (
                  <a 
                    key={post.guid || post.link}
                    href={post.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex flex-col md:flex-row gap-6 p-6 rounded-2xl border border-white/10 bg-[#0E0E12] hover:border-[#E30613] transition-all duration-300 shadow-sm text-left items-stretch"
                  >
                    {/* Image Thumbnail Block */}
                    {post.thumbnail && (
                      <div className="w-full md:w-48 aspect-[16/10] md:aspect-auto rounded-xl overflow-hidden border border-white/5 bg-white/5 relative shrink-0 select-none">
                        <img 
                          src={post.thumbnail} 
                          alt={post.title} 
                          className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    )}

                    {/* Text Meta Content */}
                    <div className="flex flex-col flex-1 py-1">
                      <div className="flex items-center justify-between w-full text-[10px] font-black text-[#F4F4F5]/60 uppercase tracking-wider mb-3 gap-2">
                        <div className="flex items-center gap-2">
                          <time>{formatDate(post.pubDate)}</time>
                          <span>•</span>
                          <span>{post.readingTime || '2 min read'}</span>
                        </div>
                        
                        <span className="flex items-center gap-1 text-[#E30613]">
                          <LucideIcon name={format.icon} className="h-3.5 w-3.5" />
                          {format.label}
                        </span>
                      </div>
                      
                      <h2 className="text-lg font-bold text-[#F4F4F5] uppercase tracking-tight leading-snug mb-3 group-hover:text-[#E30613] transition-colors duration-200">
                        {post.title}
                      </h2>
                      
                      <p className="text-xs text-[#F4F4F5]/80 leading-relaxed mb-6 font-medium line-clamp-3">
                        {post.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-4 items-center justify-between w-full pt-4 border-t border-white/5 mt-auto">
                        <div className="flex flex-wrap gap-1.5">
                          {(post.categories || []).map((tag) => (
                            <span key={tag} className="text-[8px] font-black uppercase text-[#F4F4F5]/80 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-xs font-black text-[#F4F4F5] uppercase tracking-wider group-hover:text-[#E30613] transition-colors border-b border-[#F4F4F5] group-hover:border-[#E30613] pb-0.5">
                          {format.label === 'Video Guide' ? 'Watch Video' : format.label === 'Podcast Episode' ? 'Listen Episode' : 'Read Article'} <LucideIcon name="ArrowRight" className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </a>
                );
              })
            )}
          </div>
        </section>

      </div>
    </main>
  );
}
