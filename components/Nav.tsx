'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/houston', label: 'Houston' },
  { href: '/recipes', label: 'Recipes' },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const pathname        = usePathname();
  const menuRef         = useRef<HTMLDivElement>(null);

  // Close on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Close when clicking outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 bg-sand/95 backdrop-blur-sm border-b border-border">
      <div className="w-full px-5 h-14 flex items-center justify-between">

        {/* Icon logo — far left */}
        <Link href="/" aria-label="Moderate Glutton — home">
          <Image
            src="/media/website/moderateglutton_logos/The Moderate Glutton Black Logo Icon Transparent File.png"
            alt="Moderate Glutton"
            width={40}
            height={40}
            style={{ width: 'auto', height: '38px', objectFit: 'contain' }}
            priority
          />
        </Link>

        {/* Menu button — far right */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-haspopup="true"
            aria-controls="site-menu"
            className="flex items-center gap-2 px-3 py-1.5 rounded border border-border text-tan hover:text-espresso hover:border-tan transition-colors text-sm tracking-wide"
          >
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden="true">
              <line x1="0" y1="1"  x2="16" y2="1"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="0" y1="6"  x2="16" y2="6"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="0" y1="11" x2="16" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className="hidden sm:inline">Menu</span>
          </button>

          {/* Dropdown */}
          {open && (
            <nav
              id="site-menu"
              aria-label="Site navigation"
              className="absolute right-0 top-[calc(100%+8px)] bg-sand border border-border rounded-lg shadow-lg min-w-[160px] py-2 z-50"
            >
              {/* Home link */}
              <Link
                href="/"
                className={`block px-5 py-2.5 text-sm transition-colors ${
                  pathname === '/' ? 'text-terracotta' : 'text-espresso hover:text-terracotta'
                }`}
              >
                Home
              </Link>

              <div className="my-1 mx-4 border-t border-border" aria-hidden="true" />

              {links.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`block px-5 py-2.5 text-sm transition-colors ${
                    isActive(href) ? 'text-terracotta' : 'text-espresso hover:text-terracotta'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
