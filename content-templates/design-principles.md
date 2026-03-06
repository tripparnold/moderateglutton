# Moderate Glutton — Design Principles & Style Guide

_A reference for maintaining the visual identity of the site as it grows._
_Last updated: March 2026_

---

## The feeling we're going for

**Not** a restaurant review site. Not a food influencer blog. Something quieter — the visual equivalent of a well-worn cookbook on a wooden table in a warm kitchen. The design should feel like it has taste without announcing it.

Influences: Maximo restaurant in Houston (warm, modern, Texas). Apple's typography and spacing (intentional, generous white space). Desert Southwest color palettes (ochre, terracotta, clay, sand). Lapis lazuli accents from Southwestern jewelry and tile work.

---

## Color Palette

All colors are defined as CSS custom properties in `app/globals.css` and referenced as Tailwind tokens in `tailwind.config.ts`. **Change the values only in `globals.css` — not in individual components.**

### Light mode (desert day)

| Token | Hex | Use |
|---|---|---|
| `sand` | `#EDE8DF` | Page background |
| `linen` | `#E5DED3` | Card backgrounds, subtle surfaces |
| `espresso` | `#2C1810` | Primary text, buttons |
| `terracotta` | `#A8502A` | Primary accent — logo, links, CTAs |
| `clay` | `#8B3F20` | Hover state for terracotta elements |
| `amber` | `#C4843A` | Star ratings, warm secondary accents |
| `tan` | `#7A6248` | Secondary text, descriptions |
| `muted` | `#9A8A78` | Placeholder text, metadata, timestamps |
| `border` | `#E2D8CC` | Dividers, input borders, card borders |
| `lapis` | `#2E5E8E` | Distinction badges, section labels, filters, focus rings |

### Dark mode (desert night)

The dark palette uses the same token names but deeper, warmer values. The `.dark` class on `<html>` overrides the CSS variables. Dark mode is not simply an inversion — it's a warm, near-black desert palette.

| Token | Dark value | Notes |
|---|---|---|
| `sand` | `#19110A` | Near-black background |
| `espresso` | `#EDE8DF` | Flipped — becomes light text on dark |
| `terracotta` | `#D4683A` | Slightly brighter for legibility |
| `lapis` | `#5A90C8` | Lighter for contrast on dark backgrounds |

### When to use lapis

Lapis is a **restrained accent** — not a primary color. Use it for:
- Section/category labels above content titles
- Distinction badges (Michelin, James Beard) on the Houston page
- Active filter buttons and toggle states
- Focus rings (accessibility)
- Recipe section heading left-borders (`h3` in recipe content)
- Search result section badges

Do **not** use lapis for body text, main CTAs, or anywhere it would compete with terracotta.

---

## Typography

**Headings:** Cormorant Garamond — an elegant, high-contrast serif. Used for article titles, the "Welcome." homepage heading, restaurant names on the Houston page, and section titles like "Houston" and "No Emails (yet)".

**Body:** Inter — a clean, highly legible sans-serif. Used for all body copy, navigation, captions, labels, and UI text.

Both fonts are loaded via `next/font/google` in `app/layout.tsx` and self-hosted. They're available as CSS variables `--font-cormorant` and `--font-inter`, and as Tailwind classes `font-serif` and `font-sans`.

### Type scale guidelines

- Page titles (Houston, Recipe titles): `clamp(1.9rem, 5vw, 3rem)` — fluid
- Section headings within articles: `1.3–1.7rem`
- Body text: `1.0625rem` (17px), line-height `1.82`
- Metadata / labels: `0.75rem`, `uppercase`, `tracking-widest`
- Never use font-weight above 500 for Cormorant Garamond — it gets muddy

---

## Spacing & Layout

The site uses generous white space. When in doubt, add more space rather than less.

- Max content width: `max-w-3xl` (48rem) for articles, `max-w-6xl` for the Houston guide
- Horizontal padding: `px-5` (20px) consistently across all pages
- Section spacing: `py-12 sm:py-16` for article pages
- Component gaps: `gap-5` to `gap-10` depending on density

**No tight layouts.** If something feels cramped, it probably is.

---

## Photography

Photos are square-cropped across the site — both hero images and inline article photos. This creates visual consistency and prevents the page from being dominated by a single large landscape photo.

- Hero images: `1:1` aspect ratio, max width `340px`, centered
- Inline article images (galleries): square crop, displayed in a responsive grid — 2 columns on desktop, 1 column on mobile
- Photo scroll (homepage): `w-72 sm:w-80`, `h-[420px] sm:h-[460px]`, `rounded-2xl`
- All images: `object-fit: cover` — never stretched or squished

### Photo quality
- Use JPEG for photos, PNG for logos and graphics
- Upload to `public/media/posts/[number]/`
- Keep filenames lowercase with hyphens
- Aim for images under 1MB — Vercel/Next.js will optimize them further

---

## Voice & Writing Tone

The writing is personal, specific, and unperformative. It doesn't try to be a food critic or a lifestyle brand.

- First person, past tense for recipes and restaurant notes
- Opinionated but not declarative — say "I thought" not "this is"
- Short paragraphs. Two or three sentences, then a break.
- No listicle energy in the prose
- Recipes can be slightly dryer and more instructional, but the intro should still sound like you

---

## Components and design decisions to preserve

**Photo scroll (homepage):** The slow horizontal drift of photos on the homepage is intentional. It should feel ambient, not urgent. The current speed (`SPEED = 0.55` in PhotoScroll.tsx) is deliberate — do not increase it.

**"Welcome." heading:** The color-shifting animation cycles through terracotta → amber → tan on a 9-second loop. This is the one animated element on the homepage. Keep it subtle.

**The `recipe-section-snap` behavior:** When a user scrolls to the Ingredients section of a recipe, the page gently scrolls it into view. This resets each time the section is re-entered, creating a deliberate reading rhythm. Preserve this.

**Scroll-reveal on recipe text:** Paragraphs and list items begin at 20% opacity and slide into view as they enter the viewport. The animation resets when the user scrolls back up, so it replays on re-read. This respects `prefers-reduced-motion`.

**Navigation z-index hierarchy:**
- Header bar: `z-[800]` (above Leaflet's max ~700)
- Hamburger dropdown: `z-[810]`
- Search overlay: `z-[9999]`

This order must be maintained if Leaflet or any map library is ever updated.
