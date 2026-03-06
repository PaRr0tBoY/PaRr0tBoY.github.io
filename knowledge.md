# Project Knowledge

This is a personal blog built with **Jekyll** and deployed to GitHub Pages.

## Quickstart

- **Dev**: `bundle exec jekyll serve` (runs local server at http://localhost:4000)
- **Build**: `bundle exec jekyll build` (outputs to `_site/`)

## Architecture

- **Root**: Main blog pages
- **`_posts/`**: Blog posts (markdown or HTML)
- **`tools/`**: Standalone HTML tools (not Jekyll posts)
  - `check.html`: 每日备考复盘 - Daily exam preparation review tool
  - `techfeed.html`: THE FEED - Tech news aggregator

## Tech Stack

- **Static Site Generator**: Jekyll
- **Theme**: minima (dark skin)
- **Deployment**: GitHub Pages
- **No Node.js** - Pure Ruby/Jekyll project

## Conventions

- Posts in `_posts/` use naming convention: `YYYY-MM-DD-title.md`
- `tools/` contains standalone pages not processed by Jekyll
- HTML files in root are standalone pages
