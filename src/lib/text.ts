import type { CollectionEntry } from 'astro:content';
import {
  compareKo,
  compareOptionalNumber,
  compareOrderAndLabel,
  pushGroupedValue,
  slugifyContentSegment,
} from './content-structure';
import { parsePrefixTag } from './tags';

type TextEntry = CollectionEntry<'text'>;

export const STANDALONE_SERIES = '_standalone';
export const UNPARTED_TEXT = '_unparted';
export const UNGROUPED_TEXT = '_ungrouped';

export interface TextGroup {
  key: string;
  label: string;
  order: number;
  entries: TextEntry[];
}

export interface TextPart {
  key: string;
  label: string;
  order: number;
  groups: TextGroup[];
  count: number;
}

export interface TextSeries {
  key: string;
  slug: string;
  label: string;
  order: number;
  meta?: TextEntry;
  parts: TextPart[];
  count: number;
  entries: TextEntry[];
}

export function slugifyTextSegment(value: string): string {
  return slugifyContentSegment(value);
}

export function getTextSeriesSlug(entry: TextEntry): string {
  return entry.data.seriesSlug ?? entry.id.split('/')[0] ?? STANDALONE_SERIES;
}

export function isTextSeriesEntry(entry: TextEntry): boolean {
  return entry.data.kind === 'series' || entry.id.endsWith('/index');
}

export function isTextDocumentEntry(entry: TextEntry): boolean {
  return !isTextSeriesEntry(entry);
}

export function getTextPartSlug(entry: TextEntry): string {
  return entry.data.partSlug ?? slugifyTextSegment(entry.data.part ?? UNPARTED_TEXT);
}

export function getTextDocSlug(entry: TextEntry): string {
  const seriesSlug = getTextSeriesSlug(entry);
  const docId = entry.id.startsWith(`${seriesSlug}/`) ? entry.id.slice(seriesSlug.length + 1) : entry.id;
  return docId.startsWith('part/') ? docId.slice('part/'.length) : docId;
}

export function getTextEntryUrl(entry: TextEntry): string {
  return `/text/${getTextSeriesSlug(entry)}/${getTextDocSlug(entry)}`;
}

export function formatSeries(key: string, fallback?: string): string {
  if (fallback) return fallback;
  if (key === STANDALONE_SERIES) return '독립 문서';
  return key.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function formatGroup(key: string): string {
  if (key === UNGROUPED_TEXT) return '기타 문서';
  return key;
}

export function formatPart(key: string): string {
  if (key === UNPARTED_TEXT) return '기타 부';
  return key;
}

export function sortTextEntries(entries: TextEntry[]): TextEntry[] {
  return [...entries].sort((a, b) => {
    const orderDiff = compareOptionalNumber(a.data.order, b.data.order, 0);
    if (orderDiff !== 0) return orderDiff;

    const chapterDiff = compareOptionalNumber(a.data.chapter, b.data.chapter);
    if (chapterDiff !== 0) return chapterDiff;

    return compareKo(a.data.title, b.data.title);
  });
}

export function buildTextHierarchy(entries: TextEntry[]): TextSeries[] {
  const seriesMap = new Map<string, TextEntry[]>();

  for (const entry of entries) {
    const seriesKey = getTextSeriesSlug(entry);
    pushGroupedValue(seriesMap, seriesKey, entry);
  }

  return Array.from(seriesMap.entries())
    .map(([seriesKey, seriesEntries]) => {
      const meta = seriesEntries.find(isTextSeriesEntry);
      const documentEntries = seriesEntries.filter(isTextDocumentEntry);
      const partMap = new Map<string, TextEntry[]>();

      for (const entry of documentEntries) {
        const partKey = entry.data.part ?? UNPARTED_TEXT;
        pushGroupedValue(partMap, partKey, entry);
      }

      const parts = Array.from(partMap.entries())
        .map(([partKey, partEntries]) => {
          const groupMap = new Map<string, TextEntry[]>();

          for (const entry of partEntries) {
            const groupKey = entry.data.group ?? UNGROUPED_TEXT;
            pushGroupedValue(groupMap, groupKey, entry);
          }

          const groups = Array.from(groupMap.entries())
            .map(([groupKey, groupEntries]) => ({
              key: groupKey,
              label: formatGroup(groupKey),
              order: groupEntries[0]?.data.groupOrder ?? 0,
              entries: sortTextEntries(groupEntries),
            }))
            .sort(compareOrderAndLabel);

          return {
            key: partKey,
            label: formatPart(partKey),
            order: partEntries[0]?.data.partOrder ?? 0,
            groups,
            count: partEntries.length,
          };
        })
        .sort(compareOrderAndLabel);

      return {
        key: seriesKey,
        slug: seriesKey,
        label: formatSeries(seriesKey, meta?.data.series ?? meta?.data.title ?? documentEntries[0]?.data.series),
        order: meta?.data.seriesOrder ?? documentEntries[0]?.data.seriesOrder ?? 0,
        meta,
        parts,
        count: documentEntries.length,
        entries: sortTextEntries(documentEntries),
      };
    })
    .sort(compareOrderAndLabel);
}

export function getTextSeries(entries: TextEntry[], seriesSlug: string): TextSeries | undefined {
  return buildTextHierarchy(entries).find(series => series.slug === seriesSlug);
}

export function formatTextTag(tag: string): { prefix: string; label: string } {
  return parsePrefixTag(tag);
}
