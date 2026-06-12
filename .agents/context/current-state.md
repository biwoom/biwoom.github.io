# Current State

Last updated: 2026-06-12

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
- `src/content/pages/` holds permanent project documents and manuals.
- `src/content/text/` holds TEXT series and documents.
- `src/content/story/` holds STORY series and chapters.
- `src/content/design/` holds DESIGN metadata and source assets.
- `src/content/blog/` holds dated work logs.
- `src/content/entities/` and `src/content/ontology/` hold knowledge graph material.
- `public/atlas/` holds static ATLAS HTML archives.
- `public/generated/` is generated from content assets and should not be committed.

## Deployment State

- GitHub Pages root deployment is the intended mode.
- `astro.config.mjs` should set `site: 'https://biwoom.github.io'`.
- Astro `base` should not be set.
- `public/robots.txt` and `src/pages/rss.xml.ts` should remain root-URL aware.
- `.github/workflows/deploy.yml` builds and deploys on pushes to `main`.

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
- Added and updated public OL project manuals:
  - `/pages/brand/`
  - `/pages/content-management-manual/`
- Added Codex project guidance, skills, config, and rules.
- Added continuity context documents under `.agents/context/`.

## Open Follow-ups

- Keep context files updated after meaningful work and after GitHub upload/deploy requests.
- Consider adding examples to OL content skills if future content tasks reveal repeated patterns.
- Keep deployment docs aligned if GitHub Pages settings or repository naming changes again.

## Known Acceptable Warnings

- `npm run build` currently warns when `src/content/ai` has no md/mdx files. This is acceptable unless AI content is being added.
