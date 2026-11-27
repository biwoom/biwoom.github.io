import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { PROJECT_ROOT, contentFile, projectPaths } from "./paths.mjs";
import { hash, isIntroduction, isPublicSource, markdownPattern, markdownTree, parse, readRegistry } from "./content.mjs";
import { resolveReference } from "../remark-content.mjs";

const publicPrefix = "/generated/blog-thumbnails/";
const contentPrefix = "/generated/content/";
const variantWidths = [160, 320];
const version = 1;

/** @typedef {{ url: string, width: number }} Variant */
/** @typedef {{ original: string, variants: Variant[] }} Thumbnail */
/** @typedef {{ body?: string, data: { source: string, thumbnailAsset?: string } }} Post */

/** @param {Post} post */
export function getBlogThumbnailUrl(post, registry = readRegistry(), root = PROJECT_ROOT) {
  let firstImage;
  const find = node => {
    if (node.type === "image" && !firstImage) firstImage = node.url;
    node.children?.forEach(find);
  };
  if (!post.data.thumbnailAsset) find(markdownTree(post.body ?? ""));
  const asset = post.data.thumbnailAsset ?? firstImage;
  return asset ? resolveReference(post.data.source, asset, registry, root) : undefined;
}

function manifestPath(root) {
  return path.join(projectPaths(root).astro, "blog-thumbnails.json");
}

/** @param {Post} post @returns {Thumbnail | undefined} */
export function getBlogThumbnail(post, root = PROJECT_ROOT) {
  const file = manifestPath(root);
  const manifest = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : {};
  const thumbnail = manifest[post.data.source];
  if (thumbnail) return thumbnail;
  const original = getBlogThumbnailUrl(post, readRegistry(root), root);
  return original ? { original, variants: [] } : undefined;
}

function publishedImage(url, publicDir) {
  const pathname = url.split(/[?#]/, 1)[0];
  if (!pathname.startsWith(contentPrefix) || !/\.(?:avif|jpe?g|png|webp)$/i.test(pathname)) return;
  const base = path.join(publicDir, contentPrefix);
  let file;
  try { file = path.join(publicDir, decodeURIComponent(pathname)); } catch { return; }
  const relative = path.relative(base, file);
  if (relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) return;
  if (fs.statSync(file, { throwIfNoEntry: false })?.isFile()) return file;
}

// Derive previews only from files already approved and copied by syncAssets.
export async function syncBlogThumbnails(root = PROJECT_ROOT) {
  const paths = projectPaths(root);
  const registry = readRegistry(root);
  const output = path.join(paths.public, publicPrefix);
  const manifestFile = manifestPath(root);
  fs.mkdirSync(output, { recursive: true });
  fs.mkdirSync(path.dirname(manifestFile), { recursive: true });
  /** @type {Record<string, Thumbnail>} */
  const manifest = {};
  const expected = new Set();
  const images = new Map();

  for (const source of Object.keys(registry.files)) {
    if (!source.startsWith("blog/") || !markdownPattern.test(source)
      || isIntroduction(source) || !isPublicSource(source, registry, root)) continue;
    const { body, data } = parse(fs.readFileSync(contentFile(source, root), "utf8"));
    const original = getBlogThumbnailUrl({ body, data: { source, thumbnailAsset: data.thumbnailAsset } }, registry, root);
    if (!original) continue;
    const file = publishedImage(original, paths.public);
    if (!file) {
      manifest[source] = { original, variants: [] };
      continue;
    }
    if (!images.has(file)) {
      try {
        const bytes = fs.readFileSync(file);
        const digest = hash(bytes);
        const metadata = await sharp(bytes).metadata();
        const { width, height } = metadata.autoOrient;
        const variants = [];
        if ((metadata.pages ?? 1) === 1) {
          for (const size of variantWidths) {
            const targetHeight = size * 3 / 4;
            if (width < size || height < targetHeight) continue;
            const name = `${digest}-v${version}-${size}.webp`;
            const destination = path.join(output, name);
            if (!fs.existsSync(destination)) {
              const temporary = `${destination}.${randomUUID()}.tmp`;
              try {
                await sharp(bytes).autoOrient().resize(size, targetHeight, { fit: "cover" })
                  .webp({ quality: 78 }).toFile(temporary);
                fs.renameSync(temporary, destination);
              } finally { fs.rmSync(temporary, { force: true }); }
            }
            variants.push({ url: publicPrefix + name, width: size });
          }
        }
        images.set(file, variants);
      } catch (error) {
        // A bad or unsupported source can still be used as the authored thumbnail.
        console.warn(`BLOG thumbnail fallback for ${original}: ${error.message}`);
        images.set(file, []);
      }
    }
    manifest[source] = { original, variants: images.get(file) };
    for (const variant of manifest[source].variants) expected.add(path.basename(variant.url));
  }

  const serialized = JSON.stringify(manifest);
  if (!fs.existsSync(manifestFile) || fs.readFileSync(manifestFile, "utf8") !== serialized) {
    const temporary = `${manifestFile}.${randomUUID()}.tmp`;
    try {
      fs.writeFileSync(temporary, serialized);
      fs.renameSync(temporary, manifestFile);
    } finally { fs.rmSync(temporary, { force: true }); }
  }
  for (const entry of fs.readdirSync(output, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(".webp") && !expected.has(entry.name))
      fs.unlinkSync(path.join(output, entry.name));
  }
  return expected.size;
}
