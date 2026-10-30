import { createPaginator } from './paginated-list';

type FilterRoot = ParentNode & {
  querySelectorAll<T extends Element = Element>(selectors: string): NodeListOf<T>;
};

function parseCardTags(node: HTMLElement): string[] {
  try {
    return JSON.parse(node.dataset.tags || '[]') as string[];
  } catch {
    return (node.dataset.tags || '').split(',').filter(Boolean);
  }
}

function closeOutsideDetails(root: ParentNode, event: Event): void {
  root.querySelectorAll<HTMLDetailsElement>('details[open]').forEach(details => {
    if (!details.contains(event.target as Node)) details.removeAttribute('open');
  });
}

function setupPrefixFilter(root: HTMLElement): void {
  if (root.dataset.filterReady === 'true') return;
  root.dataset.filterReady = 'true';

  const targetSelector = root.dataset.targetSelector;
  if (!targetSelector) return;

  const cards = Array.from(document.querySelectorAll<HTMLElement>(targetSelector));
  const empty = root.dataset.emptySelector
    ? document.querySelector<HTMLElement>(root.dataset.emptySelector)
    : null;
  const pageSize = Number(root.dataset.pageSize || 0);
  const loadMoreWrap = root.dataset.loadmoreWrapSelector
    ? document.querySelector<HTMLElement>(root.dataset.loadmoreWrapSelector)
    : null;
  const loadMoreButton = root.dataset.loadmoreButtonSelector
    ? document.querySelector<HTMLButtonElement>(root.dataset.loadmoreButtonSelector)
    : null;
  const loadMoreRemaining = root.dataset.loadmoreRemainingSelector
    ? document.querySelector<HTMLElement>(root.dataset.loadmoreRemainingSelector)
    : null;
  const reset = root.querySelector<HTMLButtonElement>('[data-filter-reset]');
  const activeRow = root.querySelector<HTMLElement>('[data-filter-active]');
  const activeTags = new Map<string, { tag: string; label: string }>();
  const paginator = createPaginator({
    allItems: cards,
    pageSize: pageSize || cards.length,
    loadMoreWrap,
    loadMoreButton,
    loadMoreRemaining,
    onRender: ({ matchedItems }) => {
      if (empty) empty.hidden = matchedItems.length !== 0;
    },
  });

  const matches = (card: HTMLElement) => {
    const tags = parseCardTags(card);
    return Array.from(activeTags.values()).every(item => tags.includes(item.tag));
  };

  const renderActive = () => {
    if (!activeRow) return;
    activeRow.innerHTML = '';
    activeRow.hidden = activeTags.size === 0;

    activeTags.forEach((item, prefix) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.clearPrefix = prefix;
      button.textContent = `${prefix}/${item.label} ×`;
      activeRow.appendChild(button);
    });
  };

  const syncControls = () => {
    reset?.classList.toggle('active', activeTags.size === 0);
    root.querySelectorAll<HTMLElement>('[data-prefix]').forEach(menu => {
      const prefix = menu.dataset.prefix || '';
      const active = activeTags.get(prefix);
      const label = menu.querySelector<HTMLElement>('[data-prefix-label]');
      if (label) label.textContent = active ? `${prefix}: ${active.label}` : prefix;
      menu.classList.toggle('active', Boolean(active));
      menu.querySelectorAll<HTMLButtonElement>('[data-filter-tag]').forEach(button => {
        button.classList.toggle('active', button.dataset.filterTag === active?.tag);
      });
    });
    renderActive();
  };

  const apply = () => {
    const matched = cards.filter(matches);
    paginator.render(matched);
    syncControls();
  };

  reset?.addEventListener('click', () => {
    activeTags.clear();
    paginator.reset(cards.filter(matches));
    syncControls();
  });

  root.querySelectorAll<HTMLButtonElement>('[data-filter-tag]').forEach(button => {
    button.addEventListener('click', () => {
      const prefix = button.dataset.filterPrefix;
      const tag = button.dataset.filterTag;
      const label = button.dataset.filterLabel || tag;
      if (!prefix || !tag || !label) return;
      const current = activeTags.get(prefix);
      if (current?.tag === tag) {
        activeTags.delete(prefix);
      } else {
        activeTags.set(prefix, { tag, label });
      }
      button.closest('details')?.removeAttribute('open');
      paginator.reset(cards.filter(matches));
      syncControls();
    });
  });

  activeRow?.addEventListener('click', event => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-clear-prefix]');
    if (!button?.dataset.clearPrefix) return;
    activeTags.delete(button.dataset.clearPrefix);
    paginator.reset(cards.filter(matches));
    syncControls();
  });

  document.addEventListener('click', event => closeOutsideDetails(root, event));
  apply();
}

function setupTagResultIndex(root: HTMLElement): void {
  if (root.dataset.tagIndexReady === 'true') return;
  root.dataset.tagIndexReady = 'true';

  const results = root.querySelector<HTMLElement>('[data-tag-results]');
  const resultsTitle = root.querySelector<HTMLElement>('[data-tag-results-title]');
  const resultsCount = root.querySelector<HTMLElement>('[data-tag-results-count]');
  const selectedTagsRow = root.querySelector<HTMLElement>('[data-selected-tags]');
  const resultsEmpty = root.querySelector<HTMLElement>('[data-tag-results-empty]');
  const resultsClear = root.querySelector<HTMLButtonElement>('[data-tag-results-clear]');
  const resultsCloseButtons = Array.from(
    root.querySelectorAll<HTMLButtonElement>('[data-tag-results-close]'),
  );
  const selectedTags = new Map<string, string>();

  if (!results) return;

  const syncModalState = (open: boolean) => {
    document.documentElement.classList.toggle('ol-tag-results-open', open);
  };

  const closeMenus = () => {
    root.querySelectorAll<HTMLButtonElement>('[data-tag-menu-trigger]').forEach(button => {
      button.setAttribute('aria-expanded', 'false');
    });
  };

  const update = () => {
    const selected = Array.from(selectedTags.keys());
    const open = selected.length > 0;
    results.hidden = !open;
    syncModalState(open);

    if (resultsTitle) {
      resultsTitle.textContent = selected.length > 0 ? `선택 태그 ${selected.length}개` : '태그 문서';
    }

    if (selectedTagsRow) {
      selectedTagsRow.innerHTML = '';
      selectedTags.forEach((label, tag) => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.dataset.tagRemove = tag;
        chip.textContent = `${label} ×`;
        selectedTagsRow.appendChild(chip);
      });
    }

    let visibleCount = 0;
    results.querySelectorAll<HTMLElement>('[data-tag-result-entry]').forEach(entry => {
      const tags = parseCardTags(entry);
      const visible = selected.every(tag => tags.includes(tag));
      entry.hidden = !visible;
      if (visible) visibleCount += 1;
    });

    results.querySelectorAll<HTMLElement>('[data-tag-result-group]').forEach(group => {
      group.hidden = !group.querySelector('[data-tag-result-entry]:not([hidden])');
    });

    results.querySelectorAll<HTMLElement>('[data-tag-result-part]').forEach(part => {
      part.hidden = !part.querySelector('[data-tag-result-group]:not([hidden])');
    });

    if (resultsCount) resultsCount.textContent = `${visibleCount}개 문서`;
    if (resultsEmpty) resultsEmpty.hidden = visibleCount > 0;

    root.querySelectorAll<HTMLButtonElement>('[data-tag-select]').forEach(button => {
      button.classList.toggle('active', selectedTags.has(button.dataset.tagValue ?? ''));
    });

    closeMenus();
  };

  root.addEventListener('click', event => {
    const trigger = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-tag-menu-trigger]');
    if (trigger) {
      event.stopPropagation();
      const open = trigger.getAttribute('aria-expanded') === 'true';
      closeMenus();
      trigger.setAttribute('aria-expanded', String(!open));
      return;
    }

    const tagButton = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-tag-select]');
    if (!tagButton) return;
    event.stopPropagation();
    const tag = tagButton.dataset.tagValue;
    if (!tag) return;

    if (selectedTags.has(tag)) selectedTags.delete(tag);
    else selectedTags.set(tag, tagButton.dataset.tagLabel ?? tag);

    update();
  });

  selectedTagsRow?.addEventListener('click', event => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-tag-remove]');
    if (!button?.dataset.tagRemove) return;
    selectedTags.delete(button.dataset.tagRemove);
    update();
  });

  resultsClear?.addEventListener('click', () => {
    selectedTags.clear();
    update();
  });

  resultsCloseButtons.forEach(button => {
    button.addEventListener('click', () => {
      results.hidden = true;
      syncModalState(false);
      closeMenus();
    });
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !results.hidden) {
      results.hidden = true;
      syncModalState(false);
      closeMenus();
    }
  });

  document.addEventListener('click', closeMenus);
}

function runOnDomReady(callback: () => void): void {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback, { once: true });
    return;
  }

  callback();
}

export function initPrefixFilters(scope: FilterRoot = document): void {
  runOnDomReady(() => {
    scope.querySelectorAll<HTMLElement>('[data-prefix-filter]').forEach(setupPrefixFilter);
  });
}

export function initTagResultIndexes(scope: FilterRoot = document): void {
  runOnDomReady(() => {
    scope.querySelectorAll<HTMLElement>('[data-tag-results-index]').forEach(setupTagResultIndex);
  });
}
