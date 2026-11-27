const carousel = document.querySelector<HTMLElement>('[data-home-today-carousel]');
if (carousel) {
  const slides = [...carousel.querySelectorAll<HTMLElement>('[data-home-today-slide]')];
  const controls = carousel.querySelector<HTMLElement>('[data-home-today-controls]')!;
  const toggle = carousel.querySelector<HTMLButtonElement>('[data-home-today-toggle]')!;
  const status = carousel.querySelector<HTMLElement>('[data-home-today-status]')!;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const prepared = new Map<number, Promise<void>>();
  let current = 0;
  let playing = !motion.matches;
  let hovering = false;
  let inView = typeof IntersectionObserver !== 'function';
  let timer = 0;
  let scheduleVersion = 0;

  const adjacent = (step: number) => (current + step + slides.length) % slides.length;

  function prepare(index: number) {
    let ready = prepared.get(index);
    if (!ready) {
      const images = [...slides[index].querySelectorAll('img')];
      ready = Promise.all(images.map(image => {
        const source = image.dataset.homeTodaySrc;
        if (source) {
          image.src = source;
          delete image.dataset.homeTodaySrc;
        }
        return image.decode().catch(() => {});
      })).then(() => {});
      prepared.set(index, ready);
    }
    return ready;
  }

  function schedule() {
    window.clearTimeout(timer);
    const version = ++scheduleVersion;
    if (!playing || hovering || !inView || document.hidden) return;
    void prepare(current).then(() => {
      if (version !== scheduleVersion) return;
      const next = adjacent(1);
      const ready = prepare(next);
      timer = window.setTimeout(async () => {
        await ready;
        if (version === scheduleVersion) show(next);
      }, 5000);
    });
  }

  function setPlaying(value: boolean) {
    playing = value;
    carousel!.toggleAttribute('data-playing', playing);
    const label = playing ? '자동 전환 일시정지' : '자동 전환 재생';
    toggle.setAttribute('aria-label', label);
    toggle.title = label;
    schedule();
  }

  function show(index: number, announce = false) {
    void prepare(index);
    const previous = slides[current];
    const next = slides[index];
    previous.removeAttribute('data-active');
    previous.inert = true;
    previous.setAttribute('aria-hidden', 'true');
    next.setAttribute('data-active', '');
    next.inert = false;
    next.removeAttribute('aria-hidden');
    current = index;
    if (announce) {
      const title = next.querySelector('h3')?.textContent?.trim() ?? '';
      status.textContent = `${current + 1} / ${slides.length} ${title}`;
    }
    schedule();
  }

  function navigate(step: number) {
    setPlaying(false);
    show(adjacent(step), true);
  }

  for (const button of controls.querySelectorAll('button')) button.disabled = false;
  toggle.addEventListener('click', () => setPlaying(!playing));
  carousel.querySelector('[data-home-today-prev]')!.addEventListener('click', () => navigate(-1));
  carousel.querySelector('[data-home-today-next]')!.addEventListener('click', () => navigate(1));
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
  if (typeof IntersectionObserver === 'function') {
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      schedule();
    });
    observer.observe(carousel);
  }
  setPlaying(playing);
}
