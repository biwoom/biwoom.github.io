# Work Log

This file records concise date-based work summaries for continuity across Codex sessions.

## 2026-06-12

### GitHub Pages Root Deployment

- Repository naming was changed to support the root GitHub Pages URL.
- Production URL confirmed as `https://biwoom.github.io/`.
- Astro configuration was updated so no `base` path is used.
- Sitemap and RSS paths were updated for root deployment.
- Live site was later confirmed working by the user.

### README Update

- Replaced the Astro starter README with OL HOME project documentation.
- Documented stack, site URL, repository role, content model, commands, GitHub Pages setup, and generated files.

### Public Manual Documents

- Updated `src/content/pages/brand.md`.
- Added `src/content/pages/content-management-manual.md`.
- Added footer link to the content management manual.
- Both public pages were verified by `npm run build`.

### Codex Project Rules And Skills

- Added `AGENTS.md` with OL HOME repository rules.
- Added repo-local skills:
  - `.agents/skills/ol-content-authoring/`
  - `.agents/skills/ol-doc-maintenance/`
  - `.agents/skills/ol-deploy-check/`
- Added `.codex/config.toml`.
- Added `.codex/rules/default.rules`.
- Skill validation passed for all three skills.
- Rules checks passed for:
  - `npm run build` → allow
  - `git push origin main` → prompt
  - `rm -rf dist` → forbidden

### Continuity Context

- Added `.agents/context/current-state.md`.
- Added `.agents/context/decisions.md`.
- Added `.agents/context/work-log.md`.
- Updated `AGENTS.md` so future major work should read and maintain these context files.

### GitHub Upload

- Pushed commit `067ec3a` (`Add Codex continuity context`) to `origin/main`.
- Remote: `https://github.com/biwoom/biwoom.github.io.git`.
- Local branch state after push: `main...origin/main`.
- GitHub CLI was not available locally, so Actions status could not be checked with `gh`.
- GitHub connector did not yet report a workflow run for `067ec3a` at the time of logging.
- This entry was added as the required post-upload continuity record.

## 2026-06-13

### TEXT Content Upload

- Added `src/content/text/body-mind-transformation/part/02-buddhist-worldview-two-perspectives.md`.
- Source copied from OL-CONTENTS:
  - `/Users/damjin/Projects/ol-project/github/ol-assets/ol-project-data/OL-CONTENTS/OL-SPECIAL/불교의 세계관-두 가지 관찰 방식/불교의 세계관 - 두 가지 관점에 근거한 나와 세계에 대한 이해 v0.2.md`
- Added the document to the `수행연구` TEXT series.
- Generated route verified locally:
  - `/text/body-mind-transformation/02-buddhist-worldview-two-perspectives/`
- Local validation: `npm run build` passed.
- Pushed commit `300c5c2` (`Add Buddhist worldview text entry`) to `origin/main`.
- GitHub Actions deployment run `27459008078` was queued immediately after push.

### GitHub Upload Workflow Rule Update

- Updated project rules so future GitHub upload requests complete the push first and record the result immediately.
- Deployment completion checks are no longer part of the default upload flow.
- GitHub Pages or Actions status should be checked only when the user explicitly asks for deployment verification.
- Added `$ol-github-upload-log` for this upload-and-log workflow.
- Pushed commit `1c5a667` (`Update GitHub upload workflow`) to `origin/main`.
- Deployment completion was not checked by design.

### Content Management Manual Internalization

- Moved `src/content/pages/content-management-manual.md` to `.agents/references/ol-home-content-management-manual.md`.
- Removed the public footer link to `/pages/content-management-manual/`.
- Updated AGENTS and OL HOME skills so Codex uses the internal reference path for content management rules.

### STORY Series Navigation

- Updated the STORY series page part list so each part can expand to show its internal document groups and document links.
- Document links now navigate directly to each STORY document from the central contents card.
- Local validation: `npm run build` passed.
- Pushed commit `9ba455e` (`Update internal docs and story navigation`) to `origin/main`.
- Deployment completion was not checked by design.

### Text Path Restructure Upload

- Pushed commit `f338635` (`Upload all current changes`) to `origin/main`.
- Included the internal manual update plus the current text path changes in `src/content/text/donam-kim-sung-chul/part1/` and `src/content/text/donam-kim-sung-chul/test/`.
- Local validation: `npm run build` passed before push.
- Deployment completion was not checked by design.

## Follow-ups

- Keep this file updated after meaningful work.
- After GitHub upload/deploy requests, record the final pushed commit or branch immediately after push.
- If deployment status is explicitly checked through GitHub Actions, add the run result here.

## 2026-06-20

### TEXT/STORY Entity Side Panel Variant Split

- Added explicit `variant` support to the shared Entity side-panel component so TEXT and STORY can carry different visual treatments.
- TEXT pages now pass `variant="text"` and STORY pages pass `variant="story"`.
- Updated `src/styles/pages/entity.css` to define variant-specific side-panel variables for compact TEXT and roomier STORY presentation.
- Local validation: `npm run build` passed.

### Typography Name Cleanup

- Renamed shared mono-centric label classes to semantic names:
  - `ol-mono-label` → `ol-meta-label`
  - `ol-kicker` → `ol-section-label`
- Renamed the shared inline badge helper to `.ol-meta-badge`.
- Removed the old code-only font token and moved shared UI typography to `--ol-font-ui`.
- Menu main/detail page styles and inline metadata now inherit the site sans stack directly for tags, badges, and helper text.
- Local validation: `npm run build` passed.

### Typography Unification

- Updated typography tokens so the shared UI stack now aliases to the site sans stack by default.
- Added a global typography reset so `button`, `input`, `select`, `textarea`, `optgroup`, and `summary` inherit the body font consistently.
- Updated shared base and search styles to keep UI metadata aligned with the body stack.
- Local validation: `npm run build` passed.

### Menu Hero Backgrounds Upload

- Pushed commit `a794c4a` (`Add menu hero background variants`) to `origin/main`.
- Scope uploaded:
  - shared hero background split between home and menu pages
  - menu hero background variants for `TEXT`, `STORY`, `DESIGN`, `NET`, `BLOG`, and `ENTITY`
  - supporting global hero background styles in `src/styles/base.css`
- Local validation: `npm run build` passed.
- Deployment completion was not checked by design.

### GitHub Upload Workflow Update

- Updated the GitHub upload workflow so the work-log entry is prepared before push and included with the code change in one commit when possible.
- Revised the upload skill and repository operating rules to avoid the previous pattern of pushing code first and then pushing a separate log-only commit.
- Updated the long-term decisions and current state notes to reflect the new ordering rule.
- Local validation: not run; documentation-only update.

### Design Hero Background Simplification Upload

- Prepared the work-log entry before push so the design hero change can travel with the record in the same commit.
- Scope uploaded:
  - simplified `ol-grid-bg--design` to a plain grid
  - kept the existing grid spacing
  - removed the extra divider and card-like overlay lines
- Local validation: `npm run build` passed.
- Deployment completion was not checked by design.

## 2026-06-18

### STORY, ENTITY, NET Planning Sync Upload

- Updated `docs/붓다스토리 기획안 v0.2.md`, `docs/NET 기획 v0.2.md`, `docs/NET 지도 SVG 구현 기획 v0.1.md`, and `docs/STORY 원전 재구성 규칙 v0.3.md` to align the planning docs with the current `part-1` Buddha Story structure and the current `src/content.config.ts` schema.
- Added new Person Entity docs:
  - `src/content/entities/persons/sumedha.md`
  - `src/content/entities/persons/sakka.md`
  - `src/content/entities/persons/vissukamma.md`
- Added new Place Entity docs:
  - `src/content/entities/places/amaravati.md`
  - `src/content/entities/places/himalaya.md`
  - `src/content/entities/places/dhammika-mountain.md`
- Updated `.agents/skills/ol-content-authoring/SKILL.md` with entity document creation rules and Buddha Story TOC guidance.
- Updated `src/content.config.ts` so Entity and STORY frontmatter can support the current NET-oriented reference fields.
- Local validation: `npm run build` passed.
- Pushed commit `2a45e1e` (`Update story, entity, and net documentation`) to `origin/main`.
- Deployment completion was not checked by design.

## 2026-06-13

### Buddha Story Test Cleanup Upload

- Updated `src/content/story/buddha-story/index.md` and the chapter files under `src/content/story/buddha-story/part-1/` and `src/content/story/buddha-story/part-2/`.
- Removed the old `src/content/text/donam-kim-sung-chul/` entry and its associated assets/files from the working tree.
- Local validation: `npm run build` passed.
- Pushed commit `67d7697` (`Update Buddha Story and text cleanup`) to `origin/main`.
- Deployment completion was not checked by design.

## 2026-06-14

### Mobile Prose Table Overflow Upload

- Updated `src/styles/components/prose.css` so `.ol-prose` tables can scroll horizontally on mobile without clipping TEXT or STORY body content.
- Local validation: `npm run build` passed before push.
- Pushed commit `511ff21` (`Fix mobile prose table overflow`) to `origin/main`.
- Deployment completion was not checked by design.

### Incremental Generated Asset Sync

- Updated `scripts/sync-content-assets.mjs` to incrementally sync DESIGN/STORY assets into `public/generated/`.
- The sync now copies changed files, leaves unchanged generated files in place, removes stale generated files, and prunes empty directories.
- Added a GitHub Actions cache for `public/generated/` so CI builds can restore prior generated assets before running the incremental sync.
- Updated `README.md`, `AGENTS.md`, and `.agents/references/ol-home-content-management-manual.md` to document the new behavior.
- Local validation:
  - `npm run sync:assets` twice reported unchanged assets without recopying.
  - `npm run build` passed.
- Pushed commit `782059e` (`Add incremental generated asset sync`) to `origin/main`.
- Deployment completion was not checked by design.

### README Brand And Content Direction Update

- Rewrote `README.md` to better reflect the OL brand definition, philosophy, product system, target audience, and design principles.
- Added planned Buddhist content directions for TEXT, STORY, DESIGN, and BLOG based on the current OL project roadmap.
- Kept repository operation details for stack, structure, commands, GitHub Pages, generated files, internal guidance, and licensing.

### Search Result Context Metadata

- Updated `OLSearchModal.astro` so Pagefind results show section, breadcrumb, title, route path, and excerpt instead of title/excerpt only.
- Added automatic Pagefind metadata output through `BaseLayout` and the TEXT/STORY/DESIGN/BLOG/ENTITY detail templates.

## 2026-06-26

### Refactoring And Pagination Blog Post

- Added `src/content/blog/ol-home-refactoring-and-pagination/index.md`.
- The post summarizes the June 25-26 OL HOME changes: content validation, shared helper modules, DESIGN asset config, shared tag-result UI, TEXT/STORY desktop TOC side stack, and unified load-more pagination across menu/list pages.
- Local validation:
  - `npm run check` passed.
  - `npm run build` passed and generated `/blog/ol-home-refactoring-and-pagination/index.html`.

### Unified Load-More Pagination Phase 1

- Added `src/lib/client/paginated-list.ts` as the shared client paginator for card-grid style menu pages.
- Updated `src/lib/client/content-filters.ts` so shared TEXT/STORY prefix filters and the DESIGN index filter use the shared paginator instead of local visible-count logic.
- Updated `src/pages/blog/index.astro` to use the shared paginator and to apply its initial filtered render on page load.
- Updated `src/pages/net/explore.astro` to use the shared paginator, keep result counts in sync, and reveal deep-linked focused cards even when they start beyond the first page.
- Updated `src/pages/text/index.astro` to add the same load-more structure used by the other menu pages.
- Updated `src/pages/story/index.astro` card markup so the shared prefix filter starts from the same hidden-after-page-size baseline as TEXT and DESIGN.
- DESIGN index pagination now runs through the shared paginator path already exposed by `initDesignIndexFilters()`.
- Local validation: `npm run build` passed, including `npm run check:content`, asset sync, Astro build, and Pagefind indexing.

## 2026-06-21

### Indramang Design Reference Assets

- Registered five reference-style DESIGN entries under `src/content/design/`:
  - `bodhi-tree-indramang`
  - `diversity-indramang`
  - `life-peace-indramang`
  - `pictograph-indramang-1`
  - `pictograph-indramang-2`
- Each entry uses `primaryKind: reference` and `type: artifact` with the original PNG copied into the matching `assets/` folder.
- The new assets are sourced from `docs/ref/` and are intended as transparent PNG reference images rather than explanatory infographics.
- Search metadata is derived from existing frontmatter and page context, so content authors do not need to write Pagefind-specific fields.
- Added `data-pagefind-ignore` to the search modal overlay so command-palette UI text is not indexed as page content.
- Local validation: `npm run build` passed and generated HTML includes Pagefind metadata for TEXT, STORY, DESIGN, BLOG, and ENTITY sample pages.
- Pushed commit `08c06ce` (`Improve README and search result context`) to `origin/main`.
- Deployment completion was not checked by design.

### DESIGN Prefix Tag Panel

- Updated the DESIGN main page sidebar so the tag section now uses a NET-style prefix tag panel instead of a flat tag cloud.
- The DESIGN filter sidebar now groups `tags` by prefix, keeps the `kind` filter separate, and supports prefix-aware filtering and URL state.
- Local validation: `npm run build` passed.

### DESIGN Tag Field Migration

- Migrated DESIGN content from the separate `prefixTags` field to prefix-form strings inside the existing `tags` array.
- Updated the DESIGN collection schema and sidebar/detail filtering to read prefix-form `tags` directly.
- Refreshed all DESIGN entries so their tags now follow `prefix/value` formatting and the old `prefixTags` frontmatter is removed.
- Local validation: `npm run build` passed.

### DESIGN Prefix Panel Default State

- Changed the DESIGN prefix tag panel so each group starts collapsed by default.
- Kept the NET-style disclosure structure and filtering behavior unchanged.
- Local validation: `npm run build` passed.

### DESIGN Korean Prefix Labels

- Updated DESIGN content tags so prefix names use Korean labels such as `종류`, `주제`, `형식`, `수준`, `용도`, `프로젝트`, and `인물`.
- Updated the DESIGN sidebar labels to match the Korean prefix vocabulary.
- Local validation: `npm run build` passed.

### Indramang Design Blog Post

- Added a public BLOG post about the five DESIGN assets derived from the 실상사 생명평화 문양 lineage.
- The post explains the relationship between the base 생명평화문양, the 보리수/인드라망 variations, the 다양성 motif, and the two 픽토그래프 variants inspired by oracle-bone-script-like form language.
- Local validation: `npm run build` passed.

### Blog Thumbnail Frontmatter

- Added `thumbnailAsset` to the BLOG collection schema so list cards can read an explicit thumbnail path from frontmatter.
- Updated the blog index to prefer `thumbnailAsset` and keep the existing relative-body-image fallback for older posts.
- Set `thumbnailAsset: "thumb.jpg"` on `src/content/blog/indramang-life-peace-patterns/index.md` so the new post appears with its thumbnail in the blog list.
- Local validation: `npm run build` passed.

### Search Index Scope Cleanup

- Added `pagefindBody` control to `BaseLayout` so route templates can opt out of Pagefind body indexing.
- Excluded top-level landing/listing/utility pages from search: `/`, `/text/`, `/story/`, `/design/`, `/blog/`, `/entity/`, `/atlas/`, `/ai/`, `/partners/`, and `/404.html`.
- Kept TEXT/STORY series pages and content detail pages searchable.
- Local validation: `npm run build` passed; Pagefind indexed page count dropped from 41 to 31.

### Search Result Filter Tabs

- Added section filter tabs to the search result panel.
- Tabs are generated from Pagefind result metadata and show counts for `전체`, `TEXT`, `STORY`, `DESIGN`, `BLOG`, `ENTITY`, and any future unknown section.
- Increased the client-side result pool to 24 so section filtering has enough results to work with.
- Local validation: `npm run build` passed and generated assets include the filter tab markup/script.

### Search And Design Content Upload

- Pushed commit `2a90224` (`Improve search filters and design content`) to `origin/main`.
- Included search index scope cleanup, search result filter tabs, DESIGN HTML text alignment for `two-perspectives`, and current DESIGN HTML cleanup changes.
- Confirmed the temporary `license-line` addition request was abandoned and no `license-line` text remains in DESIGN source or generated HTML.
- Local validation: `npm run build` passed before push.
- Deployment completion was not checked by design.

### STORY Series Metadata Schema Upload

- Pushed commit `8b2080c` (`Align story series metadata schema`) to `origin/main`.
- Updated STORY collection handling so series `index.md` can use `kind: series` metadata without document-only fields such as `part`, `group`, `chapter`, `order`, `publishedAt`, and `htmlAsset`.
- Updated STORY hierarchy, listing/detail pages, home counters, and the content management manual to separate series metadata entries from document entries.
- Included the current Buddha Story chapter filename/order cleanup under `src/content/story/buddha-story/part-1/`.
- Local validation: `npm run build` passed before push.
- Deployment completion was not checked by design.

### STORY htmlAsset Removal Upload

- Pushed commit `8a80619` (`Remove unused story htmlAsset`) to `origin/main`.
- Removed the unused STORY-only `htmlAsset` field from the content schema, STORY frontmatter, and dormant STORY page code.
- Removed the unused `storyAsset()` helper and updated the internal content management manual to reflect the new STORY rule set.
- Local validation: `npm run build` passed before push.
- Deployment completion was not checked by design.

### Docs Planning Update Upload

- Pushed commit `c2124bb` (`Update docs for NET and story planning`) to `origin/main`.
- Updated the 붓다스토리, NET, and STORY rules documents to reflect the current decisions: no public source-narrative release, no `memoryPhrase`, NET as a separate search/filter/map menu, and ENTITY kept as the existing detail-document system.
- Added a new NET map SVG implementation planning document under `docs/`.
- Included the reference images and the table-of-contents note files under `docs/` as part of the planning package.
- Local validation: not run; this was a documentation-only update.
- Deployment completion was not checked by design.

### NET Planning v0.3.1 Upload

- Pushed commit `591e9c2` (`docs: update NET planning references`) to `origin/main`.
- Replaced `docs/NET 기획 v0.2.md` with `docs/NET 기획 v0.3.1.md`.
- Added NET Explorer reference files under `docs/net-explorer/`:
  - `net-explorer-reference.png`
  - `ol-atlas_v0.0.8.html`
  - `빛구슬연결망_v9.html`
- Updated the NET plan with the entry-page hero/search design, latest Entity card list, prefix tag filter behavior, reference search-page layout, and second-phase relationship graph guidance.
- Local validation: not run; this was a documentation-only update.
- Deployment completion was not checked by design.

### NET Implementation Roadmap Upload

- Pushed commit `4b1213f` (`docs: add NET implementation roadmap`) to `origin/main`.
- Added `docs/NET 구현 로드맵 v0.1.md`.
- The roadmap defines stepwise NET implementation from a minimal `/net` entry page through filters, search, detail panel, related content, concept schema expansion, relationship graph, and future map tab.
- Local validation: not run; this was a documentation-only update.
- Deployment completion was not checked by design.

## 2026-06-19

### NET And Entity UX Upload

- Pushed commit `4f4a56b` (`Update NET and entity UX`) to `origin/main`.
- Scope uploaded:
  - NET main and explore page UX updates
  - entity detail mobile layout and breadcrumb updates
  - NET page styles split into `src/styles/pages/net.css`
  - entity page responsive styles in `src/styles/pages/entity.css`
  - `OLEntityCard`, `OLEntityPanel`, and `EntityLayout` updates
  - docs cleanup including the NET roadmap and NET SVG plan deletion
- Local validation: `npm run build` passed before push.
- Deployment completion was not checked by design.

### NET Entry Page Phase 1 Upload

- Pushed commit `17c15b3` (`feat: add NET entry page`) to `origin/main`.

## 2026-06-20

### NET, TEXT, STORY Name-Card Integration

- Unified TEXT and STORY document-level Entity links to `entities: string[]`.
- Added shared right-side Entity name-card panel behavior for TEXT and STORY detail pages:
  - list mode
  - inline detail mode
  - back-to-list action
  - compact switching between remaining cards
- Added Concept Entity test cards:
  - `five-aggregates`
  - `twelve-sense-bases`
- Connected those two cards to:
  - `/text/body-mind-transformation/02-buddhist-worldview-two-perspectives/`
- Fixed Entity detail relation and backlink links so they use typed Entity routes and display card titles instead of raw ids.
- Adjusted STORY mobile responsive behavior after the new 3-column desktop layout introduced a specificity conflict.
- Adjusted Entity detail mobile layout so the breadcrumb appears first and the side detail card moves above the article body.
- Updated the NET explore center reset button to a stronger emphasized style.
- Local validation: `npm run build` passed after the implementation changes.

### Blog Post For This Development Slice

- Added a public blog entry summarizing the first NET implementation slice and the shared name-card work across NET, TEXT, STORY, and ENTITY.
- Added the first minimal `/net` route as the NET menu entry page.
- Added `NET` to the main header navigation.
- The page currently provides a hero section, Entity-only search form shell, Entity type count chips, and a latest Entity card list using the existing Entity card component.
- Local validation: `npm run build` passed and generated `/net/index.html`.
- Deployment completion was not checked by design.

### NET Explorer Filters Upload

- Pushed commit `fe6d91a` (`Implement NET explorer filters`) to `origin/main`.
- Added `/net/explore` as the NET search result and exploration page with left filters, center Entity card results, and right detail-panel placeholder.
- Connected `/net` hero search and type chips to `/net/explore`.
- Added type filters, prefix tag dropdown filters, URL query synchronization, result counts, empty-state handling, and filter reset controls in both the result toolbar and sidebar.
- Adjusted Entity card display so cards render as full block cards inside the NET explorer grid.
- Updated initial NET roadmap notes and clarified selected place tag labels for prefix filtering.
- Local validation: `npm run build` passed before push.
- Deployment completion was not checked by design.

### NET Hero Copy Tweak Upload

- Pushed commit `1abe4ba` (`Tweak NET hero copy`) to `origin/main`.
- Refined the `/net` hero headline and lead copy to better fit the new NET exploratory framing.
- Local validation: `npm run build` passed before push.
- Deployment completion was not checked by design.

### NET Profile Image And Mobile Detail Panel Upload

- Pushed commit `6f6adae` (`MAKE:profile image`) to `origin/main`.
- Added Sumitta profile image source/reference assets and a new `sumitta-profile` DESIGN entry.
- Added `sumitta` as an Entity person entry and connected profile-image data into Entity/NET UI surfaces.
- Updated `OLEntityPanel`, NET explore detail data, home product/stat components, footer navigation, design helper handling, and Entity/NET styles for profile-image display.
- Pushed commit `9d08cae` (`net모바일 상세패널 모달 닫기버튼 숨김처리`) to `origin/main`.
- Adjusted the NET explore mobile detail-panel modal close-button treatment.
- Local validation: not recorded at push time; `npm run build` later passed on 2026-06-20 while reviewing current NET state.
- Deployment completion was not checked by design.

## 2026-06-20

### NET Current State Review And Log Backfill

- Reviewed current project state, OL brand identity, and `docs/NET 구현 로드맵 v0.1.md`.
- Confirmed current NET implementation status against the roadmap:
  - `/net` entry page, `/net/explore`, type filters, prefix tag filters, client search, detail panel, profile image display, mobile detail modal behavior, and related STORY/TEXT/DESIGN/name-card output are implemented.
  - Concept Entity schema expansion, relationship graph, map-tab placeholder, and SVG map connection remain future roadmap work.
- Confirmed current Entity counts: 6 persons, 4 places, 2 concepts.
- Local validation: `npm run build` passed and generated `/net/index.html`, `/net/explore/index.html`, and current Entity detail pages.
- Deployment completion was not checked by design.

### TEXT/STORY Entity Side Panel

- Unified TEXT and STORY document Entity references on the shared `entities` frontmatter field.
- Migrated current Buddha Story documents from `primaryEntities` / `primaryPlaces` to `entities`.
- Added Concept Entity documents:
  - `five-aggregates`
  - `twelve-sense-bases`
- Connected those two Concept Entities to `src/content/text/body-mind-transformation/part/02-buddhist-worldview-two-perspectives.md`.
- Added a reusable `OLEntitySidePanel` for document-side name-card lists and in-panel detail switching.
- Applied the Entity side panel to TEXT and STORY detail pages.
- Updated internal content authoring guidance and the content management manual for the new `entities` rule.
- Local validation: `npm run build` passed and generated the new concept detail routes plus updated TEXT/STORY detail pages.
- Browser verification: in-app Browser was unavailable in this session; static HTML inspection confirmed side-panel markup, back control, alternate-card controls, and client script presence in the built TEXT/STORY pages.

### Entity Detail Relation Link Fix

- Fixed Entity detail relation/backlink links so they resolve to typed Entity routes such as `/entity/concepts/dependent-origination/` instead of missing `/entity/{id}` routes.
- Updated relation/backlink display text to use Entity Korean names and type labels instead of raw ids.
- Restyled relation/backlink lists to match the compact name-card/detail-panel direction used in NET.
- Fixed STORY detail mobile layout override so the new 3-column desktop reader collapses back to one column on mobile.
- Local validation: `npm run build` passed.

### NET, Entity, And Blog Upload

- Pushed commit `04e383a` (`Implement NET name-card integration`) to `origin/main`.
- Uploaded scope:
  - TEXT/STORY shared `entities` schema alignment
  - `OLEntitySidePanel` and TEXT/STORY right-side name-card panel integration
  - new Concept Entity entries for `five-aggregates` and `twelve-sense-bases`
  - Entity detail relation/backlink route and display-text fixes
  - mobile adjustments for STORY and Entity detail layouts
  - NET explore center reset-button emphasis style
  - public blog post `/blog/net-menu-name-card-phase1/`
- Local validation: `npm run build` passed before push.
- Deployment completion was not checked by design.

### Documentation And Skill Alignment

- Reviewed public and internal documentation against the current live site structure.
- Updated `.agents/context/current-state.md` so it reflects:
  - `NET` as a first-class public menu
  - the current public header structure
  - `src/content/pages/` as public permanent documents rather than internal manuals
- Updated `.agents/context/decisions.md` to remove the stale public `/pages/content-management-manual/` route reference.
- Updated `.agents/references/ol-home-content-management-manual.md` to:
  - reflect the current homepage menu structure
  - document the TEXT/STORY right-side Entity name-card panel rule
  - add an ENTITY/NET operating section
  - restate the current `pages` vs `.agents/references/` split
- Updated `src/content/pages/brand.md` so the current product system includes `OL NET` and the current homepage/menu structure.
- Updated skill docs:
  - `.agents/skills/ol-doc-maintenance/SKILL.md`
  - `.agents/skills/ol-content-authoring/SKILL.md`
- Local validation: `npm run build` passed.

### Menu Hero Backgrounds Phase 1

- Added a shared multi-layer hero background system on top of the existing `.ol-grid-bg` base.
- Applied menu-specific hero background variants to the top-level public menu pages:
  - `TEXT`
  - `STORY`
  - `DESIGN`
  - `NET`
  - `BLOG`
  - `ENTITY`
- Each variant keeps the OL monochrome grid language but changes the structural motif:
  - TEXT: manuscript and annotation lines
  - STORY: path and node flow
  - DESIGN: frame and layout guides
  - NET: connection lines and nodes
  - BLOG: timeline and log columns
  - ENTITY: index columns and card-like slots
- Local validation: `npm run build` passed.
- Browser verification: attempted, but the in-app Browser `iab` target was unavailable in this session.

### Menu Hero Background Refinement

- Refined the menu-specific hero backgrounds to reduce visual similarity between sections.
- Updated `BLOG` to use a full-width crossing X-line structure.
- Updated `NET` with a sparse grid plus a denser field of small dots and concentric rings.
- Updated `DESIGN` so the grid motif is constrained behind the central hero text instead of filling the whole hero.
- Updated `ENTITY` with a denser full-background field of varied dot and concentric-ring sizes.
- Local validation: `npm run build` passed.

### Hero Background Flicker Fix

- Split the shared `.ol-grid-bg` base into a structural wrapper and a `--home` variant so menu pages no longer inherit the home grid during navigation.
- Moved the home hero grid background into `.ol-grid-bg--home`.
- This removes the brief grid flash seen while switching between menu pages and their custom hero backgrounds.
- Local validation: `npm run build` passed.

### DESIGN Detail Related Context Panel

- Added a related-context panel to DESIGN detail metadata pages.
- The panel reuses existing DESIGN `entities` and `relatedWorks` data to show:
  - related Entity name-card links
  - related STORY document title links
  - related TEXT document title links
- TEXT/STORY links are intentionally limited to explicit DESIGN `relatedWorks` entries so shared Entity name-cards do not create overly broad document links.
- Connected `two-perspectives` to the current Concept Entity cards:
  - `five-aggregates`
  - `twelve-sense-bases`
  - `dependent-origination`
- Added an explicit `relatedWorks` link from `two-perspectives` to the corresponding TEXT document.
- Local validation: `npm run build` passed and generated the updated `/design/two-perspectives/` related panel.

### Mobile TEXT/STORY Entity Sheet

- Updated the shared `OLEntitySidePanel` so TEXT and STORY document name-cards use a mobile floating action button and bottom sheet instead of appearing at the bottom of the article flow.
- Desktop behavior remains the existing right-side sticky panel.
- At mobile/tablet reader widths, the floating button shows a name-card icon and count badge, opens the sheet with the existing list/detail switching UI, locks background scroll, and supports backdrop, close button, and Escape close behavior.
- Local validation: `npm run build` passed.
- Static verification confirmed the generated TEXT and STORY detail pages include the floating trigger, sheet, backdrop, and client script.
- Browser interaction verification was not run because the local project does not include Playwright.

### NET Mobile Hero Simplification

- Simplified the mobile `/net` main hero so the search form no longer dominates the first viewport.
- Added a single mobile hero CTA, `이름카드 탐색하기`, that links to `/net/explore`.
- Moved the Entity type chips out of the hero and into the start of the featured Entity section.
- Reduced the mobile emphasis of the lower `탐색 페이지 열기` link so it no longer competes with the hero CTA.
- Desktop NET main search behavior remains unchanged.
- Local validation: `npm run build` passed and generated `/net/index.html`.

### GitHub Upload Prep

- Preparing an upload for the current NET, DESIGN, and TEXT/STORY mobile UX changes.
- Upload scope includes:
  - mobile TEXT/STORY name-card sheet
  - DESIGN detail related-context panel
  - mobile NET hero simplification
- Local validation: `npm run build` passed.
- Pushed commits: `71738a4` (`Improve mobile NET and entity UX`), `3636f48` (`Record mobile UX upload`), `8ef9d33` (`Refine upload log`)
- Remote branch: `origin/main`

### GitHub Upload Workflow Reversion And Push Rule Update

- Restored the OL HOME GitHub upload workflow to the previous ordering:
  - push the requested code/content/documentation change first
  - update `.agents/context/work-log.md` with the pushed result afterward
  - push the work-log update as a follow-up commit
- Added a Codex rule allowing the default OL HOME upload command, `git push origin main`.
- Kept non-default GitHub push targets behind confirmation.
- Updated `AGENTS.md`, `$ol-github-upload-log`, `current-state.md`, and `decisions.md` to match the restored workflow and push policy.
- Local validation: not run; this change only updates internal agent rules and context documents.

### GitHub Upload Log Follow-Up

- Pushed commit `2ef85df` (`Update upload workflow rules`) to `origin/main`.
- Uploaded scope:
  - `AGENTS.md`
  - `.agents/context/current-state.md`
  - `.agents/context/decisions.md`
  - `.agents/skills/ol-github-upload-log/SKILL.md`
  - `.codex/rules/default.rules`
- This work-log entry is the follow-up record after the main push.

### Schema Alignment And DESIGN Download Naming

- Aligned active code and planning docs with the current TEXT/STORY linking rule: document-level links now consistently refer to `entities`, not legacy STORY/TEXT fields such as `primaryEntities`, `primaryPlaces`, or `primary_entity`.
- Updated the placeholder STORY series frontmatter to match the current `kind: series` pattern and removed document-only metadata from that series index.
- Synced the fallback nav definition with the live public header menu by replacing legacy `ATLAS`/`AI` items with `NET`.
- Updated README, the public brand definition, and the active STORY/NET/Buddha Story planning docs so current public menu wording and NET/ENTITY roles match the live site.
- Updated DESIGN detail downloads so PDF and image assets use `{title}-v{version}{ext}` as the browser download filename.
- Local validation: `npm run build` passed.

### GitHub Upload Skill Branch Check Update

- Pushed commit `55cb72b` (`Clarify upload branch checks`) to `origin/main`.
- Updated `$ol-github-upload-log` so the upload workflow explicitly checks the current branch and upstream sync state before staging and pushing.
- Added the stop-and-resolve rule for cases where local `main` is behind or diverged from `origin/main`.
- Local validation: not run; this was a documentation-only skill update.
- Deployment completion was not checked by design.
- Upload note: direct `git push origin main` was blocked by the active command approval policy, so the upload was paused, the cause was identified, and the same file update was applied through the connected GitHub API. Local `main` was then rebased onto `origin/main`; the duplicate local commit was skipped because the patch was already present remotely.

### GitHub Upload Workflow Decoupling

- Cleaned the local Git state by fast-forwarding `main` to `origin/main` after confirming the local work-log change duplicated remote commit `b165aac`.
- Updated the GitHub upload workflow so upload requests perform only the requested push.
- Removed automatic `.agents/context/work-log.md` updates, follow-up log commits, follow-up pushes, and deployment checks from the default upload path.
- Kept work-log maintenance as a separate documentation/repository-management action when explicitly useful or requested.
- Local validation: not run; this was an internal workflow documentation update.

## 2026-06-25

### Tag And Validation Consistency Refactor

- Removed `prefixTags` from the active `blog`, `text`, and `story` schemas in `src/content.config.ts`.
- Migrated active BLOG frontmatter and the Buddha Story series metadata so management tags now live inside slash-form `tags`.
- Updated older flat entity tags that were still live content to slash-form tags.
- Added `scripts/check-content.mjs` to block deprecated fields, non-slash tags, missing asset files, missing minimum published metadata, and `.DS_Store`.
- Added `npm run check`, made `npm run build` depend on the validator, and updated `.github/workflows/deploy.yml` so CI runs the same check before build.
- Updated README, the internal content management manual, the OL content-authoring skill, selected planning docs, and older operational blog posts to match the current tag and asset rules.
- Removed repository `.DS_Store` files from the working tree.
- Local validation:
  - `npm run check` passed.
  - `npm run build` passed.
  - Generated route verification confirmed representative outputs for:
    - `/blog/net-menu-name-card-phase1/`
  - `/text/body-mind-transformation/01-six-steps/`
  - `/story/buddha-story/part-1/01-sumedha-begins-to-ask/`
  - `/design/two-perspectives/`

### Phase 2 Shared Helper Extraction

- Added `src/lib/content-structure.ts` so TEXT/STORY slug generation, grouped-map assembly, and Korean-aware ordering no longer duplicate the same helper logic.
- Added `src/lib/assets.ts` so generated-asset URLs, versioned download filenames, and BLOG thumbnail discovery now use one shared implementation.
- Added `src/lib/client/content-filters.ts` so:
  - the shared prefix-filter component
  - the DESIGN library filter
  - the TEXT/STORY series tag-index interactions
  all reuse one client-side behavior layer instead of separate inline scripts.
- Refactored `src/pages/design/index.astro`, `src/pages/design/[slug].astro`, `src/pages/blog/index.astro`, `src/lib/text.ts`, `src/lib/story.ts`, `src/components/common/OLPrefixTagFilters.astro`, `src/pages/text/[series]/index.astro`, and `src/pages/story/[series]/index.astro` to consume the shared helpers.
- Local validation:
  - `npm run check` passed.
  - `npm run build` passed.

### Phase 3 Style Layer And Font Loading Start

- Moved repeated static inline presentation from the active TEXT/STORY/DESIGN/BLOG pages into the existing CSS layer:
  - shared layout helpers in `src/styles/base.css`
  - BLOG detail/list styling in `src/styles/pages/blog.css`
  - DESIGN empty-state/detail helpers in `src/styles/pages/design.css`
  - STORY library card and empty-state helpers in `src/styles/pages/story-base.css`
- Updated the affected Astro pages so repeated hero padding, section dividers, page headings, card metadata, empty states, and detail-page framing now resolve through CSS classes instead of page-local inline style blocks.
- Added `--ol-font-mono` and switched code-like elements to that token.
- Simplified external font loading in `src/layouts/BaseLayout.astro` by removing Google Fonts requests and keeping only the Pretendard stylesheet plus fallback font stacks.
- Local validation:
  - `npm run check` passed.
  - `npm run build` passed.

### Post-Phase Refactor Audit And Hardening

- Reviewed the completed refactor against `docs/프로젝트 코드 리팩터링 로드맵 v0.1.md` and implemented the six recommended hardening items.
- Added provider-aware DESIGN asset resolution:
  - `getDesignAssetUrl(entryId, asset)` for DESIGN pages
  - `getDesignAssetKeyUrl(assetKey)` for cross-collection references such as Entity profile images
  - `PUBLIC_DESIGN_ASSET_BASE_URL` support for external DESIGN storage
- Added `DESIGN_ASSET_PROVIDER=external` support to skip local DESIGN asset sync when assets are served externally.
- Added optional `DESIGN_ASSET_MANIFEST` support to `scripts/check-content.mjs` so external DESIGN asset keys can be validated from a manifest.
- Added `scripts/check-content-fixtures.mjs` and wired it into `npm run check` to lock validator success and failure scenarios.
- Added a Markdown remark plugin that rewrites legacy `/generated/design/...` image/link URLs to `PUBLIC_DESIGN_ASSET_BASE_URL` when external DESIGN storage is configured.
- Removed Google Fonts requests from current DESIGN HTML assets and kept local/fallback font stacks.
- Moved active Astro page and shared component inline styles into CSS classes; remaining inline style search results are standalone DESIGN HTML artifact internals.
- Updated the content management manual, roadmap completion audit, selected planning docs, and context decisions to reflect the current asset and style policies.
- Migrated the live `sumitta` Entity profile image reference from a generated URL to `design.imageAsset: "sumitta-profile/profile.jpg"`.
- Local validation:
  - `npm run check` passed.
  - `npm run build` passed.

### Markdown DESIGN Link Migration

- Added provider-neutral Markdown DESIGN asset support in `scripts/remark-design-asset-urls.mjs` using the `design-asset:{slug}/{asset}` form.
- Migrated the live BLOG entry `indramang-life-peace-patterns` away from hard-coded `/generated/design/...` image URLs to `design-asset:` links.
- Updated the related BLOG note about DESIGN asset generation so it explains provider-aware resolver behavior instead of implying public paths are hard-coded.
- Updated the internal content manual and context decisions so new Markdown DESIGN images use `design-asset:` by default.
- Local validation:
  - `npm run check` passed.
  - `npm run build` passed.

### Central Site Config Layer

- Added root `site-config.mjs` to centralize the fixed site URL and env-backed DESIGN asset settings.
- Added `src/lib/site-config.ts` as the app-facing config module so Astro code no longer reads DESIGN asset env vars ad hoc.
- Updated `astro.config.mjs`, `src/lib/assets.ts`, `src/layouts/BaseLayout.astro`, `scripts/remark-design-asset-urls.mjs`, `scripts/sync-content-assets.mjs`, and `scripts/check-content.mjs` to consume the shared config layer.
- Added `.env.example` to document supported DESIGN asset env vars while keeping the production site URL code-managed.
- Local validation:
  - `npm run check` passed.
  - `npm run build` passed.

## 2026-06-26

### Documentation And Skill Sync Follow-up

- Updated `.agents/skills/ol-content-authoring/SKILL.md` so content tasks now explicitly follow the current DESIGN asset rules:
  - provider-neutral frontmatter asset values
  - `design-asset:{slug}/{asset}` for new Markdown references
  - centralized config through `site-config.mjs` and `src/lib/site-config.ts`
  - external provider validation through `DESIGN_ASSET_MANIFEST`
- Updated `.agents/skills/ol-doc-maintenance/SKILL.md` so documentation tasks now reflect the centralized config layer, `.env.example` policy, and provider-neutral DESIGN asset documentation rules.
- Updated `README.md` to match the live repository structure and operating model:
  - new top-level config and script files
  - centralized configuration and env policy
  - provider-aware DESIGN asset handling
  - shared TEXT/STORY tag-results modal layer
- Updated `AGENTS.md` so repo-wide instructions now include the centralized config rule, tags-only policy, provider-neutral DESIGN asset authoring, and shared TEXT/STORY tag-results behavior.
- Local validation:
  - `npm run build` passed.

### TEXT And STORY Desktop TOC Consolidation

- Moved the desktop `On this page` TOC for TEXT documents out of the top document toolbar and into a right-side sticky utility stack above the Entity side-panel.
- Applied the same desktop TOC structure to STORY documents so TEXT and STORY now share the same right-side utility layout pattern.
- Kept the existing mobile TOC dropdown behavior for both TEXT and STORY; the TOC relocation is desktop-only.
- Updated the TEXT and STORY TOC rendering scripts so desktop and mobile TOC lists are populated from the same heading scan.
- Added collapsed-by-default desktop TOC triggers with visible heading counts.
- Added scroll-spy behavior for desktop and mobile TOC links so the active `h2`/`h3` section is highlighted while scrolling.
- Removed leftover STORY-specific TOC card overrides so STORY now follows the same shared TOC card spacing and padding pattern as TEXT.
- Adjusted the STORY right-side sticky utility stack to offset below the sticky part navigation, preventing the desktop TOC from being covered while scrolling.
- Local validation:
  - `npm run build` passed.

### Brand Definition Update

- Updated `src/content/pages/brand.md` to version `v1.4` with the latest update date `2026-06-26`.
- Rewrote the typography note so it matches the current implementation: Pretendard as the external default font with `Noto Sans KR` and `Inter` in the fallback stack.
- Reordered the `수정 변경사항` section into latest-first order.
- Added the recent public-facing document and reading-surface changes that affect the brand document:
  - the shared `HOME / TEXT / STORY / DESIGN / NET (+ BLOG)` operating structure remains current
  - desktop TEXT/STORY reading surfaces now use a right-side `On this page` plus Entity information pattern
  - desktop TOC behavior now defaults to collapsed state with heading counts and scroll-spy highlighting
- Local validation:
  - `npm run build` passed.
