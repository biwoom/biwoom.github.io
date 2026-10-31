# Current State

Last updated: 2026-10-31

## Brand

- Public brand: BORIDO (보리도). OL is the source-code core name.
- Official logo originals: public/brand/borido-mark-monochrome.png (004) and borido-mark-gold.png (006). Header/footer use monochrome inside dark rounded boxes; favicon/apple/sharing assets use monochrome. Gold remains an available source asset. Rebuild derived icons with npm run brand:assets.
- docs/ legacy plans carry historical-status notices; current structure remains TEXT/STORY/BLOG.
- Future domain: `borido.org`; no domain migration has been performed.

## Project

- BORIDO (보리도), powered by the OL core: `https://biwoom.github.io/`, repository `biwoom/biwoom.github.io`.
- Astro 6 static site; Pagefind search; GitHub Actions → GitHub Pages root deployment, no Astro `base`.
- Refactor commit `f70b680` was pushed to `origin/main` on 2026-10-30. Production deployment completion has not been verified.

## Menu Accents

- HOME #00d3f3, TEXT #f0b100, STORY #7ccf00; BLOG retains its existing palette.
- BaseLayout derives the menu from the route; tokens and components/menu-accents.css scope selection/button accents in both color modes. HOME and TEXT/STORY menu roots retain accent hero gradients. TEXT/STORY category-detail heroes use a 4% accent tint and compact 40px/28px padding (28px/20px at <=900px). Series/document heroes remain transparent; document padding is 20px/16px (16px/12px mobile) with 20px bottom margin. All retain 40px titles (30px at <=900px). Menu-root category cards and category-detail series rows share the 4% tint, increasing to 8% on hover/keyboard focus, with theme-aware background mixing. Category/list containers use max-width 1200px and 32px horizontal padding, with left-aligned headings/descriptions.

## Current Architecture

- `src/content/` is the user's Obsidian vault and content source. Vault CMS/Front Matter/Decap CMS are not used.
- Public content menus: TEXT/STORY/BLOG. HOME remains the landing page and `pages` contains the brand document.
- TEXT path: category/work/material-section/item. STORY path: category/series/part/item. `index.md` is an optional introduction.
- TEXT/STORY menu roots display top-level folders as three-column category cards, linking to category-specific single-column series rows (number, title, optional description, material/part metadata and arrow), separated by thin rules rather than cards. List areas display 카테고리 목록 on roots and 시리즈 목록 on category details; only category-detail heroes have a bottom divider. Empty folders remain visible; `.gitkeep` retains empty categories in Git. Category routes use ASCII hashes; document/series registry URLs and dates remain unchanged.
- Numeric name prefixes determine order and are hidden in labels. Translation and research are independent.
- TEXT/STORY share series links and expandable lists, not actual tab panels. Both individual document views now use the same `StoryReader` and STORY styling by explicit user request. Breadcrumbs/search section/category/URLs remain collection-specific; TEXT displays material-section/item labels. The unused TEXT-only reader/layout have been removed. BLOG retains its dedicated original list/detail templates.
- TEXT/STORY document part navigation starts with a home-icon link back to the current series/library page.
- TEXT/STORY individual readers span the available viewport width with a left document list and a wide article; prose is capped at 1200px. The article toolbar aligns to the right of the document header, whose title is capped at 1200px, and stays sticky below the desktop site/part navigation and shows a desktop 목차 label beside its icon. It opens one right-edge TOC drawer on desktop/mobile; no right TOC column or separate mobile TOC remains. Native dialog handles focus containment, with close/Escape/backdrop dismissal and active H2/H3 indication.
- Optional tags use plain arrays (`tags: [수메다, 수밋따]`), without classification prefixes or inheritance. TEXT/STORY/BLOG detail titles are followed by tags only when present. BLOG supplies tag-count chips combined with year filters/pagination and ?tag links; untagged posts remain in All. Series tag menus/modals and prefix-filter code are removed. Series heroes keep their background/alignment with compact 24px/20px padding (20px/16px mobile), 12px description gap and 32px bottom margin.
- YAML-free Markdown is supported. Title priority: optional title override → first H1 → descriptive filename. Summary and reading time are computed.
- `scripts/lib/content.mjs` provides shared parsing/normalization, with `src/content.config.ts` defining normalized schema and loaders.
- `content-registry.json` is committed, auto-maintained source metadata for stable URLs/dates/previous paths. `scripts/prepare-content.mjs` updates it.
- `_drafts`/templates/dotfolders are excluded. Public folders default to published; explicit false and hidden series intros are preserved.
- `src/content/media/` remains a public asset namespace with no per-image content records. The auxiliary `/media/` gallery has first-subfolder categories (numeric prefixes hidden), a root-file 미분류 category, responsive CSS-column masonry and native-dialog original-image viewing with fit/original zoom. Root files keep their URLs. Home statistics count gallery source images and link to it; the footer also links, while desktop/mobile main menus omit MEDIA. Previews are cached WebP derivatives under `public/generated/media-gallery/`; `.astro/media-gallery-cache.json` is private generated metadata. Asset sync/dev refresh prepare thumbnails; page/stat reads share preparation and generated previews never affect counts.
- Historical path/checksum mapping remains `.agents/references/shared-media-migration.json`; the old media/ATLAS archives have since been deleted by the user and are not restored.
- General source attachments are synced to `public/generated/content/` and relative Markdown links are resolved by `scripts/remark-content.mjs`.
- DESIGN/NET/Entity/Ontology active collections, UI and provider settings are removed. Migrated ordinary TEXT visual/reference material was subsequently deleted by the user. Deleted sources are not restored; only redirects with a currently public destination are rendered. Original migration inventory remains historical evidence.
- User deletions of historical archive material remain in place; archive references in old work logs describe earlier states.
- Common settings: `site-config.mjs`, app entry `src/lib/site-config.ts`. No DESIGN asset env vars are required.
- Validation: `npm run check`, `npm run typecheck`, `npm run build`, `npm run check:built`, `npm run check:registry`; optional `npm run check:live` runs a temporary project/server and cleans up afterward. Built checks cover static attachment HTML dependencies and UI contracts. Shared pagination remains; DocumentTags renders optional document-only plain tags, and BLOG filters exact tags with year archives. Series tag modals are retired.
- Search and mobile-sheet styles are shared files independent of retired ATLAS CSS. Closed overlays start with `hidden`/`inert` and keep their `aria-hidden` state synchronized.

## Documentation

- Authoring: `.agents/references/ol-home-content-management-manual.md`.
- Refactor guide and implementation notes: `.agents/references/obsidian-content-refactor-guide.md`.
- Original migration mapping: `.agents/references/content-migration-inventory.json`.
- Subsequent deletion and migration status: `.agents/references/content-deletion-followup.json`.

## Known Limits and Follow-ups

- Content engine code changes require a full development-process restart. A stale native parser can keep rewriting registry series keys and merge a category into a single series even when the new static build is correct. Runtime category checks must assert actual series titles/counts. The previous root/category HTTP check inspected only view markers and missed this stale grouping.

- Transition audit: `.agents/references/obsidian-transition-audit.md`. The reported defects are fixed in the follow-up implementation: common asset publication checks, canonical introduction URLs, safe TOC removal, manual alias flattening, full collection watcher refresh, typed author input and shared rights rendering. Current verification is recorded in work-log.

- Renaming/moving unchanged content is matched by hash. Simultaneous move+edit while the dev server is stopped, or duplicate-content ambiguity, requires `npm run content:move -- old new` before preparation.
- Obsidian wikilinks, block references and special embeds are not supported; use standard Markdown links.
- New BLOG dates use Asia/Seoul and represent first publication preparation unless explicitly overridden; existing dates/rights are preserved.
- Earlier dev-server/browser attempts were blocked during the original refactor. The follow-up audit fixes passed HTTP integration checks on a temporary development server: introduction public/private/public transitions, Markdown/PDF refresh, new folder/document discovery and BLOG rights rendering. Browser visual/interaction QA remains unverified; static CSS/markup contracts supplement these HTTP checks.
- No GitHub push or Actions/deployment inspection is included without a user request.
