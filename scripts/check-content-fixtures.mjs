import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const scriptPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  'check-content.mjs',
);

async function writeFixture(root, slug, frontmatter, files = {}) {
  const entryDir = path.join(root, 'src', 'content', 'design', slug);
  await mkdir(path.join(entryDir, 'assets'), { recursive: true });
  await writeFile(
    path.join(entryDir, 'index.md'),
    `---\n${frontmatter.trim()}\n---\n\nFixture\n`,
  );

  await Promise.all(Object.entries(files).map(async ([relativePath, content]) => {
    const target = path.join(entryDir, relativePath);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content);
  }));
}

function runCheck(root, env = {}) {
  return spawnSync(
    process.execPath,
    [scriptPath, '--root', root, '--quiet'],
    {
      encoding: 'utf8',
      env: { ...process.env, ...env },
    },
  );
}

async function withTempRepo(test) {
  const root = await mkdtemp(path.join(tmpdir(), 'ol-content-check-'));
  try {
    await mkdir(path.join(root, 'src', 'content'), { recursive: true });
    await test(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

async function expectPass(name, setup, env) {
  await withTempRepo(async root => {
    await setup(root);
    const result = runCheck(root, env);
    if (result.status !== 0) {
      throw new Error(`${name} should pass:\n${result.stderr || result.stdout}`);
    }
  });
}

async function expectFail(name, setup, pattern, env) {
  await withTempRepo(async root => {
    await setup(root);
    const result = runCheck(root, env);
    const output = `${result.stderr}\n${result.stdout}`;
    if (result.status === 0) {
      throw new Error(`${name} should fail`);
    }
    if (!pattern.test(output)) {
      throw new Error(`${name} failed with unexpected output:\n${output}`);
    }
  });
}

const validDesignFrontmatter = `
title: "Fixture"
description: "Fixture description"
published: true
format: image
primaryKind: infographic
type: infographic
status: draft
version: "0.1"
license: "internal"
tags:
  - kind/fixture
thumbnailAsset: "thumb.jpg"
`;

await expectPass(
  'valid local asset',
  root => writeFixture(root, 'valid', validDesignFrontmatter, { 'assets/thumb.jpg': 'ok' }),
);

await expectFail(
  'deprecated field',
  root => writeFixture(root, 'deprecated', `${validDesignFrontmatter}\nthumbnailPath: "old.jpg"`, { 'assets/thumb.jpg': 'ok' }),
  /deprecated field is not allowed: thumbnailPath/,
);

await expectFail(
  'bad tag syntax',
  root => writeFixture(root, 'bad-tag', validDesignFrontmatter.replace('kind/fixture', 'kind:fixture'), { 'assets/thumb.jpg': 'ok' }),
  /tag must use prefix\/value format/,
);

await expectFail(
  'missing asset',
  root => writeFixture(root, 'missing-asset', validDesignFrontmatter),
  /thumbnailAsset not found: thumb\.jpg/,
);

await expectFail(
  'forbidden file',
  async root => {
    await writeFixture(root, 'forbidden', validDesignFrontmatter, { 'assets/thumb.jpg': 'ok' });
    await writeFile(path.join(root, '.DS_Store'), '');
  },
  /forbidden file/,
);

await expectPass(
  'design external manifest asset',
  async root => {
    await writeFixture(root, 'external', validDesignFrontmatter);
    await writeFile(
      path.join(root, 'design-assets.json'),
      JSON.stringify({ assets: ['external/thumb.jpg'] }),
    );
  },
  { DESIGN_ASSET_MANIFEST: 'design-assets.json' },
);

console.log('content fixture checks passed');
