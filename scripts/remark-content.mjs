import path from "node:path";
import fs from "node:fs";
import { visit } from "unist-util-visit";
import { readRegistry } from "./lib/content.mjs";
export function resolveReference(source, url, registry = readRegistry()) {
  if (url.startsWith("content-asset:"))
    return assetUrl(url.slice("content-asset:".length));
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(url)) return url;
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
  const candidate = path.posix.normalize(
    path.posix.join(path.posix.dirname(source), decoded),
  );
  const target = registry.aliases?.[candidate] ?? candidate;
  if (registry.files[target] && /\.mdx?$/.test(target))
    return registry.files[target].url + (fragment ? "#" + fragment : "");
  if (fs.existsSync(path.join("src/content", target)))
    return assetUrl(target) + (fragment ? "#" + fragment : "");
  return url;
}
export function assetUrl(relative) {
  return (
    "/generated/content/" +
    relative.split("/").map(encodeURIComponent).join("/")
  );
}
export default function remarkContent() {
  return (tree, file) => {
    const source = path
      .relative(path.resolve("src/content"), file.path)
      .split(path.sep)
      .join("/");
    const registry = readRegistry();
    const textOf = (node) =>
      node.value ?? node.children?.map(textOf).join("") ?? "";
    // Keep the author's local manual TOC in Markdown; the site supplies its own TOC.
    const toc = tree.children.findIndex(
      (node) => node.type === "heading" && textOf(node).trim() === "목차",
    );
    if (toc >= 0) {
      const depth = tree.children[toc].depth;
      let end = toc + 1;
      while (
        end < tree.children.length &&
        !(
          tree.children[end].type === "heading" &&
          tree.children[end].depth <= depth
        )
      )
        end++;
      tree.children.splice(toc, end - toc);
    }

    // First H1 is the document title; remaining headings keep their original levels.
    const first = tree.children.findIndex(
      (node) => node.type === "heading" && node.depth === 1,
    );
    if (first >= 0) tree.children.splice(first, 1);
    visit(tree, (node) => {
      if (
        (node.type === "link" ||
          node.type === "image" ||
          node.type === "definition") &&
        node.url
      )
        node.url = resolveReference(source, node.url, registry);
    });
  };
}
