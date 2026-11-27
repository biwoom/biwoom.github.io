const preview = document.querySelector<HTMLElement>('[data-home-preview]');
const tablist = preview?.querySelector<HTMLElement>('[data-home-preview-tabs]');
const controls = preview?.querySelector<HTMLElement>('[data-home-preview-controls]');
if (preview && tablist && controls) {
  const tabs = [...tablist.querySelectorAll<HTMLAnchorElement>('a')];
  const panels = [...preview.querySelectorAll<HTMLElement>('[data-home-preview-panel]')];
  const status = controls.querySelector<HTMLElement>('[data-home-preview-status]');
  const desktop = matchMedia('(min-width: 760px)');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const rotationDelay = 8000;
  let selected = 0;
  let hovering = matchMedia('(hover: hover)').matches && preview.matches(':hover');
  let inView = typeof IntersectionObserver !== 'function';
  let timer = 0;

  const schedule = () => {
    window.clearTimeout(timer);
    const focus = document.activeElement;
    const interacting = preview.contains(focus) &&
      (focus?.closest('[data-home-preview-panel]') || focus?.matches(':focus-visible'));
    if (motion.matches || hovering || !inView || document.hidden || interacting) return;
    timer = window.setTimeout(() => move(1), rotationDelay);
  };

  const select = (index: number) => {
    selected = index;
    tabs.forEach((tab, position) => {
      const active = position === selected;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      panels[position].hidden = !active;
    });
    if (!desktop.matches) {
      const viewport = tablist.getBoundingClientRect();
      const activeTab = tabs[index].getBoundingClientRect();
      if (activeTab.left < viewport.left) tablist.scrollLeft += activeTab.left - viewport.left;
      else if (activeTab.right > viewport.right) tablist.scrollLeft += activeTab.right - viewport.right;
    }
    schedule();
  };

  const move = (step: number, announce = false) => {
    select((selected + step + tabs.length) % tabs.length);
    if (announce && status) status.textContent = tabs[selected].textContent?.trim() ?? '';
  };

  const updateOrientation = () => tablist.setAttribute('aria-orientation', desktop.matches ? 'vertical' : 'horizontal');
  const selectFragment = () => {
    const index = tabs.findIndex(tab => tab.hash === location.hash);
    if (index >= 0) select(index);
  };

  tablist.setAttribute('role', 'tablist');
  tablist.setAttribute('aria-labelledby', 'ol-preview-title');
  updateOrientation();
  desktop.addEventListener('change', updateOrientation);
  tablist.addEventListener('focusout', event => {
    if (event.relatedTarget instanceof Node && tablist.contains(event.relatedTarget)) return;
    tabs.forEach((tab, index) => { tab.tabIndex = index === selected ? 0 : -1; });
  });
  tabs.forEach((tab, index) => {
    const panel = panels[index];
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panel.id);
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.tabIndex = 0;

    tab.addEventListener('focus', () => {
      tabs.forEach((item, position) => { item.tabIndex = position === index ? 0 : -1; });
    });
    tab.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      select(index);
    });
    tab.addEventListener('keydown', event => {
      const previous = desktop.matches ? 'ArrowUp' : 'ArrowLeft';
      const next = desktop.matches ? 'ArrowDown' : 'ArrowRight';
      switch (event.key) {
        case previous:
          tabs[(index - 1 + tabs.length) % tabs.length].focus();
          break;
        case next:
          tabs[(index + 1) % tabs.length].focus();
          break;
        case 'Home':
          tabs[0].focus();
          break;
        case 'End':
          tabs[tabs.length - 1].focus();
          break;
        case ' ':
          select(index);
          break;
        default:
          return;
      }
      event.preventDefault();
    });
  });

  select(0);
  selectFragment();
  window.addEventListener('hashchange', selectFragment);
  preview.setAttribute('data-tabs-ready', '');
  controls.querySelector('[data-home-preview-prev]')?.addEventListener('click', () => move(-1, true));
  controls.querySelector('[data-home-preview-next]')?.addEventListener('click', () => move(1, true));
  controls.hidden = false;
  preview.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse') return;
    hovering = true;
    schedule();
  });
  preview.addEventListener('pointerleave', event => {
    if (event.pointerType !== 'mouse') return;
    hovering = false;
    schedule();
  });
  preview.addEventListener('focusin', schedule);
  preview.addEventListener('focusout', () => queueMicrotask(schedule));
  document.addEventListener('visibilitychange', schedule);
  motion.addEventListener('change', schedule);
  if (typeof IntersectionObserver === 'function') {
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      schedule();
    });
    observer.observe(preview);
  }
}
