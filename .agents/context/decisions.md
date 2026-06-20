# Decisions

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

### GitHub Upload Logging

- When the user asks to upload, publish, push, or deploy to GitHub, complete the requested operation first.
- Do not pause after push to check GitHub Pages or GitHub Actions deployment completion unless the user explicitly asks for deployment verification.
- After the operation, update `.agents/context/work-log.md` with:
  - date
  - commit or pushed branch
  - local validation result if it was already run
  - deployment result only if explicitly checked
  - follow-up items
- If the final log update happens after the push, create a follow-up commit when appropriate.
- This workflow is captured in `$ol-github-upload-log`.

### GitHub Push Command Policy

- `git push origin main` is the default OL HOME upload target and may run directly when the user explicitly asks to upload, publish, push, or deploy current changes.
- Other `git push` targets should still require confirmation.

### Internal Content Management Manual

- `src/content/pages/content-management-manual.md` should not be maintained as a public homepage page.
- The OL HOME content management manual belongs at `.agents/references/ol-home-content-management-manual.md`.
- Public `pages` content should be limited to visitor-facing permanent documents such as the brand definition.

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

### DESIGN Download Filenames

- DESIGN detail-page download links for PDF and image assets should use the content title and version as the browser download filename.
- The filename format is `{title}-v{version}{original_extension}`.
- The HTML asset action remains a view/open link, not a forced download.
