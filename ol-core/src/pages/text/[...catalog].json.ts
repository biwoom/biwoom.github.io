import type { APIRoute, GetStaticPaths } from "astro";
import { getLibrary, type Library } from "../../lib/library";
import { textMaterialCatalogUrl, textRouteParam, usesSeparateMaterialLists } from "../../lib/text-materials";
import { url } from "../../lib/url";

export const getStaticPaths = (async () => (await getLibrary("text"))
  .filter(usesSeparateMaterialLists)
  .map(series => ({
    params: { catalog: textRouteParam(textMaterialCatalogUrl(series)).slice(0, -".json".length) },
    props: { series },
  }))) satisfies GetStaticPaths;

export const GET: APIRoute<{ series: Library }> = ({ props }) => Response.json(
  props.series.parts.flatMap(part => part.entries.map(entry => ({
    title: entry.data.title,
    description: entry.data.description,
    url: url(entry.data.url),
    part: part.label,
  }))),
);
