import fs from "node:fs";
import path from "node:path";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";
import { prepare } from "./prepare-content.mjs";
import {
  walk,
  normalize,
  parse,
  markdownPattern,
  mediaPattern,
  ignored,
} from "./lib/content.mjs";
export function validate(root = process.cwd()) {
  const errors = [],
    base = path.join(root, "src/content");
  let registry;
  try {
    registry = prepare(root);
  } catch (error) {
    return [error.message];
  }
  const seen = new Map();
  const allowed = new Set([
    "title",
    "description",
    "tags",
    "date",
    "published",
    "license",
    "licenseUrl",
    "rightsHolder",
    "copyrightNotice",
    "lang",
    "thumbnailAsset",
  ]);
  const activeFiles = ["text", "story", "blog", "pages"]
    .flatMap((c) => walk(path.join(base, c)))
    .filter((p) => markdownPattern.test(p) || mediaPattern.test(p));
  const ids = new Map();
  for (const p of activeFiles) {
    const relative = path.relative(base, p).split(path.sep).join("/");
    try {
      const source = markdownPattern.test(p) ? fs.readFileSync(p, "utf8") : "";
      const { data, body } = parse(source),
        normal = normalize(relative, source, registry);
      for (const key of Object.keys(data))
        if (!allowed.has(key))
          errors.push(
            `${relative}: obsolete or unknown frontmatter field: ${key}`,
          );
      if (
        data.tags !== undefined &&
        (!Array.isArray(data.tags) ||
          data.tags.some((t) => typeof t !== "string"))
      )
        errors.push(`${relative}: tags must be a string array`);
      if (data.published !== undefined && typeof data.published !== "boolean")
        errors.push(`${relative}: published must be boolean`);
      if (Number.isNaN(normal.date.valueOf()))
        errors.push(`${relative}: invalid date`);
      if (!normal.title?.trim() || /^\d+$/.test(normal.title))
        errors.push(`${relative}: add an H1 title or descriptive filename`);
      const info = relative.split("/");
      if (
        info[0] === "text" &&
        !(
          info.length === 5 ||
          (info.length === 4 && path.basename(p) === "index.md")
        )
      )
        errors.push(
          `${relative}: expected category/work/section/document or category/work/index.md`,
        );
      if (normal.published) {
        const previous = seen.get(normal.url);
        if (previous)
          errors.push(
            `${relative}: duplicate public URL ${normal.url} (${previous})`,
          );
        seen.set(normal.url, relative);
        const id = registry.files[relative].id;
        if (ids.has(id))
          errors.push(
            `${relative}: duplicate content id ${id} (${ids.get(id)})`,
          );
        ids.set(id, relative);
      }
      const tree = unified().use(remarkParse).use(remarkGfm).parse(body);
      visit(tree, (node) => {
        if (!["link", "image", "definition"].includes(node.type) || !node.url)
          return;
        const url = node.url;
        if (/^(?:https?:|mailto:|tel:|#|\/\/)/i.test(url)) return;
        if (/^(?:design-asset:|\/generated\/design\/)/.test(url)) {
          errors.push(`${relative}: unmigrated asset ${url}`);
          return;
        }
        if (url.startsWith("/")) return; // Root routes are checked against build output separately.
        const [raw] = url.split("#");
        let candidate;
        try {
          candidate = url.startsWith("content-asset:")
            ? url.slice(14)
            : path.posix.normalize(
                path.posix.join(
                  path.posix.dirname(relative),
                  decodeURIComponent(raw),
                ),
              );
        } catch {
          return;
        }
        candidate = registry.aliases?.[candidate] ?? candidate;
        if (!candidate || !fs.existsSync(path.join(base, candidate)))
          errors.push(`${relative}: missing local target ${url}`);
        else if (ignored(candidate) && markdownPattern.test(candidate))
          errors.push(`${relative}: link points to excluded document ${url}`);
      });
    } catch (error) {
      errors.push(`${relative}: ${error.message}`);
    }
  }
  // Stale records are retained for move detection, but never rendered.
  return [...new Set(errors)];
}
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const rootIndex = process.argv.indexOf("--root");
  const errors = validate(
    rootIndex >= 0 ? path.resolve(process.argv[rootIndex + 1]) : process.cwd(),
  );
  if (errors.length) {
    console.error(
      `content check failed with ${errors.length} issue(s):\n` +
        errors.map((e) => "- " + e).join("\n"),
    );
    process.exitCode = 1;
  } else console.log("Content checks passed.");
}
