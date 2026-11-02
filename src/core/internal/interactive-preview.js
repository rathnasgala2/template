/**
 * The interactive browser preview (`options.preview.interactive`): the built
 * page's own scripts run inside the App's sandboxed frame. This module turns a
 * built document into that page: it validates the option, inlines every
 * `assets/gala-*.js` script the page carries with the exact text the build
 * writes, adds the template-owned runtime first in `<head>` with its data, and
 * replaces the Content-Security-Policy with one whose `script-src` lists the
 * SHA-256 hash of exactly those inline scripts (no `'unsafe-inline'`, no
 * `'unsafe-eval'`, no `'unsafe-hashes'`).
 *
 * Browser-safe: no `node:` import.
 */

import {
  CONSENT_SCRIPT_PATH,
  CONSENT_SCRIPT_SOURCE,
} from './analytics/consent-script.js';
import {
  APPEARANCE_BOOTSTRAP_SCRIPT_PATH,
  APPEARANCE_STORAGE_KEY,
} from './appearance/contract.js';
import { APPEARANCE_BOOTSTRAP_SCRIPT_SOURCE } from './appearance/bootstrap-script.js';
import { AUDIENCE_SCRIPT_PATH } from './audience.js';
import {
  COUNTS_SCRIPT_PATH,
  INTERACTIONS_SCRIPT_PATH,
} from './interactions.js';
import { LISTEN_SCRIPT_PATH } from './listen.js';
import { PREVIEW_RUNTIME_SOURCE } from './preview-runtime-source.js';
import { PREVIEW_SCRIPT_TEXTS } from './preview-scripts-data.js';
import { sha256Base64 } from './sha256.js';
import { escapeHtml } from './skeleton.js';
import { utf8Bytes } from './utf8.js';

/** The script files the build links, with the exact text it writes. */
const BUILT_SCRIPTS = [
  [APPEARANCE_BOOTSTRAP_SCRIPT_PATH, APPEARANCE_BOOTSTRAP_SCRIPT_SOURCE],
  [INTERACTIONS_SCRIPT_PATH, PREVIEW_SCRIPT_TEXTS.interactions],
  [COUNTS_SCRIPT_PATH, PREVIEW_SCRIPT_TEXTS.counts],
  [AUDIENCE_SCRIPT_PATH, PREVIEW_SCRIPT_TEXTS.audience],
  [LISTEN_SCRIPT_PATH, PREVIEW_SCRIPT_TEXTS.listen],
  [CONSENT_SCRIPT_PATH, CONSENT_SCRIPT_SOURCE],
];

/** @type {readonly string[]} the option's keys */
export const INTERACTIVE_KEYS = ['apiOrigin', 'liveBaseUrl', 'scrollY'];

/**
 * @param {unknown} value a candidate absolute http(s) URL
 * @returns {URL | undefined} the parsed URL, or undefined when it is not one
 */
function httpUrl(value) {
  if (typeof value !== 'string') return undefined;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:'
      ? url
      : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Check `options.preview.interactive` and its exclusions.
 *
 * @param {any} preview the `options.preview` object
 * @param {(ok: boolean, what: string) => void} need records a failed check
 * @returns {void}
 */
export function validateInteractive(preview, need) {
  const interactive = preview.interactive;
  if (interactive === undefined) return;
  need(
    typeof interactive === 'object' &&
      interactive !== null &&
      !Array.isArray(interactive),
    'options.preview.interactive must be an object',
  );
  if (typeof interactive !== 'object' || interactive === null) return;
  for (const key of Object.keys(interactive)) {
    need(
      INTERACTIVE_KEYS.includes(key),
      `options.preview.interactive.${key} is not an interactive option`,
    );
  }
  need(
    httpUrl(interactive.apiOrigin) !== undefined,
    'options.preview.interactive.apiOrigin must be an absolute http(s) URL',
  );
  need(
    interactive.liveBaseUrl === undefined ||
      interactive.liveBaseUrl === null ||
      httpUrl(interactive.liveBaseUrl) !== undefined,
    'options.preview.interactive.liveBaseUrl must be an absolute http(s) URL or null',
  );
  need(
    interactive.scrollY === undefined ||
      (typeof interactive.scrollY === 'number' &&
        Number.isFinite(interactive.scrollY) &&
        interactive.scrollY >= 0),
    'options.preview.interactive.scrollY must be a number of pixels, 0 or more',
  );
  need(
    !preview.omitScripts,
    'options.preview.interactive cannot be combined with omitScripts',
  );
  need(
    !preview.inertLinks,
    'options.preview.interactive cannot be combined with inertLinks',
  );
  need(
    preview.contentSecurityPolicy === undefined,
    'options.preview.interactive builds its own contentSecurityPolicy; do not pass one',
  );
  need(
    preview.inlineStyles !== false,
    'options.preview.interactive needs inlineStyles (the frame cannot load stylesheets)',
  );
}

/**
 * @param {string} text the text of one inline script
 * @returns {string} its CSP source expression
 */
function hashSource(text) {
  return `'sha256-${sha256Base64(utf8Bytes(text))}'`;
}

/**
 * The preview's Content-Security-Policy: scripts are exactly the listed inline
 * texts, by hash; the network reaches the API origin only; media loads from
 * the live site only.
 *
 * @param {readonly string[]} scriptTexts the text of every inline script
 * @param {{apiOrigin: string, liveBaseUrl?: string | null}} interactive the option
 * @returns {string} the policy
 */
export function interactivePolicy(scriptTexts, interactive) {
  const liveOrigin = interactive.liveBaseUrl
    ? new URL(interactive.liveBaseUrl).origin
    : '';
  const api = new URL(interactive.apiOrigin).origin;
  return [
    "default-src 'none'",
    `script-src ${scriptTexts.map(hashSource).join(' ')}`,
    "style-src 'unsafe-inline'",
    'img-src data:',
    `media-src data:${liveOrigin ? ` ${liveOrigin}` : ''}`,
    `connect-src ${api}`,
    'font-src data:',
    "frame-src 'none'",
    "form-action 'none'",
    "base-uri 'none'",
  ].join('; ');
}

/**
 * @param {unknown} value any JSON value
 * @returns {string} JSON safe inside a `<script>` element
 */
function scriptJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

/**
 * Turn a built document into its interactive preview.
 *
 * @param {object} args
 * @param {string} args.html the built document (as `renderDocumentShell` wrote it)
 * @param {string} args.cspMetaTag the document's built CSP `<meta>` element
 * @param {{apiOrigin: string, liveBaseUrl?: string | null, scrollY?: number}} args.interactive the option
 * @param {string} args.siteBase the site's `baseUrl`
 * @param {{notSaved: string, signInUnavailable: string, notPublished: string, audioUnavailable: string}} args.messages the toast and notice sentences
 * @param {string} args.searchIndex the search index JSON text
 * @param {'light' | 'dark' | undefined} args.colorMode a fixed colour mode
 * @returns {string} the interactive document
 */
export function makeInteractive({
  html,
  cspMetaTag,
  interactive,
  siteBase,
  messages,
  searchIndex,
  colorMode,
}) {
  const headEnd = html.indexOf('</head>');
  if (headEnd < 0 || !html.includes(cspMetaTag)) {
    throw new Error('the document shell no longer has the expected head');
  }
  /** @type {string[]} */
  const inlineTexts = [PREVIEW_RUNTIME_SOURCE];
  /** @type {string[]} */
  const trailing = [];
  const head = html
    .slice(0, headEnd)
    .replace(
      /<script src="([^"]*)"([^>]*)><\/script>/g,
      (_whole, href, rest) => {
        const built = BUILT_SCRIPTS.find(([path]) => href.endsWith(`/${path}`));
        if (!built) {
          throw new Error(`the page links an unknown script: ${href}`);
        }
        const text = built[1];
        if (/<\/script|<!--/i.test(text)) {
          throw new Error(`${built[0]} cannot be inlined in a <script>`);
        }
        inlineTexts.push(text);
        if (built[0] === APPEARANCE_BOOTSTRAP_SCRIPT_PATH) {
          return `<script${rest}>${text}</script>`;
        }
        // Deferred scripts run after parsing, in order: end of body does too.
        trailing.push(
          `<script${rest.replace(/\sdefer(?=\s|$)/, '')}>${text}</script>`,
        );
        return '';
      },
    );
  const data = {
    apiOrigin: new URL(interactive.apiOrigin).origin,
    liveBaseUrl: interactive.liveBaseUrl ?? null,
    scrollY: interactive.scrollY ?? 0,
    siteBase,
    messages,
    searchIndex,
    seed: colorMode ? { [APPEARANCE_STORAGE_KEY]: colorMode } : {},
  };
  const policy = interactivePolicy(inlineTexts, interactive);
  const first =
    `<meta http-equiv="Content-Security-Policy" content="${escapeHtml(policy)}">` +
    `<script type="application/json" data-gala-preview-data>${scriptJson(data)}</script>` +
    `<script>${PREVIEW_RUNTIME_SOURCE}</script>`;
  const headHtml = head.replace(cspMetaTag, () => first);
  const rest = html.slice(headEnd);
  const bodyEnd = rest.lastIndexOf('</body>');
  return `${headHtml}${rest.slice(0, bodyEnd)}${trailing.join('')}${rest.slice(bodyEnd)}`;
}
