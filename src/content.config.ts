import fs from "node:fs";
import path from "node:path";
import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import {
  normalize,
  mediaEntries,
  readRegistry,
} from "../scripts/lib/content.mjs";
import { prepare } from "../scripts/prepare-content.mjs";

// This schema describes normalized data. Author-written frontmatter is optional.
const schema = z.object({
  title: z.string().min(1),
  description: z.string(),
  tags: z.array(z.string()),
  published: z.boolean(),
  date: z.coerce.date(),
  readingTime: z.number(),
  url: z.string(),
  source: z.string(),
  kind: z.enum(["series", "document"]),
  category: z.string(),
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
    base: `./src/content/${name}`,
    pattern: [
      "**/*.{md,mdx}",
      "!**/{assets,_assets,_drafts,_templates,.obsidian}/**",
      "!**/_*/**",
    ],
    generateId({ entry }) {
      const relative = `${name}/${entry}`;
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
        prepare();
        // Folder names and registry policy can change even when Markdown is unchanged.
        context.store.clear();
        await loader.load({
          ...context,
          parseData(options) {
            const relative = path
              .relative(path.resolve("src/content"), options.filePath!)
              .split(path.sep)
              .join("/");
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
        if (context.watcher) {
          let timer: ReturnType<typeof setTimeout>;
          const refresh = (file: string) => {
            if (/\.(pdf|png|jpe?g|webp|gif|svg|html)$/i.test(file)) {
              clearTimeout(timer);
              timer = setTimeout(async () => {
                prepare();
                await update();
              }, 250);
            }
          };
          for (const event of ["add", "change", "unlink"])
            context.watcher.on(event, refresh);
        }
      },
    },
  }),
};
