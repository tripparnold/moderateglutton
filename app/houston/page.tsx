'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic   from 'next/dynamic';
import { RESTAURANTS, TOP_10, THE_REST } from '@/data/restaurants';
import type { Restaurant, PriceTier }    from '@/data/restaurants';

const HoustonMap = dynamic(() => import('@/components/HoustonMap'), { ssr: false });

// ── Badge component ───────────────────────────────────────────────
function DistinctionBadges({ d }: { d: Restaurant['distinctions'] }) {
  if (!d) return null;
  const badges: { icon?: string; label: string }[] = [];
  if (d.michelin === 'star')        badges.push({ icon: '✦', label: 'Michelin Star' });
  if (d.michelin === 'bibgourmand') badges.push({ icon: 'Ⓑ', label: 'Bib Gourmand' });
  if (d.michelin === 'recommended') badges.push({ label: 'Michelin Recommended' });
  if (d.texasMonthlyBBQ)            badges.push({ label: 'Texas Monthly Top 50' });
  d.jamesBeard?.forEach((jb) => {
    const yrs   = Array.isArray(jb.year) ? jb.year.join(', ') : String(jb.year);
    const label = jb.type === 'winner'       ? `JB Winner '${yrs}`
                : jb.type === 'finalist'     ? `JB Finalist '${yrs}`
                : jb.type === 'semifinalist' ? `JB Semifinalist '${yrs}`
                :                             `JB Nominated '${yrs}`;
    badges.push({ label });
  });
  if (!badges.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {badges.map((b, i) => (
        <span key={i} className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border border-lapis/30 bg-lapis/5 text-lapis">
          {b.icon && <span className="text-[#E8003D]">{b.icon}</span>}
          {b.label}
        </span>
      ))}
    </div>
  );
}

// ── Maps links ────────────────────────────────────────────────────
function MapsLinks({ address }: { address: string }) {
  const q = encodeURIComponent(address);
  return (
    <div className="flex items-center gap-2 mt-1 mb-0.5">
      <a href={`https://maps.apple.com/?q=${q}`} target="_blank" rel="noopener noreferrer"
         className="text-xs text-muted hover:text-lapis transition-colors underline underline-offset-2 decoration-border">Apple Maps</a>
      <span className="text-muted text-xs" aria-hidden="true">·</span>
      <a href={`https://www.google.com/maps/search/?api=1&query=${q}`} target="_blank" rel="noopener noreferrer"
         className="text-xs text-muted hover:text-lapis transition-colors underline underline-offset-2 decoration-border">Google Maps</a>
    </div>
  );
}

// ── Filter types ──────────────────────────────────────────────────
interface Filters {
  neighborhood: string;
  cuisine:      string;
  price:        string;
  awardedOnly:  boolean;
}
const FILTER_DEFAULT: Filters = { neighborhood: '', cuisine: '', price: '', awardedOnly: false };

function hasAward(r: Restaurant) {
  return !!(r.distinctions?.michelin || r.distinctions?.jamesBeard?.length || r.distinctions?.texasMonthlyBBQ);
}

function applyFilters(locs: Restaurant[], f: Filters): Restaurant[] {
  return locs.filter((r) => {
    if (f.neighborhood && r.neighborhood !== f.neighborhood) return false;
    if (f.cuisine      && !r.cuisineTags.includes(f.cuisine)) return false;
    if (f.price        && r.price !== f.price) return false;
    if (f.awardedOnly  && !hasAward(r)) return false;
    return true;
  });
}

// Pull unique sorted values from the full list
const ALL_NEIGHBORHOODS = Array.from(new Set(RESTAURANTS.map(r => r.neighborhood))).sort();
const ALL_CUISINES      = Array.from(new Set(RESTAURANTS.flatMap(r => r.cuisineTags))).sort();
const PRICE_TIERS: PriceTier[] = ['$', '$$', '$$$', '$$$$'];

// ── Shared card UI ────────────────────────────────────────────────
function RestaurantCard({
  restaurant, rank, onSelect, compact = false,
}: {
  restaurant: Restaurant;
  rank?:      number;
  onSelect:   (id: string) => void;
  compact?:   boolean;
}) {
  const r = restaurant;
  return (
    <button
      onClick={() => onSelect(r.id)}
      className="group w-full text-left rounded-2xl border border-border bg-linen hover:border-lapis/50 hover:shadow-md transition-all overflow-hidden"
    >
      <div className="px-5 pt-5 pb-4">
        {/* Rank + cuisine row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-lapis">{r.cuisine}</span>
          {rank !== undefined && (
            <span className="text-xs font-bold text-terracotta tabular-nums">#{rank}</span>
          )}
        </div>

        {/* Name */}
        <h2 className="font-serif text-xl text-espresso leading-tight group-hover:text-terracotta transition-colors">
          {r.name}
        </h2>

        {/* Meta */}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-xs text-muted">{r.neighborhood}</span>
          <span className="text-muted text-xs" aria-hidden="true">·</span>
          <span className="text-xs text-muted">{r.price}</span>
        </div>

        <p className="text-xs text-muted mt-0.5">{r.address}</p>
        <MapsLinks address={r.address} />
        <DistinctionBadges d={r.distinctions} />
      </div>

      {r.note && !compact && (
        <div className="px-5 pb-5 border-t border-border/60 pt-3">
          <p className="text-sm text-tan italic leading-relaxed line-clamp-2">
            &ldquo;{r.note}&rdquo;
          </p>
        </div>
      )}

      <div className="px-5 pb-4 pt-0">
        <span className="text-xs text-muted group-hover:text-lapis transition-colors">View on map →</span>
      </div>
    </button>
  );
}

// ── Filter bar ────────────────────────────────────────────────────
function FilterBar({ filters, onChange }: {
  filters:  Filters;
  onChange: (f: Filters) => void;
}) {
  const [open, setOpen] = useState(false);
  const hasFilters = filters.neighborhood || filters.cuisine || filters.price || filters.awardedOnly;

  function set<K extends keyof Filters>(key: K, val: Filters[K]) {
    onChange({ ...filters, [key]: val });
  }

  const pillBase  = 'text-xs px-3 py-1 rounded-full border transition-colors cursor-pointer';
  const pillOn    = `${pillBase} bg-espresso text-sand border-espresso`;
  const pillOff   = `${pillBase} border-border text-tan hover:border-tan`;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition-colors ${
            hasFilters ? 'border-lapis text-lapis bg-lapis/5' : 'border-border text-muted hover:border-tan hover:text-tan'
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M1 3h14M4 8h8M7 13h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          Filter {hasFilters ? '·' : ''}
          {hasFilters && (
            <span className="text-xs font-semibold text-lapis">
              {[filters.neighborhood, filters.cuisine, filters.price, filters.awardedOnly ? 'Awarded' : ''].filter(Boolean).join(', ')}
            </span>
          )}
        </button>
        {hasFilters && (
          <button onClick={() => onChange(FILTER_DEFAULT)} className="text-xs text-muted hover:text-terracotta transition-colors">
            Clear
          </button>
        )}
      </div>

      {open && (
        <div className="bg-linen border border-border rounded-2xl p-5 mt-3 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Neighborhood */}
          <div>
            <p className="text-xs uppercase tracking-widest text-muted mb-2 font-medium">Neighborhood</p>
            <select
              value={filters.neighborhood}
              onChange={(e) => set('neighborhood', e.target.value)}
              className="w-full text-xs border border-border rounded-lg px-2 py-1.5 bg-sand text-espresso focus:outline-none focus:border-lapis"
            >
              <option value="">All</option>
              {ALL_NEIGHBORHOODS.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          {/* Cuisine */}
          <div>
            <p className="text-xs uppercase tracking-widest text-muted mb-2 font-medium">Cuisine</p>
            <select
              value={filters.cuisine}
              onChange={(e) => set('cuisine', e.target.value)}
              className="w-full text-xs border border-border rounded-lg px-2 py-1.5 bg-sand text-espresso focus:outline-none focus:border-lapis"
            >
              <option value="">All</option>
              {ALL_CUISINES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Price */}
          <div>
            <p className="text-xs uppercase tracking-widest text-muted mb-2 font-medium">Price</p>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => set('price', '')} className={!filters.price ? pillOn : pillOff}>All</button>
              {PRICE_TIERS.map((p) => (
                <button key={p} onClick={() => set('price', p === filters.price ? '' : p)} className={filters.price === p ? pillOn : pillOff}>{p}</button>
              ))}
            </div>
          </div>

          {/* Awards */}
          <div>
            <p className="text-xs uppercase tracking-widest text-muted mb-2 font-medium">Awards</p>
            <button
              onClick={() => set('awardedOnly', !filters.awardedOnly)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${filters.awardedOnly ? 'bg-espresso text-sand border-espresso' : 'border-border text-tan hover:border-tan'}`}
            >
              Awarded only
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sidebar detail panel ──────────────────────────────────────────
function SidebarDetail({ restaurant, onClose }: { restaurant: Restaurant; onClose: () => void }) {
  const r = restaurant;
  return (
    <div className="bg-linen rounded-2xl border border-border p-5">
      <p className="text-xs uppercase tracking-widest text-lapis font-medium mb-2">{r.cuisine}</p>
      <h2 className="font-serif text-2xl text-espresso leading-tight">{r.name}</h2>
      <div className="flex items-center gap-2 mt-1 mb-2 flex-wrap">
        <span className="text-xs text-muted">{r.neighborhood}</span>
        <span className="text-muted text-xs">·</span>
        <span className="text-xs text-muted">{r.price}</span>
      </div>
      <p className="text-xs text-muted">{r.address}</p>
      <MapsLinks address={r.address} />
      <DistinctionBadges d={r.distinctions} />
      {r.note && (
        <p className="text-sm text-tan italic leading-relaxed border-l-2 border-lapis/30 pl-3 mt-4">
          &ldquo;{r.note}&rdquo;
        </p>
      )}
      <button onClick={onClose} className="mt-4 text-xs text-muted hover:text-lapis transition-colors">
        ← Back to all
      </button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────
export default function HoustonPage() {
  const [view,     setView]     = useState<'map' | 'list'>('map');
  const [selected, setSelected] = useState<string | null>(null);
  const [isDark,   setIsDark]   = useState(false);
  const [filters,  setFilters]  = useState<Filters>(FILTER_DEFAULT);
  const [tab,      setTab]      = useState<'top10' | 'all'>('top10');

  useEffect(() => {
    const sync = () => setIsDark(document.documentElement.classList.contains('dark'));
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const selectedRestaurant = RESTAURANTS.find((r) => r.id === selected);

  // Filters only apply to the "all" tab
  const filteredRest = useMemo(() => applyFilters(THE_REST, filters), [filters]);
  const filteredTop  = useMemo(() => applyFilters(TOP_10,   filters), [filters]);

  // All visible for map
  const mapLocations = useMemo(() => applyFilters(RESTAURANTS, filters), [filters]);

  const toggleBtn = (active: boolean) =>
    `px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
      active ? 'bg-lapis text-sand border-lapis' : 'bg-transparent text-tan border-border hover:border-lapis hover:text-lapis'
    }`;

  const tabBtn = (active: boolean) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      active ? 'bg-espresso text-sand' : 'text-muted hover:text-espresso'
    }`;

  return (
    <main className="max-w-6xl mx-auto px-5 py-10 sm:py-14">

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-4xl sm:text-5xl font-normal text-espresso mb-1">Houston</h1>
        <p className="text-tan text-base">Where I eat.</p>
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <button onClick={() => setView('map')}  className={toggleBtn(view === 'map')}>Map</button>
        <button onClick={() => setView('list')} className={toggleBtn(view === 'list')}>List</button>
        <span className="ml-2 text-xs text-muted">{RESTAURANTS.length} spots</span>
      </div>

      {/* ── MAP VIEW ─────────────────────────────────────────────── */}
      {view === 'map' && (
        <>
          <FilterBar filters={filters} onChange={setFilters} />
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:flex-1 rounded-2xl overflow-hidden border border-border shadow-sm" style={{ height: 540 }}>
              <HoustonMap
                locations={mapLocations}
                selected={selected}
                onSelect={setSelected}
                isDark={isDark}
              />
            </div>

            {/* Sidebar */}
            <div className="lg:w-72">
              {selectedRestaurant ? (
                <SidebarDetail restaurant={selectedRestaurant} onClose={() => setSelected(null)} />
              ) : (
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted mb-3 px-1">
                    {mapLocations.length} spots · click a pin to explore
                  </p>
                  <ul className="flex flex-col gap-2 max-h-[480px] overflow-y-auto pr-1">
                    {mapLocations.map((r) => (
                      <li key={r.id}>
                        <button
                          onClick={() => setSelected(r.id)}
                          className="w-full text-left px-4 py-3 rounded-xl border border-border hover:border-lapis/40 hover:bg-linen transition-colors"
                        >
                          <p className="font-medium text-espresso text-sm">{r.name}</p>
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

      {/* ── LIST VIEW ────────────────────────────────────────────── */}
      {view === 'list' && (
        <>
          {/* Tab bar — Top 10 / All */}
          <div className="flex items-center gap-1 mb-6 bg-linen rounded-xl p-1 w-fit border border-border">
            <button onClick={() => setTab('top10')} className={tabBtn(tab === 'top10')}>
              Tripp&apos;s Current Go-To&apos;s
            </button>
            <button onClick={() => setTab('all')} className={tabBtn(tab === 'all')}>
              All {RESTAURANTS.length} Spots
            </button>
          </div>

          {/* ── TOP 10 ── */}
          {tab === 'top10' && (
            <>
              <p className="text-sm text-muted mb-6 max-w-xl">
                Not a definitive ranking — just where I&apos;d send you right now.
              </p>
              <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {TOP_10.map((r) => (
                  <li key={r.id}>
                    <RestaurantCard
                      restaurant={r}
                      rank={r.topRank}
                      onSelect={(id) => { setSelected(id); setView('map'); }}
                    />
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* ── ALL ── */}
          {tab === 'all' && (
            <>
              <FilterBar filters={filters} onChange={setFilters} />
              <p className="text-xs text-muted mb-4">
                {filteredRest.length + filteredTop.length} of {RESTAURANTS.length} spots
              </p>

              {/* Top 10 within All view */}
              {filteredTop.length > 0 && (
                <div className="mb-10">
                  <h2 className="font-serif text-2xl text-espresso mb-4">Go-To&apos;s</h2>
                  <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredTop.map((r) => (
                      <li key={r.id}>
                        <RestaurantCard
                          restaurant={r}
                          rank={r.topRank}
                          onSelect={(id) => { setSelected(id); setView('map'); }}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* The rest */}
              {filteredRest.length > 0 && (
                <div>
                  {filteredTop.length > 0 && (
                    <h2 className="font-serif text-2xl text-espresso mb-4">The Rest</h2>
                  )}
                  <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredRest.map((r) => (
                      <li key={r.id}>
                        <RestaurantCard
                          restaurant={r}
                          onSelect={(id) => { setSelected(id); setView('map'); }}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {filteredRest.length + filteredTop.length === 0 && (
                <p className="text-muted text-sm py-10 text-center">No spots match these filters.</p>
              )}
            </>
          )}
        </>
      )}
    </main>
  );
}
