---
name: ol-content-authoring
description: Create or revise Biwoom (OL 코어) Markdown and content assets in the Obsidian vault under src/content.
---

# OL Content Authoring

Latest update: 2026-10-31.

1. Read `.agents/references/ol-home-content-management-manual.md` and `src/content.config.ts` before changing authoring rules.
2. Use `src/content/` as the existing Obsidian vault. Do not install a CMS or edit personal `.obsidian` state.
3. Place TEXT at `text/category/work/section/document.md`, STORY at `story/category/series/part/document.md`, BLOG under `blog/`, and public permanent pages under `pages/`.
4. Korean author-facing names are supported. Use optional numeric prefixes for order, such as `001.중관부`. Keep code and internal guide filenames ASCII.
5. Prefer title/H1 and body only. `index.md` introductions and YAML are optional. Number-only filenames require an H1 title.
6. Use the optional fields supported by the current schema/validator for exceptions only. Never add old hierarchy/order/entity/ontology fields or `prefixTags`. Tags are optional plain string arrays such as `tags: [수메다, 수밋따]`; classification prefixes and singular `tag` are not supported.
7. Use `_drafts/` for unpublished work. Public menu documents are public by default, with explicit `published: false` preserved. Nonpublic intros hide descendants.
8. Preserve dates, rights and provenance; put source notes in body prose. Defaults live in `site-config.mjs` and app config in `src/lib/site-config.ts`.
9. Keep shared images in `src/content/media/` with ordinary document-relative links. The first subfolder is the gallery category; root files are 미분류. Update references when moving files. The auxiliary /media/ gallery is linked from home statistics/footer only, without per-image content records or main-menu entries. Put listable PDFs/images/HTML directly in a material section. Put supporting files in `assets/` or `_assets/` and use relative Markdown links. Do not add DESIGN keys or generated URLs.
10. Preserve `content-registry.json`. Moves with unchanged content retain identity; moved-and-edited files may require `npm run content:move -- old new` before preparation. Do not silently assign a replacement URL to a known moved document.
11. Use shared DocumentTags for document-only optional tags below the title, without series inheritance. Series tag menus/modals are retired; BLOG tags filter alongside years/pagination. Do not create real tab switching; section buttons link to the first item, with expandable full lists.
12. Run `npm run check`, `npm run typecheck`, `npm run build`, and `npm run check:built`; inspect expected output and assets. Do not commit generated output or upload unless requested.

## 수정 변경사항

### 2026-11-09

- Current brand is Biwoom - 비움; production target is `https://biwoom.github.io/`.


### 2026-10-31

- Added the top-level STORY category folder; TEXT/STORY use category cards before series lists. Empty category folders may use `.gitkeep`.

### 2026-10-30

- Replaced legacy frontmatter/Entity/DESIGN authoring rules with the Obsidian folder-driven workflow.

## Move and publication checks

- Run explicit content:move before preparation for moved-and-edited documents; confirm the old file no longer exists and check older Markdown links after repeated moves. Cross-collection moves require deliberate canonical URL/redirect migration.
- Private per-document assets belong in a private index.md directory or _drafts; publicly shared attachments remain public.
- Commit the prepared content-registry.json with source changes; after committing, run npm run check:registry.
