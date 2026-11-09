import { PROJECT_ROOT, projectPaths } from './lib/paths.mjs';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {prepare} from './prepare-content.mjs';
const before=fs.readFileSync(projectPaths().registry,'utf8');
prepare();
if(before!==fs.readFileSync(projectPaths().registry,'utf8')) {
 console.error('Registry changed during preparation. Run npm run prepare:content locally and commit content-registry.json with the content.');process.exitCode=1;
} else {
  execFileSync('git',['diff','--exit-code','HEAD','--','content-registry.json'],{stdio:'inherit',cwd:PROJECT_ROOT});
  console.log('Content registry is current and committed.');
}
