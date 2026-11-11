import { PROJECT_ROOT, projectPaths, isMainModule, relativeContentPath, contentFile } from './lib/paths.mjs';
import fs from "node:fs";
import path from "node:path";
import {
  walk,
  parse,
  hash,
  shortId,
  readRegistry,
  folderParts,
  nameInfo,
  markdownPattern,
  mediaPattern,
  linkMove,
  isIntroduction,
  publicationDay,
  resolveAlias,
  isBlogCategoryIntroduction,
  folderMetadata,
  blogFolders,
  isPublicSource,
} from "./lib/content.mjs";
export function prepare(root = PROJECT_ROOT) {
  const registry = readRegistry(root),
    base = projectPaths(root).content;
  registry.aliases ??= {};
  for (const [alias, target] of Object.entries(registry.aliases)) if (alias === target) delete registry.aliases[alias];
  for (const alias of Object.keys(registry.aliases)) resolveAlias(alias, registry);
  const files = ["text", "story", "blog", "pages"]
    .flatMap((c) => walk(path.join(base, c)))
    .filter((p) => markdownPattern.test(p) || mediaPattern.test(p));
  const relativeSet = new Set(
    files.map((p) => relativeContentPath(p, root)),
  );
  for (const p of files) {
    const relative = relativeContentPath(p, root);
    const source = markdownPattern.test(p)
      ? fs.readFileSync(p, "utf8")
      : fs.readFileSync(p);
    const digest = hash(source),
      info = folderParts(relative);
    let data = {};
    try { if (markdownPattern.test(p)) data = parse(source).data; }
    catch (error) { throw new Error(`${relative}: ${error.message}`); }
    let record = registry.files[relative];
    if (!record) {
      const moved = Object.entries(registry.files).filter(
        ([old, r]) =>
          !relativeSet.has(old) &&
          r.hash === digest &&
          old.split("/")[0] === info.collection,
      );
      const newMatches = files.filter(file => {
        const name = relativeContentPath(file, root);
        return !registry.files[name] && name.split("/")[0] === info.collection && hash(fs.readFileSync(file)) === digest;
      });
      if (moved.length && (moved.length !== 1 || newMatches.length !== 1))
        throw new Error(`Ambiguous move for ${relative}: use content:move before preparing identical files.`);
      if (moved.length === 1) {
        const [old, previous] = moved[0];
        record = previous;
        delete registry.files[old];
        linkMove(registry, old, relative);
      } else {
        const id = shortId(relative);
        record = {
          id: `${info.collection}-${id}`,
          url:
            info.collection === "pages"
              ? `/pages/${id}/`
              : `/${info.collection}/read/${id}/`,
          date: null,
        };
      }
      registry.files[relative] = record;
    }
    if (info.collection === "blog" && info.seriesPath !== "blog/standalone") {
      const ensure = (key, kind, oldKey) => {
        const previous = oldKey && registry.folders[oldKey] && !fs.existsSync(contentFile(oldKey, root)) ? registry.folders[oldKey] : null;
        registry.folders[key] ??= previous ? { ...previous } : { url: `/blog/${kind}/${shortId(key)}/` };
        const meta = folderMetadata(key, root);
        registry.folders[key].title = meta.title;
        if (!meta.published) registry.folders[key].hidden = true;
        else delete registry.folders[key].hidden;
      };
      ensure(info.seriesPath, "series", record.seriesKey);
      if (info.category) ensure(`${info.seriesPath}/${info.category}`, "category", record.categoryKey);
    } else if (info.collection !== "blog" && info.collection !== "pages") {
      if (!registry.folders[info.seriesPath]) {
        const oldSeries = record.seriesKey;
        const previous =
          oldSeries &&
          registry.folders[oldSeries] &&
          !fs.existsSync(contentFile(oldSeries, root))
            ? registry.folders[oldSeries]
            : null;
        registry.folders[info.seriesPath] = previous
          ? {
              ...previous,
              title: nameInfo(info.seriesPath.split("/").at(-1)).label,
            }
          : {
              title: nameInfo(info.seriesPath.split("/").at(-1)).label,
              url: `/${info.collection}/library/${shortId(info.seriesPath)}/`,
            };
      }
      const intro = contentFile(`${info.seriesPath}/index.md`, root);
      const hidden =
        fs.existsSync(intro) &&
        parse(fs.readFileSync(intro, "utf8")).data.published === false;
      if (hidden) registry.folders[info.seriesPath].hidden = true;
      else delete registry.folders[info.seriesPath].hidden;
    }
    if (isIntroduction(relative)) {
      const key = isBlogCategoryIntroduction(relative) ? `${info.seriesPath}/${info.category}` : info.seriesPath;
      const url = registry.folders[key].url;
      if (record.url !== url) registry.redirects[record.url] = url;
      record.url = url;
    }
    record.seriesKey = info.seriesPath;
    if (info.collection === "blog" && info.category) record.categoryKey = `${info.seriesPath}/${info.category}`;
    record.hash = digest;
    if (
      !record.date &&
      data.published !== false &&
      !registry.folders[info.seriesPath]?.hidden &&
      isPublicSource(relative, registry, root)
    )
      record.date = publicationDay();
  }
  // Empty public series/categories are authorable even before their first post.
  for (const series of blogFolders(root)) {
    for (const [key, kind] of [[series.key, "series"], ...series.categories.map(key => [key, "category"])]) {
      registry.folders[key] ??= { url: `/blog/${kind}/${shortId(key)}/` };
      const meta = folderMetadata(key, root);
      registry.folders[key].title = meta.title;
      if (!meta.published) registry.folders[key].hidden = true;
      else delete registry.folders[key].hidden;
    }
  }
  const serialized = JSON.stringify(registry, null, 2) + "\n",
    file = projectPaths(root).registry;
  if (!fs.existsSync(file) || fs.readFileSync(file, "utf8") !== serialized)
    fs.writeFileSync(file, serialized);
  return registry;
}
if (isMainModule(import.meta.url)) {
  const option = process.argv.indexOf("--root");
  const root = option >= 0 ? path.resolve(process.argv[option + 1]) : PROJECT_ROOT;
  if (process.argv.includes("--init")) {
    const file = projectPaths(root).registry;
    if (fs.existsSync(file)) throw new Error("Registry already exists; initialization never overwrites it.");
    fs.writeFileSync(file, JSON.stringify({version: 1, files: {}, folders: {}, redirects: {}, aliases: {}}, null, 2) + "\n", { flag: "wx" });
  }
  prepare(root);
}
