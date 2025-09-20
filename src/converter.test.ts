import test from 'ava';
import { MarkdownToBacklogConverter } from './converter.js';

test('should convert H1 header', async t => {
  const converter = new MarkdownToBacklogConverter();
  const markdown = '# Header1';
  const result = await converter.convert(markdown);
  t.is(result.trim(), '* Header1');
});

test('should convert H2 header', async t => {
  const converter = new MarkdownToBacklogConverter();
  const markdown = '## Header2';
  const result = await converter.convert(markdown);
  t.is(result.trim(), '** Header2');
});

test('should convert H3 header', async t => {
  const converter = new MarkdownToBacklogConverter();
  const markdown = '### Header3';
  const result = await converter.convert(markdown);
  t.is(result.trim(), '*** Header3');
});

test('should convert multiple headers', async t => {
  const converter = new MarkdownToBacklogConverter();
  const markdown = `# Header1
## Header2
### Header3`;
  const result = await converter.convert(markdown);
  t.is(result.trim(), `* Header1

** Header2

*** Header3`);
});

test('should convert bold text', async t => {
  const converter = new MarkdownToBacklogConverter();
  const markdown = '**Bold**';
  const result = await converter.convert(markdown);
  t.is(result.trim(), "''Bold''");
});

test('should convert italic text', async t => {
  const converter = new MarkdownToBacklogConverter();
  const markdown = '*Italic*';
  const result = await converter.convert(markdown);
  t.is(result.trim(), "'''Italic'''");
});

test('should convert strikethrough text', async t => {
  const converter = new MarkdownToBacklogConverter();
  const markdown = '~~Strike~~';
  const result = await converter.convert(markdown);
  t.is(result.trim(), '%%Strike%%');
});

test('should convert inline code', async t => {
  const converter = new MarkdownToBacklogConverter();
  const markdown = '`code`';
  const result = await converter.convert(markdown);
  t.is(result.trim(), '{code}code{/code}');
});

test('should convert unordered list', async t => {
  const converter = new MarkdownToBacklogConverter();
  const markdown = `- Item-A
- Item-B`;
  const result = await converter.convert(markdown);
  t.is(result.trim(), `- Item-A
- Item-B`);
});

test('should convert nested unordered list', async t => {
  const converter = new MarkdownToBacklogConverter();
  const markdown = `- Item-A
- Item-B
  - Item-B-1
    - Item-B-1-a`;
  const result = await converter.convert(markdown);
  t.is(result.trim(), `- Item-A
- Item-B
-- Item-B-1
--- Item-B-1-a`);
});

test('should convert ordered list', async t => {
  const converter = new MarkdownToBacklogConverter();
  const markdown = `1. Item-A
2. Item-B
3. Item-C`;
  const result = await converter.convert(markdown);
  t.is(result.trim(), `+ Item-A
+ Item-B
+ Item-C`);
});

test('should convert nested ordered list', async t => {
  const converter = new MarkdownToBacklogConverter();
  const markdown = `1. Item-A
2. Item-B
   1. Item-B-1
   2. Item-B-2`;
  const result = await converter.convert(markdown);
  t.is(result.trim(), `+ Item-A
+ Item-B
++ Item-B-1
++ Item-B-2`);
});

test('should convert URL', async t => {
  const converter = new MarkdownToBacklogConverter();
  const markdown = 'http://www.backlog.jp/';
  const result = await converter.convert(markdown);
  t.is(result.trim(), 'http://www.backlog.jp/');
});

test('should convert named link', async t => {
  const converter = new MarkdownToBacklogConverter();
  const markdown = '[Backlog](http://www.backlog.jp/)';
  const result = await converter.convert(markdown);
  t.is(result.trim(), '[[Backlog>http://www.backlog.jp/]]');
});

test('should not convert link when text equals URL', async t => {
  const converter = new MarkdownToBacklogConverter();
  const markdown = '[http://www.backlog.jp/](http://www.backlog.jp/)';
  const result = await converter.convert(markdown);
  t.is(result.trim(), 'http://www.backlog.jp/');
});

test('should convert code block without language', async t => {
  const converter = new MarkdownToBacklogConverter();
  const markdown = `\`\`\`
package helloworld;
public class Hello {
  public String sayHello() {
    return "Hello";
  }
}
\`\`\``;
  const result = await converter.convert(markdown);
  t.is(result.trim(), `{code}
package helloworld;
public class Hello {
  public String sayHello() {
    return "Hello";
  }
}
{/code}`);
});

test('should convert code block with language', async t => {
  const converter = new MarkdownToBacklogConverter();
  const markdown = `\`\`\`java
public class Hello {
  public String sayHello() {
    return "Hello";
  }
}
\`\`\``;
  const result = await converter.convert(markdown);
  t.is(result.trim(), `{code:java}
public class Hello {
  public String sayHello() {
    return "Hello";
  }
}
{/code}`);
});

test('should convert single-line blockquote', async t => {
  const converter = new MarkdownToBacklogConverter();
  const markdown = '> 引用した文章です。';
  const result = await converter.convert(markdown);
  t.is(result.trim(), '>引用した文章です。');
});

test('should convert multi-line blockquote', async t => {
  const converter = new MarkdownToBacklogConverter();
  const markdown = `> 引用した
> 文章です。`;
  const result = await converter.convert(markdown);
  t.is(result.trim(), `{quote}
引用した
文章です。
{/quote}`);
});

test('should convert simple table', async t => {
  const converter = new MarkdownToBacklogConverter();
  const markdown = `| A | B | C |
|---|---|---|
| a | b | c |`;
  const result = await converter.convert(markdown);
  t.is(result.trim(), `|A|B|C|h
|a|b|c|`);
});

test('should convert table with multiple rows', async t => {
  const converter = new MarkdownToBacklogConverter();
  const markdown = `| A | B | C |
|---|---|---|
| a | b | c |
| d | e | f |`;
  const result = await converter.convert(markdown);
  t.is(result.trim(), `|A|B|C|h
|a|b|c|
|d|e|f|`);
});

test('should convert external image', async t => {
  const converter = new MarkdownToBacklogConverter();
  const markdown = '![alt text](https://example.com/image.png)';
  const result = await converter.convert(markdown);
  t.is(result.trim(), '#image(https://example.com/image.png)');
});

test('should convert local image', async t => {
  const converter = new MarkdownToBacklogConverter();
  const markdown = '![alt text](image.png)';
  const result = await converter.convert(markdown);
  t.is(result.trim(), '#image(image.png)');
});

test('should convert line break', async t => {
  const converter = new MarkdownToBacklogConverter();
  const markdown = `aaa
bbb`;
  const result = await converter.convert(markdown);
  t.is(result.trim(), 'aaa&br;bbb');
});

test('should convert horizontal rule', async t => {
  const converter = new MarkdownToBacklogConverter();
  const markdown = '---';
  const result = await converter.convert(markdown);
  t.is(result.trim(), '----');
});

test('should escape pipe characters in text', async t => {
  const converter = new MarkdownToBacklogConverter();
  const markdown = 'Using bars in table ||';
  const result = await converter.convert(markdown);
  t.is(result.trim(), 'Using bars in table \\|\\|');
});

test('should escape percent signs', async t => {
  const converter = new MarkdownToBacklogConverter();
  const markdown = '%%Not struck%%';
  const result = await converter.convert(markdown);
  t.is(result.trim(), '\\%\\%Not struck\\%\\%');
});

test('should convert H4, H5, H6 headers', async t => {
  const converter = new MarkdownToBacklogConverter();
  const markdown = `#### Header4
##### Header5
###### Header6`;
  const result = await converter.convert(markdown);
  t.is(result.trim(), `**** Header4

***** Header5

****** Header6`);
});

test('should convert unordered list with asterisks', async t => {
  const converter = new MarkdownToBacklogConverter();
  const markdown = `* Item-A
* Item-B`;
  const result = await converter.convert(markdown);
  t.is(result.trim(), `- Item-A
- Item-B`);
});

test('should convert complex markdown document', async t => {
  const converter = new MarkdownToBacklogConverter();
  const markdown = `# Main Header

This is a paragraph with **bold** and *italic* text.

## Subheader

Here's a list:
- Item 1
- Item 2
  - Nested item
- Item 3

### Code Example

\`\`\`javascript
function hello() {
  console.log("Hello World");
}
\`\`\`

> This is a quote

| Column 1 | Column 2 |
|----------|----------|
| Value 1  | Value 2  |

[Link to Backlog](http://www.backlog.jp/)`;

  const result = await converter.convert(markdown);

  t.true(result.includes('* Main Header'));
  t.true(result.includes("''bold''"));
  t.true(result.includes("'''italic'''"));
  t.true(result.includes('** Subheader'));
  t.true(result.includes('- Item 1'));
  t.true(result.includes('-- Nested item'));
  t.true(result.includes('{code:javascript}'));
  t.true(result.includes('>This is a quote'));
  t.true(result.includes('|Column 1|Column 2|h'));
  t.true(result.includes('[[Link to Backlog>http://www.backlog.jp/]]'));
});