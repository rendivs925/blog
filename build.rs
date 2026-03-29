use serde::Serialize;
use std::fs;
use std::path::{Path, PathBuf};
use walkdir::WalkDir;

#[derive(Serialize)]
struct PostSummary {
    title: String,
    slug: String,
    category: String,
    date: String,
    excerpt: String,
    author: String,
    read_time: String,
    path: String,
    tags: Vec<String>,
}

fn main() {
    let content_root = Path::new("public/content");

    println!("cargo:rerun-if-changed=public/content");

    if !content_root.exists() {
        return;
    }

    let mut posts = Vec::<PostSummary>::new();

    for entry in WalkDir::new(content_root)
        .into_iter()
        .filter_map(Result::ok)
        .filter(|entry| entry.file_type().is_file())
    {
        let file_path = entry.path();
        if file_path.extension().and_then(|ext| ext.to_str()) != Some("md") {
            continue;
        }

        let rel_path = file_path
            .strip_prefix("public")
            .unwrap_or(file_path)
            .to_string_lossy()
            .replace('\\', "/");

        let content = match fs::read_to_string(file_path) {
            Ok(content) => content,
            Err(_) => continue,
        };

        let (meta, body) = parse_frontmatter(&content);
        let slug = meta
            .get("slug")
            .cloned()
            .unwrap_or_else(|| file_stem(file_path));

        let category = meta
            .get("category")
            .cloned()
            .unwrap_or_else(|| infer_category(file_path));

        let title = meta
            .get("title")
            .cloned()
            .unwrap_or_else(|| title_from_slug(&slug));

        let excerpt = meta
            .get("excerpt")
            .cloned()
            .unwrap_or_else(|| make_excerpt(body, 180));

        let tags = meta
            .get("tags")
            .map(|tags| {
                tags.split(',')
                    .map(|tag| tag.trim().trim_matches('"').to_string())
                    .filter(|tag| !tag.is_empty())
                    .collect::<Vec<_>>()
            })
            .unwrap_or_default();

        posts.push(PostSummary {
            title,
            slug,
            category,
            date: meta
                .get("date")
                .cloned()
                .unwrap_or_else(|| "1970-01-01".to_string()),
            excerpt,
            author: meta
                .get("author")
                .cloned()
                .unwrap_or_else(|| "Unknown".to_string()),
            read_time: meta
                .get("readTime")
                .or_else(|| meta.get("read_time"))
                .cloned()
                .unwrap_or_else(|| "~5 MINUTES".to_string()),
            path: rel_path,
            tags,
        });
    }

    posts.sort_by(|a, b| b.date.cmp(&a.date));

    let out_path = PathBuf::from("public/content-index.json");
    if let Ok(json) = serde_json::to_string_pretty(&posts) {
        let _ = fs::write(out_path, json);
    }
}

fn parse_frontmatter(content: &str) -> (std::collections::HashMap<String, String>, &str) {
    let mut map = std::collections::HashMap::new();

    if !content.starts_with("---\n") {
        return (map, content);
    }

    let mut parts = content.splitn(3, "---\n");
    let _ = parts.next();
    let frontmatter = parts.next().unwrap_or_default();
    let body = parts.next().unwrap_or_default();

    for line in frontmatter.lines() {
        if let Some((key, value)) = line.split_once(':') {
            let cleaned = value
                .trim()
                .trim_matches('"')
                .trim_matches('[')
                .trim_matches(']');
            map.insert(key.trim().to_string(), cleaned.to_string());
        }
    }

    (map, body)
}

fn infer_category(path: &Path) -> String {
    path.parent()
        .and_then(|parent| parent.file_name())
        .and_then(|name| name.to_str())
        .unwrap_or("general")
        .to_string()
}

fn file_stem(path: &Path) -> String {
    path.file_stem()
        .and_then(|name| name.to_str())
        .unwrap_or("untitled")
        .to_string()
}

fn title_from_slug(slug: &str) -> String {
    slug.split('-')
        .map(|segment| {
            let mut chars = segment.chars();
            match chars.next() {
                Some(first) => {
                    let mut out = String::new();
                    out.push(first.to_ascii_uppercase());
                    out.push_str(chars.as_str());
                    out
                }
                None => String::new(),
            }
        })
        .collect::<Vec<_>>()
        .join(" ")
}

fn make_excerpt(content: &str, max_len: usize) -> String {
    let normalized = content.replace('\n', " ").replace("  ", " ");
    let trimmed = normalized.trim();
    if trimmed.len() <= max_len {
        trimmed.to_string()
    } else {
        format!("{}...", &trimmed[..max_len])
    }
}
