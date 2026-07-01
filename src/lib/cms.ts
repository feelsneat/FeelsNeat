import db from './content-db.json';

export interface SiteSettings {
  siteName: string;
  siteTitle: string;
  siteDescription: string;
  logo: {
    text: string;
    icon: string;
  };
  contactEmail: string;
  socials: Array<{ platform: string; url: string }>;
}

export interface NavigationLink {
  label: string;
  path: string;
}

export interface NavigationConfig {
  headerLinks: NavigationLink[];
  footerLinks: Array<{
    title: string;
    items: NavigationLink[];
  }>;
}

export interface PageContent {
  title: string;
  subtitle?: string;
  tagline?: string;
  metaDescription?: string;
  content: string;
  [key: string]: any;
}

export interface ServiceItem {
  slug: string;
  title: string;
  icon: string;
  order: number;
  summary: string;
  content: string;
  image?: string;
  externalUrl?: string;
  additionalImages?: string[];
  tags?: string[];
}

export interface WorkItem {
  slug: string;
  title: string;
  client: string;
  date: string;
  summary: string;
  coverImage: string;
  additionalImages?: string[];
  tags: string[];
  externalUrl?: string;
  category: string;
  status: string;
  order: number;
  content: string;
}

export interface ObservationItem {
  slug: string;
  title: string;
  date: string;
  author: string;
  summary: string;
  tags: string[];
  coverImage: string;
  externalSubstackUrl: string;
  youtubeUrl?: string;
  content?: string;
}

// Fetch content database dynamically from KV binding at runtime, or fallback to local JSON database
async function getContentDb() {
  // In local development, check the global in-memory database first to reflect CMS session updates
  if (process.env.NODE_ENV === 'development') {
    const globalSymbol = Symbol.for('feelsneat.content_db');
    const memoryDb = (globalThis as any)[globalSymbol];
    if (memoryDb) {
      return memoryDb;
    }
  }

  try {
    const { getRequestContext } = await import('@cloudflare/next-on-pages');
    const context = getRequestContext();
    const env = context?.env;
    if (env && env.FEELSNEAT_CMS_KV) {
      const kvData = await env.FEELSNEAT_CMS_KV.get('content_db');
      if (kvData) {
        const parsed = JSON.parse(kvData);
        // Force sync socials and products from codebase fallback to prevent stale cache bugs
        parsed.settings.socials = db.settings.socials;
        if (!parsed.products || parsed.products.length === 0) {
          parsed.products = db.products;
        }
        return parsed;
      }
    }
  } catch (e) {
    // Fallback inside local scripts, Node test builders, or prerendering where context doesn't exist
  }
  return db;
}

export async function getSettings(): Promise<SiteSettings> {
  const contentDb = await getContentDb();
  return contentDb.settings;
}

export async function getNavigation(): Promise<NavigationConfig> {
  const contentDb = await getContentDb();
  return contentDb.navigation;
}

export async function getPage(slug: string): Promise<PageContent> {
  const contentDb = await getContentDb();
  const page = contentDb.pages[slug];
  if (!page) {
    throw new Error(`Page not found: ${slug}`);
  }
  return page;
}

export async function getServices(): Promise<ServiceItem[]> {
  const contentDb = await getContentDb();
  return contentDb.services;
}

export async function getWork(): Promise<WorkItem[]> {
  const contentDb = await getContentDb();
  return contentDb.work;
}

export async function getWorkBySlug(slug: string): Promise<WorkItem | undefined> {
  const contentDb = await getContentDb();
  return contentDb.work.find((w: any) => w.slug === slug);
}

export async function getObservations(): Promise<ObservationItem[]> {
  const contentDb = await getContentDb();
  return contentDb.observations;
}

export async function getObservationBySlug(slug: string): Promise<ObservationItem | undefined> {
  const contentDb = await getContentDb();
  return contentDb.observations.find((o: any) => o.slug === slug);
}

export interface ProductItem {
  id: string;
  category: 'career' | 'finance' | 'productivity' | 'content';
  title: string;
  price: string;
  features: string[];
  mockupText: string;
  etsyUrl: string;
  coverImage?: string;
}

export async function getProducts(): Promise<ProductItem[]> {
  const contentDb = await getContentDb();
  return contentDb.products || [];
}
