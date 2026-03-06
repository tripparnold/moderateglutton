'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/houston', label: 'Houston' },
  { href: '/recipes', label: 'Recipes' },
];

// Black PNG → terracotta (light mode)
const LOGO_FILTER_LIGHT =
  'brightness(0) sepia(1) hue-rotate(-12deg) saturate(1.4) brightness(0.72)';
// Black PNG → warm cream (dark mode)
const LOGO_FILTER_DARK =
  'brightness(0) invert(1) sepia(0.15) saturate(0.6) brightness(0.95)';

function getInitialTheme(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem('mg-theme');
  if (stored) return stored === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// ── SVG icons ────────────────────────────────────────────────────
function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8"/>
      <line x1="12" y1="2"  x2="12" y2="5"  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="2"  y1="12" x2="5"  y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="19" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="4.2"  y1="4.2"  x2="6.3"  y2="6.3"  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="17.7" y1="17.7" x2="19.8" y2="19.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="4.2"  y1="19.8" x2="6.3"  y2="17.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="17.7" y1="6.3"  x2="19.8" y2="4.2"  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Nav() {
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query,      setQuery]      = useState('');
  const [results,    setResults]    = useState<any[]>([]);
  const [isDark,     setIsDark]     = useState(false);

  const pathname  = usePathname();
  const menuRef   = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);
  const debouncer = useRef<ReturnType<typeof setTimeout>>();

  // Theme init
  useEffect(() => {
    const dark = getInitialTheme();
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('mg-theme', next ? 'dark' : 'light');
  }

  useEffect(() => { setMenuOpen(false); setSearchOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = (menuOpen || searchOpen) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen, searchOpen]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 50);
    else { setQuery(''); setResults([]); }
  }, [searchOpen]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); }
      if (e.key === 'Escape') { setSearchOpen(false); setMenuOpen(false); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function handleQuery(val: string) {
    setQuery(val);
    clearTimeout(debouncer.current);
    if (!val.trim()) { setResults([]); return; }
    debouncer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(val.trim())}`);
        setResults(await res.json());
      } catch { setResults([]); }
    }, 180);
  }

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <>
      {/*
        z-[800] sits above Leaflet's highest internal layer (popups at ~700).
        backdrop-blur is only on the header bar itself; the dropdown is fully opaque.
      */}
      <header className="sticky top-0 z-[800] bg-sand/95 backdrop-blur-sm border-b border-border transition-colors duration-300">
        <div className="w-full px-5 h-16 flex items-center justify-between">

          {/* Logo — clean filename, no spaces */}
          <Link href="/" aria-label="Moderate Glutton — home">
            <Image
              src="/media/website/logo-icon.png"
              alt="Moderate Glutton"
              width={52}
              height={52}
              style={{
                width: 'auto',
                height: '44px',
                objectFit: 'contain',
                filter: isDark ? LOGO_FILTER_DARK : LOGO_FILTER_LIGHT,
                transition: 'filter 0.3s ease',
              }}
              priority
            />
          </Link>

          {/* Right controls */}
          <div className="flex items-center gap-3">

            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search (⌘K)"
              className="text-tan hover:text-espresso transition-colors p-2 rounded"
            >
              <svg width="19" height="19" viewBox="0 0 19 19" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.6"/>
                <line x1="12.5" y1="12.5" x2="17" y2="17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </button>

            {/* Hamburger */}
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
                aria-haspopup="true"
                aria-controls="site-menu"
                className="flex items-center px-2.5 py-2 rounded border border-border text-tan hover:text-espresso hover:border-tan transition-colors"
              >
                <svg width="20" height="15" viewBox="0 0 20 15" fill="none" aria-hidden="true">
                  <line x1="0" y1="1.5"  x2="20" y2="1.5"  stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                  <line x1="0" y1="7.5"  x2="20" y2="7.5"  stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                  <line x1="0" y1="13.5" x2="20" y2="13.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                </svg>
              </button>

              {menuOpen && (
                <nav
                  id="site-menu"
                  aria-label="Site navigation"
                  /*
                    z-[810]: above the header (z-[800]).
                    bg-sand with NO opacity modifier = fully opaque.
                    Explicit background-color style as fallback for CSS-var theming.
                  */
                  className="absolute right-0 top-[calc(100%+10px)] border border-border rounded-xl shadow-2xl min-w-[210px] py-2 z-[810]"
                  style={{ backgroundColor: 'var(--color-sand)' }}
                >
                  <Link href="/"
                    className={`block px-5 py-3 text-base transition-colors ${pathname === '/' ? 'text-terracotta' : 'text-espresso hover:text-terracotta'}`}
                  >
                    Home
                  </Link>

                  <div className="my-1.5 mx-4 border-t border-border" aria-hidden="true"/>

                  {links.map(({ href, label }) => (
                    <Link key={href} href={href}
                      className={`block px-5 py-3 text-base transition-colors ${isActive(href) ? 'text-terracotta' : 'text-espresso hover:text-terracotta'}`}
                    >
                      {label}
                    </Link>
                  ))}

                  <div className="my-1.5 mx-4 border-t border-border" aria-hidden="true"/>

                  {/* Dark mode — icon only, no text label */}
                  <button
                    onClick={() => { toggleTheme(); setMenuOpen(false); }}
                    className="w-full flex items-center justify-center py-3 text-espresso hover:text-terracotta transition-colors"
                    aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                    title={isDark ? 'Light mode' : 'Dark mode'}
                  >
                    {isDark ? <SunIcon /> : <MoonIcon />}
                  </button>
                </nav>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div
          role="dialog" aria-modal="true" aria-label="Search"
          className="fixed inset-0 z-[9999] flex flex-col items-center pt-[12vh] px-4"
          style={{ background: 'rgba(25,17,10,0.65)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}
        >
          <div className="w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-border"
               style={{ backgroundColor: 'var(--color-sand)' }}>

            <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
              <svg width="18" height="18" viewBox="0 0 19 19" fill="none" className="text-muted flex-shrink-0" aria-hidden="true">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.6"/>
                <line x1="12.5" y1="12.5" x2="17" y2="17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => handleQuery(e.target.value)}
                placeholder="Search recipes, travel, Houston…"
                className="flex-1 bg-transparent text-espresso placeholder-muted text-base focus:outline-none"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="text-xs text-muted border border-border rounded px-1.5 py-0.5 hover:text-espresso transition-colors"
                aria-label="Close search"
              >
                esc
              </button>
            </div>

            {results.length > 0 ? (
              <ul className="max-h-[60vh] overflow-y-auto py-2">
                {results.map((r: any) => (
                  <li key={`${r.section}/${r.slug}`}>
                    <Link
                      href={`/${r.section}/${r.slug}`}
                      className="flex gap-4 items-start px-5 py-3.5 hover:bg-linen transition-colors"
                      onClick={() => setSearchOpen(false)}
                    >
                      <span className="text-xs uppercase tracking-widest text-lapis w-16 flex-shrink-0 pt-0.5 font-medium">{r.section}</span>
                      <div>
                        <p className="text-espresso font-medium text-sm leading-snug">{r.title}</p>
                        {r.description && <p className="text-muted text-xs mt-0.5 line-clamp-1">{r.description}</p>}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : query.length > 1 ? (
              <p className="px-5 py-8 text-sm text-muted text-center">No results for &ldquo;{query}&rdquo;</p>
            ) : (
              <p className="px-5 py-6 text-xs text-muted text-center">Type to search — or press ⌘K anytime</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
