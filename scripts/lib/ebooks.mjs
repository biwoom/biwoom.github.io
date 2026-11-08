import fs from 'node:fs';
import path from 'node:path';
import { compareNames, nameInfo, parse, markdownTree, textOf, shortId, readRegistry, referenceTarget, isPublicSource } from './content.mjs';
import { assetUrl } from '../remark-content.mjs';

export const ebookLicense = { label: 'CC0 1.0', url: 'https://creativecommons.org/publicdomain/zero/1.0/' };
const imagePattern = /\.(png|jpe?g|webp|avif)$/i;
const labels = ['저자', '원저자', '번역자', '편집자', '발행일', '판본', '언어'];
/** Read completed ebook packages, without creating individual document routes or registry entries. */
export function getEbooks(root = process.cwd()) {
  const base = path.join(root, 'src/content/ebook');
  if (!fs.existsSync(base)) return [];
  const registry = readRegistry(root);
  const parent = path.join(base, 'index.md');
  if (fs.existsSync(parent) && parse(fs.readFileSync(parent, 'utf8')).data.published === false) return [];
  return fs.readdirSync(base, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && !/^[._]/.test(entry.name) && !['assets'].includes(entry.name))
    .sort((a, b) => compareNames(a.name, b.name)).flatMap(entry => {
      const directory = path.join(base, entry.name);
      const source = `ebook/${entry.name}/index.md`;
      const intro = path.join(directory, 'index.md');
      const { data, body } = fs.existsSync(intro) ? parse(fs.readFileSync(intro, 'utf8')) : { data: {}, body: '' };
      if (data.published === false) return [];
      const files = fs.readdirSync(directory, { withFileTypes: true })
        .filter(file => file.isFile() && !/^[._]/.test(file.name)).map(file => file.name).sort(compareNames);
      const downloads = files.filter(name => /\.(epub|pdf)$/i.test(name)).map(name => ({
        name, source: `ebook/${entry.name}/${name}`, url: assetUrl(`ebook/${entry.name}/${name}`),
        format: path.extname(name).slice(1).toUpperCase(), bytes: fs.statSync(path.join(directory, name)).size,
      })).filter(file => file.bytes > 0).sort((a, b) => a.format.localeCompare(b.format) || compareNames(a.name, b.name));
      if (!downloads.length) return [];
      const coverName = files.find(name => /^(cover|표지)\.(png|jpe?g|webp|avif)$/i.test(name)) ?? files.find(name => imagePattern.test(name));
      const coverSource = coverName ? `ebook/${entry.name}/${coverName}` : '';
      const tree = markdownTree(body);
      const heading = tree.children.find(node => node.type === 'heading' && node.depth === 1);
      const title = data.title || (heading ? textOf(heading).trim() : '') || nameInfo(entry.name).label;
      const bibliography = [], description = [], originals = [];
      for (const node of tree.children) {
        if (node.type !== 'paragraph') continue;
        for (const line of textOf(node).split('\n')) {
          const match = line.match(/^\s*(저자|원저자|번역자|편집자|발행일|판본|언어)\s*[:：]\s*(.+)$/);
          if (match) bibliography.push({ label: match[1], value: match[2].trim() });
          else if (line.trim() && !/^\s*(라이선스|이용조건|원문|출처)\s*[:：]/.test(line)) description.push(line.trim());
        }
      }
      const collect = node => {
        if (node.type === 'link') {
          const target = referenceTarget(source, node.url, registry);
          if (target && /^(text|story)\//.test(target) && registry.files[target] && isPublicSource(target, registry, root)) {
            originals.push({ title: textOf(node), url: registry.files[target].url });
          }
        }
        node.children?.forEach(collect);
      };
      tree.children.filter(node => node.type !== 'code').forEach(collect);
      return [{ id: shortId(`ebook/${entry.name}`), title, bibliography: bibliography.sort((a, b) => labels.indexOf(a.label) - labels.indexOf(b.label)),
        description: data.description || description.join('\n'), originals: [...new Map(originals.map(item => [item.url, item])).values()],
        coverSource, coverUrl: coverSource ? assetUrl(coverSource) : '', downloads, license: ebookLicense }];
    });
}
export function formatEbookSize(bytes) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
