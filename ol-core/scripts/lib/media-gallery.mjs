import { PROJECT_ROOT, projectPaths, relativeContentPath } from './paths.mjs';
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { walk, compareNames, nameInfo, hash } from "./content.mjs";
import { assetUrl } from "../remark-content.mjs";
import { addMediaInformation, mediaImagePattern } from "./media-information.mjs";

/** @typedef {{source:string,url:string,title:string,fileName:string,categoryKey:string,category:string,width:number,height:number,previewUrl:string,previewWidth:number,previewHeight:number,informationHtml?:string}} MediaImage */
export const uncategorizedKey = "__uncategorized";
const previewVersion = 1;
const pending = new Map();

export function mediaCategory(source) {
  const segments = source.split("/");
  return segments.length > 2
    ? { key: segments[1], label: nameInfo(segments[1]).label }
    : { key: uncategorizedKey, label: "미분류" };
}
function compareCategories(a, b) {
  if (a === b) return 0;
  if (a === uncategorizedKey) return 1;
  if (b === uncategorizedKey) return -1;
  return compareNames(a, b);
}
/** @param {MediaImage[]} items */
export function getMediaCategories(items) {
  const groups = new Map();
  for (const item of items) {
    const group = groups.get(item.categoryKey) ?? { key: item.categoryKey, label: item.category, count: 0 };
    group.count++;
    groups.set(item.categoryKey, group);
  }
  return [...groups.values()].sort((a, b) => compareCategories(a.key, b.key));
}

/** Build/cache lightweight previews without changing source assets or registry records.
 * @returns {Promise<MediaImage[]>}
 */
export function syncMediaGallery(root = PROJECT_ROOT) {
  const key = path.resolve(root);
  if (pending.has(key)) return pending.get(key);
  const task = prepareGallery(key).finally(() => pending.delete(key));
  pending.set(key, task);
  return task;
}
/** @returns {Promise<MediaImage[]>} */
async function prepareGallery(root) {
  const base = projectPaths(root).content;
  const output = path.join(projectPaths(root).generated, "media-gallery");
  const cacheFile = path.join(projectPaths(root).astro, "media-gallery-cache.json");
  let cache = { version: previewVersion, files: {} };
  try { const stored = JSON.parse(fs.readFileSync(cacheFile, "utf8")); if (stored.version === previewVersion) cache = stored; } catch {}
  fs.mkdirSync(output, { recursive: true });
  const next = { version: previewVersion, files: {} }, expected = new Set();
  /** @type {MediaImage[]} */
  const items = [];
  for (const file of walk(path.join(base, "media"), { assets: true }).filter(file => mediaImagePattern.test(file) && !path.relative(base, file).split(path.sep).some(part => /^[._]/.test(part)))) {
    const source = relativeContentPath(file, root);
    const stat = fs.statSync(file), signature = `${stat.size}:${stat.mtimeMs}`;
    const previous = cache.files[source];
    if (previous?.signature === signature && previous.item.previewUrl.endsWith(`-v${previewVersion}.webp`) && fs.existsSync(path.join(projectPaths(root).public, previous.item.previewUrl))) {
      items.push(previous.item); next.files[source] = previous;
      expected.add(path.basename(previous.item.previewUrl));
      continue;
    }
    try {
      const bytes = fs.readFileSync(file), digest = hash(bytes);
      const name = `${digest}-v${previewVersion}.webp`, destination = path.join(output, name);
      const metadata = await sharp(bytes).metadata();
      const swapped = metadata.orientation >= 5 && metadata.orientation <= 8;
      const width = (swapped ? metadata.height : metadata.width) || 1;
      const height = (swapped ? metadata.width : metadata.height) || 1;
      let preview;
      if (fs.existsSync(destination)) preview = await sharp(destination).metadata();
      else {
        const temporary = `${destination}.${randomUUID()}.tmp`;
        try {
          preview = await sharp(bytes).rotate().resize({ width: 640, height: 960, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toFile(temporary);
          fs.renameSync(temporary, destination);
        } finally { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
      }
      const category = mediaCategory(source);
      const item = {
        source, url: assetUrl(source), fileName: path.basename(file),
        title: nameInfo(path.basename(file, path.extname(file))).label,
        categoryKey: category.key, category: category.label,
        width, height, previewUrl: `/generated/media-gallery/${name}`,
        previewWidth: preview.width || 1, previewHeight: preview.height || 1,
      };
      items.push(item); next.files[source] = { signature, item }; expected.add(name);
    } catch (error) { throw new Error(`Media preview failed for ${source}: ${error.message}`); }
  }
  items.sort((a, b) => compareCategories(a.categoryKey, b.categoryKey) || compareNames(a.fileName, b.fileName) || a.source.localeCompare(b.source));
  for (const name of fs.readdirSync(output))
    if (name.endsWith(".webp") && !expected.has(name) && fs.statSync(path.join(output, name)).isFile()) fs.unlinkSync(path.join(output, name));
  fs.mkdirSync(path.dirname(cacheFile), { recursive: true });
  const serialized = JSON.stringify(next);
  if (!fs.existsSync(cacheFile) || fs.readFileSync(cacheFile, "utf8") !== serialized) {
    const temporary = `${cacheFile}.${randomUUID()}.tmp`;
    try { fs.writeFileSync(temporary, serialized); fs.renameSync(temporary, cacheFile); }
    finally { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
  }
  return addMediaInformation(items, root);
}
