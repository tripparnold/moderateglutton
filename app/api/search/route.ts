import { NextRequest, NextResponse } from 'next/server';
import { getAllPosts } from '@/lib/posts';

const SECTIONS = ['houston', 'recipes', 'journal', 'travel'];

interface SearchResult {
  slug:        string;
  section:     string;
  title:       string;
  description: string;
  heroImage:   string;
  score:       number;
}

function score(post: ReturnType<typeof getAllPosts>[number], section: string, q: string): number {
  const query = q.toLowerCase();
  const words = query.split(/\s+/).filter(Boolean);
  const title       = ((post.frontmatter.title       as string) ?? '').toLowerCase();
  const description = ((post.frontmatter.description as string) ?? '').toLowerCase();
  const tags        = ((post.frontmatter.tags        as string) ?? '').toLowerCase();
  const content     = (post.content ?? '').toLowerCase();

  let s = 0;

  // Exact phrase
  if (title.includes(query))       s += 200;
  if (description.includes(query)) s += 60;
  if (tags.includes(query))        s += 40;
  if (content.includes(query))     s += 15;

  // Individual words
  for (const w of words) {
    if (title.includes(w))       s += 80;
    if (description.includes(w)) s += 40;
    if (tags.includes(w))        s += 25;
    if (content.includes(w))     s += 10;
    // Section name match
    if (section.includes(w))     s += 20;
  }

  return s;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const results: SearchResult[] = [];

  for (const section of SECTIONS) {
    try {
      const posts = getAllPosts(section);
      for (const post of posts) {
        const s = score(post, section, q);
        if (s > 0) {
          results.push({
            slug:        post.slug,
            section,
            title:       (post.frontmatter.title       as string) ?? '',
            description: (post.frontmatter.description as string) ?? '',
            heroImage:   (post.frontmatter.heroImage   as string) ?? '',
            score:       s,
          });
        }
      }
    } catch {
      // Section may not have content directory — skip silently
    }
  }

  // Sort by score descending, return top 8
  results.sort((a, b) => b.score - a.score);
  const top = results.slice(0, 8).map(({ score: _s, ...rest }) => rest);

  return NextResponse.json(top);
}
