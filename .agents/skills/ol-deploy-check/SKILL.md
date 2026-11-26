---
name: ol-deploy-check
description: Verify the BIWOOM HOME build and review the inherited GitHub Pages configuration before any hosting changes.
---

# BIWOOM HOME 빌드·배포 검사

2026-11-26 · BIWOOM HOME · 공개 주소 미정

현재 `origin`, `SITE_URL`과 Pages 워크플로는 원본 사이트 설정이다. 아래 도메인 기준은 가져온 설정의 일관성 검사에 적용한다. HOME 배포를 다룰 때는 실제 대상 저장소와 주소에 맞춰 경로·워크플로를 검토한다. 기존 `origin/main`의 푸시는 원본 사이트 배포를 시작할 수 있다.

## Workflow

1. Confirm repository and remote state:

```sh
git remote -v
git status --short --branch
```

2. Confirm root GitHub Pages configuration:
   - `astro.config.mjs` should set `site: SITE_URL`, imported from `site-config.mjs` (https://biwoom.github.io).
   - `astro.config.mjs` should not set `base`.
   - Production is `https://biwoom.github.io`; repository remains `biwoom/biwoom.github.io`. The default GitHub Pages domain requires no CNAME file; GitHub Pages Custom domain must be empty.
   - Local URL changes do not clear GitHub Pages Custom domain. For default-domain deployment, remove any existing custom domain in repository Settings → Pages; this is separate from build validation.
   - `ol-core/public/robots.txt` should point to `https://biwoom.github.io/sitemap-index.xml`.
   - `ol-core/src/pages/rss.xml.ts` should not hardcode `/ol-home` or `/biwoom`.

3. Search for stale deployment paths:

```sh
rg "biwoom.github.io/(ol-home|biwoom)|/ol-home|/biwoom|base:" astro.config.mjs ol-core/public ol-core/src README.md AGENTS.md .agents
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
curl -I -L https://biwoom.github.io/
curl -I -L https://biwoom.github.io/sitemap-index.xml
```

## Expected Results

- Build succeeds.
- Generated routes are root-relative, for example `/blog/`, not `/biwoom/blog/`.
- Sitemap URLs start with `https://biwoom.github.io/`.
- RSS item links start with `https://biwoom.github.io/`.
- GitHub Pages Source is GitHub Actions.
- Confirm private assets and deleted content are absent from dist.
- Local checks, GitHub push and Actions/live deployment verification are separate. Inspect deployment only when requested.

## Common Failure Modes

- Repository is named `biwoom` instead of `biwoom.github.io`, causing project page URL `/biwoom/`.
- Astro `base` is accidentally set after moving to a user Pages repository.
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

### 2026-11-26 — HOME 배포 대상 상태

- 기존 Pages 설정은 원본 사이트 기준이며 HOME의 공개 주소와 저장소는 미결임을 명시했다.
