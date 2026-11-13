/** Reuse the original shared reader dialogs for desktop aids and compact modals. */
export function initStoryWorkspace() {
  const root = document.querySelector<HTMLElement>('[data-story-workspace]');
  if (!root) return;
  initStoryList(root);
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
    ?? dialogs.find(dialog => dialog.id === 'ol-reader-toc' && !dialog.hasAttribute('data-reader-toc-empty'))?.id
    ?? dialogs.find(dialog => dialog.id === 'ol-reader-footnotes')?.id ?? dialogs[0]?.id;
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

/** Move the original chapter list into a native modal on small screens, as in TEXT. */
function initStoryList(root: HTMLElement) {
  const trigger = root.querySelector<HTMLButtonElement>('[data-story-left-toggle]');
  const sidebar = root.querySelector<HTMLElement>('#story-document-list');
  const content = root.querySelector<HTMLElement>('[data-story-list-content]');
  const dialog = root.querySelector<HTMLDialogElement>('#story-list-dialog');
  const slot = root.querySelector<HTMLElement>('[data-story-mobile-list-slot]');
  if (!trigger || !sidebar || !content || !dialog || !slot) return;
  const narrow = window.matchMedia('(max-width: 980px)');
  let overflow = '';
  const sync = () => {
    trigger.setAttribute('aria-expanded', String(narrow.matches ? dialog.open :
      !root.hasAttribute('data-story-left-hidden') && !root.hasAttribute('data-story-focus')));
  };
  const close = (restoreFocus = true) => {
    if (!dialog.open) return;
    dialog.close();
    document.body.style.overflow = overflow;
    sync();
    if (restoreFocus) trigger.focus({ preventScroll: true });
  };
  const layout = () => {
    close(false);
    (narrow.matches ? slot : sidebar).append(content);
    trigger.setAttribute('aria-controls', narrow.matches ? 'story-list-dialog' : 'story-document-list');
    if (narrow.matches) trigger.setAttribute('aria-haspopup', 'dialog');
    else trigger.removeAttribute('aria-haspopup');
    sync();
  };
  trigger.addEventListener('click', () => {
    if (narrow.matches) {
      if (dialog.open) close();
      else {
        root.querySelectorAll<HTMLDialogElement>('.ol-reader-toc').forEach(aid => aid.dispatchEvent(new Event('reader:reset')));
        overflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        dialog.showModal();
        sync();
      }
    } else {
      const focused = root.hasAttribute('data-story-focus');
      if (focused) root.querySelector<HTMLButtonElement>('[data-story-focus]')?.click();
      root.toggleAttribute('data-story-left-hidden', focused ? false : !root.hasAttribute('data-story-left-hidden'));
      sync();
    }
  });
  root.querySelector('[data-story-list-close]')?.addEventListener('click', () => close());
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
  dialog.addEventListener('click', event => { if (event.target === dialog) close(); });
  root.addEventListener('reader:focus', sync);
  narrow.addEventListener('change', layout);
  layout();
}
