export interface AsciiOptions {
  characters?: string;
  width?: number;
  height?: number;
  contrast?: number;
  invert?: boolean;
  alphaThreshold?: number;
}

export interface ImageDataLike {
  data: ArrayLike<number>;
  width: number;
  height: number;
}

export const DEFAULT_CHARS = ' .:-=+*#%@';
export const DEFAULT_WIDTH = 96;
export const DEFAULT_CHAR_ASPECT = 0.5;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeCharacters(characters = DEFAULT_CHARS): string {
  return characters.length > 0 ? characters : DEFAULT_CHARS;
}

export function mapLuminanceToChar(
  luminance: number,
  characters = DEFAULT_CHARS,
  invert = false,
): string {
  const ramp = normalizeCharacters(characters);
  const value = invert ? 255 - luminance : luminance;
  const index = Math.round((clamp(value, 0, 255) / 255) * (ramp.length - 1));
  return ramp[index] ?? ramp[ramp.length - 1];
}

export function applyContrast(luminance: number, contrast = 0): number {
  const bounded = clamp(contrast, -255, 255);
  if (bounded === 0) return clamp(luminance, 0, 255);

  const factor = (259 * (bounded + 255)) / (255 * (259 - bounded));
  return clamp(factor * (luminance - 128) + 128, 0, 255);
}

export function rgbaToAscii(
  data: ArrayLike<number>,
  sourceWidth: number,
  sourceHeight: number,
  options: AsciiOptions = {},
): string {
  const characters = normalizeCharacters(options.characters);
  const targetWidth = Math.max(1, Math.floor(options.width ?? DEFAULT_WIDTH));
  const targetHeight = Math.max(
    1,
    Math.floor(
      options.height ??
        Math.round((sourceHeight / sourceWidth) * targetWidth * DEFAULT_CHAR_ASPECT),
    ),
  );
  const alphaThreshold = options.alphaThreshold ?? 8;
  const lines: string[] = [];

  for (let y = 0; y < targetHeight; y += 1) {
    let line = '';
    const sourceY = Math.min(
      sourceHeight - 1,
      Math.floor((y / targetHeight) * sourceHeight),
    );

    for (let x = 0; x < targetWidth; x += 1) {
      const sourceX = Math.min(
        sourceWidth - 1,
        Math.floor((x / targetWidth) * sourceWidth),
      );
      const index = (sourceY * sourceWidth + sourceX) * 4;
      const alpha = data[index + 3] ?? 255;

      if (alpha < alphaThreshold) {
        line += characters[0] ?? ' ';
        continue;
      }

      const red = data[index] ?? 0;
      const green = data[index + 1] ?? red;
      const blue = data[index + 2] ?? red;
      const luminance = applyContrast(
        0.2126 * red + 0.7152 * green + 0.0722 * blue,
        options.contrast,
      );
      line += mapLuminanceToChar(luminance, characters, options.invert);
    }

    lines.push(line);
  }

  return lines.join('\n');
}

export function imageDataToAscii(imageData: ImageDataLike, options: AsciiOptions = {}): string {
  return rgbaToAscii(imageData.data, imageData.width, imageData.height, options);
}

export class AsciiEngine {
  private readonly options: AsciiOptions;

  constructor(options: AsciiOptions = {}) {
    this.options = options;
  }

  public getCharFromLuminance(luminance: number): string {
    return mapLuminanceToChar(luminance, this.options.characters, this.options.invert);
  }

  public rgbaToAscii(
    data: ArrayLike<number>,
    width: number,
    height: number,
    options: AsciiOptions = {},
  ): string {
    return rgbaToAscii(data, width, height, { ...this.options, ...options });
  }
}
