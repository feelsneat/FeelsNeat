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

  // Handle header show/hide on scroll direction (using Ref to prevent event listener churn)
  useEffect(() => {
    // Set initial values
    lastScrollY.current = window.scrollY;
    setIsAtTop(window.scrollY < 60);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Determine if navbar is at the very top of the page
      setIsAtTop(currentScrollY < 60);

      // Always show at the very top of the page to avoid hiding glitches
      if (currentScrollY < 15) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      // Hide when scrolling down, show when scrolling up
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

  // Dynamic theme classes based on scroll state
  const headerTheme = isAtTop
    ? 'bg-transparent border-transparent text-white'
    : 'bg-white/95 border-zinc-100 text-zinc-900 shadow-xs backdrop-blur-md';

  const logoBorderTheme = isAtTop
    ? 'bg-white/10 border-white/20'
    : 'bg-white border-zinc-200';

  const navLinkTheme = isAtTop
    ? 'text-white/80 hover:text-white'
    : 'text-zinc-600 hover:text-foreground';

  const contactButtonTheme = isAtTop
    ? 'bg-white text-zinc-950 hover:bg-accent-custom hover:text-white'
    : 'bg-foreground text-background hover:bg-accent-custom hover:text-white';

  const mobileToggleTheme = isAtTop
    ? 'border-white/25 text-white/90 hover:text-white'
    : 'border-zinc-200 text-foreground/75 hover:text-foreground';

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 w-full border-b transform transition-transform duration-300 ease-in-out ${headerTheme} ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      {/* Outer grid boundary line layout: Full screen width alignment matching Tresmares */}
      <div className="w-full px-6 sm:px-10 md:px-14 flex h-16 items-center justify-between relative">
        {/* Logo */}
        <Link href="/" className={`flex items-center gap-3 group h-full py-4 border-r ${isAtTop ? 'border-white/15' : 'border-zinc-100'} pr-6`}>
          <div className={`flex h-7 w-7 items-center justify-center overflow-hidden rounded-md border transition-colors duration-300 ${logoBorderTheme}`}>
            <img 
              src="/logo.png" 
              alt="FeelsNeat Logo" 
              className="h-full w-full object-cover"
            />
          </div>
          <span className="text-sm font-black tracking-widest uppercase">
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
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-accent-custom" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Contact button */}
        {hasContactLink && (
          <div className={`hidden md:flex items-center h-full border-l ${isAtTop ? 'border-white/15' : 'border-zinc-100'} pl-6 ml-6`}>
            <Link
              href="/contact"
              className={`inline-flex h-10 items-center justify-center px-6 text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${contactButtonTheme}`}
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
        <div className={`border-b ${isAtTop ? 'bg-zinc-950/98 text-white border-white/10' : 'bg-white text-zinc-900 border-zinc-100'} md:hidden animate-fade-in`}>
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
                      : isAtTop ? 'text-white/60 hover:text-white' : 'text-zinc-600 hover:text-foreground'
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
