/**
 * The Listen script's invitation and top-bar button (design section 4),
 * executed as shipped in JSDOM: when the card appears and when it must not,
 * the four ways out of it, the nav button, blocked storage and the GA4 events
 * it sends. The shared harness is `helpers/listen-dom.js`.
 */

import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import {
  DAY,
  DECLINE_KEY,
  SESSION_KEY,
  T0,
  bootListen,
  settle,
  track,
  tracks,
} from './helpers/listen-dom.js';

// Whether the card is up.
const showing = (/** @type {any} */ h) => h.card() !== null;

test('the invitation opens 2.5 s after load, takes no focus and requests no audio', async () => {
  const h = await bootListen({ gtag: true });
  h.advance(2499);
  assert.equal(showing(h), false, 'not before 2.5 s');
  h.advance(1);
  assert.equal(showing(h), true);
  assert.equal(h.$('.g-listen__invite').hidden, false);
  assert.equal(h.$('.g-listen__player').hidden, true);
  assert.equal(h.document.activeElement, h.document.body, 'focus stays put');
  assert.equal(h.audio().getAttribute('preload'), 'none');
  assert.equal(h.audio().hasAttribute('src'), false, 'no audio before a play');
  assert.deepEqual(h.media.plays, []);
  assert.equal(
    h.$('[data-gala-listen-slot="invite-body"]').textContent,
    'This post is also a 7-minute conversation. Good for a drive, a workout or the dishes.',
  );
  assert.deepEqual(h.events, [
    { name: 'listen_invite_shown', params: { listen_post: 'episode-3' } },
  ]);
  assert.deepEqual(
    h.gtagCalls.map((call) => call[0]),
    ['event'],
    'only gtag("event", ...)',
  );
  assert.deepEqual(h.errors, []);
});

test('the invitation names the format and the length: max(1, round(seconds / 60)) minutes', async () => {
  const cases = [
    ['conversation', 424, '7-minute conversation'],
    ['narration', 20, '1-minute narration'],
    ['debate', 90, '2-minute debate'],
    ['skit', 29, '1-minute skit'],
  ];
  for (const [format, durationSeconds, expected] of cases) {
    const h = await bootListen({
      current: track(3, { format, durationSeconds }),
    });
    h.openInvite();
    assert.match(
      h.$('[data-gala-listen-slot="invite-body"]').textContent,
      new RegExp(String(expected)),
    );
  }
});

test('pages without audio of their own never invite', async () => {
  for (const page of ['home', 'plain']) {
    const h = await bootListen({ page });
    h.advance(60_000);
    assert.equal(showing(h), false, page);
  }
});

test('a decline within 30 days suppresses it; an expired or unreadable one does not', async () => {
  const declined = await bootListen({ declinedUntil: T0 + DAY });
  declined.advance(10_000);
  assert.equal(showing(declined), false);
  for (const stored of [T0 - 1, 'not a date']) {
    const h = await bootListen({ declinedUntil: /** @type {any} */ (stored) });
    h.openInvite();
    assert.equal(showing(h), true, String(stored));
  }
});

test('an active player session in this tab replaces the invitation', async () => {
  const h = await bootListen({
    gtag: true,
    session: {
      queue: [track(2)],
      index: 0,
      position: 30,
      rate: 1,
      order: 'single',
    },
  });
  assert.equal(showing(h), true, 'the player is restored at once');
  h.advance(10_000);
  assert.equal(h.$$('.g-listen').length, 1);
  assert.equal(h.$('.g-listen__invite').hidden, true);
  assert.equal(h.$('.g-listen__player').hidden, false);
  assert.deepEqual(h.events, []);
});

test('it waits while the consent banner is showing and opens as soon as the banner closes', async () => {
  const h = await bootListen({ banner: true, bannerOpen: true, gtag: true });
  h.advance(10_000);
  assert.equal(showing(h), false, 'banner visible: no invitation');
  assert.deepEqual(h.events, []);
  h.$('.g-consent').setAttribute('hidden', '');
  await settle();
  assert.equal(showing(h), true, 'banner closed: invitation');
  assert.deepEqual(
    h.events.map((e) => e.name),
    ['listen_invite_shown'],
  );
});

test('with the real consent script: Accept defines gtag, then the invitation reports through it', async () => {
  const h = await bootListen({ banner: true });
  await h.consent();
  assert.equal(h.$('.g-consent').hidden, false, 'no stored choice: banner up');
  assert.equal(typeof h.window.gtag, 'undefined', 'no gtag before consent');
  h.advance(10_000);
  assert.equal(showing(h), false);
  h.$('.g-consent-accept').click();
  await settle();
  assert.equal(typeof h.window.gtag, 'function', 'gtag exists after Accept');
  assert.equal(showing(h), true);
  const sent = h.window.dataLayer
    .map((/** @type {any} */ entry) => [...entry])
    .filter((/** @type {any[]} */ entry) => entry[0] === 'event');
  assert.equal(sent.length, 1);
  assert.equal(sent[0][1], 'listen_invite_shown');
  assert.equal(sent[0][2].listen_post, 'episode-3');
});

test('with the real consent script: Decline still lets the invitation in, and nothing is reported', async () => {
  const h = await bootListen({ banner: true });
  await h.consent();
  h.advance(10_000);
  h.$('.g-consent-decline').click();
  await settle();
  assert.equal(showing(h), true);
  h.act('yes');
  assert.equal(h.media.plays.length, 1);
  assert.equal(typeof h.window.gtag, 'undefined');
  assert.equal(h.window.dataLayer, undefined);
  assert.deepEqual(h.errors, []);
});

test('it waits for a visible tab', async () => {
  const h = await bootListen();
  h.visibility('hidden');
  h.advance(10_000);
  assert.equal(showing(h), false);
  h.visibility('visible');
  assert.equal(showing(h), true);
});

test('once per page view: after it is closed it does not come back', async () => {
  const h = await bootListen({ banner: true, gtag: true });
  h.openInvite();
  h.act('later');
  h.advance(500);
  assert.equal(showing(h), false);
  h.visibility('hidden');
  h.visibility('visible');
  h.$('.g-consent').setAttribute('hidden', '');
  await settle();
  h.advance(60_000);
  assert.equal(showing(h), false);
  assert.equal(
    h.events.filter((e) => e.name === 'listen_invite_shown').length,
    1,
  );
});

test('a player the reader opened first is never followed by the invitation', async () => {
  const h = await bootListen({ gtag: true });
  h.advance(1000);
  h.$('[data-gala-listen-open="current"]').click();
  h.advance(1000);
  h.act('stop');
  h.advance(300);
  assert.equal(showing(h), false);
  h.advance(60_000);
  assert.equal(showing(h), false, 'not at 2.5 s, not later');
  assert.equal(
    h.events.filter((e) => e.name === 'listen_invite_shown').length,
    0,
  );
});

test('Play it turns the card into the player and plays this post as a queue of one', async () => {
  const h = await bootListen({ gtag: true });
  h.openInvite();
  h.act('yes');
  assert.equal(h.$$('.g-listen').length, 1, 'the same card');
  assert.equal(h.$('.g-listen__invite').hidden, true);
  assert.equal(h.$('.g-listen__player').hidden, false);
  assert.equal(
    h.card().hasAttribute('aria-labelledby'),
    false,
    'the player is not named by the invitation title',
  );
  assert.equal(
    h.document.activeElement,
    h.$('[data-gala-listen-act="toggle"]'),
    'focus moves to the toggle',
  );
  assert.deepEqual(
    h.media.plays.map((p) => p.src),
    ['/assets/listen/episode-3.33333333.mp3'],
  );
  assert.equal(h.$('[data-gala-listen-act="prev"]').hidden, true);
  assert.equal(h.$('[data-gala-listen-act="next"]').hidden, true);
  assert.equal(
    h.$('[data-gala-listen-slot="label"]').textContent,
    'Now playing',
  );
  assert.deepEqual(h.events.at(-1), {
    name: 'listen_play',
    params: {
      listen_post: 'episode-3',
      listen_source: 'invite',
      listen_order: 'single',
      listen_format: 'conversation',
    },
  });
  assert.equal(h.session().queue.length, 1);
});

test('No thanks stores a 30-day decline, reports it and the card leaves', async () => {
  const h = await bootListen({ gtag: true });
  h.openInvite();
  h.act('no');
  assert.equal(Number(h.local(DECLINE_KEY)), h.clock.now() + 30 * DAY);
  assert.deepEqual(h.events.at(-1), {
    name: 'listen_decline',
    params: { listen_post: 'episode-3' },
  });
  assert.equal(h.card().hasAttribute('data-leaving'), true);
  h.advance(300);
  assert.equal(showing(h), false);
  assert.deepEqual(h.media.plays, []);
  const again = await bootListen({
    declinedUntil: Number(h.local(DECLINE_KEY)),
  });
  again.advance(10_000);
  assert.equal(showing(again), false, 'the next page view stays quiet');
});

test('the close button and Escape dismiss it for this page view only', async () => {
  for (const dismiss of [
    (/** @type {any} */ h) => h.act('later'),
    (/** @type {any} */ h) => h.key('Escape'),
    (/** @type {any} */ h) =>
      h.card().dispatchEvent(
        new h.window.KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
        }),
      ),
  ]) {
    const h = await bootListen({ gtag: true });
    h.openInvite();
    dismiss(h);
    h.advance(300);
    assert.equal(showing(h), false);
    assert.equal(h.local(DECLINE_KEY), null, 'nothing stored');
    assert.deepEqual(
      h.events.map((e) => e.name),
      ['listen_invite_shown'],
      'no decline event',
    );
  }
});

test('Escape does not touch the player', async () => {
  const h = await bootListen();
  h.openInvite();
  h.act('yes');
  h.key('Escape');
  h.advance(500);
  assert.equal(showing(h), true);
  assert.equal(h.$('.g-listen__player').hidden, false);
});

test('the top-bar button plays this post even when the reader declined', async () => {
  const h = await bootListen({
    gtag: true,
    declinedUntil: T0 + 29 * DAY,
  });
  h.advance(10_000);
  assert.equal(showing(h), false);
  h.$('[data-gala-listen-open="current"]').click();
  assert.equal(h.$('.g-listen__player').hidden, false);
  assert.equal(h.media.plays.length, 1);
  assert.deepEqual(h.events.at(-1)?.params, {
    listen_post: 'episode-3',
    listen_source: 'nav',
    listen_order: 'single',
    listen_format: 'conversation',
  });
  h.advance(60_000);
  assert.equal(h.$$('.g-listen').length, 1);
  assert.equal(
    h.events.filter((e) => e.name === 'listen_invite_shown').length,
    0,
  );
});

test('the top-bar button reuses the open invitation card; a second press only resumes', async () => {
  const h = await bootListen({ gtag: true });
  h.openInvite();
  h.$('[data-gala-listen-open="current"]').click();
  assert.equal(h.$$('.g-listen').length, 1);
  assert.equal(h.$('.g-listen__player').hidden, false);
  assert.equal(
    h.document.activeElement?.tagName,
    'BODY',
    'focus is not stolen',
  );
  h.media.tick(h.audio(), 42);
  h.audio().pause();
  h.$('[data-gala-listen-open="current"]').click();
  assert.equal(h.media.plays.length, 2);
  assert.equal(h.media.plays[1].at, 42, 'continues where it paused');
  assert.equal(h.events.filter((e) => e.name === 'listen_play').length, 1);
});

test('the playlist link is native navigation away from the home page', async () => {
  const h = await bootListen({ page: 'plain' });
  const link = h.$('a[data-gala-listen-open="playlist"]');
  assert.equal(link.getAttribute('href'), '/#listen');
  const proceeded = link.dispatchEvent(
    new h.window.MouseEvent('click', { bubbles: true, cancelable: true }),
  );
  assert.equal(proceeded, true, 'not prevented');
  assert.equal(showing(h), false);
  assert.deepEqual(h.errors, []);
});

test('blocked storage: the invitation, the decline and playback still work, nothing resumes', async () => {
  const h = await bootListen({ blockStorage: true, gtag: true });
  h.openInvite();
  assert.equal(showing(h), true);
  h.act('no');
  h.advance(300);
  assert.equal(showing(h), false, 'the decline holds for this page view');
  h.advance(60_000);
  assert.equal(showing(h), false);
  h.$('[data-gala-listen-open="current"]').click();
  assert.equal(h.media.plays.length, 1);
  h.media.tick(h.audio(), 9);
  h.fire('pagehide');
  assert.deepEqual(h.errors, []);
  const fresh = await bootListen({
    blockStorage: true,
    session: {
      queue: [track(1)],
      index: 0,
      position: 5,
      rate: 1,
      order: 'single',
    },
  });
  assert.equal(showing(fresh), false, 'no resume without storage');
});

test('GA4: nothing is sent without gtag, and a gtag defined later is used from then on', async () => {
  const h = await bootListen();
  h.openInvite();
  h.act('yes');
  assert.deepEqual(h.events, []);
  assert.deepEqual(h.errors, []);
  h.installGtag();
  h.media.end(h.audio());
  assert.deepEqual(h.events, [
    {
      name: 'listen_complete',
      params: { listen_post: 'episode-3', listen_source: 'invite' },
    },
  ]);
  h.window.gtag = 'not a function';
  h.act('toggle');
  assert.deepEqual(h.errors, []);
});

test('GA4: a throwing gtag never stops playback', async () => {
  const h = await bootListen();
  h.window.gtag = () => {
    throw new Error('blocked by an extension');
  };
  h.openInvite();
  h.act('yes');
  assert.equal(h.media.plays.length, 1);
});

test('storage keys are the documented ones and the session survives only in sessionStorage', async () => {
  const h = await bootListen();
  h.openInvite();
  h.act('yes');
  assert.ok(h.window.sessionStorage.getItem(SESSION_KEY));
  assert.equal(h.window.localStorage.getItem(SESSION_KEY), null);
  assert.equal(h.local(DECLINE_KEY), null);
});

test('a home-page playlist alone never opens the invitation', async () => {
  const h = await bootListen({ page: 'home', list: tracks(4) });
  h.advance(30_000);
  assert.equal(showing(h), false);
});
