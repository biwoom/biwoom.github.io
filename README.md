# OL HOME

OL HOME is the public web home for the OL project, a Buddhist content project that publishes texts, stories, visual works, project notes, and ontology-based reference pages.

Production site:

```txt
https://biwoom.github.io/
```

Repository:

```txt
https://github.com/biwoom/biwoom.github.io
```

## Stack

- Astro 6
- Astro Content Collections
- MD / MDX content
- Tailwind CSS via Vite
- Pagefind search
- GitHub Pages deployment through GitHub Actions

## Main Sections

- `HOME`: project entrance and latest updates
- `TEXT`: translated and annotated Buddhist text library
- `STORY`: narrative Buddhist content organized by series and chapters
- `DESIGN`: infographic and visual knowledge archive
- `BLOG`: project logs, development notes, and editorial records
- `ENTITY`: people, places, and concepts connected by relations
- `ATLAS`: static OL ATLAS HTML archive

## Project Structure

```txt
.
├── .github/workflows/deploy.yml
├── public/
│   ├── atlas/
│   ├── favicon.ico
│   ├── og-image.png
│   └── robots.txt
├── scripts/
│   └── sync-content-assets.mjs
├── src/
│   ├── components/
│   ├── content/
│   │   ├── blog/
│   │   ├── design/
│   │   ├── entities/
│   │   ├── ontology/
│   │   ├── pages/
│   │   ├── story/
│   │   └── text/
│   ├── layouts/
│   ├── lib/
│   ├── pages/
│   └── styles/
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## Content Model

Content collections are defined in `src/content.config.ts`.

Current collection groups:

- `blog`: project logs and essays
- `text`: translated or annotated documents
- `story`: narrative series and chapters
- `design`: visual works and infographics
- `entities`: ontology entries for persons, places, concepts, texts, events, practices, and schools
- `ontology`: relation and entity type documentation
- `pages`: permanent project pages
- `ai`: reserved for AI workflow records

Design and story assets are stored next to their content source under `assets/`. During development and build, `scripts/sync-content-assets.mjs` copies those assets into `public/generated/`.

## Commands

```sh
npm install
npm run dev
npm run build
npm run preview
```

Command behavior:

- `npm run dev`: syncs content assets, then starts Astro dev server
- `npm run build`: syncs assets, builds the static site, then creates the Pagefind index
- `npm run preview`: previews the built site locally

The project requires Node.js `>=22.12.0`.

## GitHub Pages

This repository is intended to be a GitHub user page repository. The repository name should be:

```txt
biwoom.github.io
```

Because it is served from the root GitHub Pages URL, `astro.config.mjs` sets:

```js
site: 'https://biwoom.github.io'
```

There is no Astro `base` path. Internal links and assets are generated from `/`.

Deployment is handled by:

```txt
.github/workflows/deploy.yml
```

The GitHub repository should use:

```txt
Settings -> Pages -> Source -> GitHub Actions
```

## Generated Files

The following are generated or local-only and should not be committed:

- `dist/`
- `.astro/`
- `node_modules/`
- `public/generated/`
- `.DS_Store`

## License

Project code and content licensing are managed per file or per content entry. Most public OL materials are intended for open distribution under permissive terms such as MIT or CC0 where applicable.
