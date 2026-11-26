import { createReaderDrawer } from "./reader-drawer";
import { initReaderTools } from "./reader-tools";
import { initOriginalToggle } from "./reader-original";
import { initReaderCopy } from "./reader-copy";

export function initDocumentReader() {
  initOriginalToggle();
  const story = document.querySelector<HTMLElement>(".ol-story-doc-page:not(.ol-text-reader)");
  const focusButton = story?.querySelector<HTMLButtonElement>("[data-story-focus]");
  focusButton?.addEventListener("click", () => {
    const focused = !story!.hasAttribute("data-story-focus");
    story!.toggleAttribute("data-story-focus", focused);
    focusButton.setAttribute("aria-pressed", String(focused));
    focusButton.setAttribute("aria-label", focused ? "기본 모드" : "집중 모드");
    focusButton.title = focused ? "기본 모드" : "집중 모드";
    const label = focusButton.querySelector<HTMLElement>("[data-text-focus-label]");
    if (label) label.textContent = focused ? "기본" : "집중";
    story!.dispatchEvent(new Event("reader:focus"));
  });
  const readerBoundary = () => (document.querySelector<HTMLElement>(".ol-reader-toolbar")?.getBoundingClientRect().bottom ?? 144) + 16;

  const initToc = () => {
    const drawer = document.querySelector<HTMLDialogElement>("#ol-reader-toc");
    const trigger = document.querySelector<HTMLButtonElement>("[data-reader-toc-trigger]");
    if (!drawer || !trigger) return;
    const links = Array.from(drawer.querySelectorAll<HTMLAnchorElement>("[data-story-toc-list] a"));
    const headings = links.map((link) => document.getElementById(decodeURIComponent(link.hash.slice(1))))
      .filter((heading): heading is HTMLElement => heading !== null);
    const controller = createReaderDrawer(drawer, trigger, drawer.querySelector("[data-reader-toc-close]"));
    const closeDrawer = (destination?: HTMLElement) => controller.close(() => {
      if (destination) {
        window.location.hash = encodeURIComponent(destination.id);
        destination.scrollIntoView({ block: "start" });
      }
    });
    trigger.addEventListener("click", () => {
      if (drawer.open) closeDrawer();
      else controller.open();
    });
    links.forEach((link) => link.addEventListener("click", (event) => {
      const heading = document.getElementById(decodeURIComponent(link.hash.slice(1)));
      if (!heading) return;
      event.preventDefault();
      if (drawer.dataset.docked === "true") {
        history.replaceState(null, "", `#${encodeURIComponent(heading.id)}`);
        heading.scrollIntoView({ block: "start" });
      } else closeDrawer(heading);
    }));
    const syncActiveLinks = () => {
      const boundary = readerBoundary();
      const active = headings.filter((heading) => heading.getBoundingClientRect().top <= boundary).at(-1) ?? headings[0];
      links.forEach((link) => {
        const selected = decodeURIComponent(link.hash.slice(1)) === active?.id;
        link.classList.toggle("active", selected);
        if (selected) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    };
    let scheduled = false;
    window.addEventListener("scroll", () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => { syncActiveLinks(); scheduled = false; });
    }, { passive: true });
    syncActiveLinks();
  };

  initReaderCopy(document, readerBoundary);
  initToc();
  initReaderTools();

}
