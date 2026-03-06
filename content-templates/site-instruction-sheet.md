# Moderate Glutton — Site Instruction Sheet

_Plain-language guide for anyone working on or handing off this site._
_Last updated: March 2026_

---

## What this site is

Moderate Glutton is a personal food blog built with **Next.js 14** (App Router) and deployed on **Vercel**. It lives at `moderateglutton.com`. The code lives on GitHub at `github.com/tripparnold/moderateglutton`, on the `nextjs-rebuild` branch (this is the production branch).

The site has four content areas:
- **Houston** — an interactive map and list of restaurants I've been to
- **Recipes** — things I've made at home
- **Journal** — writing about food, culture, and ideas
- **Travel** — food-focused notes from trips

---

## Where content lives

All written content is in the `content/` folder at the root of the project. Each section has its own subfolder:

```
content/
  houston/       ← Houston restaurant articles (optional longform)
  recipes/       ← Recipe posts
  journal/       ← Journal entries
  travel/        ← Travel posts
```

Each file is a `.md` (Markdown) file with a YAML frontmatter block at the top (between the `---` lines) that holds the metadata (title, date, image path, tags, etc.), followed by the article body in plain Markdown.

**Photos** live in `public/media/posts/[number]/` — each post roughly gets its own numbered folder. The `public/` folder maps to the root of the site, so a file at `public/media/posts/5/photo.jpg` is served at `/media/posts/5/photo.jpg`.

---

## How to add a new recipe or journal post

1. Copy the appropriate template from `content-templates/` (recipe or journal)
2. Fill in the frontmatter fields (title, date, description, heroImage, tags)
3. Write the article body below the closing `---`
4. Save the file to `content/recipes/` or `content/journal/` with a slug-style filename:
   - Use lowercase, hyphens instead of spaces, no special characters
   - Example: `watermelon-lime-sorbet.md`, `thoughts-on-french-cooking.md`
5. Upload any photos to `public/media/posts/[next number]/`
6. The site will pick up the new file automatically on next deploy

**To deploy:** Push the `nextjs-rebuild` branch to GitHub (`git push origin nextjs-rebuild`). Vercel detects the push and deploys automatically within 1–2 minutes.

---

## How to add a restaurant to the Houston Guide

The Houston map is hardcoded in `app/houston/page.tsx` in a `LOCATIONS` array. To add a new restaurant:

1. Fill out the restaurant template in `content-templates/restaurant-template.md`
2. Hand it to Cowork (or add it manually) to the `LOCATIONS` array in `app/houston/page.tsx`
3. Each location needs: `id`, `name`, `address`, `cuisine`, `note`, `lat`, `lng`, `myRating`
4. Optionally add `distinctions` for Michelin or James Beard recognition
5. GPS coordinates: right-click the location in Google Maps → "What's here?" to get lat/lng

---

## How the site renders content

- The `app/` folder is the Next.js application. `app/page.tsx` is the homepage.
- `app/[section]/[slug]/page.tsx` handles all article pages (e.g. `/recipes/watermelon-lime-sorbet`)
- `app/houston/page.tsx` is the Houston Guide page — it overrides the generic `[section]` route
- `components/` holds reusable React components (Nav, Footer, PhotoScroll, etc.)
- `lib/posts.ts` has the functions that read and parse markdown files from `content/`

When Next.js builds the site, it reads every `.md` file and pre-renders each article as a static HTML page. This makes the site extremely fast and there's no database.

---

## Key technical details and gotchas

**Tailwind CSS** — the design system uses custom color tokens (sand, espresso, terracotta, lapis, etc.) defined as CSS custom properties in `app/globals.css`. The `tailwind.config.ts` file maps those token names to the CSS variables. **Do not edit these in two places** — change colors only in the `:root {}` block in `globals.css`.

**Dark mode** — toggling dark mode adds a `.dark` class to the `<html>` element. The `.dark` block in `globals.css` overrides all the CSS variables with dark desert values. This is saved in `localStorage` as `mg-theme`.

**Photos in Next.js** — all images go through Next.js `<Image>` component which optimizes and resizes them. Never put large unoptimized images directly in `<img>` tags inside components. In markdown content, standard `![]()` syntax is fine — those render through standard HTML.

**Fonts** — Cormorant Garamond (headings) and Inter (body) are loaded via `next/font/google` in `app/layout.tsx`. They're self-hosted at build time. Do not add Google Fonts `@import` statements to CSS.

**Email signups** — the `/api/subscribe` route currently writes emails to `data/subscribers.json` in development. This is a placeholder. For production, connect it to a service like Resend, ConvertKit, or Mailchimp via environment variables.

**Search** — the `/api/search` route reads all content files at request time and scores them by keyword match. It auto-discovers all section folders in `content/`. No external search service is needed.

**The `content-templates/` folder** — this folder is at the project root and is completely ignored by Next.js. It's safe to add, edit, or delete files here without affecting the site.

---

## Things to be careful about

- **Never edit files in `.next/`** — this is the build cache and gets wiped on every rebuild
- **Commits go on `nextjs-rebuild`**, not `main`. The `main` branch has old Publii static files and is not the deployed branch.
- **npm install requires network** — in some sandboxed environments, npm installs are blocked. If a package needs to be added, do it from a terminal on your own machine.
- **The Leaflet map loads from a CDN** (unpkg.com). If unpkg is slow or down, the Houston map won't load. Future improvement: bundle Leaflet locally via npm.
- **Image paths are case-sensitive** on Vercel (Linux server). `Photo.jpg` and `photo.jpg` are different files. Keep filenames lowercase.
