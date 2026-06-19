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
- Search metadata is derived from existing frontmatter and page context, so content authors do not need to write Pagefind-specific fields.
- Added `data-pagefind-ignore` to the search modal overlay so command-palette UI text is not indexed as page content.
- Local validation: `npm run build` passed and generated HTML includes Pagefind metadata for TEXT, STORY, DESIGN, BLOG, and ENTITY sample pages.
- Pushed commit `08c06ce` (`Improve README and search result context`) to `origin/main`.
- Deployment completion was not checked by design.

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
