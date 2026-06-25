---
title: "NET 기획안 v0.3.1"
description: "OL HOME의 NET 메뉴와 ENTITY 문서를 연결하는 기획 문서입니다."
published: true
---

# NET 기획안 v0.3.1

문서 버전: v0.3.1
작성일: 2026-06-18
업데이트일: 2026-06-19
대상 프로젝트: OL HOME / OL STORY / OL TEXT / OL DESIGN / OL NET / OL ENTITY
기획 범위: NET 공개 메뉴, ENTITY 검색·필터·상세 패널, STORY·TEXT·DESIGN 연동 구조

---

## 0. v0.3.1 업데이트 핵심

v0.3.1에서는 NET의 1차 목표를 지도 중심 메뉴가 아니라 **Entity Explorer**로 재정의하고, 실제 UI 참고 자료를 반영한다.

```txt
1. 고대 인도 SVG 지도 제작은 OL HOME 내부 작업 범위에서 일단 제외한다.
2. 지도는 사용자가 별도로 수작업 제작한 산출물이 완성된 뒤 후속 단계에서 연결한다.
3. Entity 종류는 인물, 장소, 개념으로 확장한다.
4. NET 기본 우측 상세 패널에서는 지도를 제외하고 Entity 카드 상세내용을 먼저 출력한다.
5. 우측 상세 패널 하단에는 선택 Entity와 관련된 STORY, TEXT, DESIGN 정보를 출력한다.
6. 우측 상세 패널의 1차 시각화는 지도보다 Entity 노드 관계망 그래프를 우선한다.
7. 지도는 장소 Entity에서 지도보기 버튼을 눌렀을 때 우측 상세 패널에 지도 탭을 추가하는 방식으로 제공한다.
8. 실제 지도 산출물이 준비되기 전까지 지도 탭은 임시 안내문으로 대체한다.
9. 검색 결과에서는 ENTITY 개별 문서(`/entity/...`)로 진입할 수 있다.
10. Entity 원본 데이터에서 memoryPhrase 필드는 사용하지 않는다.
11. NET 진입 페이지는 OL HOME의 다른 메인 메뉴 페이지와 같은 히어로 레이아웃을 따른다.
12. 히어로 섹션에는 Entity 전용 검색폼을 추가한다.
13. 히어로 아래에는 최신 Entity 문서를 카드형 리스트로 출력한다.
14. NET 검색 페이지의 좌측 사이드바에는 prefix 태그 필터 UI를 둔다.
15. 관계망 그래프는 2차 작업으로 분리하고 `docs/net-explorer/빛구슬연결망_v9.html`을 참고한다.
```

참고 자료:

```txt
prefix 태그 필터 UI 참고:
docs/net-explorer/ol-atlas_v0.0.8.html

관계망 그래프 구현 참고:
docs/net-explorer/빛구슬연결망_v9.html

전체 NET 검색 페이지 레이아웃 참고:
docs/net-explorer/net-explorer-reference.png
```

NET에서 붓다스토리 연결을 표시할 때는 현재 공개 문서 경로를 기준으로 하되, 파트명과 회차 후보를 정할 때는 `docs/toc/붓다스토리(Buddha Story) 목차 v0.1.md`를 먼저 확인한다. 이 목차는 최종본이 아니므로, 실제 문서 제목과 URL은 `src/content/story/buddha-story`의 현재 파일명을 우선한다.

---

## 1. 기획의 핵심 방향

NET은 OL HOME에서 불교 지식 객체들을 검색·필터·상세 탐색하는 공개 메뉴다.

NET은 단순한 검색 페이지가 아니다. NET은 OL 안에 흩어진 인물, 장소, 개념, 이야기, 문헌 해설, 시각 자료를 서로 연결하여 보여주는 **불교 지식 연결망**이다.

```txt
NET    = 사용자에게 보이는 Entity 탐색 메뉴
ENTITY = 인물·장소·개념 등 개별 지식 객체와 상세 문서
```

사용자는 `NET`이라는 메뉴를 통해 접근하지만, 개발 구조에서는 다음 원칙을 유지한다.

```txt
공개 탐색 메뉴 = NET
개별 상세 문서 = ENTITY
내부 데이터     = src/content/entities
초기 데이터     = persons / places / concepts
```

NET v0.3.1의 핵심 목적은 다음과 같다.

```txt
인물, 장소, 개념을 검색한다.
Entity의 기본 정보와 상세 요약을 확인한다.
해당 Entity가 연결된 STORY, TEXT, DESIGN 문서를 탐색한다.
개념 Entity를 통해 불교전문용어와 학술적 개념을 관리한다.
향후 관계망 그래프와 지도 탭으로 확장할 수 있는 기반을 마련한다.
```

NET은 백과사전식 항목 나열이 아니다. NET은 불교 지식을 “각각의 문서”가 아니라 “서로 이어지는 관계”로 경험하게 하는 탐색 공간이다.

---

## 2. 기본 개념 구분

### 2.1 NET

NET은 OL HOME 상단에 노출되는 공개 메뉴명이다.

역할:

```txt
불교 지식 객체 탐색
인물·장소·개념 검색
태그 기반 필터링
Entity 상세 패널 출력
STORY·TEXT·DESIGN 연결
향후 관계망 그래프·지도 탭·타임라인 확장
```

NET은 일반 독자에게 노출되는 탐색 메뉴 이름이다. ENTITY는 개별 문서와 내부 데이터 구조로 유지한다.

### 2.2 ENTITY

ENTITY는 내부 데이터 구조이면서 개별 상세 문서다.

역할:

```txt
인물, 장소, 개념의 원본 정보 저장
검색과 필터의 기준 데이터 제공
STORY·TEXT·DESIGN 문서와의 연결 기준 제공
관계망 그래프의 노드 데이터 제공
장소 Entity를 통한 지도 확장 기준 제공
```

v0.3.1에서는 Entity 종류를 세 가지로 확장한다.

```txt
persons  = 인물
places   = 장소
concepts = 개념
```

v0.3.1에서는 다음 Entity 종류를 아직 만들지 않는다.

```txt
events
relations
texts
images
```

사건, 관계 자체, 문헌, 이미지 자산은 향후 확장 대상으로 둔다.

### 2.3 Concept Entity

개념 Entity는 불교전문용어와 주요 불교 개념을 다루는 지식 객체다.

예상 성격:

```txt
학술적
전문적
용어 중심
문헌 근거 중심
TEXT 문서와 강하게 연결
일반 독자를 위한 쉬운 설명도 함께 제공
```

개념 Entity는 단순 태그가 아니다. 태그는 탐색용 분류이고, 개념 Entity는 독립 문서와 메타데이터를 가진 지식 객체다.

예:

```txt
보살도
수기
연기
무아
공
중도
사성제
팔정도
열반
업
윤회
삼매
반야
정토
```

---

## 3. NET v0.3.1의 범위

### 3.1 포함하는 것

NET v0.3.1에서 구현 대상으로 삼는 것은 다음이다.

```txt
1. /net 진입 페이지
2. 유형 필터: 인물 / 장소 / 개념
3. 태그 필터
4. 중앙 검색폼
5. Entity 카드 목록
6. 검색 결과 화면
7. 인물 Entity 검색
8. 장소 Entity 검색
9. 개념 Entity 검색
10. 선택 Entity 상세 패널
11. 관련 STORY 문서 리스트
12. 관련 TEXT 문서 리스트
13. 관련 DESIGN 경로 또는 카드 출력
14. ENTITY 개별 문서 이동 링크
15. 장소 Entity의 지도보기 버튼과 임시 지도 안내문
```

### 3.2 제외하는 것

NET v0.3.1에서는 다음 기능을 제외한다.

```txt
고대 인도 SVG 지도 제작
지도 기본 노출
장소 마커 자동 출력
왕국 영역 색칠
붓다 이동 경로
시대별 지도 슬라이더
storyEvents
관계 렌즈
전생-현생 레이어
원전별 관계 비교
타임라인
문헌 Entity
이미지 Entity
```

지도는 중요한 확장 기능이지만, NET의 초기 개발을 지도 완성도에 묶지 않는다.

---

## 4. 전체 정보 구조

NET의 기본 정보 흐름은 다음과 같다.

```txt
STORY / TEXT / DESIGN 문서
  ↓ entity id / tags

ENTITY
  ├── persons
  ├── places
  └── concepts

NET 검색·필터 화면
  ↓

선택 Entity 상세 패널
  ├── 기본 정보
  ├── Entity 상세 요약
  ├── 관련 STORY
  ├── 관련 TEXT
  └── 관련 DESIGN
```

지도는 기본 상세 패널의 구성 요소가 아니다.

```txt
장소 Entity
  ↓ 지도보기 버튼
  ↓
우측 상세 패널에 지도 탭 추가
  ↓
현재는 임시 안내문
  ↓
향후 수작업 SVG 지도 산출물 연결
```

관계망 그래프는 지도보다 먼저 붙일 수 있는 시각화다.

```txt
선택 Entity
  ↓
관련 인물 / 장소 / 개념 / 문서
  ↓
Entity 노드 관계망 그래프
```

---

## 5. 권장 폴더 구조

NET v0.3.1를 위한 기본 폴더 구조는 다음과 같다.

```txt
src/content/
├── story/
│   └── buddha-story/
│       └── ...
│
├── text/
│   └── ...
│
├── design/
│   └── ...
│
└── entities/
    ├── persons/
    │   ├── buddha.md
    │   ├── ananda.md
    │   ├── sumedha.md
    │   └── ...
    │
    ├── places/
    │   ├── lumbini.md
    │   ├── kapilavatthu.md
    │   ├── bodhgaya.md
    │   └── ...
    │
    └── concepts/
        ├── bodhisatta-path.md
        ├── prediction.md
        ├── dependent-origination.md
        └── ...
```

공개 라우트는 다음을 권장한다.

```txt
/net/
NET 검색·필터·Entity 탐색 페이지

/entity/
ENTITY 목록과 기존 개별 문서 진입점

/entity/persons/sumedha/
인물 ENTITY 상세 페이지

/entity/places/sravasti/
장소 ENTITY 상세 페이지

/entity/concepts/bodhisatta-path/
개념 ENTITY 상세 페이지
```

내부 데이터 경로는 `entities`를 유지한다.

```txt
내부 경로: src/content/entities/concepts/bodhisatta-path.md
개별 상세: /entity/concepts/bodhisatta-path/
NET 선택 상태 예시: /net?selected=bodhisatta-path&type=concept
```

---

## 6. NET 메인페이지 구조

NET 메인페이지는 두 단계로 나눈다.

```txt
1. NET 진입 페이지
2. NET 검색·탐색 페이지
```

진입 페이지는 OL HOME의 다른 메인 메뉴 페이지와 같은 히어로 섹션 레이아웃을 따른다. 단, NET은 탐색 도구 성격이 강하므로 히어로 섹션 안에 Entity 전용 검색폼을 둔다.

### 6.1 NET 진입 페이지

진입 페이지 구성:

```txt
상단 히어로
- OL HOME 기존 메인 메뉴 페이지와 같은 히어로 구조
- NET 제목
- 짧은 설명문
- Entity 전용 검색폼
- 유형 빠른 필터: 전체 / 인물 / 장소 / 개념

히어로 아래
- 최신 Entity 카드 리스트
- 추천 Entity 카드 리스트
- 최근 업데이트된 개념 Entity
- 최근 연결된 STORY / TEXT / DESIGN 요약
```

히어로 검색폼 원칙:

```txt
검색 대상은 Entity 문서로 제한한다.
일반 사이트 전체 검색과 혼동하지 않는다.
검색어 입력 시 /net 검색·탐색 페이지로 이동한다.
검색 상태는 URL 쿼리로 보존한다.
```

예:

```txt
/net?q=연기
/net?type=concept&q=보살도
/net?type=place&q=사위성
```

최신 Entity 카드 구성:

```txt
유형 배지
Entity 이름
짧은 설명
주요 태그
최근 업데이트일
관련 STORY / TEXT / DESIGN 수
```

### 6.2 NET 검색·탐색 페이지

NET 검색·탐색 페이지는 사용자가 자연스럽게 검색과 필터를 계속 조합할 수 있는 작업 화면이다.

기본 레이아웃:

```txt
좌측: 유형·태그 필터
중앙: 검색폼과 Entity 카드 목록
우측: 선택 Entity 상세 패널
```

전체 레이아웃은 `docs/net-explorer/net-explorer-reference.png`의 3열 탐색 구조를 참고한다. 다만 현재 NET v0.3.1에서는 중앙 영역을 지도 대신 Entity 결과 목록과 상세 패널 중심으로 구성한다.

```txt
좌측 사이드바  = 유형 필터, prefix 태그 필터, 기타 필터
중앙 영역      = Entity 검색 결과 카드 목록
우측 패널      = 선택 Entity 상세, 관련 STORY/TEXT/DESIGN, 향후 관계망 그래프
```

### 6.3 필터

v0.3.1 필터:

```txt
유형
- 인물
- 장소
- 개념

시기
- 과거불 시대
- 고타마 부처님 생애
- 초기 승가 시대
- 부파불교
- 대승불교

왕국
- 코살라
- 마가다
- 샤카
- 밧지
- 말라

개념 분야
- 교리
- 수행
- 윤리
- 인식
- 존재론
- 해탈론
- 경전 용어
- 종파 용어

문헌
- 니까야
- 율장
- 붓다왐사
- 마하붓다왐사
- 니다나까타
- 한역 아함
- 대승경전
- 논서
```

필터 항목은 데이터가 충분히 쌓인 뒤 확장한다.

### 6.4 prefix 태그 필터 UI

좌측 사이드바의 태그 필터는 `docs/net-explorer/ol-atlas_v0.0.8.html`의 prefix 태그 필터 UI를 참고한다.

핵심 동작:

```txt
태그를 prefix 단위로 묶어 보여준다.
예: 인물/, 장소/, 개념/, 왕국/, 문헌/, 전통/, 분야/

각 prefix 섹션은 접고 펼칠 수 있다.
각 prefix 안에서 태그를 다중 선택할 수 있다.
선택된 태그 수를 배지로 보여준다.
선택된 태그는 URL 상태에 반영한다.
전체 해제 버튼을 제공한다.
태그 검색 입력창으로 긴 태그 목록을 필터링한다.
```

권장 UI 구조:

```txt
필터 사이드바
├── 유형
│   ├── 전체
│   ├── 인물
│   ├── 장소
│   └── 개념
│
├── 태그
│   ├── 검색 input
│   ├── 인물/ 섹션
│   ├── 장소/ 섹션
│   ├── 개념/ 섹션
│   ├── 문헌/ 섹션
│   ├── 전통/ 섹션
│   └── 분야/ 섹션
│
└── 전체 해제
```

필터 조합 방식:

```txt
같은 prefix 안의 태그는 OR 조건을 기본으로 한다.
서로 다른 prefix 사이의 조건은 AND 조건을 기본으로 한다.
유형 필터는 가장 우선 적용한다.
검색어가 있으면 검색어와 필터를 함께 적용한다.
```

예:

```txt
type=concept
tag=전통/아가마
tag=분야/교리
q=연기

→ 개념 Entity 중에서
→ 아가마 계열과 교리 분야에 속하고
→ "연기" 검색어와 매칭되는 항목
```

URL 상태 예:

```txt
/net?type=concept&tag=전통/아가마&tag=분야/교리&q=연기
/net?type=place&tag=왕국/코살라
/net?type=person&tag=역할/제자&tag=장소/사위성
```

모바일에서는 좌측 사이드바를 오프캔버스 또는 접힘 필터 패널로 전환한다.

### 6.5 검색폼

검색 대상:

```txt
인물 이름
장소 이름
개념명
별칭
팔리어명
산스크리트명
한역명
영문명
관련 STORY 제목
관련 TEXT 제목
태그
```

검색 예시:

```txt
붓다
수메다
사위성
Sāvatthī
보살도
연기
사성제
중도
수기
공
```

### 6.6 Entity 카드 목록

카드 구성:

```txt
이름
유형
한 줄 설명
주요 태그
관련 STORY 수
관련 TEXT 수
관련 DESIGN 수
```

개념 Entity 카드 예:

```txt
보살도
개념

깨달음을 향한 긴 서원과 실천의 길.

#개념/보살도 #주제/수행 #문헌/마하붓다왐사

관련 STORY 3
관련 TEXT 4
```

---

## 7. 검색결과 화면 구조

권장 레이아웃:

```txt
좌측: 유형·태그 필터

중앙:
- Entity 검색 결과 목록

우측:
- 선택 Entity 상세 패널
- 향후 관계망 그래프
- 장소 Entity 선택 시 지도 탭 추가
```

전체 시각 구조는 `docs/net-explorer/net-explorer-reference.png`를 참고한다. 다만 해당 참고 이미지는 지도 중심 UI이므로, NET v0.3.1에서는 다음처럼 변환한다.

```txt
참고 이미지의 필터 패널       → NET prefix 태그 필터 사이드바
참고 이미지의 카드 목록       → Entity 검색 결과 목록
참고 이미지의 지도 영역       → 선택 Entity 상세 / 관계망 영역
참고 이미지의 하단 상세 패널   → 우측 상세 패널 하단의 관련 콘텐츠 영역
```

구조 예시:

```txt
┌──────────────────────────────────────────────┐
│ NET                                          │
│ [검색어 입력...........................]      │
├──────────────┬──────────────┬────────────────┤
│ 필터          │ 결과 목록      │ Entity 상세     │
│              │              │                │
│ 유형          │ Entity Card   │ 기본 정보       │
│ - 인물        │ Entity Card   │ 요약 설명       │
│ - 장소        │ Entity Card   │ 관련 STORY      │
│ - 개념        │ Entity Card   │ 관련 TEXT       │
│              │              │ 관련 DESIGN     │
│ 태그          │              │ [상세 페이지]    │
└──────────────┴──────────────┴────────────────┘
```

검색 결과는 URL 상태로 보존하는 것을 권장한다.

```txt
/net?q=사위성
/net?type=place&tag=왕국/코살라
/net?type=concept&q=연기
/net?selected=sravasti&type=place
```

---

## 8. 우측 상세 패널

검색 결과에서 Entity를 선택하면 우측에 상세 패널이 열린다.

v0.3.1 기본 상세 패널은 지도를 포함하지 않는다.

```txt
기본 정보
요약 설명
주요 메타데이터
관련 STORY
관련 TEXT
관련 DESIGN
상세 페이지 이동
```

### 8.1 인물 상세 패널

```txt
이름
원어명
별칭
요약 설명
주요 장소
수행상태
등장 STORY
관련 TEXT
관련 DESIGN
상세 페이지로 이동
```

### 8.2 장소 상세 패널

```txt
장소명
원어명
별칭
장소 유형
소속 왕국
현대 위치
좌표 신뢰도
요약 설명
관련 인물
관련 STORY
관련 TEXT
지도 보기 버튼
상세 페이지로 이동
```

장소 상세 패널의 `지도 보기` 버튼을 클릭하면 우측 상세 패널 안에 지도 탭을 추가한다.

현재 지도 탭 내용:

```txt
고대 인도 지도는 수작업 제작 후 연결 예정입니다.
현재는 장소 Entity의 위치 정보와 관련 문서를 먼저 제공합니다.
```

### 8.3 개념 상세 패널

개념 상세 패널은 불교전문용어를 단순 사전 항목으로 처리하지 않는다.

구성:

```txt
개념명
원어명
한역명
영문명
쉬운 설명
전문 설명
개념 분야
관련 전통
핵심 문헌
관련 인물
관련 장소
관련 STORY
관련 TEXT
관련 DESIGN
상세 페이지로 이동
```

개념 Entity는 TEXT와 강하게 연결된다. 전문 해설, 원전 근거, 학술 논의는 개념 Entity 본문 일부에 요약하고, 본격 해설은 TEXT 문서로 연결한다.

### 8.4 관계망 그래프

관계망 그래프는 지도보다 먼저 구현할 수 있는 NET의 핵심 시각화다.

초기 그래프 노드:

```txt
선택 Entity
관련 인물
관련 장소
관련 개념
관련 STORY
관련 TEXT
관련 DESIGN
```

초기 그래프는 복잡한 지식그래프 엔진이 아니라, 선택 Entity 주변의 1차 관계만 보여주는 미니 그래프로 시작한다.

2차 작업의 관계망 그래프 구현은 `docs/net-explorer/빛구슬연결망_v9.html`을 참고한다.

참고할 요소:

```txt
상단 검색바
노드 검색 결과 패널
노드 클릭 시 우측 패널 표시
선택 노드 포커스
관련 노드 강조
데스크탑 사이드 패널
모바일 하단 시트 전환
```

NET에 맞춘 관계망 그래프 원칙:

```txt
그래프는 전체 Entity를 한 번에 보여주지 않는다.
선택 Entity 주변의 1차 관계부터 보여준다.
노드 유형은 인물, 장소, 개념, STORY, TEXT, DESIGN으로 구분한다.
노드 클릭 시 우측 상세 패널의 선택 Entity가 바뀐다.
문서 노드는 개별 문서 URL로 이동할 수 있다.
그래프는 탐색 보조 기능이며, 카드 목록과 상세 패널을 대체하지 않는다.
```

---

## 9. 지도 연결 원칙

NET v0.3.1에서 지도는 기본 화면이 아니라 장소 Entity의 확장 기능이다.

핵심 원칙:

```txt
고대 인도 SVG 지도 제작은 사용자가 수작업으로 진행한다.
OL HOME은 완성된 SVG 산출물이 준비된 뒤 연결한다.
지도는 장소 Entity에서 지도보기 버튼으로 호출한다.
지도 탭은 우측 상세 패널 안에 추가된다.
현재는 임시 안내문으로 대체한다.
```

장소 정보 연결 원칙:

```txt
장소 정보는 places Entity에 한 번만 기록한다.
인물, STORY, TEXT, DESIGN은 placeId만 참조한다.
인물 문서에 lat/lng 직접 입력 금지
STORY 문서에 lat/lng 직접 입력 금지
같은 장소 정보를 여러 문서에 중복 입력 금지
```

향후 지도 산출물 연결 시:

```txt
장소 Entity의 id와 SVG 내부 marker id를 연결한다.
지도는 좌표 정확성보다 문맥적 위치 이해를 목표로 한다.
좌표 신뢰도와 근거를 함께 기록한다.
```

---

## 10. Person Entity 구조

경로 예시:

```txt
src/content/entities/persons/sumedha.md
```

권장 프론트메터:

```yaml
---
id: "sumedha"
type: "person"

name:
  ko: "수메다"
  en: "Sumedha"
  pali: "Sumedha"

aliases:
  - "수메다 브라만"
  - "수메다 고행자"
  - "미래의 고타마 부처"

description: "아마라와띠의 명문 브라만 가문에서 태어난 인물. 삶의 덧없음을 깊이 바라보고 출가의 길로 나아간다."
tradition: "Buddha biography"

primaryPlaces:
  - placeId: "amaravati"
    relation: "출신지"

spiritualStatus:
  pathStage: "보살도 시작"
  notes:
    - "미래 부처가 될 보살로 서사가 전개된다."

relatedConcepts:
  - conceptId: "bodhisatta-path"
    relation: "핵심 개념"

appearsIn:
  - type: story
    title: "수메다, 길을 묻기 시작하다"
    path: "/story/buddha-story/part-1/01-sumedha-begins-to-ask/"
    role: "주요 인물"

relatedText:
  - type: text
    title: "수메다는 누구인가"
    path: "/text/buddha-story-deep-dive/who-is-sumedha/"

design:
  styleSheet: "/design/buddha-story-person-sumedha-style/"
  imageAsset: "sumedha-profile/profile.webp"

tags:
  - "인물/수메다"
  - "장소/아마라와띠"
  - "개념/보살도"

published: true
---
```

본문 권장 구조:

```md
# 수메다

## 개요

## 이름과 별칭

## 출신과 거주지

## 간략 이력

## 수행상태

## 주요 장소

## 관련 개념

## 등장 STORY

## 관련 TEXT

## 관련 DESIGN

## 원전과 전승상 주의점
```

---

## 11. Place Entity 구조

경로 예시:

```txt
src/content/entities/places/sravasti.md
```

권장 프론트메터:

```yaml
---
id: "sravasti"
type: "place"
placeType: "city"

name:
  ko: "사위성"
  pali: "Sāvatthī"
  sanskrit: "Śrāvastī"
  chinese: "舍衛城"
  en: "Sravasti"

aliases:
  - "사밧티"
  - "슈라바스티"
  - "Savatthi"
  - "Sravasti"

description: "코살라 왕국의 주요 도시. 부처님이 기원정사에서 오랫동안 머물며 많은 설법을 하신 장소로 전승된다."
kingdom: "kosala"

geo:
  lat: 27.51
  lng: 82.05
  confidence: "medium"
  coordinateType: "approximate"
  note: "고대 지명의 현대 위치 비정은 학설에 따라 차이가 있을 수 있음."

historical:
  kingdom: "kosala"
  period:
    - "기원전 6~4세기"
  presentLocation: "인도 우타르프라데시 일대"

map:
  showOnMap: true
  markerId: "place-sravasti"
  markerLabel: "사위성"
  mapStatus: "pending"
  note: "수작업 SVG 지도 완성 후 연결 예정"

relatedPersons:
  - id: "buddha"
    relation: "주요 체류"

relatedConcepts:
  - conceptId: "dhamma-teaching"
    relation: "설법 장소"

relatedStories:
  - type: story
    title: "붓다의 사위성 체류"
    path: "/story/buddha-story/..."

relatedText:
  - type: text
    title: "기원정사의 의미"
    path: "/text/..."

tags:
  - "장소/사위성"
  - "왕국/코살라"
  - "유형/도시"

published: true
---
```

본문 권장 구조:

```md
# 사위성

## 개요

## 이름과 별칭

## 고대 지리와 현대 위치

## 소속 왕국

## 관련 인물

## 관련 개념

## 관련 STORY

## 관련 TEXT

## 지도 정보와 좌표 신뢰도

## 원전과 전승상 주의점
```

---

## 12. Concept Entity 구조

경로 예시:

```txt
src/content/entities/concepts/bodhisatta-path.md
```

개념 Entity는 불교전문용어와 주요 불교 개념을 관리한다. 특히 TEXT 메뉴의 번역·주석·강의록·수행연구 문서와 강하게 연결될 가능성이 크므로, 프론트메터는 사전에 충분히 설계해야 한다.

개념 Entity는 기본적으로 불교용어 사전 항목처럼 작동해야 한다. 따라서 검색과 필터에 필요한 사전형 메타데이터를 갖추되, 긴 학술 설명은 본문에서 다룬다.

구성 원칙:

```txt
프론트메터 = 색인, 검색, 필터, 관계망, 짧은 정의
본문       = 전통별 상세 해설, 원전 인용, 학술적 쟁점, 번역어 판단
```

특히 주요 개념은 다음 전승·문헌 계열에 따라 정의와 용례가 달라질 수 있다.

```txt
아가마/니까야 계열
아비달마 계열
반야부 계열
유가부/유식 계열
중관 계열
정토 계열
선 계열
```

v0.3.1의 필수 구분은 우선 다음 네 계열로 둔다.

```txt
agama      = 아가마/니까야 계열
abhidharma = 아비달마 계열
prajna     = 반야부 계열
yogacara   = 유가부/유식 계열
```

중관, 정토, 선 등은 필요할 때 확장한다.

권장 프론트메터:

```yaml
---
id: "bodhisatta-path"
type: "concept"
conceptType: "doctrine"
dictionaryType: "technical-term"

name:
  ko: "보살도"
  en: "Bodhisatta Path"
  pali: "bodhisatta-paṭipadā"
  sanskrit: "bodhisattva-mārga"
  chinese: "菩薩道"

aliases:
  - "보살의 길"
  - "보살행"
  - "Bodhisattva Path"

dictionary:
  headword: "보살도"
  shortDefinition: "깨달음을 향해 서원과 실천을 이어가는 보살의 길."
  plainDefinition: "자기만의 해탈에 머물지 않고, 깨달음과 이타적 실천을 함께 지향하는 길."
  technicalDefinition: "보살이 수기, 바라밀, 서원, 수행을 통해 완전한 깨달음으로 나아가는 전승적·교리적 구조."
  entryLevel: "intermediate"
  usageStatus: "standard"
  translationPolicy: "본문에서는 보살도라고 쓰고, 필요한 경우 원어 bodhisatta/bodhisattva를 병기한다."
  caution: "초기불교 문헌의 bodhisatta와 대승불교의 bodhisattva 개념을 동일하게 처리하지 않는다."

description: "깨달음을 향해 긴 시간 동안 서원과 실천을 이어가는 길을 가리키는 개념."
plainDescription: "자기만의 해탈에 머물지 않고, 깨달음과 이타적 실천을 함께 지향하는 길."
scholarlyDescription: "부처가 되기 이전의 보살이 수기, 바라밀, 서원, 수행을 통해 완전한 깨달음으로 나아가는 전승적·교리적 구조."

domain:
  - "수행론"
  - "불전 서사"
  - "대승 이전 보살 사상"

traditions:
  - "Theravāda"
  - "Mahāyāna"
  - "Buddha biography"

canonicalTerms:
  pali:
    - "bodhisatta"
  sanskrit:
    - "bodhisattva"
  chinese:
    - "菩薩"
    - "菩薩道"
  korean:
    - "보살"
    - "보살도"

termVariants:
  - term: "bodhisatta"
    language: "pali"
    script: "latin"
    normalized: "bodhisatta"
    note: "팔리 문헌에서 주로 사용되는 형태"
  - term: "bodhisattva"
    language: "sanskrit"
    script: "latin"
    normalized: "bodhisattva"
    note: "산스크리트 및 대승 문헌에서 주로 사용되는 형태"
  - term: "菩薩"
    language: "chinese"
    script: "han"
    normalized: "보살"
    note: "한역 불전의 일반 표기"

doctrinalProfiles:
  - id: "agama"
    label: "아가마/니까야"
    definition: "부처가 되기 이전의 존재 또는 미래 부처의 전생 서사를 가리키는 맥락에서 주로 이해한다."
    sourceScope:
      - "니까야"
      - "한역 아함"
    keySources:
      - title: "Buddhavaṃsa"
        note: "보살 전승의 주요 원천"
    confidence: "medium"
    note: "아가마/니까야 본문과 후대 전기 전승의 층위를 구분한다."
  - id: "abhidharma"
    label: "아비달마"
    definition: "보살을 수행 단계와 공덕 축적, 미래 부처의 조건이라는 분석적 범주에서 다룰 수 있다."
    sourceScope:
      - "아비달마 문헌"
    keySources: []
    confidence: "low"
    note: "문헌별 차이가 크므로 실제 원전 확인 후 보강한다."
  - id: "prajna"
    label: "반야부"
    definition: "보살은 공과 반야의 실천 주체로 이해되며, 보살행은 반야바라밀의 맥락에서 설명된다."
    sourceScope:
      - "반야부 경전"
    keySources:
      - title: "Prajñāpāramitā literature"
        note: "반야바라밀과 보살행의 주요 문헌군"
    confidence: "medium"
    note: "초기 전기 서사의 보살 개념과 구분해서 설명한다."
  - id: "yogacara"
    label: "유가부/유식"
    definition: "보살의 수행 단계, 지, 바라밀, 전식득지 등의 체계 안에서 설명된다."
    sourceScope:
      - "유가부 문헌"
      - "유식 논서"
    keySources:
      - title: "Yogācārabhūmi"
        note: "보살지와 수행 단계 논의의 주요 자료"
    confidence: "medium"
    note: "유가부와 유식 논서의 개념 체계를 분리해 보강할 수 있다."

relatedConcepts:
  - conceptId: "prediction"
    relation: "수기와 연결"
  - conceptId: "paramita"
    relation: "실천 항목"

relatedPersons:
  - id: "sumedha"
    relation: "보살도 서사의 대표 인물"
  - id: "dipankara-buddha"
    relation: "수기를 주는 부처"

relatedPlaces:
  - placeId: "amaravati"
    relation: "수메다 서사의 출발지"

appearsIn:
  - type: story
    title: "수메다, 길을 묻기 시작하다"
    path: "/story/buddha-story/part-1/01-sumedha-begins-to-ask/"
    role: "핵심 개념"

relatedText:
  - type: text
    title: "보살도와 수기 사상"
    path: "/text/buddha-story-deep-dive/bodhisatta-path-and-prediction/"

sourceTraditions:
  - title: "Buddhavaṃsa"
    role: "보살 전승의 주요 원천"
  - title: "Mahābuddhavaṃsa"
    role: "붓다 전기 서사의 주요 원천"

terminologyNotes:
  - "Pāli bodhisatta와 Sanskrit bodhisattva의 번역 차이를 구분한다."
  - "일반 독자용 설명에서는 전문용어를 남발하지 않고, 필요 시 원어를 보조 정보로 둔다."

scholarlyNotes:
  - "초기불교, 부파불교, 대승불교에서 보살 개념의 의미 범위가 달라질 수 있다."

editorialStatus:
  definitionReviewed: false
  sourceReviewed: false
  needsScholarReview: true
  lastReviewedAt: null

tags:
  - "개념/보살도"
  - "주제/수행"
  - "주제/수기"
  - "문헌/붓다왐사"
  - "계열/아가마"
  - "계열/반야부"
  - "계열/유가부"

published: true
---
```

### 12.1 개념 Entity 프론트메터 구성도

개념 Entity의 프론트메터는 다음 블록으로 나눈다.

```txt
기본 식별
- id
- type
- conceptType
- dictionaryType
- published

표제어
- name
- aliases
- canonicalTerms
- termVariants

사전형 정의
- dictionary.headword
- dictionary.shortDefinition
- dictionary.plainDefinition
- dictionary.technicalDefinition
- dictionary.entryLevel
- dictionary.usageStatus
- dictionary.translationPolicy
- dictionary.caution

분류
- domain
- traditions
- tags

전통별 정의
- doctrinalProfiles[].id
- doctrinalProfiles[].label
- doctrinalProfiles[].definition
- doctrinalProfiles[].sourceScope
- doctrinalProfiles[].keySources
- doctrinalProfiles[].confidence
- doctrinalProfiles[].note

관계
- relatedConcepts
- relatedPersons
- relatedPlaces
- appearsIn
- relatedText
- design

검토 상태
- editorialStatus.definitionReviewed
- editorialStatus.sourceReviewed
- editorialStatus.needsScholarReview
- editorialStatus.lastReviewedAt
```

### 12.2 전통별 정의 설계

전통별 정의는 모든 개념에 억지로 채우지 않는다. 해당 개념이 특정 계열에서 의미 차이를 갖는 경우에만 작성한다.

기본 단위:

```yaml
doctrinalProfiles:
  - id: "agama"
    label: "아가마/니까야"
    definition: "해당 계열에서의 짧은 정의"
    sourceScope:
      - "참조 문헌군"
    keySources:
      - title: "문헌명"
        section: "가능하면 장·품·권"
        note: "출처 성격"
    confidence: "medium"
    note: "해석상 주의사항"
```

권장 `id` 값:

```txt
agama       아가마/니까야 계열
abhidharma  아비달마 계열
prajna      반야부 계열
yogacara    유가부/유식 계열
madhyamaka  중관 계열
pureland    정토 계열
chan        선 계열
modern      현대 학술 해석
```

권장 `confidence` 값:

```txt
high     원전 위치와 해석 근거가 분명함
medium   문헌군 근거는 있으나 세부 보강 필요
low      임시 정리이며 후속 검토 필요
unknown  아직 검토하지 않음
```

### 12.3 본문 구성도

프론트메터가 색인과 요약을 담당한다면, 본문은 독자가 실제로 읽는 해설을 담당한다.

본문 권장 구조:

```md
# 보살도

## 쉬운 설명

## 전문 설명

## 이름과 원어

## 교리적 위치

## 사전적 정의

## 번역어와 용례

## 아가마/니까야 계열의 정의

## 아비달마 계열의 정의

## 반야부 계열의 정의

## 유가부/유식 계열의 정의

## 다른 전통의 확장 의미

## 문헌 근거와 출처

## 관련 인물

## 관련 장소

## 관련 STORY

## 관련 TEXT

## 용어 사용 주의사항

## 원전과 전승상 주의점
```

개념 Entity 작성 원칙:

```txt
쉬운 설명과 전문 설명을 분리한다.
원어 표기는 프론트메터에 구조화한다.
불교용어 사전에 필요한 표제어, 동의어, 원어, 한역어, 번역 방침을 기록한다.
아가마, 아비달마, 반야부, 유가부 계열의 정의 차이를 필요할 때 분리한다.
전통별 정의는 짧은 요약을 프론트메터에 두고, 긴 설명은 본문에 둔다.
출처는 문헌군 수준과 구체 문헌 수준을 구분한다.
학술 검토가 필요한 항목은 editorialStatus에 표시한다.
TEXT 문서와 강하게 연결한다.
전통별 의미 차이가 있으면 반드시 기록한다.
번역어 선택 사유와 주의사항을 남긴다.
개념 Entity는 태그를 대체하지 않고, 태그보다 깊은 지식 객체로 사용한다.
```

---

## 13. STORY 문서와 NET의 연결

STORY 문서는 NET에 직접 종속되지 않는다. 다만 STORY 문서의 프론트메터에 Entity 연결 정보를 둔다.

권장 필드:

```yaml
entities:
  - "buddha"
  - "ananda"
  - "sravasti"
  - "jetavana"
  - "dhamma-teaching"
  - "renunciation"

tags:
  - "인물/붓다"
  - "인물/아난다"
  - "장소/사위성"
  - "장소/기원정사"
  - "개념/설법"
  - "왕국/코살라"
```

구분 원칙:

```txt
entities        = 내부 연결용 Entity id
tags            = 검색·필터·사용자 탐색용
```

---

## 14. TEXT·DESIGN과 NET의 연결

### 14.1 TEXT 연결

TEXT 문서는 Entity에 대한 심화 해설을 담당한다. 특히 개념 Entity는 TEXT와 강하게 연결한다.

예:

```txt
수메다는 누구인가
보살도와 수기 사상
기원정사의 의미
초전법륜의 의미
연기란 무엇인가
무아와 오온
중도와 수행론
```

Entity 문서에서는 다음처럼 연결한다.

```yaml
relatedText:
  - type: text
    title: "보살도와 수기 사상"
    path: "/text/buddha-story-deep-dive/bodhisatta-path-and-prediction/"
```

### 14.2 DESIGN 연결

DESIGN은 Entity의 시각 자산을 담당한다.

인물 Entity:

```yaml
design:
  styleSheet: "/design/buddha-story-person-sumedha-style/"
  imageAsset: "sumedha-profile/profile.webp"
```

장소 Entity:

```yaml
design:
  mapIllustration: "/design/buddha-story-place-sravasti-map/"
  sceneStyle: "/design/buddha-story-scene-jetavana-style/"
```

개념 Entity:

```yaml
design:
  conceptDiagram: "/design/concept-bodhisatta-path-diagram/"
  infographic: "/design/bodhisatta-path-infographic/"
```

DESIGN 자료가 없을 경우 경로를 비워두어도 된다. 중요한 것은 NET이 향후 DESIGN과 연결될 수 있는 자리를 미리 확보하는 것이다.

---

## 15. 태그 체계

권장 태그 범주:

```txt
인물/
장소/
개념/
왕국/
경전/
시기/
유형/
수행상태/
역할/
전통/
분야/
```

예시:

```yaml
tags:
  - "인물/붓다"
  - "장소/사위성"
  - "개념/보살도"
  - "왕국/코살라"
  - "경전/니까야"
  - "전통/테라와다"
  - "분야/수행론"
```

태그의 역할:

```txt
사용자 필터
검색 인덱스
관련 문서 추천
향후 관계망 기초 데이터
```

다만 태그는 원본 데이터 전체를 대신하지 않는다.

```txt
정확한 내부 연결 = id 기반 필드
사용자 탐색과 필터 = tags
```

---

## 16. 디자인 원칙

NET UI는 OL HOME의 기존 디자인 체계와 일치해야 한다.

기본 방향:

```txt
shadcn UI 계열
무채색 중심
정확한 1px 보더
충분한 여백
카드형 목록
과도한 색상 사용 자제
지도는 기본 화면에서 제외
관계망 그래프도 절제된 정보 시각화로 제공
```

추천 히어로 문구:

```txt
NET

불교 지식이 서로 이어지는 연결망.

인물, 장소, 개념, 이야기, 문헌을 하나의 흐름 안에서 탐색합니다.
```

---

## 17. 모바일 대응

모바일에서는 3열 구조를 그대로 유지하지 않는다.

모바일 기본 구조:

```txt
상단: 검색폼
접힘 패널: 필터
본문: Entity 카드 목록
하단 시트 또는 모달: 상세 패널
```

모바일 동작:

```txt
검색 또는 필터 선택
→ 결과 카드 목록 표시
→ 카드 클릭
→ 상세 바텀시트 열림
→ 관련 STORY / TEXT / DESIGN 확인
→ 상세 페이지 이동 가능
```

지도는 장소 Entity에서 지도보기 버튼을 눌렀을 때만 보조 탭으로 제공한다.

---

## 18. 제작 우선순위

NET v0.3.1의 제작 순서는 다음을 권장한다.

```txt
1. 공개 메뉴명 NET 확정
2. /net 라우트 생성
3. 기존 /entity 라우트 유지 원칙 확정
4. entities/persons 스키마 확장
5. entities/places 스키마 확장
6. entities/concepts 스키마 추가
7. 핵심 인물 Entity 작성
8. 핵심 장소 Entity 작성
9. 핵심 개념 Entity 작성
10. Entity 검색 인덱스 생성
11. 유형 필터 UI 제작
12. 태그 필터 UI 제작
13. Entity 카드 목록 UI 제작
14. 검색결과 화면 제작
15. 우측 상세 패널 제작
16. 관련 STORY / TEXT / DESIGN 출력 테스트
17. ENTITY 개별 문서 이동 링크 확인
18. 장소 Entity 지도보기 버튼과 임시 지도 안내문 구현
19. 관계망 그래프 1차 설계
20. 모바일 레이아웃 조정
```

초기 핵심 개념 후보:

```txt
보살도
수기
연기
무아
중도
사성제
팔정도
열반
업
윤회
삼매
반야
```

---

## 19. 향후 확장 계획

### v0.4

```txt
Entity 노드 관계망 그래프 구현
선택 Entity 주변 1차 관계 표시
인물·장소·개념·문서 노드 구분
관련 STORY 자동 추출 강화
```

### v0.5

```txt
관계 렌즈 도입
가족 렌즈
스승·제자 렌즈
왕실 렌즈
전생 인연 렌즈
개념 관계 렌즈
```

### v0.6

```txt
수작업 SVG 지도 산출물 연결
장소 Entity 지도 탭 구현
SVG marker id와 placeId 연결
장소 선택 시 지도 강조
```

### v0.6 이후

```txt
storyEvents 재검토
타임라인 탭 추가
붓다의 행로 시각화
원전별 관계 비교
전생-현생 레이어
문헌 Entity 확장
이미지 Entity 확장
```

---

## 20. NET v0.3.1의 핵심 원칙

```txt
1. 공개 메뉴명은 NET으로 한다.
2. ENTITY는 기존 개별 문서와 내부 데이터 구조로 유지한다.
3. NET은 ENTITY 문서를 검색·필터·상세 탐색하는 별도 메뉴다.
4. v0.3.1의 Entity 종류는 인물, 장소, 개념이다.
5. 개념 Entity는 불교전문용어와 주요 불교 개념을 다루는 학술적 지식 객체다.
6. 개념 Entity는 쉬운 설명과 전문 설명을 모두 가진다.
7. 개념 Entity는 TEXT 문서와 강하게 연결한다.
8. 고대 인도 SVG 지도 제작은 사용자가 수작업으로 진행한다.
9. 지도는 기본 상세 패널에서 제외한다.
10. 지도는 장소 Entity의 지도보기 버튼을 통해 보조 탭으로 제공한다.
11. 현재 지도 탭은 임시 안내문으로 대체한다.
12. 우측 상세 패널 하단에는 관련 STORY, TEXT, DESIGN을 출력한다.
13. 관계망 그래프는 지도보다 먼저 구현할 수 있는 핵심 확장 기능이다.
14. 검색 결과와 상세 패널에서 `/entity/...` 개별 문서로 이동할 수 있게 한다.
15. 태그는 검색과 필터를 위한 사용자 탐색 장치로 사용한다.
16. id 기반 필드는 내부 연결의 기준으로 사용한다.
17. 데이터 입력 부담을 줄이되, 개념 Entity의 용어·전통·문헌 메타데이터는 충분히 설계한다.
18. OL HOME의 단순하고 조용한 디자인 원칙을 따른다.
```

최종적으로 NET은 다음과 같은 성격을 갖는다.

```txt
불교 지식의 연결망
인물·장소·개념의 원본 데이터 탐색기
STORY·TEXT·DESIGN을 이어주는 허브
관계망 그래프와 지도 확장의 기반
```

NET은 OL 안의 여러 콘텐츠가 서로 고립되지 않고, 인물·장소·개념을 중심으로 다시 이어지도록 만드는 연결층이다.

---

## 수정 변경사항

### 2026-06-19

- 문서 버전을 v0.3.1로 업데이트했다.
- NET의 1차 목표를 지도 중심 메뉴에서 Entity Explorer로 재정의했다.
- `docs/net-explorer/net-explorer-reference.png`를 NET 검색 페이지의 전체 레이아웃 참고 자료로 추가했다.
- `docs/net-explorer/ol-atlas_v0.0.8.html`을 좌측 사이드바 prefix 태그 필터 UI 참고 자료로 추가했다.
- `docs/net-explorer/빛구슬연결망_v9.html`을 2차 관계망 그래프 구현 참고 자료로 추가했다.
- NET 진입 페이지의 히어로 섹션, Entity 전용 검색폼, 최신 Entity 카드 리스트 구성을 추가했다.
- prefix 태그 필터의 섹션 구조, 다중 선택, URL 상태 보존, OR/AND 조합 원칙을 추가했다.
- 고대 인도 SVG 지도 제작은 사용자 수작업 완료 후 연결하는 후속 기능으로 조정했다.
- Entity 종류를 인물, 장소, 개념으로 확장했다.
- 개념 Entity의 성격, 프론트메터, 본문 구조, 작성 원칙을 추가했다.
- 불교용어 사전형 메타데이터 구조를 개념 Entity 프론트메터에 추가했다.
- 아가마/니까야, 아비달마, 반야부, 유가부/유식 계열별 개념 정의와 출처를 관리하는 `doctrinalProfiles` 구조를 추가했다.
- 개념 Entity의 출처 검토와 학술 검토 상태를 관리하는 `editorialStatus` 구조를 추가했다.
- 우측 상세 패널에서 기본 지도 영역을 제거하고 Entity 상세, 관련 STORY, TEXT, DESIGN 중심 구조로 수정했다.
- 장소 Entity의 지도보기 버튼과 임시 지도 안내문 원칙을 추가했다.
- 관계망 그래프를 지도보다 먼저 구현할 수 있는 핵심 확장 기능으로 정리했다.
