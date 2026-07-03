import { Metadata } from 'next';
import { fetchSubstackFeed, SubstackPost } from '@/lib/substack';
import { LucideIcon } from '@/components/ui/LucideIcon';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Observations',
  description: 'Our notes, explorations, and reflections on design, engineering, and digital utility published on Substack.',
};

export default async function ObservationsPage() {
  const posts = await fetchSubstackFeed();

  // Helper to format dates cleanly on the server
  const formatDate = (dateStr: string) => {
    try {
      const dateObj = new Date(dateStr.replace(' ', 'T'));
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Inspects content metadata to return clean format indicators (Articles, Videos, Podcasts)
  const getFormatInfo = (post: SubstackPost) => {
    const cats = (post.categories || []).map((c) => c.toLowerCase());
    const contentLower = (post.content || '').toLowerCase();
    
    const isVideo = 
      cats.includes('video') || 
      contentLower.includes('youtube.com/embed') || 
      contentLower.includes('youtu.be') || 
      contentLower.includes('<iframe') && contentLower.includes('video');
      
    const isPodcast = 
      cats.includes('podcast') || 
      cats.includes('audio') || 
      contentLower.includes('<audio') || 
      contentLower.includes('player.substack.com');

    if (isVideo) {
      return { label: 'Video Guide', icon: 'Youtube' };
    }
    if (isPodcast) {
      return { label: 'Podcast Episode', icon: 'Volume2' };
    }
    return { label: 'Article', icon: 'BookOpen' };
  };

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
          {posts.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-white/5">
              <p className="text-sm text-[#F4F4F5]/60 italic uppercase tracking-wider">No publications found.</p>
            </div>
          ) : (
            posts.map((post) => {
              const format = getFormatInfo(post);
              return (
                <a 
                  key={post.guid || post.link}
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex flex-col md:flex-row gap-6 p-6 rounded-2xl border border-white/10 bg-[#0E0E12] hover:border-[#E30613] transition-all duration-300 shadow-sm text-left items-stretch"
                >
                  {/* Image Thumbnail Block */}
                  {post.thumbnail && (
                    <div className="w-full md:w-48 aspect-[16/10] md:aspect-auto rounded-xl overflow-hidden border border-white/5 bg-white/5 relative shrink-0 select-none">
                      <img 
                        src={post.thumbnail} 
                        alt={post.title} 
                        className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Text Meta Content */}
                  <div className="flex flex-col flex-1 py-1">
                    <div className="flex items-center justify-between w-full text-[10px] font-black text-[#F4F4F5]/60 uppercase tracking-wider mb-3 gap-2">
                      <div className="flex items-center gap-2">
                        <time>{formatDate(post.pubDate)}</time>
                        <span>•</span>
                        <span>{post.readingTime || '2 min read'}</span>
                      </div>
                      
                      <span className="flex items-center gap-1 text-[#E30613]">
                        <LucideIcon name={format.icon} className="h-3.5 w-3.5" />
                        {format.label}
                      </span>
                    </div>
                    
                    <h2 className="text-lg font-bold text-[#F4F4F5] uppercase tracking-tight leading-snug mb-3 group-hover:text-[#E30613] transition-colors duration-200">
                      {post.title}
                    </h2>
                    
                    <p className="text-xs text-[#F4F4F5]/80 leading-relaxed mb-6 font-medium line-clamp-3">
                      {post.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-4 items-center justify-between w-full pt-4 border-t border-white/5 mt-auto">
                      <div className="flex flex-wrap gap-1.5">
                        {(post.categories || []).map((tag) => (
                          <span key={tag} className="text-[8px] font-black uppercase text-[#F4F4F5]/80 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-xs font-black text-[#F4F4F5] uppercase tracking-wider group-hover:text-[#E30613] transition-colors border-b border-[#F4F4F5] group-hover:border-[#E30613] pb-0.5">
                        {format.label === 'Video Guide' ? 'Watch Video' : format.label === 'Podcast Episode' ? 'Listen Episode' : 'Read Article'} <LucideIcon name="ArrowRight" className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </a>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
