import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { SITE_URL } from "../site-config.mjs";
import { walk } from "./lib/content.mjs";

const root = path.resolve("dist");
const origin = new URL(SITE_URL).origin;
let checked = 0;
function verify(value, file) {
  assert.equal(new URL(value).origin, origin, `${file}: unexpected production URL ${value}`);
  checked++;
}
for (const file of walk(root, { assets: true })) {
  const relative = path.relative(root, file);
  if (file.endsWith(".html")) {
    const html = fs.readFileSync(file, "utf8");
    for (const [tag] of html.matchAll(/<(?:link|meta)\b[^>]*>/gi)) {
      const attrs = Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [key, value]));
      if (attrs.rel === "canonical") verify(attrs.href, relative);
      if (["og:url", "og:image"].includes(attrs.property)) verify(attrs.content, relative);
    }
  } else if (/^sitemap.*\.xml$/.test(relative) || relative === "rss.xml") {
    const xml = fs.readFileSync(file, "utf8");
    const urls = [...xml.matchAll(/<(?:loc|link)>([^<]+)<\/(?:loc|link)>/g)];
    assert.ok(urls.length, `${relative}: missing production URLs`);
    for (const [, value] of urls) verify(value, relative);
  }
}
const robots = fs.readFileSync(path.join(root, "robots.txt"), "utf8");
assert.deepEqual([...robots.matchAll(/^Sitemap:\s*(\S+)/gm)].map(([, value]) => value), [`${origin}/sitemap-index.xml`]);
assert.ok(checked, "No production metadata found in dist");
console.log(`Production domain verified: ${origin} (${checked} metadata/feed/sitemap URLs and robots.txt).`);
