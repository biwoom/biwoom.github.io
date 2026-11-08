export function initEbookLibrary(root: Document = document, browser: Window = window): void {
  const library = root.querySelector<HTMLElement>('[data-ebook-library]');
  const dialog = root.querySelector<HTMLDialogElement>('#ebook-dialog');
  if (!library || !dialog || library.dataset.ebookReady === 'true') return;
  library.dataset.ebookReady = 'true';
  const items = [...library.querySelectorAll<HTMLElement>('[data-ebook-item]')];
  const filters = [...library.querySelectorAll<HTMLButtonElement>('[data-ebook-filter]')];
  const search = library.querySelector<HTMLInputElement>('[data-ebook-search]')!;
  const count = library.querySelector<HTMLElement>('[data-ebook-count]')!;
  const empty = library.querySelector<HTMLElement>('[data-ebook-empty]')!;
  const content = dialog.querySelector<HTMLElement>('[data-ebook-dialog-content]')!;
  const close = dialog.querySelector<HTMLButtonElement>('[data-ebook-close]')!;
  let format = '';
  let opener: HTMLButtonElement | null = null;
  let previousOverflow = '';
  let openId = '';
  function updateUrl(id: string) {
    const address = new URL(browser.location.href);
    if (id) address.searchParams.set('book', id);
    else address.searchParams.delete('book');
    browser.history.replaceState(null, '', address);
  }
  function filterBooks() {
    const query = search.value.trim().normalize('NFC').toLocaleLowerCase('ko');
    let visible = 0;
    for (const item of items) {
      item.hidden = Boolean((format && !item.dataset.ebookFormats?.split(' ').includes(format)) || !item.dataset.ebookSearchText?.normalize('NFC').toLocaleLowerCase('ko').includes(query));
      if (!item.hidden) visible++;
    }
    count.textContent = `${visible}권의 전자책`;
    empty.hidden = visible > 0;
  }
  function openBook(item: HTMLElement, reflectUrl = true) {
    const template = item.querySelector<HTMLTemplateElement>('[data-ebook-detail]');
    if (!template) return;
    if (!dialog!.open) previousOverflow = root.body.style.overflow;
    opener = item.querySelector<HTMLButtonElement>('[data-ebook-open]');
    openId = item.dataset.ebookId ?? '';
    content.replaceChildren(template.content.cloneNode(true));
    if (!dialog!.open) dialog!.showModal();
    root.body.style.overflow = 'hidden';
    dialog!.scrollTop = 0;
    close.focus({ preventScroll: true });
    if (reflectUrl) updateUrl(openId);
  }
  for (const item of items) item.querySelector('[data-ebook-open]')?.addEventListener('click', () => openBook(item));
  for (const button of filters) button.addEventListener('click', () => {
    format = button.dataset.ebookFilter ?? '';
    for (const filter of filters) {
      const selected = filter === button;
      filter.classList.toggle('active', selected);
      filter.setAttribute('aria-pressed', String(selected));
    }
    filterBooks();
  });
  search.addEventListener('input', filterBooks);
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    root.body.style.overflow = previousOverflow;
    content.replaceChildren();
    if (new URL(browser.location.href).searchParams.get('book') === openId) updateUrl('');
    openId = '';
    if (opener && !opener.closest<HTMLElement>('[data-ebook-item]')?.hidden) opener.focus({ preventScroll: true });
    else search.focus({ preventScroll: true });
  });
  function restoreUrl() {
    const id = new URL(browser.location.href).searchParams.get('book');
    const item = items.find(item => item.dataset.ebookId === id);
    if (item) openBook(item, false);
    else if (dialog!.open) dialog!.close();
  }
  browser.addEventListener('popstate', restoreUrl);
  restoreUrl();
}
