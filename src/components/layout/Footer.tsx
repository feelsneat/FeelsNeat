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
    <footer className="w-full border-t border-white/10 bg-[#0A0A0C]">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Logo & Description */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-md bg-white/5 border border-white/10">
                <img 
                  src="/logo.png" 
                  alt="FeelsNeat Logo" 
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="text-base font-bold tracking-tight text-[#F4F4F5] uppercase tracking-wider">
                {settings.siteName}
              </span>
            </Link>
            <p className="max-w-md text-sm leading-relaxed text-[#F4F4F5]">
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
                  className="text-[#F4F4F5]/60 hover:text-[#E30613] transition-colors"
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
                <h3 className="text-xs font-bold tracking-wider text-[#F4F4F5] uppercase">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.items.map((item, itemIdx) => (
                    <li key={itemIdx}>
                      <Link
                        href={item.path}
                        className="text-sm text-[#F4F4F5]/80 hover:text-[#E30613] transition-colors font-medium"
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
              <h3 className="text-xs font-bold tracking-wider text-[#F4F4F5] uppercase">
                Systems Letter
              </h3>
              <p className="text-xs text-[#F4F4F5] leading-relaxed">
                Join our private newsletter for updates on visual systems and workflow productivity templates.
              </p>
              <div className="pt-1">
                <a
                  href="https://feelsneat.substack.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-[#E30613] hover:bg-white hover:text-black text-white px-4 text-[10px] font-black uppercase tracking-widest transition-colors duration-300 shadow-sm cursor-pointer"
                >
                  Join Publication
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Panel */}
        <div className="mt-12 border-t border-white/10 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-[#F4F4F5]/50">
              &copy; {currentYear} {settings.siteName}. All rights reserved.
            </p>
            <p className="text-xs text-[#F4F4F5]/60 flex items-center gap-1.5 font-medium">
              <LucideIcon name="Feather" className="h-3.5 w-3.5 text-[#E30613]" /> Timeless Craftsmanship.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
