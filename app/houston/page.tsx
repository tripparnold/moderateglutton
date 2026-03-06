'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { Location } from '@/components/HoustonMap';

const HoustonMap = dynamic(() => import('@/components/HoustonMap'), { ssr: false });

const LOCATIONS: Location[] = [
  {
    id:       'maximo',
    name:     'Máximo',
    address:  '4319 Montrose Blvd, Houston, TX 77006',
    category: 'Restaurant',
    note:     'Modern Mexican in a stunning room. The inspiration for this whole site.',
    lat:      29.7345,
    lng:      -95.3904,
  },
  {
    id:       'common-bond',
    name:     'Common Bond Café & Bakery',
    address:  '1706 Westheimer Rd, Houston, TX 77098',
    category: 'Café / Bakery',
    note:     'Croissants worth making a detour for.',
    lat:      29.7393,
    lng:      -95.3976,
  },
  {
    id:       'reef',
    name:     'Reef',
    address:  '2600 Travis St, Houston, TX 77006',
    category: 'Seafood',
    note:     "Bryan Caswell's Gulf Coast seafood. A Houston classic.",
    lat:      29.7479,
    lng:      -95.3764,
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Restaurant:     'bg-terracotta/10 text-terracotta',
  'Café / Bakery': 'bg-amber/10 text-amber',
  Seafood:         'bg-lapis/10 text-lapis',
};

export default function HoustonPage() {
  const [view,     setView]     = useState<'map' | 'list'>('map');
  const [selected, setSelected] = useState<string | null>(null);
  const [isDark,   setIsDark]   = useState(false);

  // Sync with dark-mode class on <html>
  useEffect(() => {
    const sync = () => setIsDark(document.documentElement.classList.contains('dark'));
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const selectedLoc = LOCATIONS.find((l) => l.id === selected);

  return (
    <main className="max-w-6xl mx-auto px-5 py-10 sm:py-14">

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-4xl sm:text-5xl font-normal text-espresso mb-2">
          Houston
        </h1>
        <p className="text-tan text-base leading-relaxed">
          Places worth eating at, drinking at, or simply being in.
        </p>
      </div>

      {/* Map / List toggle */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setView('map')}
          aria-pressed={view === 'map'}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            view === 'map'
              ? 'bg-lapis text-sand border-lapis'
              : 'bg-transparent text-tan border-border hover:border-lapis hover:text-lapis'
          }`}
        >
          Map
        </button>
        <button
          onClick={() => setView('list')}
          aria-pressed={view === 'list'}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            view === 'list'
              ? 'bg-lapis text-sand border-lapis'
              : 'bg-transparent text-tan border-border hover:border-lapis hover:text-lapis'
          }`}
        >
          List
        </button>
        <span className="ml-2 text-xs text-muted">{LOCATIONS.length} spots</span>
      </div>

      {/* ── MAP VIEW ── */}
      {view === 'map' && (
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Map — rounded, bordered */}
          <div
            className="lg:flex-1 rounded-2xl overflow-hidden border border-border shadow-sm"
            style={{ height: 520 }}
          >
            <HoustonMap
              locations={LOCATIONS}
              selected={selected}
              onSelect={setSelected}
              isDark={isDark}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:w-72 flex flex-col gap-3">
            {selectedLoc ? (
              <div className="bg-linen rounded-2xl border border-border p-5">
                <span
                  className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full mb-3 ${
                    CATEGORY_COLORS[selectedLoc.category] ?? 'bg-muted/10 text-muted'
                  }`}
                >
                  {selectedLoc.category}
                </span>
                <h2 className="font-serif text-2xl text-espresso leading-tight mb-1">
                  {selectedLoc.name}
                </h2>
                <p className="text-xs text-muted mb-3">{selectedLoc.address}</p>
                {selectedLoc.note && (
                  <p className="text-sm text-tan italic leading-relaxed border-l-2 border-lapis/40 pl-3">
                    &ldquo;{selectedLoc.note}&rdquo;
                  </p>
                )}
                <button
                  onClick={() => setSelected(null)}
                  className="mt-4 text-xs text-muted hover:text-lapis transition-colors"
                >
                  ← Back to all
                </button>
              </div>
            ) : (
              <div className="text-sm text-muted px-1 py-3">
                <p className="mb-4 text-xs uppercase tracking-widest text-muted">
                  {LOCATIONS.length} spots — click a pin or select below
                </p>
                <ul className="flex flex-col gap-2">
                  {LOCATIONS.map((loc) => (
                    <li key={loc.id}>
                      <button
                        onClick={() => setSelected(loc.id)}
                        className="w-full text-left px-4 py-3 rounded-xl border border-border hover:border-lapis/50 hover:bg-linen transition-colors"
                      >
                        <p className="font-medium text-espresso text-sm">{loc.name}</p>
                        <p className="text-xs text-muted mt-0.5">{loc.category}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── LIST VIEW ── */}
      {view === 'list' && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LOCATIONS.map((loc) => (
            <li key={loc.id}>
              <button
                onClick={() => { setSelected(loc.id); setView('map'); }}
                className="w-full text-left p-5 rounded-2xl border border-border hover:border-lapis/40 hover:shadow-sm bg-sand transition-all"
              >
                <span
                  className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full mb-3 ${
                    CATEGORY_COLORS[loc.category] ?? 'bg-muted/10 text-muted'
                  }`}
                >
                  {loc.category}
                </span>
                <h2 className="font-serif text-xl text-espresso leading-tight mb-1">
                  {loc.name}
                </h2>
                <p className="text-xs text-muted mb-3">{loc.address}</p>
                {loc.note && (
                  <p className="text-sm text-tan italic leading-relaxed line-clamp-2">
                    &ldquo;{loc.note}&rdquo;
                  </p>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
