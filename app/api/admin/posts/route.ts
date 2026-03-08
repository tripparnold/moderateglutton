import { NextRequest, NextResponse } from 'next/server';
import fs          from 'fs';
import path        from 'path';
import matter      from 'gray-matter';
import { getAllPosts } from '@/lib/posts';
import { verifyToken, COOKIE_NAME } from '@/lib/admin-auth';

export const runtime = 'nodejs';

const SECTIONS = ['recipes', 'spills'];

async function isAuth(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  return !!token && await verifyToken(token);
}

/** GET /api/admin/posts — returns all posts across recipes + spills */
export async function GET(req: NextRequest) {
  if (!await isAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const all = SECTIONS.flatMap((section) => {
    try {
      return getAllPosts(section).map((p) => ({
        section,
        slug:        p.slug,
        title:       String(p.frontmatter.title       ?? p.slug),
        description: String(p.frontmatter.description ?? ''),
        date:        String(p.frontmatter.date         ?? ''),
        tags:        Array.isArray(p.frontmatter.tags) ? p.frontmatter.tags as string[] : [],
      }));
    } catch {
      return [];
    }
  });

  return NextResponse.json(all);
}

/** PATCH /api/admin/posts — update frontmatter fields for one post */
export async function PATCH(req: NextRequest) {
  if (!await isAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { section, slug, title, description, tags } =
    await req.json() as {
      section:     string;
      slug:        string;
      title?:      string;
      description?: string;
      tags?:       string[];
    };

  if (!section || !slug) {
    return NextResponse.json({ error: 'section and slug are required' }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), 'content', section, `${slug}.md`);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  const raw  = fs.readFileSync(filePath, 'utf8');
  const doc  = matter(raw);

  if (title       !== undefined) doc.data.title       = title;
  if (description !== undefined) doc.data.description = description;
  if (tags        !== undefined) doc.data.tags        = tags;

  const updated = matter.stringify(doc.content, doc.data);
  fs.writeFileSync(filePath, updated, 'utf8');

  return NextResponse.json({ ok: true });
}
