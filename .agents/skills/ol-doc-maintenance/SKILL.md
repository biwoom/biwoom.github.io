---
name: ol-doc-maintenance
description: Maintain BIWOOM HOME manuals, brand documents, AGENTS.md, README.md, Codex rules, and notes on the inherited OL Core.
---

# BIWOOM HOME 문서 관리

2026-11-26 · BIWOOM HOME · 공개 주소 미정

## Workflow

1. Classify the document:
   - HOME 이야기 원본과 편집 자료: `content/article/`. 영구 안내 페이지는 HOME 구조가 확정되면 그 구조를 따른다.
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

## HOME 문서 기준

- `../biwoom-docs/BIWOOM_기획문서/`의 통합 기획서와 HOME 기획서를 기준으로 프로젝트의 역할을 기록한다. 논의용 디자인안과 미정인 공개 주소·배포 저장소는 그 상태를 명시한다.
- `content/article/`을 아티클 원본 위치로 기록한다. 로더와 발행 스키마의 구현 상태는 실제 코드를 기준으로 설명한다.

## 가져온 OL Core 운영 사실

- Production: `https://biwoom.github.io/`, repository `biwoom/biwoom.github.io`; do not add Astro `base`.
- `content/` is the Obsidian vault. TEXT/STORY/BLOG are the content menus; HOME is the entry page.
- TEXT uses category/work/material-section/item folders and STORY uses category/series/part/item. Their menu roots show work rows and story cards respectively. Separate `/text/categories/` and `/story/categories/` pages list category cards. Order comes from numeric prefixes and title/body writing is supported without YAML.
- DESIGN/NET and Entity/Ontology systems have been removed after general asset/prose migration. Do not restore their authoring rules or environment settings.
- `ol-core/src/content.config.ts` defines normalized data; `ol-core/scripts/lib/content.mjs` shares source interpretation with validation.
- `content-registry.json` is committed source metadata for stable URLs/dates/paths. `ol-core/public/generated/content/` is derived output and is not committed.
- Shared images live in `content/media/`; first subfolders supply categories for the auxiliary /media/ masonry gallery. Home statistics/footer link to it, without main-menu entries or per-image document records. Originals and generated previews are separate; respect user-deleted historical archives.
- BLOG uses series/category/post folders; index metadata is excluded from post counts/RSS and categories have one series parent.
- Shared settings: `site-config.mjs`, app entry `ol-core/src/lib/site-config.ts`. No DESIGN asset environment variables are needed.
- Deploy workflow: `.github/workflows/deploy.yml`. Upload requests stop after requested push.
- TEXT reuses STORY series links and expandable lists; no real tab switching.

## Document Placement

- Brand definition: `content/pages/brand.md`.
- Content management manual: `.agents/references/ol-home-content-management-manual.md`.
- Repo-wide Codex guidance: `AGENTS.md`.
- Reusable Codex workflows: `.agents/skills/`.
- `content/pages/` should stay visitor-facing; internal operating manuals do not belong there.

## Style

- Use clear Korean for project-facing documents.
- Keep code and internal guide filenames ASCII. Korean author-facing content filenames are allowed; public routes use registry URLs.
- Keep operational instructions concrete: paths, commands, expected routes.
- Avoid stale references to project-page URLs such as `/ol-home` or `/biwoom` unless documenting history.
- When describing generated files, say not to commit `dist/`, `.astro/`, `node_modules/`, or `ol-core/public/generated/`.
- Use ordinary relative attachment links. Do not introduce DESIGN asset keys or generated URLs as authoring requirements.
- Shared UI behavior should be documented at the component/system level when it has been unified, for example shared document tag badges and BLOG tag/year filtering with common pagination. The series tag modal has been retired.

## Validation

- Run `npm run build` for public document changes.
- Confirm new pages appear in build output.
- Search for stale deployment paths when updating deployment docs:

```sh
rg "ol-home|/biwoom|base:" astro.config.mjs ol-core/public ol-core/src README.md AGENTS.md .agents
```

## 수정 변경사항

### 2026-11-26 — BIWOOM HOME 적용

- HOME 기획의 기준 문서, 로컬 원본 위치, 기존 OL Core 문서의 적용 범위를 명시했다.

### 2026-11-13 — TEXT/STORY menus

- Record the separate work and category routes.

### 2026-11-11 — BLOG series

- Document BLOG series/category ownership and index metadata separately from posts.

### 2026-11-09 — Content / OL core separation

- Authoring uses content/ and implementation uses ol-core/; retain root npm commands, registry, configuration and dist output.

### 2026-11-09

- Current brand is Biwoom - 비움; production target is `https://biwoom.github.io/`.


### 2026-11-08

- Production is `https://borido.org/`; retain the existing repository, root routes and Actions deployment. DNS/HTTPS remain external configuration.

### 2026-10-31

- Added STORY categories and shared category-card navigation.

### 2026-10-30

- Updated facts and asset guidance for Obsidian authoring and the retired DESIGN/NET/Entity/Ontology systems.
