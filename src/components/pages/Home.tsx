import Link from 'next/link';
import { getPage, getServices, getWork, getObservations } from '@/lib/cms';
import { LucideIcon } from '@/components/ui/LucideIcon';

export const runtime = 'edge';

export default async function HomePage() {
  const homeData = await getPage('home');
  const services = (await getServices()).slice(0, 4); // Fetch up to 4 services for layout flexibility
  const work = (await getWork()).slice(0, 2);
  const observations = (await getObservations()).slice(0, 3); // Show up to 3 observations

  return (
    <div className="flex flex-col w-full bg-background overflow-hidden">
      {/* 
        PREMIUM HERO SECTION (Tresmares Capital SOTD Visual Style)
        Features a full-screen high-contrast grayscale architectural image background
        with massive typography overlay and bottom-right aligned narrative blocks.
      */}
      <section className="relative h-[85vh] sm:h-[90vh] flex items-center bg-zinc-950 text-white overflow-hidden border-b border-zinc-900">
        {/* Grayscale background image generated for high contrast perspective */}
        <div 
          className="absolute inset-0 bg-cover bg-center grayscale opacity-80 z-0" 
          style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
        />
        
        {/* Dark subtle gradient shadow overlays to guarantee copy readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/70 via-zinc-950/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-zinc-950/20 z-10" />

        <div className="mx-auto max-w-5xl w-full px-4 sm:px-6 relative z-20 h-full flex flex-col justify-between py-16 sm:py-24">
          {/* Top Label */}
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 text-[10px] font-black text-white uppercase tracking-widest animate-fade-in">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-custom animate-ping" />
              Active Exploration Studio
            </span>
          </div>

          {/* Middle: Massive Bold Typography (Visual Flow of SOTD website) */}
          <div className="max-w-3xl my-auto pt-10 animate-slide-up">
            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tighter leading-none uppercase drop-shadow-lg text-white font-sans select-none">
              DESIGN <br />
              FOR <span className="text-accent-custom">CLARITY.</span>
            </h1>
          </div>

          {/* Bottom Row: Left "Scroll" and Right "Description Narrative & Action" */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-6 border-t border-white/15 w-full">
            <span className="text-[10px] font-black text-white/50 uppercase tracking-widest hidden sm:inline-block">
              [ Scroll to explore ]
            </span>

            <div className="sm:text-right space-y-4 max-w-sm ml-auto">
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-medium">
                {homeData.tagline}
              </p>
              <div className="pt-2 flex justify-start sm:justify-end gap-4">
                <Link
                  href="/our-work"
                  className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-white hover:text-accent-custom transition-colors border-b border-white hover:border-accent-custom pb-0.5"
                >
                  Explore Showcase <LucideIcon name="ArrowRight" className="h-3.5 w-3.5 text-accent-custom" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Intro Philosophy Section (Generous clean padding) */}
      <section className="py-24 bg-white border-b border-zinc-100 scroll-reveal relative">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid md:grid-cols-12 gap-8 md:gap-16 items-start">
            <div className="md:col-span-4 space-y-2">
              <span className="text-[10px] font-black text-accent-custom uppercase tracking-widest block">Philosophy</span>
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight leading-none">
                {homeData.title}
              </h2>
            </div>
            <div 
              className="text-base text-zinc-600 md:col-span-8 space-y-6 leading-relaxed prose max-w-none"
              dangerouslySetInnerHTML={{ __html: homeData.content }}
            />
          </div>
        </div>
      </section>

      {/* 
        SERVICES CAPABILITIES SECTION WITH SOLID RED BAR OVERLAY (SOTD visual replica)
        Recreates the exact design layout: Left menu text list, center botanical silhouette 
        with horizontal solid red bar crossing it, right side key metrics and tags.
      */}
      <section className="py-28 bg-white border-b border-zinc-100 scroll-reveal">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-20">
            <div>
              <span className="text-[10px] font-black text-accent-custom uppercase tracking-widest block mb-2">Capabilities</span>
              <h2 className="text-3xl font-black tracking-tight text-foreground uppercase">Services & Expertise</h2>
            </div>
            <Link 
              href="/what-we-do" 
              className="mt-4 sm:mt-0 inline-flex items-center gap-1.5 text-xs font-black text-foreground uppercase tracking-wider hover:text-accent-custom transition-colors"
            >
              All capabilities <LucideIcon name="ArrowRight" className="h-3.5 w-3.5 text-accent-custom" />
            </Link>
          </div>

          {/* Split grid layout */}
          <div className="grid md:grid-cols-12 gap-12 items-center">
            {/* Left Column: Menu Text List */}
            <div className="md:col-span-4 space-y-8">
              <div className="space-y-4">
                <span className="text-[9px] font-black text-accent-custom uppercase tracking-widest block">Menu Selection</span>
                <nav className="flex flex-col divide-y divide-zinc-100 border-y border-zinc-100">
                  {services.map((service, idx) => (
                    <Link
                      key={service.slug}
                      href={`/what-we-do#${service.slug}`}
                      className="group flex items-center justify-between py-3.5 text-xs font-black uppercase tracking-wider text-neutral-gray hover:text-foreground transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-[9px] text-accent-custom">0{idx + 1}.</span>
                        {service.title}
                      </span>
                      <LucideIcon name="ArrowUpRight" className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-accent-custom" />
                    </Link>
                  ))}
                </nav>
              </div>
            </div>

            {/* Center Column: Grayscale image with Solid Red Bar Overlay (Visual replica) */}
            <div className="md:col-span-4 flex justify-center">
              <div className="relative w-full max-w-[280px] aspect-[1/1.2] rounded-lg overflow-hidden border border-zinc-150 bg-zinc-50 flex items-center justify-center shadow-xs">
                {/* Botanical Grayscale image background */}
                <img 
                  src="/images/services-stem.jpg" 
                  alt="Botanical Stem Silhouette" 
                  className="absolute inset-0 h-full w-full object-cover grayscale opacity-90"
                />
                
                {/* Solid bright red horizontal bar crossing the center exactly like the screen recording */}
                <div className="absolute left-0 right-0 h-16 bg-[#E30613] mix-blend-normal opacity-100 shadow-md z-10 border-y border-[#B9050F]" />
              </div>
            </div>

            {/* Right Column: Key metrics and technical capability notes */}
            <div className="md:col-span-4 space-y-6">
              <div className="p-6 bg-zinc-50 rounded-lg border border-zinc-100/60 space-y-6">
                <div>
                  <span className="text-[8px] font-black text-accent-custom uppercase tracking-widest block mb-1">Standard</span>
                  <h4 className="text-xl font-extrabold text-foreground uppercase leading-none tracking-tight">Clarity & Usability</h4>
                </div>
                <div className="space-y-4 text-xs text-neutral-gray leading-relaxed">
                  <p>
                    We structure products and platforms in three axes—meaningful design, performance engineering, and simple workflows.
                  </p>
                  <p>
                    No complex software jargon. We build interfaces that are clean, fast, and satisfying to use.
                  </p>
                </div>
                <div className="pt-2 border-t border-zinc-200/50 flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 bg-white border border-zinc-200 text-[8px] font-black uppercase text-foreground/70 rounded">100% Custom</span>
                  <span className="px-2 py-0.5 bg-white border border-zinc-200 text-[8px] font-black uppercase text-foreground/70 rounded">High Perf</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Selected Work Summary Grid (Parallax-esque cover cards with bold borders) */}
      <section className="py-24 bg-white border-b border-zinc-100 scroll-reveal">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16">
            <div>
              <span className="text-[10px] font-black text-accent-custom uppercase tracking-widest block mb-2">Showcase</span>
              <h2 className="text-3xl font-black tracking-tight text-foreground uppercase">Selected Work</h2>
            </div>
            <Link 
              href="/our-work" 
              className="mt-4 sm:mt-0 inline-flex items-center gap-1.5 text-xs font-black text-foreground uppercase tracking-wider hover:text-accent-custom transition-colors"
            >
              All projects <LucideIcon name="ArrowRight" className="h-3.5 w-3.5 text-accent-custom" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {work.map((project) => (
              <Link 
                key={project.slug} 
                href={`/our-work/${project.slug}`}
                className="group flex flex-col cursor-pointer"
              >
                {/* Visual Cover Image Panel with thin outline */}
                <div className="w-full aspect-[1.8/1] rounded-lg mb-6 relative overflow-hidden border border-zinc-100 bg-zinc-50 shadow-2xs group-hover:border-zinc-200 transition-colors">
                  {project.coverImage ? (
                    <img 
                      src={project.coverImage} 
                      alt={project.title} 
                      className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-zinc-950 flex flex-col justify-end p-6">
                      <span className="text-[10px] font-bold text-white/50 tracking-wider uppercase mb-1">{project.client}</span>
                      <h3 className="text-lg font-black text-white uppercase leading-snug">{project.title}</h3>
                    </div>
                  )}
                </div>

                {/* Text meta styled clean */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-black text-neutral-gray uppercase tracking-widest">
                    <span>{project.client}</span>
                    <span className="text-accent-custom">{project.category}</span>
                  </div>
                  <h3 className="text-xl font-black text-foreground uppercase group-hover:text-accent-custom transition-colors leading-snug tracking-tight">
                    {project.title}
                  </h3>
                  <p className="text-xs text-neutral-gray leading-relaxed max-w-xl">
                    {project.summary}
                  </p>
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-foreground group-hover:text-accent-custom transition-colors">
                      Read case study <LucideIcon name="ArrowRight" className="h-3 w-3 translate-x-0 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Observations Summary Index (Tresmares styled column grid) */}
      <section className="py-24 bg-white border-b border-zinc-100 scroll-reveal">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16">
            <div>
              <span className="text-[10px] font-black text-accent-custom uppercase tracking-widest block mb-2">Observations</span>
              <h2 className="text-3xl font-black tracking-tight text-foreground uppercase">
                {homeData.observationsTitle || 'Observations'}
              </h2>
            </div>
            <a 
              href="https://substack.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="mt-4 sm:mt-0 inline-flex items-center gap-1.5 text-xs font-black text-foreground uppercase tracking-wider hover:text-accent-custom transition-colors"
            >
              Follow on Substack <LucideIcon name="ExternalLink" className="h-3.5 w-3.5 text-accent-custom" />
            </a>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {observations.map((post) => {
              const targetUrl = post.externalSubstackUrl || post.youtubeUrl || 'https://substack.com';
              const isVideo = !!post.youtubeUrl && !post.externalSubstackUrl;
              
              return (
                <a 
                  key={post.slug}
                  href={targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col p-6 rounded-lg border border-zinc-100 bg-white hover:border-zinc-200 transition-all duration-300"
                >
                  <div className="flex items-center justify-between text-[9px] font-black text-neutral-gray uppercase tracking-widest mb-4">
                    <time>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</time>
                    <span className="flex items-center gap-1 text-accent-custom">
                      <LucideIcon name={isVideo ? 'Youtube' : 'BookOpen'} className="h-3 w-3" />
                      {isVideo ? 'Video' : 'Article'}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-foreground uppercase leading-snug mb-3 group-hover:text-accent-custom transition-colors tracking-tight">
                    {post.title}
                  </h3>
                  <p className="text-xs text-neutral-gray leading-relaxed flex-1 mb-4">{post.summary}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-[8px] font-black uppercase text-foreground/60 bg-zinc-50 border border-zinc-100 px-1.5 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-foreground group-hover:text-accent-custom transition-colors mt-auto">
                    {isVideo ? 'Watch Video' : 'Read Article'} <LucideIcon name="ArrowUpRight" className="h-3 w-3" />
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Modern, solid dark CTA Section (Inspired by Tresmares) */}
      <section className="py-24 bg-foreground text-background relative overflow-hidden">
        {/* Small subtle morphing blob overlay */}
        <div className="morphing-blob absolute bottom-[-100px] left-[-100px] opacity-10" />

        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center space-y-8 relative z-10 scroll-reveal">
          <span className="text-[10px] font-black text-accent-custom uppercase tracking-widest block">Collaborate</span>
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl uppercase">Let's build simple solutions.</h2>
          <p className="mx-auto max-w-lg text-sm text-zinc-400 leading-relaxed font-medium">
            If you share our appreciation for clean, focused, and high-performance digital solutions, we would love to connect.
          </p>
          <div className="pt-4">
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-background px-8 text-xs font-black text-foreground uppercase tracking-wider hover:bg-accent-custom hover:text-white transition-colors shadow-sm cursor-pointer"
            >
              Start a Conversation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
