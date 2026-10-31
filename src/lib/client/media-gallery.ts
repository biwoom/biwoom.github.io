export function initMediaGallery(root: Document = document): void {
  const gallery = root.querySelector<HTMLElement>("[data-media-gallery]");
  const dialog = root.querySelector<HTMLDialogElement>("#ol-media-dialog");
  if (!gallery || !dialog || gallery.dataset.mediaReady === "true") return;
  gallery.dataset.mediaReady = "true";
  const items = [...gallery.querySelectorAll<HTMLButtonElement>("[data-media-item]")];
  const filters = [...gallery.querySelectorAll<HTMLButtonElement>("[data-media-filter]")];
  const count = gallery.querySelector<HTMLElement>("[data-media-count]")!;
  const empty = gallery.querySelector<HTMLElement>("[data-media-empty]")!;
  const image = dialog.querySelector<HTMLImageElement>("[data-media-full-image]")!;
  const title = dialog.querySelector<HTMLElement>("#ol-media-dialog-title")!;
  const category = dialog.querySelector<HTMLElement>("[data-media-dialog-category]")!;
  const filename = dialog.querySelector<HTMLElement>("[data-media-dialog-filename]")!;
  const status = dialog.querySelector<HTMLElement>("[data-media-load-status]")!;
  const view = dialog.querySelector<HTMLElement>("[data-media-view]")!;
  const close = dialog.querySelector<HTMLButtonElement>("[data-media-close]")!;
  const zoom = dialog.querySelector<HTMLButtonElement>("[data-media-zoom]")!;
  let opener: HTMLButtonElement | undefined;
  let previousOverflow = "";
  let zoomed = false;

  function setZoom(value: boolean) {
    zoomed = value;
    dialog!.classList.toggle("is-zoomed", value);
    zoom.setAttribute("aria-pressed", String(value));
    zoom.textContent = value ? "화면 맞춤" : "원본 크기";
    view.scrollTop = 0;
    view.scrollLeft = 0;
  }
  for (const filter of filters) filter.addEventListener("click", () => {
    const selected = filter.dataset.mediaFilter ?? "";
    for (const button of filters) {
      const active = button === filter;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    }
    let visible = 0;
    for (const item of items) {
      item.hidden = Boolean(selected && item.dataset.mediaCategory !== selected);
      if (!item.hidden) visible++;
    }
    count.textContent = `${visible}개 이미지`;
    empty.hidden = visible > 0;
  });
  for (const item of items) item.addEventListener("click", () => {
    opener = item;
    title.textContent = item.dataset.mediaTitle ?? "이미지";
    category.textContent = item.dataset.mediaLabel ?? "";
    filename.textContent = item.dataset.mediaFilename ?? "";
    setZoom(false);
    image.hidden = true;
    image.alt = item.dataset.mediaTitle ?? "이미지";
    image.width = Number(item.dataset.mediaWidth) || 1;
    image.height = Number(item.dataset.mediaHeight) || 1;
    status.textContent = "이미지를 불러오는 중입니다.";
    status.hidden = false;
    zoom.disabled = true;
    previousOverflow = root.body.style.overflow;
    dialog.showModal();
    root.body.style.overflow = "hidden";
    image.src = item.dataset.mediaSrc ?? "";
  });
  image.addEventListener("load", () => {
    if (!dialog.open) return;
    image.hidden = false;
    status.hidden = true;
    zoom.disabled = false;
  });
  image.addEventListener("error", () => {
    if (!dialog.open) return;
    image.hidden = true;
    zoom.disabled = true;
    status.textContent = "이미지를 불러오지 못했습니다.";
    status.hidden = false;
  });
  zoom.addEventListener("click", () => setZoom(!zoomed));
  image.addEventListener("click", () => { if (!zoom.disabled) setZoom(!zoomed); });
  close.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  // Native dialog handles Escape and focus containment; every close path restores state.
  dialog.addEventListener("close", () => {
    root.body.style.overflow = previousOverflow;
    image.removeAttribute("src");
    image.hidden = true;
    setZoom(false);
    opener?.focus({ preventScroll: true });
  });
}
