# AGENTS.md

## Project

OL HOME is a static Astro site at `https://biwoom.github.io/`, deployed from `biwoom/biwoom.github.io` through GitHub Actions.

## Current Architecture

- `src/content/` is both the content source and the user's Obsidian vault.
- Public content menus are TEXT, STORY, BLOG. HOME is the entry page; `pages` holds visitor-facing permanent documents.
- Vault CMS, Front Matter, and Decap CMS are not used.
- TEXT uses category → work/series → material section/part → item. STORY uses series → part → chapter. Translation and research are independent.
- TEXT uses the current STORY series link/expand behavior. Material buttons navigate to the first item; do not add actual tab-panel switching.
- TEXT and STORY individual documents both use `StoryReader.astro` and STORY document styling. Pass the correct collection for breadcrumbs/search; do not restore the old TEXT-only document layout. BLOG retains its dedicated list/detail layout.
- DESIGN/NET and Entity/Ontology systems are retired. Their useful assets/prose have been migrated to ordinary TEXT material. Do not recreate their schemas or linking layers.

## Content Rules

- Authors may write Markdown without YAML. Title priority: optional `title` override → first H1 → descriptive filename.
- Derive hierarchy and order from folders/files. Parse numeric prefixes such as `001.Name`, hide the prefix in labels, and accept numeric-only filenames when an H1 supplies the title.
- Korean author-facing folder and document names are allowed. Keep code filenames and route implementation files ASCII.
- `index.md` is an optional work/series introduction. Do not require one to generate a library.
- `_drafts`, `_templates`, dotfolders, and `.obsidian` must not appear in public content or search. `assets`/`_assets` are auxiliary files, not item cards.
- Public menu documents are public by default; preserve explicit `published: false`. A nonpublic series intro hides its descendants.
- Tags are optional string arrays; slash prefixes are optional. Do not reintroduce `prefixTags`, `entities`, `relations`, or `tagAliases`.
- Keep provenance and notes in body text. Preserve document-specific rights exceptions.
- Source schema/normalized data: `src/content.config.ts`. Shared interpretation: `scripts/lib/content.mjs`. Share these rules with validation instead of maintaining divergent defaults.
- `content-registry.json` is durable source metadata, not disposable build output. Commit it with content changes. It preserves URLs, first-publication preparation dates, previous paths and hashes.
- Keep source attachments inside the vault. Use relative Markdown links; the shared remark plugin resolves them. Unsupported Obsidian wikilinks/blocks must not be described as working.
- Use `site-config.mjs` for shared fixed settings and `src/lib/site-config.ts` in app code. Do not restore retired DESIGN environment variables.
- Keep TEXT/STORY tag-result behavior in the common modal/client implementation.

## Preservation and Verification

- Preserve existing unpublished states, dates, rights, body text and assets when migrating content. Review `.agents/references/content-migration-inventory.json` for the original migration mapping.
- Keep GitHub Pages root deployment; never add Astro `base`.
- Run `npm run check`, `npm run typecheck`, and `npm run build` for content/route/layout/config changes.
- Verify actual `dist` pages and local targets, plus RSS/sitemap/robots when routing changes.
- Keep `dist/`, `.astro/`, `node_modules/`, and `public/generated/` out of commits. Do not edit generated assets as source.
- Do not alter the user's `.obsidian` state. Personal workspace and plugin files are ignored.
- Previous ATLAS HTML is preserved in `.agents/archive/atlas/`, outside public output.

## Continuity and Skills

- Before major work read `.agents/context/current-state.md`, `.agents/context/decisions.md`, and recent `.agents/context/work-log.md` entries.
- Authoring manual: `.agents/references/ol-home-content-management-manual.md`.
- Refactor guide: `.agents/references/obsidian-content-refactor-guide.md`.
- Update current state when architecture/status/risks change, decisions for durable choices, and work-log after meaningful implementation/documentation work. Keep records concise.
- Use `$ol-content-authoring` for content, `$ol-doc-maintenance` for guidance, `$ol-deploy-check` for deployment-related changes, and `$ol-github-upload-log` for requested GitHub uploads.
- Upload requests perform only the requested push. Do not automatically add work-log commits, wait for Pages, or inspect Actions unless explicitly requested.

## 수정 변경사항

### 2026-10-30

- Updated for Obsidian authoring, folder-derived TEXT hierarchy, minimal optional YAML, ordinary assets, stable registry and retired graph/menu systems.
