import { getCollection } from "astro:content";
import { readBlogCatalog } from "../../scripts/lib/blog.mjs";
import { resolveReference } from "../../scripts/remark-content.mjs";

export async function getBlogLibrary() {
  const entries = await getCollection("blog", e => e.data.published);
  const cover = (source: string) => {
    const meta = entries.find(e => e.data.source === source);
    return meta?.data.thumbnailAsset ? resolveReference(source, meta.data.thumbnailAsset) : undefined;
  };
  return readBlogCatalog().map(series => ({
    ...series,
    meta: entries.find(e => e.data.source === series.source),
    coverUrl: cover(series.source),
    categories: series.categories.map(category => ({ ...category, coverUrl: cover(category.source), meta: entries.find(e => e.data.source === category.source) })),
    entries: series.entries.map(item => entries.find(e => e.id === item.id)!).filter(Boolean),
  }));
}
export type BlogSeries = Awaited<ReturnType<typeof getBlogLibrary>>[number];
