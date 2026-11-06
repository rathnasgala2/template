/**
 * The reading-signals script (`gala-signals.js`): the shipped source runs in
 * JSDOM against the interactions root. A signed-in reader's view, scroll depth
 * and visible time go to `POST /v2/reader/signals` in one envelope with the
 * bearer token; a visitor without a session, a page without the root, a
 * refused envelope (consent, Today off, a lost token) and a quiet hour all
 * send nothing.
 */

import { strict as assert } from 'node:assert';
import { webcrypto } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { after, test } from 'node:test';

import { JSDOM } from 'jsdom';

const SOURCE = await readFile(
  path.resolve(
    import.meta.dirname,
    '../src/modules/interactions/browser/gala-signals.js',
  ),
  'utf8',
);

/** @type {any[]} */
const windows = [];
after(() => {
  for (const window of windows) window.close();
});

const API = 'https://api.galascribe.com';
const PUBLICATION = '0190b1f0-0000-7000-8000-000000000001';
const CONTENT = '0190b1f0-0000-7000-8000-0000000000c1';
const ITEM = '0190b1f0-0000-7000-8000-0000000000d1';
const PAGE = 'https://blog.example/posts/hello/';
const SESSION_KEY = 'gala.reader.session.' + PUBLICATION;
const OFF_KEY = 'gala.signals.off.' + PUBLICATION;
const SESSION = {
  accessToken: 'reader-token-1',
  expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
};
const ROOT = `<section data-gala-interactions data-api-origin="${API}" data-publication-id="${PUBLICATION}" data-content-id="${CONTENT}"></section>`;

/**
 * @param {object} [options]
 * @param {string} [options.markup]
 * @param {Record<string, unknown> | null} [options.session]
 * @param {string} [options.search]
 * @param {number} [options.quietUntil]
 * @param {(call: any) => any} [options.handler]
 * @returns {{window: any, calls: any[], flushes: () => Promise<void>}} the booted page
 */
function boot(options = {}) {
  const dom = new JSDOM(
    `<!doctype html><html><body><article><p>Hello</p></article>${options.markup ?? ROOT}</body></html>`,
    {
      url: PAGE + (options.search ?? ''),
      runScripts: 'outside-only',
      pretendToBeVisual: true,
    },
  );
  const { window } = dom;
  Object.defineProperty(window, 'crypto', {
    value: webcrypto,
    configurable: true,
  });
  if (options.session !== null) {
    window.localStorage.setItem(
      SESSION_KEY,
      JSON.stringify(options.session ?? SESSION),
    );
  }
  if (options.quietUntil !== undefined) {
    window.sessionStorage.setItem(OFF_KEY, String(options.quietUntil));
  }
  /** @type {any[]} */
  const calls = [];
  /** @type {Promise<void>[]} */
  const pending = [];
  const handler = options.handler ?? (() => ({ status: 202 }));
  window.fetch = (/** @type {string} */ url, /** @type {any} */ init) => {
    const call = {
      url: String(url),
      method: init.method,
      headers: init.headers,
      keepalive: init.keepalive,
      credentials: init.credentials,
      body: JSON.parse(init.body),
    };
    calls.push(call);
    const answer = handler(call);
    const promise =
      answer instanceof Error
        ? Promise.reject(answer)
        : Promise.resolve({ status: answer.status });
    pending.push(
      promise.then(
        () => undefined,
        () => undefined,
      ),
    );
    return promise;
  };
  const el = window.document.documentElement;
  Object.defineProperty(el, 'scrollHeight', {
    value: 4000,
    configurable: true,
  });
  Object.defineProperty(el, 'clientHeight', {
    value: 1000,
    configurable: true,
  });
  let top = 0;
  Object.defineProperty(el, 'scrollTop', {
    get: () => top,
    set: (value) => {
      top = value;
    },
    configurable: true,
  });
  window.requestAnimationFrame = (/** @type {Function} */ fn) => {
    fn(0);
    return 1;
  };
  window.eval(SOURCE);
  windows.push(window);
  return {
    window,
    calls,
    flushes: async () => {
      await Promise.all(pending);
      await new Promise((resolve) => setTimeout(resolve, 0));
    },
  };
}

/**
 * @param {any} window
 */
function leave(window) {
  window.dispatchEvent(new window.Event('pagehide'));
}

test('a signed-in reader: view, the deepest scroll reached and the visible seconds go in one envelope on leaving, with the token', async () => {
  const h = boot();
  const base = Date.now();
  h.window.Date.now = () => base + 31_000;
  h.window.document.documentElement.scrollTop = 1200; // 55 %
  h.window.dispatchEvent(new h.window.Event('scroll'));
  h.window.document.documentElement.scrollTop = 600; // back up: nothing new
  h.window.dispatchEvent(new h.window.Event('scroll'));
  assert.equal(h.calls.length, 0, 'nothing sent before a flush');
  leave(h.window);
  await h.flushes();
  assert.equal(h.calls.length, 1);
  const call = h.calls[0];
  assert.equal(call.url, API + '/v2/reader/signals');
  assert.equal(call.method, 'POST');
  assert.equal(call.headers.Authorization, 'Bearer reader-token-1');
  assert.equal(call.credentials, 'omit');
  assert.equal(call.keepalive, true);
  assert.match(call.body.batchId, /^[0-9a-f-]{36}$/u);
  const kinds = call.body.events.map((/** @type {any} */ e) => e.kind);
  assert.deepEqual(kinds, ['VIEW', 'SCROLL', 'DWELL']);
  for (const event of call.body.events) {
    assert.match(event.eventId, /^[0-9a-f-]{36}$/u);
    assert.equal(event.contentId, CONTENT);
    assert.equal(event.publicationId, PUBLICATION);
    assert.equal(event.itemId, null);
    assert.ok(Number.isFinite(Date.parse(event.at)));
  }
  assert.equal(call.body.events[1].scrollPercent, 50);
  assert.equal(call.body.events[2].dwellSeconds, 31);
  // A second leave with nothing new says nothing.
  leave(h.window);
  await h.flushes();
  assert.equal(h.calls.length, 1);
});

test('an open from a Today card carries the item id, and the end of the page reads 100', async () => {
  const h = boot({ search: `?gala-item=${ITEM}` });
  h.window.document.documentElement.scrollTop = 3000;
  h.window.dispatchEvent(new h.window.Event('scroll'));
  leave(h.window);
  await h.flushes();
  const events = h.calls[0].body.events;
  assert.deepEqual(
    events.map((/** @type {any} */ e) => [e.kind, e.itemId, e.scrollPercent]),
    [
      ['VIEW', null, null],
      ['OPEN', ITEM, null],
      ['SCROLL', null, 100],
    ],
  );
});

test('a malformed item id is ignored, and a hidden page flushes what it has', async () => {
  const h = boot({ search: '?gala-item=<x>' });
  Object.defineProperty(h.window.document, 'visibilityState', {
    value: 'hidden',
    configurable: true,
  });
  h.window.document.dispatchEvent(new h.window.Event('visibilitychange'));
  await h.flushes();
  assert.equal(h.calls.length, 1);
  assert.deepEqual(
    h.calls[0].body.events.map((/** @type {any} */ e) => e.kind),
    ['VIEW'],
  );
});

test('sends nothing without a reader session, with an expired one, or without the root', async () => {
  for (const options of [
    { session: null },
    { session: { accessToken: 'x', expiresAt: '2020-01-01T00:00:00Z' } },
    { session: { expiresAt: SESSION.expiresAt } },
    { markup: '<section data-gala-interactions></section>' },
    { markup: '' },
  ]) {
    const h = boot(options);
    h.window.dispatchEvent(new h.window.Event('scroll'));
    leave(h.window);
    await h.flushes();
    assert.equal(h.calls.length, 0, JSON.stringify(options));
  }
});

test('a refusal (consent, Today off, a lost token) stops the page and keeps the site quiet for an hour', async () => {
  for (const status of [403, 404, 401]) {
    const h = boot({ handler: () => ({ status }) });
    leave(h.window);
    await h.flushes();
    assert.equal(h.calls.length, 1, String(status));
    const until = Number(h.window.sessionStorage.getItem(OFF_KEY));
    assert.ok(until > Date.now() + 55 * 60 * 1000, String(status));
    h.window.document.documentElement.scrollTop = 3000;
    h.window.dispatchEvent(new h.window.Event('scroll'));
    leave(h.window);
    await h.flushes();
    assert.equal(h.calls.length, 1, `${status}: nothing more`);
  }
  const quiet = boot({ quietUntil: Date.now() + 10_000 });
  leave(quiet.window);
  await quiet.flushes();
  assert.equal(quiet.calls.length, 0, 'the quiet hour holds');
  const over = boot({ quietUntil: Date.now() - 10 });
  leave(over.window);
  await over.flushes();
  assert.equal(over.calls.length, 1, 'a past quiet hour is over');
});

test('a failed envelope is said again with the next one, never twice on success', async () => {
  let attempt = 0;
  const h = boot({
    handler: () => {
      attempt += 1;
      if (attempt === 1) return new TypeError('Failed to fetch');
      if (attempt === 2) return { status: 503 };
      return { status: 202 };
    },
  });
  leave(h.window);
  await h.flushes();
  leave(h.window);
  await h.flushes();
  h.window.document.documentElement.scrollTop = 3000;
  h.window.dispatchEvent(new h.window.Event('scroll'));
  leave(h.window);
  await h.flushes();
  assert.equal(h.calls.length, 3);
  const first = h.calls[0].body.events.map((/** @type {any} */ e) => e.eventId);
  const second = h.calls[1].body.events.map(
    (/** @type {any} */ e) => e.eventId,
  );
  const third = h.calls[2].body.events;
  assert.deepEqual(second, first, 'the same events, the same ids');
  assert.equal(third.length, 2);
  assert.equal(third[0].eventId, first[0]);
  assert.equal(third[1].kind, 'SCROLL');
  assert.notEqual(h.calls[0].body.batchId, h.calls[1].body.batchId);
  leave(h.window);
  await h.flushes();
  assert.equal(h.calls.length, 3, 'nothing left to say');
});

test('the script writes nothing to the page and makes no other request', () => {
  const code = SOURCE.replace(/\/\*[\s\S]*?\*\//gu, '').replace(
    /^\s*\/\/.*$/gmu,
    '',
  );
  assert.ok(
    !/innerHTML|document\.write|cookie|sendBeacon|XMLHttpRequest/u.test(code),
  );
  assert.equal((SOURCE.match(/fetch\(/gu) || []).length, 1);
});
