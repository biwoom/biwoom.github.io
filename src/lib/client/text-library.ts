export function initTextLibrary() {
  const search = document.querySelector<HTMLInputElement>('#text-material-search');
  if (!search) return;
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
