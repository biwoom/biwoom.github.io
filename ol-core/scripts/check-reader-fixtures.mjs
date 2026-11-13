import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import rehypeReaderFootnotes from './rehype-reader-footnotes.mjs';
import path from 'node:path';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import { markdownRemarkPlugins } from './lib/markdown.mjs';

class Element {
  attrs = {}; handlers = {}; props = {}; hidden = true; open = false; value = ''; disabled = true;
  style = { overflow: '', setProperty: (k,v) => this.props[k] = v, getPropertyValue: k => this.props[k] ?? '', removeProperty: k => { delete this.props[k]; } };
  classList = { add() {}, remove() {} };
  setAttribute(k,v) { this.attrs[k] = v; }
  removeAttribute(k) { delete this.attrs[k]; }
  getAttribute(k) { return this.attrs[k]; }
  addEventListener(k,fn) { (this.handlers[k] ??= []).push(fn); }
  fire(k, extra = {}) { for (const fn of this.handlers[k] ?? []) fn({ target:this, preventDefault() {}, ...extra }); }
  focus() { this.focused = true; }
  scrollIntoView() { this.scrolled = true; }
  querySelector(s) { return this.select?.[s] ?? null; }
  querySelectorAll(s) { return this.lists?.[s] ?? []; }
  contains(el) { return el === this || this.children?.includes(el); }
  closest() { return this; }
  showModal() { this.open = true; }
  close() { this.open = false; }
}
function setup({ saved='100', unavailable=false, withBackToTop=false, reducedMotion=true, noteId='note', referenceId='ref', noteHash=`#${noteId}`, initialHash='' } = {}) {
  const reader=new Element(), font=new Element(), trigger=new Element(), panel=new Element(), slider=new Element(), output=new Element(), reset=new Element();
  const drawer=new Element(), noteTrigger=new Element(), close=new Element(), reference=new Element(), note=new Element(), back=new Element();
  const secondReference=new Element(); secondReference.id='ref2'; secondReference.hash=noteHash;
  reference.id=referenceId; reference.hash=noteHash; note.id=noteId;
  back.dataset={footnoteReturn:`#${referenceId}`}; back.closest=()=>note;
  drawer.children=[note];
  const scroller=new Element(); scroller.scrollTop=0; scroller.clientHeight=400; scroller.getBoundingClientRect=()=>({top:100});
  note.getBoundingClientRect=()=>({top:900}); note.offsetHeight=80;
  drawer.select={'[data-reader-footnotes-close]':close,'.ol-reader-footnotes-content':scroller};
  drawer.lists={'[data-footnote-return]':[back]};
  const title=new Element(), body=new Element(), original=new Element(); title.base='34px'; body.base='16px';
  title.closest=()=>null;body.closest=()=>null;original.closest=()=>original;
  reader.select={'#ol-reader-footnotes':drawer,'[data-reader-footnotes-trigger]':noteTrigger,'[data-reader-font]':font};
  reader.querySelectorAll = s => s === 'a[data-footnote-ref]' ? [reference,secondReference] : s === '[data-active-footnote-ref]' ? [reference,secondReference].filter(el=>el.getAttribute('data-active-footnote-ref') !== undefined) : [title,body,original];
  font.select={'[data-reader-font-trigger]':trigger,'.ol-reader-font-panel':panel,'[data-reader-font-size]':slider,'[data-reader-font-value]':output,'[data-reader-font-reset]':reset};
  font.children=[trigger,panel,slider,reset];
  trigger.getBoundingClientRect=()=>({bottom:120});
  const doc=new Element(); doc.body=new Element(); doc.querySelector=()=>reader; doc.getElementById=id=>[reference,secondReference,note].find(el=>el.id===id) ?? null;
  const win=new Element(); win.matchMedia=query=>({matches:query.includes('prefers-reduced-motion')?reducedMotion:true}); win.setTimeout=fn=>fn();
  const backToTop=new Element();win.scrollY=0;win.innerWidth=1200;win.scrollTo=options=>win.lastScroll=options;
  body.getBoundingClientRect=()=>({right:1000});
  if(withBackToTop){reader.select['[data-reader-back-to-top]']=backToTop;reader.select['.ol-story-chapter > .ol-prose']=body;}
  const store = {getItem:()=>{if(unavailable) throw Error(); return saved;},setItem:(_k,v)=>{if(unavailable) throw Error(); saved=v;}};
  const module={exports:{}};
  const source=ts.transpileModule(fs.readFileSync('ol-core/src/lib/client/reader-tools.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const location={hash:initialHash};
  const globals = {document:doc,window:win,Node:Element,Element,localStorage:store,location,history:{replaceState(_state,_title,hash){location.hash=hash;}},requestAnimationFrame:fn=>fn(),getComputedStyle:el=>({fontSize:el.base ? `${parseFloat(el.base) * Number(reader.props['--ol-reader-font-scale'] ?? (!unavailable && Number(saved)>=80 && Number(saved)<=150 ? Number(saved)/100 : 1))}px` : undefined,transform:'matrix(1, 0, 0, 1, 0, 0)'})};
  const drawerModule = {exports:{}};
  const drawerSource=ts.transpileModule(fs.readFileSync('ol-core/src/lib/client/reader-drawer.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  vm.runInNewContext(drawerSource,{module:drawerModule,exports:drawerModule.exports,...globals});
  vm.runInNewContext(source,{module,exports:module.exports,require:name=>{assert.equal(name,'./reader-drawer');return drawerModule.exports;},...globals});
  module.exports.initReaderTools();
  return {reader,font,trigger,panel,slider,output,reset,title,body,original,doc,win,drawer,noteTrigger,close,reference,note,back,scroller,secondReference,backToTop,location};
}
test('single reading slider scales title/body together, restores saved size, resets and dismisses',()=>{
  const h=setup({saved:'125'});
  assert.equal(h.reader.props['--ol-reader-font-scale'],'1.25');
  assert.equal(h.title.props['--ol-reader-base-font'],'34px');
  assert.equal(h.body.props['--ol-reader-base-font'],'16px');
  h.trigger.fire('click'); assert.equal(h.panel.hidden,false); assert.ok(h.slider.focused);
  assert.equal(h.panel.props['--ol-reader-font-top'],'128px');
  h.trigger.getBoundingClientRect=()=>({bottom:150});
  h.win.fire('scroll'); assert.equal(h.panel.props['--ol-reader-font-top'],'158px');
  h.slider.value='150'; h.slider.fire('input'); assert.equal(h.output.value,'150%'); assert.equal(h.reader.props['--ol-reader-font-scale'],'1.5');
  h.win.fire('resize'); assert.equal(h.body.props['--ol-reader-base-font'],'16px');
  h.doc.fire('keydown',{key:'Escape'}); assert.equal(h.panel.hidden,true); assert.ok(h.trigger.focused);
  h.trigger.fire('click'); h.doc.fire('click',{target:new Element()}); assert.equal(h.panel.hidden,true);
  h.reset.fire('click'); assert.equal(h.output.value,'100%');
});
test('reading control tolerates unavailable storage and invalid stored values',()=>{
  assert.equal(setup({unavailable:true}).output.value,'100%');
  assert.equal(setup({saved:'900'}).output.value,'100%');
});
test('footnote references open selected note, backreferences return, Escape and backdrop restore scrolling',()=>{
  const h=setup(); assert.equal(h.noteTrigger.disabled,false);
  h.reference.fire('click'); assert.ok(h.drawer.open); assert.ok(h.note.focused); assert.equal(h.doc.body.style.overflow,'hidden');
  assert.equal(h.scroller.scrollTop,640); assert.equal(h.note.scrolled,undefined);
  h.back.fire('click'); assert.equal(h.drawer.open,false); assert.ok(h.reference.focused); assert.equal(h.reference.getAttribute('data-active-footnote-ref'),''); assert.equal(h.doc.body.style.overflow,'');
  h.noteTrigger.fire('click'); h.back.fire('keydown',{key:'Enter'}); assert.equal(h.drawer.open,false);
  h.noteTrigger.fire('click'); h.drawer.fire('cancel'); assert.equal(h.drawer.open,false);
  h.noteTrigger.fire('click'); h.drawer.fire('click'); assert.equal(h.drawer.open,false);
});

test('TEXT and STORY Unicode footnotes resolve generated IDs for clicks, returns and incoming hashes',async()=>{
  const processor=await createMarkdownProcessor({remarkPlugins:markdownRemarkPlugins,rehypePlugins:[rehypeReaderFootnotes]});
  for(const section of ['text','story']){
    const {code}=await processor.render('본문[^03-방문]\n\n[^03-방문]: 한글 각주.',{
      fileURL:new URL(`file://${path.resolve(`content/${section}/category/work/part/example.md`)}`),
    });
    const anchor=code.match(/<a\b[^>]*data-footnote-ref[^>]*>/)?.[0];
    assert.ok(anchor);
    const noteHash=anchor.match(/href="([^"]+)"/)[1];
    const referenceId=anchor.match(/\bid="([^"]+)"/)[1];
    const noteId=code.match(/<li id="([^"]+)"/)[1];
    assert.equal(noteHash,`#${noteId}`);
    assert.notEqual(decodeURIComponent(noteId),noteId);
    const h=setup({noteId,referenceId,noteHash});
    let prevented=false;
    h.reference.fire('click',{preventDefault(){prevented=true;}});
    assert.ok(prevented);assert.ok(h.drawer.open);assert.ok(h.note.focused);
    h.back.fire('click');assert.equal(h.drawer.open,false);assert.ok(h.reference.focused);
    assert.equal(h.location.hash,`#${encodeURIComponent(referenceId)}`);
    const fallback=setup({noteId,referenceId,noteHash});
    fallback.noteTrigger.fire('click');fallback.back.fire('keydown',{key:'Enter'});
    assert.equal(fallback.drawer.open,false);assert.ok(fallback.reference.focused);
    for(const initialHash of [noteHash,`#${encodeURIComponent(noteId)}`]){
      const incoming=setup({noteId,referenceId,noteHash,initialHash});
      assert.ok(incoming.drawer.open);assert.ok(incoming.note.focused);
    }
    h.location.hash=noteHash;h.win.fire('hashchange');assert.ok(h.drawer.open);
  }
});

test('footnote hashes retain decoded Unicode fallback and tolerate malformed escapes',()=>{
  const h=setup({noteId:'각주',noteHash:`#${encodeURIComponent('각주')}`});
  h.reference.fire('click');assert.ok(h.drawer.open);
  const malformed=setup({noteHash:'#missing-%ZZ',initialHash:'#missing-%ZZ'});
  assert.doesNotThrow(()=>malformed.reference.fire('click'));
  assert.equal(malformed.drawer.open,false);
});


test('shared drawer waits for exit completion and preserves an interrupted entrance position', async () => {
  const dialog=Object.assign(new Element(),{scrollLeft:0,scrollTop:0});
  const trigger=new Element(), panel=new Element();
  dialog.select={'.ol-reader-toc-panel':panel};
  dialog.showModal=()=>{dialog.open=true;dialog.scrollLeft=160;dialog.scrollTop=40;};
  const animations=[];
  panel.animate=(frames, options)=>{
    assert.equal(dialog.scrollLeft,0,'native autofocus must not offset the modal shell before animation');
    assert.equal(dialog.scrollTop,0);
    let resolve, reject;
    const finished=new Promise((ok,fail)=>{resolve=ok;reject=fail;});
    const animation={finished, cancel(){this.cancelled=true;reject(new Error('cancelled'));},resolve};
    animations.push({frames,options,animation});
    return animation;
  };
  const body=new Element();
  const module={exports:{}};
  const code=ts.transpileModule(fs.readFileSync('ol-core/src/lib/client/reader-drawer.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  vm.runInNewContext(code,{module,exports:module.exports,document:{body},window:{matchMedia:()=>({matches:false})},getComputedStyle:()=>({transform:'matrix(1, 0, 0, 1, 160, 0)'})});
  const controller=module.exports.createReaderDrawer(dialog,trigger,null);
  controller.open();
  assert.equal(dialog.scrollLeft,0);
  assert.equal(dialog.scrollTop,0);
  assert.equal(animations[0].options.duration,360);
  assert.equal(animations[0].frames[0].transform,'translateX(100%)');
  let returned=false;
  controller.close(()=>{returned=true;});
  assert.ok(dialog.open); assert.equal(returned,false);
  assert.ok(animations[0].animation.cancelled);
  assert.equal(animations[1].frames[0].transform,'matrix(1, 0, 0, 1, 160, 0)');
  assert.equal(animations[1].options.duration,280);
  assert.equal(controller.open(),false);
  animations[1].animation.resolve();
  await Promise.resolve();
  assert.equal(dialog.open,false); assert.ok(returned); assert.equal(body.style.overflow,'');
  controller.open(); assert.ok(dialog.open);
  animations[2].animation.resolve();
});


test('reader build removes all backref controls while preserving nested note content and authored links', () => {
  const el=(tagName,properties={},children=[])=>({type:'element',tagName,properties,children});
  const text={type:'text',value:'각주 내용'};
  const external=el('a',{href:'https://example.com'},[text]);
  const ref=href=>el('a',{href,dataFootnoteBackref:''},[{type:'text',value:'↩'}]);
  const nested=el('ul',{},[el('li',{},[text])]);
  const note=el('li',{id:'user-content-fn-1'},[el('p',{},[text,external,ref('#ref-1'),ref('#ref-2')]),nested]);
  const tree={type:'root',children:[el('section',{dataFootnotes:''},[el('ol',{},[note])])]};
  const transform=rehypeReaderFootnotes();
  const original=structuredClone(tree);
  transform(tree,{path:path.resolve('content/story/category/series/part/one.md')});
  const control=note.children[0];
  assert.equal(control.properties.dataFootnoteReturn,'#ref-1');
  assert.equal(control.properties.tabIndex,0);
  assert.equal(control.properties.role,'link');
  assert.equal(control.children[0].children[1],external);
  assert.equal(control.children[1],nested);
  assert.ok(!JSON.stringify(tree).includes('dataFootnoteBackref'));
  assert.ok(!JSON.stringify(tree).includes('↩'));
  const blog=structuredClone(original);
  transform(blog,{path:path.resolve('content/blog/post.md')});
  assert.deepEqual(blog,original);
  const intro=structuredClone(original);
  transform(intro,{path:path.resolve('content/text/category/series/index.md')});
  assert.deepEqual(intro,original);
});


test('note text returns to the last clicked repeated reference and preserves authored link clicks',()=>{
  const h=setup();
  h.noteTrigger.fire('click');
  const authoredLink=new Element();
  h.back.fire('click',{target:authoredLink});
  assert.ok(h.drawer.open);
  h.back.fire('keydown',{key:'Enter'});
  assert.equal(h.drawer.open,false);
  assert.ok(h.reference.focused);
  h.secondReference.fire('click');
  h.back.fire('click');
  assert.ok(h.secondReference.focused);
  assert.equal(h.reference.getAttribute('data-active-footnote-ref'),undefined);
  assert.equal(h.secondReference.getAttribute('data-active-footnote-ref'),'');
});


test('shared back-to-top follows the prose edge, reveals on scroll and respects reduced motion',()=>{
  const h=setup({withBackToTop:true});
  assert.equal(h.backToTop.hidden,true);assert.equal(h.backToTop.props['--ol-reader-top-right'],'208px');
  h.win.scrollY=300;h.win.fire('scroll');assert.equal(h.backToTop.hidden,false);
  h.backToTop.fire('click');assert.equal(h.win.lastScroll.top,0);assert.equal(h.win.lastScroll.behavior,'instant');
  h.win.innerWidth=1400;h.win.fire('resize');assert.equal(h.backToTop.props['--ol-reader-top-right'],'408px');
  h.win.scrollY=0;h.win.fire('scroll');assert.equal(h.backToTop.hidden,true);
  const smooth=setup({withBackToTop:true,reducedMotion:false});smooth.backToTop.fire('click');assert.equal(smooth.win.lastScroll.behavior,'smooth');
});


test('original passage sizing remains CSS-owned while the shared slider changes its scale',()=>{
  const h=setup({saved:'125'});
  assert.equal(h.reader.props['--ol-reader-font-scale'],'1.25');
  assert.equal(h.original.props['--ol-reader-base-font'],undefined);
  assert.equal(h.original.getAttribute('data-reader-scalable'),undefined);
  h.slider.value='150';h.slider.fire('input');h.win.fire('resize');
  assert.equal(h.reader.props['--ol-reader-font-scale'],'1.5');
  assert.equal(h.original.props['--ol-reader-base-font'],undefined);
  assert.equal(h.original.getAttribute('data-reader-scalable'),undefined);
});


test('saved reading size is available in the head before body markup, with bounded storage fallbacks', () => {
  const source = fs.readFileSync('ol-core/src/layouts/BaseLayout.astro', 'utf8');
  const script = source.match(/<script is:inline data-reader-font-init>([\s\S]*?)<\/script>/);
  assert.ok(script); assert.ok(script.index < source.indexOf('<body'));
  for (const [saved, expected] of [['125','1.25'], ['80','0.8'], ['150','1.5'], [null,'1'], ['900','1'], ['bad','1']]) {
    const root = new Element();
    vm.runInNewContext(script[1], {document: {documentElement:root}, localStorage:{getItem:()=>saved}});
    assert.equal(root.props['--ol-reader-initial-scale'], expected);
  }
  const root = new Element();
  vm.runInNewContext(script[1], {document: {documentElement:root}, localStorage:{getItem:()=>{throw Error('blocked');}}});
  assert.equal(root.props['--ol-reader-initial-scale'],'1');
});

test('restoring a saved scale does not enlarge measured base sizes on initialization or repeated resize', () => {
  const h = setup({saved:'150'});
  for (let i=0; i<3; i++) {
    assert.equal(h.title.props['--ol-reader-base-font'],'34px');
    assert.equal(h.body.props['--ol-reader-base-font'],'16px');
    assert.equal(h.reader.props['--ol-reader-font-scale'],'1.5');
    h.win.fire('resize');
  }
});
