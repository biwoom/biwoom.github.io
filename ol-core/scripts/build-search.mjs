import path from "node:path";
import { close, createIndex } from "pagefind";
import { projectPaths } from "./lib/paths.mjs";

const { dist } = projectPaths();

try {
  const { index, errors } = await createIndex();
  if (!index || errors.length) throw new Error(errors.join("\n") || "Could not create the search index.");

  const result = await index.addDirectory({ path: dist });
  if (result.errors.length) throw new Error(result.errors.join("\n"));

  // A new vault can publish a valid search bundle before its first public article.
  const output = await index.writeFiles({ outputPath: path.join(dist, "pagefind") });
  if (output.errors.length) throw new Error(output.errors.join("\n"));
  console.log("Pagefind search bundle generated.");
} finally {
  await close();
}
