# OL HOME Obsidian 전환 점검

- 문서 버전: v0.2
- 점검일: 2026-10-30
- 대상: OL HOME, 기준 커밋 `f70b680`
- 배포 URL: https://biwoom.github.io/
- 범위: 첨부 전환 가이드와 현재 스키마·색인·로더·라우트·자산·렌더링·검증·운영 문서 대조. 애플리케이션 수정이나 추가 업로드는 수행하지 않았다.

## 수정 진행 결과 (2026-10-30)

사용자의 후속 구현·업로드 요청에 따라 A1~A7을 수정했다. 아래 본문은 발견 시점의 증거로 보존한다. 공통 공개 정책, 소개 canonical 주소, 안전한 목차 제거, 입력 검증/AST 제목, 이동 별칭, 문서별 권리 표시와 컬렉션 전체 감시를 적용했다.

추가 검증 항목은 회귀 fixture, 전체 라우트 충돌·썸네일 검사, pages catch-all, HTML 정적 종속 링크 검사, Asia/Seoul 날짜, registry 명시적 초기화/CI 커밋 검사로 반영했다. 미사용 helper·placeholder·TEXT 전용 스타일을 제거하고 남은 공통 스타일을 분리했다. 삭제 콘텐츠의 원본과 이관 inventory는 복원·덮어쓰지 않는다.

최종 로컬 검증은 콘텐츠 fixture 19개, 타입 검사(진단 0), 57페이지 빌드, HTML 59개(첨부 HTML 포함)/redirect 21개 링크 검사와 문서 26개 UI 계약 검사에 통과했다. 임시 개발 서버에서 소개 공개 전환, Markdown/PDF 갱신, 새 폴더·문서 추가, BLOG 권리 예외 표시를 HTTP로 확인했다. 실제 robots/RSS/sitemap의 루트 URL과 삭제 페이지·자산의 산출물 제외도 확인했다. 브라우저 시각·조작 및 실서비스 배포는 확인하지 않았다.

## 발견 당시 판정

폴더 기반 전환의 기본 구조는 구현되어 있다. 그러나 기존 콘텐츠가 빌드되는 것과 새 자료를 계속 작성·이동·비공개 처리할 수 있는 것은 별개다. 아래 재현 문제를 수정하고 작성 시나리오 검증을 보강한 뒤 전환 완료로 판단해야 한다.

첨부 가이드는 요구사항 비교 자료로 읽었다. 문서에 나열된 향후 작업을 이번 요청의 구현·배포 승인으로 해석하지 않았다.

## 현재 데이터 흐름

| 계층 | 구현 | 점검 결과 |
| --- | --- | --- |
| 작성 입력 | 선택적 YAML + Markdown + 폴더 | 제목·본문 중심 작성 가능. 입력 타입 검증은 별도 보강 필요 |
| 공통 해석 | `scripts/lib/content.mjs` | 숫자 정렬, TEXT 계층, 제목·요약·공개·권리 기본값 공유 |
| 영속 메타데이터 | `content-registry.json`, `prepare-content.mjs` | ID·URL·해시·날짜·이전 경로·문헌 주소 보존. 소개 URL와 수동 이동 보완 필요 |
| 정규화 스키마 | `src/content.config.ts` | text/story/blog/pages 및 합성 materials 컬렉션. 입력 스키마와는 구별해야 함 |
| 라이브러리 | `src/lib/library.ts` | 소개 없이 목록 생성, 자료 구분 독립 처리, 숫자 정렬 구현 |
| 화면 | LibraryIndex / LibrarySeries / StoryReader, BLOG 전용 화면 | TEXT/STORY 공통 reader와 첫 자료 이동·펼침 목록 유지 |
| 첨부·링크 | sync-content-assets / remark-content | 일반 자산과 상대 Markdown 링크 지원. 공개 제외와 소개 링크에 결함 |
| 검증 | check / typecheck / build / check:built | 현재 자료 전부 통과. 신규 작성·반복 이동·본문 변환 검증 부족 |

폐지된 DESIGN/NET/Entity/Ontology 활성 컬렉션 조회는 확인되지 않았다. 이전 주소의 리다이렉트와 BLOG의 역사 서술은 제거 누락으로 분류하지 않는다.

## 수정이 필요한 코드

### A1. P1 — 비공개 글의 첨부파일이 배포된다 (재현)

- 위치: `scripts/sync-content-assets.mjs:11`, `scripts/lib/content.mjs:37`.
- `blog/private/index.md`에 `published: false`를 넣고 `blog/private/assets/private.pdf`를 두면 PDF가 `public/generated/content/`에 복사된다. 글 자체의 비공개 상태는 첨부 복사에 반영되지 않는다.
- `_notes/private.pdf`도 복사된다. 문서 탐색의 `_` 제외 정책과 자산 탐색의 제외 정책이 다르기 때문이다. `_assets`는 의도적으로 허용하되 다른 비공개 경로와 구별해야 한다.
- 의미: 목록·검색에서 숨겨져도 생성 자산 URL로 접근할 수 있다. 현 보관함에 실제 민감 자료가 있다는 판정은 아니다.
- 수정: 자산의 공개 조건을 공통 해석 계층에 두고, 비공개 문서 전용 첨부와 공개 공유 첨부의 소유 범위를 명시한다. 복사 및 이전 산출물 정리까지 검증한다.

### A2. P1 — 새 문헌 소개 링크가 생성되지 않는 주소를 가리킨다 (재현 + 라우트 대조)

- 위치: `scripts/prepare-content.mjs:49`, `scripts/remark-content.mjs:25`, `src/pages/text/[...path].astro:8` 및 STORY 대응 라우트.
- 새 `text/C/W/index.md`에는 `/text/read/{파일해시}/`, 문헌에는 `/text/library/{폴더해시}/`가 서로 따로 배정된다.
- 라우트는 소개를 문헌 화면의 본문으로 렌더링하며 소개의 `record.url` 자체는 생성하지 않는다. 하위 글에서 `../index.md`를 링크하면 존재하지 않는 read 주소가 나온다. 현재 문헌에 소개 링크가 없으면 기존 빌드는 이를 놓친다.
- 수정: 문헌 소개의 canonical URL을 문헌 주소와 통일하고 기존 소개 주소의 호환 정책을 정한다. 소개가 나중에 추가되는 경우도 검증한다.

### A3. P1 — 목차 제거가 뒤의 실제 본문까지 삭제한다 (재현)

- 위치: `scripts/remark-content.mjs:48`.
- `# 문서 → ## 목차 → 링크 목록 → ### 본문 → 본문 내용` 입력에서 변환 후 최상위 노드가 빈 배열이 됐다. 목차와 같거나 높은 수준의 제목이 나올 때까지 모두 삭제하기 때문이다.
- 원본 Markdown은 남지만 사이트 본문이 사라진다. 모든 컬렉션에 같은 변환이 적용된다.
- 수정: 인식한 목차 링크 목록만 제거하거나 명시적 범위를 사용한다. 일반적인 제목 계층 작성만으로 본문이 없어지지 않게 한다.

### A4. P2 — 수동 이동 후 이전 별칭 체인이 끊긴다 (재현)

- 위치: `scripts/content-move.mjs:26`, `scripts/remark-content.mjs:24`.
- A→B 자동 이동 후 B→C를 내용 수정과 함께 수동 연결하면 aliases는 A→B, B→C가 된다. resolver는 한 단계만 조회하므로 A를 참조한 링크는 해석하지 못한다.
- 자동 이동은 과거 별칭도 갱신하지만 수동 명령에는 같은 처리가 없다.
- 수정: 두 이동 경로에서 동일한 별칭 갱신 함수를 사용하거나 순환 검출을 갖춘 최종 목적지 해석을 제공한다. 원본이 남아 있는 복사를 이동으로 잘못 연결하는 경우도 방지한다.

### A5. P2 — Markdown 변경으로 바뀐 공개 상태가 materials 감시에 반영되지 않는다 (코드상 누락, 실행 확인 필요)

- 위치: `src/content.config.ts:105`, `scripts/dev-content.mjs:18`.
- materials 갱신은 PDF·이미지·HTML 이벤트만 처리한다. 소개 Markdown의 `published`를 변경하는 이벤트는 해당하지 않는다.
- 개발 integration은 prepare·자산 동기화·브라우저 새로고침을 수행하지만 materials store 전체 갱신을 직접 수행하지 않는다. 다른 Markdown 자식의 정규화 데이터도 소개 변경에 따른 재계산이 필요하다.
- 수정: 폴더·소개·registry 변경을 공통 무효화 이벤트로 처리한다. 개발 서버 재시작 없이 문서·PDF·목록 공개 상태가 함께 바뀌는지 확인한다.
- 이번 점검에서는 지속 개발 서버 및 브라우저 상호작용을 실행하지 않았다. 빌드 시 공개 필터와 구별되는 후속 검증 항목이다.

### A6. P2 — 제목은 Markdown AST 대신 정규식으로 추출한다 (코드 확인)

- 위치: `scripts/lib/content.mjs:139`, `scripts/remark-content.mjs:65`.
- 코드 블록 내부의 `# 예시`도 첫 H1 후보가 된다. 제목 추출은 정규식이고 본문 H1 제거는 AST이므로 서로 다른 제목을 선택할 수 있다.
- `title`이 숫자 등 문자열이 아니면 `.trim()` 호출에서 예외가 나며, description·권리 필드 타입은 콘텐츠 검사보다 Astro 검사에서 뒤늦게 드러날 수 있다.
- 수정: 제목·요약과 본문 변환에 같은 Markdown 해석을 사용한다. 선택적 원본 입력 스키마와 정규화 출력 스키마를 구별해 공통으로 검증한다. 허용하지 않는 `excerpt`를 normalize가 읽는 잔여 호환 처리도 정리한다.

### A7. P2 — BLOG/영구 문서는 권리 예외를 화면에 전달하지 않는다 (코드 확인)

- 위치: `src/pages/blog/[...slug].astro`, `src/pages/pages/[slug].astro`, `src/components/layout/OLFooter.astro`.
- 정규화 데이터에는 license·rightsHolder·licenseUrl·copyrightNotice가 있지만 BLOG와 pages 화면에는 개별 표시가 없고 전역 CC0 링크만 보인다. StoryReader에는 개별 권리 표시가 있다.
- 수정: 문서별 예외를 보여주는 공통 표시를 적용한다. 보존된 데이터와 방문자가 확인할 수 있는 권리 정보를 함께 검증한다. 이번 점검에서 기존 BLOG 권리 예외의 실제 누락 사례를 주장하는 것은 아니다.

## 검증·운영 보강

1. 위 A1~A4를 회귀 fixture로 추가한다. 현재 9개 fixture에는 자산 동기화, remark 본문 변환, 수동 이동 명령의 종합 검증이 없다.
2. 소개 추가·소개 비공개 전환·반복 폴더 이동·동일 내용 문서·이동+편집을 별도 작성 시나리오로 검증한다. 첫 페이지 생성과 라이브 반영은 별도 완료 조건으로 둔다.
3. `check-content`는 파일 URL/ID를 검사하지만 생성할 문헌 주소와 redirect까지 합친 전체 라우트 충돌표는 없다. 문헌 URL와 소개 URL의 관계도 검증해야 한다.
4. `thumbnailAsset`는 허용 입력이지만 본문 링크 순회에는 포함되지 않는다. 누락·비공개 대상·한글/공백 경로를 같은 resolver/validator로 확인한다.
5. `pages/[slug].astro`는 단일 경로다. 일반적인 새 pages 주소는 단일 해시여서 현재 문제는 없지만, 향후 중첩 URL을 허용하려면 catch-all 또는 입력 제한이 필요하다. STORY의 허용 깊이도 TEXT처럼 명확히 검증한다.
6. `check:built`는 `/generated/` HTML 내부 링크를 검사하지 않는다. 그대로 배포하는 HTML이 외부 CSS·JS·이미지에 의존하는 경우 별도 자산 종속 검사나 독립형 HTML 제한이 필요하다.
7. 날짜는 UTC의 `toISOString().slice(0,10)`이다. 최초 공개 준비일을 한국 날짜로 운영하려면 시간대를 명시한다. 필드가 실제 배포 완료일을 뜻하지 않는다는 현 설명은 유지한다.
8. registry가 없는 상태에서 빈 registry를 자동 생성한다. 이미 운영 중인 저장소에서는 실수 삭제가 URL/날짜 재발급으로 이어지지 않도록 초기 생성과 손상 복구 절차를 구별한다. CI에서 준비 후 registry 미커밋 변경을 검출하는 것도 필요하다.
9. `src/lib/content-structure.ts`, `src/components/story/OLStoryReader.astro`의 구현 예정 placeholder 등 미사용 코드를 정리한다. TEXT 전용 reader/layout 제거 후에도 전역 import된 TEXT CSS는 공통 사용 선택자와 함께 조사한 후 정리한다.

## .agents 및 관련 문서 점검

| 대상 | 필요한 수정 |
| --- | --- |
| `.agents/context/current-state.md` | 아직 미업로드라는 현재 상태를 정정. `f70b680`은 이번 점검 전 origin/main에 전송됨. 배포 성공은 확인하지 않았으므로 구별. 이번 감사의 알려진 결함 링크 추가 |
| `.agents/context/decisions.md` | 6월의 entities 필수·slash 태그 강제·DESIGN·이전 helper 지침을 역사/대체됨으로 명시. 최상단에 현행 우선순위와 폐지 항목을 정리. 로컬 구현/운영 배포 표현도 구별 |
| `.agents/references/obsidian-content-refactor-guide.md` | 9절의 미업로드 상태는 현재 현황과 분리. 11절을 구현 완료 목록과 미검증/결함 목록으로 구별. 목차 본문 보존·첨부 공개·소개 링크를 완료 기준에 포함 |
| `.agents/references/ol-home-content-management-manual.md` | 개별 글의 비공개와 첨부 공개 차이를 A1 수정과 함께 정리. `_assets` 예외, 폴더 깊이, 수동 이동 반복·컬렉션 간 이동 정책, 초안→공개 시 registry 커밋 절차 구체화 |
| `.agents/skills/ol-doc-maintenance/SKILL.md` | “Keep route slugs and filenames ASCII”가 작성자용 한글 파일명 허용과 충돌하지 않도록 코드/내부 문서 파일명에 한정 |
| `.agents/skills/ol-deploy-check/SKILL.md` | `site`의 실제 설정은 SITE_URL import임을 반영. typecheck/check:built와 비공개 자산 검사 포함. 로컬 검증·push·Actions/실서비스 확인 범위를 구별 |
| `.agents/skills/ol-content-authoring/SKILL.md` | check:built를 명시하고 이동 복구 전후 점검 절차 추가. A1 수정 전에는 published:false만으로 첨부까지 숨겨진다고 안내하지 않음 |
| `.agents/references/content-migration-inventory.json` | 원래 이관 당시의 증거로 보존. 뒤이은 TEXT→BLOG 네 문서 이동은 원본 target을 덮어쓰기보다 후속 이관표 또는 registry 별칭 연결로 추적 |
| `AGENTS.md`, README | 콘텐츠 스키마·링크·공개 규칙의 수정 결과와 동기화. 일반 첨부와 목록 자료 구별은 유지 |

작업 당시 사실을 기록한 work-log의 “업로드하지 않음”은 역사 기록이므로 일괄 치환하지 않는다. current-state의 현재 상태와 구별한다. 기존 개발 서버 승인 거부 기록도 과거 사실이며 이번 환경에서 반드시 같은 결과가 난다는 의미로 사용하지 않는다.

## 실행 결과

- `npm run check`: 통과, fixture 9개.
- `npm run typecheck`: 58개 파일, 오류·경고·힌트 0.
- `npm run build`: 통과, 119페이지, Pagefind 51페이지.
- `npm run check:built`: 119페이지·46 redirect 링크 확인, 34개 문서 및 BLOG 정적 UI 계약 통과.
- 임시 보관함에서 A1·A2·A3·A4 재현. 임시 파일은 제거했고 실제 집필 원본·Obsidian 개인 설정은 변경하지 않았다.
- 브라우저 조작·라이브 감시·실서비스·Actions는 확인하지 않았다.

권장 순서는 공개 자산 제외와 본문 보존 → 소개 URL와 이동 별칭 → 라이브 감시 → 입력 검증·권리 표시 → 문서 정합성과 잔여 코드 정리다.

## 수정 변경사항

### 2026-10-30 — v0.1

- 전환 구현의 데이터 흐름, 재현 결함, 검증 공백 및 운영 문서 수정 항목을 기록했다.
