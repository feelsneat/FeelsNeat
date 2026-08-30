import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';
import { getSettings, getPage, getWorkBySlug, getObservationBySlug } from '@/lib/cms';
import { fetchSubstackFeed } from '@/lib/substack';

// Import modular pages
import HomePage from '@/components/pages/Home';
import AboutPage from '@/components/pages/About';
import ContactPage from '@/components/pages/Contact';
import OurWorkPage from '@/components/pages/OurWork';
import ProjectDetailPage from '@/components/pages/OurWorkDetail';
import AdminPage from '@/components/pages/Admin';
import MemoriesPage from '@/components/pages/Memories';
import MemoryProductPage from '@/components/pages/MemoryProduct';
import CreatePage from '@/components/pages/Create';
import OrderConfirmationPage from '@/components/pages/Confirmation';
import TapTilesPage from '@/components/pages/TapTiles';
import CreateTapTilePage from '@/components/pages/CreateTapTile';
import TapTileProductPage from '@/components/pages/TapTileProduct';
import PetProfilePage from '@/components/pages/PetProfile';

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
  if (route === 'memories') {
    if (slug.length === 1) {
      return {
        title: `Personalized Memory Canvas | ${settings.siteName}`,
        description: 'Turn your favorite memories into personalized wall art connected to your Google Photos album with NFC.',
        openGraph: {
          title: `Personalized Memory Canvas | ${settings.siteName}`,
          description: 'Turn your favorite memories into personalized wall art connected to your Google Photos album with NFC.',
          images: [{ url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1200' }],
        }
      };
    }
    if (slug.length === 2) {
      const categorySlug = slug[1];
      const categories = {
        travel: { 
          title: 'Travel Memory Canvas | Personalized Travel Wall Art',
          image: '/images/memories/travel-memories-wall.jpg'
        },
        events: { 
          title: 'Event Memory Canvas | Personalized Celebration Art',
          image: '/images/memories/events-memories-wall.jpg'
        },
        couples: { 
          title: 'Couple Memory Canvas | Modern Relationship Wall Art',
          image: '/images/memories/couple-memories-wall.jpg'
        },
        family: { 
          title: 'Family, Life & Pets Memory Canvas | Personalized Family Photo Prints',
          image: '/images/memories/family-memories-wall.jpg'
        }
      };
      const cat = (categories as any)[categorySlug];
      if (cat) {
        return {
          title: `${cat.title} | ${settings.siteName}`,
          description: `Turn your favorite ${categorySlug} photos into personalized wall art connected to your Google Photos memories.`,
          openGraph: {
            title: `${cat.title} | ${settings.siteName}`,
            description: `Turn your favorite ${categorySlug} photos into personalized wall art connected to your Google Photos memories.`,
            images: [{ url: cat.image }],
          }
        };
      }
    }
  }
  if (route === 'create' && slug.length === 1) {
    return {
      title: `Create Your Memory | ${settings.siteName}`,
      description: 'Configure and customize your personalized photo panels with hidden NFC tags linked to your shared Google Photos.',
      openGraph: {
        title: `Create Your Memory | ${settings.siteName}`,
        description: 'Configure and customize your personalized photo panels with hidden NFC tags linked to your shared Google Photos.',
        images: [{ url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1200' }],
      }
    };
  }
  if (route === 'tap-tiles') {
    if (slug.length === 1) {
      return {
        title: `FeelsNeat Tap Tiles | Personalized Mini NFC Art Tiles`,
        description: 'Small personalized art tiles that connect you to something meaningful with one tap. Choose your photo, words, and link — we program it for you.',
        openGraph: {
          title: `FeelsNeat Tap Tiles | Personalized Mini NFC Art Tiles`,
          description: 'Small personalized art tiles that connect you to something meaningful with one tap. Choose your photo, words, and link — we program it for you.',
          images: [{ url: '/images/tap-tiles/hero-mockup.jpg' }]
        }
      };
    }
    if (slug.length === 2) {
      const categorySlug = slug[1];
      const categories = {
        nostalgia: 'Nostalgia Taps | Retro NFC Art Tiles',
        friends: 'Friends & Inside Jokes | Personalized NFC Keychains',
        couples: 'Our Song | Custom NFC Couple Magnet Prints',
        pets: 'Pet Tap Tiles | Personalized Custom Pet Art'
      };
      const title = (categories as any)[categorySlug] || 'Personalized Tap Tile';
      return {
        title: `${title} | ${settings.siteName}`,
        description: 'Turn your favorite memories, songs, playlists, or pet photos into tiny NFC art collectibles.'
      };
    }
  }
  if (route === 'create-tap-tile' && slug.length === 1) {
    return {
      title: `Configure Tap Tile | FeelsNeat`,
      description: 'Design and customize your personalized NFC Tap Tile magnet or keychain with a custom photo, message, and target link.'
    };
  }
  if (route === 'confirmation' && slug.length === 1) {
    return { title: `Order Confirmed | ${settings.siteName}` };
  }
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

  // 4. What We Do Page (e.g. /what-we-do) - Redirect to consolidated page
  if (route === 'what-we-do' && slug.length === 1) {
    redirect('/our-work');
  }

  // 4.5. Memories Routes (e.g. /memories and /memories/[category])
  if (route === 'memories') {
    if (slug.length === 1) {
      return <MemoriesPage />;
    }
    if (slug.length === 2) {
      const cat = slug[1];
      if (['travel', 'events', 'couples', 'family'].includes(cat)) {
        return <MemoryProductPage categorySlug={cat} />;
      }
      notFound();
    }
  }

  // 4.6. Create Memory Route (e.g. /create)
  if (route === 'create' && slug.length === 1) {
    return <CreatePage />;
  }

  // 4.65. Tap Tiles Routes (e.g. /tap-tiles and /tap-tiles/[category])
  if (route === 'tap-tiles') {
    if (slug.length === 1) {
      return <TapTilesPage />;
    }
    if (slug.length === 2) {
      const cat = slug[1];
      if (['nostalgia', 'friends', 'couples', 'pets'].includes(cat)) {
        return <TapTileProductPage categorySlug={cat} />;
      }
      notFound();
    }
  }

  // 4.66. Create Tap Tile Customizer Route (e.g. /create-tap-tile)
  if (route === 'create-tap-tile' && slug.length === 1) {
    return <CreateTapTilePage />;
  }

  // 4.68. Pet NFC Profile Routes (e.g. /p/[profileId] and /t/[profileId] redirect)
  if (route === 'p' && slug.length === 2) {
    return <PetProfilePage profileId={slug[1]} />;
  }
  if (route === 't' && slug.length === 2) {
    redirect(`/p/${slug[1]}`);
  }

  // 4.7. Confirmation Route (e.g. /confirmation)
  if (route === 'confirmation' && slug.length === 1) {
    const settings = await getSettings();
    const waNum = (settings as any).whatsappNumber || '919999999999';
    return <OrderConfirmationPage whatsappNumber={waNum} />;
  }

  // 5. Output Route (e.g. /output)
  if (route === 'output' && slug.length === 1) {
    return <OurWorkPage />;
  }

  // 5.5. Legacy Our Work Redirects
  if (route === 'our-work') {
    if (slug.length === 1) {
      redirect('/output');
    }
    if (slug.length === 2) {
      redirect('/output');
    }
  }

  // 6. Observations Routes (e.g. /observations and /observations/[slug] redirect)
  if (route === 'observations') {
    if (slug.length === 1) {
      redirect('/output#observations');
    }
    if (slug.length === 2) {
      const targetSlug = slug[1];
      const livePosts = await fetchSubstackFeed();
      const matchedPost = livePosts.find(p => p.slug === targetSlug || p.guid === targetSlug);
      if (matchedPost) {
        redirect(matchedPost.link);
      }

      // Fallback lookup from manually entered CMS database
      const fallbackPost = await getObservationBySlug(targetSlug);
      if (fallbackPost) {
        const targetUrl = fallbackPost.externalSubstackUrl || fallbackPost.youtubeUrl || 'https://substack.com';
        redirect(targetUrl);
      }
      
      notFound();
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
