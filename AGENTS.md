# AGENTS.md

## Project

Biwoom - 비움 is a static Astro site built on the OL core at `https://biwoom.github.io/`, deployed from `biwoom/biwoom.github.io` through GitHub Actions.

## Browser Testing

- 사용자가 별도로 명시적으로 요청하기 전에는 로컬 웹브라우저를 열거나, 이미 열린 브라우저·탭을 조작하여 사이트 열람·스크린샷·UI/시각 테스트를 수행하지 않는다. 인앱 브라우저, 컴퓨터 사용 도구와 헤드리스 브라우저 자동화를 이용한 로컬 사이트 테스트도 같은 제한을 적용한다.
- 일반적인 구현·수정·검증·빌드·커밋 요청은 브라우저 테스트를 허용한 것으로 해석하지 않는다. 기본 검증은 필요한 CLI 검사·타입 검사·빌드·생성 파일 및 링크 확인으로 수행하며, 브라우저 화면 점검은 사용자가 담당한다.

## Current Architecture

- Repository root remains the Astro/npm execution root. Authoring lives in `content/`; implementation lives in `ol-core/src/`, `ol-core/scripts/`, and `ol-core/public/`. Root `astro.config.mjs`, package files, `site-config.mjs`, and `content-registry.json` remain in place; output stays `dist/`.
- Define filesystem paths in `ol-core/scripts/lib/paths.mjs`, anchored to the module location rather than process.cwd(). Vault-relative keys use NFC Unicode and POSIX separators: use normalizeContentPath/relativeContentPath for keys and contentFile for physical source lookup. Normalize legacy registry keys/series/category paths and aliases without changing IDs, URLs, dates, hashes or redirects; reject conflicting normalized paths. Do not rename vault files or rewrite prose to fix normalization. Load Markdown using glob() with an absolute content base. Keep registry keys relative to the vault (text/..., story/..., blog/...); a physical vault move must not change IDs, URLs, dates or hashes.

- `content/` is both the content source and the user's Obsidian vault.
- Public content menus are TEXT, STORY, BLOG. HOME is the entry page; `pages` holds visitor-facing permanent documents.
- Vault CMS, Front Matter, and Decap CMS are not used.
- TEXT uses category → work/series → material section/part → item. STORY uses category → series → part → chapter. Translation and research are independent.
- TEXT categories are 중관부, 반야부, 정토부, 선어록, 아비달마부, 유가부, 화엄부, 인명부, 대승부, 니까야, ordered 001–010. Each has a lowercase index.md introduction; preserve the existing 중관부/대승현론 content and identities. The other nine categories currently have introductions only, with future works added by the user.
- TEXT/STORY menu roots show top-level categories as `ol-grid-3` cards; category pages list their series. Empty category folders remain visible (track `.gitkeep` when needed).
- TEXT/STORY category `index.md` files are category metadata, with authored title/description and canonical category URLs; exclude them from readers, series lists and document counts. Private category intros hide descendants/assets. STORY's 이야기불교 categories are 붓다전기, 전생이야기, 고승전기, 가르침과 일화, 설화와 전승, 구법과 순례, 시와 게송. Keep the two existing Maha Buddhavamsa editions under 붓다전기; other categories currently have introductions only. Future works are added by the user.
- TEXT uses academic work/reader templates with ordinary section links and expandable material lists. Material buttons navigate to the first item; do not add actual tab-panel switching.
- TEXT uses `TextLibrary.astro` / `TextReader.astro` for its academic work/document views; STORY retains `LibrarySeries.astro` / `StoryReader.astro`. Share `ReaderToolbar`, `ReaderBody`, document-reader, reader-tools and reader-drawer behavior; do not duplicate Markdown/footnote interpretation or restore retired graph/Entity layouts. TEXT work/document accents are slate blue; gold stays on TEXT menu/category pages and document footnote emphasis. TEXT document list and document TOC default open at >=1360px and closed below that width; opening both gives desktop list/body/aid columns; one set of aid nodes becomes modal below 1360px. On TEXT document scroll, site header/work/part navigation scroll away; the reader toolbar and opened side panels stick at viewport top. Preserve focus-mode restoration and the single font slider. BLOG retains its dedicated list/detail layout.
- TEXT/STORY document readers recognize explicitly fenced `original` blocks via one shared Markdown transform, toolbar and visibility controller. Start visible; show the toggle only with marked blocks, use an icon with accessible labels at <=980px, and leave ordinary code/inline code unchanged. Share original typography and font scaling; TEXT uses its soft panel background and STORY its themed secondary surface.
- TEXT/STORY body/footnote emphasis (em/i) uses self-hosted SIL Gentium 7.000 real italic faces for Latin/combining marks, including romanized Pali. Keep Korean/upright/original/code typography and the shared font slider unchanged; never rewrite authored Pali to fix rendering. Preserve the unmodified WOFF2 assets and OFL license under ol-core/public/fonts/gentium; no browser test without the user's explicit request.
- STORY document aids use the shared TEXT-style dock at >=1360px: one persistent right panel with 본문 목차/각주 switching and the same background as the article. Below that width, move the original nodes back to native modals; do not duplicate IDs or auto-open a modal on resize. STORY focus hides both the left chapter list and right aid rail, then restores the selected aid.
- TEXT/STORY right aid docks share ReaderPanelResize and reader-panel-resize: drag the article/panel boundary or use the keyboard separator at >=1360px. Default 300px, range 240–520px with at least 480px for the article; retain the 780px prose cap. Share the saved preferred width across readers, restore it before paint, and retain it through temporary viewport constraints, panel switching, focus and modal transitions. Cancel interrupted drags and hide the handle in modals/print.
- BLOG uses `content/blog/series/category/post`: each category belongs to exactly one series. 불교의 세계 → 교학; 수행-몸과 마음 돌보기 → 수행; 상상공장 → 디자인·인포그래픽; 비움제작일지 → 비움·일지. 에세이-삶의 쉼표 intentionally has only its introduction until the user adds categories/posts. Keep per-post folders/attachments together; preserve IDs/URLs/dates/rights and rebase relative links when moving.
- BLOG `/blog/` uses compact post rows; `/blog/series/` randomizes the four non-journal covers and asymmetric sizes once before paint, with a fixed journal section below. Mobile uses one column. Series detail uses an ordered TOC; category detail uses its authored introduction and posts. Use real page links with aria-current for 포스트/시리즈.
- BLOG series/category `index.md` supplies title/H1, description/first paragraph, optional thumbnailAsset and published state; classify these as metadata, never posts/RSS/recent-post/statistics. Private intros hide descendants/assets. Optional series `## 읽는 순서` ordered Markdown links override oldest-first reading order; unlisted public posts follow by date. Use the same order for TOC and previous/next. Reject duplicate category labels across series, duplicate reading-order links and cross-series membership. No tag inheritance.
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
- Source schema/normalized data: `ol-core/src/content.config.ts`. Shared interpretation: `ol-core/scripts/lib/content.mjs`. Share these rules with validation instead of maintaining divergent defaults.
- Restore a missing registry from Git; `prepare:content -- --init` is only for new vaults. Commit prepared registry changes with content; CI runs `check:registry`. First-publication preparation dates use Asia/Seoul.
- `content-registry.json` is durable source metadata, not disposable build output. Commit it with content changes. It preserves URLs, first-publication preparation dates, previous paths and hashes.
- EBOOK is an auxiliary `/ebook/` download library linked only below MEDIA in the footer, never the primary/mobile menu. Use `content/ebook/category/book/`: top-level folders are ordered categories and each child folder is one book with optional index.md bibliography, cover and EPUB/PDF files. Show category/count filter buttons above the ebook list, intersecting search and format filters; retain empty public categories and hide descendants of private categories. Use CC0 for every ebook, no individual routes/registry records; exclude private/draft packages and publish only selected cover/download assets.
- `content/media/` is the shared public asset namespace. The auxiliary `/media/` gallery is linked from home statistics and the footer, never the primary/mobile menu. Derive image categories from the first subfolder (numeric prefixes only order); root images are 미분류. Keep original assets under `/generated/content/media/`, generated previews under `/generated/media-gallery/`, and no per-image documents/frontmatter/registry records. Optional category index.md files hold multiple `## [Image title](relative-image-path)` sections; use each section body as modal Markdown information and its title as the card/modal title. Missing information falls back to filenames; validate existing category-local image targets and duplicates. Keep metadata refresh independent of preview caching.
- Keep source attachments inside the vault. Use relative Markdown links; the shared remark plugin resolves them. Unsupported Obsidian wikilinks/blocks must not be described as working.
- Use `site-config.mjs` for shared fixed settings and `ol-core/src/lib/site-config.ts` in app code. Do not restore retired DESIGN environment variables.
- Use shared `DocumentTags.astro` to display only the current document’s optional tags below its title. Series tag controls/modals are retired. BLOG tag buttons filter exact tags together with year archives and shared pagination.

## Preservation and Verification

- Preserve existing unpublished states, dates, rights, body text and assets when migrating content. Review `.agents/references/content-migration-inventory.json` for the original migration mapping.
- Keep GitHub Pages root deployment; never add Astro `base`.
- Run `npm run check`, `npm run typecheck`, and `npm run build` for content/route/layout/config changes.
- Verify actual `dist` pages and local targets, plus RSS/sitemap/robots when routing changes.
- Keep `dist/`, `.astro/`, `node_modules/`, and `ol-core/public/generated/` out of commits. Do not edit generated assets as source.
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

### 2026-11-12 — Pali italic typography

- Added shared Latin-only Gentium italic typography for romanized Pali in reader prose and footnotes, preserving Korean text and authored sources.

### 2026-11-12 — TEXT category introductions

- Added the ten planned TEXT categories and their introductions while preserving the existing Madhyamaka work and reusing shared category metadata handling.

### 2026-11-12 — Browser testing requires an explicit request

- 사용자의 별도 명시 요청 전에는 브라우저 실행·탭 조작·스크린샷·브라우저 기반 테스트를 수행하지 않도록 규정했다.

### 2026-11-12 — STORY 이야기불교 categories

- Added seven category introductions, moved existing editions to 붓다전기 with preserved identities, and shared TEXT/STORY category metadata handling.

### 2026-11-12 — Reader aid panel sizing

- Add shared desktop boundary dragging, accessible keyboard sizing and persistent TEXT/STORY aid width without changing modal content or prose.

### 2026-11-11 — STORY original blocks

- Extend the shared TEXT original-passage renderer/toggle/typography to STORY documents, without changing authored content.

### 2026-11-11 — Unicode path stability

- Canonicalize source/registry/loader/link/asset keys to NFC across macOS and Linux; preserve identities and native filenames, and keep strict registry checks.

### 2026-11-11 — BLOG series

- Added series/category/post hierarchy, index metadata, separate post/series pages, randomized asymmetric covers, category introductions and sequential post navigation. Keep the essay series empty.

### 2026-11-09 — Content / OL core separation

- Moved the unchanged Obsidian vault to content/ and source/scripts/public to ol-core/. Kept root npm commands, configuration, registry and dist/ output; centralized paths and updated asset cache/ignore rules.

### 2026-11-09 — MEDIA image information

- Added category-level index.md image-link sections and Markdown information in gallery modals; retain the three sample indexes as authoring references.

### 2026-11-09 — EBOOK categories

- Added top-level EBOOK categories, category/count buttons and combined filters. Keep the user-requested sample category and book.

### 2026-11-09 — Biwoom - 비움

- Brand: `Biwoom - 비움` (English: Biwoom, Korean: 비움). Production target: `https://biwoom.github.io/`; preserve the repository, root routes and no Astro base.
- BLOG brand category is `005.비움`; preserve document identities/dates and historical BORIDO records. Existing symbols remain, with `biwoom-mark-*` filenames.
- GitHub Pages Custom domain must be empty for the default domain; local code changes do not update hosting settings.


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
