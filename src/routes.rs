use leptos::prelude::*;

#[cfg(debug_assertions)]
pub const ROUTER_BASE: &str = "";

#[cfg(not(debug_assertions))]
pub const ROUTER_BASE: &str = "/blog";

/// Build an app-routed href, prefixing the router base when set.
pub fn app_href(path: &str) -> String {
    let normalized = if path.starts_with('/') {
        path.to_string()
    } else {
        format!("/{path}")
    };

    if ROUTER_BASE.is_empty() {
        normalized
    } else {
        format!("{ROUTER_BASE}{normalized}")
    }
}

/// Build the route href for a category listing page.
pub fn category_href(category: &str) -> String {
    app_href(&format!("/category/{category}"))
}

/// Build the route href for a single post.
pub fn post_href(slug: &str) -> String {
    app_href(&format!("/post/{slug}"))
}

/// The absolute URL prefix under which content files are served.
pub fn content_root() -> String {
    if ROUTER_BASE.is_empty() {
        return "/public".to_string();
    }

    let pathname = window()
        .location()
        .pathname()
        .unwrap_or_else(|_| "/".to_string());

    if pathname.starts_with(ROUTER_BASE) {
        format!("{ROUTER_BASE}/public")
    } else {
        "/public".to_string()
    }
}
