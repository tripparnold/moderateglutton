'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { ALL_ORDERED, WANT_TO_TRY, RESTAURANTS } from '@/data/restaurants';
import type { Restaurant, PriceTier } from '@/data/restaurants';

const HoustonMap = dynamic(() => import('@/components/HoustonMap'), { ssr: false });

// Michelin star SVG icon
function MichelinStarIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
      <path d="M5.5 0 L6.5 3.8 L10.1 1.9 L7.8 5 L11 5.5 L7.8 6 L10.1 9.1 L6.5 7.2 L5.5 11 L4.5 7.2 L0.9 9.1 L3.2 6 L0 5.5 L3.2 5 L0.9 1.9 L4.5 3.8 Z" fill="#E8003D" />
    </svg>
  );
}

// Simplified Bib Gourmand smiley icon
function BibGourmandIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="5.5" fill="#E8003D" />
      <circle cx="4.4" cy="5.5" r="0.9" fill="white" />
      <circle cx="8.6" cy="5.5" r="0.9" fill="white" />
      <path d="M4 8 Q6.5 10 9 8" stroke="white" strokeWidth="1.1" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function DistinctionBadges({ d }: { d: Restaurant['distinctions'] }) {
  if (!d) return null;
  type Badge = { icon?: React.ReactNode; label: string; cls: string };
  const badges: Badge[] = [];
  const base = 'inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full';

  if (d.michelin === 'star')        badges.push({ icon: <MichelinStarIcon />, label: 'Michelin Star',        cls: `${base} bg-[#E8003D]/10 text-[#C8002D] border border-[#E8003D]/30` });
  if (d.michelin === 'bibgourmand') badges.push({ icon: <BibGourmandIcon />,  label: 'Bib Gourmand',         cls: `${base} bg-[#E8003D]/10 text-[#C8002D] border border-[#E8003D]/30` });
  if (d.michelin === 'recommended') badges.push({                              label: 'In Michelin Guide',    cls: `${base} bg-[#E8003D]/5 text-[#B8002A] border border-[#E8003D]/15` });
  if (d.texasMonthlyBBQ)            badges.push({                              label: 'Texas Monthly Top 50', cls: `${base} bg-orange-50 text-orange-700 border border-orange-200` });

  d.jamesBeard?.forEach((jb) => {
    const yr    = Array.isArray(jb.year) ? `'${String(jb.year[jb.year.length-1]).slice(-2)}` : `'${String(jb.year).slice(-2)}`;
    const level = jb.type === 'winner' ? 'Winner' : jb.type === 'finalist' ? 'Finalist' : jb.type === 'semifinalist' ? 'Semifinalist' : 'Nominated';
    badges.push({
      label: jb.chefAward ? `Chef: JB ${level} ${yr}` : `JB ${level} ${yr}`,
      cls:   jb.chefAward ? `${base} bg-amber-50 text-amber-600 border border-amber-200` : `${base} bg-amber-50 text-amber-800 border border-amber-300`,
    });
  });

  if (!badges.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {badges.map((b, i) => <span key={i} className={b.cls}>{b.icon}{b.label}</span>)}
    </div>
  );
}

function MapsLinks({ address }: { address: string }) {
  const q = encodeURIComponent(address);
  return (
    <div className="flex items-center gap-2 mt-1 mb-0.5">
      <a href={`https://maps.apple.com/?q=${q}`} target="_blank" rel="noopener noreferrer" className="text-xs text-muted hover:text-lapis transition-colors underline underline-offset-2 decoration-border">Apple Maps</a>
      <span className="text-muted text-xs" aria-hidden="true">·</span>
      <a href={`https://www.google.com/maps/search/?api=1&query=${q}`} target="_blank" rel="noopener noreferrer" className="text-xs text-muted hover:text-lapis transition-colors underline underline-offset-2 decoration-border">Google Maps</a>
    </div>
  );
}

interface Filters { neighborhood: string; cuisine: string; price: string; awardedOnly: boolean; top10Only: boolean; }
const FILTER_DEFAULT: Filters = { neighborhood: '', cuisine: '', price: '', awardedOnly: false, top10Only: false };

function hasAward(r: Restaurant) { return !!(r.distinctions?.michelin || r.distinctions?.jamesBeard?.length || r.distinctions?.texasMonthlyBBQ); }

function applyFilters(locs: Restaurant[], f: Filters): Restaurant[] {
  return locs.filter((r) => {
    if (f.top10Only    && !r.topRank)                         return false;
    if (f.neighborhood && r.neighborhood !== f.neighborhood)  return false;
    if (f.cuisine      && !r.cuisineTags.includes(f.cuisine)) return false;
    if (f.price        && r.price !== f.price)                return false;
    if (f.awardedOnly  && !hasAward(r))                       return false;
    return true;
  });
}

// Use consolidated neighborhoods from ALL sources
const ALL_NEIGHBORHOODS = Array.from(new Set([...ALL_ORDERED, ...WANT_TO_TRY].map(r => r.neighborhood))).sort();
const ALL_CUISINES      = Array.from(new Set(RESTAURANTS.flatMap(r => r.cuisineTags))).sort();
const PRICE_TIERS: PriceTier[] = ['$', '$$', '$$$', '$$$$'];

function WebsiteLink({ url, label = 'Website' }: { url?: string; label?: string }) {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="text-xs text-lapis hover:underline font-medium"
    >
      {label} ↗
    </a>
  );
}

function RestaurantCard({ restaurant, onSelect, isWantToTry }: { restaurant: Restaurant; onSelect: (id: string) => void; isWantToTry?: boolean }) {
  const r = restaurant;
  return (
    <button onClick={() => onSelect(r.id)} className="group w-full h-full text-left rounded-2xl border border-border bg-linen hover:border-lapis/50 hover:shadow-md transition-all overflow-hidden flex flex-col">
      <div className="px-5 pt-5 pb-4 flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-lapis">{r.cuisine}</span>
          {r.topRank !== undefined && (
            <span className="inline-flex items-center justify-center flex-shrink-0 bg-terracotta text-sand text-[11px] font-bold tabular-nums rounded-full"
              style={{ minWidth: 22, height: 22, padding: '0 5px' }}>
              {r.topRank}
            </span>
          )}
          {isWantToTry && <span className="text-[10px] font-semibold uppercase tracking-wider text-muted border border-border rounded-full px-2 py-0.5">On My List</span>}
        </div>
        <h2 className="font-serif text-xl text-espresso leading-tight group-hover:text-terracotta transition-colors">{r.name}</h2>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-xs text-muted">{r.neighborhood}</span>
          <span className="text-muted text-xs" aria-hidden="true">·</span>
          <span className="text-xs text-muted">{r.price}</span>
        </div>
        <p className="text-xs text-muted mt-0.5">{r.address}</p>
        <MapsLinks address={r.address} />
        {r.website && (
          <div className="mt-1">
            <WebsiteLink url={r.website} />
          </div>
        )}
        <DistinctionBadges d={r.distinctions} />
      </div>
      <div className="px-5 pb-4 pt-0">
        <span className="text-xs text-muted group-hover:text-lapis transition-colors">View on map →</span>
      </div>
    </button>
  );
}

function SidebarDetail({ restaurant, onClose, isWantToTry }: { restaurant: Restaurant; onClose: () => void; isWantToTry?: boolean }) {
  const r = restaurant;
  return (
    <div className="bg-linen rounded-2xl border border-border p-5">
      {isWantToTry && (
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted border border-border rounded-full px-2 py-0.5 inline-block mb-2">On My List</p>
      )}
      <p className="text-xs uppercase tracking-widest text-lapis font-medium mb-2">{r.cuisine}</p>
      <div className="flex items-center justify-between gap-2 mb-1">
        <h2 className="font-serif text-2xl text-espresso leading-tight">{r.name}</h2>
        {r.topRank !== undefined && <span className="text-sm font-bold text-terracotta tabular-nums flex-shrink-0">#{r.topRank}</span>}
      </div>
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="text-xs text-muted">{r.neighborhood}</span>
        <span className="text-muted text-xs">·</span>
        <span className="text-xs text-muted">{r.price}</span>
      </div>
      <p className="text-xs text-muted">{r.address}</p>
      <MapsLinks address={r.address} />
      {r.website && (
        <div className="mt-2">
          <WebsiteLink url={r.website} label="Visit Website" />
        </div>
      )}
      <DistinctionBadges d={r.distinctions} />
      <button onClick={onClose} className="mt-4 text-xs text-muted hover:text-lapis transition-colors">← Back to all</button>
    </div>
  );
}

function FilterBar({ filters, onChange, showTop10 }: { filters: Filters; onChange: (f: Filters) => void; showTop10: boolean }) {
  const [open, setOpen] = useState(false);
  const hasOtherFilters = !!(filters.neighborhood || filters.cuisine || filters.price || filters.awardedOnly);
  function set<K extends keyof Filters>(key: K, val: Filters[K]) { onChange({ ...filters, [key]: val }); }
  const pill     = 'text-xs px-3 py-1.5 rounded-full font-medium transition-colors';
  const pillStyle = (active: boolean): React.CSSProperties => active
    ? { border: '1.5px solid #2C1810', backgroundColor: '#2C1810', color: '#EDE8DF' }
    : { border: '1.5px solid #9C8276', backgroundColor: 'transparent', color: '#7A6248' };

  return (
    <div className="mb-6 space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        {showTop10 && (
          <button onClick={() => set('top10Only', !filters.top10Only)}
            className={pill} style={pillStyle(filters.top10Only)}>
            Tripp&apos;s Top 10
          </button>
        )}
        <button onClick={() => setOpen(!open)}
          className={`${pill} flex items-center gap-1.5`} style={pillStyle(hasOtherFilters)}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M1 3h14M4 8h8M7 13h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
          {open ? 'Hide filters' : 'More filters'}
          {hasOtherFilters && <span className="ml-0.5">· {[filters.neighborhood, filters.cuisine, filters.price, filters.awardedOnly ? 'Awarded' : ''].filter(Boolean).join(', ')}</span>}
        </button>
        {(filters.top10Only || hasOtherFilters) && (
          <button onClick={() => onChange(FILTER_DEFAULT)} className="text-xs text-muted hover:text-terracotta transition-colors">Clear all</button>
        )}
      </div>

      {open && (
        <div className="bg-linen border border-border rounded-2xl p-5 grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted mb-2 font-medium">Neighborhood</p>
            <select value={filters.neighborhood} onChange={(e) => set('neighborhood', e.target.value)}
              className="w-full text-xs border border-border rounded-lg px-2 py-1.5 bg-sand text-espresso focus:outline-none focus:border-lapis">
              <option value="">All</option>
              {ALL_NEIGHBORHOODS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted mb-2 font-medium">Cuisine</p>
            <select value={filters.cuisine} onChange={(e) => set('cuisine', e.target.value)}
              className="w-full text-xs border border-border rounded-lg px-2 py-1.5 bg-sand text-espresso focus:outline-none focus:border-lapis">
              <option value="">All</option>
              {ALL_CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted mb-2 font-medium">Price</p>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => set('price', '')} className={pill} style={pillStyle(!filters.price)}>All</button>
              {PRICE_TIERS.map(p => <button key={p} onClick={() => set('price', p === filters.price ? '' : p)} className={pill} style={pillStyle(filters.price === p)}>{p}</button>)}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted mb-2 font-medium">Awards</p>
            <button onClick={() => set('awardedOnly', !filters.awardedOnly)} className={pill} style={pillStyle(filters.awardedOnly)}>Awarded only</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HoustonPage() {
  const [view,         setView]         = useState<'map' | 'list'>('map');
  const [showWantToTry, setShowWantToTry] = useState(false);
  const [selected,     setSelected]     = useState<string | null>(null);
  const [filters,      setFilters]      = useState<Filters>(FILTER_DEFAULT);

  const activeList     = showWantToTry ? WANT_TO_TRY : ALL_ORDERED;
  const filteredAll    = useMemo(() => applyFilters(activeList, filters), [activeList, filters]);
  const mapLocations   = useMemo(() => applyFilters(activeList, filters), [activeList, filters]);

  const selectedRestaurant = useMemo(
    () => [...ALL_ORDERED, ...WANT_TO_TRY].find(r => r.id === selected),
    [selected]
  );

  const btnBase = 'px-4 py-2 rounded-full text-sm font-semibold transition-colors';
  const btnStyle = (active: boolean): React.CSSProperties => active
    ? { border: '1.5px solid #2C1810', backgroundColor: '#2C1810', color: '#EDE8DF' }
    : { border: '1.5px solid #9C8276', backgroundColor: 'transparent', color: '#2C1810' };

  const spotCount = showWantToTry ? WANT_TO_TRY.length : RESTAURANTS.length;

  return (
    <main className="max-w-6xl mx-auto px-5 py-10 sm:py-14">
      <div className="mb-8">
        <h1 className="font-serif text-4xl sm:text-5xl font-normal text-espresso mb-1">Houston</h1>
        <p className="text-tan text-base">Where I eat.</p>
      </div>

      {/* Row 1: Map / List view toggle */}
      <div className="flex items-center gap-2 mb-3">
        <button onClick={() => setView('map')}  className={btnBase} style={btnStyle(view === 'map')}>Map</button>
        <button onClick={() => setView('list')} className={btnBase} style={btnStyle(view === 'list')}>List</button>
      </div>

      {/* Row 2: Content toggle + spot count */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <button
          onClick={() => { setShowWantToTry(false); setSelected(null); setFilters(FILTER_DEFAULT); }}
          className={btnBase} style={btnStyle(!showWantToTry)}
        >
          Places I&apos;ve Been
        </button>
        <button
          onClick={() => { setShowWantToTry(true); setSelected(null); setFilters(FILTER_DEFAULT); }}
          className={btnBase} style={btnStyle(showWantToTry)}
        >
          On My List
        </button>
        <span className="text-xs text-muted ml-1">{spotCount} spots</span>
      </div>

      {view === 'map' && (
        <>
          <FilterBar filters={filters} onChange={setFilters} showTop10={!showWantToTry} />
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:flex-1 rounded-2xl overflow-hidden border border-border shadow-sm" style={{ height: 540 }}>
              <HoustonMap locations={mapLocations} selected={selected} onSelect={setSelected} isWantToTry={showWantToTry} />
            </div>
            <div className="lg:w-72">
              {selectedRestaurant ? (
                <SidebarDetail restaurant={selectedRestaurant} onClose={() => setSelected(null)} isWantToTry={showWantToTry} />
              ) : (
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted mb-3 px-1">{mapLocations.length} spots · click a pin to explore</p>
                  <ul className="flex flex-col gap-2 max-h-[480px] overflow-y-auto pr-1">
                    {mapLocations.map(r => (
                      <li key={r.id}>
                        <button onClick={() => setSelected(r.id)} className="w-full text-left px-4 py-3 rounded-xl border border-border hover:border-lapis/40 hover:bg-linen transition-colors">
                          <div className="flex items-center gap-1.5">
                            {r.topRank !== undefined && (
                              <span className="text-[10px] font-bold text-terracotta tabular-nums flex-shrink-0">#{r.topRank}</span>
                            )}
                            <p className="font-medium text-espresso text-sm truncate">{r.name}</p>
                          </div>
                          <div className="flex items-center justify-between mt-0.5 gap-2">
                            <p className="text-xs text-muted">{r.neighborhood}</p>
                            <p className="text-xs text-muted">{r.price}</p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {view === 'list' && (
        <>
          <FilterBar filters={filters} onChange={setFilters} showTop10={!showWantToTry} />
          {filters.top10Only && (
            <p className="text-sm text-muted -mt-2 mb-5 max-w-xl">Not a definitive ranking — just where I&apos;d send you right now.</p>
          )}
          <p className="text-xs text-muted mb-5">{filteredAll.length} of {spotCount} spots</p>
          {filteredAll.length === 0 ? (
            <p className="text-muted text-sm py-10 text-center">No spots match these filters.</p>
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAll.map(r => (
                <li key={r.id} className="flex">
                  <RestaurantCard restaurant={r} onSelect={id => { setSelected(id); setView('map'); }} isWantToTry={showWantToTry} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  );
}
