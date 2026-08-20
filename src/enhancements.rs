/// Post-page DOM enhancements that run after an article renders.
///
/// Kept as a single injected script so the enhancement logic (highlighting,
/// code-copy, KaTeX, TOC scroll-spy, progress bar) lives in one cohesive
/// place rather than in the component layer.
pub fn run_post_enhancements() {
    let script = r#"
setTimeout(() => {
  const progress = document.getElementById('progress');
  const backToTop = document.getElementById('backToTop');
  if (!progress || !backToTop) return;

  if (window.hljs) {
    document.querySelectorAll('pre code').forEach((el) => {
      window.hljs.highlightElement(el);
    });
  }

  document.querySelectorAll('.markdown-body pre').forEach((pre) => {
    const code = pre.querySelector('code');
    if (!code) return;
    const lang = code.className.replace('hljs', '').replace('language-', '').trim().split(/\s+/)[0] || 'code';
    const header = document.createElement('div');
    header.className = 'code-header';
    header.innerHTML = '<span class="code-lang">' + lang + '</span>';
    const btn = document.createElement('button');
    btn.className = 'code-copy';
    btn.textContent = 'Copy';
    btn.setAttribute('aria-label', 'Copy code');
    btn.onclick = () => {
      const text = code.innerText;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          btn.textContent = 'Copied';
          setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
        });
      }
    };
    header.appendChild(btn);
    pre.parentNode.insertBefore(header, pre);
  });

  document.querySelectorAll('.markdown-body blockquote').forEach((bq) => {
    let hasArabic = false;
    bq.querySelectorAll('p').forEach((p) => {
      const text = p.textContent || '';
      if (/[\u0600-\u06FF]/.test(text)) {
        hasArabic = true;
        p.setAttribute('dir', 'rtl');
        p.setAttribute('lang', 'ar');
      }
    });
    if (hasArabic) bq.classList.add('ayah');
  });

  if (window.katex) {
    document.querySelectorAll('.math-inline, .math-display').forEach((el) => {
      try {
        const display = el.classList.contains('math-display');
        window.katex.render(el.textContent, el, { displayMode: display, throwOnError: false });
      } catch (e) {}
    });
  }

  const toc = document.getElementById('toc');
  if (toc) {
    const links = toc.querySelectorAll('a');
    const headings = Array.from(links).map((a) => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
    const onScroll = () => {
      let current = -1;
      const mid = window.innerHeight / 2;
      headings.forEach((h, i) => {
        if (h && h.getBoundingClientRect().top <= mid) current = i;
      });
      links.forEach((l, i) => {
        l.classList.toggle('active', i === current);
      });
    };
    window.addEventListener('scroll', onScroll);
    onScroll();
  }

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
