import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import sharp from 'sharp';
import vm from 'node:vm';
import ts from 'typescript';
import { syncMediaGallery, getMediaCategories, uncategorizedKey } from './lib/media-gallery.mjs';
import { hash } from './lib/content.mjs';
import { readMediaInformation } from './lib/media-information.mjs';

async function fixture(fn) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'biwoom-gallery-'));
  fs.writeFileSync(path.join(root, 'content-registry.json'), JSON.stringify({version: 1, files: {}, folders: {}, redirects: {}}));
  const image = async (source, width, height, color = 'red') => {
    const file = path.join(root, 'src/content/media', source);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    await sharp({ create: { width, height, channels: 3, background: color } }).png().toFile(file);
    return file;
  };
  try { await fn(root, image); } finally { fs.rmSync(root, { recursive: true, force: true }); }
}

test('gallery derives first-folder categories, root fallback and dimensions without touching originals', () => fixture(async (root, image) => {
  const rootImage = await image('표지 1.PNG', 30, 90);
  const nested = await image('002.인물/deeper/001.Wide.png', 120, 40);
  await image('001.문양/Square.png', 50, 50);
  await image('_drafts/private.png', 10, 10); await image('.hidden/private.png', 10, 10); await image('_assets/sprite.png', 10, 10);
  fs.writeFileSync(path.join(root, 'src/content/media/notes.md'), '# Not an image');
  const before = [rootImage, nested].map(file => hash(fs.readFileSync(file)));
  const items = await syncMediaGallery(root);
  assert.equal(items.length, 3);
  assert.deepEqual(getMediaCategories(items), [
    { key: '001.문양', label: '문양', count: 1 },
    { key: '002.인물', label: '인물', count: 1 },
    { key: uncategorizedKey, label: '미분류', count: 1 },
  ]);
  const wide = items.find(item => item.fileName === '001.Wide.png');
  assert.equal(wide.category, '인물'); assert.equal(wide.title, 'Wide');
  assert.equal(wide.width, 120); assert.equal(wide.height, 40);
  const cover = items.find(item => item.fileName === '표지 1.PNG');
  assert.ok(cover.url.endsWith(encodeURIComponent('표지 1.PNG')));
  for (const item of items) {
    const thumbnail = path.join(root, 'public', item.previewUrl), metadata = await sharp(thumbnail).metadata();
    assert.equal(metadata.format, 'webp'); assert.equal(metadata.width, item.previewWidth); assert.equal(metadata.height, item.previewHeight);
    assert.ok(item.previewWidth <= 640 && item.previewHeight <= 960);
  }
  assert.deepEqual([rootImage, nested].map(file => hash(fs.readFileSync(file))), before);
}));

test('gallery refreshes moves/edits, retains shared previews, and removes stale derivatives', () => fixture(async (root, image) => {
  const first = await image('001.First/same.png', 100, 50), second = path.join(root, 'src/content/media/002.Second/same.png');
  fs.mkdirSync(path.dirname(second), { recursive: true }); fs.copyFileSync(first, second);
  let items = await syncMediaGallery(root); assert.equal(items.length, 2); assert.equal(items[0].previewUrl, items[1].previewUrl);
  const originalPreview = path.join(root, 'public', items[0].previewUrl);
  fs.unlinkSync(first); items = await syncMediaGallery(root); assert.equal(items.length, 1); assert.ok(fs.existsSync(originalPreview));
  const moved = path.join(root, 'src/content/media/003.Moved/deeper/same.png');
  fs.mkdirSync(path.dirname(moved), { recursive: true }); fs.renameSync(second, moved);
  items = await syncMediaGallery(root); assert.equal(items[0].category, 'Moved'); assert.ok(items[0].source.includes('deeper/'));
  await image('003.Moved/deeper/same.png', 40, 120, 'blue');
  const date = new Date(Date.now() + 1000); fs.utimesSync(moved, date, date);
  items = await syncMediaGallery(root); assert.equal(items[0].width, 40); assert.equal(items[0].height, 120); assert.equal(fs.existsSync(originalPreview), false);
  fs.unlinkSync(moved); assert.deepEqual(await syncMediaGallery(root), []);
  assert.deepEqual(fs.readdirSync(path.join(root, 'public/generated/media-gallery')), []);
}));

test('concurrent page/stat preparation shares a complete preview generation and leaves no temporary files', () => fixture(async (root, image) => {
  await image('one.png', 900, 1800);
  const [a, b] = await Promise.all([syncMediaGallery(root), syncMediaGallery(root)]);
  assert.deepEqual(a, b); assert.equal(a.length, 1);
  assert.equal(fs.readdirSync(path.join(root, 'public/generated/media-gallery')).length, 1);
  assert.doesNotThrow(() => JSON.parse(fs.readFileSync(path.join(root, '.astro/media-gallery-cache.json'))));
}));

class Element {
  dataset = {}; hidden = false; disabled = false; textContent = ''; attributes = {}; handlers = {}; classes = new Set();
  scrollTop = 10; scrollLeft = 10; open = false; style = { overflow: 'auto' };
  classList = { toggle: (name, on) => on ? this.classes.add(name) : this.classes.delete(name) };
  constructor(dataset = {}) { this.dataset = dataset; }
  addEventListener(type, callback) { (this.handlers[type] ??= []).push(callback); }
  emit(type, event = {}) { for (const fn of this.handlers[type] ?? []) fn(event); if (type === 'cancel' && this.open) this.close(); }
  click() { if (!this.disabled) this.emit('click', { target: this }); }
  setAttribute(name, value) { this.attributes[name] = value; }
  removeAttribute(name) { delete this.attributes[name]; if (name === 'src') this.src = ''; }
  replaceChildren(...children) { this.children = children; }
  focus(options) { this.focused = options; }
  showModal() { assert.equal(this.open, false); this.open = true; }
  close() { if (this.open) { this.open = false; this.emit('close'); } }
  getBoundingClientRect() { return { left: 100, right: 500, top: 100, bottom: 500 }; }
  set innerHTML(_value) { throw new Error('Gallery must use textContent for filenames'); }
}
function clientFixture() {
  const items = [
    new Element({ mediaSource: 'media/001.문양/A.png', mediaCategory: '001.문양', mediaTitle: '<문양> & A', mediaLabel: '문양', mediaFilename: 'A.png', mediaSrc: '/generated/content/media/001/A.png', mediaWidth: '100', mediaHeight: '200' }),
    new Element({ mediaSource: 'media/B.png', mediaCategory: uncategorizedKey, mediaTitle: 'B', mediaLabel: '미분류', mediaFilename: 'B.png', mediaSrc: '/generated/content/media/B.png', mediaWidth: '300', mediaHeight: '100' }),
  ];
  const detail = new Element({mediaInfo: 'media/001.문양/A.png'});
  detail.content = {cloneNode: () => ({html: '<p>이미지 설명</p>'})};
  const filters = ['', '001.문양', uncategorizedKey, 'missing'].map(mediaFilter => new Element({ mediaFilter }));
  const gallery = new Element(), dialog = new Element(), body = new Element();
  const count = new Element(), empty = new Element();
  const parts = Object.fromEntries(['[data-media-full-image]', '#ol-media-dialog-title', '[data-media-dialog-category]', '[data-media-dialog-filename]', '[data-media-information]', '[data-media-load-status]', '[data-media-view]', '[data-media-close]', '[data-media-zoom]'].map(selector => [selector, new Element()]));
  dialog.querySelector = selector => parts[selector];
  gallery.querySelectorAll = selector => selector === '[data-media-item]' ? items : selector === '[data-media-filter]' ? filters : [detail];
  gallery.querySelector = selector => selector === '[data-media-count]' ? count : empty;
  const root = { body, querySelector: selector => selector === '[data-media-gallery]' ? gallery : dialog };
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync('src/lib/client/media-gallery.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(code, { module, exports: module.exports });
  module.exports.initMediaGallery(root);
  return { items, filters, dialog, body, count, empty, parts, root, init: module.exports.initMediaGallery };
}

test('media filters select exact folder keys, update counts, and show an empty state without navigation', () => {
  const { items, filters, count, empty, init, root } = clientFixture();
  filters[1].click(); assert.equal(items[0].hidden, false); assert.equal(items[1].hidden, true); assert.equal(count.textContent, '1개 이미지');
  assert.equal(filters[1].attributes['aria-pressed'], 'true');
  filters[2].click(); assert.equal(items[0].hidden, true); assert.equal(items[1].hidden, false);
  filters[3].click(); assert.equal(empty.hidden, false); assert.equal(count.textContent, '0개 이미지');
  filters[0].click(); assert.equal(empty.hidden, true); assert.ok(items.every(item => !item.hidden));
  init(root); assert.equal(items[0].handlers.click.length, 1);
});

test('modal shows originals safely, supports fit/original zoom, and restores scrolling and focus after close', () => {
  const { items, dialog, body, parts } = clientFixture();
  const image = parts['[data-media-full-image]'], zoom = parts['[data-media-zoom]'];
  items[0].click(); assert.equal(dialog.open, true); assert.equal(body.style.overflow, 'hidden');
  assert.equal(image.src, items[0].dataset.mediaSrc); assert.equal(parts['#ol-media-dialog-title'].textContent, '<문양> & A');
  assert.equal(zoom.disabled, true); image.emit('load'); assert.equal(image.hidden, false); assert.equal(zoom.disabled, false);
  zoom.click(); assert.equal(dialog.classes.has('is-zoomed'), true); assert.equal(zoom.attributes['aria-pressed'], 'true');
  assert.equal(parts['[data-media-view]'].scrollTop, 0); image.click(); assert.equal(dialog.classes.has('is-zoomed'), false);
  parts['[data-media-close]'].click(); assert.equal(dialog.open, false); assert.equal(body.style.overflow, 'auto');
  assert.equal(image.src, ''); assert.equal(items[0].focused.preventScroll, true);
  items[1].click(); assert.equal(image.src, items[1].dataset.mediaSrc); dialog.emit('cancel');
  assert.equal(dialog.open, false); assert.equal(body.style.overflow, 'auto'); assert.ok(items[1].focused);
});

test('modal ignores clicks inside its bounds, closes on backdrop, and reports failed image loads', () => {
  const { items, dialog, body, parts } = clientFixture();
  items[0].click(); dialog.emit('click', { target: dialog, clientX: 200, clientY: 200 }); assert.equal(dialog.open, true);
  parts['[data-media-full-image]'].emit('error'); assert.equal(parts['[data-media-zoom]'].disabled, true);
  assert.equal(parts['[data-media-load-status]'].textContent, '이미지를 불러오지 못했습니다.');
  dialog.emit('click', { target: dialog, clientX: 0, clientY: 0 }); assert.equal(dialog.open, false); assert.equal(body.style.overflow, 'auto');
});


test('category index maps multiple image headings, rich Markdown and document-relative links', () => fixture(async (root, image) => {
  await image('001.문양/A.png', 30, 40); await image('001.문양/deeper/B.png', 50, 60);
  await image('002.일러스트/A.png', 30, 40);
  const file = path.join(root, 'src/content/media/001.문양/index.md');
  fs.writeFileSync(file, '# 문양\n\n카테고리 집필 안내는 모달에 포함하지 않습니다.\n\n## [첫 **문양**](A.png)\n\n**설명**과 *강조*입니다.\n\n- 제작자: 이름\n- [원본](A.png)\n\n### 출처\n\n[다른 이미지](deeper/B.png)\n\n## [두 번째](deeper/B.png)\n\n두 번째 설명.\n\n## 작성 안내\n\n이 안내는 이미지 정보가 아닙니다.\n');
  const items = await syncMediaGallery(root);
  const first = items.find(item => item.source === 'media/001.문양/A.png');
  assert.equal(first.title, '첫 문양');
  assert.match(first.informationHtml, /<strong>설명<\/strong>/);
  assert.match(first.informationHtml, /<em>강조<\/em>/);
  assert.match(first.informationHtml, /href="\/generated\/content\/media\/001\.%EB%AC%B8%EC%96%91\/deeper\/B.png"/);
  assert.ok(!first.informationHtml.includes('두 번째 설명'));
  assert.ok(!first.informationHtml.includes('집필 안내'));
  assert.match(items.find(item => item.fileName === 'B.png').informationHtml, /두 번째 설명/);
  assert.equal(items.find(item => item.categoryKey === '002.일러스트').informationHtml, '');
  assert.equal(items.find(item => item.categoryKey === '002.일러스트').title, 'A');
  assert.equal(items.length, 3);
}));

test('index edits, privacy and deletion refresh metadata without regenerating image previews', () => fixture(async (root, image) => {
  await image('문양/A.png', 30, 40);
  const file = path.join(root, 'src/content/media/문양/index.md');
  fs.writeFileSync(file, '# 문양\n\n## [첫 이름](A.png)\n\n첫 설명');
  const [before] = await syncMediaGallery(root);
  const preview = path.join(root, 'public', before.previewUrl), time = fs.statSync(preview).mtimeMs;
  fs.writeFileSync(file, '# 문양\n\n## [바뀐 이름](A.png)\n\n바뀐 설명');
  const [after] = await syncMediaGallery(root);
  assert.equal(after.title, '바뀐 이름'); assert.match(after.informationHtml, /바뀐 설명/);
  assert.equal(after.previewUrl, before.previewUrl); assert.equal(fs.statSync(preview).mtimeMs, time);
  fs.writeFileSync(file, '---\npublished: false\n---\n## [비공개 이름](A.png)\n\n비공개 설명');
  const [privateInfo] = await syncMediaGallery(root);
  assert.equal(privateInfo.title, 'A'); assert.equal(privateInfo.informationHtml, '');
  fs.unlinkSync(file);
  const [removed] = await syncMediaGallery(root);
  assert.equal(removed.title, 'A'); assert.equal(removed.informationHtml, '');
  assert.equal(fs.statSync(preview).mtimeMs, time);
}));

test('image information rejects missing, hidden, external, cross-category and duplicate targets', () => fixture(async (root, image) => {
  await image('문양/A.png', 30, 40); await image('다른 분류/A.png', 30, 40);
  await image('문양/_drafts/private.png', 30, 40);
  const file = path.join(root, 'src/content/media/문양/index.md');
  for (const target of ['missing.png', '_drafts/private.png', 'https://example.com/A.png', '../다른%20분류/A.png', 'A.png#detail']) {
    fs.writeFileSync(file, `## [제목](${target})\n\n설명`);
    assert.throws(() => readMediaInformation(root), /existing public image within its category/);
  }
  fs.writeFileSync(file, '## [하나](A.png)\n\n설명\n\n## [둘](A.png)');
  assert.throws(() => readMediaInformation(root), /duplicate image information/);
}));

test('modal clones image information, clears stale content and preserves original controls', () => {
  const {items, dialog, parts} = clientFixture();
  const information = parts['[data-media-information]'];
  items[0].click();
  assert.equal(information.hidden, false); assert.equal(dialog.classes.has('has-information'), true);
  assert.equal(information.children[0].html, '<p>이미지 설명</p>');
  information.scrollTop = 200;
  parts['[data-media-close]'].click();
  assert.equal(information.hidden, true); assert.equal(information.children.length, 0);
  items[1].click();
  assert.equal(information.hidden, true); assert.equal(dialog.classes.has('has-information'), false);
  assert.equal(information.children.length, 0); assert.equal(information.scrollTop, 0);
});
