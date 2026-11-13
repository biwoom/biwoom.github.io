import { PROJECT_ROOT, projectPaths, isMainModule } from './lib/paths.mjs';
import fs from "node:fs";
import path from "node:path";
import { walk, readRegistry, activeRedirects } from "./lib/content.mjs";
export function checkBuiltLinks(projectRoot = PROJECT_ROOT) {
  const root = projectPaths(projectRoot).dist,
    errors = [];
  const htmlFiles = walk(root, { assets: true }).filter(
    (p) => p.endsWith(".html"),
  );
  // Cache only within this check; repeated footnotes should not reread a page.
  const pages = new Map();
  const readPage = file => {
    if (!pages.has(file)) pages.set(file, fs.readFileSync(file, "utf8"));
    return pages.get(file);
  };
  for (const file of htmlFiles) {
    const html = readPage(file);
    const markup = html.replace(/<!--([\s\S]*?)-->/g, "").replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, block => block.slice(0, block.indexOf(">") + 1));
    const tags = [
      ...markup.matchAll(
        /<(?:a|img|script|link|source|iframe|video|audio)\b[^>]*>/g,
      ),
    ]
      .map((m) => m[0])
      .join("\n");
    for (const [, attribute, value] of tags.matchAll(/\b(href|src)="([^"]+)"/g)) {
      if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(value)) continue;
      const [raw, fragment] = value.replaceAll("&amp;", "&").split("#");
      let target;
      try {
        target = raw.startsWith("/")
          ? path.join(root, decodeURIComponent(raw.split("?")[0]))
          : raw
            ? path.resolve(
                path.dirname(file),
                decodeURIComponent(raw.split("?")[0]),
              )
            : file;
      } catch {
        continue;
      }
      if (fs.existsSync(target) && fs.statSync(target).isDirectory())
        target = path.join(target, "index.html");
      if (!fs.existsSync(target)) {
        errors.push(
          `${path.relative(root, file)}: missing ${attribute} ${value}`,
        );
        continue;
      }
      if (
        attribute === "href" &&
        fragment &&
        target.endsWith(".html") &&
        !target.includes("/generated/")
      ) {
        const dest = readPage(target);
        const contains = id => dest.includes(`id="${id}"`) || dest.includes(`name="${id}"`);
        // Match reader navigation: generated footnote IDs can contain literal %XX.
        let found = contains(fragment);
        if (!found) {
          try { found = contains(decodeURIComponent(fragment)); }
          catch { /* A malformed fragment is a missing target, not a fatal error. */ }
        }
        if (!found) errors.push(`${path.relative(root, file)}: missing anchor ${value}`);
      }
    }
  }
  const registry = readRegistry(projectRoot);
  const redirects = activeRedirects(registry, projectRoot);
  for (const [route, to] of Object.entries(redirects)) {
    const target = path.join(root, to, "index.html");
    if (!fs.existsSync(target))
      errors.push(`redirect ${route}: missing target ${to}`);
  }
  return { errors: [...new Set(errors)], pageCount: htmlFiles.length, redirectCount: Object.keys(redirects).length };
}

if (isMainModule(import.meta.url)) {
  const { errors, pageCount, redirectCount } = checkBuiltLinks();
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exitCode = 1;
  } else {
    console.log(`Built links verified across ${pageCount} pages and ${redirectCount} redirects.`);
  }
}
