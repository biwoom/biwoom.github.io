import { projectPaths } from './paths.mjs';
import path from "node:path";
// Reload a collection as one snapshot: introductions and folder changes affect siblings too.
export function watchContent(watcher, refresh, onError = error => console.error(error)) {
  if (!watcher) return;
  let timer, pending = Promise.resolve();
  const changed = (event, file) => {
    const relative = path.relative(projectPaths().content, path.resolve(file));
    const registry = path.resolve(file) === projectPaths().registry;
    if (!registry && (relative.startsWith("..") || path.isAbsolute(relative) || relative.split(path.sep).some(p => p.startsWith(".")))) return;
    if (!["add", "change", "unlink", "addDir", "unlinkDir"].includes(event)) return;
    clearTimeout(timer);
    timer = setTimeout(() => { pending = pending.then(refresh).catch(onError); }, 250);
  };
  watcher.add([projectPaths().content, projectPaths().registry]);
  watcher.on("all", changed);
  watcher.once("close", () => { clearTimeout(timer); watcher.off("all", changed); });
}
