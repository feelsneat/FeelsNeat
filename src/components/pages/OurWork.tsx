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
    <main className="flex-1 w-full bg-background py-20 sm:py-28 border-b border-border-custom relative">
      {/* Morphing background shapes */}
      <div className="morphing-blob absolute top-10 left-10 opacity-20" />
      <div className="morphing-blob-large absolute bottom-10 right-10 opacity-30" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 relative z-10">
        {/* Page Header */}
        <div className="max-w-3xl mb-20 scroll-reveal">
          <span className="text-[10px] font-black text-accent-custom uppercase tracking-widest block mb-3">Portfolio</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground uppercase">
            Our Work
          </h1>
          <p className="mt-6 text-lg text-neutral-gray leading-relaxed font-medium">
            A visual index of everything we design, prototype, and build. This includes digital products, internal developer tools, visual refreshes, and creative code sandbox experiments.
          </p>
        </div>

        {/* Projects Grid with thin borders */}
        <div className="grid md:grid-cols-2 gap-12 mt-12 border-t border-zinc-900 pt-16">
          {projects.map((project) => (
            <Link 
              key={project.slug}
              href={`/our-work/${project.slug}`}
              className="group flex flex-col cursor-pointer scroll-reveal"
            >
              {/* Cover Image Visualizer */}
              <div className="w-full aspect-[1.8/1] rounded-lg mb-6 relative overflow-hidden border border-zinc-900 bg-zinc-900/20 shadow-lg group-hover:border-zinc-800 transition-colors">
                {project.coverImage ? (
                  <img 
                    src={project.coverImage} 
                    alt={project.title} 
                    className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 bg-zinc-950 flex flex-col justify-end p-6">
                    <span className="text-[10px] font-bold text-white/50 tracking-wider uppercase mb-1">{project.client}</span>
                    <h2 className="text-xl font-black text-white uppercase leading-snug">{project.title}</h2>
                  </div>
                )}
              </div>

              {/* Text Meta */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] font-black text-neutral-gray uppercase tracking-widest">
                  <span>{project.client}</span>
                  <span className="text-accent-custom">{project.category}</span>
                </div>
                <h2 className="text-xl font-black text-foreground uppercase group-hover:text-accent-custom transition-colors leading-snug tracking-tight">
                  {project.title}
                </h2>
                <p className="text-xs text-neutral-gray leading-relaxed">
                  {project.summary}
                </p>
                
                <div className="flex flex-wrap gap-2 items-center justify-between pt-4 border-t border-zinc-900 mt-4">
                  <div className="flex flex-wrap gap-1">
                    {(project.tags || []).map((tag) => (
                      <span key={tag} className="inline-flex items-center rounded-md bg-zinc-900 border border-zinc-800/80 px-2 py-0.5 text-[8px] font-black uppercase text-zinc-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 text-[9px] font-black text-neutral-gray uppercase tracking-widest">
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
