import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'astro/zod';
import { parse, serializeOuter } from 'parse5';
import { sitePath } from '../../../site-config.mjs';
import { assetUrl } from '../remark-content.mjs';
import { compareHomePublication, illustrationPath, resolveArticleIllustration } from './home-articles.mjs';
import { ARTICLE_HTML_DIRECTORY, contentFile, normalizeContentPath, PROJECT_ROOT, readContentDirectory } from './paths.mjs';

/** @typedef {import('parse5').DefaultTreeAdapterTypes.Element} Element */
/** @typedef {import('parse5').DefaultTreeAdapterTypes.ParentNode} ParentNode */
/** @typedef {{source: string, file: string | Buffer}} CardImage */
/** @typedef {{id: string, date: string, html: string, images: CardImage[]}} HomeHtmlCard */

const elements = new Set([
  'article', 'header', 'footer', 'div', 'span', 'figure', 'figcaption', 'img',
  'h2', 'p', 'a', 'br', 'em', 'i', 'strong', 'b', 'small',
]);
const cardDate = z.iso.date();

/** @param {ParentNode} node @returns {Generator<Element>} */
function* htmlElements(node) {
  for (const child of node.childNodes) {
    if ('tagName' in child) {
      yield child;
      yield* htmlElements(child);
    }
  }
}

/** @param {Element} element @param {string} name */
const attribute = (element, name) => element.attrs.find(attr => attr.name === name)?.value;

/** @param {string} value @returns {CardImage} */
function embeddedImage(value) {
  const match = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/i.exec(value);
  if (!match) throw new Error('Use a base64 PNG, JPEG or WebP, or a relative path into illustration/.');
  const format = match[1].toLowerCase();
  const file = Buffer.from(match[2], 'base64');
  const signature = file.subarray(0, 12);
  const signatures = {
    png: signature.subarray(0, 8).toString('hex') === '89504e470d0a1a0a',
    jpeg: signature.subarray(0, 3).toString('hex') === 'ffd8ff',
    webp: signature.subarray(0, 4).toString() === 'RIFF' && signature.subarray(8, 12).toString() === 'WEBP',
  };
  if (!signatures[format] || file.toString('base64') !== match[2]) throw new Error('Invalid embedded image.');
  const digest = createHash('sha256').update(file).digest('hex');
  return { source: `article-html/${digest}.${format === 'jpeg' ? 'jpg' : format}`, file };
}

/** @param {string} value @param {string} root @returns {CardImage} */
function cardImage(value, root) {
  if (/^data:/i.test(value)) return embeddedImage(value);
  if (!/^\.\.?\//.test(value) || /[?#]/.test(value)) throw new Error('Use an image path relative to the card file.');
  const source = illustrationPath.parse(path.posix.join(ARTICLE_HTML_DIRECTORY, decodeURIComponent(value)));
  return { source, file: resolveArticleIllustration(source, root) };
}

/** @param {string} value */
function cardLink(value) {
  if (/^\/(?!\/)/.test(value) && !/[\\\p{Cc}]/u.test(value)) return sitePath(value);
  if (/^https?:\/\//i.test(value) && URL.canParse(value)) return value;
  throw new Error('Card links must use https, http or a site-root path.');
}

/** @param {Element} card @param {string} root */
function extractCard(card, root) {
  /** @type {Map<string, CardImage>} */
  const images = new Map();
  const children = [...htmlElements(card)];
  if (children.filter(node => node.tagName === 'h2').length !== 1) {
    throw new Error('Use one <h2> for the card title.');
  }
  // Keep card markup isolated from the standalone document and rebuild attributes for the site.
  for (const node of [card, ...children]) {
    const { tagName } = node;
    if (node.namespaceURI !== 'http://www.w3.org/1999/xhtml' || !elements.has(tagName) || (tagName === 'article' && node !== card)) {
      throw new Error(`Unsupported <${tagName}> inside the card.`);
    }
    const classes = (attribute(node, 'class') ?? '').split(/\s+/)
      .filter(value => /^story-card(?:-[a-z0-9-]+)?$/.test(value));
    const attrs = classes.length ? [{ name: 'class', value: classes.join(' ') }] : [];
    if (tagName === 'img') {
      const src = attribute(node, 'src');
      const alt = attribute(node, 'alt');
      if (!src || alt === undefined) throw new Error('Every card image needs src and alt attributes.');
      const image = cardImage(src, root);
      images.set(image.source, image);
      attrs.push({ name: 'src', value: assetUrl(image.source) }, { name: 'alt', value: alt });
      for (const name of ['width', 'height']) {
        const value = attribute(node, name);
        if (value && /^[1-9][0-9]*$/.test(value)) attrs.push({ name, value });
      }
    }
    if (tagName === 'a') {
      attrs.push({ name: 'href', value: cardLink(attribute(node, 'href') ?? '') });
    }
    node.attrs = attrs;
    if (tagName === 'h2') node.tagName = node.nodeName = 'h3';
  }
  return { html: serializeOuter(card), images: [...images.values()] };
}

/** @param {{id: string, published: boolean}[]} articles @param {string} root @returns {Map<string, HomeHtmlCard>} */
export function readHomeHtmlCards(articles, root = PROJECT_ROOT) {
  /** @type {Map<string, HomeHtmlCard>} */
  const cards = new Map();
  const dir = contentFile(ARTICLE_HTML_DIRECTORY, root);
  if (!fs.existsSync(dir)) return cards;
  const byId = new Map(articles.map(article => [article.id, article]));
  const files = new Map();
  for (const entry of readContentDirectory(dir)) {
    if (!entry.isFile() || /^[._]/.test(entry.name) || !entry.name.endsWith('.html')) continue;
    const source = normalizeContentPath(`${ARTICLE_HTML_DIRECTORY}/${entry.name}`);
    try {
      const document = parse(fs.readFileSync(contentFile(source, root), 'utf8'));
      const marked = [...htmlElements(document)].filter(node => attribute(node, 'data-article-id') !== undefined);
      const card = marked[0];
      if (marked.length !== 1 || card.tagName !== 'article' || !attribute(card, 'class')?.split(/\s+/).includes('story-card')) {
        throw new Error('Mark exactly one <article class="story-card"> with data-article-id.');
      }
      const id = attribute(card, 'data-article-id') ?? '';
      const article = byId.get(id);
      if (!article) throw new Error(`Unknown Markdown article ID "${id}". Match data-article-id to a Markdown id in content/article/.`);
      if (files.has(id)) throw new Error(`Duplicate HTML card for "${id}" (also ${files.get(id)}).`);
      files.set(id, source);
      const date = cardDate.safeParse(attribute(card, 'data-card-date'));
      if (!date.success) throw new Error('Set data-card-date to a valid date in YYYY-MM-DD format.');
      if (article.published) cards.set(id, { id, date: date.data, ...extractCard(card, root) });
    } catch (error) {
      throw new Error(`${source}: ${error.message}`);
    }
  }
  return cards;
}

/** @template {Parameters<typeof compareHomePublication>[0]} T
 * @param {T[]} articles @param {Map<string, HomeHtmlCard>} cards */
export function selectTodayArticle(articles, cards) {
  return [...articles].sort((a, b) =>
    (cards.get(b.id)?.date ?? '').localeCompare(cards.get(a.id)?.date ?? '') || compareHomePublication(a, b)
  )[0];
}
