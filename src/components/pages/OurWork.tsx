import { Metadata } from 'next';
import Link from 'next/link';
import { getWork } from '@/lib/cms';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Our Work',
  description: 'A showcase of visual layouts, software engineering, and web tools built by FeelsNeat.',
};

export default async function OurWorkPage() {
  const projects = await getWork();

  return (
    <main className="flex-1 w-full bg-background py-16 sm:py-24 border-b border-border-custom">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Page Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest block mb-3">Portfolio</span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Our Work
          </h1>
          <p className="mt-6 text-lg text-foreground/75 leading-relaxed font-medium">
            A visual index of everything we design, prototype, and build. This includes digital products, internal developer tools, visual refreshes, and creative code sandbox experiments.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 gap-10 mt-12">
          {projects.map((project) => (
            <Link 
              key={project.slug}
              href={`/our-work/${project.slug}`}
              className="group flex flex-col p-5 rounded-xl border border-border-custom bg-background hover:border-foreground/20 transition-all duration-200 shadow-xs"
            >
              {/* Cover Image Visualizer */}
              <div className="w-full aspect-[1.8/1] rounded-lg mb-5 relative overflow-hidden border border-border-custom bg-zinc-50 shadow-2xs">
                {project.coverImage ? (
                  <img 
                    src={project.coverImage} 
                    alt={project.title} 
                    className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-foreground/95 to-foreground/80 flex flex-col justify-end p-5">
                    <span className="text-[10px] font-bold text-background/60 tracking-wider uppercase mb-1">{project.client}</span>
                    <h2 className="text-xl font-extrabold text-background leading-snug">{project.title}</h2>
                  </div>
                )}
              </div>

              {/* Title & Client for cover image projects */}
              {project.coverImage && (
                <div className="mb-3">
                  <span className="text-[9px] font-bold text-foreground/50 tracking-wider uppercase block mb-1">{project.client}</span>
                  <h2 className="text-lg font-black text-foreground group-hover:text-accent-custom transition-colors leading-snug">{project.title}</h2>
                </div>
              )}

              {/* Text Meta */}
              <div className="flex-1 flex flex-col justify-between">
                <p className="text-sm text-foreground/75 leading-relaxed mb-6">
                  {project.summary}
                </p>
                <div className="flex flex-wrap gap-2 items-center justify-between pt-4 border-t border-border-custom/50">
                  <div className="flex flex-wrap gap-1">
                    {(project.tags || []).map((tag) => (
                      <span key={tag} className="inline-flex items-center rounded-md bg-border-custom/40 px-2 py-0.5 text-[9px] font-semibold text-foreground/70">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-bold text-foreground/50">
                    <span className="uppercase tracking-wider">{project.category}</span>
                    <span>&bull;</span>
                    <span>{project.status}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
