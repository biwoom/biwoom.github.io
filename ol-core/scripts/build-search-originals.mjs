import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'parse5';
import { hasHan, searchPaths } from '../src/lib/search.mjs';
import { isMainModule, projectPaths } from './lib/paths.mjs';

const blocks = new Set(['p', 'pre', 'li', 'td', 'th', 'dt', 'dd', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
const omitted = new Set(['script', 'style', 'template', 'noscript']);
const attribute = (node, name) => node.attrs?.find(item => item.name === name)?.value;
const children = node => node.childNodes ?? [];
const ignored = node => omitted.has(node.tagName) || attribute(node, 'hidden') !== undefined
  || attribute(node, 'data-pagefind-ignore') !== undefined;

function findBody(node) {
  if (attribute(node, 'data-search-originals-body') !== undefined) return node;
  for (const child of children(node)) {
    const match = findBody(child);
    if (match) return match;
  }
}

function inlineText(node) {
  if (ignored(node)) return '';
  if (node.nodeName === '#text') return node.value;
  if (node.tagName === 'br') return '\n';
  if (blocks.has(node.tagName)) return ' ';
  return children(node).map(inlineText).join('');
}

export function extractOriginalPassages(html) {
  const body = findBody(parse(html));
  if (!body) return [];
  const passages = [];
  let heading = '';
  function visit(node) {
    if (ignored(node)) return;
    const id = attribute(node, 'id');
    if (id && /^h[1-6]$/.test(node.tagName)) heading = id;
    if (blocks.has(node.tagName)) {
      const text = children(node).map(inlineText).join('').trim();
      if (hasHan(text)) passages.push([id ?? heading, text]);
    }
    for (const child of children(node)) visit(child);
  }
  visit(body);
  return passages;
}

export function buildOriginals(dist = projectPaths().dist) {
  const catalog = JSON.parse(fs.readFileSync(path.join(dist, searchPaths.catalog), 'utf8'));
  const documents = [];
  for (const entry of catalog) {
    if (entry.section !== 'TEXT' || entry.kind !== 'document') continue;
    const html = fs.readFileSync(path.join(dist, decodeURIComponent(entry.url), 'index.html'), 'utf8');
    if (!hasHan(html)) continue;
    const passages = extractOriginalPassages(html);
    if (!passages.length) continue;
    const { id, url, title, section, workId, work, context } = entry;
    documents.push({ id, url, title, section, workId, work, context, passages });
  }
  fs.writeFileSync(path.join(dist, searchPaths.originals), JSON.stringify(documents));
  return documents;
}

if (isMainModule(import.meta.url)) {
  const documents = buildOriginals();
  console.log(`Indexed original passages from ${documents.length} public TEXT documents.`);
}
