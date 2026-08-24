import { Metadata } from 'next';
import Link from 'next/link';
import { getWork, getServices, getProducts } from '@/lib/cms';
import { LucideIcon } from '@/components/ui/LucideIcon';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Our Work',
  description: 'A complete index of services, digital templates, and past projects by FeelsNeat.',
};

export default async function OurWorkPage() {
  const projects = await getWork();
  const services = await getServices();
  const products = await getProducts();

  return (
    <main className="flex-1 w-full bg-[#0A0A0C] py-20 sm:py-28 border-b border-white/10 relative">
      {/* Background blobs */}
      <div className="morphing-blob absolute top-10 left-10 opacity-20" />
      <div className="morphing-blob-large absolute bottom-10 right-10 opacity-25" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 relative z-10 space-y-24">
        
        {/* PAGE HEADER */}
        <div className="max-w-3xl scroll-reveal">
          <span className="text-xs font-black text-[#E30613] uppercase tracking-widest block mb-3">Portfolio & Capabilities</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#F4F4F5] uppercase">
            Our Work
          </h1>
          <p className="mt-6 text-base sm:text-lg text-[#F4F4F5]/80 leading-relaxed font-medium">
            A comprehensive catalog of everything we design, prototype, and engineer. Below you will find our professional consultation services, instant digital tools, physical art categories, and detailed project case studies.
          </p>
        </div>

        {/* SECTION 1: CAPABILITY SERVICES */}
        <section id="services" className="space-y-10 scroll-reveal border-t border-white/10 pt-16">
          <div className="max-w-2xl text-left">
            <span className="text-xs font-black text-[#E30613] uppercase tracking-widest block mb-2">Capabilities</span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#F4F4F5] uppercase tracking-tight">
              Professional Services
            </h2>
            <p className="mt-2 text-sm text-[#F4F4F5]/70 font-medium">
              We design and build tailormade structures, codebases, and interface systems for modern business operations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div 
                key={service.slug}
                className="flex flex-col rounded-2xl border border-white/5 bg-[#0E0E12]/80 overflow-hidden hover:border-white/10 transition-all duration-300 shadow-sm p-6 justify-between min-h-[480px]"
              >
                <div className="space-y-4">
                  {/* Service Image Visualizer */}
                  <div className="w-full aspect-[1.6/1] rounded-xl overflow-hidden border border-white/10 bg-white/5 relative mb-4">
                    {service.image ? (
                      <img 
                        src={service.image} 
                        alt={service.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[#0E0E12] flex items-center justify-center">
                        <LucideIcon name={service.icon || 'Code'} className="h-8 w-8 text-[#E30613]/80" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-[#E30613]">
                      <LucideIcon name={service.icon || 'Code'} className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#F4F4F5] uppercase tracking-tight leading-tight">{service.title}</h3>
                      <span className="text-[9px] text-[#E30613] uppercase tracking-widest font-black block mt-0.5">Capability 0{index + 1}</span>
                    </div>
                  </div>

                  <p className="text-xs font-bold text-[#F4F4F5]/90 uppercase tracking-tight leading-normal pt-2">
                    {service.summary}
                  </p>

                  <div className="text-xs text-[#F4F4F5]/65 space-y-2 leading-relaxed font-semibold pt-2"
                    dangerouslySetInnerHTML={{ __html: service.content }}
                  />
                </div>

                <div className="pt-6 border-t border-white/5 flex items-center justify-between mt-6">
                  <div className="flex flex-wrap gap-1">
                    {(service.tags || []).slice(0, 2).map((tag) => (
                      <span key={tag} className="inline-flex items-center rounded-md bg-white/5 border border-white/10 px-1.5 py-0.5 text-[9px] text-[#F4F4F5]/60 uppercase font-black">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Link 
                    href={`/create?service=${service.slug}`}
                    className="inline-flex h-9 items-center justify-center rounded-lg bg-[#E30613] hover:bg-zinc-900 text-white px-4 text-xs font-black uppercase tracking-wider transition-colors duration-300 cursor-pointer shadow-sm"
                  >
                    Request Service
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: DIGITAL PRODUCTS */}
        <section id="products" className="space-y-10 scroll-reveal border-t border-white/10 pt-16">
          <div className="max-w-2xl text-left">
            <span className="text-xs font-black text-[#E30613] uppercase tracking-widest block mb-2">Instant Downloads</span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#F4F4F5] uppercase tracking-tight">
              Digital Products & Templates
            </h2>
            <p className="mt-2 text-sm text-[#F4F4F5]/70 font-medium">
              Meticulously structured Notion setups, bookkeeping spreadsheets, and LaTeX templates available for instant setup.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {products.map((product) => (
              <div 
                key={product.id}
                className="flex flex-col rounded-2xl border border-white/5 bg-[#0E0E12]/80 overflow-hidden hover:border-white/10 transition-all duration-300 shadow-sm p-6 justify-between min-h-[340px]"
              >
                {/* Header info */}
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black text-[#E30613] uppercase tracking-widest bg-[#E30613]/5 border border-[#E30613]/15 px-2 py-0.5 rounded">
                      {product.category}
                    </span>
                    <span className="text-sm font-black text-[#F4F4F5]">
                      {product.price}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-[#F4F4F5] uppercase tracking-tight leading-snug">
                    {product.title}
                  </h3>
                  
                  <ul className="space-y-1.5 text-xs text-[#F4F4F5]/70 font-semibold list-disc pl-4 uppercase">
                    {(product.features || []).slice(0, 3).map((feat, idx) => (
                      <li key={idx}>{feat}</li>
                    ))}
                  </ul>
                </div>

                {/* Bottom Row CTA */}
                <div className="pt-6 border-t border-white/5 flex items-center justify-between mt-6">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#F4F4F5]/50">
                    <LucideIcon name="DownloadCloud" className="h-4 w-4 text-[#E30613]" /> Digital Copy
                  </span>
                  <Link
                    href={`/create?product=${product.id}`}
                    className="inline-flex h-9 items-center justify-center rounded-lg bg-white hover:bg-[#E30613] text-black hover:text-white px-4 text-xs font-black uppercase tracking-wider transition-colors duration-300 cursor-pointer shadow-sm"
                  >
                    Order Template
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: NFC MEMORIES ARTWORK */}
        <section id="memories" className="space-y-10 scroll-reveal border-t border-white/10 pt-16">
          <div className="max-w-2xl text-left">
            <span className="text-xs font-black text-[#E30613] uppercase tracking-widest block mb-2">Physical Canvas</span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#F4F4F5] uppercase tracking-tight">
              FeelsNeat Memories Artwork
            </h2>
            <p className="mt-2 text-sm text-[#F4F4F5]/70 font-medium">
              Premium mounted wall art panels pre-programmed with custom NFC microchips linking directly to your shared photo albums.
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#0E0E12]/80 p-8 flex flex-col md:flex-row gap-8 items-center hover:border-white/10 transition-all duration-300">
            <div className="w-full md:w-1/2 aspect-[1.5/1] rounded-xl overflow-hidden border border-white/10 bg-white/5 relative">
              <img 
                src="/images/memories/memories-hero.jpg" 
                alt="FeelsNeat Memories wall canvas installation mockup" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-full md:w-1/2 space-y-6 text-left">
              <span className="text-xs font-black text-[#E30613] uppercase tracking-widest block">Interactive Photo Prints</span>
              <h3 className="text-xl font-extrabold text-[#F4F4F5] uppercase tracking-tight leading-none">
                Personalized Memory Canvas
              </h3>
              <p className="text-xs sm:text-sm text-[#F4F4F5]/70 leading-relaxed font-semibold">
                Select from Travel, Wedding, Relationship, or Family layouts. Each physical panel features rigid MDF mounting, matte photo prints, and a hidden NFC transmitter.
              </p>
              <div className="pt-4 border-t border-white/5 flex gap-4">
                <Link
                  href="/memories"
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-[#E30613] hover:bg-[#F4F4F5] text-white hover:text-black px-5 text-xs font-black uppercase tracking-wider transition-colors duration-300 cursor-pointer shadow-sm"
                >
                  Explore Memories Collection
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: PORTFOLIO CASE STUDIES */}
        <section id="portfolio" className="space-y-10 scroll-reveal border-t border-white/10 pt-16">
          <div className="max-w-2xl text-left">
            <span className="text-xs font-black text-[#E30613] uppercase tracking-widest block mb-2">Case Studies</span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#F4F4F5] uppercase tracking-tight">
              Past Projects & Sandbox Works
            </h2>
            <p className="mt-2 text-sm text-[#F4F4F5]/70 font-medium">
              Read step-by-step breakdowns of developer setups, visual designs, and systems built by our design engine.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mt-12 pt-6">
            {projects.map((project) => (
              <Link 
                key={project.slug}
                href={`/our-work/${project.slug}`}
                className="group flex flex-col cursor-pointer scroll-reveal"
              >
                {/* Cover Image */}
                <div className="w-full aspect-[1.8/1] rounded-lg mb-6 relative overflow-hidden border border-white/10 bg-white/5 shadow-sm group-hover:border-[#E30613] transition-all duration-300">
                  {project.coverImage ? (
                    <img 
                      src={project.coverImage} 
                      alt={project.title} 
                      className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[#0E0E12] flex flex-col justify-end p-6">
                      <span className="text-[10px] font-bold text-[#F4F4F5]/50 tracking-wider uppercase mb-1">{project.client}</span>
                      <h2 className="text-xl font-black text-[#F4F4F5] uppercase leading-snug">{project.title}</h2>
                    </div>
                  )}
                </div>

                {/* Metadata details */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-black text-[#F4F4F5]/60 uppercase tracking-widest">
                    <span>{project.client}</span>
                    <span className="text-[#E30613]">{project.category}</span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-[#F4F4F5] uppercase group-hover:text-[#E30613] transition-colors leading-snug tracking-tight">
                    {project.title}
                  </h3>
                  
                  <p className="text-sm text-[#F4F4F5]/70 leading-relaxed font-semibold">
                    {project.summary}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 items-center justify-between pt-4 border-t border-white/5 mt-4">
                    <div className="flex flex-wrap gap-1">
                      {(project.tags || []).map((tag) => (
                        <span key={tag} className="inline-flex items-center rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-xs text-[#F4F4F5]/80">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-[#F4F4F5]/60 uppercase tracking-widest">{project.status}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
