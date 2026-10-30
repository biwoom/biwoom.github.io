import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {prepare} from './prepare-content.mjs';
const before=fs.readFileSync('content-registry.json','utf8');
prepare();
if(before!==fs.readFileSync('content-registry.json','utf8')) {
 console.error('Registry changed during preparation. Run npm run prepare:content locally and commit content-registry.json with the content.');process.exitCode=1;
} else {
  execFileSync('git',['diff','--exit-code','HEAD','--','content-registry.json'],{stdio:'inherit'});
  console.log('Content registry is current and committed.');
}
