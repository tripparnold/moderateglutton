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
  cuisine?:    string;   // future tag-based field
  effort?:     string;   // future tag-based field
  diet?:       string[]; // future tag-based field
}

const EFFORT_OPTIONS  = ['Quick', 'Weekend Project'] as const;
const DIET_OPTIONS    = ['Vegetarian', 'Low-Carb', 'Gluten Free'] as const;

type EffortOption = typeof EFFORT_OPTIONS[number];
type DietOption  = typeof DIET_OPTIONS[number];

interface Props {
  posts:    RecipePost[];
  cuisines: string[];
}

function TagPill({ active, onClick, children }: {
  active:   boolean;
  onClick:  () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
        active
          ? 'bg-terracotta text-white border-terracotta'
          : 'bg-transparent text-tan border-border hover:border-tan hover:text-espresso'
      }`}
    >
      {children}
    </button>
  );
}

export default function RecipesClient({ posts, cuisines }: Props) {
  const [cuisine,  setCuisine]  = useState('');
  const [effort,   setEffort]   = useState<EffortOption | ''>('');
  const [diet,     setDiet]     = useState<DietOption[]>([]);

  function toggleDiet(d: DietOption) {
    setDiet((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);
  }

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

  const hasFilters = cuisine !== '' || effort !== '' || diet.length > 0;

  return (
    <>
      {/* ── Filter bar ──────────────────────────────────────────── */}
      <div className="mb-10 space-y-4">

        {/* Row 1: Cuisine dropdown */}
        {cuisines.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-medium text-muted uppercase tracking-widest w-24 flex-shrink-0">Cuisine</span>
            <select
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              className="text-sm text-espresso bg-transparent border border-border rounded px-3 py-1.5 focus:outline-none focus:border-tan transition-colors"
            >
              <option value="">All</option>
              {cuisines.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}

        {/* Row 2: Effort */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-medium text-muted uppercase tracking-widest w-24 flex-shrink-0">Effort</span>
          <div className="flex gap-2 flex-wrap">
            {EFFORT_OPTIONS.map((e) => (
              <TagPill key={e} active={effort === e} onClick={() => setEffort(effort === e ? '' : e)}>
                {e}
              </TagPill>
            ))}
          </div>
        </div>

        {/* Row 3: Diet */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-medium text-muted uppercase tracking-widest w-24 flex-shrink-0">Diet</span>
          <div className="flex gap-2 flex-wrap">
            {DIET_OPTIONS.map((d) => (
              <TagPill key={d} active={diet.includes(d)} onClick={() => toggleDiet(d)}>
                {d}
              </TagPill>
            ))}
          </div>
        </div>

        {/* Clear */}
        {hasFilters && (
          <button
            onClick={() => { setCuisine(''); setEffort(''); setDiet([]); }}
            className="text-xs text-muted hover:text-terracotta transition-colors underline-offset-2 underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* ── Note about filters ───────────────────────────────────── */}
      {hasFilters && filtered.length === 0 && (
        <p className="text-muted text-sm">No recipes match those filters — check back soon.</p>
      )}

      {/* ── Recipe grid ─────────────────────────────────────────── */}
      {filtered.length > 0 && (
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => {
            const formattedDate = post.date
              ? new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC',
                })
              : '';

            return (
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
                    <div className="w-full aspect-[4/3] bg-linen flex items-center justify-center">
                      <span className="text-muted text-3xl">🥘</span>
                    </div>
                  )}
                  <div className="p-4">
                    {formattedDate && (
                      <time className="text-xs text-muted">{formattedDate}</time>
                    )}
                    <h2 className="font-serif font-medium text-espresso text-lg mt-1 leading-snug group-hover:text-terracotta transition-colors">
                      {post.title}
                    </h2>
                    {post.description && (
                      <p className="text-sm text-muted mt-1.5 line-clamp-2">{post.description}</p>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {/* ── Empty state (no filters applied) ────────────────────── */}
      {!hasFilters && filtered.length === 0 && (
        <p className="text-muted">Nothing here yet — check back soon.</p>
      )}
    </>
  );
}
