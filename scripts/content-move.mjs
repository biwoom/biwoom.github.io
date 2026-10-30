import fs from "node:fs";
import path from "node:path";
import { readRegistry, linkMove } from "./lib/content.mjs";
import { prepare } from "./prepare-content.mjs";
const [oldPath, newPath] = process.argv.slice(2),
  root = path.resolve("src/content");
if (!oldPath || !newPath)
  throw new Error(
    'Usage: npm run content:move -- "text/old.md" "text/new.md" (paths inside src/content)',
  );
for (const p of [oldPath, newPath])
  if (
    path.resolve(root, p) === root ||
    !path.resolve(root, p).startsWith(root + path.sep)
  )
    throw new Error("Paths must stay inside the vault");
const registry = readRegistry();
if (!registry.files[oldPath])
  throw new Error("Old path is not in content-registry.json");
if (registry.files[newPath])
  throw new Error("Destination already has a registry entry");
if (!fs.existsSync(path.join(root, newPath)))
  throw new Error(
    "Move the document in Obsidian first, then run this command before preparing content.",
  );
if (fs.existsSync(path.join(root, oldPath))) throw new Error("Old file still exists: this is a copy, not a move.");
if (oldPath.split("/")[0] !== newPath.split("/")[0]) throw new Error("Cross-collection moves require explicit URL migration; use the migration procedure.");
registry.files[newPath] = registry.files[oldPath];
delete registry.files[oldPath];
linkMove(registry, oldPath, newPath);
fs.writeFileSync(
  "content-registry.json",
  JSON.stringify(registry, null, 2) + "\n",
);
prepare();
