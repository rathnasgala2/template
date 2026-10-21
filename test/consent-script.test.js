/**
 * The consent script, executed as shipped (`CONSENT_SCRIPT_SOURCE`) in JSDOM.
 */

import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { JSDOM } from 'jsdom';

import {
  CONSENT_SCRIPT_SOURCE,
  CONSENT_STORAGE_KEY,
} from '../src/core/internal/analytics/consent-script.js';
import {
  renderConsentBanner,
  renderConsentOpenItem,
} from '../src/core/internal/analytics/markup.js';
import { ANALYTICS_PROVIDERS } from '../src/core/internal/analytics/providers.js';
import { getMessages } from '../src/core/internal/messages.js';

const ID = 'G-ABC123XYZ';
const LOADER = ANALYTICS_PROVIDERS['google-analytics-4'].loaderUrl(ID);

/**
 * @param {object} [options] setup options
 * @param {string} [options.stored] a raw stored value
 * @param {boolean} [options.throwingStorage] make `localStorage` throw
 * @returns {Promise<import('jsdom').DOMWindow>} the window with the script run
 */
async function run({ stored, throwingStorage = false } = {}) {
  const messages = getMessages('en');
  const banner = renderConsentBanner({
    module: /** @type {any} */ ({
      config: { provider: { kind: 'google-analytics-4', measurementId: ID } },
    }),
    messages,
    publicBasePath: '/',
    routeProfile: 'directory-index',
  });
  const dom = new JSDOM(
    `<!doctype html><html><head></head><body><footer><ul>${renderConsentOpenItem(messages)}</ul></footer>${banner}</body></html>`,
    { runScripts: 'outside-only', url: 'https://fixture.example.test/' },
  );
  const { window } = dom;
  if (window.document.readyState === 'loading') {
    await new Promise((resolve) =>
      window.document.addEventListener('DOMContentLoaded', resolve),
    );
  }
  if (throwingStorage) {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new Error('storage unavailable');
      },
    });
  } else if (stored !== undefined) {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, stored);
  }
  window.eval(CONSENT_SCRIPT_SOURCE);
  return window;
}

/**
 * @param {import('jsdom').DOMWindow} window the window
 * @returns {HTMLElement} the banner
 */
function bannerOf(window) {
  return /** @type {HTMLElement} */ (
    window.document.querySelector('[data-gala-consent]')
  );
}

/**
 * @param {import('jsdom').DOMWindow} window the window
 * @returns {string[]} the `src` of every script in the head
 */
function loaders(window) {
  return [...window.document.head.querySelectorAll('script')].map((s) => s.src);
}

/**
 * @param {import('jsdom').DOMWindow} window the window
 * @returns {any[]} the dataLayer entries as plain JSON values
 */
function dataLayer(window) {
  return JSON.parse(
    JSON.stringify(
      /** @type {any} */ (window).dataLayer.map((/** @type {any} */ entry) => [
        ...entry,
      ]),
    ),
  );
}

/**
 * @param {import('jsdom').DOMWindow} window the window
 * @param {string} selector the element to click
 * @returns {void}
 */
function click(window, selector) {
  /** @type {HTMLElement} */ (window.document.querySelector(selector)).click();
}

test('no stored choice: the banner is revealed and nothing loads', async () => {
  const window = await run();
  assert.equal(bannerOf(window).hasAttribute('hidden'), false);
  assert.deepEqual(loaders(window), []);
  assert.equal(/** @type {any} */ (window).dataLayer, undefined);
  assert.equal(
    window.document.querySelector('.g-consent-open')?.hasAttribute('hidden'),
    false,
  );
});

test('accept stores the choice, hides the banner and loads exactly one loader', async () => {
  const window = await run();
  /** @type {any[]} */
  const events = [];
  window.document.addEventListener('gala:consent', (event) =>
    events.push(JSON.parse(JSON.stringify(/** @type {any} */ (event).detail))),
  );
  click(window, '.g-consent-accept');
  assert.equal(bannerOf(window).hasAttribute('hidden'), true);
  const stored = JSON.parse(
    /** @type {string} */ (window.localStorage.getItem(CONSENT_STORAGE_KEY)),
  );
  assert.equal(stored.version, 1);
  assert.equal(stored.analytics, true);
  assert.match(stored.at, /^\d{4}-\d\d-\d\dT[\d:.]+Z$/);
  assert.deepEqual(loaders(window), [LOADER]);
  const layer = dataLayer(window);
  assert.deepEqual(layer[0], [
    'consent',
    'default',
    {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
    },
  ]);
  assert.deepEqual(layer[1], [
    'consent',
    'update',
    { analytics_storage: 'granted' },
  ]);
  assert.equal(layer[2][0], 'js');
  assert.deepEqual(layer[3], ['config', ID]);
  assert.equal(window.document.head.querySelector('script')?.async, true);
  assert.deepEqual(events, [{ analytics: true }]);
  // Accepting again never adds a second loader.
  click(window, '.g-consent-open');
  click(window, '.g-consent-accept');
  assert.deepEqual(loaders(window), [LOADER]);
});

test('decline stores the choice and appends nothing', async () => {
  const window = await run();
  click(window, '.g-consent-decline');
  assert.equal(bannerOf(window).hasAttribute('hidden'), true);
  assert.equal(
    JSON.parse(
      /** @type {string} */ (window.localStorage.getItem(CONSENT_STORAGE_KEY)),
    ).analytics,
    false,
  );
  assert.deepEqual(loaders(window), []);
  assert.equal(/** @type {any} */ (window).dataLayer, undefined);
});

/**
 * @param {import('jsdom').DOMWindow} window the window
 * @returns {{cancelable: boolean}[]} every `gala:reload`, each prevented
 */
function holdReloads(window) {
  /** @type {{cancelable: boolean}[]} */
  const seen = [];
  window.document.addEventListener('gala:reload', (event) => {
    seen.push({ cancelable: event.cancelable });
    event.preventDefault();
  });
  return seen;
}

test('declining after loading revokes analytics storage', async () => {
  const window = await run();
  holdReloads(window);
  click(window, '.g-consent-accept');
  click(window, '.g-consent-open');
  click(window, '.g-consent-decline');
  const layer = dataLayer(window);
  assert.deepEqual(layer.at(-1), [
    'consent',
    'update',
    { analytics_storage: 'denied' },
  ]);
  assert.deepEqual(loaders(window), [LOADER]);
});

test('a stored accept loads at start without showing the banner; a stored decline does nothing', async () => {
  const accepted = await run({
    stored: JSON.stringify({
      version: 1,
      analytics: true,
      at: '2026-01-01T00:00:00.000Z',
    }),
  });
  assert.equal(bannerOf(accepted).hasAttribute('hidden'), true);
  assert.deepEqual(loaders(accepted), [LOADER]);
  const declined = await run({
    stored: JSON.stringify({
      version: 1,
      analytics: false,
      at: '2026-01-01T00:00:00.000Z',
    }),
  });
  assert.equal(bannerOf(declined).hasAttribute('hidden'), true);
  assert.deepEqual(loaders(declined), []);
  const malformed = await run({ stored: '{"version":2,"analytics":true}' });
  assert.equal(bannerOf(malformed).hasAttribute('hidden'), false);
  assert.deepEqual(loaders(malformed), []);
});

test('the footer button reopens the banner', async () => {
  const window = await run({
    stored: JSON.stringify({
      version: 1,
      analytics: false,
      at: '2026-01-01T00:00:00.000Z',
    }),
  });
  assert.equal(bannerOf(window).hasAttribute('hidden'), true);
  click(window, '.g-consent-open');
  assert.equal(bannerOf(window).hasAttribute('hidden'), false);
});

test('unavailable storage shows the banner and never throws', async () => {
  const window = await run({ throwingStorage: true });
  assert.equal(bannerOf(window).hasAttribute('hidden'), false);
  click(window, '.g-consent-accept');
  assert.deepEqual(loaders(window), [LOADER]);
  assert.equal(bannerOf(window).hasAttribute('hidden'), true);
});

test('the script uses no eval or Function constructor and sets no live cookie', async () => {
  assert.doesNotMatch(CONSENT_SCRIPT_SOURCE, /\beval\s*\(/);
  assert.doesNotMatch(CONSENT_SCRIPT_SOURCE, /new\s+Function/);
  // The only cookie access reads names to expire Google's own cookies and
  // writes them expired; nothing is ever set live.
  const writes =
    CONSENT_SCRIPT_SOURCE.match(/document\.cookie\s*=[^;]*;/g) ?? [];
  assert.equal(writes.length, 2);
  assert.ok(
    writes.every((write) =>
      /^document\.cookie\s*=\s*(expired|expired \+)/.test(write),
    ),
  );
  assert.ok(CONSENT_SCRIPT_SOURCE.includes('expires=Thu, 01 Jan 1970'));
  assert.doesNotMatch(CONSENT_SCRIPT_SOURCE, /innerHTML/);
});

test('declining after loading clears Google cookies and asks for a reload', async () => {
  const window = await run();
  const reloads = holdReloads(window);
  click(window, '.g-consent-accept');
  window.document.cookie = '_ga=GA1.1.1; path=/';
  window.document.cookie = '_ga_ABC123XYZ=GS1.1.1; path=/';
  window.document.cookie = '_ga_PARENT=1; path=/; domain=example.test';
  window.document.cookie = 'keep=1; path=/';
  assert.equal(reloads.length, 0);
  click(window, '.g-consent-open');
  click(window, '.g-consent-decline');
  assert.equal(window.document.cookie, 'keep=1');
  assert.deepEqual(reloads, [{ cancelable: true }]);
  // The provider stays loaded in this window, so declining again reloads again.
  click(window, '.g-consent-open');
  click(window, '.g-consent-decline');
  assert.equal(reloads.length, 2);
});

test('declining before anything loaded neither reloads nor touches cookies', async () => {
  const window = await run();
  const reloads = holdReloads(window);
  window.document.cookie = '_ga=kept; path=/';
  click(window, '.g-consent-decline');
  assert.deepEqual(reloads, []);
  assert.equal(window.document.cookie, '_ga=kept');
});

test('the config call carries no anonymize_ip', async () => {
  const window = await run();
  click(window, '.g-consent-accept');
  const config = dataLayer(window).find((entry) => entry[0] === 'config');
  assert.deepEqual(config, ['config', ID]);
  assert.ok(!CONSENT_SCRIPT_SOURCE.includes('anonymize_ip'));
});

test('the banner takes focus when shown and focus returns to the opener when hidden', async () => {
  const window = await run();
  const { document } = window;
  const banner = bannerOf(window);
  assert.equal(banner.getAttribute('tabindex'), '-1');
  assert.equal(document.activeElement, banner);
  click(window, '.g-consent-decline');
  assert.equal(
    document.activeElement,
    document.querySelector('.g-consent-open'),
  );
  click(window, '.g-consent-open');
  assert.equal(document.activeElement, banner);
  click(window, '.g-consent-accept');
  assert.equal(
    document.activeElement,
    document.querySelector('.g-consent-open'),
  );
});

test('hiding leaves focus alone when there is no visible opener', async () => {
  const window = await run();
  const { document } = window;
  document.querySelector('.g-consent-open')?.setAttribute('hidden', '');
  const other = document.createElement('button');
  document.body.appendChild(other);
  other.focus();
  click(window, '.g-consent-decline');
  assert.equal(document.activeElement, other);
});
