import fs from "node:fs";
import { PROJECT_ROOT, contentFile } from "./paths.mjs";
import { blogFolders, folderMetadata, readRegistry, normalize, markdownPattern, parse, markdownTree, textOf, referenceTarget, compareNames } from "./content.mjs";

// Only the explicit reading-order section controls navigation; ordinary body links do not.
export function readingOrder(source, registry, root = PROJECT_ROOT) {
  const file = contentFile(source, root);
  if (!fs.existsSync(file)) return [];
  const nodes = markdownTree(parse(fs.readFileSync(file, "utf8")).body).children;
  const start = nodes.findIndex(n => n.type === "heading" && n.depth === 2 && textOf(n).trim() === "읽는 순서");
  if (start < 0) return [];
  const result = [];
  const visit = node => {
    if (node.type === "link") {
      const target = referenceTarget(source, node.url, registry);
      if (!target || !markdownPattern.test(target) || !fs.existsSync(contentFile(target, root))) throw new Error(`${source}: invalid reading-order post ${node.url}`);
      if (result.includes(target)) throw new Error(`${source}: duplicate reading-order post ${node.url}`);
      result.push(target);
    }
    node.children?.forEach(visit);
  };
  for (const node of nodes.slice(start + 1)) {
    if (node.type === "heading" && node.depth <= 2) break;
    if (node.type === "list") visit(node);
  }
  return result;
}

export function readBlogCatalog(root = PROJECT_ROOT, registry = readRegistry(root)) {
  const documents = Object.entries(registry.files)
    .filter(([source]) => source.startsWith("blog/") && markdownPattern.test(source) && fs.existsSync(contentFile(source, root)))
    .map(([source, record]) => ({ id: record.id, data: normalize(source, fs.readFileSync(contentFile(source, root), "utf8"), registry, root) }))
    .filter(e => e.data.kind === "document");
  const categoryNames = new Set();
  return blogFolders(root).map(({ key, categories }) => {
    const meta = folderMetadata(key, root);
    const categoryModels = categories.map(categoryKey => {
      const category = folderMetadata(categoryKey, root);
      if (categoryNames.has(category.title)) throw new Error(`BLOG category belongs to more than one series: ${category.title}`);
      categoryNames.add(category.title);
      return { key: categoryKey, ...category, order: Number(categoryKey.split("/").at(-1).match(/^(\d+)\./)?.[1] ?? Number.MAX_SAFE_INTEGER), url: registry.folders[categoryKey]?.url, source: `${categoryKey}/index.md` };
    });
    const source = `${key}/index.md`;
    const explicit = meta.published ? readingOrder(source, registry, root) : [];
    for (const target of explicit) {
      if (!documents.some(e => e.data.source === target && e.data.seriesKey === key)) throw new Error(`${source}: reading-order post must belong to this series: ${target}`);
    }
    const entries = documents.filter(e => e.data.seriesKey === key && e.data.published).sort((a, b) => {
      const aOrder = explicit.indexOf(a.data.source), bOrder = explicit.indexOf(b.data.source);
      return (aOrder < 0 ? Infinity : aOrder) - (bOrder < 0 ? Infinity : bOrder)
        || a.data.date.getTime() - b.data.date.getTime() || compareNames(a.data.source, b.data.source);
    });
    return { key, ...meta, source, url: registry.folders[key]?.url, categories: categoryModels.filter(c => c.published), entries, count: entries.length, readingTime: entries.reduce((sum, e) => sum + e.data.readingTime, 0) };
  }).filter(series => series.published);
}
