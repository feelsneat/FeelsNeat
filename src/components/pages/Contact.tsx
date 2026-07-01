import { Metadata } from 'next';
import { getPage, getSettings } from '@/lib/cms';
import { ContactForm } from '@/components/interactive/ContactForm';
import { LucideIcon } from '@/components/ui/LucideIcon';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with the FeelsNeat team to discuss products, tools, experiments, or general feedback.',
};

export default async function ContactPage() {
  const pageData = await getPage('contact');
  const settings = await getSettings();

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter': return 'Twitter';
      case 'github': return 'Github';
      case 'linkedin': return 'Linkedin';
      case 'youtube': return 'Youtube';
      case 'substack': return 'BookOpen';
      default: return 'Link';
    }
  };

  return (
    <main className="flex-1 w-full bg-[#0A0A0C] py-20 sm:py-28 border-b border-white/10 relative">
      {/* Morphing background shapes */}
      <div className="morphing-blob absolute top-20 left-10 opacity-30" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Page Info */}
          <div className="lg:col-span-5 space-y-10 scroll-reveal">
            <div>
              <span className="text-[10px] font-black text-[#E30613] uppercase tracking-widest block mb-3">Connect</span>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#F4F4F5] uppercase leading-none">
                {pageData.title}
              </h1>
              <p className="mt-6 text-base text-[#F4F4F5] leading-relaxed font-medium">
                {pageData.subtitle}
              </p>
            </div>

            <div 
              className="text-sm text-[#F4F4F5] leading-relaxed prose max-w-none font-medium"
              dangerouslySetInnerHTML={{ __html: pageData.content }}
            />

            {/* Direct Connect Info */}
            <div className="pt-10 border-t border-white/10 space-y-8">
              <div className="space-y-2">
                <h3 className="text-[10px] font-black tracking-widest text-[#E30613] uppercase">
                  {pageData.infoTitle || 'Connections'}
                </h3>
                <p className="text-xs text-[#F4F4F5] leading-relaxed">
                  {pageData.infoText}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <a 
                  href={`mailto:${settings.contactEmail}`} 
                  className="flex items-center gap-3 text-sm text-[#F4F4F5] hover:text-[#E30613] transition-colors w-fit font-bold"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-[#E30613] shadow-sm">
                    <LucideIcon name="Mail" className="h-4.5 w-4.5" />
                  </div>
                  <span>{settings.contactEmail}</span>
                </a>
              </div>

              {/* Social networks list */}
              <div className="flex gap-3">
                {settings.socials.map((social) => (
                  <a
                    key={social.platform}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-[#F4F4F5] hover:text-[#E30613] hover:border-[#E30613]/25 hover:bg-white/10 transition-all duration-300 shadow-sm"
                    aria-label={`Visit FeelsNeat on ${social.platform}`}
                  >
                    <LucideIcon name={getSocialIcon(social.platform)} className="h-4.5 w-4.5" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Form UI */}
          <div className="lg:col-span-7 scroll-reveal">
            <ContactForm />
          </div>
        </div>
      </div>
    </main>
  );
}
