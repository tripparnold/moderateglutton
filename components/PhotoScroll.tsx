import Link from 'next/link';
import Image from 'next/image';

interface Post {
  slug:        string;
  section:     string;
  title:       string;
  description: string;
  heroImage:   string;
}

interface Props {
  posts: Post[];
}

export default function PhotoScroll({ posts }: Props) {
  if (!posts.length) return null;

  // Duplicate for seamless loop — CSS animation runs on the track div
  const doubled = [...posts, ...posts];

  return (
    /*
     * scroll-container: hover/focus-within pauses the CSS animation
     * overflow-hidden clips the track; pointer-events needed so links work
     */
    <div
      className="scroll-container overflow-hidden w-full"
      aria-label="Recent articles"
    >
      <div
        className="scroll-track flex gap-4 w-max"
        /* a11y: underlying links are still keyboard-navigable even while animating */
      >
        {doubled.map((post, i) => (
          <Link
            key={`${post.slug}-${i}`}
            href={`/${post.section}/${post.slug}`}
            aria-label={post.title}
            /* hide duplicate items from screen readers */
            aria-hidden={i >= posts.length ? true : undefined}
            tabIndex={i >= posts.length ? -1 : 0}
            className="group relative block flex-shrink-0 w-72 sm:w-80 h-[420px] sm:h-[460px] overflow-hidden rounded-sm"
          >
            <Image
              src={post.heroImage}
              alt={post.title}
              fill
              sizes="(max-width: 640px) 288px, 320px"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              priority={i < 3}
            />

            {/* gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-espresso/80 via-espresso/20 to-transparent" />

            {/* title card */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p className="text-sand/70 text-xs uppercase tracking-widest mb-1 font-sans">
                {post.section}
              </p>
              <h3 className="text-sand font-serif text-xl font-normal leading-snug line-clamp-2">
                {post.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
