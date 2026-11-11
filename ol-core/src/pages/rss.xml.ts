import rss from "@astrojs/rss";
import { BRAND } from "../lib/site-config";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const posts = (
    await getCollection("blog", ({ data }) => data.published && data.kind === "document")
  ).sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  return rss({
    title: `${BRAND.name} BLOG`,
    description: "불교의 사유와 수행, 창작과 비움의 제작 기록.",
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description ?? "",
      pubDate: post.data.date,
      link: post.data.url,
    })),
    customData: "<language>ko</language>",
  });
}
