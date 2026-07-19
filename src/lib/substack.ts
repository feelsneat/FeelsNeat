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

// Helper to clean HTML contents and extract raw excerpts
export function cleanDescription(htmlStr: string): string {
  if (!htmlStr) return '';
  // Strip HTML tags
  const text = htmlStr.replace(/<\/?[^>]+(>|$)/g, '');
  // Clean up any CDATA tags if leaked
  const cleaned = text.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
  return cleaned.length > 140 ? cleaned.substring(0, 140).trim() + '...' : cleaned.trim();
}

// Helper to find first img tag inside RSS text content body
function extractImageFromHtml(html: string): string | null {
  if (!html) return null;
  const match = html.match(/<img[^>]+src="([^">]+)"/);
  return match ? match[1] : null;
}

// Direct XML parser to convert Substack RSS XML response to clean post objects
function parseSubstackRssXml(xmlText: string): SubstackPost[] {
  const posts: SubstackPost[] = [];
  const items = xmlText.split('<item>');
  
  // The first segment of split is channel metadata, we skip it
  items.shift();

  for (const block of items) {
    // 1. Extract Title (handle CDATA first, fallback to standard tags)
    const titleMatch = block.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) || block.match(/<title>([\s\S]*?)<\/title>/);
    const title = titleMatch ? titleMatch[1].trim() : '';

    // 2. Extract Link
    const linkMatch = block.match(/<link>([\s\S]*?)<\/link>/);
    const link = linkMatch ? linkMatch[1].trim() : '';

    // 3. Extract Description / Excerpt
    const descMatch = block.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) || block.match(/<description>([\s\S]*?)<\/description>/);
    const rawDescription = descMatch ? descMatch[1].trim() : '';

    // 4. Extract pubDate
    const dateMatch = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
    const pubDate = dateMatch ? dateMatch[1].trim() : '';

    // 5. Extract Creator (Author)
    const creatorMatch = block.match(/<dc:creator><!\[CDATA\[([\s\S]*?)\]\]><\/dc:creator>/) || block.match(/<dc:creator>([\s\S]*?)<\/dc:creator>/);
    const author = creatorMatch ? creatorMatch[1].trim() : 'FeelsNeat Team';

    // 6. Extract Thumbnail URL (try enclosure attribute, fallback to image parsing)
    const enclosureMatch = block.match(/<enclosure[^>]+url="([^">]+)"/);
    let thumbnail = enclosureMatch ? enclosureMatch[1].trim() : '';

    // 7. Extract content:encoded body block
    const contentMatch = block.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/) || block.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/);
    const content = contentMatch ? contentMatch[1].trim() : '';

    if (!thumbnail) {
      thumbnail = extractImageFromHtml(content) || '';
    }

    // 8. Extract Categories (Tags)
    const categories: string[] = [];
    const categoryRegex = /<category><!\[CDATA\[([\s\S]*?)\]\]><\/category>/g;
    let catMatch;
    while ((catMatch = categoryRegex.exec(block)) !== null) {
      categories.push(catMatch[1].trim());
    }

    // Fallback for simple category tags
    if (categories.length === 0) {
      const simpleCatRegex = /<category>([\s\S]*?)<\/category>/g;
      let simpleMatch;
      while ((simpleMatch = simpleCatRegex.exec(block)) !== null) {
        categories.push(simpleMatch[1].trim());
      }
    }

    // 9. Extract Guid
    const guidMatch = block.match(/<guid[^>]*>([\s\S]*?)<\/guid>/);
    const guid = guidMatch ? guidMatch[1].trim() : link;

    if (title && link) {
      posts.push({
        title,
        pubDate,
        link,
        guid,
        author,
        thumbnail,
        description: cleanDescription(rawDescription),
        content,
        categories,
        readingTime: estimateReadingTime(content || rawDescription),
        slug: extractSlug(link),
      });
    }
  }

  return posts;
}

// Dynamic Substack RSS feed fetcher with Next.js revalidation cache
export async function fetchSubstackFeed(): Promise<SubstackPost[]> {
  try {
    // Fetch directly from Substack RSS XML link (bypasses CORS proxies, avoiding Cloudflare server blocks)
    const res = await fetch('https://feelsneat.substack.com/feed', {
      next: { revalidate: 300 }, // Cache response for 5 minutes
    });

    if (res.ok) {
      const xmlText = await res.text();
      if (xmlText && xmlText.includes('<rss')) {
        const parsedPosts = parseSubstackRssXml(xmlText);
        if (parsedPosts.length > 0) {
          return parsedPosts;
        }
      }
    }
    throw new Error(`Invalid response status: ${res.status}`);
  } catch (err) {
    console.error('Direct Substack RSS XML fetch failed, trying local fallback:', err);
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
