use gloo_net::http::Request;
use leptos::prelude::*;
use leptos::task::spawn_local;
use serde::Deserialize;
use std::collections::{BTreeSet, HashMap};

use crate::markdown::ArticlePipeline;
use crate::routes::content_root;

/// A unique post identifier, typed so it cannot be confused with a raw string.
#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub struct Slug(pub String);

impl Slug {
    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl std::fmt::Display for Slug {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(&self.0)
    }
}

/// A category filter. Encapsulates the "all" sentinel as a typed state.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum CategoryFilter {
    All,
    Named(String),
}

impl CategoryFilter {
    pub fn from_param(param: Option<&str>) -> Self {
        match param {
            Some(value) if !value.is_empty() && value != "all" => {
                CategoryFilter::Named(value.to_string())
            }
            _ => CategoryFilter::All,
        }
    }

    pub fn is_all(&self) -> bool {
        matches!(self, CategoryFilter::All)
    }

    pub fn matches(&self, category: &str) -> bool {
        match self {
            CategoryFilter::All => true,
            CategoryFilter::Named(name) => name == category,
        }
    }
}

/// Metadata summary of a post, as indexed in `content-index.json`.
#[derive(Clone, Debug, Deserialize, PartialEq)]
pub struct PostSummary {
    pub title: String,
    pub slug: String,
    pub category: String,
    pub date: String,
    pub excerpt: String,
    #[serde(default)]
    pub search_text: String,
    pub author: String,
    pub read_time: String,
    pub path: String,
    #[serde(default)]
    pub tags: Vec<String>,
}

impl PostSummary {
    /// Full text used for search matching, derived from the indexed fields.
    fn search_text(&self) -> String {
        if self.search_text.is_empty() {
            format!(
                "{} {} {} {}",
                self.title,
                self.excerpt,
                self.category,
                self.tags.join(" ")
            )
        } else {
            self.search_text.clone()
        }
    }

    pub fn matches_query(&self, query: &str) -> bool {
        if query.is_empty() {
            return true;
        }
        self.search_text().to_ascii_lowercase().contains(query)
    }

    pub fn matches_filter(&self, filter: &CategoryFilter) -> bool {
        filter.matches(&self.category)
    }

    pub fn as_meta(&self) -> PostMeta {
        PostMeta {
            title: self.title.clone(),
            category: self.category.clone(),
            excerpt: self.excerpt.clone(),
            date: self.date.clone(),
            author: self.author.clone(),
            read_time: self.read_time.clone(),
        }
    }
}

/// Article metadata shared between the summary and a rendered post.
#[derive(Clone, Debug, PartialEq)]
pub struct PostMeta {
    pub title: String,
    pub category: String,
    pub excerpt: String,
    pub date: String,
    pub author: String,
    pub read_time: String,
}

/// A fully rendered post ready to display.
#[derive(Clone, Debug, PartialEq)]
pub struct RenderedPost {
    pub meta: PostMeta,
    pub html: String,
    pub toc: Vec<TocEntry>,
}

impl RenderedPost {
    /// The placeholder used when a post body cannot be loaded, so the
    /// surrounding UI still renders with the metadata we have.
    fn fallback(meta: PostMeta) -> Self {
        RenderedPost {
            meta,
            html: "<p>Failed to load post content.</p>".to_string(),
            toc: Vec::new(),
        }
    }
}

/// A single table-of-contents entry derived from the article headings.
#[derive(Clone, Debug, PartialEq)]
pub struct TocEntry {
    pub level: u8,
    pub text: String,
    pub id: String,
}

/// Number of related posts to show alongside an article.
const RELATED_LIMIT: usize = 3;

/// Pure, testable query operations over a set of post summaries.
///
/// Kept free of Leptos reactivity so the logic can be unit-tested and
/// reused by any view (listing, featured, related, pagination).
pub struct PostCatalog;

impl PostCatalog {
    /// The distinct category names, sorted.
    pub fn categories(posts: &[PostSummary]) -> Vec<String> {
        let mut all = BTreeSet::new();
        for post in posts {
            all.insert(post.category.clone());
        }
        all.into_iter().collect()
    }

    /// Posts matching the category filter and (optionally) a search query.
    pub fn filter<'a>(
        posts: &'a [PostSummary],
        filter: &CategoryFilter,
        query: &str,
    ) -> Vec<&'a PostSummary> {
        posts
            .iter()
            .filter(|post| post.matches_filter(filter))
            .filter(|post| post.matches_query(query))
            .collect()
    }

    /// The number of pages required to show `total` items at `page_size`.
    pub fn total_pages(total: usize, page_size: usize) -> usize {
        if total == 0 {
            1
        } else {
            total.div_ceil(page_size)
        }
    }

    /// A single page of filtered posts (1-indexed page number).
    pub fn page<'a>(
        posts: &'a [PostSummary],
        filter: &CategoryFilter,
        query: &str,
        page: usize,
        page_size: usize,
    ) -> Vec<&'a PostSummary> {
        let start = page.saturating_sub(1).saturating_mul(page_size);
        Self::filter(posts, filter, query)
            .into_iter()
            .skip(start)
            .take(page_size)
            .collect()
    }

    /// The first matching post, used as the featured card.
    pub fn featured<'a>(posts: &'a [PostSummary], filter: &CategoryFilter, query: &str) -> Option<&'a PostSummary> {
        Self::filter(posts, filter, query).into_iter().next()
    }

    /// The previous and next posts relative to `current` (by list order).
    pub fn prev_next(posts: &[PostSummary], current: &Slug) -> (Option<PostSummary>, Option<PostSummary>) {
        let idx = posts.iter().position(|p| p.slug == current.as_str());
        let Some(idx) = idx else {
            return (None, None);
        };
        let prev = idx.checked_sub(1).and_then(|i| posts.get(i).cloned());
        let next = posts.get(idx + 1).cloned();
        (prev, next)
    }

    /// Posts sharing the most tags with `current`, excluding `current` itself.
    pub fn related(posts: &[PostSummary], current: &Slug) -> Vec<PostSummary> {
        let current_tags: Vec<String> = posts
            .iter()
            .find(|p| p.slug == current.as_str())
            .map(|p| p.tags.clone())
            .unwrap_or_default();

        let mut scored: Vec<(usize, &PostSummary)> = posts
            .iter()
            .filter(|p| p.slug != current.as_str())
            .map(|p| {
                let overlap = p.tags.iter().filter(|t| current_tags.contains(t)).count();
                (overlap, p)
            })
            .collect();

        scored.sort_by_key(|(score, _)| std::cmp::Reverse(*score));
        scored
            .into_iter()
            .filter(|(score, _)| *score > 0)
            .take(RELATED_LIMIT)
            .map(|(_, p)| p.clone())
            .collect()
    }
}

/// Reactive application state shared down the component tree via context.
#[derive(Clone, Copy)]
pub struct BlogState {
    pub posts: RwSignal<Vec<PostSummary>>,
    pub loading: RwSignal<bool>,
    pub search_query: RwSignal<String>,
    pub current_page: RwSignal<usize>,
    post_cache: RwSignal<HashMap<Slug, RenderedPost>>,
}

impl BlogState {
    pub fn new() -> Self {
        BlogState {
            posts: RwSignal::new(Vec::new()),
            loading: RwSignal::new(true),
            search_query: RwSignal::new(String::new()),
            current_page: RwSignal::new(1),
            post_cache: RwSignal::new(HashMap::new()),
        }
    }

    /// Load the index once at startup.
    pub fn boot(&self) {
        let this = *self;
        Effect::new(move |_| {
            spawn_local(async move {
                match ContentRepository::load_index().await {
                    Ok(posts) => {
                        this.posts.set(posts);
                        this.loading.set(false);
                    }
                    Err(_) => {
                        this.loading.set(false);
                    }
                }
            });
        });
    }

    pub fn categories(&self) -> Memo<Vec<String>> {
        let posts = self.posts;
        Memo::new(move |_| PostCatalog::categories(&posts.get()))
    }

    pub fn cached_post(&self, slug: &Slug) -> Option<RenderedPost> {
        self.post_cache.get().get(slug).cloned()
    }

    pub fn cache_post(&self, slug: &Slug, post: RenderedPost) {
        self.post_cache
            .update(|cache| {
                cache.insert(slug.clone(), post);
            });
    }
}

/// Errors that can occur while fetching content from the network.
#[derive(Clone, Debug, PartialEq)]
pub enum ContentError {
    Network,
}

/// Loads raw content (index + markdown) from the network.
pub struct ContentRepository;

impl ContentRepository {
    pub async fn load_index() -> Result<Vec<PostSummary>, ContentError> {
        let url = format!("{}/content-index.json", content_root());
        let response = Request::get(&url)
            .send()
            .await
            .map_err(|_| ContentError::Network)?;
        response
            .json::<Vec<PostSummary>>()
            .await
            .map_err(|_| ContentError::Network)
    }

    pub async fn load_post(summary: &PostSummary) -> Result<RenderedPost, ContentError> {
        let url = format!("{}/{}", content_root(), summary.path);
        let response = Request::get(&url)
            .send()
            .await
            .map_err(|_| ContentError::Network)?;
        let text = response.text().await.map_err(|_| ContentError::Network)?;

        let meta = summary.as_meta();
        let (html, toc) = ArticlePipeline::render(&text, &summary.path);
        Ok(RenderedPost { meta, html, toc })
    }

    pub async fn load_post_or_fallback(summary: &PostSummary) -> RenderedPost {
        let meta = summary.as_meta();
        Self::load_post(summary)
            .await
            .unwrap_or_else(|_| RenderedPost::fallback(meta))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn post(slug: &str, category: &str, tags: &[&str]) -> PostSummary {
        PostSummary {
            title: slug.to_string(),
            slug: slug.to_string(),
            category: category.to_string(),
            date: "2026-01-01".to_string(),
            excerpt: "excerpt".to_string(),
            search_text: String::new(),
            author: "author".to_string(),
            read_time: "~5 MINUTES".to_string(),
            path: format!("content/{category}/{slug}.md"),
            tags: tags.iter().map(|t| t.to_string()).collect(),
        }
    }

    fn sample() -> Vec<PostSummary> {
        vec![
            post("a", "physics", &["quran", "gravity"]),
            post("b", "physics", &["quran", "vortex"]),
            post("c", "tech", &["rust", "wasm"]),
            post("d", "physics", &["gravity", "vortex"]),
        ]
    }

    #[test]
    fn categories_are_distinct_and_sorted() {
        let cats = PostCatalog::categories(&sample());
        assert_eq!(cats, vec!["physics".to_string(), "tech".to_string()]);
    }

    #[test]
    fn filter_respects_category_and_query() {
        let all = sample();
        let filtered = PostCatalog::filter(&all, &CategoryFilter::Named("physics".into()), "");
        assert_eq!(filtered.len(), 3);

        let queried = PostCatalog::filter(&all, &CategoryFilter::All, "rust");
        assert_eq!(queried.len(), 1);
        assert_eq!(queried[0].slug, "c");
    }

    #[test]
    fn total_pages_rounds_up() {
        assert_eq!(PostCatalog::total_pages(0, 12), 1);
        assert_eq!(PostCatalog::total_pages(12, 12), 1);
        assert_eq!(PostCatalog::total_pages(13, 12), 2);
    }

    #[test]
    fn page_slices_correctly() {
        let all = sample();
        let page1 = PostCatalog::page(&all, &CategoryFilter::All, "", 1, 2);
        assert_eq!(page1.len(), 2);
        let page2 = PostCatalog::page(&all, &CategoryFilter::All, "", 2, 2);
        assert_eq!(page2.len(), 2);
    }

    #[test]
    fn prev_next_orders_around_current() {
        let all = sample();
        let (prev, next) = PostCatalog::prev_next(&all, &Slug("c".into()));
        assert_eq!(prev.map(|p| p.slug), Some("b".to_string()));
        assert_eq!(next.map(|p| p.slug), Some("d".to_string()));
    }

    #[test]
    fn prev_next_missing_slug_yields_none() {
        let (prev, next) = PostCatalog::prev_next(&sample(), &Slug("nope".into()));
        assert!(prev.is_none() && next.is_none());
    }

    #[test]
    fn related_ranks_by_tag_overlap_and_excludes_self() {
        let all = sample();
        let related = PostCatalog::related(&all, &Slug("a".into()));
        let slugs: Vec<String> = related.iter().map(|p| p.slug.clone()).collect();
        assert!(slugs.contains(&"b".to_string())); // shares "quran"
        assert!(slugs.contains(&"d".to_string())); // shares "gravity"
        assert!(!slugs.contains(&"a".to_string()));
    }
}
