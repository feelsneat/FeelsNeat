import { getObservations } from './cms';

export interface SubstackPost {
  title: string;
  pubDate: string;
  link: string;
  guid: string;
  author: string;
  thumbnail: string;
  description: string;
  content: string;
  categories: string[];
  readingTime?: string;
  slug?: string;
}

// Extracts clean URL slugs from Substack links
export function extractSlug(link: string): string {
  if (!link) return '';
  try {
    const url = new URL(link);
    const pathname = url.pathname; // e.g. "/p/tailwind-v4-evolution"
    if (pathname.includes('/p/')) {
      return pathname.split('/p/')[1].split('/')[0];
    }
  } catch (e) {
    // Ignore URL errors and split raw string
  }
  return link.split('/p/')[1]?.split('?')[0] || link;
}

// Helper to clean HTML contents and extract raw excerpts
export function cleanDescription(htmlStr: string): string {
  if (!htmlStr) return '';
  const text = htmlStr.replace(/<\/?[^>]+(>|$)/g, '');
  const cleaned = text.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
  return cleaned.length > 140 ? cleaned.substring(0, 140).trim() + '...' : cleaned.trim();
}

// Dynamic Substack feed fetcher
export async function fetchSubstackFeed(): Promise<SubstackPost[]> {
  try {
    // Fetch directly from the Substack public API with real browser User-Agent
    // This bypasses bot filters and resolves JSON data directly with zero parsing errors
    const res = await fetch('https://feelsneat.substack.com/api/v1/posts?limit=50', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      },
      next: { revalidate: 300 }, // Cache response for 5 minutes
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data.map((item: any) => {
          const wordCount = item.wordcount || 200;
          const readingMinutes = Math.max(1, Math.ceil(wordCount / 200));
          const tags = Array.isArray(item.postTags) 
            ? item.postTags.map((t: any) => t.name) 
            : [];
            
          return {
            title: item.title,
            pubDate: item.post_date,
            link: item.canonical_url,
            guid: String(item.id || item.canonical_url),
            author: 'FeelsNeat Team',
            thumbnail: item.cover_image || '',
            description: item.description || cleanDescription(item.body_html || ''),
            content: item.body_html || '',
            categories: tags,
            readingTime: `${readingMinutes} min read`,
            slug: item.slug || extractSlug(item.canonical_url),
          };
        });
      }
    }
    
    console.error(`Substack API request failed. Status: ${res.status}`);
  } catch (err) {
    console.error('Direct Substack API fetch failed, trying local fallback:', err);
  }

  // Graceful fallback to manually curated CMS articles if API fetch fails
  console.log('Resolving fallback observations list from CMS database.');
  const fallbackList = await getObservations();
  return fallbackList.map((post) => ({
    title: post.title,
    pubDate: post.date,
    link: post.externalSubstackUrl || post.youtubeUrl || 'https://feelsneat.substack.com',
    guid: post.slug,
    author: post.author || 'FeelsNeat Team',
    thumbnail: post.coverImage || '',
    description: post.summary || '',
    content: post.content || '',
    categories: post.tags || [],
    readingTime: '2 min read',
    slug: post.slug,
  }));
}
