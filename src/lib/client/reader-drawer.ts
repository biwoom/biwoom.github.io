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
  closeButton?.addEventListener("click", () => close());
  drawer.addEventListener("cancel", event => { event.preventDefault(); close(); });
  drawer.addEventListener("click", event => { if (event.target === drawer) close(); });
  return { open, close };
}
