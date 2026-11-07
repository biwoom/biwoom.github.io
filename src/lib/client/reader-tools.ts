import { createReaderDrawer } from "./reader-drawer";

export function initReaderTools() {
  const reader = document.querySelector<HTMLElement>(".ol-story-doc-page");
  if (!reader) return;
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
    const close = (destination?: HTMLElement) => {
      const navigate = () => {
        if (!destination) return;
        history.replaceState(null, "", `#${encodeURIComponent(destination.id)}`);
        destination.scrollIntoView({ block: "center" });
        destination.focus({ preventScroll: true });
        markReference(destination);
      };
      controller.close(navigate);
    };
    const open = (source: HTMLElement, note?: HTMLElement) => {
      if (!controller.open(source)) return;
      drawer.querySelectorAll("[data-active-note]").forEach(el => el.removeAttribute("data-active-note"));
      if (note) {
        note.setAttribute("data-active-note", "");
        note.tabIndex = -1;
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
      try { return document.getElementById(decodeURIComponent(hash.slice(1))); }
      catch { return null; }
    };
    trigger.addEventListener("click", () => drawer.open ? close() : open(trigger));
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
    drawer.querySelectorAll<HTMLElement>("[data-footnote-return]").forEach(control => {
      const returnToBody = (event: Event) => {
        // Preserve authored links and other interactive content inside a note.
        if (event.target instanceof Element && event.target !== control &&
            event.target.closest("a, button, input, select, textarea")) return;
        const note = control.closest<HTMLElement>("li[id]");
        const reference = (note && lastReferences.get(note.id)) ?? hashTarget(control.dataset.footnoteReturn ?? "");
        if (!reference) return;
        event.preventDefault();
        close(reference);
      };
      control.addEventListener("click", returnToBody);
      control.addEventListener("keydown", event => {
        if (event.target === control && (event.key === "Enter" || event.key === " ")) returnToBody(event);
      });
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
  ));
  const measure = () => {
    targets.forEach(el => el.removeAttribute("data-reader-scalable"));
    const sizes = targets.map(el => getComputedStyle(el).fontSize);
    targets.forEach((el, i) => {
      el.style.setProperty("--ol-reader-base-font", sizes[i]);
      el.setAttribute("data-reader-scalable", "");
    });
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
