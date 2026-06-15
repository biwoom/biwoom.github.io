# OL 홈페이지 콘텐츠 관리 매뉴얼

**문서 버전**: v1.5  
**최종 업데이트**: 2026-06-15  
**대상 프로젝트**: OL HOME (`biwoom.github.io`)  
**기술 스택**: Astro 6 + GitHub Pages + Pagefind  
**기준 배포 URL**: `https://biwoom.github.io/`  
**문서 위치**: `.agents/references/ol-home-content-management-manual.md`  
**문서 성격**: Codex 에이전트와 운영자를 위한 내부 관리 매뉴얼

이 문서는 OL HOME의 콘텐츠를 작성하고 관리하는 기준 문서입니다. 운영 중 스키마와 매뉴얼이 충돌하면 코드가 우선이며, 코드 변경 후 매뉴얼을 함께 갱신합니다.

---

## 0. 핵심 개념

OL HOME은 Astro 기반 정적 사이트입니다. 콘텐츠는 `src/content/` 아래 Markdown 또는 MDX 파일로 관리하고, `npm run build`를 실행하면 정적 HTML이 `dist/`에 생성됩니다.

각 콘텐츠 파일은 상단 frontmatter에 메타데이터를 적고, 그 아래에 본문을 작성합니다.

```md
---
title: "제목"
published: true
---

본문을 작성합니다.
```

### 0.1 현재 운영 구조

```txt
src/content/
├── blog/       → 작업 기록, 개발 기록, 제작 노트
├── text/       → 번역, 주석, 연구 노트를 중심으로 한 문헌 콘텐츠
├── story/      → 불교 인물·설화·가르침을 이야기 형식으로 재구성한 서사 콘텐츠
├── design/     → 인포그래픽, 도식, 이미지 자료
├── pages/      → 공개 브랜드 문서, 선언문, 안내문 등 상설 문서
├── entities/   → 인물, 장소, 개념 등 엔티티
├── ontology/   → 온톨로지 정의
└── ai/         → AI workflow 기록용 예약 컬렉션
```

`book/`과 `works/` 라우트는 호환과 과거 구조 연결을 위해 남아 있지만, 신규 콘텐츠 운영의 중심은 `text/`, `story/`, `design/`, `blog/`, `pages/`, `entities/`입니다.

### 0.2 자산 관리 원칙

사람이 직접 관리하는 원본은 `src/content` 안에 둡니다.

```txt
src/content/design/{slug}/assets/
src/content/story/{series}/assets/
```

빌드 전에 `scripts/sync-content-assets.mjs`가 `assets/` 폴더를 찾아 `public/generated/`로 동기화합니다.
현재 동기화는 증분 방식입니다. 변경된 파일만 복사하고, 원본 `assets/`에서 사라진 파일은 `public/generated/`에서도 제거합니다.

```txt
src/content/design/two-perspectives/assets/index.html
→ public/generated/design/two-perspectives/index.html

src/content/story/buddha-story/assets/index.html
→ public/generated/story/buddha-story/index.html
```

`public/generated/`는 빌드 산출물입니다. 원본처럼 직접 관리하지 않습니다.
GitHub Actions에서는 `public/generated/` 캐시를 복원한 뒤 증분 동기화를 수행하므로, DESIGN/STORY 자산이 많아져도 변경되지 않은 파일의 반복 복사를 줄일 수 있습니다.

현재 자동 동기화 대상은 다음 두 컬렉션입니다.

- `design`
- `story`

TEXT 이미지는 현재 Astro content asset 방식으로 문서 또는 시리즈 폴더 안에서 상대 경로를 사용합니다.

### 0.3 빌드와 미리보기

```sh
npm run dev
npm run build
npm run preview
```

`npm run build`는 내부적으로 다음을 실행합니다.

```sh
npm run sync:assets
astro build
npx pagefind --site dist
```

### 0.4 태그 원칙

TEXT와 STORY의 읽기 UI는 `tags`를 prefix 방식으로 해석합니다.

```yaml
tags:
  - "인물/아나타삔디까"
  - "장소/라자가하-왕사성"
  - "개념/연기"
tagAliases:
  "인물/아나타삔디까": ["Anāthapiṇḍika", "급고독장자"]
```

- `/` 앞부분은 prefix입니다. 예: `인물`, `장소`, `개념`
- `/` 뒷부분은 실제 태그명입니다.
- 여러 태그를 선택하면 AND 조건으로 문서가 좁혀집니다.

DESIGN과 BLOG에는 기존 `prefixTags`도 계속 사용합니다.

```yaml
prefixTags:
  - "kind:infographic"
  - "topic:연기"
  - "format:html"
```

### 0.5 권리·라이선스 원칙

직접 만든 OL 저작물은 특별한 사유가 없으면 다음을 기본값으로 사용합니다.

```yaml
license: "CC0"
rightsHolder: "비움"
```

외부 저작물, 강의록, 논문, 번역물은 권리 정보를 명확히 적습니다.

```yaml
authors: ["도남(圖南) 김성철"]
rightsHolder: "도남(圖南) 김성철"
license: "CC BY 4.0"
licenseUrl: "https://creativecommons.org/licenses/by/4.0/"
copyrightNotice: "© 도남(圖南) 김성철. 인용과 재배포는 라이선스 조건과 출처 표기를 따릅니다."
```

라이선스가 불명확한 자료에는 임의로 CC 라이선스를 붙이지 않습니다.

---

## 1. TEXT 콘텐츠

TEXT는 경전·논서·선어록·강의록을 번역하고 주석한 문헌 콘텐츠입니다.

라우트 구조:

- `/text/`: 시리즈 카드 목록
- `/text/{series}/`: 시리즈 개요, 태그 필터, 문서 검색 패널
- `/text/{series}/{slug}/`: 문서 상세 페이지

### 1.1 폴더 구조

```txt
src/content/text/
└── body-mind-transformation/
    ├── index.md              → 시리즈 메타데이터
    ├── assets/               → 시리즈 대표 이미지 등
    │   ├── thumb.jpg
    │   └── preview1.jpg
    └── part/
        └── 01-six-steps.md   → 실제 문서
```

`part/`는 TEXT 문서에서 기본 구획 폴더처럼 특별 취급됩니다. 현재 코드에서는 `part/` 바로 아래의 문서는 URL에 `part`가 표시되지 않습니다.

```txt
src/content/text/body-mind-transformation/part/01-six-steps.md
→ /text/body-mind-transformation/01-six-steps
```

다만 `part/` 아래에 추가 하위 폴더를 두면 그 아래 경로는 URL에 반영됩니다.

```txt
src/content/text/body-mind-transformation/part/section-a/01-six-steps.md
→ /text/body-mind-transformation/section-a/01-six-steps
```

### 1.2 TEXT 시리즈 예시

```yaml
---
title: "몸과 마음의 전환"
kind: series
series: "몸과 마음의 전환"
seriesSlug: "body-mind-transformation"
seriesOrder: 10
description: "불교명상 기초수행을 문헌 형식으로 정리한 시리즈."
thumbnailAsset: "assets/thumb.jpg"
coverAsset: "assets/preview1.jpg"
status: published
tags:
  - "개념/불교명상"
  - "개념/정화"
prefixTags:
  - "kind:text"
  - "topic:불교명상"
license: "CC0"
published: true
---
```

### 1.3 TEXT 문서 예시

```yaml
---
title: "몸과 마음의 정화 여섯 단계"
kind: document
series: "몸과 마음의 전환"
seriesSlug: "body-mind-transformation"
seriesOrder: 10
part: "기초수행"
partSlug: "basic-practice"
partOrder: 10
group: "정화"
groupOrder: 10
chapter: 1
order: 1
status: published
tags:
  - "개념/불교명상"
  - "개념/정화"
  - "형식/수행안내"
tagAliases:
  "개념/정화": ["purification", "몸과 마음의 정화"]
authors: ["비움"]
license: "CC0"
published: true
---
```

### 1.4 주요 필드

| 필드 | 설명 |
|------|------|
| `title` | 제목 |
| `kind` | `series` 또는 `document` |
| `series` | 시리즈 표시명 |
| `seriesSlug` | URL에 쓰는 시리즈 slug |
| `part`, `partSlug` | 시리즈 안의 대분류 |
| `group`, `groupOrder` | part 안의 소분류와 정렬 |
| `chapter`, `order` | 독자용 장 번호와 실제 정렬 |
| `status` | `draft`, `revising`, `ready`, `published` |
| `tags` | 표시·필터용 태그 |
| `tagAliases` | 태그의 다른 이름, 영문명, 한역명 |
| `prefixTags` | 관리용 prefix 태그 |
| `published` | 공개 여부. 기본값은 `false` |

---

## 2. STORY 콘텐츠

STORY는 불교의 인물·설화·가르침을 이야기 형식으로 재구성한 서사 콘텐츠입니다.

현재 라우트 구조:

- `/story/`: 시리즈 카드 목록
- `/story/{series}/`: 시리즈 상세 페이지
- `/story/{series}/{part}/{doc}/`: 개별 문서 상세 페이지

### 2.1 폴더 구조

```txt
src/content/story/
└── buddha-story/
    ├── index.md
    ├── assets/
    │   └── index.html
    ├── part-1/
    │   ├── 02-palace-and-four-sights.md
    │   └── 03-renunciation.md
    └── part-2/
        ├── 01-awakening.md
        ├── 02-first-sermon.md
        └── 03-community.md
```

`index.md`도 STORY 컬렉션 entry이며, 시리즈 대표 정보와 서지정보 역할을 합니다.
TEXT 시리즈 `index.md`와 마찬가지로 `kind: series`를 사용합니다.
개별 STORY 문서에 필요한 `part`, `group`, `chapter`, `order`, `publishedAt`, `htmlAsset`는 시리즈 `index.md`에 적지 않습니다.

### 2.2 STORY 시리즈 예시

```yaml
---
title: "붓다 스토리"
kind: series
subtitle: "부처님의 일대기"
series: "붓다 스토리"
seriesSlug: "buddha-story"
seriesOrder: 10
category: "인물 · 행적"
version: "v1.0"
status: draft
description: "싯다르타 고타마의 생애를 이야기 형식으로 재구성한 시리즈."
tags:
  - "인물/붓다"
  - "개념/불전"
prefixTags:
  - "kind:story"
  - "topic:붓다전기"
license: "CC0"
rightsHolder: "비움"
lang: "ko"
published: true
---
```

### 2.3 STORY 문서 예시

```yaml
---
title: "출가"
kind: document
series: "붓다 스토리"
seriesSlug: "buddha-story"
seriesOrder: 10
part: "탄생과 출가"
partSlug: "part-1"
partOrder: 10
group: "출가"
groupSlug: "renunciation"
groupOrder: 20
chapter: 3
order: 3
category: "붓다전기"
version: "v1.0"
status: draft
publishedAt: 2026-06-11
htmlAsset: "index.html"
description: "싯다르타가 궁을 떠나는 장면."
tags:
  - "인물/싯다르타"
  - "장소/카필라밧투"
  - "개념/출가"
tagAliases:
  "장소/카필라밧투": ["Kapilavatthu", "카필라성"]
license: "CC0"
lang: "ko"
published: true
---
```

### 2.4 STORY 리더 기능

- 시리즈 개요와 문서 목록
- PART별 탐색
- 개별 문서 상세 페이지
- breadcrumb
- On this page 목차
- Copy 드롭다운
- 이전 문서 / 다음 문서
- 모바일 문서 목록과 목차 패널

---

## 3. DESIGN 콘텐츠

DESIGN은 불교 지식을 시각화하는 인포그래픽, 도식, 삽화, 스타일시트 라이브러리입니다.

### 3.1 폴더 구조

```txt
src/content/design/
└── two-perspectives/
    ├── index.md
    └── assets/
        ├── index.html
        ├── preview1.png
        └── thumb.jpg
```

빌드 후:

```txt
public/generated/design/two-perspectives/index.html
public/generated/design/two-perspectives/preview1.png
public/generated/design/two-perspectives/thumb.jpg
```

상세 페이지 URL:

```txt
/design/two-perspectives/
```

### 3.2 DESIGN 예시

```yaml
---
title: "불교의 세계관 — 두 가지 관점"
description: "주관적 관찰과 객관적 관찰을 통해 불교적 세계관을 설명하는 인포그래픽."
summary: "두 가지 관점으로 정리한 불교 세계관"
primaryKind: infographic
type: diagram
format: mixed
series: "불교의 세계관"
version: "0.1.0"
status: published
date: 2026-06-11
htmlAsset: "index.html"
thumbnailAsset: "thumb.jpg"
imageAsset: "preview1.png"
previewAssets:
  - "preview1.png"
imageAlt: "두 가지 관점에서 나와 세계를 이해하는 불교의 세계관 인포그래픽"
pageSize: "A4"
orientation: portrait
medium: "HTML/CSS, Image"
source: "OL Project"
credits: ["비움"]
license: "CC0"
prefixTags:
  - "kind:infographic"
  - "topic:불교세계관"
  - "format:html"
tags:
  - 불교세계관
  - 두 가지 관점
  - 인포그래픽
published: true
---
```

---

## 4. BLOG 콘텐츠

BLOG는 OL의 작업 일지, 개발 기록, 제작 노트입니다.

```txt
src/content/blog/my-post/index.md
→ /blog/my-post/
```

예시:

```yaml
---
title: "TEXT와 STORY 리더 개편"
description: "TEXT·STORY 콘텐츠 구조를 시리즈 중심으로 정리한 작업 기록."
date: 2026-06-11
category: OL
readingTime: 8
tags: ["개발", "TEXT", "STORY"]
prefixTags:
  - "kind:blog"
  - "project:ol-home"
  - "topic:development"
published: true
---
```

BLOG의 `published` 기본값은 `false`입니다. 공개하려면 반드시 `published: true`를 적습니다.

---

## 5. PAGES — 공개 상설 문서

시간순으로 흐르지 않는 브랜드 문서, 선언문, 안내 문서는 `src/content/pages/`에 둡니다. 방문자에게 공개할 필요가 없는 내부 운영 매뉴얼은 `src/content/pages/`에 두지 않고 `.agents/references/`에 둡니다.

```txt
src/content/pages/brand.md
→ /pages/brand/
```

현재 `pages` 스키마는 다음 frontmatter만 허용합니다.

```yaml
---
title: "OL 브랜드"
description: "OL 프로젝트의 브랜드 기준"
published: true
---
```

업데이트 날짜, 문서 버전, 변경 이력은 frontmatter가 아니라 본문에 적습니다.

---

## 6. ATLAS

ATLAS는 `public/atlas/latest/` 안의 단일 HTML 파일을 사용합니다.

파일명은 다음 형식을 따릅니다.

```txt
ol-atlas_v{버전}.html
```

예:

```txt
public/atlas/latest/ol-atlas_v0.0.8.html
```

ATLAS 페이지는 최신 파일의 버전과 파일 크기를 읽어 표시합니다.

---

## 7. 사이트 공통 설정

사이트 공통 정보는 `src/lib/site.ts`에서 관리합니다.

```ts
export const site = {
  name: 'OL',
  tagline: '지혜의 올을 짜다',
  email: 'biwoom.ol@gmail.com',
  github: 'https://github.com/biwoom',
  license: 'https://creativecommons.org/publicdomain/zero/1.0/',
} as const;
```

배포 URL은 `astro.config.mjs`에서 관리합니다.

```js
export default defineConfig({
  site: 'https://biwoom.github.io',
});
```

`biwoom.github.io` 저장소는 GitHub Pages 루트 사이트이므로 Astro `base`를 설정하지 않습니다.

---

## 8. 자주 하는 실수와 해결법

### 콘텐츠가 목록에 보이지 않음

`published: true`를 확인합니다.

| 컬렉션 | 기본값 |
|--------|--------|
| blog | `false` |
| text | `false` |
| design | `false` |
| story | `true` |
| pages | `true` |

### DESIGN 자산이 보이지 않음

- 자산이 `src/content/design/{slug}/assets/` 안에 있는지 확인합니다.
- `htmlAsset`, `thumbnailAsset`, `imageAsset`, `previewAssets`가 실제 파일명과 일치하는지 확인합니다.
- `npm run build` 또는 `npm run sync:assets`를 실행했는지 확인합니다.

### STORY HTML 자산 링크가 깨짐

- 자산이 `src/content/story/{series}/assets/` 안에 있는지 확인합니다.
- `htmlAsset` 값이 실제 파일명과 일치하는지 확인합니다.
- 빌드 후 `public/generated/story/{series}/`에 파일이 복사되었는지 확인합니다.

### TEXT/STORY 태그 필터가 이상함

TEXT/STORY의 사용자 필터용 태그는 `/`를 사용합니다.

```yaml
tags:
  - "인물/붓다"
  - "장소/룸비니"
  - "개념/연기"
```

`인물:붓다`처럼 콜론을 쓰면 prefix 필터 기준과 맞지 않습니다.

### GitHub Pages 루트 배포가 404로 보임

- 저장소 이름이 `biwoom.github.io`인지 확인합니다.
- GitHub Pages Source가 `GitHub Actions`인지 확인합니다.
- Actions 배포가 성공했는지 확인합니다.
- `astro.config.mjs`에 `base`가 없는지 확인합니다.
- 브라우저 캐시 또는 GitHub Pages CDN 반영 지연을 고려합니다.

---

## 9. 콘텐츠 등록 체크리스트

### TEXT

- [ ] 시리즈 폴더 생성: `src/content/text/{series}/`
- [ ] 시리즈 메타데이터 작성: `src/content/text/{series}/index.md`
- [ ] `kind: series` 지정
- [ ] 문서 작성: `src/content/text/{series}/part/...md`
- [ ] `series`, `seriesSlug`, `part`, `group`, `order` 확인
- [ ] 태그는 `prefix/name` 방식으로 작성
- [ ] `published: true` 설정
- [ ] `npm run build` 확인

### STORY

- [ ] 시리즈 폴더 생성: `src/content/story/{series}/`
- [ ] 서지정보 작성: `src/content/story/{series}/index.md`
- [ ] 시리즈 `index.md`에는 `kind: series` 지정
- [ ] 시리즈 `index.md`에는 개별 문서용 `part`, `group`, `chapter`, `order`, `publishedAt`, `htmlAsset`를 작성하지 않음
- [ ] 자산 저장: `src/content/story/{series}/assets/`
- [ ] PART 문서 작성: `src/content/story/{series}/part-x/...md`
- [ ] 개별 문서에는 `kind: document` 지정
- [ ] `seriesSlug`, `partSlug`, `groupSlug`, `order` 확인
- [ ] 개별 문서에는 `publishedAt`, 필요시 `htmlAsset` 작성
- [ ] 태그는 `prefix/name` 방식으로 작성
- [ ] `npm run build` 후 `public/generated/story/{series}/` 확인

### DESIGN

- [ ] 폴더 생성: `src/content/design/{slug}/`
- [ ] 메타데이터 작성: `src/content/design/{slug}/index.md`
- [ ] 자산 저장: `src/content/design/{slug}/assets/`
- [ ] `htmlAsset`, `thumbnailAsset`, `imageAsset`, `previewAssets` 파일명 확인
- [ ] `type`, `format`, `tags`, `prefixTags` 작성
- [ ] `published: true` 설정
- [ ] `npm run build` 후 `public/generated/design/{slug}/` 확인

### BLOG

- [ ] 폴더 생성: `src/content/blog/{slug}/`
- [ ] `index.md` 작성
- [ ] `title`, `date`, `category` 작성
- [ ] `published: true` 설정
- [ ] 이미지가 있으면 같은 폴더에 저장

### PAGES

- [ ] 파일 생성: `src/content/pages/{slug}.md`
- [ ] `title`, `description`, `published` 작성
- [ ] 업데이트 날짜와 변경 이력은 본문에 작성
- [ ] 푸터나 네비게이션 연결이 필요하면 관련 컴포넌트 수정

### ATLAS

- [ ] 파일명: `ol-atlas_v{version}.html`
- [ ] 위치: `public/atlas/latest/`
- [ ] 기존 latest 파일 교체
- [ ] `npm run build` 확인

---

## 10. 스키마 참조

모든 컬렉션 스키마는 `src/content.config.ts`에 정의되어 있습니다. 새 필드를 추가하려면 이 파일의 해당 컬렉션 스키마를 수정해야 합니다.

---

## 수정 변경사항

### 2026-06-15 · v1.5

- STORY 시리즈 `index.md`를 TEXT 시리즈와 같은 `kind: series` 메타데이터 파일로 운영하도록 정리했습니다.
- STORY 개별 문서 전용 필드인 `part`, `group`, `chapter`, `order`, `publishedAt`, `htmlAsset`를 시리즈 `index.md`에 쓰지 않는 원칙을 추가했습니다.

### 2026-06-14 · v1.4

- `public/generated/` 자산 동기화를 전체 삭제 후 복사 방식에서 증분 동기화 방식으로 변경한 내용을 반영했습니다.
- GitHub Actions에서 `public/generated/` 캐시를 복원해 변경되지 않은 DESIGN/STORY 자산의 반복 복사를 줄이는 운영 방식을 추가했습니다.

### 2026-06-13 · v1.3

- 콘텐츠 관리 매뉴얼을 공개 홈페이지 페이지에서 Codex 에이전트 내부 참고 문서로 전환했습니다.
- 문서 위치를 `src/content/pages/content-management-manual.md`에서 `.agents/references/ol-home-content-management-manual.md`로 변경했습니다.
- `src/content/pages/`는 방문자에게 공개할 상설 문서만 두는 위치로 정리했습니다.

### 2026-06-12 · v1.2

- 저장소 기준을 `biwoom.github.io`로 업데이트했습니다.
- GitHub Pages 루트 배포 기준에 맞춰 `base` 없음 원칙을 추가했습니다.
- STORY 운영 설명을 현재 개별 문서 라우트(`/story/{series}/{part}/{doc}/`) 구조에 맞게 수정했습니다.
- `pages` 스키마가 허용하는 frontmatter 범위를 명시했습니다.
- GitHub Pages 404 확인 항목을 추가했습니다.
- 브랜드 정의서와 콘텐츠 관리 매뉴얼의 위치를 `src/content/pages/` 기준으로 정리했습니다.

### 2026-06-11 · v1.1

- TEXT, STORY, DESIGN 중심의 콘텐츠 작성 규칙을 정리했습니다.
- 자산 동기화 원칙과 `public/generated/` 운용 방식을 추가했습니다.
- Pagefind 빌드 흐름과 태그 prefix 규칙을 정리했습니다.

### 2026-06-11 · v1.0

- OL HOME 콘텐츠 관리 매뉴얼 초안을 작성했습니다.
