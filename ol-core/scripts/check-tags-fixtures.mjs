import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { validateInput } from './lib/content.mjs';
import { indexStoryTags, readStoryTags, storyTagInitial, storyTagInitials, storyTagPath, storyTagSearchKey } from './lib/story-tags.mjs';

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

test('STORY typed tags coexist with plain tags and normalize names; aliases need a local canonical tag', () => {
  const input = {
    tags: ['불전'],
    personTags: [' 사리불 ', '사리불'.normalize('NFD')],
    aliasTags: { person: { 사리불: ['Sa\u0304riputta', '사리뿟따'] } },
  };
  assert.doesNotThrow(() => validateInput(input));
  assert.deepEqual(readStoryTags(input), [{ type: 'person', label: '사리불', aliases: ['Sāriputta', '사리뿟따'] }]);
  assert.equal(storyTagSearchKey(' SĀRIPUTTA '), storyTagSearchKey(input.aliasTags.person.사리불[0]));
  assert.throws(() => validateInput({ placeTags: '라자가하' }), /must be an array/);
  assert.throws(() => validateInput({ personTags: ['인물/사리불'] }), /plain tag names/);
  assert.throws(() => validateInput({ aliasTags: input.aliasTags }), /must also appear/);
  assert.throws(() => validateInput({ aliasTags: { other: {} } }), /Unknown aliasTags type/);
});

test('STORY tag catalog merges aliases across series and rejects competing names within each type', () => {
  const first = { source: 'first.md', storyTags: readStoryTags({
    personTags: ['사리불'], aliasTags: { person: { 사리불: ['Sāriputta'] } },
  }) };
  const second = { source: 'second.md', storyTags: readStoryTags({
    personTags: ['사리불'], topicTags: ['사리불'],
    aliasTags: { person: { 사리불: ['사리뿟따', 'Sāriputta'] } },
  }) };
  const catalog = indexStoryTags([first, second]);
  const person = catalog.find(tag => tag.type === 'person');
  assert.equal(storyTagPath(person), '/story/tags/person/' + encodeURIComponent('사리불') + '/');
  assert.deepEqual(person.aliases, ['Sāriputta', '사리뿟따']);
  assert.deepEqual(person.documents, [first, second]);
  assert.deepEqual(catalog.find(tag => tag.type === 'topic').documents, [second]);
  const conflict = { source: 'conflict.md', storyTags: readStoryTags({ personTags: ['sāriputta'] }) };
  assert.throws(() => indexStoryTags([first, conflict]), /first\.md.*conflict\.md/);
});

test('STORY tag initials group syllables, doubled consonants, standalone jamo and other names', () => {
  assert.deepEqual(storyTagInitials.map(storyTagInitial), storyTagInitials);
  assert.deepEqual(['깟사빠', '따라', '빨리어', '쌍의 품', '짜따까'].map(storyTagInitial), ['가', '다', '바', '사', '자']);
  assert.equal(storyTagInitial(' ㄲ '), '가');
  assert.equal(storyTagInitial('한글'.normalize('NFD')), '하');
  assert.equal(storyTagInitial('Sāriputta'), 'other');
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
  replaceChildren() {}
}

test('STORY tag explorer filters and pages cards, loads previews on demand, and moves them between layouts', async () => {
  const { initStoryTagExplorer } = evaluate(fs.readFileSync('ol-core/src/lib/client/story-tag-explorer.ts', 'utf8'), {
    '../../../scripts/lib/story-tags.mjs': { storyTagSearchKey },
    './paginated-list': pagination,
  }, { URL, URLSearchParams, AbortController, DOMParser: class {
    parseFromString(text) { return { querySelector: () => ({ content: { cloneNode: () => text } }) }; }
  } });
  const node = (dataset) => Object.assign(new Element(dataset), {
    focused: false,
    removeAttribute(name) { delete this.attributes[name]; },
    append(child) { child.parent = this; },
    replaceChildren(...children) { this.children = children; },
    focus() { this.focused = true; },
  });
  const card = (type, ...names) => {
    const item = node({ type, initial: storyTagInitial(names[0]), storyTagEntry: JSON.stringify(names) });
    const link = node();
    link.href = `https://example.test/hub/story/tags/${type}/${encodeURIComponent(names[0])}/`;
    link.closest = selector => selector === '[data-story-tag-card]' ? link : item;
    item.link = link;
    return item;
  };
  const person = card('person', '사리불', 'Sāriputta');
  const place = card('place', '테스트 장소', 'Sāriputta');
  const cards = [person, place, ...Array.from({ length: 29 }, (_, i) => card('topic', '주제 ' + i))];
  const query = node();
  const search = node();
  query.value = '';
  search.querySelector = () => query;
  const button = (type) => node({ storyTagType: type });
  const [all, people, places] = ['', 'person', 'place'].map(button);
  const filters = node();
  filters.querySelectorAll = () => [all, people, places];
  const initials = node();
  const [allInitials, sa, ja, ta] = ['', '사', '자', '타'].map(storyTagInitial => node({ storyTagInitial }));
  initials.querySelectorAll = () => [allInitials, sa, ja, ta];
  const status = node(), empty = node(), reset = node(), list = node();
  const desktop = node(), placeholder = node(), preview = node(), dialog = node(), mobile = node();
  const previewBody = node(), fullLink = node();
  const more = node(), remaining = node(), loadMore = node();
  list.querySelectorAll = () => cards;
  dialog.querySelector = () => mobile;
  dialog.showModal = () => { dialog.open = true; };
  dialog.close = () => { dialog.open = false; dialog.handlers.close(); };
  const selectors = {
    'story-tag-filters': filters, 'story-tag-status': status, 'story-tag-empty': empty,
    'story-tag-initials': initials,
    'story-tag-reset': reset, 'story-tag-list': list, 'story-tag-desktop': desktop,
    'story-tag-placeholder': placeholder, 'story-tag-preview': preview, 'story-tag-dialog': dialog,
    'story-tag-preview-body': previewBody, 'story-tag-full': fullLink,
    'loadmore-wrap': more, 'loadmore-button': loadMore, 'loadmore-remaining': remaining,
  };
  const root = node({ pageSize: '30' });
  root.querySelector = selector => selectors[selector.slice(6, -1)];
  const document = { querySelector: selector => selector.includes('directory') ? root : search };
  const wide = node();
  wide.matches = true;
  const requests = [];
  const browser = Object.assign(node(), {
    location: new URL('https://example.test/hub/story/tags/?utm_source=test'),
    history: { replaceState(_, __, url) { browser.location = new URL(url); } },
    matchMedia: () => wide,
    async fetch(href, { signal }) {
      requests.push({ href, signal });
      return { ok: true, text: async () => '사리불' };
    },
  });
  initStoryTagExplorer(document, browser);
  assert.equal(requests.length, 0);
  assert.equal(cards.filter(card => !card.hidden).length, 30);
  assert.equal(remaining.textContent, '(1)');
  loadMore.click();
  assert.ok(cards.every(card => !card.hidden));
  ja.click();
  assert.equal(cards.filter(card => !card.hidden).length, 29);
  assert.equal(browser.location.searchParams.get('initial'), '자');
  allInitials.click();
  assert.equal(cards.filter(card => !card.hidden).length, 30);
  query.value = 'SA\u0304RIPUTTA';
  query.handlers.input();
  assert.equal(status.textContent, '2개 태그');
  people.click();
  ta.click();
  assert.equal(status.textContent, '0개 태그', 'alias search uses the initial of the canonical name');
  sa.click();
  assert.deepEqual(cards.filter(card => !card.hidden), [person]);
  assert.equal(browser.location.searchParams.get('type'), 'person');
  assert.equal(browser.location.searchParams.get('utm_source'), 'test');
  const select = async (extra = {}) => {
    const event = { button: 0, target: person.link, preventDefault() { this.defaultPrevented = true; }, ...extra };
    await list.handlers.click(event);
    return event.defaultPrevented;
  };
  assert.equal(await select({ metaKey: true }), undefined, 'modifier click follows the original href');
  assert.equal(requests.length, 0);
  assert.equal(await select(), true);
  assert.deepEqual(previewBody.children, ['사리불']);
  assert.equal(fullLink.href, person.link.href);
  assert.equal(preview.parent, desktop);
  assert.equal(preview.focused, true);
  wide.matches = false;
  wide.handlers.change();
  assert.equal(preview.parent, mobile);
  assert.ok(!dialog.open);
  await select();
  assert.equal(requests[0].signal.aborted, true);
  assert.equal(dialog.open, true);
  dialog.close();
  assert.equal(person.link.attributes['aria-current'], undefined);
  await select();
  wide.matches = true;
  wide.handlers.change();
  assert.equal(dialog.open, false);
  assert.equal(preview.parent, desktop);
  preview.handlers.keydown({ key: 'Escape' });
  assert.equal(person.link.focused, true);
  browser.fetch = async () => ({ ok: false, text: async () => "" });
  await select();
  assert.equal(previewBody.textContent, '미리보기를 불러오지 못했습니다.');
  assert.equal(fullLink.href, person.link.href);
  places.click();
  ta.click();
  assert.deepEqual(cards.filter(card => !card.hidden), [place]);
  reset.click();
  assert.equal(cards.filter(card => !card.hidden).length, 30);
  assert.equal(browser.location.searchParams.has('q'), false);
  assert.equal(browser.location.searchParams.has('initial'), false);
  browser.location = new URL('https://example.test/hub/story/tags/?type=person&initial=사&q=Sāriputta');
  browser.handlers.popstate();
  assert.equal(sa.attributes['aria-pressed'], 'true');
  assert.deepEqual(cards.filter(card => !card.hidden), [person]);
});

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
  const ids = Object.fromEntries(['blog-category-information', 'blog-no-results', 'blog-filter-status', 'blog-loadmore-wrap', 'blog-loadmore-remaining'].map(id => [id, new Element()]));
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
      if (selector === 'template[data-category-information]') return [];
      throw new Error(selector);
    },
    getElementById(id) { return ids[id] ?? null; },
    querySelector(selector) { assert.equal(selector, '#blog-loadmore-btn'); return more; },
  };
  const source = fs.readFileSync('ol-core/src/components/blog/BlogPosts.astro', 'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
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
