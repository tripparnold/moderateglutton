'use client';

import { useEffect, useRef } from 'react';

interface Props {
  htmlContent: string;
}

export default function RecipeContent({ htmlContent }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // ── 1. Find Ingredients heading ───────────────────────────────
    const allHeadings = Array.from(el.querySelectorAll<HTMLElement>('h3, h2'));

    const ingredientsHeading = allHeadings.find((h) =>
      (h.textContent ?? '').toLowerCase().includes('ingredient')
    ) ?? null;

    // ── 2. Wrap ingredients section in a snap container ───────────
    if (ingredientsHeading !== null) {
      const iH = ingredientsHeading as HTMLElement;
      const wrapper = document.createElement('div');
      wrapper.className = 'recipe-section-snap';

      // Collect all siblings until the next h2/h3
      const nodes: Node[] = [];
      let cursor: Element | null = iH;
      while (cursor !== null) {
        const next = cursor.nextElementSibling as Element | null;
        nodes.push(cursor);
        cursor = next;
        if (cursor !== null && (cursor.tagName === 'H2' || cursor.tagName === 'H3')) break;
      }

      iH.parentNode?.insertBefore(wrapper, iH);
      nodes.forEach((n) => wrapper.appendChild(n));
    }

    // ── 3. Scroll-reveal via IntersectionObserver ─────────────────
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const targets = Array.from(el.querySelectorAll<HTMLElement>('p, li, blockquote'));
    targets.forEach((t) => t.classList.add('reveal-target'));

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );
    targets.forEach((t) => revealObserver.observe(t));

    // ── 4. One-shot snap: scroll ingredients into view ────────────
    if (ingredientsHeading !== null) {
      const iH = ingredientsHeading as HTMLElement;
      const snapTarget = iH.parentElement ?? iH;
      let hasSnapped = false;

      const snapObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !hasSnapped) {
            hasSnapped = true;
            snapTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
            snapObserver.disconnect();
          }
        },
        { threshold: 0.3 }
      );
      snapObserver.observe(snapTarget);

      return () => {
        revealObserver.disconnect();
        snapObserver.disconnect();
      };
    }

    return () => revealObserver.disconnect();
  }, [htmlContent]);

  return (
    <div
      ref={ref}
      className="prose prose-recipe"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
