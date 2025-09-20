import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';

interface Node {
  type: string;
  [key: string]: any;
}

interface Parent extends Node {
  children: Node[];
}

interface TextNode extends Node {
  type: 'text';
  value: string;
}

interface LinkNode extends Node {
  type: 'link';
  url: string;
  title?: string;
  children: Node[];
}

interface CodeNode extends Node {
  type: 'code';
  lang?: string;
  value: string;
}

interface InlineCodeNode extends Node {
  type: 'inlineCode';
  value: string;
}

interface HeadingNode extends Node {
  type: 'heading';
  depth: number;
  children: Node[];
}

interface ListNode extends Node {
  type: 'list';
  ordered: boolean;
  children: Node[];
}

interface ListItemNode extends Node {
  type: 'listItem';
  children: Node[];
}

interface BlockquoteNode extends Node {
  type: 'blockquote';
  children: Node[];
}

interface TableNode extends Node {
  type: 'table';
  children: Node[];
}

interface ImageNode extends Node {
  type: 'image';
  url: string;
  alt?: string;
}

interface EmphasisNode extends Node {
  type: 'emphasis';
  children: Node[];
}

interface StrongNode extends Node {
  type: 'strong';
  children: Node[];
}

interface DeleteNode extends Node {
  type: 'delete';
  children: Node[];
}

export class MarkdownToBacklogConverter {
  private listDepth = 0;
  private orderedListStack: boolean[] = [];

  async convert(markdown: string): Promise<string> {
    const processor = unified()
      .use(remarkParse)
      .use(remarkGfm); // Add GFM support for tables, strikethrough, etc.
    const tree = processor.parse(markdown);

    return this.processNode(tree);
  }

  private processNode(node: Node | Parent, parent?: Parent): string {
    switch (node.type) {
      case 'root':
        return this.processChildren(node as Parent);

      case 'heading':
        return this.processHeading(node as HeadingNode);

      case 'paragraph':
        // Handle line breaks within paragraphs
        const paragraphContent = this.processChildren(node as Parent);
        // In lists, don't add extra newlines
        if (parent && parent.type === 'listItem') {
          return paragraphContent;
        }
        return paragraphContent + '\n\n';

      case 'text':
        const text = (node as TextNode).value;
        // Convert line breaks within text to &br;
        const withLineBreaks = text.split('\n').join('&br;');
        return this.escapeText(withLineBreaks);

      case 'strong':
        return `''${this.processChildren(node as StrongNode)}''`;

      case 'emphasis':
        return `'''${this.processChildren(node as EmphasisNode)}'''`;

      case 'delete':
        return `%%${this.processChildren(node as DeleteNode)}%%`;

      case 'inlineCode':
        return `{code}${(node as InlineCodeNode).value}{/code}`;

      case 'code':
        return this.processCodeBlock(node as CodeNode);

      case 'link':
        return this.processLink(node as LinkNode);

      case 'image':
        return this.processImage(node as ImageNode);

      case 'list':
        return this.processList(node as ListNode);

      case 'listItem':
        return this.processListItem(node as ListItemNode);

      case 'blockquote':
        return this.processBlockquote(node as BlockquoteNode);

      case 'table':
        return this.processTable(node as TableNode);

      case 'tableRow':
        return this.processTableRow(node as Parent);

      case 'tableCell':
        return this.processChildren(node as Parent);

      case 'break':
        return '&br;';

      case 'thematicBreak':
        return '----\n\n';

      default:
        return this.processChildren(node as Parent);
    }
  }

  private processChildren(node: Parent): string {
    if (!node.children) return '';
    return node.children.map(child => this.processNode(child, node)).join('');
  }

  private processHeading(node: HeadingNode): string {
    // Backlog Wiki supports up to 6 levels of headings
    const depth = Math.min(node.depth, 6);
    const stars = '*'.repeat(depth);
    const content = this.processChildren(node);
    return `${stars} ${content}\n\n`;
  }

  private processCodeBlock(node: CodeNode): string {
    // Backlog Wiki doesn't support language specification in code blocks
    return `{code}\n${node.value}\n{/code}\n\n`;
  }

  private processLink(node: LinkNode): string {
    const text = this.processChildren(node);
    const url = node.url;

    if (text === url) {
      return url;
    }

    return `[[${text}>${url}]]`;
  }

  private processImage(node: ImageNode): string {
    const url = node.url;

    if (url.startsWith('http://') || url.startsWith('https://')) {
      return `#image(${url})\n`;
    }

    return `#image(${url})\n`;
  }

  private processList(node: ListNode): string {
    const wasInList = this.listDepth > 0;
    this.listDepth++;
    this.orderedListStack.push(node.ordered || false);

    const result = node.children
      .map(child => this.processNode(child, node))
      .join('');

    this.orderedListStack.pop();
    this.listDepth--;

    return wasInList ? result : result + '\n';
  }

  private processListItem(node: ListItemNode): string {
    const isOrdered = this.orderedListStack[this.orderedListStack.length - 1];
    const bullet = isOrdered ? '+' : '-';
    const prefix = bullet.repeat(this.listDepth);

    let content = '';
    let hasNestedList = false;

    node.children.forEach((child, index) => {
      if (child.type === 'paragraph') {
        content += this.processChildren(child as Parent);
      } else if (child.type === 'list') {
        hasNestedList = true;
        content += '\n' + this.processNode(child, node);
      } else {
        content += this.processNode(child, node);
      }
    });

    content = content.trim();

    // If there's a nested list, don't add extra newline
    if (hasNestedList) {
      return `${prefix} ${content.split('\n')[0]}\n${content.split('\n').slice(1).join('\n')}`;
    }

    return `${prefix} ${content}\n`;
  }

  private processBlockquote(node: BlockquoteNode): string {
    const content = this.processChildren(node).trim();
    // Check if content contains &br; (which means multiple lines)
    const hasMultipleLines = content.includes('&br;');

    if (hasMultipleLines) {
      // Replace &br; with newlines for multi-line quotes
      const cleanContent = content.replace(/&br;/g, '\n');
      return `{quote}\n${cleanContent}\n{/quote}\n\n`;
    }

    return `>${content}\n\n`;
  }

  private processTable(node: TableNode): string {
    let result = '';
    let headerProcessed = false;

    node.children.forEach((row, index) => {
      const cells = (row as Parent).children.map(cell =>
        this.processChildren(cell as Parent).trim()
      );

      // Skip separator row (typically the second row with ---)
      if (index === 1 && cells.every(cell => cell.match(/^-+$/))) {
        headerProcessed = true;
        return;
      }

      // First actual content row is the header
      if (index === 0 || (index === 2 && headerProcessed)) {
        result += `|${cells.join('|')}|h\n`;
      } else {
        result += `|${cells.join('|')}|\n`;
      }
    });

    return result + '\n';
  }

  private processTableRow(node: Parent): string {
    const cells = node.children.map(cell =>
      this.processChildren(cell as Parent)
    );
    return `|${cells.join('|')}|\n`;
  }

  private escapeText(text: string): string {
    return text
      .replace(/\|\|/g, '\\|\\|')
      .replace(/%%/g, '\\%\\%')
      .replace(/\[\[/g, '\\[\\[')
      .replace(/\]\]/g, '\\]\\]');
  }
}