---
name: ol-github-upload-log
description: Push BIWOOM HOME changes to the approved GitHub target when the user explicitly requests an upload. Writes a work log or verifies deployment only when explicitly requested.
---

# BIWOOM HOME GitHub 업로드

## Scope

2026-11-26 · BIWOOM HOME · 공개 주소 미정

HOME의 공개 저장소와 브랜치는 미결이다. 현재 `origin`은 가져온 `biwoom/biwoom.github.io`이며 `main` 푸시는 기존 비움 사이트의 Pages 배포를 시작할 수 있다. 업로드 요청에서 지정하거나 이미 승인된 대상에 이 스킬을 적용한다.

## Workflow

1. Inspect the worktree, current branch, remote addresses and upstream sync state:

```sh
git status --short --branch
git remote -v
```

2. Verify that the remote URL and destination branch match the requested target. If the target and local branch have diverged, resolve the branch state before pushing.
3. If unrelated changes exist, stage only the files that belong to the user's requested upload.
4. Run relevant local validation if it has not already been run for the changed files.
5. Commit the requested code/content/documentation changes with a concise message.
6. Push the requested changes using the verified remote and branch.

7. Stop here. Do not update `.agents/context/work-log.md`, create a follow-up log commit, run `gh run list`, run `gh run watch`, or check the live site unless the user explicitly asks for those extra actions.

## Reporting

Report:

- pushed commit hash
- remote branch
- local validation result if available
- note that deployment completion was not checked unless explicitly requested

## Safety

- Do not silently stage unrelated user changes.
- Do not couple upload requests to work-log edits or follow-up log commits.
- Do not wait for GitHub Pages deployment completion by default.
- Do not interpret "deploy" as "wait until the Pages site is live" unless the user asks for deployment verification.

## 수정 변경사항

### 2026-11-26 — 공개 저장소 상태 반영

- 가져온 `origin/main`의 배포 효과를 명시하고 실제 요청 대상의 원격 주소와 브랜치를 확인하도록 했다.
