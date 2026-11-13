import { createReaderDrawer } from "./reader-drawer";
import { initReaderTools } from "./reader-tools";
import { initOriginalToggle } from "./reader-original";

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
  const normalizeMarkdown = (value: string) =>
    value
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]+\n/g, "\n")
      .trim();

  const getStoryMarkdown = (title: string) => {
    const source = document.querySelector<HTMLElement>(".ol-prose");
    const notes = document.querySelector<HTMLElement>(".ol-reader-footnotes-content .footnotes");
    const body = normalizeMarkdown([source?.innerText, notes?.innerText].filter(Boolean).join("\n\n"));
    return normalizeMarkdown(`# ${title}\n\n${body}`);
  };

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

  document
    .querySelectorAll<HTMLElement>("[data-copy-dropdown]")
    .forEach((dropdown) => {
      const trigger = dropdown.querySelector<HTMLButtonElement>("button");
      if (!trigger) return;
      trigger.addEventListener("click", (event) => {
        event.stopPropagation();
        const open = trigger.getAttribute("aria-expanded") === "true";
        trigger.setAttribute("aria-expanded", String(!open));
      });
    });

  document.addEventListener("click", async (event) => {
    const copyButton = (event.target as HTMLElement).closest<HTMLButtonElement>(
      "[data-copy-kind]",
    );
    if (copyButton) {
      event.stopPropagation();
      const dropdown = copyButton.closest<HTMLElement>("[data-copy-dropdown]");
      const title = dropdown?.dataset.copyTitle ?? document.title;
      const href = new URL(
        dropdown?.dataset.copyUrl ?? window.location.pathname,
        window.location.origin,
      ).href;
      let value = copyButton.dataset.copyKind === "markdown" ? getStoryMarkdown(title) : href;
      const feedback = document.querySelector<HTMLElement>("[data-reader-feedback]");
      const tell = (message: string) => {
        if (feedback) {
          feedback.textContent = message;
          window.setTimeout(() => { if (feedback.textContent === message) feedback.textContent = ""; }, 4000);
        }
      };
      if (copyButton.dataset.copyKind === "section") {
        const current = [...document.querySelectorAll<HTMLElement>(".ol-story-chapter > .ol-prose :is(h2,h3,h4,h5)")]
          .filter(heading => heading.getBoundingClientRect().top <= readerBoundary()).at(-1);
        const sectionUrl = new URL(href);
        if (current) sectionUrl.hash = current.id;
        value = sectionUrl.href;
      }
      if (copyButton.dataset.copyKind === "citation") {
        const selection = window.getSelection();
        const selected = selection?.toString().trim() ?? "";
        const source = selection?.anchorNode?.parentElement?.closest(".ol-story-chapter");
        if (!selected || !source) { tell("본문에서 인용할 문장을 먼저 선택해 주세요."); return; }
        value = `${selected}\n\n${title} — Biwoom TEXT\n${href}`;
      }
      try {
        if (!navigator.clipboard) throw new Error("Clipboard unavailable");
        await navigator.clipboard.writeText(value);
      } catch {
        tell("복사할 수 없습니다. 본문을 선택해 복사해 주세요.");
        return;
      }
      tell("복사했습니다.");
      const original = copyButton.textContent ?? "";
      copyButton.textContent = "복사됨";
      dropdown
        ?.querySelector<HTMLButtonElement>("button")
        ?.setAttribute("aria-expanded", "false");
      window.setTimeout(() => {
        copyButton.textContent = original;
      }, 1200);
      return;
    }

    document
      .querySelectorAll<HTMLButtonElement>("[data-copy-dropdown] > button")
      .forEach((button) => {
        button.setAttribute("aria-expanded", "false");
      });
  });

  initToc();
  initReaderTools();

}
