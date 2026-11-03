/**
 * Recommendations: the sites an author recommends
 * (`publication.recommendations`, schemas 3.32.0), rendered as a "Recommended
 * by <site>" section on the About page and published as
 * `/.well-known/recommendations.json` in the shape Ghost uses: a bare JSON
 * array of `{url, created_at, updated_at}`.
 *
 * The input is validated here as well as by the schema, because the schemas
 * pin this renderer was built against can lag the release that introduced the
 * member: at most 24 entries, `https` addresses without credentials, unique,
 * a title of 1 to 120 characters, an optional description of up to 300 and an
 * optional `addedOn` day (`YYYY-MM-DD`). Anything else fails the build.
 */

import { RenderPolicyViolationError } from '../errors.js';
import { icon } from './icons.js';
import { escapeHtml } from './skeleton.js';

/** @type {number} */
export const MAX_RECOMMENDATIONS = 24;

/** @type {string} the fixed output route (un-joined) */
export const RECOMMENDATIONS_ROUTE = '/.well-known/recommendations.json';

/**
 * @typedef {object} Recommendation
 * @property {string} url the recommended site's address
 * @property {string} title its name
 * @property {string} [description] a sentence about it
 * @property {string} [addedOn] the day it was added, `YYYY-MM-DD` (UTC)
 */

// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u001f\u007f]/;
const KEYS = new Set(['url', 'title', 'description', 'addedOn']);

/**
 * @param {unknown} value a candidate day
 * @returns {boolean} whether it is a real `YYYY-MM-DD` date
 */
function realDay(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  return new Date(`${value}T00:00:00.000Z`).toISOString().startsWith(value);
}

/**
 * @param {unknown} value a candidate text
 * @param {number} limit the most characters
 * @returns {value is string} whether it is 1 to `limit` characters, no control
 */
function validText(value, limit) {
  return (
    typeof value === 'string' &&
    value !== '' &&
    !CONTROL.test(value) &&
    [...value].length <= limit
  );
}

/**
 * Validate `publication.recommendations`.
 *
 * @param {unknown} value the member's value (`undefined` means none)
 * @returns {Recommendation[]} the entries, in the author's order
 * @throws {RenderPolicyViolationError} when the member is not admitted
 */
export function readRecommendations(value) {
  if (value === undefined) return [];
  const where = 'build-input.publication.recommendations';
  if (!Array.isArray(value) || value.length > MAX_RECOMMENDATIONS) {
    throw new RenderPolicyViolationError(
      `${where} must be an array of at most ${MAX_RECOMMENDATIONS}`,
    );
  }
  const seen = new Set();
  return value.map((entry, index) => {
    const at = `${where}[${index}]`;
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
      throw new RenderPolicyViolationError(`${at} must be an object`);
    }
    const item = /** @type {Record<string, unknown>} */ (entry);
    for (const key of Object.keys(item)) {
      if (!KEYS.has(key)) {
        throw new RenderPolicyViolationError(`${at}.${key} is not allowed`);
      }
    }
    let url;
    try {
      url = new URL(String(item.url));
    } catch {
      url = undefined;
    }
    if (
      !url ||
      url.protocol !== 'https:' ||
      url.username !== '' ||
      url.password !== '' ||
      !/^https:\/\//.test(String(item.url)) ||
      CONTROL.test(String(item.url)) ||
      /\s/.test(String(item.url)) ||
      String(item.url).length > 2048
    ) {
      throw new RenderPolicyViolationError(
        `${at}.url must be an https address without credentials`,
      );
    }
    if (seen.has(url.href)) {
      throw new RenderPolicyViolationError(`${at}.url is duplicated`);
    }
    seen.add(url.href);
    if (!validText(item.title, 120)) {
      throw new RenderPolicyViolationError(
        `${at}.title must be 1 to 120 characters`,
      );
    }
    if (item.description !== undefined && !validText(item.description, 300)) {
      throw new RenderPolicyViolationError(
        `${at}.description must be 1 to 300 characters`,
      );
    }
    if (item.addedOn !== undefined && !realDay(item.addedOn)) {
      throw new RenderPolicyViolationError(
        `${at}.addedOn must be a YYYY-MM-DD day`,
      );
    }
    return /** @type {Recommendation} */ (item);
  });
}

/**
 * The `/.well-known/recommendations.json` bytes: Ghost's shape, a bare array.
 * Both timestamps are `addedOn` at midnight UTC, else the build time.
 *
 * @param {readonly Recommendation[]} recommendations the validated entries
 * @param {string} buildEpoch the build input's `buildEpoch`
 * @returns {string | undefined} the JSON text, or `undefined` when there is
 *   nothing to publish
 */
export function buildRecommendationsDocument(recommendations, buildEpoch) {
  if (recommendations.length === 0) return undefined;
  const built = new Date(buildEpoch).toISOString();
  return `${JSON.stringify(
    recommendations.map((entry) => {
      const at = entry.addedOn ? `${entry.addedOn}T00:00:00.000Z` : built;
      return { url: entry.url, created_at: at, updated_at: at };
    }),
  )}\n`;
}

/**
 * The "Recommended by <site>" section of the About page.
 *
 * @param {object} input
 * @param {readonly Recommendation[]} input.recommendations the validated entries
 * @param {string} input.siteTitle the publication's title
 * @param {Readonly<Record<string, string | ((...args: string[]) => string)>>} input.messages
 *   the chrome message catalog
 * @returns {string} the section markup (empty when there is none)
 */
export function renderRecommendationsSection({
  recommendations,
  siteTitle,
  messages,
}) {
  if (recommendations.length === 0) return '';
  const heading = /** @type {(site: string) => string} */ (
    messages.recommendationsHeading
  )(siteTitle);
  const visit = escapeHtml(String(messages.recommendationVisitLabel));
  const items = recommendations
    .map((entry) => {
      const host = new URL(entry.url).hostname.replace(/^www\./, '');
      return (
        `<li class="g-recommendation"><h3 class="g-recommendation__title">` +
        `<a href="${escapeHtml(entry.url)}" rel="noopener noreferrer">${escapeHtml(entry.title)}</a></h3>` +
        (entry.description
          ? `<p class="g-recommendation__desc">${escapeHtml(entry.description)}</p>`
          : '') +
        `<p class="g-recommendation__meta"><span>${escapeHtml(host)}</span>` +
        `<span class="g-recommendation__visit" aria-hidden="true">${visit}${icon('upright')}</span></p></li>`
      );
    })
    .join('');
  return (
    `<section class="g-wrap g-recommendations" aria-labelledby="recommendations-title">` +
    `<h2 id="recommendations-title" class="g-recommendations__title">${escapeHtml(heading)}</h2>` +
    `<ul class="g-recommendations__list">${items}</ul></section>`
  );
}
