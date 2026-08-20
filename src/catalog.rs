use std::collections::BTreeSet;

use crate::model::{CategoryFilter, PostSummary, Slug};

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

    /// Clamp a 1-indexed page number into the valid page range.
    pub fn clamp_page(page: usize, total_pages: usize) -> usize {
        page.clamp(1, total_pages.max(1))
    }

    /// A single page of filtered posts (1-indexed page number).
    pub fn page(
        posts: &[PostSummary],
        filter: &CategoryFilter,
        query: &str,
        page: usize,
        page_size: usize,
    ) -> Vec<PostSummary> {
        let start = page.saturating_sub(1).saturating_mul(page_size);
        Self::filter(posts, filter, query)
            .into_iter()
            .skip(start)
            .take(page_size)
            .cloned()
            .collect()
    }

    /// The first matching post, used as the featured card.
    pub fn featured(
        posts: &[PostSummary],
        filter: &CategoryFilter,
        query: &str,
    ) -> Option<PostSummary> {
        Self::filter(posts, filter, query).into_iter().next().cloned()
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
    fn clamp_page_stays_in_valid_range() {
        assert_eq!(PostCatalog::clamp_page(0, 5), 1);
        assert_eq!(PostCatalog::clamp_page(3, 5), 3);
        assert_eq!(PostCatalog::clamp_page(9, 5), 5);
        assert_eq!(PostCatalog::clamp_page(2, 1), 1);
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
