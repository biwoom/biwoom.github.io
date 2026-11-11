import { PROJECT_ROOT, projectPaths, normalizeContentPath, contentFile, readContentDirectory } from './paths.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import { parse, textOf, readRegistry, referenceTarget, isPublicSource } from './content.mjs';
import { markdownTree, markdownRemarkPlugins } from './markdown.mjs';
import remarkContent from '../remark-content.mjs';

export const mediaImagePattern = /\.(png|jpe?g|webp|gif|svg|avif)$/i;

/** One category index contains many H2 image-link sections. No image registry records. */
export function readMediaInformation(root = PROJECT_ROOT) {
  const base = projectPaths(root).content;
  const media = path.join(base, 'media');
  const entries = new Map();
  if (!fs.existsSync(media)) return entries;
  const indexes = ['media/index.md', ...readContentDirectory(media)
    .filter(entry => entry.isDirectory() && !/^[._]/.test(entry.name))
    .map(entry => normalizeContentPath(`media/${entry.name}/index.md`))];
  const registry = readRegistry(root);
  for (const source of indexes) {
    const file = contentFile(source, root);
    if (!fs.existsSync(file)) continue;
    const { data, body } = parse(fs.readFileSync(file, 'utf8'));
    // Metadata privacy does not change the existing shared-public-image policy.
    if (data.published === false) continue;
    const tree = markdownTree(body);
    const boundaries = tree.children.filter(node => node.type === 'heading' && node.depth <= 2);
    for (const [index, heading] of boundaries.entries()) {
      if (heading.depth !== 2 || heading.children.length !== 1 || heading.children[0].type !== 'link') continue;
      const link = heading.children[0];
      const target = referenceTarget(source, link.url, registry);
      const directory = path.posix.dirname(source);
      if (/^(?:[a-z][a-z0-9+.-]*:|\/|#)/i.test(link.url) || /[?#]/.test(link.url) ||
          !target?.startsWith(`${directory}/`) || !mediaImagePattern.test(target) ||
          !isPublicSource(target, registry, root, { asset: true })) {
        throw new Error(`${source}: image heading must link to an existing public image within its category: ${link.url}`);
      }
      if (entries.has(target)) throw new Error(`${source}: duplicate image information for ${link.url}`);
      const title = textOf(link).trim();
      if (!title) throw new Error(`${source}: image heading needs a title: ${link.url}`);
      const end = boundaries[index + 1]?.position.start.offset ?? body.length;
      entries.set(target, { title, markdown: body.slice(heading.position.end.offset, end).trim(), source });
    }
  }
  return entries;
}

/** Render with the same Markdown syntax and relative-link interpretation as site documents. */
export async function addMediaInformation(items, root = PROJECT_ROOT) {
  const entries = readMediaInformation(root);
  const processor = entries.size ? await createMarkdownProcessor({
    remarkPlugins: [...markdownRemarkPlugins, [remarkContent, { root }]],
    syntaxHighlight: false,
  }) : undefined;
  return Promise.all(items.map(async item => {
    const entry = entries.get(item.source);
    if (!entry) return { ...item, informationHtml: '' };
    const rendered = await processor.render(entry.markdown, {
      fileURL: pathToFileURL(contentFile(entry.source, root)),
    });
    return { ...item, title: entry.title, informationHtml: rendered.code };
  }));
}
