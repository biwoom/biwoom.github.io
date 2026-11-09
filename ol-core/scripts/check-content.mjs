import { PROJECT_ROOT, projectPaths, isMainModule } from './lib/paths.mjs';
import fs from "node:fs";
import path from "node:path";
import { visit } from "unist-util-visit";
import { readMediaInformation } from "./lib/media-information.mjs";
import { prepare } from "./prepare-content.mjs";
import { walk, normalize, parse, markdownPattern, mediaPattern, isIntroduction, markdownTree, referenceTarget, isPublicSource, categoryFolders } from "./lib/content.mjs";
export function validate(root = PROJECT_ROOT) {
  const errors = [], base = projectPaths(root).content;
  let registry;
  try { registry = prepare(root); } catch (error) { return [error.message]; }
  try { readMediaInformation(root); } catch (error) { errors.push(error.message); }
  const urls = new Map(), ids = new Map(), series = new Set();
  const claim = (url, source) => {
    if (!/^\/[\w\-/%\p{L}\p{N}.]+\/$/u.test(url) || url.includes("..")) errors.push(`${source}: invalid public URL ${url}`);
    if (urls.has(url) && urls.get(url) !== source) errors.push(`${source}: duplicate public URL ${url} (${urls.get(url)})`);
    urls.set(url, source);
  };
  for (const file of ["text", "story", "blog", "pages"].flatMap(c => walk(path.join(base,c))).filter(p => markdownPattern.test(p) || mediaPattern.test(p))) {
    const relative = path.relative(base,file).split(path.sep).join("/");
    try {
      const source = markdownPattern.test(file) ? fs.readFileSync(file,"utf8") : "";
      const {data,body} = parse(source), normal = normalize(relative,source,registry,root);
      const info = relative.split("/"), intro = isIntroduction(relative);
      if (["text", "story"].includes(info[0]) && !(info.length === 5 && path.basename(file) !== "index.md" || intro)) errors.push(`${relative}: expected category/work/section/document or category/work/index.md`);
      if (!normal.title?.trim() || /^\d+$/.test(normal.title)) errors.push(`${relative}: add an H1 title or descriptive filename`);
      if (Number.isNaN(normal.date.valueOf())) errors.push(`${relative}: invalid date`);
      const published = isPublicSource(relative,registry,root);
      if (published) {
        if (ids.has(registry.files[relative].id)) errors.push(`${relative}: duplicate content id`);
        ids.set(registry.files[relative].id,relative);
        if (["text","story"].includes(info[0])) {
          if (!series.has(normal.seriesKey)) { claim(normal.seriesUrl,normal.seriesKey); series.add(normal.seriesKey); }
          if (intro && normal.url !== normal.seriesUrl) errors.push(`${relative}: introduction URL must equal series URL`);
        }
        if (!intro) claim(normal.url,relative);
      }
      // Nonpublic writing may have unfinished references; it is never rendered.
      if (!published) continue;
      const checkReference = url => {
        if (/^(?:[a-z][a-z0-9+.-]*:|\/|#)/i.test(url) && !url.startsWith("content-asset:") && !url.startsWith("design-asset:")) return;
        if (url.startsWith("design-asset:")) { errors.push(`${relative}: unmigrated asset ${url}`); return; }
        const candidate = referenceTarget(relative,url,registry);
        if (!candidate || !fs.existsSync(path.join(base,candidate))) errors.push(`${relative}: missing local target ${url}`);
        else if (!isPublicSource(candidate,registry,root,{asset:!markdownPattern.test(candidate)})) errors.push(`${relative}: link points to excluded document or asset ${url}`);
      };
      visit(markdownTree(body),node => { if (["link","image","definition"].includes(node.type) && node.url) checkReference(node.url); });
      if (data.thumbnailAsset) checkReference(data.thumbnailAsset);
    } catch(error) { errors.push(`${relative}: ${error.message}`); }
  }
  for (const collection of ["text", "story"])
    for (const category of categoryFolders(collection, root)) claim(category.url, category.key);
  for (const route of ["/", "/text/", "/story/", "/blog/", "/media/", "/partners/", "/404/"]) if (urls.has(route)) errors.push(`Content collides with reserved route ${route}`);
  for (const [from,to] of Object.entries(registry.redirects)) {
    if (urls.has(from)) errors.push(`Redirect collides with public URL ${from}`);
    if (!from.startsWith("/") || !to.startsWith("/")) errors.push(`Invalid redirect ${from}`);
  }
  return [...new Set(errors)];
}
if (isMainModule(import.meta.url)) {
  const i = process.argv.indexOf("--root"), errors = validate(i >= 0 ? path.resolve(process.argv[i+1]) : PROJECT_ROOT);
  if(errors.length) { console.error(`content check failed with ${errors.length} issue(s):\n${errors.map(e=>"- "+e).join("\n")}`); process.exitCode=1; }
  else console.log("Content checks passed.");
}
