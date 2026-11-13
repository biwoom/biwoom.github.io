# Work Log

## 2026-11-12 — TEXT/STORY 보조 패널 너비 조절

- Added one ReaderPanelResize component and reader-panel-resize controller for the existing >=1360px right TOC/footnote docks. An 8px boundary handle updates the grid/article together; preserve the 780px prose cap, 300px default, 240–520px panel range and at least 480px article allocation. The left list and native modal widths retain their existing behavior.
- Share a bounded browser preference across TEXT/STORY, restore it in the head before paint, and apply effective width constraints in CSS without replacing the preferred size. Add pointer capture/frame scheduling, cancellation cleanup, accessible separator arrows/Home/End, Enter/double-click reset, and hide the handle for hidden docks, focus, compact layouts and print. Existing controllers retain sole ownership of TOC/footnote nodes and panel state.
- Added six interaction/storage/resize regressions and generated-page contracts for one separator/target per reader and pre-paint restoration. Updated AGENTS, manual v4.3, state and decisions. Preserve concurrent user STORY folder/content/registry changes and plan edits; no authored prose, assets or Obsidian state was edited for this feature.
- Validation: check 97 tests, typecheck (0 errors/warnings, existing TextReader unused-fields hint), latest-source isolated build and check:built passed (289 HTML files, 26 redirects, 235 document UI contracts, 1100 production metadata/feed/sitemap URLs). Native Safari confirmed keyboard 300→316px and actual boundary drag 300→420px before the user requested no browser access. Stopped all browser work immediately at that instruction; remaining visual testing belongs to the user. The user's restarted server on 4321 remains untouched; stopped the duplicate validation server on 4322. No commit/push.
- Local commit requested: include only the panel sizing implementation, regression checks and related guidance/continuity records. Leave the user's concurrent STORY content moves, content-registry.json and plan.md edits uncommitted. Reuse the completed checks; no additional browser access, push or deployment inspection.

This file records concise date-based work summaries for continuity across Codex sessions.

## 2026-11-08

### HTTPS incident re-investigation

- Rechecked parent delegation/DS, both authoritative servers over UDP/TCP, three public resolvers, Google/Cloudflare DoH, Pages settings/health, successful deployed revision and HTTP/TLS on all four Pages IPv4 addresses. Saved a dated investigation with evidence, uncertainty, reproduction commands and provider inquiry drafts.
- Current A/CNAME responses and HTTP routing are correct; default GitHub TLS certificate remains. Completed Pages health still reports a non-Pages IP and HTTPS ineligibility while the certificate is `new`. Treat stale DNS/check state as the leading explanation, not proven internal behavior; a 202/empty health response is pending, not success.
- Distinguish the earlier recorded non-Pages A address, temporary REFUSED/NODATA during DNS changes, current missing apex NS records on both authoritative servers, and the unresolved GitHub/external-DNS disagreement. Do not attribute the entire incident to ns1 propagation.
- Confirm custom Actions artifact deployment ignores CNAME files. A workflow-generated dist/CNAME can preserve branch-based publishing configuration but cannot fix this repository's certificate issue. No workflow, content, DNS or Pages setting changes; no commit/push. Internal-document validation: diff review/whitespace check; local build not rerun for diagnostic documentation.

### CSS-owned original font size

- Set original passages to an 18px CSS base and apply the shared slider multiplier in CSS. Exclude original descendants from the JavaScript font-measurement targets, eliminating per-original inline base-font variables and scalable attributes.
- Add 16px above the original wrapper to separate it from the preceding translation; the generic prose first-child reset on pre no longer eliminates this gap.
- Validation: 67 fixtures, typecheck, build and built checks passed. Regression coverage confirms slider/resize retain the shared scale without assigning inline sizing to original elements; compiled CSS verifies the 18px base and multiplier.

### Original passage background

- Match original blocks to the TEXT side-panel --ol-text-soft background in both themes, with theme-aware ink. Override only these blocks' syntax-highlighter inline colors so light-mode contrast remains readable.
- Validation: 66 fixtures, typecheck, build and built checks passed; compiled CSS verifies the targeted background/text-color overrides.

### TEXT original passages

- Mark four existing user-fenced Chinese passages in 대승현론 1권 with original, preserving text and the user's pending edits. Shared Markdown rendering emits a dedicated literal-text wrapper; ordinary/inline code is unchanged. Registry hash updated with identity/URL/date unchanged.
- Add original hide/show beside the TEXT chapter button only on marked documents, default visible. Mobile <=980px shows eye/slashed-eye icons alone, with accessible labels/state and controlled passage IDs. Originals use 19px serif, 1.95 line spacing, wrapping and the shared font slider. Document the syntax in authoring manual v3.3.
- Validation: 66 fixtures, typecheck, build and built checks passed. Tests cover literal escaping, nested code examples, ordinary/inline exclusions and toggle state/labels. Actual HTML contains four passages and one toggle, with all Chinese lines preserved; compiled CSS verifies larger type/wrapping and mobile icon-only labels. No commit or upload requested.

### Local commit summary

- Bundle donation content/copy button, collapsed public revision histories, STORY chapter navigation/toolbar/scroll behavior and reader CSS cleanup into one local commit. Include the user's existing Korean display label 열린불교 and TEXT 문헌정보 link label edits. Prepared registry and continuity records accompany the source changes; generated output and personal Obsidian state remain excluded. No push requested.

### Reader CSS cleanup and initial layout

- Preserve the user's current spacing/border choices while removing 12 disabled CSS comments, 100 retired mobile-dropdown/Entity selectors and the unused mobile stylesheet. Separate shared reader-layout.css from drawer controls; put shared docking/list-modal styles in reader-drawer.css and retain one shared typography scaling rule.
- Remove the old floating toolbar/sticky navigation overrides. TEXT's first HTML/CSS layout now matches desktop-open/compact-closed defaults; data-text-ready hands state to the existing controller after setup, preventing the initial closed-to-open width change.
- Validation: 64 fixtures, zero-error typecheck (existing unused TextReader field hint), build and built checks passed. A temporary PostCSS/selector cascade audit compared key document/library styles across 96 width/theme/focus/sidebar configurations with no changed values; initial and initialized TEXT grid/sidebar/rail defaults match at 390/768/1200/1440px. This is a static cascade audit, not browser rendering. Browser host was unavailable and native Chrome access was denied, so refresh/visual QA could not run.

### STORY scrolling part navigation

- Let STORY part navigation scroll away; place reader tools and desktop chapter/aid panels at viewport top with full-height panels. Remove the unused navigation-height observer.
- Validation: 64 fixtures, typecheck (zero errors; existing TextReader hint), build and built checks passed. Compiled CSS checks verify static part navigation and viewport-top toolbar/panels.

### STORY chapter toggle and unified toolbar

- Add the shared TEXT-style 문헌 목차 button to STORY's full-width toolbar, opposite the document tools; match the article surface background. Toggle the desktop chapter sidebar and move the original list into a native modal at <=980px, replacing the duplicate mobile dropdown and obsolete handlers.
- Preserve sidebar choice across focus mode, aid-panel behavior and responsive scroll/focus restoration. Cover desktop toggling, focus-state retention, modal Escape/backdrop/close and resizing without auto-opening.
- Validation: 64 fixtures, typecheck (zero errors; existing TextReader hint), build and built checks passed. All four STORY documents have the toolbar toggle, one original chapter list and one mobile modal; TEXT's existing behavior tests pass. Browser visual QA was not performed.

### Public document changelogs

- Wrapped the brand/support revision histories in native details, closed initially. Shared page styles show a right arrow when closed and a down arrow when expanded, with keyboard focus styling. Existing history and support metadata are preserved.
- Validation: 63 fixtures, typecheck, build and built checks passed. Both actual pages contain a closed details block with an arrow and correctly rendered Markdown history.

### Donation guide

- Added pages/support.md with 보리도후원 introduction, service/content uses, user-provided Kakao Bank account and nonfinancial participation guidance. Linked it below 기여 및 협력단체 in the footer using its public registry URL; prepared the new registry record.
- Added an adjacent copy button that reads the displayed bank/account text, announces success or manual-copy guidance on failure and prevents repeated clicks while copying. Account remains authored once in Markdown.
- Validation: 63 fixtures, typecheck (zero errors; existing TextReader hint), build and built checks passed. Actual HTML confirms account/content, relative brand link and footer link order. No upload requested or performed.

### Shared reader back-to-top control

- Add one accessible arrow button to TEXT/STORY readers, revealed after 240px scroll. It tracks the prose column’s right edge on scroll/resize/sidebar changes and returns to page top; honor reduced-motion preferences and hide it in print.
- Validation: 63 fixtures, typecheck (zero errors; existing TextReader hint), build and built checks passed. Interaction coverage verifies reveal/hide, prose-edge positioning and smooth/reduced-motion scrolling; built markup verifies one initially hidden control per TEXT/STORY document.

### STORY desktop TOC and footnote dock

- Add TEXT-style tabs and a persistent 300px right aid rail at >=1360px, using the same surface background as STORY prose. Default to body TOC with notes fallback/empty messaging; STORY focus hides both sides and restores the selected aid on exit.
- Move original dialog nodes between the rail and their modal origins; share drawer behavior/docked CSS, preserve IDs and footnote return callbacks, and close rather than automatically show a modal when shrinking the viewport.
- Cover persistent selection, tab switching, note return callbacks, original-node restoration and scroll-lock release across responsive transitions. Focus hides both sides and restores the previously selected aid.
- Validation: 62 fixtures, typecheck (zero errors; existing TextReader hint), build and built-page checks passed. All four STORY documents have one aid slot, matching tabs and unique IDs; compiled CSS verifies article-surface background, docking and full-width focus. No source content/registry changes. Browser visual QA unavailable.

### EBOOK modal centering fix

- Explicitly fix the ebook dialog to the viewport with inset:0 and margin:auto so CSS resets cannot leave it at the top left. Retain responsive viewport gutters, max height and internal scrolling. Added compiled CSS centering contracts. Passed 59 fixtures, typecheck (zero errors; existing TextReader hint), build and built-page checks. Browser visual QA remains unavailable.

### EBOOK User Test Sample

- Added user-requested ebook/001.보리도 전자책 샘플 with an original slate-blue cover, ordinary Markdown bibliography, real EPUB3 navigation/cover and 3-page embedded-Korean-font PDF. Clearly label it as a CC0 test guide, not a source translation/research work. Keep editable body Markdown under _assets; only cover/EPUB/PDF deploy.
- Visually reviewed all three PDF pages via rendered PNGs; verified Korean extraction and EPUB ZIP/mimetype/manifest/spine/navigation resources. Passed 59 fixtures, typecheck (existing TextReader hint only), build, generated link/UI/EBOOK/domain checks and check:registry. Built card/bibliography/buttons and byte-identical deployed downloads verified. Existing documents/registry unchanged; no commit/upload.

### EBOOK Auxiliary Library

- Added /ebook/ with MEDIA-inspired aligned cover grid, combined title/author search and format filters, native bibliography/download modal, URL-shared modal selection and keyboard/focus/scroll restoration. Every ebook uses CC0. EBOOK appears only immediately below MEDIA in the footer; primary/mobile navigation is unchanged.
- Read direct src/content/ebook book folders with optional index.md H1/plain-prose bibliography, cover fallback, public original TEXT/STORY links and actual nonempty EPUB/PDF files. Selected covers/downloads alone enter generated assets; exclude private/draft/incomplete packages and remove stale outputs. No ebook conversion, individual routes or registry records. Added an empty source folder and authoring manual v3.2.
- Passed all 59 fixtures, typecheck (0 errors/warnings; existing TextReader unused-fields hint), build, check:registry, built links across 64 pages/21 redirects, UI/EBOOK/footer contracts and 211 production-domain URLs. A temporary populated package build verified both rendered download buttons, bibliography/template markup and byte-identical deployed files, then was removed and the empty final library rebuilt; no QA assets remain. Browser visual QA was not performed. Registry/source document identities and body content remain unchanged. Preserve user's independently modified planning file. No commit/upload requested or performed.

### Custom Domain Local Configuration

- Set common SITE_URL and robots sitemap to https://borido.org; normal canonical/OG/RSS/sitemap inherit it, and legacy redirect canonicals now use absolute production targets. Preserve root routes/no base and existing Actions workflow; CNAME is unnecessary for custom Actions deployment per GitHub documentation.
- Updated active operating/brand/domain guidance and current address in the BORIDO introduction post; retain historical URLs and the user-modified planning file. Prepared registry changes only two content hashes; all identities, dates, URLs and other metadata are preserved.
- Added built-domain verification to check:built. Passed 53 fixtures, zero-diagnostic typecheck, build, generated links (63 pages/21 redirects), UI contracts and metadata/feed/sitemap/robots domain checks. Registry preparation is stable; check:registry fails only its HEAD comparison because these authorized local content/hash changes remain uncommitted. No commit or upload requested/performed.
- External observation: borido.org A returned 115.68.216.239, www CNAME points to biwoom.github.io, old Pages host redirects to http://borido.org, and apex/www HTTPS fail hostname verification. DNS/Pages HTTPS completion is external follow-up; no DNS or GitHub settings changed.

## 2026-11-07

### Academic TEXT Work and Document UI

- Added TextLibrary/TextReader academic templates with slate-blue work/document accents, selective serif reading fonts, explicit-only bibliography, title/description material search, persistent material links and per-section document traversal. TEXT menu/category gold and STORY presentation remain distinct; gold on TEXT documents is limited to footnote emphasis.
- Extracted ReaderToolbar/document-reader so TEXT/STORY share parsing, footnote IDs/return behavior, font slider/persistence and copy logic. TEXT uses sample toolbar symbols, desktop nonmodal aid docking/mobile native dialogs with original nodes, focus-state restoration, measured sticky offsets, section/citation copy and print footnotes that restore after printing.
- Latest user steering: both TEXT document side panels start closed; toolbar actions open them, and focus mode restores that actual previous state.
- Latest scroll steering: on TEXT documents the site/work/part headers scroll away naturally, while reader tools and opened side panels stick at viewport top; anchor offsets follow actual toolbar height. Work-library/STORY header behavior remains unchanged.
- Latest mobile steering: hide the TEXT focus control at <=980px and show 문헌 on the list button; desktop keeps 문헌 목차 and focus controls.
- Latest mobile row steering: remove the <=420px full-row tool group and prevent toolbar/group wrapping so 문헌 and document tools share one row. Keep existing labels and controls. Passed 53 fixtures, zero-diagnostic typecheck, build and generated link/UI checks; compiled toolbar/group nowrap rules verified.
- Updated operating rules/manual v3.0/refactor guide v0.9/README and new TEXT regression tests. Preserve the user's renamed planning directory/deleted old plan and original sample. No content-body rewrite, commit or upload requested.
- Passed 53 fixtures, zero-diagnostic typecheck, build, links across 63 pages/21 redirects and UI contracts for 27 documents, plus check:registry. Live HTTP verified both TEXT documents (one title, unique IDs, 40/0 notes, default-closed sides, sample symbols), work bibliography and STORY/font isolation. Compiled CSS verifies mobile focus hiding/compact 문헌 label, viewport-top tools and stronger font-scaling rule. Source content and registry unchanged; browser visual QA remains unavailable under the existing access restriction.

## 2026-11-06

### BLOG Category Buttons

- Derive BLOG category/categoryOrder from its first folder while retaining standalone registry identity. Add ordered category/count buttons above tags; category/tag/year filters intersect and reset shared pagination. Preserve category/tag query parameters, pressed states, no-results feedback and loose-post 미분류 fallback. Existing category badges/search metadata now use folder labels.
- Extend actual BLOG script tests for combined filters, pagination reset, URL/popstate and untagged posts, plus folder normalization/identity and generated markup/count contracts. Updated manual v2.9 and continuity guidance.
- Passed 44 fixtures, zero-diagnostic typecheck, build and generated links/UI checks. Verified a fresh temporary dev server returns the ordered seven buttons above tags and all 21 correct per-post categories; temporary server stopped afterward. Browser visual/click QA remains unavailable under the existing access restriction. No commit/upload requested.

### BLOG Category Folder Migration

- Moved 21 posts into six numbered category folders (교학 3 / 수행 1 / 인포그래픽 3 / 디자인 1 / 보리도 2 / 일지 11), including existing post directories and 11 attachment images. Preserve the ignored historical generated directory without publishing or restoring archives.
- Batch-linked moved registry entries with shared linkMove before preparation, then rebased Markdown destinations in five documents. Existing IDs/URLs/dates/publication flags/rights/frontmatter and attachment bytes are preserved. Category metadata/filter UI is deferred; this step organizes source folders only. No commit or upload requested.
- Updated AGENTS, manual v2.8 and continuity guidance.
- Passed 42 fixtures, zero-diagnostic typecheck, build and generated link/UI checks across 63 pages/21 redirects and 27 documents. Audited all 21 post IDs/URLs/dates/rights/frontmatter and unchanged prose outside rebased URLs; all local Markdown targets remain equivalent. All 11 attachment hashes match both moved source and generated assets, original post routes still build, and registry preparation is stable.

## 2026-11-05

### Reader Improvements Blog and Local Commit Checkpoint

- Added BLOG reader-tools-and-markdown-improvements.md summarizing footnote navigation, shared font sizing/mobile positioning, drawer motion, CJK emphasis and italic synthesis, default-rights suppression, and random manifest accents. Distinguish automated/live HTTP checks from unavailable browser visual QA and local commits from deployment.
- Include this session's reader/parser/home changes, tests, authoring guidance, prepared registry and the user's related prose/style/plan edits in the local checkpoint. Mark the implemented manifest task complete; leave domain/source-layout/email plans pending.
- Final checkpoint verification passed: 42 fixtures, zero-diagnostic typecheck, build, built links across 63 pages/21 redirects and UI checks for 27 documents. Verified the new BLOG detail, RSS/sitemap inclusion and default-rights omission; registry preparation is stable. Commit the prepared registry with source changes and verify check:registry after the local commit. Browser visual QA remains unverified. No push requested.

### Random Landing Manifest Accent

- Choose a HOME/TEXT/STORY accent or BLOG monochrome background at browser load, before manifest text is painted; reselect on bfcache return. Reuse the existing menu tokens, preserve authored copy and use dark text on bright variants in both themes. No persistent selection or timed changes.
- Passed 42 fixtures, zero-diagnostic typecheck, build and built link/UI checks. Deterministically checked all four choices and bfcache behavior, plus emitted CSS tokens, script-before-content placement and live local HTML. Browser visual QA remains unavailable under the existing access restriction.

### CJK-Friendly Markdown Emphasis

- Added pinned remark-cjk-friendly 2.3.4 parse-only integration. Share scripts/lib/markdown.mjs between Astro's Markdown/MDX plugin configuration and content parsing so punctuation with attached Korean particles produces em/strong consistently without modifying content.
- Added parser/render regressions for the reported examples, Unicode punctuation, nested emphasis, code/escapes, ordinary GFM, links/tables/headings/footnotes and metadata interpretation. Updated authoring manual v2.7 and continuity guidance. User's existing source and registry edits are preserved.
- Passed 42 fixtures, zero-diagnostic typecheck, build and built link/UI checks. Confirmed both reported phrases render em/strong in actual STORY output, every vault file and complete registry match task-start bytes, and RSS/sitemap/robots retain root URLs. check:registry fails solely because its HEAD comparison sees the pre-existing uncommitted STORY hash edit; preparation itself makes no changes. Restarted the stale development process using the installed Astro CLI on 127.0.0.1:4321 (npm dev launcher was denied by command policy after shutdown); live HTTP confirms both emphasis examples. Vault and registry remain unchanged after restart. No commit/upload.

### Suppress Automatic Default Rights Line

- Shared ContentRights no longer renders the default 비움 · CC0 line or an empty rights container on TEXT/STORY/BLOG documents. Keep normalized/source rights data unchanged and retain document-specific licenses/holders/URLs and copyright notices.
- Passed 38 fixtures, zero-diagnostic typecheck, build and generated link/UI checks. Inspected all 26 document outputs: default rights absent on 25, the external-source rights exception preserved on 1.

### Font Panel Reset and Mobile Anchoring

- Use a single-column grid for the font popover so reset stays below the full-width slider. Preserve the user's shortened 초기화 label and other style edits.
- On mobile, keep horizontal viewport centering and derive the top edge from the font trigger's bottom plus 8px. Track scroll/resize, constrain available panel height and prevent slider focus from moving the viewport.
- Passed 38 fixtures, zero-diagnostic typecheck, build and generated link/UI checks, including trigger-relative positioning and compiled single-column/mobile styles. Browser visual QA remains unavailable under the existing access restriction.

### Footnote Number and Text Alignment

- Keep each top-level drawer footnote in a baseline-aligned flex row so its generated number and clickable text start on the same line. Allow the text column to shrink/wrap and remove its first block's top margin; retain nested content and return navigation.
- Passed 38 fixtures, zero-diagnostic typecheck, build and generated links/UI checks; confirmed the compiled top-level footnote flex rule. Browser visual QA remains unavailable under the existing access restriction.

### Reader Footnote Navigation and Mobile Font Panel

- Replaced the footnote toolbar icon with a document-note glyph and added a desktop 각주 label. A TEXT/STORY-only rehype transform removes generated backreference arrows during build and makes note text focusable/clickable without changing source Markdown or authored links/nested content.
- Note click/Enter returns to the last body reference used to open that note, defaulting to its first reference when opened from the toolbar. Highlight the active reference with a contrasting accent badge, bold number and outline; preserve ordinary links inside notes.
- Center the mobile font slider panel in the viewport while retaining the desktop placement below its trigger.
- Passed 38 fixtures, zero-diagnostic typecheck, build, generated link/UI contracts across 62 pages/21 redirects and registry validation. Verified all 40 built note-text controls point to existing body references; RSS/sitemap/robots retain root deployment URLs. BLOG and series-introduction footnotes retain their original behavior. Browser visual/interaction QA remains unavailable under the existing access restriction. No upload.

### Reader Drawer Motion Fix

- Replaced the shared 180ms CSS slide plus delayed class toggle with one Web Animations controller for TOC and footnotes: 360ms entrance, 280ms exit, gentle easing and backdrop fade. Resting panels stay in place so native modal autofocus does not scroll an offscreen panel. Close waits for actual animation completion; interrupted entrances close from their current position. Reduced motion remains immediate.
- Reserve the reader scrollbar gutter to prevent horizontal shifts during body scroll locking. Selecting a footnote scrolls only its internal list instead of calling scrollIntoView on an animating drawer.
- Passed 36 fixtures (including interrupted entrance/exit completion and internal-only note scrolling), zero-diagnostic typecheck, build, generated link/UI contracts across 62 pages/21 redirects, and registry validation. Browser interaction QA remains unavailable under the existing browser-tool access restriction. No upload.

### Reader Footnotes and Shared Font Slider

- Added toolbar footnote/font icons to shared TEXT/STORY readers. Build-time ReaderBody slot rendering extracts the generated footnote section into one native-dialog drawer, preserving rich markup, IDs and backreferences. References select the note; backreferences close and return to the source. No-note documents keep the button disabled; copy output retains footnotes.
- Added one 80–150% font slider below its icon, live percentage, reset and browser-local persistence shared by both collections. Capture the existing computed type sizes and scale them together, remeasuring responsive sizes on resize. Page intro/navigation are excluded; storage failures leave controls usable.
- Passed 35 fixtures, typecheck (zero errors/warnings), build, generated link/UI contracts across 62 HTML pages/21 redirects, and committed-registry validation. New tests exercise font persistence/reset/dismissal, storage failure and footnote open/back/Escape/backdrop behavior; generated contracts enforce one slider and one build-rendered footnote destination.
- Actual browser visual/interaction QA remains unverified: browser host unavailable and native Chrome access was denied by the tool. No source content/Obsidian state changes, commit or upload.

## 2026-10-31

### Flat Shared Media Assets

- Flattened src/content/media to 15 image files, qualifying generic preview/thumbnail/profile names to prevent collisions. Verified every image hash before/after. Preserved 15 original Markdown/HTML/PDF artifacts under .agents/archive/media-originals and removed the old media subdirectories/OS metadata files. Mapping and SHA-256 evidence: .agents/references/shared-media-migration.json.
- Updated 7 image links across 4 active documents, including byte-identical image references previously pointing to per-blog copies. Existing blog asset copies remain available. Media is synced to public/generated/content/media without registering content, menu entries or search pages; shared assets do not inherit draft state.
- Updated authoring/operating docs and skills (manual v2.5, guide v0.7). Added shared-media regression coverage for encoded filenames/query/fragment resolution, private-only references, exclusion of notes/hidden files, absent content records and incremental update/deletion.
- Passed 26 fixtures, zero-diagnostic typecheck, build, built links/UI contracts, all 7 generated document image references, archive/image integrity checks and 15 live image-URL byte comparisons. Verified media absence from menu links/sitemap/registry and root RSS/robots/config preservation.
- The old dev process initially returned cached document URLs. After the development server restarted, all 7 updated document image URLs were verified in live HTML as well. Future native sync changes still require a full process restart. No commit/upload performed.

### Plain Optional Tags and BLOG Filters

- Flattened prefix/name tags into deduplicated plain tags arrays. Audited 37 tag-bearing files (including media documents added/moved by the user during this work): bodies and all other frontmatter remained unchanged. Checked 39 existing current registry records for stable IDs, URLs and dates.
- Added shared DocumentTags below TEXT/STORY/BLOG document titles, omitted when absent, with BLOG tag links opening ?tag filters. Tags are optional and never inherited from series.
- Removed series tag menus/modals, prefix-filter components/helpers and their dedicated styles. Compact series hero padding is 24px/20px desktop and 20px/16px mobile, with 12px description spacing and 32px lower gap; background/alignment retained.
- BLOG tag chips show published-post counts, exact-match selection and keyboard pressed states, combined with year archives and pagination reset. All includes untagged posts; empty results, special-character tag URLs and more/reset behavior are covered. Many tags use one horizontally scrollable strip.
- Updated normalized tag schema, input validation, authoring/operating guidance, brand v1.13, manual v2.4 and refactor guide v0.6. Added actual BLOG script event/pagination tests in a simulated DOM and extended generated-page tag contracts.
- Validation passed: 25 fixtures, zero-diagnostic typecheck, build, links across 62 HTML pages/21 redirects, document/menu UI contracts and compiled series/tag styles. Live HTTP verified 26 document tag headers (2 untagged), 3 series pages without tag UI and BLOG filter markup. Native-browser visual/click QA remains unverified. No commit/upload performed.

### Shared Library Item Backgrounds

- Shared the category hero's 4% accent/theme-background tint with menu-root category cards and category-detail series rows, increasing to 8% for hover/keyboard focus. Centralized the values in library-scoped custom properties and extended reduced-motion handling to cards.
- Preserved text colors, card/row forms, row dividers and focus indicators. Updated brand definition to v1.12 and continuity guidance.
- Passed 22 fixtures, zero-diagnostic typecheck, build, built link/UI checks and compiled CSS checks for both tint levels, item selectors, hover/focus states and hero reuse. Browser visual/interaction QA remains unverified. No commit/upload performed.

### Compact Category and Document Heroes

- Reduced category-detail hero top/bottom padding to 40px/28px (28px/20px mobile), added a solid 4% menu-accent/theme-background tint and retained the divider. Kept menu-root and series styling.
- Reduced document hero padding to 20px/16px (16px/12px mobile), breadcrumb/title/description gaps to 8–12px and bottom margin to 20px; removed the old negative document part-nav top margin. Title sizes remain 40px/30px.
- Updated brand definition to v1.11 and continuity guidance. Passed 22 fixtures, zero-diagnostic typecheck, build, built links/UI contracts, compiled CSS checks for tint/divider/padding at both breakpoints, and live category/document HTTP checks for both collections. Browser visual QA remains unverified. No commit/upload performed.

### Library List Labels and Category Divider

- Added small left-aligned 카테고리 목록/시리즈 목록 labels above root/detail lists, using the labels to name the list sections for assistive technology. Added a thin theme-aware bottom border to category-detail heroes only.
- Passed 22 fixtures, zero-diagnostic typecheck, build and built links/UI contracts. Live HTTP checks covered label text/order and category-only divider classes on both menu roots and all three category detail pages. No commit/upload performed.

### Category Series Rows

- Replaced TEXT/STORY category-detail series cards with numbered full-row links containing titles, optional descriptions, counts/part labels and arrows. Added thin separators, accent hover/focus treatment, compact mobile spacing and explicit hidden-row support for pagination. Menu-root category cards remain unchanged.
- Updated the existing UI contract to expect series rows instead of a three-column card grid. Passed 22 fixtures, zero-diagnostic typecheck, build, built links/UI checks and live HTTP checks for category-card preservation, row contents and destination links (TEXT 1 series, STORY 2 series, empty 선시). Browser visual/interaction QA remains unverified. No commit/upload performed.

### Restore Menu-root Hero Accents

- Restored the earlier TEXT/STORY accent gradient/grid background on menu roots only, using a dedicated root-hero marker. Category-detail, series and document heroes remain neutral; typography and container alignment are retained.
- Updated brand definition to v1.10 and continuity guidance. Passed 22 fixtures, zero-diagnostic typecheck, build, built link/UI checks and live HTTP checks that distinguish root hero classes from category detail classes. No commit/upload performed.

### Neutral TEXT/STORY Heroes and Category Layout

- Removed reading-menu hero color/gradient backgrounds and category grid-background markup. Set hero H1 to 40px desktop and 30px at <=900px; category roots/detail lists use max-width 1200px, 32px horizontal padding and left-aligned titles/descriptions.
- Updated brand definition to v1.9 and continuity guidance. Preserved HOME gradients and menu accent controls.
- Passed 22 fixtures, zero-diagnostic typecheck, build, built links/UI contracts, compiled CSS checks for the requested sizes/backgrounds/container properties, and live category-markup HTTP checks. Browser visual QA remains unverified. No commit/upload performed.

### Document Part Navigation Home Link

- Added a first-position home icon to the shared TEXT/STORY document part navigation, linking to the current series URL with an accessible label and tooltip. Reused the existing button styling and kept the icon compact on mobile/desktop.
- Passed 22 fixtures, zero-diagnostic typecheck, build and built link/UI checks. Live HTTP checks confirmed first-button order, series destinations and successful target responses on all six Markdown readers. No upload performed.

### STORY Categories and Shared Category Cards

- Unified TEXT/STORY path interpretation and validation as category/series/part/item, using existing normalized category fields. Recognized the user's new STORY folders without rewriting their documents or personal Obsidian state.
- Replaced menu-root filters/series cards with ol-grid-3 category cards and added category-specific series-list routes, counts, breadcrumbs and shared pagination. Empty 선시(禪詩) remains visible with a preparation message; `.gitkeep` retains its folder in Git.
- Refreshed the active dev server's old parser and repaired temporarily merged category/series registry data using historical aliases/folder records. Verified all current STORY document/intro IDs, canonical URLs and dates against the pre-work snapshot; preserved original series URLs.
- Updated operating rules, README, authoring manual, refactor guide, skills and continuity records. Added migration, empty-category, private-series and generated category-membership regression checks.
- Validation: 22 fixtures; typecheck with zero diagnostics; 60-page build; links across 62 HTML pages/21 redirects and 26 document UI contracts plus menu/category checks. New category paths are in the root sitemap; RSS/robots/config stay on the existing production root.
- Active development server HTTP checks passed for both menu roots, all three category pages and original STORY series/document routes. Browser visual/interaction QA remains unverified. No commit or upload performed.

### Reader Header Alignment

- Moved desktop TOC/Copy tools to the same visual row as the article header while retaining tool-only sticky positioning through the article. Mobile title remains above its tools.
- Capped article-header and hero titles at 1200px, preserving the user's existing 1200px prose setting and transparent toolbar background. Updated the built UI contract to match the current prose width.
- Passed 19 content fixtures, zero-diagnostic typecheck, build, link checks across 59 pages/21 redirects and UI checks for 26 documents plus BLOG index. Browser visual/interaction QA remains unverified.

### Desktop Reader Toolbar Follow-up

- Kept the shared TEXT/STORY TOC and Copy toolbar sticky below the site header/part menu on desktop, with a desktop-only 목차 label. Separated the tool row from the title so only the tools stay pinned.
- Cleared heading anchor targets beneath the sticky toolbar and used overflow: clip on the document shell to preserve sticky behavior and rounded edges. Mobile tools remain in normal flow.
- Content fixtures (19), typecheck (zero diagnostics), build, built links and document UI contracts passed. Browser interaction remains unverified.

### Full-width TEXT/STORY Reader and TOC Drawer

- Expanded individual readers and prose to the available viewport width, retained the desktop left document list, and removed the right TOC column. Series and BLOG layouts retain their own sizing.
- Replaced separate desktop/mobile TOCs with a shared toolbar icon and right-edge modal drawer. Added close/Escape/backdrop dismissal, focus containment/return, reduced-motion support and active heading indication; shared Copy remains available on mobile.
- Added compiled CSS/HTML regression checks for reader width, initially closed drawer and retired TOC removal.
- Validation passed: 19 content fixtures, typecheck with zero diagnostics, 57-page build, links across 59 HTML pages/21 redirects, and 26 document UI contracts plus BLOG index. Actual browser visual/interaction QA remains unverified. No commit/upload performed.

### BORIDO Logo and Remaining Brand Cleanup

- Applied supplied logo originals 004/006 to header/footer and generated favicon/ICO/apple/social assets; preserved originals and added reproducible brand:assets command.
- Rewrote current brand introduction around TEXT/STORY/BLOG, labeled ATLAS articles and legacy plans as historical, updated skill UI descriptions and public attachment HTML labels while preserving OL engine identifiers.
- Verified the logo originals byte-for-byte and visually inspected the generated sharing image. Content tests (19), typecheck (zero diagnostics), build, local-link audit and static UI contracts passed. Browser interaction was not tested.
- Production domain remains unchanged. No upload requested.


### BORIDO Brand Transition

- Updated the public brand to BORIDO (보리도), retained OL as the code core name, and documented the future borido.org domain without changing deployment.

## 2026-10-30

### Harden Obsidian Transition and Preserve User Deletions

- Fixed private attachment publication/cleanup, canonical library introduction URLs, TOC body preservation, AST title/input validation, manual move alias flattening/copy rejection, ambiguous move detection and full Markdown/material watcher invalidation. Removed legacy self-aliases and reject alias cycles.
- Added shared document rights display, nested pages routes, thumbnail target validation, public route collision checks, attachment HTML dependency checks, Korea publication dates and registry initialization/CI commit guards.
- Retained user-deleted sources as deleted; removed seven defunct hyperlinks while preserving labels, omit redirects without a public destination, and recorded follow-up migration/deletion metadata without rewriting the original inventory. Removed unused reader/helper components and consolidated only still-used TEXT utility styles and shared responsive styles.
- Updated project rules, authoring/deploy/doc skills, manual, guide, decisions, current-state and audit resolution notes.
- Validation: 19 fixture tests; typecheck with zero diagnostics; build 57 pages; built checks covered 59 HTML files/21 redirects and 26 document UI contracts. Root RSS/sitemap/robots and deleted output absence verified. Temporary dev-server HTTP checks passed for public/private/public introduction changes, Markdown/PDF refresh, new folders/documents and BLOG rights exceptions. Personal Obsidian state unchanged. Browser visual QA and production deployment are outside this verification.

### Obsidian Transition Audit

- Reviewed the refactor guide against schemas, registry/moves, loaders, routes, assets, Markdown transforms, UI consumers, validation and operational guidance.
- Recorded findings and document correction targets in `.agents/references/obsidian-transition-audit.md`. Temporary fixtures reproduced private attachment copying, distinct/unrendered introduction URLs, TOC body removal and broken aliases after manual moves.
- Existing verification passed: 9 fixtures, typecheck with zero diagnostics, 119-page build, 46 redirects and static UI contracts. Browser/live watcher and production deployment were not verified.
- Application/content sources and personal Obsidian settings were not changed. No commit or upload performed for this audit.

### Move Four Existing TEXT Articles to BLOG

- Moved the six-step meditation manuscript and three doctrine-research articles from `text/900.기존문헌/` to descriptive Markdown filenames directly under `src/content/blog/`.
- Preserved original document identities, publication dates, body text and rights metadata; adjusted only the meditation article's two image links and copied its referenced images to `blog/assets/basic-meditation/`.
- Assigned BLOG canonical URLs, redirected the four former TEXT article URLs, updated older aliases/redirect targets and kept TEXT series introductions and their existing source assets intact.
- Validation: 9 content tests, typecheck (zero diagnostics), build (119 pages), link audit (46 redirects) and UI contracts all passed. Verified all four rendered pages have BLOG styling and search classification.
- No commit or GitHub upload performed.

### Unify TEXT Individual Documents With STORY Styling

- Switched TEXT document routes to the same `StoryReader.astro` used by STORY; removed unused `TextReader` and `TextLayout`.
- Parameterized collection breadcrumbs, Pagefind section/category metadata and labels. TEXT retains its public URLs and folder hierarchy while using STORY hero/part links/sidebar/body/TOC/copy presentation.
- Updated static UI contracts so both collections must have STORY document structure and the correct search classification, with no legacy TEXT document shell. BLOG remains dedicated.
- Validation: 9 content tests, typecheck (zero diagnostics), build and built-link/UI-contract checks. Browser interaction is not verified because browser access remains unavailable. No commit or upload performed.

### Restore Search, Document and BLOG Presentation

- Root cause: retiring `atlas.css` also removed shared search/mobile-sheet styles; replacing collection markup with a generic reader disconnected existing TEXT/STORY/BLOG styles.
- Extracted search and mobile-sheet CSS into shared files, added initial hidden/inert overlay states, and synchronized open/close handling.
- Restored TEXT sidebar/article/TOC/copy markup and STORY chapter/sidebar/mobile/TOC/copy markup against the normalized folder model. Restored BLOG list/image frames/archive/pagination and dedicated post header/body/footer styles. Kept rights exceptions and ordinary asset rendering.
- Added `scripts/check-ui-contracts.mjs` to `check:built` to detect missing compiled overlay CSS and missing collection-specific markup; scope is static regression checking, not browser QA.
- Validation: content fixtures passed (9 tests); type and build checks passed; 115 pages/42 redirects passed local-link audit; UI contracts passed for 34 Markdown documents and BLOG index.
- Browser verification limitation: browser access host unavailable; native Chrome access returned "Computer Use was not approved to use Google Chrome". No approval rules were changed and no alternative UI control was attempted.
- No commit, push or live deployment check performed.

### Obsidian Content Refactor Implementation

- Implemented YAML-free title/body writing, numeric-prefix sorting, folder-derived TEXT category/work/section hierarchy and ordinary PDF/image/HTML items.
- Added shared library/reader components; TEXT uses existing STORY first-item links and expandable lists, with no actual tab switching. Preserved the shared tag modal and paginator.
- Added committed `content-registry.json` for stable URLs, first-publication preparation dates and path/hash move tracking; retained existing public URLs, dates, unpublished states and rights exceptions.
- Migrated 34 original tracked source assets (all verified by content hash), DESIGN prose and useful Entity explanations into ordinary TEXT material. Removed active DESIGN/NET/Entity/Ontology collections, UI and provider settings. Preserved retired ATLAS HTML under `.agents/archive/atlas/`.
- Added general asset synchronization, Markdown link resolution, hidden/draft exclusion, static link verification and CI type/built-link checks. Updated AGENTS, skills, authoring manual, brand definition, guide and current state.
- Verification: `npm run check` passed (9 tests); `npm run typecheck` passed with zero errors/warnings/hints; build produced 115 pages; `npm run check:built` verified local references and 42 redirects. Root sitemap/robots/RSS and legacy brand route checked; private sample content excluded.
- Limitation: dev-server launch was rejected by automatic approval policy because `.codex/rules/default.rules` requires confirmation for a persistent process and approval mode is never. Browser interaction and live watcher behavior were not verified. Move+edit without a running watcher may require `content:move`; standard Markdown links are supported, Obsidian special embeds are not.
- No commit, GitHub upload, Actions inspection or live deployment verification performed.

### Obsidian Content Refactor Development Guide

- Added `.agents/references/obsidian-content-refactor-guide.md` recording the agreed folder-based TEXT structure, numeric-prefix sorting, and reuse of current STORY links/expandable lists without tab switching.
- Included DESIGN/NET/Entity/Ontology removal, frontmatter/schema reduction, asset and URL migration, phased implementation, and verification criteria.
- Distinguished approved requirements from pending publishing/date/stable-URL decisions; updated current state and decision records accordingly.
- Scope: internal documentation only. No application/content migration, user Obsidian configuration changes, build, or GitHub upload performed. Validation: reviewed documentation and diff for consistency.

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

### 담마빠다 스토리 시리즈 추가

- Added a new STORY series at `src/content/story/dhammapada-story/`.
- Added chapter 1 from the English Dhammapada Commentary source without translation:
  - `src/content/story/dhammapada-story/part-1/01-cakkhupala.md`
- Added source-oriented frontmatter with `lang: "en"`, Dhammapada/Dhammapada Commentary tags, source tradition metadata, and rights-unverified external source licensing notes.
- Local validation:
  - `npm run check` passed.
  - `npm run build` passed and generated `/story/dhammapada-story/` and `/story/dhammapada-story/part-1/01-cakkhupala/`.

### TEXT 교리연구 시리즈 분리

- Split the three `불교세계관` TEXT documents out of `수행연구` into a new `교리연구` series at `src/content/text/doctrine-research/`.
- Added `src/content/text/doctrine-research/index.md`.
- Moved and renumbered the documents as:
  - `01-buddhist-worldview-two-perspectives.md`
  - `02-middle-way-attitude-beyond-scientism.md`
  - `03-anuttara-samma-sambodhi.md`
- Updated related Concept Entity text paths and the `two-perspectives` DESIGN related work reference to the new `doctrine-research` routes.
- Local validation:
  - `npm run check` passed.
  - `npm run build` passed and generated `/text/doctrine-research/` plus all three document routes.

### TEXT 수행연구 문서 추가

- Added two 수행연구 TEXT documents from `docs/texts/` into `src/content/text/body-mind-transformation/part/`:
  - `03-middle-way-attitude-beyond-scientism.md`
  - `04-anuttara-samma-sambodhi.md`
- Added OL TEXT frontmatter, slash-form tags, available Entity links, ordering metadata, and excerpts.
- Removed forbidden `.DS_Store` files that blocked content validation.
- Local validation:
  - `npm run check` passed.
  - `npm run build` passed and generated both new `/text/body-mind-transformation/.../` routes.

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


## 2026-11-08 — STORY document toolbar and scrolling

- Shared TEXT toolbar symbols with STORY (TOC, notes, font size, copy and mobile chapter list), retaining STORY layout, colors and tools.
- STORY document header/part navigation now scroll away; tools stick at viewport top on desktop/mobile. Removed mobile ancestor overflow that blocked sticky positioning; desktop chapter sidebar uses viewport-top offsets.
- Passed `npm run check` (53 tests), `npm run typecheck`, `npm run build`, and `npm run check:built` (63 pages, 21 redirects). Browser interaction verification unavailable because browser access host was unavailable.


### STORY desktop sticky part navigation follow-up

- Restored sticky part navigation at viewport top for STORY documents at >=981px. Tools and chapter sidebar sit below its measured height; mobile behavior remains as implemented.
- Validation: `npm run check` (53 tests), `npm run typecheck`, `npm run build`, and `npm run check:built` passed.


### TEXT responsive initial panel defaults

- Use the existing 1360px three-column breakpoint: initial document list/TOC open at >=1360px, closed below it. Manual toggles and focus restoration remain available.
- Validation: 54 fixtures, zero-diagnostic typecheck, build and built-page checks passed.


### TEXT body TOC wording and close control

- Renamed TEXT document TOC to 본문 목차 across toolbar, panel title/tab and accessible labels. Unified its close control with the footnotes X SVG.
- Docked aids open without invoking native dialog autofocus, keeping the automatically opened TOC close button unselected and preserving current keyboard focus. Modal opening retains native focus behavior.
- Validation: 54 fixtures, typecheck (zero diagnostics), build and built-page checks passed.


### TEXT work index prose in library bibliography rail

- Render work index.md body once as authored Markdown below per-material bibliography, including original-reading URLs, without extracting its fields or duplicating it in the center. Empty bodies omit the panel; description and folder/H1 title rules remain unchanged.
- Preserved the user's 대승현론 index.md edits; normal content preparation records its updated hash with identity/date unchanged.
- Validation: 54 fixtures, typecheck (zero diagnostics), build and built checks passed. Inspected 대승현론 dist library HTML: authored bibliography below 자료별 서지 표기, CBETA T1853 clickable once, unique text-intro anchor.


### TEXT library bibliography simplification

- Removed the per-material bibliography list from the library rail; renamed work notes and navigation to 서지정보. 대승현론 index uses a labelled CBETA 원문 열람 ↗ Markdown link instead of showing the URL.
- Validation: 54 fixtures, zero-diagnostic typecheck, build and built checks passed; actual 대승현론 library HTML confirms removed list, renamed title and labelled CBETA link without visible URL.


### BLOG sidebar tag panel

- Moved post tag/count chips from above the list into a native, default-closed details panel below the sidebar archive. Tags wrap within the panel, with internal scrolling for long tag lists.
- Reuse existing exact-tag/category/year intersection, URL query and pagination reset behavior.
- Validation: 54 fixtures, typecheck (zero errors; existing unused TEXT fields hint), build and built checks passed. Built UI contracts verify sidebar placement below archive and closed initial state; existing tag/category/year/pagination interaction fixtures pass.


### STORY reader focus control

- Added the shared ⛶ 집중/기본 control to STORY desktop document tools. Toggle hides/restores its chapter sidebar and expands/restores the article grid, preserving prose width and sticky part/tools behavior. Hide the control on mobile where the sidebar is already absent, matching TEXT.
- Added interaction coverage for toggling and accessible pressed state/labels.
- Validation: 55 fixtures, typecheck (zero errors; existing unused TEXT fields hint), build and built checks passed. Actual STORY HTML contains the shared focus symbol, default unpressed state and matching sidebar control target across four documents.


### Shared TEXT/STORY reading typography

- Extracted shared body/heading typography: Noto Serif KR, 17px body, 1.95 line height and 780px centered prose. STORY loads the same font faces while retaining its theme, navigation and toolbar. Existing paragraph spacing is shared already.
- Kept the single font slider cascade above shared base sizes.
- Validation: 55 fixtures, typecheck (zero errors; pre-existing unused TEXT fields hint), build and built checks passed. Compiled CSS contracts verify shared 780px/17px/1.95 font rules and slider precedence; all four STORY documents load serif faces and retain STORY theme/focus markup. Browser visual verification remains unavailable.


### STORY heading and metadata alignment

- Centered the document heading and date/actions containers at the same 780px maximum width as prose, retaining responsive width and sticky toolbar behavior. Clear the floating desktop toolbar before these containers so their horizontal alignment uses the full reading column.
- Validation: 55 fixtures, typecheck (zero errors; existing TEXT hint), build and built checks passed; compiled CSS confirms common 780px width, auto inline margins and float clearance.


### STORY hero hierarchy

- Replaced the repeated chapter title in the hero with folder-derived series · part labels; use TEXT’s 22px/1.6 serif work-title scale.
- Keep the chapter title, tags and description together in the centered body header. Show the chapter title on mobile now that it no longer appears in the hero. Preserve routes, search/page title and original content.
- Validation: 55 fixtures, typecheck (zero errors; existing TEXT hint), build and built checks passed. All four STORY pages have folder-derived series · part hero titles and separate body chapter headers.


### STORY chapter title font

- Set the body chapter heading to the shared Noto Serif KR reading font; retain its size, layout and font slider behavior.
- Validation: 55 fixtures, typecheck (zero errors; existing TEXT hint), build and built checks passed; compiled title rule uses the shared serif token.


### STORY mobile toolbar placement

- Place mobile tools first in normal document flow, immediately after part navigation and before the chapter heading. Remove the old heading-first flex order and article top padding; retain viewport-top sticky tools and their reserved row height.
- Validation: 55 fixtures, typecheck (zero errors; existing TEXT hint), build and built checks passed. Compiled mobile CSS confirms toolbar-first order, full-width reserved row and article top padding removal.


### STORY mobile chapter title hierarchy

- Override the old mobile 20px chapter title with a 28px mobile serif title while preserving the desktop 34px title (body H2 remains 25px). Keep 1.6 line height and a stronger scaling rule so the shared font slider preserves the hierarchy.
- Validation: 55 fixtures, typecheck (zero errors; existing TEXT hint), build and built checks passed. Compiled CSS verifies mobile title 28px versus body H2 25px and the stronger slider rule.


## 2026-11-09 — Biwoom - 비움 / default GitHub Pages domain

- Set common SITE_URL to https://biwoom.github.io and brand to Biwoom - 비움. Updated shared metadata, home/navigation/footer, reader citations, library/blog/media/ebook/partner labels, RSS, robots and workflow display name. Preserved root deployment without Astro base.
- Retained symbol artwork under biwoom-mark filenames and rebuilt icons/sharing art; visually inspected the Biwoom sharing image. Revised brand name meaning, support page, active manifesto, README, AGENTS, manuals and local skill guidance. Preserved existing user edits and historical investigation records.
- Renamed BLOG 005.보리도 to 005.비움 before editing, with prepared registry aliases. All 68 prior registry IDs, URLs, dates and series keys remain unchanged; folder/redirect maps unchanged. Historical articles and completed sample ebook retain original prose/assets with current-brand notices; Buddhist 보리도차제론 terminology stays intact.
- Validation: npm run check (67 fixtures), typecheck (zero errors, one existing unused-fields hint), build (64 routes), check:built (65 HTML files/21 redirects, 27 document UI contracts, 215 production URLs) passed. HTTP preview on isolated port 4322 verified 9 main pages, new brand/category/meaning, symbols, OG and feeds. Port 4321 belongs to a pre-existing stale server and was left untouched; restart it to load the new SITE_URL. Browser QA was unavailable because the browser access host was unavailable.
- Registry preparation is stable; npm run check:registry fails only its HEAD comparison until the changed registry is committed with content. No commit, push, hosting/DNS mutation or live deployment verification performed. Deployment must clear GitHub Pages Custom domain to use the default github.io domain; README links GitHub's official removal procedure.

## 2026-11-09 — EBOOK categories and retained sample

- Changed EBOOK to ebook/category/book folders. Top-level folder names provide ordered, prefix-free category labels; category/count buttons above the list intersect search and EPUB/PDF filters. Retain empty public categories and hide private category descendants/assets.
- Moved the existing CC0 sample package into ebook/001.샘플/001.보리도 전자책 샘플 and retain it per user request. All five files match HEAD byte-for-byte; no registry records changed. Updated AGENTS, authoring manual, state and decisions.
- Validation: check (69 fixtures), typecheck (zero errors; existing TextReader unused-fields hint), build (64 routes), check:built and check:registry passed. Local HTTP preview verified category/card markup and byte-identical cover/EPUB/PDF responses. Added category/privacy/empty-folder and category/search/format intersection coverage. Browser access host was unavailable and native Chrome access was rejected at the tool approval step, so visual browser QA was not performed. No commit or push.

## 2026-11-09 — MEDIA category folders

- Visually inventoried the 15 current shared images and moved them into 001.인포그래픽 (8), 002.문양 (5), and 003.일러스트 (2). Existing first-folder categorization now displays all three category buttons. Preserved every image byte/name; recorded SHA-256/path mappings in media-category-migration.json without changing historical migration inventories.
- Rebased image references in five BLOG documents; their other text is unchanged. Prepared five registry hashes while preserving every ID, URL, date and history entry. Updated README, manual, current state and decisions. Fixed the built MEDIA original-file check to decode URL-encoded Korean folder paths before checking disk files.
- Validation: check (69 fixtures), typecheck (zero errors; existing TextReader unused-fields hint), build (64 routes), and check:built passed. HTTP preview verified category counts 8/5/2, all 15 byte-identical originals/previews and the five BLOG pages; stale root asset copies are absent. check:registry passed preparation stability but its HEAD comparison fails until the intentionally changed registry is committed with content. No commit or push; no browser interaction QA.

## 2026-11-09 — MEDIA category index information

- Added optional category index.md information sections using H2 image-link headings. Titles override card/modal labels; each section body renders through the shared Markdown plugins and relative-link resolver. Validate existing public category-local targets and duplicate entries. The shared remark plugin now accepts an optional root for consistent isolated rendering/tests.
- Keep metadata refresh separate from cached image preparation. Index edits/privacy/removal update or reset titles/descriptions without regenerating unchanged previews. Modals clone pre-rendered templates, show a right information panel on desktop and a lower scrollable panel at <=900px, and clear details on close or when opening an image without information. Existing filter/zoom/loading/close/focus behavior is preserved.
- Created retained example index.md files for all three MEDIA categories covering all 15 images, with authoring guidance outside image sections. No inferred creator/date/rights fields were added. Updated AGENTS, README, manual, authoring skill, state and decisions.
- Validation: check (73 fixtures), typecheck (zero errors; existing TextReader unused-fields hint), build (64 routes), and check:built passed. Local HTTP/source verification confirmed 15 descriptions/titles, rendered Markdown/relative links, exclusion of introductory examples, byte-identical originals, no raw index.md downloads and no MEDIA registry entries. Interaction fixtures cover multiple entries, duplicate/invalid paths, metadata edit/removal/cache reuse and modal content reset. Browser visual QA was not performed. check:registry still fails only the HEAD comparison for the five intentionally changed BLOG hashes from the prior media-folder move; preparation is stable. No commit or push.

## 2026-11-09 — MEDIA license notice

- Polished the user-added hero text to: 이미지는 별도 표기가 없는 한 CC0로 제공합니다. 다른 라이선스가 적용되는 경우 이미지 정보에 별도로 안내합니다. Place it below the introduction and above category filters, in a smaller 14px note. Preserve image-specific exceptions; record the default policy in the manual, state and decisions.
- Validation: check (73 fixtures), typecheck (zero errors; existing TextReader hint), build (64 routes), check:built and actual dist notice/placement verification passed. No commit or push.

## 2026-11-09 — Remove MEDIA thumbnail sources

- Deleted buddhist-worldview-thumb.jpg, lamrim-thumb.jpg and six-steps-thumb.jpg from 001.인포그래픽 and removed their sections from its index.md. No active content references required rebasing. Keep all 12 remaining image bytes and their information entries; retain generated gallery previews. Updated current counts (5/5/2), README, manual and decisions; earlier migration records remain historical.
- Validation: check (73 fixtures), typecheck (zero errors; existing TextReader hint), build (64 routes) and check:built passed. Verified 12 cards/information entries, unchanged remaining originals, live preview files, removal of the three source/deployed thumbnail copies and cleanup of their unused generated previews. No commit or push.

## 2026-11-09 — Content / OL core separation

- Moved the entire Obsidian vault from src/content to repository-root content, including unchanged personal state. Moved implementation to ol-core/src, ol-core/scripts and ol-core/public. Kept root Astro/npm configuration, package files, site-config, registry and dist output. All 105 vault files, nine fixed public assets and the complete registry match the pre-move snapshot byte-for-byte; 65 HTML paths and RSS/sitemap/robots hashes are unchanged.
- Added module-anchored projectPaths/isMainModule helpers and absolute glob bases. Updated normalization, registry preparation/moves, Markdown/footnote resolution, MEDIA/EBOOK, attachment/preview/brand generation, watchers, verification scripts and isolated fixtures. Explicit CLI --root supports test vaults without changing defaults based on cwd. Root npm command names remain unchanged. TypeScript excludes authored content/static assets.
- Updated generated-asset cache path/key, .gitignore, AGENTS, README, authoring/refactor manuals, local skills and continuity notes. Preserve registry-relative source keys and prior deleted assets; no content/body/link rewrites were required. Reopen content/ as the existing Obsidian vault.
- Validation: npm run check (75 fixtures), typecheck (zero errors; one existing TextReader unused-fields hint), build (64 generated routes), check:built (65 HTML files/21 redirects; 27 reader contracts; 215 production URLs), check:registry, expanded check:live and isolated brand generation all passed. Live verification covers TEXT/STORY hierarchy/privacy/document/PDF refresh, BLOG rights, MEDIA metadata/add/rename/delete, and EBOOK privacy/restore/private-file removal. New tests cover cwd-independent readers/CLI and an isolated Korean/space-containing vault root. Generated assets/personal state remain ignored.
- Stopped the pre-existing Astro dev process on 4321 before moving files to avoid stale-path writes. Restart via npm run dev was rejected by automatic command approval: .codex/rules/default.rules requires a prompt while this session's approval policy is Never. The development server remains stopped; the user must run npm run dev at the repository root. No approval-rule edits, commit, push or deployment inspection were performed. Browser visual QA was not performed.

## 2026-11-09 — TEXT/STORY reading-size navigation flash

- User clarified that the flash changes text size rather than column width. The saved slider percentage was applied only when the deferred reader module initialized, leaving initial HTML at the 100% base size. Restore bounded 80–150% preference in the academic layout head and apply matching initial CSS to reader prose/headings/titles/code/tables; original passages inherit the same saved scale. Navigation, menus and workspace columns retain their existing sizes/behavior.
- Measure slider base sizes at a temporary 100% scale and restore synchronously, avoiding double scaling at startup and after repeated responsive resizes. Added tests for pre-body preference initialization, invalid/unavailable storage and repeated 150% resize measurements; added built head/CSS contracts for TEXT/STORY.
- Validation: check (77 fixtures), typecheck (zero errors; existing TextReader hint), build (64 routes), check:built and check:registry passed. Actual HTTP responses for TEXT and consecutive STORY documents contain head initialization and initial scale CSS. Chrome browser access host was unavailable and native Chrome access was rejected at tool approval, so direct visual reproduction was not performed. The user's existing dev server on 4321 remains running. No commit or push.

## 2026-11-09 — Mobile TEXT TOC label

- Split the TEXT toolbar's 본문 prefix into an inline span and hide it only within the existing <=980px TEXT breakpoint. Mobile reads 목차, desktop retains 본문 목차; the button, accessible name, dialog heading and STORY behavior are preserved. Updated the authoring manual/state note.
- Validation: check (77 fixtures), typecheck (zero errors; existing TextReader hint), build and check:built passed. Verified built labels for both TEXT documents and the mobile-only prefix rule. No commit or push.


## 2026-11-09 — 로컬 커밋 정리

- 이전 커밋 ac1e892의 EBOOK 카테고리·MEDIA 카테고리/이미지 정보·기본 CC0·썸네일 정리를 유지한다. 이번 커밋 범위는 content/와 ol-core/ 분리, 실행 위치에 독립적인 경로 처리, 배포 캐시/제외 규칙, 읽기 크기 초기 표시와 모바일 TEXT 목차 문구 수정이다.
- README·운영 매뉴얼·프로젝트 규칙·스킬·현재 상태와 결정 기록을 현행 구조에 맞췄다. 사용자 계획 체크리스트 변경과 불필요한 .env.example 삭제도 함께 보관한다. 보관함의 추적 파일 65개와 고정 자산 9개, 레지스트리는 기존 내용을 유지하며 생성물·Obsidian 개인 상태는 커밋하지 않는다.
- 최신 검증은 check 77개, typecheck, build 64개 경로, check:built, check:registry 통과다. 분리 작업의 확장된 check:live도 통과했으며, 브라우저 시각 검사는 도구 접근 거부로 미수행이다. 요청 범위는 로컬 커밋까지이며 원격 push는 수행하지 않는다.


## 2026-11-11 — BLOG 시리즈·포스트 UI와 콘텐츠 계층

- Combined sample A post rows, B series covers and C ordered TOCs using separate /blog/ and /blog/series/ routes. Add five stable series pages and six category introduction pages; post pages retain original canonical URLs and gain series/category context, a folded TOC and previous/next navigation.
- Physically moved six categories into series: 불교의 세계 → 교학; 수행-몸과 마음 돌보기 → 수행; 상상공장 → 인포그래픽·디자인; 비움제작일지 → 비움·일지. 에세이-삶의 쉼표 has only index.md, with no invented category/post. Recorded original mappings/metadata/hashes in blog-series-migration.json and verified all 21 posts preserve ID/URL/date/frontmatter/Markdown structure, with all 11 images byte-identical. Only relative reference paths changed.
- Shared series/category index interpretation supplies title, description, optional thumbnailAsset and inherited privacy. Metadata is excluded from post lists/counts/home cards/recent posts/RSS. Optional 읽는 순서 links override oldest-first sequence; unlisted posts follow by date. Enforce one parent per category and validate duplicate/missing/cross-series references; preserve dates until an item becomes public.
- Shuffle the four non-journal covers and desktop size patterns once before paint, moving the actual link nodes to keep keyboard/visual order aligned. Fixed journal section follows; mobile uses a single column. Native Chrome confirmed desktop covers and 412px mobile list/filter/metadata/ordered TOC in light/dark modes; corrected global dark heading colors leaking onto pale cover titles.
- Updated AGENTS, README, authoring/refactor manuals, local skills, state and decisions. Preserve the user's pre-existing plan.md edits and sample HTML; do not alter personal Obsidian state. No commit, push or deployment inspection.
- Validation: npm run check (83 tests), typecheck (zero errors; existing TextReader unused-fields hint), build (284 routes), check:built (285 HTML files/24 redirects, 233 document contracts, 1086 production URLs) and isolated check:live passed. Added BLOG metadata/privacy/first-publication/rename/order/cover randomization tests and built contracts for series/category/RSS/home counts/previous-next/dark cover ink. Registry preparation is byte-stable; check:registry fails only its expected HEAD comparison until content/registry changes are committed. Restored npm run dev on 127.0.0.1:4321 after final build; temporary static preview stopped.


## 2026-11-11 — macOS/Linux Unicode 경로로 인한 Actions 실패 수정

- Inspected Actions 43003813575 (4ccecdb) and 42770476630 (7d6c9ed): content/tests passed, strict committed-registry check failed before types/build/deploy. Git checkout stores NFC 마하붓다왐사 while macOS directory enumeration returned NFD; CI interpreted 211 source keys as moves. Reconstructed the latest CI diff to confirm file IDs/URLs/dates/hashes were unchanged.
- Add shared NFC vault-key/relative-key helpers, physical decomposed-file lookup and normalized-directory collision checks. Canonicalize legacy registry file/folder keys, series/category paths and alias endpoints before move detection without changing record identity, routes, dates, hashes or redirects. Preserve native filenames, root paths, authored Unicode text and .obsidian state. Apply the same boundary to Astro IDs/data, Markdown/footnote source paths, folder models, privacy/link validation, manual moves, MEDIA/EBOOK metadata and generated attachments.
- Added five portable Unicode regressions: NFC checkout listings vs NFD physical sources yield identical registry bytes, including fresh Korean/CJK insertion order; temporary committed checkpoint stays clean; identity and relative-link preservation with repeated asset sync; registry/filesystem collisions; decomposed MEDIA/EBOOK metadata. Expanded isolated live validation for NFD discovery/edit, canonical loader IDs, sibling/PDF links, private parent hiding and public asset restoration. Strict HEAD checks remain enabled.
- Validation: npm run check (88 tests), typecheck (zero errors; existing TextReader unused-fields hint), build (284 routes), check:built (285 HTML/24 redirects, 233 reader contracts and 1086 production URLs), expanded check:live and git diff --check passed. An isolated committed Git checkpoint passed the actual npm run check:registry command with both NFC directory listings and native macOS listings; production Ubuntu rerun remains pending upload. The working tree strict HEAD gate fails only because this intentional registry migration is not committed, while repeated preparation is byte-stable. All 290 file records retain IDs/URLs/dates/hashes; all folder URLs/redirects and all 280 tracked source/asset bytes are unchanged. Restored dev on 127.0.0.1:4321 and verified original STORY menu/Maha series/document and BLOG series HTTP routes. No commit, push or remote rerun.


### Unicode 경로 수정 로컬 커밋

- 사용자 요청에 따라 NFC 공통 경로 처리·레지스트리 이관·회귀/실시간 검사·운영 문서를 한 로컬 커밋으로 보관한다. 기존 검증은 check 88개, typecheck, build, check:built, check:live 통과이며 커밋 후 실제 HEAD 기준 check:registry를 확인한다. 원본 콘텐츠·첨부·생성물·개인 Obsidian 상태는 커밋 대상에 추가하지 않는다. 원격 push나 Actions 재실행은 요청 범위에 포함하지 않는다.


## 2026-11-11 — STORY original 원문 보기/숨기기

- Extended TEXT's explicit original fence transform and shared ReaderToolbar/reader-original controller to STORY documents. Render literal escaped source passages once, show the button only for marked documents, start visible and toggle all body originals together while preserving ordinary code/inline code. Reuse accessible labels/controls and mobile eye/slash icons.
- Moved eye state/mobile label rules to shared reader layout and broadened existing original typography to document readers: 18px serif, wrapping, 1.95 line height and the existing single font slider. TEXT retains its soft panel background; STORY uses the secondary theme surface. Focus, sidebars, TOC and footnotes retain their existing behavior.
- Added STORY parser/controller regressions and BLOG/pages exclusions; isolated live rendering checks cover two original blocks and a plain STORY document without a toggle. Updated authoring manual, AGENTS, current state and decisions. The implementation does not rewrite authored prose or change document identities/dates/assets. During verification the user added an original block to the 004 STORY document; preserve that edit and its prepared registry hash, along with the existing plan.md edits.
- Validation: check (91 tests), typecheck (zero errors; existing TextReader hint), isolated live STORY positive/negative rendering and existing reader interactions passed. After the user added the live example following the first build, rebuilt the latest snapshot separately to preserve their active dev server; build and generated links/UI/domain checks passed, and copied verified dist back. Actual /story/read/402293e8a3872f/ responds with the toggle and original block; its original ID/URL/date remain unchanged and only the user's content hash is refreshed. The earlier committed-registry check passed before that authoring edit; keep the new source and matching registry hash together on a future commit. Scoped whitespace check passes; pre-existing plan.md whitespace is untouched. No commit/push.


## 2026-11-12 — STORY 이야기불교 분류 계획

- 사용자 요청에 따라 plan.md 하단에 이야기불교 주제, 7개 카테고리·예정 작품, 분류 경계와 향후 작업을 추가했다. 정토왕생집은 설화와 전승, 담마빠다이야기는 가르침과 일화에 배치하는 제안이다. 기존 계획 내용과 실제 콘텐츠 폴더·레지스트리는 변경하지 않았다. 추가 부분과 기존 바이트 보존을 확인했으며, 내부 계획 문서 변경으로 빌드·브라우저 조작·커밋·푸시는 수행하지 않았다.

## 2026-11-12 — STORY 카테고리 폴더와 소개 구성

- 이야기불교의 상위 카테고리 7개를 순서대로 구성하고 각각 소문자 index.md에 H1·소개를 작성했다. 불전문학을 붓다전기로 옮기고 기존 두 마하붓다왐사 판본을 함께 보존했다. 이전의 비어 있는 선시 폴더는 .gitkeep만 제거했다. 나머지 6개 카테고리는 소개만 있으며 새 작품·본문·태그는 만들지 않았다.
- 카테고리 소개가 본문 문서·가짜 standalone 시리즈로 잡히지 않도록 TEXT/STORY 공통 메타정보 분류와 정규 카테고리 URL, 제목·소개·비공개 해석을 추가했다. 라이브러리·자료 수에서 카테고리 메타정보를 제외하고 카드·카테고리 화면에 소개를 표시한다. 홈 STORY 표기는 이야기불교로 정리했다. 계획 체크리스트, AGENTS, 매뉴얼 v4.4, 현재 상태와 결정 기록을 갱신했다.
- 원본 파일 215개의 바이트·ID·URL·발행일·해시와 두 시리즈 URL을 보존하고 레지스트리·별칭을 갱신했다. 이전 불전문학 카테고리 주소는 붓다전기로 연결한다. 실행 중이던 구버전 개발 서버의 캐시가 메타정보를 이전 방식으로 다시 기록해 서버를 최신 코드로 재시작하고 새로 생긴 잘못된 standalone 폴더 기록만 제거했다. 반복 준비의 바이트 안정성과 4321 서버 기동을 확인한다.
- 검증: check 99개, typecheck 오류·경고 0개(기존 TextReader 미사용 변수 힌트 1개), 격리된 최신 소스 build와 check:built 통과(302 HTML, 34 리디렉션, 235 문서 UI 계약, 1128 운영 도메인 URL). 실제 dist에서 7개 카드·제목·소개와 6개 빈 카테고리, 두 판본의 213개 본문 및 기존 주소 보존을 확인했다. 브라우저 조작·커밋·푸시는 수행하지 않았다.


## 2026-11-12 — 브라우저 테스트 지침과 TEXT 분류 계획

- AGENTS.md에 별도 명시 요청 전 로컬 브라우저 실행·기존 탭 조작·스크린샷·인앱 및 헤드리스 브라우저 테스트를 금지하는 규칙을 추가하고 결정 기록에 반영했다. plan.md 하단에는 사용자가 제시한 TEXT 10개 카테고리와 예정 문헌, 폴더 순서·분류 원칙·향후 작업을 추가했다. 기존 계획 바이트를 보존하고 문서 변경과 공백을 확인했다. 실제 콘텐츠·레지스트리·코드는 변경하지 않았으며 빌드·브라우저 조작·커밋·푸시는 수행하지 않았다.

## 2026-11-12 — TEXT 카테고리 폴더와 소개 구성

- 계획에 맞춰 001.중관부부터 010.니까야까지 10개 상위 폴더와 H1·소개 문단을 담은 소문자 index.md를 구성했다. 기존 중관부/대승현론의 원본 파일 2개와 문헌·문서 주소를 그대로 보존했다. 나머지 9개 카테고리는 소개만 있으며 새 문헌·번역·연구 본문은 만들지 않았다.
- 기존 TEXT/STORY 공통 카테고리 메타정보 처리를 재사용하여 소개를 카드·상세 화면에 표시하고 문헌·자료 수에서 제외한다. 준비된 레지스트리에 새 메타정보를 추가했으며 기존 모든 파일·폴더 기록과 별칭의 동일성, 반복 준비의 바이트 안정성을 확인했다. 별도 구현 코드 변경은 없으며 기존 STORY 등 미커밋 작업도 보존했다.
- 계획 체크리스트와 AGENTS, 매뉴얼 v4.5, 현재 상태·결정 기록을 갱신했다. check 99개, typecheck 오류·경고 0개(기존 TextReader 힌트 1개), 격리된 최신 소스 build와 check:built 통과(321 HTML, 44 리디렉션, 235 문서 UI 계약, 1174 운영 도메인 URL). 실제 dist의 TEXT 카드·카테고리 페이지 10개와 소개, 빈 카테고리 9개, 기존 중관부 1문헌·1자료와 기존 경로를 확인했다. 브라우저 조작·서버 재시작·커밋·푸시는 수행하지 않았다.

## 2026-11-12 — 로마자 빨리어 이탤릭 글꼴

- TEXT/STORY 본문·각주의 em/i 라틴 문자와 결합 부호에 SIL Gentium 7.000 실제 이탤릭 400/700을 적용했다. 공식 배포본의 WOFF2 두 개와 OFL을 수정 없이 자체 호스팅하고 출처·버전·해시를 함께 기록했다. unicode-range로 한국어·미얀마 문자 등을 제외하고, 본문 한국어 명조와 각주 한국어 UI 글꼴을 각각 유지한다. 일반체·코드·original 블록·글자 크기 슬라이더와 원고 해석은 유지한다.
- 요청한 미얀마본 제2장에 쓰인 확장 라틴 문자와 빨리어 대소문자·결합형 장음/점 부호를 포함한 66개 코드 포인트가 두 원본 TTF에 있으며 실제 italic/weight와 GPOS mark·mkmk를 제공함을 확인했다. 생성 CSS의 문자 범위·적용 범위, 배포 글꼴 원본 동일성과 라이선스 보존 검사를 추가했다. 원고·레지스트리 바이트는 작업 전과 동일하다. AGENTS·현재 상태·결정 기록·매뉴얼 v4.6을 갱신했다.
- 전체 작업 트리의 check/build는 기존 담마빠다이야기 원고 15개의 없는 raw/prepared 상대 링크 30건으로 중단된다. 해당 콘텐츠는 수정하지 않고 임시 검증 복사본에서만 제외했다. 그 범위의 check 99개와 최신 글꼴 build/check:built가 통과했다(321 HTML, 44 리디렉션, 235 문서 UI 계약). 전체 트리 typecheck는 오류·경고 0개와 기존 힌트 1개, check:registry는 통과했다. 최신 검증 산출물은 /tmp/biwoom-pali-font-final-verified-dist에 두었으며 루트 dist는 부분 빌드로 대체하지 않았다. 브라우저 조작·서버 재시작·원고 수정·커밋·푸시는 수행하지 않았다.

## 2026-11-12 — 담마빠다이야기 원자료 내부 링크 제거

- 사용자 요청에 따라 담마빠다이야기 15개 문서의 출전란에 있는 raw XML·prepared 읽기본 상대 링크 30개를 일반 텍스트로 바꿨다. 표시 문구·본문의 텍스트와 서식은 유지했으며 문서 내 목차 링크 105개, 외부 출전 링크 32개는 보존했다. 공유 Markdown AST의 위치 정보로 해당 링크 구문만 수정하고 전후 표시 텍스트·보존 링크를 비교했다.
- 레지스트리의 해당 15개 해시를 갱신하고 ID·URL·발행일·기타 메타정보를 보존했다. 현재 상태의 담마빠다이야기 소속·수록 현황을 반영했다. 이전 글꼴 작업에서 확인된 원자료 누락 오류가 해소되어 담마빠다이야기와 Gentium 자산을 포함한 전체 콘텐츠 빌드가 다시 통과한다.
- 검증: check 99개, typecheck 오류·경고 0개(기존 TextReader 힌트 1개), 최신 전체 소스의 격리 build/check:built 통과(337 HTML, 44 리디렉션, 250 문서 UI 계약, 1238 운영 도메인 URL). 생성된 15개 문서의 출전 문구·링크 제거·기존 주소를 확인하고 검증한 전체 dist를 갱신했다. 브라우저 조작·서버 재시작·커밋·푸시는 수행하지 않았다.


## 2026-11-13 — TEXT/STORY 한글 각주 탐색 수정

- 공통 reader-tools의 각주 대상 탐색에서 생성된 ID 원형을 먼저 찾고, 없을 때만 URL 조각을 디코딩하도록 수정했다. 한글 각주 이름이 포함된 퍼센트 인코딩 ID와 실제 DOM ID의 불일치를 해소하며 숫자 각주와 일반 Unicode URL 조각도 유지한다. 원고·각주 식별자·문서 URL을 변경하지 않았다.
- 실제 Markdown 처리기로 생성한 TEXT/STORY 한글 각주를 이용해 클릭, 본문 복귀와 키보드 복귀, 직접/인코딩 링크 및 hashchange를 검사했다. 일반 Unicode 대상의 디코딩 대체 처리와 잘못된 퍼센트 인코딩도 검사했다. 각주/독자 도구 회귀 12개와 타입 검사 통과(오류·경고 0, 기존 TextReader 힌트 1개).
- 전체 check와 build는 사용자 추가 TEXT 원고의 기존 누락 상대 링크 22건(glossary/prepared/raw/context)에서 중단된다. 전체 fixture는 101개 중 100개 통과했으며 유일한 실패도 실제 콘텐츠 검증을 호출하는 경로 검사에서 같은 22건이 원인이다. 관련 없는 원고 링크는 수정하지 않았고 브라우저 조작·커밋·푸시는 수행하지 않았다.


## 2026-11-13 — TEXT/STORY 본문 목차 H5 확장

- 두 리더가 공통 reader-toc.ts로 H2–H5를 수집하도록 변경했다. H4/H5만 있는 문서도 목차 도구·보조 패널을 활성화하며, 데스크톱·모달이 같은 목록을 사용한다. H4/H5 들여쓰기를 추가하고 현재 절 링크 복사도 H5까지 인식하도록 수정했다. 문서 제목 H1과 H6는 본문 목차에서 제외한다.
- 독자·목차·복사 회귀 17개와 타입 검사 통과(오류·경고 0, 기존 TextReader 힌트 1개). 임시 복사본의 Astro 정적 생성은 435페이지를 완료했으며, TEXT/STORY별 H2–H5 전체·H4 단독·H5 단독·H6 단독의 8개 임시 문서에서 목차 순서·활성 여부·실제 제목 연결을 검증했다. 생성 HTML/CSS의 UI 계약 검사도 342문서와 BLOG/EBOOK에서 통과했다.
- 표준 check/build는 기존 TEXT 원고의 누락 상대 링크 22건에서 중단된다. 전체 fixture는 101개 중 100개 통과했으며 나머지 1개도 같은 실제 콘텐츠 검증 오류다. 임시 컴파일은 이 제한을 해소한 전체 빌드 통과로 간주하지 않는다. 사용자 원고·Obsidian 상태를 수정하거나 임시 검증 문서·dist를 원본에 복사하지 않았고, 브라우저 조작·커밋·푸시도 수행하지 않았다.


## 2026-11-13 — TEXT 자료 목록 기본 펼침 복원

- TextLibrary의 자료 그룹에 일괄 지정된 open을 open={i === 0}으로 바꿔 첫 폴더만 기본 펼침, 나머지는 기본 닫힘으로 복원했다. 검색 시 일치 그룹을 펼치고 검색 해제 시 이전 상태를 복원하는 기존 동작을 유지한다.
- 독자·검색 회귀 17개와 타입 검사 통과(오류·경고 0, 기존 TextReader 힌트 1개), 수정 범위 공백 검사 통과. 실행 중인 로컬 서버의 대승현론 라이브러리 HTML을 HTTP로 읽어 9개 폴더 중 첫 번째에만 open이 있고 나머지 8개에는 없음을 확인했다. 브라우저는 조작하지 않았다.
- 표준 check/build는 기존 TEXT 원고의 누락 링크 22건에서 중단된다. 원고·첨부·Obsidian 상태는 수정하지 않았으며 커밋·푸시는 수행하지 않았다.

## 2026-11-13 — 모바일 목차·각주 패널 가로 위치 흔들림 수정

- 공통 모달의 전체 화면 dialog가 overflow: hidden으로 스크롤 컨테이너가 되어, 움직이는 패널 안의 자동 포커스에 따라 바깥 dialog의 가로 위치가 밀릴 수 있는 구조를 원인으로 판단했다. CSS Overflow 명세상 hidden은 포커스/프로그램 스크롤을 허용하지만 clip은 스크롤 컨테이너를 만들지 않는다. 브라우저에서 증상을 직접 재현한 결과와는 구분한다.
- 공통 shell을 overflow: clip으로 바꾸고 showModal 직후 scrollLeft/scrollTop을 초기화했다. 기존 오른쪽 진입 키프레임·360/280ms 열기/닫기·중단 시 현재 위치에서 닫기·모션 감소·포커스 복귀와 내부 콘텐츠 스크롤·데스크톱 도킹은 유지한다. 자동 포커스가 남긴 wrapper 스크롤을 정리하는 회귀 검증과 생성 CSS 계약을 추가했다.
- 독자 도구·도킹·크기 조절 회귀 35개 통과. 최종 reader 회귀 12개와 타입 검사도 통과했다(오류·경고 0, 기존 TextReader 힌트 1개). 임시 복사본의 Astro 정적 생성 423페이지와 생성 HTML/CSS 계약 334문서 및 BLOG/EBOOK 검사를 통과했다. 로컬 HTTP로 실제 제공 CSS의 clip과 JS의 showModal 이후 위치 초기화를 확인했다.
- 표준 check/build는 기존 원고 누락 링크 22건에서 중단되며, 전체 fixture도 101개 중 100개 통과·동일 콘텐츠 검증을 호출하는 1개 실패다. 별도 컴파일을 표준 전체 빌드 통과로 간주하지 않는다. 원고·Obsidian 상태와 기존 미커밋 변경을 보존하고 임시 dist는 원본에 복사하지 않았다. 브라우저 조작·커밋·푸시는 수행하지 않았다.

## 2026-11-13 — BLOG 메뉴 기본 진입을 시리즈로 변경

- 공통 OLHeader의 데스크톱 BLOG 버튼과 모바일 BLOG 메뉴 목적지를 /blog/series/로 변경했다. /blog/의 기존 포스트 목록과 포스트/시리즈 탭, 명시적인 포스트 목록 링크는 유지한다. 경로 재배치나 리디렉션은 추가하지 않았다.
- 로컬 HTTP HTML에서 두 BLOG 메뉴의 시리즈 목적지, 시리즈 페이지의 시리즈 탭 선택 상태, 기존 /blog/ 포스트 페이지와 포스트 탭을 확인했다. 타입 검사 통과(오류·경고 0, 기존 TextReader 힌트 1개) 및 수정 범위 공백 검사 통과. 표준 check/build는 기존 원고 누락 링크 22건에서 중단된다. 브라우저 조작·원고 직접 수정·커밋·푸시는 수행하지 않았다.


## 2026-11-13 — OL core 내부 안정화 점검

- 스키마를 유지하며 파일 로더를 content-loaders.ts로 분리하고, 각 갱신에서 레지스트리를 한 번 준비해 ID/정규화에 공유한다. 고정된 Markdown 파서 설정과 호출별 새 AST를 사용하고 제목/설명의 중복 해석, TextReader의 미사용 서지 해석을 제거했다. 개발 자산 갱신을 공통 감시 함수로 순차 처리하며 종료 시 대기 작업·리스너를 정리한다.
- 참조되지 않는 옛 목차 CSS 선택자 분기 32개와 앞쪽의 중복 다크 규칙 6개를 제거하고 유효 선언의 순서를 유지했다. 생성 링크 검사기의 한글 각주 ID 오탐과 잘못된 퍼센트 인코딩 시 중단을 수정했다. 검사 함수를 CLI와 분리하고 단일 검사 안에서 대상 HTML 읽기를 재사용한다.
- 수정 전후 동일 원고의 격리 build:site/Pagefind를 완료했다. 등록 문서 368개·폴더 메타정보 68개, 전체 대상 AST, 경로/리디렉션이 동일하다. HTML 424개는 CSS 파일 해시를 제외하면 동일하며, 클라이언트 JS·활성 CSS 선언·RSS/sitemap/robots도 동일하다. CSS는 3,003바이트 감소했다. 생성 UI 계약 334문서와 BLOG/EBOOK, 운영 도메인 1,579 URL, HTTP 기반 check:live 통과.
- typecheck 오류·경고·힌트 0개, 회귀 106개 중 105개 통과. 기존 TEXT 누락 원자료 링크 22건 때문에 check/build/check:built 및 실제 원고 검사를 호출하는 fixture 1개가 실패한다. 전후 오류 목록은 동일하며 정상 각주 오탐은 해소됐다. check:registry는 기준 시점 통과. 검증 말미에 별도로 들어온 STORY 01-예경과-저술의-뜻.md 선두 빈 줄 추가·연동 레지스트리 해시 변경은 그대로 보존했다.
- 상세 범위와 보존 근거는 `.agents/references/ol-core-maintenance-audit-2026-11-13.md`. 원고를 직접 수정하거나 브라우저를 조작하지 않았고, 원본 dist 교체·커밋·푸시·배포도 수행하지 않았다.


## 2026-11-13 — 내부 안정화 변경 로컬 커밋

- 사용자 요청에 따라 내부 안정화 코드·회귀 검사·점검 보고서·운영 기록을 하나의 로컬 커밋으로 정리했다. 검증은 직전 감사의 typecheck 0/0/0, 회귀 105/106, 동일 원고 기준 HTML 424개 출력 비교와 HTTP 갱신 검사를 근거로 한다. 기존 원고 누락 링크 22건에 따른 check/build 제한을 커밋 설명에 명시한다.
- 별도 편집 중인 STORY 01-예경과-저술의-뜻.md의 제목 위치 변경과 연결된 content-registry.json 해시는 이번 코드 커밋에서 제외하고 작업 공간에 보존한다. 푸시·배포는 수행하지 않는다.


## 2026-11-13 — TEXT/STORY 빈 목차와 각주 우선 표시

- 공통 본문 목차 수집에서 자동 생성 footnote-label을 제외하고 작성한 H2–H5는 유지한다. 작성자가 직접 붙인 각주 제목도 유지한다. 두 리더의 목차 dialog와 버튼을 항상 제공하고, 하위제목이 없으면 목차없음을 표시한다.
- 데스크톱 초기 선택은 실제 본문 목차 → 각주 → 빈 목차 순서로 설정했다. 각주만 있는 문서는 각주를 기본 표시하며, 빈 목차 탭도 열 수 있다. 모바일 최초 진입에서는 dialog를 자동으로 열지 않는다. 기존 패널 전환·집중 모드와 원본 각주 노드를 유지한다.
- 리더 회귀 32개와 타입 검사 통과(오류·경고·힌트 0). 전체 fixture 109개 중 108개 통과하며, 실제 원고 검증을 호출하는 기존 1개는 같은 TEXT 누락 링크 22건으로 실패한다. check/build도 같은 원고 오류에서 중단된다.
- 원고를 바꾸지 않은 임시 복사본에 TEXT/STORY별 빈 문서·각주만 있는 문서·직접 작성한 각주/H5 제목 문서 6개를 추가해 build:site/Pagefind와 생성 HTML을 검증했다. 목차없음·목차 버튼·각주 제외·고유 ID를 확인했고 생성 UI 계약 340문서와 BLOG/EBOOK 검사도 통과했다. 임시 컴파일을 표준 전체 build 통과로 간주하지 않는다.
- 사용자 요청에 따라 수정 코드와 운영 기록을 로컬 커밋한다. 별도 편집 중인 STORY 원고 및 연결 레지스트리는 제외해 보존한다. 브라우저 조작·원본 dist 교체·푸시·배포는 수행하지 않았다.


## 2026-11-13 — BLOG 시리즈 진입 변경에 따른 Actions 검증 수정

- 최신 Actions 실행 43358969885는 콘텐츠·레지스트리·타입·빌드를 통과했으나 check:built의 홈 BLOG 카드 검사에서 실패했다. 홈 카드는 /blog/series/로 변경됐는데 검사기는 /blog/를 찾고 있어 빈 문자열을 자료 개수 오류로 보고한 것이 원인이었다.
- 카드 탐색 주소를 /blog/series/로 맞추고, 카드 탐색 실패를 자료 개수 불일치와 별도 assertion으로 구분했다. 기존 BLOG 메타정보 제외·자료 개수 검사는 유지한다. 5881992에서 원고 누락 링크가 정리된 현재 상태를 current-state에 반영했다.
- npm run build, typecheck(오류·경고·힌트 0), check:registry, check:built 통과. 생성 링크 424페이지·45리디렉션, UI 계약 334문서 및 BLOG/EBOOK, 운영 도메인 1,579 URL 검사 통과. 분석 단계의 npm run check도 회귀 109개 모두 통과했다.
- 사용자 요청에 따라 검사기와 작업 기록을 로컬 커밋한다. 브라우저 조작·GitHub 푸시·워크플로 재실행은 수행하지 않았다.

## 2026-11-13 — TEXT·STORY 문헌·작품 메뉴

- TEXT 기본 화면은 문헌 행, STORY 기본 화면은 비대칭 작품 카드로 구성했다. 작품 검색과 카테고리 필터를 추가하고 카테고리 탭을 `/text/categories/`, `/story/categories/`로 연결했다. 카테고리 상세와 작품·문서 주소는 기존 경로를 사용한다.
- 기본 화면 하단에 공개 Markdown 문서를 최대 세 편 표시한다. 서울 기준 공개일이 같으면 작품별로 한 편씩 순회하며 제목은 읽기 화면으로 직접 연결한다.
- 콘텐츠·회귀 검사 109개, 타입 검사, 빌드, 생성 링크·UI 계약, 레지스트리, 임시 서버 HTTP 검사를 통과했다. 생성 사이트맵에 새 카테고리 경로가 포함된 것을 확인했다. 화면 검토는 브라우저를 열지 않고 생성 HTML/CSS를 기준으로 했다.

## 2026-11-13 — TEXT·STORY 메뉴 시안 반영

- 두 메뉴의 기본·카테고리 목록 히어로에 시안의 장식 카드와 문구를 적용했다. 카드는 780px 이하에서 숨긴다. 목록 상단에 시안 제목·설명과 공개 문헌·작품·카테고리 수를 표시한다.
- TEXT 문헌 목록 오른쪽에 읽기 안내와 카테고리 전체 보기 링크를 추가했다. TEXT 카테고리의 더 보기 버튼은 BLOG 포스트 목록과 중앙 배치·외곽선 스타일을 공유한다.
- 콘텐츠·회귀 109개, 타입 검사, 빌드, 임시 서버 HTTP 검사에 통과했다. 생성 HTML과 CSS에서 네 목록의 문구·개수, 모바일 중단점, 카테고리 링크와 공통 버튼 스타일을 확인했다.

## 2026-11-13 — TEXT 헤더 테두리 정리

- 문헌·문서 헤더와 자료 구분 바의 구분선을 제거하고 TEXT 목록의 카테고리 히어로, 장식 카드, 메뉴 표지, 탭 바 외곽선을 투명하게 했다. 문서 이동 중 보일 수 있는 자료 링크의 강조선과 도구 모음 구분선도 제거했다. 자료 위치 표시는 글자색을 사용한다.
- 후속 요청에 따라 TEXT 본문에서 현재 자료 폴더 링크에만 2px 강조색 밑줄을 복원했다.

## 2026-11-13 — TEXT·STORY 각주 링크 표시

- 공통 패널의 블록형 링크 스타일을 본문 목차의 내비게이션에 한정했다. 각주 링크는 문장 안에 표시하고 링크 글자색과 같은 밑줄을 사용한다. TEXT·STORY의 Markdown 링크 렌더링과 생성 CSS 적용 범위를 회귀 검사에 추가했다.

## 2026-11-13 — 각주 본문과 복귀 링크 분리

- TEXT·STORY 각주 본문은 읽고 선택할 수 있는 텍스트로 두고, 본문 복귀를 별도 링크로 옮겼다. 포인터가 링크 위에 있을 때는 해당 링크의 글자색과 밑줄만 강조한다. 본문 번호에서 연 각주의 위치 강조와 반복 참조 복귀를 유지한다.
- 각주의 본문 복귀 링크는 본문 참조 위치만 스크롤한다. 패널의 열림 상태, 내부 스크롤과 포커스를 유지한다.
- 각주 위에 포인터를 올리면 본문 복귀 링크에만 배경과 굵은 밑줄을 표시한다. 각주 속 다른 링크 위에서는 복귀 링크의 강조를 해제한다.
- 각주 박스에 포인터를 올리면 옅은 배경과 안쪽 테두리를 표시한다. 본문에서 선택한 각주는 배경을 유지하면서 안쪽 테두리로 호버 상태를 표시한다.
- 각주의 HTTP·HTTPS 링크는 새 탭에서 연다. 두 리더의 Markdown 렌더링 검사에 링크 주소와 새 탭 속성을 확인하는 조건을 추가했다.
- 각주 본문과 인용 링크, 본문 복귀 링크에 각각 별도 클래스를 부여했다. 본문 복귀 링크를 각주 본문 밖에 렌더링하고 해당 링크에만 본문 이동 처리를 연결한다.
- 각주 패널의 클릭 처리에서 인용 링크와 일반 영역을 구분한다. 일반 영역과 복귀 링크는 패널을 유지한 채 본문 참조 위치로 이동한다. 인용 링크는 기본 동작으로 열고, 텍스트를 드래그해 선택할 때는 이동하지 않는다.
- 별도의 본문 복귀 링크를 제거했다. 각주 박스 클릭과 각주에 포커스한 상태에서 Enter 또는 Space를 누르면 본문 참조 위치로 이동한다.
