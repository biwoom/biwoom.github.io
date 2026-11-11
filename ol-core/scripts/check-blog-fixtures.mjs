import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { prepare } from './prepare-content.mjs';
import { readBlogCatalog } from './lib/blog.mjs';
import { normalize, isPublicSource } from './lib/content.mjs';
import { validate } from './check-content.mjs';
import { syncAssets } from './sync-content-assets.mjs';
import { resolveReference } from './remark-content.mjs';
function fixture(run) {
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'biwoom-blog-'));
 fs.writeFileSync(path.join(root,'content-registry.json'),JSON.stringify({version:1,files:{},folders:{},redirects:{},aliases:{}}));
 const write=(source,body)=>{const file=path.join(root,'content',source);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,body);};
 try { run(root,write); } finally { fs.rmSync(root,{recursive:true,force:true}); }
}
test('BLOG indexes supply metadata without becoming posts; retain empty series/category and update edited metadata',()=>fixture((root,write)=>{
 write('blog/001.세계/index.md','# 불교의 세계\n\n세계 소개');
 write('blog/001.세계/001.교학/index.md','# 가르침\n\n카테고리 소개');
 write('blog/001.세계/001.교학/post/index.md','# 포스트\n\n본문');
 write('blog/001.세계/002.빈분류/.gitkeep','');
 write('blog/002.에세이/index.md','소개만 있는 시리즈입니다.');
 let r=prepare(root),catalog=readBlogCatalog(root,r);
 assert.equal(catalog.length,2);assert.equal(catalog[0].count,1);assert.equal(catalog[1].count,0);
 assert.equal(normalize('blog/002.에세이/index.md','소개만 있는 시리즈입니다.',r,root).title,'에세이');
 assert.equal(catalog[0].categories[0].title,'가르침');assert.equal(catalog[0].categories[0].description,'카테고리 소개');
 assert.equal(catalog[0].categories.length,2);
 const source='blog/001.세계/001.교학/post/index.md';const data=normalize(source,'# 포스트',r,root);
 assert.equal(data.kind,'document');assert.equal(data.category,'가르침');assert.equal(data.series,'불교의 세계');
 assert.equal(normalize('blog/001.세계/001.교학/index.md','# 가르침',r,root).kind,'category');
 assert.equal(normalize('blog/001.세계/index.md','# 불교의 세계',r,root).kind,'series');
 const url=r.files[source].url;
 write('blog/001.세계/001.교학/index.md','---\ntitle: 교학\ndescription: 새 소개\n---\n# 옛 제목');r=prepare(root);catalog=readBlogCatalog(root,r);
 assert.equal(catalog[0].categories[0].title,'교학');assert.equal(catalog[0].categories[0].description,'새 소개');assert.equal(r.files[source].url,url);
 assert.deepEqual(validate(root),[]);
}));
test('BLOG reading order spans categories, appends unspecified posts, resolves renamed paths and rejects duplicates/cross-series links',()=>fixture((root,write)=>{
 const first='blog/001.세계/001.교학/a.md',second='blog/001.세계/002.질문/b.md';
 write(first,'---\ndate: 2026-01-01\n---\n# 첫 글');write(second,'---\ndate: 2026-02-01\n---\n# 두번째');
 write('blog/001.세계/index.md','# 세계\n\n## 읽는 순서\n\n1. [둘](002.질문/b.md)');
 let r=prepare(root);assert.deepEqual(readBlogCatalog(root,r)[0].entries.map(e=>e.data.source),[second,first]);
 fs.renameSync(path.join(root,'content',second),path.join(root,'content/blog/001.세계/002.질문/renamed.md'));r=prepare(root);
 assert.equal(resolveReference('blog/001.세계/index.md','002.질문/b.md',r,root),r.files['blog/001.세계/002.질문/renamed.md'].url);
 assert.equal(readBlogCatalog(root,r)[0].entries[0].data.source,'blog/001.세계/002.질문/renamed.md');
 write('blog/001.세계/index.md','# 세계\n\n## 읽는 순서\n\n1. [둘](002.질문/b.md)\n2. [중복](002.질문/renamed.md)');
 assert.ok(validate(root).some(e=>e.includes('duplicate reading-order')));
 write('blog/002.다른/003.분류/c.md','# 다른 글');write('blog/001.세계/index.md','# 세계\n\n## 읽는 순서\n\n1. [다른](../002.다른/003.분류/c.md)');
 assert.ok(validate(root).some(e=>e.includes('must belong to this series')));
}));
test('BLOG private series/category indexes hide descendants and their assets, without affecting other categories',()=>fixture((root,write)=>{
 const source='blog/001.세계/001.교학/post.md',asset='blog/001.세계/001.교학/cover.png';
 write(source,'# 글');write(asset,'image');write('blog/001.세계/001.교학/index.md','---\npublished: false\n---\n# 교학');
 write('blog/001.세계/002.수행/post.md','# 다른 글');write('blog/002.빈시리즈/index.md','# 빈시리즈');
 let r=prepare(root);let catalog=readBlogCatalog(root,r);
 assert.equal(r.files[source].date,null,'A private parent must not assign a first-publication date');
 assert.equal(catalog[0].count,1);assert.equal(catalog[0].categories.length,1);assert.equal(isPublicSource(asset,r,root,{asset:true}),false);
 syncAssets(root);assert.equal(fs.existsSync(path.join(root,'ol-core/public/generated/content',asset)),false);
 write('blog/001.세계/index.md','---\npublished: false\n---\n# 세계');r=prepare(root);catalog=readBlogCatalog(root,r);assert.equal(catalog.length,1);assert.equal(catalog[0].count,0);
 write('blog/001.세계/index.md','# 세계');write('blog/001.세계/001.교학/index.md','# 교학');r=prepare(root);assert.equal(readBlogCatalog(root,r)[0].count,2);assert.ok(r.files[source].date);
 write('blog/index.md','---\npublished: false\n---\n# 비공개 BLOG');r=prepare(root);assert.deepEqual(readBlogCatalog(root,r),[]);
}));
test('BLOG moving a whole series preserves its series/category and post URLs',()=>fixture((root,write)=>{
 const source='blog/001.세계/001.교학/post/index.md';
 write('blog/001.세계/index.md','# 세계');write('blog/001.세계/001.교학/index.md','# 교학');write(source,'# 글');
 const before=prepare(root),post={...before.files[source]},seriesUrl=before.folders['blog/001.세계'].url,categoryUrl=before.folders['blog/001.세계/001.교학'].url;
 fs.renameSync(path.join(root,'content/blog/001.세계'),path.join(root,'content/blog/002.불교세계'));
 const after=prepare(root),catalog=readBlogCatalog(root,after);
 assert.equal(catalog[0].url,seriesUrl);assert.equal(catalog[0].categories[0].url,categoryUrl);
 assert.equal(catalog[0].entries[0].id,post.id);assert.equal(catalog[0].entries[0].data.url,post.url);
 assert.deepEqual(validate(root),[]);
}));
test('BLOG rejects a category shared by two series',()=>fixture((root,write)=>{
 write('blog/001.세계/001.교학/index.md','# 교학');write('blog/002.실천/001.교학/index.md','# 교학');
 assert.ok(validate(root).some(e=>e.includes('belongs to more than one series')));
}));
test('random cover layout preserves every link and aligns DOM and visual slots across visits',()=>{
 const source=fs.readFileSync('ol-core/src/pages/blog/series/index.astro','utf8').match(/<script is:inline>([\s\S]*?)<\/script>/)[1];
 const runs=[];
 for(const random of [0,0.4,0.99]){
  const cards=Array.from({length:4},(_,id)=>({id,dataset:{}}));const ordered=[];
  const grid={dataset:{},querySelectorAll:()=>cards,appendChild:card=>ordered.push(card)};
  vm.runInNewContext(source,{document:{currentScript:{parentElement:grid}},Math:{random:()=>random,floor:Math.floor}});
  assert.deepEqual(ordered.map(c=>c.id).sort(),[0,1,2,3]);assert.deepEqual(ordered.map(c=>c.dataset.slot),['0','1','2','3']);
  assert.ok(['0','1'].includes(grid.dataset.pattern));runs.push(ordered.map(c=>c.id).join(','));
 }
 assert.ok(new Set(runs).size>1);
});
