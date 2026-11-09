import { PROJECT_ROOT, projectPaths, isMainModule } from './lib/paths.mjs';
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
    files.map((p) => path.relative(base, p).split(path.sep).join("/")),
  );
  for (const p of files) {
    const relative = path.relative(base, p).split(path.sep).join("/");
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
        const name = path.relative(base, file).split(path.sep).join("/");
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
    if (info.collection !== "blog" && info.collection !== "pages") {
      if (!registry.folders[info.seriesPath]) {
        const oldSeries = record.seriesKey;
        const previous =
          oldSeries &&
          registry.folders[oldSeries] &&
          !fs.existsSync(path.join(base, oldSeries))
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
      const intro = path.join(base, info.seriesPath, "index.md");
      const hidden =
        fs.existsSync(intro) &&
        parse(fs.readFileSync(intro, "utf8")).data.published === false;
      if (hidden) registry.folders[info.seriesPath].hidden = true;
      else delete registry.folders[info.seriesPath].hidden;
    }
    if (isIntroduction(relative)) {
      const url = registry.folders[info.seriesPath].url;
      if (record.url !== url) registry.redirects[record.url] = url;
      record.url = url;
    }
    record.seriesKey = info.seriesPath;
    record.hash = digest;
    if (
      !record.date &&
      data.published !== false &&
      !registry.folders[info.seriesPath]?.hidden
    )
      record.date = publicationDay();
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
