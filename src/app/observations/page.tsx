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
    <main className="flex-1 w-full bg-background py-16 sm:py-24 border-b border-border-custom">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Page Header */}
        <div className="mb-16">
          <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest block mb-3">Reflections</span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Observations
          </h1>
          <p className="mt-6 text-lg text-foreground/75 leading-relaxed font-medium">
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
                className="group relative flex flex-col items-start p-6 rounded-xl border border-border-custom bg-background hover:border-foreground/20 transition-all duration-200 shadow-xs"
              >
                <div className="flex items-center justify-between w-full text-[10px] font-bold text-foreground/50 uppercase mb-3">
                  <time>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                  <span className="flex items-center gap-1">
                    <LucideIcon name={isVideo ? 'Youtube' : 'BookOpen'} className="h-3.5 w-3.5" />
                    {isVideo ? 'Video' : 'Article'}
                  </span>
                </div>
                
                <h2 className="text-xl font-extrabold text-foreground mb-3 group-hover:underline">
                  {post.title}
                </h2>
                
                <p className="text-sm text-foreground/70 leading-relaxed mb-4">
                  {post.summary}
                </p>
                
                <div className="flex flex-wrap gap-4 items-center justify-between w-full pt-4 border-t border-border-custom/50">
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <span key={tag} className="text-[9px] font-semibold text-foreground/60 bg-border-custom/30 px-1.5 py-0.5 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground group-hover:translate-x-0.5 transition-transform">
                    {isVideo ? 'Watch Video' : 'Read Article'} <LucideIcon name="ArrowUpRight" className="h-3.5 w-3.5" />
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
