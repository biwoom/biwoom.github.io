---
name: ol-content-authoring
description: Create or revise BIWOOM Markdown and assets in the Obsidian vault under content/.
---

# BIWOOM Content Authoring

Latest update: 2026-11-28.

BIWOOM is published from `biwoom/biwoom.github.io` at `https://biwoom.github.io/`. Use vault-relative Markdown links in authoring. The registry keeps root routes.

## Editorial purpose

- 비움은 한 출가 수행자의 공부와 번역을 승가 공동체의 돌봄과 불자들의 보시에 힘입어 이어 가며, 그 성과를 누구나 읽고 사유하고 실천할 수 있는 자료로 나누는 독립 프로젝트다. 프로젝트의 배경과 책임 주체를 설명할 때 [운영 및 기여](../../../content/pages/support.md)를 기준으로 삼는다.
- 독자가 원문과 맥락을 찾아볼 수 있게 확인한 판본과 위치를 남긴다. 전승이나 해석이 여럿이면 그 차이를 밝히고, 번역·해설·각색의 성격을 구분한다. 처음 읽는 사람도 이해할 수 있는 문장을 쓰며 기존 자료의 오류와 깨진 출전 링크도 돌본다. [비움 소개](../../../content/pages/brand.md)
- 별도 이용 조건이 없는 비움 자체 제작 자료에 CC0 1.0을 적용한다. 외부에서 받은 문헌과 번역·삽화는 공개 전에 출처와 재배포 조건을 확인하고 자료별 권리 표시를 보존한다. [CC0 안내](../../../content/pages/cc0.md)

## Workflow

1. Read `.agents/references/biwoom-content-management-manual.md` and `ol-core/src/content.config.ts` before changing authoring rules.
2. Use `content/` as the existing Obsidian vault. Do not install a CMS or edit personal `.obsidian` state.
3. Place TEXT at `text/category/work/section/document.md`, STORY at `story/category/series/part/document.md`, BLOG at `blog/series/category/post.md` (or a per-post folder/index.md), and public permanent pages under `pages/`.
4. Korean author-facing names are supported. Use optional numeric prefixes for order, such as `001.중관부`. Keep code and internal guide filenames ASCII.
5. Prefer title/H1 and body only. `index.md` introductions and YAML are optional. Number-only filenames require an H1 title.
6. Use the optional fields supported by the current schema/validator for exceptions only. Never add old hierarchy/order/entity/ontology fields or `prefixTags`. Tags are optional plain string arrays such as `tags: [수메다, 수밋따]`; classification prefixes and singular `tag` are not supported.
7. Use `_drafts/` for unpublished work. Public menu documents are public by default, with explicit `published: false` preserved. Nonpublic intros hide descendants.
8. Preserve dates, rights and provenance. Give the source, edition and location as available in body prose. 불전문학 covers source texts, traditions and translations. 이야기카드 contains audience-facing stories under `content/article/`; preserve article IDs and illustration references. Confirm third-party terms before distribution and retain component-level notices in published ebooks. Keep restricted research, review and approval records outside the publishable repository. Defaults live in `site-config.mjs` and app config in `ol-core/src/lib/site-config.ts`.
9. Keep shared images in `content/media/` with ordinary document-relative links. The first subfolder is the gallery category; root files are 미분류. Optional category index.md files hold multiple `## [Image title](relative-image-path)` sections whose bodies are rendered in image modals; retain sample indexes in the three existing categories and validate category-local targets/duplicates. Update references when moving files. The auxiliary /media/ gallery is linked from the home 미디어&ebook preview tab and the footer, without per-image content records or main-menu entries. Put listable PDFs/images/HTML directly in a material section. Put supporting files in `assets/` or `_assets/` and use relative Markdown links. Do not add DESIGN keys or generated URLs.
10. Vault-relative paths are canonical NFC via shared paths helpers; physical NFD names remain supported without renaming sources or normalizing prose. Preserve `content-registry.json`. Moves with unchanged content retain identity; moved-and-edited files may require `npm run content:move -- old new` before preparation. Do not silently assign a replacement URL to a known moved document.
11. Use shared DocumentTags for document-only optional tags below the title, without series inheritance. Series tag menus/modals are retired; BLOG tags filter alongside years/pagination. Do not create real tab switching; section buttons link to the first item, with expandable full lists.
12. BLOG series/category index.md holds title/description, optional thumbnailAsset and publication state; metadata is excluded from post counts/RSS. Each category belongs to one series. Optional series `## 읽는 순서` ordered relative post links override oldest-first order; keep TOC/previous-next identical. Preserve the empty essay series until the user adds content.
13. Run `npm run check`, `npm run typecheck`, `npm run build`, and `npm run check:built`; inspect expected output and assets. Do not commit generated output or upload unless requested.

블로그 포스트는 자세하고 친절하게 설명하며, 친숙한 용어와 일상어를 사용한다. 독자가 처음 읽는다는 전제에서 필요한 배경을 짚고, 불교·기술 용어는 처음 나올 때 쉽게 설명한다. 제작일지에는 무엇을 바꿨는지와 독자가 어디에서 어떻게 이용할 수 있는지를 함께 적는다. [블로그 포스트 집필 기준](../../references/biwoom-content-management-manual.md#블로그-포스트-문체)

For STORY bodies, use optional `personTags`, `placeTags`, and `topicTags` for canonical names alongside ordinary `tags`. Declare variants under `aliasTags.person`, `aliasTags.place`, or `aliasTags.topic` for a canonical name listed in the same document. See the authoring manual for the example and public index rules.

## 이야기카드

- Follow the [story-card specification](../../context/biwoom-story-card-specification.md) for layout and the HTML template. Keep the full Markdown article under its category or series. Reuse its stable `id` for an optional HTML card.
- Save one `.html` per article directly in `content/article/html/`. Set `data-article-id` and `data-card-date` on the single marked card article. Preserve alt text and edition or chapter links. The site uses shared CSS and extracts only the card.
- Use WebP for new or replacement illustrations in web cards. Keep the original artwork and preserve transparency in the WebP. Link to the WebP in `content/illustration/` from the card HTML. Use complete card PNGs for sharing and distribution.
- Keep unfinished articles at `published: false`. If an article is recommended, change or remove its recommendation before unpublishing it. Update `content/article/index.md` for curated recommendations. The home and card-menu carousels select up to five public HTML cards by card date. Only the card-menu hero falls back to the latest public article when no eligible HTML exists. Keep the source links in the reader because both carousels link the entire card to the reader.
- Run `npm run check:content` to validate the article link and card metadata. After building, use `npm run check:built` to verify card placement, reader links and published assets.

## 수정 변경사항

### 2026-11-28 — 블로그 포스트 문체

- 블로그 글은 자세하고 친절하게 설명하고, 친숙한 용어와 일상어를 사용하도록 정했다.

### 2026-11-28 — 집필과 공개의 취지

- 비움의 운영 배경을 원문에서 확인하고, 근거를 쉽게 따라갈 수 있는 집필과 자료별 권리 확인에 반영한다.

### 2026-11-27 — Home story cards

- Record the shared selection and the card-menu fallback.

### 2026-11-27 — WebP story-card illustrations

- Set WebP as the default for new and replacement web-card illustrations.

### 2026-11-27 — HTML story cards

- Document the path, stable ID, card date and validation workflow.

### 2026-11-26 — HUB editorial scope

- Record the distinction between STORY and HOME, component rights and the new manual path.

### 2026-11-25 — STORY structured tags

- Document the optional canonical lists and alias mappings for STORY bodies.

### 2026-11-25 — BIWOOM HUB

- Record the public path and keep the same vault authoring and registry conventions.

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
