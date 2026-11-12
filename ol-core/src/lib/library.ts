import { getCollection } from "astro:content";
import { categoryFolders, compareNames } from "../../scripts/lib/content.mjs";
export type Section = "text" | "story";
export type Entry = Awaited<ReturnType<typeof getDocuments>>[number];
export async function getDocuments(section: Section) {
  const [documents, media] = await Promise.all([
    getCollection(section),
    getCollection("materials"),
  ]);
  return [
    ...documents,
    ...media.filter((e) => e.data.source.startsWith(section + "/")),
  ].filter((e) => e.data.published && e.data.kind !== "category");
}
export async function getLibrary(section: Section) {
  const entries = await getDocuments(section);
  const keys = [...new Set(entries.map((e) => e.data.seriesKey))];
  return keys
    .map((key) => {
      const items = entries.filter((e) => e.data.seriesKey === key);
      const meta = items.find((e) => e.data.kind === "series");
      const documents = items.filter((e) => e.data.kind !== "series");
      const first = meta ?? documents[0];
      const parts = [...new Set(documents.map((e) => e.data.partKey))]
        .sort(compareNames)
        .map((partKey) => ({
          key: partKey,
          label: documents.find((e) => e.data.partKey === partKey)!.data.part,
          entries: documents
            .filter((e) => e.data.partKey === partKey)
            .sort((a, b) =>
              compareNames(
                a.data.source.split("/").at(-1),
                b.data.source.split("/").at(-1),
              ),
            ),
        }));
      return {
        key,
        label: first.data.series,
        url: first.data.seriesUrl,
        category: first.data.category,
        categoryKey: key.split("/").slice(0, 2).join("/"),
        categoryOrder: first.data.categoryOrder,
        description: meta?.data.description ?? "",
        meta,
        parts,
        entries: parts.flatMap((p) => p.entries),
        count: documents.length,
      };
    })
    .sort(
      (a, b) =>
        a.categoryOrder - b.categoryOrder ||
        compareNames(a.key.split("/").at(-1), b.key.split("/").at(-1)),
    );
}
export function entryUrl(entry: { data: { url: string } }) {
  return entry.data.url;
}

export type Library = Awaited<ReturnType<typeof getLibrary>>[number];

export { categoryUrl } from "../../scripts/lib/content.mjs";
export function getCategories(section: Section, library: Library[]) {
  return categoryFolders(section).map((category) => {
    const series = library.filter((item) => item.categoryKey === category.key);
    return { ...category, series, count: series.reduce((sum, item) => sum + item.count, 0) };
  });
}
export type Category = ReturnType<typeof getCategories>[number];
