import type { CollectionEntry } from 'astro:content';
import {
  compareKo,
  compareOptionalNumber,
  compareOrderAndLabel,
  pushGroupedValue,
  slugifyContentSegment,
} from './content-structure';
import { parsePrefixTag } from './tags';

type StoryEntry = CollectionEntry<'story'>;

export const STORY_DEFAULT_SERIES = '_story';
export const STORY_DEFAULT_PART = 'bibliography';
export const STORY_DEFAULT_GROUP = '_ungrouped';

export interface StoryGroup {
  key: string;
  slug: string;
  label: string;
  order: number;
  entries: StoryEntry[];
  count: number;
}

export interface StoryPart {
  key: string;
  slug: string;
  label: string;
  order: number;
  entries: StoryEntry[];
  groups: StoryGroup[];
  count: number;
}

export interface StorySeries {
  key: string;
  slug: string;
  label: string;
  order: number;
  meta?: StoryEntry;
  entries: StoryEntry[];
  parts: StoryPart[];
  count: number;
}

export function slugifyStorySegment(value: string): string {
  return slugifyContentSegment(value);
}

export function getStorySeriesSlug(entry: StoryEntry): string {
  return entry.data.seriesSlug ?? entry.id.split('/')[0] ?? STORY_DEFAULT_SERIES;
}

export function getStoryPartSlug(entry: StoryEntry): string {
  return entry.data.partSlug ?? slugifyStorySegment(entry.data.part ?? STORY_DEFAULT_PART);
}

export function getStoryGroupSlug(entry: StoryEntry): string {
  return entry.data.groupSlug ?? slugifyStorySegment(entry.data.group ?? STORY_DEFAULT_GROUP);
}

export function isStorySeriesIndex(entry: StoryEntry): boolean {
  const segments = entry.id.split('/');
  return entry.data.kind === 'series' || segments.length === 1 || segments.at(-1) === 'index';
}

export function isStoryDocumentEntry(entry: StoryEntry): boolean {
  return !isStorySeriesIndex(entry);
}

export function getStoryDocumentSlug(entry: StoryEntry): string {
  return entry.id.split('/').at(-1) ?? slugifyStorySegment(entry.data.title);
}

export function getStoryEntryUrl(entry: StoryEntry): string {
  const seriesSlug = getStorySeriesSlug(entry);
  if (isStorySeriesIndex(entry)) return `/story/${seriesSlug}`;
  return `/story/${seriesSlug}/${getStoryPartSlug(entry)}/${getStoryDocumentSlug(entry)}`;
}

export function sortStoryEntries(entries: StoryEntry[]): StoryEntry[] {
  return [...entries].sort((a, b) => {
    const partDiff = compareOptionalNumber(a.data.partOrder, b.data.partOrder, 0);
    if (partDiff !== 0) return partDiff;

    const groupDiff = compareOptionalNumber(a.data.groupOrder, b.data.groupOrder, 0);
    if (groupDiff !== 0) return groupDiff;

    const orderDiff = compareOptionalNumber(a.data.order, b.data.order, 0);
    if (orderDiff !== 0) return orderDiff;

    const chapterDiff = compareOptionalNumber(a.data.chapter, b.data.chapter);
    if (chapterDiff !== 0) return chapterDiff;

    return compareKo(a.data.title, b.data.title);
  });
}

export function buildStoryHierarchy(entries: StoryEntry[]): StorySeries[] {
  const seriesMap = new Map<string, StoryEntry[]>();

  for (const entry of entries) {
    const seriesSlug = getStorySeriesSlug(entry);
    pushGroupedValue(seriesMap, seriesSlug, entry);
  }

  return Array.from(seriesMap.entries())
    .map(([seriesSlug, seriesEntries]) => {
      const meta = seriesEntries.find(isStorySeriesIndex);
      const documentEntries = seriesEntries.filter(isStoryDocumentEntry);
      const partMap = new Map<string, StoryEntry[]>();

      for (const entry of documentEntries) {
        const partSlug = getStoryPartSlug(entry);
        pushGroupedValue(partMap, partSlug, entry);
      }

      const parts = Array.from(partMap.entries())
        .map(([partSlug, partEntries]) => {
          const groupMap = new Map<string, StoryEntry[]>();

          for (const entry of partEntries) {
            const groupSlug = getStoryGroupSlug(entry);
            pushGroupedValue(groupMap, groupSlug, entry);
          }

          const groups = Array.from(groupMap.entries())
            .map(([groupSlug, groupEntries]) => ({
              key: groupSlug,
              slug: groupSlug,
              label: groupEntries[0]?.data.group ?? '본문',
              order: groupEntries[0]?.data.groupOrder ?? 0,
              entries: sortStoryEntries(groupEntries),
              count: groupEntries.length,
            }))
            .sort(compareOrderAndLabel);

          return {
            key: partSlug,
            slug: partSlug,
            label: partEntries[0]?.data.part ?? '본문',
            order: partEntries[0]?.data.partOrder ?? 0,
            entries: sortStoryEntries(partEntries),
            groups,
            count: partEntries.length,
          };
        })
        .sort(compareOrderAndLabel);

      return {
        key: seriesSlug,
        slug: seriesSlug,
        label: meta?.data.series ?? meta?.data.title ?? documentEntries[0]?.data.series ?? documentEntries[0]?.data.title ?? seriesSlug,
        order: meta?.data.seriesOrder ?? documentEntries[0]?.data.seriesOrder ?? 0,
        meta,
        entries: sortStoryEntries(seriesEntries),
        parts,
        count: documentEntries.length,
      };
    })
    .sort(compareOrderAndLabel);
}

export function formatStoryTag(tag: string): { prefix: string; label: string } {
  return parsePrefixTag(tag);
}
