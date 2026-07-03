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

// Estimates reading time based on word count
export function estimateReadingTime(content: string): string {
  if (!content) return '1 min read';
  // Strip HTML tags to count words cleanly
  const text = content.replace(/<\/?[^>]+(>|$)/g, '');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
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

// Helper to clean descriptions from HTML
export function cleanDescription(htmlStr: string): string {
  if (!htmlStr) return '';
  // Simple regex tag stripper to run on server components safely
  const text = htmlStr.replace(/<\/?[^>]+(>|$)/g, '');
  return text.length > 140 ? text.substring(0, 140).trim() + '...' : text.trim();
}

// Dynamic Substack RSS feed fetcher with Next.js revalidation cache
export async function fetchSubstackFeed(): Promise<SubstackPost[]> {
  try {
    // Revalidate the RSS proxy request cache every 5 minutes (300 seconds)
    const res = await fetch(
      'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Ffeelsneat.substack.com%2Ffeed',
      {
        next: { revalidate: 300 },
      }
    );

    if (res.ok) {
      const data = await res.json();
      if (data.status === 'ok' && Array.isArray(data.items)) {
        return data.items.map((item: any) => {
          const content = item.content || item.description || '';
          return {
            title: item.title,
            pubDate: item.pubDate,
            link: item.link,
            guid: item.guid || item.link,
            author: item.author || 'FeelsNeat Team',
            thumbnail: item.thumbnail || extractImageFromHtml(content) || '',
            description: cleanDescription(item.description || ''),
            content: content,
            categories: Array.isArray(item.categories) ? item.categories : [],
            readingTime: estimateReadingTime(content),
            slug: extractSlug(item.link),
          };
        });
      }
    }
  } catch (err) {
    console.error('Substack RSS dynamic fetch failed:', err);
  }

  // Graceful fallback to manually curated CMS articles if RSS fetch/proxy fails
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

// Fallback image parser to find first img tag inside RSS text content body
function extractImageFromHtml(html: string): string | null {
  if (!html) return null;
  const match = html.match(/<img[^>]+src="([^">]+)"/);
  return match ? match[1] : null;
}
