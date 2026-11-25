import { storyTagSearchKey } from "../../../scripts/lib/story-tags.mjs";
import { createPaginator } from "./paginated-list";

export function initStoryTagExplorer(document: Document = window.document, browser: Window = window) {
  const root = document.querySelector<HTMLElement>("[data-story-tag-directory]");
  const search = document.querySelector<HTMLFormElement>("[data-story-tag-search]");
  if (!root || !search) return;

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
  const loadMoreWrap = root.querySelector<HTMLElement>("[data-loadmore-wrap]");
  const wide = browser.matchMedia("(min-width: 1180px)");
  const cards = [...list.querySelectorAll<HTMLElement>("[data-story-tag-entry]")].map(item => ({
    item,
    type: item.dataset.type,
    initial: item.dataset.initial,
    names: (JSON.parse(item.dataset.storyTagEntry ?? "[]") as string[]).map(storyTagSearchKey),
  }));
  let selected: { item: HTMLElement; link: HTMLAnchorElement; request: AbortController } | undefined;
  let type = "";
  let initial = "";

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

  const paginator = createPaginator({
    allItems: cards.map(card => card.item),
    pageSize: Number(root.dataset.pageSize),
    loadMoreWrap,
    loadMoreButton: root.querySelector("[data-loadmore-button]"),
    loadMoreRemaining: root.querySelector("[data-loadmore-remaining]"),
    onRender({ matchedItems, visibleItems }) {
      status.textContent = `${matchedItems.length}개 태그`;
      empty.hidden = matchedItems.length > 0;
      if (selected && !visibleItems.includes(selected.item)) clearPreview();
    },
  });

  function applyFilters(updateAddress = true) {
    const query = storyTagSearchKey(input.value);
    for (const button of buttons) {
      button.setAttribute("aria-pressed", String(button.dataset.storyTagType === type));
    }
    for (const button of initialButtons) {
      button.setAttribute("aria-pressed", String(button.dataset.storyTagInitial === initial));
    }
    reset.hidden = !type && !initial && !query;
    paginator.reset(cards.filter(card =>
      (!type || card.type === type) && (!initial || card.initial === initial)
      && card.names.some(name => name.includes(query))
    ).map(card => card.item));

    if (updateAddress) {
      const address = new URL(browser.location.href);
      if (type) address.searchParams.set("type", type);
      else address.searchParams.delete("type");
      if (initial) address.searchParams.set("initial", initial);
      else address.searchParams.delete("initial");
      if (query) address.searchParams.set("q", input.value.trim());
      else address.searchParams.delete("q");
      if (address.href !== browser.location.href)
        browser.history.replaceState(browser.history.state, "", address);
    }
  }

  function restoreFilters() {
    const params = new URLSearchParams(browser.location.search);
    const requested = params.get("type");
    type = buttons.some(button => button.dataset.storyTagType === requested) ? requested ?? "" : "";
    const requestedInitial = params.get("initial") ?? "";
    initial = initialButtons.some(button => button.dataset.storyTagInitial === requestedInitial) ? requestedInitial : "";
    input.value = params.get("q") ?? "";
    applyFilters(false);
  }

  for (const button of buttons) {
    button.addEventListener("click", () => {
      type = button.dataset.storyTagType ?? "";
      applyFilters();
    });
  }
  for (const button of initialButtons) {
    button.addEventListener("click", () => {
      initial = button.dataset.storyTagInitial ?? "";
      applyFilters();
    });
  }
  input.addEventListener("input", () => applyFilters());
  search.addEventListener("submit", event => {
    event.preventDefault();
    applyFilters();
  });
  reset.addEventListener("click", () => {
    type = "";
    initial = "";
    input.value = "";
    applyFilters();
    input.focus();
  });
  browser.addEventListener("popstate", restoreFilters);

  if (typeof dialog.showModal === "function") {
    list.addEventListener("click", async event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element).closest<HTMLAnchorElement>("[data-story-tag-card]");
      const item = link?.closest<HTMLElement>("[data-story-tag-entry]");
      if (!link || !item) return;
      event.preventDefault();
      selected?.link.removeAttribute("aria-current");
      selected?.request.abort();
      const request = new AbortController();
      selected = { item, link, request };
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
  loadMoreWrap?.removeAttribute("inert");
}
