# Current State

Last updated: 2026-06-20

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
- `src/content/design/` holds DESIGN metadata and source assets.
- `src/content/blog/` holds dated work logs.
- `src/content/entities/` and `src/content/ontology/` hold knowledge graph material.
- `public/atlas/` holds static ATLAS HTML archives.
- `public/generated/` is generated from content assets and should not be committed.
- TEXT and STORY document-level Entity links use a shared `entities: string[]` frontmatter field.
- TEXT and STORY detail pages can render a right-side Entity name-card panel from the document `entities` list.
- `NET` is now a first-class public menu with:
  - `/net/` as the entry page
  - `/net/explore/` as the Entity name-card exploration view
- The main public header currently exposes `HOME`, `TEXT`, `STORY`, `DESIGN`, `NET`, plus a separate `BLOG` action.
- Typography now defaults site-wide to the sans body stack for general UI and content.
- Mono typography is reserved for code-like surfaces such as `code`, `pre`, `kbd`, `samp`, and explicit code-chip style elements.
- Shared semantic typography classes now use `ol-meta-label` and `ol-section-label` instead of the older mono-named labels.

## Deployment State

- GitHub Pages root deployment is the intended mode.
- `astro.config.mjs` should set `site: 'https://biwoom.github.io'`.
- Astro `base` should not be set.
- `public/robots.txt` and `src/pages/rss.xml.ts` should remain root-URL aware.
- `.github/workflows/deploy.yml` builds and deploys on pushes to `main`.
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
- Added Concept Entity test cards for `five-aggregates` and `twelve-sense-bases`.
- Added the first public NET implementation slice:
  - `/net/`
  - `/net/explore/`
  - shared name-card behavior across NET, TEXT, STORY, and ENTITY
- Unified the default site typography so UI labels and metadata use the shared `--ol-font-ui` stack by default.
- Menu/main/detail pages now use `.ol-meta-badge` and inherited sans typography for badges, tags, and helper text.

## Open Follow-ups

- Keep context files updated after meaningful implementation, documentation, deployment, or repository-management work. Do not couple routine GitHub upload requests to automatic work-log commits.
- Consider adding examples to OL content skills if future content tasks reveal repeated patterns.
- Keep deployment docs aligned if GitHub Pages settings or repository naming changes again.
- If older planning docs mention STORY `primaryEntities` or `primaryPlaces`, treat them as historical notes; current TEXT/STORY document linking uses `entities`.

## Known Acceptable Warnings

- `npm run build` currently warns when `src/content/ai` has no md/mdx files. This is acceptable unless AI content is being added.
