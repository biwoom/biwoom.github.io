/** Keep the resting panel in view: native dialog autofocus must not scroll an
 * offscreen transformed panel into view before its entrance animation starts. */
export function createReaderDrawer(
  drawer: HTMLDialogElement,
  trigger: HTMLButtonElement,
  closeButton: Element | null,
) {
  const panel = drawer.querySelector<HTMLElement>(".ol-reader-toc-panel");
  let animation: Animation | undefined;
  let closing = false;
  let previousOverflow = "";
  let returnFocus: HTMLElement = trigger;
  const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finishClose = (afterClose?: () => void) => {
    animation = undefined;
    drawer.close();
    drawer.classList.remove("is-open", "is-closing");
    document.body.style.overflow = previousOverflow;
    closing = false;
    returnFocus.focus({ preventScroll: true });
    afterClose?.();
  };
  const close = (afterClose?: () => void) => {
    if (!drawer.open || closing) return;
    closing = true;
    trigger.setAttribute("aria-expanded", "false");
    drawer.classList.add("is-closing");
    // Preserve the current position if dismissed while the entrance is running.
    const from = panel ? getComputedStyle(panel).transform : "none";
    animation?.cancel();
    if (!panel || reducedMotion()) { finishClose(afterClose); return; }
    animation = panel.animate([
      { transform: from }, { transform: "translateX(100%)" },
    ], { duration: 280, easing: "cubic-bezier(0.25, 0.1, 0.25, 1)", fill: "forwards" });
    animation.finished.then(() => {
      const completed = animation;
      // Hide the dialog before dropping the animation's final offscreen frame.
      finishClose(afterClose);
      completed?.cancel();
    }, () => { /* A superseded animation must never close a newly opened drawer. */ });
  };
  const open = (source: HTMLElement = trigger) => {
    if (closing) return false;
    if (drawer.open) return true;
    returnFocus = source;
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawer.showModal();
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
  closeButton?.addEventListener("click", () => close());
  drawer.addEventListener("cancel", event => { event.preventDefault(); close(); });
  drawer.addEventListener("click", event => { if (event.target === drawer) close(); });
  return { open, close };
}
