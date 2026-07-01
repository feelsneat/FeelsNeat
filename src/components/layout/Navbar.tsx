'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [isVisible, setIsVisible] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const lastScrollY = useRef(0);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Handle header show/hide on scroll direction
  useEffect(() => {
    lastScrollY.current = window.scrollY;
    setIsAtTop(window.scrollY < 60);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsAtTop(currentScrollY < 60);

      if (currentScrollY < 15) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      if (currentScrollY > lastScrollY.current) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Separate regular links from Contact link
  const regularLinks = navigation.headerLinks.filter(l => l.path !== '/contact');
  const hasContactLink = navigation.headerLinks.some(l => l.path === '/contact');

  // Dynamic theme classes optimized for Light Warm Journal Vibe
  const headerTheme = isAtTop
    ? 'bg-transparent border-transparent text-foreground'
    : 'bg-white/80 border-zinc-200/50 text-foreground shadow-3xs backdrop-blur-md';

  const logoBorderTheme = isAtTop
    ? 'bg-zinc-100 border-zinc-200'
    : 'bg-zinc-50 border-zinc-200';

  const navLinkTheme = isAtTop
    ? 'text-foreground/80 hover:text-accent-custom'
    : 'text-neutral-gray hover:text-foreground';

  const contactButtonTheme = 'bg-foreground text-background hover:bg-accent-custom hover:text-white transition-colors duration-300 rounded-lg shadow-3xs';

  const mobileToggleTheme = isAtTop
    ? 'border-zinc-200/60 text-foreground/80 hover:text-foreground'
    : 'border-zinc-200 text-foreground/80 hover:text-foreground';

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 w-full border-b transform transition-all duration-300 ease-in-out ${headerTheme} ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      {/* Outer grid boundary line layout */}
      <div className="w-full px-6 sm:px-10 md:px-14 flex h-16 items-center justify-between relative">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group h-full py-4 pr-6">
          <div className={`flex h-7 w-7 items-center justify-center overflow-hidden rounded-md border transition-colors duration-300 ${logoBorderTheme}`}>
            <img 
              src="/logo.png" 
              alt="FeelsNeat Logo" 
              className="h-full w-full object-cover"
            />
          </div>
          <span className="text-xs font-black tracking-widest uppercase">
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
                className={`relative text-xs font-black uppercase tracking-wider transition-colors duration-300 h-full flex items-center ${navLinkTheme}`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-accent-custom rounded-t-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Contact button */}
        {hasContactLink && (
          <div className={`hidden md:flex items-center h-full border-l ${isAtTop ? 'border-zinc-200/40' : 'border-zinc-200'} pl-6 ml-6`}>
            <Link
              href="/contact"
              className={`inline-flex h-9 items-center justify-center px-5 text-[10px] font-black uppercase tracking-widest ${contactButtonTheme}`}
            >
              Contact
            </Link>
          </div>
        )}

        {/* Mobile menu toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex h-9 w-9 items-center justify-center rounded border transition-colors duration-300 md:hidden ${mobileToggleTheme}`}
          aria-label="Toggle navigation menu"
        >
          <LucideIcon name={isOpen ? 'X' : 'Menu'} className="h-4 w-4" />
        </button>
      </div>

      {/* Mobile nav panel */}
      {isOpen && (
        <div className="border-b bg-white/95 text-foreground border-zinc-200 md:hidden animate-fade-in backdrop-blur-md">
          <nav className="flex flex-col gap-4 px-6 py-6 sm:px-10">
            {navigation.headerLinks.map((link) => {
              const isActive = pathname === link.path || (link.path !== '/' && pathname.startsWith(link.path));
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`text-xs font-black uppercase tracking-widest transition-colors ${
                    isActive
                      ? 'text-accent-custom'
                      : 'text-neutral-gray hover:text-foreground'
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
