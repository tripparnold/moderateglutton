'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { Location } from '@/components/HoustonMap';

const HoustonMap = dynamic(() => import('@/components/HoustonMap'), { ssr: false });

// ── Location data ─────────────────────────────────────────────────
const LOCATIONS: Location[] = [
  {
    id:       'maximo',
    name:     'Máximo',
    address:  '4319 Montrose Blvd, Houston, TX 77006',
    cuisine:  'Modern Mexican',
    note:     'The room is stunning. The food matches it.',
    lat:      29.7345,
    lng:      -95.3904,
    myRating: 5,
    distinctions: {
      michelin:   'bibgourmand',
      jamesBeard: [{ type: 'nomination', category: 'Best New Restaurant', year: 2024 }],
    },
  },
  {
    id:       'common-bond',
    name:     'Common Bond Café & Bakery',
    address:  '1706 Westheimer Rd, Houston, TX 77098',
    cuisine:  'Café / Bakery',
    note:     'Croissants worth making a detour for.',
    lat:      29.7393,
    lng:      -95.3976,
    myRating: 4,
  },
  {
    id:       'reef',
    name:     'Reef',
    address:  '2600 Travis St, Houston, TX 77006',
    cuisine:  'Gulf Coast Seafood',
    note:     "Bryan Caswell's Gulf Coast seafood. A Houston classic.",
    lat:      29.7479,
    lng:      -95.3764,
    myRating: 4.5,
    distinctions: {
      jamesBeard: [
        { type: 'finalist', category: 'Best Chef: Southwest', year: [2009, 2010] },
      ],
    },
  },
];

// ── Helpers ────────────────────────────────────────────────────────
function StarDisplay({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  const cls   = size === 'lg' ? 'text-xl' : 'text-sm';
  return (
    <span className={`${cls} text-amber tracking-tight`} title={`${rating} / 5`}>
      {'★'.repeat(full)}{half ? '½' : ''}{'☆'.repeat(empty)}
    </span>
  );
}

function DistinctionBadges({ d }: { d: Location['distinctions'] }) {
  if (!d) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {d.michelin === 'star' && (
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border border-lapis/30 bg-lapis/5">
          <span className="text-[#E8003D]" title="Michelin Star">✦</span>
          <span className="text-lapis">Michelin Star</span>
        </span>
      )}
      {d.michelin === 'bibgourmand' && (
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border border-lapis/30 bg-lapis/5">
          <span className="text-[#E8003D]" title="Bib Gourmand">Ⓑ</span>
          <span className="text-lapis">Bib Gourmand</span>
        </span>
      )}
      {d.jamesBeard?.map((jb, i) => {
        const yrs = Array.isArray(jb.year) ? jb.year.join(', ') : String(jb.year);
        const label = jb.type === 'win'
          ? `JB Win '${yrs}`
          : jb.type === 'finalist'
          ? `JB Finalist '${yrs}`
          : `JB Nominated '${yrs}`;
        return (
          <span key={i} className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border border-lapis/30 bg-lapis/5 text-lapis">
            {label}
          </span>
        );
      })}
    </div>
  );
}

// ── Maps links ─────────────────────────────────────────────────────
function MapsLinks({ address }: { address: string }) {
  const q = encodeURIComponent(address);
  return (
    <div className="flex items-center gap-2 mt-1.5 mb-0.5">
      <a
        href={`https://maps.apple.com/?q=${q}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-muted hover:text-lapis transition-colors underline underline-offset-2 decoration-border"
      >
        Apple Maps
      </a>
      <span className="text-muted text-xs" aria-hidden="true">·</span>
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${q}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-muted hover:text-lapis transition-colors underline underline-offset-2 decoration-border"
      >
        Google Maps
      </a>
    </div>
  );
}

// ── Filter types ───────────────────────────────────────────────────
interface Filters {
  cuisine:     string;   // '' = all
  minRating:   number;   // 0 = all
  distinction: string;   // '' | 'michelin-star' | 'bibgourmand' | 'jamesbeard'
}

const FILTER_DEFAULT: Filters = { cuisine: '', minRating: 0, distinction: '' };

const allCuisines = (locs: Location[]) =>
  Array.from(new Set(locs.map((l) => l.cuisine))).sort();

function applyFilters(locs: Location[], f: Filters): Location[] {
  return locs.filter((l) => {
    if (f.cuisine   && l.cuisine !== f.cuisine) return false;
    if (f.minRating && l.myRating < f.minRating) return false;
    if (f.distinction === 'michelin-star' && l.distinctions?.michelin !== 'star') return false;
    if (f.distinction === 'bibgourmand'   && l.distinctions?.michelin !== 'bibgourmand') return false;
    if (f.distinction === 'jamesbeard'    && !l.distinctions?.jamesBeard?.length) return false;
    return true;
  });
}

// ── Page ─────────────────────────────────────────────────────────
export default function HoustonPage() {
  const [view,     setView]     = useState<'map' | 'list'>('map');
  const [selected, setSelected] = useState<string | null>(null);
  const [isDark,   setIsDark]   = useState(false);
  const [filters,  setFilters]  = useState<Filters>(FILTER_DEFAULT);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const sync = () => setIsDark(document.documentElement.classList.contains('dark'));
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const selectedLoc   = LOCATIONS.find((l) => l.id === selected);
  const filteredLocs  = useMemo(() => applyFilters(LOCATIONS, filters), [filters]);
  const hasFilters    = filters.cuisine || filters.minRating || filters.distinction;

  function setFilter<K extends keyof Filters>(key: K, val: Filters[K]) {
    setFilters((f) => ({ ...f, [key]: val }));
  }

  // Toggle pill helper
  const toggleBtn = (active: boolean) =>
    `px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
      active
        ? 'bg-lapis text-sand border-lapis'
        : 'bg-transparent text-tan border-border hover:border-lapis hover:text-lapis'
    }`;

  return (
    <main className="max-w-6xl mx-auto px-5 py-10 sm:py-14">

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-4xl sm:text-5xl font-normal text-espresso mb-1">Houston</h1>
        <p className="text-tan text-base">Where I eat.</p>
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => setView('map')}  aria-pressed={view === 'map'}  className={toggleBtn(view === 'map')}>Map</button>
        <button onClick={() => setView('list')} aria-pressed={view === 'list'} className={toggleBtn(view === 'list')}>List</button>
        <span className="ml-2 text-xs text-muted">{LOCATIONS.length} spots</span>
      </div>

      {/* ── MAP VIEW ───────────────────────────────────────────── */}
      {view === 'map' && (
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:flex-1 rounded-2xl overflow-hidden border border-border shadow-sm" style={{ height: 540 }}>
            <HoustonMap
              locations={LOCATIONS}
              selected={selected}
              onSelect={setSelected}
              isDark={isDark}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:w-72">
            {selectedLoc ? (
              <div className="bg-linen rounded-2xl border border-border p-5">
                <p className="text-xs uppercase tracking-widest text-lapis font-medium mb-2">{selectedLoc.cuisine}</p>
                <h2 className="font-serif text-2xl text-espresso leading-tight mb-1">{selectedLoc.name}</h2>
                <StarDisplay rating={selectedLoc.myRating} size="lg" />
                <p className="text-xs text-muted mt-2">{selectedLoc.address}</p>
                <MapsLinks address={selectedLoc.address} />
                <DistinctionBadges d={selectedLoc.distinctions} />
                {selectedLoc.note && (
                  <p className="text-sm text-tan italic leading-relaxed border-l-2 border-lapis/30 pl-3 mt-4">
                    &ldquo;{selectedLoc.note}&rdquo;
                  </p>
                )}
                <button onClick={() => setSelected(null)} className="mt-4 text-xs text-muted hover:text-lapis transition-colors">
                  ← Back to all
                </button>
              </div>
            ) : (
              <div>
                <p className="text-xs uppercase tracking-widest text-muted mb-3 px-1">
                  {LOCATIONS.length} spots · click a pin to explore
                </p>
                <ul className="flex flex-col gap-2">
                  {LOCATIONS.map((loc) => (
                    <li key={loc.id}>
                      <button
                        onClick={() => setSelected(loc.id)}
                        className="w-full text-left px-4 py-3 rounded-xl border border-border hover:border-lapis/40 hover:bg-linen transition-colors"
                      >
                        <p className="font-medium text-espresso text-sm">{loc.name}</p>
                        <div className="flex items-center justify-between mt-0.5">
                          <p className="text-xs text-muted">{loc.cuisine}</p>
                          <span className="text-xs text-amber">{'★'.repeat(Math.round(loc.myRating))}</span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── LIST VIEW ───────────────────────────────────────────── */}
      {view === 'list' && (
        <>
          {/* Filter bar */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                hasFilters
                  ? 'border-lapis text-lapis bg-lapis/5'
                  : 'border-border text-muted hover:border-tan hover:text-tan'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M1 3h14M4 8h8M7 13h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
              Filter{hasFilters ? ' ·' : ''}
              {hasFilters && <span className="text-xs font-semibold text-lapis">{[filters.cuisine, filters.minRating ? `${filters.minRating}★+` : '', filters.distinction].filter(Boolean).join(', ')}</span>}
            </button>
            {hasFilters && (
              <button onClick={() => setFilters(FILTER_DEFAULT)} className="text-xs text-muted hover:text-terracotta transition-colors">
                Clear filters
              </button>
            )}
            <span className="text-xs text-muted ml-auto">{filteredLocs.length} of {LOCATIONS.length}</span>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="bg-linen border border-border rounded-2xl p-5 mb-6 grid gap-5 sm:grid-cols-3">
              {/* Cuisine */}
              <div>
                <p className="text-xs uppercase tracking-widest text-muted mb-2 font-medium">Cuisine</p>
                <div className="flex flex-wrap gap-1.5">
                  <button onClick={() => setFilter('cuisine', '')}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${!filters.cuisine ? 'bg-espresso text-sand border-espresso' : 'border-border text-tan hover:border-tan'}`}>
                    All
                  </button>
                  {allCuisines(LOCATIONS).map((c) => (
                    <button key={c} onClick={() => setFilter('cuisine', c === filters.cuisine ? '' : c)}
                      className={`text-xs px-3 py-1 rounded-full border transition-colors ${filters.cuisine === c ? 'bg-espresso text-sand border-espresso' : 'border-border text-tan hover:border-tan'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <p className="text-xs uppercase tracking-widest text-muted mb-2 font-medium">My Rating</p>
                <div className="flex flex-wrap gap-1.5">
                  {[0, 3, 4, 5].map((r) => (
                    <button key={r} onClick={() => setFilter('minRating', r === filters.minRating ? 0 : r)}
                      className={`text-xs px-3 py-1 rounded-full border transition-colors ${filters.minRating === r ? 'bg-espresso text-sand border-espresso' : 'border-border text-tan hover:border-tan'}`}>
                      {r === 0 ? 'All' : `${r}★+`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Distinctions */}
              <div>
                <p className="text-xs uppercase tracking-widest text-muted mb-2 font-medium">Distinctions</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { val: '',               label: 'All' },
                    { val: 'michelin-star',  label: '✦ Michelin Star' },
                    { val: 'bibgourmand',    label: 'Ⓑ Bib Gourmand' },
                    { val: 'jamesbeard',     label: 'James Beard' },
                  ].map(({ val, label }) => (
                    <button key={val} onClick={() => setFilter('distinction', val === filters.distinction ? '' : val)}
                      className={`text-xs px-3 py-1 rounded-full border transition-colors ${filters.distinction === val ? 'bg-espresso text-sand border-espresso' : 'border-border text-tan hover:border-tan'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Location cards */}
          {filteredLocs.length === 0 ? (
            <p className="text-muted text-sm py-10 text-center">No spots match these filters.</p>
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredLocs.map((loc) => (
                <li key={loc.id}>
                  <button
                    onClick={() => { setSelected(loc.id); setView('map'); }}
                    className="group w-full text-left rounded-2xl border border-border bg-linen hover:border-lapis/50 hover:shadow-md transition-all overflow-hidden"
                  >
                    {/* Card header strip */}
                    <div className="px-5 pt-5 pb-4">
                      {/* Cuisine + rating row */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span className="text-xs font-semibold uppercase tracking-widest text-lapis">{loc.cuisine}</span>
                        <StarDisplay rating={loc.myRating} />
                      </div>

                      {/* Name */}
                      <h2 className="font-serif text-xl text-espresso leading-tight group-hover:text-terracotta transition-colors">
                        {loc.name}
                      </h2>

                      {/* Address */}
                      <p className="text-xs text-muted mt-1">{loc.address}</p>
                      <MapsLinks address={loc.address} />

                      {/* Distinctions */}
                      <DistinctionBadges d={loc.distinctions} />
                    </div>

                    {/* Note */}
                    {loc.note && (
                      <div className="px-5 pb-5 border-t border-border/60 pt-3">
                        <p className="text-sm text-tan italic leading-relaxed line-clamp-2">
                          &ldquo;{loc.note}&rdquo;
                        </p>
                      </div>
                    )}

                    {/* CTA */}
                    <div className="px-5 pb-4 pt-0">
                      <span className="text-xs text-muted group-hover:text-lapis transition-colors">
                        View on map →
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  );
}
