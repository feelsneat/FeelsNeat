import { redirect, notFound } from 'next/navigation';
import { getObservationBySlug } from '@/lib/cms';

export const runtime = 'edge';

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ObservationDetailPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getObservationBySlug(slug);

  if (!post) {
    notFound();
  }

  const targetUrl = post.externalSubstackUrl || post.youtubeUrl || 'https://substack.com';
  redirect(targetUrl);
}
