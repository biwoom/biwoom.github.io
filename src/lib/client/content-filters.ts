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

function makeFilterPill(label: string, onClear: () => void): HTMLSpanElement {
  const pill = document.createElement('span');
  pill.className = 'ol-design-filter-pill';
  pill.innerHTML = `${label} <button type="button" aria-label="필터 해제">x</button>`;
  pill.querySelector('button')?.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    onClear();
  });
  return pill;
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
  let visibleCount = pageSize || Number.MAX_SAFE_INTEGER;

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
    const matchedSet = new Set(matched);

    cards.forEach(card => {
      card.hidden = true;
    });

    matched.slice(0, visibleCount).forEach(card => {
      card.hidden = false;
    });

    if (empty) empty.hidden = matched.length !== 0;

    if (loadMoreWrap && loadMoreRemaining) {
      const remaining = matched.length - visibleCount;
      loadMoreWrap.hidden = remaining <= 0;
      loadMoreRemaining.textContent = `(${Math.max(remaining, 0)})`;
    }

    cards.forEach(card => {
      card.toggleAttribute('data-filtered-out', !matchedSet.has(card));
    });

    syncControls();
  };

  reset?.addEventListener('click', () => {
    activeTags.clear();
    visibleCount = pageSize || Number.MAX_SAFE_INTEGER;
    apply();
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
      visibleCount = pageSize || Number.MAX_SAFE_INTEGER;
      button.closest('details')?.removeAttribute('open');
      apply();
    });
  });

  activeRow?.addEventListener('click', event => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-clear-prefix]');
    if (!button?.dataset.clearPrefix) return;
    activeTags.delete(button.dataset.clearPrefix);
    visibleCount = pageSize || Number.MAX_SAFE_INTEGER;
    apply();
  });

  loadMoreButton?.addEventListener('click', () => {
    visibleCount += pageSize || cards.length;
    apply();
  });

  document.addEventListener('click', event => closeOutsideDetails(root, event));
  apply();
}

function setupDesignIndexFilter(root: HTMLElement): void {
  if (root.dataset.designFilterReady === 'true') return;
  root.dataset.designFilterReady = 'true';

  const pageSize = Number(root.dataset.pageSize || 12);
  const grid = root.querySelector<HTMLElement>('[data-design-grid]');
  const countEl = root.querySelector<HTMLElement>('[data-design-visible-count]');
  const noResults = root.querySelector<HTMLElement>('[data-design-no-results]');
  const activeFiltersEl = root.querySelector<HTMLElement>('[data-design-active-filters]');
  const loadMoreWrap = root.querySelector<HTMLElement>('[data-design-loadmore-wrap]');
  const loadMoreButton = root.querySelector<HTMLButtonElement>('[data-design-loadmore-button]');
  const loadMoreRemaining = root.querySelector<HTMLElement>('[data-design-loadmore-remaining]');
  const kindLabels = JSON.parse(
    (
      root.querySelector<HTMLScriptElement>('[data-design-kind-labels]')
      ?? document.querySelector<HTMLScriptElement>('[data-design-kind-labels]')
    )?.textContent || '{}',
  ) as Record<string, string>;

  if (!grid || !countEl || !noResults || !activeFiltersEl) return;

  const cards = Array.from(grid.querySelectorAll<HTMLElement>('.ol-design-card'));
  const kindButtons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-filter-kind]'));
  const prefixButtons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-filter-prefix]'));
  const prefixGroups = Array.from(root.querySelectorAll<HTMLElement>('[data-design-prefix]'));
  const resetButtons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-design-reset]'));
  const selectedPrefixTags = new Map<string, Set<string>>();
  let activeKind = 'all';
  let visibleCount = pageSize;

  const matchCard = (card: HTMLElement): boolean => {
    const kind = card.dataset.kind ?? 'infographic';
    const tags = parseCardTags(card);
    if (activeKind !== 'all' && kind !== activeKind) return false;
    return Array.from(selectedPrefixTags.values()).every(group =>
      Array.from(group).some(tag => tags.includes(tag)),
    );
  };

  const syncControls = () => {
    kindButtons.forEach(button => {
      button.classList.toggle('active', button.dataset.filterKind === activeKind);
    });
    prefixButtons.forEach(button => {
      const prefix = button.dataset.filterPrefix;
      const tag = button.dataset.filterTag;
      button.classList.toggle('active', Boolean(prefix && tag && selectedPrefixTags.get(prefix)?.has(tag)));
    });
    prefixGroups.forEach(group => {
      const prefix = group.dataset.designPrefix;
      group.classList.toggle('active', Boolean(prefix && selectedPrefixTags.get(prefix)?.size));
    });
  };

  const updateUrl = () => {
    const nextUrl = new URL(window.location.href);
    if (activeKind !== 'all') nextUrl.searchParams.set('kind', activeKind);
    else nextUrl.searchParams.delete('kind');

    nextUrl.searchParams.delete('tag');
    selectedPrefixTags.forEach(group => {
      group.forEach(tag => nextUrl.searchParams.append('tag', tag));
    });
    window.history.replaceState({}, '', nextUrl);
  };

  const renderFilterPills = () => {
    activeFiltersEl.innerHTML = '';

    if (activeKind !== 'all') {
      activeFiltersEl.appendChild(makeFilterPill(kindLabels[activeKind] ?? activeKind, () => {
        activeKind = 'all';
        applyFilters();
      }));
    }

    selectedPrefixTags.forEach((group, prefix) => {
      group.forEach(tag => {
        activeFiltersEl.appendChild(makeFilterPill(tag, () => {
          const nextGroup = selectedPrefixTags.get(prefix);
          nextGroup?.delete(tag);
          if (nextGroup && nextGroup.size > 0) selectedPrefixTags.set(prefix, nextGroup);
          else selectedPrefixTags.delete(prefix);
          applyFilters();
        }));
      });
    });
  };

  const applyFilters = ({ syncUrl = true } = {}) => {
    const matched = cards.filter(matchCard);
    const unmatched = cards.filter(card => !matchCard(card));

    visibleCount = pageSize;

    matched.forEach((card, index) => {
      card.hidden = index >= visibleCount;
    });
    unmatched.forEach(card => {
      card.hidden = true;
    });

    countEl.textContent = String(matched.length);
    noResults.hidden = matched.length !== 0;

    if (loadMoreWrap && loadMoreRemaining) {
      const remaining = matched.length - visibleCount;
      if (remaining > 0) {
        loadMoreWrap.hidden = false;
        loadMoreRemaining.textContent = `(${remaining})`;
      } else {
        loadMoreWrap.hidden = true;
      }
    }

    renderFilterPills();
    syncControls();
    if (syncUrl) updateUrl();
  };

  kindButtons.forEach(button => {
    button.addEventListener('click', () => {
      activeKind = button.dataset.filterKind ?? 'all';
      applyFilters();
    });
  });

  prefixButtons.forEach(button => {
    button.addEventListener('click', () => {
      const prefix = button.dataset.filterPrefix;
      const tag = button.dataset.filterTag;
      if (!prefix || !tag) return;
      const group = selectedPrefixTags.get(prefix) ?? new Set<string>();
      if (group.has(tag)) group.delete(tag);
      else group.add(tag);

      if (group.size > 0) selectedPrefixTags.set(prefix, group);
      else selectedPrefixTags.delete(prefix);

      applyFilters();
    });
  });

  resetButtons.forEach(button => {
    button.addEventListener('click', () => {
      activeKind = 'all';
      selectedPrefixTags.clear();
      applyFilters();
    });
  });

  loadMoreButton?.addEventListener('click', () => {
    const matched = cards.filter(matchCard);
    visibleCount += pageSize;
    matched.forEach((card, index) => {
      card.hidden = index >= visibleCount;
    });

    const remaining = matched.length - visibleCount;
    if (remaining > 0 && loadMoreRemaining) {
      loadMoreRemaining.textContent = `(${remaining})`;
    } else if (loadMoreWrap) {
      loadMoreWrap.hidden = true;
    }
  });

  const initialParams = new URLSearchParams(window.location.search);
  const initialKind = initialParams.get('kind');
  const initialTags = initialParams.getAll('tag');

  if (initialKind && kindButtons.some(button => button.dataset.filterKind === initialKind)) {
    activeKind = initialKind;
  }

  initialTags.forEach(tag => {
    const button = prefixButtons.find(item => item.dataset.filterTag === tag);
    const prefix = button?.dataset.filterPrefix;
    if (!prefix) return;
    const group = selectedPrefixTags.get(prefix) ?? new Set<string>();
    group.add(tag);
    selectedPrefixTags.set(prefix, group);
  });

  document.addEventListener('click', event => closeOutsideDetails(root, event));
  applyFilters({ syncUrl: false });
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
  const resultsClose = root.querySelector<HTMLButtonElement>('[data-tag-results-close]');
  const selectedTags = new Map<string, string>();

  if (!results) return;

  const closeMenus = () => {
    root.querySelectorAll<HTMLButtonElement>('[data-tag-menu-trigger]').forEach(button => {
      button.setAttribute('aria-expanded', 'false');
    });
  };

  const update = () => {
    const selected = Array.from(selectedTags.keys());
    results.hidden = selected.length === 0;

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

    if (root.dataset.scrollResults === 'true') {
      results.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
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

  resultsClose?.addEventListener('click', () => {
    results.hidden = true;
    closeMenus();
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

export function initDesignIndexFilters(scope: FilterRoot = document): void {
  runOnDomReady(() => {
    scope.querySelectorAll<HTMLElement>('[data-design-filter-root]').forEach(setupDesignIndexFilter);
  });
}

export function initTagResultIndexes(scope: FilterRoot = document): void {
  runOnDomReady(() => {
    scope.querySelectorAll<HTMLElement>('[data-tag-results-index]').forEach(setupTagResultIndex);
  });
}
