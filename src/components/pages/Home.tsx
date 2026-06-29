import Link from 'next/link';
import { getPage, getServices, getWork, getObservations } from '@/lib/cms';
import { LucideIcon } from '@/components/ui/LucideIcon';

export const runtime = 'edge';

export default async function HomePage() {
  const homeData = await getPage('home');
  const services = (await getServices()).slice(0, 3);
  const work = (await getWork()).slice(0, 2);
  const observations = (await getObservations()).slice(0, 3); // Show up to 3 observations

  return (
    <div className="flex flex-col w-full bg-background overflow-hidden">
      {/* Premium Hero Section with Morphing Red Blob (Tresmares Capital style) */}
      <section className="relative overflow-hidden py-28 md:py-36 bg-white border-b border-zinc-100">
        {/* Animated Morphing red blobs in the background */}
        <div className="morphing-blob-large absolute -top-40 -right-40" />
        <div className="morphing-blob absolute top-1/2 left-1/3 opacity-50" />
        
        {/* Subtle architectural vertical layout line */}
        <div className="absolute top-0 bottom-0 left-[20%] w-[1px] bg-zinc-100/50 hidden md:block" />
        <div className="absolute top-0 bottom-0 left-[80%] w-[1px] bg-zinc-100/50 hidden md:block" />

        <div className="mx-auto max-w-5xl px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl animate-slide-up">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-accent-custom/5 border border-accent-custom/10 px-3 py-1 text-[10px] font-black text-accent-custom uppercase tracking-widest mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-custom animate-ping" />
              Digital Craftsmanship
            </span>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-tight uppercase font-sans">
              {homeData.subtitle}
            </h1>
            <p className="mt-8 text-lg sm:text-xl text-neutral-gray font-medium leading-relaxed max-w-2xl">
              {homeData.tagline}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href={homeData.heroActionPath || '/our-work'}
                className="inline-flex h-12 items-center justify-center rounded-lg bg-foreground px-8 text-xs font-black text-background uppercase tracking-wider hover:bg-accent-custom transition-all duration-300 shadow-sm hover:scale-[1.01]"
              >
                {homeData.heroActionText || 'Explore Our Work'}
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-zinc-200 px-8 text-xs font-black text-foreground uppercase tracking-wider hover:bg-zinc-50 transition-colors"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Intro Philosophy Section (Scroll animation and thin borders) */}
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

      {/* Services & Expertise (Minimal layout separated by 1px thin grid lines) */}
      <section className="py-24 bg-white border-b border-zinc-100 scroll-reveal">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16">
            <div>
              <span className="text-[10px] font-black text-accent-custom uppercase tracking-widest block mb-2">Capabilities</span>
              <h2 className="text-3xl font-black tracking-tight text-foreground uppercase">Services & Expertise</h2>
            </div>
            <Link 
              href="/what-we-do" 
              className="mt-4 sm:mt-0 inline-flex items-center gap-1.5 text-xs font-black text-foreground uppercase tracking-wider hover:text-accent-custom transition-colors"
            >
              All services <LucideIcon name="ArrowRight" className="h-3.5 w-3.5 text-accent-custom" />
            </Link>
          </div>

          {/* Thin border separated structural cards */}
          <div className="grid md:grid-cols-3 border border-zinc-100 rounded-lg overflow-hidden divide-y md:divide-y-0 md:divide-x divide-zinc-100 bg-white">
            {services.map((service, index) => (
              <Link 
                key={service.slug} 
                href={`/what-we-do#${service.slug}`}
                className="group flex flex-col p-8 hover:bg-zinc-50/50 transition-all duration-300 cursor-pointer"
              >
                <div className="flex justify-between items-start mb-8">
                  {/* Accent colored icon */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-50 border border-zinc-100 text-accent-custom group-hover:bg-accent-custom group-hover:text-white group-hover:border-accent-custom transition-all duration-300">
                    <LucideIcon name={service.icon} className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-black text-zinc-300 group-hover:text-accent-custom/30 transition-colors">0{index + 1}</span>
                </div>
                
                <h3 className="text-base font-black text-foreground mb-3 group-hover:text-accent-custom transition-colors uppercase tracking-tight">
                  {service.title}
                </h3>
                <p className="text-xs text-neutral-gray leading-relaxed flex-1">
                  {service.summary}
                </p>
                <div className="mt-8 flex items-center gap-1 text-[10px] font-black uppercase text-foreground group-hover:text-accent-custom transition-colors">
                  <span>Explore Capablity</span>
                  <LucideIcon name="ArrowRight" className="h-3 w-3 translate-x-0 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
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
