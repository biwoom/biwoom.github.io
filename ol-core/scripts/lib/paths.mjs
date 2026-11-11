import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

// Repository root is fixed by this module, independently of the shell's working directory.
export const PROJECT_ROOT = path.resolve(fileURLToPath(new URL('../../../', import.meta.url)));
export function projectPaths(root = PROJECT_ROOT) {
  const repository = path.resolve(root);
  const core = path.join(repository, 'ol-core');
  const publicDir = path.join(core, 'public');
  return {
    root: repository,
    core,
    content: path.join(repository, 'content'),
    src: path.join(core, 'src'),
    scripts: path.join(core, 'scripts'),
    public: publicDir,
    generated: path.join(publicDir, 'generated'),
    dist: path.join(repository, 'dist'),
    astro: path.join(repository, '.astro'),
    registry: path.join(repository, 'content-registry.json'),
  };
}

export function isMainModule(url) {
  return Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(url);
}

// Vault keys are NFC POSIX paths; absolute filesystem roots retain their native spelling.
export function normalizeContentPath(value) {
  return value.split(path.sep).join('/').normalize('NFC');
}
export function relativeContentPath(file, root = PROJECT_ROOT) {
  return normalizeContentPath(path.relative(projectPaths(root).content, file));
}
export function readContentDirectory(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const seen = new Map();
  for (const entry of entries) {
    const key = normalizeContentPath(entry.name);
    if (seen.has(key)) throw new Error(`Unicode path collision in ${directory}: ${seen.get(key)} / ${entry.name}`);
    seen.set(key, entry.name);
  }
  return entries;
}
// Linux can also contain physically decomposed filenames. Resolve them without renaming files.
export function contentFile(relative, root = PROJECT_ROOT) {
  const base = projectPaths(root).content;
  const canonical = normalizeContentPath(relative);
  const candidate = path.resolve(base, canonical);
  const within = path.relative(base, candidate);
  if (within === '..' || within.startsWith(`..${path.sep}`) || path.isAbsolute(within)) throw new Error(`Path escapes the content vault: ${relative}`);
  if (fs.existsSync(candidate)) return candidate;
  let current = base;
  for (const segment of within.split(path.sep)) {
    const entry = fs.existsSync(current) && fs.statSync(current).isDirectory()
      ? readContentDirectory(current).find(e => normalizeContentPath(e.name) === segment) : undefined;
    current = path.join(current, entry?.name ?? segment);
  }
  return current;
}
