# a4d-site

Portfolio, CV and blog, built with Astro and deployed to GitHub Pages.

This folder lives inside the Obsidian vault on purpose: the blog's source of
truth stays in `A4D/Blog`, and the build copies from it.

## Layout

```
src/pages/index.astro       portfolio (the landing page)
src/pages/cv.astro          web CV + PDF downloads
src/pages/blog/             blog index and post pages
src/content/blog/           synced posts - generated, but committed (CI has no vault)
src/styles/global.css       design tokens and all page styles
scripts/sync.mjs            vault -> content collection + CV/PDFs
public/cv/                  CV PDFs served at /cv/<file>.pdf
```

## Publishing a post

1. Write it in `A4D/Blog/drafts/`.
2. When it's ready, move it to `A4D/Blog/published/` and set `status: published`
   (anything still marked `draft` is skipped by the sync, wherever it sits).
3. `npm run build` - or just push; the GitHub Action runs the same steps.

Frontmatter the site needs:

```yaml
---
title: "Fifty pull requests, one staging environment"
date: 2026-09-14
status: published
tags: [cicd, platform-engineering]
description: One line for the blog index and the RSS feed.
---
```

`description` is optional; everything else is required, and a post missing
`title` or `date` is skipped with a message rather than failing the build.

## Before the first deploy

- On GitHub Actions the username comes from the repo owner automatically. For
  local builds, export `GITHUB_USER=<your username>` (otherwise absolute URLs in
  og:image and the RSS feed point at `username.github.io`).
- In the repo: Settings -> Pages -> Source: **GitHub Actions**.
- Refresh the CV exports with `node ../Personal/scripts/build_html_pdf.js`; the
  sync step copies the HTML and the PDFs into `public/cv/` on every build. The
  CV page embeds the HTML export - the markdown is only the manifest.
- `npm install` needs to run once locally; CI installs on its own.

## Obsidian

Add `site` to Settings -> Files and links -> Excluded files so the vault
doesn't index generated content.
