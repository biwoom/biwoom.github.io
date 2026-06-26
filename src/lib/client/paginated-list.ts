type PaginatedItem = HTMLElement;

interface CreatePaginatorOptions {
  allItems: PaginatedItem[];
  pageSize: number;
  loadMoreWrap?: HTMLElement | null;
  loadMoreButton?: HTMLButtonElement | null;
  loadMoreRemaining?: HTMLElement | null;
  onRender?: (state: {
    matchedItems: PaginatedItem[];
    visibleItems: PaginatedItem[];
    hiddenItems: PaginatedItem[];
    remaining: number;
    visibleCount: number;
  }) => void;
}

export interface Paginator {
  render: (matchedItems?: PaginatedItem[], options?: { reset?: boolean }) => void;
  reset: (matchedItems?: PaginatedItem[]) => void;
  showMore: () => void;
  revealThrough: (item: PaginatedItem) => void;
  getVisibleCount: () => number;
}

function updateLoadMoreUi(
  loadMoreWrap: HTMLElement | null | undefined,
  loadMoreRemaining: HTMLElement | null | undefined,
  remaining: number,
): void {
  if (!loadMoreWrap || !loadMoreRemaining) return;
  loadMoreWrap.hidden = remaining <= 0;
  loadMoreRemaining.textContent = `(${Math.max(remaining, 0)})`;
}

export function createPaginator({
  allItems,
  pageSize,
  loadMoreWrap,
  loadMoreButton,
  loadMoreRemaining,
  onRender,
}: CreatePaginatorOptions): Paginator {
  const step = Math.max(pageSize, 1);
  let visibleCount = step;
  let currentMatched = allItems;

  const applyVisibility = () => {
    const matchedSet = new Set(currentMatched);
    const visibleItems = currentMatched.slice(0, visibleCount);
    const visibleSet = new Set(visibleItems);
    const hiddenItems = currentMatched.filter(item => !visibleSet.has(item));

    allItems.forEach(item => {
      item.hidden = !visibleSet.has(item);
      item.toggleAttribute('data-filtered-out', !matchedSet.has(item));
    });

    const remaining = currentMatched.length - visibleCount;
    updateLoadMoreUi(loadMoreWrap, loadMoreRemaining, remaining);
    onRender?.({
      matchedItems: currentMatched,
      visibleItems,
      hiddenItems,
      remaining: Math.max(remaining, 0),
      visibleCount,
    });
  };

  const render = (matchedItems: PaginatedItem[] = currentMatched, options?: { reset?: boolean }) => {
    currentMatched = matchedItems;
    if (options?.reset) visibleCount = step;
    applyVisibility();
  };

  const reset = (matchedItems: PaginatedItem[] = currentMatched) => {
    render(matchedItems, { reset: true });
  };

  const showMore = () => {
    visibleCount += step;
    applyVisibility();
  };

  const revealThrough = (item: PaginatedItem) => {
    const index = currentMatched.indexOf(item);
    if (index < 0 || index < visibleCount) return;
    visibleCount = Math.ceil((index + 1) / step) * step;
    applyVisibility();
  };

  loadMoreButton?.addEventListener('click', showMore);

  return {
    render,
    reset,
    showMore,
    revealThrough,
    getVisibleCount: () => visibleCount,
  };
}

export function initStaticPaginatedLists(scope: ParentNode = document): void {
  scope.querySelectorAll<HTMLElement>('[data-paginated-list]').forEach(root => {
    if (root.dataset.paginationReady === 'true') return;
    root.dataset.paginationReady = 'true';

    const pageSize = Number(root.dataset.pageSize || 0);
    const allItems = Array.from(root.querySelectorAll<PaginatedItem>('[data-page-item]'));
    if (!allItems.length || pageSize <= 0) return;

    const loadMoreWrap = root.querySelector<HTMLElement>('[data-loadmore-wrap]');
    const loadMoreButton = root.querySelector<HTMLButtonElement>('[data-loadmore-button]');
    const loadMoreRemaining = root.querySelector<HTMLElement>('[data-loadmore-remaining]');
    const empty = root.querySelector<HTMLElement>('[data-page-empty]');

    const paginator = createPaginator({
      allItems,
      pageSize,
      loadMoreWrap,
      loadMoreButton,
      loadMoreRemaining,
      onRender: ({ matchedItems }) => {
        if (empty) empty.hidden = matchedItems.length !== 0;
      },
    });

    paginator.reset(allItems);
  });
}
