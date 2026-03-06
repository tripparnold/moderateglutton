'use client';

import { useRef, useEffect, useCallback } from 'react';
import Link  from 'next/link';
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

const SPEED = 0.55; // px per frame at 60 fps (~33 px/sec)

export default function PhotoScroll({ posts }: Props) {
  if (!posts.length) return null;

  const doubled    = [...posts, ...posts];
  const trackRef   = useRef<HTMLDivElement>(null);
  const posRef     = useRef(0);          // current scroll offset (px, always positive)
  const rafRef     = useRef<number>();
  const dragging   = useRef(false);
  const dragStartX = useRef(0);
  const dragStartPos = useRef(0);
  const moved      = useRef(0);          // px moved since mousedown (for click vs drag)
  const halfWidth  = useRef(0);

  // ── Auto-scroll loop ──────────────────────────────────────────────
  const tick = useCallback(() => {
    const el = trackRef.current;
    if (!el || dragging.current) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }
    // Measure half-width lazily (after mount, before first scroll)
    if (!halfWidth.current) {
      halfWidth.current = el.scrollWidth / 2;
    }
    posRef.current += SPEED;
    if (posRef.current >= halfWidth.current) {
      posRef.current -= halfWidth.current;
    }
    el.style.transform = `translateX(-${posRef.current}px)`;
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [tick]);

  // ── Drag handlers ─────────────────────────────────────────────────
  function startDrag(clientX: number) {
    dragging.current   = true;
    dragStartX.current = clientX;
    dragStartPos.current = posRef.current;
    moved.current      = 0;
  }

  const onMove = useCallback((clientX: number) => {
    if (!dragging.current || !trackRef.current) return;
    const delta = dragStartX.current - clientX; // positive = dragging left (forward)
    moved.current = Math.abs(delta);

    if (!halfWidth.current) {
      halfWidth.current = trackRef.current.scrollWidth / 2;
    }
    let next = dragStartPos.current + delta;
    // Wrap
    if (next < 0) next += halfWidth.current;
    if (next >= halfWidth.current) next -= halfWidth.current;
    posRef.current = next;
    trackRef.current.style.transform = `translateX(-${next}px)`;
  }, []);

  const onEnd = useCallback(() => {
    dragging.current = false;
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent)  => onMove(e.clientX);
    const onTouchMove = (e: TouchEvent)  => onMove(e.touches[0].clientX);
    const onMouseUp   = () => onEnd();
    const onTouchEnd  = () => onEnd();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup',   onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend',  onTouchEnd);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup',   onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend',  onTouchEnd);
    };
  }, [onMove, onEnd]);

  return (
    <div
      className="overflow-hidden w-full select-none"
      aria-label="Recent articles"
      style={{ cursor: 'grab' }}
      onMouseDown={(e) => { e.preventDefault(); startDrag(e.clientX); }}
      onTouchStart={(e) => startDrag(e.touches[0].clientX)}
    >
      <div
        ref={trackRef}
        className="flex gap-5 w-max py-2 px-4"
        style={{ willChange: 'transform' }}
      >
        {doubled.map((post, i) => (
          <Link
            key={`${post.slug}-${i}`}
            href={`/${post.section}/${post.slug}`}
            aria-label={post.title}
            aria-hidden={i >= posts.length ? true : undefined}
            tabIndex={i >= posts.length ? -1 : 0}
            draggable={false}
            className="group relative block flex-shrink-0 w-72 sm:w-80 h-[420px] sm:h-[460px] overflow-hidden rounded-2xl"
            style={{ cursor: 'inherit' }}
            onClick={(e) => {
              // Suppress navigation if the user dragged more than 8 px
              if (moved.current > 8) e.preventDefault();
            }}
          >
            <Image
              src={post.heroImage}
              alt={post.title}
              fill
              sizes="(max-width: 640px) 288px, 320px"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              priority={i < 3}
              draggable={false}
            />

            {/* Strong gradient for text legibility */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to top, rgba(20,10,5,0.88) 0%, rgba(20,10,5,0.45) 35%, rgba(20,10,5,0.05) 65%, transparent 100%)',
              }}
            />

            {/* Text */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p
                className="text-xs uppercase tracking-widest mb-1.5 font-sans font-medium"
                style={{ color: 'rgba(255,255,255,0.7)', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}
              >
                {post.section}
              </p>
              <h3
                className="font-serif text-xl font-normal leading-snug line-clamp-2"
                style={{ color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}
              >
                {post.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
