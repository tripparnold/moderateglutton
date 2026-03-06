import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import { remark }     from 'remark';
import remarkHtml     from 'remark-html';
import { getPostBySlug, getPostSlugs } from '@/lib/posts';

const VALID_SECTIONS = ['journal', 'travel', 'houston', 'recipes'];

interface Props {
  params: { section: string; slug: string };
}

// ── Markdown → HTML ──────────────────────────────────────────────
async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark().use(remarkHtml, { sanitize: false }).process(markdown);
  return result.toString();
}

// ── Static params ────────────────────────────────────────────────
export async function generateStaticParams() {
  return VALID_SECTIONS.flatMap((section) =>
    getPostSlugs(section).map((file) => ({
      section,
      slug: file.replace(/\.md$/, ''),
    }))
  );
}

// ── Metadata ─────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!VALID_SECTIONS.includes(params.section)) return {};
  try {
    const { frontmatter } = getPostBySlug(params.section, params.slug);
    return {
      title:       frontmatter.title       as string,
      description: frontmatter.description as string,
      openGraph: {
        title:       frontmatter.title as string,
        description: frontmatter.description as string,
        images:      frontmatter.heroImage ? [{ url: frontmatter.heroImage as string }] : [],
      },
    };
  } catch {
    return {};
  }
}

// ── Page ─────────────────────────────────────────────────────────
export default async function PostPage({ params }: Props) {
  if (!VALID_SECTIONS.includes(params.section)) notFound();

  let post;
  try {
    post = getPostBySlug(params.section, params.slug);
  } catch {
    notFound();
  }

  const { frontmatter, content } = post;
  const htmlContent = await markdownToHtml(content);
  const isRecipe    = params.section === 'recipes';

  const title:       string  = frontmatter.title       as string;
  const description: string  = (frontmatter.description as string) ?? '';
  const heroImage:   string  = (frontmatter.heroImage  as string)  ?? '';
  const date:        string  = (frontmatter.date        as string)  ?? '';

  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : '';

  return (
    <article className="max-w-3xl mx-auto px-5 py-12 sm:py-16">

      {/* Back link */}
      <a
        href={`/${params.section}`}
        className="inline-flex items-center gap-1.5 text-xs text-muted uppercase tracking-widest mb-8 hover:text-terracotta transition-colors"
      >
        <span aria-hidden="true">←</span>
        {params.section.charAt(0).toUpperCase() + params.section.slice(1)}
      </a>

      {/* Header */}
      <header className="mb-8">
        {formattedDate && (
          <time
            dateTime={date}
            className="text-xs text-muted uppercase tracking-widest block mb-3"
          >
            {formattedDate}
          </time>
        )}

        <h1 className="font-serif font-normal text-espresso leading-tight mb-4"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)' }}>
          {title}
        </h1>

        {description && (
          <p className="text-tan text-lg font-light leading-relaxed">
            {description}
          </p>
        )}
      </header>

      {/* Hero image */}
      {heroImage && (
        <div className="relative w-full mb-10 overflow-hidden rounded-sm"
             style={{ aspectRatio: '16/9' }}>
          <Image
            src={heroImage}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Body */}
      <div
        className={`prose ${isRecipe ? 'prose-recipe' : ''}`}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </article>
  );
}
