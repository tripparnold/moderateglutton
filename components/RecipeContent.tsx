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
      // Avoid double-wrapping if content is re-rendered
      if (!iH.parentElement?.classList.contains('recipe-section-snap')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'recipe-section-snap';
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
    }

    // ── 3. Scroll-reveal — BIDIRECTIONAL (reset on scroll-back) ──
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const targets = Array.from(el.querySelectorAll<HTMLElement>('p, li, blockquote'));
    targets.forEach((t) => t.classList.add('reveal-target'));

    // We do NOT call unobserve — the element stays observed.
    // When isIntersecting flips false AND intersectionRatio hits 0
    // (fully off-screen), we remove is-revealed so animation replays.
    // Using threshold [0, 0.15] prevents flickering at the edge:
    // elements near the threshold only reset once fully off-screen.
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
          } else if (entry.intersectionRatio === 0) {
            // Only reset when element is fully out of view (no flicker)
            entry.target.classList.remove('is-revealed');
          }
        });
      },
      {
        threshold:  [0, 0.15],
        rootMargin: '0px 0px -8% 0px',
      }
    );
    targets.forEach((t) => revealObserver.observe(t));

    // ── 4. Snap: scroll ingredients into view every time they enter ──
    // No hasSnapped guard — fires every time ingredients scroll into
    // view from below (scrolling down), with a cooldown to prevent jitter.
    if (ingredientsHeading !== null) {
      const iH = ingredientsHeading as HTMLElement;
      const snapTarget = iH.closest('.recipe-section-snap') as HTMLElement ?? iH;
      let cooldown = false;

      const snapObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !cooldown && entry.boundingClientRect.top > 0) {
            // Only snap when scrolling DOWN (element enters from below viewport)
            cooldown = true;
            snapTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTimeout(() => { cooldown = false; }, 2000);
          }
        },
        { threshold: 0.25 }
      );
      snapObserver.observe(snapTarget);

      return () => {
        revealObserver.disconnect();
        snapObserver.disconnect();
      };
    }

    return () => revealObserver.disconnect();
  }, [htmlContent]);

  // ── Print handler ─────────────────────────────────────────────
  function handlePrint() {
    window.print();
  }

  return (
    <div>
      {/* Print button — top of recipe, hidden in print */}
      <div className="flex items-center gap-3 mb-6 no-print">
        <button
          onClick={handlePrint}
          className="inline-flex items-center p-2 text-muted border border-border rounded-lg hover:text-espresso hover:border-tan transition-colors"
          aria-label="Print this recipe"
          title="Print recipe"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 9V3h12v6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="3" y="9" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.7"/>
            <path d="M6 19v-5h12v5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div
        ref={ref}
        className="prose prose-recipe"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
}
