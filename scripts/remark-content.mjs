import path from "node:path";
import fs from "node:fs";
import { visit } from "unist-util-visit";
import { readRegistry, referenceTarget, textOf } from "./lib/content.mjs";
import { isOriginalBlock } from "./lib/markdown.mjs";
export function resolveReference(source, url, registry = readRegistry(), root = process.cwd()) {
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(url) && !url.startsWith("content-asset:")) return url;
  const [raw, fragment] = url.split("#");
  if (!raw) return url;
  let decoded;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return url;
  }
  if (decoded.startsWith("/")) {
    const target =
      registry.redirects[decoded.endsWith("/") ? decoded : decoded + "/"];
    return target ? target + (fragment ? "#" + fragment : "") : url;
  }
  const target = referenceTarget(source, url, registry);
  if (!target) return url;
  if (registry.files[target] && /\.mdx?$/.test(target))
    return registry.files[target].url + (fragment ? "#" + fragment : "");
  if (fs.existsSync(path.join(root, "src/content", target)))
    return assetUrl(target) + (url.includes("?") ? "?" + raw.split("?").slice(1).join("?") : "") + (fragment ? "#" + fragment : "");
  return url;
}
export function assetUrl(relative) {
  return (
    "/generated/content/" +
    relative.split("/").map(encodeURIComponent).join("/")
  );
}
export default function remarkContent({ root = process.cwd() } = {}) {
  return (tree, file) => {
    const source = path
      .relative(path.join(root, "src/content"), file.path)
      .split(path.sep)
      .join("/");
    const registry = readRegistry(root);
    // Only remove a verified list of internal TOC links, never a heading section.
    const toc = tree.children.findIndex(node => node.type === "heading" && textOf(node).trim() === "목차");
    if (toc >= 0) {
      for (let index = toc + 1; index < tree.children.length; index++) {
        const node = tree.children[index];
        if (node.type === "heading") break;
        if (node.type !== "list") continue;
        const links = [];
        const collect = child => { if (child.type === "link") links.push(child.url); child.children?.forEach(collect); };
        collect(node);
        if (links.length && links.every(url => url.startsWith("#"))) {
          tree.children.splice(index, 1);
          tree.children.splice(toc, 1);
        }
        break;
      }
    }

    // First H1 is the document title; remaining headings keep their original levels.
    const first = tree.children.findIndex(
      (node) => node.type === "heading" && node.depth === 1,
    );
    if (first >= 0) tree.children.splice(first, 1);
    visit(tree, (node) => {
      if (source.startsWith('text/') && isOriginalBlock(node)) {
        // A dedicated wrapper survives code highlighting. HAST text nodes keep
        // markup-like source characters literal, without HTML interpolation.
        node.type = 'original';
        node.data = {
          hName: 'div', hProperties: { 'data-reader-original': '' },
          hChildren: [{ type: 'element', tagName: 'pre', properties: {}, children: [
            { type: 'element', tagName: 'code', properties: {}, children: [{ type: 'text', value: node.value + '\n' }] },
          ] }],
        };
      }
      if (
        (node.type === "link" ||
          node.type === "image" ||
          node.type === "definition") &&
        node.url
      )
        node.url = resolveReference(source, node.url, registry, root);
    });
  };
}
