'use client';

import { useEffect } from 'react';

export function ScrollObserver() {
  useEffect(() => {
    // Check if browser supports IntersectionObserver
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { 
        threshold: 0.05, 
        rootMargin: '0px 0px -40px 0px' 
      }
    );

    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach((el) => observer.observe(el));

    // Monitor DOM mutations to observe dynamically loaded content (e.g. KV loading)
    const mutationObserver = new MutationObserver(() => {
      const freshElements = document.querySelectorAll('.scroll-reveal:not(.is-visible)');
      freshElements.forEach((el) => observer.observe(el));
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      elements.forEach((el) => observer.unobserve(el));
      mutationObserver.disconnect();
      observer.disconnect();
    };
  }, []);

  return null;
}
