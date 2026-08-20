#!/usr/bin/env python3

import argparse
import datetime as dt
import re
from pathlib import Path


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9\s-]", "", value)
    value = re.sub(r"[\s_-]+", "_", value)
    return value.strip("_")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Create a markdown blog post scaffold."
    )
    parser.add_argument("title", help="Post title")
    parser.add_argument("category", help="Category folder, e.g. rust or physics")
    parser.add_argument(
        "--author", default="Rendi Virgantara Setiawan", help="Author name"
    )
    parser.add_argument("--tags", default="", help="Comma-separated tags")
    parser.add_argument(
        "--excerpt", default="Write a short summary.", help="Card excerpt"
    )
    args = parser.parse_args()

    slug = slugify(args.title)
    category = slugify(args.category)
    date = dt.date.today().isoformat()

    repo_root = Path(__file__).resolve().parents[1]
    target_dir = repo_root / "public" / "content" / category
    target_dir.mkdir(parents=True, exist_ok=True)
    target_file = target_dir / f"{slug}.md"

    if target_file.exists():
        print(f"Error: {target_file} already exists")
        return 1

    tags = [slugify(tag) for tag in args.tags.split(",") if tag.strip()]
    tags_line = ", ".join(f'"{tag}"' for tag in tags)

    content = f"""---
title: \"{args.title}\"
slug: \"{slug}\"
category: \"{category}\"
date: \"{date}\"
author: \"{args.author}\"
readTime: \"~5 MINUTES\"
excerpt: \"{args.excerpt}\"
tags: [{tags_line}]
---

## Introduction

Write your article here. Use `##` for section headings; the page hero shows the title.

## Embeds

Embed simulations, WebAssembly apps, video, figures, and YouTube:

```text
{{{{< sim src="vortex-simulator/?embed" height="560" title="Vortex simulation" >}}}}
{{{{< wasm src="simulations/plasma-crystal/" height="600" title="Plasma crystal" >}}}}
{{{{< video src="assets/demo.mp4" title="Demo video" >}}}}
{{{{< figure src="assets/diagram.png" caption="Schematic diagram" >}}}}
{{{{< youtube id="dQw4w9WgXcQ" title="Reference" >}}}}
```

See EMBEDS.md for the full reference.
"""

    target_file.write_text(content, encoding="utf-8")
    print(f"Created: {target_file.relative_to(repo_root)}")
    print("Next: run `cargo check` to regenerate public/content-index.json")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
