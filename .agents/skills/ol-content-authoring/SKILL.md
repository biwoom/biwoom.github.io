---
name: ol-content-authoring
description: Prepare BIWOOM HOME story articles and related assets under content/article/ and maintain inherited OL Core content when explicitly in scope.
---

# BIWOOM HOME 콘텐츠 집필

2026-11-26 · BIWOOM HOME · 공개 주소 미정

1. `../biwoom-docs/BIWOOM_기획문서/`에서 HOME 기획서와 통합 기획서를 대조한다. HOME 이야기 원본을 `content/article/`에서 관리한다.
2. 출전과 각색 범위, 원고 버전, 삽화 권리와 대체 텍스트를 확인한다. 원고 검수 후 같은 승인본에서 카드 문안을 만든다. 원전·번역·연구는 확인한 HUB 주소나 서지 정보로 연결한다.
3. `content/article/` 아래 `붓다전기`, `전생이야기`, `고승전기`, `가르침과 일화`, `설화와 전승`, `구법과 순례`, `시와 게송`, `에세이` 중 해당하는 폴더에 Markdown 원고를 쓴다. 폴더로 ‘묶음’을 분류하고 YAML의 `topic`으로 주제를 지정한다. `content/illustration/`에 삽화 원본을 두고 원고 YAML에 제목, 요약, 삽화 경로와 대체 텍스트, 인물·장소·주제 태그와 이칭을 적는다. 입력 예시는 [`mustard.md`](<../../../content/article/가르침과 일화/mustard.md>)와 [README](../../../README.md)의 HOME 집필 항목을 따른다.
4. `id`를 유지해 아티클 주소와 보관함 연결을 보존한다. `published: true`인 원고와 그 원고가 참조한 삽화만 빌드에 포함된다. 공개 상태를 바꾸면 빌드와 링크 검사를 실행한다.
5. 카테고리 바로 아래의 하위 폴더명은 시리즈 제목이 된다. 시리즈의 선택적 `index.md`에는 `order`, `description`을 적는다. 메인 주제는 `content/article/index.md`의 `mainTopics`에 정의하고, 공개 원고의 `topicTags`는 세부 주제로 수집된다. 첫 화면의 날짜 정렬에는 원고의 `publishedAt`, `createdAt`을 `YYYY-MM-DD` 형식으로 사용한다.
6. ‘오늘의 이야기’는 공개일(`publishedAt`)이 가장 최근인 공개 원고에서 자동으로 고른다. 공개일이 같거나 모두 비어 있으면 기존 `order`를 따른다. 추천 이야기는 `content/article/index.md`의 `recommendedStories`에 서로 다른 공개 원고 ID 두 개를 표시 순서대로 적는다.

## 가져온 OL Core 집필 규칙

아래 절차는 기존 OL Core 자료·코드의 유지보수 참고용이다.

1. Read `.agents/references/ol-home-content-management-manual.md` and `ol-core/src/content.config.ts` before changing authoring rules.
2. Use `content/` as the existing Obsidian vault. Do not install a CMS or edit personal `.obsidian` state.
3. Place TEXT at `text/category/work/section/document.md`, STORY at `story/category/series/part/document.md`, BLOG at `blog/series/category/post.md` (or a per-post folder/index.md), and public permanent pages under `pages/`.
4. Korean author-facing names are supported. Use optional numeric prefixes for order, such as `001.중관부`. Keep code and internal guide filenames ASCII.
5. Prefer title/H1 and body only. `index.md` introductions and YAML are optional. Number-only filenames require an H1 title.
6. Use the optional fields supported by the current schema/validator for exceptions only. Never add old hierarchy/order/entity/ontology fields or `prefixTags`. Tags are optional plain string arrays such as `tags: [수메다, 수밋따]`; classification prefixes and singular `tag` are not supported.
7. Use `_drafts/` for unpublished work. Public menu documents are public by default, with explicit `published: false` preserved. Nonpublic intros hide descendants.
8. Preserve dates, rights and provenance; put source notes in body prose. Defaults live in `site-config.mjs` and app config in `ol-core/src/lib/site-config.ts`.
9. Keep shared images in `content/media/` with ordinary document-relative links. The first subfolder is the gallery category; root files are 미분류. Optional category index.md files hold multiple `## [Image title](relative-image-path)` sections whose bodies are rendered in image modals; retain sample indexes in the three existing categories and validate category-local targets/duplicates. Update references when moving files. The auxiliary /media/ gallery is linked from home statistics/footer only, without per-image content records or main-menu entries. Put listable PDFs/images/HTML directly in a material section. Put supporting files in `assets/` or `_assets/` and use relative Markdown links. Do not add DESIGN keys or generated URLs.
10. Vault-relative paths are canonical NFC via shared paths helpers; physical NFD names remain supported without renaming sources or normalizing prose. Preserve `content-registry.json`. Moves with unchanged content retain identity; moved-and-edited files may require `npm run content:move -- old new` before preparation. Do not silently assign a replacement URL to a known moved document.
11. Use shared DocumentTags for document-only optional tags below the title, without series inheritance. Series tag menus/modals are retired; BLOG tags filter alongside years/pagination. Do not create real tab switching; section buttons link to the first item, with expandable full lists.
12. BLOG series/category index.md holds title/description, optional thumbnailAsset and publication state; metadata is excluded from post counts/RSS. Each category belongs to one series. Optional series `## 읽는 순서` ordered relative post links override oldest-first order; keep TOC/previous-next identical. Preserve the empty essay series until the user adds content.
13. Run `npm run check`, `npm run typecheck`, `npm run build`, and `npm run check:built`; inspect expected output and assets. Do not commit generated output or upload unless requested.

## 수정 변경사항

### 2026-11-26 — HOME Markdown 집필 연동

- 원고 메타데이터와 삽화 원본 경로를 실제 빌드 규칙에 맞췄다.

### 2026-11-26 — HOME 원본 위치와 집필 기준

- `content/article/`과 검수 후 카드 파생 원칙을 반영했다.

### 2026-11-11 — Unicode 경로

- NFC 경로 키와 원본 보존, macOS/Linux 레지스트리 검증 차이와 충돌 처리 규칙을 반영했습니다.

### 2026-11-11 — BLOG series

- Author BLOG under series/category folders with index metadata and optional reading order; preserve post URLs and the empty essay series.

### 2026-11-09 — Content / OL core separation

- Authoring uses content/ and implementation uses ol-core/; retain root npm commands, registry, configuration and dist output.

### 2026-11-09 — MEDIA image information

- Added category index.md authoring for multiple image titles/descriptions shown in gallery modals.

### 2026-11-09

- Current brand is Biwoom - 비움; production target is `https://biwoom.github.io/`.


### 2026-10-31

- Added the top-level STORY category folder; TEXT/STORY use category cards before series lists. Empty category folders may use `.gitkeep`.

### 2026-10-30

- Replaced legacy frontmatter/Entity/DESIGN authoring rules with the Obsidian folder-driven workflow.

## Move and publication checks

- Run explicit content:move before preparation for moved-and-edited documents; confirm the old file no longer exists and check older Markdown links after repeated moves. Cross-collection moves require deliberate canonical URL/redirect migration.
- Private per-document assets belong in a private index.md directory or _drafts; publicly shared attachments remain public.
- Commit the prepared content-registry.json with source changes; after committing, run npm run check:registry.
