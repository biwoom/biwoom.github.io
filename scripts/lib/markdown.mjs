import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkCjkFriendly from 'remark-cjk-friendly/parseOnly';

// Rendering and content analysis must agree on emphasis boundaries. This parser
// extension handles punctuation next to CJK text without rewriting source text.
export const markdownRemarkPlugins = [remarkGfm, remarkCjkFriendly];
export const markdownTree = body => unified().use(remarkParse).use(markdownRemarkPlugins).parse(body);

export const isOriginalBlock = node => node.type === 'code' && node.lang === 'original';
export function hasOriginalBlocks(body) {
  const contains = node => isOriginalBlock(node) || (node.children ?? []).some(contains);
  return contains(markdownTree(body));
}
