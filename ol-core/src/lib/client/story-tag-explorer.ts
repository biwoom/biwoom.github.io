import { compareStoryTagNames, storyTagInitial, storyTagSearchKey, storyTagsPageSize } from "../../../scripts/lib/story-tags.mjs";
import type { CatalogRecord } from "../search.mjs";

function followsLink(event: MouseEvent) {
  return !event.defaultPrevented && event.button === 0
    && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

export function initStoryTagExplorer(document: Document = window.document, browser: Window = window) {
  const root = document.querySelector<HTMLElement>("[data-story-tag-directory]");
  const search = document.querySelector<HTMLFormElement>("[data-story-tag-search]");
  const catalogUrl = root?.dataset.catalogUrl;
  if (!root || !search || !catalogUrl) return;

  const input = search.querySelector("input")!;
  const filters = root.querySelector<HTMLElement>("[data-story-tag-filters]")!;
  const buttons = [...filters.querySelectorAll<HTMLButtonElement>("[data-story-tag-type]")];
  const initials = root.querySelector<HTMLElement>("[data-story-tag-initials]")!;
  const initialButtons = [...initials.querySelectorAll<HTMLButtonElement>("[data-story-tag-initial]")];
  const status = root.querySelector<HTMLElement>("[data-story-tag-status]")!;
  const empty = root.querySelector<HTMLElement>("[data-story-tag-empty]")!;
  const reset = root.querySelector<HTMLButtonElement>("[data-story-tag-reset]")!;
  const list = root.querySelector<HTMLElement>("[data-story-tag-list]")!;
  const desktop = root.querySelector<HTMLElement>("[data-story-tag-desktop]")!;
  const placeholder = root.querySelector<HTMLElement>("[data-story-tag-placeholder]")!;
  const preview = root.querySelector<HTMLElement>("[data-story-tag-preview]")!;
  const previewBody = root.querySelector<HTMLElement>("[data-story-tag-preview-body]")!;
  const fullLink = root.querySelector<HTMLAnchorElement>("[data-story-tag-full]")!;
  const dialog = root.querySelector<HTMLDialogElement>("[data-story-tag-dialog]")!;
  const mobile = dialog.querySelector<HTMLElement>("[data-story-tag-mobile]")!;
  const pages = root.querySelector<HTMLElement>("[data-story-tag-pages]")!;
  const pageLabel = pages.querySelector<HTMLElement>("[data-story-tag-page]")!;
  const prev = pages.querySelector<HTMLAnchorElement>("[data-story-tag-prev]")!;
  const next = pages.querySelector<HTMLAnchorElement>("[data-story-tag-next]")!;
  const wide = browser.matchMedia("(min-width: 1180px)");
  const staticCards = [...list.querySelectorAll<HTMLElement>("[data-story-tag-entry]")];
  const staticStatus = status.textContent;
  const staticPage = pageLabel.textContent;
  const staticPrev = prev.getAttribute("href");
  const staticNext = next.getAttribute("href");
  let selected: { link: HTMLAnchorElement; request: AbortController } | undefined;
  let type = "";
  let initial = "";
  let renderId = 0;
  let filtered = false;
  let catalog: Promise<CatalogRecord[]> | undefined;

  function clearPreview() {
    selected?.link.removeAttribute("aria-current");
    selected?.request.abort();
    selected = undefined;
    previewBody.replaceChildren();
    preview.hidden = true;
    placeholder.hidden = false;
    if (dialog.open) dialog.close();
  }

  function placePreview() {
    if (wide.matches && dialog.open) dialog.close();
    (wide.matches ? desktop : mobile).append(preview);
  }

  const loadCatalog = () => {
    return catalog ??= browser.fetch(catalogUrl)
      .then(response => {
        if (!response.ok) throw new Error("Tag catalog unavailable");
        return response.json() as Promise<CatalogRecord[]>;
      })
      .then(records => records.filter(record => record.kind === "tag" && record.section === "STORY")
        .sort((a, b) => compareStoryTagNames(a.title, b.title) || (a.tagType ?? "").localeCompare(b.tagType ?? "")))
      .catch(error => {
        catalog = undefined;
        throw error;
      });
  };

  function renderCard(tag: CatalogRecord) {
    const card = staticCards[0].cloneNode(true) as HTMLElement;
    const link = card.querySelector<HTMLAnchorElement>("[data-story-tag-card]")!;
    link.href = tag.url;
    link.removeAttribute("aria-current");
    card.querySelector("[data-tag-kind]")!.textContent = tag.context ?? "";
    card.querySelector("[data-tag-count]")!.textContent = `${tag.documentCount ?? 0}편`;
    card.querySelector("[data-tag-name]")!.textContent = tag.title;
    const aliases = card.querySelector<HTMLElement>("[data-tag-aliases]")!;
    aliases.textContent = (tag.aliases ?? []).slice(0, 2).join(" · ");
    aliases.hidden = !aliases.textContent;
    return card;
  }

  function setNavigation(label: string | null, previous: string | null, following: string | null) {
    pageLabel.textContent = label;
    for (const [link, href] of [[prev, previous], [next, following]] as const) {
      link.hidden = !href;
      if (href) link.setAttribute("href", href);
      else link.removeAttribute("href");
    }
    pages.hidden = !previous && !following;
  }

  function addressForPage(address: URL, page: number) {
    const target = new URL(address);
    if (page > 1) target.searchParams.set("page", String(page));
    else target.searchParams.delete("page");
    return target.href;
  }

  async function applyFilters(updateAddress = true) {
    const render = ++renderId;
    const address = new URL(browser.location.href);
    const query = storyTagSearchKey(input.value);
    for (const button of buttons) {
      button.setAttribute("aria-pressed", String(button.dataset.storyTagType === type));
    }
    for (const button of initialButtons) {
      button.setAttribute("aria-pressed", String(button.dataset.storyTagInitial === initial));
    }
    filtered = Boolean(type || initial || query);
    reset.hidden = !filtered;
    if (updateAddress) {
      if (type) address.searchParams.set("type", type);
      else address.searchParams.delete("type");
      if (initial) address.searchParams.set("initial", initial);
      else address.searchParams.delete("initial");
      if (query) address.searchParams.set("q", input.value.trim());
      else address.searchParams.delete("q");
      address.searchParams.delete("page");
      if (address.href !== browser.location.href)
        browser.history.replaceState(browser.history.state, "", address);
    }

    if (selected) clearPreview();
    empty.hidden = true;
    list.removeAttribute("aria-busy");
    if (!filtered) {
      status.textContent = staticStatus;
      list.replaceChildren(...staticCards);
      setNavigation(staticPage, staticPrev, staticNext);
      return;
    }

    list.setAttribute("aria-busy", "true");
    status.textContent = "태그를 불러오는 중입니다.";
    list.replaceChildren();
    setNavigation("", null, null);
    try {
      const records = await loadCatalog();
      if (render !== renderId) return;
      const matches = records.filter(tag => (!type || tag.tagType === type)
        && (!initial || storyTagInitial(tag.title) === initial)
        && [tag.title, ...(tag.aliases ?? [])].some(name => storyTagSearchKey(name).includes(query)));
      const pageCount = Math.max(1, Math.ceil(matches.length / storyTagsPageSize));
      const requested = Number(address.searchParams.get("page"));
      const page = Number.isSafeInteger(requested) ? Math.min(pageCount, Math.max(1, requested)) : 1;
      const start = (page - 1) * storyTagsPageSize;
      list.replaceChildren(...matches.slice(start, start + storyTagsPageSize).map(renderCard));
      status.textContent = `${matches.length}개 태그`;
      empty.hidden = matches.length > 0;
      setNavigation(`${page} / ${pageCount}`, page > 1 ? addressForPage(address, page - 1) : null,
        page < pageCount ? addressForPage(address, page + 1) : null);
    } catch {
      if (render === renderId) status.textContent = "태그를 불러오지 못했습니다. 검색어를 다시 입력하거나 Enter를 눌러 주세요.";
    } finally {
      if (render === renderId) list.removeAttribute("aria-busy");
    }
  }

  function restoreFilters() {
    const params = new URLSearchParams(browser.location.search);
    const requested = params.get("type");
    type = buttons.some(button => button.dataset.storyTagType === requested) ? requested ?? "" : "";
    const requestedInitial = params.get("initial") ?? "";
    initial = initialButtons.some(button => button.dataset.storyTagInitial === requestedInitial) ? requestedInitial : "";
    input.value = params.get("q") ?? "";
    void applyFilters(false);
  }

  for (const button of buttons) {
    button.addEventListener("click", () => {
      type = button.dataset.storyTagType ?? "";
      void applyFilters();
    });
  }
  for (const button of initialButtons) {
    button.addEventListener("click", () => {
      initial = button.dataset.storyTagInitial ?? "";
      void applyFilters();
    });
  }
  input.addEventListener("input", event => {
    if (!(event as InputEvent).isComposing) void applyFilters();
  });
  search.addEventListener("submit", event => {
    event.preventDefault();
    void applyFilters();
  });
  reset.addEventListener("click", () => {
    type = "";
    initial = "";
    input.value = "";
    void applyFilters();
    input.focus();
  });
  browser.addEventListener("popstate", restoreFilters);
  for (const link of [prev, next]) {
    link.addEventListener("click", event => {
      if (!filtered || !followsLink(event)) return;
      event.preventDefault();
      browser.history.pushState(browser.history.state, "", link.href);
      root.querySelector<HTMLElement>("#story-tag-list-title")?.focus();
      void applyFilters(false);
    });
  }

  if (typeof dialog.showModal === "function") {
    list.addEventListener("click", async event => {
      if (!followsLink(event)) return;
      const link = (event.target as Element).closest<HTMLAnchorElement>("[data-story-tag-card]");
      if (!link) return;
      event.preventDefault();
      selected?.link.removeAttribute("aria-current");
      selected?.request.abort();
      const request = new AbortController();
      selected = { link, request };
      link.setAttribute("aria-current", "true");
      fullLink.href = link.href;
      previewBody.textContent = "미리보기를 불러오는 중입니다.";
      preview.hidden = false;
      desktop.scrollTop = 0;
      dialog.scrollTop = 0;
      placeholder.hidden = true;
      if (wide.matches) preview.focus({ preventScroll: true });
      else if (!dialog.open) dialog.showModal();

      try {
        const response = await browser.fetch(link.href, { signal: request.signal, redirect: "error" });
        if (!response.ok) throw new Error("Tag page unavailable");
        const html = new DOMParser().parseFromString(await response.text(), "text/html");
        const fragment = html.querySelector<HTMLTemplateElement>("[data-story-tag-preview-fragment]");
        if (!fragment) throw new Error("Tag preview unavailable");
        if (selected?.request === request) previewBody.replaceChildren(fragment.content.cloneNode(true));
      } catch {
        if (selected?.request === request) previewBody.textContent = "미리보기를 불러오지 못했습니다.";
      }
    });
    preview.addEventListener("keydown", event => {
      if (event.key !== "Escape" || !wide.matches || !selected) return;
      const { link } = selected;
      clearPreview();
      link.focus();
    });
    dialog.addEventListener("click", event => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", () => {
      if (!wide.matches && selected) clearPreview();
    });
    wide.addEventListener("change", placePreview);
    placePreview();
  }

  restoreFilters();
  search.removeAttribute("inert");
  filters.removeAttribute("inert");
  initials.removeAttribute("inert");
}
