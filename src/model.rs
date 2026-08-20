use serde::Deserialize;

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

/// A single table-of-contents entry derived from the article headings.
#[derive(Clone, Debug, PartialEq)]
pub struct TocEntry {
    pub level: u8,
    pub text: String,
    pub id: String,
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
    pub(crate) fn fallback(meta: PostMeta) -> Self {
        RenderedPost {
            meta,
            html: "<p>Failed to load post content.</p>".to_string(),
            toc: Vec::new(),
        }
    }
}
