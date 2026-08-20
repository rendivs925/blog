# Embedding media in articles

The Frontier Lab supports rich embeds inside Markdown articles via **shortcodes** and
**raw HTML**. Both are rendered lazily and styled consistently by the design system.

## Shortcodes

Shortcodes are `{{< type key="value" >}}` blocks written on their own line.
They expand to a styled `<figure>` with an optional caption.

| Shortcode | Purpose | Keys |
|-----------|---------|------|
| `sim`     | Interactive JS simulation (Three.js, vortex-simulator, standalone page) | `src`, `height`, `title` |
| `wasm`    | Compiled WebAssembly / Bevy app (single-threaded build) | `src`, `height`, `title` |
| `video`   | Local `<video>` clip | `src`, `title` |
| `figure`  | Image with caption | `src`, `caption` (used as alt too) |
| `youtube` | YouTube embed | `id`, `title` |

### Interactive simulation

```text
{{< sim src="vortex-simulator/?embed" height="520" title="Vortex engine — interactive simulation" >}}
```

`src` is resolved relative to the site root (`public/...`), so it can point at any
standalone page shipped in `public/`.

### WebAssembly / Bevy app

```text
{{< wasm src="simulations/plasma-crystal/" height="600" title="Plasma crystal simulation" >}}
```

## Shipping a Bevy / WASM simulation

Each simulation is a **self-contained directory** under `public/simulations/<name>/`
containing `index.html`, the loader JS, the `.wasm` binary, and its `assets/`.

1. Build to wasm32:
   ```bash
   rustup target add wasm32-unknown-unknown
   cargo build --release --target wasm32-unknown-unknown
   wasm-bindgen --target web --out-dir web target/wasm32-unknown-unknown/release/<crate>.wasm
   wasm-opt -Oz web/<crate>_bg.wasm -o web/<crate>_bg.wasm
   ```
   (If using Trunk: `trunk build --release` and copy `dist/*`.)

2. **Single-threaded only.** GitHub Pages cannot send `COOP`/`COEP` headers, so
   `SharedArrayBuffer` and WebAssembly threads are unavailable. Disable multithreading
   in the Bevy/wasm config so the app runs on a single thread.

3. Place the output at `public/simulations/<name>/`.

4. Reference it in an article:
   ```text
   {{< wasm src="simulations/<name>/" height="600" title="My simulation" >}}
   ```

The iframe is given `allow="fullscreen; pointer-lock; accelerometer; gyroscope"` so
fullscreen, pointer-lock, and orientation work inside the article.

## Local media

### Image with caption

```text
{{< figure src="assets/diagram.png" caption="Schematic diagram" >}}
```

Plain Markdown images also work and are styled consistently:
```text
![Alt text](assets/diagram.png)
```

Relative `src` values inside an article are resolved against the article's directory,
so `assets/diagram.png` points next to the article file.

### Video

```text
{{< video src="assets/demo.mp4" title="Demo video" >}}
```

## YouTube

```text
{{< youtube id="dQw4w9WgXcQ" title="Reference video" >}}
```

## Raw HTML

Markdown passes raw HTML through unchanged, so advanced embeds (e.g. custom iframes,
third-party players) work too. Wrap them in a `<figure class="embed-sim">` to inherit
the standard chrome:

```html
<figure class="embed-sim">
  <iframe src="https://example.com/player" height="520" loading="lazy"></iframe>
  <figcaption>Caption</figcaption>
</figure>
```

## Vortex simulator embed mode

Appending `?embed` to the vortex simulator URL renders a compact variant suited to
article width:

```text
{{< sim src="vortex-simulator/?embed" height="520" title="Vortex engine" >}}
```
