import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import {
  readRegistry,
  categoryFolders,
  normalize,
  walk,
  markdownPattern,
} from "./lib/content.mjs";

// Regression checks for UI failures that a successful build and link audit cannot detect.
const css = walk("dist/_astro", { assets: true })
  .filter((p) => p.endsWith(".css"))
  .map((p) => fs.readFileSync(p, "utf8"))
  .join("\n");
const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
function rule(selector, property) {
  assert.ok(
    rules.some(
      ([, selectors, body]) =>
        selectors.includes(selector) && property.test(body),
    ),
    `Missing compiled CSS: ${selector} (${property})`,
  );
}
function hasClass(html, name) {
  return [...html.matchAll(/\bclass="([^"]*)"/g)].some(([, value]) =>
    value.split(/\s+/).includes(name),
  );
}
function classes(html, names, label) {
  for (const name of names)
    assert.ok(hasClass(html, name), `${label}: missing ${name}`);
}
function overlay(html, id, label) {
  const tag = html.match(new RegExp(`<div[^>]*id="${id}"[^>]*>`))?.[0];
  assert.ok(tag, `${label}: missing ${id}`);
  assert.match(tag, /\shidden(?:\s|=|>)/, `${label}: ${id} must start hidden`);
  assert.match(tag, /\sinert(?:\s|=|>)/, `${label}: ${id} must start inert`);
  assert.match(
    tag,
    /aria-hidden="true"/,
    `${label}: ${id} must start aria-hidden`,
  );
}
rule(".ol-search-overlay", /position:fixed/);
rule(".ol-search-overlay[hidden]", /display:none/);
rule(".ol-mobile-overlay", /position:fixed/);
rule(".ol-mobile-overlay[hidden]", /display:none/);
rule(".ol-search-modal", /display:flex/);
rule(".ol-story-doc-hero h1", /font-size:/);
rule(".ol-blog-detail-title", /font-size:/);
rule(".ol-post", /display:grid/);
rule(".ol-story-reader-page.ol-story-doc-page", /width:100%/);
rule(".ol-story-doc-page .ol-story-part-content .ol-prose", /max-width:1200px/);
rule(".ol-reader-toc:not([open])", /display:none/);
rule(".ol-reader-toc-panel", /transform:translate(?:X)?\(100%\)/);
rule(".ol-story-doc-page .ol-reader-toolbar", /position:sticky/);
rule(".ol-story-doc-page .ol-story-reader-shell", /overflow:clip/);
rule(".ol-story-doc-page .ol-story-part-content-head h2", /max-width:1200px/);
const registry = readRegistry();
let count = 0;
const drawerCounts = { text: 0, story: 0 };
for (const [source, record] of Object.entries(registry.files)) {
  const collection = source.split("/")[0],
    file = path.join("src/content", source);
  if (
    !["text", "story", "blog"].includes(collection) ||
    !markdownPattern.test(source) ||
    !fs.existsSync(file)
  )
    continue;
  const data = normalize(source, fs.readFileSync(file, "utf8"), registry);
  if (!data.published || data.kind === "series") continue;
  const html = fs.readFileSync(
    path.join("dist", record.url, "index.html"),
    "utf8",
  );
  overlay(html, "ol-search-overlay", record.url);
  overlay(html, "ol-mobile-overlay", record.url);
  const isLibrary = collection === "text" || collection === "story";
  const expected = isLibrary
    ? [
        "ol-story-doc-page",
        "ol-story-doc-hero",
        "ol-story-part-sidebar",
        "ol-story-part-content",
      ]
    : ["ol-blog-detail-header", "ol-blog-detail-title", "ol-blog-detail-meta"];
  classes(html, [...expected, "ol-prose"], record.url);
  if (isLibrary) {
    assert.ok(!hasClass(html, "ol-doc-side-stack--story"), `${record.url}: obsolete right TOC column`);
    assert.ok(!html.includes("data-story-mobile-toc"), `${record.url}: duplicate mobile TOC`);
    const drawer = html.match(/<dialog[^>]*id="ol-reader-toc"[^>]*>/)?.[0];
    if (drawer) {
      drawerCounts[collection]++;
      assert.ok(!/\sopen(?:\s|=|>)/.test(drawer), `${record.url}: drawer must start closed`);
      assert.match(drawer, /aria-labelledby="ol-reader-toc-title"/);
      assert.match(html, /aria-controls="ol-reader-toc"/);
      assert.match(html, /data-reader-toc-close/);
    }
    assert.ok(
      !hasClass(html, "ol-text-doc-shell"),
      `${record.url}: legacy TEXT layout`,
    );
    assert.ok(
      html.includes(`data-reader-section="${collection}"`),
      `${record.url}: incorrect reader collection`,
    );
    assert.match(
      html,
      new RegExp(
        `data-pagefind-meta="section\\[content\\]" content="${collection.toUpperCase()}"`,
      ),
      `${record.url}: incorrect search section`,
    );
  }
  const titleClass = isLibrary ? "ol-story-doc-hero" : "ol-blog-detail-header";
  const titleTag = isLibrary ? "section" : "header";
  const titleArea =
    html.match(
      new RegExp(
        `<${titleTag}[^>]*class="[^"]*${titleClass}[^"]*"[^>]*>([\\s\\S]*?)</${titleTag}>`,
      ),
    )?.[1] ?? "";
  assert.equal(
    (titleArea.match(/<h1\b/g) ?? []).length,
    1,
    `${record.url}: expected one primary title`,
  );
  assert.ok(
    !hasClass(html, "ol-reading-page"),
    `${record.url}: obsolete generic reader`,
  );
  count++;
}
for (const [collection, total] of Object.entries(drawerCounts)) {
  assert.ok(total > 0, `${collection}: no document TOC drawer generated`);
}
// Menu roots list categories; category pages list only their own public series.
for (const section of ["text", "story"]) {
  const index = fs.readFileSync(`dist/${section}/index.html`, "utf8");
  classes(index, ["ol-grid-3"], `${section} categories`);
  assert.match(index, /data-library-view="categories"/);
  assert.ok(!index.includes("ol-category-filter"), `${section}: obsolete category buttons`);
  const series = new Map();
  for (const [source] of Object.entries(registry.files)) {
    if (!source.startsWith(`${section}/`) || !fs.existsSync(`src/content/${source}`)) continue;
    const data = normalize(source, markdownPattern.test(source) ? fs.readFileSync(`src/content/${source}`, "utf8") : "", registry);
    if (data.published) series.set(data.seriesKey, data.seriesUrl);
  }
  const categories = categoryFolders(section);
  assert.equal((index.match(/data-library-category=/g) ?? []).length, categories.length);
  for (const category of categories) {
    assert.ok(index.includes(`href="${category.url}"`), `${section}: missing category link ${category.label}`);
    const html = fs.readFileSync(path.join("dist", category.url, "index.html"), "utf8");
    assert.match(html, /data-library-view="series"/);
    classes(html, ["ol-grid-3"], category.url);
    const expected = [...series].filter(([key]) => key.startsWith(category.key + "/"));
    assert.equal((html.match(/data-library-item(?:\s|>|=)/g) ?? []).length, expected.length, `${category.label}: incorrect series count`);
    for (const [key, url] of series)
      assert.equal(html.includes(`href="${url}"`), key.startsWith(category.key + "/"), `${category.label}: incorrect series membership ${key}`);
    if (!expected.length) assert.ok(html.includes("준비 중입니다."));
  }
}
const blog = fs.readFileSync("dist/blog/index.html", "utf8");
classes(
  blog,
  ["ol-post", "ol-blog-sidebar", "ol-blog-archive-list"],
  "BLOG index",
);
console.log(
  `UI markup/CSS regression checks passed for ${count} documents and BLOG index (not a browser interaction test).`,
);
