export interface PrefixTagGroup {
  prefix: string;
  tags: {
    tag: string;
    label: string;
    count: number;
  }[];
}

export const INTERNAL_TAG_PREFIXES = new Set([
  'feature',
  'format',
  'framework',
  'kind',
  'project',
  'text',
  'tool',
  'topic',
]);

export function parsePrefixTag(tag: string): { prefix: string; label: string } {
  const [prefix, ...rest] = tag.split('/');
  return {
    prefix: rest.length > 0 ? prefix : '태그',
    label: rest.length > 0 ? rest.join('/') : tag,
  };
}

export function isSlashTag(tag: string): boolean {
  const [prefix, ...rest] = tag.split('/');
  return prefix.length > 0 && rest.join('/').length > 0;
}

export function isInternalTag(tag: string): boolean {
  const { prefix } = parsePrefixTag(tag);
  return INTERNAL_TAG_PREFIXES.has(prefix);
}

export function getPublicTags(tags: string[]): string[] {
  return tags.filter(tag => !isInternalTag(tag));
}

export function groupTagsByPrefix(tags: string[]): PrefixTagGroup[] {
  const prefixMap = new Map<string, Map<string, { tag: string; label: string; count: number }>>();

  for (const tag of tags) {
    const parsed = parsePrefixTag(tag);
    const tagMap = prefixMap.get(parsed.prefix) ?? new Map();
    const current = tagMap.get(tag) ?? { tag, label: parsed.label, count: 0 };
    current.count += 1;
    tagMap.set(tag, current);
    prefixMap.set(parsed.prefix, tagMap);
  }

  return Array.from(prefixMap.entries())
    .map(([prefix, tagMap]) => ({
      prefix,
      tags: Array.from(tagMap.values()).sort((a, b) => a.label.localeCompare(b.label, 'ko')),
    }))
    .sort((a, b) => a.prefix.localeCompare(b.prefix, 'ko'));
}
