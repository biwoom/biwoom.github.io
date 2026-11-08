/** One set of actual dialog/footnote nodes serves the desktop dock and mobile
 * modals. Moving nodes, rather than copying markup, preserves reference IDs. */
export function initTextWorkspace() {
  const root = document.querySelector<HTMLElement>('[data-text-workspace]');
  if (!root) return;
  const rail = root.querySelector<HTMLElement>('[data-text-panel-slot]')!;
  const dialogs = [...root.querySelectorAll<HTMLDialogElement>('.ol-reader-toc')];
  const origins = new Map(dialogs.map(dialog => {
    const marker = document.createComment('reader panel origin');
    dialog.before(marker); return [dialog, marker] as const;
  }));
  const wide = window.matchMedia('(min-width: 1360px)');
  const narrow = window.matchMedia('(max-width: 980px)');
  const left = root.querySelector<HTMLElement>('#text-document-list')!;
  const listContent = root.querySelector<HTMLElement>('[data-text-list-content]')!;
  const mobileList = root.querySelector<HTMLDialogElement>('#text-list-dialog')!;
  const mobileSlot = mobileList.querySelector<HTMLElement>('[data-text-mobile-list-slot]')!;
  const leftButton = root.querySelector<HTMLButtonElement>('[data-text-left-toggle]')!;
  const focusButton = root.querySelector<HTMLButtonElement>('[data-text-focus]')!;
  const focusLabel = root.querySelector<HTMLElement>('[data-text-focus-label]')!;
  const panelButtons = [...root.querySelectorAll<HTMLButtonElement>('[data-text-panel]')];
  let activePanel = dialogs.find(dialog => dialog.open)?.id ?? dialogs.find(dialog => dialog.id === 'ol-reader-toc')?.id ?? dialogs[0]?.id;
  let focused = false;
  let saved: { left: boolean; panel?: string; right: boolean } | undefined;
  let listOverflow = '';
  let resizing = false;
  let printing = false;
  const setLeft = (hidden: boolean) => {
    root.toggleAttribute('data-text-left-hidden', hidden);
    leftButton.setAttribute('aria-expanded', String(!hidden && !narrow.matches));
  };
  const syncTabs = () => {
    const opened = dialogs.find(dialog => dialog.open);
    if (opened) activePanel = opened.id;
    for (const button of panelButtons) {
      const id = `ol-reader-${button.dataset.textPanel}`;
      button.disabled = !dialogs.some(dialog => dialog.id === id);
      button.setAttribute('aria-pressed', String(opened?.id === id));
      button.setAttribute('aria-controls', id);
    }
    if (wide.matches && !resizing) root.toggleAttribute('data-text-right-hidden', !opened);
    // Opening a research aid intentionally leaves focus mode.
    if (opened && focused && !resizing) {
      focused = false; root.removeAttribute('data-text-focus');
      setLeft(saved?.left ?? false);
      focusButton.setAttribute('aria-pressed', 'false'); focusLabel.textContent = '집중';
    }
  };
  const openPanel = (id?: string) => {
    if (mobileList.open) closeList(false);
    const dialog = dialogs.find(dialog => dialog.id === id);
    dialog?.dispatchEvent(new Event('reader:open'));
    syncTabs();
  };
  const resetPanels = () => dialogs.forEach(dialog => dialog.dispatchEvent(new Event('reader:reset')));
  const closeList = (returnFocus = true) => {
    if (!mobileList.open) return;
    mobileList.close(); document.body.style.overflow = listOverflow;
    leftButton.setAttribute('aria-expanded', 'false');
    if (returnFocus) leftButton.focus({ preventScroll: true });
  };
  const openList = () => {
    if (mobileList.open) return;
    resizing = true; resetPanels(); resizing = false; syncTabs();
    listOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    mobileList.showModal(); leftButton.setAttribute('aria-expanded', 'true');
  };
  const layout = () => {
    if (printing) return;
    const openedBefore = dialogs.find(dialog => dialog.open)?.id;
    const wasRightHidden = root.hasAttribute('data-text-right-hidden');
    resizing = true;
    resetPanels(); closeList(false);
    for (const dialog of dialogs) {
      if (wide.matches) { dialog.dataset.docked = 'true'; rail.append(dialog); }
      else { delete dialog.dataset.docked; origins.get(dialog)!.after(dialog); }
    }
    if (narrow.matches) mobileSlot.append(listContent);
    else left.append(listContent);
    leftButton.setAttribute('aria-controls', narrow.matches ? 'text-list-dialog' : 'text-document-list');
    if (narrow.matches) leftButton.setAttribute('aria-haspopup', 'dialog');
    else leftButton.removeAttribute('aria-haspopup');
    leftButton.setAttribute('aria-expanded', String(!narrow.matches && !root.hasAttribute('data-text-left-hidden')));
    if (wide.matches && !focused && (!wasRightHidden || openedBefore)) openPanel(openedBefore ?? activePanel);
    else if (!wide.matches && !focused && openedBefore) openPanel(openedBefore);
    resizing = false; syncTabs();
  };
  root.addEventListener('reader:panel', syncTabs);
  for (const button of panelButtons) button.addEventListener('click', () => openPanel(`ol-reader-${button.dataset.textPanel}`));
  leftButton.addEventListener('click', () => {
    if (narrow.matches) { if (mobileList.open) closeList(); else openList(); }
    else {
      if (focused) { focused = false; root.removeAttribute('data-text-focus'); focusButton.setAttribute('aria-pressed', 'false'); focusLabel.textContent = '집중'; }
      setLeft(!root.hasAttribute('data-text-left-hidden'));
    }
  });
  root.querySelector('[data-text-list-close]')?.addEventListener('click', () => closeList());
  mobileList.addEventListener('cancel', event => { event.preventDefault(); closeList(); });
  mobileList.addEventListener('click', event => { if (event.target === mobileList) closeList(); });
  focusButton.addEventListener('click', () => {
    if (!focused) {
      saved = { left: root.hasAttribute('data-text-left-hidden'), right: !dialogs.some(dialog => dialog.open), panel: activePanel };
      // Suppress panel-close callbacks while taking the previous layout snapshot.
      resizing = true; resetPanels(); closeList(false); resizing = false;
      focused = true; root.setAttribute('data-text-focus', ''); setLeft(true);
      root.setAttribute('data-text-right-hidden', '');
    } else {
      focused = false; root.removeAttribute('data-text-focus'); setLeft(saved?.left ?? false);
      root.toggleAttribute('data-text-right-hidden', saved?.right ?? false);
      if (wide.matches && !saved?.right) openPanel(saved?.panel);
    }
    focusButton.setAttribute('aria-pressed', String(focused)); focusLabel.textContent = focused ? '기본' : '집중';
    syncTabs(); focusButton.focus({ preventScroll: true });
  });
  const printSlot = root.querySelector<HTMLElement>('[data-text-print-notes]');
  if (printSlot) {
    let printMarker: Comment | undefined;
    let printRightHidden = false;
    window.addEventListener('beforeprint', () => {
      if (printing) return;
      printRightHidden = root.hasAttribute('data-text-right-hidden');
      printing = true; resizing = true; resetPanels(); closeList(false); resizing = false;
      const notes = dialogs.find(dialog => dialog.id === 'ol-reader-footnotes');
      if (notes) {
        printMarker = document.createComment('printed notes origin'); notes.before(printMarker);
        printSlot.append(notes); notes.setAttribute('data-text-printing', '');
      }
    });
    window.addEventListener('afterprint', () => {
      if (!printing) return;
      const notes = dialogs.find(dialog => dialog.id === 'ol-reader-footnotes');
      if (notes && printMarker) { printMarker.replaceWith(notes); notes.removeAttribute('data-text-printing'); }
      printing = false; root.toggleAttribute('data-text-right-hidden', printRightHidden); layout();
    });
  }
  wide.addEventListener('change', layout); narrow.addEventListener('change', layout);
  const tools = root.querySelector<HTMLElement>(".ol-reader-toolbar");
  if (tools) {
    const measureOffsets = () => {
      root.style.setProperty("--ol-text-tools-height", `${tools.getBoundingClientRect().height}px`);
    };
    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(measureOffsets);
      observer.observe(tools);
    }
    window.addEventListener("resize", measureOffsets); measureOffsets();
  }
  // Initial defaults follow the same breakpoint as the three-column dock.
  setLeft(!wide.matches);
  root.toggleAttribute('data-text-right-hidden', !wide.matches || !dialogs.some(dialog => dialog.id === 'ol-reader-toc'));
  layout();
}
