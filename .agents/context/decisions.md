# Decisions

## 2026-11-11 — BLOG series and reading flow

- Use physical blog/series/category/post folders, with each category owned by one series. Add 상상공장 for 디자인·인포그래픽; name the fixed production series 비움제작일지 for 비움·일지. Retain the empty essay series until user authoring.
- Combine A compact post rows, B cover discovery and C ordered series TOCs. Use separate /blog/ and /blog/series/ pages, stable registry-based series/category routes and unchanged post canonical URLs. Randomize four non-journal links and desktop size patterns before paint; keep visual/keyboard order identical and journal fixed below. Mobile uses one column.
- Read index.md metadata through the shared parser without new authoring fields; optional thumbnailAsset supplies covers. Do not count metadata as posts or include it in RSS/recent-post statistics. Private parents hide descendants/assets. Use oldest-first series reading order with optional explicit Markdown links under 읽는 순서, then append unspecified public posts. TOC/start/previous-next share that one order.

## 2026-11-09 — Restore reading size before paint

- Restore the bounded reading-size preference in the head of academic layouts, using a CSS variable scoped to document readers. Supply equivalent initial sizes for the targets later managed by the shared slider; preserve unscaled base declarations and original passage sizing. Measure at a temporary 100% scale and restore synchronously so persisted scaling is applied once, including responsive resizes. Keep workspace columns and focus/panel behavior unchanged.

## 2026-11-09 — Content / OL core separation

- Use repository-root content/ for the existing Obsidian vault and ol-core/src, ol-core/scripts, ol-core/public for implementation. Keep Astro/npm execution at the repository root, along with config/package/site settings/registry; output stays dist with no Astro base.
- Centralize filesystem roots in ol-core/scripts/lib/paths.mjs, anchored via import.meta.url. Preserve explicit isolated roots for fixture/CLI migration checks; glob loads from the absolute content directory. Keep every source-relative registry key, ID, URL, date, hash and history entry unchanged. Move .obsidian without editing its contents and update its ignore path.
- Retain existing custom publication, MEDIA/EBOOK, Markdown/footnote and watch behavior. Verify content/attachment bytes, registry stability, built routes/feeds and live add/edit/rename/delete/privacy changes before completion. Previous source paths in older decisions/logs/inventories remain historical.

## 2026-11-09 — Remove MEDIA thumbnail sources

- Remove the three explicit *-thumb.jpg source assets (buddhist-worldview, lamrim, six-steps) and their index.md entries. Keep the 12 remaining originals and automatically generated gallery previews. Current category counts are 5/5/2; the earlier 15-image migration mapping remains historical and deleted thumbnails must not be restored.

## 2026-11-09 — MEDIA category information indexes

- Per user instruction, MEDIA images default to CC0 unless separately stated. Display the policy below the gallery introduction and put other licenses in the relevant image information; preserve existing rights exceptions.

- Allow one optional category index.md to describe multiple images using H2 image-link headings. The link resolves to an existing public image in the same category; heading text overrides the displayed title and the body before the next H1/H2 renders in its modal. Reuse common Markdown plugins/relative-link resolution. Validate missing/excluded/cross-category/duplicate image targets.
- Keep metadata outside registry/search/individual routes and raw asset copies; metadata privacy hides only information, not shared public assets. Reread index files independently of cached preview data so edits/removal reset titles/descriptions without rebuilding previews. Keep three sample indexes for all current images, with authoring guidance before entries.

## 2026-11-09 — MEDIA image classification

- Classify existing shared images into top-level 001.인포그래픽 (8), 002.문양 (5), and 003.일러스트 (2), using the existing first-folder gallery categories/buttons. This supersedes the historical flat-folder/preserve-root-path choice for these 15 assets. Keep names and bytes; rebase five BLOG sources and prepare registry hashes while preserving IDs, URLs and dates. Record moves/checksums in media-category-migration.json without rewriting earlier migration history.

## 2026-11-09 — EBOOK categories

- Use ebook/category/book folders. Derive category labels/order from top-level folder names like TEXT, with category/count buttons above the book list instead of category routes. Intersect category, search and format selections. Keep empty public categories; a private category index hides its packages and assets.
- Retain the requested 샘플 category and existing CC0 test book at ebook/001.샘플/001.보리도 전자책 샘플. Package path changes also change download/share URLs; no registry entries or individual routes are introduced.

## 2026-11-09 — Biwoom brand and default domain

- Supersede the 2026-11-08 custom-domain choice: use `https://biwoom.github.io` as SITE_URL and `Biwoom - 비움` as the public brand. English name: Biwoom; Korean name: 비움. Keep OL internals, repository, root paths and existing registry identities/dates.
- Retain existing symbol artwork under biwoom-mark filenames and regenerate branded sharing art. Rename BLOG category to `005.비움` by identity-preserving preparation. Preserve historical work prose and completed ebook files with current-brand notices; preserve Buddhist terminology such as 보리도차제론.
- Default-domain hosting requires an empty GitHub Pages Custom domain setting; code updates, push and hosting changes are separate actions. No push/hosting mutation was requested with this source change.

## 2026-11-08 — TEXT original passages

- Original font sizing belongs entirely to CSS: 18px base on the pre element and a CSS multiplier for the shared reader scale. Exclude original descendants from JavaScript's per-element font measurement/inline base-size assignment.
- Use the explicit `original` fenced-code language marker to distinguish source passages from ordinary code. Transform it into an escaped-text wrapper in the existing shared remark-content pipeline; do not infer language from Han characters. TEXT reader buttons toggle marked body passages only and use icons alone on mobile. Default visible, without a persisted hidden preference; style source text at 18px serif with wrapping and shared font scaling.

## 2026-11-08 — Reader CSS cleanup

- Keep the author's disabled declarations removed; do not revive the old article padding or decorative borders. Give shared reader layout, drawer controls and typography separate CSS files, with TEXT/STORY variants after the shared rules. Retired mobile dropdown/Entity selectors have no public markup and are removed.
- Render TEXT's wide default workspace open in HTML/CSS and use CSS for compact initial defaults until `data-text-ready` is set. The controller then owns user toggles, avoiding a first-paint closed layout followed by desktop expansion.

## 2026-11-08 — STORY chapter toolbar

- STORY part navigation scrolls away with the document; pin only the reader toolbar and desktop side panels at viewport top. Do not reserve offsets for the scrolled-away navigation.
- Use the shared ReaderToolbar's TEXT-style chapter icon and labels on STORY, with left navigation and right document tools in one full-width toolbar matching the article background. At <=980px move the original chapter-list nodes into a native modal; desktop toggles the sidebar, preserving its selection through focus mode. Remove the separate mobile chapter dropdown.

## 2026-11-08 — STORY desktop reading aids

- At >=1360px use TEXT-style docked original TOC/footnote nodes and an always-visible right rail; default to TOC, allow tab switching and keep rail/panel background equal to the article surface. Below the breakpoint restore the same native-modal nodes, closed on transition. STORY focus hides both sides and restores the selected aid on exit. Share drawer/docked styling and note navigation rather than duplicating Markdown or IDs.

## 2026-11-08 — EBOOK Library

- Provide completed EPUB/PDF packages in src/content/ebook, with optional ordinary Markdown bibliography. Use CC0 for every ebook per user instruction. Do not generate ebooks from TEXT/STORY in this phase.
- Reuse MEDIA visual conventions but use an aligned book-cover grid and native bibliography/download modal. Link EBOOK directly below MEDIA in the footer; do not add it to the main/mobile menus. No individual document routes or registry records; publish only actual selected covers/downloads of public complete packages.


## 2026-11-08 — Custom Domain

- Use `https://borido.org` as the common production SITE_URL. Preserve repository `biwoom/biwoom.github.io`, root-relative routes, registry identities/dates and historical deployment records. Keep Astro without base.
- Existing custom Actions deployment does not require a CNAME file. DNS and GitHub Pages HTTPS provisioning are separate from local metadata/build validation.

## 2026-11-08 — Shared reading typography

- TEXT/STORY document bodies share Noto Serif KR, 17px/1.95 typography, heading/paragraph spacing and a centered 780px prose cap. Keep collection-specific menus, toolbar/theme and focus behavior. STORY document routes load the same serif faces; BLOG and STORY libraries keep their existing typography.

## 2026-11-07 — Academic TEXT Workspaces

- User explicitly supersedes shared STORY presentation for TEXT work/document pages. Use separate academic templates while sharing toolbar/body/parser/footnote/size/copy/dialog behavior. Keep ordinary material links, stable URLs, one font slider and click-note-text return; no extra backreference arrows.
- Adopt sample slate blue on work/document pages and keep gold only for TEXT menu/category views and document footnote emphasis. Selectively load Noto Serif KR 400/600 there, retain sans UI. Use sample tool symbols and focus mode restoring prior panels; document list and document TOC default open at >=1360px and closed below that width; opening them gives a desktop three-column dock, converting to compact modals using the same actual nodes. On document scroll, site header/work/part navigation scroll away and tools/opened aids stick at viewport top. Document bibliography comes only from explicit labelled prose. The library rail renders only work index.md body as authored Markdown under 서지정보, including original-reading links; omit the per-material bibliography list; do not extract its fields, duplicate it in the center, add metadata fields or guess authors/dates.

## 2026-11-06 — BLOG Source Categories

- Organize BLOG by one primary purpose: 교학, 수행, 인포그래픽, 디자인, 보리도, 일지, ordered with 001–006 folder prefixes. Distinguish explanatory doctrine/practice articles from visual-production records; use tags for overlapping subjects.
- Retain loose Markdown or existing per-post index/attachment folders inside each category, without category introductions/frontmatter. Preserve registry identities and dates; explicitly link moved records before preparing edited relative links. BLOG normalized category/categoryOrder derive from the first folder without changing standalone registry grouping or URLs. Display published-post category counts above tags; category/tag/year filters intersect and reset pagination. Persist category/tag selection in query parameters and retain loose posts under 미분류.

## 2026-11-05 — CJK-Friendly Emphasis

- Use the pinned remark-cjk-friendly parser extension for emphasis beside punctuation and Korean particles, retaining source Markdown and normal code/escape rules. Share the GFM + emphasis plugin list through scripts/lib/markdown.mjs between Astro rendering and metadata/link analysis. Do not rewrite authored text or rendered HTML to repair emphasis.

## 2026-11-05 — Default Rights Display

- Hide the automatically supplied default author/license line on document pages; retain source metadata and separately specified rights exceptions/notices. Apply through the shared ContentRights component.

## 2026-11-05 — Reader Footnotes and Reading Size

- Render Markdown footnotes into a single drawer during the build, keeping generated IDs and backreferences intact. Use the existing TOC modal pattern; reference clicks select a note; note-text click/Enter returns to the last clicked source reference (first by default). Strip generated arrow controls in a TEXT/STORY-only rehype plugin and highlight the active body reference. Disable the toolbar button when there are no rendered notes.
- Use one 80–150% slider for reading-area title, headings and body together, preserving their existing relative sizes. Keep browser-local settings across TEXT/STORY, provide reset, and exclude the page introduction/navigation.

## 2026-10-31 — Auxiliary Media Gallery

- Add /media/ as an auxiliary gallery linked by home media statistics and footer, excluding desktop/mobile main navigation. Keep shared assets outside Astro document collections and create no individual image pages.
- Derive categories from the first source subfolder, stripping numeric prefixes for labels/order. Root files use 미분류; preserve current asset paths rather than inventing category assignments.
- Use responsive CSS columns for masonry and lazy WebP previews generated by Sharp. Count only source gallery images, keep original bytes untouched, cache generated metadata under .astro and previews under public/generated. Clean stale derivatives and deduplicate concurrent preparation.
- Open original images in a native modal dialog on the same page, with fit/original zoom, scroll containment, loading/error states and Escape/close/backdrop dismissal returning focus.

## 2026-10-31 — Flat Shared Media Assets

- Keep shared images flat in src/content/media with unique descriptive names, qualifying generic preview/thumbnail/profile names when necessary. Do not add a media menu, Astro collection, series, document metadata or search pages.
- Use ordinary document-relative Markdown links; reuse the existing resolver and asset sync under /generated/content/media/. Shared media is public independently of referencing draft documents, with hidden/draft/Markdown exclusion retained.
- Preserve image bytes and archive displaced Markdown/HTML/PDF originals outside the published tree. Record checksums and path/link mappings. Keep document-specific private attachment rules unchanged.

## 2026-10-31 — Plain Optional Tags and BLOG Classification

- Author plain optional arrays with tags, not singular tag or prefix/name labels. Flatten existing prefixes and deduplicate without rewriting bodies, rights, dates or URLs. Never inherit series tags into documents.
- Share DocumentTags under individual TEXT/STORY/BLOG titles; omit the whole area without tags. Retire series tag menus, result modals and prefix-filter helpers. Series hero keeps its background/alignment but uses 24px/20px padding (20px/16px mobile), 12px title/description spacing and 32px bottom gap.
- BLOG uses exact-match single-tag buttons with per-post counts and existing year archives/pagination. All includes untagged posts; changing a filter resets pagination. Tag links use ?tag=; encode values safely and support keyboard pressed state.

## 2026-10-31 — Shared Library List Tint

- Reuse the category hero’s theme-aware 4% menu-accent tint on TEXT/STORY category cards and series rows; increase to 8% for hover and keyboard focus. Keep text colors, card/row geometry, separators and existing focus outlines.
- Centralize the 4%/8% values as library-scoped custom properties; respect reduced motion for both item types.

## 2026-10-31 — Compact Category and Document Heroes

- Category-detail heroes use a solid 4% menu-accent tint blended with the theme background, retaining their bottom divider. Top/bottom padding: 40px/28px desktop, 28px/20px at <=900px.
- Document heroes remain transparent with 20px/16px padding (16px/12px mobile), 8–12px title/description spacing and 20px bottom margin. Remove the old negative part-nav top margin on documents. Preserve 40px/30px title sizes and menu-root/series layouts.

## 2026-10-31 — Distinct Category and Series Lists

- Keep menu-root categories as three-column cards; category details show series as single-column linked rows with thin separators, numbers, titles, optional descriptions, material/part metadata and arrows.
- Label root lists 카테고리 목록 and category-detail lists 시리즈 목록 at the upper left. Add a hero bottom divider on category details only.
- Make each row one link; use subtle menu-accent hover/keyboard focus states, compact mobile spacing and existing pagination/empty states. Preserve category, series and document URLs.

## 2026-10-31 — Menu-root Hero Background Restoration

- Restore the earlier accent gradient/grid background only on the TEXT/STORY menu roots. Keep category-detail, series and document heroes transparent; keep 40px/30px titles and category container sizing/alignment.

## 2026-10-31 — Neutral Reading Heroes

- Remove background colors/gradients from TEXT/STORY category, series and document heroes; retain menu accent controls and the HOME gradient. Hero H1 sizes are 40px desktop and 30px at the existing <=900px mobile breakpoint.
- Category roots and category-specific series lists share a max-width 1200px container, 32px horizontal padding at all widths and left-aligned titles/descriptions.

## 2026-10-31 — Content Engine Reload Verification

- Restart the entire development process after changing native content parser/preparation modules. A config touch or successful build does not prove a running server has dropped cached native modules.
- Verify actual category series card titles and membership in live HTTP checks; status 200 and data-library-view alone cannot catch stale grouping.

## 2026-10-31 — STORY Categories and Category-first Navigation

- TEXT and STORY share category/series/part/item interpretation; STORY category is the first folder, with numeric prefixes used only for order. Keep series/document IDs, URLs and dates during folder migration.
- Both menu roots render category cards using ol-grid-3; each links to a category-specific series list. Remove root category filters and series cards. Include empty top-level categories, tracking `.gitkeep` if needed; exclude reserved folders.
- Use the same normalized category fields and shared library/index UI. Category route identifiers are ASCII hashes derived from folder keys; no author frontmatter is required.

## 2026-10-31 — Full-width Readers and TOC Drawer

- TEXT/STORY individual documents share the full viewport-width reader shell, retaining the left document list on desktop and removing the right utility column. The article uses the available width, with prose capped at the current 1200px setting.
- Put a TOC icon beside Copy in the article toolbar. Align desktop tools beside the document header rather than in a separate lower row; cap document header titles at 1200px. On desktop, label it 목차 and keep the toolbar sticky below site/part navigation while scrolling through the article. Use one right-to-left drawer on desktop/mobile, with native modal dialog focus containment, Escape/close/backdrop dismissal, heading navigation and scroll-spy. Honor reduced motion. This supersedes the historical June sticky TOC/mobile dropdown rules.

## 2026-10-31 — Menu Accent Colors and Monochrome Identity

- Use supplied 004 monochrome in black rounded header/footer logo boxes and for favicon/apple icons. Keep both logo originals.
- HOME cyan #00d3f3, TEXT gold #f0b100, STORY green #7ccf00. BLOG stays monochrome.
- Scope themes by route in BaseLayout; keep readable black text on bright accent fills and subtle hero gradients in both color modes.


## 2026-10-31 — Brand Assets and Historical Names

- BORIDO/보리도 is the public brand; OL remains the code core. Use supplied 004 monochrome and 006 gold logo originals, preserved in public/brand.
- Derive header/footer identity, favicon/ICO/apple icon and social image from these assets with scripts/build-brand-assets.mjs.
- Label past ATLAS development and retired planning documents explicitly as historical. Do not rename engine identifiers, CSS hooks, storage keys, source URLs or archived originals.
- Keep biwoom.github.io as the production URL. borido.org remains a future migration.


## 현행 규칙 우선순위 (2026-10-30)

- AGENTS.md와 2026-10-30 이후 결정이 과거 지침보다 우선한다.
- 아래 6월 Entity/패널/DESIGN 전용 규칙, slash 태그 강제, 이전 content-structure helper 지침은 역사 기록이며 폐지·대체되었다.
- 현재 태그는 접두어 없는 문자열도 허용한다. 계층·정렬은 scripts/lib/content.mjs, 목록은 src/lib/library.ts에서 해석한다.
- 한글 작성 파일명을 허용하며 코드·내부 가이드 파일명만 ASCII로 유지한다.
- 전환 기준 커밋 f70b680은 origin/main에 전송되었다. 실서비스 배포 완료 확인과 구별한다.

## 2026-10-30 — Transition Hardening

- 비공개 index.md 디렉터리의 첨부는 배포하지 않는다. 일반 _ 경로는 제외하고 _assets만 첨부 예외로 허용한다.
- 느슨한 문서의 첨부는 참조 문서 공개 상태를 따른다. 공개/비공개가 함께 사용하는 첨부는 공개 공유 자료다. 전용 비공개 첨부는 비공개 index.md 폴더나 _drafts 안에 둔다.
- 문헌 소개 주소는 문헌 주소와 같다. 삭제한 콘텐츠와 무관한 대체 자료로 연결하지 않는다. 원본 registry 기록은 이동 추적용으로 보존하되 유효한 공개 목적지가 있는 redirect만 생성한다.
- 최초 공개 준비일은 Asia/Seoul 날짜다. registry 누락은 오류이며 신규 보관함의 --init만 예외다.
- 원본 YAML 타입 검사와 Markdown AST 제목 해석을 공통 계층에서 수행한다. 목차는 확인된 내부 링크 목록만 제거하며 본문은 보존한다.
- 수동 이동은 같은 컬렉션 내에서 기존 파일이 실제로 이동한 경우만 허용하고 모든 과거 별칭을 최종 경로로 연결한다. 컬렉션 간 이동은 별도 URL 이관이다.


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

## 2026-10-30 — Unify TEXT Documents With STORY Styling

- User explicitly requested STORY styling for TEXT individual documents as well as series screens. Both collections now use the same `StoryReader.astro`, parameterized by collection.
- Keep TEXT breadcrumb/category/search metadata and canonical URLs. TEXT uses material-section/item labels while STORY keeps PART/CHAPTER labels.
- Remove the now-unused TEXT-only reader/layout. Preserve the dedicated BLOG list/detail presentation; this decision does not reintroduce a generic reader for BLOG.
- This supersedes the TEXT-specific layout restoration portion of the preceding UI-preservation decision. Keep static CSS/markup regression checks aligned with the shared STORY document structure.

## 2026-10-30 — Preserve Collection UI During Data Refactors

- Folder/metadata simplification must preserve existing TEXT/STORY document and BLOG list/detail markup/CSS contracts. Use collection-specific templates over forcing every page through one generic reader.
- Share normalized data, assets, series behavior and helpers; do not restore retired Entity/ontology fields merely to support old views.
- Search and mobile menu CSS are global component/layout assets, independent of any optional menu page stylesheet. Closed overlays must have initial HTML `hidden`/`inert` plus synchronized `aria-hidden` and explicit CSS handling.
- Extend `check:built` with static UI markup/CSS regression checks. Passing these does not imply browser interaction or visual QA has been performed.

## 2026-10-31 — Brand

- Public brand is BORIDO (보리도); OL remains the source-code core name.
- `borido.org` is a future domain; keep the current production URL and deployment configuration until the domain migration is requested.

## 2026-10-30 — Refactor Implementation Policies

- The approved simplification below is implemented and pushed in f70b680; production deployment completion has not been verified.
- Public menu folders default to public; `_drafts`/templates/dotfolders and explicit `published: false` are excluded. Hidden introductions hide their series descendants.
- Keep a committed `content-registry.json` outside the authoring vault. It records stable URLs, first-publication preparation dates, source hashes, previous paths and work routes. Existing public addresses and date/rights exceptions are preserved.
- Match unchanged moved files by content hash. For simultaneous move+edit without an active watcher or duplicate-content ambiguity, use `npm run content:move -- old new` before preparation rather than pretending identity is inferable.
- Allow Korean author-facing names and optional `001.` prefixes; code filenames remain ASCII. Support numeric-only filenames with a body H1 title.
- Use category/work/section depth for TEXT; preserve STORY series/part shape. `index.md` is an optional introduction. First H1 is displayed once, and a manual body TOC is suppressed only in site rendering in favor of the automatic TOC.
- Use relative Markdown links and general assets under `public/generated/content/`. No retired DESIGN provider/env settings remain. Wikilinks and special Obsidian embeds are out of scope.
- DESIGN prose/assets and useful Entity explanations are migrated to ordinary TEXT documents; only meaningful legacy detail redirects remain. ATLAS source HTML is archived outside public output.
- Migration inventory: `.agents/references/content-migration-inventory.json`.

## 2026-10-30 — Approved Refactor Direction (Implemented; Upload Recorded Above)

- Use the existing `src/content/` as an Obsidian vault without Vault CMS, Front Matter, or Decap CMS for this refactor.
- Simplify public content to TEXT/STORY/BLOG; remove DESIGN/NET and Entity/Ontology systems after preserving needed assets and references.
- Derive TEXT category → work/series → material section/part → item from folders; translation and research have no required correspondence.
- Parse `001.Name` numeric prefixes for ordering and hide prefixes in display labels. Do not duplicate ordering in per-document metadata.
- Adapt the currently implemented STORY series layout and link/expand behavior to TEXT. Actual tab-panel switching was discussed historically but was not adopted and is excluded.
- Accept title/body-focused writing and remove unnecessary frontmatter with matching schema/consumer cleanup. Preserve existing rights, dates, unpublished states, and links during migration.
- Full guide and unresolved operating-policy choices: `.agents/references/obsidian-content-refactor-guide.md`. The direction is implemented; remaining limits are recorded in current-state.md.

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
