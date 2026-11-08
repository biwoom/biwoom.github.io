/** Reuse the original shared reader dialogs for desktop aids and compact modals. */
export function initStoryWorkspace() {
  const root = document.querySelector<HTMLElement>('[data-story-workspace]');
  if (!root) return;
  const slot = root.querySelector<HTMLElement>('[data-reader-panel-slot]')!;
  const empty = root.querySelector<HTMLElement>('[data-reader-panel-empty]')!;
  const dialogs = [...root.querySelectorAll<HTMLDialogElement>('.ol-reader-toc')];
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-reader-panel]')];
  const origins = new Map(dialogs.map(dialog => {
    const marker = document.createComment('story aid origin');
    dialog.before(marker);
    return [dialog, marker] as const;
  }));
  const wide = window.matchMedia('(min-width: 1360px)');
  let active = dialogs.find(dialog => dialog.open)?.id
    ?? dialogs.find(dialog => dialog.id === 'ol-reader-toc')?.id ?? dialogs[0]?.id;
  let layingOut = false;
  const sync = () => {
    const opened = dialogs.find(dialog => dialog.open);
    // Explicitly opening an aid leaves focus mode, as in TEXT.
    if (opened && !layingOut && root.hasAttribute('data-story-focus')) {
      root.querySelector<HTMLButtonElement>('[data-story-focus]')?.dispatchEvent(new Event('click'));
    }
    if (opened) active = opened.id;
    for (const button of buttons) {
      const id = `ol-reader-${button.dataset.readerPanel}`;
      button.disabled = !dialogs.some(dialog => dialog.id === id);
      button.setAttribute('aria-controls', id);
      button.setAttribute('aria-pressed', String(opened?.id === id));
    }
    empty.hidden = dialogs.length > 0;
  };
  const open = (id?: string) => {
    dialogs.find(dialog => dialog.id === id)?.dispatchEvent(new Event('reader:open'));
    sync();
  };
  const layout = () => {
    layingOut = true;
    active = dialogs.find(dialog => dialog.open)?.id ?? active;
    for (const dialog of dialogs) {
      // The shared reset restores scroll locks before a modal becomes docked.
      dialog.dispatchEvent(new Event('reader:reset'));
      if (wide.matches) {
        dialog.dataset.docked = 'true';
        dialog.dataset.persistent = 'true';
        slot.append(dialog);
      } else {
        delete dialog.dataset.docked;
        delete dialog.dataset.persistent;
        origins.get(dialog)!.after(dialog);
      }
    }
    if (wide.matches && !root.hasAttribute('data-story-focus')) open(active);
    layingOut = false;
    sync();
  };
  root.addEventListener('reader:panel', sync);
  root.addEventListener('reader:focus', layout);
  for (const button of buttons) button.addEventListener('click', () => open(`ol-reader-${button.dataset.readerPanel}`));
  wide.addEventListener('change', layout);
  layout();
}
