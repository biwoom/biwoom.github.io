---
title: BOOK과 DESIGN 파일 저장 구조 — 메타데이터 분리 전략
description: 완결된 BOOK HTML과 DESIGN 이미지를 홈페이지에 등록하는 방법. 메타데이터와 실제 파일을 분리하는 이유와 구체적인 절차를 설명합니다.
date: 2026-05-28T00:00:00.000Z
category: OL
readingTime: 6
tags:
  - project/book
  - project/design
  - topic/파일관리
  - kind/blog
  - topic/file-management
  - topic/metadata
published: true
---

OL HOME에 완결 HTML 자료나 DESIGN 이미지를 등록하려면 메타데이터(md)와 실제 자산(HTML/이미지)을 분리해 둔다.

## HTML 자산 등록 절차

현재 OL HOME에서는 완결 HTML을 별도 `book` 컬렉션으로 두지 않는다. 대신 STORY 시리즈 자산이나 DESIGN 항목 자산으로 등록한다.

**1단계**: 콘텐츠 폴더의 `assets/` 아래에 HTML 파일을 둔다.

```
src/content/story/buddha-story/assets/index.html
```

**2단계**: 메타데이터는 현재 컬렉션의 `index.md`에서 연결한다.

```yaml
---
title: "붓다 스토리"
kind: "series"
series: "붓다 스토리"
seriesSlug: "buddha-story"
description: "부처님의 일대기를 원전 기반으로 재구성"
tags:
  - "형식/이야기불교"
  - "주제/붓다전기"
  - "kind/story"
published: true
---
```

시리즈 HTML은 `src/content/story/{series}/assets/index.html`처럼 두고, DESIGN HTML은 `htmlAsset`으로 연결한다.

## DESIGN 등록 절차

DESIGN은 `index.md`와 `assets/` 폴더를 같이 둔다.

```
src/content/design/gandhara-face/index.md
src/content/design/gandhara-face/assets/gandhara-face.jpg
```

메타데이터에는 현재 필드명을 쓴다.

```yaml
---
title: "간다라 얼굴 연구"
primaryKind: "reference"
type: "portrait"
format: "image"
thumbnailAsset: "gandhara-face.jpg"
imageAsset: "gandhara-face.jpg"
previewAssets:
  - "gandhara-face.jpg"
tags:
  - "종류/레퍼런스"
  - "주제/간다라"
  - "형식/이미지"
  - "kind/reference"
published: true
---
```

`thumbnailAsset`, `imageAsset`, `previewAssets`, `htmlAsset`, `pdfAsset`는 모두 현재 항목의 파일 또는 `assets/` 아래 파일을 가리켜야 한다.

## GitHub 용량 참고

개별 파일 100MB 이하, 저장소 전체 1GB 권장. 웹용 이미지(100KB~2MB)라면 수백 장까지 문제없다. 이미지가 많아지면 원본 저장소 분리나 별도 배포 전략을 검토할 수 있지만, OL HOME 운영 기준에서는 로컬 자산 필드와 실제 파일 경로를 먼저 일치시키는 것이 우선이다.
