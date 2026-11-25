---
name: ol-deploy-check
description: Verify BIWOOM HUB build and GitHub Pages deployment readiness. Use when changing Astro config, GitHub Pages settings, deployment workflows, repository names, base paths, robots.txt, RSS, sitemap, public assets, or when diagnosing links at https://biwoom.github.io/hub/.
---

# OL Deploy Check

## Workflow

1. Confirm repository and remote state:

```sh
git remote -v
git status --short --branch
```

2. Confirm GitHub Pages project configuration:
   - `astro.config.mjs` uses `site: HOME_URL` and `base: SITE_BASE` from `site-config.mjs`. Production uses `https://biwoom.github.io/hub/` from `biwoom/hub`.
   - Use the default GitHub Pages domain with the GitHub Actions source. The root site at `https://biwoom.github.io/` is the HOME destination.
   - HUB's `ol-core/public/robots.txt` should point to `https://biwoom.github.io/hub/sitemap-index.xml`.
   - Apply the `/hub` prefix to generated links, search results, downloads and canonical metadata. Keep registry routes HUB-relative.

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

6. If checking the live site, use HTTP headers first:

```sh
curl -I -L https://biwoom.github.io/hub/
curl -I -L https://biwoom.github.io/hub/sitemap-index.xml
```

## Expected Results

- Build succeeds.
- Generated site links use paths such as `/hub/blog/`.
- Canonical, sitemap and RSS URLs start with `https://biwoom.github.io/hub/`.
- GitHub Pages Source is GitHub Actions.
- Confirm private assets and deleted content are absent from dist.
- Local checks, GitHub push and Actions/live deployment verification are separate. Inspect deployment only when requested.

## Common Failure Modes

- Astro `base` is omitted or the prefix is applied twice.
- A root-relative link escapes HUB or a Pagefind result opens the former root path.
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

### 2026-11-25 — BIWOOM HUB

- Verify the `/hub/` project deployment, site-relative registry, and HOME destination.
