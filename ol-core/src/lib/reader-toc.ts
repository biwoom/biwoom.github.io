import type { MarkdownHeading } from 'astro';

// H1 is the document title; body navigation includes H2 through H5.
export function readerTocHeadings(headings: MarkdownHeading[] = []) {
  return headings.filter(heading => heading.depth >= 2 && heading.depth <= 5);
}
