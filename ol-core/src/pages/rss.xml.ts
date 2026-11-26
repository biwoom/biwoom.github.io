import rss from "@astrojs/rss";
import { BRAND, SITE_URL } from "../lib/site-config";
import { url } from "../lib/url";
import { getCollection } from "astro:content";

export async function GET() {
  const posts = (
    await getCollection("blog", ({ data }) => data.published && data.kind === "document")
  ).sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  return rss({
    title: `${BRAND.name} BLOG`,
    description: "불교의 사유와 수행, 창작과 비움의 제작 기록.",
    site: `${SITE_URL}/`,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description ?? "",
      pubDate: post.data.date,
      link: new URL(url(post.data.url), SITE_URL).href,
    })),
    customData: "<language>ko</language>",
  });
}
