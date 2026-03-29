mod app;

pub fn run() {
    leptos::mount::mount_to_body(app::App);
}
