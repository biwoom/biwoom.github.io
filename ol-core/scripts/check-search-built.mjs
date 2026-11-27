import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { gzipSync } from 'node:zlib';
import { SITE_URL } from '../../site-config.mjs';
import { projectPaths } from './lib/paths.mjs';
import { publicRoutes, readRegistry } from './lib/content.mjs';
import { readHomeArticles } from './lib/home-articles.mjs';
import { storyTagPath } from './lib/story-tags.mjs';
import { bestPagefindPassage, findCatalogRecords, findOriginalPassages, searchPaths, searchSections } from '../src/lib/search.mjs';

const { dist } = projectPaths();
const read = route => fs.readFileSync(path.join(dist, route), 'utf8');
const page = route => read(path.join(decodeURIComponent(route), 'index.html'));
const catalog = JSON.parse(read(searchPaths.catalog));
const originals = JSON.parse(read(searchPaths.originals));
const routes = publicRoutes(readRegistry());
const articles = new Set(readHomeArticles().filter(({ article }) => article.published).map(({ article }) => `/stories/${article.id}/`));
const titles = new Map();
assert.equal(new Set(catalog.map(row => row.id)).size, catalog.length, 'Unique search IDs');
for (const entry of catalog) {
  assert.match(entry.url, /^\/(?!hub\/)/);
  assert.ok(searchSections.includes(entry.section));
  assert.ok(page(entry.url).includes(`rel="canonical" href="${SITE_URL}${entry.url}"`), entry.url);
  if (entry.section === 'ARTICLE') assert.ok(articles.has(entry.url), entry.url);
  else if (entry.kind !== 'tag') assert.ok(routes.has(entry.url), entry.url);
  if (entry.section === 'TEXT' && entry.kind === 'document') titles.set(entry.url, entry.id);
}
for (const { url, id, passages } of originals) {
  assert.equal(titles.get(url), id, url);
  const html = page(url);
  assert.ok(html.includes('data-search-originals-body'), url);
  for (const [anchor] of passages) if (anchor) assert.ok(html.includes(`id="${anchor}"`), `${url}#${anchor}`);
}
const catalogueMatches = query => findCatalogRecords(catalog, query, 'ALL');
for (const [query, route] of [
  ['마하붓다왐사', '/story/library/0e519513f4c7c9/'],
  ['담마빠다이야기', '/story/library/2e523ea50c1cac/'],
  ['붓다왐사', '/story/library/0e519513f4c7c9/'],
]) assert.equal(catalogueMatches(query)[0]?.url, route, query);
for (const query of ['사리불', '사리뿟따', 'Sāriputta', 'Sa\u0304riputta']) {
  assert.equal(catalogueMatches(query)[0]?.url, storyTagPath({ type: 'person', label: '사리불' }), query);
}
assert.deepEqual(new Set(catalogueMatches('도솔천').filter(entry => entry.title === '도솔천' && entry.kind === 'tag').map(entry => entry.url)),
  new Set(['place', 'topic'].map(type => storyTagPath({ type, label: '도솔천' }))));
const hanHits = findOriginalPassages(originals, '無常');
assert.deepEqual(new Set(hanHits.map(hit => hit.url.split('#')[0])),
  new Set(originals.filter(doc => doc.passages.some(([, text]) => text.includes('無常'))).map(doc => doc.url)));
const original = findOriginalPassages(originals, '無常者遷流').find(hit => hit.url.startsWith('/text/read/ae12532c6ff434/#'));
assert.equal(original?.match?.[1], '無常者遷流');

// Run the generated WASM search in Node against the published files.
const bundle = pathToFileURL(path.join(dist, 'pagefind') + path.sep);
const originalFetch = globalThis.fetch;
const fetchedBytes = new Map();
globalThis.fetch = async input => {
  const file = new URL(input, bundle);
  const data = await fs.promises.readFile(file);
  fetchedBytes.set(file.pathname, data.length);
  return new Response(data);
};
const { createInstance } = await import(new URL('pagefind.js', bundle));
const engine = createInstance({ basePath: bundle.href, baseUrl: '/' });
try {
  assert.equal(JSON.parse(read('/pagefind/pagefind-entry.json')).version, '1.5.2');
  const scripts = ['pagefind.js', 'pagefind-worker.js'].reduce((sum, file) => sum + fs.statSync(new URL(file, bundle)).size, 0);
  const bytes = () => Math.round((scripts + [...fetchedBytes.values()].reduce((sum, size) => sum + size, 0)) / 1000);
  const cold = await engine.search('부처님');
  await Promise.all(cold.results.slice(0, 8).map(result => result.data()));
  const firstBatch = bytes();
  await Promise.all(cold.results.slice(8, 24).map(result => result.data()));
  console.log(`Pagefind local assets for 부처님 (first 8 / 24 excerpts): ${firstBatch} / ${bytes()} kB.`);
  const filters = await engine.filters();
  for (const section of searchSections) assert.ok(filters.section[section] > 0, section);
  const blog = await engine.search('부처님', { filters: { section: 'BLOG' } });
  const matchingPosts = await Promise.all(blog.results.map(result => result.data()));
  assert.ok(matchingPosts.every(result => result.meta.section === 'BLOG'));
  assert.ok(matchingPosts.some(result => result.url === '/blog/anuttara-samma-sambodhi/'));
  const target = '/story/read/723cff2e0fab35/';
  for (const query of ['무상한 것을 영원하다고', '"무상한 것을 영원하다고"']) {
    const match = await engine.search(query, { filters: { section: 'STORY' } });
    const hits = await Promise.all(match.results.slice(0, 8).map(result => result.data()));
    const first = bestPagefindPassage(hits.find(result => result.url === target)?.sub_results, query);
    assert.ok(first?.anchor?.id, query);
    assert.ok(page(target).includes(`id="${first.anchor.id}"`), first.url);
    assert.ok(first.plain_excerpt.includes('무상한 것을 영원하다고'), first.plain_excerpt);
  }
} finally {
  await engine.destroy();
  globalThis.fetch = originalFetch;
}
const sizes = [searchPaths.catalog, searchPaths.originals].map(route => Math.round(gzipSync(read(route)).length / 1000));
console.log(`Search verified for ${catalog.length} catalogue entries and ${originals.length} original-text documents (gzip ${sizes.join(' / ')} kB).`);
