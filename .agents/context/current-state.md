# Current State

Last updated: 2026-06-26

## Project

- Name: OL HOME
- Purpose: Public web home for the OL project.
- Production URL: `https://biwoom.github.io/`
- GitHub repository: `biwoom/biwoom.github.io`
- Main branch: `main`
- Framework: Astro 6 static site
- Search: Pagefind
- Deployment: GitHub Actions to GitHub Pages

## Current Architecture

- `src/content/` is the content source of truth.
- `src/content.config.ts` defines collection schemas.
- `src/content/pages/` holds public permanent project documents such as the brand definition.
- `src/content/text/` holds TEXT series and documents.
- `src/content/story/` holds STORY series and chapters.
- `blog`, `text`, and `story` now store all tags in `tags: string[]`; `prefixTags` is no longer part of the active schema.
- Slash-form `prefix/value` tags are now the repository-wide rule across active content collections.
- `src/content/design/` holds DESIGN metadata and source assets.
- DESIGN tag filtering now uses prefix-form strings in `tags` instead of a separate `prefixTags` field.
- DESIGN prefix labels now use Korean names in the sidebar and content tags.
- DESIGN index filtering now uses the shared client filter module instead of a page-local inline implementation.
- `src/content/blog/` holds dated work logs.
- Blog list thumbnails now prefer a `thumbnailAsset` frontmatter field and fall back to the first relative Markdown image in the body.
- `src/content/entities/` and `src/content/ontology/` hold knowledge graph material.
- `public/atlas/` holds static ATLAS HTML archives.
- `public/generated/` is generated from content assets and should not be committed.
- `scripts/check-content.mjs` validates content metadata, tag syntax, asset existence, and forbidden junk files.
- `src/lib/content-structure.ts` centralizes shared TEXT/STORY slug, grouping, and ordering helpers.
- `src/lib/assets.ts` centralizes asset URLs, including provider-aware DESIGN asset URLs, versioned download filenames, and blog thumbnail candidate discovery.
- `site-config.mjs` is the root source of truth for fixed site settings and env-backed DESIGN asset settings.
- `src/lib/site-config.ts` is the app-facing config entry point for Astro components and utility modules.
- `src/lib/client/content-filters.ts` centralizes shared prefix-filter, DESIGN library filter, and TEXT/STORY tag-index client behavior.
- `npm run check` runs the content validator and validator fixture tests.
- `npm run build` now requires the validator to pass before the Astro build starts.
- Phase 3 styling work is complete for active Astro pages and shared components; remaining inline style search results are isolated DESIGN HTML asset internals.
- `BaseLayout.astro` now loads only Pretendard externally; Google Fonts requests were removed and the existing fallback stacks carry `Inter`, `Noto Sans KR`, and `JetBrains Mono`.
- DESIGN HTML assets should not add Google Fonts requests. Current published DESIGN HTML assets use local/fallback font stacks.
- DESIGN asset URLs default to `/generated/design/{slug}/{asset}` locally and can switch to `PUBLIC_DESIGN_ASSET_BASE_URL` for external storage.
- `DESIGN_ASSET_PROVIDER=external` skips local DESIGN sync, and `DESIGN_ASSET_MANIFEST` lets the validator check external DESIGN asset keys.
- `.env.example` documents the supported DESIGN asset env vars without moving the fixed production site URL into per-environment config.
- Markdown links that still point at `/generated/design/{slug}/{asset}` are rewritten to the external DESIGN base URL when `PUBLIC_DESIGN_ASSET_BASE_URL` is set.
- New Markdown DESIGN images should use `design-asset:{slug}/{asset}` so content stays provider-neutral without hard-coded generated URLs.
- TEXT and STORY document-level Entity links use a shared `entities: string[]` frontmatter field.
- TEXT and STORY detail pages can render a right-side Entity name-card panel from the document `entities` list.
- `NET` is now a first-class public menu with:
  - `/net/` as the entry page
  - `/net/explore/` as the Entity name-card exploration view
- The main public header currently exposes `HOME`, `TEXT`, `STORY`, `DESIGN`, `NET`, plus a separate `BLOG` action.
- Typography now defaults site-wide to the sans body stack for general UI and content.
- Mono typography is reserved for code-like surfaces such as `code`, `pre`, `kbd`, `samp`, and explicit code-chip style elements.
- Shared semantic typography classes now use `ol-meta-label` and `ol-section-label` instead of the older mono-named labels.
- TEXT and STORY use the shared Entity side-panel component with explicit `variant` props so each menu can carry its own styling without a single universal panel skin.
- TEXT and STORY series pages now share one tag-index interaction layer instead of duplicating near-identical client scripts.
- TEXT and STORY document pages now use a shared right-side desktop utility stack for `On this page` TOC and Entity name cards instead of keeping the desktop TOC inside the top content toolbar.
- Desktop `On this page` TOC cards now default to collapsed state, show the heading count in the trigger, and use scroll-spy highlighting for the active `h2`/`h3` section.
- Mobile TOC behavior remains the existing dropdown/panel pattern; the desktop sticky TOC changes do not alter the mobile controls.
- STORY desktop sticky TOC and Entity stack now offset below the sticky part navigation so the right-side utility stack is not covered while scrolling.

## Deployment State

- GitHub Pages root deployment is the intended mode.
- `astro.config.mjs` should set `site: 'https://biwoom.github.io'`.
- Astro `base` should not be set.
- `public/robots.txt` and `src/pages/rss.xml.ts` should remain root-URL aware.
- `.github/workflows/deploy.yml` builds and deploys on pushes to `main`.
- The deploy workflow now runs `npm run check` before the site build step.
- GitHub upload workflow performs only the requested push. Work-log updates and deployment checks are separate actions that require an explicit request.
- `git push origin main` is allowed as the default OL HOME upload command; non-default push targets still require confirmation.

## Codex Setup

- `AGENTS.md` defines repository-wide Codex rules.
- `.agents/skills/ol-content-authoring/` supports content creation and revision.
- `.agents/skills/ol-doc-maintenance/` supports manuals and durable project docs.
- `.agents/skills/ol-deploy-check/` supports build and GitHub Pages verification.
- `.codex/config.toml` stores project-local Codex defaults.
- `.codex/rules/default.rules` stores local command execution policies.

## Recently Completed

- Migrated GitHub Pages configuration from project-page assumptions to root user-page deployment.
- Updated README for OL HOME.
- Kept the public permanent document surface focused on `/pages/brand/`.
- Added Codex project guidance, skills, config, and rules.
- Added continuity context documents under `.agents/context/`.
- Added the first shared TEXT/STORY Entity side-panel implementation.
- Split the shared TEXT/STORY Entity side-panel into explicit `text` and `story` variants.
- Added Concept Entity test cards for `five-aggregates` and `twelve-sense-bases`.
- Added the first public NET implementation slice:
  - `/net/`
  - `/net/explore/`
  - shared name-card behavior across NET, TEXT, STORY, and ENTITY
- Unified the default site typography so UI labels and metadata use the shared `--ol-font-ui` stack by default.
- Menu/main/detail pages now use `.ol-meta-badge` and inherited sans typography for badges, tags, and helper text.
- Completed Phase 1, Phase 2, and Phase 3 refactoring, then added external DESIGN asset readiness, validator fixtures, and broader active-page/component style cleanup.

## Open Follow-ups

- Keep context files updated after meaningful implementation, documentation, deployment, or repository-management work. Do not couple routine GitHub upload requests to automatic work-log commits.
- Consider adding examples to OL content skills if future content tasks reveal repeated patterns.
- Keep deployment docs aligned if GitHub Pages settings or repository naming changes again.
- If older planning docs mention STORY `primaryEntities` or `primaryPlaces`, treat them as historical notes; current TEXT/STORY document linking uses `entities`.
- Keep entity tags in slash-form when older flat tags are touched.

## Known Acceptable Warnings

- `npm run build` currently warns when `src/content/ai` has no md/mdx files. This is acceptable unless AI content is being added.
