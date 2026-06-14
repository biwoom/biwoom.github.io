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
