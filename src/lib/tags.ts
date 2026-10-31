export interface TaggedPost {
  tags: readonly string[];
}

/** Count each tag once per published post, then put frequent tags first. */
export function getBlogTags(posts: readonly TaggedPost[]) {
  const counts = new Map<string, number>();
  for (const post of posts)
    for (const tag of new Set(post.tags)) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  return [...counts].map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, "ko"));
}

export function matchesBlogFilters(
  post: TaggedPost & { year: string },
  tag: string,
  year: string,
): boolean {
  return (!tag || post.tags.includes(tag)) && (year === "all" || post.year === year);
}
