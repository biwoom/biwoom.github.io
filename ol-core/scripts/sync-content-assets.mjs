import { PROJECT_ROOT, projectPaths, isMainModule } from './lib/paths.mjs';
import fs from "node:fs";
import path from "node:path";
import { walk, markdownPattern, readRegistry, isPublicSource } from "./lib/content.mjs";
import { getEbooks } from "./lib/ebooks.mjs";
function allFiles(dir) {
  return fs.readdirSync(dir, {withFileTypes:true}).flatMap(e => e.isDirectory() ? allFiles(path.join(dir,e.name)) : [path.join(dir,e.name)]);
}
export function syncAssets(root = PROJECT_ROOT) {
  const base = projectPaths(root).content,
    target = path.join(projectPaths(root).generated, "content");
  const registry = readRegistry(root);
  fs.mkdirSync(target, { recursive: true });
  const expected = new Set();
  for (const collection of ["text", "story", "blog", "pages", "media"]) {
    for (const file of walk(`${base}/${collection}`, { assets: true })) {
      if (markdownPattern.test(file)) continue;
      const source = path.relative(base, file).split(path.sep).join("/");
      if (!isPublicSource(source, registry, root, { asset: true })) continue;
      const relative = path.relative(base, file),
        output = path.join(target, relative);
      expected.add(path.resolve(output));
      fs.mkdirSync(path.dirname(output), { recursive: true });
      if (
        !fs.existsSync(output) ||
        !fs.readFileSync(file).equals(fs.readFileSync(output))
      )
        fs.copyFileSync(file, output);
    }
  }
  // Publish only selected covers and complete public ebook downloads; never copy metadata/drafts.
  for (const book of getEbooks(root)) {
    for (const source of [book.coverSource, ...book.downloads.map(file => file.source)].filter(Boolean)) {
      const file = path.join(base, source), output = path.join(target, source);
      expected.add(path.resolve(output));
      fs.mkdirSync(path.dirname(output), { recursive: true });
      if (!fs.existsSync(output) || !fs.readFileSync(file).equals(fs.readFileSync(output))) fs.copyFileSync(file, output);
    }
  }
  for (const file of allFiles(target))
    if (!expected.has(path.resolve(file))) fs.unlinkSync(file);
  function pruneEmpty(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const child = path.join(dir, entry.name);
      pruneEmpty(child);
      if (fs.readdirSync(child).length === 0) fs.rmdirSync(child);
    }
  }
  pruneEmpty(target);
  // Remove derived legacy namespaces only after source migration.
  for (const name of ["design", "story"])
    fs.rmSync(path.join(projectPaths(root).generated, name), { recursive: true, force: true });
  console.log(`Synced ${expected.size} content assets.`);
}
if (isMainModule(import.meta.url)) syncAssets();
