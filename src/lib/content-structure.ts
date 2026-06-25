export function slugifyContentSegment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

export function compareKo(a: string, b: string): number {
  return a.localeCompare(b, 'ko');
}

export function compareOptionalNumber(
  a: number | undefined,
  b: number | undefined,
  fallback = Number.MAX_SAFE_INTEGER,
): number {
  return (a ?? fallback) - (b ?? fallback);
}

export function compareOrderAndLabel(
  a: { order?: number; label: string },
  b: { order?: number; label: string },
): number {
  const orderDiff = (a.order ?? 0) - (b.order ?? 0);
  if (orderDiff !== 0) return orderDiff;
  return compareKo(a.label, b.label);
}

export function pushGroupedValue<T>(map: Map<string, T[]>, key: string, value: T): void {
  const items = map.get(key) ?? [];
  items.push(value);
  map.set(key, items);
}
