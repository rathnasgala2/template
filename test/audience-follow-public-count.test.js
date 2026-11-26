/**
 * The follower count a site chooses to show everyone (schemas 3.56.0
 * `follows.publicCount`): the control's `data-follow-count-public` markup, and
 * the shipped `gala-audience.js` reading the follow state anonymously then,
 * showing the API's bucketed `publicFollowers`, hiding it at 0, keeping the
 * team's exact `followers`, and leaving the public figure in place when the
 * team's session is dropped. A site without the setting is unchanged.
 */

import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import {
  followsEnabled,
  followsPublicCount,
  renderFollowControl,
} from '../src/core/internal/audience.js';
import { validateInteractionsModule } from '../src/core/internal/interactions.js';
import { getMessages } from '../src/core/internal/messages.js';
import {
  AUTHOR,
  FOLLOW_PATH,
  SESSION,
  SESSION_KEY,
  audiencePage,
  bootAudience,
  routed,
} from './helpers/audience-dom.js';
import { interactionsModule } from './helpers/post-action-fixtures.js';

const OTHER = '0190b1f0-0000-7000-8000-0000000000a2';

/**
 * @param {boolean} publicCount whether the controls carry the marker
 * @returns {string} a page with three controls, two for one author
 */
function markup(publicCount) {
  const messages = getMessages('en');
  const control = (/** @type {string} */ id, /** @type {string} */ name) =>
    renderFollowControl({
      author: { id, displayName: name },
      messages,
      publicCount,
    });
  return audiencePage(
    `<div class="g-byline">${control(AUTHOR, 'Ana Lima')}</div>` +
      `<aside>${control(AUTHOR, 'Ana Lima')}</aside>` +
      `<div class="g-byline">${control(OTHER, 'Bo Chen')}</div>`,
  );
}

/**
 * @param {number} lowerBound the bucket's lower bound
 * @param {string} display its text
 * @returns {{lowerBound: number, display: string, label: string}} a bucket
 */
const bucket = (lowerBound, display) => ({
  lowerBound,
  display,
  label: `${display} followers`,
});

/**
 * @param {any} h the harness
 * @param {number} i the control index
 * @returns {{hidden: boolean, text: string}} the count's state
 */
const countOf = (h, i) => {
  const el = h.$$('[data-follow-count]')[i];
  return {
    hidden: el.hidden,
    text: el.querySelector('[data-follow-count-text]').textContent,
  };
};

/**
 * @param {unknown} body the first author's answer
 * @param {unknown} [other] the second author's answer
 * @returns {Record<string, any>} routes
 */
const getRoutes = (body, other = {}) => ({
  [`GET ${FOLLOW_PATH()}`]: { status: 200, body },
  [`GET ${FOLLOW_PATH(OTHER)}`]: { status: 200, body: other },
});

test('markup: the marker is on the control and the count has no team-only hint; without the setting nothing changes', () => {
  const author = { id: AUTHOR, displayName: 'Ana Lima' };
  const messages = getMessages('en');
  const open = renderFollowControl({ author, messages, publicCount: true });
  assert.match(
    open,
    /<span class="g-follow" data-gala-audience="follow"[^>]* data-follow-count-public data-state="idle" hidden>/,
  );
  assert.ok(!open.includes('Only your site'));
  assert.match(open, /<span class="g-follow-count" data-follow-count hidden>/);
  const closed = renderFollowControl({ author, messages });
  assert.equal(
    closed,
    renderFollowControl({ author, messages, publicCount: false }),
  );
  assert.ok(!closed.includes('data-follow-count-public'));
  assert.ok(closed.includes('Only your site&#39;s team sees this'));
});

test('config: publicCount needs follows on and reads as a boolean', () => {
  assert.equal(followsPublicCount(undefined), false);
  assert.equal(followsPublicCount(interactionsModule(true)), false);
  assert.equal(followsPublicCount(interactionsModule(true, false)), false);
  assert.equal(followsPublicCount(interactionsModule(true, true)), true);
  assert.equal(followsPublicCount(interactionsModule(false, true)), false);
  assert.equal(followsEnabled(interactionsModule(true, true)), true);
  const module = interactionsModule(true, true);
  assert.equal(
    validateInteractionsModule(module).config.follows?.publicCount,
    true,
  );
  assert.throws(
    () =>
      validateInteractionsModule({
        ...module,
        config: {
          ...module.config,
          follows: { enabled: true, publicCount: 'yes' },
        },
      }),
    /publicCount/,
  );
  assert.throws(
    () =>
      validateInteractionsModule({
        ...module,
        config: { ...module.config, follows: { enabled: true, extra: true } },
      }),
    /follows/,
  );
});

test('script, public count, no token: one anonymous read per author with a public control, no Authorization header, the bucket shown', async () => {
  const h = await bootAudience(markup(true), {
    handler: routed(
      getRoutes(
        { following: false, publicFollowers: bucket(20, '20+') },
        { following: false, publicFollowers: bucket(3, '3') },
      ),
    ),
  });
  await h.settle();
  assert.equal(h.calls.length, 2);
  for (const call of h.calls) {
    assert.equal(call.method, 'GET');
    assert.equal(call.headers.Authorization, undefined);
  }
  assert.deepEqual(countOf(h, 0), { hidden: false, text: '20+ followers' });
  assert.deepEqual(countOf(h, 1), { hidden: false, text: '20+ followers' });
  assert.deepEqual(countOf(h, 2), { hidden: false, text: '3 followers' });
  // The reader is not shown as following anyone.
  assert.equal(h.$$('.g-follow')[0].dataset.state, 'idle');
});

test('script, public count: a bucket of 1 is singular, 0 and malformed buckets show nothing', async () => {
  const h = await bootAudience(markup(true), {
    handler: routed(
      getRoutes(
        { publicFollowers: bucket(1, '1') },
        { publicFollowers: bucket(0, '0') },
      ),
    ),
  });
  await h.settle();
  assert.deepEqual(countOf(h, 0), { hidden: false, text: '1 follower' });
  assert.deepEqual(countOf(h, 2), { hidden: true, text: '' });
  for (const bad of [
    null,
    {},
    { lowerBound: -1, display: '-1' },
    { lowerBound: 1.5, display: '1.5' },
    { lowerBound: '5', display: '5' },
    { lowerBound: 5, display: '' },
    { lowerBound: 5 },
    'ten',
  ]) {
    const page = await bootAudience(markup(true), {
      handler: routed(
        getRoutes({ publicFollowers: bad }, { publicFollowers: bad }),
      ),
    });
    await page.settle();
    for (let i = 0; i < 3; i++) {
      assert.deepEqual(
        countOf(page, i),
        { hidden: true, text: '' },
        JSON.stringify(bad),
      );
    }
  }
});

test('script, no public count: no token means no request, exactly as before', async () => {
  const h = await bootAudience(markup(false));
  await h.settle();
  assert.equal(h.calls.length, 0);
  for (let i = 0; i < 3; i++) {
    assert.deepEqual(countOf(h, i), { hidden: true, text: '' });
  }
  // A public figure in an answer is ignored by a control that did not opt in.
  const signed = await bootAudience(markup(false), {
    session: SESSION,
    handler: routed(
      getRoutes({ following: true, publicFollowers: bucket(20, '20+') }),
    ),
  });
  await signed.settle();
  assert.deepEqual(countOf(signed, 0), { hidden: true, text: '' });
});

test('script, team reader: the exact followers wins over the bucket, and both read with the token', async () => {
  const h = await bootAudience(markup(true), {
    session: SESSION,
    handler: routed(
      getRoutes(
        { following: true, followers: 23, publicFollowers: bucket(20, '20+') },
        { following: false, publicFollowers: bucket(3, '3') },
      ),
    ),
  });
  await h.settle();
  assert.equal(h.calls.length, 2);
  for (const call of h.calls) {
    assert.equal(call.headers.Authorization, 'Bearer reader-token-1');
  }
  assert.deepEqual(countOf(h, 0), { hidden: false, text: '23 followers' });
  assert.deepEqual(countOf(h, 1), { hidden: false, text: '23 followers' });
  assert.deepEqual(countOf(h, 2), { hidden: false, text: '3 followers' });
  assert.equal(h.$$('.g-follow')[0].dataset.state, 'following');
});

test('script, public count: dropping the session hides only the exact figure and brings the bucket back', async () => {
  const h = await bootAudience(markup(true), {
    session: SESSION,
    handler: routed({
      ...getRoutes(
        { following: false, followers: 23, publicFollowers: bucket(20, '20+') },
        { following: false, followers: 9, publicFollowers: bucket(3, '3') },
      ),
      [`PUT ${FOLLOW_PATH()}`]: {
        status: 401,
        body: { code: 'READER_AUTHENTICATION_REQUIRED' },
      },
    }),
  });
  await h.settle();
  assert.equal(countOf(h, 0).text, '23 followers');
  h.$$('[data-follow-action="follow"]')[0].click();
  await h.settle();
  assert.equal(h.storage(SESSION_KEY), null);
  assert.deepEqual(countOf(h, 0), { hidden: false, text: '20+ followers' });
  assert.deepEqual(countOf(h, 1), { hidden: false, text: '20+ followers' });
  assert.deepEqual(countOf(h, 2), { hidden: false, text: '3 followers' });
});

test('script, public count: a stale token still gets the public figure, by an anonymous read', async () => {
  const h = await bootAudience(markup(true), {
    session: SESSION,
    handler: routed({
      [`GET ${FOLLOW_PATH()}`]: (/** @type {any} */ call) =>
        call.headers.Authorization
          ? { status: 401, body: { code: 'READER_AUTHENTICATION_REQUIRED' } }
          : { status: 200, body: { publicFollowers: bucket(20, '20+') } },
      [`GET ${FOLLOW_PATH(OTHER)}`]: (/** @type {any} */ call) =>
        call.headers.Authorization
          ? { status: 401, body: { code: 'READER_AUTHENTICATION_REQUIRED' } }
          : { status: 200, body: { publicFollowers: bucket(3, '3') } },
    }),
  });
  await h.settle();
  assert.equal(h.storage(SESSION_KEY), null);
  assert.deepEqual(countOf(h, 0), { hidden: false, text: '20+ followers' });
  assert.deepEqual(countOf(h, 2), { hidden: false, text: '3 followers' });
});

test('script, public count: a follow answer without any count keeps what the page shows; one with a new bucket replaces it', async () => {
  let answer = /** @type {any} */ ({ following: true });
  const h = await bootAudience(markup(true), {
    session: SESSION,
    handler: routed({
      ...getRoutes(
        { following: false, publicFollowers: bucket(20, '20+') },
        { following: false, publicFollowers: bucket(3, '3') },
      ),
      [`PUT ${FOLLOW_PATH()}`]: () => ({ status: 200, body: answer }),
      [`DELETE ${FOLLOW_PATH()}`]: () => ({ status: 200, body: answer }),
    }),
  });
  await h.settle();
  h.$$('[data-follow-action="follow"]')[0].click();
  await h.settle();
  assert.deepEqual(countOf(h, 0), { hidden: false, text: '20+ followers' });
  answer = { following: false, publicFollowers: bucket(50, '50+') };
  h.$$('[data-follow-action="unfollow"]')[0].click();
  await h.settle();
  assert.deepEqual(countOf(h, 0), { hidden: false, text: '50+ followers' });
  assert.deepEqual(countOf(h, 1), { hidden: false, text: '50+ followers' });
  assert.deepEqual(countOf(h, 2), { hidden: false, text: '3 followers' });
});

test('script, public count: an author that cannot be followed has no control and no figure', async () => {
  const h = await bootAudience(markup(true), {
    handler: routed({
      [`GET ${FOLLOW_PATH()}`]: {
        status: 404,
        body: { code: 'AUTHOR_NOT_FOUND' },
      },
      [`GET ${FOLLOW_PATH(OTHER)}`]: {
        status: 200,
        body: { publicFollowers: bucket(3, '3') },
      },
    }),
  });
  await h.settle();
  assert.equal(h.$$('.g-follow')[0].hidden, true);
  assert.equal(h.$$('.g-follow')[1].hidden, true);
  assert.deepEqual(countOf(h, 2), { hidden: false, text: '3 followers' });
});

test('script, public count: the figure is written in the page language', async () => {
  const messages = getMessages('ru');
  const html = audiencePage(
    renderFollowControl({
      author: { id: AUTHOR, displayName: 'Ana' },
      messages,
      publicCount: true,
    }),
    'ru',
  );
  const h = await bootAudience(html, {
    handler: routed(getRoutes({ publicFollowers: bucket(20, '20+') })),
  });
  await h.settle();
  assert.equal(countOf(h, 0).text, 'Подписчиков: 20+');
});
