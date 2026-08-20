mod app;
mod content;
mod enhancements;
mod markdown;
mod routes;

pub fn run() {
    leptos::mount::mount_to_body(app::App);
}
