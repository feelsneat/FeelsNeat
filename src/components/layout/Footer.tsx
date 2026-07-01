import Link from 'next/link';
import { LucideIcon } from '../ui/LucideIcon';
import { SiteSettings, NavigationConfig } from '@/lib/cms';

interface FooterProps {
  settings: SiteSettings;
  navigation: NavigationConfig;
}

export function Footer({ settings, navigation }: FooterProps) {
  const currentYear = new Date().getFullYear();

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
    <footer className="w-full border-t border-zinc-200 bg-[#FAFAFA]">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Logo & Description */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-md bg-zinc-100 border border-zinc-200">
                <img 
                  src="/logo.png" 
                  alt="FeelsNeat Logo" 
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="text-base font-bold tracking-tight text-foreground uppercase tracking-wider">
                {settings.siteName}
              </span>
            </Link>
            <p className="max-w-md text-sm leading-relaxed text-neutral-gray">
              {settings.siteDescription}
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              {settings.socials.map((social) => (
                <a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-gray/70 hover:text-foreground transition-colors"
                  aria-label={`Visit FeelsNeat on ${social.platform}`}
                >
                  <LucideIcon name={getSocialIcon(social.platform)} className="h-4.5 w-4.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Grid & Substack Mini Newsletter Signup */}
          <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            {/* Links columns */}
            {navigation.footerLinks.map((section, idx) => (
              <div key={idx} className="space-y-4">
                <h3 className="text-xs font-bold tracking-wider text-foreground uppercase">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.items.map((item, itemIdx) => (
                    <li key={itemIdx}>
                      <Link
                        href={item.path}
                        className="text-sm text-neutral-gray hover:text-foreground transition-colors font-medium"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Mini Newsletter Embed Column */}
            <div className="col-span-2 sm:col-span-1 space-y-4">
              <h3 className="text-xs font-bold tracking-wider text-foreground uppercase">
                Systems Letter
              </h3>
              <p className="text-xs text-neutral-gray leading-relaxed">
                Join our private newsletter for updates on visual systems and workflow productivity templates.
              </p>
              <div className="pt-1">
                <a
                  href="https://feelsneat.substack.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-foreground hover:bg-accent-custom text-background hover:text-white px-4 text-[10px] font-black uppercase tracking-widest transition-colors duration-300 shadow-3xs cursor-pointer"
                >
                  Join Publication
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Panel */}
        <div className="mt-12 border-t border-zinc-200 pt-8 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-neutral-gray/80">
              &copy; {currentYear} {settings.siteName}. All rights reserved.
            </p>
            <p className="text-xs text-neutral-gray/70 flex items-center gap-1.5 font-medium">
              <LucideIcon name="Feather" className="h-3.5 w-3.5 text-accent-custom" /> Timeless Craftsmanship.
            </p>
          </div>
          
          {/* Regulatory Compliance Label */}
          <div className="border-t border-zinc-200/50 pt-4 text-center sm:text-left">
            <p className="text-[9px] font-bold text-neutral-gray/60 tracking-wide leading-normal">
              Supply covered under LUT ARN — Supply meant for export without payment of IGST under Section 16 of the IGST Act, 2017.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
