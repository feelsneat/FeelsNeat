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
    <main className="flex-1 w-full bg-[#0A0A0C] py-20 sm:py-28 border-b border-white/10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Page Header */}
        <div className="mb-16">
          <span className="text-[10px] font-black text-[#E30613] uppercase tracking-widest block mb-3">Reflections</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F4F4F5] uppercase">
            Observations
          </h1>
          <p className="mt-6 text-base sm:text-lg text-[#F4F4F5] leading-relaxed font-medium">
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
                className="group relative flex flex-col items-start p-6 rounded-2xl border border-white/10 bg-[#0E0E12] hover:border-[#E30613] transition-all duration-300 shadow-sm"
              >
                <div className="flex items-center justify-between w-full text-[10px] font-black text-[#F4F4F5]/60 uppercase tracking-wider mb-3">
                  <time>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                  <span className="flex items-center gap-1 text-[#E30613]">
                    <LucideIcon name={isVideo ? 'Youtube' : 'BookOpen'} className="h-3.5 w-3.5" />
                    {isVideo ? 'Video' : 'Article'}
                  </span>
                </div>
                
                <h2 className="text-lg font-bold text-[#F4F4F5] uppercase tracking-tight leading-snug mb-3 group-hover:text-[#E30613] transition-colors duration-200">
                  {post.title}
                </h2>
                
                <p className="text-xs text-[#F4F4F5] leading-relaxed mb-4 font-medium">
                  {post.summary}
                </p>
                
                <div className="flex flex-wrap gap-4 items-center justify-between w-full pt-4 border-t border-white/5">
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <span key={tag} className="text-[8px] font-black uppercase text-[#F4F4F5]/80 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-black text-[#F4F4F5] uppercase tracking-wider group-hover:text-[#E30613] transition-colors border-b border-[#F4F4F5] group-hover:border-[#E30613] pb-0.5">
                    {isVideo ? 'Watch Video' : 'Read Article'} <LucideIcon name="ArrowRight" className="h-3.5 w-3.5" />
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
