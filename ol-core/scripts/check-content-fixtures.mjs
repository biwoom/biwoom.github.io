import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  nameInfo,
  categoryFolders,
  hash,
  compareNames,
  normalize,
  folderParts,
  mediaEntries,
} from "./lib/content.mjs";
import { prepare } from "./prepare-content.mjs";
import { validate } from "./check-content.mjs";
function fixture(fn) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ol-content-"));
  try {
    fs.writeFileSync(path.join(root, "content-registry.json"), JSON.stringify({version:1, files:{},folders:{},redirects:{},aliases:{}}));
    fs.mkdirSync(
      path.join(root, "content/text/001.중관부/001.대승현론/01.번역"),
      { recursive: true },
    );
    return fn(root);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}
const rel = "text/001.중관부/001.대승현론/01.번역/001.1권.md";
function write(root, relative, body) {
  const p = path.join(root, "content", relative);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, body);
  return p;
}
test("numeric names preserve title digits and accept different padding", () => {
  assert.deepEqual(nameInfo("001.1권.md"), { label: "1권", order: 1 });
  assert.equal(nameInfo("001.md").order, 1);
  assert.deepEqual(["10.연구", "002.번역", "참고"].sort(compareNames), [
    "002.번역",
    "10.연구",
    "참고",
  ]);
});
test("YAML-free headings and independent material sections normalize", () =>
  fixture((root) => {
    write(root, rel, "# 대승현론 제1권\n\n본문입니다.");
    const r = prepare(root);
    const d = normalize(
      rel,
      fs.readFileSync(path.join(root, "content", rel), "utf8"),
      r,
      root,
    );
    assert.equal(d.title, "대승현론 제1권");
    assert.equal(d.category, "중관부");
    assert.equal(d.series, "대승현론");
    assert.equal(d.part, "번역");
    assert.equal(d.published, true);
    assert.equal(
      folderParts(rel.replace("01.번역", "02.연구")).seriesPath,
      d.seriesKey,
    );
    assert.deepEqual(validate(root), []);
  }));
test("moves and numeric renames preserve URL and first-publication date", () =>
  fixture((root) => {
    const a = write(root, rel, "# 제목\n\n내용");
    const before = prepare(root).files[rel];
    const target = rel.replace("001.1권.md", "010.제목변경.md");
    fs.renameSync(a, path.join(root, "content", target));
    const after = prepare(root).files[target];
    assert.equal(after.url, before.url);
    assert.equal(after.date, before.date);
  }));
test("drafts, private configuration and auxiliary images are excluded; direct PDF is included", () =>
  fixture((root) => {
    write(root, "text/_drafts/private.md", "# 비공개");
    write(root, "text/.obsidian/cache.md", "# 설정");
    write(
      root,
      "text/001.중관부/001.대승현론/01.번역/assets/image.png",
      "image",
    );
    write(root, rel.replace(".md", ".pdf"), "%PDF-test");
    const r = prepare(root);
    assert.equal(Object.keys(r.files).length, 1);
    assert.ok(r.files[rel.replace(".md", ".pdf")]);
    const media = mediaEntries(root);
    assert.equal(media.length, 1);
    assert.equal(media[0].data.format, "PDF");
    assert.equal(media[0].data.title, "1권");
  }));
test("unpublished intro hides its documents; rights overrides remain intact", () =>
  fixture((root) => {
    write(
      root,
      "text/001.중관부/001.대승현론/index.md",
      "---\npublished: false\n---\n# 소개",
    );
    write(root, rel, "---\nlicense: CC-BY\nrightsHolder: 원저자\n---\n# 제목");
    const r = prepare(root);
    const d = normalize(
      rel,
      fs.readFileSync(path.join(root, "content", rel), "utf8"),
      r,
      root,
    );
    assert.equal(d.published, false);
    assert.equal(d.license, "CC-BY");
    assert.equal(d.rightsHolder, "원저자");
  }));
test("missing assets and removed schema fields are actionable errors", () =>
  fixture((root) => {
    write(
      root,
      rel,
      "---\nentities: [old-id]\n---\n# 제목\n\n![없음](./missing.png)",
    );
    const errors = validate(root);
    assert.ok(errors.some((e) => e.includes("entities")));
    write(root, rel, "# 제목\n\n![없음](./missing.png)");
    assert.ok(validate(root).some((e) => e.includes("missing local target")));
  }));
test("same displayed filename in two independent sections gets distinct URLs", () =>
  fixture((root) => {
    write(root, rel, "# 번역");
    write(root, rel.replace("01.번역", "02.연구"), "# 독립 연구");
    const r = prepare(root);
    const urls = Object.values(r.files).map((x) => x.url);
    assert.equal(new Set(urls).size, 2);
  }));
test("series folder renames preserve the work route and old document links", () =>
  fixture((root) => {
    write(root, rel, "# 제목");
    const before = prepare(root);
    const work = "text/001.중관부/001.대승현론";
    const oldUrl = before.folders[work].url;
    fs.renameSync(
      path.join(root, "content", work),
      path.join(root, "content/text/001.중관부/002.대승현론 수정"),
    );
    const after = prepare(root);
    const newRel = rel.replace("001.대승현론", "002.대승현론 수정");
    assert.equal(
      after.folders["text/001.중관부/002.대승현론 수정"].url,
      oldUrl,
    );
    assert.equal(after.aliases[rel], newRel);
  }));
test("publication date is not assigned to an explicitly unpublished new document", () =>
  fixture((root) => {
    const p = write(root, rel, "---\npublished: false\n---\n# 제목");
    assert.equal(prepare(root).files[rel].date, null);
    fs.writeFileSync(p, "# 제목");
    assert.match(prepare(root).files[rel].date, /^\d{4}-\d{2}-\d{2}$/);
  }));

test("STORY categories preserve legacy series and document identity after moving", () =>
  fixture((root) => {
    const oldSeries = "story/010.붓다 스토리";
    const oldDoc = `${oldSeries}/010.파트/001.첫 이야기.md`;
    const intro = "# 붓다 스토리\n\n소개";
    const body = "# 첫 이야기\n\n본문";
    write(root, `${oldSeries}/index.md`, intro);
    write(root, oldDoc, body);
    const registry = {
      version: 1, aliases: {}, redirects: {},
      folders: { [oldSeries]: { title: "붓다 스토리", url: "/story/buddha-story/" } },
      files: {
        [`${oldSeries}/index.md`]: { id: "intro", url: "/story/buddha-story/", date: "2026-01-01", hash: hash(intro), seriesKey: oldSeries },
        [oldDoc]: { id: "chapter", url: "/story/buddha-story/first/", date: "2026-01-02", hash: hash(body), seriesKey: oldSeries },
      },
    };
    fs.writeFileSync(path.join(root, "content-registry.json"), JSON.stringify(registry));
    const newSeries = "story/001.불전문학/010.붓다 스토리";
    fs.mkdirSync(path.join(root, "content/story/001.불전문학"), { recursive: true });
    fs.renameSync(path.join(root, "content", oldSeries), path.join(root, "content", newSeries));
    const after = prepare(root);
    const newDoc = oldDoc.replace(oldSeries, newSeries);
    const normal = normalize(newDoc, body, after, root);
    assert.equal(normal.category, "불전문학");
    assert.equal(normal.categoryOrder, 1);
    assert.equal(normal.series, "붓다 스토리");
    assert.equal(normal.part, "파트");
    assert.equal(normal.seriesUrl, "/story/buddha-story/");
    assert.equal(normal.url, "/story/buddha-story/first/");
    assert.equal(after.files[newDoc].id, "chapter");
    assert.equal(after.files[newDoc].date, "2026-01-02");
    assert.equal(after.files[`${newSeries}/index.md`].url, normal.seriesUrl);
    assert.deepEqual(validate(root), []);
  }));
test("empty categories are sorted, retain their labels, and exclude reserved folders", () =>
  fixture((root) => {
    for (const name of ["002.선시(禪詩)", "001.불전문학", "_drafts", ".obsidian", "assets", "_assets"])
      fs.mkdirSync(path.join(root, "content/story", name), { recursive: true });
    const categories = categoryFolders("story", root);
    assert.deepEqual(categories.map((category) => category.label), ["불전문학", "선시(禪詩)"]);
    assert.ok(categories.every((category) => /^\/story\/category\/[a-f0-9]+\/$/.test(category.url)));
    assert.equal(new Set(categories.map((category) => category.url)).size, 2);
  }));
test("STORY requires category/series/part/document and keeps private series hidden", () =>
  fixture((root) => {
    const series = "story/001.불전문학/010.시리즈";
    const doc = `${series}/010.파트/001.문서.md`;
    write(root, `${series}/index.md`, "---\npublished: false\n---\n# 비공개 시리즈");
    write(root, doc, "# 숨긴 이야기");
    const registry = prepare(root);
    assert.equal(normalize(doc, "# 숨긴 이야기", registry, root).published, false);
    assert.deepEqual(validate(root), []);
    write(root, "story/010.옛시리즈/010.파트/001.이전 구조.md", "# 이전 구조");
    assert.ok(validate(root).some((error) => error.includes("expected category/work/section/document")));
  }));


test('BLOG category derives from its series child folder and preserves post identity on moves', () => fixture(root => {
  const old='blog/001.불교/001.교학/guide/index.md';
  const source='# 교학 글\n\n본문';
  fs.mkdirSync(path.join(root,'content',path.dirname(old)),{recursive:true});
  fs.writeFileSync(path.join(root,'content',old),source);
  const before=prepare(root), record={...before.files[old]};
  let data=normalize(old,source,before,root);
  assert.equal(data.category,'교학'); assert.equal(data.categoryOrder,1);
  assert.equal(data.kind,'document'); assert.equal(data.seriesKey,'blog/001.불교');
  const next='blog/002.실천/002.수행/guide/index.md';
  fs.mkdirSync(path.join(root,'content/blog/002.실천/002.수행'),{recursive:true});
  fs.renameSync(path.join(root,'content/blog/001.불교/001.교학/guide'),path.join(root,'content/blog/002.실천/002.수행/guide'));
  const after=prepare(root);data=normalize(next,source,after,root);
  assert.equal(data.category,'수행'); assert.equal(data.categoryOrder,2);
  assert.equal(data.url,record.url); assert.equal(data.date.toISOString().slice(0,10),record.date);
  assert.equal(after.files[next].id,record.id);
  assert.equal(folderParts('blog/loose.md').category,'');
}));
