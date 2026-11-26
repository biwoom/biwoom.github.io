---
name: ol-deploy-check
description: Verify BIWOOM build and GitHub Pages deployment readiness. Use when changing Astro config, GitHub Pages settings, deployment workflows, repository names, base paths, robots.txt, RSS, sitemap, public assets, or when diagnosing links at https://biwoom.github.io/.
---

# BIWOOM Deploy Check

## Workflow

1. Confirm repository and remote state:

```sh
git remote -v
git status --short --branch
```

2. Confirm the root GitHub Pages configuration:
   - `astro.config.mjs` uses `site: SITE_URL` without a path prefix. The production target is `https://biwoom.github.io/` from `biwoom/biwoom.github.io`. Use GitHub Actions as the Pages source.
   - Use root URLs for canonicals, internal links, search and downloads, and verify the root sitemap in robots.txt.
   - Build compatibility redirects for older `/hub/` pages after generating Pagefind, and check that they land on existing root pages.

3. Search for stale deployment paths:

```sh
rg 'biwoom\.github\.io|/ol-home|base:' astro.config.mjs site-config.mjs ol-core/public/robots.txt ol-core/src README.md AGENTS.md .agents
```

4. Build locally:

```sh
npm run check
npm run typecheck
npm run build
npm run check:built
npm run check:registry
```

5. Inspect generated artifacts when relevant:

```sh
sed -n '1,80p' dist/sitemap-index.xml
sed -n '1,80p' dist/rss.xml
```

   `check:built` verifies the local `dist/` output. `npm run check:dev` exercises content changes on a temporary local server.

6. If checking the live site, use HTTP headers first:

```sh
curl -I -L https://biwoom.github.io/
curl -I -L https://biwoom.github.io/sitemap-index.xml
```

## Expected Results

- Build succeeds.
- Generated site links use paths such as `/blog/`.
- Canonical, sitemap and RSS URLs start with `https://biwoom.github.io/`.
- GitHub Pages Source is GitHub Actions.
- Confirm private assets and deleted content are absent from dist.
- Local checks, GitHub push and Actions/live deployment verification are separate. Inspect deployment only when requested.

## Common Failure Modes

- Astro `base` or an obsolete prefix is reintroduced.
- A stale link or indexed Pagefind result uses the old deployment prefix.
- Browser cache or GitHub Pages CDN delay shows a stale 404.
- Git remote still points at the pre-rename repository URL.
- New content is not committed because it is untracked.
- macOS NFD filenames and Linux NFC checkout paths can make check:content rewrite a committed registry before check:registry runs. Use the shared NFC path boundary and preserve IDs/URLs/dates; do not disable the HEAD comparison or repeatedly commit platform-dependent keys. Unicode fixtures cover canonical registry stability, native NFD assets and collision errors.

## Reporting

Report:

- The changed files relevant to deployment.
- Whether `npm run build` passed.
- The generated route count if available.
- Any remaining warnings.
- Concrete next action for GitHub settings or push, if needed.

## 수정 변경사항

### 2026-11-26 — HUB address and verification scope

- Record the independent HUB origin and the local artifact and development checks.

### 2026-11-25 — BIWOOM HUB

- Verify the `/hub/` project deployment, site-relative registry, and HOME destination.
