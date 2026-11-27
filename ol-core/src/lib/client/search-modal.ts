import {
  bestPagefindPassage, findCatalogRecords, findOriginalPassages, hasHan, isSearchSection, searchKey, searchLocationKey,
  searchSectionLabels, searchUrl,
  type CatalogRecord, type OriginalDocument, type SearchFilter, type SearchResult,
} from '../search.mjs';
import { BRAND } from '../site-config';
import { url } from '../url';

type PagefindDetail = {
  url: string;
  excerpt: string;
  meta: Record<string, string | undefined>;
  sub_results?: { url: string; excerpt: string; plain_excerpt?: string; anchor?: { id: string } }[];
};
type PagefindHandle = { data(): Promise<PagefindDetail> };
type Pagefind = {
  options(options: { baseUrl: string }): Promise<void>;
  init(): Promise<void>;
  search(query: string, options?: { filters: { section: string } }): Promise<{ results: PagefindHandle[] }>;
};

type Source = 'catalog' | 'originals' | 'body';
type Group = { rows: SearchResult[]; limit: number; busy: boolean; error?: string };
type BodyGroup = Group & { handles: PagefindHandle[]; offset: number };
type Search = {
  query: string;
  groups: { catalog: Group; originals?: Group; body?: BodyGroup };
};
const sourceOrder = ['originals', 'catalog', 'body'] as const;
const labels = { catalog: '작품·제목·태그', originals: '한문 원문', body: '본문' };
const batch = 8;
const newGroup = (): Group => ({ rows: [], limit: batch, busy: true });

function lazy<T>(load: () => Promise<T>) {
  let pending: Promise<T> | undefined;
  return () => pending ??= load().catch(error => {
    pending = undefined;
    throw error;
  });
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Search request failed with ${response.status}`);
  return response.json();
}

function escape(value: string) {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]!);
}

function excerptMarkup(result: SearchResult) {
  if (result.match) {
    const [before, match, after] = result.match.map(escape);
    return `${before}<mark>${match}</mark>${after}`;
  }
  if (!result.excerpt) return '';
  const template = document.createElement('template');
  template.innerHTML = result.excerpt;
  return [...template.content.childNodes].map(node => {
    const text = escape(node.textContent ?? '');
    return node.nodeName === 'MARK' ? `<mark>${text}</mark>` : text;
  }).join('');
}

function bodyResult(detail: PagefindDetail, query: string): SearchResult {
  const sub = bestPagefindPassage(detail.sub_results, query);
  const href = searchUrl(sub?.anchor?.id ? sub.url : detail.url);
  const { id, section, title, breadcrumb, series, part, category } = detail.meta;
  return {
    id: id ?? searchUrl(detail.url),
    kind: 'document',
    section: isSearchSection(section) ? section : undefined,
    title: title || '제목 없음',
    url: href,
    context: breadcrumb || [series, part || category].filter(Boolean).join(' · '),
    excerpt: sub?.excerpt || detail.excerpt,
  };
}

export function initSearchModal() {
  const overlay = document.querySelector<HTMLElement>('#ol-search-overlay')!;
  const input = overlay.querySelector<HTMLInputElement>('#ol-search-input')!;
  const filters = overlay.querySelector<HTMLElement>('[data-search-filters]')!;
  const bodyToggle = filters.querySelector<HTMLButtonElement>('[data-search-body]')!;
  const results = overlay.querySelector<HTMLElement>('#ol-search-results')!;
  const trigger = document.getElementById('ol-search-trigger');
  const loadCatalog = lazy(() => fetchJson<CatalogRecord[]>(overlay.dataset.searchCatalog!));
  const loadOriginals = lazy(() => fetchJson<OriginalDocument[]>(overlay.dataset.searchOriginals!));
  const loadPagefind = lazy(async () => {
    const pagefind: Pagefind = await import(/* @vite-ignore */ overlay.dataset.pagefindPath!);
    await pagefind.options({ baseUrl: url('/') });
    await pagefind.init();
    return pagefind;
  });

  let filter: SearchFilter = 'ALL';
  let bodyEnabled = false;
  let active: Search | undefined;
  let timer: ReturnType<typeof setTimeout>;
  let composing = false;
  let returnFocus: HTMLElement | null = null;

  function select(link?: HTMLAnchorElement) {
    results.querySelector('.ol-search-result.active')?.classList.remove('active');
    link?.classList.add('active');
  }

  function render(run: Search) {
    const selected = results.querySelector<HTMLAnchorElement>('.ol-search-result.active')?.getAttribute('href');
    const focused = document.activeElement;
    const focusedMore = focused instanceof HTMLElement ? focused.dataset.searchMore : undefined;
    const focusedHref = focused instanceof HTMLAnchorElement && results.contains(focused) ? focused.getAttribute('href') : undefined;
    const seen = new Set<string>();
    const bodyDetails = new Map(run.groups.body?.rows.map(row => [searchLocationKey(row.url), row]));
    const lists = sourceOrder.map(source => {
      const group = run.groups[source];
      if (!group) return '';
      const body = source === 'body' ? run.groups.body : undefined;
      const total = body?.handles.length ?? group.rows.length;
      const more = (body?.offset ?? group.limit) < total;
      const cards = group.rows.slice(0, group.limit).map(result => {
        const key = searchLocationKey(result.url);
        if (seen.has(key)) return '';
        seen.add(key);
        const section = result.section ? searchSectionLabels[result.section] : BRAND.name;
        const context = [result.kind === 'work' && '작품 목차', result.work, result.context]
          .filter(Boolean).join(' · ');
        const snippet = excerptMarkup(source === 'catalog' ? bodyDetails.get(key) ?? result : result);
        return `
          <a href="${escape(result.url)}" class="ol-search-result">
            <span class="ol-search-result-meta">
              <span class="ol-search-result-section">${escape(section)}</span>
              ${context ? `<span class="ol-search-result-breadcrumb">${escape(context)}</span>` : ''}
            </span>
            <span class="ol-search-result-title">${escape(result.title)}</span>
            <span class="ol-search-result-path">${escape(result.url.split('#')[0])}</span>
            ${snippet ? `<span class="ol-search-result-excerpt">${snippet}</span>` : ''}
          </a>`;
      }).join('');
      if (!cards && !more && !group.busy && !group.error && !(body && !total)) return '';
      const status = group.error || (group.busy && !cards ? '불러오는 중…' : body && !total ? '일치하는 본문이 없습니다' : '');
      return `
        <section class="ol-search-group">
          <h2>${labels[source]}${total ? ` <span>${total}건</span>` : ''}</h2>
          <div class="ol-search-result-list">${cards}</div>
          ${status ? `<p class="ol-search-status" role="status">${status}</p>` : ''}
          ${more ? `<button class="ol-search-filter ol-search-more" type="button" data-search-more="${source}"
            aria-disabled="${group.busy}">${group.busy ? '불러오는 중…' : `${labels[source]} 더 보기`}</button>` : ''}
        </section>`;
    }).join('');
    results.innerHTML = lists || '<div class="ol-search-empty" role="status">검색 결과가 없습니다</div>';
    const links = [...results.querySelectorAll<HTMLAnchorElement>('.ol-search-result')];
    select(links.find(link => link.getAttribute('href') === selected) ?? links[0]);
    if (focusedMore) {
      (results.querySelector<HTMLButtonElement>(`[data-search-more="${focusedMore}"]`) ?? input).focus();
    } else if (focusedHref) {
      (links.find(link => link.getAttribute('href') === focusedHref) ?? input).focus();
    }
  }

  async function showBodyBatch(run: Search, group: BodyGroup) {
    group.busy = true;
    group.error = undefined;
    render(run);
    const handles = group.handles.slice(group.offset, group.offset + batch);
    const settled = await Promise.allSettled(handles.map(async handle => bodyResult(await handle.data(), run.query)));
    if (active !== run || run.groups.body !== group) return;
    for (const item of settled) {
      if (item.status === 'fulfilled') group.rows.push(item.value);
      else group.error = '본문 발췌 일부를 불러올 수 없습니다';
    }
    group.offset += handles.length;
    group.limit = group.rows.length;
    group.busy = false;
    render(run);
  }

  async function startBodySearch(run: Search, scope: SearchFilter) {
    const body: BodyGroup = { ...newGroup(), handles: [], offset: 0 };
    run.groups.body = body;
    render(run);
    try {
      const pagefind = await loadPagefind();
      if (active !== run || run.groups.body !== body) return;
      const match = await pagefind.search(searchKey(run.query), scope === 'ALL' ? undefined : { filters: { section: scope } });
      if (active !== run || run.groups.body !== body) return;
      body.handles = match.results;
      await showBodyBatch(run, body);
    } catch {
      if (active !== run || run.groups.body !== body) return;
      body.busy = false;
      body.error = '본문 검색을 불러올 수 없습니다';
      render(run);
    }
  }

  function startSearch(query: string, scope: SearchFilter) {
    const catalog = newGroup();
    const originals = hasHan(query) && (scope === 'ALL' || scope === 'TEXT') ? newGroup() : undefined;
    const run: Search = { query, groups: { catalog, originals } };
    active = run;
    render(run);
    async function populate(target: Group, items: () => Promise<SearchResult[]>, error: string) {
      try { target.rows = await items(); }
      catch { target.error = error; }
      finally {
        target.busy = false;
        if (active === run) render(run);
      }
    }
    if (originals) {
      void populate(originals, async () => findOriginalPassages(await loadOriginals(), query),
        '한문 원문 색인을 불러올 수 없습니다');
    }
    void populate(catalog, async () => findCatalogRecords(await loadCatalog(), query, scope),
      '제목·태그 색인을 불러올 수 없습니다');
    if (bodyEnabled) void startBodySearch(run, scope);
  }

  function cancelPending() {
    clearTimeout(timer);
    active = undefined;
  }

  function queueSearch(delay = 200) {
    cancelPending();
    const query = input.value.trim();
    filters.hidden = !query;
    results.innerHTML = `<div class="ol-search-empty" role="status">${query ? '검색 중…' : '검색어를 입력하세요'}</div>`;
    if (query) timer = setTimeout(() => startSearch(query, filter), delay);
  }

  function setFilter(next: SearchFilter) {
    filter = next;
    for (const button of filters.querySelectorAll<HTMLButtonElement>('[data-search-section]')) {
      const selected = button.dataset.searchSection === filter;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    }
  }

  function open() {
    if (!overlay.hidden) return;
    returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : trigger;
    overlay.hidden = false;
    overlay.inert = false;
    overlay.setAttribute('aria-hidden', 'false');
    input.value = '';
    bodyEnabled = false;
    bodyToggle.setAttribute('aria-pressed', 'false');
    setFilter('ALL');
    queueSearch();
    input.focus();
  }

  function close() {
    if (overlay.hidden) return;
    cancelPending();
    composing = false;
    overlay.hidden = true;
    overlay.inert = true;
    overlay.setAttribute('aria-hidden', 'true');
    if (returnFocus && returnFocus !== document.body && returnFocus.isConnected) returnFocus.focus();
    else trigger?.focus();
  }

  input.addEventListener('compositionstart', () => { composing = true; cancelPending(); });
  input.addEventListener('compositionend', () => { composing = false; if (!overlay.hidden) queueSearch(); });
  input.addEventListener('input', event => {
    if (!composing && !(event as InputEvent).isComposing) queueSearch();
  });
  input.addEventListener('keydown', event => {
    if (composing || event.isComposing) return;
    const items = [...results.querySelectorAll<HTMLAnchorElement>('.ol-search-result')];
    const index = items.findIndex(item => item.classList.contains('active'));
    if (event.key === 'Enter' && items[index]) {
      event.preventDefault();
      items[index].click();
    } else if (items.length && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      event.preventDefault();
      const next = Math.max(0, Math.min(items.length - 1, index + (event.key === 'ArrowDown' ? 1 : -1)));
      select(items[next]);
      items[next].scrollIntoView({ block: 'nearest' });
    }
  });
  filters.addEventListener('click', event => {
    const section = (event.target as Element).closest<HTMLElement>('[data-search-section]')?.dataset.searchSection;
    if ((section === 'ALL' || isSearchSection(section)) && section !== filter) {
      setFilter(section);
      if (!composing) queueSearch(0);
    }
  });
  bodyToggle.addEventListener('click', () => {
    const query = input.value.trim();
    if (!query) return;
    bodyEnabled = !bodyEnabled;
    bodyToggle.setAttribute('aria-pressed', String(bodyEnabled));
    if (composing) return;
    if (active?.query !== query) {
      queueSearch(0);
    } else if (bodyEnabled) {
      void startBodySearch(active, filter);
    } else {
      delete active.groups.body;
      render(active);
    }
  });
  results.addEventListener('click', event => {
    const target = event.target as Element;
    if (target.closest('.ol-search-result')) close();
    const source = target.closest<HTMLElement>('[data-search-more]')?.dataset.searchMore as Source | undefined;
    const group = source && active?.groups[source];
    if (!active || !group || group.busy) return;
    if (source === 'body' && active.groups.body) void showBodyBatch(active, active.groups.body);
    else {
      group.limit += batch;
      render(active);
    }
  });
  document.addEventListener('keydown', event => {
    if (event.isComposing || composing) return;
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (overlay.hidden) open();
      else close();
    } else if (event.key === 'Escape' && !overlay.hidden) {
      event.preventDefault();
      close();
    } else if (event.key === 'Tab' && !overlay.hidden) {
      const controls = [...overlay.querySelectorAll<HTMLElement>('input, a[href], button')].filter(control => !control.closest('[hidden]'));
      const [first] = controls;
      const last = controls.at(-1);
      if (document.activeElement === (event.shiftKey ? first : last)) {
        event.preventDefault();
        (event.shiftKey ? last : first)?.focus();
      }
    }
  });
  overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
  trigger?.addEventListener('click', open);
}
