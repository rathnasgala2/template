/**
 * The default Terms and Privacy text a site shows when its build input carries
 * no `policies`: the one English source the schemas package publishes as
 * `@rathnasgala2/schemas/site-policy-defaults`
 * (`{terms: {title, markdown}, privacy: {title, markdown}}`, schemas 3.16.0).
 * The renderer never carries a copy of it; `policy-pages.js` renders the
 * Markdown through the render policy's own pipeline.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { RenderPolicyViolationError } from '../errors.js';

/** @type {string} */
const SPECIFIER = '@rathnasgala2/schemas/site-policy-defaults';

/**
 * @typedef {object} SitePolicyDefault
 * @property {string} title the page title
 * @property {string} markdown the page body as Markdown source
 */

/**
 * @typedef {object} SitePolicyDefaults
 * @property {SitePolicyDefault} terms the Terms page
 * @property {SitePolicyDefault} privacy the Privacy page
 */

/** @type {Readonly<SitePolicyDefaults> | undefined} */
let loaded;

/**
 * @param {unknown} value a parsed member of the defaults document
 * @param {string} where location for the message
 * @returns {SitePolicyDefault} the member, checked
 */
function defaultOf(value, where) {
  const candidate = /** @type {Record<string, unknown> | null} */ (value);
  if (
    typeof candidate !== 'object' ||
    candidate === null ||
    typeof candidate.title !== 'string' ||
    candidate.title === '' ||
    typeof candidate.markdown !== 'string' ||
    candidate.markdown === ''
  ) {
    throw new RenderPolicyViolationError(
      `${SPECIFIER}: ${where} must carry a non-empty title and markdown`,
    );
  }
  return Object.freeze({
    title: candidate.title,
    markdown: candidate.markdown,
  });
}

/**
 * Read the schemas package's default policy text once per process.
 *
 * @returns {Readonly<SitePolicyDefaults>} the defaults, checked
 * @throws {RenderPolicyViolationError} when the export is missing or not the
 *   documented shape
 */
export function loadSitePolicyDefaults() {
  if (loaded !== undefined) return loaded;
  /** @type {unknown} */
  let document;
  try {
    document = JSON.parse(
      readFileSync(fileURLToPath(import.meta.resolve(SPECIFIER)), 'utf8'),
    );
  } catch (error) {
    throw new RenderPolicyViolationError(
      `${SPECIFIER} could not be read (is @rathnasgala2/schemas 3.16.0 or later installed?): ${/** @type {Error} */ (error).message}`,
    );
  }
  const candidate = /** @type {Record<string, unknown> | null} */ (document);
  loaded = Object.freeze({
    terms: defaultOf(candidate?.terms, 'terms'),
    privacy: defaultOf(candidate?.privacy, 'privacy'),
  });
  return loaded;
}
