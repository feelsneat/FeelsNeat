import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';
import { getSettings, getPage, getWorkBySlug, getObservationBySlug } from '@/lib/cms';

// Import modular pages
import HomePage from '@/components/pages/Home';
import AboutPage from '@/components/pages/About';
import ContactPage from '@/components/pages/Contact';
import WhatWeDoPage from '@/components/pages/WhatWeDo';
import OurWorkPage from '@/components/pages/OurWork';
import ProjectDetailPage from '@/components/pages/OurWorkDetail';
import ObservationsPage from '@/components/pages/Observations';
import AdminPage from '@/components/pages/Admin';

export const runtime = 'edge';

interface PageProps {
  params: Promise<{
    slug?: string[];
  }>;
  searchParams: Promise<{
    error?: string;
    email?: string;
  }>;
}

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const settings = await getSettings();
  
  if (!slug || slug.length === 0) {
    const pageData = await getPage('home');
    return { 
      title: `${pageData.title} | ${settings.siteName}`, 
      description: settings.siteDescription 
    };
  }
  
  const route = slug[0];
  if (route === 'about') return { title: `About | ${settings.siteName}` };
  if (route === 'contact') return { title: `Contact | ${settings.siteName}` };
  if (route === 'what-we-do') return { title: `What We Do | ${settings.siteName}` };
  if (route === 'our-work') {
    if (slug.length === 1) return { title: `Our Work | ${settings.siteName}` };
    if (slug.length === 2) {
      const project = await getWorkBySlug(slug[1]);
      return { title: project ? `${project.title} | ${settings.siteName}` : 'Project Not Found' };
    }
  }
  if (route === 'observations') return { title: `Observations | ${settings.siteName}` };
  if (route === 'admin') return { title: `CMS Admin | ${settings.siteName}` };
  
  return { title: settings.siteName };
}

export default async function CatchAllPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { error, email } = await searchParams;

  // 1. Home Page (e.g. /)
  if (!slug || slug.length === 0) {
    return <HomePage />;
  }

  const route = slug[0];

  // 2. About Page (e.g. /about)
  if (route === 'about' && slug.length === 1) {
    return <AboutPage />;
  }

  // 3. Contact Page (e.g. /contact)
  if (route === 'contact' && slug.length === 1) {
    return <ContactPage />;
  }

  // 4. What We Do Page (e.g. /what-we-do)
  if (route === 'what-we-do' && slug.length === 1) {
    return <WhatWeDoPage />;
  }

  // 5. Our Work Routes (e.g. /our-work and /our-work/[slug])
  if (route === 'our-work') {
    if (slug.length === 1) {
      return <OurWorkPage />;
    }
    if (slug.length === 2) {
      return <ProjectDetailPage projectSlug={slug[1]} />;
    }
  }

  // 6. Observations Routes (e.g. /observations and /observations/[slug] redirect)
  if (route === 'observations') {
    if (slug.length === 1) {
      return <ObservationsPage />;
    }
    if (slug.length === 2) {
      const post = await getObservationBySlug(slug[1]);
      if (!post) notFound();
      const targetUrl = post.externalSubstackUrl || post.youtubeUrl || 'https://substack.com';
      redirect(targetUrl);
    }
  }

  // 7. Admin Dashboard Route (e.g. /admin)
  if (route === 'admin' && slug.length === 1) {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('feelsneat_session');
    const authSecret = process.env.AUTH_SECRET || (
      process.env.NODE_ENV === 'development'
        ? 'local_dev_secret_key_needs_to_be_long_and_secure_32_chars'
        : undefined
    );

    let userEmail: string | null = null;
    if (sessionCookie?.value && authSecret) {
      const session = await verifySession(sessionCookie.value, authSecret);
      if (session) {
        userEmail = session.email;
      }
    }

    return <AdminPage userEmail={userEmail} error={error} email={email} />;
  }

  // 8. Default fallback 404
  notFound();
}
