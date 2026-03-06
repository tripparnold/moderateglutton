'use client';

import { useRef, useCallback, useEffect } from 'react';
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

/** Read the current CSS translateX off a transformed element */
function getTranslateX(el: HTMLElement): number {
  const matrix = new DOMMatrix(window.getComputedStyle(el).transform);
  return matrix.m41;
}

export default function PhotoScroll({ posts }: Props) {
  if (!posts.length) return null;

  const doubled   = [...posts, ...posts];
  const trackRef  = useRef<HTMLDivElement>(null);
  const dragging  = useRef(false);
  const startX    = useRef(0);
  const startTx   = useRef(0);
  const resumeTmr = useRef<ReturnType<typeof setTimeout>>();

  // ── Pause / resume helpers ──────────────────────────────────────
  function pauseAt(tx: number) {
    const el = trackRef.current;
    if (!el) return;
    el.style.animationPlayState = 'paused';
    el.style.transform          = `translateX(${tx}px)`;
  }

  function resumeFrom(tx: number) {
    const el = trackRef.current;
    if (!el) return;
    const halfWidth = el.scrollWidth / 2;
    // Wrap tx into the 0 → -halfWidth range
    let norm = tx % halfWidth;
    if (norm > 0) norm -= halfWidth;
    const progress = Math.abs(norm) / halfWidth;          // 0–1
    const delay    = -(progress * 55);                    // negative = mid-animation
    el.style.animationDelay      = `${delay}s`;
    el.style.transform           = '';
    el.style.animationPlayState  = 'running';
  }

  // ── Drag start ──────────────────────────────────────────────────
  function onDragStart(clientX: number) {
    if (!trackRef.current) return;
    clearTimeout(resumeTmr.current);
    const tx = getTranslateX(trackRef.current);
    pauseAt(tx);
    dragging.current = true;
    startX.current   = clientX;
    startTx.current  = tx;
  }

  // ── Drag move ───────────────────────────────────────────────────
  const onDragMove = useCallback((clientX: number) => {
    if (!dragging.current || !trackRef.current) return;
    const delta    = clientX - startX.current;
    let   newTx    = startTx.current + delta;
    const halfWidth = trackRef.current.scrollWidth / 2;
    // Wrap for infinite feel
    if (newTx > 0)          newTx -= halfWidth;
    if (newTx < -halfWidth) newTx += halfWidth;
    trackRef.current.style.transform = `translateX(${newTx}px)`;
  }, []);

  // ── Drag end ────────────────────────────────────────────────────
  const onDragEnd = useCallback(() => {
    if (!dragging.current || !trackRef.current) return;
    dragging.current = false;
    const tx = getTranslateX(trackRef.current);
    // Small delay before resuming so it feels intentional
    resumeTmr.current = setTimeout(() => resumeFrom(tx), 900);
  }, []);

  // ── Global mouse / touch listeners ─────────────────────────────
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => onDragMove(e.clientX);
    const onTouchMove = (e: TouchEvent) => onDragMove(e.touches[0].clientX);
    const onMouseUp   = () => onDragEnd();
    const onTouchEnd  = () => onDragEnd();

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
  }, [onDragMove, onDragEnd]);

  return (
    <div
      className="scroll-container overflow-hidden w-full select-none"
      aria-label="Recent articles"
      style={{ cursor: 'grab' }}
      onMouseDown={(e) => { e.preventDefault(); onDragStart(e.clientX); }}
      onTouchStart={(e) => onDragStart(e.touches[0].clientX)}
    >
      <div
        ref={trackRef}
        className="scroll-track flex gap-5 w-max py-2 px-4"
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
              // Suppress navigation if the user was dragging
              if (Math.abs(getTranslateX(trackRef.current!) - startTx.current) > 8) {
                e.preventDefault();
              }
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
