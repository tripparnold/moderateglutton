import { NextRequest, NextResponse } from 'next/server';
import fs   from 'fs';
import path from 'path';
import { getAllPosts } from '@/lib/posts';

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

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';

  // Require at least 2 characters to search
  if (q.length < 2) return NextResponse.json([]);

  const sections = getContentSections();
  const results: SearchResult[] = [];

  for (const section of sections) {
    try {
      const posts = getAllPosts(section);
      for (const post of posts) {
        const s = scorePost(post, section, q);
        // Require a meaningful match (title/description level, not just stray content words)
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

  // Sort by score descending, return top 10
  results.sort((a, b) => b.score - a.score);
  const top = results.slice(0, 10).map(({ score: _s, ...rest }) => rest);

  return NextResponse.json(top);
}
