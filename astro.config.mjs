// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import remarkGfm from "remark-gfm";
import remarkContent from "./scripts/remark-content.mjs";
import contentDevelopment from "./scripts/dev-content.mjs";
import { readRegistry } from "./scripts/lib/content.mjs";
import { SITE_URL } from "./site-config.mjs";

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  // GitHub Pages root URL
  site: SITE_URL,

  markdown: {
    remarkPlugins: [remarkGfm, remarkContent],
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
