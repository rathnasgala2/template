/**
 * The poll behaviour of the interactions script (`gala-interactions.js`): the
 * shipped source runs in JSDOM against a scripted API and a rendered poll.
 * Options become buttons, a vote is one PUT, results show after a vote, a
 * signed-out reader is sent to sign in, and every failure leaves the list.
 */

import { strict as assert } from 'node:assert';
import { webcrypto } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';
import { TextEncoder } from 'node:util';

import { JSDOM } from 'jsdom';

import { normalizeAuthoredMarkdown } from '../src/core/internal/content-security.js';

const SOURCE = await readFile(
  path.resolve(
    import.meta.dirname,
    '../src/modules/interactions/browser/gala-interactions.js',
  ),
  'utf8',
);

const PUBLICATION = '0190b1f0-0000-7000-8000-000000000001';
const CONTENT = '0190b1f0-0000-7000-8000-000000000002';
const API = 'https://api.galascribe.com';
const PAGE = 'https://blog.example/posts/hello/';
const SESSION_KEY = 'gala.reader.session.' + PUBLICATION;
const POLLS_URL = `${API}/v2/public/publications/${PUBLICATION}/contents/${CONTENT}/polls`;
const SIGNED_IN = {
  accessToken: 'tok-123',
  expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
  reader: { displayName: 'Ana Lima', initials: 'AL' },
};

const POLL = normalizeAuthoredMarkdown(
  '```poll\nid: best-day\nquestion: Which day?\noption1: Monday\noption2: Friday\noption3: Sunday\n```\n',
).html;

const LABELS = JSON.stringify({
  total: 'Votes: {n}',
  yourVote: 'Yours',
  changeHint: 'Pick again to change.',
  saved: 'Vote saved.',
});

/**
 * @param {object} [options] harness options
 * @returns {Promise<any>} the harness
 */
async function boot(options = {}) {
  const calls = /** @type {any[]} */ ([]);
  const navigations = /** @type {string[]} */ ([]);
  const dom = new JSDOM(
    `<!doctype html><body><article>${options.body ?? POLL}</article>
<section class="g-interactions" id="comments" data-gala-interactions data-api-origin="${API}"
  data-app-origin="https://app.galascribe.com" data-publication-id="${PUBLICATION}" data-content-id="${CONTENT}"
  data-canonical-url="${PAGE}" data-poll-labels='${LABELS}' data-reactions-enabled="false" data-comments-enabled="false">
  <div class="g-interactions__status" role="status" data-gala-status></div></section></body>`,
    { url: PAGE, runScripts: 'outside-only', pretendToBeVisual: true },
  );
  const { window } = dom;
  Object.defineProperty(window, 'crypto', {
    value: webcrypto,
    configurable: true,
  });
  window.TextEncoder = TextEncoder;
  if (options.session) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(options.session));
  }
  window.fetch = (/** @type {any} */ url, /** @type {any} */ init) => {
    const call = { url: String(url), init, method: init.method };
    calls.push(call);
    return Promise.resolve(options.handler(call)).then((result) => {
      if (result instanceof Error) throw result;
      return {
        ok: result.status >= 200 && result.status < 300,
        status: result.status,
        json: async () => result.body,
      };
    });
  };
  window.document
    .querySelector('[data-gala-interactions]')
    ?.addEventListener('gala:navigate', (/** @type {any} */ event) => {
      event.preventDefault();
      navigations.push(event.detail.url);
    });
  window.eval(SOURCE);
  const $ = (/** @type {string} */ s) => window.document.querySelector(s);
  const $$ = (/** @type {string} */ s) =>
    Array.from(window.document.querySelectorAll(s));
  return {
    window,
    calls,
    navigations,
    $,
    $$,
    status: () => $('[data-gala-status]')?.textContent ?? '',
    async waitFor(/** @type {() => boolean} */ predicate, label = 'condition') {
      for (let i = 0; i < 200; i += 1) {
        if (predicate()) return;
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      throw new Error('timed out waiting for ' + label);
    },
  };
}

const handler =
  (/** @type {Record<string, any>} */ routes = {}) =>
  (/** @type {any} */ call) => {
    const key = `${call.method} ${call.url.endsWith('/polls') ? 'polls' : 'vote'}`;
    if (key in routes) {
      const value = routes[key];
      return typeof value === 'function' ? value(call) : value;
    }
    return { status: 200, body: { polls: [] } };
  };

test('the options become buttons after one read of the page polls', async () => {
  const h = await boot({ handler: handler() });
  await h.waitFor(() => h.$$('button.g-poll__option').length === 3, 'buttons');
  const reads = h.calls.filter((c) => c.url === POLLS_URL);
  assert.equal(reads.length, 1);
  assert.equal(reads[0].method, 'GET');
  assert.equal(reads[0].init.headers.Authorization, undefined);
  assert.deepEqual(
    h.$$('button.g-poll__option .g-poll__text').map((n) => n.textContent),
    ['Monday', 'Friday', 'Sunday'],
  );
  assert.equal(h.$('.g-poll__percent')?.textContent, '', 'no results yet');
  assert.ok(h.$('figure.g-poll')?.hasAttribute('data-gala-poll-live'));
});

test('a signed-in reader who has voted sees the results, the total and their choice', async () => {
  const h = await boot({
    session: SIGNED_IN,
    handler: handler({
      'GET polls': {
        status: 200,
        body: {
          polls: [
            {
              pollId: 'best-day',
              total: 8,
              options: [
                { index: 0, count: 2 },
                { index: 1, count: 6 },
              ],
              myOption: 1,
            },
          ],
        },
      },
    }),
  });
  await h.waitFor(() => h.$$('.g-poll__percent')[1]?.textContent === '75%');
  assert.equal(
    h.calls.find((c) => c.url === POLLS_URL).init.headers.Authorization,
    'Bearer tok-123',
  );
  assert.deepEqual(
    h.$$('.g-poll__percent').map((n) => n.textContent),
    ['25%', '75%', '0%'],
  );
  assert.deepEqual(
    h.$$('button.g-poll__option').map((n) => n.getAttribute('aria-pressed')),
    ['false', 'true', 'false'],
  );
  assert.equal(
    h.$('.g-poll__meta')?.textContent,
    'Votes: 8 · Pick again to change.',
  );
  assert.equal(h.$$('.g-poll__bar')[1].style.getPropertyValue('width'), '75%');
});

test('a vote is one PUT with the option; the answer shows, the change repeats it', async () => {
  const h = await boot({
    session: SIGNED_IN,
    handler: handler({
      'PUT vote': (/** @type {any} */ call) => {
        const option = JSON.parse(call.init.body).option;
        return {
          status: 200,
          body: {
            pollId: 'best-day',
            total: 4,
            options: [
              { index: 0, count: option === 0 ? 3 : 1 },
              { index: 1, count: option === 1 ? 3 : 1 },
            ],
            myOption: option,
          },
        };
      },
    }),
  });
  await h.waitFor(() => h.$$('button.g-poll__option').length === 3);
  h.$$('button.g-poll__option')[0].click();
  await h.waitFor(() => h.$$('.g-poll__percent')[0].textContent === '75%');
  const put = h.calls.find((c) => c.method === 'PUT');
  assert.equal(
    put.url,
    `${POLLS_URL}/best-day/vote`,
    'the vote goes to the poll',
  );
  assert.equal(put.init.headers.Authorization, 'Bearer tok-123');
  assert.equal(put.init.headers['Content-Type'], 'application/json');
  assert.deepEqual(JSON.parse(put.init.body), { option: 0 });
  await h.waitFor(() => h.status() === 'Vote saved.', 'announcement');
  h.$$('button.g-poll__option')[1].click();
  await h.waitFor(() => h.$$('.g-poll__percent')[1].textContent === '75%');
  assert.deepEqual(
    h.calls.filter((c) => c.method === 'PUT').map((c) => c.init.body),
    ['{"option":0}', '{"option":1}'],
  );
});

test('a signed-out click starts sign-in with the vote as the intent and sends no vote', async () => {
  const h = await boot({ handler: handler() });
  await h.waitFor(() => h.$$('button.g-poll__option').length === 3);
  h.$$('button.g-poll__option')[2].click();
  await h.waitFor(() => h.navigations.length === 1, 'navigation');
  assert.equal(
    new URL(h.navigations[0]).origin + new URL(h.navigations[0]).pathname,
    'https://app.galascribe.com/reader/connect',
  );
  const pending = JSON.parse(
    h.window.sessionStorage.getItem('gala.reader.pending.' + PUBLICATION) ??
      '{}',
  );
  assert.deepEqual(pending.intent, {
    kind: 'poll',
    pollId: 'best-day',
    option: 2,
  });
  assert.equal(h.calls.filter((c) => c.method === 'PUT').length, 0);
});

test('a refused vote says why and leaves the poll as it was', async () => {
  const cases = [
    [{ status: 429, body: { code: 'RATE_LIMITED' } }, /posting too quickly/],
    [{ status: 403, body: { code: 'COMMENTS_CLOSED' } }, /closed/],
    [new Error('offline'), /reach Galascribe/],
    [{ status: 500, body: { code: 'INTERNAL' } }, /Something went wrong/],
  ];
  for (const [result, sentence] of cases) {
    const h = await boot({
      session: SIGNED_IN,
      handler: handler({ 'PUT vote': result }),
    });
    await h.waitFor(() => h.$$('button.g-poll__option').length === 3);
    h.$$('button.g-poll__option')[0].click();
    await h.waitFor(() => sentence.test(h.status()), String(sentence));
    assert.deepEqual(
      h.$$('.g-poll__percent').map((n) => n.textContent),
      ['', '', ''],
    );
    assert.equal(h.$$('button.g-poll__option')[0].disabled, false);
  }
});

test('when the read fails the static list stays and the live region says why', async () => {
  const h = await boot({
    handler: handler({ 'GET polls': { status: 429, body: {} } }),
  });
  await h.waitFor(() => /posting too quickly/.test(h.status()));
  assert.equal(h.$$('button.g-poll__option').length, 0);
  assert.equal(h.$$('li[data-gala-option]').length, 3);
});

test('a page without a poll makes no poll request', async () => {
  const h = await boot({ body: '<p>No poll here.</p>', handler: handler() });
  await new Promise((resolve) => setTimeout(resolve, 80));
  assert.equal(h.calls.filter((c) => c.url.endsWith('/polls')).length, 0);
});

test('an answer with no usable body is applied locally', async () => {
  const h = await boot({
    session: SIGNED_IN,
    handler: handler(),
  });
  await h.waitFor(() => h.$$('button.g-poll__option').length === 3);
  // The script replays a stored intent through the same code as a click.
  h.$$('button.g-poll__option')[1].click();
  await h.waitFor(() => h.$$('.g-poll__percent')[1].textContent === '100%');
  assert.equal(
    h.$('.g-poll__meta')?.textContent,
    'Votes: 1 · Pick again to change.',
    'an answer with no body is applied locally',
  );
});
