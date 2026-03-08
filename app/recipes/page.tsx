import type { Metadata } from 'next';
import Link             from 'next/link';
import { getAllPosts }  from '@/lib/posts';
import RecipesClient, { type RecipePost } from '@/components/RecipesClient';

export const metadata: Metadata = {
  title:       'Recipes',
  description: 'Recipes worth making again — weeknight dinners, weekend projects, and everything in between.',
};

// Wrench icon
function WrenchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  );
}

// Jar icon (pantry)
function JarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 2h8l1 4H7L8 2z"/><rect x="5" y="6" width="14" height="14" rx="2"/><path d="M9 11h6M9 15h4"/>
    </svg>
  );
}

export default function RecipesPage() {
  const raw = getAllPosts('recipes');

  const posts: RecipePost[] = raw.map((p) => {
    const tags: string[] = Array.isArray(p.frontmatter.tags)
      ? (p.frontmatter.tags as string[])
      : [];

    return {
      slug:        p.slug,
      title:       String(p.frontmatter.title       ?? p.slug),
      description: String(p.frontmatter.description ?? ''),
      heroImage:   String(p.frontmatter.heroImage   ?? ''),
      date:        String(p.frontmatter.date         ?? ''),
      tags,
      // Filtering fields — populated from tags going forward
      cuisine:     tags.find((t) => t.startsWith('cuisine:')),
      effort:      tags.includes('quick') ? 'Quick'
                 : tags.includes('weekend-project') ? 'Weekend Project'
                 : undefined,
      diet:        [
        ...(tags.includes('vegetarian')   ? ['Vegetarian']   : []),
        ...(tags.includes('low-carb')     ? ['Low-Carb']     : []),
        ...(tags.includes('gluten-free')  ? ['Gluten Free']  : []),
      ] as string[],
    };
  });

  // Derive unique cuisine values from data (populated going forward)
  const cuisineSet = new Set(posts.map((p) => p.cuisine).filter(Boolean) as string[]);
  const cuisines   = Array.from(cuisineSet).sort();

  return (
    <div className="max-w-5xl mx-auto px-5 py-12 sm:py-16">

      {/* Header row */}
      <header className="mb-10">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1
              className="font-serif font-light text-espresso"
              style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)' }}
            >
              Recipes
            </h1>
            <div className="w-10 h-px bg-terracotta mt-3" aria-hidden="true" />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-1.5">
            <a
              href="#"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border text-xs font-medium text-tan hover:text-espresso hover:border-tan transition-colors"
              aria-label="My Equipment (coming soon)"
            >
              <WrenchIcon />
              My Equipment
            </a>
            <Link
              href="/pantry"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border text-xs font-medium text-tan hover:text-espresso hover:border-tan transition-colors"
              aria-label="My Pantry"
            >
              <JarIcon />
              My Pantry
            </Link>
          </div>
        </div>
      </header>

      {/* Filters + grid (client component) */}
      <RecipesClient posts={posts} cuisines={cuisines} />
    </div>
  );
}
