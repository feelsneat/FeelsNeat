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
    <div className="flex flex-col w-full bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-28 border-b border-border-custom bg-[#FAF8F5]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-border-custom px-3 py-1 text-xs font-semibold text-foreground/80 mb-6">
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

      {/* Intro Philosophy Section */}
      <section className="py-16 bg-background">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid md:grid-cols-12 gap-8 items-baseline">
            <h2 className="text-xl font-extrabold text-foreground md:col-span-4">
              {homeData.title}
            </h2>
            <div 
              className="text-base text-foreground/80 md:col-span-8 space-y-4 leading-relaxed prose"
              dangerouslySetInnerHTML={{ __html: homeData.content }}
            />
          </div>
        </div>
      </section>

      {/* What We Do Services Snippet */}
      <section className="py-16 border-y border-border-custom bg-[#FAF8F5]/50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
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
              <div 
                key={service.slug} 
                className="flex flex-col p-6 rounded-xl border border-border-custom bg-background shadow-xs"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background mb-4">
                  <LucideIcon name={service.icon} className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{service.title}</h3>
                <p className="text-sm text-foreground/70 leading-relaxed flex-1">{service.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Selected Work Summary Grid */}
      <section className="py-16 bg-background">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
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
                className="group flex flex-col p-5 rounded-xl border border-border-custom bg-background shadow-xs hover:border-foreground/20 transition-colors"
              >
                {/* Visual Cover Gradient Panel */}
                <div className="w-full aspect-[1.8/1] rounded-lg bg-gradient-to-tr from-foreground/95 to-foreground/80 mb-5 flex flex-col justify-end p-5 relative overflow-hidden">
                  <span className="text-[10px] font-bold text-background/60 tracking-wider uppercase mb-1">{project.client}</span>
                  <h3 className="text-lg font-extrabold text-background leading-snug">{project.title}</h3>
                </div>
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

      {/* Observations Summary Index (Curated Substack & YouTube) */}
      <section className="py-16 border-t border-border-custom bg-[#FAF8F5]/30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
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
              // Primary link is Substack, fallback to YouTube if it's a video observation
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

      {/* Tidy CTA Section */}
      <section className="py-16 bg-foreground text-background border-t border-border-custom">
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
