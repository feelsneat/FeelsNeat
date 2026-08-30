'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LucideIcon } from '@/components/ui/LucideIcon';

// Centralized Tap Tiles categories registry
export const TAP_TILES_CATEGORIES = {
  nostalgia: {
    slug: 'nostalgia',
    title: 'Nostalgia Taps',
    positioning: 'Turn old memories into something physical.',
    subtitle: 'Retro snapshots, childhood pictures, and high school throwbacks.',
    description: 'Keep your best childhood memories, school years, college trip snapshots, and retro milestones close by. Link your tile to a Spotify throwback playlist, school memory video, or Google Photos throwback album.',
    cta: 'Create Nostalgia Tile',
    image: '/images/tap-tiles/nostalgia.jpg',
    tags: ['Retro', 'Throwback', 'School Days'],
  },
  friends: {
    slug: 'friends',
    title: 'Friends & Inside Jokes',
    positioning: 'The group chat in physical form.',
    subtitle: 'Candid friend snaps, inside jokes, and unforgettable moments.',
    description: 'The photo everyone remembers. The joke nobody else understands. The song that takes you right back to that trip. Perfect as a pocket keychain or fridge magnet that opens your favorite group chat playlist or travel album.',
    cta: 'Create Friendship Tile',
    image: '/images/tap-tiles/friends.jpg',
    tags: ['Group Chat', 'Inside Jokes', 'Adventure'],
  },
  couples: {
    slug: 'couples',
    title: 'Our Song',
    positioning: 'Small art. One tap. A whole memory.',
    subtitle: 'Couples snapshots, anniversary dates, and relationship timelines.',
    description: 'An elegant tribute to your relationship. Select a couples photo, customize the typography, and connect it directly to your shared song on Spotify or your Google Photos relationship album.',
    cta: 'Create Couple Tile',
    image: '/images/tap-tiles/hero-mockup.jpg',
    tags: ['Relationship', 'Soundtrack', 'Anniversary'],
  },
  pets: {
    slug: 'pets',
    title: 'Pet Tap Tiles',
    positioning: 'Personality included.',
    subtitle: 'Silly snapshots, cozy portraits, and funny character overlays.',
    description: 'Turn your dog or cat\'s unique personality into a small collectible piece of art. Choose your favorite pet snapshot, add a funny caption, and link it directly to their photo album or favorite cozy playlist.',
    cta: 'Create Pet Tile',
    image: '/images/tap-tiles/pets-hero.jpg',
    tags: ['Dog Lover', 'Cat Life', 'Portraits'],
  },
};

// Reusable FAQ Item component for interactive accordions
function FaqAccordionItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white/5 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left focus:outline-none py-2 group cursor-pointer"
      >
        <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#F4F4F5] group-hover:text-[#E30613] transition-colors">
          {question}
        </span>
        <span className="ml-4 flex h-6 w-6 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-zinc-400 group-hover:text-white transition-colors">
          <LucideIcon name={isOpen ? 'X' : 'Menu'} className="h-3 w-3" />
        </span>
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-xs sm:text-sm text-[#F4F4F5]/70 leading-relaxed font-medium pb-2">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function TapTilesPage() {
  const faqItems = [
    {
      question: "WHAT DOES THE NFC TAP DO?",
      answer: "The NFC tag opens the link you selected when ordering, such as a Spotify song or playlist, YouTube video, Google Photos album, or website URL."
    },
    {
      question: "DO I NEED TO PROGRAM THE NFC?",
      answer: "No. You provide the destination link when ordering, and FeelsNeat programs the NFC tag before your Tap Tile is shipped. It arrives ready to use right out of the box."
    },
    {
      question: "CAN I USE MY OWN PHOTO?",
      answer: "Yes. Tap Tiles are fully personalized and designed around your own photos, artwork, memories, and jokes."
    },
    {
      question: "CAN I ADD TEXT?",
      answer: "Yes. You can add a caption, date, inner joke, message, or other custom text depending on your design preferences."
    },
    {
      question: "WHAT HAPPENS WHEN I TAP IT?",
      answer: "Your phone detects the NFC chip embedded in the tile and opens the destination link (e.g., Spotify, YouTube, or Google Photos) instantly."
    },
    {
      question: "DOES IT AUTOMATICALLY PLAY MUSIC?",
      answer: "The Tap Tile opens your selected Spotify song, playlist, or other link. Playback behavior depends on your device OS, settings, and the specific apps installed."
    }
  ];

  return (
    <main className="flex-1 w-full bg-[#0A0A0C] text-[#F4F4F5] relative overflow-hidden">
      {/* Background radial gradients/blobs */}
      <div className="morphing-blob absolute top-20 left-10 opacity-20" />
      <div className="morphing-blob absolute bottom-40 right-20 opacity-15" />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 px-4 sm:px-6 z-10">
        <div className="mx-auto max-w-5xl">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E30613]/10 border border-[#E30613]/20 px-3 py-0.5 text-xs font-black text-[#E30613] uppercase tracking-widest">
                Introducing FeelsNeat Tap Tiles
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight uppercase leading-tight font-sans">
                YOUR PHOTO.<br />
                YOUR WORDS.<br />
                <span className="text-[#E30613]">YOUR SOUND.</span>
              </h1>
              <p className="text-sm sm:text-base text-[#F4F4F5]/90 leading-relaxed font-medium">
                Personalized mini art made from your memories, humor, and ideas — connected to something meaningful with a simple tap.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/create-tap-tile"
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-[#E30613] hover:bg-white hover:text-black px-6 text-xs font-black uppercase tracking-wider text-white transition-colors duration-300 shadow-md cursor-pointer"
                >
                  Create Your Tap Tile
                </Link>
                <a
                  href="#explore"
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-6 text-xs font-black uppercase tracking-wider transition-colors duration-300 cursor-pointer"
                >
                  Explore Ideas
                </a>
              </div>
            </div>

            {/* Hero Right Visual Composition */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="relative w-full max-w-[500px] aspect-[3/2] rounded-2xl border border-white/10 bg-[#0E0E12] overflow-hidden shadow-2xl group select-none">
                <img
                  src="/images/tap-tiles/friends.jpg"
                  alt="FeelsNeat Tap Tiles keychain and smartphone music tap demo"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT ARE TAP TILES SECTION */}
      <section className="py-24 bg-[#0D0D10] border-t border-b border-white/5 relative z-10 scroll-reveal">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-black text-[#E30613] uppercase tracking-widest block mb-2">
              The Product Concept
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              MORE THAN A PHOTO.
            </h2>
            <p className="mt-3 text-sm text-[#F4F4F5]/80 leading-relaxed font-medium">
              Tap Tiles turn your photos, memories, jokes, and ideas into small pieces of personalized art. Inside each one is an NFC tag programmed with a destination chosen by you. Tap it with your phone to open your song, playlist, video, photo album, or link.
            </p>
          </div>

          {/* Diagram Flow */}
          <div className="grid md:grid-cols-4 gap-8 text-center relative">
            {/* Step 1 */}
            <div className="space-y-4 flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-[#E30613]">
                <LucideIcon name="Paintbrush" className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-[#F4F4F5]">1. Customize</h4>
                <p className="text-xs text-[#F4F4F5]/70 mt-1.5 leading-relaxed font-medium">Choose your photo, artwork, and optional text overlay.</p>
              </div>
            </div>
            {/* Step 2 */}
            <div className="space-y-4 flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-[#E30613]">
                <LucideIcon name="Link" className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-[#F4F4F5]">2. Share Your Link</h4>
                <p className="text-xs text-[#F4F4F5]/70 mt-1.5 leading-relaxed font-medium">Provide the Spotify song, playlist, video, or photos link.</p>
              </div>
            </div>
            {/* Step 3 */}
            <div className="space-y-4 flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-[#E30613]">
                <LucideIcon name="Cpu" className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-[#F4F4F5]">3. We Program It</h4>
                <p className="text-xs text-[#F4F4F5]/70 mt-1.5 leading-relaxed font-medium">We configure and write the NFC tag before packaging.</p>
              </div>
            </div>
            {/* Step 4 */}
            <div className="space-y-4 flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-[#E30613]">
                <LucideIcon name="Smartphone" className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-[#F4F4F5]">4. Tap to Open</h4>
                <p className="text-xs text-[#F4F4F5]/70 mt-1.5 leading-relaxed font-medium">Tap your phone and open the experience connected to your tile.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-24 relative z-10 scroll-reveal">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Steps (Left) */}
            <div className="lg:col-span-6 space-y-8">
              <div className="text-left">
                <span className="text-xs font-black text-[#E30613] uppercase tracking-widest block mb-2">
                  Four Simple Steps
                </span>
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                  How It Works
                </h2>
              </div>

              <div className="space-y-6">
                {[
                  { num: '01', title: 'UPLOAD YOUR MEMORY', desc: 'Choose your favorite photo, visual canvas, or custom design print file.' },
                  { num: '02', title: 'MAKE IT YOURS', desc: 'Add optional text, a customized quote, milestone date, inner joke, or title.' },
                  { num: '03', title: 'CONNECT YOUR LINK', desc: 'Provide the Spotify playlist, YouTube clip, Google Photos link, or URL you want it to trigger.' },
                  { num: '04', title: 'WE CREATE IT', desc: 'We professionally mount the artwork and program the internal NFC before shipping.' }
                ].map((step, idx) => (
                  <div key={idx} className="flex gap-4 border-l border-white/5 pl-4 hover:border-[#E30613] transition-colors duration-300">
                    <span className="text-lg font-black text-[#E30613] font-mono leading-none">{step.num}</span>
                    <div className="text-left">
                      <h4 className="text-xs font-black uppercase tracking-wider text-[#F4F4F5]">{step.title}</h4>
                      <p className="text-xs text-[#F4F4F5]/70 mt-1 leading-normal font-medium">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tap Open Enjoy Diagram (Right) */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-full max-w-[380px] rounded-2xl border border-white/10 bg-[#0E0E12] p-8 text-center space-y-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-radial-gradient from-[#E30613]/5 to-transparent opacity-30 select-none pointer-events-none" />
                <h3 className="text-xs font-black text-white/40 tracking-widest uppercase">The Trigger System</h3>
                <div className="flex items-center justify-center gap-6 py-6">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-[#E30613] tracking-widest uppercase mb-2">TAP</span>
                    <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400">
                      <LucideIcon name="Smartphone" className="h-5 w-5" />
                    </div>
                  </div>
                  <LucideIcon name="ArrowRight" className="h-4 w-4 text-white/20" />
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-[#E30613] tracking-widest uppercase mb-2">OPEN</span>
                    <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400">
                      <LucideIcon name="Globe" className="h-5 w-5" />
                    </div>
                  </div>
                  <LucideIcon name="ArrowRight" className="h-4 w-4 text-white/20" />
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-[#E30613] tracking-widest uppercase mb-2">PLAY</span>
                    <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400">
                      <LucideIcon name="Check" className="h-5 w-5" />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-[#F4F4F5]/60 font-semibold uppercase tracking-wider leading-relaxed">
                  "One tap to something meaningful."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TAP TILE IDEAS / NICHE SECTION */}
      <section id="explore" className="py-24 bg-[#0D0D10] border-t border-b border-white/5 relative z-10 scroll-reveal">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="max-w-2xl mb-16 text-left">
            <span className="text-xs font-black text-[#E30613] uppercase tracking-widest block mb-2">
              Niche Ideas
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              Explore Tap Tile Ideas
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Nostalgia */}
            <div className="group rounded-2xl border border-white/5 bg-[#0E0E12] overflow-hidden flex flex-col justify-between h-[380px] shadow-sm hover:border-white/10 transition-all duration-300">
              <div className="relative h-48 w-full bg-zinc-950 overflow-hidden select-none">
                <div className="absolute inset-0 bg-cover bg-center filter grayscale contrast-110 opacity-70 group-hover:scale-102 transition-transform duration-500" style={{ backgroundImage: "url('/images/tap-tiles/nostalgia.jpg')" }} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E12] to-transparent" />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between text-left">
                <div>
                  <span className="text-[8px] font-black text-[#E30613] tracking-widest uppercase">THROWBACKS</span>
                  <h3 className="text-sm font-bold uppercase tracking-tight text-[#F4F4F5] mt-1">NOSTALGIA TAPS</h3>
                  <p className="text-xs text-[#F4F4F5]/85 mt-2 leading-relaxed">Turn childhood, school, college, or old friendship memories into something physical.</p>
                </div>
                <Link
                  href="/tap-tiles/nostalgia"
                  className="inline-flex h-8 items-center justify-center rounded bg-[#E30613] hover:bg-white hover:text-black text-xs font-black uppercase tracking-wider text-white transition-colors duration-300 mt-4 cursor-pointer"
                >
                  Create Tap Tile
                </Link>
              </div>
            </div>

            {/* Card 2: Friends */}
            <div className="group rounded-2xl border border-white/5 bg-[#0E0E12] overflow-hidden flex flex-col justify-between h-[380px] shadow-sm hover:border-white/10 transition-all duration-300">
              <div className="relative h-48 w-full bg-zinc-950 overflow-hidden select-none">
                <div className="absolute inset-0 bg-cover bg-center opacity-70 group-hover:scale-102 transition-transform duration-500" style={{ backgroundImage: "url('/images/tap-tiles/friends.jpg')" }} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E12] to-transparent" />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between text-left">
                <div>
                  <span className="text-[8px] font-black text-[#E30613] tracking-widest uppercase">THE GROUP CHAT</span>
                  <h3 className="text-sm font-bold uppercase tracking-tight text-[#F4F4F5] mt-1">FRIENDS & INSIDE JOKES</h3>
                  <p className="text-xs text-[#F4F4F5]/85 mt-2 leading-relaxed">The photo everyone remembers. The joke nobody else understands. The song that takes you back.</p>
                </div>
                <Link
                  href="/tap-tiles/friends"
                  className="inline-flex h-8 items-center justify-center rounded bg-[#E30613] hover:bg-white hover:text-black text-xs font-black uppercase tracking-wider text-white transition-colors duration-300 mt-4 cursor-pointer"
                >
                  Create Tap Tile
                </Link>
              </div>
            </div>

            {/* Card 3: Couples */}
            <div className="group rounded-2xl border border-white/5 bg-[#0E0E12] overflow-hidden flex flex-col justify-between h-[380px] shadow-sm hover:border-white/10 transition-all duration-300">
              <div className="relative h-48 w-full bg-zinc-950 overflow-hidden select-none">
                <div className="absolute inset-0 bg-cover bg-center opacity-70 group-hover:scale-102 transition-transform duration-500" style={{ backgroundImage: "url('/images/tap-tiles/hero-mockup.jpg')" }} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E12] to-transparent" />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between text-left">
                <div>
                  <span className="text-[8px] font-black text-[#E30613] tracking-widest uppercase">YOUR MOMENT</span>
                  <h3 className="text-sm font-bold uppercase tracking-tight text-[#F4F4F5] mt-1">OUR SONG</h3>
                  <p className="text-xs text-[#F4F4F5]/85 mt-2 leading-relaxed">A photo, a date, and the song that means something to both of you. Romantic and minimal.</p>
                </div>
                <Link
                  href="/tap-tiles/couples"
                  className="inline-flex h-8 items-center justify-center rounded bg-[#E30613] hover:bg-white hover:text-black text-xs font-black uppercase tracking-wider text-white transition-colors duration-300 mt-4 cursor-pointer"
                >
                  Create Tap Tile
                </Link>
              </div>
            </div>

            {/* Card 4: Pets */}
            <div className="group rounded-2xl border border-white/5 bg-[#0E0E12] overflow-hidden flex flex-col justify-between h-[380px] shadow-sm hover:border-white/10 transition-all duration-300">
              <div className="relative h-48 w-full bg-zinc-950 overflow-hidden select-none">
                <div className="absolute inset-0 bg-cover bg-center opacity-70 group-hover:scale-102 transition-transform duration-500" style={{ backgroundImage: "url('/images/tap-tiles/pets-hero.jpg')" }} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E12] to-transparent" />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between text-left">
                <div>
                  <span className="text-[8px] font-black text-[#E30613] tracking-widest uppercase">PERSONALITY INCLUDED</span>
                  <h3 className="text-sm font-bold uppercase tracking-tight text-[#F4F4F5] mt-1">PET TAP TILES</h3>
                  <p className="text-xs text-[#F4F4F5]/85 mt-2 leading-relaxed">Turn your pet's silly or cozy personality into a tiny, custom piece of art.</p>
                </div>
                <Link
                  href="/tap-tiles/pets"
                  className="inline-flex h-8 items-center justify-center rounded bg-[#E30613] hover:bg-white hover:text-black text-xs font-black uppercase tracking-wider text-white transition-colors duration-300 mt-4 cursor-pointer"
                >
                  Create Tap Tile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCT FORM FACTORS SECTION */}
      <section className="py-24 relative z-10 scroll-reveal">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-black text-[#E30613] uppercase tracking-widest block mb-2">
              Form Factors
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              MADE TO STAY WITH YOU.
            </h2>
            <p className="mt-3 text-sm text-[#F4F4F5]/80 leading-relaxed font-medium">
              Choose the layout format that integrates best with your routine. Every piece is handcrafted.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Magnet Version */}
            <div className="border border-white/5 bg-[#0E0E12] rounded-2xl p-6 flex flex-col gap-4 text-left shadow-sm">
              <div className="h-44 bg-zinc-950 rounded-xl overflow-hidden relative select-none">
                <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: "url('/images/tap-tiles/boys-magnet.jpg')" }} />
                <div className="absolute top-3 left-3 bg-[#E30613] text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded">MAGNET</div>
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#F4F4F5]">KEEP IT CLOSE</h3>
                <p className="text-xs text-[#F4F4F5]/70 mt-1.5 leading-relaxed font-medium">
                  Attach your Tap Tile to a fridge or other metal surface and keep your memory part of your everyday home space.
                </p>
              </div>
            </div>

            {/* Keychain Version */}
            <div className="border border-white/5 bg-[#0E0E12] rounded-2xl p-6 flex flex-col gap-4 text-left shadow-sm">
              <div className="h-44 bg-zinc-950 rounded-xl overflow-hidden relative select-none">
                <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: "url('/images/tap-tiles/friends.jpg')" }} />
                <div className="absolute top-3 left-3 bg-[#E30613] text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded">KEYCHAIN</div>
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#F4F4F5]">TAKE IT WITH YOU</h3>
                <p className="text-xs text-[#F4F4F5]/70 mt-1.5 leading-relaxed font-medium">
                  Turn your memory into a premium mini art collectible that you can carry on keys or bags every day.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CUSTOMIZATION SECTION */}
      <section className="py-24 bg-[#0D0D10] border-t border-b border-white/5 relative z-10 scroll-reveal">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="max-w-2xl mb-16 text-left">
            <span className="text-xs font-black text-[#E30613] uppercase tracking-widest block mb-2">
              Specifications
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              MAKE IT YOURS.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {[
              { title: 'PHOTO OR ARTWORK', desc: 'Upload your favorite group photo, artwork, landscape, or custom design panel.' },
              { title: 'WORDS', desc: 'Add optional custom text, date details, jokes, message triggers, or album labels.' },
              { title: 'STYLE', desc: 'Choose a design aesthetic: Minimal, Retro, Funny, Vintage, Modern, or Dark mode.' },
              { title: 'LINK', desc: 'Connect a Spotify song, playlist, YouTube video, Google Photos album, or URL.' }
            ].map((spec, idx) => (
              <div key={idx} className="p-5 border border-white/5 bg-[#0E0E12] rounded-xl space-y-2">
                <span className="block text-[8px] font-black text-[#E30613] tracking-widest uppercase">OPTION 0{idx + 1}</span>
                <h4 className="text-xs font-black uppercase tracking-wider text-white">{spec.title}</h4>
                <p className="text-xs text-[#F4F4F5]/70 leading-relaxed font-medium">{spec.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-[10px] font-black uppercase tracking-widest text-[#F4F4F5]/50 mt-8 text-center">
            * Note: The link is pre-programmed into the internal NFC tag by FeelsNeat before shipping.
          </p>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-24 relative z-10 scroll-reveal">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-left mb-12">
            <span className="text-xs font-black text-[#E30613] uppercase tracking-widest block mb-2">
              Questions & Answers
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-1">
            {faqItems.map((item, idx) => (
              <FaqAccordionItem key={idx} question={item.question} answer={item.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* CREATE / ORDER CTA SECTION */}
      <section className="py-24 bg-[#0D0D10] border-t border-white/5 relative z-10 scroll-reveal">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-6">
          <span className="text-xs font-black text-[#E30613] uppercase tracking-widest block mb-2">
            Start Customization
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight leading-none text-white">
            CREATE YOUR TAP TILE.
          </h2>
          <p className="max-w-xl mx-auto text-sm text-[#F4F4F5]/80 leading-relaxed font-medium">
            Tell us what you want to create. Share your photo, your idea, and the link you want connected. We will handle the rest.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link
              href="/create-tap-tile"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-[#E30613] hover:bg-white hover:text-black px-8 text-xs font-black uppercase tracking-widest text-white transition-colors duration-300 shadow-md cursor-pointer"
            >
              Start Customizing
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-8 text-xs font-black uppercase tracking-widest text-[#F4F4F5] transition-colors duration-300 cursor-pointer"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
