import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { glob, type Loader } from "astro/loaders";
import { projectPaths, normalizeContentPath, relativeContentPath } from "../../scripts/lib/paths.mjs";
import { normalize, mediaEntries } from "../../scripts/lib/content.mjs";
import { watchContent } from "../../scripts/lib/watch-content.mjs";
import { prepare } from "../../scripts/prepare-content.mjs";

export function markdownLoader(name: string): Loader {
  return {
    name: "glob",
    async load(context) {
      const refresh = async () => {
        // One registry snapshot per refresh, shared by IDs and normalized data.
        // A new refresh always prepares again, including parent/folder changes.
        let registry = prepare();
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
        context.store.clear();
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
      };
      await refresh();
      watchContent(context.watcher, refresh, (error: Error) => context.logger.error(error.message));
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
    await update();
    watchContent(context.watcher, async () => {
      prepare();
      await update();
    }, (error: Error) => context.logger.error(error.message));
  },
};
