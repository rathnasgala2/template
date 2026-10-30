/**
 * Follower count beside the Follow control, shown only to the site's team: the
 * static markup (hidden, users icon, hint as title and as hidden text), and the
 * shipped `gala-audience.js` filling it from the GET read and every PUT/DELETE
 * answer in JSDOM. The API sends `followers` to nobody else, so an answer
 * without a valid `followers` shows nothing.
 */

import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import {
  renderFollowControl,
  serializeAudienceMessages,
} from '../src/core/internal/audience.js';
import { getMessages } from '../src/core/internal/messages.js';
import {
  AUTHOR,
  FOLLOW_PATH,
  SESSION_KEY,
  SESSION,
  audiencePage,
  bootAudience,
  routed,
} from './helpers/audience-dom.js';

const OTHER = '0190b1f0-0000-7000-8000-0000000000a2';
const HINT = "Only your site's team sees this";

/**
 * @param {string} [language] the page language
 * @returns {string} a page with three controls
 */
function markup(language = 'en') {
  const messages = getMessages(language);
  const control = (/** @type {string} */ id, /** @type {string} */ name) =>
    renderFollowControl({ author: { id, displayName: name }, messages });
  return audiencePage(
    `<div class="g-byline">${control(AUTHOR, 'Ana Lima')}</div>` +
      `<section class="g-author-card">${control(AUTHOR, 'Ana Lima')}</section>` +
      `<div class="g-byline">${control(OTHER, 'Bo Chen')}</div>`,
    language,
  );
}

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

test('count markup: hidden in every control, users icon, hint as title and as hidden text, no layout of its own before the script', () => {
  const html = renderFollowControl({
    author: { id: AUTHOR, displayName: 'Ana Lima' },
    messages: getMessages('en'),
  });
  assert.match(
    html,
    /<span class="g-follow-count" data-follow-count title="Only your site&#39;s team sees this" hidden><svg class="g-icon"[^>]*>.*?<circle.*?<\/svg><span data-follow-count-text><\/span><span class="g-sr-only"> Only your site&#39;s team sees this<\/span><\/span>/s,
  );
  assert.equal(html.split('data-follow-count ').length - 1, 1);
});

test('count markup: the hint is localized', () => {
  const html = renderFollowControl({
    author: { id: AUTHOR, displayName: 'அன்னா' },
    messages: getMessages('ta'),
  });
  assert.ok(
    html.includes('title="இதை உங்கள் தளத்தின் குழு மட்டுமே பார்க்கும்"'),
  );
});

test('count strings reach the script as singular and plural sentences', () => {
  const en = JSON.parse(serializeAudienceMessages(getMessages('en')));
  assert.equal(en.followersOne, '1 follower');
  assert.equal(en.followersOther, '{count} followers');
  const ru = JSON.parse(serializeAudienceMessages(getMessages('ru')));
  assert.equal(ru.followersOther, 'Подписчиков: {count}');
});

test('script, no token: no request and no count', async () => {
  const h = await bootAudience(markup());
  await h.settle();
  assert.equal(h.calls.length, 0);
  for (let i = 0; i < 3; i++)
    assert.deepEqual(countOf(h, i), { hidden: true, text: '' });
});

test('script, token but answers without followers: no count', async () => {
  const h = await bootAudience(markup(), {
    session: SESSION,
    handler: routed(getRoutes({ following: true }, { following: false })),
  });
  await h.settle();
  for (let i = 0; i < 3; i++)
    assert.deepEqual(countOf(h, i), { hidden: true, text: '' });
});

test('script, team reader: 1 and 12 show singular and plural on every control of the author, with the hint', async () => {
  const h = await bootAudience(markup(), {
    session: SESSION,
    handler: routed(
      getRoutes(
        { following: true, followers: 1 },
        { following: false, followers: 12 },
      ),
    ),
  });
  await h.settle();
  assert.deepEqual(countOf(h, 0), { hidden: false, text: '1 follower' });
  assert.deepEqual(countOf(h, 1), { hidden: false, text: '1 follower' });
  assert.deepEqual(countOf(h, 2), { hidden: false, text: '12 followers' });
  for (const el of h.$$('[data-follow-count]')) {
    assert.equal(el.getAttribute('title'), HINT);
    assert.equal(el.querySelector('.g-sr-only').textContent.trim(), HINT);
    assert.ok(el.querySelector('svg.g-icon'));
  }
});

test('script: a zero count is shown, large counts are grouped', async () => {
  const h = await bootAudience(markup(), {
    session: SESSION,
    handler: routed(
      getRoutes({ following: false, followers: 0 }, { followers: 1234 }),
    ),
  });
  await h.settle();
  assert.deepEqual(countOf(h, 0), { hidden: false, text: '0 followers' });
  assert.deepEqual(countOf(h, 2), { hidden: false, text: '1,234 followers' });
});

test('script: invalid followers values show nothing', async () => {
  for (const bad of [null, -1, 1.5, '12', true, {}, [], NaN, undefined]) {
    const h = await bootAudience(markup(), {
      session: SESSION,
      handler: routed(
        getRoutes({ following: true, followers: bad }, { followers: bad }),
      ),
    });
    await h.settle();
    for (let i = 0; i < 3; i++) {
      assert.deepEqual(countOf(h, i), { hidden: true, text: '' }, String(bad));
    }
  }
});

test('script: follow and unfollow answers update every control for the author; an answer without followers hides it again', async () => {
  let answer = /** @type {any} */ ({ following: true, followers: 5 });
  const h = await bootAudience(markup(), {
    session: SESSION,
    handler: routed({
      ...getRoutes(
        { following: false, followers: 4 },
        { following: false, followers: 9 },
      ),
      [`PUT ${FOLLOW_PATH()}`]: () => ({ status: 200, body: answer }),
      [`DELETE ${FOLLOW_PATH()}`]: () => ({ status: 200, body: answer }),
    }),
  });
  await h.settle();
  assert.equal(countOf(h, 0).text, '4 followers');

  h.$$('[data-follow-action="follow"]')[0].click();
  await h.settle();
  assert.deepEqual(countOf(h, 0), { hidden: false, text: '5 followers' });
  assert.deepEqual(countOf(h, 1), { hidden: false, text: '5 followers' });
  assert.deepEqual(
    countOf(h, 2),
    { hidden: false, text: '9 followers' },
    'another author is untouched',
  );

  answer = { following: false, followers: 1 };
  h.$$('[data-follow-action="unfollow"]')[1].click();
  await h.settle();
  assert.deepEqual(countOf(h, 0), { hidden: false, text: '1 follower' });
  assert.deepEqual(countOf(h, 1), { hidden: false, text: '1 follower' });

  answer = { following: true };
  h.$$('[data-follow-action="follow"]')[0].click();
  await h.settle();
  assert.deepEqual(countOf(h, 0), { hidden: true, text: '' });
  assert.deepEqual(countOf(h, 1), { hidden: true, text: '' });
  assert.deepEqual(countOf(h, 2), { hidden: false, text: '9 followers' });
});

test('script: a failed follow leaves the count as it was', async () => {
  const h = await bootAudience(markup(), {
    session: SESSION,
    handler: routed({
      ...getRoutes({ following: false, followers: 4 }),
      [`PUT ${FOLLOW_PATH()}`]: { status: 500, body: {} },
    }),
  });
  await h.settle();
  h.$$('[data-follow-action="follow"]')[0].click();
  await h.settle();
  assert.deepEqual(countOf(h, 0), { hidden: false, text: '4 followers' });
});

test('script: the count is written in the page language', async () => {
  const h = await bootAudience(markup('ru'), {
    session: SESSION,
    handler: routed(getRoutes({ following: false, followers: 12 })),
  });
  await h.settle();
  assert.equal(countOf(h, 0).text, 'Подписчиков: 12');
});

test('script: a 401 drops the session and hides every follower count on the page', async () => {
  for (const method of ['PUT', 'DELETE']) {
    const h = await bootAudience(markup(), {
      session: SESSION,
      handler: routed({
        ...getRoutes(
          { following: method === 'DELETE', followers: 4 },
          { followers: 9 },
        ),
        [`${method} ${FOLLOW_PATH()}`]: {
          status: 401,
          body: { code: 'READER_AUTHENTICATION_REQUIRED' },
        },
      }),
    });
    await h.settle();
    assert.equal(countOf(h, 0).text, '4 followers');
    assert.equal(countOf(h, 2).text, '9 followers');
    const action = method === 'PUT' ? 'follow' : 'unfollow';
    h.$$(`[data-follow-action="${action}"]`)[0].click();
    await h.settle();
    for (let i = 0; i < 3; i++) {
      assert.deepEqual(countOf(h, i), { hidden: true, text: '' }, method);
    }
    assert.equal(h.storage(SESSION_KEY), null);
    assert.equal(
      h.$$('.g-follow')[0].dataset.state,
      method === 'PUT' ? 'idle' : 'following',
    );
  }
});
