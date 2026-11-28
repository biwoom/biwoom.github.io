---
name: ol-doc-maintenance
description: Maintain BIWOOM manuals, brand documents, AGENTS.md, README.md, and project rules. Use for durable guidance, content management manuals, brand definitions, and change histories.
---

# BIWOOM Doc Maintenance

## Workflow

1. Classify the document:
   - Public permanent document: `content/pages/{slug}.md`.
   - Internal Codex reference: `.agents/references/{name}.md`.
   - Repository operating rule: `AGENTS.md`.
   - Contributor overview: `README.md`.
   - Codex local workflow: `.agents/skills/{name}/SKILL.md`.
   - Codex execution setting: `.codex/config.toml` or `.codex/rules/*.rules`.
2. Read the current version before editing.
3. For project descriptions, read the relevant public source in Document Placement. Use the operations guide for the ordained practitioner's independent stewardship, the role of the monastic community and lay donors, and open, voluntary and responsible participation. Use the brand definition for editorial purpose. Verify implemented service scope against the integration decision, `.agents/context/current-state.md`, and the code. Use BIWOOM (비움) as the site name.
4. Keep internal operating manuals under `.agents/references/` when they are for Codex or maintainers rather than public visitors.
5. Public manuals may omit YAML and use an H1 title. Keep any optional frontmatter within the current allowed input fields; preserve existing descriptions and rights exceptions.

6. Put document version, latest update date, target project, and deployment URL in the body.
7. Add or update a bottom section named `수정 변경사항`.
8. Choose verification according to [Local verification](../../../AGENTS.md#local-verification).

## Current BIWOOM Facts

- The production target is `https://biwoom.github.io/` from `biwoom/biwoom.github.io`. The build preserves older `/hub/` links through redirects.
- `content/` is the Obsidian vault. Desktop and mobile primary menus use 카드, 경론, 문학 throughout the site. The library names are 불교경론 and 불전문학, with the existing `text` and `story` route keys. The wordmark opens the root landing. The 카드 menu and 이야기카드 links on the landing page and below BLOG series in the footer lead to `/articles/`.
- TEXT uses category/work/material-section/item folders and STORY uses category/series/part/item. Their menu roots show work rows and story cards respectively. Separate `/text/categories/` and `/story/categories/` pages list category cards. Order comes from numeric prefixes and title/body writing is supported without YAML.
- DESIGN/NET and Entity/Ontology systems have been removed after general asset/prose migration. Do not restore their authoring rules or environment settings.
- `ol-core/src/content.config.ts` defines normalized data; `ol-core/scripts/lib/content.mjs` shares source interpretation with validation.
- `content-registry.json` is committed source metadata for stable URLs/dates/paths. `ol-core/public/generated/content/` is derived output and is not committed.
- Shared images live in `content/media/`; first subfolders supply categories for the auxiliary /media/ masonry gallery. The home 미디어&ebook preview tab and footer link to it, without main-menu entries or per-image document records. Originals and generated previews are separate; respect user-deleted historical archives.
- BLOG uses series/category/post folders; index metadata is excluded from post counts/RSS and categories have one series parent.
- Shared settings: `site-config.mjs`, app entry `ol-core/src/lib/site-config.ts`. No DESIGN asset environment variables are needed.
- Deploy workflow: `.github/workflows/deploy.yml`. Upload requests stop after requested push.
- TEXT reuses STORY series links and expandable lists; no real tab switching.

## Document Placement

- 편집 방향과 독서 경험은 [비움 소개](../../../content/pages/brand.md)를 기준으로 정리한다.
- 운영 배경과 참여 방식은 [운영 및 기여](../../../content/pages/support.md)에서 확인한다. 지원의 취지를 설명할 때 운영 주체와 보시의 사용 목적을 정확히 전달한다.
- 오류 제보·자료 제공·개선 및 협력의 공개 창구는 [문의 및 제안](../../../content/pages/contact.md)이다. 제안은 정확성·이용 조건·방향·운영 여건에 따라 검토하는 것으로 안내한다.
- 공개 자료의 CC0 적용 범위와 자료별 예외는 [CC0 안내](../../../content/pages/cc0.md)에 둔다. 푸터와 홈 미리보기, 비움 소개는 `/pages/cc0/`으로 연결한다.
- Content management manual: `.agents/references/biwoom-content-management-manual.md`.
- Story-card design and operating specification: `.agents/context/biwoom-story-card-specification.md`. Keep its HTML examples, placement rules and WebP illustration guidance aligned with the shared card loader, the home page, `/articles/`, and the content-authoring skill.
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

- For repository-only documents and skills, review the diff and check links, paths, and skill format as applicable.
- For public documents, prepare affected registry metadata and check changed links or publication settings. Build and inspect the output when a page is added, its route changes, or the generated rendering needs verification.
- Search for stale deployment paths when updating deployment docs:

```sh
rg "ol-home|/biwoom|base:" astro.config.mjs ol-core/public ol-core/src README.md AGENTS.md .agents
```

## 수정 변경사항

### 2026-11-28 — 문서 변경의 검증 범위

- 저장소 문서와 공개 문서의 변경 내용에 맞춰 링크·스킬 형식·생성본 검사를 고르는 기준을 연결했다.

### 2026-11-28 — 비움의 운영 취지와 공개 문서

- 프로젝트 설명, 운영과 참여, 문의, 이용 조건을 각각 최신 상설 문서에 맞춰 관리하는 기준을 반영했다.

### 2026-11-27 — Home preview tabs

- Record the home navigation order, preview links and story-card placement.

### 2026-11-27 — Story-card specification

- Record the repository location for the design and authoring specification and its WebP illustration default.

### 2026-11-26 — HUB identity

- Record the planning and implementation references and the renamed current authoring manual.

### 2026-11-25 — BIWOOM HUB

- Record the HUB project address and the separate HOME destination.

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
