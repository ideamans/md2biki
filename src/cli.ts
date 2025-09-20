#!/usr/bin/env node

import { Command } from 'commander';
import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';
import chalk from 'chalk';
import clipboardy from 'clipboardy';
import { MarkdownToBacklogConverter } from './converter.js';
import { createReadStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Transform } from 'stream';

const program = new Command();

program
  .name('md2biki')
  .description('Markdownドキュメントを Backlog Wiki形式に変換')
  .version('1.0.0')
  .argument('[path]', 'ファイルパス、ディレクトリパス、- (標準入力)、= (クリップボード)')
  .option('-o, --output <path>', '出力先 (デフォルト: 入力と同じ場所)')
  .option('-e, --ext <extension>', '出力ファイル拡張子 (デフォルト: .biki)', '.biki')
  .option('-q, --quiet', '出力メッセージを抑制')
  .helpOption('-h, --help', 'ヘルプを表示')
  .addHelpText('after', `
使用例:
  $ md2biki README.md              # ファイルを変換
  $ md2biki ./docs                 # ディレクトリ内のすべての.mdファイルを変換
  $ md2biki -                      # 標準入力から読み込み、標準出力へ出力
  $ echo "# Title" | md2biki -    # パイプから入力
  $ md2biki =                      # クリップボードから読み込み、クリップボードへ出力

変換対応:
  # Header      → * Header        (見出し H1-H6)
  **Bold**      → ''Bold''        (太字)
  *Italic*      → '''Italic'''    (斜体)
  ~~Strike~~    → %%Strike%%      (取り消し線)
  [Link](url)   → [[Link>url]]    (リンク)
  - Item        → - Item          (箇条書き)
  1. Item       → + Item          (番号付きリスト)
  > Quote       → >Quote          (引用)
  表、コードブロック、画像なども変換対応
`);

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function isDirectory(filePath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(filePath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

async function convertText(markdown: string): Promise<string> {
  const converter = new MarkdownToBacklogConverter();
  return await converter.convert(markdown);
}

async function readFromStdin(): Promise<string> {
  const chunks: Buffer[] = [];

  return new Promise((resolve, reject) => {
    process.stdin.setEncoding('utf-8');

    process.stdin.on('data', (chunk) => {
      chunks.push(Buffer.from(chunk));
    });

    process.stdin.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf-8'));
    });

    process.stdin.on('error', reject);
  });
}

async function convertFile(
  inputPath: string,
  outputPath: string,
  quiet: boolean
): Promise<void> {
  try {
    const markdown = await fs.readFile(inputPath, 'utf-8');
    const backlogWiki = await convertText(markdown);

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, backlogWiki, 'utf-8');

    if (!quiet) {
      console.log(chalk.green('✓'), `変換完了: ${inputPath} → ${outputPath}`);
    }
  } catch (error) {
    console.error(chalk.red('✗'), `変換失敗 ${inputPath}:`, error);
    throw error;
  }
}

async function main() {
  const options = program.opts();
  const inputPath = program.args[0];

  // 引数なしまたは-hの場合はヘルプを表示
  if (!inputPath) {
    program.outputHelp();
    process.exit(0);
  }

  try {
    // 標準入力処理
    if (inputPath === '-') {
      if (!options.quiet) {
        console.error(chalk.blue('読み込み中...'));
      }

      const markdown = await readFromStdin();
      const backlogWiki = await convertText(markdown);

      process.stdout.write(backlogWiki);

      if (!options.quiet) {
        console.error(chalk.green('✓ 変換完了'));
      }
      return;
    }

    // クリップボード処理
    if (inputPath === '=') {
      if (!options.quiet) {
        console.log(chalk.blue('クリップボードから読み込み中...'));
      }

      const markdown = await clipboardy.read();
      if (!markdown) {
        console.error(chalk.red('エラー: クリップボードが空です'));
        process.exit(1);
      }

      const backlogWiki = await convertText(markdown);
      await clipboardy.write(backlogWiki);

      if (!options.quiet) {
        console.log(chalk.green('✓ クリップボードに変換結果を保存しました'));
        console.log(chalk.gray('プレビュー (最初の5行):'));
        const preview = backlogWiki.split('\n').slice(0, 5).join('\n');
        console.log(preview);
        if (backlogWiki.split('\n').length > 5) {
          console.log(chalk.gray('...'));
        }
      }
      return;
    }

    // ファイル/ディレクトリ処理
    const absoluteInputPath = path.resolve(inputPath);

    if (!(await fileExists(absoluteInputPath))) {
      console.error(chalk.red('エラー:'), `パスが存在しません: ${absoluteInputPath}`);
      process.exit(1);
    }

    const isDir = await isDirectory(absoluteInputPath);
    let filesToConvert: string[] = [];

    if (isDir) {
      const pattern = path.join(absoluteInputPath, '**/*.md');
      filesToConvert = await glob(pattern, {
        ignore: ['**/node_modules/**', '**/.git/**'],
      });

      if (filesToConvert.length === 0) {
        console.log(chalk.yellow('Markdownファイルが見つかりませんでした。'));
        process.exit(0);
      }

      if (!options.quiet) {
        console.log(chalk.blue(`${filesToConvert.length}個のMarkdownファイルを変換します。`));
      }
    } else {
      if (!absoluteInputPath.endsWith('.md')) {
        console.error(chalk.red('エラー:'), '入力ファイルはMarkdownファイル (.md) である必要があります');
        process.exit(1);
      }
      filesToConvert = [absoluteInputPath];
    }

    const errors: string[] = [];

    for (const file of filesToConvert) {
      let outputPath: string;

      if (options.output) {
        const outputDir = path.resolve(options.output);
        const relativePath = path.relative(
          isDir ? absoluteInputPath : path.dirname(absoluteInputPath),
          file
        );
        const baseName = path.basename(relativePath, '.md');
        const dirName = path.dirname(relativePath);
        outputPath = path.join(
          outputDir,
          dirName,
          baseName + options.ext
        );
      } else {
        outputPath = file + options.ext;
      }

      try {
        await convertFile(file, outputPath, options.quiet);
      } catch (error) {
        errors.push(file);
      }
    }

    if (errors.length > 0) {
      console.error(chalk.red(`\n${errors.length}個のファイル変換に失敗しました:`));
      errors.forEach(file => console.error(chalk.red('  -'), file));
      process.exit(1);
    }

    if (!options.quiet) {
      console.log(chalk.green('\n✨ すべてのファイルを正常に変換しました!'));
    }
  } catch (error) {
    console.error(chalk.red('予期しないエラー:'), error);
    process.exit(1);
  }
}

// 直接実行された場合のみ main() を実行
program.parse();
main().catch(error => {
  console.error(chalk.red('エラー:'), error);
  process.exit(1);
});