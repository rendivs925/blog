use leptos::prelude::*;
use leptos::task::spawn_local;
use leptos_router::components::{A, Route, Router, Routes};
use leptos_router::hooks::use_params_map;
use leptos_router::path;

use crate::catalog::PostCatalog;
use crate::enhancements::run_post_enhancements;
use crate::model::{CategoryFilter, PostSummary, RenderedPost, Slug};
use crate::repository::ContentRepository;
use crate::routes::{app_href, category_href, post_href, ROUTER_BASE};
use crate::state::BlogState;

const PAGE_SIZE: usize = 12;

#[component]
pub fn App() -> impl IntoView {
    let state = BlogState::new();
    provide_context(state);
    state.boot();

    view! {
        <Router base=ROUTER_BASE>
            <div class="app-shell">
                <div class="ambient ambient-left"></div>
                <div class="ambient ambient-right"></div>
                <TopNav />
                <Routes fallback=|| view! { <main class="home-shell"><p class="loading">"Page not found."</p></main> }>
                    <Route path=path!("") view=HomePage />
                    <Route path=path!("/category/:name") view=CategoryPage />
                    <Route path=path!("/post/:slug") view=PostPage />
                </Routes>
                <SiteFooter />
            </div>
        </Router>
    }
}

#[component]
fn TopNav() -> impl IntoView {
    let state = expect_context::<BlogState>();
    let categories = state.categories();

    view! {
        <header class="topnav">
            <div class="topnav-inner">
                <A href=app_href("/") attr:class="brand" attr:aria-label="The Frontier Lab home">
                    <span class="brand-word">"The Frontier Lab"</span>
                </A>
                <nav class="topnav-links" attr:aria-label="Primary">
                    <A href=app_href("/") attr:class="topnav-link">"Articles"</A>
                    <CategoryLinks
                        categories=categories
                        list_class="topnav-cats"
                        item_class="topnav-cat-link"
                        label=Some("Fields")
                    />
                </nav>
                <a class="topnav-search" href="#search" attr:aria-label="Search">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </a>
            </div>
        </header>
    }
}

/// A labelled list of category links, reused in the top nav and footer.
#[component]
fn CategoryLinks(
    categories: Memo<Vec<String>>,
    list_class: &'static str,
    item_class: &'static str,
    label: Option<&'static str>,
) -> impl IntoView {
    let list = move || {
        categories
            .get()
            .into_iter()
            .map(|category| {
                let href = category_href(&category);
                view! { <A href=href attr:class=item_class>{category}</A> }
            })
            .collect_view()
    };

    view! {
        <div class=list_class>
            {label.map(|l| view! { <span class="topnav-cat-label">{l}</span> })}
            {list}
        </div>
    }
}

#[component]
fn SiteFooter() -> impl IntoView {
    let state = expect_context::<BlogState>();
    let categories = state.categories();

    view! {
        <footer class="site-footer">
            <div class="footer-inner">
                <div class="footer-col footer-mission">
                    <div class="brand footer-brand">
                        <span class="brand-word">"The Frontier Lab"</span>
                    </div>
                    <p>
                        "Deep research and writing on deep tech, frontier physics, UFO/UAP research, speculative science, and the edges of human knowledge. Today's science fiction is simply tomorrow's engineering."
                    </p>
                </div>
                <div class="footer-col">
                    <h4>"Fields"</h4>
                    <ul>
                        {move || {
                            categories
                                .get()
                                .into_iter()
                                .map(|category| {
                                    let href = category_href(&category);
                                    view! { <li><A href=href>{category}</A></li> }
                                })
                                .collect_view()
                        }}
                    </ul>
                </div>
                <div class="footer-col">
                    <h4>"Explore"</h4>
                    <ul>
                        <li><A href=app_href("/")>"All articles"</A></li>
                    </ul>
                </div>
            </div>
            <div class="footer-base">
                <span class="mono">"© 2026 The Frontier Lab"</span>
            </div>
        </footer>
    }
}

#[component]
fn HomePage() -> impl IntoView {
    let active_category = Signal::derive(move || CategoryFilter::All);
    view! { <ListingPage active_category /> }
}

#[component]
fn CategoryPage() -> impl IntoView {
    let params = use_params_map();
    let active_category = Signal::derive(move || {
        CategoryFilter::from_param(params.read().get("name").as_deref())
    });

    view! { <ListingPage active_category /> }
}

/// Presentation variant for a post card, controlling density and styling.
#[derive(Clone, Copy, PartialEq, Eq)]
enum CardVariant {
    /// A standard grid card — shows up to three tags.
    Default,
    /// The large featured card on the home listing — shows all tags.
    Featured,
}

impl CardVariant {
    fn class(self) -> &'static str {
        match self {
            CardVariant::Default => "post-card",
            CardVariant::Featured => "post-card featured",
        }
    }

    /// Which tags to show for this card density.
    fn visible_tags(self, tags: &[String]) -> Vec<String> {
        match self {
            CardVariant::Default => tags.iter().take(3).cloned().collect(),
            CardVariant::Featured => tags.to_vec(),
        }
    }
}

/// A card summarising a post, reused across listing, featured and related
/// sections — DRY for the three card flavours.
#[component]
fn PostCard(post: PostSummary, variant: CardVariant) -> impl IntoView {
    let href = post_href(&post.slug);
    let tags: Vec<String> = variant.visible_tags(&post.tags);
    let has_tags = !tags.is_empty();

    view! {
        <A href=href attr:class="post-card-link">
            <article class=variant.class()>
                <div class="card-chip">{post.category.clone()}</div>
                <h2>{post.title.clone()}</h2>
                <p>{post.excerpt.clone()}</p>
                <Show when=move || has_tags>
                    <div class="card-tags">
                        {tags.iter().map(|tag| view! { <span class="tag-chip">{tag.clone()}</span> }).collect_view()}
                    </div>
                </Show>
                <div class="card-meta">
                    <span>{post.date.clone()}</span>
                    <span>{post.read_time.clone()}</span>
                </div>
            </article>
        </A>
    }
}

#[component]
fn ListingPage(active_category: Signal<CategoryFilter>) -> impl IntoView {
    let state = expect_context::<BlogState>();

    Effect::new(move |_| {
        let _ = active_category.get();
        let _ = state.search_query.get();
        state.current_page.set(1);
    });

    let categories = state.categories();

    let filtered_count = Memo::new(move |_| {
        let query = state.search_query.get();
        let filter = active_category.get();
        let posts = state.posts.get();
        PostCatalog::filter(&posts, &filter, &query).len()
    });

    let total_pages = Memo::new(move |_| {
        let total = filtered_count.get();
        PostCatalog::total_pages(total, PAGE_SIZE)
    });

    Effect::new(move |_| {
        let current = state.current_page.get();
        let clamped = PostCatalog::clamp_page(current, total_pages.get());
        if clamped != current {
            state.current_page.set(clamped);
        }
    });

    let featured_post = Memo::new(move |_| {
        let query = state.search_query.get();
        let filter = active_category.get();
        let posts = state.posts.get();
        PostCatalog::featured(&posts, &filter, &query)
    });
    let show_featured = Memo::new(move |_| {
        active_category.get().is_all() && state.search_query.get().is_empty()
    });

    let paginated_posts = Memo::new(move |_| {
        let query = state.search_query.get();
        let filter = active_category.get();
        let page = state.current_page.get();
        let posts = state.posts.get();
        // The featured card already shows the newest post on the landing
        // view, so exclude it from the grid to avoid a duplicate entry.
        let exclude = if show_featured.get() {
            featured_post.get().map(|p| p.slug)
        } else {
            None
        };
        PostCatalog::page(&posts, &filter, &query, page, PAGE_SIZE)
            .into_iter()
            .filter(|post| exclude.as_ref() != Some(&post.slug))
            .collect::<Vec<_>>()
    });

    let can_go_previous = Memo::new(move |_| state.current_page.get() > 1);
    let can_go_next = Memo::new(move |_| state.current_page.get() < total_pages.get());

    view! {
        <main class="home-shell">
            <section class="home-hero">
                <span class="kicker">"The Frontier Lab"</span>
                <h1 class="home-title">"Deep Research, Tech & Physics"</h1>
                <p class="home-tagline">"Today's science fiction is simply tomorrow's engineering."</p>
                <p class="home-sub">
                    "Exploring deep tech, frontier physics, UFO/UAP research, speculative science, and the edges of human knowledge."
                </p>
            </section>

            <section class="category-bar" attr:aria-label="Filter by field">
                <A href=app_href("/") attr:class=move || category_class(active_category.get().is_all())>
                    "All"
                </A>
                {move || {
                    categories
                        .get()
                        .into_iter()
                        .map(|category| {
                            let href = category_href(&category);
                            let cat = category.clone();
                            view! {
                                <A href=href attr:class=move || {
                                    let is_active = matches!(active_category.get(), CategoryFilter::Named(name) if name == cat);
                                    category_class(is_active)
                                }>
                                    {category}
                                </A>
                            }
                        })
                        .collect_view()
                }}
            </section>

            <section class="search-row" id="search">
                <input
                    class="search-input"
                    type="search"
                    placeholder="Search by title, abstract, field, or tag"
                    prop:value=move || state.search_query.get()
                    on:input=move |ev| {
                        state.search_query.set(event_target_value(&ev));
                    }
                />
                <div class="result-count">
                    {move || format!("{} result(s)", filtered_count.get())}
                </div>
            </section>

            <Show
                when=move || !state.loading.get()
                fallback=|| view! { <p class="loading">"Loading article index..."</p> }
            >
                <Show when=move || show_featured.get() && featured_post.get().is_some()>
                    <section class="featured-section">
                        <h2 class="section-label">"Latest"</h2>
                        {move || featured_post.get().map(|post| view! { <PostCard post variant=CardVariant::Featured /> })}
                    </section>
                </Show>

                <section class="post-grid">
                    {move || {
                        paginated_posts
                            .get()
                            .into_iter()
                            .map(|post| view! { <PostCard post variant=CardVariant::Default /> })
                            .collect_view()
                    }}
                </section>

                <Show when=move || filtered_count.get() == 0>
                    <p class="loading">"No articles match your current filters."</p>
                </Show>

                <section class="pagination-row">
                    <button
                        class="page-btn"
                        on:click=move |_| {
                            if can_go_previous.get() {
                                let current = state.current_page.get();
                                state.current_page.set(current - 1);
                            }
                        }
                        disabled=move || !can_go_previous.get()
                    >
                        "Previous"
                    </button>
                    <span class="page-indicator">
                        {move || format!("Page {} / {}", state.current_page.get(), total_pages.get())}
                    </span>
                    <button
                        class="page-btn"
                        on:click=move |_| {
                            if can_go_next.get() {
                                let current = state.current_page.get();
                                state.current_page.set(current + 1);
                            }
                        }
                        disabled=move || !can_go_next.get()
                    >
                        "Next"
                    </button>
                </section>
            </Show>
        </main>
    }
}

fn category_class(is_active: bool) -> &'static str {
    if is_active {
        "category-btn active"
    } else {
        "category-btn"
    }
}

/// Why a single post could not be shown.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
enum PostError {
    InvalidSlug,
    NotFound,
}

impl PostError {
    fn message(self) -> &'static str {
        match self {
            PostError::InvalidSlug => "Invalid post slug",
            PostError::NotFound => "Post not found",
        }
    }
}

#[derive(Clone, Debug)]
enum PostLoad {
    Loading,
    Ready(RenderedPost),
    Failed(PostError),
}

#[component]
fn PostPage() -> impl IntoView {
    let state = expect_context::<BlogState>();
    let params = use_params_map();
    let slug = Memo::new(move |_| Slug(params.read().get("slug").unwrap_or_default()));

    let status = RwSignal::new(PostLoad::Loading);

    Effect::new(move |_| {
        let slug = slug.get();

        // Guard clause: nothing to load.
        if slug.as_str().is_empty() {
            status.set(PostLoad::Failed(PostError::InvalidSlug));
            return;
        }

        // Guard clause: index still loading.
        if state.loading.get() {
            return;
        }

        // Cache hit path.
        if let Some(cached) = state.cached_post(&slug) {
            status.set(PostLoad::Ready(cached));
            run_post_enhancements();
            return;
        }

        // Guard clause: post does not exist.
        let Some(summary) = state.posts.get().into_iter().find(|p| p.slug == slug.as_str()) else {
            status.set(PostLoad::Failed(PostError::NotFound));
            return;
        };

        status.set(PostLoad::Loading);
        spawn_local(async move {
            let rendered = ContentRepository::load_post_or_fallback(&summary).await;
            state.cache_post(&slug, rendered.clone());
            status.set(PostLoad::Ready(rendered));
            window().scroll_to_with_x_and_y(0.0, 0.0);
            run_post_enhancements();
        });
    });

    let prev_next = Memo::new(move |_| {
        let all = state.posts.get();
        PostCatalog::prev_next(&all, &slug.get())
    });

    let related = Memo::new(move |_| {
        let all = state.posts.get();
        PostCatalog::related(&all, &slug.get())
    });

    view! {
        <article class="post-shell">
            <div id="progress" class="progress-bar"></div>
            <a href="#" id="backToTop" class="back-to-top" title="Back to Top" attr:aria-label="Back to top">"↑"</a>
            <div class="post-topbar">
                <A href=app_href("/") attr:class="back-btn-link">
                    <span class="back-btn">"← Back to all articles"</span>
                </A>
            </div>

            {move || match status.get() {
                PostLoad::Loading => view! { <p class="loading">"Loading article..."</p> }.into_any(),
                PostLoad::Failed(err) => view! { <p class="loading">{err.message()}</p> }.into_any(),
                PostLoad::Ready(post) => {
                    let prev = prev_next.get().0;
                    let next = prev_next.get().1;
                    let related_list = related.get();
                    view! {
                        <PostView post related_list prev next />
                    }
                    .into_any()
                }
            }}
        </article>
    }
}

#[component]
fn PostView(
    post: RenderedPost,
    related_list: Vec<PostSummary>,
    prev: Option<PostSummary>,
    next: Option<PostSummary>,
) -> impl IntoView {
    let has_toc = !post.toc.is_empty();
    let has_related = !related_list.is_empty();

    view! {
        <header class="hero">
            <div class="card-chip">{post.meta.category.clone()}</div>
            <h1 class="hero-title">{post.meta.title.clone()}</h1>
            <p class="hero-sub">{post.meta.excerpt.clone()}</p>
            <div class="hero-meta">
                <span>{post.meta.author.clone()}</span>
                <span class="meta-sep">"·"</span>
                <span>{post.meta.date.clone()}</span>
                <span class="meta-sep">"·"</span>
                <span>{post.meta.read_time.clone()}</span>
            </div>
        </header>

        <div class="post-layout">
            <Show when=move || has_toc>
                <nav class="toc" id="toc" attr:aria-label="Table of contents">
                    <h4 class="toc-title">"Contents"</h4>
                    <ul>
                        {post.toc.iter().map(|entry| {
                            let id = entry.id.clone();
                            let level = entry.level;
                            view! {
                                <li class=format!("toc-level-{}", level)>
                                    <a href={format!("#{}", id)}>{entry.text.clone()}</a>
                                </li>
                            }
                        }).collect_view()}
                    </ul>
                </nav>
            </Show>
            <section class="markdown-body" id="article-body" inner_html=post.html></section>
        </div>

        <Show when=move || has_related>
            <section class="related-section">
                <h2 class="section-label">"Related reading"</h2>
                <div class="related-grid">
                    {related_list.iter().cloned().map(|p| view! { <PostCard post=p variant=CardVariant::Default /> }).collect_view()}
                </div>
            </section>
        </Show>

        <nav class="post-nav" attr:aria-label="Post navigation">
            {prev.map(|p| {
                let href = post_href(&p.slug);
                view! {
                    <A href=href attr:class="post-nav-card post-nav-prev">
                        <span class="post-nav-label">"← Previous"</span>
                        <span class="post-nav-title">{p.title}</span>
                    </A>
                }
            })}
            {next.map(|p| {
                let href = post_href(&p.slug);
                view! {
                    <A href=href attr:class="post-nav-card post-nav-next">
                        <span class="post-nav-label">"Next →"</span>
                        <span class="post-nav-title">{p.title}</span>
                    </A>
                }
            })}
        </nav>
    }
}

