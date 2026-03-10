'use client';

import { useState, useMemo } from 'react';
import Link  from 'next/link';
import Image from 'next/image';

export interface RecipePost {
  slug:        string;
  title:       string;
  description: string;
  heroImage:   string;
  date:        string;
  tags:        string[];
  cuisine?:    string;
  effort?:     string;
  diet?:       string[];
}

const EFFORT_OPTIONS = ['Quick', 'Weekend Project'] as const;
const DIET_OPTIONS   = ['Vegetarian', 'Low-Carb', 'Gluten Free'] as const;

type EffortOption = typeof EFFORT_OPTIONS[number];
type DietOption  = typeof DIET_OPTIONS[number];

interface Props {
  posts:    RecipePost[];
  cuisines: string[];
}

function Pill({ active, onClick, children }: {
  active:   boolean;
  onClick:  () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
        active
          ? 'bg-terracotta text-sand border-terracotta'
          : 'border-tan/50 text-tan hover:border-tan hover:text-espresso'
      }`}
    >
      {children}
    </button>
  );
}

export default function RecipesClient({ posts, cuisines }: Props) {
  const [open,    setOpen]    = useState(false);
  const [cuisine, setCuisine] = useState('');
  const [effort,  setEffort]  = useState<EffortOption | ''>('');
  const [diet,    setDiet]    = useState<DietOption[]>([]);

  function toggleDiet(d: DietOption) {
    setDiet((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);
  }

  const hasFilters = cuisine !== '' || effort !== '' || diet.length > 0;
  function clearAll() { setCuisine(''); setEffort(''); setDiet([]); }

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      if (cuisine && p.cuisine !== cuisine) return false;
      if (effort  && p.effort  !== effort)  return false;
      for (const d of diet) {
        if (!p.diet?.includes(d)) return false;
      }
      return true;
    });
  }, [posts, cuisine, effort, diet]);

  return (
    <>
      {/* Filter bar */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen(!open)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium border transition-colors ${
              hasFilters
                ? 'bg-terracotta/10 border-terracotta text-terracotta'
                : 'border-tan/50 text-tan hover:border-tan hover:text-espresso'
            }`}
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M1 3h14M4 8h8M7 13h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            Filters
            {hasFilters && (
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-terracotta text-sand text-[10px] font-bold">
                {[cuisine, effort, ...diet].filter(Boolean).length}
              </span>
            )}
          </button>
          {hasFilters && (
            <button onClick={clearAll} className="text-xs text-muted hover:text-terracotta transition-colors">
              Clear all
            </button>
          )}
        </div>

        {open && (
          <div className="mt-3 p-4 bg-linen border border-border rounded-2xl space-y-4">
            {cuisines.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted mb-2">Cuisine</p>
                <select
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  className="text-xs text-espresso bg-sand border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:border-tan"
                >
                  <option value="">All</option>
                  {cuisines.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            )}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted mb-2">Effort</p>
              <div className="flex gap-2 flex-wrap">
                {EFFORT_OPTIONS.map((e) => (
                  <Pill key={e} active={effort === e} onClick={() => setEffort(effort === e ? '' : e)}>{e}</Pill>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted mb-2">Diet</p>
              <div className="flex gap-2 flex-wrap">
                {DIET_OPTIONS.map((d) => (
                  <Pill key={d} active={diet.includes(d)} onClick={() => toggleDiet(d)}>{d}</Pill>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {hasFilters && filtered.length === 0 && (
        <p className="text-muted text-sm mb-8">No recipes match those filters.</p>
      )}

      {filtered.length > 0 && (
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/recipes/${post.slug}`}
                className="group block rounded-xl overflow-hidden border border-border hover:border-tan transition-colors"
              >
                {post.heroImage ? (
                  <div className="relative w-full aspect-[4/3] overflow-hidden bg-linen">
                    <Image
                      src={post.heroImage}
                      alt={post.title}
                      fill
                      sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw"
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-[4/3] bg-linen" />
                )}
                <div className="p-4">
                  <h2 className="font-serif font-medium text-espresso text-lg leading-snug group-hover:text-terracotta transition-colors">
                    {post.title}
                  </h2>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {!hasFilters && filtered.length === 0 && (
        <p className="text-muted">Nothing here yet — check back soon.</p>
      )}
    </>
  );
}
