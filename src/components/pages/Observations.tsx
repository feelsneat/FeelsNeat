import { Metadata } from 'next';
import { getObservations } from '@/lib/cms';
import { LucideIcon } from '@/components/ui/LucideIcon';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Observations',
  description: 'Our notes, explorations, and reflections on design, engineering, and digital utility published on Substack.',
};

export default async function ObservationsPage() {
  const posts = await getObservations();

  return (
    <main className="flex-1 w-full bg-background py-20 sm:py-28 border-b border-zinc-200/50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Page Header */}
        <div className="mb-16">
          <span className="text-[10px] font-black text-accent-custom uppercase tracking-widest block mb-3">Reflections</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground uppercase">
            Observations
          </h1>
          <p className="mt-6 text-base sm:text-lg text-neutral-gray leading-relaxed font-medium">
            A curated index of our thoughts, research, and technical notes from the FeelsNeat journey, hosted on Substack.
          </p>
        </div>

        {/* Curated Articles List */}
        <div className="space-y-8">
          {posts.map((post) => {
            const targetUrl = post.externalSubstackUrl || post.youtubeUrl || 'https://substack.com';
            const isVideo = !!post.youtubeUrl && !post.externalSubstackUrl;

            return (
              <a 
                key={post.slug}
                href={targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-col items-start p-6 rounded-2xl border border-zinc-200 bg-white hover:border-accent-custom transition-all duration-300 shadow-3xs"
              >
                <div className="flex items-center justify-between w-full text-[10px] font-black text-neutral-gray uppercase tracking-wider mb-3">
                  <time>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                  <span className="flex items-center gap-1 text-accent-custom">
                    <LucideIcon name={isVideo ? 'Youtube' : 'BookOpen'} className="h-3.5 w-3.5" />
                    {isVideo ? 'Video' : 'Article'}
                  </span>
                </div>
                
                <h2 className="text-lg font-bold text-foreground uppercase tracking-tight leading-snug mb-3 group-hover:text-accent-custom transition-colors duration-200">
                  {post.title}
                </h2>
                
                <p className="text-xs text-neutral-gray leading-relaxed mb-4 font-medium">
                  {post.summary}
                </p>
                
                <div className="flex flex-wrap gap-4 items-center justify-between w-full pt-4 border-t border-zinc-100">
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <span key={tag} className="text-[8px] font-black uppercase text-foreground/80 bg-zinc-100 border border-zinc-250 px-2 py-0.5 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-black text-foreground uppercase tracking-wider group-hover:text-accent-custom transition-colors border-b border-foreground group-hover:border-accent-custom pb-0.5">
                    {isVideo ? 'Watch Video' : 'Read Article'} <LucideIcon name="ArrowRight" className="h-3 w-3" />
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </main>
  );
}
