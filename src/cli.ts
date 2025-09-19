#!/usr/bin/env node

import { Command } from 'commander';
import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';
import chalk from 'chalk';
import { MarkdownToBacklogConverter } from './converter';

const program = new Command();

program
  .name('md2biki')
  .description('Convert Markdown documents to Backlog Wiki format')
  .version('1.0.0')
  .argument('<path>', 'File or directory path to convert')
  .option('-o, --output <path>', 'Output directory (default: same as input)')
  .option('-e, --ext <extension>', 'Output file extension (default: .biki)', '.biki')
  .option('-q, --quiet', 'Suppress output messages')
  .parse();

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

async function convertFile(
  inputPath: string,
  outputPath: string,
  quiet: boolean
): Promise<void> {
  const converter = new MarkdownToBacklogConverter();

  try {
    const markdown = await fs.readFile(inputPath, 'utf-8');
    const backlogWiki = await converter.convert(markdown);

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, backlogWiki, 'utf-8');

    if (!quiet) {
      console.log(chalk.green('✓'), `Converted: ${inputPath} → ${outputPath}`);
    }
  } catch (error) {
    console.error(chalk.red('✗'), `Failed to convert ${inputPath}:`, error);
    throw error;
  }
}

async function main() {
  const options = program.opts();
  const inputPath = program.args[0];

  if (!inputPath) {
    program.help();
    process.exit(1);
  }

  const absoluteInputPath = path.resolve(inputPath);

  if (!(await fileExists(absoluteInputPath))) {
    console.error(chalk.red('Error:'), `Path does not exist: ${absoluteInputPath}`);
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
      console.log(chalk.yellow('No Markdown files found in the directory.'));
      process.exit(0);
    }

    if (!options.quiet) {
      console.log(chalk.blue(`Found ${filesToConvert.length} Markdown file(s) to convert.`));
    }
  } else {
    if (!absoluteInputPath.endsWith('.md')) {
      console.error(chalk.red('Error:'), 'Input file must be a Markdown file (.md)');
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
    console.error(chalk.red(`\nFailed to convert ${errors.length} file(s):`));
    errors.forEach(file => console.error(chalk.red('  -'), file));
    process.exit(1);
  }

  if (!options.quiet) {
    console.log(chalk.green('\n✨ All files converted successfully!'));
  }
}

main().catch(error => {
  console.error(chalk.red('Unexpected error:'), error);
  process.exit(1);
});