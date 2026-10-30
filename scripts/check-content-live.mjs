import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import {spawn} from 'node:child_process';
const source=process.cwd(),root=fs.mkdtempSync(path.join(os.tmpdir(),'ol-live-'));
for(const f of ['src','scripts','astro.config.mjs','site-config.mjs','package.json','tsconfig.json','public']) if(fs.existsSync(f))fs.cpSync(f,path.join(root,f),{recursive:true,filter:p=>!p.includes('src/content/')&&!p.endsWith('src/content')&&!p.includes('public/generated')});
fs.symlinkSync(path.join(source,'node_modules'),path.join(root,'node_modules'),'dir');fs.writeFileSync(path.join(root,'content-registry.json'),JSON.stringify({version:1,files:{},folders:{},redirects:{},aliases:{}}));
const write=(rel,body)=>{const f=path.join(root,'src/content',rel);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,body);};
write('text/C/W/P/A.md','# Live document');write('text/C/W/P/file.pdf','%PDF-test');write('text/C/W/index.md','# Work');
write('blog/rights.md','---\nlicense: CC-BY\nrightsHolder: Rights Owner\ncopyrightNotice: Special notice\n---\n# Rights test');
const child=spawn('npm',['run','dev','--','--host','127.0.0.1','--port','4399'],{cwd:root,stdio:['ignore','pipe','pipe'],detached:true});let log='';child.stdout.on('data',d=>log+=d);child.stderr.on('data',d=>log+=d);
const get=async p=>{try{return await (await fetch('http://127.0.0.1:4399'+p)).text();}catch{return '';}};
const until=async(fn,label)=>{const deadline=Date.now()+18000;while(Date.now()<deadline){if(await fn())return;await new Promise(r=>setTimeout(r,300));}throw new Error(label+'\n'+log.slice(-3500));};
try{
await until(async()=> (await get('/text/')).includes('W'),'initial series');
const reg=()=>JSON.parse(fs.readFileSync(path.join(root,'content-registry.json'),'utf8'));
const series=reg().folders['text/C/W'].url;
const rights=reg().files['blog/rights.md'].url;
await until(async()=>{const html=await get(rights);return html.includes('Rights Owner') && html.includes('CC-BY') && html.includes('Special notice');},'BLOG rights rendering');
await until(async()=> (await get(series)).includes('Live document'),'initial document');
write('text/C/W/index.md','---\npublished: false\n---\n# Work');
await until(async()=> !(await get('/text/')).includes('href="'+series+'"'),'hide series without restart');
write('text/C/W/index.md','# Work');
await until(async()=> (await get(series)).includes('Live document') && (await get(series)).includes('PDF'),'restore docs and media without restart');
write('text/C/New/P/New.md','# Added live');
await until(async()=>{const r=reg();const f=r.folders['text/C/New'];return f && (await get(f.url)).includes('Added live');},'new folder without restart');
console.log('LIVE PASS: intro public/private/public, Markdown + PDF refresh, new folder and document, BLOG rights rendering.');
}finally{try{process.kill(-child.pid,'SIGTERM');}catch{}await new Promise(r=>setTimeout(r,500));fs.rmSync(root,{recursive:true,force:true});}
