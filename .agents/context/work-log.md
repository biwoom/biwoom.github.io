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

## Follow-ups

- Keep this file updated after meaningful work.
- After GitHub upload/deploy requests, record the final pushed commit and deployment result.
- If deployment status is checked through GitHub Actions, add the run result here.
