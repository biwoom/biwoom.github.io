---

title: "NET 기획안 v0.2"
description: "OL HOME의 NET 메뉴와 ENTITY 문서를 연결하는 기획 문서입니다."
published: true

---

# NET 기획안 v0.2

문서 버전: v0.2
작성일: 2026-06-18
대상 프로젝트: OL HOME / OL STORY / OL TEXT / OL DESIGN / OL NET / OL ENTITY
기획 범위: NET 공개 메뉴, ENTITY 검색·필터·지도 연결, STORY·TEXT·DESIGN 연동 구조

---

## 0. v0.2 업데이트 핵심

v0.2는 NET과 ENTITY의 역할을 분리한다.

```txt
1. NET은 신설 공개 메뉴명으로 통일한다.
2. ENTITY는 현재 개별 문서와 내부 데이터 구조를 유지한다.
3. NET은 ENTITY 문서를 검색·필터·지도와 함께 보여주는 탐색 페이지다.
4. NET과 ENTITY는 서로 다른 메뉴 또는 기능으로 본다.
5. 검색 결과에서는 ENTITY 개별 문서(`/entity/...`)로 진입할 수 있다.
6. NET은 개별 Entity 상세 URL을 대체하지 않는다.
7. Entity 원본 데이터에서 memoryPhrase 필드는 사용하지 않는다.
8. 붓다스토리 관련 NET 연결은 `docs/toc/붓다스토리(Buddha Story) 목차 v0.1.md`의 파트명과 회차 구성을 우선 참고한다.
```

NET에서 STORY 연결을 표시할 때는 현재 공개 문서 경로를 기준으로 하되, 파트명과 회차 후보를 정할 때는 `docs/toc/붓다스토리(Buddha Story) 목차 v0.1.md`를 먼저 확인한다. 이 목차는 최종본이 아니므로, 실제 문서 제목과 URL은 `src/content/story/buddha-story`의 현재 파일명을 우선한다.

## 1. 기획의 핵심 방향

NET은 OL HOME에서 불교 지식 객체들을 검색·필터·지도와 함께 탐색하는 공개 메뉴다.

NET은 단순한 검색 페이지가 아니다.
NET은 OL 안에 흩어진 인물, 장소, 이야기, 문헌 해설, 시각 자료를 서로 연결하여 보여주는 **불교 지식 연결망**이다.

NET의 내부 원본 데이터는 `entities` 컬렉션이 담당한다.

```txt
NET    = 사용자에게 보이는 검색·필터·지도 탐색 메뉴
ENTITY = 인물·장소·개념 등 개별 지식 객체와 상세 문서
```

즉, 사용자는 `NET`이라는 메뉴를 통해 접근하지만, 개발 구조에서는 다음 원칙을 유지한다.

```txt
공개 탐색 메뉴 = NET
개별 상세 문서 = ENTITY
내부 데이터     = src/content/entities
초기 데이터     = persons / places
```

NET v0.2의 핵심 목적은 다음과 같다.

```txt
인물과 장소를 검색한다.
인물과 장소의 기본 정보를 확인한다.
해당 Entity가 연결된 STORY, TEXT, DESIGN 문서를 탐색한다.
장소 Entity를 통해 지도와 느슨하게 연결한다.
향후 관계망·렌즈·타임라인으로 확장할 수 있는 기반을 마련한다.
```

NET은 백과사전식 항목 나열이 아니다.
NET은 불교 지식을 “각각의 문서”가 아니라 “서로 이어지는 관계”로 경험하게 하는 탐색 공간이다.

---

## 2. 기본 개념 구분

### 2.1 NET

NET은 OL HOME 상단에 노출되는 공개 메뉴명이다.

역할:

```txt
불교 지식 객체 탐색
인물·장소 검색
태그 기반 필터링
지도 기반 장소 탐색
STORY·TEXT·DESIGN 연결
향후 관계망·렌즈·타임라인 확장
```

NET은 일반 독자에게 노출되는 탐색 메뉴 이름이다.
ENTITY는 개별 문서와 내부 데이터 구조로 유지한다.

### 2.2 ENTITY

ENTITY는 내부 데이터 구조이면서 개별 상세 문서다.

역할:

```txt
인물과 장소의 원본 정보 저장
검색과 필터의 기준 데이터 제공
STORY·TEXT·DESIGN 문서와의 연결 기준 제공
지도 표시를 위한 장소 정보 제공
향후 관계망의 노드 데이터 제공
```

v0.2에서는 Entity 종류를 두 가지로 한정한다.

```txt
persons = 인물
places  = 장소
```

v0.2에서는 다음 Entity 종류를 아직 만들지 않는다.

```txt
concepts
events
relations
texts
images
```

개념, 사건, 관계망, 문헌, 이미지 자산은 향후 확장 대상으로 둔다.

---

## 3. NET v0.2의 범위

### 3.1 포함하는 것

NET v0.2에서 구현 대상으로 삼는 것은 다음이다.

```txt
1. /net 진입 페이지
2. 좌측 태그 필터
3. 중앙 대형 검색폼
4. Entity 카드 목록
5. 검색 결과 화면
6. 인물 Entity 검색
7. 장소 Entity 검색
8. 선택 Entity 상세 미리보기
9. 선택 Entity 지도 탭
10. 관련 STORY 문서 리스트
11. 관련 TEXT 문서 리스트
12. 관련 DESIGN 경로 출력
13. 장소 Entity 기반 지도 마커 출력
```

### 3.2 제외하는 것

NET v0.2에서는 다음 기능을 제외한다.

```txt
storyEvents
관계망 그래프
관계 렌즈
전생-현생 레이어
원전별 관계 비교
타임라인
붓다 이동 경로
왕국 영역 색칠
개념 Entity
문헌 Entity
이미지 Entity
```

이 기능들은 NET의 장기 핵심 기능이 될 수 있지만, v0.2에서 모두 구현하면 데이터 구조와 UI가 과도하게 복잡해진다.

따라서 v0.2의 원칙은 다음과 같다.

```txt
작게 시작한다.
인물과 장소만 다룬다.
지도는 정밀 GIS가 아니라 참조 지도만 구현한다.
관계망은 데이터가 축적된 뒤 확장한다.
```

---

## 4. 전체 정보 구조

NET의 기본 정보 흐름은 다음과 같다.

```txt
STORY 문서
  ↓ primaryEntities / primaryPlaces / tags

ENTITY
  ├── persons
  └── places

NET 검색·필터 화면
  ↓

선택 Entity 상세 패널
  ├── 기본 정보
  ├── 지도
  ├── 관련 STORY
  ├── 관련 TEXT
  └── 관련 DESIGN
```

더 단순히 표현하면 다음과 같다.

```txt
STORY = 이야기
TEXT = 해설
DESIGN = 시각 자료
ENTITY = 원본 지식 객체와 개별 상세 문서
NET = ENTITY를 검색·필터·지도와 함께 탐색하는 화면
```

NET은 OL 콘텐츠 전체를 직접 생산하는 영역이 아니다.
NET은 이미 생산된 STORY, TEXT, DESIGN, ENTITY를 연결하고 탐색하게 하는 영역이다.

---

## 5. 권장 폴더 구조

NET v0.2를 위한 기본 폴더 구조는 다음과 같다.

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
    │   ├── dipankara-buddha.md
    │   ├── yasodhara.md
    │   └── rahula.md
    │
    └── places/
        ├── lumbini.md
        ├── kapilavatthu.md
        ├── bodhgaya.md
        ├── sarnath.md
        ├── rajagriha.md
        ├── sravasti.md
        ├── jetavana.md
        ├── vaisali.md
        └── kusinagara.md
```

공개 라우트는 다음을 권장한다.

```txt
/net/
NET 검색·필터·지도 탐색 페이지

/entity/
ENTITY 목록과 기존 개별 문서 진입점

/entity/persons/sumedha/
인물 ENTITY 상세 페이지

/entity/places/sravasti/
장소 ENTITY 상세 페이지
```

내부 데이터 경로는 `entities`를 유지한다. NET은 이 데이터를 읽어 탐색 화면을 만들고, 개별 상세는 기존 `/entity/...` 경로로 연결한다.

```txt
내부 경로: src/content/entities/persons/sumedha.md
개별 상세: /entity/persons/sumedha/
NET 선택 상태 예시: /net?selected=sumedha&type=person
```

---

## 6. NET 메인페이지 구조

NET 메인페이지는 기능이 과도하게 드러나는 화면이 아니라, 사용자가 자연스럽게 검색을 시작하는 진입 페이지다.

기본 레이아웃:

```txt
좌측: 태그 필터
중앙 상단: NET 소개와 대형 검색폼
중앙 하단: Entity 카드 목록
```

### 6.1 좌측 태그 필터

필터는 처음부터 너무 복잡하게 만들지 않는다.

v0.2 필터:

```txt
유형
- 인물
- 장소

시기
- 과거불 시대
- 고타마 부처님 생애
- 초기 승가 시대

왕국
- 코살라
- 마가다
- 샤카
- 밧지
- 말라

수행상태
- 보살
- 부처
- 아라한
- 범부

문헌
- 니까야
- 율장
- 붓다왐사
- 마하붓다왐사
- 니다나까타
- 한역 아함
```

필터 항목은 데이터가 충분히 쌓인 뒤 확장한다.

### 6.2 중앙 검색폼

검색폼은 NET 메인페이지의 중심 기능이다.

검색 대상:

```txt
인물 이름
인물 별칭
팔리어명
산스크리트명
한역명
영문명
장소 이름
장소 별칭
왕국명
관련 STORY 제목
관련 TEXT 제목
태그
```

검색 예시:

```txt
붓다
수메다
디빵까라
사위성
Sāvatthī
기원정사
코살라
초전법륜
라훌라
보살
```

### 6.3 Entity 카드 목록

메인페이지 하단에는 전체 또는 추천 Entity를 카드 형태로 보여준다.

카드 구성:

```txt
이름
유형
한 줄 설명
주요 태그
관련 STORY 수
관련 장소 또는 관련 인물
```

예시:

```txt
수메다
인물

사라지지 않는 길을 찾기 시작한 사람.

#인물/수메다 #개념/보살도 #장소/아마라와띠

관련 STORY 3
관련 TEXT 2
```

---

## 7. 검색결과 화면 구조

사용자가 검색하거나 태그 필터를 선택하면 NET 메인페이지의 중앙 영역은 검색결과 화면으로 전환된다.

권장 레이아웃:

```txt
좌측: 태그 필터

중앙 좌측:
- Entity 검색 결과 목록

중앙 우측:
- 상세 / 지도 탭
- 향후 관계 / 문헌 탭 확장 가능

우측 상세 내부:
- 기본 정보
- 관련 STORY
- 관련 TEXT
- 관련 DESIGN
```

구조 예시:

```txt
┌─────────────────────────────────────────────┐
│ NET                                         │
│ [검색어 입력..........................]       │
├──────────────┬──────────────┬───────────────┤
│ 태그 필터     │ 검색 결과 목록 │ 상세 / 지도 탭 │
│              │              │               │
│ 유형          │ Entity Card   │ [상세] [지도]  │
│ - 인물        │ Entity Card   │               │
│ - 장소        │ Entity Card   │ 선택 문서 정보 │
│              │              │ 관련 STORY     │
│ 시기          │              │ 관련 TEXT      │
│ 왕국          │              │ 관련 DESIGN    │
│ 수행상태      │              │               │
└──────────────┴──────────────┴───────────────┘
```

검색 결과는 URL 상태로 보존하는 것을 권장한다.

```txt
/net?q=사위성
/net?type=place&tag=왕국/코살라
/net?selected=sravasti&view=map
```

이렇게 하면 검색 결과를 공유하거나 새로고침해도 상태가 유지된다.

---

## 8. 우측 상세 패널

검색 결과에서 Entity를 선택하면 우측에 상세 패널이 열린다.

v0.2에서는 다음 두 탭만 둔다.

```txt
상세
지도
```

향후 확장 탭:

```txt
관계
문헌
타임라인
원전 비교
```

### 8.1 상세 탭

상세 탭은 전체 문서를 그대로 출력하는 곳이 아니다.
선택된 Entity의 핵심 정보를 요약해서 보여주는 미리보기 패널이다.

인물 상세 탭 구성:

```txt
이름
원어명
별칭
한 줄 기억 문장
요약 설명
주요 장소
수행상태
등장 STORY
관련 TEXT
관련 DESIGN
상세 페이지로 이동
```

장소 상세 탭 구성:

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
지도 보기
상세 페이지로 이동
```

### 8.2 지도 탭

지도 탭은 정밀 GIS가 아니다.
지도 탭은 Entity와 장소를 느슨하게 연결하는 참조 지도다.

지도 탭의 기본 원칙:

```txt
좌표는 인물 문서나 STORY 문서에 넣지 않는다.
좌표는 장소 Entity 문서에만 넣는다.
인물과 STORY는 장소 id만 참조한다.
지도는 장소 Entity를 통해 렌더링한다.
```

인물 선택 시:

```txt
인물의 primaryPlaces를 읽는다.
각 placeId에 해당하는 장소 Entity를 찾는다.
장소 Entity의 geo 정보를 지도에 표시한다.
```

장소 선택 시:

```txt
선택 장소의 마커를 강조한다.
같은 왕국의 장소를 보조 표시한다.
관련 인물과 관련 STORY를 함께 보여준다.
```

v0.2에서는 이동 경로선, 왕국 영역 색칠, 사건 순서 표시는 제외한다.

---

## 9. 지도 연결 원칙

NET의 지도 연결은 “정밀한 고대 인도 GIS 구축”이 아니다.

핵심은 다음이다.

```txt
문서
 ↓
장소 id
 ↓
장소 Entity
 ↓
좌표·왕국·별칭·신뢰도
 ↓
지도 표시
```

또는 태그 중심으로 표현하면 다음과 같다.

```txt
문서
 ↓
#장소/사위성
 ↓
places/sravasti.md
 ↓
geo.lat / geo.lng
 ↓
지도 마커
```

중요한 금지 원칙:

```txt
인물 문서에 lat/lng 직접 입력 금지
STORY 문서에 lat/lng 직접 입력 금지
같은 장소 정보를 여러 문서에 중복 입력 금지
```

권장 원칙:

```txt
장소 정보는 places Entity에 한 번만 기록한다.
인물과 STORY는 placeId만 참조한다.
지도는 places Entity를 기준으로 자동 생성한다.
좌표는 정확성보다 참조성을 목표로 한다.
좌표 신뢰도와 근거를 함께 기록한다.
```

---

## 10. Person Entity 구조

경로 예시:

```txt
src/content/entities/persons/sumedha.md
```

권장 프론트메터:

현재 구현된 Entity 스키마 기준 예시는 다음과 같다. `kind`, `entityType`, `summary`, `name.english`는 사용하지 않고, `type`, `description`, `name.en`을 사용한다.

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
  - "Sumedha the Brahmin"

description: "아마라와띠의 명문 브라만 가문에서 태어난 인물. 지식과 재산을 모두 갖추었으나 삶의 덧없음을 깊이 바라보고 출가의 길로 나아간다."
tradition: "Buddha biography"

primaryPlaces:
  - placeId: "amaravati"
    relation: "출신지"
  - placeId: "himalaya"
    relation: "출가 후 수행 지역"

spiritualStatus:
  pathStage: "보살도 시작"
  notes:
    - "미래 부처가 될 보살로 서사가 전개된다."

appearsIn:
  - type: story
    title: "수메다, 길을 묻기 시작하다"
    path: "/story/buddha-story/part-1/01-sumedha-begins-to-ask/"
    role: "주요 인물"
    storySlug: "buddha-story"
    documentSlug: "01-sumedha-begins-to-ask"
    partSlug: "part-1"
    chapter: 1
    order: 1

relatedText:
  - type: text
    title: "수메다는 누구인가"
    path: "/text/buddha-story-deep-dive/who-is-sumedha/"

design:
  styleSheet: "/design/buddha-story-person-sumedha-style/"
  characterSheet: "/design/buddha-story-person-sumedha-character-sheet/"
  profileImage: "/generated/design/buddha-story/assets/persons/sumedha/profile.webp"

sourceTraditions:
  - title: "Mahābuddhavaṃsa"
    section: "Chapter 3 - Sumedha the Brahmin"
    role: "주요 서사 원천"

tags:
  - "인물/수메다"
  - "장소/아마라와띠"
  - "주제/보살도"
  - "경전/마하붓다왐사"

published: true
---
```

본문 권장 구조:

```md
# 수메다

## 한 문장 기억

## 개요

## 이름과 별칭

## 출신과 거주지

## 간략 이력

## 수행상태

## 주요 장소

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
  - "Śrāvastī"
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
  markerLabel: "사위성"
  defaultZoomLevel: 6

relatedPersons:
  - id: "buddha"
    relation: "주요 체류"
  - id: "pasenadi"
    relation: "코살라 왕"

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
  - "시기/고타마_부처님_생애"

published: true
---
```

본문 권장 구조:

```md
# 사위성본문 권장 구조:

```md
# 사위성

## 개요

## 이름과 별칭

## 고대 지리와 현대 위치

## 소속 왕국

## 관련 인물

## 관련 STORY

## 관련 TEXT

## 지도 정보와 좌표 신뢰도

## 원전과 전승상 주의점
```

---

## 12. STORY 문서와 NET의 연결

STORY 문서는 NET에 직접 종속되지 않는다.
다만 STORY 문서의 프론트메터에 Entity 연결 정보를 둔다.

권장 필드:

```yaml
primaryEntities:
  - "buddha"
  - "ananda"

primaryPlaces:
  - "sravasti"
  - "jetavana"

tags:
  - "인물/붓다"
  - "인물/아난다"
  - "장소/사위성"
  - "장소/기원정사"
  - "왕국/코살라"
  - "주제/설법"
```

구분 원칙:

```txt
primaryEntities = 내부 연결용 인물 id
primaryPlaces   = 내부 연결용 장소 id
tags            = 검색·필터·사용자 탐색용
```

이렇게 하면 NET은 STORY 문서를 다음 방식으로 불러올 수 있다.

```txt
선택 Entity가 buddha인 경우
→ primaryEntities에 buddha가 포함된 STORY 표시

선택 Entity가 sravasti인 경우
→ primaryPlaces에 sravasti가 포함된 STORY 표시

선택 태그가 장소/사위성인 경우
→ 해당 태그를 가진 STORY와 Entity 표시
```

---

## 13. TEXT·DESIGN과 NET의 연결

NET은 STORY뿐 아니라 TEXT와 DESIGN도 연결한다.

### 13.1 TEXT 연결

TEXT 문서는 Entity에 대한 심화 해설을 담당한다.

예:

```txt
수메다는 누구인가
보살도와 수기 사상
기원정사의 의미
초전법륜의 의미
마가다 왕국과 초기불교
```

Entity 문서에서는 다음처럼 연결한다.

```yaml
relatedText:
  - type: text
    title: "수메다는 누구인가"
    path: "/text/buddha-story-deep-dive/who-is-sumedha/"
  - type: text
    title: "보살도와 수기 사상"
    path: "/text/buddha-story-deep-dive/bodhisatta-path-and-prediction/"
```

### 13.2 DESIGN 연결

DESIGN은 Entity의 시각 자산을 담당한다.

인물 Entity의 경우:

```yaml
design:
  styleSheet: "/design/buddha-story-person-sumedha-style/"
  characterSheet: "/design/buddha-story-person-sumedha-character-sheet/"
  profileImage: "/generated/design/buddha-story/assets/persons/sumedha/profile.webp"
```

장소 Entity의 경우:

```yaml
design:
  mapIllustration: "/design/buddha-story-place-sravasti-map/"
  sceneStyle: "/design/buddha-story-scene-jetavana-style/"
  imageAsset: "/generated/design/buddha-story/assets/places/sravasti.webp"
```

v0.2에서는 DESIGN 자료가 없을 경우 경로를 비워두어도 된다.
중요한 것은 NET이 향후 DESIGN과 연결될 수 있는 자리를 미리 확보하는 것이다.

---

## 14. 태그 체계

NET v0.2에서는 태그가 검색과 필터의 핵심이다.

권장 태그 범주:

```txt
인물/
장소/
왕국/
개념/
경전/
시기/
유형/
수행상태/
역할/
```

예시:

```yaml
tags:
  - "인물/붓다"
  - "장소/사위성"
  - "왕국/코살라"
  - "개념/보살도"
  - "경전/니까야"
  - "시기/고타마_부처님_생애"
  - "유형/도시"
  - "수행상태/부처"
```

태그의 역할:

```txt
사용자 필터
검색 인덱스
지도 필터
관련 문서 추천
향후 관계망 기초 데이터
```

다만 태그는 원본 데이터 전체를 대신하지 않는다.

```txt
정확한 내부 연결 = id 기반 필드
사용자 탐색과 필터 = tags
```

---

## 15. 지도 구현 원칙

NET v0.2의 지도는 다음 원칙을 따른다.

### 15.1 지도는 참조 지도다

지도는 고대 인도 지리를 학술적으로 확정하는 장치가 아니다.
고대 지명은 표기가 다양하고, 좌표 비정에 학설 차이가 있을 수 있다.

따라서 지도는 다음을 목표로 한다.

```txt
정밀성보다 참조성
확정성보다 탐색성
GIS보다 연결성
```

### 15.2 좌표 신뢰도 표시

장소 Entity에는 좌표 신뢰도를 둔다.

```yaml
geo:
  lat: 27.51
  lng: 82.05
  confidence: "medium"
  coordinateType: "approximate"
  note: "고대 지명의 현대 위치 비정은 학설에 따라 차이가 있을 수 있음."
```

권장 confidence 값:

```txt
high
medium
low
unknown
```

### 15.3 초기 지도 기능

v0.2 지도 기능:

```txt
장소 마커 출력
선택 장소 강조
인물의 주요 장소 마커 출력
장소 클릭 시 해당 장소 필터 적용
같은 왕국 장소 보조 표시
```

v0.2에서 제외:

```txt
왕국 영역 색칠
이동 경로선
시대별 슬라이더
사건 순서 표시
원전별 지도 비교
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
지도는 보조적 시각 요소로 절제
```

NET은 사용자를 오래 붙잡기 위한 자극적 인터페이스가 아니다.
NET은 사용자가 한 인물, 한 장소, 한 문헌을 따라 조용히 사유할 수 있도록 돕는 탐색 환경이어야 한다.

추천 히어로 문구:

```txt
NET

불교 지식이 서로 이어지는 연결망.

인물, 장소, 이야기, 문헌을 하나의 흐름 안에서 탐색합니다.
```

보조 문구:

```txt
하나의 이름에서 하나의 장소로,
하나의 장소에서 하나의 이야기로,
하나의 이야기에서 다시 깊은 해설로 이어집니다.
```

---

## 17. 모바일 대응

모바일에서는 3열 구조를 그대로 유지하지 않는다.

모바일 기본 구조:

```txt
상단: 검색폼
접힘 패널: 태그 필터
본문: Entity 카드 목록
하단 시트 또는 모달: 상세 / 지도
```

모바일 동작:

```txt
검색 또는 필터 선택
→ 결과 카드 목록 표시
→ 카드 클릭
→ 상세 바텀시트 열림
→ 상세 / 지도 탭 전환
→ 상세 페이지 이동 가능
```

모바일에서는 지도보다 목록과 상세 요약을 우선한다.
지도는 보조 탭으로 제공한다.

---

## 18. 제작 우선순위

NET v0.2의 제작 순서는 다음을 권장한다.

```txt
1. 공개 메뉴명 NET 확정
2. /net 라우트 생성
3. 기존 /entity 라우트 유지 원칙 확정
4. entities/persons 컬렉션 스키마 확장
5. entities/places 컬렉션 스키마 확장
6. 핵심 인물 Entity 5개 작성
   - 붓다
   - 수메다
   - 디빵까라 부처님
   - 아난다
   - 라훌라
7. 핵심 장소 Entity 10개 작성
   - 룸비니
   - 카필라밧투
   - 보드가야
   - 사르나트
   - 라자가하
   - 사위성
   - 기원정사
   - 바이살리
   - 쿠시나가라
   - 우루벨라
8. Entity 검색 인덱스 생성
9. 태그 필터 UI 제작
10. Entity 카드 목록 UI 제작
11. 검색결과 화면 제작
12. 우측 상세 / 지도 탭 제작
13. 장소 Entity 기반 지도 마커 출력
14. STORY 문서의 primaryEntities / primaryPlaces 연결 테스트
15. 관련 STORY / TEXT / DESIGN 출력 테스트
16. ENTITY 개별 문서 이동 링크 확인
17. 모바일 레이아웃 조정
```

---

## 19. 향후 확장 계획

### v0.3

```txt
장소 지도 기능 강화
왕국 필터 추가
같은 왕국 Entity 묶음 표시
Entity 상세 페이지 디자인 정리
관련 STORY 자동 추출 강화
```

### v0.4

```txt
관계 탭 추가
인물 간 1차 관계 표시
가족·스승·제자·후원자·대립자 관계 데이터 일부 추가
관계 카드 방식 구현
```

### v0.5

```txt
관계망 그래프 구현
관계 렌즈 도입
가족 렌즈
스승·제자 렌즈
왕실 렌즈
전생 인연 렌즈
```

### v0.5 이후

```txt
storyEvents 재검토
타임라인 탭 추가
붓다의 행로 시각화
원전별 관계 비교
전생-현생 레이어
개념 Entity 확장
문헌 Entity 확장
```

---

## 20. NET v0.2의 핵심 원칙

NET v0.2의 핵심 원칙은 다음과 같다.

```txt
1. 공개 메뉴명은 NET으로 한다.
2. ENTITY는 기존 개별 문서와 내부 데이터 구조로 유지한다.
3. NET은 ENTITY 문서를 검색·필터·지도와 함께 탐색하는 별도 메뉴다.
4. v0.2의 Entity 종류는 인물과 장소로 한정한다.
5. storyEvents는 v0.2에서 제외한다.
6. 관계망, 렌즈, 타임라인은 향후 확장한다.
7. NET 메인페이지는 검색 중심의 진입 페이지로 만든다.
8. 검색결과 화면은 필터, 목록, 상세/지도 탭으로 구성한다.
9. 관련 STORY, TEXT, DESIGN은 선택 Entity의 상세 패널 안에서 보여준다.
10. 검색 결과와 상세 패널에서 `/entity/...` 개별 문서로 이동할 수 있게 한다.
11. 지도는 정밀 GIS가 아니라 참조 지도다.
12. 좌표는 장소 Entity에만 둔다.
13. 인물과 STORY는 장소 id만 참조한다.
14. 태그는 검색과 필터를 위한 사용자 탐색 장치로 사용한다.
15. id 기반 필드는 내부 연결의 기준으로 사용한다.
16. 데이터 입력 부담을 최소화한다.
17. OL HOME의 단순하고 조용한 디자인 원칙을 따른다.
```

최종적으로 NET은 다음과 같은 성격을 갖는다.

```txt
불교 지식의 연결망
인물과 장소의 원본 데이터 탐색기
STORY·TEXT·DESIGN을 이어주는 허브
지도 기반 참조 탐색 도구
향후 관계망과 지식그래프의 기반
```

NET은 단순한 메뉴 하나가 아니다.
NET은 OL 안의 여러 콘텐츠가 서로 고립되지 않고, 인물과 장소를 중심으로 다시 이어지도록 만드는 연결층이다.

즉, NET은 OL의 지식이 “문서들의 모음”을 넘어 “서로 기대어 일어나는 지식의 그물”로 보이게 하는 공간이다.
