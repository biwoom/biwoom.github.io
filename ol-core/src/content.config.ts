import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { projectPaths, normalizeContentPath, relativeContentPath } from "../scripts/lib/paths.mjs";
import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import {
  normalize,
  mediaEntries,
  readRegistry,
} from "../scripts/lib/content.mjs";
import { watchContent } from "../scripts/lib/watch-content.mjs";
import { prepare } from "../scripts/prepare-content.mjs";

// This schema describes normalized data. Author-written frontmatter is optional.
const schema = z.object({
  title: z.string().min(1),
  description: z.string(),
  tags: z.array(z.string().trim().min(1).refine((tag) => !tag.includes("/"), "Use plain tag names without prefixes"))
    .transform((tags) => [...new Set(tags)]),
  published: z.boolean(),
  date: z.coerce.date(),
  readingTime: z.number(),
  url: z.string(),
  source: z.string(),
  kind: z.enum(["series", "category", "document"]),
  category: z.string(),
  categoryKey: z.string(),
  categoryOrder: z.number(),
  series: z.string(),
  seriesKey: z.string(),
  seriesUrl: z.string(),
  part: z.string(),
  partKey: z.string(),
  order: z.number(),
  license: z.string(),
  rightsHolder: z.string(),
  lang: z.string(),
  licenseUrl: z.string().optional(),
  copyrightNotice: z.string().optional(),
  thumbnailAsset: z.string().optional(),
  format: z.string().optional(),
});
function collection(name: string) {
  const loader = glob({
    base: pathToFileURL(path.join(projectPaths().content, name)),
    pattern: [
      "**/*.{md,mdx}",
      "!**/{assets,_assets,_drafts,_templates,.obsidian}/**",
      "!**/_*/**",
    ],
    generateId({ entry }) {
      const relative = normalizeContentPath(`${name}/${entry}`);
      let registry = readRegistry();
      if (!registry.files[relative]) registry = prepare();
      return registry.files[relative].id;
    },
  });
  return defineCollection({
    schema,
    loader: {
      ...loader,
      async load(context) {
        const refresh = async () => {
          prepare();
          // Folder names and registry policy can change even when Markdown is unchanged.
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
                  ...normalize(
                    relative,
                    fs.readFileSync(options.filePath!, "utf8"),
                  ),
                },
              });
            },
          });
          };
        await refresh();
        watchContent(context.watcher, refresh, (error: Error) => context.logger.error(error.message));
      },
    },
  });
}
export const collections = {
  text: collection("text"),
  story: collection("story"),
  blog: collection("blog"),
  pages: collection("pages"),
  materials: defineCollection({
    schema,
    loader: {
      name: "ol-materials",
      async load(context) {
        const update = async () => {
          context.store.clear();
          for (const entry of mediaEntries())
            context.store.set({
              id: entry.id,
              data: await context.parseData({ id: entry.id, data: entry.data }),
            });
        };
        await update();
        watchContent(context.watcher, async () => {
          prepare();
          await update();
        }, (error: Error) => context.logger.error(error.message));
      },
    },
  }),
};
