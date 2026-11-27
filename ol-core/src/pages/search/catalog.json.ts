import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { storyTagPath } from '../../../scripts/lib/story-tags.mjs';
import { getHomeArticles } from '../../lib/home-articles';
import { getLibrary } from '../../lib/library';
import { type CatalogRecord, searchUrl } from '../../lib/search.mjs';
import { getStoryTags, storyTagTypeLabels } from '../../lib/story-tags';
import { url } from '../../lib/url';

export const GET: APIRoute = async () => {
  const [text, story, tags, articles, blog, pages] = await Promise.all([
    getLibrary('text'),
    getLibrary('story'),
    getStoryTags(),
    getHomeArticles(),
    getCollection('blog', entry => entry.data.published && entry.data.kind === 'document'),
    getCollection('pages', entry => entry.data.published),
  ]);
  const records: CatalogRecord[] = [];
  for (const [section, works] of [['TEXT', text], ['STORY', story]] as const) {
    for (const work of works) {
      const workId = work.meta?.id ?? work.url;
      records.push({
        id: workId, kind: 'work', section,
        title: work.label, url: work.url, context: work.category,
      });
      for (const entry of work.entries) {
        records.push({
          id: entry.id, kind: 'document', section,
          title: entry.data.title, url: entry.data.url,
          workId, work: work.label, context: entry.data.part,
        });
      }
    }
  }
  for (const tag of tags) {
    const href = storyTagPath(tag);
    records.push({
      id: href, kind: 'tag', section: 'STORY',
      title: tag.label, url: href, aliases: tag.aliases,
      context: storyTagTypeLabels[tag.type],
    });
  }
  for (const article of articles) {
    records.push({
      id: `article-${article.id}`, kind: 'document', section: 'ARTICLE',
      title: article.title, url: `/stories/${article.id}/`,
      context: article.topicLabel,
    });
  }
  for (const [section, entries] of [['BLOG', blog], ['PAGES', pages]] as const) {
    for (const entry of entries) {
      records.push({
        id: entry.id, kind: 'document', section,
        title: entry.data.title, url: entry.data.url, context: entry.data.category,
      });
    }
  }
  for (const record of records) record.url = searchUrl(url(record.url));
  records.sort((a, b) => a.url.localeCompare(b.url));
  return Response.json(records);
};
