/**
 * Shared harness for the audience features' tests: build a page the way the
 * renderer does (the real markup functions of `internal/audience.js`, the real
 * JSON sentences) and run the shipped `gala-audience.js` source in JSDOM
 * against a scripted fake API. Nothing here mirrors the script's logic.
 */

import { webcrypto } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { TextEncoder } from 'node:util';

import { JSDOM } from 'jsdom';

import { serializeAudienceMessages } from '../../src/core/internal/audience.js';
import { getMessages } from '../../src/core/internal/messages.js';

export const AUDIENCE_SOURCE = await readFile(
  path.resolve(
    import.meta.dirname,
    '../../src/modules/interactions/browser/gala-audience.js',
  ),
  'utf8',
);

export const PUBLICATION = '0190b1f0-0000-7000-8000-000000000001';
export const AUTHOR = '0190b1f0-0000-7000-8000-0000000000a1';
export const API = 'https://api.galascribe.com';
export const APP = 'https://app.galascribe.com';
export const PAGE = 'https://blog.example/posts/hello/';
export const SESSION_KEY = 'gala.reader.session.' + PUBLICATION;
export const PENDING_KEY = 'gala.reader.pending.' + PUBLICATION;
/**
 * @param {string} [id] the author id (default: the fixture author)
 * @returns {string} the follow path of that author
 */
export function FOLLOW_PATH(id = AUTHOR) {
  return `/v2/public/publications/${PUBLICATION}/authors/${id}/follow`;
}

/** A reader session that has not expired. */
export const SESSION = Object.freeze({
  accessToken: 'reader-token-1',
  expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
  reader: { displayName: 'Rae Reader', initials: 'RR' },
});

/**
 * @param {string} bodyHtml the page's main markup
 * @param {string} [language] the page language (default `en`)
 * @returns {string} a full document carrying the audience script's tags
 */
export function audiencePage(bodyHtml, language = 'en') {
  const messages = serializeAudienceMessages(getMessages(language));
  return (
    `<!doctype html><html lang="${language}"><head>` +
    `<script type="application/json" data-gala-audience-messages>${messages}</script>` +
    `<script src="/assets/gala-audience-v1.js" defer data-gala-audience-script data-api-origin="${API}" data-app-origin="${APP}" data-publication-id="${PUBLICATION}" data-canonical-url="${PAGE}"></script>` +
    `</head><body>${bodyHtml}</body></html>`
  );
}

/**
 * Boot the shipped script in a fresh DOM.
 *
 * @param {string} html the page document
 * @param {object} [options]
 * @param {string} [options.hash] the URL fragment the page loads with
 * @param {Record<string, unknown>} [options.session] stored reader session
 * @param {Record<string, unknown>} [options.pending] stored pending sign-in
 * @param {boolean} [options.blockStorage] make both storages throw
 * @param {number} [options.now] what `performance.now()` reads (ms since load)
 * @param {(call: {url: string, method: string, init: any, body: any, headers: any}) => any} [options.handler]
 *   answers a request with `{status, body}`, or an `Error` to simulate no network
 * @returns {Promise<any>} the harness
 */
export async function bootAudience(html, options = {}) {
  /** @type {any[]} */
  const calls = [];
  /** @type {string[]} */
  const navigations = [];
  /** @type {string[]} */
  const events = [];
  const dom = new JSDOM(html, {
    url: PAGE + (options.hash ?? ''),
    runScripts: 'outside-only',
    pretendToBeVisual: true,
  });
  const { window } = dom;
  Object.defineProperty(window, 'crypto', {
    value: webcrypto,
    configurable: true,
  });
  window.TextEncoder = TextEncoder;
  if (options.session) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(options.session));
  }
  if (options.pending) {
    window.sessionStorage.setItem(PENDING_KEY, JSON.stringify(options.pending));
  }
  if (options.blockStorage) {
    for (const name of ['localStorage', 'sessionStorage']) {
      Object.defineProperty(window, name, {
        configurable: true,
        get() {
          throw new window.DOMException('denied', 'SecurityError');
        },
      });
    }
  }
  const handler = options.handler ?? (() => ({ status: 404, body: {} }));
  window.fetch = (/** @type {string} */ url, /** @type {any} */ init) => {
    const call = {
      url: String(url),
      method: init.method,
      init,
      headers: init.headers ?? {},
      body: init.body === undefined ? undefined : JSON.parse(init.body),
    };
    calls.push(call);
    return Promise.resolve(handler(call)).then((result) => {
      if (result instanceof Error) throw result;
      return {
        ok: result.status >= 200 && result.status < 300,
        status: result.status,
        json: async () => result.body,
      };
    });
  };
  window.document.addEventListener('gala:navigate', (event) => {
    event.preventDefault();
    navigations.push(/** @type {CustomEvent} */ (event).detail.url);
  });
  window.document.addEventListener('gala:reader-session', () => {
    events.push('gala:reader-session');
  });
  if (options.now !== undefined) {
    const now = options.now;
    Object.defineProperty(window.performance, 'now', {
      value: () => now,
      configurable: true,
    });
  }
  window.eval(AUDIENCE_SOURCE);
  const sleep = (/** @type {number} */ ms) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  return {
    window,
    calls,
    navigations,
    events,
    /** @returns {Promise<unknown>} resolves once promises and the 30 ms announcement timers have run */
    settle: () => sleep(90),
    $: (/** @type {string} */ selector) =>
      window.document.querySelector(selector),
    $$: (/** @type {string} */ selector) =>
      Array.from(window.document.querySelectorAll(selector)),
    storage: (/** @type {string} */ key) => window.localStorage.getItem(key),
    pendingRecord: () => {
      const raw = window.sessionStorage.getItem(PENDING_KEY);
      return raw ? JSON.parse(raw) : null;
    },
  };
}

/**
 * A fake API answering by `method path`.
 *
 * @param {Record<string, any>} routes `"GET /v2/..."` to a response or a
 *   function of the call
 * @returns {(call: any) => any} a `handler` for {@link bootAudience}
 */
export function routed(routes) {
  return (call) => {
    const key = `${call.method} ${new URL(call.url).pathname}`;
    const answer = routes[key];
    if (answer === undefined) return { status: 404, body: {} };
    return typeof answer === 'function' ? answer(call) : answer;
  };
}

/**
 * A problem document the way the API answers one.
 *
 * @param {number} status HTTP status
 * @param {string} code problem code
 * @param {{pointer: string, code: string}[]} [errors] field errors
 * @returns {{status: number, body: Record<string, unknown>}}
 */
export function problem(status, code, errors = []) {
  return {
    status,
    body: {
      schemaId: 'urn:gala:schema:problem:2.0.0',
      schemaVersion: '2.0.0',
      type: 'urn:gala:problem:' + code.toLowerCase().replaceAll('_', '-'),
      title: code,
      status,
      code,
      detail: 'See the operation contract.',
      correlationId: '0190b1f0-0000-7000-8000-0000000000ff',
      retryable: status === 429,
      errors,
    },
  };
}
