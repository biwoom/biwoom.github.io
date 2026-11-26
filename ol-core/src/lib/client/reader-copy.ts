export function tellReader(feedback: HTMLElement | null, message: string) {
  if (!feedback) return;
  feedback.textContent = message;
  window.setTimeout(() => { if (feedback.textContent === message) feedback.textContent = ''; }, 4000);
}

export async function copyReaderText(value: string, feedback: HTMLElement | null) {
  try {
    await navigator.clipboard.writeText(value);
    tellReader(feedback, '복사했습니다.');
    return true;
  } catch {
    tellReader(feedback, '복사할 수 없습니다. 주소나 본문을 직접 선택해 복사해 주세요.');
    return false;
  }
}

export function initReaderCopy(root: Document | HTMLElement, readerBoundary?: () => number) {
  const normalizeMarkdown = (value: string) => value.replace(/\n{3,}/g, '\n\n').replace(/[ \t]+\n/g, '\n').trim();
  const feedback = root.querySelector<HTMLElement>('[data-reader-feedback]');
  for (const dropdown of root.querySelectorAll<HTMLElement>('[data-copy-dropdown]')) {
    const trigger = dropdown.querySelector<HTMLButtonElement>('button');
    if (!trigger) continue;
    const expanded = () => trigger.getAttribute('aria-expanded') === 'true';
    const setExpanded = (open: boolean) => trigger.setAttribute('aria-expanded', String(open));
    trigger.addEventListener('click', () => setExpanded(!expanded()));
    document.addEventListener('click', event => {
      if (event.target instanceof Node && !dropdown.contains(event.target)) setExpanded(false);
    });
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || !expanded() || !dropdown.contains(document.activeElement)) return;
      event.preventDefault();
      setExpanded(false);
      trigger.focus();
    });

    dropdown.addEventListener('click', async event => {
      const button = (event.target as Element).closest<HTMLButtonElement>('[data-copy-kind]');
      if (!button) return;
      const title = dropdown.dataset.copyTitle ?? document.title;
      const address = new URL(dropdown.dataset.copyUrl ?? location.pathname, location.origin);
      let value = address.href;
      switch (button.dataset.copyKind) {
        case 'markdown': {
          const markdown = root.querySelector<HTMLTemplateElement>('[data-reader-copy-source]')?.content.textContent;
          if (markdown != null) {
            value = `# ${title}\n\n${markdown.trimEnd()}`;
            break;
          }
          const source = root.querySelector<HTMLElement>('.ol-prose');
          const notes = root.querySelector<HTMLElement>('.ol-reader-footnotes-content .footnotes');
          value = normalizeMarkdown([`# ${title}`, source?.innerText, notes?.innerText].filter(Boolean).join('\n\n'));
          break;
        }
        case 'section': {
          const boundary = readerBoundary?.() ?? 160;
          const current = [...root.querySelectorAll<HTMLElement>('.ol-story-chapter > .ol-prose :is(h2,h3,h4,h5)')]
            .filter(heading => heading.getBoundingClientRect().top <= boundary).at(-1);
          if (current) address.hash = current.id;
          value = address.href;
          break;
        }
        case 'citation': {
          const selection = window.getSelection();
          const selected = selection?.toString().trim();
          if (!selected || !selection?.anchorNode?.parentElement?.closest('.ol-story-chapter')) {
            tellReader(feedback, '본문에서 인용할 문장을 먼저 선택해 주세요.');
            return;
          }
          value = `${selected}\n\n${title} — Biwoom TEXT\n${address.href}`;
          break;
        }
      }
      if (await copyReaderText(value, feedback)) {
        const label = button.textContent;
        button.textContent = '복사됨';
        window.setTimeout(() => { if (label !== '복사됨') button.textContent = label; }, 1200);
        setExpanded(false);
        if (document.activeElement === button) trigger.focus();
      }
    });
  }
}
