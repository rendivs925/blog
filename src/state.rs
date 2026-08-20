use leptos::prelude::*;
use leptos::task::spawn_local;
use std::collections::HashMap;

use crate::catalog::PostCatalog;
use crate::model::{PostSummary, RenderedPost, Slug};
use crate::repository::ContentRepository;

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
