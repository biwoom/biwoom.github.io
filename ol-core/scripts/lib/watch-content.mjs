import { projectPaths } from './paths.mjs';
import path from "node:path";
/** @typedef {{event: string, file: string, relative: string | null}} ContentChange */
/** @type {(change: ContentChange) => boolean} */
const acceptAll = () => true;
// Batch accepted events without losing structure changes; serialize refreshes.
export function watchContent(watcher, refresh, onError = error => console.error(error), { delay = 250, includeRegistry = true, accept = acceptAll } = {}) {
  if (!watcher) return () => {};
  let timer, pending = Promise.resolve(), disposed = false;
  const paths = projectPaths();
  const changes = new Map();
  const changed = (event, file) => {
    const relative = path.relative(paths.content, path.resolve(file));
    const registry = includeRegistry && path.resolve(file) === paths.registry;
    if (!registry && (relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative) || relative.split(path.sep).some(p => p.startsWith(".")))) return;
    if (!["add", "change", "unlink", "addDir", "unlinkDir"].includes(event)) return;
    const change = { event, file: path.resolve(file), relative: registry ? null : relative.normalize("NFC").split(path.sep).join("/") };
    if (!accept(change)) return;
    changes.set(`${event}:${change.file}`, change);
    clearTimeout(timer);
    // Serialize asynchronous asset work as well as collection reloads.
    timer = setTimeout(() => {
      const batch = [...changes.values()];
      changes.clear();
      pending = pending.then(() => { if (!disposed) return refresh(batch); }).catch(onError);
    }, delay);
  };
  const dispose = () => {
    disposed = true;
    changes.clear();
    clearTimeout(timer);
    watcher.off("all", changed);
    watcher.off("close", dispose);
  };
  watcher.add(includeRegistry ? [paths.content, paths.registry] : [paths.content]);
  watcher.on("all", changed);
  watcher.once("close", dispose);
  return dispose;
}
