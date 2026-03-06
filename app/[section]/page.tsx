import { notFound }    from 'next/navigation';
import type { Metadata } from 'next';
import Link             from 'next/link';
import Image            from 'next/image';
import { getAllPosts }  from '@/lib/posts';

const VALID_SECTIONS = ['journal', 'travel', 'houston', 'recipes'];

const SECTION_LABELS: Record<string, string> = {
  journal:  'Journal',
  travel:   'Travel',
  houston:  'Houston',
  recipes:  'Recipes',
};

interface Props {
  params: { section: string };
}

export async function generateStaticParams() {
  return VALID_SECTIONS.map((section) => ({ section }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!VALID_SECTIONS.includes(params.section)) return {};
  const label = SECTION_LABELS[params.section] ?? params.section;
  return { title: label };
}

export default function SectionPage({ params }: Props) {
  if (!VALID_SECTIONS.includes(params.section)) notFound();

  const posts = getAllPosts(params.section);
  const label = SECTION_LABELS[params.section] ?? params.section;

  return (
    <div className="max-w-5xl mx-auto px-5 py-12 sm:py-16">

      <header className="mb-10">
        <h1 className="font-serif font-light text-espresso"
            style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)' }}>
          {label}
        </h1>
        <div className="w-10 h-px bg-terracotta mt-3" aria-hidden="true" />
      </header>

      {posts.length === 0 ? (
        <p className="text-muted">Nothing here yet — check back soon.</p>
      ) : (
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const title:       string = post.frontmatter.title       as string;
            const description: string = (post.frontmatter.description as string) ?? '';
            const heroImage:   string = (post.frontmatter.heroImage  as string)  ?? '';
            const date:        string = (post.frontmatter.date        as string)  ?? '';

            const formattedDate = date
              ? new Date(date).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric',
                })
              : '';

            return (
              <li key={post.slug}>
                <Link
                  href={`/${params.section}/${post.slug}`}
                  className="group block h-full"
                >
                  {heroImage && (
                    <div className="relative w-full mb-3 overflow-hidden rounded-sm"
                         style={{ aspectRatio: '16/9' }}>
                      <Image
                        src={heroImage}
                        alt={title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                  )}

                  <div className="py-1">
                    {formattedDate && (
                      <time dateTime={date} className="text-xs text-muted uppercase tracking-widest block mb-1">
                        {formattedDate}
                      </time>
                    )}
                    <h2 className="font-serif text-xl font-normal text-espresso group-hover:text-terracotta transition-colors leading-snug mb-1">
                      {title}
                    </h2>
                    {description && (
                      <p className="text-sm text-muted line-clamp-2 leading-relaxed">
                        {description}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
