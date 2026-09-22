import type { Metadata } from 'next';
import HomePage from '@/components/pages/Home';
import { getPage, getSettings } from '@/lib/cms';

export const runtime = 'nodejs';

export async function generateMetadata(): Promise<Metadata> {
  const [settings, pageData] = await Promise.all([getSettings(), getPage('home')]);
  return {
    title: { absolute: 'FeelsNeat' },
    description: pageData.description || settings.siteDescription,
  };
}

export default function Page() {
  return <HomePage />;
}
