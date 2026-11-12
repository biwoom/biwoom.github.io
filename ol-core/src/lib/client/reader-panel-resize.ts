/** Shared TEXT/STORY dock sizing. Keep the preferred size when the viewport
 * temporarily constrains it; modal drawers and their actual nodes stay untouched. */
export function initReaderPanelResize() {
  const handle = document.querySelector<HTMLElement>('[data-reader-panel-resize]');
  const root = handle?.closest<HTMLElement>('.ol-story-doc-page');
  const grid = root?.querySelector<HTMLElement>('[data-reader-resizable-grid]');
  const rail = handle?.parentElement;
  if (!handle || !root || !grid || !rail) return;
  const left = grid.querySelector<HTMLElement>('.ol-story-part-sidebar');
  const wide = window.matchMedia('(min-width: 1360px)');
  const key = 'ol-reader-aid-width';
  const defaults = { min: 240, max: 520, body: 480, width: 300 };
  let preferred = defaults.width;
  try {
    const saved = Number(localStorage.getItem(key));
    if (Number.isFinite(saved) && saved >= defaults.min && saved <= defaults.max) preferred = saved;
  } catch { /* Storage is optional. */ }
  root.style.setProperty('--ol-reader-aid-preferred-width', `${preferred}px`);
  let printing = false;
  let frame = 0;
  let drag: { id: number; x: number; width: number; preferred: number; latestX: number } | undefined;

  const available = () => wide.matches && !printing && rail.getClientRects().length > 0;
  const bounds = () => {
    const style = getComputedStyle(grid);
    const number = (name: string, fallback: number) => parseFloat(style.getPropertyValue(name)) || fallback;
    const min = number('--ol-reader-aid-min-width', defaults.min);
    const limit = number('--ol-reader-aid-max-width', defaults.max);
    const body = number('--ol-reader-body-min-width', defaults.body);
    const leftWidth = left?.getClientRects().length ? left.getBoundingClientRect().width : 0;
    return { min, max: Math.max(min, Math.min(limit, grid.getBoundingClientRect().width - leftWidth - body)) };
  };
  const clamp = (width: number) => {
    const { min, max } = bounds();
    return Math.round(Math.max(min, Math.min(max, width)));
  };
  const save = () => {
    try { localStorage.setItem(key, String(preferred)); } catch { /* Keep the session preference. */ }
  };
  const setWidth = (width: number) => {
    preferred = width;
    root.style.setProperty('--ol-reader-aid-preferred-width', `${width}px`);
  };
  const stop = (commit: boolean) => {
    if (!drag) return;
    const ended = drag;
    drag = undefined;
    if (commit) save();
    else setWidth(ended.preferred);
    document.documentElement.removeAttribute('data-reader-panel-dragging');
    if (handle.hasPointerCapture(ended.id)) handle.releasePointerCapture(ended.id);
  };
  const sync = () => {
    handle.hidden = !available();
    if (handle.hidden) { stop(false); return; }
    const { min, max } = bounds();
    const width = Math.round(rail.getBoundingClientRect().width);
    handle.setAttribute('aria-valuemin', String(min));
    handle.setAttribute('aria-valuemax', String(Math.floor(max)));
    handle.setAttribute('aria-valuenow', String(width));
    handle.setAttribute('aria-valuetext', `${width}픽셀`);
  };
  const move = (x: number) => {
    if (!drag) return;
    // A click without movement must not replace a wider, temporarily constrained preference.
    setWidth(x === drag.x ? drag.preferred : clamp(drag.width + drag.x - x));
  };
  const schedule = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (drag && available()) move(drag.latestX);
      sync();
    });
  };
  handle.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !event.isPrimary || !available() || drag) return;
    event.preventDefault();
    handle.focus({ preventScroll: true });
    drag = { id: event.pointerId, x: event.clientX, latestX: event.clientX,
      width: rail.getBoundingClientRect().width, preferred };
    handle.setPointerCapture(event.pointerId);
    document.documentElement.setAttribute('data-reader-panel-dragging', '');
  });
  handle.addEventListener('pointermove', event => {
    if (drag?.id !== event.pointerId) return;
    drag.latestX = event.clientX;
    schedule();
  });
  handle.addEventListener('pointerup', event => {
    if (drag?.id !== event.pointerId) return;
    if (available()) { move(event.clientX); stop(true); }
    else stop(false);
    sync();
  });
  const cancel = () => { stop(false); sync(); };
  handle.addEventListener('pointercancel', cancel);
  handle.addEventListener('lostpointercapture', cancel);
  handle.addEventListener('dblclick', () => {
    if (!available()) return;
    stop(false); setWidth(defaults.width); save(); sync();
  });
  handle.addEventListener('keydown', event => {
    if (!available()) return;
    if (event.key === 'Escape' && drag) { event.preventDefault(); cancel(); return; }
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const width = rail.getBoundingClientRect().width;
    const step = event.shiftKey ? 32 : 16;
    const { min, max } = bounds();
    const sizes: Record<string, number> = { ArrowLeft: width + step, ArrowRight: width - step,
      Home: min, End: max, Enter: defaults.width };
    const next = sizes[event.key];
    if (next === undefined) return;
    event.preventDefault(); stop(false);
    setWidth(event.key === 'Enter' ? defaults.width : clamp(next)); save(); sync();
  });
  // Existing workspace controllers own focus/panel/modal state. Observe only
  // layout changes here, without opening, closing or moving any reader aids.
  const mutations = new MutationObserver(schedule);
  mutations.observe(root, { attributes: true, attributeFilter: [
    'data-text-left-hidden', 'data-text-right-hidden', 'data-text-focus',
    'data-story-left-hidden', 'data-story-focus',
  ] });
  const observer = new ResizeObserver(schedule);
  observer.observe(grid);
  observer.observe(rail);
  wide.addEventListener('change', cancel);
  window.addEventListener('resize', cancel);
  window.addEventListener('blur', cancel);
  window.addEventListener('pagehide', cancel);
  window.addEventListener('beforeprint', () => { printing = true; cancel(); });
  window.addEventListener('afterprint', () => { printing = false; sync(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) cancel(); });
  sync();
}
