---
name: ol-doc-maintenance
description: Maintain OL HOME manuals, brand documents, AGENTS.md, README.md, and project rule documents. Use when updating durable project guidance, Codex rules, content management manuals, brand definitions, changelog sections inside docs, or documentation that governs how OL HOME should be operated.
---

# OL Doc Maintenance

## Workflow

1. Classify the document:
   - Public permanent document: `src/content/pages/{slug}.md`.
   - Internal Codex reference: `.agents/references/{name}.md`.
   - Repository operating rule: `AGENTS.md`.
   - Contributor overview: `README.md`.
   - Codex local workflow: `.agents/skills/{name}/SKILL.md`.
   - Codex execution setting: `.codex/config.toml` or `.codex/rules/*.rules`.
2. Read the current version before editing.
3. Align content with the current codebase, not older project names or routes.
4. Keep internal operating manuals under `.agents/references/` when they are for Codex or maintainers rather than public visitors.
5. For public manuals in `src/content/pages/`, keep frontmatter limited to the `pages` schema:

```yaml
---
title: "문서 제목"
description: "문서 설명"
published: true
---
```

6. Put document version, latest update date, target project, and deployment URL in the body.
7. Add or update a bottom section named `수정 변경사항`.
8. Run `npm run build` after public content changes.

## Current OL HOME Facts

- Production URL: `https://biwoom.github.io/`
- GitHub Pages repository: `biwoom/biwoom.github.io`
- Astro `base` should not be set.
- Content source root: `src/content/`
- Generated asset output: `public/generated/`
- Fixed site settings and env-backed DESIGN asset settings are centralized in `site-config.mjs`.
- App code should read shared site and DESIGN asset settings through `src/lib/site-config.ts`.
- Supported environment examples live in `.env.example`; fixed production values such as the canonical site URL stay code-managed.
- Deploy workflow: `.github/workflows/deploy.yml`
- Public primary navigation currently includes `HOME`, `TEXT`, `STORY`, `DESIGN`, `NET`, with `BLOG` as a separate action link.

## Document Placement

- Brand definition: `src/content/pages/brand.md`.
- Content management manual: `.agents/references/ol-home-content-management-manual.md`.
- Repo-wide Codex guidance: `AGENTS.md`.
- Reusable Codex workflows: `.agents/skills/`.
- `src/content/pages/` should stay visitor-facing; internal operating manuals do not belong there.

## Style

- Use clear Korean for project-facing documents.
- Keep route slugs and filenames ASCII.
- Keep operational instructions concrete: paths, commands, expected routes.
- Avoid stale references to project-page URLs such as `/ol-home` or `/biwoom` unless documenting history.
- When describing generated files, say not to commit `dist/`, `.astro/`, `node_modules/`, or `public/generated/`.
- Do not describe `/generated/design/...` as the authoring rule for new content; document provider-neutral rules such as `design-asset:{slug}/{asset}` or resolver-based asset fields.
- When documentation mentions DESIGN asset migration or external storage, include `PUBLIC_DESIGN_ASSET_BASE_URL`, optional `DESIGN_ASSET_PROVIDER=external`, and optional `DESIGN_ASSET_MANIFEST` only where operationally relevant.
- Shared UI behavior should be documented at the component/system level when it has been unified, for example the shared TEXT/STORY tag-results modal layer.

## Validation

- Run `npm run build` for public document changes.
- Confirm new pages appear in build output.
- Search for stale deployment paths when updating deployment docs:

```sh
rg "ol-home|/biwoom|base:" astro.config.mjs public src README.md AGENTS.md .agents
```
