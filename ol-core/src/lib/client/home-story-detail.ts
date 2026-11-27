import { updateStoryBookmarks } from './story-bookmarks';

const workspace = document.querySelector<HTMLElement>('[data-home-workspace]');
const panel = workspace?.querySelector<HTMLDialogElement>('[data-home-story-detail]');
const body = panel?.querySelector<HTMLElement>('[data-home-detail-body]');
if (workspace && panel && body) {
  const dock = workspace.querySelector<HTMLElement>('[data-home-detail-dock]');
  const wide = matchMedia('(min-width: 1024px)');
  const hover = matchMedia('(any-hover: hover)');
  const templates = new Map([...workspace.querySelectorAll<HTMLElement>('[data-home-detail-template]')]
    .map(template => [template.dataset.homeDetailTemplate, template]));
  let active: HTMLAnchorElement | undefined;
  let pending = 0;

  const cardLink = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
    return (event.target as Element).closest<HTMLAnchorElement>('[data-home-detail-open]') ?? undefined;
  };

  const placeInline = (link: HTMLAnchorElement) => {
    if (!dock || wide.matches) return;
    const card = link.closest<HTMLElement>('[data-story-card]');
    if (card && card.nextElementSibling !== panel) card.after(panel);
  };

  const open = (link: HTMLAnchorElement, template: HTMLElement) => {
    if (!link.isConnected || link.closest('[hidden]')) return;
    active?.setAttribute('aria-expanded', 'false');
    active = link;
    link.setAttribute('aria-expanded', 'true');
    body.replaceChildren(...[...template.childNodes].map(node => node.cloneNode(true)));
    const heading = body.querySelector<HTMLElement>('h2')!;
    heading.id = 'ol-home-detail-title';
    updateStoryBookmarks();
    placeInline(link);
    if (!panel.open) {
      if (dock || wide.matches) panel.show();
      else panel.showModal();
    }
    heading.focus({ preventScroll: true });
    if (dock && !wide.matches) panel.scrollIntoView({ block: 'nearest' });
  };

  workspace.addEventListener('click', event => {
    window.clearTimeout(pending);
    const link = cardLink(event);
    const template = templates.get(link?.dataset.homeDetailOpen);
    if (!link || !template || typeof panel.showModal !== 'function') return;
    event.preventDefault();
    const pointer = 'pointerType' in event ? event.pointerType : '';
    if (event.detail > 1) return;
    if (pointer === 'touch' || (!pointer && !hover.matches) || event.detail === 0 || (wide.matches && panel.open)) {
      open(link, template);
    } else {
      // Keep the card in place while a second mouse click can still follow.
      pending = window.setTimeout(() => open(link, template), 500);
    }
  });
  workspace.addEventListener('dblclick', event => {
    const link = cardLink(event);
    if (!link) return;
    event.preventDefault();
    window.clearTimeout(pending);
    location.assign(link.href);
  });

  panel.addEventListener('close', () => {
    if (panel.open) return;
    if (active) {
      active.setAttribute('aria-expanded', 'false');
      if (active.isConnected && !active.closest('[hidden]')) active.focus({ preventScroll: true });
      else workspace.querySelector<HTMLElement>('[data-story-card]:not([hidden]) [data-home-detail-open], [data-home-catalog-empty]:not([hidden]) a')?.focus();
    }
    active = undefined;
    body.replaceChildren();
    if (dock && panel.parentElement !== dock) dock.prepend(panel);
  });
  workspace.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    window.clearTimeout(pending);
    if ((dock || wide.matches) && panel.open) panel.close();
  });
  panel.addEventListener('click', event => {
    if (!dock && !wide.matches && event.target === panel && event.clientY < panel.getBoundingClientRect().top) panel.close();
  });
  wide.addEventListener('change', () => { if (panel.open) panel.close(); });
  workspace.addEventListener('home-catalog-updated', () => {
    if (!panel.open || !active) return;
    if (active.closest('[hidden]')) panel.close();
    else placeInline(active);
  });
}
