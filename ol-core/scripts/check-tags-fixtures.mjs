import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { validateInput } from './lib/content.mjs';

function evaluate(source, imports = {}, globals = {}) {
  const module = { exports: {} };
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(code, { module, exports: module.exports, require: name => {
    assert.ok(name in imports, `Unexpected import ${name}`); return imports[name];
  }, ...globals });
  return module.exports;
}
const tags = evaluate(fs.readFileSync('ol-core/src/lib/tags.ts', 'utf8'));
const pagination = evaluate(fs.readFileSync('ol-core/src/lib/client/paginated-list.ts', 'utf8'));

test('plain optional tag arrays are accepted; legacy prefixes and singular tag fields are rejected', () => {
  assert.doesNotThrow(() => validateInput({}));
  assert.doesNotThrow(() => validateInput({ tags: [] }));
  assert.doesNotThrow(() => validateInput({ tags: ['수메다', '수밋따', '아라와띠'] }));
  assert.throws(() => validateInput({ tags: ['인물/수메다'] }), /plain names/);
  assert.throws(() => validateInput({ tag: '수메다, 수밋따' }), /unknown/);
});

test('blog tag counts count posts, not duplicate values, and filters match complete names', () => {
  const counts = JSON.parse(JSON.stringify(tags.getBlogTags([
    { tags: ['수메다', '수메다', '수밋따'] }, { tags: ['수메다'] }, { tags: [] },
  ])));
  assert.deepEqual(counts, [{ tag: '수메다', count: 2 }, { tag: '수밋따', count: 1 }]);
  assert.equal(tags.matchesBlogFilters({ tags: ['수메다보살'], year: '2026' }, '수메다', 'all'), false);
  assert.equal(tags.matchesBlogFilters({ tags: ['수메다'], year: '2025' }, '수메다', '2026'), false);
  assert.equal(tags.matchesBlogFilters({ tags: [], year: '2026' }, '', 'all'), true);
});

class Element {
  hidden = false;
  textContent = '';
  attributes = {};
  handlers = {};
  classes = new Set();
  constructor(dataset = {}) { this.dataset = dataset; }
  classList = { toggle: (name, on) => on ? this.classes.add(name) : this.classes.delete(name) };
  setAttribute(name, value) { this.attributes[name] = value; }
  toggleAttribute(name, on) { if (on) this.attributes[name] = ''; else delete this.attributes[name]; }
  addEventListener(type, callback) { this.handlers[type] = callback; }
  click() { this.handlers.click?.(); }
}

test('blog UI combines tag/year filters, resets pagination, keeps untagged posts in All, and supports tag links', () => {
  const post = (tags, year, category = '일지') => new Element({ tags: JSON.stringify(tags), year, category });
  const posts = [
    ...Array.from({ length: 7 }, () => post(['수메다'], '2026')),
    post(['수메다'], '2025', '교학'), post([], '2026', '수행'), post(['수메다보살'], '2026', '교학'),
    post(['all'], '2026'), post(['가, 나', '인용 "태그"'], '2026', '교학'),
  ];
  const tagButtons = ['', '수메다', '수메다보살', 'all', '가, 나', '인용 "태그"'].map(blogTag => new Element({ blogTag }));
  const categoryButtons = ['', '교학', '수행', '일지'].map(blogCategory => new Element({ blogCategory }));
  const yearButtons = ['all', '2026', '2025'].map(year => new Element({ year }));
  const ids = Object.fromEntries(['blog-no-results', 'blog-filter-status', 'blog-loadmore-wrap', 'blog-loadmore-remaining'].map(id => [id, new Element()]));
  const more = new Element();
  const listeners = {};
  const location = { href: 'https://example.test/blog/?tag=' + encodeURIComponent('수메다'), search: '?tag=' + encodeURIComponent('수메다') };
  const window = {
    location,
    history: { replaceState(_state, _title, href) { location.href = String(href); location.search = new URL(href).search; } },
    addEventListener(type, callback) { listeners[type] = callback; },
  };
  const document = {
    querySelectorAll(selector) {
      if (selector === '#blog-posts .ol-post') return posts;
      if (selector === '#blog-chips [data-blog-tag]') return tagButtons;
      if (selector === '#blog-categories [data-blog-category]') return categoryButtons;
      if (selector === '.ol-blog-archive-btn') return yearButtons;
      throw new Error(selector);
    },
    getElementById(id) { return ids[id] ?? null; },
    querySelector(selector) { assert.equal(selector, '#blog-loadmore-btn'); return more; },
  };
  const source = fs.readFileSync('ol-core/src/pages/blog/index.astro', 'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
  evaluate(source, { '../../lib/client/paginated-list': pagination, '../../lib/tags': tags }, { window, document, URL, URLSearchParams });
  const visible = () => posts.filter(post => !post.hidden).length;
  const status = () => ids['blog-filter-status'].textContent;
  const tagButton = value => tagButtons.find(button => button.dataset.blogTag === value);
  const yearButton = value => yearButtons.find(button => button.dataset.year === value);

  assert.equal(visible(), 6);
  assert.equal(status(), '8개 글');
  assert.equal(tagButton('수메다').attributes['aria-pressed'], 'true');
  assert.equal(ids['blog-loadmore-wrap'].hidden, false);
  more.click(); assert.equal(visible(), 8); assert.equal(ids['blog-loadmore-wrap'].hidden, true);
  yearButton('2025').click(); assert.equal(visible(), 1); assert.equal(status(), '1개 글');
  tagButton('수메다보살').click(); assert.equal(visible(), 0); assert.equal(ids['blog-no-results'].hidden, false);
  yearButton('all').click(); assert.equal(visible(), 1); assert.equal(ids['blog-no-results'].hidden, true);
  tagButton('').click(); assert.equal(visible(), 6); assert.equal(status(), '12개 글');
  more.click(); assert.equal(visible(), 12); assert.equal(posts[8].hidden, false);
  tagButton('all').click(); assert.equal(visible(), 1); assert.equal(posts[10].hidden, false);
  tagButton('가, 나').click(); assert.equal(visible(), 1);
  assert.equal(new URL(location.href).searchParams.get('tag'), '가, 나');
  tagButton('인용 "태그"').click(); assert.equal(visible(), 1);
  location.search = '?tag=' + encodeURIComponent('없는 태그'); listeners.popstate();
  assert.equal(visible(), 0); assert.equal(status(), '0개 글');
  tagButton('').click(); assert.equal(visible(), 6); assert.equal(new URL(location.href).searchParams.has('tag'), false);
  const categoryButton = value => categoryButtons.find(button => button.dataset.blogCategory === value);
  categoryButton('교학').click(); assert.equal(visible(), 3); assert.equal(status(), '3개 글');
  assert.equal(categoryButton('교학').attributes['aria-pressed'], 'true');
  assert.equal(new URL(location.href).searchParams.get('category'), '교학');
  categoryButton('일지').click(); assert.equal(visible(), 6); more.click(); assert.equal(visible(), 8);
  categoryButton('수행').click(); assert.equal(visible(), 1); assert.equal(posts[8].hidden, false);
  tagButton('수메다').click(); assert.equal(visible(), 0); assert.equal(ids['blog-no-results'].hidden, false);
  assert.equal(new URL(location.href).searchParams.get('category'), '수행');
  assert.equal(new URL(location.href).searchParams.get('tag'), '수메다');
  location.search = '?category=' + encodeURIComponent('교학') + '&tag=' + encodeURIComponent('수메다'); listeners.popstate();
  assert.equal(visible(), 1); assert.equal(posts[7].hidden, false);
  yearButton('2026').click(); assert.equal(visible(), 0);
  yearButton('all').click(); assert.equal(visible(), 1);
  categoryButton('').click(); assert.equal(visible(), 6); assert.equal(status(), '8개 글');
  assert.equal(new URL(location.href).searchParams.has('category'), false);

});


test('blog categories count published input posts, sort by folder order and retain uncategorized posts', () => {
  const result=JSON.parse(JSON.stringify(tags.getBlogCategories([
    {category:'일지',categoryOrder:6}, {category:'교학',categoryOrder:1},
    {category:'일지',categoryOrder:6}, {category:'수행',categoryOrder:2},
    {category:'',categoryOrder:Number.MAX_SAFE_INTEGER},
  ])));
  assert.deepEqual(result,[{category:'교학',count:1},{category:'수행',count:1},{category:'일지',count:2},{category:'미분류',count:1}]);
  assert.equal(tags.matchesBlogFilters({tags:['수메다'],year:'2026',category:'교학'},'수메다','2026','교학'),true);
  assert.equal(tags.matchesBlogFilters({tags:['수메다'],year:'2026',category:'교학 연구'},'수메다','2026','교학'),false);
  assert.equal(tags.matchesBlogFilters({tags:[],year:'2026',category:''},'','all','미분류'),true);
});
