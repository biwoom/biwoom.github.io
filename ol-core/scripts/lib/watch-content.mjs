import { projectPaths } from './paths.mjs';
import path from "node:path";
// Reload a collection as one snapshot: introductions and folder changes affect siblings too.
export function watchContent(watcher, refresh, onError = error => console.error(error), { delay = 250, includeRegistry = true } = {}) {
  if (!watcher) return () => {};
  let timer, pending = Promise.resolve(), disposed = false;
  const paths = projectPaths();
  const changed = (event, file) => {
    const relative = path.relative(paths.content, path.resolve(file));
    const registry = includeRegistry && path.resolve(file) === paths.registry;
    if (!registry && (relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative) || relative.split(path.sep).some(p => p.startsWith(".")))) return;
    if (!["add", "change", "unlink", "addDir", "unlinkDir"].includes(event)) return;
    clearTimeout(timer);
    // Serialize asynchronous asset work as well as collection reloads.
    timer = setTimeout(() => {
      pending = pending.then(() => { if (!disposed) return refresh(); }).catch(onError);
    }, delay);
  };
  const dispose = () => {
    disposed = true;
    clearTimeout(timer);
    watcher.off("all", changed);
    watcher.off("close", dispose);
  };
  watcher.add(includeRegistry ? [paths.content, paths.registry] : [paths.content]);
  watcher.on("all", changed);
  watcher.once("close", dispose);
  return dispose;
}
