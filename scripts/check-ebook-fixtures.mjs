import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import vm from 'node:vm';
import ts from 'typescript';
import { getEbooks } from './lib/ebooks.mjs';
import { syncAssets } from './sync-content-assets.mjs';

function fixture(fn) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'borido-ebook-'));
  const write = (name, text = 'download bytes') => { const file = path.join(root, 'src/content', name); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, text); return file; };
  fs.writeFileSync(path.join(root, 'content-registry.json'), JSON.stringify({ version: 1, files: {}, folders: {}, redirects: {} }));
  try { fn(root, write); } finally { fs.rmSync(root, { recursive: true, force: true }); }
}
test('ebook packages derive title, bibliography, both formats and CC0 without requiring YAML or metadata', () => fixture((root, write) => {
  write('ebook/002.이야기/책.epub'); write('ebook/001.문헌/책.pdf'); write('ebook/001.문헌/책.epub');
  write('ebook/001.문헌/cover.webp'); write('ebook/001.문헌/other.png');
  write('ebook/001.문헌/index.md', '# 본문 제목\n\n저자: 길장\n번역자: 비움\n판본: 제1판\n\n## 책 소개\n\n문헌에 대한 소개.\n\n```\n저자: 가짜\n```');
  const books = getEbooks(root);
  assert.deepEqual(books.map(book => book.title), ['본문 제목', '이야기']);
  assert.deepEqual(books[0].bibliography.map(item => item.value), ['길장', '비움', '제1판']);
  assert.equal(books[0].description, '문헌에 대한 소개.');
  assert.deepEqual(books[0].downloads.map(file => file.format), ['EPUB', 'PDF']);
  assert.match(books[0].downloads[0].url, /%EC%B1%85.epub$/);
  assert.match(books[0].coverUrl, /cover.webp$/); assert.equal(books[1].coverUrl, '');
  assert.ok(books.every(book => book.license.label === 'CC0 1.0'));
}));
test('ebook publication copies only selected public downloads/covers and removes stale or newly private assets', () => fixture((root, write) => {
  write('ebook/공개/book.pdf'); write('ebook/공개/cover.jpg'); write('ebook/공개/notes.txt');
  write('ebook/공개/assets/private.pdf'); write('ebook/공개/index.md', '# 공개');
  write('ebook/비공개/book.epub'); write('ebook/비공개/index.md', '---\npublished: false\n---\n# 비공개');
  write('ebook/_drafts/초안/book.pdf'); write('ebook/.hidden/book.pdf');
  write('ebook/미완성/cover.jpg'); write('ebook/빈파일/book.epub', '');
  syncAssets(root);
  assert.deepEqual(getEbooks(root).map(book => book.title), ['공개']);
  const output = path.join(root, 'public/generated/content/ebook');
  assert.deepEqual(fs.readdirSync(output), ['공개']); assert.deepEqual(fs.readdirSync(path.join(output, '공개')), ['book.pdf', 'cover.jpg']);
  write('ebook/공개/index.md', '---\npublished: false\n---\n# 공개'); syncAssets(root);
  assert.equal(fs.existsSync(output), false);
  write('ebook/index.md', '---\npublished: false\n---\n'); assert.deepEqual(getEbooks(root), []);
}));
test('ebook original links resolve only current public TEXT/STORY documents', () => fixture((root, write) => {
  write('text/category/work/index.md', '# 원문'); write('text/category/private/index.md', '---\npublished: false\n---\n# 비공개');
  fs.writeFileSync(path.join(root, 'content-registry.json'), JSON.stringify({version: 1, files: {
    'text/category/work/index.md': {url: '/text/work/'}, 'text/category/private/index.md': {url: '/text/private/'}
  }, folders: {}, redirects: {}}));
  write('ebook/book/book.pdf'); write('ebook/book/index.md', '# 책\n\n원문: [문헌 읽기](../../text/category/work/index.md)\n\n[비공개](../../text/category/private/index.md)');
  assert.deepEqual(getEbooks(root)[0].originals, [{title: '문헌 읽기', url: '/text/work/'}]);
}));
class Element {
  dataset = {}; hidden = false; value = ''; handlers = {}; attributes = {}; style = {overflow: 'auto'}; open = false;
  /** @type {Element | undefined} */ parent;
  classList = {toggle() {}};
  constructor(dataset = {}) { this.dataset = dataset; }
  addEventListener(type, fn) { (this.handlers[type] ??= []).push(fn); }
  emit(type, event = {}) { for (const fn of this.handlers[type] ?? []) fn(event); }
  setAttribute(key, value) { this.attributes[key] = value; }
  focus() { this.focused = true; }
  closest() { return this.parent; }
  replaceChildren(...children) { this.children = children; }
  showModal() { this.open = true; }
  close() { this.open = false; this.emit('close'); }
  getBoundingClientRect() { return {left: 10, right: 500, top: 10, bottom: 500}; }
}
function clientFixture(initial = 'https://borido.org/ebook/') {
  const items = [new Element({ebookId: 'one', ebookSearchText: '문헌 길장', ebookFormats: 'EPUB PDF'}), new Element({ebookId: 'two', ebookSearchText: '이야기 비움', ebookFormats: 'PDF'})];
  const buttons = items.map(item => { const button = new Element(); button.parent = item; item.querySelector = selector => selector === '[data-ebook-open]' ? button : {content: {cloneNode: () => ({title: item.dataset.ebookSearchText})}}; return button; });
  const filters = ['', 'EPUB', 'PDF'].map(ebookFilter => new Element({ebookFilter}));
  const library = new Element(), dialog = new Element(), body = new Element(), search = new Element(), count = new Element(), empty = new Element(), content = new Element(), close = new Element();
  library.querySelectorAll = selector => selector === '[data-ebook-item]' ? items : filters;
  library.querySelector = selector => ({'[data-ebook-search]': search, '[data-ebook-count]': count, '[data-ebook-empty]': empty})[selector];
  dialog.querySelector = selector => selector === '[data-ebook-close]' ? close : content;
  const root = {body, querySelector: selector => selector === '[data-ebook-library]' ? library : dialog};
  const browser = {location: {href: initial}, history: {replaceState(_state, _title, url) { browser.location.href = String(url); }}, addEventListener(type, fn) { this[type] = fn; }};
  const module = {exports: {}};
  const code = ts.transpileModule(fs.readFileSync('src/lib/client/ebook-library.ts', 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}}).outputText;
  vm.runInNewContext(code, {module, exports: module.exports, URL}); module.exports.initEbookLibrary(root, browser);
  return {items, buttons, filters, dialog, body, search, count, empty, content, close, browser};
}
test('ebook search intersects format filters and modal restores focus/scroll and supports shared links', () => {
  const f = clientFixture();
  f.filters[1].emit('click'); assert.equal(f.items[1].hidden, true); assert.equal(f.count.textContent, '1권의 전자책');
  f.search.value = '비움'; f.search.emit('input'); assert.equal(f.empty.hidden, false);
  f.filters[2].emit('click'); assert.equal(f.items[1].hidden, false);
  f.buttons[1].emit('click'); assert.equal(f.dialog.open, true); assert.equal(f.body.style.overflow, 'hidden'); assert.match(f.browser.location.href, /book=two/);
  f.dialog.emit('click', {target: f.dialog, clientX: 100, clientY: 100}); assert.equal(f.dialog.open, true);
  f.dialog.emit('click', {target: f.dialog, clientX: 0, clientY: 0}); assert.equal(f.dialog.open, false); assert.equal(f.body.style.overflow, 'auto'); assert.equal(f.buttons[1].focused, true); assert.equal(f.content.children.length, 0);
  assert.equal(new URL(f.browser.location.href).searchParams.has('book'), false);
  const shared = clientFixture('https://borido.org/ebook/?book=one'); assert.equal(shared.dialog.open, true);
  shared.browser.location.href = 'https://borido.org/ebook/'; shared.browser.popstate(); assert.equal(shared.dialog.open, false);
} );
