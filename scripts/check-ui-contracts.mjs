import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { syncMediaGallery, getMediaCategories } from "./lib/media-gallery.mjs";
import {
  readRegistry,
  nameInfo,
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
rule(".ol-story-doc-page .ol-story-part-content .ol-prose", /max-width:780px/);
rule(".ol-story-doc-page .ol-story-part-content .ol-prose", /font-size:17px/);
rule(".ol-story-doc-page .ol-story-part-content .ol-prose", /line-height:1.95/);
rule(".ol-story-doc-page .ol-story-part-content .ol-prose", /font-family:var\(--ol-reader-serif\)/);
rule(".ol-story-reader-page.ol-story-doc-page [data-reader-scalable]", /font-size:calc/);
rule(".ol-ebook-dialog", /position:fixed/);
rule(".ol-ebook-dialog", /inset:0/);
rule(".ol-ebook-dialog", /margin:auto/);
rule(".ol-reader-toc:not([open])", /display:none/);
rule(".ol-reader-toc-panel", /transform:translate(?:X)?\(0\)/);
rule(":root:has(.ol-story-doc-page)", /scrollbar-gutter:stable/);
rule(".ol-reader-toc::backdrop", /animation:[^;]*ol-reader-backdrop-in/);
rule(".ol-story-doc-page .ol-reader-toolbar", /position:sticky/);
rule(".ol-story-doc-page .ol-story-reader-shell", /overflow:clip/);
rule(".ol-story-doc-page .ol-story-part-content-head h2", /max-width:1200px/);
rule(".ol-reader-font-panel", /position:fixed/);
rule(".ol-reader-font-panel", /transform:translate(?:X)?\(-50%(?:,0)?\)/);
rule(".ol-reader-font-panel", /grid-template-columns:minmax\(0,1fr\)/);
rule(".ol-reader-font-panel", /top:var\(--ol-reader-font-top/);
rule(".ol-reader-footnotes-label", /display:inline/);
rule("[data-active-footnote-ref]", /font-weight:800/);
rule("body:has(.ol-text-academic)", /--ol-accent:#274e65/);
rule("body:has(.ol-text-reader) .ol-header", /position:relative/);
rule(".ol-text-reader .ol-text-parts", /position:static/);
rule(".ol-text-reader .ol-reader-toolbar", /top:0/);
rule(".ol-text-reader [data-text-focus]", /display:none/);
rule(".ol-text-reader .ol-text-list-label-compact", /display:inline/);
rule(".ol-text-workspace-grid", /grid-template-columns:240px minmax\(0,1fr\) 300px/);
rule(".ol-text-reading-column", /width:/);
rule(".ol-text-reader:not([data-text-ready]) .ol-text-workspace-grid", /grid-template-columns:minmax\(0,1fr\)/);
rule(".ol-story-reader-rail", /background:var\(--ol-surface\)/);
rule(".ol-story-reader-rail", /position:sticky/);
rule(".ol-story-doc-page:not(.ol-text-reader) .ol-story-part-nav", /position:static/);
rule(".ol-story-doc-page .ol-reader-toolbar", /top:0(?:;|$)/);
rule(".ol-story-doc-page:not(.ol-text-reader) .ol-story-part-sidebar", /(?=.*(?:^|;)top:0(?:;|$))(?=.*(?:^|;)height:100dvh(?:;|$))/);
rule(".ol-story-reader-rail", /(?=.*(?:^|;)top:0(?:;|$))(?=.*(?:^|;)height:100dvh(?:;|$))/);
rule(".ol-story-doc-page .ol-reader-toc[data-docked=", /position:static/);
const registry = readRegistry();
let count = 0;
const publishedBlogTags = [];
const publishedBlogCategories = [];
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
  const tagArea = html.match(/<div[^>]*data-document-tags[^>]*>([\s\S]*?)<\/div>/)?.[1];
  const expectedTags = [...new Set(data.tags.map((tag) => tag.trim()))];
  assert.equal(Boolean(tagArea), expectedTags.length > 0, `${record.url}: tags must be optional and document-specific`);
  if (tagArea) {
    const pills = [...tagArea.matchAll(/class="ol-text-tag"/g)];
    assert.equal(pills.length, expectedTags.length, `${record.url}: incorrect tag count`);
    for (const tag of expectedTags) {
      assert.ok(!tag.includes("/"), `${record.url}: old tag prefix`);
      const escaped = tag.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
      assert.ok(tagArea.includes(escaped), `${record.url}: missing tag ${tag}`);
    }
    assert.ok(html.indexOf("data-document-tags") > html.indexOf("</h1>"), `${record.url}: tag placement`);
    assert.ok(html.indexOf("data-document-tags") < html.indexOf('class="ol-prose'), `${record.url}: tags belong above body`);
  }
  if (collection === "blog") {
    publishedBlogTags.push(expectedTags);
    const category = source.split("/").length > 2 ? nameInfo(source.split("/")[1]) : { label: "", order: Number.MAX_SAFE_INTEGER };
    assert.equal(data.category, category.label, `${source}: BLOG category must come from first folder`);
    publishedBlogCategories.push({ category: category.label || "미분류", order: category.order });
  }
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
  if (collection === "story") {
    assert.match(html, /<div class="ol-reader-toolbar">\s*<button[^>]*data-story-left-toggle/);
    assert.equal((html.match(/data-story-list-content/g) ?? []).length, 1);
    assert.match(html, /id="story-list-dialog"/);
    assert.ok(!html.includes('data-story-mobile-chapters'), `${record.url}: one responsive chapter list`);
    classes(html, ["ol-story-reader-rail", "ol-text-panel-tabs"], record.url);
    assert.match(html, /data-story-workspace/);
    assert.equal((html.match(/data-reader-panel-slot/g) ?? []).length, 1);
    assert.match(html, /data-reader-panel="toc"/);
    assert.match(html, /data-reader-panel="footnotes"/);
  }
  if (collection === "text") {
    classes(html, ["ol-text-academic", "ol-text-workspace-grid", "ol-text-reader-rail"], record.url);
    assert.match(html, /<main[^>]*data-text-workspace/);
    assert.ok(!/<main[^>]*data-text-left-hidden/.test(html), `${record.url}: wide initial layout is rendered without a closed-panel flash`);
    assert.match(html, /data-text-focus/);
    assert.match(html, /data-text-left-toggle/);
    assert.match(html, /class="ol-text-list-label-compact">문헌<\/span>/);
    assert.match(html, /id="text-list-dialog"/);
    assert.ok(!html.includes('class="ol-story-mobile-controls"'), `${record.url}: TEXT has one responsive left navigation`);
  }
  if (isLibrary) {
    assert.equal((html.match(/data-reader-back-to-top/g) ?? []).length, 1, `${record.url}: one back-to-top control`);
    assert.match(html, /<button[^>]*data-reader-back-to-top[^>]*hidden/);
    assert.match(html, /data-reader-footnotes-trigger/);
    assert.match(html, /class="ol-text-tool-label ol-reader-footnotes-label">각주<\/span>/);
    assert.equal((html.match(/type="range"/g) ?? []).length, 1, `${record.url}: one shared reading slider`);
    assert.match(html, /min="80" max="150" step="5" value="100"/);
    assert.match(html, /id="ol-reader-font-panel"[^>]*hidden/);
    const notesDialog = html.match(/<dialog[^>]*id="ol-reader-footnotes"[^>]*>([\s\S]*?)<\/dialog>/)?.[0];
    const notesCount = (html.match(/<section[^>]*data-footnotes/g) ?? []).length;
    assert.equal(notesCount, notesDialog ? 1 : 0, `${record.url}: notes exist only in their built drawer`);
    if (notesDialog) {
      assert.ok(!/<dialog[^>]*\sopen(?:\s|=|>)/.test(notesDialog));
      assert.match(notesDialog, /data-reader-footnotes-close/);
      assert.match(notesDialog, /data-footnotes/);
      assert.ok(!notesDialog.includes('data-footnote-backref'), `${record.url}: no separate backreference controls`);
      const controls = [...notesDialog.matchAll(/data-footnote-return="#([^"]+)"/g)];
      assert.ok(controls.length > 0, `${record.url}: clickable note text`);
      for (const [, id] of controls) {
        assert.ok(html.includes(`id="${id}"`), `${record.url}: note return destination`);
      }
    }

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
  const titleArea = collection === "text" ? html :
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
    classes(html, ["ol-library-series-list"], category.url);
    assert.ok(!hasClass(html, "ol-story-library-card"), `${category.url}: series must use rows instead of category-style cards`);
    const expected = [...series].filter(([key]) => key.startsWith(category.key + "/"));
    assert.equal((html.match(/data-library-item(?:\s|>|=)/g) ?? []).length, expected.length, `${category.label}: incorrect series count`);
    for (const [key, url] of series) {
      assert.equal(html.includes(`href="${url}"`), key.startsWith(category.key + "/"), `${category.label}: incorrect series membership ${key}`);
      const detail = fs.readFileSync(path.join("dist", url, "index.html"), "utf8");
      assert.ok(!hasClass(detail, "ol-story-tag-area"), `${url}: retired series tag controls`);
      assert.ok(!hasClass(detail, "ol-tag-results-modal"), `${url}: retired series tag modal`);
    }
    if (!expected.length) assert.ok(html.includes("준비 중입니다."));
  }
}
const blog = fs.readFileSync("dist/blog/index.html", "utf8");
const decode = (value) => value.replace(/&(?:quot|#34|#x22);/g, '"').replace(/&(?:apos|#39|#x27);/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const buttons = [...blog.matchAll(/<button[^>]*data-blog-tag="([^"]*)"[^>]*>/g)].map(([, value]) => decode(value));
assert.deepEqual(buttons.slice().sort(), ["", ...new Set(publishedBlogTags.flat())].sort(), "BLOG filter buttons must reflect only published post tags");
const blogSidebar = blog.match(/<aside class="ol-blog-sidebar"[^>]*>([\s\S]*?)<\/aside>/)?.[1] ?? "";
const blogTagPanel = blogSidebar.match(/<details class="ol-card ol-blog-tag-panel"[^>]*>/)?.[0];
assert.ok(blogTagPanel && !/\sopen(?:\s|=|>)/.test(blogTagPanel), "BLOG tag panel must start closed");
assert.ok(blogSidebar.includes('id="blog-chips"'), "BLOG tag filters belong inside the sidebar");
assert.ok(blogSidebar.indexOf('id="blog-archive"') < blogSidebar.indexOf('id="blog-chips"'), "BLOG tags follow the archive");
const categoryGroups = new Map();
for (const item of publishedBlogCategories) {
  const group = categoryGroups.get(item.category) ?? { ...item, count: 0 };
  group.count++; categoryGroups.set(item.category, group);
}
const expectedCategories = [...categoryGroups.values()].sort((a, b) => a.order - b.order || a.category.localeCompare(b.category, "ko"));
const categoryButtons = [...blog.matchAll(/<button[^>]*data-blog-category="([^"]*)"[^>]*>([\s\S]*?)<\/button>/g)];
assert.deepEqual(categoryButtons.map(([, category]) => decode(category)), ["", ...expectedCategories.map(x => x.category)], "BLOG categories follow source folder order");
assert.deepEqual(categoryButtons.map(([, , body]) => Number(body.match(/class="count">(\d+)/)?.[1])), [publishedBlogCategories.length, ...expectedCategories.map(x => x.count)], "BLOG category counts");
assert.ok(blog.indexOf('id="blog-categories"') < blog.indexOf('id="blog-chips"'), "Categories must precede tags");
const renderedCategories = [...blog.matchAll(/<article[^>]*data-category="([^"]*)"/g)].map(([, category]) => decode(category));
assert.deepEqual(renderedCategories.sort(), publishedBlogCategories.map(x => x.category).sort(), "BLOG per-post category data");
const postTags = [...blog.matchAll(/<article[^>]*data-tags="([^"]*)"[^>]*>/g)].map(([, value]) => JSON.parse(decode(value)));
const tagSignatures = (posts) => posts.map((tags) => JSON.stringify([...tags].sort())).sort();
assert.deepEqual(tagSignatures(postTags), tagSignatures(publishedBlogTags), "BLOG filter data must match each post's tags");
classes(
  blog,
  ["ol-post", "ol-blog-sidebar", "ol-blog-archive-list"],
  "BLOG index",
);
const mediaImages = await syncMediaGallery();
const mediaHtml = fs.readFileSync("dist/media/index.html", "utf8");
classes(mediaHtml, ["ol-media-masonry", "ol-media-dialog"], "MEDIA");
assert.equal((mediaHtml.match(/data-media-item(?:\s|>|=)/g) ?? []).length, mediaImages.length);
const mediaDialog = mediaHtml.match(/<dialog[^>]*id="ol-media-dialog"[^>]*>/)?.[0];
assert.ok(mediaDialog && !/\sopen(?:\s|=|>)/.test(mediaDialog), "MEDIA dialog must start closed");
assert.match(mediaDialog, /aria-labelledby="ol-media-dialog-title"/);
for (const item of mediaImages) {
  assert.ok(mediaHtml.includes(item.previewUrl), `MEDIA: missing preview ${item.source}`);
  assert.ok(fs.existsSync(path.join("dist", item.previewUrl)), `MEDIA: unpublished preview ${item.source}`);
  assert.ok(fs.existsSync(path.join("dist", item.url)), `MEDIA: unpublished original ${item.source}`);
}
const galleryCategories = [...mediaHtml.matchAll(/<button[^>]*data-media-filter="([^"]*)"[^>]*>/g)].map(([, value]) => decode(value));
assert.deepEqual(galleryCategories.slice().sort(), ["", ...getMediaCategories(mediaImages).map((category) => category.key)].sort(), "MEDIA category filters must match the first folder keys");
assert.deepEqual(fs.readdirSync("dist/media"), ["index.html"], "MEDIA must not create detail pages");
const home = fs.readFileSync("dist/index.html", "utf8");
const mediaStat = home.match(/<a[^>]*class="[^"]*ol-stat--media[^>]*>([\s\S]*?)<\/a>/)?.[0];
assert.ok(mediaStat && mediaStat.includes('href="/media/"'), "Home MEDIA stat must link to gallery");
assert.match(mediaStat, new RegExp(`data-media-stat-count>${mediaImages.length}<`));
for (const html of [home, mediaHtml]) {
  const footer = html.match(/<footer\b[\s\S]*?<\/footer>/)?.[0] ?? "";
  assert.ok(footer.includes('href="/media/"'), "Footer MEDIA link missing");
  const header = html.match(/<header\b[\s\S]*?<\/header>/)?.[0] ?? "";
  assert.ok(!header.includes('href="/media/"'), "MEDIA must stay out of main menu");
  const sheet = html.match(/<nav[^>]*id="ol-mobile-sheet"[^>]*>([\s\S]*?)<\/nav>/)?.[1] ?? "";
  assert.ok(!sheet.includes('href="/media/"'), "MEDIA must stay out of mobile main menu");
}
rule(".ol-media-masonry", /(?:column-count|columns):3/);
rule(".ol-media-card[hidden]", /display:none/);
rule(".ol-media-dialog:not([open])", /display:none/);
console.log(
  `UI markup/CSS regression checks passed for ${count} documents and BLOG index (not a browser interaction test).`,
);

// Auxiliary ebook navigation and generated package controls must agree with source packages.
const { getEbooks } = await import("./lib/ebooks.mjs");
const ebooks = getEbooks();
const ebookHtml = fs.readFileSync("dist/ebook/index.html", "utf8");
assert.equal([...ebookHtml.matchAll(/data-ebook-item(?=[\s>])/g)].length, ebooks.length);
assert.equal([...ebookHtml.matchAll(/download="/g)].length, ebooks.reduce((count, book) => count + book.downloads.length, 0));
assert.ok(ebookHtml.includes('id="ebook-dialog"'));
assert.ok(ebookHtml.includes('CC0'));
assert.match(ebookHtml, /<footer[\s\S]*?>MEDIA<\/a>\s*<a href="\/ebook\/">EBOOK<\/a>/);
assert.ok(!ebookHtml.split("</header>")[0].includes('>EBOOK<'));
assert.ok(fs.readFileSync("dist/sitemap-0.xml", "utf8").includes('/ebook/'));
console.log(`EBOOK controls and footer navigation verified for ${ebooks.length} books.`);
