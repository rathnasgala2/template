/**
 * UTF-8 helpers over `TextEncoder`, so no browser-path module needs `Buffer`.
 */

const encoder = new TextEncoder();

/**
 * @param {string} text the text
 * @returns {Uint8Array} its UTF-8 bytes
 */
export function utf8Bytes(text) {
  return encoder.encode(text);
}

/**
 * Compare two strings by their UTF-8 bytes (the order `Buffer.compare` of
 * their `Buffer.from(text, 'utf8')` gives).
 *
 * @param {string} a the first string
 * @param {string} b the second string
 * @returns {number} negative, zero or positive
 */
export function compareUtf8(a, b) {
  const x = encoder.encode(a);
  const y = encoder.encode(b);
  const shared = Math.min(x.length, y.length);
  for (let i = 0; i < shared; i += 1) {
    if (x[i] !== y[i]) return x[i] < y[i] ? -1 : 1;
  }
  return x.length === y.length ? 0 : x.length < y.length ? -1 : 1;
}
