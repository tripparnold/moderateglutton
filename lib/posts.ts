import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDirectory = path.join(process.cwd(), 'content');

export function getPostSlugs(section: string): string[] {
  const dir = path.join(contentDirectory, section);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
}

export function getPostBySlug(section: string, slug: string) {
  const realSlug = slug.replace(/\.md$/, '');
  const fullPath = path.join(contentDirectory, section, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);
  return { slug: realSlug, frontmatter: data, content };
}

export function getAllPosts(section: string) {
  const slugs = getPostSlugs(section);
  return slugs
    .map((slug) => getPostBySlug(section, slug))
    .filter((p) => !p.frontmatter.draft)         // exclude drafts
    .sort((a, b) => (a.frontmatter.date > b.frontmatter.date ? -1 : 1));
}
