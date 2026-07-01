import { Metadata } from 'next';
import Link from 'next/link';
import { getWork } from '@/lib/cms';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Our Work',
  description: 'A showcase of visual layouts, templates, and systems built by FeelsNeat.',
};

export default async function OurWorkPage() {
  const projects = await getWork();

  return (
    <main className="flex-1 w-full bg-[#0A0A0C] py-20 sm:py-28 border-b border-white/10 relative">
      {/* Morphing background shapes */}
      <div className="morphing-blob absolute top-10 left-10 opacity-20" />
      <div className="morphing-blob-large absolute bottom-10 right-10 opacity-30" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 relative z-10">
        {/* Page Header */}
        <div className="max-w-3xl mb-20 scroll-reveal">
          <span className="text-[10px] font-black text-[#E30613] uppercase tracking-widest block mb-3">Portfolio</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#F4F4F5] uppercase">
            Our Work
          </h1>
          <p className="mt-6 text-base sm:text-lg text-[#F4F4F5] leading-relaxed font-medium">
            A visual index of everything we design, prototype, and build. This includes digital products, internal developer tools, visual refreshes, and creative sandbox experiments.
          </p>
        </div>

        {/* Projects Grid with thin borders */}
        <div className="grid md:grid-cols-2 gap-12 mt-12 border-t border-white/10 pt-16">
          {projects.map((project) => (
            <Link 
              key={project.slug}
              href={`/our-work/${project.slug}`}
              className="group flex flex-col cursor-pointer scroll-reveal"
            >
              {/* Cover Image Visualizer */}
              <div className="w-full aspect-[1.8/1] rounded-lg mb-6 relative overflow-hidden border border-white/10 bg-white/5 shadow-sm group-hover:border-[#E30613] transition-colors">
                {project.coverImage ? (
                  <img 
                    src={project.coverImage} 
                    alt={project.title} 
                    className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[#0E0E12] flex flex-col justify-end p-6">
                    <span className="text-[10px] font-bold text-[#F4F4F5]/50 tracking-wider uppercase mb-1">{project.client}</span>
                    <h2 className="text-xl font-black text-[#F4F4F5] uppercase leading-snug">{project.title}</h2>
                  </div>
                )}
              </div>

              {/* Text Meta */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] font-black text-[#F4F4F5]/60 uppercase tracking-widest">
                  <span>{project.client}</span>
                  <span className="text-[#E30613]">{project.category}</span>
                </div>
                <h2 className="text-xl font-bold text-[#F4F4F5] uppercase group-hover:text-[#E30613] transition-colors leading-snug tracking-tight">
                  {project.title}
                </h2>
                <p className="text-xs text-[#F4F4F5] leading-relaxed font-medium">
                  {project.summary}
                </p>
                
                <div className="flex flex-wrap gap-2 items-center justify-between pt-4 border-t border-white/10 mt-4">
                  <div className="flex flex-wrap gap-1">
                    {(project.tags || []).map((tag) => (
                      <span key={tag} className="inline-flex items-center rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[8px] font-black uppercase text-[#F4F4F5]/80">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 text-[9px] font-black text-[#F4F4F5]/60 uppercase tracking-widest">
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
