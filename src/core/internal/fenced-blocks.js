/**
 * Fenced blocks: the `video`, `bookmark` and `file` fence info strings.
 *
 * A fenced block's body is `key: value` lines. The markdown pipeline
 * (`content-security.js`) hands each fence here; when the info string names a
 * block and the body is well formed this returns one `<figure>` card (only
 * tags and attributes the render policy admits: `figure[class,
 * data-gala-block, data-gala-video]`, `a[href]`, `img[src, alt]`, `strong`,
 * `small`, `em`), and otherwise `undefined`, which leaves the fence an
 * ordinary code block. A malformed block never breaks the page.
 *
 * Grammar (also in the README, "Fenced blocks"):
 *
 * - one `key: value` per line; the value is the rest of the line, trimmed
 *   (no quoting); blank lines are ignored; a keys is case-insensitive;
 * - a key the block does not know is ignored; a repeated key, a line that is
 *   not `key: value`, a missing required key or an invalid value makes the
 *   block malformed;
 * - text values: title up to 200, description up to 500, site up to 100
 *   characters, no control characters.
 *
 * Nothing here is localized: the card's own sentences ("Watch on YouTube",
 * "Download PDF (1.2 MB)") and the file's size come at render time
 * (`content-blocks.js`), because the body is stored once for every language.
 */

import { FENCED_BLOCKS, VIDEO_PROVIDERS } from './render-policy-content.js';
import { escapeHtml } from './skeleton.js';

const LINE = /^([A-Za-z][A-Za-z0-9_-]*)[ \t]*:[ \t]*(.*)$/;
// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u001f\u007f]/;
const IMAGE_PATH = /\.(?:png|jpe?g|webp|avif|gif)$/i;
const PDF_PATH = /\.pdf$/i;

/** The longest value of each text key, in characters. */
const TEXT_LIMITS = Object.freeze({ title: 200, description: 500, site: 100 });

/**
 * @param {string} body a fence's text
 * @returns {Map<string, string> | undefined} the lower-cased keys with their
 *   trimmed values, or `undefined` when a line is not `key: value` or a key
 *   repeats
 */
function parseKeyValues(body) {
  /** @type {Map<string, string>} */
  const values = new Map();
  for (const raw of body.split('\n')) {
    const line = raw.trim();
    if (line === '') continue;
    const match = LINE.exec(line);
    if (!match) return undefined;
    const key = match[1].toLowerCase();
    if (values.has(key)) return undefined;
    values.set(key, match[2].trim());
  }
  return values;
}

/**
 * @param {string | undefined} value a text value
 * @param {number} limit the most characters
 * @returns {boolean} whether it is 1 to `limit` characters with no control
 *   character
 */
function validText(value, limit) {
  return (
    value !== undefined &&
    value !== '' &&
    !CONTROL.test(value) &&
    [...value].length <= limit
  );
}

/**
 * A repository-relative file path, by the rule body images use: no scheme, no
 * `//`, no query, fragment or backslash, no empty, `.` or `..` segment (after
 * one leading `/` or `./`).
 *
 * @param {string | undefined} value the candidate path
 * @param {RegExp} extension the extensions the block admits
 * @returns {boolean} whether it is admitted
 */
function validRepositoryPath(value, extension) {
  if (
    value === undefined ||
    value === '' ||
    CONTROL.test(value) ||
    value.startsWith('//') ||
    /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value) ||
    /[?#\\]/.test(value) ||
    !extension.test(value)
  ) {
    return false;
  }
  const relative = value.startsWith('/')
    ? value.slice(1)
    : value.startsWith('./')
      ? value.slice(2)
      : value;
  return !relative.split('/').some((s) => ['', '.', '..'].includes(s));
}

/**
 * @param {string | undefined} value the candidate URL
 * @returns {URL | undefined} the parsed `http(s)` URL without credentials
 */
function webUrl(value) {
  if (value === undefined || !/^https?:\/\//i.test(value)) return undefined;
  if (CONTROL.test(value) || /\s/.test(value)) return undefined;
  try {
    const url = new URL(value);
    return url.username === '' && url.password === '' ? url : undefined;
  } catch {
    return undefined;
  }
}

/**
 * @param {Map<string, string>} values the parsed keys
 * @param {{required: readonly string[]}} block the block's catalog entry
 * @returns {boolean} whether every required key is present
 */
function hasRequired(values, block) {
  return block.required.every((key) => values.has(key));
}

/**
 * The `<strong>` title and optional `<small>` description every card shares.
 *
 * @param {Map<string, string>} values the parsed keys
 * @returns {string | undefined} the markup, or `undefined` when a text value
 *   is invalid
 */
function titleAndDescription(values) {
  const title = values.get('title');
  const description = values.get('description');
  if (!validText(title, TEXT_LIMITS.title)) return undefined;
  if (
    description !== undefined &&
    !validText(description, TEXT_LIMITS.description)
  ) {
    return undefined;
  }
  return (
    `<strong>${escapeHtml(/** @type {string} */ (title))}</strong>` +
    (description === undefined
      ? ''
      : `<small>${escapeHtml(description)}</small>`)
  );
}

/**
 * @param {string} name the block name
 * @param {string} attributes extra figure attributes, with a leading space
 * @param {string} inner the figure's content
 * @returns {string} the figure
 */
function figure(name, attributes, inner) {
  return `<figure class="${FENCED_BLOCKS[name].className}" data-gala-block="${name}"${attributes}>${inner}</figure>\n`;
}

/**
 * @param {Map<string, string>} values the parsed keys
 * @param {(url: string) => string} normalizeLink markdown-it's link encoder
 * @returns {string | undefined} the `video` block's markup
 */
function videoBlock(values, normalizeLink) {
  if (!hasRequired(values, FENCED_BLOCKS.video)) return undefined;
  const provider = VIDEO_PROVIDERS[values.get('provider')?.toLowerCase() ?? ''];
  const id = values.get('id') ?? '';
  const poster = values.get('poster');
  const text = titleAndDescription(
    new Map([['title', values.get('title') ?? '']]),
  );
  if (
    !provider ||
    !provider.idPattern.test(id) ||
    text === undefined ||
    (poster !== undefined && !validRepositoryPath(poster, IMAGE_PATH))
  ) {
    return undefined;
  }
  const providerName = /** @type {string} */ (
    values.get('provider')
  ).toLowerCase();
  const image =
    poster === undefined
      ? ''
      : `<img src="${escapeHtml(normalizeLink(poster))}" alt="">`;
  return figure(
    'video',
    ` data-gala-video="${providerName}:${id}"`,
    `<a href="${escapeHtml(provider.watchUrl(id))}">${image}${text}</a>`,
  );
}

/**
 * @param {Map<string, string>} values the parsed keys
 * @returns {string | undefined} the `bookmark` block's markup
 */
function bookmarkBlock(values) {
  if (!hasRequired(values, FENCED_BLOCKS.bookmark)) return undefined;
  const url = webUrl(values.get('url'));
  const text = titleAndDescription(values);
  const site =
    values.get('site') ?? (url ? url.hostname.replace(/^www\./, '') : '');
  if (!url || text === undefined || !validText(site, TEXT_LIMITS.site)) {
    return undefined;
  }
  return figure(
    'bookmark',
    '',
    `<a href="${escapeHtml(url.href)}">${text}<em>${escapeHtml(site)}</em></a>`,
  );
}

/**
 * @param {Map<string, string>} values the parsed keys
 * @param {(url: string) => string} normalizeLink markdown-it's link encoder
 * @returns {string | undefined} the `file` block's markup
 */
function fileBlock(values, normalizeLink) {
  if (!hasRequired(values, FENCED_BLOCKS.file)) return undefined;
  const path = values.get('path');
  const text = titleAndDescription(values);
  if (!validRepositoryPath(path, PDF_PATH) || text === undefined) {
    return undefined;
  }
  return figure(
    'file',
    '',
    `<a href="${escapeHtml(normalizeLink(/** @type {string} */ (path)))}">${text}</a>`,
  );
}

/**
 * Render one fence as a block card.
 *
 * @param {string} name the fence's first info word
 * @param {string} body the fence's text
 * @param {(url: string) => string} normalizeLink markdown-it's link encoder,
 *   so a poster or file path is encoded exactly like a Markdown image's
 * @returns {string | undefined} the card markup, or `undefined` when the
 *   fence is not a block or is malformed (it then renders as a code block)
 */
export function renderFencedBlock(name, body, normalizeLink) {
  if (!Object.hasOwn(FENCED_BLOCKS, name)) return undefined;
  const values = parseKeyValues(body);
  if (values === undefined) return undefined;
  if (name === 'video') return videoBlock(values, normalizeLink);
  if (name === 'bookmark') return bookmarkBlock(values);
  return fileBlock(values, normalizeLink);
}
