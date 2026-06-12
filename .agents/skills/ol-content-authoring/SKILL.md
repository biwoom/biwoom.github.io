---
name: ol-content-authoring
description: Create or update OL HOME content entries under src/content. Use when working on blog posts, text documents, story chapters, design entries, entity pages, ontology docs, permanent pages, frontmatter, tags, publication flags, or content assets for the OL Astro site.
---

# OL Content Authoring

## Workflow

1. Identify the target collection from the user request.
2. Read `src/content.config.ts` before adding or changing frontmatter.
3. Inspect a nearby existing entry in the same collection and follow its structure.
4. Place content in the correct folder:
   - `src/content/pages/` for permanent project documents.
   - `src/content/blog/{slug}/index.md` for dated work logs.
   - `src/content/text/{series}/` for TEXT series and documents.
   - `src/content/story/{series}/` for STORY series and chapters.
   - `src/content/design/{slug}/index.md` plus `assets/` for visual works.
   - `src/content/entities/{type}s/` for ontology entries.
   - `src/content/ontology/` for ontology reference docs.
5. Use ASCII slugs and route-bearing filenames. Put Korean titles in frontmatter.
6. Set `published: true` only when the content should be public.
7. Run `npm run build` after edits and confirm the expected route is generated.

## Frontmatter Rules

- Do not invent frontmatter fields without updating `src/content.config.ts`.
- Preserve URL stability unless the user explicitly requests a rename.
- Use `date` or `publishedAt` formats already used in nearby entries.
- For TEXT and STORY tags, prefer `prefix/name` form:

```yaml
tags:
  - "인물/붓다"
  - "장소/룸비니"
  - "개념/연기"
```

- For BLOG and DESIGN management tags, `prefixTags` may use `key:value` form:

```yaml
prefixTags:
  - "kind:blog"
  - "project:ol-home"
```

## Asset Rules

- Keep DESIGN assets under `src/content/design/{slug}/assets/`.
- Keep STORY HTML assets under `src/content/story/{series}/assets/`.
- Do not edit `public/generated/` as source; it is produced by `scripts/sync-content-assets.mjs`.
- TEXT image assets may live beside the document or series and be referenced relatively, matching existing entries.

## Validation

- Run `npm run build`.
- Check the build output for the expected route.
- Treat the empty `src/content/ai` warning as acceptable unless the task is about AI content.
