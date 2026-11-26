import fs from 'node:fs';
import path from 'node:path';
import { z } from 'astro/zod';
import { parseFrontmatter, shortId, walk } from './content.mjs';
import { contentFile, normalizeContentPath, PROJECT_ROOT, projectPaths, readContentDirectory, relativeContentPath } from './paths.mjs';
import { indexStoryTags, readStoryTags } from './story-tags.mjs';

export const storyCategories = /** @type {const} */ ({
  'buddha-biographies': '붓다전기',
  'past-lives': '전생이야기',
  'monastic-biographies': '고승전기',
  teachings: '가르침과 일화',
  legends: '설화와 전승',
  pilgrimage: '구법과 순례',
  verse: '시와 게송',
  essays: '에세이',
});

/** @param {string} articlePath Path relative to content/article/ */
export function homeArticlePlacement(articlePath) {
  const [folder, second, ...rest] = normalizeContentPath(articlePath).split('/');
  const category = second && homeCategoryKeys.find(key => storyCategories[key] === folder);
  if (!category) throw new Error(`place ${articlePath} in a category folder under content/article/ (${Object.values(storyCategories).join(', ')})`);
  return { category, series: rest.length ? second : undefined };
}

const homeCategoryKeys = /** @type {(keyof typeof storyCategories)[]} */ (Object.keys(storyCategories));
const articlePattern = ['**/*.md', '!**/index.md', '!**/_*/**', '!**/_*.md', '!**/assets/**'];
export { articlePattern };
const text = z.string().trim().min(1);
const slug = text.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use a stable lowercase ID.');
const order = z.number().int().nonnegative().default(9999);
const date = z.preprocess(value => value instanceof Date ? value.toISOString().slice(0, 10) : value, z.iso.date()).optional();
/** @param {string[]} ids */
const distinctIds = ids => new Set(ids).size === ids.length;
const articleIndexSchema = z.object({
  mainTopics: z.record(slug, text).default({}),
  recommendedStories: z.tuple([slug, slug]).refine(distinctIds, 'Select two different articles.').optional(),
});
const seriesIndexSchema = z.object({ order, description: text.optional() });
const tags = z.array(text).optional();
const aliases = z.record(z.string(), z.array(text)).optional();
const illustrationPath = text.transform(normalizeContentPath).refine(value => {
  const [directory, ...parts] = value.split('/');
  return directory === 'illustration' && parts.length > 0 &&
    parts.every(part => part && !/^[._]/.test(part) && !/[\\%?#\p{Cc}]/u.test(part)) &&
    /\.(avif|gif|jpe?g|png|webp)$/i.test(value);
}, 'Use a vault-relative raster image path under illustration/.');

export const homeArticleSchema = z.object({
  id: slug,
  title: text,
  blurb: text,
  topic: slug,
  published: z.boolean().default(false),
  publishedAt: date,
  createdAt: date,
  order,
  minutes: z.number().int().positive().default(1),
  sample: z.boolean().default(false),
  illustration: z.object({ file: illustrationPath, alt: text }).optional(),
  source: z.object({ title: text, url: z.url({ protocol: /^https?$/ }).optional() }).optional(),
  personTags: tags,
  placeTags: tags,
  topicTags: tags,
  aliasTags: z.strictObject({ person: aliases, place: aliases, topic: aliases }).optional(),
}).superRefine((data, ctx) => {
  try {
    readStoryTags(data);
  } catch (error) {
    ctx.addIssue({ code: 'custom', message: error.message });
  }
});

/** @param {string} source @param {string} root */
function readIndexData(source, root) {
  const file = contentFile(source, root);
  return fs.existsSync(file) ? parseFrontmatter(fs.readFileSync(file, 'utf8')).data : undefined;
}

export function readHomeArticleIndex(root = PROJECT_ROOT) {
  const source = 'article/index.md';
  try {
    return articleIndexSchema.parse(readIndexData(source, root) ?? {});
  } catch (error) {
    throw new Error(`${source}: ${error.message}`);
  }
}

export function readHomeTopics(root = PROJECT_ROOT) {
  return readHomeArticleIndex(root).mainTopics;
}

/** @typedef {{id: string, order: number, title: string, publishedAt?: string}} OrderedHomeArticle */

/** @param {OrderedHomeArticle} a @param {OrderedHomeArticle} b */
export function compareHomeArticleOrder(a, b) {
  return a.order - b.order || a.title.localeCompare(b.title, 'ko') || a.id.localeCompare(b.id);
}

/** @param {OrderedHomeArticle} a @param {OrderedHomeArticle} b */
export function compareHomePublication(a, b) {
  return (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '') || compareHomeArticleOrder(a, b);
}

/** @template {{id: string}} T @param {ReturnType<typeof readHomeArticleIndex>} index @param {T[]} published */
export function selectRecommendedStories(index, published) {
  const byId = new Map(published.map(article => [article.id, article]));
  return (index.recommendedStories ?? []).map(id => {
    const article = byId.get(id);
    if (!article) throw new Error(`article/index.md: recommendedStories references an unknown or unpublished article ID "${id}"`);
    return article;
  });
}

/** @param {Record<string, string>} topics @param {string} id */
export function homeTopicLabel(topics, id) {
  if (!Object.hasOwn(topics, id)) throw new Error(`add topic "${id}" to mainTopics in content/article/index.md`);
  return topics[id];
}

/** @param {string} label */
export const homeTopicTagId = label => `tag:${shortId(label)}`;

/** @param {string} category @param {string} folder */
export const homeSeriesPath = (category, folder) => `/series/${category}/${encodeURIComponent(folder)}/`;

export function readHomeSeries(root = PROJECT_ROOT) {
  const series = homeCategoryKeys.flatMap(category => {
    const directory = `article/${storyCategories[category]}`;
    const categoryPath = contentFile(directory, root);
    if (!fs.existsSync(categoryPath)) return [];
    return readContentDirectory(categoryPath)
      .filter(entry => entry.isDirectory() && !/^[._]/.test(entry.name) && entry.name !== 'assets')
      .map(entry => {
        const title = normalizeContentPath(entry.name);
        const source = `${directory}/${title}/index.md`;
        try {
          if (!title.trim() || /[%?#\\\p{Cc}]/u.test(title)) throw new Error('unsupported series folder name');
          const meta = seriesIndexSchema.parse(readIndexData(source, root) ?? {});
          return { category, title, path: homeSeriesPath(category, title), ...meta };
        } catch (error) {
          throw new Error(`${source}: ${error.message}`);
        }
      });
  });
  return series.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, 'ko') || a.category.localeCompare(b.category));
}

/** @param {string} source @param {string} root */
function resolveArticleIllustration(source, root) {
  const file = contentFile(source, root);
  if (!fs.existsSync(file)) throw new Error(`missing illustration ${source}`);
  const vault = fs.realpathSync(projectPaths(root).content);
  const illustrationRoot = path.join(vault, 'illustration');
  const relative = path.relative(illustrationRoot, fs.realpathSync(file));
  if (!relative || relative === '..' || relative.startsWith('..' + path.sep) || path.isAbsolute(relative) || !fs.statSync(file).isFile()) {
    throw new Error(`invalid illustration ${source}`);
  }
  return file;
}

export function readHomeArticles(root = PROJECT_ROOT) {
  const ids = new Map();
  const index = readHomeArticleIndex(root);
  const files = walk(path.join(projectPaths(root).content, 'article'))
    .filter(file => file.endsWith('.md') && path.basename(file) !== 'index.md');
  const articles = files.map(file => {
    const relative = relativeContentPath(file, root);
    try {
      const { data, body } = parseFrontmatter(fs.readFileSync(file, 'utf8'));
      const article = homeArticleSchema.parse(data);
      const placement = homeArticlePlacement(relative.slice('article/'.length));
      homeTopicLabel(index.mainTopics, article.topic);
      const previous = ids.get(article.id);
      if (previous) throw new Error(`duplicate article ID ${article.id} (also ${previous})`);
      ids.set(article.id, relative);
      if (article.published && !body.trim()) throw new Error('published article body is empty');
      const illustrationFile = article.published && article.illustration
        ? resolveArticleIllustration(article.illustration.file, root)
        : undefined;
      return { article, ...placement, source: relative, storyTags: readStoryTags(article), illustrationFile };
    } catch (error) {
      throw new Error(`${relative}: ${error.message}`);
    }
  });
  const published = articles.filter(({ article }) => article.published);
  selectRecommendedStories(index, published.map(({ article }) => article));
  indexStoryTags(published);
  return articles;
}
