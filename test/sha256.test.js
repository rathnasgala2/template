/**
 * The pure SHA-256 agrees with `node:crypto` over many inputs.
 */

import { strict as assert } from 'node:assert';
import { createHash, randomBytes } from 'node:crypto';
import { test } from 'node:test';

import {
  sha256Base64,
  sha256Hex,
  sha256HexOfText,
} from '../src/core/internal/sha256.js';
import { compareUtf8 } from '../src/core/internal/utf8.js';

/**
 * @param {Uint8Array} bytes the message
 * @returns {string} node:crypto's hex digest
 */
function reference(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

test('sha256: the published test vectors', () => {
  assert.equal(
    sha256HexOfText(''),
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  );
  assert.equal(
    sha256HexOfText('abc'),
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
  );
});

test('sha256: every length around the block and padding boundaries matches node:crypto', () => {
  for (let length = 0; length <= 300; length += 1) {
    const bytes = new Uint8Array(length).map((_, i) => (i * 31 + length) & 255);
    assert.equal(sha256Hex(bytes), reference(bytes), `length ${length}`);
  }
});

test('sha256: random multi-block inputs match node:crypto', () => {
  for (const length of [1000, 4096, 65536, 100003]) {
    for (let round = 0; round < 3; round += 1) {
      const bytes = new Uint8Array(randomBytes(length));
      assert.equal(sha256Hex(bytes), reference(bytes));
    }
  }
});

test('sha256: non-ASCII text through TextEncoder matches node:crypto', () => {
  for (const text of [
    'தமிழ் வலைப்பதிவு',
    'héllo wörld ✓',
    '日本語のテキスト',
    '\u{1F600} emoji \u{1F9EA}',
    'a\u0000b',
    'x'.repeat(5000) + 'é',
  ]) {
    assert.equal(
      sha256HexOfText(text),
      reference(new TextEncoder().encode(text)),
      text.slice(0, 12),
    );
  }
});

test('compareUtf8 orders by UTF-8 bytes like Buffer.compare', () => {
  const samples = ['a', 'B', 'ab', 'é', 'z', '\u{1F600}', 'Ａ', '', 'aa'];
  for (const a of samples) {
    for (const b of samples) {
      assert.equal(
        Math.sign(compareUtf8(a, b)),
        Math.sign(Buffer.compare(Buffer.from(a), Buffer.from(b))),
      );
    }
  }
});

test('sha256Base64 matches node:crypto base64', () => {
  const bytes = new TextEncoder().encode('body { color: red }');
  assert.equal(
    sha256Base64(bytes),
    createHash('sha256').update(bytes).digest('base64'),
  );
});
