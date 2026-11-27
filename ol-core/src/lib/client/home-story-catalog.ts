import { storyBookmarkIds } from './story-bookmarks';
import { createPaginator } from './paginated-list';

const root = document.querySelector<HTMLElement>('[data-home-catalog]');
if (root) {
  const form = root.querySelector<HTMLFormElement>('[data-home-catalog-search]')!;
  const input = form.querySelector('input')!;
  const title = root.querySelector<HTMLElement>('[data-home-catalog-title]')!;
  const count = root.querySelector<HTMLElement>('[data-home-catalog-count]')!;
  const grid = root.querySelector<HTMLElement>('[data-home-catalog-grid]')!;
  const empty = root.querySelector<HTMLElement>('[data-home-catalog-empty]')!;
  const note = empty.querySelector<HTMLElement>('[data-home-empty-note]')!;
  const filters = [...root.querySelectorAll<HTMLButtonElement>('[data-home-filter]')];
  const heroForm = document.querySelector<HTMLFormElement>('[data-home-hero-search]');
  const heroInput = heroForm?.querySelector('input');
  const viewButtons = [...root.querySelectorAll<HTMLButtonElement>('[data-home-view]')];
  const sortButtons = [...root.querySelectorAll<HTMLButtonElement>('[data-home-sort]')];
  const cards = [...grid.querySelectorAll<HTMLElement>('[data-story-card]')]
    .sort((a, b) => Number(a.dataset.storyRank) - Number(b.dataset.storyRank));
  const saved = root.dataset.homeCatalog === 'saved';
  const noteText = note.textContent;
  const loadMore = root.querySelector<HTMLButtonElement>('[data-loadmore-button]');
  const paginator = createPaginator({
    allItems: cards,
    pageSize: Number(root.dataset.pageSize),
    loadMoreWrap: root.querySelector('[data-loadmore-wrap]'),
    loadMoreRemaining: root.querySelector('[data-loadmore-remaining]'),
    onRender({ matchedItems, visibleItems }) {
      visibleItems.forEach((card, index) => {
        if (grid.children[index] !== card) grid.insertBefore(card, grid.children[index] ?? null);
      });
      const total = matchedItems.length;
      count.textContent = visibleItems.length < total ? `${visibleItems.length} / ${total}편` : `${total}편`;
      grid.hidden = total === 0;
      empty.hidden = total !== 0;
      root.dispatchEvent(new Event('home-catalog-updated', { bubbles: true }));
    },
  });
  loadMore?.addEventListener('click', () => {
    const next = paginator.getVisibleCount();
    paginator.showMore();
    grid.querySelectorAll<HTMLElement>('[data-story-card]:not([hidden])')[next]
      ?.querySelector<HTMLAnchorElement>('.ol-postcard-link')?.focus();
  });
  const filterForHash = () => filters.find(button => button.dataset.homeFilter && button.dataset.homeFilter === location.hash.slice(1));
  let filter = filterForHash();
  let sort = sortButtons[0]?.dataset.homeSort;
  const normalize = (value: string) => value.normalize('NFC').toLocaleLowerCase('ko');

  const render = (reset = true) => {
    const terms = normalize(input.value.trim()).split(/\s+/).filter(Boolean);
    const savedIds = storyBookmarkIds();
    const matches = cards.filter(card => {
      const id = card.dataset.storyCard ?? '';
      const search = normalize(card.dataset.storySearch ?? '');
      const key = filter?.dataset.homeFilter;
      const matchesGroup = !key || (filter?.hasAttribute('data-home-filter-tag')
        ? card.dataset.storyTopicTags?.split(' ').includes(key)
        : card.dataset.storyTopic === key);
      return (!saved || savedIds.includes(id)) && matchesGroup && terms.every(term => search.includes(term));
    });
    if (sort === 'title') {
      matches.sort((a, b) => (a.dataset.storyTitle ?? '').localeCompare(b.dataset.storyTitle ?? '', 'ko'));
    } else if (sort) {
      const date = sort === 'created' ? 'storyCreatedAt' : 'storyPublishedAt';
      matches.sort((a, b) => (b.dataset[date] ?? '').localeCompare(a.dataset[date] ?? ''));
    }
    for (const button of filters) button.setAttribute('aria-pressed', String(filter ? button === filter : !button.dataset.homeFilter));
    title.textContent = terms.length ? '검색 결과' : filter?.dataset.filterTitle ?? title.dataset.homeCatalogTitle ?? '';
    note.textContent = terms.length ? '검색어와 일치하는 이야기가 없습니다.' : noteText;
    paginator.render(matches, { reset });
  };

  for (const button of filters) button.addEventListener('click', () => {
    filter = button.dataset.homeFilter && (filter !== button || input.value) ? button : undefined;
    input.value = '';
    const address = new URL(location.href);
    address.hash = filter?.dataset.homeFilter ?? '';
    history.replaceState(history.state, '', address);
    render();
  });
  window.addEventListener('hashchange', () => {
    filter = filterForHash();
    render();
  });
  for (const button of viewButtons) button.addEventListener('click', () => {
    grid.dataset.view = button.dataset.homeView;
    for (const item of viewButtons) item.setAttribute('aria-pressed', String(item === button));
  });
  for (const button of sortButtons) button.addEventListener('click', () => {
    sort = button.dataset.homeSort;
    for (const item of sortButtons) item.setAttribute('aria-pressed', String(item === button));
    render();
  });
  if (heroForm && heroInput) {
    input.value = new URLSearchParams(location.search).get('q') ?? '';
    heroInput.value = input.value;
    heroForm.addEventListener('submit', event => {
      event.preventDefault();
      input.value = heroInput.value.trim();
      const address = new URL(location.href);
      if (input.value) address.searchParams.set('q', input.value);
      else address.searchParams.delete('q');
      address.hash = title.id;
      history.replaceState(history.state, '', address);
      render();
      title.focus({ preventScroll: true });
      title.scrollIntoView({ block: 'start' });
    });
  }
  input.addEventListener('input', () => {
    if (heroInput) heroInput.value = input.value;
    render();
  });
  form.addEventListener('submit', event => { event.preventDefault(); render(); });
  if (saved) document.addEventListener('home-bookmarks-updated', () => render(false));
  render();
}
