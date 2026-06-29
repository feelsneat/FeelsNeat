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
      default: return 'Link';
    }
  };

  return (
    <footer className="w-full border-t border-border-custom bg-background">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Logo & Description */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-md bg-white border border-border-custom">
                <img 
                  src="/logo.png" 
                  alt="FeelsNeat Logo" 
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="text-base font-bold tracking-tight text-foreground">
                {settings.siteName}
              </span>
            </Link>
            <p className="max-w-md text-sm leading-relaxed text-foreground/70">
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
                  className="text-foreground/45 hover:text-foreground transition-colors"
                  aria-label={`Visit FeelsNeat on ${social.platform}`}
                >
                  <LucideIcon name={getSocialIcon(social.platform)} className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
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
                        className="text-sm text-foreground/70 hover:text-foreground transition-colors font-medium"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Panel */}
        <div className="mt-12 border-t border-border-custom pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-foreground/50">
            &copy; {currentYear} {settings.siteName}. All rights reserved. Built with precision and simplicity.
          </p>
          <p className="text-xs text-foreground/45 flex items-center gap-1.5 font-medium">
            <LucideIcon name="Feather" className="h-3.5 w-3.5" /> Timeless Craftsmanship.
          </p>
        </div>
      </div>
    </footer>
  );
}
