/**
 * Reader-interactions browser script (`gala-interactions.js`): DOM tests that
 * execute the real shipped source inside JSDOM against a scripted fake API.
 * Covers the sign-in redirect (PKCE), state handling, token exchange and
 * intent replay, optimistic reactions, the comment lifecycle, error wording,
 * blocked storage, an unavailable API, and the "no innerHTML / popup /
 * postMessage" source rules.
 */

import { strict as assert } from 'node:assert';
import { createHash, webcrypto } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';
import { TextEncoder } from 'node:util';

import { JSDOM } from 'jsdom';

const SCRIPT_PATH = path.resolve(
  import.meta.dirname,
  '../src/modules/interactions/browser/gala-interactions.js',
);
const SOURCE = await readFile(SCRIPT_PATH, 'utf8');

const PUBLICATION = '0190b1f0-0000-7000-8000-000000000001';
const CONTENT = '0190b1f0-0000-7000-8000-000000000002';
const API = 'https://api.galascribe.com';
const APP = 'https://app.galascribe.com';
const PAGE = 'https://blog.example/posts/hello/';
const SESSION_KEY = 'gala.reader.session.' + PUBLICATION;
const PENDING_KEY = 'gala.reader.pending.' + PUBLICATION;

const MARKUP = `<!doctype html><html lang="en"><body><article></article>
<section class="g-interactions" id="comments" aria-labelledby="g-interactions-title"
  data-gala-interactions data-api-origin="${API}" data-app-origin="${APP}"
  data-publication-id="${PUBLICATION}" data-content-id="${CONTENT}"
  data-canonical-url="${PAGE}" data-reactions-enabled="true" data-comments-enabled="true"
  data-count-reactions="true" data-count-comments="true" data-allow-replies="true" data-max-depth="3">
  <h2 id="g-interactions-title" class="g-interactions__title">Responses</h2>
  <div class="g-reactions" data-gala-reactions role="group" aria-label="Reactions">
    <button type="button" class="g-reaction" data-reaction-key="like" aria-pressed="false" disabled>
      <span class="g-reaction__icon" aria-hidden="true"></span>
      <span class="g-reaction__label">Like</span>
      <span class="g-reaction__count" data-gala-count></span>
    </button>
    <button type="button" class="g-reaction" data-reaction-key="insightful" aria-pressed="false" disabled>
      <span class="g-reaction__icon" aria-hidden="true">x</span>
      <span class="g-reaction__label">Insightful</span>
      <span class="g-reaction__count" data-gala-count></span>
    </button>
  </div>
  <div class="g-comments" data-gala-comments>
    <h3 class="g-comments__title">Conversation <span class="g-comments__count" data-gala-comment-count></span></h3>
    <p class="g-interactions__notice" data-gala-static-notice>Reactions and comments need JavaScript.</p>
    <div class="g-composer-slot" data-gala-composer-slot></div>
    <ol class="g-comment-list" data-gala-comment-list></ol>
    <button type="button" class="g-comments__more" data-gala-more hidden>Show more comments</button>
  </div>
  <div class="g-interactions__status" role="status" aria-live="polite" data-gala-status></div>
</section></body></html>`;

/**
 * Build a CommentView.
 *
 * @param {string} id comment id
 * @param {Record<string, unknown>} [extra] overrides
 * @returns {Record<string, any>} the view
 */
function comment(id, extra = {}) {
  return {
    id,
    parentId: null,
    depth: 0,
    state: 'VISIBLE',
    author: { displayName: 'Ana Lima', initials: 'AL' },
    body: 'Hello ' + id,
    createdAt: new Date(Date.now() - 3 * 60_000).toISOString(),
    editedAt: null,
    replies: [],
    moreReplies: false,
    viewer: {
      isAuthor: false,
      canEdit: false,
      canDelete: false,
      canReply: true,
    },
    ...extra,
  };
}

/**
 * The default interactions view (#2).
 *
 * @param {Record<string, unknown>} [extra] overrides
 * @returns {Record<string, any>} the view
 */
function interactionsView(extra = {}) {
  return {
    reactions: {
      enabled: true,
      items: [
        {
          key: 'like',
          label: 'Like',
          visual: { kind: 'icon', token: 'like' },
          count: { lowerBound: 50, display: '50+', label: 'At least 50 likes' },
          viewerActive: false,
        },
        {
          key: 'insightful',
          label: 'Insightful',
          visual: { kind: 'emoji', token: 'x' },
          count: null,
          viewerActive: false,
        },
      ],
    },
    comments: { enabled: true, open: true, allowReplies: true, maxDepth: 3 },
    viewer: null,
    asOf: new Date().toISOString(),
    ...extra,
  };
}

const NO_COUNT = null;

/**
 * Boot the script in a fresh DOM.
 *
 * @param {object} [options] harness options
 * @returns {Promise<any>} the harness
 */
async function boot(options = {}) {
  const calls = [];
  const navigations = [];
  const dom = new JSDOM(MARKUP, {
    url: PAGE + (options.hash || ''),
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
  const handler = options.handler || (() => ({ status: 404, body: {} }));
  window.fetch = (url, init) => {
    const call = { url: String(url), init, method: init.method };
    calls.push(call);
    const respond = (result) => {
      if (result instanceof Error) throw result;
      return {
        ok: result.status >= 200 && result.status < 300,
        status: result.status,
        json: async () => result.body,
      };
    };
    return new Promise((resolve, reject) => {
      Promise.resolve(handler(call)).then((result) => {
        try {
          resolve(respond(result));
        } catch (failure) {
          reject(failure);
        }
      }, reject);
    });
  };
  const section = window.document.querySelector('[data-gala-interactions]');
  section.addEventListener('gala:navigate', (event) => {
    event.preventDefault();
    navigations.push(event.detail.url);
  });
  if (options.shrinkTimeout) {
    const realSetTimeout = window.setTimeout.bind(window);
    window.setTimeout = (fn, ms, ...rest) =>
      realSetTimeout(fn, ms === 15000 ? 20 : ms, ...rest);
  }
  window.eval(SOURCE);
  const $ = (selector) => window.document.querySelector(selector);
  const $$ = (selector) =>
    Array.from(window.document.querySelectorAll(selector));
  const harness = {
    window,
    calls,
    navigations,
    $,
    $$,
    status: () => $('[data-gala-status]').textContent,
    async waitFor(predicate, label = 'condition') {
      for (let i = 0; i < 200; i += 1) {
        if (predicate()) return;
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      throw new Error('timed out waiting for ' + label);
    },
    async ready() {
      await harness.waitFor(
        () =>
          !$('[data-gala-static-notice]').hidden === false && calls.length >= 2,
        'initial load',
      );
      await new Promise((resolve) => setTimeout(resolve, 40));
    },
    bodyCalls: (method, fragment) =>
      calls.filter((c) => c.method === method && c.url.includes(fragment)),
  };
  return harness;
}

/**
 * A standard API handler with overridable routes.
 *
 * @param {Record<string, any>} [routes] key "METHOD fragment" to result or fn
 * @returns {Function} fetch handler
 */
function api(routes = {}) {
  return (call) => {
    for (const [key, value] of Object.entries(routes)) {
      const [method, ...rest] = key.split(' ');
      if (call.method === method && call.url.includes(rest.join(' '))) {
        return typeof value === 'function' ? value(call) : value;
      }
    }
    if (call.method === 'GET' && call.url.endsWith('/interactions')) {
      return { status: 200, body: interactionsView() };
    }
    if (call.method === 'GET' && call.url.includes('/comments')) {
      return {
        status: 200,
        body: {
          items: [comment('c1'), comment('c2')],
          nextCursor: null,
          count: { lowerBound: 2, display: '2', label: '2 comments' },
        },
      };
    }
    return { status: 404, body: {} };
  };
}

const SIGNED_IN = {
  accessToken: 'tok-123',
  expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
  reader: { displayName: 'Ana Lima', initials: 'AL' },
};

/**
 * Problem body with the given code.
 *
 * @param {number} status HTTP status
 * @param {string} code problem code
 * @param {string} [reason] COMMENT_INVALID reason
 * @returns {{status: number, body: object}} result
 */
function problem(status, code, reason) {
  return { status, body: { status, code, ...(reason ? { reason } : {}) } };
}

const b64url = (buffer) => Buffer.from(buffer).toString('base64url');

test('initial render signed out: reactions enabled, counts, comments, sign-in button', async () => {
  const h = await boot({ handler: api() });
  await h.ready();
  assert.equal(h.$('[data-gala-static-notice]').hidden, true);
  const like = h.$('[data-reaction-key="like"]');
  assert.equal(like.disabled, false);
  assert.equal(like.getAttribute('aria-pressed'), 'false');
  assert.equal(like.querySelector('[data-gala-count]').textContent, '50+');
  assert.match(like.getAttribute('aria-label'), /At least 50 likes/);
  assert.equal(h.$$('.g-comment-list > .g-comment').length, 2);
  assert.equal(h.$('[data-gala-comment-count]').textContent, '2');
  const signin = h.$('.g-composer__signin');
  assert.equal(signin.hidden, false);
  assert.equal(
    signin.textContent,
    'Sign in with GitHub to join the conversation',
  );
  assert.equal(h.$('.g-composer__input').hidden, true);
  assert.equal(h.$('.g-composer__submit').hidden, true);
  for (const call of h.calls) {
    assert.equal(call.init.headers.Authorization, undefined);
  }
});

test('initial render signed in: bearer sent, identity line, textarea with label, pressed state', async () => {
  const view = interactionsView({ viewer: SIGNED_IN.reader });
  view.reactions.items[0].viewerActive = true;
  const h = await boot({
    session: SIGNED_IN,
    handler: api({ 'GET /interactions': { status: 200, body: view } }),
  });
  await h.ready();
  assert.ok(h.calls.length >= 2);
  for (const call of h.calls) {
    assert.equal(call.init.headers.Authorization, 'Bearer tok-123');
    assert.equal(call.init.mode, 'cors');
    assert.equal(call.init.credentials, 'omit');
    assert.ok(call.init.signal, 'abort signal for the 15 s timeout');
  }
  const like = h.$('[data-reaction-key="like"]');
  assert.equal(like.getAttribute('aria-pressed'), 'true');
  assert.ok(like.classList.contains('g-reaction--active'));
  const input = h.$('.g-composer__input');
  assert.equal(input.hidden, false);
  assert.equal(input.tagName, 'TEXTAREA');
  const label = h.$(`label[for="${input.id}"]`);
  assert.ok(label && !label.hidden);
  assert.match(
    h.$('.g-composer__identity').textContent,
    /^Signed in as Ana Lima . Sign out$/,
  );
  assert.equal(h.$('.g-composer__signin').hidden, true);
});

test('expired stored session is ignored and removed', async () => {
  const h = await boot({
    session: {
      ...SIGNED_IN,
      expiresAt: new Date(Date.now() - 1000).toISOString(),
    },
    handler: api(),
  });
  await h.ready();
  assert.equal(h.window.localStorage.getItem(SESSION_KEY), null);
  assert.equal(h.calls[0].init.headers.Authorization, undefined);
});

test('pressing Like signed out starts PKCE: pending intent and redirect URL', async () => {
  const h = await boot({ handler: api() });
  await h.ready();
  h.$('[data-reaction-key="insightful"]').click();
  await h.waitFor(() => h.navigations.length === 1, 'navigation');
  const url = new URL(h.navigations[0]);
  assert.equal(url.origin + url.pathname, APP + '/reader/connect');
  assert.equal(url.searchParams.get('publication'), PUBLICATION);
  assert.equal(url.searchParams.get('return'), PAGE + '#comments');
  assert.ok(
    h.navigations[0].includes(
      'return=' + encodeURIComponent(PAGE + '#comments'),
    ),
  );
  const pending = JSON.parse(h.window.sessionStorage.getItem(PENDING_KEY));
  assert.equal(pending.state, url.searchParams.get('state'));
  assert.deepEqual(pending.intent, { kind: 'reaction', key: 'insightful' });
  assert.ok(Number.isFinite(pending.createdAt));
  assert.match(pending.codeVerifier, /^[A-Za-z0-9_-]{86}$/);
  assert.match(pending.state, /^[A-Za-z0-9_-]{43}$/);
  const expected = b64url(
    createHash('sha256').update(pending.codeVerifier).digest(),
  );
  assert.equal(url.searchParams.get('challenge'), expected);
});

test('state mismatch in the fragment is discarded: no token request, fragment scrubbed', async () => {
  const h = await boot({
    hash: '#gala-reader-code=abc&gala-reader-state=WRONG',
    pending: {
      state: 'RIGHT',
      codeVerifier: 'v'.repeat(64),
      intent: { kind: 'signin' },
      createdAt: Date.now(),
    },
    handler: api(),
  });
  await h.ready();
  assert.equal(h.window.location.hash, '#comments');
  assert.equal(h.bodyCalls('POST', '/v2/reader/tokens').length, 0);
  assert.equal(h.window.sessionStorage.getItem(PENDING_KEY), null);
  assert.equal(h.window.localStorage.getItem(SESSION_KEY), null);
  assert.match(h.status(), /sign-in link wasn't valid/);
  assert.equal(h.$('.g-composer__signin').hidden, false);
});

test('token exchange then replays a reaction automatically', async () => {
  const h = await boot({
    hash: '#gala-reader-code=the-code&gala-reader-state=S1',
    pending: {
      state: 'S1',
      codeVerifier: 'verifier-xyz',
      intent: { kind: 'reaction', key: 'insightful' },
      createdAt: Date.now(),
    },
    handler: api({
      'POST /v2/reader/tokens': {
        status: 200,
        body: {
          accessToken: 'new-token',
          tokenType: 'Bearer',
          expiresAt: SIGNED_IN.expiresAt,
          reader: SIGNED_IN.reader,
        },
      },
      'PUT /reactions/insightful': {
        status: 200,
        body: { key: 'insightful', active: true, count: NO_COUNT },
      },
    }),
  });
  await h.waitFor(
    () => h.bodyCalls('PUT', '/reactions/insightful').length === 1,
    'reaction replay',
  );
  assert.equal(h.window.location.hash, '#comments');
  const exchange = h.bodyCalls('POST', '/v2/reader/tokens')[0];
  assert.deepEqual(JSON.parse(exchange.init.body), {
    code: 'the-code',
    codeVerifier: 'verifier-xyz',
    publicationId: PUBLICATION,
  });
  assert.equal(exchange.init.headers.Authorization, undefined);
  assert.equal(
    JSON.parse(h.window.localStorage.getItem(SESSION_KEY)).accessToken,
    'new-token',
  );
  assert.equal(h.window.sessionStorage.getItem(PENDING_KEY), null);
  const put = h.bodyCalls('PUT', '/reactions/insightful')[0];
  assert.equal(put.init.headers.Authorization, 'Bearer new-token');
  await h.waitFor(
    () =>
      h.$('[data-reaction-key="insightful"]').getAttribute('aria-pressed') ===
      'true',
    'pressed',
  );
});

test('token exchange restores a comment draft into the composer and never posts it', async () => {
  const h = await boot({
    hash: '#gala-reader-code=c&gala-reader-state=S2',
    pending: {
      state: 'S2',
      codeVerifier: 'vv',
      intent: { kind: 'comment', parentId: null, body: 'my draft' },
      createdAt: Date.now(),
    },
    handler: api({
      'POST /v2/reader/tokens': {
        status: 200,
        body: {
          accessToken: 't',
          tokenType: 'Bearer',
          expiresAt: SIGNED_IN.expiresAt,
          reader: SIGNED_IN.reader,
        },
      },
    }),
  });
  await h.waitFor(
    () =>
      h.$('.g-composer__input') &&
      h.$('.g-composer__input').value === 'my draft',
    'draft',
  );
  await new Promise((resolve) => setTimeout(resolve, 60));
  assert.equal(h.bodyCalls('POST', '/comments').length, 0);
  assert.equal(h.window.document.activeElement, h.$('.g-composer__input'));
  assert.equal(h.$('.g-composer__input').hidden, false);
});

test('failed token exchange keeps the reader signed out with a message', async () => {
  const h = await boot({
    hash: '#gala-reader-code=c&gala-reader-state=S3',
    pending: {
      state: 'S3',
      codeVerifier: 'vv',
      intent: { kind: 'signin' },
      createdAt: Date.now(),
    },
    handler: api({ 'POST /v2/reader/tokens': problem(400, 'INVALID_GRANT') }),
  });
  await h.ready();
  assert.equal(h.window.localStorage.getItem(SESSION_KEY), null);
  assert.match(h.status(), /didn't complete/);
});

test('reaction toggles optimistically and reverts on error', async () => {
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  const h = await boot({
    session: SIGNED_IN,
    handler: api({
      'PUT /reactions/like': async () => {
        await gate;
        return problem(500, 'INTERNAL');
      },
    }),
  });
  await h.ready();
  const like = h.$('[data-reaction-key="like"]');
  like.click();
  assert.equal(like.getAttribute('aria-pressed'), 'true', 'optimistic');
  assert.ok(like.classList.contains('g-reaction--active'));
  release();
  await h.waitFor(
    () => like.getAttribute('aria-pressed') === 'false',
    'revert',
  );
  assert.equal(like.classList.contains('g-reaction--active'), false);
  assert.equal(like.querySelector('[data-gala-count]').textContent, '50+');
  await h.waitFor(() => /Something went wrong/.test(h.status()), 'message');
});

test('reaction success updates the count; second press un-likes with DELETE', async () => {
  const h = await boot({
    session: SIGNED_IN,
    handler: api({
      'PUT /reactions/like': {
        status: 200,
        body: {
          key: 'like',
          active: true,
          count: { lowerBound: 51, display: '51', label: '51 likes' },
        },
      },
      'DELETE /reactions/like': {
        status: 200,
        body: {
          key: 'like',
          active: false,
          count: { lowerBound: 50, display: '50+', label: 'At least 50 likes' },
        },
      },
    }),
  });
  await h.ready();
  const like = h.$('[data-reaction-key="like"]');
  like.click();
  await h.waitFor(
    () => like.querySelector('[data-gala-count]').textContent === '51',
    'count 51',
  );
  like.click();
  await h.waitFor(
    () => h.bodyCalls('DELETE', '/reactions/like').length === 1,
    'delete',
  );
  await h.waitFor(
    () => like.getAttribute('aria-pressed') === 'false',
    'unpressed',
  );
});

test('posting a comment: key header, focus to the new comment, announcement; retry reuses the key', async () => {
  let attempt = 0;
  const posted = comment('new1', {
    body: 'fresh https://example.com/a.',
    viewer: { isAuthor: true, canEdit: true, canDelete: true, canReply: true },
  });
  const h = await boot({
    session: SIGNED_IN,
    handler: api({
      'POST /comments': () => {
        attempt += 1;
        if (attempt === 1) return new TypeError('Failed to fetch');
        return { status: 201, body: posted };
      },
    }),
  });
  await h.ready();
  const input = h.$('.g-composer__input');
  input.value = 'fresh https://example.com/a.';
  h.$('.g-composer__submit').click();
  await h.waitFor(
    () => /Couldn't reach Galascribe\. Your draft is kept\./.test(h.status()),
    'network message',
  );
  assert.equal(input.value, 'fresh https://example.com/a.', 'draft kept');
  await h.waitFor(
    () => !h.$('.g-composer__submit').disabled,
    'submit re-enabled',
  );
  h.$('.g-composer__submit').click();
  await h.waitFor(() => h.$('#g-comment-new1'), 'new comment');
  const posts = h.bodyCalls('POST', '/comments');
  assert.equal(posts.length, 2);
  const keys = posts.map((p) => p.init.headers['Idempotency-Key']);
  assert.match(keys[0], /^[0-9a-f-]{36}$/);
  assert.equal(keys[0], keys[1]);
  assert.deepEqual(JSON.parse(posts[1].init.body), {
    body: 'fresh https://example.com/a.',
    parentId: null,
  });
  const node = h.$('#g-comment-new1');
  assert.equal(h.window.document.activeElement, node);
  assert.equal(
    node,
    h.$('.g-comment-list').firstElementChild,
    'roots newest first',
  );
  assert.ok(node.classList.contains('g-comment--mine'));
  await h.waitFor(() => h.status() === 'Comment posted.', 'announcement');
  assert.equal(input.value, '');
  // A different draft gets a different key.
  input.value = 'second';
  h.$('.g-composer__submit').click();
  await h.waitFor(
    () => h.bodyCalls('POST', '/comments').length === 3,
    'third post',
  );
  const third = h.bodyCalls('POST', '/comments')[2].init.headers[
    'Idempotency-Key'
  ];
  assert.notEqual(third, keys[0]);
});

test('comment body: text nodes, auto-linked URLs with safe rel, no markup execution', async () => {
  const body =
    'see https://example.com/path?x=1, and <b>bold</b> javascript:alert(1)\nline two http://a.test/z).';
  const h = await boot({
    handler: api({
      'GET /comments': {
        status: 200,
        body: {
          items: [comment('x', { body })],
          nextCursor: null,
          count: NO_COUNT,
        },
      },
    }),
  });
  await h.ready();
  const links = h.$$('.g-comment__body a');
  assert.deepEqual(
    links.map((a) => a.getAttribute('href')),
    ['https://example.com/path?x=1', 'http://a.test/z'],
  );
  for (const a of links) {
    assert.equal(a.getAttribute('rel'), 'nofollow ugc noopener noreferrer');
    assert.equal(a.getAttribute('target'), null);
  }
  assert.equal(h.$$('.g-comment__body b').length, 0);
  assert.ok(h.$('.g-comment__body').textContent.includes('<b>bold</b>'));
  assert.equal(h.$$('.g-comment__body br').length, 1);
});

test('time element: datetime attribute, relative label, absolute after 7 days', async () => {
  const old = new Date(Date.now() - 20 * 86_400_000).toISOString();
  const h = await boot({
    handler: api({
      'GET /comments': {
        status: 200,
        body: {
          items: [
            comment('recent'),
            comment('older', { createdAt: old, editedAt: old }),
          ],
          nextCursor: null,
          count: NO_COUNT,
        },
      },
    }),
  });
  await h.ready();
  const [recent, older] = h.$$('time.g-comment__time');
  assert.equal(recent.tagName, 'TIME');
  assert.ok(recent.getAttribute('datetime'));
  assert.match(recent.textContent, /^3 min\.? ago$/);
  assert.equal(older.getAttribute('datetime'), old);
  assert.match(older.textContent, /^[A-Z][a-z]{2} \d{1,2}, \d{4} \(edited\)$/);
});

test('tombstones for DELETED and REMOVED keep the replies and hide author and body', async () => {
  const reply = comment('r1', { parentId: 't1', depth: 1 });
  const tomb = comment('t1', {
    state: 'DELETED',
    author: null,
    body: null,
    replies: [reply],
  });
  const removed = comment('t2', { state: 'REMOVED', author: null, body: null });
  const h = await boot({
    handler: api({
      'GET /comments': {
        status: 200,
        body: { items: [tomb, removed], nextCursor: null, count: NO_COUNT },
      },
    }),
  });
  await h.ready();
  const items = h.$$('.g-comment-list > .g-comment');
  assert.ok(items[0].classList.contains('g-comment--tombstone'));
  assert.equal(items[0].querySelector(':scope > .g-comment__head'), null);
  assert.equal(items[0].querySelector(':scope > .g-comment__actions'), null);
  assert.match(items[0].textContent, /This comment was deleted\./);
  assert.match(items[1].textContent, /This comment was removed\./);
  assert.equal(
    items[0].querySelectorAll('.g-comment__replies > .g-comment').length,
    1,
  );
});

test('reply: composer opens inline, only while depth allows; posts under the parent', async () => {
  const deep = comment('d2', { depth: 2, parentId: 'd1' });
  const mid = comment('d1', { depth: 1, parentId: 'root', replies: [deep] });
  const root = comment('root', { replies: [mid] });
  const h = await boot({
    session: SIGNED_IN,
    handler: api({
      'GET /comments': {
        status: 200,
        body: { items: [root], nextCursor: null, count: NO_COUNT },
      },
      'POST /comments': (call) => ({
        status: 201,
        body: comment('reply1', {
          parentId: JSON.parse(call.init.body).parentId,
          depth: 1,
        }),
      }),
    }),
  });
  await h.ready();
  const replyButtons = (id) =>
    h
      .$$(`#g-comment-${id} > .g-comment__actions .g-comment__action`)
      .map((b) => b.textContent);
  assert.ok(replyButtons('root').includes('Reply'));
  assert.ok(replyButtons('d1').includes('Reply'));
  assert.ok(
    !replyButtons('d2').includes('Reply'),
    'depth 2 of maxDepth 3 cannot reply',
  );
  const trigger = h.$(
    '#g-comment-root > .g-comment__actions .g-comment__action',
  );
  trigger.click();
  const inline = h.$('#g-comment-root > .g-composer');
  assert.ok(inline);
  const input = inline.querySelector('textarea');
  assert.equal(h.window.document.activeElement, input);
  input.value = 'a reply';
  inline.querySelector('.g-composer__submit').click();
  await h.waitFor(() => h.$('#g-comment-reply1'), 'reply inserted');
  const body = JSON.parse(h.bodyCalls('POST', '/comments')[0].init.body);
  assert.deepEqual(body, { body: 'a reply', parentId: 'root' });
  assert.equal(h.$('#g-comment-root > .g-composer'), null);
  assert.equal(h.window.document.activeElement.id, 'g-comment-reply1');
  assert.equal(
    h.$('#g-comment-reply1').parentElement.parentElement.id,
    'g-comment-root',
  );
});

test('replies disabled by the API hide every Reply action', async () => {
  const view = interactionsView();
  view.comments.allowReplies = false;
  const h = await boot({
    session: SIGNED_IN,
    handler: api({ 'GET /interactions': { status: 200, body: view } }),
  });
  await h.ready();
  const labels = h.$$('.g-comment__action').map((b) => b.textContent);
  assert.ok(!labels.includes('Reply'));
});

test('cancel on a reply returns focus to the trigger; Escape cancels too', async () => {
  const h = await boot({ session: SIGNED_IN, handler: api() });
  await h.ready();
  const trigger = h.$('#g-comment-c1 > .g-comment__actions .g-comment__action');
  trigger.click();
  h.$('#g-comment-c1 .g-composer__cancel').click();
  assert.equal(h.$('#g-comment-c1 .g-composer'), null);
  assert.equal(h.window.document.activeElement, trigger);
  trigger.click();
  const input = h.$('#g-comment-c1 textarea');
  input.dispatchEvent(
    new h.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
  );
  assert.equal(h.$('#g-comment-c1 .g-composer'), null);
});

test('edit within the window posts a revision and updates in place', async () => {
  const mine = comment('m1', {
    body: 'old text',
    viewer: { isAuthor: true, canEdit: true, canDelete: true, canReply: true },
  });
  const h = await boot({
    session: SIGNED_IN,
    handler: api({
      'GET /comments': {
        status: 200,
        body: { items: [mine], nextCursor: null, count: NO_COUNT },
      },
      'POST /revisions': () => ({
        status: 200,
        body: { ...mine, body: 'new text', editedAt: new Date().toISOString() },
      }),
    }),
  });
  await h.ready();
  const edit = h
    .$$('#g-comment-m1 .g-comment__action')
    .find((b) => b.textContent === 'Edit');
  edit.click();
  const input = h.$('#g-comment-m1 textarea');
  assert.equal(input.value, 'old text');
  input.value = 'new text';
  h.$('#g-comment-m1 .g-composer__submit').click();
  await h.waitFor(
    () =>
      /new text/.test(h.$('#g-comment-m1 .g-comment__body')?.textContent || ''),
    'edited',
  );
  const call = h.bodyCalls('POST', '/v2/public/comments/m1/revisions')[0];
  assert.deepEqual(JSON.parse(call.init.body), { body: 'new text' });
  assert.match(h.$('#g-comment-m1 time').textContent, /\(edited\)/);
  assert.equal(h.window.document.activeElement.id, 'g-comment-m1');
});

test('edit window closed shows the server refusal', async () => {
  const mine = comment('m1', {
    viewer: { isAuthor: true, canEdit: true, canDelete: true, canReply: true },
  });
  const h = await boot({
    session: SIGNED_IN,
    handler: api({
      'GET /comments': {
        status: 200,
        body: { items: [mine], nextCursor: null, count: NO_COUNT },
      },
      'POST /revisions': problem(403, 'EDIT_WINDOW_CLOSED'),
    }),
  });
  await h.ready();
  h.$$('#g-comment-m1 .g-comment__action')
    .find((b) => b.textContent === 'Edit')
    .click();
  h.$('#g-comment-m1 .g-composer__submit').click();
  await h.waitFor(
    () =>
      /edit window has closed/.test(
        h.$('#g-comment-m1 .g-composer__error').textContent,
      ),
    'refusal',
  );
});

test('delete confirms with "Delete this comment?"; no replies removes, replies leaves a tombstone', async () => {
  const perms = {
    isAuthor: true,
    canEdit: false,
    canDelete: true,
    canReply: true,
  };
  const leaf = comment('leaf', { viewer: perms });
  const parent = comment('parent', {
    viewer: perms,
    replies: [comment('kid', { parentId: 'parent', depth: 1 })],
  });
  const h = await boot({
    session: SIGNED_IN,
    handler: api({
      'GET /comments': {
        status: 200,
        body: { items: [leaf, parent], nextCursor: null, count: NO_COUNT },
      },
      'DELETE /v2/public/comments/': { status: 204, body: null },
    }),
  });
  await h.ready();
  const del = (id) =>
    h
      .$$(`#g-comment-${id} > .g-comment__actions .g-comment__action`)
      .find((b) => b.textContent === 'Delete');
  del('leaf').click();
  assert.match(
    h.$('#g-comment-leaf .g-comment__confirm').textContent,
    /Delete this comment\?/,
  );
  h.$$('#g-comment-leaf .g-comment__confirm button')[1].click();
  assert.equal(
    h.$('#g-comment-leaf .g-comment__confirm'),
    null,
    'cancel closes the confirmation',
  );
  assert.equal(h.bodyCalls('DELETE', '/v2/public/comments/').length, 0);
  del('leaf').click();
  h.$$('#g-comment-leaf .g-comment__confirm button')[0].click();
  await h.waitFor(() => !h.$('#g-comment-leaf'), 'leaf removed');
  await h.waitFor(
    () => h.status() === 'Comment deleted.',
    'deleted announcement',
  );
  del('parent').click();
  h.$$('#g-comment-parent .g-comment__confirm button')[0].click();
  await h.waitFor(
    () => h.$('#g-comment-parent.g-comment--tombstone'),
    'tombstone',
  );
  assert.equal(
    h.$$('#g-comment-parent .g-comment__replies > .g-comment').length,
    1,
  );
  assert.equal(h.$('#g-comment-parent > .g-comment__actions'), null);
});

test('report dialog: reason and note posted; Escape closes and returns focus', async () => {
  const h = await boot({
    session: SIGNED_IN,
    handler: api({
      'POST /reports': { status: 202, body: { status: 'RECEIVED' } },
    }),
  });
  await h.ready();
  const trigger = h
    .$$('#g-comment-c1 .g-comment__action')
    .find((b) => b.textContent === 'Report');
  trigger.focus();
  trigger.click();
  const dialog = h.$('dialog.g-report');
  assert.ok(dialog.hasAttribute('open'));
  assert.ok(dialog.getAttribute('aria-labelledby'));
  dialog
    .querySelector('select')
    .dispatchEvent(
      new h.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
  assert.equal(h.$('dialog.g-report'), null);
  assert.equal(h.window.document.activeElement, trigger);
  trigger.click();
  const second = h.$('dialog.g-report');
  second.querySelector('select').value = 'HARASSMENT';
  second.querySelector('textarea').value = ' rude ';
  second.querySelector('.g-composer__submit').click();
  await h.waitFor(() => !h.$('dialog.g-report'), 'dialog closed');
  const call = h.bodyCalls('POST', '/v2/public/comments/c1/reports')[0];
  assert.deepEqual(JSON.parse(call.init.body), {
    reasonCode: 'HARASSMENT',
    note: 'rude',
  });
  await h.waitFor(() => /report was received/.test(h.status()), 'thanks');
  assert.equal(h.window.document.activeElement, trigger);
});

/**
 * A signed-in reader's own removed or held comment, as the thread read
 * returns it: a state and an `own` object, no author and no body.
 *
 * @param {string} id comment id
 * @param {Record<string, unknown>} [own] overrides for the `own` object
 * @param {Record<string, unknown>} [extra] overrides for the comment
 * @returns {Record<string, any>} the view
 */
function ownComment(id, own = {}, extra = {}) {
  return comment(id, {
    state: 'REMOVED',
    author: null,
    body: null,
    viewer: {
      isAuthor: true,
      canEdit: false,
      canDelete: false,
      canReply: false,
    },
    own: { state: 'REMOVED', appeal: null, canAppeal: true, ...own },
    ...extra,
  });
}

/**
 * A thread read answering with exactly these comments.
 *
 * @param {Record<string, any>[]} items the comments
 * @returns {{status: number, body: object}} the result
 */
function thread(items) {
  return {
    status: 200,
    body: { items, nextCursor: null, count: NO_COUNT },
  };
}

const APPEAL_SENT = 'Appeal sent. The moderators will look again.';

/**
 * How often a sentence is drawn anywhere in the interactions section, the
 * status line included.
 *
 * @param {any} h the harness
 * @param {string} sentence the sentence
 * @returns {number} the number of occurrences
 */
function occurrences(h, sentence) {
  return h.$('[data-gala-interactions]').textContent.split(sentence).length - 1;
}

/**
 * Wait out the status line's announcement delay (30 ms), so that an
 * announcement the script was going to make has landed.
 *
 * @returns {Promise<void>} resolves once the delay has passed
 */
function pastAnnouncements() {
  return new Promise((resolve) => setTimeout(resolve, 80));
}

test("own removed and held comments: the moderators' wording, no author or body, Appeal only when allowed, replies kept", async () => {
  const reply = comment('r1', { parentId: 'o1', depth: 1 });
  const h = await boot({
    session: SIGNED_IN,
    handler: api({
      'GET /comments': thread([
        ownComment('o1', {}, { replies: [reply] }),
        ownComment('o2', { state: 'HELD' }, { state: 'HELD' }),
        ownComment('o3', { canAppeal: false, appeal: { state: 'PENDING' } }),
        ownComment('o4', {
          canAppeal: false,
          appeal: { state: 'DENIED', decidedAt: new Date().toISOString() },
        }),
        ownComment('o5', {
          canAppeal: false,
          appeal: { state: 'RESTORED', decidedAt: new Date().toISOString() },
        }),
        ownComment('o6', { canAppeal: false }),
        // The `own` object decides, whatever `state` the comment carries.
        ownComment('o7', { state: 'HELD' }, { state: 'VISIBLE' }),
        // Somebody else's removed comment is still the plain tombstone.
        comment('x1', { state: 'REMOVED', author: null, body: null }),
      ]),
    }),
  });
  await h.ready();
  const text = (id) => h.$(`#g-comment-${id} > .g-comment__body`).textContent;
  const notes = (id) =>
    h
      .$$(`#g-comment-${id} > .g-interactions__notice`)
      .map((node) => node.textContent);
  const appealButtons = (id) =>
    h
      .$$(`#g-comment-${id} > .g-comment__actions .g-comment__action`)
      .map((node) => node.textContent);

  assert.equal(text('o1'), "Removed by the site's moderators");
  assert.equal(text('o2'), 'Hidden while the moderators review it');
  assert.equal(text('o7'), 'Hidden while the moderators review it');
  for (const id of ['o1', 'o2', 'o3', 'o4', 'o5', 'o6', 'o7']) {
    const item = h.$(`#g-comment-${id}`);
    assert.ok(item.classList.contains('g-comment--tombstone'), id);
    assert.ok(item.classList.contains('g-comment--mine'), id);
    assert.equal(item.querySelector(':scope > .g-comment__head'), null, id);
  }
  assert.deepEqual(appealButtons('o1'), ['Appeal']);
  assert.equal(
    h
      .$('#g-comment-o1 > .g-comment__actions button')
      .getAttribute('aria-label'),
    'Appeal this decision',
  );
  assert.deepEqual(appealButtons('o2'), ['Appeal']);
  assert.deepEqual(appealButtons('o7'), ['Appeal']);
  for (const id of ['o3', 'o4', 'o5', 'o6']) {
    assert.deepEqual(appealButtons(id), [], `${id}: no Appeal`);
  }
  assert.deepEqual(notes('o1'), []);
  assert.deepEqual(notes('o3'), [
    'Appeal sent. The moderators will look again.',
  ]);
  assert.deepEqual(notes('o4'), ['Kept removed after review']);
  assert.deepEqual(notes('o5'), ['Restored after review']);
  assert.deepEqual(notes('o6'), []);
  // The replies under a removed comment stay.
  assert.equal(
    h.$$('#g-comment-o1 .g-comment__replies > .g-comment').length,
    1,
  );
  // Others' removed comments keep the plain wording and no Appeal.
  assert.equal(text('x1'), 'This comment was removed.');
  assert.deepEqual(appealButtons('x1'), []);
});

test('own removed and held comments say which comment they are: "Your comment from <relative date>", from createdAt', async () => {
  const ago = (ms) => new Date(Date.now() - ms).toISOString();
  const recent = ago(3 * 60_000);
  const h = await boot({
    session: SIGNED_IN,
    handler: api({
      'GET /comments': thread([
        ownComment('o1', {}, { createdAt: recent }),
        ownComment(
          'o2',
          { state: 'HELD' },
          { state: 'HELD', createdAt: ago(86_400_000 + 60_000) },
        ),
        ownComment(
          'o3',
          { canAppeal: false, appeal: { state: 'PENDING' } },
          { createdAt: ago(20 * 86_400_000) },
        ),
        ownComment('o4', {}, { createdAt: 'not a date' }),
        comment('x1', { state: 'REMOVED', author: null, body: null }),
        comment('c1'),
      ]),
    }),
  });
  await h.ready();
  const context = (id) => h.$$(`#g-comment-${id} > time.g-comment__time`);
  const wording = (id) =>
    h.$(`#g-comment-${id} > .g-comment__body`).textContent;

  assert.equal(context('o1').length, 1);
  const [first] = context('o1');
  assert.match(first.textContent, /^Your comment from 3 min\.? ago$/);
  assert.equal(first.getAttribute('datetime'), recent);
  assert.match(first.getAttribute('title'), /\d{4}/);
  // It leads the comment, ahead of the moderators' wording.
  assert.equal(h.$('#g-comment-o1').firstElementChild, first);
  assert.equal(first.nextElementSibling.textContent, wording('o1'));
  assert.equal(wording('o1'), "Removed by the site's moderators");

  assert.deepEqual(
    context('o2').map((node) => node.textContent),
    ['Your comment from yesterday'],
  );
  assert.equal(wording('o2'), 'Hidden while the moderators review it');
  assert.equal(context('o3').length, 1);
  assert.match(
    context('o3')[0].textContent,
    /^Your comment from [A-Z][a-z]{2} \d{1,2}, \d{4}$/,
  );

  // A date that cannot be read leaves the line out; the wording stays.
  assert.deepEqual(context('o4'), []);
  assert.equal(wording('o4'), "Removed by the site's moderators");
  assert.doesNotMatch(h.$('#g-comment-o4').textContent, /not a date/);

  // Only the reader's own removed or held comments get it.
  assert.deepEqual(context('x1'), []);
  assert.equal(wording('x1'), 'This comment was removed.');
  assert.equal(context('c1').length, 0);
  assert.match(h.$('#g-comment-c1 time').textContent, /^3 min\.? ago$/);
  assert.equal(
    h.$$('time').filter((node) => /^Your comment from /.test(node.textContent))
      .length,
    3,
  );
});

test('a comment restored on appeal says so under its text', async () => {
  const restored = comment('v1', {
    own: {
      state: 'VISIBLE',
      appeal: { state: 'RESTORED', decidedAt: new Date().toISOString() },
      canAppeal: false,
    },
  });
  const h = await boot({
    session: SIGNED_IN,
    handler: api({ 'GET /comments': thread([restored]) }),
  });
  await h.ready();
  assert.equal(h.$('#g-comment-v1 > .g-comment__body').textContent, 'Hello v1');
  assert.equal(
    h.$('#g-comment-v1 > .g-interactions__notice').textContent,
    'Restored after review',
  );
  assert.ok(!h.$('#g-comment-v1').classList.contains('g-comment--tombstone'));
});

test('appeal: the note is posted with the bearer token, the state appears under the comment, Escape returns focus', async () => {
  const reply = comment('r1', { parentId: 'o1', depth: 1 });
  const h = await boot({
    session: SIGNED_IN,
    handler: api({
      'GET /comments': thread([ownComment('o1', {}, { replies: [reply] })]),
      'POST /appeals': { status: 202, body: { status: 'RECEIVED' } },
    }),
  });
  await h.ready();
  const trigger = h.$('#g-comment-o1 > .g-comment__actions .g-comment__action');
  trigger.focus();
  trigger.click();
  const input = h.$('#g-comment-o1 textarea');
  assert.ok(input, 'a note field opens');
  assert.equal(input.getAttribute('maxlength'), '1000');
  assert.equal(
    h.$(`label[for="${input.id}"]`).textContent,
    'Tell the moderators why this should be restored (up to 1,000 characters)',
  );
  assert.equal(h.window.document.activeElement, input);
  assert.equal(trigger.hidden, true, 'the button steps aside while writing');
  input.dispatchEvent(
    new h.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
  );
  assert.equal(h.$('#g-comment-o1 textarea'), null);
  assert.equal(trigger.hidden, false);
  assert.equal(h.window.document.activeElement, trigger);
  assert.equal(h.bodyCalls('POST', '/appeals').length, 0);

  trigger.click();
  h.$('#g-comment-o1 textarea').value = '  He was quoting a book.  ';
  const send = h
    .$$('#g-comment-o1 .g-composer__submit')
    .find((b) => b.textContent === 'Send');
  send.click();
  await h.waitFor(() => !h.$('#g-comment-o1 textarea'), 'form closed');
  const call = h.bodyCalls('POST', '/v2/public/comments/o1/appeals')[0];
  assert.equal(call.url, `${API}/v2/public/comments/o1/appeals`);
  assert.equal(call.init.headers.Authorization, 'Bearer tok-123');
  assert.equal(call.init.headers['Content-Type'], 'application/json');
  assert.equal(call.init.credentials, 'omit');
  assert.deepEqual(JSON.parse(call.init.body), {
    note: 'He was quoting a book.',
  });
  assert.equal(
    h.$('#g-comment-o1 > .g-interactions__notice').textContent,
    'Appeal sent. The moderators will look again.',
  );
  assert.equal(
    h.$('#g-comment-o1 > .g-comment__body').textContent,
    "Removed by the site's moderators",
  );
  assert.equal(h.$('#g-comment-o1 > .g-comment__actions'), null);
  assert.equal(
    h.$$('#g-comment-o1 .g-comment__replies > .g-comment').length,
    1,
  );
  // The comment's state draws the sentence; the status line does not repeat it.
  await pastAnnouncements();
  assert.equal(h.status(), '');
  assert.equal(occurrences(h, APPEAL_SENT), 1);
  assert.equal(h.window.document.activeElement, h.$('#g-comment-o1'));
});

test('appeal: the sent sentence is drawn once, from the comment state, after the send and after the thread is read again', async () => {
  // The fake server remembers the appeal, as the real one does.
  let appealed = false;
  const handler = api({
    'GET /comments': () =>
      thread([
        appealed
          ? ownComment('o1', {
              canAppeal: false,
              appeal: { state: 'PENDING' },
            })
          : ownComment('o1'),
      ]),
    'POST /appeals': () => {
      appealed = true;
      return { status: 202, body: { status: 'RECEIVED' } };
    },
  });
  const noticesOf = (page) =>
    page
      .$$('#g-comment-o1 > .g-interactions__notice')
      .map((node) => node.textContent);

  const h = await boot({ session: SIGNED_IN, handler });
  await h.ready();
  assert.equal(occurrences(h, APPEAL_SENT), 0, 'nothing is sent yet');
  h.$('#g-comment-o1 .g-comment__action').click();
  h.$('#g-comment-o1 textarea').value = 'He was quoting a book.';
  h.$('#g-comment-o1 .g-composer__submit').click();
  await h.waitFor(() => !h.$('#g-comment-o1 textarea'), 'form closed');
  await pastAnnouncements();
  // Once, under the comment, from its state; not again in the status line.
  assert.equal(occurrences(h, APPEAL_SENT), 1);
  assert.deepEqual(noticesOf(h), [APPEAL_SENT]);
  assert.equal(h.status(), '');
  assert.match(
    h.$('#g-comment-o1 > time.g-comment__time').textContent,
    /^Your comment from 3 min\.? ago$/,
  );

  // Read the thread again: the server's state draws the same one sentence.
  const again = await boot({ session: SIGNED_IN, handler });
  await again.ready();
  await pastAnnouncements();
  assert.equal(occurrences(again, APPEAL_SENT), 1);
  assert.deepEqual(noticesOf(again), [APPEAL_SENT]);
  assert.equal(again.status(), '');
  assert.equal(again.$('#g-comment-o1 > .g-comment__actions'), null);
  assert.match(
    again.$('#g-comment-o1 > time.g-comment__time').textContent,
    /^Your comment from 3 min\.? ago$/,
  );
});

test('appeal problems: each code has its sentence; rate limit and network keep the note, a settled one stops offering the appeal', async () => {
  const cases = [
    {
      result: problem(409, 'APPEAL_EXISTS'),
      message: 'You already appealed this decision.',
      settled: 'Appeal sent. The moderators will look again.',
    },
    {
      result: problem(409, 'APPEAL_NOT_ALLOWED'),
      message: "This comment can't be appealed.",
      settled: null,
    },
    {
      result: problem(429, 'RATE_LIMITED'),
      message: "You've sent several appeals today. Try again tomorrow.",
    },
    {
      result: new TypeError('offline'),
      message: "Couldn't reach Galascribe. Your draft is kept.",
    },
    {
      result: problem(401, 'READER_AUTHENTICATION_REQUIRED'),
      message: 'Sign in again to continue.',
    },
  ];
  for (const { result, message, settled } of cases) {
    const h = await boot({
      session: SIGNED_IN,
      handler: api({
        'GET /comments': thread([ownComment('o1')]),
        'POST /appeals': result,
      }),
    });
    await h.ready();
    h.$('#g-comment-o1 .g-comment__action').click();
    h.$('#g-comment-o1 textarea').value = 'Please look again';
    h.$('#g-comment-o1 .g-composer__submit').click();
    await h.waitFor(() => h.status() === message, message);
    if (settled !== undefined) {
      // The answer is final for this removal: the form and the button go.
      assert.equal(h.$('#g-comment-o1 textarea'), null, message);
      assert.equal(h.$('#g-comment-o1 > .g-comment__actions'), null, message);
      assert.equal(
        h.$('#g-comment-o1 > .g-interactions__notice')?.textContent ?? null,
        settled,
        message,
      );
      continue;
    }
    // Otherwise the form stays with the note, and says why.
    assert.equal(h.$('#g-comment-o1 .g-composer__error').textContent, message);
    assert.equal(h.$('#g-comment-o1 textarea').value, 'Please look again');
    assert.equal(h.$('#g-comment-o1 .g-composer__submit').disabled, false);
    if (result.status === 401) {
      assert.equal(h.window.localStorage.getItem(SESSION_KEY), null);
    }
  }
});

test('appeal: an empty note and one over 1,000 characters never reach the API', async () => {
  const h = await boot({
    session: SIGNED_IN,
    handler: api({
      'GET /comments': thread([ownComment('o1')]),
      'POST /appeals': { status: 202, body: { status: 'RECEIVED' } },
    }),
  });
  await h.ready();
  h.$('#g-comment-o1 .g-comment__action').click();
  const send = h.$('#g-comment-o1 .g-composer__submit');
  h.$('#g-comment-o1 textarea').value = '   ';
  send.click();
  assert.equal(
    h.$('#g-comment-o1 .g-composer__error').textContent,
    'Write why you are appealing first.',
  );
  h.$('#g-comment-o1 textarea').value = 'x'.repeat(1001);
  send.click();
  assert.equal(
    h.$('#g-comment-o1 .g-composer__error').textContent,
    "That's longer than 1,000 characters.",
  );
  assert.equal(h.bodyCalls('POST', '/appeals').length, 0);
  h.$('#g-comment-o1 textarea').value = 'x'.repeat(1000);
  send.click();
  await h.waitFor(() => !h.$('#g-comment-o1 textarea'), 'sent at the limit');
  assert.equal(h.bodyCalls('POST', '/appeals').length, 1);
});

test('error wording: 401 drops the session, 429, closed, invalid reasons, network', async () => {
  const cases = [
    [
      problem(429, 'RATE_LIMITED'),
      "You're posting too quickly. Try again in a minute.",
    ],
    [problem(403, 'COMMENTS_CLOSED'), 'Comments are closed.'],
    [problem(400, 'COMMENT_INVALID', 'EMPTY'), 'Write something first.'],
    [
      problem(400, 'COMMENT_INVALID', 'TOO_LONG'),
      "That's longer than 10,000 characters.",
    ],
    [
      problem(400, 'COMMENT_INVALID', 'TOO_MANY_LINKS'),
      'Too many links in one comment.',
    ],
    [
      problem(400, 'COMMENT_INVALID', 'BLOCKED_PATTERN'),
      "That comment contains something we can't post (for example a password or key).",
    ],
    [
      new TypeError('offline'),
      "Couldn't reach Galascribe. Your draft is kept.",
    ],
    [
      problem(401, 'READER_AUTHENTICATION_REQUIRED'),
      'Sign in again to continue.',
    ],
  ];
  for (const [result, message] of cases) {
    const h = await boot({
      session: SIGNED_IN,
      handler: api({ 'POST /comments': result }),
    });
    await h.ready();
    const input = h.$('.g-composer__input');
    input.value = 'hello';
    h.$('.g-composer__submit').click();
    await h.waitFor(
      () => h.$('.g-composer__error').textContent === message,
      message,
    );
    assert.equal(h.status(), message);
    assert.equal(input.value, 'hello', 'draft kept');
    if (result.status === 401) {
      assert.equal(h.window.localStorage.getItem(SESSION_KEY), null);
      assert.equal(
        h.$('.g-composer__signin').hidden,
        false,
        'sign-in offered, draft still visible',
      );
      assert.equal(input.hidden, false);
    }
  }
});

test('client-side checks: empty and over 10,000 code points never reach the API; counter under 500 left', async () => {
  const h = await boot({ session: SIGNED_IN, handler: api() });
  await h.ready();
  const input = h.$('.g-composer__input');
  h.$('.g-composer__submit').click();
  assert.equal(h.$('.g-composer__error').textContent, 'Write something first.');
  assert.equal(h.$('.g-composer__counter').hidden, true);
  input.value = 'x'.repeat(9600);
  input.dispatchEvent(new h.window.Event('input', { bubbles: true }));
  assert.equal(h.$('.g-composer__counter').hidden, false);
  assert.match(
    h.$('.g-composer__counter').textContent,
    /^400 characters left$/,
  );
  input.value = '\u{1F600}'.repeat(10_001);
  h.$('.g-composer__submit').click();
  assert.equal(
    h.$('.g-composer__error').textContent,
    "That's longer than 10,000 characters.",
  );
  assert.equal(h.bodyCalls('POST', '/comments').length, 0);
});

test('sign out calls DELETE tokens/current and forgets the session', async () => {
  const h = await boot({
    session: SIGNED_IN,
    handler: api({
      'DELETE /v2/reader/tokens/current': { status: 204, body: null },
    }),
  });
  await h.ready();
  h.$('.g-interactions__signout').click();
  await h.waitFor(
    () => h.bodyCalls('DELETE', '/v2/reader/tokens/current').length === 1,
    'delete',
  );
  assert.equal(
    h.bodyCalls('DELETE', '/v2/reader/tokens/current')[0].init.headers
      .Authorization,
    'Bearer tok-123',
  );
  await h.waitFor(
    () => h.window.localStorage.getItem(SESSION_KEY) === null,
    'removed',
  );
  await h.waitFor(
    () => h.$('.g-composer__signin') && !h.$('.g-composer__signin').hidden,
    'signed out composer',
  );
  await h.waitFor(() => h.status() === 'Signed out.', 'announce');
});

test('show more loads the next page with the cursor', async () => {
  const h = await boot({
    handler: api({
      'GET /comments': (call) =>
        call.url.includes('cursor=NEXT')
          ? {
              status: 200,
              body: {
                items: [comment('c3')],
                nextCursor: null,
                count: NO_COUNT,
              },
            }
          : {
              status: 200,
              body: {
                items: [comment('c1')],
                nextCursor: 'NEXT',
                count: NO_COUNT,
              },
            },
    }),
  });
  await h.ready();
  const more = h.$('[data-gala-more]');
  assert.equal(more.hidden, false);
  more.click();
  await h.waitFor(() => h.$('#g-comment-c3'), 'second page');
  assert.equal(h.$('[data-gala-more]').hidden, true);
  assert.deepEqual(
    h.$$('.g-comment-list > .g-comment').map((n) => n.id),
    ['g-comment-c1', 'g-comment-c3'],
  );
});

test('moreReplies fetches children of that comment', async () => {
  const parent = comment('p', {
    moreReplies: true,
    replies: [comment('r1', { parentId: 'p', depth: 1 })],
  });
  const h = await boot({
    handler: api({
      'GET /comments': (call) =>
        call.url.includes('parentId=p')
          ? {
              status: 200,
              body: {
                items: [
                  comment('r1', { parentId: 'p', depth: 1 }),
                  comment('r2', { parentId: 'p', depth: 1 }),
                ],
                nextCursor: null,
                count: NO_COUNT,
              },
            }
          : {
              status: 200,
              body: { items: [parent], nextCursor: null, count: NO_COUNT },
            },
    }),
  });
  await h.ready();
  h.$('.g-comment__more-replies').click();
  await h.waitFor(() => h.$('#g-comment-r2'), 'r2');
  assert.equal(h.$$('#g-comment-p .g-comment__replies > .g-comment').length, 2);
  assert.equal(h.$('.g-comment__more-replies'), null);
});

test('storage blocked: reading works, signing in explains why it cannot proceed', async () => {
  const h = await boot({ blockStorage: true, handler: api() });
  await h.ready();
  assert.equal(h.$$('.g-comment-list > .g-comment').length, 2);
  assert.equal(h.$('[data-reaction-key="like"]').disabled, false);
  h.$('[data-reaction-key="like"]').click();
  await h.waitFor(
    () => /blocked storage this site needs to sign you in/.test(h.status()),
    'message',
  );
  assert.equal(
    h.status(),
    'Your browser blocked storage this site needs to sign you in.',
  );
  assert.equal(h.navigations.length, 0);
  h.$('.g-composer__signin').click();
  await new Promise((resolve) => setTimeout(resolve, 60));
  assert.equal(h.navigations.length, 0);
});

test('API down: section shows the unavailable notice; the article is untouched', async () => {
  const h = await boot({ handler: () => new TypeError('Failed to fetch') });
  await h.waitFor(
    () =>
      /unavailable right now/.test(
        h.$('[data-gala-static-notice]').textContent,
      ) && !h.$('[data-gala-static-notice]').hidden,
    'notice',
  );
  assert.equal(
    h.$('[data-gala-static-notice]').textContent,
    'Responses are unavailable right now.',
  );
  assert.equal(h.$$('.g-comment').length, 0);
  assert.equal(h.$('article').childNodes.length, 0);
});

test('API 5xx also yields the unavailable notice', async () => {
  const h = await boot({ handler: () => problem(503, 'UNAVAILABLE') });
  await h.waitFor(
    () =>
      !h.$('[data-gala-static-notice]').hidden &&
      /unavailable/.test(h.$('[data-gala-static-notice]').textContent),
    'notice',
  );
});

test('a request that never answers is aborted after 15 seconds and treated as unreachable', async () => {
  const h = await boot({
    shrinkTimeout: true,
    handler: (call) =>
      new Promise((resolve, reject) => {
        call.init.signal.addEventListener('abort', () =>
          reject(new Error('aborted')),
        );
      }),
  });
  await h.waitFor(
    () =>
      /unavailable right now/.test(
        h.$('[data-gala-static-notice]').textContent,
      ) && !h.$('[data-gala-static-notice]').hidden,
    'notice after abort',
  );
  assert.ok(h.calls.every((call) => call.init.signal.aborted));
});

test('source rules: no innerHTML, popup, postMessage, iframe, cookie, FedCM, credentials include', () => {
  const code = SOURCE.replace(/\/\*[\s\S]*?\*\//g, '').replace(
    /^\s*\/\/.*$/gm,
    '',
  );
  for (const forbidden of [
    /innerHTML/,
    /outerHTML/,
    /insertAdjacentHTML/,
    /document\.write/,
    /window\.open|\bopen\s*\(\s*['"]http/,
    /postMessage/,
    /iframe/i,
    /document\.cookie/,
    /navigator\.credentials/,
    /credentials:\s*['"](include|same-origin)/,
    /\beval\s*\(/,
    /new Function/,
    /importScripts|XMLHttpRequest/,
  ]) {
    assert.doesNotMatch(code, forbidden);
  }
  assert.match(code, /credentials:\s*'omit'/);
  assert.match(code, /mode:\s*'cors'/);
  assert.match(SOURCE, /^\/\*\*/);
  assert.match(code, /'use strict'/);
});

test('runtime: no innerHTML setter, window.open or postMessage is ever invoked', async () => {
  const h = await boot({
    session: SIGNED_IN,
    handler: api({
      'POST /comments': {
        status: 201,
        body: comment('z', { body: '<img src=x onerror=alert(1)>' }),
      },
    }),
  });
  const { window } = h;
  const trip = [];
  window.open = () => trip.push('open');
  window.postMessage = () => trip.push('postMessage');
  const desc = Object.getOwnPropertyDescriptor(
    window.Element.prototype,
    'innerHTML',
  );
  Object.defineProperty(window.Element.prototype, 'innerHTML', {
    configurable: true,
    get: desc.get,
    set() {
      trip.push('innerHTML');
    },
  });
  await h.ready();
  h.$('.g-composer__input').value = 'x';
  h.$('.g-composer__submit').click();
  await h.waitFor(() => h.$('#g-comment-z'), 'posted');
  h.$$('#g-comment-c1 .g-comment__action')
    .find((b) => b.textContent === 'Report')
    .click();
  assert.equal(h.$$('img').length, 0);
  assert.deepEqual(trip, []);
});

test('the script does nothing when the section is absent', () => {
  const dom = new JSDOM('<!doctype html><p>no section</p>', {
    url: PAGE,
    runScripts: 'outside-only',
  });
  let fetched = false;
  dom.window.fetch = () => {
    fetched = true;
  };
  dom.window.eval(SOURCE);
  assert.equal(fetched, false);
});
