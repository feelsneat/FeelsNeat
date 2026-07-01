import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getWorkBySlug } from '@/lib/cms';
import { LucideIcon } from '@/components/ui/LucideIcon';

interface ProjectDetailPageProps {
  projectSlug: string;
}

export default async function ProjectDetailPage({ projectSlug }: ProjectDetailPageProps) {
  const project = await getWorkBySlug(projectSlug);

  if (!project) {
    notFound();
  }

  // Detect type of link (e.g. YouTube, GitHub) to render custom text/icon
  const getLinkDetails = (url?: string) => {
    if (!url) return null;
    const lower = url.toLowerCase();
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
      return { text: 'Watch Video Walkthrough', icon: 'Youtube' };
    }
    if (lower.includes('github.com')) {
      return { text: 'View GitHub Repository', icon: 'Github' };
    }
    return { text: 'Visit Project Website', icon: 'Globe' };
  };

  const linkDetails = getLinkDetails(project.externalUrl);

  return (
    <main className="flex-1 w-full bg-[#FAFAFA] py-20 sm:py-28 border-b border-zinc-200/50 relative">
      {/* Morphing background blob */}
      <div className="morphing-blob absolute top-20 right-10 opacity-20" />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 relative z-10">
        {/* Back Link */}
        <Link 
          href="/our-work" 
          className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-[#5F5F5F] hover:text-[#6E8270] mb-10 transition-colors"
        >
          <LucideIcon name="ArrowLeft" className="h-3.5 w-3.5 text-[#6E8270]" /> Back to all work
        </Link>

        {/* Project Header */}
        <div className="space-y-6 mb-16 scroll-reveal">
          <div className="flex flex-wrap items-center gap-4 text-[9px] font-black text-[#5F5F5F] uppercase tracking-widest">
            <span>{project.client}</span>
            <span className="text-zinc-300 font-normal">|</span>
            <span>{project.date}</span>
            <span className="text-zinc-300 font-normal">|</span>
            <span className="text-[#6E8270]">{project.category}</span>
            <span className="text-zinc-300 font-normal">|</span>
            <span className="bg-zinc-100 border border-zinc-250 px-2 py-0.5 rounded text-[8px]">{project.status}</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#1E1E1E] leading-tight uppercase">
            {project.title}
          </h1>
          
          <p className="text-base sm:text-lg text-[#5F5F5F] font-medium leading-relaxed max-w-3xl">
            {project.summary}
          </p>

          {/* External Action Button */}
          {project.externalUrl && linkDetails && (
            <div className="pt-4">
              <a 
                href={project.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#1E1E1E] px-6 text-xs font-black uppercase tracking-wider text-[#FAFAFA] hover:bg-[#6E8270] transition-colors shadow-xs"
              >
                <LucideIcon name={linkDetails.icon} className="h-4 w-4" />
                <span>{linkDetails.text}</span>
              </a>
            </div>
          )}
        </div>

        {/* Visual Header / Cover Panel */}
        {project.coverImage ? (
          <div className="w-full aspect-[2/1] rounded-lg overflow-hidden border border-zinc-200 mb-16 shadow-xs">
            <img 
              src={project.coverImage} 
              alt={project.title} 
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="w-full aspect-[2/1] rounded-lg bg-zinc-100 mb-16 flex items-center justify-center p-8 border border-zinc-200 shadow-xs">
            <div className="text-center space-y-3">
              <div className="mx-auto h-11 w-11 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-[#1E1E1E] shadow-xs">
                <LucideIcon name="Briefcase" className="h-5 w-5 text-[#6E8270]" />
              </div>
              <span className="text-[10px] font-bold text-[#5F5F5F]/60 tracking-wider uppercase block">{project.client}</span>
            </div>
          </div>
        )}

        {/* Detailed markdown article */}
        <div 
          className="text-sm sm:text-base text-[#5F5F5F] space-y-6 leading-relaxed prose max-w-none scroll-reveal font-medium"
          dangerouslySetInnerHTML={{ __html: project.content }}
        />

        {/* Additional Images Gallery */}
        {project.additionalImages && project.additionalImages.length > 0 && (
          <div className="mt-20 space-y-6 scroll-reveal">
            <h3 className="text-[9px] font-black text-[#5F5F5F] uppercase tracking-widest">Project Gallery</h3>
            <div className="grid sm:grid-cols-2 gap-8">
              {project.additionalImages.map((imgUrl, imgIdx) => (
                <div key={imgIdx} className="aspect-[1.5/1] rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100/50 shadow-xs">
                  <img 
                    src={imgUrl} 
                    alt={`${project.title} gallery image ${imgIdx + 1}`} 
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Project Footer Meta */}
        <div className="mt-20 pt-12 border-t border-zinc-200 flex flex-col sm:flex-row justify-between gap-8 scroll-reveal">
          <div>
            <h3 className="text-[9px] font-black text-[#5F5F5F] uppercase tracking-widest mb-3">Core Tags</h3>
            <div className="flex flex-wrap gap-1.5">
              {(project.tags || []).map((tag) => (
                <span key={tag} className="inline-flex items-center rounded-md bg-zinc-100 border border-zinc-250 px-2.5 py-0.5 text-[8px] font-black uppercase text-[#1E1E1E]/80">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="sm:text-right">
            <h3 className="text-[9px] font-black text-[#5F5F5F] uppercase tracking-widest mb-3">Discuss</h3>
            <Link 
              href="/contact"
              className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-[#1E1E1E] hover:text-[#6E8270] transition-colors"
            >
              Start collaboration <LucideIcon name="ArrowRight" className="h-3.5 w-3.5 text-[#6E8270]" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
