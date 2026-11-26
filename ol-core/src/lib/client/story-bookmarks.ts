const storageKey = 'biwoom-home-bookmarks';

function readBookmarks(): Set<string> | undefined {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    return new Set(Array.isArray(stored) ? stored.filter(id => typeof id === 'string') : []);
  } catch {
    return undefined;
  }
}

let saved = readBookmarks() ?? new Set<string>();
export const storyBookmarkIds = () => [...saved];

export function updateStoryBookmarks() {
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-story-bookmark]')) {
    const pressed = saved.has(button.dataset.storyBookmark ?? '');
    const action = pressed ? '보관함에서 빼기' : '보관함에 담기';
    button.setAttribute('aria-pressed', String(pressed));
    button.setAttribute('aria-label', `${button.dataset.storyTitle} ${action}`);
    button.title = action;
  }
}

function notifyBookmarks() {
  updateStoryBookmarks();
  document.dispatchEvent(new Event('home-bookmarks-updated'));
}

document.addEventListener('click', event => {
  const button = (event.target as Element).closest<HTMLButtonElement>('[data-story-bookmark]');
  const id = button?.dataset.storyBookmark;
  if (!button || !id) return;
  const card = button.closest<HTMLElement>('[data-story-card]');
  if (!saved.delete(id)) saved.add(id);
  try { localStorage.setItem(storageKey, JSON.stringify([...saved])); } catch { /* Keep the selection for this page. */ }
  notifyBookmarks();
  if (card?.hidden) {
    const catalog = card.closest('[data-home-catalog]');
    const next = catalog?.querySelector<HTMLElement>('[data-story-card]:not([hidden]) [data-story-bookmark], [data-home-catalog-empty]:not([hidden]) a');
    next?.focus();
  }
});

window.addEventListener('storage', event => {
  if (event.key !== storageKey && event.key !== null) return;
  saved = readBookmarks() ?? saved;
  notifyBookmarks();
});
window.addEventListener('pageshow', event => {
  if (!event.persisted) return;
  saved = readBookmarks() ?? saved;
  notifyBookmarks();
});
updateStoryBookmarks();
