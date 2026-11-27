import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { parse } from "parse5";
import { walk } from "./lib/content.mjs";
import { projectPaths } from "./lib/paths.mjs";
import { searchPaths } from "../src/lib/search.mjs";

const { dist } = projectPaths();
const measurements = { works: [], lists: [], rails: [], contents: [] };
const tree = node => [node, ...(node.childNodes ?? []).flatMap(tree)];
const has = (node, name, value) => node.attrs?.some(attr =>
  attr.name === name && (value === undefined || attr.value === value));
const rows = node => has(node, "data-text-material-item");
const links = node => node.tagName === "a";

function measure(html, node, matches) {
  const { startOffset, endOffset } = node.sourceCodeLocation;
  const bytes = Buffer.from(html.slice(startOffset, endOffset));
  return { entries: tree(node).filter(matches).length, gzip: gzipSync(bytes).length };
}

for (const file of walk(path.join(dist, "text"), { assets: true }).filter(file => path.basename(file) === "index.html")) {
  const html = fs.readFileSync(file, "utf8");
  if (!html.includes('id="text-materials"') && !html.includes('id="text-document-list"')) continue;
  const nodes = tree(parse(html, { sourceCodeLocationInfo: true }));
  const materialSection = nodes.find(node => has(node, "id", "text-materials"));
  if (materialSection) {
    const page = nodes.find(node => has(node, "data-text-material-page"));
    const catalog = nodes.flatMap(node => node.attrs ?? []).find(attr => attr.name === "data-text-material-catalog")?.value;
    if (page) {
      const summary = measure(html, page, rows);
      assert.ok(summary.entries > 0 && summary.entries <= 30, file);
      measurements.lists.push(summary);
    } else {
      const summary = measure(html, materialSection, rows);
      assert.ok(summary.entries <= 60, file);
      if (catalog) {
        assert.equal(summary.entries, 0, file);
        const records = JSON.parse(fs.readFileSync(path.join(dist, decodeURIComponent(catalog)), "utf8"));
        assert.ok(records.length > 30, file);
        assert.equal(new Set(records.map(record => record.url)).size, records.length, file);
      }
      measurements.works.push(summary);
    }
  }
  const rail = nodes.find(node => has(node, "data-text-reader-links"));
  const toc = nodes.find(node => has(node, "id", "ol-reader-toc"));
  if (rail) {
    const summary = measure(html, rail, links);
    assert.ok(summary.entries <= 30, file);
    assert.equal(tree(rail).filter(node => has(node, "aria-current", "page")).length, 1, file);
    measurements.rails.push(summary);
  }
  if (toc) measurements.contents.push(measure(html, toc, node => links(node) && has(node, "data-level")));
}

for (const [name, samples] of Object.entries(measurements)) {
  const max = key => Math.max(0, ...samples.map(sample => sample[key]));
  const total = samples.reduce((sum, sample) => sum + sample.entries, 0);
  console.log(`TEXT ${name}: ${samples.length} pages, ${total} entries total, max ${max("entries")} entries / gzip ${max("gzip")} B.`);
}
const original = fs.readFileSync(path.join(dist, searchPaths.originals));
console.log(`TEXT Han search: ${JSON.parse(original).length} documents / gzip ${gzipSync(original).length} B.`);
