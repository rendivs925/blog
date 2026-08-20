use gloo_net::http::Request;

use crate::markdown::ArticlePipeline;
use crate::model::{PostSummary, RenderedPost};
use crate::routes::content_url;

/// Errors that can occur while fetching content from the network.
#[derive(Clone, Debug, PartialEq)]
pub enum ContentError {
    Network,
}

/// Loads raw content (index + markdown) from the network.
pub struct ContentRepository;

impl ContentRepository {
    pub async fn load_index() -> Result<Vec<PostSummary>, ContentError> {
        let response = Request::get(&content_url("content-index.json"))
            .send()
            .await
            .map_err(|_| ContentError::Network)?;
        response
            .json::<Vec<PostSummary>>()
            .await
            .map_err(|_| ContentError::Network)
    }

    pub async fn load_post(summary: &PostSummary) -> Result<RenderedPost, ContentError> {
        let response = Request::get(&content_url(&summary.path))
            .send()
            .await
            .map_err(|_| ContentError::Network)?;
        let text = response.text().await.map_err(|_| ContentError::Network)?;

        let meta = summary.as_meta();
        let (html, toc) = ArticlePipeline::render(&text, &summary.path);
        Ok(RenderedPost { meta, html, toc })
    }

    /// Load a post, degrading gracefully to a metadata-only render on failure.
    pub async fn load_post_or_fallback(summary: &PostSummary) -> RenderedPost {
        let meta = summary.as_meta();
        Self::load_post(summary)
            .await
            .unwrap_or_else(|_| RenderedPost::fallback(meta))
    }
}
