import Link from 'next/link';
import { LucideIcon } from '@/components/ui/LucideIcon';

// Centralized pricing configuration
export const PRODUCT_PRICES = {
  mini: { current: '₹499', original: '₹1,299' },
  standard: { current: '₹699', original: '₹1,999' },
  landscape: { current: '₹899', original: '₹2,499' },
};

// Reusable category content registry
export const MEMORY_CATEGORIES = {
  travel: {
    slug: 'travel',
    title: 'Travel Memories',
    positioning: 'Keep the trip on your wall, not just in your camera roll.',
    subtitle: 'A personalized photo artwork connected to your travel memories.',
    description: 'Turn your favorite travel moments—road trips, mountain vistas, sunsets on the beach, and candid group photos—into beautiful wall art. The integrated NFC link maps directly to your shared Google Photos trip album.',
    cta: 'Create Travel Memory',
    image: '/images/memories/travel-memories-wall.jpg',
    tags: ['Adventure', 'Travel Log', 'Shared Albums'],
    metaTitle: 'Travel Memory Canvas | Personalized Travel Wall Art | FeelsNeat',
    metaDesc: 'Turn your favorite travel photos into personalized wall art connected to your Google Photos memories.',
  },
  events: {
    slug: 'events',
    title: 'Events & Celebrations',
    positioning: 'Turn the moments worth celebrating into something you can keep.',
    subtitle: 'A personalized photo artwork connected to your milestones.',
    description: 'Perfect for weddings, anniversaries, graduations, birthdays, housewarmings, and family reunions. Capture the day with physical wall art that opens the celebration album with a simple tap.',
    cta: 'Create Event Memory',
    image: '/images/memories/events-memories-wall.jpg',
    tags: ['Weddings', 'Milestones', 'Birthdays'],
    metaTitle: 'Event Memory Canvas | Personalized Celebration Art | FeelsNeat',
    metaDesc: 'Turn your favorite weddings, birthdays, and celebrations into personalized wall art connected to your Google Photos.',
  },
  couples: {
    slug: 'couples',
    title: 'Couple Memories',
    positioning: 'A modern visual registry for your shared moments.',
    subtitle: 'A personalized photo artwork connected to your relationship journey.',
    description: 'A sophisticated, minimalist tribute to your relationship. Save memories of your first trip, dates, proposals, vacations, or everyday candid moments on a clean visual panel that connects to your shared album.',
    cta: 'Create Couple Memory',
    image: '/images/memories/couple-memories-wall.jpg',
    tags: ['Anniversary', 'Candid', 'Relationship'],
    metaTitle: 'Couple Memory Canvas | Modern Relationship Wall Art | FeelsNeat',
    metaDesc: 'Design custom couple photo frames with hidden NFC links to shared Google Photos albums.',
  },
  family: {
    slug: 'family',
    title: 'Family, Life & Pets',
    positioning: 'The moments you wish you could keep forever.',
    subtitle: 'A personalized photo artwork connected to your family and pets.',
    description: 'Keep everyday family and pet memories alive. Display baby steps, holiday gatherings, playful pet moments, and childhood milestones on premium photographic prints connected directly to your shared backup albums.',
    cta: 'Create Family Memory',
    image: '/images/memories/family-memories-wall.jpg',
    tags: ['Children', 'Pets', 'Reunions'],
    metaTitle: 'Family & Pet Memory Canvas | Personalized Photo Prints | FeelsNeat',
    metaDesc: 'Save child milestones, family moments, and playful pet memories on premium wall art linked directly to shared Google Photos.',
  },
};

export default function MemoriesPage({ whatsappNumber }: { whatsappNumber?: string }) {
  const number = whatsappNumber || '919999999999';
  const generalMemoriesMessage = encodeURIComponent(
    "Hi FeelsNeat! 👋\n\nI'd love to create a personalized FeelsNeat Memory Canvas.\n\nI'd like to turn some of my favourite memories and photographs into a personalized physical artwork with an NFC-connected digital experience. 😊"
  );

  return (
    <main className="flex-1 w-full bg-[#0A0A0C] text-[#F4F4F5] relative overflow-hidden">
      {/* Background blobs */}
      <div className="morphing-blob absolute top-20 left-10 opacity-20" />
      <div className="morphing-blob absolute bottom-40 right-20 opacity-15" />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 px-4 sm:px-6 z-10">
        <div className="mx-auto max-w-5xl">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E30613]/10 border border-[#E30613]/20 px-3 py-0.5 text-xs font-black text-[#E30613] uppercase tracking-widest">
                Introducing FeelsNeat Memories
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight uppercase leading-tight">
                Your memories,<br />
                <span className="text-[#E30613]">made tangible.</span>
              </h1>
              <p className="text-sm sm:text-base text-[#F4F4F5]/90 leading-relaxed font-medium">
                Turn your favorite photographs into beautiful personalized wall art, connected directly to the digital memories behind them.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-2">
                <a
                  href={`https://wa.me/${number}?text=${generalMemoriesMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-[#E30613] hover:bg-white hover:text-black px-6 text-xs font-black uppercase tracking-wider text-white transition-colors duration-300 shadow-md cursor-pointer"
                >
                  Create Your Memory
                </a>
                <a
                  href="#explore"
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-6 text-xs font-black uppercase tracking-wider transition-colors duration-300 cursor-pointer"
                >
                  Explore Memory Ideas
                </a>
              </div>
            </div>

            {/* Hero Right Mockup Wall Art */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="relative w-full max-w-[460px] aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-lg select-none">
                <img
                  src="/images/memories/memories-hero.jpg"
                  alt="Personalized memory canvases displayed on a modern apartment wall"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-24 bg-[#0D0D10] border-t border-b border-white/5 relative z-10 scroll-reveal">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-black text-[#E30613] uppercase tracking-widest block mb-2">
              The Experience
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              More than a photo on the wall.
            </h2>
            <p className="mt-3 text-sm text-[#F4F4F5]/80 leading-relaxed font-medium">
              Choose a photograph that means something to you. We turn it into a personalized Memory Canvas and connect it to your Google Photos album with a hidden NFC chip on the back.
            </p>
          </div>

          {/* Simple Step-by-Step workflow graphics */}
          <div className="grid md:grid-cols-4 gap-8 text-center relative">
            {/* Step 1 */}
            <div className="space-y-4 flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-[#E30613]">
                <LucideIcon name="Image" className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-[#F4F4F5]">1. Choose Photo</h4>
                <p className="text-xs text-[#F4F4F5]/70 mt-1.5 leading-relaxed font-medium">Select and upload your visual hero print file.</p>
              </div>
            </div>
            {/* Step 2 */}
            <div className="space-y-4 flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-[#E30613]">
                <LucideIcon name="Feather" className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-[#F4F4F5]">2. Handcrafted</h4>
                <p className="text-xs text-[#F4F4F5]/70 mt-1.5 leading-relaxed font-medium">We print and mount onto a clean rigid panel.</p>
              </div>
            </div>
            {/* Step 3 */}
            <div className="space-y-4 flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-[#E30613]">
                <LucideIcon name="Radio" className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-[#F4F4F5]">3. NFC Link</h4>
                <p className="text-xs text-[#F4F4F5]/70 mt-1.5 leading-relaxed font-medium">We configure and program the NFC link on the back.</p>
              </div>
            </div>
            {/* Step 4 */}
            <div className="space-y-4 flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-[#E30613]">
                <LucideIcon name="Smartphone" className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-[#F4F4F5]">4. Tap to Play</h4>
                <p className="text-xs text-[#F4F4F5]/70 mt-1.5 leading-relaxed font-medium">Tap the front of the artwork to open Google Photos.</p>
              </div>
            </div>
          </div>

          {/* NFC explanation callout */}
          <div className="mt-16 rounded-xl border border-white/10 bg-white/5 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 max-w-3xl mx-auto text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E30613]/10 border border-[#E30613]/30 text-[#E30613] shrink-0">
              <LucideIcon name="ShieldCheck" className="h-5 w-5" />
            </div>
             <div>
              <h4 className="text-sm font-black uppercase tracking-wider text-[#F4F4F5]">Your Privacy Rules</h4>
              <p className="text-sm text-[#F4F4F5]/80 leading-relaxed mt-2 font-medium">
                Share your Google Photos shared album link with us during configuration. We connect it to your Memory Canvas. We do not require account access, credentials, or Google authorization, and your photos are kept completely safe within Google Photos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES COLLECTION GRID */}
      <section id="explore" className="py-24 relative z-10 scroll-reveal">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="max-w-2xl mb-16 text-left">
            <span className="text-xs font-black text-[#E30613] uppercase tracking-widest block mb-2">
              The Categories
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              Explore Memory Ideas
            </h2>
            <p className="mt-3 text-sm text-[#F4F4F5]/80 leading-relaxed font-medium">
              We design Canvas panels configured for different types of journeys, relationships, and lifecycle milestones.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {Object.values(MEMORY_CATEGORIES).map((cat) => (
              <div 
                key={cat.slug}
                className="group flex flex-col rounded-2xl border border-white/10 bg-[#0E0E12] overflow-hidden hover:border-[#E30613] transition-all duration-300 flex-1 shadow-sm"
              >
                {/* Cover visual */}
                <div className="aspect-[16/10] w-full overflow-hidden relative select-none border-b border-white/5 bg-white/5">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4 flex gap-1">
                    {cat.tags.map((tag) => (
                      <span key={tag} className="text-xs font-semibold uppercase text-white bg-black/60 px-2.5 py-0.5 rounded-md border border-white/10">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 flex flex-col flex-grow text-left">
                  <span className="text-xs font-black text-[#E30613] uppercase tracking-widest block mb-2">{cat.positioning}</span>
                  <h3 className="text-lg font-bold uppercase tracking-tight text-[#F4F4F5] mb-3">{cat.title}</h3>
                  <p className="text-sm text-[#F4F4F5]/80 leading-relaxed flex-grow font-medium mb-6">{cat.subtitle}</p>
                  
                  <div className="pt-4 border-t border-white/5 mt-auto flex items-center justify-between">
                    <Link
                      href={`/memories/${cat.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-black text-[#F4F4F5] hover:text-[#E30613] uppercase tracking-wider transition-colors pb-0.5 border-b border-[#F4F4F5]/30 hover:border-[#E30613]"
                    >
                      Explore details <LucideIcon name="ArrowRight" className="h-3 w-3" />
                    </Link>
                    <a
                      href={`https://wa.me/${number}?text=${encodeURIComponent(
                        cat.slug === 'travel'
                          ? "Hi FeelsNeat! ✈️\n\nI'd love to create a personalized Travel Memory Canvas.\n\nI'd like to use photographs and memories from a trip and turn them into a personalized physical artwork. 😊"
                          : cat.slug === 'events'
                          ? "Hi FeelsNeat! 🎉\n\nI'd love to create a personalized Memory Canvas for a special event or celebration.\n\nI'd like to preserve some photographs and memories from the occasion in a personalized artwork. 😊"
                          : cat.slug === 'couples'
                          ? "Hi FeelsNeat! ❤️\n\nI'd love to create a personalized Couple Memory Canvas.\n\nI'd like to turn some special shared memories and photographs into something personal and meaningful. 😊"
                          : "Hi FeelsNeat! 👋🐾\n\nI'd love to create a personalized Family, Life or Pet Memory Canvas.\n\nI'd like to turn some meaningful photographs and memories into a personalized artwork. 😊"
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-8 items-center justify-center rounded-md bg-[#E30613] hover:bg-white hover:text-black px-4 text-xs font-black uppercase tracking-wider text-white transition-colors duration-300 cursor-pointer"
                    >
                      {cat.cta}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
