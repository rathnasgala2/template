/**
 * Author Follow control: where it renders and when it does not, its markup and
 * messages (English and Tamil), the interactions-config `follows` member, and
 * the shipped `gala-audience.js` driving it in JSDOM (connect hand-off and
 * resume, GET/PUT/DELETE, pending and error states), plus the hand-off rules
 * with `gala-interactions.js`.
 */

import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import {
  AUDIENCE_MARKER,
  audienceOrigins,
  followsEnabled,
  renderFollowControl,
} from '../src/core/internal/audience.js';
import {
  interactionsActive,
  validateInteractionsModule,
} from '../src/core/internal/interactions.js';
import { getMessages } from '../src/core/internal/messages.js';
import { buildGeneratedPages } from '../src/core/internal/page-kinds.js';
import { buildRichFixture } from './helpers/page-kind-fixtures.js';
import {
  APP,
  AUDIENCE_SOURCE,
  AUTHOR,
  FOLLOW_PATH,
  PAGE,
  PENDING_KEY,
  PUBLICATION,
  SESSION,
  SESSION_KEY,
  audiencePage,
  bootAudience,
  problem,
  routed,
} from './helpers/audience-dom.js';

const AUDIENCE_ON = { follows: true, appOrigin: APP };

/**
 * @param {object} [options]
 * @param {{follows: boolean, appOrigin: string}} [options.audience]
 * @returns {Promise<{pages: any[], input: any}>}
 */
async function build(options = {}) {
  const input = /** @type {any} */ (await buildRichFixture());
  const pages = buildGeneratedPages(input, {
    pageBody: (body) => body,
    ...(options.audience ? { audience: options.audience } : {}),
  });
  return { pages, input };
}

const count = (/** @type {string} */ html, /** @type {string} */ needle) =>
  html.split(needle).length - 1;

test('follows off: no page carries any trace of the control, whether the option is absent or says off', async () => {
  const bare = await build();
  const off = await build({ audience: { follows: false, appOrigin: APP } });
  assert.deepEqual(
    off.pages.map((page) => page.bodyHtml),
    bare.pages.map((page) => page.bodyHtml),
    'follows: false renders the same bytes as no audience option',
  );
  for (const page of bare.pages) {
    assert.ok(!page.bodyHtml.includes(AUDIENCE_MARKER), page.route);
    assert.ok(!page.bodyHtml.includes('g-follow'), page.route);
  }
});

test('follows on: the article byline and author card, and the author page, each carry one control per author', async () => {
  const { pages, input } = await build({ audience: AUDIENCE_ON });
  const first = pages.find(
    (page) => page.kind === 'article' && page.title === 'First article',
  );
  assert.ok(first);
  const [canonicalAuthor, secondAuthor] = input.authors;
  // Byline (inside .g-byline, after the text block) and author card.
  assert.equal(count(first.bodyHtml, AUDIENCE_MARKER), 2);
  assert.match(
    first.bodyHtml,
    /<div class="g-byline">.*?<\/div><span class="g-follow" data-gala-audience="follow" data-author-id="[^"]+"[^>]*>.*?<\/span><\/div>/s,
  );
  assert.match(
    first.bodyHtml,
    /<section class="g-author-card".*?<span class="g-follow" data-gala-audience="follow"[^>]*>.*?<\/span><\/div><\/section>/s,
  );
  assert.ok(first.bodyHtml.includes(`data-author-id="${canonicalAuthor.id}"`));
  assert.ok(!first.bodyHtml.includes(`data-author-id="${secondAuthor.id}"`));

  const second = pages.find(
    (page) => page.kind === 'article' && page.title === 'Second article',
  );
  assert.ok(second?.bodyHtml.includes(`data-author-id="${secondAuthor.id}"`));

  for (const author of input.authors) {
    const authorPage = pages.find(
      (page) => page.kind === 'author' && page.title === author.displayName,
    );
    assert.ok(authorPage, author.displayName);
    assert.equal(count(authorPage.bodyHtml, AUDIENCE_MARKER), 1);
    assert.ok(authorPage.bodyHtml.includes(`data-author-id="${author.id}"`));
    // After the biography and links, inside the page head.
    assert.match(
      authorPage.bodyHtml,
      /<section class="g-wrap g-topic-hero">.*<span class="g-follow".*<\/section>/s,
    );
  }
});

test('follows on: home, tag, series, archive and policy pages and unlisted pages stay free of the control', async () => {
  const { pages } = await build({ audience: AUDIENCE_ON });
  const carriers = pages
    .filter((page) => page.bodyHtml.includes(AUDIENCE_MARKER))
    .map((page) => page.kind);
  assert.deepEqual(
    [...new Set(carriers)].sort(),
    ['article', 'author'],
    'only article and author pages',
  );
  // The home cover story has a byline of its own and must not gain a control.
  const home = pages.find((page) => page.kind === 'index');
  assert.ok(home?.bodyHtml.includes('g-byline'));
  assert.ok(!home.bodyHtml.includes('g-follow'));
  // A `page` document has no author card, byline or control.
  const plain = pages.find((page) => page.title === 'Contact');
  assert.ok(plain && !plain.bodyHtml.includes('g-follow'));
});

test('the control markup: hidden until the script, names the author, one polite live region', () => {
  const html = renderFollowControl({
    author: { id: AUTHOR, displayName: 'Ana "A" <Lima>' },
    messages: getMessages('en'),
  });
  assert.match(
    html,
    /^<span class="g-follow" data-gala-audience="follow" data-author-id="[^"]+" data-author-name="Ana &quot;A&quot; &lt;Lima&gt;" data-state="idle" hidden>/,
  );
  assert.match(
    html,
    /<button class="g-btn g-follow-btn" type="button" data-follow-action="follow" aria-label="Follow Ana &quot;A&quot; &lt;Lima&gt;">.*<span>Follow<\/span><\/button>/s,
  );
  assert.match(
    html,
    /<span class="g-follow-on" data-follow-on hidden>.*<span>Following<\/span><\/span><button class="g-follow-undo" type="button" data-follow-action="unfollow" aria-label="Unfollow Ana &quot;A&quot; &lt;Lima&gt;">Unfollow<\/button><\/span>/s,
  );
  assert.equal(count(html, 'role="status" aria-live="polite"'), 1);
  assert.ok(!/<script|onclick|<form/i.test(html));
  assert.ok(!html.includes('<Lima>'), 'the name is escaped');
});

test('Tamil pages get Tamil labels, names and sentences', () => {
  const messages = getMessages('ta');
  const html = renderFollowControl({
    author: { id: AUTHOR, displayName: 'அன்னா' },
    messages,
  });
  assert.match(html, /<span>பின்தொடர்<\/span>/);
  assert.match(html, /<span>பின்தொடர்கிறீர்கள்<\/span>/);
  assert.match(html, /aria-label="அன்னா ஐப் பின்தொடர்"/);
  assert.match(html, /aria-label="அன்னா ஐப் பின்தொடர்வதை நிறுத்து"/);
  assert.match(html, />பின்தொடர்வதை நிறுத்து<\/button>/);
  const english = getMessages('en');
  for (const key of Object.keys(english)) {
    assert.ok(key in messages, `ta has ${key}`);
  }
});

test('followsEnabled needs the module and its follows switch, not reactions or comments', () => {
  /** @param {any} follows */
  const module = (follows) => ({
    config: {
      reactions: { enabled: false, definitions: [] },
      comments: { enabled: false, allowReplies: false, maxDepth: 1 },
      publicCounts: { reactions: false, comments: false },
      ...(follows === undefined ? {} : { follows }),
    },
    apiOrigin: 'https://api.galascribe.com',
    appOrigin: APP,
  });
  assert.equal(followsEnabled(undefined), false);
  assert.equal(followsEnabled(/** @type {any} */ (module(undefined))), false);
  assert.equal(
    followsEnabled(/** @type {any} */ (module({ enabled: false }))),
    false,
  );
  const on = /** @type {any} */ (module({ enabled: true }));
  assert.equal(followsEnabled(on), true);
  assert.equal(interactionsActive(on), false, 'independent of reactions');
  assert.deepEqual(audienceOrigins(on), {
    apiOrigin: on.apiOrigin,
    appOrigin: APP,
  });
  assert.deepEqual(audienceOrigins(undefined), {
    apiOrigin: 'https://api.galascribe.com',
    appOrigin: APP,
  });
});

test('the interactions module admits the optional follows member and checks its shape', () => {
  const base = () => ({
    config: {
      schemaId: 'urn:gala:schema:interactions-config:2.0.0',
      schemaVersion: '2.0.0',
      reactions: { enabled: true, definitions: [] },
      comments: { enabled: true, allowReplies: true, maxDepth: 3 },
      publicCounts: { reactions: true, comments: true },
    },
    apiOrigin: 'https://api.galascribe.com',
    appOrigin: APP,
  });
  assert.doesNotThrow(() => validateInteractionsModule(base()));
  const on = base();
  /** @type {any} */ (on.config).follows = { enabled: true };
  assert.doesNotThrow(() => validateInteractionsModule(on));
  for (const bad of [
    { enabled: 'yes' },
    { enabled: true, extra: 1 },
    {},
    null,
  ]) {
    const candidate = base();
    /** @type {any} */ (candidate.config).follows = bad;
    assert.throws(() => validateInteractionsModule(candidate), /follows/);
  }
});

// ------------------------------------------------------------------ script ---

/**
 * A page with a byline control and an author-card control for one author, and
 * one more for a second author.
 *
 * @returns {string}
 */
function followMarkup() {
  const messages = getMessages('en');
  const control = (/** @type {string} */ id, /** @type {string} */ name) =>
    renderFollowControl({ author: { id, displayName: name }, messages });
  return audiencePage(
    `<div class="g-byline">${control(AUTHOR, 'Ana Lima')}</div>` +
      `<section class="g-author-card">${control(AUTHOR, 'Ana Lima')}</section>` +
      `<div class="g-byline">${control('0190b1f0-0000-7000-8000-0000000000a2', 'Bo Chen')}</div>`,
  );
}

const statusOf = (/** @type {any} */ h, /** @type {number} */ index) =>
  h.$$('.g-follow-status')[index].textContent;
const stateOf = (/** @type {any} */ h, /** @type {number} */ index) =>
  h.$$('.g-follow')[index].dataset.state;

test('script, no token: controls are revealed, nothing is requested, Follow starts the reader connect and keeps the intent', async () => {
  const h = await bootAudience(followMarkup());
  await h.settle();
  assert.equal(h.calls.length, 0, 'no GET without a token');
  for (const control of h.$$('.g-follow')) assert.equal(control.hidden, false);
  assert.equal(
    h.$$('[data-follow-on]').every((on) => on.hidden),
    true,
  );

  h.$$('[data-follow-action="follow"]')[0].click();
  await h.settle();
  assert.equal(h.navigations.length, 1);
  const url = new URL(h.navigations[0]);
  assert.equal(url.origin + url.pathname, APP + '/reader/connect');
  assert.equal(url.searchParams.get('publication'), PUBLICATION);
  assert.equal(url.searchParams.get('return'), PAGE);
  assert.match(url.searchParams.get('challenge') ?? '', /^[A-Za-z0-9_-]{43}$/);
  const pending = h.pendingRecord();
  assert.equal(pending.state, url.searchParams.get('state'));
  assert.deepEqual(pending.intent, { kind: 'follow', authorId: AUTHOR });
  assert.match(pending.codeVerifier, /^[A-Za-z0-9_-]{86}$/);
  assert.equal(h.calls.length, 0, 'still no request');
});

test('script, with a token: one GET per distinct author, controls show the state, both controls of an author agree', async () => {
  const h = await bootAudience(followMarkup(), {
    session: SESSION,
    handler: routed({
      [`GET ${FOLLOW_PATH()}`]: { status: 200, body: { following: true } },
      [`GET ${FOLLOW_PATH('0190b1f0-0000-7000-8000-0000000000a2')}`]: {
        status: 200,
        body: { following: false },
      },
    }),
  });
  await h.settle();
  assert.deepEqual(
    h.calls
      .map((call) => call.method + ' ' + new URL(call.url).pathname)
      .sort(),
    [
      `GET ${FOLLOW_PATH()}`,
      `GET ${FOLLOW_PATH('0190b1f0-0000-7000-8000-0000000000a2')}`,
    ].sort(),
  );
  for (const call of h.calls) {
    assert.equal(call.headers.Authorization, 'Bearer ' + SESSION.accessToken);
    assert.equal(call.init.credentials, 'omit');
    assert.equal(call.init.mode, 'cors');
    assert.ok(call.url.startsWith('https://api.galascribe.com/'));
  }
  assert.deepEqual(
    [0, 1, 2].map((i) => stateOf(h, i)),
    ['following', 'following', 'idle'],
  );
  const [first, , third] = h.$$('.g-follow');
  assert.equal(first.querySelector('[data-follow-on]').hidden, false);
  assert.equal(
    first.querySelector('[data-follow-action="follow"]').hidden,
    true,
  );
  assert.equal(third.querySelector('[data-follow-on]').hidden, true);
});

test('script: Follow and Unfollow call PUT and DELETE, hold the control pending, announce, and ignore a second click', async () => {
  /** @type {(value: any) => void} */
  let release = () => {};
  const h = await bootAudience(followMarkup(), {
    session: SESSION,
    handler: routed({
      [`GET ${FOLLOW_PATH()}`]: { status: 200, body: { following: false } },
      [`GET ${FOLLOW_PATH('0190b1f0-0000-7000-8000-0000000000a2')}`]: {
        status: 200,
        body: { following: false },
      },
      [`PUT ${FOLLOW_PATH()}`]: () =>
        new Promise((resolve) => {
          release = resolve;
        }),
      [`DELETE ${FOLLOW_PATH()}`]: { status: 200, body: { following: false } },
    }),
  });
  await h.settle();
  const follow = h.$$('[data-follow-action="follow"]')[0];
  follow.click();
  await h.settle();
  assert.equal(stateOf(h, 0), 'pending');
  assert.equal(h.$$('.g-follow')[0].getAttribute('aria-busy'), 'true');
  assert.equal(follow.getAttribute('aria-disabled'), 'true');
  assert.equal(follow.hidden, false, 'the half in view stays in view');
  follow.click();
  await h.settle();
  assert.equal(
    h.calls.filter((call) => call.method === 'PUT').length,
    1,
    'a second click while pending sends nothing',
  );
  release({ status: 200, body: { following: true } });
  await h.settle();
  assert.deepEqual(
    [0, 1, 2].map((i) => stateOf(h, i)),
    ['following', 'following', 'idle'],
  );
  assert.equal(h.$$('.g-follow')[0].hasAttribute('aria-busy'), false);
  assert.equal(statusOf(h, 0), 'You now follow Ana Lima.');
  assert.equal(statusOf(h, 1), '', 'only the control used announces');

  h.$$('[data-follow-action="unfollow"]')[0].click();
  await h.settle();
  assert.deepEqual(
    [0, 1].map((i) => stateOf(h, i)),
    ['idle', 'idle'],
  );
  assert.equal(statusOf(h, 0), 'You no longer follow Ana Lima.');
  assert.equal(h.calls.filter((call) => call.method === 'DELETE').length, 1);
});

test('script: a failed follow restores the control and says why, in the live region', async () => {
  const cases = [
    [
      'FOLLOWS_DISABLED',
      problem(409, 'FOLLOWS_DISABLED'),
      "Following isn't available on this site right now.",
    ],
    [
      'AUTHOR_NOT_FOUND',
      problem(404, 'AUTHOR_NOT_FOUND'),
      "This author can't be followed right now.",
    ],
    [
      'PUBLICATION_NOT_LIVE',
      problem(404, 'PUBLICATION_NOT_LIVE'),
      "This author can't be followed right now.",
    ],
    [
      'RATE_LIMITED',
      problem(429, 'RATE_LIMITED'),
      'Too many attempts. Try again in a moment.',
    ],
    [
      'server error',
      { status: 500, body: {} },
      'Something went wrong. Try again.',
    ],
    ['network', new Error('offline'), "Couldn't reach Galascribe. Try again."],
  ];
  for (const [label, answer, sentence] of cases) {
    const h = await bootAudience(followMarkup(), {
      session: SESSION,
      handler: routed({
        [`GET ${FOLLOW_PATH()}`]: { status: 200, body: { following: false } },
        [`PUT ${FOLLOW_PATH()}`]: answer,
      }),
    });
    await h.settle();
    h.$$('[data-follow-action="follow"]')[0].click();
    await h.settle();
    assert.equal(statusOf(h, 0), sentence, String(label));
    assert.equal(stateOf(h, 0), 'idle', `${label}: back to Follow`);
    assert.equal(
      h.$$('.g-follow')[0].hasAttribute('data-error'),
      true,
      String(label),
    );
    assert.equal(h.$$('.g-follow')[0].hasAttribute('aria-busy'), false);
    assert.equal(
      h.$$('.g-follow-status')[0].getAttribute('aria-live'),
      'polite',
    );
    assert.notEqual(h.storage(SESSION_KEY), null, `${label}: token kept`);
  }
});

test('script: a rejected token is dropped and the failure is announced; a failed Unfollow stays Following', async () => {
  const h = await bootAudience(followMarkup(), {
    session: SESSION,
    handler: routed({
      [`GET ${FOLLOW_PATH()}`]: { status: 200, body: { following: true } },
      [`DELETE ${FOLLOW_PATH()}`]: problem(
        401,
        'READER_AUTHENTICATION_REQUIRED',
      ),
    }),
  });
  await h.settle();
  h.$$('[data-follow-action="unfollow"]')[0].click();
  await h.settle();
  assert.equal(stateOf(h, 0), 'following');
  assert.equal(statusOf(h, 0), 'Something went wrong. Try again.');
  assert.equal(h.storage(SESSION_KEY), null, 'the stale token is removed');

  const adding = await bootAudience(followMarkup(), {
    session: SESSION,
    handler: routed({
      [`GET ${FOLLOW_PATH()}`]: { status: 200, body: { following: false } },
      [`PUT ${FOLLOW_PATH()}`]: problem(403, 'READER_TOKEN_SCOPE'),
    }),
  });
  await adding.settle();
  adding.$$('[data-follow-action="follow"]')[0].click();
  await adding.settle();
  assert.equal(adding.storage(SESSION_KEY), null);
  assert.equal(statusOf(adding, 0), "Sign-in didn't complete. Try again.");
});

test('script: an author the API does not know is not offered; a token the API rejects on read is dropped', async () => {
  const gone = await bootAudience(followMarkup(), {
    session: SESSION,
    handler: routed({
      [`GET ${FOLLOW_PATH()}`]: problem(404, 'AUTHOR_NOT_FOUND'),
      [`GET ${FOLLOW_PATH('0190b1f0-0000-7000-8000-0000000000a2')}`]: {
        status: 200,
        body: { following: false },
      },
    }),
  });
  await gone.settle();
  assert.deepEqual(
    gone.$$('.g-follow').map((control) => control.hidden),
    [true, true, false],
  );
  const stale = await bootAudience(followMarkup(), {
    session: SESSION,
    handler: routed({
      [`GET ${FOLLOW_PATH()}`]: problem(401, 'READER_AUTHENTICATION_REQUIRED'),
      [`GET ${FOLLOW_PATH('0190b1f0-0000-7000-8000-0000000000a2')}`]: problem(
        401,
        'READER_AUTHENTICATION_REQUIRED',
      ),
    }),
  });
  await stale.settle();
  assert.equal(stale.storage(SESSION_KEY), null);
  assert.deepEqual(
    [0, 1, 2].map((i) => stateOf(stale, i)),
    ['idle', 'idle', 'idle'],
  );
});

/**
 * @param {string} hash
 * @param {Record<string, unknown>} pending
 * @param {Record<string, any>} routes
 */
async function returnFromApp(hash, pending, routes) {
  return bootAudience(followMarkup(), {
    hash,
    pending,
    handler: routed(routes),
  });
}

const PENDING = Object.freeze({
  state: 'state-abc',
  codeVerifier: 'v'.repeat(86),
  intent: { kind: 'follow', authorId: AUTHOR },
  createdAt: Date.now(),
});
const RETURN_HASH = '#gala-reader-code=code-1&gala-reader-state=state-abc';

test('script: returning from the App exchanges the code, stores the token, scrubs the URL and resumes the follow', async () => {
  const h = await returnFromApp(RETURN_HASH, PENDING, {
    'POST /v2/reader/tokens': {
      status: 200,
      body: {
        accessToken: 'fresh-token',
        expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
        reader: { displayName: 'Rae Reader', initials: 'RR' },
      },
    },
    [`GET ${FOLLOW_PATH()}`]: { status: 200, body: { following: false } },
    [`GET ${FOLLOW_PATH('0190b1f0-0000-7000-8000-0000000000a2')}`]: {
      status: 200,
      body: { following: false },
    },
    [`PUT ${FOLLOW_PATH()}`]: { status: 200, body: { following: true } },
  });
  await h.settle();
  const [exchange] = h.calls;
  assert.equal(exchange.method, 'POST');
  assert.equal(new URL(exchange.url).pathname, '/v2/reader/tokens');
  assert.deepEqual(exchange.body, {
    code: 'code-1',
    codeVerifier: PENDING.codeVerifier,
    publicationId: PUBLICATION,
  });
  assert.equal(exchange.headers.Authorization, undefined);
  assert.equal(JSON.parse(h.storage(SESSION_KEY)).accessToken, 'fresh-token');
  assert.equal(h.window.location.hash, '', 'fragment scrubbed');
  assert.equal(h.pendingRecord(), null, 'pending record consumed');
  const put = h.calls.find((call) => call.method === 'PUT');
  assert.ok(put, 'the follow is applied after return');
  assert.equal(put.headers.Authorization, 'Bearer fresh-token');
  assert.deepEqual(
    [0, 1, 2].map((i) => stateOf(h, i)),
    ['following', 'following', 'idle'],
  );
  assert.equal(statusOf(h, 0), 'You now follow Ana Lima.');
  assert.deepEqual(h.events, ['gala:reader-session']);
  assert.equal(h.navigations.length, 0, 'no second redirect');
});

test('script: a return with the wrong state, an old pending record or no code follows nobody', async () => {
  const stale = { ...PENDING, createdAt: Date.now() - 16 * 60 * 1000 };
  const cases = [
    ['wrong state', '#gala-reader-code=c&gala-reader-state=other', PENDING],
    ['stale', RETURN_HASH, stale],
    ['no code', '#gala-reader-state=state-abc&gala-reader-x=1', PENDING],
  ];
  for (const [label, hash, pending] of cases) {
    const h = await returnFromApp(
      /** @type {string} */ (hash),
      /** @type {any} */ (pending),
      {},
    );
    await h.settle();
    assert.equal(h.calls.length, 0, `${label}: no request at all`);
    assert.equal(h.storage(SESSION_KEY), null);
    assert.equal(statusOf(h, 0), "That sign-in link wasn't valid. Try again.");
  }
});

test('script: a failed token exchange says so and follows nobody', async () => {
  const refused = await returnFromApp(RETURN_HASH, PENDING, {
    'POST /v2/reader/tokens': problem(400, 'READER_CODE_INVALID'),
  });
  await refused.settle();
  assert.equal(statusOf(refused, 0), "Sign-in didn't complete. Try again.");
  assert.equal(refused.calls.length, 1);
  const offline = await returnFromApp(RETURN_HASH, PENDING, {
    'POST /v2/reader/tokens': () => new Error('offline'),
  });
  await offline.settle();
  assert.equal(statusOf(offline, 0), "Couldn't reach Galascribe. Try again.");
});

test('script: a return that belongs to the interactions script (any other intent) is left alone', async () => {
  const pending = {
    ...PENDING,
    intent: { kind: 'reaction', key: 'like' },
  };
  const h = await returnFromApp(RETURN_HASH, pending, {});
  await h.settle();
  assert.equal(h.calls.length, 0);
  assert.equal(h.window.location.hash, RETURN_HASH);
  assert.deepEqual(h.pendingRecord(), pending);
  assert.equal(h.storage(SESSION_KEY), null);
  assert.deepEqual(h.events, []);
});

test('script: blocked storage is explained instead of redirecting', async () => {
  const h = await bootAudience(followMarkup(), { blockStorage: true });
  await h.settle();
  h.$$('[data-follow-action="follow"]')[0].click();
  await h.settle();
  assert.equal(h.navigations.length, 0);
  assert.equal(
    statusOf(h, 0),
    'Your browser blocked storage this site needs to sign you in.',
  );
});

test('script: a second Follow click while the redirect is under way sends one reader to the App once', async () => {
  const h = await bootAudience(followMarkup());
  await h.settle();
  const button = h.$$('[data-follow-action="follow"]')[0];
  button.click();
  button.click();
  await h.settle();
  assert.equal(h.navigations.length, 1);
});

test('script: Tamil pages announce in Tamil', async () => {
  const messages = getMessages('ta');
  const html = audiencePage(
    renderFollowControl({
      author: { id: AUTHOR, displayName: 'அன்னா' },
      messages,
    }),
    'ta',
  );
  const h = await bootAudience(html, {
    session: SESSION,
    handler: routed({
      [`GET ${FOLLOW_PATH()}`]: { status: 200, body: { following: false } },
      [`PUT ${FOLLOW_PATH()}`]: { status: 200, body: { following: true } },
    }),
  });
  await h.settle();
  h.$$('[data-follow-action="follow"]')[0].click();
  await h.settle();
  assert.equal(statusOf(h, 0), 'நீங்கள் இப்போது அன்னா ஐப் பின்தொடர்கிறீர்கள்.');
});

test('script source: API text only through textContent, no innerHTML, eval, popup or postMessage', () => {
  const code = AUDIENCE_SOURCE.replace(/\/\*[\s\S]*?\*\//g, '').replace(
    /^\s*\/\/.*$/gm,
    '',
  );
  assert.ok(
    !/innerHTML|outerHTML|insertAdjacentHTML|document\.write/.test(code),
  );
  assert.ok(!/\beval\(|new Function|window\.open|postMessage/.test(code));
  assert.ok(!/document\.cookie/.test(code));
  assert.match(code, /credentials: 'omit'/);
  assert.match(code, /mode: 'cors'/);
  assert.ok(!code.includes(PENDING_KEY), 'keys are built, not baked in');
});
