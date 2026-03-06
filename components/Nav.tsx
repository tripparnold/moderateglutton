'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/houston', label: 'Houston' },
  { href: '/recipes', label: 'Recipes' },
];

// Tints the black logo to match site terracotta (#A8502A)
const LOGO_FILTER =
  'brightness(0) sepia(1) hue-rotate(-12deg) saturate(1.4) brightness(0.72)';

export default function Nav() {
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query,      setQuery]      = useState('');
  const [results,    setResults]    = useState<any[]>([]);
  const pathname  = usePathname();
  const menuRef   = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);
  const debouncer = useRef<ReturnType<typeof setTimeout>>();

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
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
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
      <header className="sticky top-0 z-50 bg-sand/95 backdrop-blur-sm border-b border-border">
        <div className="w-full px-5 h-16 flex items-center justify-between">

          {/* Logo — far left */}
          <Link href="/" aria-label="Moderate Glutton — home">
            <Image
              src="/media/website/moderateglutton_logos/The Moderate Glutton Black Logo Icon Transparent File.png"
              alt="Moderate Glutton"
              width={52}
              height={52}
              style={{ width: 'auto', height: '48px', objectFit: 'contain', filter: LOGO_FILTER }}
              priority
            />
          </Link>

          {/* Right controls */}
          <div className="flex items-center gap-3">

            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search (⌘K)"
              className="flex items-center gap-1.5 text-tan hover:text-espresso transition-colors p-2 rounded"
            >
              <svg width="19" height="19" viewBox="0 0 19 19" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.6"/>
                <line x1="12.5" y1="12.5" x2="17" y2="17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </button>

            {/* Hamburger — no text */}
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
                  className="absolute right-0 top-[calc(100%+10px)] bg-sand border border-border rounded-xl shadow-xl min-w-[190px] py-2 z-50"
                >
                  <Link href="/" className={`block px-5 py-3 text-base transition-colors ${pathname === '/' ? 'text-terracotta' : 'text-espresso hover:text-terracotta'}`}>
                    Home
                  </Link>
                  <div className="my-1.5 mx-4 border-t border-border" aria-hidden="true"/>
                  {links.map(({ href, label }) => (
                    <Link key={href} href={href} className={`block px-5 py-3 text-base transition-colors ${isActive(href) ? 'text-terracotta' : 'text-espresso hover:text-terracotta'}`}>
                      {label}
                    </Link>
                  ))}
                </nav>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Search overlay ───────────────────────────────────────── */}
      {searchOpen && (
        <div
          role="dialog" aria-modal="true" aria-label="Search"
          className="fixed inset-0 z-[100] flex flex-col items-center pt-[12vh] px-4"
          style={{ background: 'rgba(44,24,16,0.55)', backdropFilter: 'blur(6px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}
        >
          <div className="w-full max-w-xl bg-sand rounded-2xl shadow-2xl overflow-hidden">

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
              <kbd className="hidden sm:inline text-xs text-muted border border-border rounded px-1.5 py-0.5">esc</kbd>
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
                      <span className="text-xs uppercase tracking-widest text-muted w-16 flex-shrink-0 pt-0.5">{r.section}</span>
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
