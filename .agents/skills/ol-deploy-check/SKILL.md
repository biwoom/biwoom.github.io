---
name: ol-deploy-check
description: Verify BORIDO (OL 코어) build and GitHub Pages deployment readiness. Use when changing Astro config, GitHub Pages settings, deployment workflows, repository names, root/base paths, robots.txt, RSS, sitemap, public assets, or when diagnosing 404s and broken links on https://borido.org/.
---

# OL Deploy Check

## Workflow

1. Confirm repository and remote state:

```sh
git remote -v
git status --short --branch
```

2. Confirm root GitHub Pages configuration:
   - `astro.config.mjs` should set `site: SITE_URL`, imported from `site-config.mjs` (https://borido.org).
   - `astro.config.mjs` should not set `base`.
   - Production is `https://borido.org`; repository remains `biwoom/biwoom.github.io`. Custom GitHub Actions deployment does not require or use a CNAME file.
   - Verify DNS and HTTPS separately from local build output; a local URL change cannot fix DNS or certificate issuance.
   - `public/robots.txt` should point to `https://borido.org/sitemap-index.xml`.
   - `src/pages/rss.xml.ts` should not hardcode `/ol-home` or `/biwoom`.

3. Search for stale deployment paths:

```sh
rg "biwoom.github.io/(ol-home|biwoom)|/ol-home|/biwoom|base:" astro.config.mjs public src README.md AGENTS.md .agents
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
curl -I -L https://borido.org/
curl -I -L https://borido.org/sitemap-index.xml
```

## Expected Results

- Build succeeds.
- Generated routes are root-relative, for example `/blog/`, not `/biwoom/blog/`.
- Sitemap URLs start with `https://borido.org/`.
- RSS item links start with `https://borido.org/`.
- GitHub Pages Source is GitHub Actions.
- Confirm private assets and deleted content are absent from dist.
- Local checks, GitHub push and Actions/live deployment verification are separate. Inspect deployment only when requested.

## Common Failure Modes

- Repository is named `biwoom` instead of `biwoom.github.io`, causing project page URL `/biwoom/`.
- Astro `base` is accidentally set after moving to a user Pages repository.
- Browser cache or GitHub Pages CDN delay shows a stale 404.
- Git remote still points at the pre-rename repository URL.
- New content is not committed because it is untracked.

## Reporting

Report:

- The changed files relevant to deployment.
- Whether `npm run build` passed.
- The generated route count if available.
- Any remaining warnings.
- Concrete next action for GitHub settings or push, if needed.
