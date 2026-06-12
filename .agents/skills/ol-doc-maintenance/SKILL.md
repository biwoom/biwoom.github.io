---
name: ol-doc-maintenance
description: Maintain OL HOME manuals, brand documents, AGENTS.md, README.md, and project rule documents. Use when updating durable project guidance, Codex rules, content management manuals, brand definitions, changelog sections inside docs, or documentation that governs how OL HOME should be operated.
---

# OL Doc Maintenance

## Workflow

1. Classify the document:
   - Public permanent document: `src/content/pages/{slug}.md`.
   - Repository operating rule: `AGENTS.md`.
   - Contributor overview: `README.md`.
   - Codex local workflow: `.agents/skills/{name}/SKILL.md`.
   - Codex execution setting: `.codex/config.toml` or `.codex/rules/*.rules`.
2. Read the current version before editing.
3. Align content with the current codebase, not older project names or routes.
4. For public manuals in `src/content/pages/`, keep frontmatter limited to the `pages` schema:

```yaml
---
title: "문서 제목"
description: "문서 설명"
published: true
---
```

5. Put document version, latest update date, target project, and deployment URL in the body.
6. Add or update a bottom section named `수정 변경사항`.
7. Run `npm run build` after public content changes.

## Current OL HOME Facts

- Production URL: `https://biwoom.github.io/`
- GitHub Pages repository: `biwoom/biwoom.github.io`
- Astro `base` should not be set.
- Content source root: `src/content/`
- Generated asset output: `public/generated/`
- Deploy workflow: `.github/workflows/deploy.yml`

## Document Placement

- Brand definition: `src/content/pages/brand.md`.
- Content management manual: `src/content/pages/content-management-manual.md`.
- Repo-wide Codex guidance: `AGENTS.md`.
- Reusable Codex workflows: `.agents/skills/`.

## Style

- Use clear Korean for project-facing documents.
- Keep route slugs and filenames ASCII.
- Keep operational instructions concrete: paths, commands, expected routes.
- Avoid stale references to project-page URLs such as `/ol-home` or `/biwoom` unless documenting history.
- When describing generated files, say not to commit `dist/`, `.astro/`, `node_modules/`, or `public/generated/`.

## Validation

- Run `npm run build` for public document changes.
- Confirm new pages appear in build output.
- Search for stale deployment paths when updating deployment docs:

```sh
rg "ol-home|/biwoom|base:" astro.config.mjs public src README.md AGENTS.md .agents
```
