import { NextRequest, NextResponse } from 'next/server';
import fs   from 'fs';
import path from 'path';
import { getAllPosts } from '@/lib/posts';
import { ALL_ORDERED, WANT_TO_TRY } from '@/data/restaurants';

// Auto-discover all sections that exist in the content directory
function getContentSections(): string[] {
  const contentDir = path.join(process.cwd(), 'content');
  try {
    return fs
      .readdirSync(contentDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch {
    return ['recipes', 'spills'];
  }
}

interface SearchResult {
  slug:        string;
  section:     string;
  title:       string;
  description: string;
  heroImage:   string;
  score:       number;
}

function scorePost(
  post: { slug: string; frontmatter: Record<string, unknown>; content: string },
  section: string,
  q: string
): number {
  const query = q.toLowerCase();
  const words = query.split(/\s+/).filter(Boolean);

  const title       = String(post.frontmatter.title       ?? '').toLowerCase();
  const description = String(post.frontmatter.description ?? '').toLowerCase();
  const tagsRaw     = post.frontmatter.tags;
  const tags        = Array.isArray(tagsRaw)
    ? tagsRaw.join(' ').toLowerCase()
    : String(tagsRaw ?? '').toLowerCase();
  const content     = (post.content ?? '').toLowerCase();
  const slug        = post.slug.toLowerCase();

  let s = 0;

  // ── Exact phrase matches ────────────────────────────────────────
  if (title.includes(query))       s += 200;
  if (description.includes(query)) s += 60;
  if (tags.includes(query))        s += 40;
  if (content.includes(query))     s += 15;

  // ── Individual word matches ─────────────────────────────────────
  for (const w of words) {
    if (w.length < 2) continue; // skip noise
    if (title.includes(w))       s += 80;
    if (description.includes(w)) s += 40;
    if (tags.includes(w))        s += 25;
    if (slug.includes(w))        s += 20; // slug-based discovery
    if (section === w)           s += 20;
    if (content.includes(w))     s += 10;
  }

  return s;
}

function scoreRestaurant(
  r: { name: string; cuisine: string; cuisineTags: string[]; neighborhood: string; address: string },
  q: string
): number {
  const query = q.toLowerCase();
  const words = query.split(/\s+/).filter(Boolean);

  const name         = r.name.toLowerCase();
  const cuisine      = r.cuisine.toLowerCase();
  const cuisineTags  = r.cuisineTags.join(' ').toLowerCase();
  const neighborhood = r.neighborhood.toLowerCase();

  let s = 0;

  // Exact phrase
  if (name.includes(query))         s += 200;
  if (cuisine.includes(query))      s += 60;
  if (cuisineTags.includes(query))  s += 40;
  if (neighborhood.includes(query)) s += 30;

  // Individual words
  for (const w of words) {
    if (w.length < 2) continue;
    if (name.includes(w))         s += 100;
    if (cuisine.includes(w))      s += 50;
    if (cuisineTags.includes(w))  s += 30;
    if (neighborhood.includes(w)) s += 20;
  }

  return s;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';

  // Require at least 2 characters to search
  if (q.length < 2) return NextResponse.json([]);

  const sections = getContentSections();
  const results: SearchResult[] = [];

  // ── Content posts ────────────────────────────────────────────────
  for (const section of sections) {
    try {
      const posts = getAllPosts(section);
      for (const post of posts) {
        // Skip drafts/noindex posts
        if (post.frontmatter.draft || post.frontmatter.noindex) continue;
        const s = scorePost(post, section, q);
        // Require a meaningful match
        if (s >= 20) {
          results.push({
            slug:        post.slug,
            section,
            title:       String(post.frontmatter.title       ?? post.slug),
            description: String(post.frontmatter.description ?? ''),
            heroImage:   String(post.frontmatter.heroImage   ?? ''),
            score:       s,
          });
        }
      }
    } catch {
      // Section directory may be empty or missing — skip silently
    }
  }

  // ── Restaurants ──────────────────────────────────────────────────
  const allRestaurants = [...ALL_ORDERED, ...WANT_TO_TRY];
  for (const restaurant of allRestaurants) {
    const s = scoreRestaurant(restaurant, q);
    if (s >= 20) {
      results.push({
        slug:        `houston#${restaurant.id}`,
        section:     'houston',
        title:       restaurant.name,
        description: `${restaurant.cuisine} · ${restaurant.neighborhood} · ${restaurant.price}`,
        heroImage:   '',
        score:       s,
      });
    }
  }

  // Sort by score descending, return top 12
  results.sort((a, b) => b.score - a.score);
  const top = results.slice(0, 12).map(({ score: _s, ...rest }) => rest);

  return NextResponse.json(top);
}
