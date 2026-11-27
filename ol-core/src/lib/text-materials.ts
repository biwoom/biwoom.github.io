import { shortId } from "../../scripts/lib/content.mjs";
import type { Library } from "./library";

export type TextPart = Library["parts"][number];
export const textMaterialPageSize = 30;
const inlineWorkLimit = 60;

export function usesSeparateMaterialLists(work: Library) {
  return work.count > inlineWorkLimit
    || work.parts.some(part => part.entries.length > textMaterialPageSize);
}

export function textMaterialPageUrl(work: Library, part: TextPart, page: number) {
  return `${work.url}materials/${shortId(part.key)}/${page}/`;
}

export function textMaterialCatalogUrl(work: Library) {
  return `${work.url}materials.json`;
}

export function textRouteParam(href: string) {
  return decodeURI(href.replace(/^\/text\//, "").replace(/\/$/, ""));
}
