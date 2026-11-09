import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { projectPaths } from './lib/paths.mjs';
import { readRegistry, categoryFolders } from './lib/content.mjs';

test('default content paths and readers do not depend on the shell working directory', () => {
  const elsewhere = fs.mkdtempSync(path.join(os.tmpdir(), 'ol-cwd-'));
  try {
    const pathsModule = pathToFileURL(path.join(projectPaths().scripts, 'lib/paths.mjs')).href;
    const contentModule = pathToFileURL(path.join(projectPaths().scripts, 'lib/content.mjs')).href;
    const code = `import {projectPaths} from ${JSON.stringify(pathsModule)};
      import {readRegistry,categoryFolders} from ${JSON.stringify(contentModule)};
      console.log(JSON.stringify({paths:projectPaths(),files:Object.keys(readRegistry().files),categories:categoryFolders('text')}));`;
    const actual = JSON.parse(execFileSync(process.execPath, ['--input-type=module', '-e', code], { cwd: elsewhere, encoding: 'utf8' }));
    assert.deepEqual(actual, { paths: projectPaths(), files: Object.keys(readRegistry().files), categories: categoryFolders('text') });
    execFileSync(process.execPath, [path.join(projectPaths().scripts, 'check-content.mjs')], { cwd: elsewhere, stdio: 'pipe' });
  } finally { fs.rmSync(elsewhere, { recursive: true, force: true }); }
});

test('CLI initialization and moves use an explicit vault root with Korean names and spaces', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ol 경로-'));
  const before = fs.readFileSync(projectPaths().registry, 'utf8');
  const oldSource = 'text/분류/문헌/번역/001.처음.md', newSource = 'text/분류/문헌/번역/002.이동.md';
  try {
    const file = path.join(projectPaths(root).content, oldSource);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, '# 경로 테스트\n\n원문을 보존합니다.');
    execFileSync(process.execPath, [path.join(projectPaths().scripts, 'prepare-content.mjs'), '--init', '--root', root], { cwd: os.tmpdir() });
    const original = readRegistry(root).files[oldSource];
    fs.renameSync(file, path.join(projectPaths(root).content, newSource));
    execFileSync(process.execPath, [path.join(projectPaths().scripts, 'content-move.mjs'), oldSource, newSource, '--root', root], { cwd: os.tmpdir() });
    assert.deepEqual(readRegistry(root).files[newSource], original);
    assert.equal(readRegistry(root).files[oldSource], undefined);
    assert.equal(fs.readFileSync(projectPaths().registry, 'utf8'), before);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
