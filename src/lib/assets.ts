import { resolveReference } from "../../scripts/remark-content.mjs";
import { markdownTree } from "../../scripts/lib/content.mjs";
export function getBlogThumbnailUrl(post: {
  body?: string;
  data: { source: string; thumbnailAsset?: string };
}) {
  let firstImage: string | undefined;
  const find = (node: { type: string; url?: string; children?: any[] }) => {
    if (node.type === "image" && !firstImage) firstImage = node.url;
    node.children?.forEach(find);
  };
  find(markdownTree(post.body ?? ""));
  const asset = post.data.thumbnailAsset ?? firstImage;
  return asset ? resolveReference(post.data.source, asset) : undefined;
}
