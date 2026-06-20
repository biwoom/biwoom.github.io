# AGENTS.md

## Project

This repository is OL HOME, the public Astro site for the OL project.

- Production URL: `https://biwoom.github.io/`
- GitHub Pages repository: `biwoom/biwoom.github.io`
- Runtime: static Astro site
- Content source: `src/content/`

## Repository Rules

- Keep Astro configured for GitHub Pages root deployment. Do not add `base` to `astro.config.mjs`.
- Treat `src/content.config.ts` as the source of truth for content frontmatter schemas.
- Keep generated output out of commits: `dist/`, `.astro/`, `node_modules/`, and `public/generated/`.
- Keep root-level temporary source documents out of commits after they are moved into the correct content collection.
- Prefer ASCII filenames for code and route-bearing files. Korean document titles belong in frontmatter and body text.

## Project Context

- Before major work, read `.agents/context/current-state.md` and `.agents/context/decisions.md` if they exist.
- Use `.agents/context/work-log.md` to understand recent work and unresolved follow-ups.
- Use `.agents/references/ol-home-content-management-manual.md` for internal OL HOME content management rules.
- Keep context files concise. They are continuity records, not full transcripts.
- Update `.agents/context/current-state.md` when project structure, deployment status, active priorities, or known risks change.
- Update `.agents/context/decisions.md` when a durable architectural, content, naming, deployment, or workflow decision is made.
- Update `.agents/context/work-log.md` after meaningful implementation, documentation, deployment, or repository-management work.
- When the user asks to upload, publish, push, or deploy to GitHub, prepare the work-log entry before the push, then include the code changes and log update in the same commit when possible. Complete the GitHub push without pausing for deployment checks. Avoid a second push just for the log unless the log genuinely cannot be included in the original commit. Do not wait for or inspect GitHub Pages deployment completion unless the user explicitly asks for deployment verification.

## Content Placement

- `src/content/pages/`: permanent project documents, brand rules, operating manuals.
- `src/content/blog/`: dated project logs and production notes.
- `src/content/text/`: translated or annotated Buddhist text documents.
- `src/content/story/`: narrative Buddhist series and chapters.
- `src/content/design/`: visual works and infographics with metadata.
- `src/content/entities/`: ontology entries for people, places, concepts, texts, events, practices, and schools.
- `src/content/ontology/`: entity and relation type documentation.

## Content Workflow

- Use `published: true` for content that should appear on the site.
- For TEXT and STORY user-facing tags, prefer `prefix/name` form such as `개념/연기`.
- For manuals and rule documents, include the latest update date in the body and maintain a `수정 변경사항` section at the bottom.
- For DESIGN and STORY assets, keep source assets under `src/content/**/assets/`; `public/generated/` is derived by `npm run sync:assets`, which incrementally syncs changed files and removes stale generated files.

## Verification

- Run `npm run build` after content, route, layout, or config changes.
- Confirm new permanent pages are generated under the expected route, for example `dist/pages/{slug}/index.html`.
- If GitHub Pages routing changes, verify `astro.config.mjs`, `public/robots.txt`, `src/pages/rss.xml.ts`, and generated sitemap/RSS paths together.

## Deployment

- GitHub Pages Source should be GitHub Actions.
- The deploy workflow is `.github/workflows/deploy.yml`.
- Pushing to `main` should build and publish the site.
- Root URL errors usually indicate GitHub Pages settings, Actions status, CDN delay, or an accidental Astro `base`.
- After push work, record the pushed commit/branch and any follow-up in `.agents/context/work-log.md`. Record deployment status only when it was explicitly checked or requested.

## Codex Skills

- Use `$ol-content-authoring` for adding or revising `src/content` entries.
- Use `$ol-doc-maintenance` for maintaining manuals, brand docs, and project rules.
- Use `$ol-deploy-check` before or after deployment-related changes.
- Use `$ol-github-upload-log` when the user asks to upload, push, publish, or deploy current changes to GitHub and record the result.
