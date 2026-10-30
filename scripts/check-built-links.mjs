import fs from "node:fs";
import path from "node:path";
import { walk, readRegistry } from "./lib/content.mjs";
const root = path.resolve("dist"),
  errors = [];
const htmlFiles = walk(root, { assets: true }).filter(
  (p) => p.endsWith(".html") && !p.includes("/generated/"),
);
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const tags = [
    ...html.matchAll(
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
      const id = decodeURIComponent(fragment),
        dest = fs.readFileSync(target, "utf8");
      if (!dest.includes(`id="${id}"`) && !dest.includes(`name="${id}"`))
        errors.push(`${path.relative(root, file)}: missing anchor ${value}`);
    }
  }
}
const registry = readRegistry();
for (const [route, to] of Object.entries(registry.redirects)) {
  const target = path.join(root, to, "index.html");
  if (!fs.existsSync(target))
    errors.push(`redirect ${route}: missing target ${to}`);
}
if (errors.length) {
  console.error([...new Set(errors)].join("\n"));
  process.exitCode = 1;
} else
  console.log(
    `Built links verified across ${htmlFiles.length} pages and ${Object.keys(registry.redirects).length} redirects.`,
  );
