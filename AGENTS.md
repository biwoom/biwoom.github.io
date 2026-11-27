# AGENTS.md

## Project

BIWOOM (비움) is the public Astro site for Buddhist texts, translations, research, story articles, posts, media and ebooks. Publish to `https://biwoom.github.io/` through GitHub Actions in `biwoom/biwoom.github.io`. OL names the internal core.

- Use 불전문학 for source texts, traditions and translations, and 이야기카드 for stories written for a general audience. Link an article to the actual edition, chapter, verse or translation when available. The wordmark opens `/`.
- For editorial direction, see the sibling `biwoom-docs/BIWOOM_기획문서/` collection. Follow the 2026-11-26 integration decision and the code for the deployed architecture and implemented behavior.

## Browser Testing

- 사용자가 별도로 명시적으로 요청하기 전에는 로컬 웹브라우저를 열거나, 이미 열린 브라우저·탭을 조작하여 사이트 열람·스크린샷·UI/시각 테스트를 수행하지 않는다. 인앱 브라우저, 컴퓨터 사용 도구와 헤드리스 브라우저 자동화를 이용한 로컬 사이트 테스트도 같은 제한을 적용한다.
- 일반적인 구현·수정·검증·빌드·커밋 요청은 브라우저 테스트를 허용한 것으로 해석하지 않는다. 기본 검증은 필요한 CLI 검사·타입 검사·빌드·생성 파일 및 링크 확인으로 수행하며, 브라우저 화면 점검은 사용자가 담당한다.

## Current Architecture

- Repository root remains the Astro/npm execution root. Authoring lives in `content/`; implementation lives in `ol-core/src/`, `ol-core/scripts/`, and `ol-core/public/`. Root `astro.config.mjs`, package files, `site-config.mjs`, and `content-registry.json` remain in place; output stays `dist/`.
- Define filesystem paths in `ol-core/scripts/lib/paths.mjs`, anchored to the module location rather than process.cwd(). Vault-relative keys use NFC Unicode and POSIX separators: use normalizeContentPath/relativeContentPath for keys and contentFile for physical source lookup. Normalize legacy registry keys/series/category paths and aliases without changing IDs, URLs, dates, hashes or redirects; reject conflicting normalized paths. Do not rename vault files or rewrite prose to fix normalization. Load Markdown using glob() with an absolute content base. Keep registry keys relative to the vault (text/..., story/..., blog/...); a physical vault move must not change IDs, URLs, dates or hashes.

- `content/` is both the content source and the user's Obsidian vault.
- Desktop and mobile primary navigation uses 카드, 경론, 문학 on the home page and 경론, 문학, 카드 on other pages. The public library names are 불교경론 and 불전문학, with `/text/` and `/story/` as their routes and `text` and `story` as their collection keys. The BLOG link remains a separate action. `pages` holds visitor-facing permanent documents.
- The 카드 menu, 이야기카드 home preview tab and footer link below BLOG series open `/articles/`. Label the `/series/` navigation and index 이야기카드 시리즈. Keep `/stories/<id>/`, `/series/`, `/topics/`, `/tags/`, `/categories/` and `/saved/` working for existing links and bookmarks. Article sources use `content/article/` and their illustrations use `content/illustration/`. Publish articles with explicit `published: true`. Keep stable article IDs and the browser bookmark storage key. Share reading controls with the libraries. Preserve article metadata and publish only illustrations referenced by public articles.
- The home preview tabs are 이야기카드, 불교경론, 불전문학, 블로그, 미디어&ebook and 비움 소개. Desktop sidebar tabs have icons and fill the sidebar in equal rows. The first four panels place titles, descriptions, counts and links on the left with responsive WebP screenshots on the right from 1024px. At narrower widths the screenshots follow the description. The last panel holds the site introduction, usage terms link and brand document CTA. While in view, select the next tab and panel every eight seconds and wrap to the first. Pause during mouse hover and restart the eight-second timer on pointer exit. Previous and next arrows select adjacent tabs and panels immediately. Respect keyboard focus, page visibility and reduced motion.
- Optional story-card HTML lives directly in `content/article/html/`. Match one `<article class="story-card">` per file to an existing Markdown `id` with `data-article-id` and set `data-card-date` as YYYY-MM-DD. Use the shared card CSS and publish only the extracted card and assets linked to public articles. On /articles/, 오늘의 이야기 shows up to five eligible cards by card date, to the right of the hero introduction above 760px and below it at narrower widths. Rotate every five seconds only when multiple cards are available. Keep direct reader links, pause controls for multiple cards, and visible arrows that are disabled for a single card. Without eligible HTML, show the latest public article in the card menu. The home page shows 오늘의 이야기카드 below the preview tabs using the same five-card selection and shared controls. Show two cards from 1024px up and one below it. Rotate by one card every five seconds when more cards exist than fit on screen. Keep previous and next arrows usable when two cards are visible and disable them for one card. Omit the home section without eligible HTML. Recommended stories use the configured public IDs in `content/article/index.md`. On `/articles/`, list previews open below the navigation on the right on desktop and below the selected card on narrower screens. See [비움 이야기카드 설계 문서](.agents/context/biwoom-story-card-specification.md).
- Keep the website story-card layout and text in HTML. Use WebP for new or replacement card illustrations, preserving the original assets and any transparency. Use complete card PNGs for sharing and distribution.
- Vault CMS, Front Matter, and Decap CMS are not used.
- TEXT uses category → work/series → material section/part → item. STORY uses category → series → part → chapter. Translation and research are independent.
- TEXT categories are 중관부, 반야부, 정토부, 선어록, 아비달마부, 유가부, 화엄부, 인명부, 대승부, 니까야, ordered 001–010. Each has a lowercase index.md introduction; preserve the existing 중관부/대승현론 content and identities. The other nine categories currently have introductions only, with future works added by the user.
- TEXT/STORY menu roots show work rows and story cards, respectively. Use real page links for 문헌/카테고리 and 불전문학/카테고리/태그. The `/text/categories/` and `/story/categories/` pages show `ol-grid-3` category cards, and each category page lists its series. Category lists and work filters show only categories with a public work/series; a category index.md alone does not qualify. Preserve empty category sources and their direct category pages (track `.gitkeep` when needed). Menu roots end with up to three public Markdown documents linking to their existing readers, newest Seoul publication day first and one per work per round within each day.
- TEXT/STORY category `index.md` files are category metadata, with authored title/description and canonical category URLs; exclude them from readers, series lists and document counts. Private category intros hide descendants/assets. The 불전문학 categories are 붓다전기, 전생이야기, 고승전기, 가르침과 일화, 설화와 전승, 구법과 순례, 시와 게송. 마하붓다왐사 is under 붓다전기 and 담마빠다이야기 is under 가르침과 일화. Future works are added by the user.
- 불교경론은 일반 문헌에 펼침 목록과 자료 첫 편으로 가는 링크를 제공한다. 문헌 전체가 60편을 넘거나 한 자료 구분이 30편을 넘으면 자료 구분별 30편 정적 목차를 생성한다. 긴 자료 구분의 리더는 현재 자료, 이전·다음 및 현재 자료가 있는 목차로 연결한다. 문헌의 제목·설명 검색은 첫 검색 때 공개 목록을 불러온다.
- TEXT uses `TextLibrary.astro` / `TextReader.astro` for its academic work/document views; STORY retains `LibrarySeries.astro` / `StoryReader.astro`. Share `ReaderToolbar`, `ReaderBody`, document-reader, reader-tools and reader-drawer behavior; do not duplicate Markdown/footnote interpretation or restore retired graph/Entity layouts. TEXT work/document accents are slate blue; gold stays on TEXT menu/category pages and document footnote emphasis. TEXT document list and document TOC default open at >=1360px and closed below that width; opening both gives desktop list/body/aid columns; one set of aid nodes becomes modal below 1360px. On TEXT document scroll, site header/work/part navigation scroll away; the reader toolbar and opened side panels stick at viewport top. Preserve focus-mode restoration and the single font slider. BLOG retains its dedicated list/detail layout.
- TEXT/STORY document readers recognize explicitly fenced `original` blocks via one shared Markdown transform, toolbar and visibility controller. Start visible; show the toggle only with marked blocks, use an icon with accessible labels at <=980px, and leave ordinary code/inline code unchanged. Share original typography and font scaling; TEXT uses its soft panel background and STORY its themed secondary surface.
- TEXT/STORY body/footnote emphasis (em/i) uses self-hosted SIL Gentium 7.000 real italic faces for Latin/combining marks, including romanized Pali. Keep Korean/upright/original/code typography and the shared font slider unchanged; never rewrite authored Pali to fix rendering. Preserve the unmodified WOFF2 assets and OFL license under ol-core/public/fonts/gentium; no browser test without the user's explicit request.
- STORY document aids use the shared TEXT-style dock at >=1360px: one persistent right panel with 본문 목차/각주 switching and the same background as the article. Below that width, move the original nodes back to native modals; do not duplicate IDs or auto-open a modal on resize. STORY focus hides both the left chapter list and right aid rail, then restores the selected aid.
- TEXT/STORY right aid docks share ReaderPanelResize and reader-panel-resize: drag the article/panel boundary or use the keyboard separator at >=1360px. Default 300px, range 240–520px with at least 480px for the article; retain the 780px prose cap. Share the saved preferred width across readers, restore it before paint, and retain it through temporary viewport constraints, panel switching, focus and modal transitions. Cancel interrupted drags and hide the handle in modals/print.
- BLOG uses `content/blog/series/category/post`: each category belongs to exactly one series. 불교의 세계 → 교학; 수행-몸과 마음 돌보기 → 수행; 상상공장 → 디자인·인포그래픽; 비움제작일지 → 비움·일지. 에세이-삶의 쉼표 intentionally has only its introduction until the user adds categories/posts. Keep per-post folders/attachments together; preserve IDs/URLs/dates/rights and rebase relative links when moving.
- BLOG `/blog/` uses compact post rows; `/blog/series/` randomizes the four non-journal covers and asymmetric sizes once before paint, with a fixed journal section below. Mobile uses one column. Series detail uses an ordered TOC; category detail uses its authored introduction and posts. Use real page links with aria-current for 포스트/블로그 시리즈.
- BLOG series/category `index.md` supplies title/H1, description/first paragraph, optional thumbnailAsset and published state; classify these as metadata, never posts/RSS/recent-post/statistics. Private intros hide descendants/assets. Optional series `## 읽는 순서` ordered Markdown links override oldest-first reading order; unlisted public posts follow by date. Use the same order for TOC and previous/next. Reject duplicate category labels across series, duplicate reading-order links and cross-series membership. No tag inheritance.
- DESIGN/NET and Entity/Ontology systems are retired. Their useful assets/prose have been migrated to ordinary TEXT material. Do not recreate their schemas or linking layers.

## Content Rules

- Authors may write Markdown without YAML. Title priority: optional `title` override → first H1 → descriptive filename.
- Derive hierarchy and order from folders/files. Parse numeric prefixes such as `001.Name`, hide the prefix in labels, and accept numeric-only filenames when an H1 supplies the title.
- In STORY document display titles, hide compound chapter numbers such as `01-01-2` when the H1 or filename-derived title repeats the filename prefix. Keep explicit `title` overrides and source Markdown.
- Korean author-facing folder and document names are allowed. Keep code filenames and route implementation files ASCII.
- `index.md` is an optional work/series introduction. Do not require one to generate a library.
- `_drafts`, `_templates`, dotfolders, and `.obsidian` must not appear in public content or search. `assets`/`_assets` are auxiliary files, not item cards.
- Public menu documents are public by default; preserve explicit `published: false`. A nonpublic series intro hides its descendants.
- Tags are optional plain string arrays, e.g. `tags: [수메다, 수밋따]`; do not use classification prefixes or singular `tag`. Do not reintroduce `prefixTags`, `entities`, `relations`, or `tagAliases`.
- STORY documents also accept optional `personTags`, `placeTags`, `topicTags` and `aliasTags`. Write canonical names in the typed lists and record variant spellings under `aliasTags.person`, `aliasTags.place` or `aliasTags.topic` for canonical names used in that document. Index only public STORY documents, group results in existing series order, and report conflicts between canonical names and aliases within the same type.
- Keep provenance and notes in body text. Record the source, edition and location as available, and distinguish translation, interpretation and retelling. Preserve document-specific rights exceptions and confirm redistribution terms for any third-party text, translation, image, font or file before publication.
- `_drafts` and `published: false` control site output. Keep restricted research, review and approval records in access-controlled storage outside the publishable repository.
- Private index.md directories exclude their attachments from deployment. `_assets` is the only underscore-prefixed attachment exception. Publicly shared attachments remain public; keep private per-document attachments in private index folders or `_drafts`.
- Introduction canonical URLs equal library URLs. Deleted sources must not be restored or redirected to unrelated material; retain registry history and render redirects only to current public targets.
- Source schema/normalized data: `ol-core/src/content.config.ts`. Shared interpretation: `ol-core/scripts/lib/content.mjs`. Share these rules with validation instead of maintaining divergent defaults.
- Restore a missing registry from Git; `prepare:content -- --init` is only for new vaults. Commit prepared registry changes with content; CI runs `check:registry`. First-publication preparation dates use Asia/Seoul.
- `content-registry.json` is durable source metadata, not disposable build output. Commit it with content changes. It preserves URLs, first-publication preparation dates, previous paths and hashes.
- EBOOK is an auxiliary `/ebook/` download library linked from the home preview and below MEDIA in the footer, outside the primary/mobile menu. Use `content/ebook/category/book/`: top-level folders are ordered categories and each child folder is one book with optional index.md bibliography, cover and EPUB/PDF files. Show category/count filter buttons above the ebook list, intersecting search and format filters; retain empty public categories and hide descendants of private categories. Publish only books eligible for the library's CC0 policy. Verify redistribution rights for all components and retain any separately licensed material's notices in the book and its bibliography. EBOOK has no individual routes/registry records; exclude private/draft packages and publish only selected cover/download assets.
- `content/media/` is the shared public asset namespace. The auxiliary `/media/` gallery is linked from the home preview and the footer, never the primary/mobile menu. Derive image categories from the first subfolder (numeric prefixes only order); root images are 미분류. Keep original assets under `/generated/content/media/`, generated previews under `/generated/media-gallery/`, and no per-image documents/frontmatter/registry records. Optional category index.md files hold multiple `## [Image title](relative-image-path)` sections; use each section body as modal Markdown information and its title as the card/modal title. Missing information falls back to filenames; validate existing category-local image targets and duplicates. Keep metadata refresh independent of preview caching.
- Keep source attachments inside the vault. Use relative Markdown links; the shared remark plugin resolves them. Unsupported Obsidian wikilinks/blocks must not be described as working.
- Use `site-config.mjs` for shared fixed settings and `ol-core/src/lib/site-config.ts` in app code. `SITE_URL` sets the production origin. Do not restore retired DESIGN environment variables.
- Use shared `DocumentTags.astro` to display only the current document’s optional tags below its title. Series tag controls/modals are retired. BLOG tag buttons filter exact tags together with year archives and shared pagination.

## Preservation and Verification

- Preserve existing unpublished states, dates, rights, body text and assets when migrating content. Review `.agents/references/content-migration-inventory.json` for the original migration mapping.
- Keep Astro at the root using `SITE_URL` from `site-config.mjs`. Use root routes such as `/text/` in public links and metadata. `sitePath` maps older internal links to the root, and the build emits compatibility redirects under `/hub/`. Preserve registry IDs, URLs, dates and existing path keys.
- Run `npm run check`, `npm run typecheck`, and `npm run build` for content/route/layout/config changes.
- Verify actual `dist` pages and local targets, plus RSS/sitemap/robots when routing changes.
- Keep `dist/`, `.astro/`, `node_modules/`, and `ol-core/public/generated/` out of commits. Do not edit generated assets as source.
- Do not alter the user's `.obsidian` state. Personal workspace and plugin files are ignored.
- Historical ATLAS/media archives may have been deleted by the user. Preserve those deletions; do not restore them.

## Continuity and Skills

- Before major work read `.agents/context/current-state.md`, `.agents/context/decisions.md`, and recent `.agents/context/work-log.md` entries.
- Authoring manual: `.agents/references/biwoom-content-management-manual.md`.
- Refactor guide: `.agents/references/obsidian-content-refactor-guide.md`.
- Update current state when architecture/status/risks change, decisions for durable choices, and work-log after meaningful implementation/documentation work. Keep records concise.
- Use `$ol-content-authoring` for content, `$ol-doc-maintenance` for guidance, `$ol-deploy-check` for deployment-related changes, and `$ol-github-upload-log` for requested GitHub uploads.
- Upload requests perform only the requested push. Do not automatically add work-log commits, wait for Pages, or inspect Actions unless explicitly requested.

## 수정 변경사항

### 2026-11-27 — 비움프리뷰탭 배치와 홈 좌우 화살표

- 사이드바 탭을 균등 배치하고 우측 패널의 썸네일 아래에 메뉴별 특징을 정리했다. 홈 이야기카드는 두 장이 모두 보일 때도 좌우 탐색을 제공한다.

### 2026-11-27 — 비움프리뷰탭과 홈 이야기카드

- 홈의 메뉴 소개와 공개 자료 집계, 비움 소개를 여섯 탭으로 통합했다. 홈 헤더는 카드·경론·문학 순서이며, 프리뷰 아래에 반응형 이야기카드 캐러셀을 둔다.

### 2026-11-27 — 오늘의 이야기 캐러셀

- 히어로의 최신 HTML 카드 최대 다섯 장을 5초 간격으로 전환한다. 목록 미리보기는 카드 탐색 메뉴 아래에 배치한다.

### 2026-11-27 — 이야기카드 WebP 삽화

- 웹용 이야기카드는 HTML을 유지하고, 새로 추가하거나 교체하는 삽화에는 WebP를 기본으로 쓴다.

### 2026-11-27 — 불교경론 대형 문헌

- 자료 규모에 따라 정적 목차를 생성한다. 생성본 검사에서 자료 목록, 좌측 목차, 본문 목차와 한문 검색 파일 크기를 기록한다.

### 2026-11-27 — 이야기카드 HTML 제작과 운영

- 기록한 설계 문서를 `.agents/context/`에 두고, 공개 Markdown 연결과 카드 날짜·추천 설정, 히어로 배치 기준을 문서화했다.

### 2026-11-26 — Unified BIWOOM site

- Consolidate the root site and document libraries. Preserve existing routes and expose the public stories through a home card.

### 2026-11-26 — Korean navigation and library names

- Name the primary links 홈, 경론, 문학. Use 불교경론 and 불전문학 for the libraries and retain the established routes and collection IDs.

### 2026-11-26 — BIWOOM HUB identity and operating guidance

- Align service roles, editorial and rights guidance, public branding, and local deployment checks with the BIWOOM plans and the current HUB.

### 2026-11-25 — STORY translation releases

- Replaced the earlier Maha Buddhavamsa editions and Dhammapada Stories chapters with the two translation-project releases in their respective categories.

### 2026-11-25 — STORY structured tags

- Added optional person, place, topic and alias fields, tag search, and series-grouped STORY tag pages.

### 2026-11-25 — BIWOOM HUB

- Adopt the HUB name and repository, deploy under `/hub/`, and connect the HUB header to the existing root site reserved for HOME.

### 2026-11-15 — Empty TEXT/STORY category lists

- Hide categories without a public work/series from list cards, filters and displayed counts; preserve category sources and direct pages.

### 2026-11-13 — TEXT/STORY menu views

- Added work-first menu roots, category page tabs and three recent reader links.

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
