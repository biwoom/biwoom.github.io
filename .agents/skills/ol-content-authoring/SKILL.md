---
name: ol-content-authoring
description: Create or update OL HOME content entries under src/content. Use when working on blog posts, text documents, story chapters, design entries, entity pages, ontology docs, permanent pages, frontmatter, tags, publication flags, or content assets for the OL Astro site.
---

# OL Content Authoring

## Workflow

1. Identify the target collection from the user request.
2. Read `src/content.config.ts` before adding or changing frontmatter.
3. For internal content-management rules, read `.agents/references/ol-home-content-management-manual.md`.
4. Inspect a nearby existing entry in the same collection and follow its structure.
5. Place content in the correct folder:
   - `src/content/pages/` for public permanent project documents only.
   - `src/content/blog/{slug}/index.md` for dated work logs.
   - `src/content/text/{series}/` for TEXT series and documents.
   - `src/content/story/{series}/` for STORY series and chapters.
   - `src/content/design/{slug}/index.md` plus `assets/` for visual works.
   - `src/content/entities/{type}s/` for ontology entries.
   - `src/content/ontology/` for ontology reference docs.
6. Use ASCII slugs and route-bearing filenames. Put Korean titles in frontmatter.
7. Set `published: true` only when the content should be public.
8. Run `npm run check` after frontmatter or asset edits.
9. Run `npm run build` after edits and confirm the expected route is generated.

## Frontmatter Rules

- Do not invent frontmatter fields without updating `src/content.config.ts`.
- Preserve URL stability unless the user explicitly requests a rename.
- Use `date` or `publishedAt` formats already used in nearby entries.
- Internal operating manuals belong under `.agents/references/`, not `src/content/pages/`.
- For BuddhaStory part names and candidate chapter titles, consult `docs/toc/붓다스토리(Buddha Story) 목차 v0.1.md` first. Treat it as a planning reference, not as a final route source; actual URLs follow `src/content/story/buddha-story`.
- For TEXT and STORY tags, prefer `prefix/name` form:
- All collections now store tags only in `tags`.
- Do not use `prefixTags`.

```yaml
tags:
  - "인물/붓다"
  - "장소/룸비니"
  - "개념/연기"
  - "kind/story"
```

- For BLOG and DESIGN management tags, keep using slash-form strings inside `tags`, for example `kind/blog`, `project/design`, `topic/indramang`.

## Entity Rules

- Place entity documents under `src/content/entities/{type}s/`, such as `src/content/entities/persons/sumedha.md` or `src/content/entities/places/amaravati.md`.
- Use `id` as the stable internal key. TEXT and STORY document `entities` arrays must reference these ids, not Korean labels.
- The order of ids in TEXT/STORY `entities` arrays is the display order for the document-side name-card panel.
- Use current schema field names:
  - `type: "person"` or `type: "place"`.
  - `name.en`, not `name.english`.
  - `description`, not `summary` or `memoryPhrase`.
  - Do not use `kind` or `entityType` in entity frontmatter.
- When adding a Person Entity for a STORY document, add `appearsIn` entries pointing back to the current STORY route:

```yaml
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
```

- When a Person Entity is tied to locations, use `primaryPlaces` with place ids:

```yaml
primaryPlaces:
  - placeId: "amaravati"
    relation: "출신지"
```

- When a TEXT or STORY document lists a place id in `entities`, make sure the matching Place Entity document exists under `src/content/entities/places/`.
- Place Entity coordinates belong in `geo`. Do not put `lat`/`lng` directly in STORY or Person Entity documents.
- If a place is legendary, broad, or uncertain, set `geo.confidence` to `low` or `unknown` and use `map.showOnMap: false` when a marker would mislead.
- For NET readiness, fill these fields when the source supports them:
  - Person: `primaryPlaces`, `appearsIn`, `relatedText`, `design`, `sourceTraditions`, `spiritualStatus`.
  - Place: `placeType`, `geo`, `kingdom`, `historical`, `map`, `relatedPersons`, `relatedStories`, `relatedText`.

## Asset Rules

- Keep DESIGN assets under `src/content/design/{slug}/assets/`.
- Keep STORY HTML assets under `src/content/story/{series}/assets/`.
- Do not edit `public/generated/` as source; it is produced by `scripts/sync-content-assets.mjs`.
- TEXT image assets may live beside the document or series and be referenced relatively, matching existing entries.

## Validation

- Run `npm run check`.
- Run `npm run build`.
- Check the build output for the expected route.
- Treat the empty `src/content/ai` warning as acceptable unless the task is about AI content.
