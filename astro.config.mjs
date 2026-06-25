// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import remarkGfm from 'remark-gfm';
import remarkDesignAssetUrls from './scripts/remark-design-asset-urls.mjs';
import { SITE_URL } from './site-config.mjs';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // GitHub Pages root URL
  site: SITE_URL,

  markdown: {
    remarkPlugins: [remarkGfm, remarkDesignAssetUrls],
    remarkRehype: {
      footnoteLabel: '각주',
      footnoteBackLabel: '본문으로 돌아가기',
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [mdx(), sitemap()],
});
