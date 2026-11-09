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

export function getBlogCategories(posts: readonly { category: string; categoryOrder: number }[]) {
  const groups = new Map<string, { category: string; order: number; count: number }>();
  for (const post of posts) {
    const category = post.category || "미분류";
    const group = groups.get(category) ?? { category, order: post.categoryOrder, count: 0 };
    group.count++;
    group.order = Math.min(group.order, post.categoryOrder);
    groups.set(category, group);
  }
  return [...groups.values()]
    .sort((a, b) => a.order - b.order || a.category.localeCompare(b.category, "ko"))
    .map(({ category, count }) => ({ category, count }));
}

export function matchesBlogFilters(
  post: TaggedPost & { year: string; category?: string },
  tag: string,
  year: string,
  category = "",
): boolean {
  return (!tag || post.tags.includes(tag)) && (year === "all" || post.year === year)
    && (!category || (post.category || "미분류") === category);
}
