/**
 * Shared shape checks for `build-input.modules.*` and `build-input.policies`
 * validation (`interactions.js`, `analytics/module.js`, `policy-pages.js`):
 * exact-key objects, booleans, origins and bounded text. Each caller re-checks
 * its own enums and patterns because this renderer fails closed on its own.
 */

import { RenderPolicyViolationError } from '../errors.js';

/**
 * @param {unknown} value any value
 * @returns {value is Record<string, unknown>} whether it is a plain object
 */
function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Throw unless `value` is an object with exactly the `allowed` keys (all
 * required).
 *
 * @param {unknown} value candidate
 * @param {readonly string[]} keys the exact key set
 * @param {string} where location for the message
 * @returns {Record<string, unknown>} the object
 */
export function exactObject(value, keys, where) {
  if (!isRecord(value)) {
    throw new RenderPolicyViolationError(`${where} must be an object`);
  }
  for (const key of Object.keys(value)) {
    if (!keys.includes(key)) {
      throw new RenderPolicyViolationError(`${where}.${key} is not allowed`);
    }
  }
  for (const key of keys) {
    if (!(key in value)) {
      throw new RenderPolicyViolationError(`${where}.${key} is required`);
    }
  }
  return value;
}

/**
 * @param {unknown} value candidate
 * @param {string} where location for the message
 * @returns {boolean} the boolean
 */
export function boolean(value, where) {
  if (typeof value !== 'boolean') {
    throw new RenderPolicyViolationError(`${where} must be a boolean`);
  }
  return value;
}

/**
 * An `https` origin, or an `http` origin on localhost / 127.0.0.1 (the local
 * stack), with no path, query or fragment.
 *
 * @param {unknown} value candidate
 * @param {string} where location for the message
 * @returns {string} the origin
 */
export function origin(value, where) {
  let parsed;
  try {
    parsed = new URL(String(value));
  } catch {
    throw new RenderPolicyViolationError(`${where} must be an origin URL`);
  }
  const local =
    parsed.protocol === 'http:' &&
    (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1');
  if (
    typeof value !== 'string' ||
    parsed.origin !== value ||
    (parsed.protocol !== 'https:' && !local)
  ) {
    throw new RenderPolicyViolationError(
      `${where} must be an https origin (or an http localhost origin) with no path`,
    );
  }
  return value;
}

/**
 * A string of one to `maximum` grapheme clusters.
 *
 * @param {unknown} value candidate
 * @param {number} maximum the most grapheme clusters allowed
 * @param {string} where location for the message
 * @returns {string} the text
 */
export function boundedText(value, maximum, where) {
  if (typeof value !== 'string') {
    throw new RenderPolicyViolationError(`${where} must be a string`);
  }
  const length = Array.from(
    new Intl.Segmenter('en', { granularity: 'grapheme' }).segment(value),
  ).length;
  if (length < 1 || length > maximum) {
    throw new RenderPolicyViolationError(
      `${where} must be 1 to ${maximum} characters`,
    );
  }
  return value;
}
