import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as content from './lib/content.mjs';
function evaluate(file, globals={}, imports={}) {
  const module={exports:{}};
  const source=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  vm.runInNewContext(source,{module,exports:module.exports,require:name=>{assert.ok(name in imports,name);return imports[name];},...globals});
  return module.exports;
}
class El {
  dataset={}; attrs={}; handlers={}; children=[]; open=false; hidden=false; style={overflow:''}; value=''; textContent='';
  setAttribute(k,v){this.attrs[k]=v;} removeAttribute(k){delete this.attrs[k];} hasAttribute(k){return k in this.attrs;}
  toggleAttribute(k,on){if(on)this.attrs[k]='';else delete this.attrs[k];}
  addEventListener(k,fn){(this.handlers[k]??=[]).push(fn);}
  dispatchEvent(e){for(const fn of this.handlers[e.type]??[])fn(e);return true;}
  fire(type,extra={}){this.dispatchEvent({type,target:this,preventDefault(){},...extra});}
  closest(){return null;}
  replaceWith(el){el.parentElement=this.parentElement;}
  focus(){this.focused=true;} show(){this.open=true;} showModal(){this.open=true;} close(){this.open=false;}
  querySelector(s){return this.select?.[s]??null;} querySelectorAll(s){return this.lists?.[s]??[];}
  append(el){el.parentElement=this;this.children.push(el);} before(marker){marker.parentElement=this.parentElement;} after(el){el.parentElement=this.parentElement;}
  classList={add(){},remove(){}};
}
test('TEXT bibliography reads explicit prose labels and never invents source facts from code or headings',()=>{
  const api=evaluate('src/lib/text-bibliography.ts',{}, {'../../scripts/lib/content.mjs':content});
  const result=api.readTextBibliography('# 대승현론\n\n**저자**: 길장 찬  \n**출처**: CBETA T45n1853\n\n```\n저본: 가짜\n```\n\n이 글은 저자: 추정하지 않음');
  assert.deepEqual(JSON.parse(JSON.stringify(result)),[{label:'저자',value:'길장 찬'},{label:'출처',value:'CBETA T45n1853'}]);
  assert.equal(api.readTextBibliography('# 제목만 있는 문헌').length,0);
});
test('TEXT library searches title/description, expands matches, hides empty groups and restores collapsed state',()=>{
  const search=new El(),reset=new El(),status=new El(),empty=new El(),a=new El(),b=new El(),ga=new El(),gb=new El();
  a.dataset.searchText='제1권 번역 이제';b.dataset.searchText='제1권 연구 중관';
  ga.open=false;gb.open=true;const ca=new El(),cb=new El();
  ga.lists={'[data-text-material-item]':[a]};gb.lists={'[data-text-material-item]':[b]};ga.select={'[data-text-group-count]':ca};gb.select={'[data-text-group-count]':cb};
  const document={querySelector:s=>({'#text-material-search':search,'[data-text-search-status]':status,'[data-text-search-empty]':empty,'[data-text-search-reset]':reset}[s]),querySelectorAll:s=>s==='[data-text-material-group]'?[ga,gb]:[a,b]};
  evaluate('src/lib/client/text-library.ts',{document}).initTextLibrary();
  search.value='이제';search.fire('input');assert.equal(a.hidden,false);assert.equal(b.hidden,true);assert.equal(ga.open,true);assert.equal(gb.hidden,true);assert.equal(status.textContent,'1개 자료');
  search.value='없음';search.fire('input');assert.equal(empty.hidden,false);
  reset.fire('click');assert.equal(ga.open,false);assert.equal(gb.open,true);assert.equal(status.textContent,'2개 자료');assert.ok(search.focused);
});
test('docked document panels are nonmodal, do not lock body scroll, and close without animation',()=>{
  const dialog=new El(),trigger=new El(),panel=new El(),root=new El(),active=new El();dialog.dataset.docked='true';dialog.select={'.ol-reader-toc-panel':panel};dialog.parentElement=new El();dialog.closest=()=>root;
  const document={body:new El(),activeElement:active};document.body.style.overflow='scroll';
  const Event=class{constructor(type,options){this.type=type;Object.assign(this,options);}};
  const api=evaluate('src/lib/client/reader-drawer.ts',{document,window:{matchMedia:()=>({matches:false})},HTMLElement:El,Event,CustomEvent:Event});
  dialog.show=()=>{throw new Error('Docked panels must not invoke dialog autofocus');};
  const controller=api.createReaderDrawer(dialog,trigger,null);controller.open();assert.ok(dialog.open);assert.equal(document.body.style.overflow,'scroll');assert.equal(active.focused,undefined);assert.equal(trigger.attrs['aria-expanded'],'true');
  let returned=false;controller.close(()=>returned=true);assert.equal(dialog.open,false);assert.ok(returned);assert.equal(document.body.style.overflow,'scroll');
});
function workspace({ opened = true, initialNote = false, wideScreen = true } = {}) {
  const root=new El(),slot=new El(),printSlot=new El(),left=new El(),list=new El(),mobile=new El(),mobileSlot=new El(),leftBtn=new El(),focusBtn=new El(),focusLabel=new El();
  const toc=new El(),notes=new El();toc.id='ol-reader-toc';notes.id='ol-reader-footnotes';
  if (!opened) { root.setAttribute('data-text-left-hidden',''); root.setAttribute('data-text-right-hidden',''); }
  toc.parentElement=root;notes.parentElement=root;notes.open=initialNote;
  const dialogs=[toc,notes],tabs=['toc','footnotes'].map(type=>{const e=new El();e.dataset.textPanel=type;return e;});
  const wide=new El(),narrow=new El();wide.matches=wideScreen;narrow.matches=false;
  root.select={'[data-text-panel-slot]':slot,'[data-text-print-notes]':printSlot,'#text-document-list':left,'[data-text-list-content]':list,'#text-list-dialog':mobile,'[data-text-left-toggle]':leftBtn,'[data-text-focus]':focusBtn,'[data-text-focus-label]':focusLabel,'[data-text-list-close]':new El()};
  root.lists={'.ol-reader-toc':dialogs,'[data-text-panel]':tabs};mobile.select={'[data-text-mobile-list-slot]':mobileSlot};
  for(const dialog of dialogs){
    dialog.addEventListener('reader:open',()=>{dialogs.forEach(d=>{d.open=false;});dialog.open=true;root.removeAttribute('data-text-right-hidden');root.fire('reader:panel');});
    dialog.addEventListener('reader:reset',()=>{dialog.open=false;root.fire('reader:panel');});
  }
  const body=new El();body.style.overflow='auto';
  const document={body,querySelector:()=>root,createComment:()=>new El()};
  const window=new El(); window.matchMedia=query=>query.includes('1360')?wide:narrow;
  const Event=class{constructor(type){this.type=type;}};
  evaluate('src/lib/client/text-workspace.ts',{document,Event,window}).initTextWorkspace();
  return {root,slot,printSlot,window,left,list,mobile,mobileSlot,leftBtn,focusBtn,focusLabel,toc,notes,tabs,wide,narrow,body};
}
test('TEXT focus restores the actual previous panel/list state and selecting a panel leaves focus mode',()=>{
  const h=workspace();assert.ok(h.toc.open);assert.equal(h.tabs[0].attrs['aria-pressed'],'true');
  h.tabs[1].fire('click');assert.ok(h.notes.open);assert.equal(h.toc.open,false);
  h.focusBtn.fire('click');assert.ok(h.root.hasAttribute('data-text-focus'));assert.equal(h.notes.open,false);
  h.focusBtn.fire('click');assert.ok(h.notes.open);assert.equal(h.focusBtn.attrs['aria-pressed'],'false');assert.equal(h.root.hasAttribute('data-text-left-hidden'),false);
  h.leftBtn.fire('click');assert.ok(h.root.hasAttribute('data-text-left-hidden'));
  h.focusBtn.fire('click');h.focusBtn.fire('click');assert.ok(h.root.hasAttribute('data-text-left-hidden'));
  h.focusBtn.fire('click');h.tabs[0].fire('click');assert.equal(h.root.hasAttribute('data-text-focus'),false);assert.ok(h.toc.open);
});
test('TEXT responsive layout moves original nodes, closes modal with Esc, and restores body scrolling',()=>{
  const h=workspace();h.wide.matches=false;h.narrow.matches=true;h.wide.fire('change');
  assert.equal(h.list.parentElement,h.mobileSlot);assert.equal(h.toc.dataset.docked,undefined);assert.equal(h.leftBtn.attrs['aria-controls'],'text-list-dialog');
  h.leftBtn.fire('click');assert.ok(h.mobile.open);assert.equal(h.body.style.overflow,'hidden');
  h.mobile.fire('cancel');assert.equal(h.mobile.open,false);assert.equal(h.body.style.overflow,'auto');assert.equal(h.leftBtn.attrs['aria-expanded'],'false');
  h.wide.matches=true;h.narrow.matches=false;h.wide.fire('change');assert.equal(h.list.parentElement,h.left);assert.equal(h.toc.parentElement,h.slot);assert.ok(h.toc.open);
});


test('TEXT print uses the original footnotes once, then restores the research workspace',()=>{
  const h=workspace();h.tabs[1].fire('click');assert.ok(h.notes.open);
  h.window.fire('beforeprint');assert.equal(h.notes.parentElement,h.printSlot);assert.ok(h.notes.hasAttribute('data-text-printing'));assert.equal(h.notes.open,false);
  h.window.fire('afterprint');assert.equal(h.notes.parentElement,h.slot);assert.equal(h.notes.hasAttribute('data-text-printing'),false);assert.ok(h.notes.open);
});

test('shared document copy tools copy the selected quote with provenance, section URL, and report clipboard failures', async()=>{
  const document=new El(),feedback=new El(),prose={innerText:'본문 단락'},note={innerText:'각주 설명'};
  const heading={id:'현재-절',getBoundingClientRect:()=>({top:120})};
  document.querySelector=s=>s==='[data-reader-feedback]'?feedback:s==='.ol-prose'?prose:s==='.ol-reader-footnotes-content .footnotes'?note:null;
  document.querySelectorAll=s=>s==='.ol-story-chapter > .ol-prose :is(h2,h3)'?[heading]:[];
  const copied=[];let selected='',clipboardFails=false;
  const navigator={clipboard:{async writeText(text){if(clipboardFails)throw Error('denied');copied.push(text);}}};
  const window={location:{pathname:'/text/read/example/',origin:'https://example.test'},addEventListener(){},setTimeout(){},getSelection:()=>({toString:()=>selected,anchorNode:{parentElement:{closest:()=>selected?{}:null}}})};
  evaluate('src/lib/client/document-reader.ts',{document,window,navigator,URL},{'./reader-drawer':{},'./reader-tools':{initReaderTools(){}}}).initDocumentReader();
  const dropdown={dataset:{copyTitle:'문서 제목',copyUrl:'/text/read/example/'},querySelector:()=>new El()};
  const click=async kind=>{
    const button=new El();button.dataset.copyKind=kind;button.closest=()=>dropdown;
    await document.handlers.click[0]({target:{closest:()=>button},stopPropagation(){}});
  };
  await click('citation');assert.equal(copied.length,0);assert.match(feedback.textContent,/먼저 선택/);
  selected='선택한 문장';await click('citation');assert.equal(copied.at(-1),'선택한 문장\n\n문서 제목 — BORIDO TEXT\nhttps://example.test/text/read/example/');
  await click('section');assert.equal(new URL(copied.at(-1)).hash,`#${encodeURIComponent('현재-절')}`);
  await click('markdown');assert.equal(copied.at(-1),'# 문서 제목\n\n본문 단락\n\n각주 설명');
  clipboardFails=true;await click('link');assert.match(feedback.textContent,/복사할 수 없습니다/);
});


test('TEXT below 1360px starts closed and allows manual opening',()=>{
  const h=workspace({opened:false,wideScreen:false});
  assert.equal(h.toc.open,false);assert.equal(h.notes.open,false);
  assert.ok(h.root.hasAttribute('data-text-left-hidden'));assert.ok(h.root.hasAttribute('data-text-right-hidden'));
  assert.equal(h.leftBtn.attrs['aria-expanded'],'false');
  h.leftBtn.fire('click');assert.equal(h.root.hasAttribute('data-text-left-hidden'),false);
  h.tabs[0].fire('click');assert.ok(h.toc.open);assert.equal(h.root.hasAttribute('data-text-right-hidden'),false);
});


test('an explicit incoming footnote link may open its aid without opening the document list',()=>{
  const h=workspace({opened:false,initialNote:true,wideScreen:false});
  assert.ok(h.notes.open);assert.equal(h.toc.open,false);assert.ok(h.root.hasAttribute('data-text-left-hidden'));
});


test('TEXT at 1360px and above starts with document list and TOC docked open',()=>{
  const h=workspace({opened:false});
  assert.ok(h.toc.open);assert.equal(h.notes.open,false);
  assert.equal(h.root.hasAttribute('data-text-left-hidden'),false);
  assert.equal(h.root.hasAttribute('data-text-right-hidden'),false);
  assert.equal(h.leftBtn.attrs['aria-expanded'],'true');
  h.leftBtn.fire('click');h.focusBtn.fire('click');h.focusBtn.fire('click');
  assert.ok(h.root.hasAttribute('data-text-left-hidden'));
});


test('STORY focus toggles its chapter sidebar layout and restores the default mode',()=>{
  const root=new El(),button=new El(),label=new El(),document=new El();
  root.select={'[data-story-focus]':button};button.select={'[data-text-focus-label]':label};
  document.select={'.ol-story-doc-page:not(.ol-text-reader)':root};
  const window={addEventListener(){}};
  evaluate('src/lib/client/document-reader.ts',{document,window,Event:class{constructor(type){this.type=type;}}},{'./reader-drawer':{},'./reader-tools':{initReaderTools(){}}}).initDocumentReader();
  assert.equal(root.hasAttribute('data-story-focus'),false);
  button.fire('click');assert.ok(root.hasAttribute('data-story-focus'));
  assert.equal(button.attrs['aria-pressed'],'true');assert.equal(label.textContent,'기본');
  button.fire('click');assert.equal(root.hasAttribute('data-story-focus'),false);
  assert.equal(button.attrs['aria-pressed'],'false');assert.equal(label.textContent,'집중');
});


function storyWorkspace(wideScreen = true, withList = false) {
  const root=new El(),slot=new El(),empty=new El(),body=new El(),wide=new El();
  wide.matches=wideScreen;
  const dialogs=['toc','footnotes'].map(type=>{const dialog=new El();dialog.id=`ol-reader-${type}`;dialog.parentElement=root;return dialog;});
  const buttons=['toc','footnotes'].map(type=>{const button=new El();button.dataset.readerPanel=type;return button;});
  root.select={'[data-reader-panel-slot]':slot,'[data-reader-panel-empty]':empty};
  root.lists={'.ol-reader-toc':dialogs,'[data-reader-panel]':buttons};
  slot.querySelectorAll=()=>dialogs.filter(dialog=>dialog.parentElement===slot && dialog.open);
  const document={body,querySelector:()=>root,createComment:()=>new El()};
  const Event=class{constructor(type,options){this.type=type;Object.assign(this,options);}};
  const narrow=new El(),left=new El(),list=new El(),mobile=new El(),mobileSlot=new El(),leftBtn=new El(),closeBtn=new El();
  narrow.matches=!wideScreen;
  if(withList) Object.assign(root.select,{'[data-story-left-toggle]':leftBtn,'#story-document-list':left,'[data-story-list-content]':list,'#story-list-dialog':mobile,'[data-story-mobile-list-slot]':mobileSlot,'[data-story-list-close]':closeBtn});
  const window={matchMedia:query=>query.includes('1360')?wide:narrow};
  const drawer=evaluate('src/lib/client/reader-drawer.ts',{document,window,Event,CustomEvent:Event});
  const controllers=dialogs.map(dialog=>{
    dialog.addEventListener('reader:panel',()=>root.fire('reader:panel'));
    return drawer.createReaderDrawer(dialog,new El(),null);
  });
  evaluate('src/lib/client/story-workspace.ts',{document,window,Event}).initStoryWorkspace();
  return {root,slot,empty,body,wide,dialogs,buttons,controllers,narrow,left,list,mobile,mobileSlot,leftBtn,closeBtn};
}
test('STORY desktop keeps one original aid open, switches tabs and preserves footnote return callbacks',()=>{
  const h=storyWorkspace();const [toc,notes]=h.dialogs;
  assert.ok(toc.open);assert.equal(toc.parentElement,h.slot);assert.equal(toc.dataset.persistent,'true');
  assert.equal(h.body.style.overflow,'');
  h.buttons[1].fire('click');assert.ok(notes.open);assert.equal(toc.open,false);
  assert.equal(h.buttons[1].attrs['aria-pressed'],'true');
  let returned=false;h.controllers[1].close(()=>returned=true);
  assert.ok(returned);assert.ok(notes.open);
  h.buttons[0].fire('click');assert.ok(toc.open);assert.equal(notes.open,false);
});
test('STORY resize restores original modal nodes without opening or locking the compact screen',()=>{
  const h=storyWorkspace();const [toc,notes]=h.dialogs;
  h.wide.matches=false;h.wide.fire('change');
  for(const dialog of h.dialogs){assert.equal(dialog.open,false);assert.equal(dialog.parentElement,h.root);assert.equal(dialog.dataset.docked,undefined);}
  h.controllers[1].open();assert.ok(notes.open);assert.equal(h.body.style.overflow,'hidden');
  h.wide.matches=true;h.wide.fire('change');
  assert.ok(notes.open);assert.equal(toc.open,false);assert.equal(notes.parentElement,h.slot);assert.equal(h.body.style.overflow,'');
  const compact=storyWorkspace(false);assert.equal(compact.dialogs.some(dialog=>dialog.open),false);
});


test('STORY focus hides both aids and restores the selected desktop tab',()=>{
  const h=storyWorkspace();h.buttons[1].fire('click');
  h.root.setAttribute('data-story-focus','');h.root.fire('reader:focus');
  assert.equal(h.dialogs.some(dialog=>dialog.open),false);
  h.root.removeAttribute('data-story-focus');h.root.fire('reader:focus');
  assert.ok(h.dialogs[1].open);assert.equal(h.dialogs[0].open,false);
});


test('STORY chapter toggle preserves desktop choice through focus and uses one modal list on mobile',()=>{
  const h=storyWorkspace(true,true);
  assert.equal(h.list.parentElement,h.left);
  assert.equal(h.leftBtn.attrs['aria-expanded'],'true');
  h.leftBtn.fire('click');
  assert.ok(h.root.hasAttribute('data-story-left-hidden'));
  assert.equal(h.leftBtn.attrs['aria-expanded'],'false');
  h.root.setAttribute('data-story-focus','');h.root.fire('reader:focus');
  h.root.removeAttribute('data-story-focus');h.root.fire('reader:focus');
  assert.equal(h.leftBtn.attrs['aria-expanded'],'false');
  h.leftBtn.fire('click');assert.equal(h.leftBtn.attrs['aria-expanded'],'true');
  h.narrow.matches=true;h.narrow.fire('change');
  assert.equal(h.list.parentElement,h.mobileSlot);
  assert.equal(h.leftBtn.attrs['aria-controls'],'story-list-dialog');
  assert.equal(h.mobile.open,false);
  h.leftBtn.fire('click');assert.ok(h.mobile.open);assert.equal(h.body.style.overflow,'hidden');
  h.mobile.fire('cancel');assert.equal(h.mobile.open,false);assert.equal(h.body.style.overflow,'');assert.ok(h.leftBtn.focused);
  h.leftBtn.fire('click');h.closeBtn.fire('click');assert.equal(h.mobile.open,false);
  h.leftBtn.fire('click');h.mobile.fire('click');assert.equal(h.mobile.open,false);
  h.leftBtn.fire('click');h.narrow.matches=false;h.narrow.fire('change');
  assert.equal(h.list.parentElement,h.left);assert.equal(h.mobile.open,false);assert.equal(h.body.style.overflow,'');
  assert.equal(h.leftBtn.attrs['aria-expanded'],'true');
});
