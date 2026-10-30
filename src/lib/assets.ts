import { resolveReference } from "../../scripts/remark-content.mjs";
export function getBlogThumbnailUrl(post: {
  body?: string;
  data: { source: string; thumbnailAsset?: string };
}) {
  const asset =
    post.data.thumbnailAsset ??
    post.body?.match(/!\[[^\]]*\]\(<?([^\s)>]+)>?\)/)?.[1];
  return asset ? resolveReference(post.data.source, asset) : undefined;
}
