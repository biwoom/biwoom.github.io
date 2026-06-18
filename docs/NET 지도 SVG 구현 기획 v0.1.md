# NET 지도 SVG 구현 기획 v0.1

문서 버전: v0.1  
작성일: 2026-06-18  
대상 프로젝트: OL HOME / OL NET / OL ENTITY / OL STORY / OL DESIGN  
기획 범위: NET 메뉴에서 사용할 고대 인도 참조 지도 SVG, 장소 Entity 연결, 검색·필터·지도 연동 전략  
문서 성격: NET 지도 구현을 위한 준비 자료와 개발 로드맵

---

## 1. 핵심 방향

NET 지도는 정밀 GIS가 아니다.

NET 지도는 고대 인도 지명을 현대 좌표와 느슨하게 연결하여, 독자가 인물·장소·STORY·TEXT·DESIGN을 한 화면에서 탐색하도록 돕는 참조 지도다.

핵심 원칙은 다음과 같다.

```txt
정밀성보다 참조성
확정성보다 탐색성
지도 API보다 자체 SVG
문서 직접 좌표보다 장소 Entity
장소 Entity보다 먼저 UI를 복잡하게 만들지 않기
```

지도는 NET의 중심 기능 중 하나지만, NET의 목적은 지리 정보 제공 자체가 아니다.

NET의 목적은 다음 흐름을 만드는 것이다.

```txt
인물 선택
  ↓
관련 장소 확인
  ↓
지도 마커 표시
  ↓
관련 STORY·TEXT·DESIGN 탐색
  ↓
필요하면 ENTITY 상세 문서로 이동
```

---

## 2. 데이터 연결 구조

좌표는 STORY 문서나 인물 Entity에 직접 넣지 않는다.

좌표는 장소 Entity에만 둔다.

```txt
STORY 문서
  ↓ primaryPlaces / tags
Person Entity
  ↓ primaryPlaces
Place Entity
  ↓ geo.lat / geo.lng / kingdom / confidence
NET SVG 지도
  ↓ marker render
```

권장 연결 필드:

```yaml
primaryPlaces:
  - "sravasti"
  - "jetavana"
```

장소 Entity 예시:

```yaml
---
id: "sravasti"
type: "place"
name:
  ko: "사위성"
  pali: "Sāvatthī"
  sanskrit: "Śrāvastī"
  en: "Sravasti"
aliases:
  - "사밧티"
  - "Savatthi"
  - "Śrāvastī"
description: "코살라 왕국의 주요 도시. 부처님이 오래 머물며 많은 설법을 하신 장소로 전승된다."
location:
  country: "India"
  region: "Uttar Pradesh"
  lat: 27.51
  lng: 82.05
geo:
  confidence: "medium"
  coordinateType: "approximate"
  note: "고대 지명의 현대 위치 비정은 학설에 따라 차이가 있을 수 있음."
kingdom: "kosala"
tags:
  - "장소/사위성"
  - "왕국/코살라"
  - "유형/도시"
published: true
---
```

현재 `src/content.config.ts`에는 NET v0.1을 위한 최소 스키마가 반영되어 있다. Person Entity는 `primaryPlaces`를 사용할 수 있고, Place Entity는 `geo`, `kingdom`, `placeType`, `relatedPersons`, `relatedStories`, `relatedText`를 사용할 수 있다.

---

## 3. 준비해야 할 자료

### 3.1 지도 기본 자료

NET 지도 SVG를 만들기 위해 필요한 기본 자료:

```txt
고대 인도 북부의 단순화된 윤곽
갠지스강, 야무나강, 소나강 등 주요 강
히말라야 남쪽, 벵골만, 주요 평야의 대략적 지형 기준
기원전 6~4세기 전후 주요 왕국 위치
주요 도시와 성지의 현대 좌표 후보
```

왕국 영역은 v0.1에서 정밀하게 그리지 않는다.

v0.1에서는 다음 정도면 충분하다.

```txt
지도 배경
주요 강
주요 장소 마커
선택 장소 강조
같은 왕국 장소 보조 표시
```

### 3.2 초기 장소 목록

v0.1에서 우선 준비할 장소:

```txt
lumbini          룸비니
kapilavatthu     카필라밧투
bodhgaya         보드가야
sarnath          사르나트
rajagriha        라자가하
sravasti         사위성
jetavana         기원정사
vaisali          바이살리
kusinagara       쿠시나가라
uruvela          우루벨라
```

확장 후보:

```txt
amaravati
patna / pataliputra
nalanda
vesali 주변 지역
gaya
kosambi
ujjaini
ayodhya
```

### 3.3 각 장소별 필수 자료

각 장소 Entity에 준비할 자료:

```txt
id
한국어명
팔리어명
산스크리트명
한역명
영문명
별칭
장소 유형
소속 왕국
현대 위치
위도
경도
좌표 신뢰도
좌표 근거 메모
관련 인물
관련 STORY
관련 TEXT
관련 DESIGN
```

좌표 신뢰도 값:

```txt
high
medium
low
unknown
```

### 3.4 참고 이미지의 활용 범위

`docs/ref/인도고대지도-NET메뉴-레퍼런스.png`는 그대로 구현할 대상이 아니다.

참고할 요소:

```txt
좌측 필터
중앙 카드 목록
우측 대형 지도
하단 또는 측면 상세 패널
장소 마커와 선택 장소 강조
선택 카드와 지도 마커의 동기화
```

그대로 따르지 않을 요소:

```txt
과도한 색상 면 분할
복잡한 지도 컨트롤
정밀 GIS처럼 보이는 표현
카드 CRUD 앱 같은 조작 UI
```

OL HOME에서는 더 조용하고 문헌 중심적인 인터페이스로 조정한다.

---

## 4. SVG 지도 제작 전략

### 4.1 SVG를 선택하는 이유

```txt
외부 지도 API가 필요 없다.
GitHub Pages 정적 배포와 잘 맞는다.
고대 지도를 현대 지도 API에 억지로 맞추지 않아도 된다.
왕국 영역, 장소 마커, 경로선을 직접 제어할 수 있다.
오프라인 단일 자산으로 관리하기 쉽다.
```

### 4.2 지도 좌표 변환 방식

장소 Entity에는 실제 위도·경도를 둔다.

SVG 위에 표시할 때는 간단한 투영 함수를 사용한다.

```txt
lat/lng
  ↓
map bounds
  ↓
svg x/y
```

초기 방식:

```js
function projectPlace(lat, lng) {
  const x = ((lng - minLng) / (maxLng - minLng)) * width;
  const y = ((maxLat - lat) / (maxLat - minLat)) * height;
  return { x, y };
}
```

v0.1에서는 이 정도의 선형 변환으로 충분하다.

주의:

```txt
이 지도는 항해용 지도가 아니다.
거리와 면적을 정확히 보장하지 않는다.
마커 간 상대 위치를 이해하는 참조 지도다.
```

### 4.3 SVG 구성 레이어

권장 SVG 레이어:

```txt
base-land        배경 육지
base-water       강과 바다
kingdom-hints    왕국 영역 힌트
place-markers    장소 마커
selected-marker  선택 장소 강조
route-hints      후속 버전의 경로선
labels           장소명·왕국명
```

v0.1 필수:

```txt
base-land
base-water
place-markers
selected-marker
labels
```

v0.1 제외:

```txt
정밀 왕국 경계
왕국 전체 색칠
붓다 이동 경로
사건 순서 타임라인
원전별 지도 비교
```

---

## 5. NET 지도 UI 개발 과정

### 5.1 1단계: 데이터 스키마 확장

현재 반영된 최소 스키마:

```txt
Place Entity:
- geo confidence
- coordinateType
- coordinate note
- kingdom
- placeType
- relatedPersons
- relatedStories
- relatedText

Story:
- primaryPlaces

Person Entity:
- primaryPlaces
- appearsIn
- relatedText
- design
- sourceTraditions
```

기존 `location.lat`, `location.lng`는 유지할 수 있다. 지도 렌더링에는 `geo`를 우선 사용하고, 구형 장소 문서와의 호환이 필요할 때만 `location.lat`, `location.lng`를 보조로 읽는다.

### 5.2 2단계: 장소 Entity 10개 작성

초기 지도 구현 전에 최소 장소 10개가 필요하다.

이 데이터가 없으면 지도 UI부터 만들어도 실제 테스트가 어렵다.

### 5.3 3단계: `/net` 라우트 생성

초기 `/net` 페이지 구성:

```txt
검색 입력
유형 필터
태그 필터
Entity 카드 목록
선택 Entity 상세 패널
지도 탭
```

데스크탑:

```txt
좌측 필터
중앙 검색 결과
우측 상세 / 지도
```

모바일:

```txt
상단 검색
접힘 필터
카드 목록
하단 시트 상세 / 지도
```

### 5.4 4단계: SVG 지도 컴포넌트

`OLNetMap.astro` 또는 유사 컴포넌트를 만든다.

입력 데이터:

```txt
places
selectedPlaceId
relatedPlaceIds
```

출력:

```txt
SVG 지도
마커
선택 마커
장소 라벨
```

클라이언트 인터랙션:

```txt
마커 클릭 → URL query 갱신
카드 클릭 → 선택 장소 또는 Entity 갱신
필터 변경 → 카드 목록과 지도 마커 동시 갱신
```

### 5.5 5단계: 검색·필터와 지도 동기화

상태는 URL query에 보존한다.

예:

```txt
/net?q=사위성
/net?type=place&selected=sravasti&view=map
/net?type=person&selected=siddhartha-gautama
```

이렇게 하면 검색 결과를 공유하거나 새로고침해도 상태가 유지된다.

---

## 6. 주요 전략

### 6.1 지도보다 Place Entity가 먼저다

지도 UI보다 중요한 것은 장소 Entity 데이터다.

장소 Entity가 부실하면 지도는 장식이 된다.

우선순위:

```txt
장소 id 정리
별칭 정리
좌표 후보 정리
좌표 신뢰도 정리
관련 STORY 연결
그 다음 지도 출력
```

### 6.2 왕국 영역은 늦게 그린다

왕국 영역은 매력적인 시각 요소지만, 학술적으로 불확실하고 제작 부담이 크다.

v0.1에서는 왕국을 다음 정도로만 사용한다.

```txt
장소 Entity의 kingdom 필드
필터 옵션
같은 왕국 장소 보조 표시
마커 색상 또는 작은 라벨
```

영역 색칠은 후속 버전에서 처리한다.

### 6.3 경로선은 데이터가 쌓인 뒤 만든다

붓다 이동 경로는 사건 순서와 전승 선택이 필요하다.

v0.1에서 경로선을 만들면 원전별 차이를 너무 빨리 고정할 위험이 있다.

우선은 다음만 한다.

```txt
장소 마커
선택 장소 강조
관련 장소 묶음
```

### 6.4 지도는 필터 UI다

지도는 단순 이미지가 아니라 필터 UI다.

동작 원칙:

```txt
장소 마커 클릭 → 해당 장소 Entity 선택
장소 마커 클릭 → 관련 STORY/TEXT/DESIGN 표시
왕국 필터 선택 → 해당 왕국 장소만 강조
인물 선택 → 해당 인물의 주요 장소 표시
```

---

## 7. 주의사항

### 7.1 고대 지명은 확정하지 않는다

고대 지명은 표기와 위치 비정이 다를 수 있다.

따라서 다음 표현을 피한다.

```txt
정확한 위치
확정된 위치
실제 경계
고증 완료
```

권장 표현:

```txt
전승상 위치
현대 비정 위치
참조 좌표
대략적 위치
좌표 신뢰도 medium
```

### 7.2 좌표 중복 입력 금지

다음은 금지한다.

```txt
STORY 문서에 lat/lng 입력
Person Entity에 lat/lng 입력
같은 장소 좌표를 여러 문서에 복사
```

좌표는 Place Entity에만 둔다.

### 7.3 지도 이미지와 DESIGN 자산 구분

NET 지도 SVG는 UI 컴포넌트다.

지도 자체가 독립적인 인포그래픽이나 배포용 이미지가 되면 DESIGN 콘텐츠로도 등록할 수 있다.

정리:

```txt
NET 지도 UI = src/components 또는 src/pages/net 내부 구현
배포용 고대 인도 지도 인포그래픽 = DESIGN 콘텐츠
지도 제작 기준과 스타일시트 = DESIGN 문서
```

### 7.4 모바일에서는 지도를 우선하지 않는다

모바일에서는 검색과 카드 목록이 우선이다.

지도는 상세 패널의 탭 또는 접힘 영역으로 둔다.

이유:

```txt
모바일 화면에서 지도는 공간을 많이 차지한다.
지도보다 선택 Entity의 설명과 관련 문서가 중요하다.
작은 화면에서 정밀한 지도 조작은 피로도가 높다.
```

---

## 8. v0.1 완료 기준

NET 지도 SVG v0.1이 완료되었다고 볼 수 있는 기준:

```txt
1. Place Entity 10개 이상이 등록되어 있다.
2. 각 Place Entity에 lat/lng와 confidence가 있다.
3. /net 페이지에서 장소 Entity가 검색된다.
4. 지도에 장소 마커가 표시된다.
5. 장소 마커 클릭 시 해당 장소가 선택된다.
6. 선택 장소의 기본 정보와 관련 STORY가 표시된다.
7. 인물 Entity 선택 시 primaryPlaces가 지도에 표시된다.
8. 모바일에서 지도는 상세 탭으로 접근 가능하다.
9. 지도는 외부 API 없이 GitHub Pages에서 동작한다.
10. 좌표 불확실성 안내 문구가 표시된다.
```

---

## 9. 후속 확장

v0.2:

```txt
왕국 필터
같은 왕국 장소 묶음
장소별 관련 인물 목록
지도 라벨 겹침 조정
```

v0.3:

```txt
왕국 영역 힌트 색상
장소 상세 페이지 지도 내장
관련 STORY 자동 추출 강화
```

v0.4:

```txt
붓다 이동 경로 후보
사건 순서 표시
TEXT 톺아보기와 지도 연결
```

v0.5 이후:

```txt
원전별 지도 레이어
전생·현생 관계 레이어
관계망 그래프와 지도 연동
```

---

## 10. 한 줄 결론

NET 지도 SVG의 핵심은 지도를 잘 그리는 것이 아니라, 장소 Entity를 기준으로 STORY·TEXT·DESIGN·ENTITY를 안정적으로 연결하는 것이다.
