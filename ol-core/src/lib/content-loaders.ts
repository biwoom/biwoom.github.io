import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { glob, type Loader } from "astro/loaders";
import { projectPaths, normalizeContentPath, relativeContentPath } from "../../scripts/lib/paths.mjs";
import { normalize, mediaEntries, readRegistry } from "../../scripts/lib/content.mjs";
import { watchContent } from "../../scripts/lib/watch-content.mjs";
import { acceptsCollectionChange, isDocumentEdit, registryPolicy, refreshMode } from "../../scripts/lib/content-refresh.mjs";
import { prepare } from "../../scripts/prepare-content.mjs";

export function markdownLoader(name: string): Loader {
  return {
    name: "glob",
    async load(context) {
      let policy: string | undefined;
      type Change = { event: string; file: string; relative: string | null };
      const refresh = async (changes: Change[] = []) => {
        // Preparation writes hashes back to the registry. Do not let that echo
        // rescan the vault or trigger unrelated collections again.
        if (changes.length && changes.every(change => change.relative === null)
          && policy === registryPolicy(readRegistry())) return;
        // Source changes always prepare afresh; never cache privacy or paths.
        let registry = prepare();
        const nextPolicy = registryPolicy(registry);
        const mode = refreshMode(changes, policy, nextPolicy);
        if (mode === "skip") return;
        // Failed refreshes must retry conservatively rather than reuse partial data.
        policy = undefined;
        const loader = glob({
          base: pathToFileURL(path.join(projectPaths().content, name)),
          pattern: [
            "**/*.{md,mdx}",
            "!**/{assets,_assets,_drafts,_templates,.obsidian}/**",
            "!**/_*/**",
          ],
          generateId({ entry }) {
            const relative = normalizeContentPath(`${name}/${entry}`);
            // A file may arrive while the asynchronous glob is loading.
            if (!registry.files[relative]) registry = prepare();
            return registry.files[relative].id;
          },
        });
        // Folder names and registry policy can change while Markdown is unchanged.
        if (mode === "full") context.store.clear();
        await loader.load({
          ...context,
          watcher: undefined,
          parseData(options) {
            const relative = relativeContentPath(options.filePath!);
            return context.parseData({
              ...options,
              data: {
                ...options.data,
                ...normalize(relative, fs.readFileSync(options.filePath!, "utf8"), registry),
              },
            });
          },
        });
        policy = nextPolicy;
      };
      await refresh();
      watchContent(context.watcher, refresh, (error: Error) => context.logger.error(error.message), {
        accept: (change: Change) => acceptsCollectionChange(name, change),
      });
    },
  };
}

export const materialsLoader: Loader = {
  name: "ol-materials",
  async load(context) {
    const update = async () => {
      context.store.clear();
      for (const entry of mediaEntries()) {
        context.store.set({
          id: entry.id,
          data: await context.parseData({ id: entry.id, data: entry.data }),
        });
      }
    };
    let policy = registryPolicy(prepare());
    await update();
    watchContent(context.watcher, async (changes: { relative: string | null }[]) => {
      if (changes.every(change => change.relative === null) && policy === registryPolicy(readRegistry())) return;
      const nextPolicy = registryPolicy(prepare());
      await update();
      policy = nextPolicy;
    }, (error: Error) => context.logger.error(error.message), {
      accept: (change: { event: string; relative: string | null }) => !isDocumentEdit(change),
    });
  },
};
