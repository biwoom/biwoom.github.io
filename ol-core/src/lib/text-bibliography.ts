import { markdownTree, textOf } from '../../scripts/lib/content.mjs';

/** Read only explicitly labelled bibliography paragraphs, never infer metadata
 * from a work name, file name, content date or the default rights holder. */
export function readTextBibliography(body = ''): { label: string; value: string }[] {
  const fields = new Map<string, string>();
  for (const node of markdownTree(body).children) {
    if (node.type !== 'paragraph') continue;
    const text = node.children.map(child => child.type === 'break' ? '\n' : textOf(child)).join('');
    for (const line of text.split('\n')) {
      const match = line.match(/^\s*(원제|원저자|저자|저본|출처|번역자|연구자)\s*[:：]\s*(.+?)\s*$/);
      if (match && !fields.has(match[1])) fields.set(match[1], match[2]);
    }
  }
  return [...fields].map(([label, value]) => ({ label, value }));
}
