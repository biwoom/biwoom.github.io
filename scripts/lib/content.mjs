import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import * as yaml from "js-yaml";
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
      if (!assets && (reserved.has(e.name) || e.name.startsWith("_"))) continue;
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
  return { data, body: m ? source.slice(m[0].length) : source };
}
export function readRegistry(root = process.cwd()) {
  const p = path.join(root, "content-registry.json");
  return fs.existsSync(p)
    ? JSON.parse(fs.readFileSync(p, "utf8"))
    : { version: 1, files: {}, folders: {}, redirects: {} };
}
export function hash(body) {
  return crypto.createHash("sha256").update(body).digest("hex");
}
export function shortId(value) {
  return hash(value.normalize("NFC")).slice(0, 14);
}
export function excerpt(body) {
  const text = body
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^\[\^[^\]]+\]:.*(?:\n[ \t]+.*)*/gm, "");
  const paragraph = text
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .find(
      (s) =>
        s &&
        !/^(#|---|\*\*저자|\*\*출처|\*\*목차|[-*]\s|\d+\.\s|!\[|<)/.test(s),
    );
  return (paragraph ?? "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\[\^[^\]]+\]/g, "")
    .replace(/[*_`\\]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 180);
}
export function folderParts(relative) {
  const [collection, ...segments] = relative.split("/");
  const dirs = segments.slice(0, -1);
  if (collection === "text" && dirs.length >= 3)
    return {
      collection,
      category: dirs[0],
      seriesPath: [collection, ...dirs.slice(0, 2)].join("/"),
      part: dirs[2],
    };
  if (collection === "story" && dirs.length >= 1)
    return {
      collection,
      category: "",
      seriesPath: [collection, dirs[0]].join("/"),
      part: dirs[1] ?? "",
    };
  if (
    collection === "text" &&
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
export function normalize(relative, source, registry = readRegistry()) {
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
    body.match(/^#\s+(.+?)\s*#*\s*$/m)?.[1]?.replace(/[*`]/g, "") ||
    nameInfo(path.basename(relative)).label;
  const intro = path.basename(relative) === "index.md";
  return {
    title,
    description: data.description ?? data.excerpt ?? excerpt(body),
    tags: data.tags ?? [],
    published:
      data.published !== false && !ignored(relative) && !series?.hidden,
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
    const data = normalize(relative, "", registry);
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
