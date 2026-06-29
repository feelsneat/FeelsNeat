'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon } from '../ui/LucideIcon';
import { SiteSettings, NavigationConfig } from '@/lib/cms';

interface NavbarProps {
  settings: SiteSettings;
  navigation: NavigationConfig;
}

export function Navbar({ settings, navigation }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-custom bg-background/95 backdrop-blur-xs">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Logo with reference image */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-md bg-white border border-border-custom">
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

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navigation.headerLinks.map((link) => {
            const isActive = pathname === link.path || (link.path !== '/' && pathname.startsWith(link.path));
            return (
              <Link
                key={link.path}
                href={link.path}
                className="relative text-sm font-semibold text-foreground/70 transition-colors hover:text-foreground"
              >
                {link.label}
                {isActive && (
                  <motion.span
                    layoutId="activeNav"
                    className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-foreground"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-custom text-foreground/75 hover:text-foreground md:hidden"
          aria-label="Toggle navigation menu"
        >
          <LucideIcon name={isOpen ? 'X' : 'Menu'} className="h-4 w-4" />
        </button>
      </div>

      {/* Mobile nav panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-border-custom bg-background md:hidden"
          >
            <nav className="flex flex-col gap-4 px-4 py-6 sm:px-6">
              {navigation.headerLinks.map((link) => {
                const isActive = pathname === link.path || (link.path !== '/' && pathname.startsWith(link.path));
                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={`text-sm font-semibold transition-colors ${
                      isActive
                        ? 'text-foreground'
                        : 'text-foreground/60 hover:text-foreground'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
