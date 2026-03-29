---
title: "Leptos CSR Blog Setup"
slug: "leptos_csr_blog_setup"
category: "rust"
date: "2026-03-29"
author: "Rendi Virgantara Setiawan"
readTime: "~8 MINUTES"
excerpt: "How to build a markdown-powered blog frontend with Leptos CSR and static content assets."
tags: ["rust", "leptos", "frontend"]
---

# Leptos CSR Blog Setup

This blog is intentionally **frontend-only** and designed for long-term maintainability.

## Why this architecture scales

- Content lives in markdown files under `public/content/`
- The app loads `content-index.json` and post markdown at runtime
- Adding a post means adding one `.md` file and deploying static assets

## Category strategy

Use one folder per category:

- `public/content/rust/`
- `public/content/physics/`
- `public/content/general/`

This keeps content searchable and easy to maintain over years.
