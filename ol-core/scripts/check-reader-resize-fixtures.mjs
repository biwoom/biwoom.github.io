import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

class Element {
  attrs = new Map(); handlers = {}; props = {}; hidden = false; visible = true;
  style = { setProperty: (key, value) => { this.props[key] = value; } };
  setAttribute(key, value) { this.attrs.set(key, value); }
  removeAttribute(key) { this.attrs.delete(key); }
  addEventListener(type, fn) { (this.handlers[type] ??= []).push(fn); }
  fire(type, props = {}) {
    const event = { type, button: 0, isPrimary: true, pointerId: 1, clientX: 900,
      preventDefault() { this.prevented = true; }, ...props };
    this.handlers[type]?.forEach(fn => fn(event)); return event;
  }
  getClientRects() { return this.visible ? [{}] : []; }
  getBoundingClientRect() { return { width: this.width }; }
  focus() { this.focused = true; }
  setPointerCapture(id) { this.pointer = id; }
  hasPointerCapture(id) { return this.pointer === id; }
  releasePointerCapture() { this.pointer = undefined; this.fire('lostpointercapture'); }
}

function setup({ section = 'text', saved = null, blocked = false } = {}) {
  const root = new Element(), grid = new Element(), rail = new Element(), left = new Element(), handle = new Element();
  const page = new Element(), document = new Element(), window = new Element(), wide = new Element();
  grid.width = 1360; left.width = 240; wide.matches = true;
  handle.parentElement = rail; handle.closest = () => root;
  root.querySelector = () => grid; grid.querySelector = () => left;
  document.querySelector = () => handle; document.documentElement = page;
  window.matchMedia = () => wide;
  let value = saved, writes = 0;
  const localStorage = {
    getItem() { if (blocked) throw Error('blocked'); return value; },
    setItem(key, next) { if (blocked) throw Error('blocked'); assert.equal(key, 'ol-reader-aid-width'); value = next; writes++; },
  };
  // Browser layout is external to the controller: emulate the CSS-constrained dock.
  Object.defineProperty(rail, 'width', { get: () => Math.max(240, Math.min(
    parseFloat(root.props['--ol-reader-aid-preferred-width']), 520, grid.width - (left.visible ? left.width : 0) - 480,
  )) });
  const callbacks = [], frames = [];
  class Observer { constructor(fn) { callbacks.push(fn); } observe() {} }
  const module = { exports: {} };
  const source = ts.transpileModule(fs.readFileSync('ol-core/src/lib/client/reader-panel-resize.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(source, { module, exports: module.exports, document, window, localStorage,
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
    MutationObserver: Observer, ResizeObserver: Observer,
    requestAnimationFrame: fn => { frames.push(fn); return frames.length; },
  });
  module.exports.initReaderPanelResize();
  const flush = () => { while (frames.length) frames.shift()(); };
  const layout = () => { callbacks.forEach(fn => fn()); flush(); };
  const pref = () => Number.parseFloat(root.props['--ol-reader-aid-preferred-width']);
  return { root, grid, rail, left, handle, page, document, window, wide, flush, layout, pref,
    stored: () => value, writes: () => writes,
    focus: on => { rail.visible = !on; root[on ? 'setAttribute' : 'removeAttribute'](`data-${section}-focus`, ''); layout(); },
  };
}

for (const section of ['text', 'story']) {
  test(`${section}: pointer capture resizes, clamps and commits only on release, including the last unpainted move`, () => {
    const h = setup({ section });
    h.handle.fire('pointerdown'); assert.equal(h.handle.pointer, 1); assert.ok(h.handle.focused);
    assert.ok(h.page.attrs.has('data-reader-panel-dragging'));
    h.handle.fire('pointermove', { clientX: 760 }); h.flush();
    assert.equal(h.rail.width, 440); assert.equal(h.writes(), 0);
    assert.equal(h.handle.attrs.get('aria-valuenow'), '440');
    h.handle.fire('pointerup', { clientX: 700 });
    assert.equal(h.rail.width, 500); assert.equal(h.stored(), '500');
    assert.equal(h.handle.pointer, undefined); assert.ok(!h.page.attrs.has('data-reader-panel-dragging'));
    h.handle.fire('pointerdown'); h.handle.fire('pointerup', { clientX: 0 });
    assert.equal(h.rail.width, 520);
    h.handle.fire('pointerdown'); h.handle.fire('pointerup', { clientX: 2000 });
    assert.equal(h.rail.width, 240);
    h.handle.fire('dblclick'); assert.equal(h.rail.width, 300); assert.equal(h.stored(), '300');
  });

  test(`${section}: focus, modal breakpoint, cancellation and print preserve the preferred width and clean capture`, () => {
    const h = setup({ section, saved: '500' });
    h.handle.fire('pointerdown'); h.handle.fire('pointermove', { clientX: 1000 }); h.flush();
    h.focus(true); assert.ok(h.handle.hidden); assert.equal(h.pref(), 500); assert.equal(h.writes(), 0);
    assert.equal(h.handle.pointer, undefined); assert.ok(!h.page.attrs.has('data-reader-panel-dragging'));
    h.focus(false); assert.equal(h.rail.width, 500); assert.equal(h.handle.hidden, false);
    h.handle.fire('pointerdown'); h.handle.fire('pointermove', { clientX: 800 });
    h.wide.matches = false; h.wide.fire('change'); h.flush();
    assert.ok(h.handle.hidden); assert.equal(h.pref(), 500); assert.equal(h.writes(), 0);
    h.wide.matches = true; h.wide.fire('change'); assert.equal(h.handle.hidden, false);
    for (const event of ['pointercancel', 'lostpointercapture']) {
      h.handle.fire('pointerdown'); h.handle.fire('pointermove', { clientX: 1000 }); h.flush();
      h.handle.fire(event); assert.equal(h.pref(), 500); assert.equal(h.writes(), 0);
    }
    h.window.fire('beforeprint'); assert.ok(h.handle.hidden);
    h.window.fire('afterprint'); assert.equal(h.handle.hidden, false); assert.equal(h.pref(), 500);
  });
}

test('keyboard sizing, temporary body limits and left-list changes retain the chosen preference', () => {
  const h = setup({ saved: '520' });
  h.grid.width = 1120; h.layout();
  assert.equal(h.rail.width, 400); assert.equal(h.pref(), 520);
  assert.equal(h.handle.attrs.get('aria-valuemax'), '400');
  h.handle.fire('pointerdown'); h.handle.fire('pointerup'); assert.equal(h.stored(), '520');
  h.grid.width = 1360; h.window.fire('resize'); assert.equal(h.rail.width, 520);
  h.handle.fire('keydown', { key: 'Home' }); assert.equal(h.rail.width, 240);
  h.handle.fire('keydown', { key: 'ArrowLeft' }); assert.equal(h.rail.width, 256);
  h.handle.fire('keydown', { key: 'ArrowRight', shiftKey: true }); assert.equal(h.rail.width, 240);
  h.handle.fire('keydown', { key: 'End' }); assert.equal(h.rail.width, 520);
  h.grid.width = 1120; h.layout(); h.handle.fire('keydown', { key: 'End' }); assert.equal(h.stored(), '400');
  h.left.visible = false; h.layout(); assert.equal(h.handle.attrs.get('aria-valuemax'), '520');
  h.handle.fire('keydown', { key: 'Enter' }); assert.equal(h.rail.width, 300);
  const writes = h.writes(); h.handle.fire('keydown', { key: 'ArrowLeft', ctrlKey: true }); assert.equal(h.writes(), writes);
  h.handle.fire('pointerdown'); h.handle.fire('pointermove', { clientX: 760 }); h.flush();
  h.handle.fire('keydown', { key: 'Escape' }); assert.equal(h.rail.width, 300); assert.equal(h.writes(), writes);
});

test('invalid or unavailable storage falls back; pre-body initialization shares the same bounded preference', () => {
  const source = fs.readFileSync('ol-core/src/layouts/BaseLayout.astro', 'utf8');
  const script = source.match(/<script is:inline data-reader-panel-init>([\s\S]*?)<\/script>/);
  assert.ok(script && script.index < source.indexOf('<body'));
  for (const [saved, expected] of [[null,300], ['520',520], ['240',240], ['410',410], ['bad',300], ['800',300], ['-1',300]]) {
    const h = setup({ saved }); assert.equal(h.pref(), expected);
    const page = new Element();
    vm.runInNewContext(script[1], { document: { documentElement: page }, localStorage: { getItem: () => saved } });
    assert.equal(page.props['--ol-reader-aid-preferred-width'], `${expected}px`);
  }
  const h = setup({ blocked: true });
  h.handle.fire('keydown', { key: 'ArrowLeft' }); assert.equal(h.rail.width, 316);
  const page = new Element();
  vm.runInNewContext(script[1], { document: { documentElement: page }, localStorage: { getItem() { throw Error('blocked'); } } });
  assert.equal(page.props['--ol-reader-aid-preferred-width'], '300px');
});
