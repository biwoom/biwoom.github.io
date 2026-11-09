import path from 'node:path';
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
