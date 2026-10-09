/**
 * Reader interactions, render side: validation of `build-input.modules.interactions`,
 * the server-rendered `<section class="g-interactions">` page contract the
 * browser script (`src/modules/interactions/browser/gala-interactions.js`)
 * enhances, and the script asset itself. The template renders markup only;
 * every request, token and comment lives in the browser script and the API.
 */

import { readFile } from 'node:fs/promises';

import { RenderPolicyViolationError } from '../errors.js';
import { escapeHtml } from './skeleton.js';
import { icon } from './icons.js';

/** @type {string} the emitted script's output-relative path */
export const INTERACTIONS_SCRIPT_PATH = 'assets/gala-interactions-v1.js';

/** @type {string} */
export const INTERACTIONS_SCRIPT_MEDIA_TYPE =
  'application/javascript; charset=utf-8';

const INTERACTIONS_SCRIPT_SOURCE_URL = new URL(
  '../../modules/interactions/browser/gala-interactions.js',
  import.meta.url,
);

/** @type {string} */
const CONFIG_SCHEMA_ID = 'urn:gala:schema:interactions-config:2.0.0';

/** The approved reaction emoji (design section 3). */
export const APPROVED_REACTION_EMOJI = Object.freeze([
  '\u{1F44D}',
  '❤️',
  '\u{1F4A1}',
  '\u{1F389}',
  '\u{1F602}',
  '\u{1F92F}',
  '\u{1F64F}',
  '\u{1F525}',
  '\u{1F44F}',
  '\u{1F62E}',
  '\u{1F622}',
  '\u{1F914}',
  '✨',
  '\u{1F680}',
  '\u{1F4AF}',
  '\u{1F440}',
]);

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
function exactObject(value, keys, where) {
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
function boolean(value, where) {
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
function origin(value, where) {
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
 * Validate `build-input.modules.interactions` (design sections 3 and 4).
 * `placements` stays empty and no other module is admitted; both are checked
 * by the caller.
 *
 * @param {unknown} candidate the module selection value
 * @returns {import('../../../types/index.d.ts').InteractionsModule} the
 *   validated, frozen-shape module
 */
export function validateInteractionsModule(candidate) {
  const where = 'build-input.modules.interactions';
  const module = exactObject(
    candidate,
    ['config', 'apiOrigin', 'appOrigin'],
    where,
  );
  const apiOrigin = origin(module.apiOrigin, `${where}.apiOrigin`);
  const appOrigin = origin(module.appOrigin, `${where}.appOrigin`);
  const config = exactObject(
    module.config,
    ['schemaId', 'schemaVersion', 'reactions', 'comments', 'publicCounts'],
    `${where}.config`,
  );
  if (
    config.schemaId !== CONFIG_SCHEMA_ID ||
    config.schemaVersion !== '2.0.0'
  ) {
    throw new RenderPolicyViolationError(
      `${where}.config.schemaId must be ${CONFIG_SCHEMA_ID} with schemaVersion 2.0.0`,
    );
  }
  const reactions = exactObject(
    config.reactions,
    ['enabled', 'definitions'],
    `${where}.config.reactions`,
  );
  boolean(reactions.enabled, `${where}.config.reactions.enabled`);
  const definitions = reactions.definitions;
  if (!Array.isArray(definitions) || definitions.length > 16) {
    throw new RenderPolicyViolationError(
      `${where}.config.reactions.definitions must be an array of at most 16`,
    );
  }
  const keys = new Set();
  const orders = new Set();
  definitions.forEach((definition, index) => {
    const at = `${where}.config.reactions.definitions[${index}]`;
    const item = exactObject(
      definition,
      ['key', 'label', 'visual', 'order', 'enabled'],
      at,
    );
    if (
      typeof item.key !== 'string' ||
      !/^[a-z][a-z0-9-]{1,31}$/.test(item.key) ||
      item.key === 'like'
    ) {
      throw new RenderPolicyViolationError(
        `${at}.key must match ^[a-z][a-z0-9-]{1,31}$ and must not be "like"`,
      );
    }
    if (keys.has(item.key)) {
      throw new RenderPolicyViolationError(`${at}.key is duplicated`);
    }
    keys.add(item.key);
    if (
      typeof item.label !== 'string' ||
      [...item.label].length < 1 ||
      [...item.label].length > 32
    ) {
      throw new RenderPolicyViolationError(
        `${at}.label must be 1 to 32 characters`,
      );
    }
    const visual = exactObject(item.visual, ['kind', 'token'], `${at}.visual`);
    if (
      visual.kind !== 'emoji' ||
      !APPROVED_REACTION_EMOJI.includes(/** @type {string} */ (visual.token))
    ) {
      throw new RenderPolicyViolationError(
        `${at}.visual must be an emoji from the approved list`,
      );
    }
    if (
      !Number.isInteger(item.order) ||
      /** @type {number} */ (item.order) < 1 ||
      /** @type {number} */ (item.order) > 16
    ) {
      throw new RenderPolicyViolationError(
        `${at}.order must be an integer from 1 to 16`,
      );
    }
    if (orders.has(item.order)) {
      throw new RenderPolicyViolationError(`${at}.order is duplicated`);
    }
    orders.add(item.order);
    boolean(item.enabled, `${at}.enabled`);
  });
  const comments = exactObject(
    config.comments,
    ['enabled', 'allowReplies', 'maxDepth'],
    `${where}.config.comments`,
  );
  boolean(comments.enabled, `${where}.config.comments.enabled`);
  boolean(comments.allowReplies, `${where}.config.comments.allowReplies`);
  if (
    !Number.isInteger(comments.maxDepth) ||
    /** @type {number} */ (comments.maxDepth) < 1 ||
    /** @type {number} */ (comments.maxDepth) > 4
  ) {
    throw new RenderPolicyViolationError(
      `${where}.config.comments.maxDepth must be an integer from 1 to 4`,
    );
  }
  const counts = exactObject(
    config.publicCounts,
    ['reactions', 'comments'],
    `${where}.config.publicCounts`,
  );
  boolean(counts.reactions, `${where}.config.publicCounts.reactions`);
  boolean(counts.comments, `${where}.config.publicCounts.comments`);
  return /** @type {import('../../../types/index.d.ts').InteractionsModule} */ (
    /** @type {unknown} */ ({ config, apiOrigin, appOrigin })
  );
}

/**
 * Whether the module puts anything on article pages: it is present and at
 * least one of reactions and comments is enabled.
 *
 * @param {import('../../../types/index.d.ts').InteractionsModule | undefined} module
 *   the validated module, if any
 * @returns {boolean} whether article routes are interaction-bearing
 */
export function interactionsActive(module) {
  return (
    module !== undefined &&
    (module.config.reactions.enabled || module.config.comments.enabled)
  );
}

/**
 * Render the `<section class="g-interactions">` for one article.
 *
 * @param {object} input render input
 * @param {import('../../../types/index.d.ts').InteractionsModule} input.module
 *   the validated module
 * @param {Readonly<Record<string, string | ((...args: string[]) => string)>>} input.messages
 *   the chrome message catalog
 * @param {string} input.publicationId the build input's publication id
 * @param {string} input.contentId the article's front matter id
 * @param {string} input.canonicalUrl the absolute canonical article URL
 * @returns {string} the section markup (empty when nothing is enabled)
 */
export function renderInteractionsSection({
  module,
  messages,
  publicationId,
  contentId,
  canonicalUrl,
}) {
  if (!interactionsActive(module)) return '';
  const { config } = module;
  const text = (/** @type {string} */ key) =>
    escapeHtml(/** @type {string} */ (messages[key]));
  const reactionButtons = config.reactions.enabled
    ? `<button type="button" class="g-reaction" data-reaction-key="like" aria-pressed="false" disabled>` +
      `<span class="g-reaction__icon" aria-hidden="true">${icon('heart')}</span>` +
      `<span class="g-reaction__label">${text('likeLabel')}</span>` +
      `<span class="g-reaction__count" data-gala-count></span></button>` +
      [...config.reactions.definitions]
        .filter((definition) => definition.enabled)
        .sort((a, b) => a.order - b.order)
        .map(
          (definition) =>
            `<button type="button" class="g-reaction" data-reaction-key="${escapeHtml(definition.key)}" aria-pressed="false" disabled>` +
            `<span class="g-reaction__icon" aria-hidden="true">${escapeHtml(definition.visual.token)}</span>` +
            `<span class="g-reaction__label">${escapeHtml(definition.label)}</span>` +
            `<span class="g-reaction__count" data-gala-count></span></button>`,
        )
        .join('')
    : '';
  const reactions = config.reactions.enabled
    ? `<div class="g-reactions" data-gala-reactions role="group" aria-label="${text('reactionsGroupLabel')}">${reactionButtons}</div>`
    : '';
  const comments = config.comments.enabled
    ? `<div class="g-comments" data-gala-comments>` +
      `<h3 class="g-comments__title">${text('commentsHeading')} <span class="g-comments__count" data-gala-comment-count></span></h3>` +
      `<p class="g-interactions__notice" data-gala-static-notice>${text('interactionsNeedScriptNotice')}</p>` +
      `<div class="g-composer-slot" data-gala-composer-slot></div>` +
      `<ol class="g-comment-list" data-gala-comment-list></ol>` +
      `<button type="button" class="g-comments__more" data-gala-more hidden>${text('showMoreCommentsLabel')}</button>` +
      `</div>`
    : '';
  const flag = (/** @type {boolean} */ value) => (value ? 'true' : 'false');
  const staticNoticeForReactionsOnly =
    !config.comments.enabled && config.reactions.enabled
      ? `<p class="g-interactions__notice" data-gala-static-notice>${text('interactionsNeedScriptNotice')}</p>`
      : '';
  return (
    `<section class="g-interactions" id="comments" aria-labelledby="g-interactions-title" data-gala-interactions ` +
    `data-api-origin="${escapeHtml(module.apiOrigin)}" data-app-origin="${escapeHtml(module.appOrigin)}" ` +
    `data-publication-id="${escapeHtml(publicationId)}" data-content-id="${escapeHtml(contentId)}" ` +
    `data-canonical-url="${escapeHtml(canonicalUrl)}" ` +
    `data-reactions-enabled="${flag(config.reactions.enabled)}" data-comments-enabled="${flag(config.comments.enabled)}" ` +
    `data-count-reactions="${flag(config.publicCounts.reactions)}" data-count-comments="${flag(config.publicCounts.comments)}" ` +
    `data-allow-replies="${flag(config.comments.allowReplies)}" data-max-depth="${config.comments.maxDepth}">` +
    `<h2 id="g-interactions-title" class="g-interactions__title">${text('interactionsHeading')}</h2>` +
    reactions +
    staticNoticeForReactionsOnly +
    comments +
    `<div class="g-interactions__status" role="status" aria-live="polite" data-gala-status></div>` +
    `</section>`
  );
}

/**
 * Read the browser script's bytes from the template package.
 *
 * @returns {Promise<Buffer>} the script bytes
 */
export function loadInteractionsScript() {
  return readFile(INTERACTIONS_SCRIPT_SOURCE_URL);
}
