const mobileReader = "(max-width: 980px)";

function enableReaderSwipeDismiss(panel: HTMLElement, edge: "left" | "right", dismiss: () => void) {
  const narrow = window.matchMedia(mobileReader);
  let start: Touch | undefined;
  panel.addEventListener("touchstart", event => {
    start = narrow.matches && event.touches.length === 1 ? event.touches[0] : undefined;
  }, { passive: true });
  panel.addEventListener("touchmove", event => {
    if (!start) return;
    const touch = event.touches[0];
    if (event.touches.length !== 1 || touch.identifier !== start.identifier) {
      start = undefined;
      return;
    }
    const horizontal = Math.abs(touch.clientX - start.clientX);
    const vertical = Math.abs(touch.clientY - start.clientY);
    if (vertical >= 12 && vertical >= horizontal) start = undefined;
  }, { passive: true });
  panel.addEventListener("touchcancel", () => { start = undefined; }, { passive: true });
  panel.addEventListener("touchend", event => {
    const first = start;
    start = undefined;
    const touch = event.changedTouches[0];
    if (!first || !narrow.matches || event.touches.length || touch?.identifier !== first.identifier) return;
    const outward = (touch.clientX - first.clientX) * (edge === "left" ? -1 : 1);
    const vertical = Math.abs(touch.clientY - first.clientY);
    if (outward < 56 || outward < 1.5 * vertical) return;
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed && selection.containsNode(panel, true)) return;
    // A completed swipe may have started on a link or note. Do not activate it.
    event.preventDefault();
    dismiss();
  }, { passive: false });
}

export function bindReaderModalDismiss(
  dialog: HTMLDialogElement,
  panel: HTMLElement | null,
  edge: "left" | "right",
  closeButton: Element | null,
  dismiss: () => void,
) {
  closeButton?.addEventListener("click", dismiss);
  dialog.addEventListener("cancel", event => { event.preventDefault(); dismiss(); });
  dialog.addEventListener("click", event => { if (event.target === dialog) dismiss(); });
  if (panel) enableReaderSwipeDismiss(panel, edge, dismiss);
}

/** The modal shell clips without scrolling; only its inner panel animates.
 * Move initial focus before starting the right-edge entrance. */
export function createReaderDrawer(
  drawer: HTMLDialogElement,
  trigger: HTMLButtonElement,
  closeButton: Element | null,
) {
  const panel = drawer.querySelector<HTMLElement>(".ol-reader-toc-panel");
  const narrow = window.matchMedia(mobileReader);
  let animation: Animation | undefined;
  let closing = false;
  let previousOverflow = "";
  let locked = false;
  const docked = () => drawer.dataset?.docked === "true";
  const notify = () => {
    if (docked()) drawer.dispatchEvent(new CustomEvent("reader:panel", { bubbles: true }));
  };
  let returnFocus: HTMLElement = trigger;
  const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finishClose = (afterClose?: () => void, restoreFocus = true) => {
    animation = undefined;
    drawer.close();
    trigger.setAttribute("aria-expanded", "false");
    drawer.classList.remove("is-open", "is-closing");
    if (locked) document.body.style.overflow = previousOverflow;
    locked = false;
    closing = false;
    if (restoreFocus) returnFocus.focus({ preventScroll: true });
    notify();
    afterClose?.();
  };
  const close = (afterClose?: () => void, restoreFocus = true) => {
    if (!drawer.open || closing) return;
    // STORY keeps its desktop aid visible; programmatic tab/reset closes still work.
    if (docked() && drawer.dataset.persistent === "true" && restoreFocus) {
      afterClose?.();
      return;
    }
    closing = true;
    trigger.setAttribute("aria-expanded", "false");
    if (docked()) { finishClose(afterClose, restoreFocus); return; }
    drawer.classList.add("is-closing");
    // Preserve the current position if dismissed while the entrance is running.
    const from = panel ? getComputedStyle(panel).transform : "none";
    animation?.cancel();
    if (!panel || reducedMotion()) { finishClose(afterClose, restoreFocus); return; }
    animation = panel.animate([
      { transform: from }, { transform: "translateX(100%)" },
    ], { duration: 280, easing: "cubic-bezier(0.25, 0.1, 0.25, 1)", fill: "forwards" });
    const exitAnimation = animation;
    exitAnimation.finished.then(() => {
      if (animation !== exitAnimation) return;
      // Hide the dialog before dropping the animation's final offscreen frame.
      finishClose(afterClose, restoreFocus);
      exitAnimation.cancel();
    }, () => { /* A superseded animation must never close a newly opened drawer. */ });
  };
  const open = (source: HTMLElement = trigger) => {
    if (closing) return false;
    if (drawer.open) return true;
    returnFocus = source;
    if (docked()) {
      drawer.parentElement?.querySelectorAll<HTMLDialogElement>("dialog[open]").forEach(other => {
        if (other !== drawer) other.dispatchEvent(new Event("reader:close"));
      });
      drawer.closest<HTMLElement>("[data-text-workspace]")?.removeAttribute("data-text-right-hidden");
      // Docked aids are page content: avoid native dialog opening autofocus,
      // especially when the TOC opens automatically on initial page load.
      drawer.open = true;
      drawer.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
      notify();
      return true;
    }
    locked = true;
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawer.showModal();
    if (narrow.matches) panel?.querySelector<HTMLElement>(".ol-reader-toc-head h2")?.focus({ preventScroll: true });
    // Clear offsets retained by a previous opening/native autofocus. The shell
    // uses overflow: clip so later focus cannot scroll it during the animation.
    drawer.scrollLeft = 0;
    drawer.scrollTop = 0;
    drawer.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
    // Explicit keyframes start before the first paint, without rAF/style timing races.
    if (panel && !reducedMotion()) {
      animation = panel.animate([
        { transform: "translateX(100%)" }, { transform: "translateX(0)" },
      ], { duration: 360, easing: "cubic-bezier(0.25, 0.1, 0.25, 1)" });
      animation.finished.catch(() => { /* Closing may interrupt the entrance. */ });
    }
    return true;
  };
  drawer.addEventListener("reader:open", () => open());
  drawer.addEventListener("reader:close", () => close(undefined, false));
  drawer.addEventListener("reader:reset", () => {
    animation?.cancel();
    if (drawer.open) finishClose(undefined, false);
  });
  bindReaderModalDismiss(drawer, panel, "right", closeButton, () => close());
  return { open, close };
}
