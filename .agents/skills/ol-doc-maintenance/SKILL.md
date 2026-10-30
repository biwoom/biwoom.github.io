---
name: ol-doc-maintenance
description: Maintain BORIDO (OL 코어) manuals, brand documents, AGENTS.md, README.md, and project rule documents. Use when updating durable project guidance, Codex rules, content management manuals, brand definitions, changelog sections inside docs, or documentation that governs how BORIDO (OL 코어) should be operated.
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
5. Public manuals may omit YAML and use an H1 title. Keep any optional frontmatter within the current allowed input fields; preserve existing descriptions and rights exceptions.

6. Put document version, latest update date, target project, and deployment URL in the body.
7. Add or update a bottom section named `수정 변경사항`.
8. Run `npm run build` after public content changes.

## Current BORIDO (OL 코어) Facts

- Production: `https://biwoom.github.io/`, repository `biwoom/biwoom.github.io`; do not add Astro `base`.
- `src/content/` is the Obsidian vault. TEXT/STORY/BLOG are the content menus; HOME is the entry page.
- TEXT uses category/work/material-section/item folders and STORY uses category/series/part/item; both menu roots show category cards before series lists; order comes from numeric prefixes and title/body writing is supported without YAML.
- DESIGN/NET and Entity/Ontology systems have been removed after general asset/prose migration. Do not restore their authoring rules or environment settings.
- `src/content.config.ts` defines normalized data; `scripts/lib/content.mjs` shares source interpretation with validation.
- `content-registry.json` is committed source metadata for stable URLs/dates/paths. `public/generated/content/` is derived output and is not committed.
- Shared settings: `site-config.mjs`, app entry `src/lib/site-config.ts`. No DESIGN asset environment variables are needed.
- Deploy workflow: `.github/workflows/deploy.yml`. Upload requests stop after requested push.
- TEXT reuses STORY series links and expandable lists; no real tab switching.

## Document Placement

- Brand definition: `src/content/pages/brand.md`.
- Content management manual: `.agents/references/ol-home-content-management-manual.md`.
- Repo-wide Codex guidance: `AGENTS.md`.
- Reusable Codex workflows: `.agents/skills/`.
- `src/content/pages/` should stay visitor-facing; internal operating manuals do not belong there.

## Style

- Use clear Korean for project-facing documents.
- Keep code and internal guide filenames ASCII. Korean author-facing content filenames are allowed; public routes use registry URLs.
- Keep operational instructions concrete: paths, commands, expected routes.
- Avoid stale references to project-page URLs such as `/ol-home` or `/biwoom` unless documenting history.
- When describing generated files, say not to commit `dist/`, `.astro/`, `node_modules/`, or `public/generated/`.
- Use ordinary relative attachment links. Do not introduce DESIGN asset keys or generated URLs as authoring requirements.
- Shared UI behavior should be documented at the component/system level when it has been unified, for example the shared TEXT/STORY tag-results modal layer.

## Validation

- Run `npm run build` for public document changes.
- Confirm new pages appear in build output.
- Search for stale deployment paths when updating deployment docs:

```sh
rg "ol-home|/biwoom|base:" astro.config.mjs public src README.md AGENTS.md .agents
```

## 수정 변경사항

### 2026-10-31

- Added STORY categories and shared category-card navigation.

### 2026-10-30

- Updated facts and asset guidance for Obsidian authoring and the retired DESIGN/NET/Entity/Ontology systems.
