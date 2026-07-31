---
version: 1
slug: "blog-src-pages-index-astro"
primary_target: "_blog/src/pages/index.astro"
related_targets: ["_blog/src/layouts/Layout.astro","_blog/src/components/Header.astro"]
---

# Surface brief — Blog (`_blog/`)

## Scope and mode

The blog (AstroPaper under `/blog/`). Mode: **Read** — comprehension and
wayfinding outrank expression; brand lives in the material and the mono
marginalia.

## Audience, job, action

Visitors come from the homepage or the web to read writing, find a specific
post, or scan what exists. Success: a reader lands, recognizes the same paper
world as the homepage, scans the index rows, opens an article, and reads
comfortably in a 16px/1.8 column. Search, tags, archives, and RSS must stay
one gesture away.

## Constraints

- Keep all AstroPaper content, routes, i18n (en/zh-CN), view transitions,
  pagefind search, RSS, and OG generation working.
- Preserve the copy as-is (including the template hero text) — the redesign
  is visual, not editorial.
- Honor the v7 design language verbatim: warm-gray paper, dot-matrix ground +
  0.035 noise, matte 1px-bordered surfaces, Verdigris accent (dark default,
  light supported), Plex/Noto type, mono labels, dashed-underline links,
  no glass, no pure black/white, `prefers-reduced-motion` respected.

## Chosen direction

The committed v7 world applied to a Read surface (established world — no new
visual world). Floating matte navbar (brand mark + mono title + nav + icon
controls, hides on scroll down); hero band with mono kicker, display title,
RSS primary action; index rows with mono date marginalia under hairline
section rules; article with a mono dateline, dashed tags, matte prev/next
cards, and a conic-progress back-to-top.

## Memorable moment

The navbar is a paper card floating in whitespace that hides when you scroll
down and returns when you scroll up — the same tactile motion as the
homepage, keeping the blog part of one system.

## Notes

- IBM Plex Sans SC was delisted from Google Fonts (the homepage's `@import`
  for it now 400s). The blog uses **Noto Sans SC** (the standard zh-CN face)
  for the sans role and IBM Plex Mono for mono.
- Hero copy ("Mingalaba", the AstroPaper intro) is template content; left
  untouched per the visual-only scope.
- Homepage `index.html` still imports the dead IBM Plex Sans SC URL — flag
  for a follow-up outside this surface.
