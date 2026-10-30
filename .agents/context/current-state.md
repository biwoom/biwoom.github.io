# Current State

Last updated: 2026-10-30

## Project

- OL HOME: `https://biwoom.github.io/`, repository `biwoom/biwoom.github.io`.
- Astro 6 static site; Pagefind search; GitHub Actions → GitHub Pages root deployment, no Astro `base`.
- Current refactor is local and has not been uploaded or verified on production.

## Current Architecture

- `src/content/` is the user's Obsidian vault and content source. Vault CMS/Front Matter/Decap CMS are not used.
- Public content menus: TEXT/STORY/BLOG. HOME remains the landing page and `pages` contains the brand document.
- TEXT path: category/work/material-section/item. STORY path: series/part/item. `index.md` is an optional introduction.
- Numeric name prefixes determine order and are hidden in labels. Translation and research are independent.
- TEXT/STORY share series links and expandable lists, not actual tab panels. Both individual document views now use the same `StoryReader` and STORY styling by explicit user request. Breadcrumbs/search section/category/URLs remain collection-specific; TEXT displays material-section/item labels. The unused TEXT-only reader/layout have been removed. BLOG retains its dedicated original list/detail templates.
- YAML-free Markdown is supported. Title priority: optional title override → first H1 → descriptive filename. Summary and reading time are computed.
- `scripts/lib/content.mjs` provides shared parsing/normalization, with `src/content.config.ts` defining normalized schema and loaders.
- `content-registry.json` is committed, auto-maintained source metadata for stable URLs/dates/previous paths. `scripts/prepare-content.mjs` updates it.
- `_drafts`/templates/dotfolders are excluded. Public folders default to published; explicit false and hidden series intros are preserved.
- General source attachments are synced to `public/generated/content/` and relative Markdown links are resolved by `scripts/remark-content.mjs`.
- DESIGN/NET/Entity/Ontology active collections, UI and provider settings are removed. Existing assets/prose are ordinary TEXT materials; old detail URLs redirect.
- Legacy ATLAS HTML is preserved outside public output at `.agents/archive/atlas/`.
- Common settings: `site-config.mjs`, app entry `src/lib/site-config.ts`. No DESIGN asset env vars are required.
- Validation: `npm run check`, `npm run typecheck`, `npm run build`, `npm run check:built`. The last command checks both links and rendered markup/compiled CSS regressions. Shared tag modal and paginator remain in use.
- Search and mobile-sheet styles are shared files independent of retired ATLAS CSS. Closed overlays start with `hidden`/`inert` and keep their `aria-hidden` state synchronized.

## Documentation

- Authoring: `.agents/references/ol-home-content-management-manual.md`.
- Refactor guide and implementation notes: `.agents/references/obsidian-content-refactor-guide.md`.
- Original migration mapping: `.agents/references/content-migration-inventory.json`.

## Known Limits and Follow-ups

- Renaming/moving unchanged content is matched by hash. Simultaneous move+edit while the dev server is stopped, or duplicate-content ambiguity, requires `npm run content:move -- old new` before preparation.
- Obsidian wikilinks, block references and special embeds are not supported; use standard Markdown links.
- New BLOG dates represent first publication preparation unless explicitly overridden; existing dates/rights are preserved.
- The dev server command was rejected by automatic approval policy (`.codex/rules/default.rules` requires confirmation for a persistent process; approval mode is never). The browser access host was also unavailable and native Chrome access was denied during the style repair; browser interaction and live watcher behavior remain unverified. Static CSS/markup contracts now supplement build checks.
- No GitHub push or Actions/deployment inspection is included without a user request.
