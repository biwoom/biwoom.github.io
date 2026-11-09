import { projectPaths } from './lib/paths.mjs';
import path from 'node:path';
import { visit } from 'unist-util-visit';

// Retain generated reference IDs, but make each note's text the return control.
// BLOG/pages continue to use their ordinary footnote markup.
export default function rehypeReaderFootnotes() {
  return (tree, file) => {
    const source = path.relative(projectPaths().content, file.path).split(path.sep).join('/');
    if (!/^(text|story)\//.test(source) || /(?:^|\/)index\.mdx?$/i.test(source)) return;
    visit(tree, 'element', section => {
      if (section.tagName !== 'section' || !('dataFootnotes' in (section.properties ?? {}))) return;
      const list = section.children.find(node => node.tagName === 'ol');
      for (const note of list?.children ?? []) {
        if (note.tagName !== 'li') continue;
        let target;
        const removeBackrefs = node => {
          node.children = node.children?.filter(child => {
            if (child.tagName === 'a' && 'dataFootnoteBackref' in (child.properties ?? {})) {
              target ??= child.properties.href;
              return false;
            }
            removeBackrefs(child);
            return true;
          });
        };
        removeBackrefs(note);
        if (!target) continue;
        note.children = [{
          type: 'element', tagName: 'div',
          properties: { className: ['ol-footnote-return'], role: 'link', tabIndex: 0,
            dataFootnoteReturn: target, title: '본문 각주 번호로 이동' },
          children: note.children,
        }];
      }
    });
  };
}
