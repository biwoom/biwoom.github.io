import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { prepare } from "./prepare-content.mjs";
import { syncAssets } from "./sync-content-assets.mjs";
import { validate } from "./check-content.mjs";
import { mediaEntries, normalize, markdownTree, textOf, readRegistry, publicationDay, activeRedirects, resolveAlias } from "./lib/content.mjs";
import remarkContent, {resolveReference} from "./remark-content.mjs";
import {watchContent} from "./lib/watch-content.mjs";
import {EventEmitter} from "node:events";
import { PROJECT_ROOT } from './lib/paths.mjs';
const original = PROJECT_ROOT, rel = 'text/001.C/001.W/001.P/001.A.md';
function fixture(fn) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(),'ol-transition-'));
  const write = (relative,body) => {const p=path.join(root,'content',relative);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,body);return p;};
  fs.writeFileSync(path.join(root,'content-registry.json'),JSON.stringify({version:1,files:{},folders:{},redirects:{},aliases:{}}));
  try {return fn(root,write);} finally {fs.rmSync(root,{recursive:true,force:true});}
}
test('private assets are excluded and stale outputs are removed, shared public references survive',()=>fixture((root,write)=>{
 const intro='blog/private/index.md', asset='blog/private/assets/secret.pdf';
 write(intro,'# Public');write(asset,'secret');write('blog/_notes/secret.pdf','secret');write('blog/_assets/shared.png','image');
 write('blog/loose.md','---\npublished: false\n---\n# Private\n![private](./_assets/shared.png)');
 prepare(root);syncAssets(root);assert.ok(fs.existsSync(path.join(root,'ol-core/public/generated/content',asset)));
 write(intro,'---\npublished: false\n---\n# Private');prepare(root);syncAssets(root);
 assert.equal(fs.existsSync(path.join(root,'ol-core/public/generated/content',asset)),false);
 assert.equal(fs.existsSync(path.join(root,'ol-core/public/generated/content/blog/_notes/secret.pdf')),false);
 assert.equal(fs.existsSync(path.join(root,'ol-core/public/generated/content/blog/_assets/shared.png')),false);
 write('blog/public.md','# Public\n![shared](./_assets/shared.png)');prepare(root);syncAssets(root);
 assert.ok(fs.existsSync(path.join(root,'ol-core/public/generated/content/blog/_assets/shared.png')));
}));
test('late introduction uses the series URL and relative links resolve there',()=>fixture((root,write)=>{
 write(rel,'# A');const before=prepare(root),intro='text/001.C/001.W/index.md';write(intro,'# Work');const r=prepare(root);
 assert.equal(r.files[intro].url,before.folders['text/001.C/001.W'].url);
 assert.equal(resolveReference(rel,'../index.md',r,root),r.files[intro].url);
 assert.deepEqual(validate(root),[]);
}));
test('TOC suppression preserves following lower-level headings and prose',()=>{
 for (const suffix of ['### 본문\n\n살아 있는 본문','일반 설명 문단']) {
 const tree=markdownTree('# 제목\n\n## 목차\n\n- [본문](#본문)\n\n'+suffix);
 remarkContent()(tree,{path:path.join(original,'content/blog/example.md')});
 assert.match(textOf(tree),/살아 있는 본문|일반 설명 문단/);assert.equal(tree.children.some(n=>n.type==='list'),false);
 }
 const tree=markdownTree('# 제목\n\n## 목차\n\n일반 본문');remarkContent()(tree,{path:path.join(original,'content/blog/example.md')});assert.match(textOf(tree),/목차일반 본문/);
});
test('code examples cannot supply the document title',()=>fixture((root,write)=>{
 const body='```md\n# Wrong\n```\n\n# **Right**\n\nSummary';write(rel,body);const r=prepare(root);assert.equal(normalize(rel,body,r,root).title,'Right');
}));
test('manual moves flatten old aliases and reject copies',()=>fixture((root,write)=>{
 write(rel,'# A');prepare(root);const b=rel.replace('001.A','002.B'),c=rel.replace('001.A','003.C');fs.renameSync(path.join(root,'content',rel),write(b,'# A'));prepare(root);
 fs.renameSync(path.join(root,'content',b),write(c,'# A\nedit'));fs.appendFileSync(path.join(root,'content',c),'edited');
 execFileSync(process.execPath,[path.join(original,'ol-core/scripts/content-move.mjs'),b,c,'--root',root],{cwd:root});const r=readRegistry(root);assert.equal(resolveAlias(rel,r),c);assert.equal(resolveReference(rel,'001.A.md',r,root),r.files[c].url);
 write(b,'# copy');const d=rel.replace('001.A','004.D');write(d,'# D');assert.throws(()=>execFileSync(process.execPath,[path.join(original,'ol-core/scripts/content-move.mjs'),c,d,'--root',root],{cwd:root,stdio:'pipe'}));
}));
test('missing registry requires explicit initialization; invalid inputs fail early',()=>fixture((root,write)=>{
 fs.unlinkSync(path.join(root,'content-registry.json'));assert.throws(()=>prepare(root),/restore/);
 execFileSync(process.execPath,[path.join(original,'ol-core/scripts/prepare-content.mjs'),'--init','--root',root],{cwd:root});
 for (const field of ['title: 123','description: []','rightsHolder: false','tags: text','published: yes','date: nonsense','entities: []']) {
 write(rel,`---\n${field}\n---\n# A`);assert.ok(validate(root).length,field);
 }
 assert.equal(publicationDay(new Date('2026-10-29T16:00:00Z')),'2026-10-30');
}));
test('deleted redirects are not emitted; thumbnails and route conflicts are validated',()=>fixture((root,write)=>{
 write(rel,'# A');let r=prepare(root);r.redirects['/old/']=r.files[rel].url;fs.writeFileSync(path.join(root,'content-registry.json'),JSON.stringify(r));assert.ok(activeRedirects(r,root)['/old/']);fs.unlinkSync(path.join(root,'content',rel));assert.deepEqual(activeRedirects(r,root),{});
 write(rel,'---\nthumbnailAsset: missing.png\n---\n# A');assert.ok(validate(root).some(e=>e.includes('missing local target')));
 write(rel,'# A');r=prepare(root);r.files[rel].url=r.folders['text/001.C/001.W'].url;fs.writeFileSync(path.join(root,'content-registry.json'),JSON.stringify(r));assert.ok(validate(root).some(e=>e.includes('duplicate public URL')));
}));
test('watch invalidation includes Markdown and folder changes, ignores personal state',async()=>{
 const watcher=new EventEmitter();watcher.add=()=>{};let count=0;watchContent(watcher,async()=>{count++;});
 watcher.emit('all','change',path.resolve('content/text/W/index.md'));watcher.emit('all','addDir',path.resolve('content/text/New'));
 await new Promise(r=>setTimeout(r,400));assert.equal(count,1);
 watcher.emit('all','change',path.resolve('content/.obsidian/workspace.json'));await new Promise(r=>setTimeout(r,350));assert.equal(count,1);watcher.emit('close');
});

test('watch refreshes never overlap and recover after a failed refresh', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const watcher = new EventEmitter(); watcher.add = () => {};
  let rejectFirst, calls = 0, active = 0, maximum = 0;
  const errors = [];
  const dispose = watchContent(watcher, async () => {
    calls++; active++; maximum = Math.max(maximum, active);
    try {
      if (calls === 1) await new Promise((_resolve, reject) => { rejectFirst = reject; });
    } finally { active--; }
  }, error => errors.push(error.message));
  t.after(dispose);
  const change = () => watcher.emit('all', 'change', path.join(original, 'content/text/W/index.md'));
  const flush = () => new Promise(resolve => setImmediate(resolve));
  change(); t.mock.timers.tick(250); await flush();
  change(); change(); t.mock.timers.tick(250); await flush();
  assert.equal(calls, 1);
  rejectFirst(new Error('temporary read failure')); await flush();
  assert.equal(calls, 2); assert.equal(maximum, 1);
  assert.deepEqual(errors, ['temporary read failure']);
  change(); t.mock.timers.tick(250); await flush();
  assert.equal(calls, 3);
});

test('watch disposal removes listeners and cancels queued work after an active refresh', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const watcher = new EventEmitter(); watcher.add = () => {};
  let release, calls = 0;
  const dispose = watchContent(watcher, async () => {
    calls++;
    await new Promise(resolve => { release = resolve; });
  });
  t.after(dispose);
  const change = () => watcher.emit('all', 'addDir', path.join(original, 'content/text/New'));
  const flush = () => new Promise(resolve => setImmediate(resolve));
  change(); t.mock.timers.tick(250); await flush();
  change(); t.mock.timers.tick(250); await flush();
  change(); watcher.emit('close');
  release(); t.mock.timers.tick(250); await flush();
  assert.equal(calls, 1);
  assert.equal(watcher.listenerCount('all'), 0);
  assert.equal(watcher.listenerCount('close'), 0);
});

test('asset watching excludes registry feedback, outside paths and personal state', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const watcher = new EventEmitter(); let watched; watcher.add = files => { watched = files; };
  let calls = 0;
  const dispose = watchContent(watcher, async () => { calls++; }, assert.fail, { includeRegistry: false, delay: 200 });
  t.after(dispose);
  for (const relative of ['content-registry.json', 'content/.obsidian/workspace.json', 'content-sibling/file.md']) {
    watcher.emit('all', 'change', path.join(original, relative));
  }
  t.mock.timers.tick(200); await new Promise(resolve => setImmediate(resolve));
  assert.equal(calls, 0);
  assert.deepEqual(watched, [path.join(original, 'content')]);
  watcher.emit('all', 'change', path.join(original, 'content/media/_assets/image.png'));
  t.mock.timers.tick(200); await new Promise(resolve => setImmediate(resolve));
  assert.equal(calls, 1);
});
test('identical move candidates require explicit identity instead of arbitrarily choosing',()=>fixture((root,write)=>{
 write(rel,'# Same');prepare(root);fs.unlinkSync(path.join(root,'content',rel));write(rel.replace('001.A','002.B'),'# Same');write(rel.replace('001.A','003.C'),'# Same');assert.throws(()=>prepare(root),/Ambiguous move/);
}));
test('private BLOG index excludes descendant documents and thumbnail links use shared checks',()=>fixture((root,write)=>{
 write('blog/private/index.md','---\npublished: false\n---\n# Private');const body='# Child';write('blog/private/child.md',body);write('blog/private/assets/private.png','image');
 const r=prepare(root);assert.equal(normalize('blog/private/child.md',body,r,root).published,false);
 write('blog/public.md','---\nthumbnailAsset: ./private/assets/private.png\n---\n# Public');assert.ok(validate(root).some(e=>e.includes('excluded')));
}));

test('shared media assets resolve from documents without becoming content or inheriting draft state',()=>fixture((root,write)=>{
 const image='media/도표 1.PNG', generated=path.join(root,'ol-core/public/generated/content',image);
 write(image,'image bytes');write('media/notes.md','# Asset note');
 write('media/.hidden.png','hidden');write('media/_drafts/private.png','private');
 write('blog/private.md','---\npublished: false\n---\n# Private\n![shared](../media/도표%201.PNG)');
 let registry=prepare(root);syncAssets(root);
 assert.equal(fs.readFileSync(generated,'utf8'),'image bytes');
 assert.equal(fs.existsSync(path.join(root,'ol-core/public/generated/content/media/notes.md')),false);
 assert.equal(fs.existsSync(path.join(root,'ol-core/public/generated/content/media/.hidden.png')),false);
 assert.equal(fs.existsSync(path.join(root,'ol-core/public/generated/content/media/_drafts/private.png')),false);
 assert.equal(Object.keys(registry.files).some(source=>source.startsWith('media/')),false);
 assert.equal(mediaEntries(root).some(entry=>entry.data.source.startsWith('media/')),false);
 write('blog/public.md','---\nthumbnailAsset: ../media/도표%201.PNG\n---\n# Public\n![shared](../media/도표%201.PNG?width=640#view)');
 registry=prepare(root);assert.deepEqual(validate(root),[]);
 const expected='/generated/content/media/'+encodeURIComponent('도표 1.PNG');
 assert.equal(resolveReference('blog/public.md','../media/도표%201.PNG?width=640#view',registry,root),expected+'?width=640#view');
 write(image,'updated image');syncAssets(root);assert.equal(fs.readFileSync(generated,'utf8'),'updated image');
 write('blog/public.md','# Public');fs.unlinkSync(path.join(root,'content',image));syncAssets(root);
 assert.equal(fs.existsSync(generated),false);
}));

test('watch batches retain structural events, filter before scheduling, and normalize source keys', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const watcher = new EventEmitter(); watcher.add = () => {};
  const batches = [];
  const dispose = watchContent(watcher, changes => batches.push(changes), assert.fail, {
    accept: change => change.relative === null || !change.relative.startsWith('blog/'),
  });
  t.after(dispose);
  const emit = (event, source) => watcher.emit('all', event, path.join(original, 'content', source));
  emit('change', 'text/한글.md'.normalize('NFD'));
  emit('change', 'text/한글.md'.normalize('NFD'));
  emit('unlink', 'text/old.md'); emit('add', 'text/new.md');
  t.mock.timers.tick(200); emit('change', 'blog/ignored.md');
  t.mock.timers.tick(50); await new Promise(resolve => setImmediate(resolve));
  assert.equal(batches.length, 1);
  assert.deepEqual(batches[0].map(({event, relative}) => [event, relative]), [
    ['change', 'text/한글.md'], ['unlink', 'text/old.md'], ['add', 'text/new.md'],
  ]);
});

test('incremental content refresh retains policy invalidation and hash-only feedback suppression', async () => {
  const { registryPolicy, refreshMode, acceptsCollectionChange, isDocumentEdit } = await import('./lib/content-refresh.mjs');
  const r = { files: { 'text/A.md': {id: 'a', url: '/a/', date: '2026-01-01', hash: 'before'} }, folders: {}, aliases: {}, redirects: {} };
  const policy = registryPolicy(r);
  const edit = {event: 'change', relative: 'text/A.md'};
  const registry = {event: 'change', relative: null};
  r.files['text/A.md'].hash = 'after';
  assert.equal(registryPolicy(r), policy);
  assert.equal(refreshMode([edit, registry], policy, registryPolicy(r)), 'incremental');
  assert.equal(refreshMode([registry], policy, registryPolicy(r)), 'skip');
  assert.equal(refreshMode([edit], undefined, policy), 'full');
  assert.equal(acceptsCollectionChange('story', edit), false);
  assert.equal(acceptsCollectionChange('text', edit), true);
  for (const change of [
    {event: 'change', relative: 'text/C/index.md'},
    {event: 'add', relative: 'text/A.md'},
    {event: 'unlink', relative: 'text/A.md'},
    {event: 'addDir', relative: 'text/New'},
    {event: 'change', relative: 'text/file.pdf'},
    {event: 'change', relative: 'media/index.md'},
  ]) {
    assert.equal(isDocumentEdit(change), false);
    assert.equal(acceptsCollectionChange('story', change), true);
    assert.equal(refreshMode([edit, change], policy, policy), 'full');
  }
  for (const mutate of [
    r => r.files['text/A.md'].url = '/moved/',
    r => r.files['text/A.md'].date = '2026-01-02',
    r => r.folders.work = { hidden: true },
    r => r.aliases.old = 'text/A.md',
    r => r.redirects['/old/'] = '/a/',
    r => delete r.files['text/A.md'],
  ]) {
    const changed = structuredClone(r); mutate(changed);
    assert.equal(refreshMode([registry], policy, registryPolicy(changed)), 'full');
  }
});
