import { ARTICLE_LABEL, LIBRARY_LABELS, SITE_URL } from '../../../site-config.mjs';

export const searchPaths = {
  catalog: '/search/catalog.json',
  originals: '/search/originals.json',
  pagefind: '/pagefind/pagefind.js',
};
export const searchSections = /** @type {const} */ (['TEXT', 'STORY', 'ARTICLE', 'BLOG', 'PAGES']);
export const searchSectionLabels = {
  TEXT: LIBRARY_LABELS.text, STORY: LIBRARY_LABELS.story, ARTICLE: ARTICLE_LABEL, BLOG: 'BLOG', PAGES: '안내문',
};
const han = /\p{Script=Han}/u;
const collator = new Intl.Collator('ko');

/** @typedef {typeof searchSections[number]} SearchSection */
/** @typedef {SearchSection | 'ALL'} SearchFilter */
/** @typedef {{id: string, title: string, url: string, section?: SearchSection, context?: string, workId?: string, work?: string}} SearchTarget */
/** @typedef {SearchTarget & {kind: 'work' | 'document' | 'tag', aliases?: string[]}} CatalogRecord */
/** @typedef {SearchTarget & {passages: [anchor: string, text: string][]}} OriginalDocument */
/** @typedef {SearchTarget & {kind: CatalogRecord['kind'] | 'original', excerpt?: string, match?: [before: string, text: string, after: string]}} SearchResult */

/** @param {string} text */
export function searchKey(text) {
  return text.normalize('NFC').trim().replace(/\s+/gu, ' ');
}

/** @param {string} text */
export function hasHan(text) {
  return han.test(text);
}

/** @param {unknown} value @returns {value is SearchSection} */
export function isSearchSection(value) {
  return searchSections.some(section => section === value);
}

/** @param {string} value */
export function searchUrl(value) {
  const target = new URL(value, SITE_URL);
  if (target.origin !== SITE_URL) throw new Error('Search result points outside the site');
  return target.pathname + target.search + target.hash;
}

/** @param {string} value */
export function searchLocationKey(value) {
  const target = new URL(value, SITE_URL);
  return target.pathname.replace(/\/$/, '') + target.search + target.hash;
}

/** @template {{plain_excerpt?: string}} T @param {T[] | undefined} passages @param {string} input */
export function bestPagefindPassage(passages, input) {
  const phrase = searchKey(input).replace(/^"(.+)"$/u, '$1').toLowerCase();
  return passages?.find(passage => phrase && searchKey(passage.plain_excerpt ?? '').toLowerCase().includes(phrase))
    ?? passages?.[0];
}

/** @param {CatalogRecord[]} records @param {string} input @param {SearchFilter} filter */
export function findCatalogRecords(records, input, filter) {
  const query = searchKey(input).toLowerCase();
  if (!query) return [];
  const tiers = /** @type {CatalogRecord[][]} */ ([[], [], [], []]);
  for (const record of records) {
    if (filter !== 'ALL' && record.section !== filter) continue;
    const title = searchKey(record.title).toLowerCase();
    const aliases = record.aliases?.map(name => searchKey(name).toLowerCase()) ?? [];
    if (title === query) tiers[0].push(record);
    else if (aliases.includes(query)) tiers[1].push(record);
    else if (title.startsWith(query) || aliases.some(name => name.startsWith(query))) tiers[2].push(record);
    else if (title.includes(query) || aliases.some(name => name.includes(query))) tiers[3].push(record);
  }
  return tiers.flatMap(tier => tier.sort((a, b) =>
    Number(b.kind === 'work') - Number(a.kind === 'work') ||
    collator.compare(a.title, b.title) || a.url.localeCompare(b.url)));
}

/** @param {string} text */
function originalKey(text) {
  // NFC maps some CJK compatibility ideographs to other code points.
  return text.split(/(\p{Script=Han}+)/u).map((part, index) =>
    index % 2 ? part : part.normalize('NFC')).join('').trim().replace(/\s+/gu, ' ');
}

/** @param {OriginalDocument[]} documents @param {string} input @returns {SearchResult[]} */
export function findOriginalPassages(documents, input) {
  const query = originalKey(input);
  if (!hasHan(query)) return [];
  const results = [];
  const graphemes = typeof Intl.Segmenter === 'function'
    ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : undefined;
  for (const { passages, ...document } of documents) {
    const seen = new Set();
    for (const [anchor, original] of passages) {
      const key = originalKey(original);
      if (seen.has(anchor) || !key.includes(query)) continue;
      // Keep the displayed characters and punctuation from the rendered passage.
      // Segment only passages with hits, so variable-length NFC and spaces can be
      // mapped back to their original offsets.
      const sourceOffsets = [];
      let displayKey = '';
      const source = graphemes ? original : key;
      const segments = graphemes?.segment(source) ?? Array.from(source.matchAll(/./gsu), match =>
        ({ segment: match[0], index: match.index }));
      for (const { segment, index } of segments) {
        const text = segment.trim() ? originalKey(segment) : ' ';
        if (!text || (text === ' ' && (!displayKey || displayKey.endsWith(' ')))) continue;
        displayKey += text;
        for (let i = 0; i < text.length; i++) sourceOffsets.push([index, index + segment.length]);
      }
      const at = displayKey.indexOf(query);
      if (at < 0) continue;
      const [start] = sourceOffsets[at];
      const [, end] = sourceOffsets[at + query.length - 1];
      const before = Array.from(source.slice(0, start).trimStart());
      const after = Array.from(source.slice(end).trimEnd());
      seen.add(anchor);
      results.push({
        ...document, kind: 'original',
        url: anchor ? `${document.url}#${encodeURIComponent(anchor)}` : document.url,
        match: [
          (before.length > 34 ? '…' : '') + before.slice(-34).join(''),
          source.slice(start, end),
          after.slice(0, 50).join('') + (after.length > 50 ? '…' : ''),
        ],
      });
    }
  }
  return results;
}
