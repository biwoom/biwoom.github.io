import { getHomeArticles } from './home-articles';
import { indexStoryTags, storyTagPath } from '../../scripts/lib/story-tags.mjs';

export { storyTagPath };
export const storyTagTypeLabels = { person: '인물', place: '장소', topic: '주제' } as const;

export async function getHomeTagIndex() {
  const stories = await getHomeArticles();
  return indexStoryTags(stories.map(story => ({
    story,
    source: story.entry.filePath ?? story.id,
    storyTags: story.storyTags,
  }))).map(({ documents, ...tag }) => ({ ...tag, documents: documents.map(document => document.story) }));
}
