/**
 * The podcast feed's input: `publication.listen.podcast`
 * (`{enabled, category, explicit, cover, description?, ownerEmail?}`), the
 * schemas release after the pinned one adds it. The renderer validates it here
 * and keeps it out of the schema validation (`internal/forward-compat.js`).
 *
 * The cover is held to Apple Podcasts' show-cover rule, which Spotify's own
 * guide matches: a square PNG or JPEG of 1400 to 3000 pixels
 * ("Podcast RSS feed requirements" / "Show Cover" on podcasters.apple.com).
 * The media pipeline re-encodes a PNG or JPEG at its full size
 * (`assets/media/<digest>/original.<png|jpg>`); that file is the feed's
 * `itunes:image`. A cover that is absent, not a PNG or JPEG, not square or
 * outside 1400 to 3000 pixels fails the build before anything is written.
 */

import { BuildInputValidationError, MediaPipelineError } from '../errors.js';

/** @type {string} the fixed output route (un-joined) */
export const PODCAST_FEED_ROUTE = '/feed/podcast.xml';

/** @type {number} the smallest and largest cover side, in pixels */
export const COVER_MIN_PIXELS = 1400;
export const COVER_MAX_PIXELS = 3000;

// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u001f\u007f]/;
const KEYS = new Set([
  'enabled',
  'category',
  'explicit',
  'cover',
  'description',
  'ownerEmail',
]);

/**
 * @typedef {object} PodcastConfig
 * @property {boolean} enabled
 * @property {string} category the Apple Podcasts category name
 * @property {boolean} explicit
 * @property {{path: string, sourceDigest: string}} cover
 * @property {string} [description] the show's description (else the site's)
 * @property {string} [ownerEmail] the owner's address, for directories that
 *   verify ownership by email
 */

/**
 * @param {unknown} value any value
 * @returns {value is Record<string, any>} whether it is a plain object
 */
function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * @param {unknown} value a candidate text
 * @param {number} limit the most characters
 * @returns {boolean} whether it is 1 to `limit` characters, no control
 */
function validText(value, limit) {
  return (
    typeof value === 'string' &&
    value.trim() !== '' &&
    !CONTROL.test(value) &&
    [...value].length <= limit
  );
}

/**
 * @param {unknown} value a candidate `listen.podcast`
 * @returns {string | undefined} what is wrong with it, or `undefined`
 */
function podcastProblem(value) {
  if (!isRecord(value)) return 'it must be an object';
  for (const key of Object.keys(value)) {
    if (!KEYS.has(key)) return `${key} is not a podcast member`;
  }
  if (typeof value.enabled !== 'boolean') return 'enabled must be a boolean';
  if (typeof value.explicit !== 'boolean') return 'explicit must be a boolean';
  if (!validText(value.category, 100)) {
    return 'category must be 1 to 100 characters';
  }
  const cover = value.cover;
  if (
    !isRecord(cover) ||
    Object.keys(cover).sort().join(',') !== 'path,sourceDigest' ||
    typeof cover.path !== 'string' ||
    cover.path === '' ||
    cover.path.length > 512 ||
    cover.path.startsWith('/') ||
    cover.path.includes('\\') ||
    CONTROL.test(cover.path) ||
    typeof cover.sourceDigest !== 'string' ||
    !/^sha256:[0-9a-f]{64}$/.test(cover.sourceDigest)
  ) {
    return 'cover must be a repository file reference (path and sha256 sourceDigest)';
  }
  if (value.description !== undefined && !validText(value.description, 4000)) {
    return 'description must be 1 to 4000 characters';
  }
  if (
    value.ownerEmail !== undefined &&
    !(
      typeof value.ownerEmail === 'string' &&
      value.ownerEmail.length <= 254 &&
      /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(value.ownerEmail)
    )
  ) {
    return 'ownerEmail must be an email address';
  }
  return undefined;
}

/**
 * Check `publication.listen.podcast` and return it without that member.
 *
 * @param {Record<string, any>} listen the build input's `publication.listen`
 * @returns {Record<string, any>} `listen` without `podcast`
 * @throws {BuildInputValidationError} for an invalid member
 */
export function withoutPodcast(listen) {
  const problem = podcastProblem(listen.podcast);
  if (problem !== undefined) {
    throw new BuildInputValidationError([
      {
        code: 'LISTEN_PODCAST_INVALID',
        severity: 'ERROR',
        instancePointer: '/publication/listen/podcast',
        actualValueClass: isRecord(listen.podcast) ? 'object' : 'other',
        rule: 'template:listen-podcast',
        remediation: `publication.listen.podcast is invalid: ${problem}.`,
      },
    ]);
  }
  const rest = { ...listen };
  delete rest.podcast;
  return rest;
}

/**
 * The podcast settings when the feed is switched on (`listen.enabled` and
 * `podcast.enabled`).
 *
 * @param {import('../../../types/index.d.ts').PublicationNormalized} publication
 * @returns {PodcastConfig | undefined} the settings, or `undefined`
 */
export function readPodcast(publication) {
  const listen = /** @type {any} */ (publication.listen);
  if (listen?.enabled !== true || listen.podcast?.enabled !== true) {
    return undefined;
  }
  return listen.podcast;
}

/**
 * Hold the cover to the artwork rule, from the media pipeline's own results.
 *
 * @param {PodcastConfig | undefined} podcast the settings
 * @param {object} media the media pipeline's results
 * @param {readonly {path: string}[]} media.mediaAssets
 * @param {Record<string, {width: number, height: number}>} media.mediaDimensions
 *   the pixel size of each image's original, by output path
 * @returns {void}
 * @throws {MediaPipelineError} `MEDIA_FORMAT_INVALID` when the cover is not
 *   admitted
 */
export function assertPodcastCover(podcast, { mediaAssets, mediaDimensions }) {
  if (!podcast) return;
  const hex = podcast.cover.sourceDigest.replace(/^sha256:/, '');
  const prefix = `assets/media/${hex}/original.`;
  const original = mediaAssets.find((asset) => asset.path.startsWith(prefix));
  const reject = (/** @type {string} */ why) => {
    throw new MediaPipelineError(
      'MEDIA_FORMAT_INVALID',
      `the podcast cover ${why}`,
      podcast.cover.path,
    );
  };
  if (!original) reject('was not processed');
  const path = /** @type {{path: string}} */ (original).path;
  if (!/\.(?:png|jpg)$/.test(path)) reject('must be a PNG or JPEG image');
  const size = mediaDimensions[path];
  if (!size || size.width !== size.height) {
    reject(
      `must be square (it is ${size ? `${size.width} x ${size.height}` : 'unmeasured'})`,
    );
  } else if (size.width < COVER_MIN_PIXELS || size.width > COVER_MAX_PIXELS) {
    reject(
      `must be ${COVER_MIN_PIXELS} to ${COVER_MAX_PIXELS} pixels square (it is ${size.width})`,
    );
  }
}
