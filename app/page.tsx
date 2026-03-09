import PhotoScroll from '@/components/PhotoScroll';
import { getAllPosts } from '@/lib/posts';

// Both recipes and spills appear on the home feed scroll
const SECTIONS = ['recipes', 'spills'] as const;

function getScrollPosts() {
  const all = SECTIONS.flatMap((section) =>
    getAllPosts(section)
      .filter((p) => !!p.frontmatter.heroImage)
      .map((p) => ({
        slug:        p.slug,
        section,
        title:       p.frontmatter.title        as string,
        description: (p.frontmatter.description as string) ?? '',
        heroImage:   p.frontmatter.heroImage     as string,
      }))
  );

  // Return most recent 10
  return all.slice(0, 10);
}

export default function Home() {
  const posts = getScrollPosts();

  return (
    <div>
      {/* Welcome */}
      <section
        className="max-w-5xl mx-auto px-5 pt-16 pb-10"
        aria-label="Welcome"
      >
        <h1
          className="font-serif font-light animate-colorShift"
          style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', lineHeight: 1.1 }}
        >
          Welcome.
        </h1>
      </section>

      {/* Photo scroll */}
      <section aria-label="Recent articles">
        <PhotoScroll posts={posts} />
      </section>
    </div>
  );
}
