import { LucideIcon } from '../ui/LucideIcon';
import { SubstackPost } from '@/lib/substack';

interface SubstackFeedProps {
  posts: SubstackPost[];
}

export function SubstackFeed({ posts }: SubstackFeedProps) {
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
      return { label: 'Video Exploration', icon: 'Youtube' };
    }
    if (isPodcast) {
      return { label: 'Audio Podcast', icon: 'Volume2' };
    }
    return { label: 'Insight Article', icon: 'BookOpen' };
  };

  if (!posts || posts.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 sm:p-12 text-center shadow-md max-w-2xl mx-auto">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-[#000000] mb-4">
          <LucideIcon name="ShieldAlert" className="h-5 w-5 text-[#E30613]" />
        </div>
        <h3 className="text-lg font-bold text-[#000000] uppercase tracking-tight mb-3">
          Latest Guides Direct on Substack
        </h3>
        <p className="text-sm text-[#000000] leading-relaxed mb-6 font-black uppercase">
          Check out our latest system guides, productivity frameworks, and visual trackers directly on our Substack publication.
        </p>
        <a
          href="https://feelsneat.substack.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-[#E30613] hover:bg-[#E30613]/90 px-6 text-xs font-black uppercase text-white transition-colors cursor-pointer shadow-md"
        >
          Visit feelsneat.substack.com
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Cards Stream Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        {posts.map((post) => {
          const format = getFormatInfo(post);
          return (
            <a
              key={post.guid || post.link}
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-md hover:border-[#E30613] hover:shadow-lg transition-all duration-300 min-h-[320px] text-left cursor-pointer"
            >
              {/* Optional Image Thumbnail */}
              {post.thumbnail && (
                <div className="w-full aspect-[16/9] rounded-xl overflow-hidden mb-4 border border-zinc-100 bg-zinc-50 relative select-none">
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
              )}

              {/* Header Meta: Format badge & publish date */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-black text-[#E30613] uppercase tracking-wider">
                  {formatDate(post.pubDate)}
                </span>
                
                {/* Reading time & format icon */}
                <div className="flex items-center gap-1.5 text-[9px] text-[#000000]/60 font-black uppercase">
                  <LucideIcon name={format.icon} className="h-3 w-3 text-[#E30613]" />
                  <span>{post.readingTime || '2 min read'}</span>
                </div>
              </div>
              
              {/* Post Title */}
              <h3 className="text-base font-bold text-[#000000] leading-snug group-hover:text-[#E30613] transition-colors duration-200 tracking-tight uppercase mb-3 line-clamp-2">
                {post.title}
              </h3>
              
              {/* Snippet Excerpt */}
              <p className="text-xs text-[#000000]/70 leading-relaxed mb-6 flex-grow font-semibold line-clamp-3 uppercase">
                {post.description}
              </p>
              
              {/* Read Button */}
              <div className="pt-2 border-t border-zinc-100 mt-auto">
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-black text-[#000000] uppercase tracking-wider group-hover:text-[#E30613] transition-colors border-b border-[#000000] group-hover:border-[#E30613] pb-0.5"
                >
                  {format.label === 'Video Exploration' ? 'Watch Video' : format.label === 'Audio Podcast' ? 'Listen Episode' : 'Read Article'} <LucideIcon name="ArrowRight" className="h-3 w-3" />
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
