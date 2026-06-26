# Decisions

This file records durable project decisions that future Codex sessions should preserve unless the user explicitly changes them.

## 2026-06-12

### GitHub Pages Repository And URL

- The GitHub Pages repository is `biwoom/biwoom.github.io`.
- The official production URL is `https://biwoom.github.io/`.
- OL HOME is a GitHub user page, not a project page.
- Astro `base` must not be set for this repository.

### Deployment

- GitHub Pages Source should be `GitHub Actions`.
- Deployment is handled by `.github/workflows/deploy.yml`.
- Pushing to `main` should trigger build and deploy.
- Deployment-related changes must verify:
  - `astro.config.mjs`
  - `public/robots.txt`
  - `src/pages/rss.xml.ts`
  - generated sitemap/RSS paths

### Content Source Of Truth

- Human-authored content belongs under `src/content/`.
- `src/content.config.ts` is the schema source of truth.
- `public/generated/` is derived output and should not be committed.
- Root-level temporary Korean source documents should be moved into the correct content collection and then removed from the root.

### Public Manuals

- Durable public project documents belong in `src/content/pages/`.
- Route-bearing filenames should be ASCII slugs.
- Korean document titles belong in frontmatter and body text.
- Public manuals should include:
  - document version
  - latest update date
  - target project
  - deployment URL when relevant
  - bottom `수정 변경사항` section

### Current Public Manual Routes

- Brand definition: `/pages/brand/`
- Internal content management manual is no longer a public route.

### Codex Project Memory

- `AGENTS.md` is the repository-wide durable instruction file.
- `.agents/skills/` contains repo-local reusable Codex workflows.
- `.agents/context/` contains continuity records for future sessions.
- `.codex/config.toml` and `.codex/rules/default.rules` provide project-local Codex settings and command policy.

### GitHub Upload Workflow

- When the user asks to upload, publish, push, or deploy to GitHub, perform only the requested upload.
- Do not update `.agents/context/work-log.md`, create a follow-up log commit, check GitHub Pages, or inspect GitHub Actions unless the user explicitly asks for those extra actions.
- Work-log maintenance remains useful after meaningful implementation, documentation, deployment, or repository-management work, but it is no longer part of the default GitHub upload workflow.
- This upload-only workflow is captured in `$ol-github-upload-log`.

### GitHub Push Command Policy

- `git push origin main` is the default OL HOME upload target and may run directly when the user explicitly asks to upload, publish, push, or deploy current changes.
- Other `git push` targets should still require confirmation.

### Internal Content Management Manual

- `src/content/pages/content-management-manual.md` should not be maintained as a public homepage page.
- The OL HOME content management manual belongs at `.agents/references/ol-home-content-management-manual.md`.
- Public `pages` content should be limited to visitor-facing permanent documents such as the brand definition.

## Historical Notes

- The project previously used or referenced `ol-home` and project-page style URLs.
- Those references may remain in historical blog content but should not drive current deployment configuration.

## 2026-06-20

### TEXT/STORY Entity Links

- TEXT and STORY document frontmatter should use `entities: string[]` for document-level Entity links.
- The `entities` array may contain person, place, concept, or other Entity ids together; type is resolved from the Entity document.
- STORY document fields `primaryEntities` and `primaryPlaces` are no longer used.
- TEXT document field `primary_entity` is no longer used.
- The order of ids in `entities` is the display order for document-side name-card panels.

### Typography Scope

- The site-wide default typography should use the sans body stack for general content and UI.
- The preferred body stack order is `Pretendard` → `Noto Sans KR` → `Inter` for non-mono surfaces.
- Shared typography should stay on the sans stack by default, including badge-like metadata surfaces that previously used mono styling.
- Labels, section kickers, filter controls, navigation metadata, and ordinary descriptive text should not depend on a separate code or mono stack.
- Shared semantic label classes should prefer names that describe role rather than rendering, such as `ol-meta-label` and `ol-section-label`.

### TEXT/STORY Entity Side Panel Variants

- The shared Entity side-panel component should remain a single implementation, but TEXT and STORY must render with explicit variants.
- `TEXT` and `STORY` pages should pass `variant="text"` and `variant="story"` respectively instead of relying on a single shared visual treatment.
- Page-specific differences should be expressed through modifier classes or CSS variables, not by reintroducing mono-centered shared styling.

### DESIGN Download Filenames

- DESIGN detail-page download links for PDF and image assets should use the content title and version as the browser download filename.
- The filename format is `{title}-v{version}{original_extension}`.
- The HTML asset action remains a view/open link, not a forced download.

## 2026-06-21

### DESIGN Tag Storage

- DESIGN content should use the existing `tags` field for prefix-form tags such as `topic/정화` or `entity/수밋타`.
- The DESIGN collection no longer uses a separate `prefixTags` field.
- DESIGN sidebar filtering should group `tags` by prefix when presenting the left-hand panel.
- DESIGN prefix labels should use Korean field names such as `종류`, `주제`, `형식`, `수준`, `용도`, `프로젝트`, `인물`, and `전통`.

### Blog Thumbnail Metadata

- BLOG entries may define an optional `thumbnailAsset` frontmatter field for list-card thumbnails.
- The blog list should prefer `thumbnailAsset` and continue to fall back to the first relative Markdown image for older entries.

## 2026-06-25

### Unified Tag Storage

- Active content collections should store all tags in `tags: string[]`.
- `blog`, `text`, and `story` no longer use a separate `prefixTags` field.
- Slash-form `prefix/value` strings are the repository-wide tag syntax.
- Internal management tags such as `kind/...`, `project/...`, `feature/...`, `tool/...`, and `framework/...` may live in `tags`, but TEXT/STORY user filter UIs should not expose those prefixes.

### Content Validation Gate

- `scripts/check-content.mjs` is the required pre-build validator.
- The validator must fail on deprecated frontmatter fields, non-slash tags, missing referenced assets, missing minimum published metadata, and forbidden junk files such as `.DS_Store`.
- `npm run build` must run the validator before the Astro build.
- GitHub Actions deployment must run the same validator before site build output is produced.

### Shared Content Helper Layers

- Shared TEXT/STORY slug, grouping, and ordering helpers should live in `src/lib/content-structure.ts`.
- Shared generated-asset URL and download-filename helpers should live in `src/lib/assets.ts`.
- Shared client filtering behavior should live in `src/lib/client/content-filters.ts`.
- New TEXT/STORY/DESIGN filtering work should extend these shared modules before adding new page-local inline scripts.

### Font Loading Policy

- The default external font load should be limited to Pretendard in `BaseLayout.astro`.
- `Noto Sans KR`, `Inter`, and `JetBrains Mono` may remain in CSS fallback stacks, but the site should not depend on separate Google Fonts requests unless a later change proves they are necessary.
- Code-like surfaces should use the mono font stack token `--ol-font-mono`; general UI and content should stay on `--ol-font-ui`.

## 2026-06-26

### DESIGN Asset Provider Policy

- DESIGN frontmatter should keep provider-neutral asset values instead of storing absolute generated URLs.
- Fixed site settings and env-backed asset settings should be centralized in `site-config.mjs`, with `src/lib/site-config.ts` as the app-side adapter.
- DESIGN page assets should resolve through `getDesignAssetUrl(entryId, asset)`.
- Cross-collection references to DESIGN assets should use `design.imageAsset` keys in the form `{designEntryId}/{assetPath}` and resolve through `getDesignAssetKeyUrl()`.
- Local builds default to `/generated/design/{entryId}/{assetPath}`.
- External DESIGN storage should be enabled by setting `PUBLIC_DESIGN_ASSET_BASE_URL`; the same content metadata should work without rewriting frontmatter.
- `DESIGN_ASSET_PROVIDER=external` may skip local DESIGN asset copying during `sync:assets`.
- `DESIGN_ASSET_MANIFEST` may point to a JSON manifest of `{entryId}/{assetPath}` keys so the content validator can check external asset references without issuing network requests.
- `.env` should be reserved for environment-dependent values; the fixed production site URL remains code-managed rather than env-managed.

### Markdown DESIGN Asset Links

- Existing Markdown links that start with `/generated/design/` are tolerated as legacy content links.
- New Markdown DESIGN image and link references should use the `design-asset:{entryId}/{assetPath}` form.
- When `PUBLIC_DESIGN_ASSET_BASE_URL` is set, the Astro Markdown pipeline rewrites those links to the external DESIGN asset base URL.
- New durable content should prefer DESIGN entries, structured references, or provider-neutral asset keys over hand-written `/generated/design/...` URLs.

### Style Cleanup Scope

- Active Astro pages and shared site components should avoid inline `style` attributes.
- Standalone DESIGN HTML assets may retain internal inline styles when those styles are part of the authored visual artifact.
- DESIGN HTML assets should not load Google Fonts directly; use local/fallback font stacks unless a future asset has an explicit exception.

### TEXT And STORY Desktop TOC Pattern

- TEXT and STORY document pages should use the same desktop information architecture for document TOC behavior.
- The desktop `On this page` TOC belongs in the right-side sticky utility stack above the Entity side-panel, not in the top content toolbar.
- The desktop TOC should default to collapsed state and expand from a visible trigger that shows the heading count.
- Mobile TOC interactions should remain separate from the desktop sticky TOC pattern unless a later redesign intentionally unifies them.
- Desktop TOC links should use scroll-spy highlighting so the active `h2` or `h3` section stays visible during reading.
- On STORY document pages, the right-side sticky utility stack should offset below the sticky part navigation so it is not visually covered while scrolling.

### Shared Menu Pagination Pattern

- Menu and library list surfaces should use one shared client-side paginator instead of page-local visible-count scripts.
- The shared paginator belongs in `src/lib/client/paginated-list.ts`.
- Filtered card lists should reset to page 1 when filter state changes, then reuse the same load-more control pattern.
- Deep-link or focused-card flows such as `NET` explore should be able to reveal the page that contains the focused result without forking the pagination model.
