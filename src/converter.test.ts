import { MarkdownToBacklogConverter } from './converter';

describe('MarkdownToBacklogConverter', () => {
  let converter: MarkdownToBacklogConverter;

  beforeEach(() => {
    converter = new MarkdownToBacklogConverter();
  });

  describe('Headers', () => {
    test('should convert H1 header', async () => {
      const markdown = '# Header1';
      const result = await converter.convert(markdown);
      expect(result.trim()).toBe('* Header1');
    });

    test('should convert H2 header', async () => {
      const markdown = '## Header2';
      const result = await converter.convert(markdown);
      expect(result.trim()).toBe('** Header2');
    });

    test('should convert H3 header', async () => {
      const markdown = '### Header3';
      const result = await converter.convert(markdown);
      expect(result.trim()).toBe('*** Header3');
    });

    test('should convert multiple headers', async () => {
      const markdown = `# Header1
## Header2
### Header3`;
      const result = await converter.convert(markdown);
      expect(result.trim()).toBe(`* Header1

** Header2

*** Header3`);
    });
  });

  describe('Text formatting', () => {
    test('should convert bold text', async () => {
      const markdown = '**Bold**';
      const result = await converter.convert(markdown);
      expect(result.trim()).toBe("''Bold''");
    });

    test('should convert italic text', async () => {
      const markdown = '*Italic*';
      const result = await converter.convert(markdown);
      expect(result.trim()).toBe("'''Italic'''");
    });

    test('should convert strikethrough text', async () => {
      const markdown = '~~Strike~~';
      const result = await converter.convert(markdown);
      expect(result.trim()).toBe('%%Strike%%');
    });

    test('should convert inline code', async () => {
      const markdown = '`code`';
      const result = await converter.convert(markdown);
      expect(result.trim()).toBe('{code}code{/code}');
    });
  });

  describe('Lists', () => {
    test('should convert unordered list', async () => {
      const markdown = `- Item-A
- Item-B`;
      const result = await converter.convert(markdown);
      expect(result.trim()).toBe(`- Item-A
- Item-B`);
    });

    test('should convert nested unordered list', async () => {
      const markdown = `- Item-A
- Item-B
  - Item-B-1
    - Item-B-1-a`;
      const result = await converter.convert(markdown);
      expect(result.trim()).toBe(`- Item-A
- Item-B
-- Item-B-1
--- Item-B-1-a`);
    });

    test('should convert ordered list', async () => {
      const markdown = `1. Item-A
2. Item-B
3. Item-C`;
      const result = await converter.convert(markdown);
      expect(result.trim()).toBe(`+ Item-A
+ Item-B
+ Item-C`);
    });

    test('should convert nested ordered list', async () => {
      const markdown = `1. Item-A
2. Item-B
   1. Item-B-1
   2. Item-B-2`;
      const result = await converter.convert(markdown);
      expect(result.trim()).toBe(`+ Item-A
+ Item-B
++ Item-B-1
++ Item-B-2`);
    });
  });

  describe('Links', () => {
    test('should convert URL', async () => {
      const markdown = 'http://www.backlog.jp/';
      const result = await converter.convert(markdown);
      expect(result.trim()).toBe('http://www.backlog.jp/');
    });

    test('should convert named link', async () => {
      const markdown = '[Backlog](http://www.backlog.jp/)';
      const result = await converter.convert(markdown);
      expect(result.trim()).toBe('[[Backlog>http://www.backlog.jp/]]');
    });

    test('should not convert link when text equals URL', async () => {
      const markdown = '[http://www.backlog.jp/](http://www.backlog.jp/)';
      const result = await converter.convert(markdown);
      expect(result.trim()).toBe('http://www.backlog.jp/');
    });
  });

  describe('Code blocks', () => {
    test('should convert code block without language', async () => {
      const markdown = `\`\`\`
package helloworld;
public class Hello {
  public String sayHello() {
    return "Hello";
  }
}
\`\`\``;
      const result = await converter.convert(markdown);
      expect(result.trim()).toBe(`{code}
package helloworld;
public class Hello {
  public String sayHello() {
    return "Hello";
  }
}
{/code}`);
    });

    test('should convert code block with language', async () => {
      const markdown = `\`\`\`java
public class Hello {
  public String sayHello() {
    return "Hello";
  }
}
\`\`\``;
      const result = await converter.convert(markdown);
      expect(result.trim()).toBe(`{code:java}
public class Hello {
  public String sayHello() {
    return "Hello";
  }
}
{/code}`);
    });
  });

  describe('Blockquotes', () => {
    test('should convert single-line blockquote', async () => {
      const markdown = '> 引用した文章です。';
      const result = await converter.convert(markdown);
      expect(result.trim()).toBe('>引用した文章です。');
    });

    test('should convert multi-line blockquote', async () => {
      const markdown = `> 引用した
> 文章です。`;
      const result = await converter.convert(markdown);
      expect(result.trim()).toBe(`{quote}
引用した
文章です。
{/quote}`);
    });
  });

  describe('Tables', () => {
    test('should convert simple table', async () => {
      const markdown = `| A | B | C |
|---|---|---|
| a | b | c |`;
      const result = await converter.convert(markdown);
      expect(result.trim()).toBe(`|A|B|C|h
|a|b|c|`);
    });

    test('should convert table with multiple rows', async () => {
      const markdown = `| A | B | C |
|---|---|---|
| a | b | c |
| d | e | f |`;
      const result = await converter.convert(markdown);
      expect(result.trim()).toBe(`|A|B|C|h
|a|b|c|
|d|e|f|`);
    });
  });

  describe('Images', () => {
    test('should convert external image', async () => {
      const markdown = '![alt text](https://example.com/image.png)';
      const result = await converter.convert(markdown);
      expect(result.trim()).toBe('#image(https://example.com/image.png)');
    });

    test('should convert local image', async () => {
      const markdown = '![alt text](image.png)';
      const result = await converter.convert(markdown);
      expect(result.trim()).toBe('#image(image.png)');
    });
  });

  describe('Line breaks', () => {
    test('should convert line break', async () => {
      const markdown = `aaa
bbb`;
      const result = await converter.convert(markdown);
      expect(result.trim()).toBe('aaa&br;bbb');
    });
  });

  describe('Horizontal rule', () => {
    test('should convert horizontal rule', async () => {
      const markdown = '---';
      const result = await converter.convert(markdown);
      expect(result.trim()).toBe('----');
    });
  });

  describe('Special characters escaping', () => {
    test('should escape pipe characters in text', async () => {
      const markdown = 'Using bars in table ||';
      const result = await converter.convert(markdown);
      expect(result.trim()).toBe('Using bars in table \\|\\|');
    });

    test('should escape percent signs', async () => {
      const markdown = '%%Not struck%%';
      const result = await converter.convert(markdown);
      expect(result.trim()).toBe('\\%\\%Not struck\\%\\%');
    });
  });

  describe('Complex documents', () => {
    test('should convert complex markdown document', async () => {
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

      expect(result).toContain('* Main Header');
      expect(result).toContain("''bold''");
      expect(result).toContain("'''italic'''");
      expect(result).toContain('** Subheader');
      expect(result).toContain('- Item 1');
      expect(result).toContain('-- Nested item');
      expect(result).toContain('{code:javascript}');
      expect(result).toContain('>This is a quote');
      expect(result).toContain('|Column 1|Column 2|h');
      expect(result).toContain('[[Link to Backlog>http://www.backlog.jp/]]');
    });
  });
});