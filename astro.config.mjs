// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import { markdownRemarkPlugins } from "./ol-core/scripts/lib/markdown.mjs";
import remarkContent from "./ol-core/scripts/remark-content.mjs";
import rehypeReaderFootnotes from "./ol-core/scripts/rehype-reader-footnotes.mjs";
import contentDevelopment from "./ol-core/scripts/dev-content.mjs";
import { readRegistry } from "./ol-core/scripts/lib/content.mjs";
import { projectPaths } from "./ol-core/scripts/lib/paths.mjs";
import { SITE_URL } from "./site-config.mjs";

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
const paths = projectPaths();

export default defineConfig({
  // GitHub Pages root URL
  site: SITE_URL,
  srcDir: paths.src,
  publicDir: paths.public,
  outDir: paths.dist,

  markdown: {
    remarkPlugins: [...markdownRemarkPlugins, remarkContent],
    rehypePlugins: [rehypeReaderFootnotes],
    remarkRehype: {
      footnoteLabel: "각주",
      footnoteBackLabel: "본문으로 돌아가기",
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    contentDevelopment(),
    mdx(),
    sitemap({
      filter: (page) =>
        !Object.keys(readRegistry().redirects).some(
          (route) => new URL(page).pathname === route,
        ),
    }),
  ],
});
