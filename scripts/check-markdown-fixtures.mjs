import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import { markdownRemarkPlugins, markdownTree } from './lib/markdown.mjs';
import { textOf, firstHeading, excerpt } from './lib/content.mjs';
import rehypeReaderFootnotes from './rehype-reader-footnotes.mjs';
import path from 'node:path';
import remarkContent from './remark-content.mjs';
import { hasOriginalBlocks } from './lib/markdown.mjs';

const processor = await createMarkdownProcessor({
  remarkPlugins: markdownRemarkPlugins,
  rehypePlugins: [rehypeReaderFootnotes],
});
const html = async source => (await processor.render(source, {
  fileURL: new URL(`file://${path.resolve('src/content/story/category/series/part/example.md')}`),
})).code;

test('punctuation and attached Korean particles render emphasis without altering text', async () => {
  const cases = [
    ['*아마라와띠(Amaravatī)*라는 도시가 있었다.', '<em>아마라와띠(Amaravatī)</em>라는 도시가 있었다.'],
    ['그 이름은 **“불사의 도시, 신들의 도시”**라는 뜻이다.', '그 이름은 <strong>“불사의 도시, 신들의 도시”</strong>라는 뜻이다.'],
    ['앞**용어(설명)**를 읽는다.', '앞<strong>용어(설명)</strong>를 읽는다.'],
    ['앞**“인용”**뒤', '앞<strong>“인용”</strong>뒤'],
    ['***“중첩”***이다', '<em><strong>“중첩”</strong></em>이다'],
  ];
  for (const [source, expected] of cases) assert.equal(await html(source), `<p>${expected}</p>`);
});

test('Unicode punctuation uses the same rule for italic and bold beside Hangul', async () => {
  for (const [open, close] of [['(',')'],['“','”'],['‘','’'],['「','」'],['『','』'],['〈','〉'],['《','》'],['【','】'],['（','）'],['«','»'],['¿','?'],['','!'],['','…'],['','。'],['',';'],['','—']]) {
    for (const [marker,tag] of [['*','em'],['**','strong']]) {
      const content=`${open}용어${close}`;
      assert.equal(await html(`앞${marker}${content}${marker}라는 말`), `<p>앞<${tag}>${content}</${tag}>라는 말</p>`);
    }
  }
});

test('code, escaped asterisks and malformed whitespace remain literal', async () => {
  assert.equal(await html('`**“용어”**라는`'), '<p><code>**“용어”**라는</code></p>');
  assert.match(await html('```text\n*용어(설명)*라는\n```'), /\*용어\(설명\)\*라는/);
  assert.equal(await html('\\*용어(설명)\\*라는'), '<p>*용어(설명)*라는</p>');
  assert.equal(await html('\\*\\*“용어”\\*\\*라는'), '<p>**“용어”**라는</p>');
  assert.equal(await html('* 용어 *'), '<ul>\n<li>용어 *</li>\n</ul>');
});

test('links, headings, tables and footnotes retain CJK emphasis and metadata agrees', async () => {
  assert.equal(await html('[**“용어”**라는 링크](https://example.com)'), '<p><a href="https://example.com"><strong>“용어”</strong>라는 링크</a></p>');
  const heading = '# **“제목”**이라는 글';
  assert.equal(textOf(firstHeading(heading)), '“제목”이라는 글');
  assert.equal(excerpt('*용어(설명)*라는 문장'), '용어(설명)라는 문장');
  assert.equal(markdownTree('*용어(설명)*라는').children[0].children[0].type, 'emphasis');
  assert.match(await html('| 제목 |\n| --- |\n| **“용어”**라는 |'), /<td><strong>“용어”<\/strong>라는<\/td>/);
  const note = await html('본문[^1]\n\n[^1]: *용어(설명)*라는 **“인용”**이다.');
  assert.match(note, /<em>용어\(설명\)<\/em>라는 <strong>“인용”<\/strong>이다/);
  assert.match(note, /data-footnote-return/);
  assert.ok(!note.includes('data-footnote-backref'));
  assert.match(await html('~~취소~~와 **일반 강조**다'), /<del>취소<\/del>와 <strong>일반 강조<\/strong>다/);
});


test('marked TEXT originals preserve literal source text while ordinary code and inline code stay separate',async()=>{
  const renderer=await createMarkdownProcessor({remarkPlugins:[...markdownRemarkPlugins,remarkContent],rehypePlugins:[rehypeReaderFootnotes]});
  const source='# 번역\n\n번역문입니다.\n\n```original\n一切法 <原文> & **文字**\n第二行\n```\n\n```text\nordinary code\n```\n\n`inline original`';
  const result=(await renderer.render(source,{fileURL:new URL(`file://${path.resolve('src/content/text/category/work/part/example.md')}`)})).code;
  assert.equal((result.match(/data-reader-original/g)??[]).length,1);
  assert.match(result,/一切法 (?:&lt;|&#x3C;)原文(?:&gt;|>) (?:&#x26;|&amp;) \*\*文字\*\*/);
  assert.ok(result.includes('第二行'));assert.ok(result.includes('ordinary code'));assert.ok(result.includes('<code>inline original</code>'));
  assert.equal(hasOriginalBlocks(source),true);
  assert.equal(hasOriginalBlocks('`original`\n\n```text\noriginal\n```'),false);
  assert.equal(hasOriginalBlocks('````text\n```original\n例\n```\n````'),false);
});
