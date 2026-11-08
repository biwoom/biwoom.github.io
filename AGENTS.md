# AGENTS.md

## Project

BORIDO (보리도) is a static Astro site built on the OL core at `https://borido.org/`, deployed from `biwoom/biwoom.github.io` through GitHub Actions.

## Current Architecture

- `src/content/` is both the content source and the user's Obsidian vault.
- Public content menus are TEXT, STORY, BLOG. HOME is the entry page; `pages` holds visitor-facing permanent documents.
- Vault CMS, Front Matter, and Decap CMS are not used.
- TEXT uses category → work/series → material section/part → item. STORY uses category → series → part → chapter. Translation and research are independent.
- TEXT/STORY menu roots show top-level categories as `ol-grid-3` cards; category pages list their series. Empty category folders remain visible (track `.gitkeep` when needed).
- TEXT uses academic work/reader templates with ordinary section links and expandable material lists. Material buttons navigate to the first item; do not add actual tab-panel switching.
- TEXT uses `TextLibrary.astro` / `TextReader.astro` for its academic work/document views; STORY retains `LibrarySeries.astro` / `StoryReader.astro`. Share `ReaderToolbar`, `ReaderBody`, document-reader, reader-tools and reader-drawer behavior; do not duplicate Markdown/footnote interpretation or restore retired graph/Entity layouts. TEXT work/document accents are slate blue; gold stays on TEXT menu/category pages and document footnote emphasis. TEXT document list and document TOC default open at >=1360px and closed below that width; opening both gives desktop list/body/aid columns; one set of aid nodes becomes modal below 1360px. On TEXT document scroll, site header/work/part navigation scroll away; the reader toolbar and opened side panels stick at viewport top. Preserve focus-mode restoration and the single font slider. BLOG retains its dedicated list/detail layout.
- STORY document aids use the shared TEXT-style dock at >=1360px: one persistent right panel with 본문 목차/각주 switching and the same background as the article. Below that width, move the original nodes back to native modals; do not duplicate IDs or auto-open a modal on resize. STORY focus hides both the left chapter list and right aid rail, then restores the selected aid.
- BLOG posts are organized under `001.교학`, `002.수행`, `003.인포그래픽`, `004.디자인`, `005.보리도`, and `006.일지` within `src/content/blog/`. Keep per-post folders/attachments together; preserve registry identity and rebase relative links when moving.
- DESIGN/NET and Entity/Ontology systems are retired. Their useful assets/prose have been migrated to ordinary TEXT material. Do not recreate their schemas or linking layers.

## Content Rules

- Authors may write Markdown without YAML. Title priority: optional `title` override → first H1 → descriptive filename.
- Derive hierarchy and order from folders/files. Parse numeric prefixes such as `001.Name`, hide the prefix in labels, and accept numeric-only filenames when an H1 supplies the title.
- Korean author-facing folder and document names are allowed. Keep code filenames and route implementation files ASCII.
- `index.md` is an optional work/series introduction. Do not require one to generate a library.
- `_drafts`, `_templates`, dotfolders, and `.obsidian` must not appear in public content or search. `assets`/`_assets` are auxiliary files, not item cards.
- Public menu documents are public by default; preserve explicit `published: false`. A nonpublic series intro hides its descendants.
- Tags are optional plain string arrays, e.g. `tags: [수메다, 수밋따]`; do not use classification prefixes or singular `tag`. Do not reintroduce `prefixTags`, `entities`, `relations`, or `tagAliases`.
- Keep provenance and notes in body text. Preserve document-specific rights exceptions.
- Private index.md directories exclude their attachments from deployment. `_assets` is the only underscore-prefixed attachment exception. Publicly shared attachments remain public; keep private per-document attachments in private index folders or `_drafts`.
- Introduction canonical URLs equal library URLs. Deleted sources must not be restored or redirected to unrelated material; retain registry history and render redirects only to current public targets.
- Source schema/normalized data: `src/content.config.ts`. Shared interpretation: `scripts/lib/content.mjs`. Share these rules with validation instead of maintaining divergent defaults.
- Restore a missing registry from Git; `prepare:content -- --init` is only for new vaults. Commit prepared registry changes with content; CI runs `check:registry`. First-publication preparation dates use Asia/Seoul.
- `content-registry.json` is durable source metadata, not disposable build output. Commit it with content changes. It preserves URLs, first-publication preparation dates, previous paths and hashes.
- EBOOK is an auxiliary `/ebook/` download library linked only below MEDIA in the footer, never the primary/mobile menu. Read one direct `src/content/ebook/` folder per book, optional index.md bibliography, cover and EPUB/PDF files. Use CC0 for every ebook, no individual routes/registry records; exclude private/draft packages and publish only selected cover/download assets.
- `src/content/media/` is the shared public asset namespace. The auxiliary `/media/` gallery is linked from home statistics and the footer, never the primary/mobile menu. Derive image categories from the first subfolder (numeric prefixes only order); root images are 미분류. Keep original assets under `/generated/content/media/`, generated previews under `/generated/media-gallery/`, and no per-image documents/frontmatter/registry records.
- Keep source attachments inside the vault. Use relative Markdown links; the shared remark plugin resolves them. Unsupported Obsidian wikilinks/blocks must not be described as working.
- Use `site-config.mjs` for shared fixed settings and `src/lib/site-config.ts` in app code. Do not restore retired DESIGN environment variables.
- Use shared `DocumentTags.astro` to display only the current document’s optional tags below its title. Series tag controls/modals are retired. BLOG tag buttons filter exact tags together with year archives and shared pagination.

## Preservation and Verification

- Preserve existing unpublished states, dates, rights, body text and assets when migrating content. Review `.agents/references/content-migration-inventory.json` for the original migration mapping.
- Keep GitHub Pages root deployment; never add Astro `base`.
- Run `npm run check`, `npm run typecheck`, and `npm run build` for content/route/layout/config changes.
- Verify actual `dist` pages and local targets, plus RSS/sitemap/robots when routing changes.
- Keep `dist/`, `.astro/`, `node_modules/`, and `public/generated/` out of commits. Do not edit generated assets as source.
- Do not alter the user's `.obsidian` state. Personal workspace and plugin files are ignored.
- Historical ATLAS/media archives may have been deleted by the user. Preserve those deletions; do not restore them.

## Continuity and Skills

- Before major work read `.agents/context/current-state.md`, `.agents/context/decisions.md`, and recent `.agents/context/work-log.md` entries.
- Authoring manual: `.agents/references/ol-home-content-management-manual.md`.
- Refactor guide: `.agents/references/obsidian-content-refactor-guide.md`.
- Update current state when architecture/status/risks change, decisions for durable choices, and work-log after meaningful implementation/documentation work. Keep records concise.
- Use `$ol-content-authoring` for content, `$ol-doc-maintenance` for guidance, `$ol-deploy-check` for deployment-related changes, and `$ol-github-upload-log` for requested GitHub uploads.
- Upload requests perform only the requested push. Do not automatically add work-log commits, wait for Pages, or inspect Actions unless explicitly requested.

## 수정 변경사항

### 2026-11-08 — EBOOK

- Added the auxiliary ebook library, folder-based package authoring, CC0 policy and footer-only navigation.

### 2026-11-08

- Production is `https://borido.org/`; retain the existing repository, root routes and Actions deployment. DNS/HTTPS remain external configuration.

### 2026-11-07

- Added academic TEXT work/document layouts and shared reader behavior, slate-blue accents, desktop docking/mobile modals and focus mode.

### 2026-11-06

- Added the six BLOG source category folders and URL-preserving move guidance.

### 2026-10-31

- Added top-level STORY categories and shared TEXT/STORY category-card navigation.

### 2026-10-30

- Updated for Obsidian authoring, folder-derived TEXT hierarchy, minimal optional YAML, ordinary assets, stable registry and retired graph/menu systems.
