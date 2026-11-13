// Only existing, ordinary Markdown changes can reuse rendered siblings.
// Adds/removals, introductions, assets and unknown events retain full invalidation.
export function isDocumentEdit(change) {
  return change.event === "change" && /^(text|story|blog|pages)\//.test(change.relative ?? "")
    && /\.(md|mdx)$/i.test(change.relative) && !/(^|\/)index\.md$/i.test(change.relative);
}

export function acceptsCollectionChange(name, change) {
  return !isDocumentEdit(change) || change.relative.split("/")[0] === name;
}

// Hash-only registry writes are feedback from preparation, not policy changes.
// Preserve every other field, including identities, dates, aliases and visibility.
export function registryPolicy(registry) {
  return JSON.stringify({ ...registry, files: Object.fromEntries(
    Object.entries(registry.files).map(([source, { hash, ...record }]) => [source, record]),
  ) });
}

export function refreshMode(changes, previousPolicy, nextPolicy) {
  if (previousPolicy === undefined || previousPolicy !== nextPolicy) return "full";
  if (changes.length && changes.every(change => change.relative === null)) return "skip";
  return changes.length && changes.every(change => change.relative === null || isDocumentEdit(change))
    ? "incremental" : "full";
}
