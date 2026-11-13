import { createReaderDrawer } from "./reader-drawer";

export function initReaderTools() {
  const reader = document.querySelector<HTMLElement>(".ol-story-doc-page");
  if (!reader) return;
  const backToTop = reader.querySelector<HTMLButtonElement>("[data-reader-back-to-top]");
  if (backToTop) {
    const prose = reader.querySelector<HTMLElement>(".ol-story-chapter > .ol-prose");
    const updateBackToTop = () => {
      backToTop.hidden = window.scrollY < 240;
      if (prose) {
        const right = Math.max(16, window.innerWidth - prose.getBoundingClientRect().right + 8);
        backToTop.style.setProperty("--ol-reader-top-right", `${right}px`);
      }
    };
    let scheduled = false;
    const scheduleBackToTop = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => { scheduled = false; updateBackToTop(); });
    };
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    });
    window.addEventListener("scroll", scheduleBackToTop, { passive: true });
    window.addEventListener("resize", scheduleBackToTop);
    if (prose && typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(scheduleBackToTop);
      observer.observe(prose);
      const article = prose.closest("article");
      if (article) observer.observe(article);
    }
    updateBackToTop();
  }
  const drawer = reader.querySelector<HTMLDialogElement>("#ol-reader-footnotes");
  const trigger = reader.querySelector<HTMLButtonElement>("[data-reader-footnotes-trigger]");
  if (drawer && trigger) {
    trigger.disabled = false;
    trigger.title = "문서 각주";
    trigger.setAttribute("aria-label", "문서 각주 열기");
    const lastReferences = new Map<string, HTMLElement>();
    const markReference = (reference: HTMLElement) => {
      reader.querySelectorAll("[data-active-footnote-ref]").forEach(el => el.removeAttribute("data-active-footnote-ref"));
      reference.setAttribute("data-active-footnote-ref", "");
    };
    const controller = createReaderDrawer(drawer, trigger, drawer.querySelector("[data-reader-footnotes-close]"));
    const open = (source: HTMLElement, note?: HTMLElement) => {
      if (!controller.open(source)) return;
      drawer.querySelectorAll("[data-active-note]").forEach(el => el.removeAttribute("data-active-note"));
      if (note) {
        note.setAttribute("data-active-note", "");
        if (!note.hasAttribute("tabindex")) note.tabIndex = -1;
        const scroller = drawer.querySelector<HTMLElement>(".ol-reader-footnotes-content");
        if (scroller) {
          // Scroll only the note list, never the viewport/translated dialog.
          scroller.scrollTop += note.getBoundingClientRect().top - scroller.getBoundingClientRect().top
            - (scroller.clientHeight - note.offsetHeight) / 2;
        }
        note.focus({ preventScroll: true });
      }
    };
    const hashTarget = (hash: string) => {
      const id = hash.slice(1);
      // Markdown footnote IDs contain literal percent escapes for Unicode labels.
      // Resolve that exact ID before decoding an ordinary URL fragment.
      const target = document.getElementById(id);
      if (target) return target;
      try { return document.getElementById(decodeURIComponent(id)); }
      catch { return null; }
    };
    trigger.addEventListener("click", () => drawer.open ? controller.close() : open(trigger));
    reader.querySelectorAll<HTMLAnchorElement>("a[data-footnote-ref]").forEach(link => {
      link.addEventListener("click", event => {
        const note = hashTarget(link.hash);
        if (!note || !drawer.contains(note)) return;
        event.preventDefault();
        lastReferences.set(note.id, link);
        markReference(link);
        open(link, note);
      });
    });
    const returnToReference = (event: MouseEvent | KeyboardEvent) => {
      if (!drawer.open || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const note = target.closest<HTMLElement>(".footnotes > ol > li[id][data-footnote-return]");
      if (!note || !drawer.contains(note)) return;
      if (event.type === "keydown") {
        if (target !== note) return;
      } else {
        if (target.closest("a, button, input, select, textarea, label, summary, [contenteditable]")) return;
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed && selection.containsNode(note, true)) return;
      }

      const reference = lastReferences.get(note.id) ?? hashTarget(note.dataset.footnoteReturn ?? "");
      if (!reference) return;
      event.preventDefault();
      history.replaceState(null, "", `#${encodeURIComponent(reference.id)}`);
      reference.scrollIntoView({ block: "center" });
      markReference(reference);
    };
    drawer.addEventListener("click", returnToReference);
    drawer.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") returnToReference(event);
    });
    const followHash = () => {
      const note = hashTarget(location.hash);
      if (note && drawer.contains(note) && note.closest(".footnotes li")) open(trigger, note);
    };
    window.addEventListener("hashchange", followHash);
    followHash();
  }

  const font = reader.querySelector<HTMLElement>("[data-reader-font]");
  const fontTrigger = font?.querySelector<HTMLButtonElement>("[data-reader-font-trigger]");
  const panel = font?.querySelector<HTMLElement>(".ol-reader-font-panel");
  const slider = font?.querySelector<HTMLInputElement>("[data-reader-font-size]");
  const output = font?.querySelector<HTMLOutputElement>("[data-reader-font-value]");
  if (!font || !fontTrigger || !panel || !slider || !output) return;
  const key = "ol-reader-font-percent";
  let percent = 100;
  try {
    const saved = Number(localStorage.getItem(key));
    if (Number.isFinite(saved) && saved >= 80 && saved <= 150) percent = saved;
  } catch { /* Reading controls also work when storage is unavailable. */ }
  // Measure the existing cascade, including responsive heading/table/code sizes.
  const targets = Array.from(reader.querySelectorAll<HTMLElement>(
    ".ol-story-part-content-head :is(h1,h2), .ol-story-chapter > .ol-prose, .ol-story-chapter > .ol-prose :is(h1,h2,h3,h4,h5,h6,pre code,table,th), .ol-reader-footnotes-content, .ol-reader-footnotes-content .footnotes",
  )).filter(el => !el.closest('[data-reader-original]'));
  const measure = () => {
    // Initial CSS already uses the saved scale. Measure at 100% to avoid
    // multiplying it a second time, including after a responsive resize.
    const previousScale = reader.style.getPropertyValue("--ol-reader-font-scale");
    reader.style.setProperty("--ol-reader-font-scale", "1");
    targets.forEach(el => el.removeAttribute("data-reader-scalable"));
    const sizes = targets.map(el => getComputedStyle(el).fontSize);
    targets.forEach((el, i) => {
      el.style.setProperty("--ol-reader-base-font", sizes[i]);
      el.setAttribute("data-reader-scalable", "");
    });
    if (previousScale) reader.style.setProperty("--ol-reader-font-scale", previousScale);
    else reader.style.removeProperty("--ol-reader-font-scale");
  };
  const apply = () => {
    slider.value = String(percent);
    output.value = `${percent}%`;
    reader.style.setProperty("--ol-reader-font-scale", String(percent / 100));
    try { localStorage.setItem(key, String(percent)); } catch { /* Optional persistence. */ }
  };
  const positionFontPanel = () => {
    if (panel.hidden) return;
    const top = fontTrigger.getBoundingClientRect().bottom + 8;
    panel.style.setProperty("--ol-reader-font-top", `${top}px`);
  };
  const closeFont = () => {
    panel.hidden = true;
    fontTrigger.setAttribute("aria-expanded", "false");
  };
  fontTrigger.addEventListener("click", () => {
    panel.hidden = !panel.hidden;
    fontTrigger.setAttribute("aria-expanded", String(!panel.hidden));
    if (!panel.hidden) {
      positionFontPanel();
      slider.focus({ preventScroll: true });
    }
  });
  slider.addEventListener("input", () => { percent = Number(slider.value); apply(); });
  font.querySelector("[data-reader-font-reset]")?.addEventListener("click", () => { percent = 100; apply(); });
  document.addEventListener("click", event => {
    if (event.target instanceof Node && !font.contains(event.target)) closeFont();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !panel.hidden) {
      event.preventDefault(); closeFont(); fontTrigger.focus();
    }
  });
  measure();
  apply();
  window.addEventListener("resize", () => { measure(); positionFontPanel(); });
  window.addEventListener("scroll", positionFontPanel, { passive: true });
}
