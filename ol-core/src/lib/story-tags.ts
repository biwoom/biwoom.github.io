import { indexStoryTags } from "../../scripts/lib/story-tags.mjs";
import { getLibrary } from "./library";

export const storyTagTypeLabels = { person: "인물", place: "장소", topic: "주제" } as const;

export async function getStoryTags() {
  const series = await getLibrary("story");
  return indexStoryTags(series.flatMap(work => work.entries
    .filter(entry => entry.collection === "story" && entry.data.kind === "document")
    .map(entry => entry.data)));
}
