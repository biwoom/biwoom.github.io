for (const carousel of document.querySelectorAll<HTMLElement>('[data-home-today-carousel]')) {
  const slides = [...carousel.querySelectorAll<HTMLElement>('[data-home-today-slide]')];
  const controls = carousel.querySelector<HTMLElement>('[data-home-today-controls]')!;
  const toggle = controls.querySelector<HTMLButtonElement>('[data-home-today-toggle]')!;
  const previous = controls.querySelector<HTMLButtonElement>('[data-home-today-prev]')!;
  const next = controls.querySelector<HTMLButtonElement>('[data-home-today-next]')!;
  const status = carousel.querySelector<HTMLElement>('[data-home-today-status]')!;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 1024px)');
  const wide = carousel.hasAttribute('data-home-today-wide');
  const prepared = new Map<number, Promise<void>>();
  let visibleCount = wide && desktop.matches ? 2 : 1;
  let current = 0;
  let playing = !motion.matches;
  let hovering = false;
  let inView = typeof IntersectionObserver !== 'function';
  let timer = 0;
  let scheduleVersion = 0;

  const adjacent = (index: number, step: number) => (index + step + slides.length) % slides.length;
  const visibleIndices = (index: number) => visibleCount === 2 ? [index, adjacent(index, 1)] : [index];

  function prepare(index: number) {
    let ready = prepared.get(index);
    if (!ready) {
      const images = [...slides[index].querySelectorAll('img')];
      ready = Promise.all(images.map(async image => {
        image.loading = 'eager';
        const source = image.dataset.homeTodaySrc;
        if (source) {
          image.src = source;
          delete image.dataset.homeTodaySrc;
        }
        await image.decode().catch(() => {});
      })).then(() => {});
      prepared.set(index, ready);
    }
    return ready;
  }

  const prepareVisible = (index: number) => Promise.all(visibleIndices(index).map(prepare));

  function schedule() {
    window.clearTimeout(timer);
    const version = ++scheduleVersion;
    if (!inView || document.hidden) return;
    const visible = prepareVisible(current);
    if (!playing || hovering || slides.length <= visibleCount) return;
    void visible.then(() => {
      if (version !== scheduleVersion) return;
      const next = adjacent(current, 1);
      const ready = prepareVisible(next);
      timer = window.setTimeout(async () => {
        await ready;
        if (version === scheduleVersion) show(next);
      }, 5000);
    });
  }

  function setPlaying(value: boolean) {
    playing = value;
    carousel.toggleAttribute('data-playing', playing);
    const label = playing ? '자동 전환 일시정지' : '자동 전환 재생';
    toggle.setAttribute('aria-label', label);
    toggle.title = label;
    schedule();
  }

  function show(index: number, announce = false) {
    const visible = visibleIndices(index);
    const [first, second] = visible.map(position => slides[position]);
    if (second && (first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_PRECEDING)) {
      // Keep the tab order aligned with the displayed pair when the carousel wraps.
      if (second.contains(document.activeElement)) second.before(first);
      else first.after(second);
    }
    slides.forEach((slide, position) => {
      const slot = visible.indexOf(position);
      const active = slot >= 0;
      if (active) {
        if (slot === 1) slide.dataset.slot = 'second';
        else delete slide.dataset.slot;
      }
      slide.toggleAttribute('data-active', active);
      slide.inert = !active;
      if (active) slide.removeAttribute('aria-hidden');
      else slide.setAttribute('aria-hidden', 'true');
    });
    current = index;
    if (announce) {
      void prepareVisible(current);
      status.textContent = visible.map(position => {
        const title = slides[position].querySelector('h3')?.textContent?.trim() ?? '';
        return `${position + 1} / ${slides.length} ${title}`;
      }).join(', ');
    }
    schedule();
  }

  function updateLayout() {
    visibleCount = wide && desktop.matches ? 2 : 1;
    const focusedSlide = slides.findIndex(slide => slide.contains(document.activeElement));
    const index = visibleCount === 1 && focusedSlide >= 0 ? focusedSlide : current;
    toggle.disabled = slides.length <= visibleCount;
    show(index);
  }

  function navigate(step: number) {
    setPlaying(false);
    show(adjacent(current, step), true);
  }

  toggle.addEventListener('click', () => setPlaying(!playing));
  previous.disabled = false;
  next.disabled = false;
  previous.addEventListener('click', () => navigate(-1));
  next.addEventListener('click', () => navigate(1));
  carousel.addEventListener('focusin', event => {
    if (playing && event.target instanceof HTMLElement && event.target.matches(':focus-visible')) setPlaying(false);
  });
  carousel.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse') return;
    hovering = true;
    schedule();
  });
  carousel.addEventListener('pointerleave', event => {
    if (event.pointerType !== 'mouse') return;
    hovering = false;
    schedule();
  });
  document.addEventListener('visibilitychange', schedule);
  motion.addEventListener('change', event => { if (event.matches) setPlaying(false); });
  if (wide) desktop.addEventListener('change', updateLayout);
  if (typeof IntersectionObserver === 'function') {
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      schedule();
    });
    observer.observe(carousel);
  }
  updateLayout();
  setPlaying(playing);
}
