import { createHash } from 'node:crypto';
import { cp, mkdir, readdir, readFile, rmdir, stat, unlink } from 'node:fs/promises';
import path from 'node:path';
import { DESIGN_ASSET_PROVIDER } from '../site-config.mjs';

const root = new URL('..', import.meta.url).pathname;

const assetCollections = [
  { name: 'design', source: 'src/content/design', target: 'public/generated/design', providerEnv: 'DESIGN_ASSET_PROVIDER' },
  { name: 'story', source: 'src/content/story', target: 'public/generated/story' },
];

async function pathExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function findAssetDirs(baseDir) {
  const found = [];

  async function walk(currentDir, relativeDir = '') {
    const entries = await readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith('.')) continue;

      const absolute = path.join(currentDir, entry.name);
      const relative = path.join(relativeDir, entry.name);

      if (entry.name === 'assets') {
        found.push({ source: absolute, slug: relativeDir });
        continue;
      }

      await walk(absolute, relative);
    }
  }

  if (await pathExists(baseDir)) {
    await walk(baseDir);
  }

  return found;
}

async function collectFiles(baseDir) {
  const files = [];

  async function walk(currentDir, relativeDir = '') {
    if (!(await pathExists(currentDir))) return;

    const entries = await readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;

      const absolute = path.join(currentDir, entry.name);
      const relative = path.join(relativeDir, entry.name);

      if (entry.isDirectory()) {
        await walk(absolute, relative);
        continue;
      }

      if (entry.isFile()) {
        files.push({ absolute, relative });
      }
    }
  }

  await walk(baseDir);
  return files;
}

async function fileHash(filePath) {
  const content = await readFile(filePath);
  return createHash('sha256').update(content).digest('hex');
}

async function shouldCopyFile(sourceFile, targetFile) {
  if (!(await pathExists(targetFile))) return true;

  const [sourceStat, targetStat] = await Promise.all([
    stat(sourceFile),
    stat(targetFile),
  ]);

  if (sourceStat.size !== targetStat.size) return true;

  const [sourceHash, targetHash] = await Promise.all([
    fileHash(sourceFile),
    fileHash(targetFile),
  ]);

  return sourceHash !== targetHash;
}

async function pruneEmptyDirs(baseDir) {
  if (!(await pathExists(baseDir))) return;

  async function walk(currentDir) {
    const entries = await readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        await walk(path.join(currentDir, entry.name));
      }
    }

    if (currentDir === baseDir) return;

    const remaining = await readdir(currentDir);
    if (remaining.length === 0) {
      await rmdir(currentDir);
    }
  }

  await walk(baseDir);
}

for (const collection of assetCollections) {
  if (collection.providerEnv && DESIGN_ASSET_PROVIDER === 'external') {
    console.log(`[sync:assets] ${collection.name}: skipped (${collection.providerEnv}=external)`);
    continue;
  }

  const sourceBase = path.join(root, collection.source);
  const targetBase = path.join(root, collection.target);
  const desiredFiles = new Set();
  const summary = { copied: 0, removed: 0, unchanged: 0 };

  await mkdir(targetBase, { recursive: true });

  for (const assetDir of await findAssetDirs(sourceBase)) {
    if (!assetDir.slug) {
      throw new Error(`${collection.name} assets directory must be inside an entry folder.`);
    }

    for (const sourceFile of await collectFiles(assetDir.source)) {
      const targetRelative = path.join(assetDir.slug, sourceFile.relative);
      const targetFile = path.join(targetBase, targetRelative);

      desiredFiles.add(targetRelative);
      await mkdir(path.dirname(targetFile), { recursive: true });

      if (await shouldCopyFile(sourceFile.absolute, targetFile)) {
        await cp(sourceFile.absolute, targetFile, { force: true, preserveTimestamps: true });
        summary.copied += 1;
      } else {
        summary.unchanged += 1;
      }
    }
  }

  for (const targetFile of await collectFiles(targetBase)) {
    if (!desiredFiles.has(targetFile.relative)) {
      await unlink(targetFile.absolute);
      summary.removed += 1;
    }
  }

  await pruneEmptyDirs(targetBase);

  console.log(
    `[sync:assets] ${collection.name}: ${summary.copied} copied, ${summary.unchanged} unchanged, ${summary.removed} removed`,
  );
}
