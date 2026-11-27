export function initTextLibrary() {
  const search = document.querySelector<HTMLInputElement>('#text-material-search');
  if (!search) return;
  const form = search.form;
  form?.addEventListener('submit', event => event.preventDefault());
  if (form?.dataset.textMaterialCatalog) {
    initCatalogSearch(form, search, form.dataset.textMaterialCatalog);
    return;
  }
  const groups = [...document.querySelectorAll<HTMLDetailsElement>('[data-text-material-group]')];
  const items = [...document.querySelectorAll<HTMLElement>('[data-text-material-item]')];
  const status = document.querySelector<HTMLElement>('[data-text-search-status]');
  const empty = document.querySelector<HTMLElement>('[data-text-search-empty]');
  const beforeSearch = new Map<HTMLDetailsElement, boolean>();
  let searching = false;
  const filter = () => {
    const query = search.value.trim().normalize('NFC').toLocaleLowerCase('ko');
    if (query && !searching) groups.forEach(group => beforeSearch.set(group, group.open));
    let count = 0;
    items.forEach(item => {
      item.hidden = !((item.dataset.searchText ?? '').normalize('NFC').toLocaleLowerCase('ko').includes(query));
      if (!item.hidden) count++;
    });
    groups.forEach(group => {
      const matched = [...group.querySelectorAll<HTMLElement>('[data-text-material-item]')].filter(item => !item.hidden).length;
      group.hidden = matched === 0;
      if (query && matched) group.open = true;
      else if (!query && searching) group.open = beforeSearch.get(group) ?? true;
      const label = group.querySelector('[data-text-group-count]');
      if (label) label.textContent = `${matched}개 자료`;
    });
    if (status) status.textContent = `${count}개 자료`;
    if (empty) empty.hidden = count !== 0;
    searching = !!query;
  };
  search.addEventListener('input', filter);
  document.querySelector('[data-text-search-reset]')?.addEventListener('click', () => {
    search.value = ''; filter(); search.focus();
  });
}

interface Material {
  title: string;
  description: string;
  url: string;
  part: string;
}

function initCatalogSearch(form: HTMLFormElement, search: HTMLInputElement, catalogUrl: string) {
  const status = form.querySelector<HTMLElement>('[data-text-search-status]')!;
  const initialStatus = status.textContent;
  const directory = document.querySelector<HTMLElement>('[data-text-material-directory]')!;
  const results = document.querySelector<HTMLElement>('[data-text-material-results]')!;
  const list = results.querySelector<HTMLOListElement>('[data-text-material-matches]')!;
  const pagination = results.querySelector<HTMLElement>('[data-text-result-pages]')!;
  const label = pagination.querySelector<HTMLElement>('[data-text-result-page]')!;
  const prev = pagination.querySelector<HTMLButtonElement>('[data-text-result-prev]')!;
  const next = pagination.querySelector<HTMLButtonElement>('[data-text-result-next]')!;
  const empty = document.querySelector<HTMLElement>('[data-text-search-empty]')!;
  const pageSize = Number(form.dataset.pageSize);
  const searchKey = (value: string) => value.trim().normalize('NFC').toLocaleLowerCase('ko');
  let catalog: Promise<Material[]> | undefined;
  let matches: Material[] = [];
  let page = 0;
  let revision = 0;

  function renderPage() {
    const count = Math.ceil(matches.length / pageSize);
    list.replaceChildren(...matches.slice(page * pageSize, (page + 1) * pageSize).map(item => {
      const row = document.createElement('li');
      const link = document.createElement('a');
      const copy = document.createElement('div');
      const title = document.createElement('strong');
      const description = document.createElement('p');
      link.href = item.url;
      title.textContent = item.title;
      description.textContent = [item.part, item.description].filter(Boolean).join(' · ');
      copy.append(title, description);
      link.append(copy);
      row.append(link);
      return row;
    }));
    prev.disabled = page === 0;
    next.disabled = page + 1 >= count;
    label.textContent = `${page + 1} / ${count}`;
    pagination.hidden = count < 2;
    results.hidden = !matches.length;
  }

  async function filter() {
    const current = ++revision;
    const query = searchKey(search.value);
    empty.hidden = true;
    results.hidden = true;
    directory.hidden = Boolean(query);
    if (!query) {
      status.textContent = initialStatus;
      return;
    }
    status.textContent = '자료를 불러오는 중입니다.';
    try {
      catalog ??= fetch(catalogUrl).then(response => {
        if (!response.ok) throw new Error('Material catalog unavailable');
        return response.json() as Promise<Material[]>;
      }).catch(error => {
        catalog = undefined;
        throw error;
      });
      const items = await catalog;
      if (current !== revision) return;
      matches = items.filter(item => searchKey(`${item.title} ${item.description}`).includes(query));
      page = 0;
      status.textContent = `${matches.length}개 자료`;
      empty.hidden = matches.length > 0;
      renderPage();
    } catch {
      if (current !== revision) return;
      directory.hidden = false;
      status.textContent = '자료 검색을 불러오지 못했습니다. Enter를 눌러 다시 시도해 주세요.';
    }
  }

  search.addEventListener('input', event => {
    if (!(event as InputEvent).isComposing) void filter();
  });
  form.addEventListener('submit', () => void filter());
  form.querySelector('[data-text-search-reset]')?.addEventListener('click', () => {
    search.value = '';
    void filter();
    search.focus();
  });
  prev.addEventListener('click', () => { page--; renderPage(); (prev.disabled ? next : prev).focus(); });
  next.addEventListener('click', () => { page++; renderPage(); (next.disabled ? prev : next).focus(); });
  form.hidden = false;
  form.inert = false;
}
