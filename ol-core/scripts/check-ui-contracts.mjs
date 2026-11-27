import { projectPaths, contentFile } from './lib/paths.mjs';
const { dist } = projectPaths();
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { hasOriginalBlocks } from "./lib/markdown.mjs";
import { syncMediaGallery, getMediaCategories } from "./lib/media-gallery.mjs";
import { readHomeArticleIndex, readHomeArticles, readHomeSeries } from "./lib/home-articles.mjs";
import { readHomeHtmlCards, selectTodayArticle } from "./lib/home-html-cards.mjs";
import { readBlogCatalog } from "./lib/blog.mjs";
import { indexStoryTags, storyTagInitial, storyTagInitials, storyTagPath, storyTagsPath } from "./lib/story-tags.mjs";
import { ARTICLE_LABEL, BLOG, BRAND, REPOSITORY_URL, SERIES_LABELS, SITE_URL, sitePath } from "../../site-config.mjs";
import {
  readRegistry,
  categoryFolders,
  normalize,
  walk,
  markdownPattern,
} from "./lib/content.mjs";

// Regression checks for UI failures that a successful build and link audit cannot detect.
const css = walk(path.join(dist, "_astro"), { assets: true })
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
rule(":root", /--ol-page-width:1600px/);
const pageFrame = "body:not(:has(.ol-story-doc-page)) .ol-container:not(:where(.ol-footer *))";
rule(pageFrame, /max-width:var\(--ol-page-width\)/);
rule(pageFrame, /padding-inline:var\(--ol-page-gutter\)/);
rule(".ol-container", /max-width:1200px/);
rule(".ol-reading-column", /max-width:656px/);
rule(".ol-home-reader", /max-width:704px/);
rule(".ol-home-reader-back", /min-height:44px/);
rule(".ol-home-reader-heading", /margin-block:clamp\(32px/);
rule(".ol-home-reader-heading h1", /margin-block:clamp\(18px/);
const readingFrame = /<div\b[^>]*\bclass="ol-container"[^>]*>\s*<div\b[^>]*\bclass="ol-reading-column"[^>]*>/;
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
rule(".ol-story-doc-page :is(.ol-prose,.ol-reader-footnotes-content) :is(em,i)", /font-family:var\(--ol-reader-pali-serif\),var\(--ol-reader-emphasis-fallback\)/);
rule(".ol-story-doc-page .ol-reader-footnotes-content", /--ol-reader-emphasis-fallback:var\(--ol-font-ui\)/);
rule(".ol-story-doc-page :is(.ol-prose,.ol-reader-footnotes-content) :is(em,i)", /font-feature-settings:normal/);
const gentiumFiles = { 400: 'Gentium-Italic.woff2', 700: 'Gentium-BoldItalic.woff2' };
for (const file of Object.values(gentiumFiles)) {
  const source = fs.readFileSync(path.join(projectPaths().public, 'fonts/gentium', file));
  const deployed = fs.readFileSync(path.join(dist, 'fonts/gentium', file));
  assert.equal(source.subarray(0, 4).toString(), 'wOF2');
  assert.deepEqual(deployed, source, `Unmodified font asset must be present: ${file}`);
}
assert.ok(fs.readFileSync(path.join(dist, 'fonts/gentium/OFL.txt'), 'utf8').includes('SIL OPEN FONT LICENSE'));
assert.ok(!css.includes('/fonts/gentium/'), 'Gentium URLs are rendered in the reader head');
rule(".ol-story-reader-page.ol-story-doc-page [data-reader-scalable]", /font-size:calc/);
rule(".ol-story-doc-page [data-reader-original] pre", /font-size:18px/);
rule(".ol-story-doc-page [data-reader-original] pre code", /font-size:calc\(1em\s*\*\s*var\(--ol-reader-font-scale,1\)\)/);
rule(".ol-story-doc-page [data-reader-original] pre", /white-space:pre-wrap/);
rule(".ol-story-doc-page [data-reader-original] pre", /background-color:var\(--ol-text-soft,\s*var\(--ol-surface-2\)\)!important/);
rule(".ol-story-doc-page [data-reader-original] pre", /color:var\(--ol-ink\)!important/);
rule(".ol-original-toggle [data-original-label]", /display:none/);
rule(".ol-ebook-dialog", /position:fixed/);
rule(".ol-ebook-dialog", /inset:0/);
rule(".ol-ebook-dialog", /margin:auto/);
rule(".ol-reader-toc:not([open])", /display:none/);
rule(".ol-reader-toc", /(?:^|;)overflow:clip(?:;|$)/);
rule(".ol-reader-toc-panel", /transform:translate(?:X)?\(0\)/);
rule(".ol-reader-toc-panel nav a", /display:block/);
rule(".ol-reader-footnotes-content .ol-footnote-source-link", /text-decoration-color:currentcolor/i);
assert.ok(!rules.some(([, selectors]) => /\.ol-reader-toc-panel\s+a\b/.test(selectors)),
  "TOC link styles must be scoped to its navigation so footnote links retain prose styling");
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
rule(".ol-text-workspace-grid", /grid-template-columns:240px minmax\(0,1fr\) var\(--ol-reader-aid-width\)/);
rule(".ol-reader-panel-resize", /cursor:col-resize/);
rule(".ol-reader-panel-resize", /touch-action:none/);
rule(".ol-story-doc-page [data-reader-resizable-grid]", /--ol-reader-body-min-width:480px/);
rule(".ol-text-reading-column", /width:/);
rule(".ol-story-doc-page", /--ol-reader-font-scale:var\(--ol-reader-initial-scale,1\)/);
rule(".ol-story-doc-page .ol-story-chapter>.ol-prose:not([data-reader-scalable])", /font-size:calc\(17px\s*\*\s*var\(--ol-reader-font-scale\)\)/);
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
const taggedStoryDocuments = [];
const drawerCounts = { text: 0, story: 0 };
for (const [source, record] of Object.entries(registry.files)) {
  const collection = source.split("/")[0],
    file = contentFile(source);
  if (
    !["text", "story", "blog"].includes(collection) ||
    !markdownPattern.test(source) ||
    !fs.existsSync(file)
  )
    continue;
  const data = normalize(source, fs.readFileSync(file, "utf8"), registry);
  if (!data.published || data.kind !== "document") continue;
  if (collection === "story" && data.storyTags.length) taggedStoryDocuments.push(data);
  const html = fs.readFileSync(
    path.join(dist, record.url, "index.html"),
    "utf8",
  );
  const tagArea = html.match(/<div[^>]*data-document-tags[^>]*>([\s\S]*?)<\/div>/)?.[1];
  const typed = new Set(data.storyTags.map(tag => tag.label));
  const expectedTags = [
    ...[...new Set(data.tags.map(tag => tag.trim()))].filter(tag => !typed.has(tag.normalize("NFC"))),
    ...data.storyTags.map(tag => tag.label),
  ];
  for (const tag of data.storyTags) {
    assert.ok(tagArea?.includes(`href="${sitePath(storyTagPath(tag))}"`), `${source}: typed tag links to its STORY page`);
  }
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
    assert.ok(readingFrame.test(html), `${record.url}: reading column inside the page container`);
    publishedBlogTags.push(expectedTags);
    const category = { label: data.category, order: data.categoryOrder };
    assert.ok(data.seriesKey === "blog/standalone" || data.categoryKey.startsWith(data.seriesKey + "/"), `${source}: category must belong to its series`);
    publishedBlogCategories.push({ category: category.label || "미분류", order: category.order });
  }
  overlay(html, "ol-search-overlay", record.url);
  overlay(html, "ol-mobile-overlay", record.url);
  const isLibrary = collection === "text" || collection === "story";
  if (isLibrary) {
    const head = html.slice(0, html.indexOf('</head>'));
    const styles = [...head.matchAll(/<style\s+data-reader-gentium[^>]*>([\s\S]*?)<\/style>/g)];
    assert.equal(styles.length, 1, `${record.url}: one Gentium stylesheet in the head`);
    const faces = [...styles[0][1].matchAll(/@font-face\s*\{([^}]+)\}/g)].map(([, body]) => body);
    assert.equal(faces.length, 2, `${record.url}: two genuine Gentium italic faces`);
    for (const [weight, file] of Object.entries(gentiumFiles)) {
      const face = faces.find(body => body.includes(`font-weight: ${weight};`));
      assert.ok(face, `${record.url}: missing Gentium weight ${weight}`);
      assert.ok(face.includes(`src: url('${sitePath(`/fonts/gentium/${file}`)}')`), `${record.url}: wrong URL for ${file}`);
      assert.match(face, /font-family:\s*'Gentium';/);
      assert.match(face, /font-style:\s*italic;/);
      const ranges = face.match(/unicode-range:([^;}]+)/i)?.[1].split(',') ?? [];
      const covers = codepoint => ranges.some(range => {
        const [first, last = first] = range.trim().replace(/^u\+/i, '').split('-');
        return codepoint >= parseInt(first.replaceAll('?', '0'), 16)
          && codepoint <= parseInt(last.replaceAll('?', 'f'), 16);
      });
      for (const char of 'aāīūṅñṭḍṇḷṃṁ\u0304\u0307\u0323') assert.ok(covers(char.codePointAt(0)), `Pali character range missing: ${char}`);
      assert.ok(!covers(0xac00) && !covers(0x1000), 'Korean and Myanmar retain their existing fonts');
    }
    const fontInit = html.indexOf('data-reader-font-init');
    assert.ok(fontInit >= 0 && fontInit < html.indexOf('</head>'), `${record.url}: restore saved reading size before first paint`);
    const panelInit = html.indexOf('data-reader-panel-init');
    assert.ok(panelInit >= 0 && panelInit < html.indexOf('</head>'), `${record.url}: restore saved aid width before first paint`);
    assert.match(html, /data-reader-resizable-grid/);
    assert.equal((html.match(/<div[^>]*\sdata-reader-panel-resize(?:\s|>)/g) ?? []).length, 1, `${record.url}: one shared resize handle`);
    assert.match(html, /role="separator"[^>]*aria-label="문서 보조 패널 너비"[^>]*aria-orientation="vertical"[^>]*aria-controls="reader-aid"/);
    assert.equal((html.match(/id="reader-aid"/g) ?? []).length, 1);
  }
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
    assert.match(html, /<div class="ol-reader-toolbar">\s*<div class="ol-reader-navigation-tools">\s*<button[^>]*data-story-left-toggle/);
    assert.equal((html.match(/data-story-list-content/g) ?? []).length, 1);
    assert.match(html, /id="story-list-dialog"/);
    assert.ok(!html.includes('data-story-mobile-chapters'), `${record.url}: one responsive chapter list`);
    classes(html, ["ol-story-reader-rail", "ol-text-panel-tabs"], record.url);
    assert.match(html, /data-story-workspace/);
    assert.equal((html.match(/data-reader-panel-slot/g) ?? []).length, 1);
    assert.match(html, /data-reader-panel="toc"/);
    assert.match(html, /data-reader-panel="footnotes"/);
  }
  if (isLibrary) {
    const original = hasOriginalBlocks(fs.readFileSync(file, 'utf8'));
    assert.equal(html.includes('data-original-toggle'), original, `${record.url}: original control only for marked documents`);
    assert.equal(html.includes('data-reader-original'), original, `${record.url}: original source wrapper rendered`);
    if (original) {
      assert.match(html, /data-(?:text|story)-left-toggle[\s\S]*data-original-toggle[\s\S]*class="ol-story-part-tools"/);
      assert.match(html, /data-original-toggle[^>]*aria-pressed="false"[^>]*aria-label="원문 숨기기"/);
    }
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
      assert.ok(!notesDialog.includes('data-footnote-backref'), `${record.url}: no original Markdown backreferences`);
      const controls = [...notesDialog.matchAll(/<li\b[^>]*data-footnote-return="#([^"]+)"/g)];
      assert.ok(controls.length > 0, `${record.url}: note return targets`);
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
const storyTagDirectory = fs.readFileSync(path.join(dist, storyTagsPath, "index.html"), "utf8");
const storyTags = indexStoryTags(taggedStoryDocuments);
if (storyTags.length) {
  assert.ok(storyTagDirectory.includes('data-page-size="30"'), "STORY tag explorer shows 30 cards per batch");
  assert.equal((storyTagDirectory.match(/<a\b[^>]*data-story-tag-card/g) ?? []).length, storyTags.length);
  const initialCards = [...storyTagDirectory.matchAll(/<li\b[^>]*data-story-tag-entry="[^"]*"[^>]*>/g)].map(match => match[0]);
  assert.deepEqual(initialCards.map(card => /\shidden(?=[\s>])/.test(card)),
    storyTags.map((_, index) => index >= 30), "STORY explorer renders only its first batch before scripts");
  const initialGroups = storyTags.map(tag => storyTagInitial(tag.label));
  const initialButtons = [...storyTagDirectory.matchAll(/<button[^>]*\sdata-story-tag-initial(?:="([^"]*)")?(?=[\s>])/g)]
    .map(match => match[1] ?? "");
  assert.deepEqual(initialButtons, ["", ...storyTagInitials, ...(initialGroups.includes("other") ? ["other"] : [])]);
  assert.deepEqual(initialCards.map(card => card.match(/\sdata-initial="([^"]*)"/)?.[1]).sort(), initialGroups.sort(),
    "STORY tag cards carry the initial of their canonical name");
  for (const control of ["story-tag-search", "story-tag-filters", "story-tag-initials", "loadmore-wrap"]) {
    const element = storyTagDirectory.match(new RegExp(`<[^>]+data-${control}[^>]*>`))?.[0];
    assert.ok(element?.includes(" inert"), `STORY explorer ${control} is inert until initialized`);
    assert.equal(/\shidden(?=[\s>])/.test(element), control === "loadmore-wrap" && storyTags.length <= 30);
  }
  assert.ok(storyTagDirectory.includes(`data-loadmore-remaining`));
  assert.match(storyTagDirectory, /<noscript>[\s\S]*?\[data-story-tag-entry\]\[hidden\][\s\S]*?<\/noscript>/,
    "STORY explorer keeps all tag links available without scripts");
  assert.match(storyTagDirectory, /<dialog[^>]*data-story-tag-dialog/);
  assert.ok(storyTagDirectory.includes("data-story-tag-desktop"), "STORY tag explorer has a desktop preview");
  rule(".ol-tag-desktop", /display:block/);
  assert.doesNotMatch(css, /\[data-preview-ready\][^{]*\.ol-tag-desktop/);
  assert.ok(!/<template\b/.test(storyTagDirectory), "STORY tag directory fetches preview fragments on selection");
}
for (const tag of storyTags) {
  const route = storyTagPath(tag);
  assert.ok(storyTagDirectory.includes(`href="${sitePath(route)}"`), `${route}: tag directory link`);
  const html = fs.readFileSync(path.join(dist, decodeURIComponent(route), "index.html"), "utf8");
  const fragment = html.match(/<template[^>]*data-story-tag-preview-fragment[^>]*>([\s\S]*?)<\/template>/)?.[1];
  assert.ok(fragment, `${route}: preview fragment`);
  const previewLinks = [...fragment.matchAll(/href="([^"]+)"/g)].map(match => match[1]);
  assert.equal(previewLinks.length, Math.min(tag.documents.length, 4), `${route}: bounded preview links`);
  const actual = [...html.matchAll(/href="([^"]+)" data-story-tag-document/g)].map((match) => match[1]);
  assert.deepEqual(actual.sort(), tag.documents.map(doc => sitePath(doc.url)).sort(), `${route}: public tagged documents`);
}
for (const [collection, total] of Object.entries(drawerCounts)) {
  assert.ok(total > 0, `${collection}: no document TOC drawer generated`);
}
// Menu roots list works and recent documents; category tabs list public categories.
for (const section of ["text", "story"]) {
  const index = fs.readFileSync(`${dist}/${section}/index.html`, "utf8");
  const categoryIndex = fs.readFileSync(`${dist}/${section}/categories/index.html`, "utf8");
  classes(index, [section === "text" ? "ol-library-series-list" : "ol-library-story-grid"], `${section} works`);
  classes(categoryIndex, ["ol-grid-3"], `${section} categories`);
  assert.match(index, /data-library-view="series"/);
  assert.match(categoryIndex, /data-library-view="categories"/);
  assert.ok(index.includes(`href="${sitePath(`/${section}/categories/`)}"`));
  assert.ok(index.includes(`href="${sitePath(`/${section}/`)}" aria-current="page"`));
  assert.ok(categoryIndex.includes(`href="${sitePath(`/${section}/categories/`)}" aria-current="page"`));
  assert.ok(!categoryIndex.includes('id="ol-library-recent-title"'));
  const series = new Map();
  const documents = new Map();
  for (const [source] of Object.entries(registry.files)) {
    if (!source.startsWith(`${section}/`) || !fs.existsSync(contentFile(source))) continue;
    const data = normalize(source, markdownPattern.test(source) ? fs.readFileSync(contentFile(source), "utf8") : "", registry);
    if (!data.published || data.kind === "category") continue;
    series.set(data.seriesKey, data.seriesUrl);
    if (data.kind === "document" && markdownPattern.test(source)) documents.set(sitePath(data.url), data);
  }
  const workLinks = [...index.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*data-library-work-category=/g)].map(([, href]) => href);
  assert.deepEqual(workLinks.sort(), [...series.values()].map(sitePath).sort(), `${section}: menu must list all public works`);
  const workContainer = section === "text" ? "ol-text-library-grid" : "ol-story-series-page";
  for (const url of series.values()) {
    const detail = fs.readFileSync(path.join(dist, url, "index.html"), "utf8");
    assert.ok(detail.includes(`class="ol-container ${workContainer}"`), `${url}: uses the shared page container`);
  }
  const recent = index.match(/<section\b[^>]*aria-labelledby="ol-library-recent-title"[^>]*>([\s\S]*?)<\/section>/)?.[1] ?? "";
  const recentLinks = [...recent.matchAll(/<a\b[^>]*\shref="([^"]+)"/g)].map(([, href]) => href);
  assert.equal(new Set(recentLinks).size, recentLinks.length);
  assert.equal(recentLinks.length, Math.min(3, documents.size));
  assert.ok(recentLinks.every((href) => documents.has(href)), `${section}: recent links must open public reading pages`);
  const categories = categoryFolders(section);
  const listedCategories = categories.filter(category => [...series.keys()].some(key => key.startsWith(category.key + "/")));
  assert.equal((categoryIndex.match(/data-library-category=/g) ?? []).length, listedCategories.length);
  for (const category of categories) {
    const listed = listedCategories.includes(category);
    assert.equal(categoryIndex.includes(`href="${sitePath(category.url)}"`), listed, `${section}: incorrect category visibility ${category.label}`);
    assert.equal(index.includes(`data-library-filter="${category.key}"`), listed, `${section}: incorrect category filter ${category.label}`);
    const html = fs.readFileSync(path.join(dist, category.url, "index.html"), "utf8");
    assert.match(html, /data-library-view="series"/);
    classes(html, ["ol-library-series-list"], category.url);
    assert.ok(!hasClass(html, "ol-story-library-card"), `${category.url}: series must use rows instead of category-style cards`);
    const expected = [...series].filter(([key]) => key.startsWith(category.key + "/"));
    assert.equal((html.match(/data-library-item(?:\s|>|=)/g) ?? []).length, expected.length, `${category.label}: incorrect series count`);
    for (const [key, url] of series) {
      assert.equal(html.includes(`href="${sitePath(url)}"`), key.startsWith(category.key + "/"), `${category.label}: incorrect series membership ${key}`);
      const detail = fs.readFileSync(path.join(dist, url, "index.html"), "utf8");
      assert.ok(!hasClass(detail, "ol-story-tag-area"), `${url}: retired series tag controls`);
      assert.ok(!hasClass(detail, "ol-tag-results-modal"), `${url}: retired series tag modal`);
    }
    if (!expected.length) assert.ok(html.includes("준비 중입니다."));
  }
}
const blog = fs.readFileSync(path.join(dist, "blog/index.html"), "utf8");
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
const blogCatalog = readBlogCatalog();
rule(".ol-blog-series-card .ol-blog-cover-copy h2", /color:\s*inherit/);
const seriesIndex = fs.readFileSync(path.join(dist, "blog/series/index.html"), "utf8");
assert.equal((seriesIndex.match(/data-series-card(?:\s|=|>)/g) ?? []).length, blogCatalog.filter(s => s.key !== BLOG.journalSeries).length);
assert.ok(seriesIndex.indexOf('class="ol-blog-journal"') > seriesIndex.lastIndexOf('data-series-card'), "Journal stays below randomized covers");
assert.ok(!seriesIndex.includes('role="tab"'), "BLOG views navigate to separate pages");
assert.ok(seriesIndex.includes(`href="${sitePath("/blog/series/")}" aria-current="page">${SERIES_LABELS.blog}</a>`));
assert.equal(seriesIndex.match(/<h1>([^<]*)<\/h1>/)?.[1].trim(), SERIES_LABELS.blog);
const feed = fs.readFileSync(path.join(dist, "rss.xml"), "utf8");
assert.equal((feed.match(/<item>/g) ?? []).length, publishedBlogCategories.length, "Metadata must not enter RSS");
const homeHtml = fs.readFileSync(path.join(dist, "index.html"), "utf8");
const brandHtml = fs.readFileSync(path.join(dist, registry.files["pages/brand.md"].url, "index.html"), "utf8");
assert.ok(readingFrame.test(brandHtml), "Brand page keeps a reading column inside the page container");
const landingHeader = homeHtml.match(/<header class="ol-header"[\s\S]*?<\/header>/)?.[0] ?? "";
const landingMobileMenu = homeHtml.match(/<nav class="ol-mobile-sheet"[\s\S]*?<\/nav>/)?.[0] ?? "";
assert.ok(landingHeader.includes(`href="${sitePath("/")}" class="ol-brand"`), "Biwoom brand opens the site landing");
assert.ok(landingHeader.includes('class="ol-brand-name">비움</span>'), "Header displays the Korean wordmark");
assert.ok(landingHeader.includes(`class="ol-brand-meta">${BRAND.tagline}</span>`), "Header displays the brand tagline");
const expectedPrimaryLinks = [
  [sitePath("/text"), "경론"],
  [sitePath("/story"), "문학"],
  [sitePath("/articles/"), "카드"],
];
for (const menu of [landingHeader, landingMobileMenu]) {
  const links = Array.from(menu.matchAll(/<a href="([^"]+)" class="ol-(?:nav-link|mobile-sheet-link)(?: active)?">([^<]+)<\/a>/g),
    ([, href, label]) => [href, label.trim()]);
  assert.deepEqual(links, expectedPrimaryLinks, "Primary navigation uses Korean labels and preserves its destinations");
}
const footer = homeHtml.match(/<footer\b[\s\S]*?<\/footer>/)?.[0] ?? "";
assert.deepEqual([...footer.matchAll(/<a href="([^"]+)">([^<]+)<\/a>/g)]
  .map(([, href, label]) => [href, label])
  .filter(([, label]) => ["BLOG · 시리즈", ARTICLE_LABEL, "비움 소개"].includes(label)),
  [[sitePath("/blog/series/"), "BLOG · 시리즈"], [sitePath("/articles/"), ARTICLE_LABEL], [sitePath("/pages/brand"), "비움 소개"]],
  "Footer links to the cards directly below BLOG series");
assert.ok(landingHeader.includes(`href="${REPOSITORY_URL}"`), "Header GitHub link opens the site repository");
assert.ok(homeHtml.includes(`data-pagefind-path="${sitePath("/pagefind/pagefind.js")}"`), "Search loads the site index");
assert.ok(fs.existsSync(path.join(dist, "pagefind/pagefind.js")), "Pagefind script is published");
const blogHomeCard = [...homeHtml.matchAll(/<a href="([^"]*)" class="ol-product-card">([\s\S]*?)<\/a>/g)]
  .find(([, href]) => href === sitePath("/blog/series/"))?.[2];
assert.ok(blogHomeCard, "Home BLOG product card must link to /blog/series/");
assert.ok(blogHomeCard.includes(`${publishedBlogCategories.length}개 자료`), "Home product counts exclude BLOG metadata");

const allArticles = readHomeArticles();
const publishedArticles = allArticles.filter(({ article }) => article.published);
const articleIds = publishedArticles.map(({ article }) => article.id).sort();
const articleCard = homeHtml.match(/<a href="\/articles\/" class="ol-product-card">([\s\S]*?)<\/a>/)?.[1] ?? "";
assert.ok(articleCard.includes(ARTICLE_LABEL), "Home card displays the public article name");
assert.ok(articleCard.includes(`${articleIds.length}개 자료`), "Home card counts public articles");
const articleStat = [...homeHtml.matchAll(/<a\b[^>]*\bclass="ol-stat"[^>]*>[\s\S]*?<\/a>/g)]
  .find(([link]) => link.includes(`href="${sitePath("/articles/")}"`))?.[0];
assert.ok(articleStat?.includes(ARTICLE_LABEL) && articleStat.includes(`data-article-stat-count>${articleIds.length}<`),
  "Home story-card stat links to the article catalog and counts public articles");
const articleIndexHtml = fs.readFileSync(path.join(dist, "articles/index.html"), "utf8");
assert.deepEqual(
  [...articleIndexHtml.matchAll(/<a href="\/articles\/" class="(ol-nav-link|ol-mobile-sheet-link) active">\s*카드\s*<\/a>/g)]
    .map(([, name]) => name),
  ["ol-nav-link", "ol-mobile-sheet-link"],
  "Both headers mark the card menu active on /articles/",
);
assert.ok(articleIndexHtml.includes('class="ol-container ol-home-workspace"'), "Story card uses the page container");
const articleNav = articleIndexHtml.match(/<nav class="ol-home-menu"[\s\S]*?<\/nav>/)?.[0] ?? "";
assert.deepEqual([...articleNav.matchAll(/href="([^"]+)"/g)].map(([, href]) => href),
  ["/articles/", "/series/", "/topics/", "/tags/", "/saved/"]);
assert.ok(articleNav.includes(`<span>${SERIES_LABELS.article}</span>`));
const articleSeriesIndex = fs.readFileSync(path.join(dist, "series/index.html"), "utf8");
assert.equal(articleSeriesIndex.match(/<h1>([^<]*)<\/h1>/)?.[1].trim(), SERIES_LABELS.article);
assert.ok(articleSeriesIndex.includes('id="ol-home-categories-title">이야기 묶음</h2>'));
const articleCatalog = articleIndexHtml.match(/<section class="ol-story-collection"[\s\S]*?<\/section>/)?.[0] ?? "";
const articleCards = [...articleCatalog.matchAll(/<article\b[^>]*data-story-card="([^"]+)"[^>]*>([\s\S]*?)<\/article>/g)];
assert.deepEqual(articleCards.map(([, id]) => id).sort(), articleIds, "One card per public article");
const htmlCards = readHomeHtmlCards(allArticles.map(({ article }) => article));
assert.ok(!fs.existsSync(path.join(dist, "article", "html")), "Standalone HTML sources stay in the vault");
const latestArticle = selectTodayArticle(publishedArticles.map(({ article }) => article), htmlCards);
assert.equal(articleIndexHtml.match(/data-home-today-story="([^"]+)"/)?.[1], latestArticle?.id);
const todayHtml = articleIndexHtml.match(/<section[^>]*aria-labelledby="ol-home-today-title"[\s\S]*?<\/section>/)?.[0] ?? "";
if (latestArticle) {
  const hero = articleIndexHtml.match(/<div class="ol-home-intro ol-home-hero">([\s\S]*?)<\/div>\s*(?=<nav class="ol-home-menu")/)?.[1] ?? "";
  assert.match(hero, /class="ol-home-hero-intro"[\s\S]*?<\/div>\s*<section[^>]*aria-labelledby="ol-home-today-title"/,
    "Today is the second column of the hero, after the introduction");
  assert.ok(hero.trimEnd().endsWith(todayHtml), "Today remains within the hero above the card navigation");
}
const todayCard = latestArticle && htmlCards.get(latestArticle.id);
if (todayCard) {
  assert.ok(todayHtml.includes(`data-home-html-card="${todayCard.id}"`), "Today uses the matched HTML card");
  assert.ok(todayHtml.includes(todayCard.html), "Today embeds only the article fragment");
  assert.ok(todayHtml.includes(`href="/stories/${todayCard.id}/"`), "Today links to the article reader");
  assert.ok(todayHtml.includes(`data-story-bookmark="${todayCard.id}"`), "Today shares the article bookmark");
  rule(".biwoom-card-frame .story-card", /grid-template-areas:/);
}
const recommendation = articleIndexHtml.match(/<section class="ol-home-recommended"[\s\S]*?<\/section>/)?.[0] ?? "";
const recommendedIds = readHomeArticleIndex().recommendedStories ?? [];
assert.deepEqual([...recommendation.matchAll(/data-story-card="([^"]+)"/g)].map(([, id]) => id),
  recommendedIds);
assert.deepEqual([...recommendation.matchAll(/data-home-html-card="([^"]+)"/g)].map(([, id]) => id),
  recommendedIds.filter(id => htmlCards.has(id)));
const readerDir = path.join(dist, "stories");
const articleReaders = walk(readerDir, { assets: true }).filter(file => path.basename(file) === "index.html");
assert.deepEqual(articleReaders.map(file => path.basename(path.dirname(file))).sort(), articleIds);
for (const [, id, card] of articleCards) {
  assert.ok(card.includes(`href="/stories/${id}/"`), `${id}: direct article link`);
  assert.ok(card.includes(`data-story-bookmark="${id}"`), `${id}: existing bookmark ID`);
  const reader = fs.readFileSync(path.join(readerDir, id, "index.html"), "utf8");
  assert.ok(!hasClass(reader, "ol-home-menu"), `${id}: story reader navigation uses the return link`);
  const backLink = reader.match(/<a\b[^>]*class="[^"]*\bol-home-reader-back\b[^"]*"[^>]*>[\s\S]*?<\/a>/)?.[0];
  assert.ok(backLink?.includes('href="/articles/"') && backLink.includes("이야기 목록"), `${id}: labeled return link`);
  for (const feature of ["data-reader-font-trigger", "data-reader-copy-source", "data-home-reader-share"]) {
    assert.ok(reader.includes(feature), `${id}: missing ${feature}`);
  }
  assert.match(reader, /data-pagefind-meta="section\[content\]" content="ARTICLE"/);
  assert.ok(reader.includes(`data-pagefind-meta="sectionLabel[content]" content="${ARTICLE_LABEL}"`));
}
for (const series of readHomeSeries()) {
  const html = fs.readFileSync(path.join(dist, decodeURIComponent(series.path), "index.html"), "utf8");
  assert.ok(html.includes(` · ${SERIES_LABELS.article} — BIWOOM</title>`), `${series.path}: series title includes the collection`);
  assert.ok(html.includes(`← ${SERIES_LABELS.article} 목록</a>`), `${series.path}: named series index link`);
}
const generatedContent = path.join(dist, "generated/content");
const expectedArt = new Map(publishedArticles.filter(({ illustrationFile }) => illustrationFile)
  .map(({ article, illustrationFile }) => [article.illustration.file, illustrationFile]));
for (const card of htmlCards.values()) {
  for (const { source, file } of card.images) expectedArt.set(source, file);
}
const builtArt = ["illustration", "article-html"].flatMap(folder => walk(path.join(generatedContent, folder), { assets: true }));
assert.deepEqual(builtArt.map(file => path.relative(generatedContent, file).split(path.sep).join("/").normalize("NFC")).sort(),
  [...expectedArt.keys()].sort(), "Publish only illustrations referenced by public articles");
for (const [relative, source] of expectedArt) {
  assert.deepEqual(fs.readFileSync(path.join(generatedContent, relative)), Buffer.isBuffer(source) ? source : fs.readFileSync(source), relative);
}

for (const series of blogCatalog) {
  const html = fs.readFileSync(path.join(dist, series.url, "index.html"), "utf8");
  assert.equal((html.match(/<h1(?:\s|>)/g) ?? []).length, 1, `${series.url}: one page title`);
  assert.ok(html.includes(` · ${SERIES_LABELS.blog} — BIWOOM</title>`), `${series.url}: series title includes the collection`);
  assert.ok(html.includes(`← ${SERIES_LABELS.blog} 목록</a>`), `${series.url}: named series index link`);
  const toc = html.match(/<ol class="ol-blog-series-toc">([\s\S]*?)<\/ol>/)?.[1] ?? "";
  assert.deepEqual([...toc.matchAll(/href="([^"]+)"/g)].map(m => m[1]), series.entries.map(e => sitePath(e.data.url)), `${series.url}: rendered reading order`);
  if (!series.count) {
    assert.ok(html.includes("새로운 이야기를 준비하고 있습니다."));
    assert.ok(!html.includes("처음부터 읽기"), "An empty series cannot have a dead reading link");
  }
  assert.ok(!feed.includes(`<link>${new URL(sitePath(series.url), SITE_URL).href}</link>`), "Series metadata is excluded from RSS");
  for (const category of series.categories) {
    const categoryHtml = fs.readFileSync(path.join(dist, category.url, "index.html"), "utf8");
    assert.equal((categoryHtml.match(/<h1(?:\s|>)/g) ?? []).length, 1);
    assert.ok(categoryHtml.includes(category.description));
    assert.ok(!feed.includes(`<link>${new URL(sitePath(category.url), SITE_URL).href}</link>`), "Category metadata is excluded from RSS");
  }
  for (const [index, post] of series.entries.entries()) {
    const postHtml = fs.readFileSync(path.join(dist, post.data.url, "index.html"), "utf8");
    assert.ok(postHtml.includes('class="ol-blog-reading-context"'), `${post.data.url}: series context`);
    const previous = postHtml.match(/<a[^>]*rel="prev"[^>]*>/)?.[0];
    const next = postHtml.match(/<a[^>]*rel="next"[^>]*>/)?.[0];
    assert.equal(Boolean(previous), index > 0);
    assert.equal(Boolean(next), index < series.count - 1);
    if (previous) assert.ok(previous.includes(`href="${sitePath(series.entries[index-1].data.url)}"`));
    if (next) assert.ok(next.includes(`href="${sitePath(series.entries[index+1].data.url)}"`));
  }
}
console.log(`BLOG covers, ${blogCatalog.length} series, metadata pages, RSS exclusions and sequential reading verified.`);
const mediaImages = await syncMediaGallery();
const mediaHtml = fs.readFileSync(path.join(dist, "media/index.html"), "utf8");
classes(mediaHtml, ["ol-media-masonry", "ol-media-dialog"], "MEDIA");
assert.equal((mediaHtml.match(/data-media-item(?:\s|>|=)/g) ?? []).length, mediaImages.length);
const mediaDialog = mediaHtml.match(/<dialog[^>]*id="ol-media-dialog"[^>]*>/)?.[0];
assert.ok(mediaDialog && !/\sopen(?:\s|=|>)/.test(mediaDialog), "MEDIA dialog must start closed");
assert.match(mediaDialog, /aria-labelledby="ol-media-dialog-title"/);
const mediaInformation = mediaHtml.match(/<aside[^>]*data-media-information[^>]*>/)?.[0];
assert.ok(mediaInformation && /\shidden(?:\s|=|>)/.test(mediaInformation), "MEDIA information must start hidden");
const informationSources = [...mediaHtml.matchAll(/<template[^>]*data-media-info="([^"]*)"/g)].map(([, source]) => decode(source));
assert.deepEqual(informationSources.sort(), mediaImages.filter(item => item.informationHtml).map(item => item.source).sort());
for (const item of mediaImages) {
  assert.ok(mediaHtml.includes(item.previewUrl), `MEDIA: missing preview ${item.source}`);
  assert.ok(fs.existsSync(path.join(dist, item.previewUrl)), `MEDIA: unpublished preview ${item.source}`);
  assert.ok(fs.existsSync(path.join(dist, decodeURIComponent(item.url))), `MEDIA: unpublished original ${item.source}`);
}
const galleryCategories = [...mediaHtml.matchAll(/<button[^>]*data-media-filter="([^"]*)"[^>]*>/g)].map(([, value]) => decode(value));
assert.deepEqual(galleryCategories.slice().sort(), ["", ...getMediaCategories(mediaImages).map((category) => category.key)].sort(), "MEDIA category filters must match the first folder keys");
assert.deepEqual(fs.readdirSync(path.join(dist, "media")), ["index.html"], "MEDIA must not create detail pages");
const home = fs.readFileSync(path.join(dist, "index.html"), "utf8");
const mediaStat = home.match(/<a[^>]*class="[^"]*ol-stat--media[^>]*>([\s\S]*?)<\/a>/)?.[0];
assert.ok(mediaStat && mediaStat.includes(`href="${sitePath("/media/")}"`), "Home MEDIA stat must link to gallery");
assert.match(mediaStat, new RegExp(`data-media-stat-count>${mediaImages.length}<`));
for (const html of [home, mediaHtml]) {
  const footer = html.match(/<footer\b[\s\S]*?<\/footer>/)?.[0] ?? "";
  assert.ok(footer.includes(`href="${sitePath("/media/")}"`), "Footer MEDIA link missing");
  const header = html.match(/<header\b[\s\S]*?<\/header>/)?.[0] ?? "";
  assert.ok(!header.includes(`href="${sitePath("/media/")}"`), "MEDIA must stay out of main menu");
  const sheet = html.match(/<nav[^>]*id="ol-mobile-sheet"[^>]*>([\s\S]*?)<\/nav>/)?.[1] ?? "";
  assert.ok(!sheet.includes(`href="${sitePath("/media/")}"`), "MEDIA must stay out of mobile main menu");
}
rule(".ol-media-masonry", /(?:column-count|columns):3/);
rule(".ol-media-card[hidden]", /display:none/);
rule(".ol-media-dialog:not([open])", /display:none/);
console.log(
  `UI markup/CSS regression checks passed for ${count} documents, ${articleIds.length} articles, and BLOG index (not a browser interaction test).`,
);

// Auxiliary ebook navigation and generated package controls must agree with source packages.
const { getEbookLibrary } = await import("./lib/ebooks.mjs");
const { books: ebooks, categories: ebookCategories } = getEbookLibrary();
const ebookHtml = fs.readFileSync(path.join(dist, "ebook/index.html"), "utf8");
const ebookCategoryControls = ebookHtml.match(/<div[^>]*aria-label="전자책 카테고리"[\s\S]*?<\/div>/)?.[0];
assert.ok(ebookCategoryControls);
assert.equal([...ebookCategoryControls.matchAll(/data-ebook-category-filter=/g)].length, ebookCategories.length + 1);
assert.ok(ebookHtml.indexOf('aria-label="전자책 카테고리"') < ebookHtml.indexOf('class="ol-ebook-grid"'));
for (const category of ebookCategories) assert.ok(ebookCategoryControls.includes(`data-ebook-category-filter="${category.key}"`));
for (const book of ebooks) assert.ok(ebookHtml.includes(`data-ebook-category="${book.categoryKey}"`));
assert.equal([...ebookHtml.matchAll(/data-ebook-item(?=[\s>])/g)].length, ebooks.length);
assert.equal([...ebookHtml.matchAll(/download="/g)].length, ebooks.reduce((count, book) => count + book.downloads.length, 0));
assert.ok(ebookHtml.includes('id="ebook-dialog"'));
assert.ok(ebookHtml.includes('CC0'));
const ebookFooter = ebookHtml.match(/<footer[\s\S]*?<\/footer>/)?.[0] ?? "";
assert.ok(ebookFooter.replaceAll(/>\s+</g, "><").includes(`>MEDIA</a><a href="${sitePath("/ebook/")}">EBOOK</a>`));
assert.ok(!ebookHtml.split("</header>")[0].includes('>EBOOK<'));
assert.ok(fs.readFileSync(path.join(dist, "sitemap-0.xml"), "utf8").includes('/ebook/'));
console.log(`EBOOK controls and footer navigation verified for ${ebooks.length} books.`);
