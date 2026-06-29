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
    <main className="flex-1 w-full bg-background py-16 sm:py-24 border-b border-border-custom">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Back Link */}
        <Link 
          href="/our-work" 
          className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground/50 hover:text-foreground mb-8 transition-colors"
        >
          <LucideIcon name="ArrowLeft" className="h-3.5 w-3.5" /> Back to all work
        </Link>

        {/* Project Header */}
        <div className="space-y-6 mb-12">
          <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-foreground/50 uppercase tracking-widest">
            <span>{project.client}</span>
            <span className="text-border-custom font-normal">|</span>
            <span>{project.date}</span>
            <span className="text-border-custom font-normal">|</span>
            <span>{project.category}</span>
            <span className="text-border-custom font-normal">|</span>
            <span className="bg-border-custom/50 px-2 py-0.5 rounded-md">{project.status}</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground leading-tight">
            {project.title}
          </h1>
          
          <p className="text-lg text-foreground/75 font-medium leading-relaxed">
            {project.summary}
          </p>

          {/* External Action Button */}
          {project.externalUrl && linkDetails && (
            <div className="pt-2">
              <a 
                href={project.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-foreground px-5 text-xs font-bold text-background hover:bg-accent-custom transition-colors"
              >
                <LucideIcon name={linkDetails.icon} className="h-4 w-4" />
                <span>{linkDetails.text}</span>
              </a>
            </div>
          )}
        </div>

        {/* Visual Header / Cover Panel */}
        {project.coverImage ? (
          <div className="w-full aspect-[2/1] rounded-xl overflow-hidden border border-border-custom mb-16 shadow-xs">
            <img 
              src={project.coverImage} 
              alt={project.title} 
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="w-full aspect-[2/1] rounded-xl bg-gradient-to-tr from-foreground/95 via-foreground/90 to-foreground/80 mb-16 flex items-center justify-center p-8 border border-border-custom/50 shadow-xs">
            <div className="text-center space-y-3">
              <div className="mx-auto h-11 w-11 rounded-lg bg-white/10 flex items-center justify-center text-white backdrop-blur-xs">
                <LucideIcon name="Briefcase" className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-background/60 tracking-wider uppercase block">{project.client}</span>
            </div>
          </div>
        )}

        {/* Detailed markdown article */}
        <div 
          className="text-base text-foreground/80 space-y-6 leading-relaxed prose max-w-none"
          dangerouslySetInnerHTML={{ __html: project.content }}
        />

        {/* Additional Images Gallery */}
        {project.additionalImages && project.additionalImages.length > 0 && (
          <div className="mt-16 space-y-6">
            <h3 className="text-xs font-bold text-foreground/50 uppercase tracking-widest">Project Gallery</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              {project.additionalImages.map((imgUrl, imgIdx) => (
                <div key={imgIdx} className="aspect-[1.5/1] rounded-lg overflow-hidden border border-border-custom bg-white shadow-xs">
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
        <div className="mt-16 pt-10 border-t border-border-custom flex flex-col sm:flex-row justify-between gap-6">
          <div>
            <h3 className="text-xs font-bold text-foreground/50 uppercase tracking-widest mb-3">Core Tags</h3>
            <div className="flex flex-wrap gap-1">
              {(project.tags || []).map((tag) => (
                <span key={tag} className="inline-flex items-center rounded-md bg-border-custom/40 px-2 py-0.5 text-xs text-foreground/70">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="sm:text-right">
            <h3 className="text-xs font-bold text-foreground/50 uppercase tracking-widest mb-3">Discuss</h3>
            <Link 
              href="/contact"
              className="inline-flex items-center gap-1 text-xs font-bold text-foreground hover:underline"
            >
              Start collaboration <LucideIcon name="ArrowRight" className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
