import fs from "node:fs";
import path from "node:path";
import { SITE_URL, LEGACY_HUB_BASE } from "../../site-config.mjs";
import { projectPaths } from "./lib/paths.mjs";
import { walk } from "./lib/content.mjs";

const { dist } = projectPaths();
const legacyDir = LEGACY_HUB_BASE.slice(1);
const newSections = new Set(["articles", "categories", "saved", "series", "stories", "tags", "topics"]);
let redirects = 0;

for (const file of walk(dist, { assets: true })) {
  const relative = path.relative(dist, file);
  const topLevel = relative.split(path.sep)[0];
  if (topLevel === legacyDir || topLevel === "generated" || newSections.has(topLevel)) continue;
  if (path.basename(relative) !== "index.html") continue;
  const canonical = fs.readFileSync(file, "utf8").match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (!canonical) continue;
  const target = new URL(canonical);
  if (target.origin !== SITE_URL || target.pathname.startsWith(LEGACY_HUB_BASE + "/")) continue;
  const targetPath = target.pathname.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
  const output = path.join(dist, legacyDir, relative);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, [
    '<!doctype html><html lang="ko"><head><meta charset="utf-8">',
    '<meta name="robots" content="noindex">',
    '<link rel="canonical" href="' + SITE_URL + targetPath + '">',
    '<noscript><meta http-equiv="refresh" content="0;url=' + targetPath + '"></noscript>',
    '<title>비움 · 이동 안내</title></head><body>',
    '<a id="legacy-target" href="' + targetPath + '">새 주소에서 열기</a>',
    '<script>const target = document.getElementById("legacy-target");',
    'target.href += location.search + location.hash; location.replace(target.href);</script>',
    '</body></html>',
  ].join(""));
  redirects++;
}

// Keep direct links to files that were published by the former project site.
for (const folder of ["text", "story", "blog", "pages", "media", "ebook"]) {
  const relative = path.join("generated", "content", folder);
  const source = path.join(dist, relative);
  if (fs.existsSync(source)) fs.cpSync(source, path.join(dist, legacyDir, relative), { recursive: true });
}
console.log("Generated " + redirects + " old HUB page redirects.");
