import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import {
  readRegistry,
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
const registry = readRegistry();
let count = 0;
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
const blog = fs.readFileSync("dist/blog/index.html", "utf8");
classes(
  blog,
  ["ol-post", "ol-blog-sidebar", "ol-blog-archive-list"],
  "BLOG index",
);
console.log(
  `UI markup/CSS regression checks passed for ${count} documents and BLOG index (not a browser interaction test).`,
);
