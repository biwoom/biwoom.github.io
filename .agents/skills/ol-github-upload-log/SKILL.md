---
name: ol-github-upload-log
description: Push OL HOME changes to GitHub and immediately record the pushed result. Use when the user asks to upload, push, publish, or deploy changes to GitHub. This workflow must not wait for or inspect GitHub Pages or GitHub Actions deployment completion unless the user explicitly requests deployment verification.
---

# OL GitHub Upload Log

## Scope

Use this skill for OL HOME GitHub upload requests.

Default target:

```txt
origin main
```

## Workflow

1. Inspect the worktree:

```sh
git status --short --branch
```

2. If unrelated changes exist, stage only the files that belong to the user's requested upload.
3. Run relevant local validation if it has not already been run for the changed files.
4. Commit the requested code/content/documentation changes with a concise message.
5. Push the requested change to GitHub:

```sh
git push origin main
```

6. Stop deployment waiting here. Do not run `gh run list`, `gh run watch`, or live-site checks unless the user explicitly asks for deployment verification.
7. Immediately update `.agents/context/work-log.md` with:
   - date
   - pushed commit or branch
   - files or scope uploaded
   - local validation result if available
   - deployment status only if explicitly checked
8. Commit the work-log update as a follow-up commit.
9. Push the work-log commit to GitHub:

```sh
git push origin main
```

## Reporting

Report:

- pushed commit hash
- remote branch
- whether work-log was updated and pushed
- local validation result if available
- note that deployment completion was not checked unless explicitly requested

## Safety

- Do not silently stage unrelated user changes.
- Do not wait for GitHub Pages deployment completion by default.
- Do not interpret "deploy" as "wait until the Pages site is live" unless the user asks for deployment verification.
- Use the default `git push origin main` path for OL HOME uploads; non-default push targets should still be confirmed.
