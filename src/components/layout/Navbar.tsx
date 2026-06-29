'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon } from '../ui/LucideIcon';
import { SiteSettings, NavigationConfig } from '@/lib/cms';

interface NavbarProps {
  settings: SiteSettings;
  navigation: NavigationConfig;
}

export function Navbar({ settings, navigation }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Handle header show/hide on scroll direction (Tresmares Capital UX flow)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always show at the very top of the page
      if (currentScrollY < 15) {
        setIsVisible(true);
        setLastScrollY(currentScrollY);
        return;
      }

      // Hide when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Separate regular links from Contact link to render it as a solid black block action button (Tresmares style)
  const regularLinks = navigation.headerLinks.filter(l => l.path !== '/contact');
  const hasContactLink = navigation.headerLinks.some(l => l.path === '/contact');

  return (
    <header 
      className={`sticky top-0 z-50 w-full border-b border-zinc-100 bg-white/95 backdrop-blur-md transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      {/* Outer grid boundary line layout */}
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 relative">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group h-full py-4 border-r border-zinc-100/55 pr-6">
          <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-md bg-white border border-zinc-200">
            <img 
              src="/logo.png" 
              alt="FeelsNeat Logo" 
              className="h-full w-full object-cover"
            />
          </div>
          <span className="text-sm font-black tracking-widest text-foreground uppercase">
            {settings.siteName}
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 h-full ml-auto">
          {regularLinks.map((link) => {
            const isActive = pathname === link.path || (link.path !== '/' && pathname.startsWith(link.path));
            return (
              <Link
                key={link.path}
                href={link.path}
                className="relative text-xs font-black uppercase tracking-wider text-neutral-gray transition-colors hover:text-foreground h-full flex items-center"
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-accent-custom" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Call to action Contact button rendered as solid black rectangle block (Tresmares SOTD visual style) */}
        {hasContactLink && (
          <div className="hidden md:flex items-center h-full border-l border-zinc-100/55 pl-6 ml-6">
            <Link
              href="/contact"
              className="inline-flex h-10 items-center justify-center bg-foreground px-6 text-[10px] font-black uppercase tracking-widest text-background hover:bg-accent-custom hover:text-white transition-colors"
            >
              Contact
            </Link>
          </div>
        )}

        {/* Mobile menu toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-9 w-9 items-center justify-center rounded border border-zinc-250 text-foreground/75 hover:text-foreground md:hidden"
          aria-label="Toggle navigation menu"
        >
          <LucideIcon name={isOpen ? 'X' : 'Menu'} className="h-4 w-4" />
        </button>
      </div>

      {/* Mobile nav panel */}
      {isOpen && (
        <div className="border-b border-zinc-100 bg-white md:hidden animate-fade-in">
          <nav className="flex flex-col gap-4 px-4 py-6 sm:px-6">
            {navigation.headerLinks.map((link) => {
              const isActive = pathname === link.path || (link.path !== '/' && pathname.startsWith(link.path));
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`text-xs font-black uppercase tracking-widest transition-colors ${
                    isActive
                      ? 'text-accent-custom'
                      : 'text-foreground/60 hover:text-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
