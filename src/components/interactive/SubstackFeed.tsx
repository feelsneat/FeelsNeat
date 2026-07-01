'use client';

import { useState, useEffect } from 'react';
import { LucideIcon } from '../ui/LucideIcon';

interface SubstackPost {
  title: string;
  pubDate: string;
  link: string;
  guid: string;
  author: string;
  thumbnail: string;
  description: string;
  content: string;
}

export function SubstackFeed() {
  const [posts, setPosts] = useState<SubstackPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchFeed() {
      try {
        const res = await fetch(
          'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Ffeelsneat.substack.com%2Ffeed'
        );
        if (!res.ok) throw new Error('Failed to fetch feed');
        const data = await res.json();
        if (data.status === 'ok' && Array.isArray(data.items)) {
          // Slice the 3 latest posts
          setPosts(data.items.slice(0, 3));
        } else {
          throw new Error('Invalid feed status');
        }
      } catch (err) {
        console.error('Substack RSS fetch error:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchFeed();
  }, []);

  // Helper to format dates cleanly
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

  // Helper to clean descriptions from HTML
  const cleanDescription = (htmlStr: string) => {
    if (!htmlStr) return '';
    // Strip HTML tags
    const doc = new DOMParser().parseFromString(htmlStr, 'text/html');
    const text = doc.body.textContent || '';
    // Limit excerpt size
    return text.length > 140 ? text.substring(0, 140) + '...' : text;
  };

  if (error) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 sm:p-12 text-center shadow-md max-w-2xl mx-auto scroll-reveal">
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
        {loading
          ? // Skeleton Pulse Loading Cards to prevent CLS
            Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-md animate-pulse space-y-4 min-h-[300px]"
              >
                <div className="h-3 w-1/3 bg-zinc-200 rounded" />
                <div className="space-y-2">
                  <div className="h-5 bg-zinc-200 rounded w-11/12" />
                  <div className="h-5 bg-zinc-200 rounded w-8/12" />
                </div>
                <div className="space-y-2 pt-2">
                  <div className="h-3 bg-zinc-150 rounded" />
                  <div className="h-3 bg-zinc-150 rounded" />
                  <div className="h-3 bg-zinc-150 rounded w-10/12" />
                </div>
                <div className="h-4 bg-zinc-200 rounded w-1/4 pt-4 mt-auto" />
              </div>
            ))
          : posts.map((post) => (
              <article
                key={post.guid}
                className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-md hover:border-[#E30613] hover:shadow-lg transition-all duration-300 min-h-[300px]"
              >
                {/* Date stamp */}
                <span className="text-[10px] font-black text-[#E30613] uppercase tracking-wider block mb-3">
                  {formatDate(post.pubDate)}
                </span>
                
                {/* Post Title */}
                <h3 className="text-base font-bold text-[#000000] leading-snug group-hover:text-[#E30613] transition-colors duration-200 tracking-tight uppercase mb-3">
                  {post.title}
                </h3>
                
                {/* Snippet Excerpt */}
                <p className="text-xs text-[#000000] leading-relaxed mb-6 flex-grow font-black uppercase">
                  {cleanDescription(post.description)}
                </p>
                
                {/* Read Button */}
                <div className="pt-2">
                  <a
                    href={post.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-black text-[#000000] uppercase tracking-wider group-hover:text-[#E30613] transition-colors border-b border-[#000000] group-hover:border-[#E30613] pb-0.5"
                  >
                    Read Article <LucideIcon name="ArrowRight" className="h-3 w-3" />
                  </a>
                </div>
              </article>
            ))}
      </div>
    </div>
  );
}
