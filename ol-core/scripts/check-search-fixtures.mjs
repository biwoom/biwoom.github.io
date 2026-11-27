import assert from 'node:assert/strict';
import fs from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import { BRAND, sitePath } from '../../site-config.mjs';
import { buildOriginals, extractOriginalPassages } from './build-search-originals.mjs';
import * as searchData from '../src/lib/search.mjs';
import { findCatalogRecords, findOriginalPassages, searchLocationKey } from '../src/lib/search.mjs';

test('the catalogue ranks name, alias, prefix, and substring before limiting by type', () => {
  const record = (id, title, aliases, section = 'STORY') => ({ id, title, aliases, section, kind: 'tag', url: '/' + id + '/' });
  const records = [
    record('partial', '제따와나의 사리불'),
    record('prefix', '사리불의 생애'),
    record('alias', '장로', ['사리불', 'Sāriputta']),
    record('exact', '사리불'),
    record('other', '사리불', [], 'TEXT'),
  ];
  const ids = (text, type) => findCatalogRecords(records, text, type).map(row => row.id);
  assert.deepEqual(ids('사리불'.normalize('NFD'), 'STORY'), ['exact', 'alias', 'prefix', 'partial']);
  assert.deepEqual(ids(' SĀRIPUTTA '.normalize('NFD'), 'ALL'), ['alias']);
  assert.deepEqual(ids('사리불', 'TEXT'), ['other']);
  assert.deepEqual(ids(' ', 'ALL'), []);
});

test('original index takes visible text and rendered anchors from the public reader body', () => {
  const html = `
    <nav><p>外部</p></nav>
    <div data-search-originals-body>
      <p>先行段落</p>
      <h2 id="첫-절">첫 절</h2>
      <p>夫<em>無常</em>者遷流。&amp; <span hidden>秘文</span></p>
      <pre data-reader-original><code>色即是空</code></pre>
      <p data-pagefind-ignore>秘文</p>
      <ul><li><p id="별도">無常</p></li></ul>
    </div>
    <dialog><p>各註</p></dialog>`;
  assert.deepEqual(extractOriginalPassages(html), [
    ['', '先行段落'],
    ['첫-절', '夫無常者遷流。&'],
    ['첫-절', '色即是空'],
    ['별도', '無常'],
  ]);
  assert.deepEqual(extractOriginalPassages('<p>無常</p>'), []);
});

test('original lookup checks a continuous string and preserves visible matches and distinct anchors', () => {
  const make = (id, passages) => ({ id, title: '문헌', url: '/text/' + id + '/', section: 'TEXT', passages });
  const mixed = '한문'.normalize('NFD') + '\n  無常';
  const entries = [make('a', [
    ['첫 절', '夫' + mixed + '。'],
    ['첫 절', '無常은 같은 절입니다.'],
    ['둘째 절', '無常과 常無는 다릅니다.'],
    ['구두점', '無、常'],
    ['이체자', '神人'],
  ]), make('b', [['', '正是無常。']])];
  const hits = findOriginalPassages(entries, '無常');
  assert.equal(hits.length, 3);
  assert.equal(hits[0].url, '/text/a/#%EC%B2%AB%20%EC%A0%88');
  assert.deepEqual(hits[0].match, ['夫' + mixed.slice(0, -2), '無常', '。']);
  assert.equal(hits[2].url, '/text/b/');
  assert.equal(findOriginalPassages(entries, '한문 無常')[0].match[1], mixed);
  assert.equal(findOriginalPassages(entries, '神人').length, 0);
  assert.equal(findOriginalPassages(entries, '神人').length, 1);
  assert.notEqual(searchLocationKey(hits[0].url), searchLocationKey(hits[1].url));
  assert.equal(searchLocationKey('/text/b/'), searchLocationKey('/text/b'));
});

test('original build reads only public TEXT documents named in the catalogue', t => {
  const dist = fs.mkdtempSync(path.join(tmpdir(), 'biwoom-originals-'));
  t.after(() => fs.rmSync(dist, { recursive: true, force: true }));
  const write = (route, value) => {
    const file = path.join(dist, route);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, value);
  };
  write(searchData.searchPaths.catalog, JSON.stringify([
    { id: 'public', title: '공개 경론', kind: 'document', section: 'TEXT', url: '/text/public/' },
    { id: 'work', title: '공개 작품', kind: 'work', section: 'TEXT', url: '/text/work/' },
  ]));
  write('/text/public/index.html', '<div data-search-originals-body><p>無常</p></div>');
  write('/text/private/index.html', '<div data-search-originals-body><p>非公開標識</p></div>');
  write('/text/work/index.html', '<div data-search-originals-body><p>目錄標識</p></div>');
  assert.deepEqual(buildOriginals(dist).map(doc => doc.passages), [[['', '無常']]]);
  assert.doesNotMatch(fs.readFileSync(path.join(dist, searchData.searchPaths.originals), 'utf8'), /非公開標識|目錄標識/);
});

test('search modal waits for IME, discards stale results, and pages excerpts after filtering', async () => {
  const requests = [];
  const downloaded = [];
  const fetched = [];
  const catalog = [
    { id: 'same', kind: 'document', title: '새 질의', section: 'BLOG', url: '/blog/result-0/' },
    { id: 'error', kind: 'document', title: '본문 오류', section: 'BLOG', url: '/blog/catalogue-only/' },
  ];
  let completeOld;
  const pagefind = {
    options: async () => {},
    init: async () => {},
    async search(query, options) {
      requests.push([query, options?.filters.section]);
      if (query === '이전 질의') return new Promise(resolve => { completeOld = resolve; });
      if (query === '본문 오류') throw new Error('Unreachable bundle');
      const section = options?.filters.section ?? 'STORY';
      const results = Array.from({ length: 9 }, (_, index) => ({
        async data() {
          downloaded.push([section, index]);
          return { url: `/blog/result-${index}/`, meta: { section, title: `${query} ${index}` }, excerpt: '' };
        },
      }));
      return { results };
    },
  };
  class Element {
    handlers = {};
    dataset = {};
    isConnected = true;
    classList = { toggle() {} };
    setAttribute() {}
    querySelector() { return null; }
    querySelectorAll() { return []; }
    addEventListener(name, callback) { this.handlers[name] = callback; }
    fire(name, event = {}) { this.handlers[name]?.(event); }
    focus() { document.activeElement = this; }
  }
  const overlay = new Element(), input = new Element(), filters = new Element(), results = new Element();
  const trigger = new Element(), document = new Element();
  overlay.hidden = true;
  overlay.dataset = { searchCatalog: '/catalog', searchOriginals: '/originals', pagefindPath: '/pagefind' };
  overlay.querySelector = key => ({
    '#ol-search-input': input, '[data-search-filters]': filters, '#ol-search-results': results,
  })[key];
  document.querySelector = () => overlay;
  document.getElementById = () => trigger;
  trigger.focus();
  const module = { exports: {} };
  const imports = { '../search.mjs': searchData, '../site-config': { BRAND }, '../url': { url: sitePath }, '/pagefind': pagefind };
  const timers = new Map();
  let timerId = 0;
  const source = fs.readFileSync(new URL('../src/lib/client/search-modal.ts', import.meta.url), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(code, {
    module, exports: module.exports, document, HTMLElement: Element, HTMLAnchorElement: class {},
    require: name => { assert.ok(Object.hasOwn(imports, name), name); return imports[name]; },
    fetch: async url => {
      fetched.push(url);
      return { ok: true, json: async () => url === '/catalog' ? catalog : [] };
    },
    setTimeout: callback => { timers.set(++timerId, callback); return timerId; },
    clearTimeout: id => timers.delete(id),
  });
  module.exports.initSearchModal();
  const flush = async () => {
    for (const [id, callback] of timers) { timers.delete(id); callback(); }
    await new Promise(resolve => setImmediate(resolve));
  };
  const click = (target, key, value) => target.fire('click', {
    target: { closest: selector => selector === `[data-search-${key}]` ? { dataset: { [`search${key[0].toUpperCase()}${key.slice(1)}`]: value } } : null },
  });
  const type = async value => { input.value = value; input.fire('input'); await flush(); };
  trigger.fire('click');
  assert.equal(document.activeElement, input);

  input.fire('compositionstart');
  await type('이전 질의');
  assert.equal(requests.length, 0);
  input.fire('compositionend');
  await flush();
  assert.deepEqual(requests, [['이전 질의', undefined]]);
  await type('새 질의'.normalize('NFD'));
  assert.equal(requests.at(-1)[0], '새 질의');
  assert.equal(downloaded.length, 8);
  assert.equal(results.innerHTML.match(/href="\/blog\/result-0\/"/g)?.length, 1);
  completeOld({ results: [{ data: () => { assert.fail('A stale search requested excerpts'); } }] });
  await flush();
  assert.match(results.innerHTML, /새 질의/);
  assert.doesNotMatch(results.innerHTML, /이전 질의/);

  click(filters, 'section', 'BLOG');
  await flush();
  assert.deepEqual(requests.at(-1), ['새 질의', 'BLOG']);
  assert.deepEqual(downloaded.at(-1), ['BLOG', 7]);
  click(results, 'more', 'body');
  await flush();
  assert.deepEqual(downloaded.at(-1), ['BLOG', 8]);
  assert.deepEqual(fetched, ['/catalog']);

  await type('본문 오류');
  assert.match(results.innerHTML, /catalogue-only/);
  assert.match(results.innerHTML, /본문 검색을 불러올 수 없습니다/);
  click(filters, 'section', 'ALL');
  await type('無常');
  assert.deepEqual(fetched, ['/catalog', '/originals']);

  document.fire('keydown', { key: 'Escape', preventDefault() {} });
  assert.equal(overlay.hidden, true);
  assert.equal(document.activeElement, trigger);
});
