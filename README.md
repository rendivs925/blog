# Engineering Notes (Leptos CSR)

A professional, frontend-only publishing site built with Leptos CSR for technical and religious writing, including Islamic content.

The project is designed for long-term maintainability:
- Content is authored in Markdown.
- Articles are served as static files.
- Metadata is indexed at build time.
- The UI loads articles at runtime with clean routes.

## Key Features

- Clean routes with `leptos_router`:
  - `/` all articles
  - `/category/:name` category view
  - `/post/:slug` article detail page
- Full-text style filtering over title, excerpt, category, and tags
- Pagination optimized for large article sets (`12` per page)
- Runtime article cache to avoid repeated markdown parsing
- MathJax support for technical writing

## Project Structure

```text
blog/
├── build.rs                    # Generates public/content-index.json
├── index.html                  # App shell and metadata
├── public/
│   ├── content/                # Markdown articles grouped by category
│   │   ├── rust/
│   │   ├── physics/
│   │   └── general/
│   └── content-index.json      # Auto-generated metadata index
├── scripts/
│   └── new-post.py             # Article scaffold generator
├── src/
│   ├── app.rs                  # Routing, listing, post rendering
│   ├── lib.rs
│   ├── main.rs
│   └── styles.css
└── Trunk.toml
```

## Prerequisites

- Rust (stable)
- `wasm32-unknown-unknown` target
- Trunk

Install once:

```bash
rustup target add wasm32-unknown-unknown
cargo install trunk
```

## Run Locally

```bash
cargo check
trunk serve --open
```

`cargo check` also regenerates `public/content-index.json` through `build.rs`.

## Authoring Workflow

### 1) Create a new article

Use the generator script:

```bash
./scripts/new-post.py "Understanding Ownership in Rust" rust --tags "rust,ownership,memory"
```

This creates a markdown file in `public/content/<category>/` with frontmatter.

### 2) Write content in Markdown

Example frontmatter:

```yaml
---
title: "Understanding Ownership in Rust"
slug: "understanding_ownership_in_rust"
category: "rust"
date: "2026-03-29"
author: "Rendi Virgantara Setiawan"
readTime: "~8 MINUTES"
excerpt: "A practical explanation of ownership, borrowing, and lifetimes in Rust."
tags: ["rust", "ownership", "memory"]
---
```

### 3) Regenerate index and preview

```bash
cargo check
trunk serve
```

## Deployment

This is a static frontend and can be deployed to any static host:
- GitHub Pages
- Cloudflare Pages
- Netlify
- Vercel (static output)

For a production build:

```bash
trunk build --release
```

Deploy the generated `dist/` directory.

### GitHub Pages

This repository is configured as a project site:

- Repo: `rendivs925/blog`
- URL: `https://rendivs925.github.io/blog/`

`Trunk.toml` must use:

```toml
[build]
dist = "dist"
public_url = "/blog/"
```

Add GitHub Pages in repository settings:

1. Go to `Settings > Pages`
2. Set `Source` to `GitHub Actions`

The included workflow will build and deploy the site on every push to `main`.

## Notes

- `target/` and `dist/` are intentionally ignored.
- Keep content in `public/content/` for stable, backend-free publishing.
