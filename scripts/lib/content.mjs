import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import * as yaml from "js-yaml";
import { markdownTree } from "./markdown.mjs";
export { markdownTree } from "./markdown.mjs";
import { CONTENT_DEFAULTS } from "../../site-config.mjs";

export const collections = ["text", "story", "blog", "pages"];
export const reserved = new Set(["assets", "_assets", "_drafts", "_templates"]);
export const mediaPattern = /\.(pdf|png|jpe?g|webp|gif|svg|html)$/i;
export const markdownPattern = /\.mdx?$/i;
export function nameInfo(value) {
  const name = value.replace(/\.(mdx?|pdf|png|jpe?g|webp|gif|svg|html)$/i, "");
  const match = name.match(/^(\d+)\.(.+)$/);
  return {
    label: match ? match[2].trim() : name,
    order: match
      ? Number(match[1])
      : /^\d+$/.test(name)
        ? Number(name)
        : Number.MAX_SAFE_INTEGER,
  };
}
export function compareNames(a, b) {
  const x = nameInfo(a),
    y = nameInfo(b);
  return (
    x.order - y.order ||
    x.label.localeCompare(y.label, "ko", { numeric: true }) ||
    a.localeCompare(b)
  );
}
export function ignored(relative) {
  return relative
    .split("/")
    .some((p) => p.startsWith(".") || p.startsWith("_") || reserved.has(p));
}
export function walk(root, { assets = false } = {}) {
  if (!fs.existsSync(root)) return [];
  const files = [];
  function visit(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (
        e.name.startsWith(".") ||
        e.name === "_drafts" ||
        e.name === "_templates"
      )
        continue;
      if (e.name.startsWith("_") && !(assets && e.name === "_assets")) continue;
      if (!assets && reserved.has(e.name)) continue;
      const p = path.join(dir, e.name);
      if (e.isDirectory()) visit(p);
      else if (e.isFile()) files.push(p);
    }
  }
  visit(root);
  return files.sort();
}
export function parse(source) {
  const m = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  const data = m ? (yaml.load(m[1]) ?? {}) : {};
  if (typeof data !== "object" || Array.isArray(data))
    throw new Error("frontmatter must be an object");
  validateInput(data);
  return { data, body: m ? source.slice(m[0].length) : source };
}
export function readRegistry(root = process.cwd()) {
  const p = path.join(root, "content-registry.json");
  if (!fs.existsSync(p)) throw new Error("Missing content-registry.json: restore it from Git; for a new vault run prepare:content -- --init.");
  const registry = JSON.parse(fs.readFileSync(p, "utf8"));
  if (registry.version !== 1 || !registry.files || !registry.folders || !registry.redirects)
    throw new Error("Invalid content-registry.json: restore the committed registry.");
  return registry;
}
export function hash(body) {
  return crypto.createHash("sha256").update(body).digest("hex");
}
export function shortId(value) {
  return hash(value.normalize("NFC")).slice(0, 14);
}
export const inputFields = new Set(["title", "description", "tags", "date", "published", "license", "licenseUrl", "rightsHolder", "copyrightNotice", "lang", "thumbnailAsset"]);
export function validateInput(data) {
  for (const [key, value] of Object.entries(data)) {
    if (!inputFields.has(key)) throw new Error(`obsolete or unknown frontmatter field: ${key}`);
    if (key === "tags") {
      if (!Array.isArray(value) || value.some(t => typeof t !== "string" || !t.trim())) throw new Error("tags must be a nonempty string array (or [])");
      if (value.some(t => t.includes("/"))) throw new Error("tags must use plain names without classification prefixes");
    } else if (key === "published") {
      if (typeof value !== "boolean") throw new Error("published must be boolean");
    } else if (key === "date") {
      if (!(typeof value === "string" || value instanceof Date) || Number.isNaN(new Date(value).valueOf())) throw new Error("invalid date");
    } else if (typeof value !== "string") throw new Error(`${key} must be a string`);
  }
}
export const textOf = node => node.type === "image" ? (node.alt ?? "") : (node.value ?? node.children?.map(textOf).join("") ?? "");
export function firstHeading(body) {
  return markdownTree(body).children.find(n => n.type === "heading" && n.depth === 1);
}
export function excerpt(body) {
  const paragraph = markdownTree(body).children.find(n => n.type === "paragraph" && !/^(저자|출처|목차)/.test(textOf(n)) && !n.children?.some(c => c.type === "image"));
  return paragraph ? textOf(paragraph).replace(/\s+/g, " ").trim().slice(0, 180) : "";
}
export function resolveAlias(relative, registry) {
  const seen = new Set();
  while (registry.aliases?.[relative]) {
    if (seen.has(relative)) throw new Error(`Alias cycle: ${relative}`);
    seen.add(relative);
    relative = registry.aliases[relative];
  }
  return relative;
}
export function linkMove(registry, oldPath, newPath) {
  registry.aliases ??= {};
  delete registry.aliases[newPath];
  registry.aliases[oldPath] = newPath;
  for (const alias of Object.keys(registry.aliases)) registry.aliases[alias] = resolveAlias(alias, registry);
}
export function isIntroduction(relative) {
  const { collection, seriesPath } = folderParts(relative);
  return ["text", "story"].includes(collection) && relative === `${seriesPath}/index.md`;
}
export function publicationDay(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}
// Assets belong to their nearest index.md directory; a loose document's links are private
// unless the same asset is also referenced by a public document. Unreferenced shared assets are public.
export function isPublicSource(relative, registry, root = process.cwd(), { asset = false } = {}) {
  if (relative.split("/").some(p => p.startsWith(".") || (p.startsWith("_") && !(asset && p === "_assets")))) return false;
  if (!asset && ignored(relative)) return false;
  const base = path.join(root, "src/content");
  if (!fs.existsSync(path.join(base, relative))) return false;
  // media is a shared public asset namespace, never a document collection.
  if (relative.startsWith("media/"))
    return asset && !markdownPattern.test(relative) && fs.statSync(path.join(base, relative)).isFile();
  for (let dir = path.posix.dirname(relative); dir !== "."; dir = path.posix.dirname(dir)) {
    const intro = path.join(base, dir, "index.md");
    if (fs.existsSync(intro) && parse(fs.readFileSync(intro, "utf8")).data.published === false) return false;
  }
  if (!asset && markdownPattern.test(relative)) return parse(fs.readFileSync(path.join(base, relative), "utf8")).data.published !== false;
  if (asset && registry.files[relative] && mediaPattern.test(relative) && !ignored(relative)) return true;
  if (asset) {
    let privateUse = false, publicUse = false;
    for (const source of Object.keys(registry.files)) {
      if (!markdownPattern.test(source) || !fs.existsSync(path.join(base, source)) || ignored(source)) continue;
      const { data, body } = parse(fs.readFileSync(path.join(base, source), "utf8"));
      const urls = data.thumbnailAsset ? [data.thumbnailAsset] : [];
      const collect = n => { if (n.url) urls.push(n.url); n.children?.forEach(collect); };
      collect(markdownTree(body));
      if (urls.some(url => referenceTarget(source, url, registry) === relative)) {
        if (isPublicSource(source, registry, root)) publicUse = true; else privateUse = true;
      }
    }
    if (privateUse && !publicUse) return false;
  }
  return true;
}
export function referenceTarget(source, url, registry) {
  if (/^(?:[a-z][a-z0-9+.-]*:|\/|#)/i.test(url) && !url.startsWith("content-asset:")) return null;
  const raw = url.split("#")[0].split("?")[0];
  let target;
  try { target = raw.startsWith("content-asset:") ? decodeURIComponent(raw.slice(14)) : path.posix.join(path.posix.dirname(source), decodeURIComponent(raw)); } catch { return null; }
  target = path.posix.normalize(target);
  if (target === ".." || target.startsWith("../")) return null;
  return resolveAlias(target, registry);
}
export function categoryUrl(key) {
  return `/${key.split("/")[0]}/category/${shortId(key)}/`;
}
// Read folders as well as published content so an empty category remains visible.
export function categoryFolders(collection, root = process.cwd()) {
  if (!["text", "story"].includes(collection)) return [];
  const base = path.join(root, "src/content", collection);
  if (!fs.existsSync(base)) return [];
  return fs.readdirSync(base, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !/^[._]/.test(entry.name) && entry.name !== "assets")
    .sort((a, b) => compareNames(a.name, b.name))
    .map((entry) => {
      const key = `${collection}/${entry.name}`;
      return { key, label: nameInfo(entry.name).label, url: categoryUrl(key) };
    });
}
export function folderParts(relative) {
  const [collection, ...segments] = relative.split("/");
  const dirs = segments.slice(0, -1);
  if (["text", "story"].includes(collection) && dirs.length >= 3)
    return {
      collection,
      category: dirs[0],
      seriesPath: [collection, ...dirs.slice(0, 2)].join("/"),
      part: dirs[2],
    };
  if (
    ["text", "story"].includes(collection) &&
    dirs.length === 2 &&
    path.basename(relative) === "index.md"
  )
    return {
      collection,
      category: dirs[0],
      seriesPath: [collection, ...dirs].join("/"),
      part: "",
    };
  return {
    collection,
    category: "",
    seriesPath: collection + "/standalone",
    part: "",
  };
}
export function normalize(relative, source, registry = readRegistry(), root = process.cwd()) {
  const { data, body } = parse(source);
  const record = registry.files[relative];
  if (!record)
    throw new Error(
      `Missing registry entry: ${relative}. Run npm run prepare:content.`,
    );
  const parts = folderParts(relative);
  const series = registry.folders[parts.seriesPath];
  const title =
    data.title?.trim() ||
    (firstHeading(body) ? textOf(firstHeading(body)) : "") ||
    nameInfo(path.basename(relative)).label;
  const intro = isIntroduction(relative);
  return {
    title,
    description: data.description ?? excerpt(body),
    tags: data.tags ?? [],
    published:
      data.published !== false && !ignored(relative) && !series?.hidden && isPublicSource(relative, registry, root),
    date: new Date(data.date ?? record.date ?? "1970-01-01"),
    readingTime: Math.max(1, Math.ceil(body.length / 700)),
    url: record.url,
    source: relative,
    kind: intro ? "series" : "document",
    category: parts.category ? nameInfo(parts.category).label : "",
    categoryOrder: nameInfo(parts.category).order,
    series: series?.title ?? nameInfo(parts.seriesPath.split("/").at(-1)).label,
    seriesKey: parts.seriesPath,
    seriesUrl: series?.url ?? `/${parts.collection}/`,
    part: parts.part ? nameInfo(parts.part).label : "자료",
    partKey: parts.part || "자료",
    order: nameInfo(path.basename(relative)).order,
    license: data.license ?? CONTENT_DEFAULTS.license,
    rightsHolder: data.rightsHolder ?? CONTENT_DEFAULTS.author,
    licenseUrl: data.licenseUrl,
    copyrightNotice: data.copyrightNotice,
    lang: data.lang ?? CONTENT_DEFAULTS.lang,
    thumbnailAsset: data.thumbnailAsset,
  };
}
export function mediaEntries(root = process.cwd()) {
  const registry = readRegistry(root),
    result = [];
  for (const [relative, record] of Object.entries(registry.files)) {
    if (
      !mediaPattern.test(relative) ||
      ignored(relative) ||
      !fs.existsSync(path.join(root, "src/content", relative))
    )
      continue;
    const data = normalize(relative, "", registry, root);
    if (data.published)
      result.push({
        id: record.id,
        data: {
          ...data,
          format: path.extname(relative).slice(1).toUpperCase(),
        },
        body: "",
      });
  }
  return result;
}

// Only routes backed by current public source files can receive legacy redirects.
export function publicRoutes(registry, root = process.cwd()) {
  const routes = new Map();
  for (const [source, record] of Object.entries(registry.files)) {
    if (!isPublicSource(source, registry, root)) continue;
    const info = folderParts(source);
    routes.set(record.url, source);
    if (["text", "story"].includes(info.collection)) routes.set(registry.folders[info.seriesPath]?.url, info.seriesPath);
  }
  routes.delete(undefined);
  return routes;
}
export function activeRedirects(registry = readRegistry(), root = process.cwd()) {
  const routes = publicRoutes(registry, root);
  return Object.fromEntries(Object.entries(registry.redirects).filter(([from, to]) => !routes.has(from) && routes.has(to)));
}
