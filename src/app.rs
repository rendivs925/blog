use gloo_net::http::Request;
use leptos::prelude::*;
use leptos::task::spawn_local;
use leptos_router::components::{A, Route, Router, Routes};
use leptos_router::hooks::use_params_map;
use leptos_router::path;
use pulldown_cmark::{html, Options, Parser};
use serde::Deserialize;
use std::collections::{BTreeSet, HashMap};

const PAGE_SIZE: usize = 12;

#[derive(Clone, Debug, Deserialize, PartialEq)]
struct PostSummary {
    title: String,
    slug: String,
    category: String,
    date: String,
    excerpt: String,
    author: String,
    read_time: String,
    path: String,
    #[serde(default)]
    tags: Vec<String>,
}

#[derive(Clone, Debug, PartialEq)]
struct RenderedPost {
    title: String,
    category: String,
    date: String,
    author: String,
    read_time: String,
    html: String,
}

#[derive(Clone, Copy)]
struct BlogState {
    posts: RwSignal<Vec<PostSummary>>,
    loading: RwSignal<bool>,
    search_query: RwSignal<String>,
    current_page: RwSignal<usize>,
    post_cache: RwSignal<HashMap<String, RenderedPost>>,
}

#[component]
pub fn App() -> impl IntoView {
    let state = BlogState {
        posts: RwSignal::new(Vec::new()),
        loading: RwSignal::new(true),
        search_query: RwSignal::new(String::new()),
        current_page: RwSignal::new(1),
        post_cache: RwSignal::new(HashMap::new()),
    };

    provide_context(state);

    Effect::new(move |_| {
        spawn_local(async move {
            let loaded = load_index().await.unwrap_or_default();
            state.posts.set(loaded);
            state.loading.set(false);
        });
    });

    view! {
        <Router>
            <div class="app-shell">
                <div class="ambient ambient-left"></div>
                <div class="ambient ambient-right"></div>
                <Routes fallback=|| view! { <main class="home-shell"><p class="loading">"Page not found."</p></main> }>
                    <Route path=path!("") view=HomePage />
                    <Route path=path!("/category/:name") view=CategoryPage />
                    <Route path=path!("/post/:slug") view=PostPage />
                </Routes>
            </div>
        </Router>
    }
}

#[component]
fn HomePage() -> impl IntoView {
    let active_category = Signal::derive(|| "all".to_string());
    view! { <ListingPage active_category /> }
}

#[component]
fn CategoryPage() -> impl IntoView {
    let params = use_params_map();
    let active_category = Signal::derive(move || {
        params
            .read()
            .get("name")
            .filter(|value| !value.is_empty())
            .unwrap_or_else(|| "all".to_string())
    });

    view! { <ListingPage active_category /> }
}

#[component]
fn ListingPage(active_category: Signal<String>) -> impl IntoView {
    let state = expect_context::<BlogState>();

    Effect::new(move |_| {
        let _ = active_category.get();
        let _ = state.search_query.get();
        state.current_page.set(1);
    });

    let categories = Memo::new(move |_| {
        let mut all = BTreeSet::new();
        for post in state.posts.get() {
            all.insert(post.category);
        }
        all.into_iter().collect::<Vec<_>>()
    });

    let filtered_posts = Memo::new(move |_| {
        let query = state.search_query.get().to_ascii_lowercase();

        state
            .posts
            .get()
            .into_iter()
            .filter(|post| {
                let selected = active_category.get();
                selected == "all" || post.category == selected
            })
            .filter(|post| query.is_empty() || post_matches_query(post, &query))
            .collect::<Vec<_>>()
    });

    let total_pages = Memo::new(move |_| {
        let total = filtered_posts.get().len();
        if total == 0 {
            1
        } else {
            total.div_ceil(PAGE_SIZE)
        }
    });

    Effect::new(move |_| {
        let max_page = total_pages.get();
        let current = state.current_page.get();
        if current > max_page {
            state.current_page.set(max_page);
        }
        if current == 0 {
            state.current_page.set(1);
        }
    });

    let paginated_posts = Memo::new(move |_| {
        let page = state.current_page.get().max(1);
        let start = (page - 1) * PAGE_SIZE;
        filtered_posts
            .get()
            .into_iter()
            .skip(start)
            .take(PAGE_SIZE)
            .collect::<Vec<_>>()
    });

    view! {
        <main class="home-shell">
            <header class="home-header">
                <div class="mono eyebrow">"Rendi's Knowledge Archive"</div>
                <h1 class="home-title">"Scalable Markdown Blog"</h1>
                <p class="home-sub">
                    "Built with Leptos CSR. Add markdown files in public/content and publish."
                </p>
            </header>

            <section class="category-bar">
                <A href="/" attr:class=move || if active_category.get() == "all" { "category-btn active" } else { "category-btn" }>
                    "All"
                </A>
                {move || {
                    categories
                        .get()
                        .into_iter()
                        .map(|category| {
                            let href = format!("/category/{category}");
                            let category_for_class = category.clone();
                            view! {
                                <A href=href attr:class=move || if active_category.get() == category_for_class { "category-btn active" } else { "category-btn" }>
                                    {category}
                                </A>
                            }
                        })
                        .collect_view()
                }}
            </section>

            <section class="search-row">
                <input
                    class="search-input"
                    type="search"
                    placeholder="Search title, excerpt, tags..."
                    prop:value=move || state.search_query.get()
                    on:input=move |ev| {
                        state.search_query.set(event_target_value(&ev));
                    }
                />
                <div class="result-count mono">
                    {move || format!("{} result(s)", filtered_posts.get().len())}
                </div>
            </section>

            <Show
                when=move || !state.loading.get()
                fallback=|| view! { <p class="loading">"Loading posts index..."</p> }
            >
                <section class="post-grid">
                    {move || {
                        paginated_posts
                            .get()
                            .into_iter()
                            .map(|post| {
                                let href = format!("/post/{}", post.slug);
                                view! {
                                    <A href=href attr:class="post-card-link">
                                        <article class="post-card">
                                            <div class="mono card-category">{post.category}</div>
                                            <h2>{post.title}</h2>
                                            <p>{post.excerpt}</p>
                                            <div class="card-meta mono">
                                                <span>{post.date}</span>
                                                <span>{post.read_time}</span>
                                            </div>
                                        </article>
                                    </A>
                                }
                            })
                            .collect_view()
                    }}
                </section>

                <Show when=move || filtered_posts.get().is_empty()>
                    <p class="loading">"No posts found for this filter."</p>
                </Show>

                <section class="pagination-row">
                    <button
                        class="page-btn"
                        on:click=move |_| {
                            let current = state.current_page.get();
                            if current > 1 {
                                state.current_page.set(current - 1);
                            }
                        }
                        disabled=move || state.current_page.get() <= 1
                    >
                        "Previous"
                    </button>
                    <span class="mono page-indicator">
                        {move || format!("Page {} / {}", state.current_page.get(), total_pages.get())}
                    </span>
                    <button
                        class="page-btn"
                        on:click=move |_| {
                            let current = state.current_page.get();
                            let max_page = total_pages.get();
                            if current < max_page {
                                state.current_page.set(current + 1);
                            }
                        }
                        disabled=move || state.current_page.get() >= total_pages.get()
                    >
                        "Next"
                    </button>
                </section>
            </Show>
        </main>
    }
}

#[component]
fn PostPage() -> impl IntoView {
    let state = expect_context::<BlogState>();
    let params = use_params_map();
    let slug = Memo::new(move |_| params.read().get("slug").unwrap_or_default());

    let current_post = RwSignal::new(None::<RenderedPost>);
    let is_loading_post = RwSignal::new(true);
    let error = RwSignal::new(None::<String>);

    Effect::new(move |_| {
        let slug = slug.get();

        if slug.is_empty() {
            error.set(Some("Invalid post slug".to_string()));
            is_loading_post.set(false);
            return;
        }

        if state.loading.get() {
            return;
        }

        if let Some(cached) = state.post_cache.get().get(&slug).cloned() {
            current_post.set(Some(cached));
            is_loading_post.set(false);
            setup_post_interactions();
            queue_mathjax_typeset();
            return;
        }

        let summary = state.posts.get().into_iter().find(|post| post.slug == slug);

        match summary {
            Some(post) => {
                is_loading_post.set(true);
                error.set(None);
                let post_path = post.path;
                let cache_key = post.slug;
                let fallback_title = post.title;
                let fallback_category = post.category;
                let fallback_date = post.date;
                let fallback_author = post.author;
                let fallback_read_time = post.read_time;

                spawn_local(async move {
                    let rendered = load_post(&post_path)
                        .await
                        .unwrap_or_else(|| RenderedPost {
                            title: fallback_title,
                            category: fallback_category,
                            date: fallback_date,
                            author: fallback_author,
                            read_time: fallback_read_time,
                            html: "<p>Failed to load post content.</p>".to_string(),
                        });

                    state
                        .post_cache
                        .update(|cache| {
                            cache.insert(cache_key, rendered.clone());
                        });
                    current_post.set(Some(rendered));
                    is_loading_post.set(false);
                    let _ = window().scroll_to_with_x_and_y(0.0, 0.0);
                    setup_post_interactions();
                    queue_mathjax_typeset();
                });
            }
            None => {
                error.set(Some("Post not found".to_string()));
                is_loading_post.set(false);
            }
        }
    });

    view! {
        <article class="post-shell">
            <div id="progress" class="progress-bar"></div>
            <a href="#" id="backToTop" class="back-to-top" title="Back to Top">"↑"</a>
            <A href="/" attr:class="back-btn-link">
                <button class="back-btn">"<- Back to all posts"</button>
            </A>

            <Show
                when=move || !is_loading_post.get()
                fallback=|| view! { <p class="loading">"Loading post..."</p> }
            >
                <Show
                    when=move || error.get().is_none()
                    fallback=move || view! { <p class="loading">{error.get().unwrap_or_else(|| "Unknown error".to_string())}</p> }
                >
                    {move || {
                        current_post.get().map(|post| {
                            view! {
                                <header class="hero">
                                    <div class="mono eyebrow">"Research Paper Access: Level Alpha"</div>
                                    <h1 class="hero-title">{post.title.clone()}</h1>
                                    <p class="hero-sub">"Markdown-powered long-form content"</p>
                                    <div class="hero-meta mono">
                                        <span>{format!("CATEGORY: {}", post.category)}</span>
                                        <span>{format!("DATE: {}", post.date)}</span>
                                        <span>{format!("AUTHOR: {}", post.author)}</span>
                                        <span>{format!("READ TIME: {}", post.read_time)}</span>
                                    </div>
                                </header>
                                <section class="markdown-body" inner_html=post.html></section>
                            }
                        })
                    }}
                </Show>
            </Show>
        </article>
    }
}

fn post_matches_query(post: &PostSummary, query: &str) -> bool {
    let tags = post.tags.join(" ").to_ascii_lowercase();
    post.title.to_ascii_lowercase().contains(query)
        || post.excerpt.to_ascii_lowercase().contains(query)
        || post.category.to_ascii_lowercase().contains(query)
        || tags.contains(query)
}

async fn load_index() -> Option<Vec<PostSummary>> {
    let response = Request::get("/content-index.json").send().await.ok()?;
    response.json::<Vec<PostSummary>>().await.ok()
}

async fn load_post(path: &str) -> Option<RenderedPost> {
    let response = Request::get(&format!("/{path}")).send().await.ok()?;
    let text = response.text().await.ok()?;
    let (meta, body) = parse_frontmatter(&text);
    let html = markdown_to_html(body);

    Some(RenderedPost {
        title: meta
            .get("title")
            .cloned()
            .unwrap_or_else(|| "Untitled".to_string()),
        category: meta
            .get("category")
            .cloned()
            .unwrap_or_else(|| "general".to_string()),
        date: meta
            .get("date")
            .cloned()
            .unwrap_or_else(|| "1970-01-01".to_string()),
        author: meta
            .get("author")
            .cloned()
            .unwrap_or_else(|| "Unknown".to_string()),
        read_time: meta
            .get("readTime")
            .cloned()
            .unwrap_or_else(|| "~5 MINUTES".to_string()),
        html,
    })
}

fn parse_frontmatter(content: &str) -> (HashMap<String, String>, &str) {
    let mut map = HashMap::new();

    if !content.starts_with("---\n") {
        return (map, content);
    }

    let mut parts = content.splitn(3, "---\n");
    let _ = parts.next();
    let frontmatter = parts.next().unwrap_or_default();
    let body = parts.next().unwrap_or_default();

    for line in frontmatter.lines() {
        if let Some((key, value)) = line.split_once(':') {
            map.insert(
                key.trim().to_string(),
                value
                    .trim()
                    .trim_matches('"')
                    .trim_matches('[')
                    .trim_matches(']')
                    .to_string(),
            );
        }
    }

    (map, body)
}

fn markdown_to_html(markdown: &str) -> String {
    let mut options = Options::empty();
    options.insert(Options::ENABLE_TABLES);
    options.insert(Options::ENABLE_FOOTNOTES);
    options.insert(Options::ENABLE_STRIKETHROUGH);
    options.insert(Options::ENABLE_TASKLISTS);
    options.insert(Options::ENABLE_HEADING_ATTRIBUTES);

    let parser = Parser::new_ext(markdown, options);
    let mut output = String::new();
    html::push_html(&mut output, parser);
    output
}

fn window() -> web_sys::Window {
    web_sys::window().expect("window unavailable")
}

fn queue_mathjax_typeset() {
    let script = "if (window.MathJax && window.MathJax.typesetPromise) { window.MathJax.typesetPromise(); }";
    let _ = js_sys::eval(script);
}

fn setup_post_interactions() {
    let script = r#"
setTimeout(() => {
  const progress = document.getElementById('progress');
  const backToTop = document.getElementById('backToTop');
  if (!progress || !backToTop) return;

  const onScroll = () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
    progress.style.width = scrolled + '%';
    if (winScroll > 300) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  };

  backToTop.onclick = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.onscroll = onScroll;
  onScroll();
}, 0);
"#;

    let _ = js_sys::eval(script);
}
