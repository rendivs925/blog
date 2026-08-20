mod app;
mod catalog;
mod enhancements;
mod markdown;
mod model;
mod repository;
mod routes;
mod state;

pub fn run() {
    leptos::mount::mount_to_body(app::App);
}
