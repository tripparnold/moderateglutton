'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface Props {
  images: string[];
  alt:    string;
}

export default function PhotoGallery({ images, alt }: Props) {
  const [current, setCurrent] = useState(0);

  // Touch-swipe state
  const touchStartX = useRef<number | null>(null);

  if (!images || images.length === 0) return null;

  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);
  const next = () => setCurrent((c) => (c + 1) % images.length);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
    touchStartX.current = null;
  }

  return (
    <div className="mb-10 mx-auto" style={{ width: 'min(460px, 100%)' }}>
      {/* Image container */}
      <div
        className="relative overflow-hidden rounded-xl"
        style={{ aspectRatio: '1/1' }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {images.map((src, i) => (
          <div
            key={src}
            className="absolute inset-0 transition-opacity duration-400"
            style={{ opacity: i === current ? 1 : 0, pointerEvents: i === current ? 'auto' : 'none' }}
          >
            <Image
              src={src}
              alt={`${alt} — photo ${i + 1}`}
              fill
              sizes="(max-width: 640px) 100vw, 460px"
              className="object-cover"
              priority={i === 0}
            />
          </div>
        ))}

        {/* Prev / Next arrows — only show when multiple images */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-black/35 hover:bg-black/55 text-white transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              onClick={next}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-black/35 hover:bg-black/55 text-white transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M5 2L10 7L5 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3" role="tablist" aria-label="Gallery photos">
          {images.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === current}
              aria-label={`Photo ${i + 1}`}
              onClick={() => setCurrent(i)}
              className="rounded-full transition-all duration-200"
              style={{
                width:           i === current ? 18 : 6,
                height:          6,
                backgroundColor: i === current ? 'var(--color-terracotta, #A8502A)' : 'var(--color-tan, #9A8A78)',
                opacity:         i === current ? 1 : 0.45,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
