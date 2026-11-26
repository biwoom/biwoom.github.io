import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { markdownLoader, materialsLoader } from "./lib/content-loaders";
import { articlePattern, homeArticleSchema } from "../scripts/lib/home-articles.mjs";
import { normalizeContentPath, projectPaths } from "../scripts/lib/paths.mjs";

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
  return defineCollection({ schema, loader: markdownLoader(name) });
}
export const collections = {
  article: defineCollection({
    schema: homeArticleSchema,
    loader: glob({
      base: pathToFileURL(path.join(projectPaths().content, "article")),
      pattern: articlePattern,
      generateId: ({ entry }) => normalizeContentPath(entry),
    }),
  }),
  text: collection("text"),
  story: collection("story"),
  blog: collection("blog"),
  pages: collection("pages"),
  materials: defineCollection({ schema, loader: materialsLoader }),
};
