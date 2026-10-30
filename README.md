# OL HOME

불교 문헌·이야기·작업 기록을 읽는 Astro 정적 사이트입니다.

- 사이트: https://biwoom.github.io/
- 저장소: `biwoom/biwoom.github.io`
- Node.js: 22.12 이상
- 배포: GitHub Actions → GitHub Pages 루트

## 집필

Obsidian에서 `src/content/`를 보관함으로 엽니다. Vault CMS나 다른 CMS는 필요하지 않습니다.

```text
src/content/
├── text/001.중관부/001.대승현론/
│   ├── 01.번역/001.1권.md
│   └── 02.연구/001.대승현론 제1권 연구.md
├── story/010.붓다 스토리/010.먼 과거의 서원/001.이야기.md
├── blog/작업 기록.md
└── pages/brand.md
```

제목과 본문만 작성해도 됩니다.

```markdown
# 대승현론 제1권

본문을 작성합니다.

## 소제목
```

첫 H1을 제목으로 사용하며, H1이 없으면 파일명에서 번호·확장자를 뺀 이름을 사용합니다. 기존 `title` 예외가 있으면 우선합니다. `001.md`처럼 번호만 있는 파일은 본문에 H1 제목을 작성하세요.

폴더·파일의 `001.` 같은 숫자는 정렬에 사용하고 화면에서는 숨깁니다. TEXT 첫 화면에는 카테고리와 문헌이 표시됩니다. 문헌 화면의 자료 구분 버튼은 첫 자료로 이동하며, 전체 자료는 펼침 목록으로 표시됩니다. 실제 탭 전환은 사용하지 않습니다. 번역과 연구는 독립적인 목록입니다.

소개가 필요하면 문헌 또는 시리즈 폴더에 `index.md`를 추가합니다. 필수는 아닙니다. 대표 이미지·태그·설명도 필수가 아닙니다.

## 초안·첨부파일

- `_drafts/`와 `_templates/`, `.obsidian/`은 사이트에서 제외합니다.
- 공개용 메뉴 폴더의 문서는 기본 공개 대상입니다. 로컬 편집 내용은 업로드·배포 후 실제 사이트에 반영됩니다.
- 기존 `published: false`는 유지됩니다. 시리즈의 `index.md`가 비공개이면 하위 문서도 숨깁니다.
- 개별 자료로 보여줄 PDF·이미지·HTML은 자료 구분 폴더에 직접 둡니다.
- 본문 보조 파일은 문서 옆 `assets/`에 두고 일반 Markdown 상대 링크로 연결합니다.
- YAML은 선택 사항입니다. 날짜·권리·설명 등의 예외에만 사용합니다. 위키링크·Obsidian 블록 임베드는 현재 지원하지 않으므로 일반 Markdown 링크를 사용하세요.

## 주소와 날짜

`content-registry.json`은 자동 관리되는 원본 색인입니다. 문서 URL·최초 공개 준비일·해시·문헌 주소·과거 경로 매핑을 보존하므로 콘텐츠와 함께 Git에 보관합니다. 빌드 산출물이 아닙니다. 기본 작성자·언어·권리는 `site-config.mjs`에서 관리하며 개별 권리 예외를 우선합니다.

일반적인 이동·개명은 내용 해시로 감지해 문서 주소를 유지합니다. **개발 서버를 끈 상태에서 이동과 본문 편집을 함께 수행하면** 자동 식별이 안 될 수 있습니다. 이 경우 준비·빌드 전에 다음 명령으로 기존 문서를 연결하세요.

```sh
npm run content:move -- "text/이전경로.md" "text/새경로.md"
```

같은 내용의 문서가 여러 개이면 자동 이동 감지는 모호할 수 있습니다. 파일명 접두어를 변경해도 내용이 유지되면 주소를 보존합니다. 문헌 폴더 전체 이동도 기존 색인이 있는 상태에서 처리하세요. BLOG의 기존 날짜는 보존되며, 새 공개 문서는 처음 준비할 때 날짜를 기록합니다. 정확한 과거 발행일이 필요하면 선택적으로 `date`를 지정합니다.

## 개발·검증

```sh
npm ci
npm run dev
npm run check
npm run typecheck
npm run build
npm run check:built
```

- `scripts/lib/content.mjs`: 이름·본문·경로의 공통 해석
- `src/content.config.ts`: 정규화된 데이터 스키마와 로더
- `scripts/prepare-content.mjs`: 고정 주소·날짜 색인 관리
- `src/lib/library.ts`: 공통 계층과 자료 목록
- `scripts/remark-content.mjs`: 제목 중복 방지·내부 링크 변환
- `scripts/sync-content-assets.mjs`: 일반 첨부파일 동기화
- `public/generated/content/`: 파생 자산. 직접 수정하거나 커밋하지 않음

DESIGN·NET·엔터티·온톨로지 전용 기능은 제거했습니다. 기존 시각자료와 필요한 설명은 TEXT의 일반 자료로 이관했고, 관련 과거 주소는 새 자료로 안내합니다. 이전 ATLAS HTML은 `.agents/archive/atlas/`에 보존하며 배포하지 않습니다.

자세한 집필 규칙은 `.agents/references/ol-home-content-management-manual.md`, 개편 기록은 `.agents/references/obsidian-content-refactor-guide.md`를 확인하세요.
