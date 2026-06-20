---
name: ol-github-upload-log
description: Push OL HOME changes to GitHub. Use when the user asks to upload, push, publish, or deploy changes to GitHub. This workflow performs the upload only; it does not update work logs or wait for deployment verification unless explicitly requested.
---

# OL GitHub Upload

## Scope

Use this skill for OL HOME GitHub upload requests.

Default target:

```txt
origin main
```

## Workflow

1. Inspect the worktree, current branch, and upstream sync state:

```sh
git status --short --branch
```

2. Confirm the current branch is `main` and that it is not behind `origin/main`. If it is behind or diverged, stop the upload process, analyze the cause, resolve the branch state, and restart the upload workflow.
3. If unrelated changes exist, stage only the files that belong to the user's requested upload.
4. Run relevant local validation if it has not already been run for the changed files.
5. Commit the requested code/content/documentation changes with a concise message.
6. Push the requested change to GitHub:

```sh
git push origin main
```

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
- Use the default `git push origin main` path for OL HOME uploads; non-default push targets should still be confirmed.
