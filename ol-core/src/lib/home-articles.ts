import { getCollection, type CollectionEntry } from 'astro:content';
import { visit } from 'unist-util-visit';
import { compareHomeArticleOrder, homeArticlePlacement, homeSeriesPath, homeTopicLabel, readHomeSeries, readHomeTopics, storyCategories } from '../../scripts/lib/home-articles.mjs';
import { markdownTree, textOf } from '../../scripts/lib/content.mjs';
import { readStoryTags } from '../../scripts/lib/story-tags.mjs';
import { assetUrl } from '../../scripts/remark-content.mjs';
import { url } from './url';

export { homeSeriesPath, readHomeTopics, storyCategories };

export type HomeArticle = CollectionEntry<'article'>['data'] & {
  entry: CollectionEntry<'article'>;
  category: keyof typeof storyCategories;
  series?: string;
  topicLabel: string;
  storyTags: ReturnType<typeof readStoryTags>;
  photo?: { url: string; alt: string };
};

export async function getHomeArticles(): Promise<HomeArticle[]> {
  const entries = await getCollection('article', ({ data }) => data.published);
  const topics = readHomeTopics();
  return entries.map(entry => ({
    ...entry.data,
    entry,
    ...homeArticlePlacement(entry.id),
    topicLabel: homeTopicLabel(topics, entry.data.topic),
    storyTags: readStoryTags(entry.data),
    photo: entry.data.illustration && {
      url: url(assetUrl(entry.data.illustration.file)),
      alt: entry.data.illustration.alt,
    },
  })).sort(compareHomeArticleOrder);
}

export async function getHomeSeries(articles?: HomeArticle[]) {
  const published = articles ?? await getHomeArticles();
  return readHomeSeries().map(series => {
    const stories = published.filter(story => story.category === series.category && story.series === series.title);
    const cover = stories.find(story => story.photo)?.photo;
    return { ...series, stories, cover };
  });
}

export function previewParagraphs(story: HomeArticle): string[] {
  const paragraphs: string[] = [];
  visit(markdownTree(story.entry.body ?? ''), 'paragraph', node => {
    const text = node.children.map(child => child.type === 'image' ? '' : child.type === 'break' ? ' ' : textOf(child))
      .join('').replace(/\s+/g, ' ').trim();
    if (text) paragraphs.push(text);
  });
  const preview: string[] = [];
  let remaining = 480;
  for (const paragraph of paragraphs.slice(0, 3)) {
    const letters = Array.from(paragraph);
    if (letters.length >= remaining) {
      preview.push(letters.slice(0, remaining).join('').trimEnd() + (letters.length > remaining ? '…' : ''));
      break;
    }
    preview.push(paragraph);
    remaining -= letters.length;
  }
  return preview;
}
