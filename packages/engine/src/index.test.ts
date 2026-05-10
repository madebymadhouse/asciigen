import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DEFAULT_CHARS,
  imageDataToAscii,
  mapLuminanceToChar,
  rgbaToAscii,
} from './index.js';

test('maps luminance across the configured character ramp', () => {
  assert.equal(mapLuminanceToChar(0, ' .#'), ' ');
  assert.equal(mapLuminanceToChar(128, ' .#'), '.');
  assert.equal(mapLuminanceToChar(255, ' .#'), '#');
});

test('supports inverted luminance mapping', () => {
  assert.equal(mapLuminanceToChar(0, ' .#', true), '#');
  assert.equal(mapLuminanceToChar(255, ' .#', true), ' ');
});

test('converts rgba pixels into deterministic ascii text', () => {
  const data = new Uint8ClampedArray([
    0, 0, 0, 255,
    255, 255, 255, 255,
    255, 255, 255, 255,
    0, 0, 0, 255,
  ]);

  assert.equal(rgbaToAscii(data, 2, 2, { width: 2, height: 2, characters: ' #' }), ' #\n# ');
});

test('accepts image data shaped input', () => {
  const data = new Uint8ClampedArray([255, 255, 255, 255]);
  assert.equal(
    imageDataToAscii({ data, width: 1, height: 1 }, { width: 1, height: 1 }),
    DEFAULT_CHARS[DEFAULT_CHARS.length - 1],
  );
});
