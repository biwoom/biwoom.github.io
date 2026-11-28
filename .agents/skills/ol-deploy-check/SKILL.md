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

4. Choose local checks by the change and the question being investigated. Follow [Local verification](../../../AGENTS.md#local-verification).
   - For a live-route or deployment-status report, inspect the relevant commit, workflow result or HTTP response. Use a local build when it is needed to reproduce or compare the output.
   - For changes to routes, redirects, deploy configuration, or public output generation, run `npm run build` and inspect the affected pages and assets. Use `npm run check:built` for changes affecting shared or site-wide output.
   - Use `npm run check:content` when content rules need validation, and `npm run typecheck` for typed changes. The build includes content validation. Add `npm run check:content:fixtures` when a build also needs the full regression suite. Run `npm run check:registry` to check the committed registry against HEAD.

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

- When a build is needed, it succeeds and the affected output matches the change.
- Generated site links use paths such as `/blog/`.
- Canonical, sitemap and RSS URLs start with `https://biwoom.github.io/`.
- GitHub Pages Source is GitHub Actions.
- Confirm private assets and deleted content are absent from dist.
- For story-card output changes, verify the hero card, its article link, and assets for public articles in the relevant built pages. Use `npm run check:built` for shared-output changes. Source HTML and drafts should have no standalone output.
- When adding or replacing card illustrations, confirm the built card points to the WebP derivative of the original artwork.
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
- The checks run and their results.
- The generated route count if available.
- Any remaining warnings.
- Concrete next action for GitHub settings or push, if needed.

## 수정 변경사항

### 2026-11-28 — 변경 영향별 검증

- 공개 사이트 상태 확인과 로컬 생성본을 검증해야 하는 변경의 기준을 정리했다.

### 2026-11-27 — Story-card output

- Record the generated-page checks for the hero, article links and eligible card assets, including WebP references for new or replacement illustrations.

### 2026-11-26 — HUB address and verification scope

- Record the independent HUB origin and the local artifact and development checks.

### 2026-11-25 — BIWOOM HUB

- Verify the `/hub/` project deployment, site-relative registry, and HOME destination.
