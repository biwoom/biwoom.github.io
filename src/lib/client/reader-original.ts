/** Only explicitly marked TEXT source passages participate in this toggle. */
export function initOriginalToggle() {
  const reader = document.querySelector<HTMLElement>('[data-text-workspace]');
  const button = reader?.querySelector<HTMLButtonElement>('[data-original-toggle]');
  if (!reader || !button) return;
  const blocks = [...reader.querySelectorAll<HTMLElement>('.ol-story-chapter > .ol-prose [data-reader-original]')];
  if (!blocks.length) { button.hidden = true; return; }
  const label = button.querySelector<HTMLElement>('[data-original-label]');
  button.setAttribute('aria-controls', blocks.map((block, index) => {
    if (!block.id) block.id = `ol-reader-original-${index + 1}`;
    return block.id;
  }).join(' '));
  let hidden = false;
  button.addEventListener('click', () => {
    hidden = !hidden;
    blocks.forEach(block => { block.hidden = hidden; });
    const action = hidden ? '원문 보기' : '원문 숨기기';
    button.setAttribute('aria-pressed', String(hidden));
    button.setAttribute('aria-label', action);
    button.title = action;
    if (label) label.textContent = action;
  });
}
