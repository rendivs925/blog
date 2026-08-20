use pulldown_cmark::{html, Options, Parser};
use std::collections::HashMap;

use crate::content::TocEntry;
use crate::routes::content_root;

/// Heading levels supported by the TOC.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum HeadingLevel {
    H1,
    H2,
    H3,
    H4,
    H5,
    H6,
}

impl HeadingLevel {
    fn from_digit(digit: u8) -> Option<Self> {
        match digit {
            1 => Some(HeadingLevel::H1),
            2 => Some(HeadingLevel::H2),
            3 => Some(HeadingLevel::H3),
            4 => Some(HeadingLevel::H4),
            5 => Some(HeadingLevel::H5),
            6 => Some(HeadingLevel::H6),
            _ => None,
        }
    }

    fn as_u8(self) -> u8 {
        match self {
            HeadingLevel::H1 => 1,
            HeadingLevel::H2 => 2,
            HeadingLevel::H3 => 3,
            HeadingLevel::H4 => 4,
            HeadingLevel::H5 => 5,
            HeadingLevel::H6 => 6,
        }
    }

    /// Whether this heading belongs in the table of contents.
    fn in_toc(self) -> bool {
        matches!(self, HeadingLevel::H2 | HeadingLevel::H3 | HeadingLevel::H4 | HeadingLevel::H5 | HeadingLevel::H6)
    }
}

/// Raw arguments parsed from a shortcode invocation.
#[derive(Clone, Debug, Default)]
pub struct ShortcodeArgs {
    pub src: String,
    pub height: Option<String>,
    pub title: Option<String>,
}

/// Strategy for turning a shortcode into rendered HTML.
///
/// Each embed type implements this trait, owning its own source resolution
/// and inner markup (the classic Strategy pattern). The shared `render`
/// method composes the common figure wrapper around each strategy's output.
pub trait ShortcodeRenderer {
    /// HTML class applied to the wrapping `<figure>`.
    fn figure_class(&self) -> &'static str;

    fn default_height(&self) -> Option<&str> {
        None
    }

    /// Resolve the raw `src` argument into the final iframe/asset URL.
    fn resolve(&self, src: &str, resolver: &PathResolver) -> String {
        resolver.resolve_embed(src)
    }

    /// The inner element(s) of the figure, excluding the caption.
    fn inner_html(&self, src: &str, height: Option<&str>, caption: &str) -> String;

    /// Compose the full embed figure from a resolved resource.
    fn render(&self, args: &ShortcodeArgs, resolver: &PathResolver) -> String {
        let src = self.resolve(&args.src, resolver);
        let height = args.height.as_deref().or_else(|| self.default_height());
        let caption = args.title.as_deref().unwrap_or_default();
        let inner = self.inner_html(&src, height, caption);

        format!(
            "<div class=\"embed-holder\"><figure class=\"{}\">{inner}{}</figure></div>",
            self.figure_class(),
            caption_html(caption)
        )
    }
}

/// Common iframe attributes for interactive embeds.
const IFRAME_ALLOW: &str = "fullscreen; pointer-lock; accelerometer; gyroscope";

pub struct SimulationRenderer;
impl ShortcodeRenderer for SimulationRenderer {
    fn figure_class(&self) -> &'static str {
        "embed-sim"
    }
    fn default_height(&self) -> Option<&str> {
        Some("560")
    }
    fn inner_html(&self, src: &str, height: Option<&str>, caption: &str) -> String {
        format!(
            "<iframe src=\"{src}\" height=\"{}\" loading=\"lazy\" allow=\"{IFRAME_ALLOW}\" title=\"{}\"></iframe>",
            height.unwrap_or("560"),
            html_escape(caption)
        )
    }
}

pub struct WasmRenderer;
impl ShortcodeRenderer for WasmRenderer {
    fn figure_class(&self) -> &'static str {
        "embed-wasm"
    }
    fn default_height(&self) -> Option<&str> {
        Some("600")
    }
    fn inner_html(&self, src: &str, height: Option<&str>, caption: &str) -> String {
        format!(
            "<iframe src=\"{src}\" height=\"{}\" loading=\"lazy\" allow=\"{IFRAME_ALLOW}\" title=\"{}\"></iframe>",
            height.unwrap_or("600"),
            html_escape(caption)
        )
    }
}

pub struct VideoRenderer;
impl ShortcodeRenderer for VideoRenderer {
    fn figure_class(&self) -> &'static str {
        "embed-video"
    }
    fn inner_html(&self, src: &str, _height: Option<&str>, _caption: &str) -> String {
        format!("<video controls preload=\"metadata\" src=\"{src}\"></video>")
    }
}

pub struct FigureRenderer;
impl ShortcodeRenderer for FigureRenderer {
    fn figure_class(&self) -> &'static str {
        "figure"
    }
    /// Figures use article-relative paths, resolved by the asset rewriter.
    fn resolve(&self, src: &str, _resolver: &PathResolver) -> String {
        src.to_string()
    }
    fn inner_html(&self, src: &str, _height: Option<&str>, caption: &str) -> String {
        format!(
            "<img src=\"{src}\" alt=\"{}\" loading=\"lazy\" />",
            html_escape(caption)
        )
    }
}

pub struct YoutubeRenderer;
impl ShortcodeRenderer for YoutubeRenderer {
    fn figure_class(&self) -> &'static str {
        "embed-video"
    }
    /// The `src` argument is a video id, never a site-relative path.
    fn resolve(&self, src: &str, _resolver: &PathResolver) -> String {
        src.to_string()
    }
    fn inner_html(&self, src: &str, _height: Option<&str>, caption: &str) -> String {
        format!(
            "<iframe src=\"https://www.youtube-nocookie.com/embed/{src}\" loading=\"lazy\" allow=\"fullscreen; picture-in-picture\" title=\"{}\"></iframe>",
            html_escape(caption)
        )
    }
}

/// A registry of shortcode renderers, keyed by their trigger token.
pub struct ShortcodeEngine {
    renderers: HashMap<&'static str, Box<dyn ShortcodeRenderer>>,
}

impl ShortcodeEngine {
    pub fn new() -> Self {
        let mut engine = ShortcodeEngine {
            renderers: HashMap::new(),
        };
        engine.register("sim", SimulationRenderer);
        engine.register("wasm", WasmRenderer);
        engine.register("video", VideoRenderer);
        engine.register("figure", FigureRenderer);
        engine.register("youtube", YoutubeRenderer);
        engine
    }

    fn register<R: ShortcodeRenderer + 'static>(&mut self, token: &'static str, renderer: R) {
        self.renderers.insert(token, Box::new(renderer));
    }

    /// Expand every shortcode invocation in the markdown body.
    fn expand(&self, markdown: &str, resolver: &PathResolver) -> String {
        let mut out = markdown.to_string();
        for (token, renderer) in &self.renderers {
            out = self.expand_one(&out, token, renderer.as_ref(), resolver);
        }
        out
    }

    fn expand_one(
        &self,
        md: &str,
        token: &str,
        renderer: &dyn ShortcodeRenderer,
        resolver: &PathResolver,
    ) -> String {
        let mut out = String::new();
        let mut rest = md;
        let open_tag = format!("{{{{< {token}");

        while let Some(start) = rest.find(&open_tag) {
            out.push_str(&rest[..start]);
            let after = &rest[start..];
            let Some(end) = after.find(">}}") else {
                out.push_str(after);
                rest = "";
                break;
            };

            let inner = &after[open_tag.len()..end];
            let args = ShortcodeArgs::parse(inner);
            let rendered = renderer.render(&args, resolver);
            out.push_str(&rendered);
            rest = &after[end + 3..];
        }

        out.push_str(rest);
        out
    }
}

impl ShortcodeArgs {
    fn parse(inner: &str) -> Self {
        let mut args = ShortcodeArgs::default();
        let mut rest = inner;

        loop {
            rest = rest.trim_start();
            if rest.is_empty() {
                break;
            }
            let (key, value, next) = parse_key_value(rest);
            match key.as_str() {
                "src" | "id" => args.src = value,
                "height" => args.height = Some(value),
                "title" | "alt" | "caption" => args.title = Some(value),
                _ => {}
            }
            rest = next;
        }

        args
    }
}

/// Resolves relative asset paths against the correct base.
pub struct PathResolver {
    site_root: String,
    base_dir: String,
}

impl PathResolver {
    pub fn new(site_root: String, base_dir: String) -> Self {
        PathResolver { site_root, base_dir }
    }

    /// Resolve a `src` for site-level embeds (simulations, wasm, video)
    /// against the content root.
    pub fn resolve_embed(&self, src: &str) -> String {
        if is_relative_asset(src) {
            format!("{}/{}", self.site_root, src)
        } else {
            src.to_string()
        }
    }

    /// Resolve a relative asset (markdown image / link) against the
    /// article's directory.
    fn resolve_relative(&self, src: &str) -> String {
        if is_relative_asset(src) {
            format!("{}/{}", self.base_dir, src)
        } else {
            src.to_string()
        }
    }

    /// Rewrite relative `src`/`href` attributes in rendered HTML.
    fn rewrite_assets(&self, html: &str) -> String {
        if self.base_dir.is_empty() {
            return html.to_string();
        }
        let mut out = html.to_string();
        for attr in ["src=\"", "src='", "href=\"", "href='"] {
            out = rewrite_attr(&out, attr, self);
        }
        out
    }
}

fn is_relative_asset(value: &str) -> bool {
    let Some(first) = value.chars().next() else {
        return false;
    };
    if first == '/' || first == '#' || first == '?' {
        return false;
    }
    if value.contains("://") || value.starts_with("data:") {
        return false;
    }
    if value.starts_with("mailto:") || value.starts_with("tel:") {
        return false;
    }
    true
}

fn rewrite_attr(html: &str, needle: &str, resolver: &PathResolver) -> String {
    let mut result = String::with_capacity(html.len());
    let mut rest = html;
    while let Some(pos) = rest.find(needle) {
        result.push_str(&rest[..pos + needle.len()]);
        let after = &rest[pos + needle.len()..];
        let end = after
            .find(['"', '\'', '>'])
            .unwrap_or(after.len());
        let value = &after[..end];
        result.push_str(&resolver.resolve_relative(value));
        rest = &after[end..];
    }
    result.push_str(rest);
    result
}

/// The full pipeline: frontmatter strip -> shortcodes -> markdown -> html,
/// plus TOC/heading-id extraction and asset resolution.
pub struct ArticlePipeline;

impl ArticlePipeline {
    pub fn render(markdown: &str, path: &str) -> (String, Vec<TocEntry>) {
        let body = Frontmatter::strip(markdown);
        let body = strip_leading_h1(body);
        let base_dir = Frontmatter::base_dir(path);

        let resolver = PathResolver::new(content_root(), base_dir);
        let engine = ShortcodeEngine::new();
        let expanded = engine.expand(&body, &resolver);

        let mut options = Options::empty();
        options.insert(Options::ENABLE_TABLES);
        options.insert(Options::ENABLE_FOOTNOTES);
        options.insert(Options::ENABLE_STRIKETHROUGH);
        options.insert(Options::ENABLE_TASKLISTS);
        options.insert(Options::ENABLE_HEADING_ATTRIBUTES);
        options.insert(Options::ENABLE_MATH);

        let parser = Parser::new_ext(&expanded, options);
        let mut html_out = String::new();
        html::push_html(&mut html_out, parser);

        let html_out = resolver.rewrite_assets(&html_out);

        // Single pass over the HTML to both build the TOC and inject ids.
        HeadingProcessor::process(&html_out)
    }
}

/// Encapsulates front-matter parsing (--- ... --- block).
struct Frontmatter;

impl Frontmatter {
    /// Strip the front-matter block, returning only the article body.
    fn strip(content: &str) -> &str {
        if !content.starts_with("---\n") {
            return content;
        }

        let mut parts = content.splitn(3, "---\n");
        let _ = parts.next();
        let _ = parts.next();
        parts.next().unwrap_or_default()
    }

    /// Directory the article lives in (relative to the content root).
    fn base_dir(path: &str) -> String {
        match path.rfind('/') {
            Some(idx) => path[..idx].to_string(),
            None => String::new(),
        }
    }
}

/// Remove the leading `# Title` so the page hero owns the title.
fn strip_leading_h1(markdown: &str) -> String {
    let trimmed = markdown.trim_start();
    let Some(stripped) = trimmed.strip_prefix("# ") else {
        return markdown.to_string();
    };
    match stripped.find('\n') {
        Some(end) => stripped[end + 1..].trim_start().to_string(),
        None => String::new(),
    }
}

/// A heading discovered in the rendered HTML, with the location of its
/// opening tag (so ids can be injected) and its closing tag.
struct Heading {
    level: u8,
    text: String,
    /// Byte index of the `<hN` tag in the source HTML.
    open_index: usize,
    /// Byte index of the `>` that closes the opening tag.
    tag_end: usize,
}

/// Builds the table of contents and injects `id` attributes in a single
/// scan, so the HTML is traversed exactly once (DRY + single source).
struct HeadingProcessor;

impl HeadingProcessor {
    fn process(html: &str) -> (String, Vec<TocEntry>) {
        let headings = Self::scan(html);
        let toc = Self::build_toc(&headings);
        let html = Self::inject_ids(html, &headings, &toc);
        (html, toc)
    }

    /// Locate all `<hN>...</hN>` headings and their boundaries.
    fn scan(html: &str) -> Vec<Heading> {
        let mut headings = Vec::new();
        let mut remaining = html;
        // Absolute offset of `remaining[0]` within `html`.
        let mut base = 0usize;

        while let Some(rel_open) = remaining.find("<h") {
            let open = base + rel_open;
            let after_open = &remaining[rel_open + 2..];
            let Some(level_digit) = after_open.chars().next().and_then(|c| c.to_digit(10)) else {
                base += rel_open + 1;
                remaining = &remaining[rel_open + 1..];
                continue;
            };
            let level = level_digit as u8;
            let Some(tag_rel_end) = after_open.find('>') else {
                break;
            };
            // `>` index within `remaining`:
            let tag_end = open + 2 + tag_rel_end;
            let content_start = tag_end + 1;
            let body = &remaining[content_start - base..];
            let Some(close_rel) = body.find("</h") else {
                break;
            };
            let text = strip_html_tags(&body[..close_rel]).trim().to_string();
            let close_end = content_start + close_rel + 4;

            headings.push(Heading {
                level,
                text,
                open_index: open,
                tag_end,
            });

            base = close_end;
            remaining = &html[base..];
        }

        headings
    }

    /// Turn headings into TOC entries, assigning stable ids.
    fn build_toc(headings: &[Heading]) -> Vec<TocEntry> {
        let mut toc = Vec::new();
        let mut counters: HashMap<u8, usize> = HashMap::new();

        for heading in headings {
            let Some(level) = HeadingLevel::from_digit(heading.level) else {
                continue;
            };
            if !level.in_toc() {
                continue;
            }
            let count = counters.entry(heading.level).or_insert(0);
            *count += 1;
            let id = slugify_heading(&heading.text, heading.level, *count);
            toc.push(TocEntry {
                level: level.as_u8(),
                text: heading.text.clone(),
                id,
            });
        }

        toc
    }

    /// Inject `id="..."` into heading opening tags that lack one, matching by
    /// heading text against the TOC ids.
    fn inject_ids(html: &str, headings: &[Heading], toc: &[TocEntry]) -> String {
        let id_by_text: HashMap<&str, &str> =
            toc.iter().map(|e| (e.text.as_str(), e.id.as_str())).collect();

        let mut result = String::with_capacity(html.len());
        let mut cursor = 0usize;

        for heading in headings {
            let open = heading.open_index;
            result.push_str(&html[cursor..open]);
            let tag = &html[open..heading.tag_end + 1];

            if tag.contains("id=") {
                result.push_str(tag);
            } else if let Some(id) = id_by_text.get(heading.text.as_str()) {
                // `<hN` ends at the first space or the closing `>`.
                let name_end = tag.find([' ', '>']).unwrap_or(tag.len());
                result.push_str(&tag[..name_end]);
                result.push_str(&format!(" id=\"{}\"", id));
                result.push_str(&tag[name_end..]);
            } else {
                result.push_str(tag);
            }

            cursor = heading.tag_end + 1;
        }

        result.push_str(&html[cursor..]);
        result
    }
}

fn strip_html_tags(input: &str) -> String {
    let mut out = String::with_capacity(input.len());
    let mut in_tag = false;
    for ch in input.chars() {
        match ch {
            '<' => in_tag = true,
            '>' => in_tag = false,
            _ => {
                if !in_tag {
                    out.push(ch);
                }
            }
        }
    }
    out.trim().to_string()
}

fn slugify_heading(text: &str, level: u8, counter: usize) -> String {
    let mut slug = String::new();
    for ch in text.chars() {
        if ch.is_alphanumeric() {
            slug.push(ch.to_ascii_lowercase());
        } else if ch.is_whitespace() || ch == '-' {
            slug.push('-');
        }
    }
    while slug.contains("--") {
        slug = slug.replace("--", "-");
    }
    let slug = slug.trim_matches('-').to_string();
    if slug.is_empty() {
        format!("section-{level}-{counter}")
    } else {
        slug
    }
}

fn parse_key_value(input: &str) -> (String, String, &str) {
    let trimmed = input.trim_start();
    let eq = trimmed.find('=').unwrap_or(trimmed.len());
    let key = trimmed[..eq].trim().to_string();
    let rest = trimmed[eq + 1..].trim_start();
    if let Some(inner) = rest.strip_prefix('"') {
        match inner.find('"') {
            Some(q) => {
                let value = inner[..q].to_string();
                let remaining = &rest[q + 2..];
                (key, value, remaining)
            }
            None => {
                let value = inner.to_string();
                (key, value, "")
            }
        }
    } else {
        let end = rest.find(char::is_whitespace).unwrap_or(rest.len());
        let value = rest[..end].to_string();
        (key, value, &rest[end..])
    }
}

fn caption_html(caption: &str) -> String {
    if caption.is_empty() {
        String::new()
    } else {
        format!("<figcaption>{}</figcaption>", html_escape(caption))
    }
}

fn html_escape(input: &str) -> String {
    input
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn frontmatter_is_stripped() {
        let md = "---\ntitle: \"Hi\"\n---\n\n## Body\n";
        assert_eq!(Frontmatter::strip(md), "\n## Body\n");
    }

    #[test]
    fn frontmatter_absent_returns_content() {
        let md = "## Body\n";
        assert_eq!(Frontmatter::strip(md), "## Body\n");
    }

    #[test]
    fn leading_h1_is_removed() {
        let md = "# Title\n\n## Section\n";
        assert_eq!(strip_leading_h1(md), "## Section\n");
    }

    #[test]
    fn slugify_produces_stable_lowercase_ids() {
        assert_eq!(slugify_heading("Why Is Space Expanding?", 2, 1), "why-is-space-expanding");
        assert_eq!(slugify_heading("A—B", 2, 2), "ab");
        assert_eq!(slugify_heading("", 3, 1), "section-3-1");
    }

    #[test]
    fn heading_processor_builds_toc_and_injects_ids() {
        let html = "<h1>Title</h1><h2>Section A</h2><p>x</p><h2>Section B</h2>";
        let (out, toc) = HeadingProcessor::process(html);

        assert_eq!(toc.len(), 2);
        assert_eq!(toc[0].text, "Section A");
        assert_eq!(toc[0].id, "section-a");
        assert!(out.contains("<h2 id=\"section-a\">Section A</h2>"));
        assert!(out.contains("<h2 id=\"section-b\">Section B</h2>"));
        // The H1 is not part of the TOC.
        assert!(!out.contains("id=\"title\""));
    }

    #[test]
    fn shortcode_args_parse_quoted_and_plain() {
        let args = ShortcodeArgs::parse(" src=\"vortex/?embed\" height=520 title=\"Sim\" ");
        assert_eq!(args.src, "vortex/?embed");
        assert_eq!(args.height.as_deref(), Some("520"));
        assert_eq!(args.title.as_deref(), Some("Sim"));
    }

    #[test]
    fn sim_resolves_src_against_site_root() {
        let resolver = PathResolver::new("/public".into(), String::new());
        let engine = ShortcodeEngine::new();
        let out = engine.expand("{{< sim src=\"vortex/?embed\" >}}", &resolver);
        assert!(out.contains("src=\"/public/vortex/?embed\""));
    }

    #[test]
    fn wasm_resolves_src_against_site_root() {
        let resolver = PathResolver::new("/blog/public".into(), String::new());
        let engine = ShortcodeEngine::new();
        let out = engine.expand("{{< wasm src=\"simulations/x/\" >}}", &resolver);
        assert!(out.contains("src=\"/blog/public/simulations/x/\""));
    }

    #[test]
    fn youtube_id_is_not_site_rooted() {
        let resolver = PathResolver::new("/public".into(), String::new());
        let engine = ShortcodeEngine::new();
        let out = engine.expand("{{< youtube id=\"dQw4w9WgXcQ\" >}}", &resolver);
        assert!(out.contains("youtube-nocookie.com/embed/dQw4w9WgXcQ"));
        assert!(!out.contains("/public/dQw4w9WgXcQ"));
    }

    #[test]
    fn figure_src_is_left_relative_for_asset_rewriter() {
        let resolver = PathResolver::new("/public".into(), "content/physics".into());
        let engine = ShortcodeEngine::new();
        let out = engine.expand("{{< figure src=\"assets/diagram.png\" caption=\"Diagram\" >}}", &resolver);
        assert!(out.contains("src=\"assets/diagram.png\""));
        assert!(!out.contains("/public/assets/diagram.png"));
    }
}
