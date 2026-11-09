# Biwoom - 비움

문서 버전: v1.5 · 최종 업데이트: 2026-11-09 · 대상: Biwoom (OL 코어)

불교 문헌·이야기·작업 기록을 읽는 Astro 정적 사이트입니다.

- 사이트: https://biwoom.github.io/
- 저장소: `biwoom/biwoom.github.io`
- Node.js: 22.12 이상
- 배포: GitHub Actions → GitHub Pages 루트

공개 주소는 `site-config.mjs`의 `SITE_URL`로 관리하며 robots.txt의 사이트맵 주소도 함께 맞춥니다. Astro `base`는 설정하지 않습니다. 기본 GitHub Pages 도메인을 사용하므로 CNAME 파일과 사용자 도메인용 DNS 설정은 필요하지 않습니다. 기존 사용자 도메인이 연결되어 있으면 저장소 Settings → Pages → Custom domain에서 제거해야 합니다. [GitHub 공식 안내](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#removing-a-custom-domain)를 참고하세요.

## 폴더 구조

```text
content/                 # Obsidian 보관함·문서·원본 첨부
ol-core/
├── src/                 # Astro 페이지·컴포넌트·스타일·content.config.ts
├── scripts/             # 콘텐츠 처리·자산 동기화·검사
└── public/              # 고정 자산과 generated/ 파생 자산
astro.config.mjs         # 루트 Astro 설정
package.json             # 루트 개발·빌드 명령
site-config.mjs          # 브랜드·운영 URL·기본값
content-registry.json    # 문서 식별자·주소·날짜·이력
```

저장소 루트에서 기존 `npm run dev`, `npm run build` 명령을 그대로 사용합니다. 빌드 결과는 `dist/`에 생성됩니다. 경로 기준은 `ol-core/scripts/lib/paths.mjs`에서 관리합니다. 기존 Obsidian 보관함은 위치만 `content/`로 옮겼으므로 해당 폴더를 보관함으로 다시 열어 사용합니다. `.obsidian` 내용은 유지하며 Git에서는 제외합니다.

## 집필

Obsidian에서 `content/`를 보관함으로 엽니다. Vault CMS나 다른 CMS는 필요하지 않습니다.

```text
content/
├── text/001.중관부/001.대승현론/
│   ├── 01.번역/001.1권.md
│   └── 02.연구/001.대승현론 제1권 연구.md
├── story/001.불전문학/010.붓다 스토리/010.먼 과거의 서원/001.이야기.md
├── blog/작업 기록.md
├── pages/brand.md
└── media/001.인포그래픽/lamrim-preview1.jpg
```

제목과 본문만 작성해도 됩니다.

```markdown
# 대승현론 제1권

본문을 작성합니다.

## 소제목
```

첫 H1을 제목으로 사용하며, H1이 없으면 파일명에서 번호·확장자를 뺀 이름을 사용합니다. 기존 `title` 예외가 있으면 우선합니다. `001.md`처럼 번호만 있는 파일은 본문에 H1 제목을 작성하세요.

폴더·파일의 `001.` 같은 숫자는 정렬에 사용하고 화면에서는 숨깁니다. TEXT·STORY 첫 화면에는 카테고리가 3열 카드로 표시되며, 카드를 선택하면 해당 문헌·시리즈 목록으로 이동합니다. 두 메뉴 모두 최상위 폴더는 카테고리입니다. 빈 카테고리를 Git에 보관하려면 해당 폴더에 `.gitkeep`을 둡니다. 문헌 화면의 자료 구분 버튼은 첫 자료로 이동하며, 전체 자료는 펼침 목록으로 표시됩니다. 실제 탭 전환은 사용하지 않습니다. 번역과 연구는 독립적인 목록입니다. TEXT 문헌·문서 화면은 청회색 학술형 구성과 명조 본문, 데스크톱 3단 보조 패널 및 집중 모드를 제공하며, STORY와 각주·글자 크기·복사 동작을 공유합니다.

소개가 필요하면 문헌 또는 시리즈 폴더에 `index.md`를 추가합니다. 필수는 아닙니다. 대표 이미지·태그·설명도 필수가 아닙니다. 태그를 쓰려면 `tags: [수메다, 수밋따]`처럼 접두어 없이 작성합니다. TEXT·STORY·BLOG 개별 문서의 제목 아래에 해당 문서의 태그만 표시하며, 시리즈 태그는 상속하지 않습니다. BLOG 메뉴에서는 태그 버튼과 연도 필터를 함께 사용할 수 있습니다.

## 초안·첨부파일

- `_drafts/`와 `_templates/`, `.obsidian/`은 사이트에서 제외합니다.
- 공개용 메뉴 폴더의 문서는 기본 공개 대상입니다. 로컬 편집 내용은 업로드·배포 후 실제 사이트에 반영됩니다.
- 기존 `published: false`는 유지됩니다. 시리즈의 `index.md`가 비공개이면 하위 문서도 숨깁니다.
- 개별 자료로 보여줄 PDF·이미지·HTML은 자료 구분 폴더에 직접 둡니다.
- 여러 문서에서 쓰는 이미지는 `content/media/`에 보관합니다. 최상위 폴더가 미디어 카테고리가 됩니다. 현재 이미지는 `001.인포그래픽`(5개), `002.문양`(5개), `003.일러스트`(2개)에 분류되어 있습니다. 숫자는 정렬에만 쓰며, 루트에 직접 놓은 이미지는 미분류로 표시됩니다. `blog/기록.md`에서는 `![설명](../media/001.인포그래픽/lamrim-preview1.jpg)`처럼 일반 Markdown 상대 링크로 참조합니다. 상단 메뉴에는 표시하지 않으며 홈의 미디어 통계와 푸터에서 `/media/` 모음으로 이동할 수 있습니다. 카테고리 버튼으로 masonry 목록을 분류하고 이미지를 누르면 같은 페이지의 모달에서 원본을 확대합니다. 카테고리의 `index.md`에 `## [이미지 제목](파일명)`과 설명을 여러 항목으로 작성하면 각 이미지 모달에 표시됩니다. 세 카테고리의 index.md를 작성 예시로 참고할 수 있습니다. 자산별 상세 문서·검색 항목은 생성하지 않습니다.
- 문서 전용 보조 파일은 문서 옆 `assets/`에 두고 일반 Markdown 상대 링크로 연결합니다.
- YAML은 선택 사항입니다. 날짜·권리·설명 등의 예외에만 사용합니다. 위키링크·Obsidian 블록 임베드는 현재 지원하지 않으므로 일반 Markdown 링크를 사용하세요.

## 주소와 날짜

`content-registry.json`은 자동 관리되는 원본 색인입니다. 문서 URL·최초 공개 준비일·해시·문헌 주소·과거 경로 매핑을 보존하므로 콘텐츠와 함께 Git에 보관합니다. 빌드 산출물이 아닙니다. 기본 작성자·언어·권리는 `site-config.mjs`에서 관리하며 개별 권리 예외를 우선합니다.

일반적인 이동·개명은 내용 해시로 감지해 문서 주소를 유지합니다. **개발 서버를 끈 상태에서 이동과 본문 편집을 함께 수행하면** 자동 식별이 안 될 수 있습니다. 이 경우 준비·빌드 전에 다음 명령으로 기존 문서를 연결하세요.

```sh
npm run content:move -- "text/이전경로.md" "text/새경로.md"
```

같은 내용의 문서가 여러 개이면 자동 이동 감지는 모호할 수 있습니다. 파일명 접두어를 변경해도 내용이 유지되면 주소를 보존합니다. 문헌 폴더 전체 이동도 기존 색인이 있는 상태에서 처리하세요. BLOG의 기존 날짜는 보존되며, 새 공개 문서는 처음 준비할 때 날짜를 기록합니다. 정확한 과거 발행일이 필요하면 선택적으로 `date`를 지정합니다.

비공개 첨부는 비공개 `index.md`가 있는 전용 폴더 또는 `_drafts`에 둡니다. 공개 글도 참조하는 공유 첨부는 공개입니다. `_assets`를 제외한 `_` 경로는 배포하지 않습니다. 상세 공개 범위는 관리 매뉴얼을 따릅니다.

소개 문서의 주소는 문헌 주소와 같습니다. 최초 공개 준비일은 한국 날짜를 사용합니다. registry가 사라졌다면 Git에서 복원하세요. 신규 보관함만 `npm run prepare:content -- --init`으로 생성합니다. 콘텐츠 변경과 registry를 함께 커밋하고 `npm run check:registry`로 확인합니다.

## 개발·검증

```sh
npm ci
npm run dev
npm run check
npm run typecheck
npm run build
npm run check:built
```

- `ol-core/scripts/lib/content.mjs`: 이름·본문·경로의 공통 해석
- `ol-core/src/content.config.ts`: 정규화된 데이터 스키마와 로더
- `ol-core/scripts/prepare-content.mjs`: 고정 주소·날짜 색인 관리
- `ol-core/src/lib/library.ts`: 공통 계층과 자료 목록
- `ol-core/scripts/remark-content.mjs`: 제목 중복 방지·내부 링크 변환
- `ol-core/scripts/sync-content-assets.mjs`: 일반 첨부파일 동기화
- `ol-core/public/generated/content/`: 파생 자산. 직접 수정하거나 커밋하지 않음

DESIGN·NET·엔터티·온톨로지 전용 기능은 제거했습니다. 기존 시각자료와 설명은 일반 자료로 이관한 뒤 사용자 요청으로 일부 삭제되었습니다. 삭제 자료는 복원하지 않으며 현재 공개 목적지가 존재하는 과거 주소만 안내합니다. 이전 ATLAS HTML은 `.agents/archive/atlas/`에 보존하며 배포하지 않습니다.

자세한 집필 규칙은 `.agents/references/ol-home-content-management-manual.md`, 개편 기록은 `.agents/references/obsidian-content-refactor-guide.md`를 확인하세요.

## 브랜드 자산

Biwoom - 비움의 심볼은 `ol-core/public/brand/biwoom-mark-monochrome.png`(제공 원본 004)와 `biwoom-mark-gold.png`(006)입니다. `npm run brand:assets`로 파비콘·ICO·Apple 아이콘·공유 이미지를 재생성합니다. 브랜드 설정은 `site-config.mjs`에서 관리합니다. 기존 심볼의 모양은 유지하며 공유 이미지의 영문 표기는 Biwoom입니다. 영문명은 Biwoom, 한글명은 비움이며 함께 쓸 때는 `Biwoom - 비움`으로 표기합니다. OL은 내부 코어 이름입니다.

## 전자책

`content/ebook/카테고리/책이름/`에 표지 이미지와 EPUB 또는 PDF를 넣으면 `/ebook/` 라이브러리에 등록됩니다. 서지정보·소개는 선택적인 `index.md`에 작성합니다. 전자책은 CC0로 제공하며, 푸터 MEDIA 아래의 EBOOK에서 접근합니다. 책 선택 시 상세페이지 대신 다운로드 모달이 열립니다. 자세한 집필·비공개 규칙은 콘텐츠 관리 매뉴얼을 참고하세요.

## 수정 변경사항

### 2026-11-09 — v1.5

- 콘텐츠를 content/, 구현을 ol-core/로 분리했습니다. 루트 실행 명령·레지스트리·배포 URL은 유지하고 경로·보관함 안내를 갱신했습니다.

### 2026-11-09 — v1.4

- MEDIA 썸네일 원본 3개를 삭제하여 이미지 수를 12개로 정리했습니다.

### 2026-11-09 — v1.3

- MEDIA 카테고리 index.md의 이미지별 제목·설명 작성법과 모달 표시를 반영했습니다.

### 2026-11-09 — v1.2

- MEDIA 최상위 카테고리와 이미지 분류 위치, 상대 링크 예시를 갱신하고 EBOOK 카테고리 구조를 반영했습니다.

### 2026-11-09

- 브랜드명·기본 도메인·심볼 경로와 GitHub Pages 사용자 도메인 해제 절차를 갱신했습니다.
