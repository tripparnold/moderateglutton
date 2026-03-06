'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const links = [
    { href: '/recipes', label: 'Recipes' },
    { href: '/houston', label: 'Houston' },
  ];

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 bg-sand/90 backdrop-blur-sm border-b border-border">
      <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">

        {/* Logo / Site name */}
        <Link
          href="/"
          className="font-serif text-xl font-medium tracking-wide text-espresso hover:text-terracotta transition-colors"
          aria-label="Moderate Glutton — home"
        >
          Moderate Glutton
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Main navigation" className="hidden sm:flex items-center gap-7">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm tracking-wide transition-colors ${
                isActive(href)
                  ? 'text-terracotta'
                  : 'text-tan hover:text-espresso'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Mobile menu button */}
        <button
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(!open)}
          className="sm:hidden flex flex-col gap-[5px] p-2 -mr-2 rounded"
        >
          <span
            className={`block w-5 h-px bg-espresso transition-transform duration-200 origin-center ${
              open ? 'rotate-45 translate-y-[6px]' : ''
            }`}
          />
          <span
            className={`block w-5 h-px bg-espresso transition-opacity duration-200 ${
              open ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block w-5 h-px bg-espresso transition-transform duration-200 origin-center ${
              open ? '-rotate-45 -translate-y-[6px]' : ''
            }`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav
          id="mobile-menu"
          aria-label="Mobile navigation"
          className="sm:hidden border-t border-border bg-sand"
        >
          <ul className="flex flex-col py-2">
            {links.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`block px-5 py-3 text-base transition-colors ${
                    isActive(href)
                      ? 'text-terracotta'
                      : 'text-espresso hover:text-terracotta'
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
