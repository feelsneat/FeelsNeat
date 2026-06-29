import Link from 'next/link';
import { getPage, getServices, getWork, getObservations } from '@/lib/cms';
import { LucideIcon } from '@/components/ui/LucideIcon';
import { BlueprintCanvas } from '@/components/interactive/BlueprintCanvas';

export const runtime = 'edge';

export default async function HomePage() {
  const homeData = await getPage('home');
  const services = (await getServices()).slice(0, 3);
  const work = (await getWork()).slice(0, 2);
  const observations = (await getObservations()).slice(0, 3); // Show up to 3 observations

  return (
    <div className="flex flex-col w-full bg-background overflow-hidden">
      {/* Hero Section with Interactive Blueprint canvas grid */}
      <section className="relative overflow-hidden py-24 md:py-32 border-b border-border-custom bg-[#FAF8F5]">
        <BlueprintCanvas />
        <div className="mx-auto max-w-5xl px-4 sm:px-6 relative z-10 pointer-events-none">
          <div className="max-w-3xl pointer-events-auto animate-slide-up">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-border-custom px-3 py-1 text-xs font-semibold text-foreground/80 mb-6 border border-border-custom/50">
              <span className="h-1.5 w-1.5 rounded-full bg-foreground animate-pulse" />
              Active Explorations
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground leading-tight">
              {homeData.subtitle}
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-foreground/75 font-medium leading-relaxed">
              {homeData.tagline}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href={homeData.heroActionPath || '/our-work'}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-foreground px-6 text-sm font-bold text-background hover:bg-accent-custom transition-colors cursor-pointer shadow-xs"
              >
                {homeData.heroActionText || 'Explore Our Work'}
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-border-custom px-6 text-sm font-bold text-foreground hover:bg-border-custom/30 transition-colors cursor-pointer"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Intro Philosophy Section (Scroll animation enabled) */}
      <section className="py-20 bg-background scroll-reveal">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid md:grid-cols-12 gap-8 items-baseline">
            <h2 className="text-xl font-extrabold text-foreground md:col-span-4 uppercase tracking-wider">
              {homeData.title}
            </h2>
            <div 
              className="text-base text-foreground/80 md:col-span-8 space-y-4 leading-relaxed prose"
              dangerouslySetInnerHTML={{ __html: homeData.content }}
            />
          </div>
        </div>
      </section>

      {/* What We Do Services Snippet (Clickable and Cover graphic enabled) */}
      <section className="py-20 border-y border-border-custom bg-[#FAF8F5]/50 scroll-reveal">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-foreground">Services & Expertise</h2>
              <p className="text-sm text-foreground/70 mt-1">Practical ways we create digital value.</p>
            </div>
            <Link href="/what-we-do" className="mt-3 sm:mt-0 inline-flex items-center gap-1.5 text-sm font-bold text-foreground hover:underline">
              All services <LucideIcon name="ArrowRight" className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {services.map((service) => (
              <Link 
                key={service.slug} 
                href={`/what-we-do#${service.slug}`}
                className="group flex flex-col p-5 rounded-xl border border-border-custom bg-background hover:border-foreground/20 hover:shadow-xs transition-all duration-200 cursor-pointer"
              >
                {/* Thin graphic cover in different aspect ratio (2.2/1) than Work case studies */}
                {service.image ? (
                  <div className="w-full aspect-[2.2/1] rounded-lg overflow-hidden border border-border-custom bg-zinc-50 mb-5 relative group-hover:opacity-95 transition-opacity">
                    <img 
                      src={service.image} 
                      alt={service.title} 
                      className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    {/* Floating Icon badge on bottom left of the graphic */}
                    <div className="absolute bottom-2 left-2 flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background border border-border-custom shadow-xs">
                      <LucideIcon name={service.icon} className="h-4 w-4" />
                    </div>
                  </div>
                ) : (
                  /* Fallback if no graphic exists */
                  <div className="w-full aspect-[2.2/1] rounded-lg bg-zinc-100 mb-5 flex items-center justify-center relative border border-border-custom">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background">
                      <LucideIcon name={service.icon} className="h-4.5 w-4.5" />
                    </div>
                  </div>
                )}
                
                <h3 className="text-base font-extrabold text-foreground mb-2 group-hover:text-accent-custom transition-colors">
                  {service.title}
                </h3>
                <p className="text-xs text-foreground/70 leading-relaxed flex-1">
                  {service.summary}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Selected Work Summary Grid (Scroll animations enabled) */}
      <section className="py-20 bg-background scroll-reveal">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-foreground">Selected Work</h2>
              <p className="text-sm text-foreground/70 mt-1">Prototyped tools, experiments, and refresh work.</p>
            </div>
            <Link href="/our-work" className="mt-3 sm:mt-0 inline-flex items-center gap-1.5 text-sm font-bold text-foreground hover:underline">
              All projects <LucideIcon name="ArrowRight" className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {work.map((project) => (
              <Link 
                key={project.slug} 
                href={`/our-work/${project.slug}`}
                className="group flex flex-col p-5 rounded-xl border border-border-custom bg-background shadow-xs hover:border-foreground/20 transition-all duration-200"
              >
                {/* Visual Cover Image Panel */}
                <div className="w-full aspect-[1.8/1] rounded-lg mb-5 relative overflow-hidden border border-border-custom bg-zinc-50 shadow-2xs">
                  {project.coverImage ? (
                    <img 
                      src={project.coverImage} 
                      alt={project.title} 
                      className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-tr from-foreground/95 to-foreground/80 flex flex-col justify-end p-5">
                      <span className="text-[10px] font-bold text-background/60 tracking-wider uppercase mb-1">{project.client}</span>
                      <h3 className="text-lg font-extrabold text-background leading-snug">{project.title}</h3>
                    </div>
                  )}
                </div>

                {/* Title & Client for cover image projects */}
                {project.coverImage && (
                  <div className="mb-3">
                    <span className="text-[9px] font-bold text-foreground/50 tracking-wider uppercase block mb-1">{project.client}</span>
                    <h3 className="text-lg font-black text-foreground group-hover:text-accent-custom transition-colors leading-snug">{project.title}</h3>
                  </div>
                )}
                <p className="text-sm text-foreground/75 leading-relaxed mb-4 flex-1">{project.summary}</p>
                <div className="flex flex-wrap gap-2 items-center justify-between pt-3 border-t border-border-custom/50">
                  <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wide bg-border-custom/50 px-2 py-0.5 rounded-md">
                    {project.category}
                  </span>
                  <span className="text-[10px] font-bold text-foreground/50">{project.status}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Observations Summary Index (Scroll animations enabled) */}
      <section className="py-20 border-t border-border-custom bg-[#FAF8F5]/30 scroll-reveal">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-foreground">
                {homeData.observationsTitle || 'Observations'}
              </h2>
              <p className="text-sm text-foreground/70 mt-1">
                {homeData.observationsSubtitle || 'Notes on simplicity, engineering, and design.'}
              </p>
            </div>
            <a 
              href="https://substack.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="mt-3 sm:mt-0 inline-flex items-center gap-1.5 text-sm font-bold text-foreground hover:underline"
            >
              Follow on Substack <LucideIcon name="ExternalLink" className="h-4 w-4" />
            </a>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {observations.map((post) => {
              const targetUrl = post.externalSubstackUrl || post.youtubeUrl || 'https://substack.com';
              const isVideo = !!post.youtubeUrl && !post.externalSubstackUrl;
              
              return (
                <a 
                  key={post.slug}
                  href={targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col p-5 rounded-xl border border-border-custom bg-background shadow-xs hover:border-foreground/20 transition-all duration-200"
                >
                  <div className="flex items-center justify-between text-[10px] font-bold text-foreground/50 uppercase mb-3">
                    <time>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</time>
                    <span className="flex items-center gap-1">
                      <LucideIcon name={isVideo ? 'Youtube' : 'BookOpen'} className="h-3 w-3" />
                      {isVideo ? 'Video' : 'Article'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-foreground leading-snug mb-2 group-hover:underline">
                    {post.title}
                  </h3>
                  <p className="text-xs text-foreground/70 leading-relaxed flex-1 mb-4">{post.summary}</p>
                  
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-[9px] font-semibold text-foreground/60 bg-border-custom/30 px-1.5 py-0.5 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-foreground group-hover:translate-x-0.5 transition-transform mt-auto">
                    {isVideo ? 'Watch Video' : 'Read Article'} <LucideIcon name="ArrowUpRight" className="h-3.5 w-3.5" />
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section (Scroll animations enabled) */}
      <section className="py-20 bg-foreground text-background border-t border-border-custom scroll-reveal">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center space-y-6">
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Let's build simple solutions.</h2>
          <p className="mx-auto max-w-lg text-sm text-background/70 leading-relaxed font-medium">
            If you share our appreciation for clean, focused, and high-performance digital solutions, we would love to connect.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-background px-8 text-sm font-bold text-foreground hover:bg-border-custom transition-colors shadow-xs cursor-pointer"
            >
              Start a Conversation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
