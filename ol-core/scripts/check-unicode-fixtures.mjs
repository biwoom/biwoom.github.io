import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { prepare } from './prepare-content.mjs';
import { validate } from './check-content.mjs';
import { normalizeRegistryPaths, normalize, hash, categoryFolders, walk } from './lib/content.mjs';
import { normalizeContentPath, contentFile, relativeContentPath, readContentDirectory } from './lib/paths.mjs';
import { resolveReference, assetUrl } from './remark-content.mjs';
import { syncAssets } from './sync-content-assets.mjs';
import { readMediaInformation } from './lib/media-information.mjs';
import { getEbookLibrary } from './lib/ebooks.mjs';

const source = 'story/001.문학/001.마하붓다왐사/01.서문/001.글.md';
const series = 'story/001.문학/001.마하붓다왐사';
const body = '# 원문\n\n자모를 보존합니다: '+ '가'.normalize('NFD') + '\n\n![그림](./_assets/그림.png)';
const record = { id: 'preserved-id', url: '/story/read/original/', date: '2020-01-02', hash: hash(body), seriesKey: series.normalize('NFD') };
function fixture(run) {
 const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ol-unicode-'));
 const write = (key, text) => { const file = path.join(root, 'content', key); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, text); };
 const initial = { version: 1, files: {}, folders: {}, redirects: {}, aliases: {} };
 fs.writeFileSync(path.join(root, 'content-registry.json'), JSON.stringify(initial));
 try { return run(root, write); } finally { fs.rmSync(root, { recursive: true, force: true }); }
}
function legacy(root) {
 const registry = { version: 1, files: { [source.normalize('NFD')]: record }, folders: { [series.normalize('NFD')]: {title:'마하붓다왐사',url:'/story/library/original/'} }, redirects: {}, aliases: { ['story/이전/글.md'.normalize('NFD')]: source.normalize('NFD'), [source]: source.normalize('NFD') } };
 fs.writeFileSync(path.join(root, 'content-registry.json'), JSON.stringify(registry, null, 2)+'\n');
}


function useNfcListing(t) {
   const original = fs.readdirSync;
   t.mock.method(fs, 'readdirSync', (directory, options) => {
    const result = original(directory, options);
    return options?.withFileTypes ? result.map(entry => new Proxy(entry, { get(target, key) {
     if (key === 'name') return target.name.normalize('NFC');
     const value = Reflect.get(target, key);return typeof value === 'function' ? value.bind(target) : value;
    } })) : result;
   });
}

test('NFC checkout and decomposed filesystem produce identical registry bytes without identity churn', t => {
 const outputs = [];
 for (const form of ['NFC','NFD']) fixture((root, write) => {
  write(source.normalize(form), body);write('story/001.문학/001.마하붓다왐사/01.서문/_assets/그림.png'.normalize(form), 'image bytes');legacy(root);
  // macOS returns decomposed entries even for an NFC Git checkout. Exercise Linux's NFC listing too.
  if (form === 'NFC') useNfcListing(t);
  try {
   const registry = prepare(root);
   assert.deepEqual(registry.files[source], {...record,seriesKey:series});
   assert.equal(Object.keys(registry.files).length,1);
   assert.equal(registry.folders[series].url,'/story/library/original/');
   assert.equal(registry.aliases[source],undefined);
   assert.equal(registry.aliases['story/이전/글.md'],source);
   assert.equal(normalize(source.normalize('NFD'),body,registry,root).source,source);
   assert.equal(categoryFolders('story',root)[0].key,'story/001.문학');
   assert.equal(resolveReference(source,'./_assets/'+encodeURIComponent('그림.png'.normalize('NFD'))+'?size=2#original',registry,root),assetUrl('story/001.문학/001.마하붓다왐사/01.서문/_assets/그림.png')+'?size=2#original');
   assert.equal(resolveReference(source,'../../../이전/글.md',registry,root),'/story/read/original/');
   assert.equal(relativeContentPath(contentFile(source,root),root),source);
   assert.deepEqual(validate(root),[]);
   syncAssets(root);syncAssets(root);
   assert.equal(fs.readFileSync(path.join(root,'ol-core/public/generated/content/story/001.문학/001.마하붓다왐사/01.서문/_assets/그림.png'),'utf8'),'image bytes');
   assert.equal(fs.readFileSync(contentFile(source,root),'utf8'),body);
   const before=fs.readFileSync(path.join(root,'content-registry.json'),'utf8');prepare(root);
   assert.equal(fs.readFileSync(path.join(root,'content-registry.json'),'utf8'),before);
   // Keep the same strict HEAD comparison as Actions, against a temporary committed checkpoint.
   execFileSync('git',['init','-q'],{cwd:root});execFileSync('git',['add','content-registry.json'],{cwd:root});
   execFileSync('git',['-c','user.name=Unicode fixture','-c','user.email=fixture@example.invalid','commit','-qm','Prepared registry'],{cwd:root});
   prepare(root);execFileSync('git',['diff','--exit-code','HEAD','--','content-registry.json'],{cwd:root});
   outputs.push(before);
  } finally { t.mock.restoreAll(); }
 });
 assert.equal(outputs[0],outputs[1]);
});

test('fresh registry initialization has the same order for Korean and CJK names in both listings',t=>{
 const outputs=[];
 for(const form of ['NFC','NFD'])fixture((root,write)=>{
  write('blog/가.md'.normalize(form),'# Korean');write('blog/中.md','# CJK');
  if(form==='NFC')useNfcListing(t);
  try{prepare(root);outputs.push(fs.readFileSync(path.join(root,'content-registry.json'),'utf8'));}
  finally{t.mock.restoreAll();}
 });
 assert.equal(outputs[0],outputs[1]);
});

test('normalization collisions fail before overwriting distinct document identities',()=>{
 const registry={files:{[source]:{...record},[source.normalize('NFD')]:{...record,id:'different-id'}},folders:{},aliases:{},redirects:{}};
 assert.throws(()=>normalizeRegistryPaths(registry),/Unicode registry collision/);
});

test('filesystem Unicode collisions are detected even when directory entries look identical',t=>fixture(root=>{
 fs.mkdirSync(path.join(root,'content'),{recursive:true});
 const original=fs.readdirSync;
 t.mock.method(fs,'readdirSync',(directory,options)=>directory===path.join(root,'content')?[{name:'가'},{name:'가'.normalize('NFD')}]:original(directory,options));
 assert.throws(()=>readContentDirectory(path.join(root,'content')),/Unicode path collision/);
}));

test('decomposed MEDIA metadata and ebook packages use canonical asset and category keys',()=>fixture((root,write)=>{
 const image='media/001.그림/표지.png';
 write(image.normalize('NFD'),'image bytes');
 write('media/001.그림/index.md'.normalize('NFD'),'# 그림\n\n## [표지 정보](표지.png)\n\n설명');
 write('ebook/001.문헌/001.책/책.pdf'.normalize('NFD'),'%PDF');
 write('ebook/001.문헌/001.책/표지.png'.normalize('NFD'),'image bytes');
 write('ebook/001.문헌/001.책/index.md'.normalize('NFD'),'# 책\n\n소개');
 const information=readMediaInformation(root);assert.ok(information.has(image));
 const library=getEbookLibrary(root);assert.equal(library.categories[0].key,'001.문헌');
 assert.equal(library.books[0].downloads[0].source,'ebook/001.문헌/001.책/책.pdf');
 assert.equal(library.books[0].coverSource,'ebook/001.문헌/001.책/표지.png');
 syncAssets(root);syncAssets(root);
 assert.equal(fs.readFileSync(path.join(root,'ol-core/public/generated/content/ebook/001.문헌/001.책/책.pdf'),'utf8'),'%PDF');
 assert.ok(walk(path.join(root,'content/media'),{assets:true}).every(file=>normalizeContentPath(relativeContentPath(file,root))===relativeContentPath(file,root)));
}));
