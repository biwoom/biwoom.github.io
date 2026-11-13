import { relativeContentPath } from './lib/paths.mjs';
import { visit } from 'unist-util-visit';

// Retain generated reference IDs and make each note a return target.
// BLOG/pages continue to use their ordinary footnote markup.
export default function rehypeReaderFootnotes() {
  return (tree, file) => {
    const source = relativeContentPath(file.path);
    if (!/^(text|story)\//.test(source) || /(?:^|\/)index\.mdx?$/i.test(source)) return;
    visit(tree, 'element', section => {
      if (section.tagName !== 'section' || !('dataFootnotes' in (section.properties ?? {}))) return;
      const list = section.children.find(node => node.tagName === 'ol');
      for (const note of list?.children ?? []) {
        if (note.tagName !== 'li') continue;
        let target;
        const prepareLinks = node => {
          node.children = node.children?.filter(child => {
            if (child.tagName === 'a') {
              const properties = child.properties ?? {};
              if ('dataFootnoteBackref' in properties) {
                target ??= properties.href;
                return false;
              }
              if (typeof properties.href === 'string') {
                child.properties = {
                  ...properties,
                  className: [...(properties.className ?? []), 'ol-footnote-source-link'],
                };
                if (/^https?:\/\//i.test(properties.href)) {
                  child.properties.target = '_blank';
                  child.properties.rel = [...new Set([...(properties.rel ?? []), 'noopener'])];
                }
              }
            }
            prepareLinks(child);
            return true;
          });
        };
        prepareLinks(note);
        if (!target) continue;
        note.properties = { ...note.properties, dataFootnoteReturn: target, tabIndex: 0,
          title: '본문 각주 번호로 이동' };
        note.children = [{
          type: 'element', tagName: 'div',
          properties: { className: ['ol-footnote-text'] },
          children: note.children,
        }];
      }
    });
  };
}
