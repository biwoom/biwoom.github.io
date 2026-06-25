import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { DESIGN_ASSET_MANIFEST } from '../site-config.mjs';

const { load } = yaml;

function readArgs(argv) {
  const options = {
    repoRoot: process.cwd(),
    quiet: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--root') {
      const root = argv[index + 1];
      if (!root) throw new Error('--root requires a path');
      options.repoRoot = path.resolve(root);
      index += 1;
      continue;
    }
    if (arg === '--quiet') {
      options.quiet = true;
      continue;
    }
    throw new Error(`unknown option: ${arg}`);
  }

  return options;
}

const options = readArgs(process.argv.slice(2));
const repoRoot = options.repoRoot;
const contentRoot = path.join(repoRoot, 'src', 'content');
const deprecatedFields = [
  'coverPath',
  'htmlPath',
  'imagePath',
  'pdfPath',
  'prefixTags',
  'previewPaths',
  'thumbnailPath',
];
const assetFields = [
  'coverAsset',
  'htmlAsset',
  'imageAsset',
  'pdfAsset',
  'previewAssets',
  'thumbnailAsset',
];
const defaultPublishedCollections = new Set(['entities', 'pages', 'story']);
const internalTagPrefixes = new Set([
  'feature',
  'format',
  'framework',
  'kind',
  'project',
  'text',
  'tool',
  'topic',
]);
const designAssetManifestPath = DESIGN_ASSET_MANIFEST
  ? path.resolve(repoRoot, DESIGN_ASSET_MANIFEST)
  : '';

function readAssetManifest(filePath) {
  if (!filePath) return null;
  if (!fs.existsSync(filePath)) {
    throw new Error(`DESIGN_ASSET_MANIFEST not found: ${path.relative(repoRoot, filePath)}`);
  }

  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const values = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed?.assets)
      ? parsed.assets
      : Object.keys(parsed ?? {});

  return new Set(values.map(value => String(value).replace(/^\/+/, '')));
}

const designAssetManifest = readAssetManifest(designAssetManifestPath);

function toPosix(value) {
  return value.split(path.sep).join('/');
}

function walkMarkdownFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkMarkdownFiles(entryPath));
      continue;
    }
    if (entry.isFile() && /\.(md|mdx)$/i.test(entry.name)) {
      files.push(entryPath);
    }
  }
  return files;
}

function walkForForbiddenFiles(dir, errors, relativeBase = '') {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const entryPath = path.join(dir, entry.name);
    const relativePath = path.posix.join(relativeBase, entry.name);
    if (entry.isDirectory()) {
      walkForForbiddenFiles(entryPath, errors, relativePath);
      continue;
    }
    if (entry.isFile() && entry.name === '.DS_Store') {
      errors.push(`${relativePath}: forbidden file`);
    }
  }
}

function parseFrontmatter(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  const match = source.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) {
    return { data: null, raw: '', source };
  }

  let data;
  try {
    data = load(match[1]) ?? {};
  } catch (error) {
    throw new Error(`frontmatter parse failed: ${error.message}`);
  }

  return { data, raw: match[1], source };
}

function isPublished(collection, data) {
  if (typeof data?.published === 'boolean') return data.published;
  return defaultPublishedCollections.has(collection);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidSlashTag(tag) {
  if (typeof tag !== 'string') return false;
  const [prefix, ...rest] = tag.split('/');
  return prefix.trim().length > 0 && rest.join('/').trim().length > 0;
}

function resolveAssetPaths(filePath, assetValue) {
  const normalized = assetValue.trim().replace(/^\.\//, '').replace(/^\/+/, '');
  const baseDir = path.dirname(filePath);
  return [
    path.resolve(baseDir, normalized),
    path.resolve(baseDir, 'assets', normalized),
  ];
}

function getContentEntryId(collection, filePath) {
  const relativePath = toPosix(path.relative(path.join(contentRoot, collection), filePath));
  if (path.posix.basename(relativePath).match(/^index\.mdx?$/i)) {
    return path.posix.dirname(relativePath);
  }
  return relativePath.replace(/\.mdx?$/i, '');
}

function assetExists(collection, filePath, assetValue) {
  const normalized = assetValue.trim().replace(/^\.\//, '').replace(/^\/+/, '');

  if (collection === 'design' && designAssetManifest) {
    const entryId = getContentEntryId(collection, filePath);
    return designAssetManifest.has(`${entryId}/${normalized}`);
  }

  return resolveAssetPaths(filePath, assetValue).some(candidate => fs.existsSync(candidate));
}

function checkRequiredMeta(collection, filePath, data, errors) {
  const relativePath = toPosix(path.relative(repoRoot, filePath));
  const published = isPublished(collection, data);
  if (!published) return;

  const missing = [];

  if (collection !== 'entities' && !isNonEmptyString(data.title)) missing.push('title');

  if (collection === 'blog') {
    if (!isNonEmptyString(data.description)) missing.push('description');
    if (!(data.date instanceof Date) || Number.isNaN(data.date.valueOf())) missing.push('date');
  }

  if (collection === 'design') {
    if (!isNonEmptyString(data.description)) missing.push('description');
    const hasAsset = assetFields.some(field => {
      const value = data[field];
      return typeof value === 'string'
        ? isNonEmptyString(value)
        : Array.isArray(value) && value.length > 0;
    });
    if (!hasAsset) missing.push('one of thumbnailAsset/imageAsset/previewAssets/htmlAsset/pdfAsset/coverAsset');
  }

  if (collection === 'text' || collection === 'story') {
    if (!isNonEmptyString(data.seriesSlug)) missing.push('seriesSlug');
    if (data.kind === 'series' && !isNonEmptyString(data.description)) missing.push('description');
  }

  if (collection === 'pages' && !isNonEmptyString(data.description)) {
    missing.push('description');
  }

  if (collection === 'entities') {
    if (!isNonEmptyString(data.id)) missing.push('id');
    if (!isNonEmptyString(data.type)) missing.push('type');
    if (!isNonEmptyString(data?.name?.ko)) missing.push('name.ko');
  }

  if (missing.length > 0) {
    errors.push(`${relativePath}: missing required metadata for published content: ${missing.join(', ')}`);
  }
}

function checkTags(collection, filePath, data, errors) {
  const relativePath = toPosix(path.relative(repoRoot, filePath));
  if (!Object.prototype.hasOwnProperty.call(data, 'tags')) return;

  if (!Array.isArray(data.tags)) {
    errors.push(`${relativePath}: tags must be an array`);
    return;
  }

  for (const tag of data.tags) {
    if (!isValidSlashTag(tag)) {
      errors.push(`${relativePath}: tag must use prefix/value format: ${String(tag)}`);
    }
  }

  if ((collection === 'text' || collection === 'story') && data.tags.some(tag => {
    const [prefix] = String(tag).split('/');
    return internalTagPrefixes.has(prefix);
  })) {
    // Allowed in storage by policy. No error; validator only preserves slash syntax.
  }
}

function checkDeprecatedFields(filePath, data, errors) {
  const relativePath = toPosix(path.relative(repoRoot, filePath));
  for (const field of deprecatedFields) {
    if (Object.prototype.hasOwnProperty.call(data, field)) {
      errors.push(`${relativePath}: deprecated field is not allowed: ${field}`);
    }
  }
}

function checkAssetFields(collection, filePath, data, errors) {
  const relativePath = toPosix(path.relative(repoRoot, filePath));
  for (const field of assetFields) {
    if (!Object.prototype.hasOwnProperty.call(data, field)) continue;
    const value = data[field];

    if (typeof value === 'string') {
      if (!isNonEmptyString(value)) continue;
      const exists = assetExists(collection, filePath, value);
      if (!exists) {
        errors.push(`${relativePath}: ${field} not found: ${value}`);
      }
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (!isNonEmptyString(item)) {
          errors.push(`${relativePath}: ${field} contains an empty value`);
          continue;
        }
        const exists = assetExists(collection, filePath, item);
        if (!exists) {
          errors.push(`${relativePath}: ${field} not found: ${item}`);
        }
      }
      continue;
    }

    if (value != null) {
      errors.push(`${relativePath}: ${field} must be a string or string[]`);
    }
  }
}

const errors = [];

for (const filePath of walkMarkdownFiles(contentRoot)) {
  const relativePath = toPosix(path.relative(repoRoot, filePath));
  const collection = toPosix(path.relative(contentRoot, filePath)).split('/')[0];

  let parsed;
  try {
    parsed = parseFrontmatter(filePath);
  } catch (error) {
    errors.push(`${relativePath}: ${error.message}`);
    continue;
  }

  if (!parsed.data || typeof parsed.data !== 'object') {
    errors.push(`${relativePath}: missing or invalid frontmatter`);
    continue;
  }

  checkDeprecatedFields(filePath, parsed.data, errors);
  checkTags(collection, filePath, parsed.data, errors);
  checkAssetFields(collection, filePath, parsed.data, errors);
  checkRequiredMeta(collection, filePath, parsed.data, errors);
}

walkForForbiddenFiles(repoRoot, errors);

if (errors.length > 0) {
  console.error(`content check failed with ${errors.length} issue(s):`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

if (!options.quiet) {
  console.log('content check passed');
}
