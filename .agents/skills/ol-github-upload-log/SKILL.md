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
3. Update `.agents/context/work-log.md` in the working tree first so the upload log is prepared before the GitHub push.
4. If the log needs a precise pushed commit hash, record the pending upload scope first, then update the log entry after the local commit is created and before pushing. Keep that as a single local commit flow, not a second push.
5. Run relevant local validation if it has not already been run for the changed files.
6. Commit the code changes and log update together with a concise message. Avoid a separate follow-up push just for the log when the log can be included in the same commit.
7. Push to GitHub:

```sh
git push origin main
```

8. Stop deployment waiting here. Do not run `gh run list`, `gh run watch`, or live-site checks unless the user explicitly asks for deployment verification.
9. Immediately update `.agents/context/work-log.md` with:
   - date
   - pushed commit or branch
   - files or scope uploaded
   - local validation result if available
   - deployment status only if explicitly checked
10. Only create a follow-up commit if the log genuinely cannot be included in the original commit. Do not default to a second push.

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
