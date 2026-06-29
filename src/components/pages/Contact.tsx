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
      default: return 'Link';
    }
  };

  return (
    <main className="flex-1 w-full bg-background py-16 sm:py-24 border-b border-border-custom">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Page Info */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest block mb-3">Connect</span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                {pageData.title}
              </h1>
              <p className="mt-6 text-base text-foreground/75 leading-relaxed font-medium">
                {pageData.subtitle}
              </p>
            </div>

            <div 
              className="text-sm text-foreground/70 leading-relaxed prose"
              dangerouslySetInnerHTML={{ __html: pageData.content }}
            />

            {/* Direct Connect Info */}
            <div className="pt-8 border-t border-border-custom space-y-6">
              <div>
                <h3 className="text-xs font-bold tracking-wider text-foreground uppercase mb-2">
                  {pageData.infoTitle || 'Connections'}
                </h3>
                <p className="text-xs text-foreground/70 leading-relaxed font-medium">
                  {pageData.infoText}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <a 
                  href={`mailto:${settings.contactEmail}`} 
                  className="flex items-center gap-3 text-sm text-foreground/80 hover:text-foreground transition-colors w-fit font-semibold"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background border border-border-custom">
                    <LucideIcon name="Mail" className="h-4 w-4" />
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
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-background border border-border-custom text-foreground/50 hover:text-foreground transition-colors"
                    aria-label={`Visit FeelsNeat on ${social.platform}`}
                  >
                    <LucideIcon name={getSocialIcon(social.platform)} className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Form UI */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>
      </div>
    </main>
  );
}
