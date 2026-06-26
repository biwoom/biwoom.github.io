---
title: "OL HOME 리팩터링 기록 — 검증, 공용 모듈, TOC, 페이지네이션"
description: "2026년 6월 25일과 26일에 진행한 OL HOME 코드 정리, 콘텐츠 검증 강화, TEXT·STORY 리더 개선, 목록 페이지네이션 통일 작업 기록."
date: 2026-06-26T00:00:00.000Z
category: OL
readingTime: 7
tags:
  - topic/개발
  - topic/리팩터링
  - topic/페이지네이션
  - kind/blog
  - project/ol-home
  - project/text
  - project/story
  - project/design
  - feature/content-validation
  - feature/tag-index
  - feature/pagination
  - feature/text-reader
  - feature/story-reader
published: true
---

어제와 오늘의 작업은 OL HOME의 겉모양을 크게 바꾸기보다, 앞으로 콘텐츠가 늘어날 때 버틸 수 있는 내부 구조를 정리하는 데 집중했다. 큰 방향은 세 가지였다.

첫째, 콘텐츠와 자산을 더 엄격하게 검증한다. 둘째, TEXT·STORY·DESIGN·BLOG·NET에서 반복되던 클라이언트 코드를 공용 모듈로 옮긴다. 셋째, TEXT와 STORY의 읽기 화면은 방해를 줄이고, 목록 화면은 같은 방식의 "더 보기" 흐름으로 맞춘다.

## 6월 25일 — 리팩터링 로드맵과 1차 구현

6월 25일 저녁 작업의 출발점은 리팩터링 로드맵이었다. 기능을 더 붙이기 전에, 어디까지가 콘텐츠 규칙이고 어디부터가 화면 구현인지 분리할 필요가 있었다.

이를 위해 `docs/프로젝트 코드 리팩터링 로드맵 v0.1.md`를 추가하고, 현재 코드의 중복 지점과 우선순위를 정리했다. 이 문서는 단순한 TODO 목록이 아니라, OL HOME이 커질 때 반복적으로 문제를 만들 수 있는 지점을 미리 표시하는 기준 문서에 가깝다.

첫 번째 구현 대상은 콘텐츠 검증이었다. `scripts/check-content.mjs`를 추가해 frontmatter와 콘텐츠 파일의 기본 규칙을 빌드 전에 검사하도록 했다. 이제 deprecated 필드, slash-form이 아닌 태그, 누락된 자산, `.DS_Store` 같은 불필요한 파일을 더 일찍 발견할 수 있다.

## 콘텐츠 스키마와 태그 정리

이전까지는 컬렉션마다 태그 처리 방식이 조금씩 달랐다. TEXT와 STORY는 prefix tag 흐름을 쓰고 있었지만, 일부 구조에는 과거 필드나 페이지별 구현 방식이 남아 있었다.

이번 정리에서 active collection의 태그는 `tags: string[]` 하나를 중심으로 통일했다. `prefixTags` 같은 별도 필드를 늘리는 대신, `개념/연기`, `project/ol-home`, `feature/pagination`처럼 slash-form 문자열을 표준으로 삼았다.

이 원칙은 단순히 frontmatter를 예쁘게 맞추기 위한 것이 아니다. 태그가 수백 개로 늘어날 때, prefix를 기준으로 사용자용 필터와 내부 관리 태그를 분리할 수 있어야 한다. TEXT와 STORY의 사용자 화면에서는 `kind`, `project`, `feature` 같은 운영 태그를 숨기고, 실제 독자에게 필요한 인물·장소·개념 중심 태그만 노출할 수 있다.

## 공용 모듈로 옮긴 것들

6월 25일 작업에서는 여러 페이지에 흩어져 있던 반복 로직을 공용 레이어로 옮겼다.

- `src/lib/content-structure.ts`: TEXT와 STORY의 slug, 그룹, 정렬 흐름을 공통으로 다룬다.
- `src/lib/assets.ts`: 콘텐츠 자산 URL과 다운로드 파일명 같은 자산 관련 처리를 모은다.
- `src/lib/tags.ts`: prefix tag 파싱과 표시 로직의 기반을 둔다.
- `src/lib/client/content-filters.ts`: TEXT, STORY, DESIGN의 클라이언트 필터 동작을 공유한다.

이 변화로 각 페이지 템플릿은 화면 구조에 더 집중할 수 있게 되었다. 필터가 필요한 곳마다 비슷한 스크립트를 다시 쓰는 방식은 줄이고, 같은 규칙을 한 번 고쳐 여러 화면에 반영하는 구조로 옮겨갔다.

## 6월 26일 — 설정, 자산, 태그 결과 모달

6월 26일 아침에는 리팩터링의 두 번째 묶음을 진행했다. 이 작업은 설정과 자산, 태그 결과 UI를 정리하는 데 초점이 있었다.

고정 사이트 설정과 DESIGN 자산 provider 설정을 `site-config.mjs`로 모으고, Astro 코드에서는 `src/lib/site-config.ts`를 통해 읽도록 했다. 이로써 페이지나 helper가 환경변수를 직접 읽는 경로를 줄였다.

DESIGN 자산은 로컬 생성 경로와 외부 저장소 전환 가능성을 함께 고려해야 한다. 그래서 `.env.example`, `scripts/remark-design-asset-urls.mjs`, `scripts/sync-content-assets.mjs`를 정리해, frontmatter와 Markdown 본문이 특정 배포 경로에 묶이지 않도록 했다.

TEXT와 STORY의 태그 결과 UI도 공통 컴포넌트로 옮겼다. `OLTagResultsModal.astro`와 `tag-results.css`를 추가해, 시리즈별 태그 검색 결과를 서로 다른 페이지가 같은 방식으로 표시할 수 있게 했다. 이후 태그 결과 패널의 접근성이나 모바일 동작을 고칠 때 한 군데에서 수정할 수 있다.

## TEXT와 STORY 상세페이지 — 오른쪽 정보 스택

다음 작업은 TEXT와 STORY 상세페이지의 읽기 경험이었다. 이 변경은 페이지네이션이 아니라, 본문 안에서 현재 위치와 관련 Entity를 확인하는 방식에 대한 개선이다.

TEXT와 STORY 문서 상세페이지는 오른쪽에 데스크탑용 정보 스택을 갖도록 정리했다. 이 스택에는 `On this page` 목차와 Entity 이름카드가 함께 들어간다. 기존에는 목차가 상단 도구 영역에 섞여 있었고, Entity 패널과의 위치 관계도 페이지마다 달랐다.

이번 변경에서는 데스크탑 목차를 접힌 상태로 시작하게 하고, 제목 수를 trigger에 표시했다. 사용자가 펼치면 현재 본문의 `h2`, `h3` 구조를 볼 수 있고, 스크롤 위치에 따라 활성 섹션이 표시된다.

STORY 쪽은 별도 조정이 필요했다. STORY에는 파트 내비게이션이 sticky로 남아 있기 때문에, 오른쪽 정보 스택이 그 아래에 위치하도록 offset을 맞췄다. 이렇게 해야 스크롤 중 목차와 이름카드가 상단 내비게이션에 가려지지 않는다.

## 목록 페이지 — "더 보기" 페이지네이션 통일

마지막으로 BLOG, TEXT, STORY, DESIGN, NET의 목록 화면에 흩어져 있던 "더 보기" 동작을 통일했다.

`src/lib/client/paginated-list.ts`를 새로 추가하고, 카드형 목록에서 공통으로 쓸 paginator를 만들었다. 이 모듈은 현재 보이는 항목 수, 남은 항목 수, load-more 버튼 표시 여부를 관리한다.

기존에는 BLOG, DESIGN, NET, TEXT, STORY가 각자 조금씩 다른 방식으로 visible count를 다뤘다. 필터를 바꾸면 처음 페이지로 돌아가야 하고, 결과가 없으면 empty state가 보여야 하며, NET처럼 URL deep-link로 특정 카드에 초점이 잡히는 경우에는 그 카드가 들어 있는 페이지까지 열려야 한다.

공용 paginator는 이런 규칙을 한 곳에서 처리한다. BLOG와 NET은 직접 paginator를 사용하고, TEXT·STORY·DESIGN은 `content-filters.ts`를 통해 같은 흐름을 공유한다.

이번 페이지네이션 작업의 범위는 목록 화면이다. TEXT와 STORY의 문서 상세페이지에는 페이지네이션을 추가하지 않았다. 상세페이지는 이전·다음 문서 탐색과 본문 목차를 유지하고, 목록 화면만 카드 수가 많아질 때 단계적으로 열리도록 정리했다.

## 검증과 결과

이번 이틀간의 작업으로 OL HOME은 다음 기준을 갖게 되었다.

- 콘텐츠 검증은 빌드 전에 실행된다.
- 태그는 `tags` 배열과 slash-form 문자열로 통일한다.
- TEXT·STORY·DESIGN의 필터 동작은 공용 클라이언트 모듈을 우선 사용한다.
- DESIGN 자산 URL은 provider-neutral한 resolver를 거친다.
- TEXT와 STORY 상세페이지는 오른쪽 정보 스택으로 TOC와 Entity 패널을 정리한다.
- BLOG, TEXT, STORY, DESIGN, NET의 목록 페이지는 같은 load-more pagination 패턴을 사용한다.

로컬 검증은 `npm run build`로 확인했다. 이 과정에서 콘텐츠 validator, asset sync, Astro build, Pagefind indexing이 함께 통과했다.

## 다음으로 볼 것

이번 정리는 새 기능을 크게 보이게 만드는 작업보다, 이후 콘텐츠가 늘어났을 때 무너지지 않도록 바닥을 고르는 작업에 가깝다.

다음 단계에서는 실제 데이터가 더 많아졌을 때의 압력을 봐야 한다. 특히 TEXT와 STORY는 태그 수와 문서 수가 늘어날수록 필터 결과 표시, 목차 스크롤, Entity 패널의 밀도가 중요해진다. NET은 deep-link와 필터 조합이 많아질 때 paginator가 기대한 대로 결과를 열어 주는지 계속 확인할 필요가 있다.
