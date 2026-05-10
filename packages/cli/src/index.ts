#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Command } from 'commander';
import sharp from 'sharp';
import { DEFAULT_CHARS, rgbaToAscii, type AsciiOptions } from '@asciigen/engine';

interface ImageCommandOptions {
  width: string;
  height?: string;
  chars: string;
  invert?: boolean;
  contrast: string;
  out?: string;
}

interface VideoCommandOptions extends ImageCommandOptions {
  fps: string;
  outDir: string;
}

const program = new Command();

program
  .name('asciigen')
  .description('Generate ASCII from images and videos')
  .version('0.1.0');

function parseInteger(value: string | undefined, fallback?: number): number | undefined {
  if (value === undefined) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Expected a positive integer, received "${value}"`);
  }
  return parsed;
}

function parseOptions(options: ImageCommandOptions): AsciiOptions {
  return {
    width: parseInteger(options.width, 96),
    height: parseInteger(options.height),
    characters: options.chars,
    invert: Boolean(options.invert),
    contrast: Number.parseFloat(options.contrast),
  };
}

async function convertImage(inputPath: string, options: AsciiOptions): Promise<string> {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return rgbaToAscii(data, info.width, info.height, options);
}

async function writeAscii(ascii: string, outPath?: string): Promise<void> {
  if (outPath) {
    await writeFile(outPath, `${ascii}\n`, 'utf8');
    return;
  }

  process.stdout.write(`${ascii}\n`);
}

function runFfmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn('ffmpeg', args, { stdio: 'ignore' });

    child.on('error', () => {
      reject(new Error('ffmpeg is required for video conversion'));
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`ffmpeg exited with code ${code}`));
    });
  });
}

async function handleError(error: unknown): Promise<never> {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`asciigen: ${message}\n`);
  process.exit(1);
}

function addImageOptions(command: Command): Command {
  return command
    .option('-w, --width <number>', 'output width in characters', '96')
    .option('--height <number>', 'output height in rows')
    .option('--chars <characters>', 'dark-to-light character ramp', DEFAULT_CHARS)
    .option('--invert', 'invert luminance mapping')
    .option('--contrast <number>', 'contrast adjustment from -255 to 255', '0')
    .option('-o, --out <path>', 'write output to a file');
}

addImageOptions(
  program
    .command('image')
    .description('Convert an image to ASCII')
    .argument('<input>', 'path to an image'),
).action(async (input: string, options: ImageCommandOptions) => {
  try {
    await writeAscii(await convertImage(input, parseOptions(options)), options.out);
  } catch (error) {
    await handleError(error);
  }
});

addImageOptions(
  program
    .command('convert')
    .description('Alias for image')
    .argument('<input>', 'path to an image'),
).action(async (input: string, options: ImageCommandOptions) => {
  try {
    await writeAscii(await convertImage(input, parseOptions(options)), options.out);
  } catch (error) {
    await handleError(error);
  }
});

program
  .command('video')
  .description('Convert sampled video frames to ASCII text files')
  .argument('<input>', 'path to a video')
  .option('-w, --width <number>', 'output width in characters', '96')
  .option('--height <number>', 'output height in rows')
  .option('--chars <characters>', 'dark-to-light character ramp', DEFAULT_CHARS)
  .option('--invert', 'invert luminance mapping')
  .option('--contrast <number>', 'contrast adjustment from -255 to 255', '0')
  .option('--fps <number>', 'frames per second to sample', '8')
  .requiredOption('--out-dir <path>', 'directory for frame text files')
  .action(async (input: string, options: VideoCommandOptions) => {
    const frameDir = await mkdtemp(path.join(tmpdir(), 'asciigen-frames-'));

    try {
      await mkdir(options.outDir, { recursive: true });
      await runFfmpeg([
        '-i',
        input,
        '-vf',
        `fps=${Number.parseFloat(options.fps)}`,
        path.join(frameDir, 'frame-%06d.png'),
      ]);

      const frames = (await readdir(frameDir))
        .filter((name) => name.endsWith('.png'))
        .sort();
      const asciiOptions = parseOptions(options);

      await Promise.all(
        frames.map(async (frame, index) => {
          const ascii = await convertImage(path.join(frameDir, frame), asciiOptions);
          const outPath = path.join(options.outDir, `frame-${String(index + 1).padStart(6, '0')}.txt`);
          await writeFile(outPath, `${ascii}\n`, 'utf8');
        }),
      );
    } catch (error) {
      await handleError(error);
    } finally {
      await rm(frameDir, { recursive: true, force: true });
    }
  });

program.parse();
