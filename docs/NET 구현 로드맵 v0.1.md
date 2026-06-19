---
title: "NET 구현 로드맵 v0.1"
description: "OL HOME NET 메뉴를 가장 단순한 구현부터 단계적으로 개발하기 위한 실행 로드맵입니다."
published: true
---

# NET 구현 로드맵 v0.1

문서 버전: v0.1
작성일: 2026-06-19
대상 프로젝트: OL HOME / OL NET / OL ENTITY
관련 기획 문서: `docs/NET 기획 v0.3.1.md`
목표: NET 메뉴를 가장 단순한 형태에서 시작해, 검색·필터·상세·관계망·지도 탭 순서로 확장한다.

---

## 0. 기본 판단

NET 구현은 한 번에 완성형 대시보드를 만드는 방식으로 진행하지 않는다.

현재 OL HOME에는 이미 다음 기반이 있다.

```txt
src/content/entities/
src/pages/entity/index.astro
src/pages/entity/[type]/[id].astro
src/components/entity/OLEntityCard.astro
src/components/entity/OLEntityPanel.astro
src/components/common/OLPrefixTagFilters.astro
src/lib/tags.ts
src/content.config.ts
```

따라서 NET은 완전 신규 시스템이 아니라, 기존 ENTITY 시스템 위에 별도 탐색 메뉴를 얹는 방식으로 구현한다.

핵심 원칙:

```txt
1. 먼저 정적 페이지로 시작한다.
2. 데이터 구조를 과하게 확장하기 전에 UI 흐름을 검증한다.
3. 지도 기능은 수작업 SVG 지도 완성 전까지 구현하지 않는다.
4. 관계망 그래프는 2차 작업으로 분리한다.
5. 각 단계 완료 후 실제 사용감과 정보 구조를 평가한다.
```

---

## 1. 전체 단계 요약

```txt
0단계: 현재 Entity 기반 점검
1단계: /net 정적 진입 페이지
2단계: /net Entity 목록 페이지
3단계: 유형 필터와 prefix 태그 필터
4단계: 클라이언트 검색
5단계: 선택 Entity 상세 패널
6단계: 관련 STORY / TEXT / DESIGN 출력
7단계: Concept Entity 스키마 확장
8단계: 관계망 그래프 1차 구현
9단계: 장소 Entity 지도 탭 placeholder
10단계: 수작업 SVG 지도 연결
```

각 단계는 이전 단계가 충분히 작동하고 방향성이 맞는지 확인한 뒤 진행한다.

---

## 2. 0단계: 현재 Entity 기반 점검

### 목표

현재 `entities` 컬렉션, Entity 페이지, Entity 카드/패널 컴포넌트가 NET 구현에 재사용 가능한지 확인한다.

### 구현 내용

```txt
src/content.config.ts의 entities 스키마 확인
src/content/entities/persons, places, concepts 샘플 확인
src/pages/entity/index.astro 구조 확인
src/pages/entity/[type]/[id].astro 구조 확인
OLEntityCard, OLEntityPanel 재사용 가능성 확인
OLPrefixTagFilters 재사용 가능성 확인
```

### 평가 기준

```txt
Entity 카드 목록을 이미 만들 수 있는가?
Entity 상세 페이지로 이동할 수 있는가?
concepts 폴더가 실제로 존재하는가?
prefixTags 또는 tags 기반 필터를 붙일 수 있는가?
```

### 판단

이 단계는 이미 상당 부분 충족되어 있다. 따라서 1단계로 바로 진입 가능하다.

---

## 3. 1단계: /net 정적 진입 페이지

### 목표

가장 단순한 NET 공개 메뉴 페이지를 만든다.

이 단계에서는 검색, 필터, 관계망, 지도 기능을 구현하지 않는다.

### 구현 내용

```txt
src/pages/net/index.astro 생성
BaseLayout 사용
OL HOME의 다른 메인 메뉴 페이지와 같은 히어로 레이아웃 적용
히어로 안에 Entity 전용 검색폼 UI 배치
히어로 아래 최신 Entity 카드 리스트 출력
인물 / 장소 / 개념 섹션 또는 배지 표시
```

### 화면 구조

```txt
Hero
- NET
- 불교 지식이 서로 이어지는 연결망
- Entity 검색 input
- 전체 / 인물 / 장소 / 개념 빠른 필터 버튼

Latest Entities
- 최신 또는 추천 Entity 카드
```

### 평가 기준

```txt
NET이 기존 OL HOME 메뉴들과 시각적으로 어울리는가?
검색폼이 있어도 아직 작동하지 않는 상태가 어색하지 않은가?
Entity 카드가 너무 백과사전처럼 보이지 않는가?
인물, 장소, 개념의 차이가 독자에게 보이는가?
```

### 이 단계에서 하지 않는 것

```txt
실시간 검색
태그 필터
우측 상세 패널
관계망 그래프
지도
```

### 계속 진행 조건

진입 페이지가 OL HOME의 다른 메뉴 페이지와 자연스럽게 연결된다고 판단되면 2단계로 간다.

---

## 4. 2단계: /net Entity 목록 페이지

### 목표

`/entity` 목록과 별도로, NET의 탐색 화면 기본 골격을 만든다.

### 구현 내용

```txt
/net 페이지 안에 검색·탐색 레이아웃 추가
좌측 필터 영역 placeholder
중앙 Entity 카드 목록
우측 상세 패널 placeholder
getCollection('entities')로 published Entity만 로드
```

### 화면 구조

```txt
좌측: 필터 placeholder
중앙: Entity 카드 목록
우측: 선택 전 안내 패널
```

### 평가 기준

```txt
3열 구조가 데스크탑에서 답답하지 않은가?
중앙 카드 목록이 읽기 쉬운가?
우측 패널이 비어 있어도 전체 레이아웃이 안정적인가?
모바일에서 3열 구조를 접을 방향이 보이는가?
```

### 이 단계에서 하지 않는 것

```txt
필터 실제 동작
검색 실제 동작
상세 패널 동적 전환
```

### 계속 진행 조건

Entity 목록이 NET의 중심 화면으로 적절하다고 판단되면 3단계로 간다.

---

## 5. 3단계: 유형 필터와 prefix 태그 필터

### 목표

NET의 첫 실제 탐색 기능을 붙인다.

### 구현 내용

```txt
유형 필터: 전체 / 인물 / 장소 / 개념
prefix 태그 필터: 기존 OLPrefixTagFilters 재사용 또는 확장
태그 그룹 생성: groupTagsByPrefix(tags)
카드에 data-tags, data-type 속성 추가
필터 선택 상태를 화면에 표시
```

### 참고 자료

```txt
docs/net-explorer/ol-atlas_v0.0.8.html
src/components/common/OLPrefixTagFilters.astro
src/lib/tags.ts
```

### 필터 원칙

```txt
유형 필터는 가장 우선 적용한다.
같은 prefix 안에서는 OR 조건을 목표로 한다.
서로 다른 prefix 사이에서는 AND 조건을 목표로 한다.
초기 구현에서는 기존 OLPrefixTagFilters의 동작을 우선 재사용한다.
복잡한 조건 조합은 후속 단계에서 확장한다.
```

### 평가 기준

```txt
필터가 너무 복잡하게 느껴지지 않는가?
태그 prefix가 실제 Entity 분류에 도움이 되는가?
사용자가 인물/장소/개념을 빠르게 좁힐 수 있는가?
기존 OLPrefixTagFilters를 그대로 쓰기에 충분한가?
새 필터 컴포넌트가 필요한가?
```

### 계속 진행 조건

사용자가 “NET은 Entity를 탐색하는 도구”라는 느낌을 받을 수 있으면 4단계로 간다.

---

## 6. 4단계: 클라이언트 검색

### 목표

Entity 이름, 별칭, 원어, 설명, 태그를 대상으로 간단한 클라이언트 검색을 구현한다.

### 구현 내용

```txt
검색 input 활성화
Entity 카드에 검색용 data-search 속성 추가
검색어 입력 시 카드 목록 필터링
검색어와 유형/태그 필터를 함께 적용
결과 없음 상태 표시
```

### 검색 대상

```txt
name.ko
name.en
name.pali
name.sanskrit
name.chinese
aliases
description
tags
```

### 평가 기준

```txt
검색 반응이 충분히 빠른가?
검색 결과가 예측 가능하게 줄어드는가?
필터와 검색어가 함께 적용될 때 혼란스럽지 않은가?
검색 결과 없음 상태가 명확한가?
```

### 이 단계에서 하지 않는 것

```txt
Pagefind 연동
전문 검색
본문 전문 검색
관계 기반 추천
```

### 계속 진행 조건

현재 Entity 수가 많지 않다면 클라이언트 검색으로 충분하다. 데이터가 크게 늘어난 뒤에만 검색 엔진 연동을 재검토한다.

---

## 7. 5단계: 선택 Entity 상세 패널

### 목표

카드를 클릭했을 때 우측 패널에 Entity 요약 정보를 보여준다.

### 구현 내용

```txt
Entity 카드 클릭 이벤트 추가
우측 패널에 선택 Entity 정보 출력
기존 OLEntityPanel 재사용 또는 NET용 패널 컴포넌트 생성
상세 페이지 이동 링크 제공
URL 쿼리 selected/type 반영 검토
```

### 우측 패널 기본 내용

```txt
유형
이름
원어명
별칭
설명
주요 태그
상세 페이지로 이동
```

### 평가 기준

```txt
카드 목록과 우측 패널의 관계가 명확한가?
상세 페이지와 NET 패널의 역할이 겹치지 않는가?
패널이 너무 많은 정보를 담고 있지 않은가?
모바일에서는 바텀시트로 전환하는 것이 자연스러운가?
```

### 계속 진행 조건

우측 패널이 “미리보기”로 적절하고, 전체 상세는 `/entity/...`로 보내는 구조가 자연스러우면 6단계로 간다.

---

## 8. 6단계: 관련 STORY / TEXT / DESIGN 출력

### 목표

선택 Entity와 연결된 OL 콘텐츠를 우측 패널 하단에 보여준다.

### 구현 내용

```txt
Entity.appearsIn 출력
Entity.relatedText 출력
Entity.relatedDesign 출력
Person.primaryPlaces, Place.relatedPersons, Concept.relatedConcepts 일부 출력
각 항목은 제목과 링크 중심으로 작게 표시
```

### 우측 패널 하단 구조

```txt
관련 STORY
관련 TEXT
관련 DESIGN
관련 인물 / 장소 / 개념
```

### 평가 기준

```txt
관련 문서가 NET의 핵심 가치로 보이는가?
STORY, TEXT, DESIGN의 역할 차이가 보이는가?
연결 정보가 부족한 Entity가 너무 비어 보이지 않는가?
데이터 입력 부담이 과하지 않은가?
```

### 계속 진행 조건

관련 콘텐츠 출력이 NET의 존재 이유를 강화한다고 판단되면 7단계로 간다.

---

## 9. 7단계: Concept Entity 스키마 확장

### 목표

개념 Entity를 불교용어 사전형 문서로 다룰 수 있게 스키마를 확장한다.

### 구현 내용

```txt
src/content.config.ts ConceptSchema 확장
dictionary 블록 추가
termVariants 추가
doctrinalProfiles 추가
editorialStatus 추가
샘플 concept 문서 1~2개 업데이트
```

### 기준 문서

```txt
docs/NET 기획 v0.3.1.md
```

### 평가 기준

```txt
프론트메터가 너무 무겁지 않은가?
검색과 필터에 필요한 정보가 충분한가?
아가마/아비달마/반야부/유가부 구분이 실제 작성에 도움이 되는가?
긴 학술 설명은 본문으로 빠지고 있는가?
```

### 주의

이 단계는 화면보다 데이터 구조의 영향이 크다. 따라서 실제 개념 문서 1~2개로 먼저 테스트한 뒤 전체 확장 여부를 판단한다.

---

## 10. 8단계: 관계망 그래프 1차 구현

### 목표

선택 Entity 주변의 1차 관계만 보여주는 미니 관계망 그래프를 구현한다.

### 참고 자료

```txt
docs/net-explorer/빛구슬연결망_v9.html
src/components/graph/OLGraphView.astro
```

### 구현 내용

```txt
우측 상세 패널 또는 별도 탭에 관계망 영역 추가
선택 Entity를 중심 노드로 표시
관련 인물 / 장소 / 개념 / STORY / TEXT / DESIGN을 1차 노드로 표시
노드 클릭 시 해당 Entity 또는 문서로 이동
```

### 평가 기준

```txt
그래프가 실제 이해에 도움이 되는가?
그래프가 카드 목록과 상세 패널을 방해하지 않는가?
노드 수가 많을 때 복잡도가 통제되는가?
그래프 없이도 NET의 기본 사용성이 유지되는가?
```

### 계속 진행 조건

그래프가 “보기 좋은 장식”이 아니라 실제 탐색에 도움이 된다고 판단될 때만 확장한다.

---

## 11. 9단계: 장소 Entity 지도 탭 placeholder

### 목표

지도 기능의 UI 자리를 만들되, 실제 지도는 아직 연결하지 않는다.

### 구현 내용

```txt
장소 Entity 상세 패널에 지도보기 버튼 추가
버튼 클릭 시 우측 패널에 지도 탭 표시
지도 탭에는 임시 안내문 출력
```

### 임시 안내문 예시

```txt
고대 인도 지도는 수작업 제작 후 연결 예정입니다.
현재는 장소 Entity의 위치 정보와 관련 문서를 먼저 제공합니다.
```

### 평가 기준

```txt
지도 기능이 아직 없어도 UI 흐름이 자연스러운가?
장소 Entity에서만 지도 버튼이 보이는가?
사용자가 미완성 기능으로 오해하지 않는가?
```

---

## 12. 10단계: 수작업 SVG 지도 연결

### 목표

사용자가 완성한 고대 인도 SVG 지도를 장소 Entity와 연결한다.

### 구현 조건

```txt
수작업 SVG 지도 산출물이 완성되어 있어야 한다.
SVG 내부 marker id와 placeId 매핑이 정리되어 있어야 한다.
장소 Entity의 map.markerId 또는 관련 필드가 준비되어 있어야 한다.
```

### 구현 내용

```txt
지도 SVG를 public 또는 src assets 중 적절한 위치에 배치
장소 Entity의 placeId와 SVG marker id 연결
장소 선택 시 marker 강조
지도 탭에서 SVG 출력
```

### 평가 기준

```txt
지도 위치가 충분히 신뢰 가능한가?
지도 UI가 NET의 기본 탐색을 방해하지 않는가?
장소 Entity와 지도 marker 연결이 유지보수 가능한가?
```

---

## 13. 권장 첫 작업

가장 먼저 할 작업은 다음이다.

```txt
1. src/pages/net/index.astro 생성
2. 기존 BaseLayout 사용
3. NET 히어로와 Entity 전용 검색폼 UI 작성
4. getCollection('entities')로 최신 Entity 카드 6~12개 출력
5. 기존 OLEntityCard 재사용
6. npm run build로 확인
```

이 작업의 목적은 기능 구현이 아니라 “NET이 OL HOME 안에서 어떤 화면으로 시작되는가”를 확인하는 것이다.

첫 단계 산출물:

```txt
/net 페이지
히어로
검색폼 UI
최신 Entity 카드 리스트
```

첫 단계에서 판단할 질문:

```txt
NET 진입 페이지가 필요한가, 아니면 곧바로 검색·탐색 페이지로 들어가야 하는가?
히어로 검색폼이 충분히 명확한가?
Entity 카드가 이 메뉴의 핵심 대상으로 보이는가?
인물/장소/개념 3유형이 균형 있게 드러나는가?
```

---

## 14. 단계별 중단 기준

각 단계에서 다음 문제가 보이면 바로 멈추고 방향을 재검토한다.

```txt
화면이 기존 OL HOME 디자인과 어울리지 않는다.
데이터 입력 부담이 급격히 늘어난다.
지도나 그래프가 핵심 탐색보다 앞서 보인다.
Entity 상세 페이지와 NET 상세 패널의 역할이 겹친다.
개념 Entity가 단순 태그와 구분되지 않는다.
모바일에서 사용 흐름이 무너진다.
```

---

## 15. 수정 변경사항

### 2026-06-19

- NET 실제 구현을 위한 단계별 로드맵 v0.1을 작성했다.
- 가장 단순한 `/net` 진입 페이지부터 검색, 필터, 상세 패널, 관련 콘텐츠, 개념 스키마, 관계망, 지도 탭 순서로 구현 단계를 정리했다.
- 각 단계마다 목표, 구현 내용, 평가 기준, 제외 범위, 계속 진행 조건을 추가했다.
- 현재 코드베이스의 기존 Entity 구조와 `OLPrefixTagFilters` 재사용 가능성을 반영했다.
