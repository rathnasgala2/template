/**
 * The Listen script's player (design section 4), executed as shipped in JSDOM:
 * the controls, the seek bar's spoken position, the status line, resuming on
 * the next page, Media Session, the strings it takes from the messages block
 * and the source rules (size, no network, no HTML injection). Harness:
 * `helpers/listen-dom.js`.
 */

import { strict as assert } from 'node:assert';
import { Buffer } from 'node:buffer';
import { test } from 'node:test';

import {
  LISTEN_SOURCE,
  MESSAGES,
  SESSION_KEY,
  bootListen,
  track,
} from './helpers/listen-dom.js';

const SHIPPED_BYTE_CAP = 16_000;

// The text of a slot, and a control by its act name.
const text = (/** @type {any} */ h, /** @type {string} */ slot) =>
  h.$(`[data-gala-listen-slot="${slot}"]`).textContent;
const control = (/** @type {any} */ h, /** @type {string} */ act) =>
  h.$(`[data-gala-listen-act="${act}"]`);

/** @returns {Promise<any>} an article page with the player already playing */
async function playing() {
  const h = await bootListen({ gtag: true });
  h.$('[data-gala-listen-open="current"]').click();
  h.media.loaded(h.audio(), 424);
  return h;
}

test('the toggle plays and pauses, and its name, icon and state follow', async () => {
  const h = await playing();
  const toggle = control(h, 'toggle');
  assert.equal(toggle.getAttribute('aria-label'), 'Pause');
  assert.equal(h.$('.i-pause').hidden, false);
  assert.equal(h.$('.i-play').hidden, true);
  assert.equal(h.card().hasAttribute('data-playing'), true);
  toggle.click();
  assert.equal(h.audio().paused, true);
  assert.equal(toggle.getAttribute('aria-label'), 'Play');
  assert.equal(h.$('.i-pause').hidden, true);
  assert.equal(h.$('.i-play').hidden, false);
  assert.equal(h.card().hasAttribute('data-playing'), false);
  toggle.click();
  assert.equal(h.audio().paused, false);
  assert.equal(h.media.plays.length, 2);
  h.audio().pause(); // a headset button, say: the card follows the element
  assert.equal(toggle.getAttribute('aria-label'), 'Play');
  assert.equal(h.card().hasAttribute('data-playing'), false);
  toggle.click();
  assert.equal(
    h.events.filter((e) => e.name === 'listen_play').length,
    1,
    'resuming the same episode is not a new play',
  );
});

test('a file that fails to load does not leave the card claiming to play', async () => {
  const h = await playing();
  Object.defineProperty(h.audio(), 'error', { value: { code: 4 } });
  h.audio().dispatchEvent(new h.window.Event('error'));
  assert.equal(control(h, 'toggle').getAttribute('aria-label'), 'Play');
  assert.equal(h.card().hasAttribute('data-playing'), false);
});

test('the seek bar and time follow playback and speak "{elapsed} of {total}"', async () => {
  const h = await playing();
  const seek = h.$('.g-listen__seek');
  assert.equal(seek.max, '424');
  assert.equal(seek.getAttribute('aria-valuetext'), '0:00 of 7:04');
  h.media.tick(h.audio(), 100);
  assert.equal(seek.value, '100');
  assert.equal(seek.getAttribute('aria-valuetext'), '1:40 of 7:04');
  assert.equal(text(h, 'time'), '1:40 / 7:04');
  seek.value = '200';
  seek.dispatchEvent(new h.window.Event('input', { bubbles: true }));
  assert.equal(h.audio().currentTime, 200);
  assert.equal(seek.getAttribute('aria-valuetext'), '3:20 of 7:04');
  assert.equal(h.$('.g-listen__time').getAttribute('aria-hidden'), 'true');
});

test('back 15 s steps back and stops at the start', async () => {
  const h = await playing();
  h.media.tick(h.audio(), 100);
  control(h, 'back').click();
  assert.equal(h.audio().currentTime, 85);
  h.media.tick(h.audio(), -80);
  control(h, 'back').click();
  assert.equal(h.audio().currentTime, 0);
});

test('speed cycles 1x, 1.25x, 1.5x and names itself for a screen reader', async () => {
  const h = await playing();
  const speed = control(h, 'speed');
  const seen = [];
  for (let n = 0; n < 4; n += 1) {
    seen.push([
      speed.textContent,
      speed.getAttribute('aria-label'),
      h.audio().playbackRate,
    ]);
    speed.click();
  }
  assert.deepEqual(seen, [
    ['1×', 'Playback speed 1 times', 1],
    ['1.25×', 'Playback speed 1.25 times', 1.25],
    ['1.5×', 'Playback speed 1.5 times', 1.5],
    ['1×', 'Playback speed 1 times', 1],
  ]);
});

test('the name links to the post; the label counts a queue only when there is one', async () => {
  const h = await playing();
  assert.equal(text(h, 'name'), 'Episode 3');
  assert.equal(
    h.$('[data-gala-listen-slot="name"]').getAttribute('href'),
    '/episode-3/',
  );
  assert.equal(text(h, 'label'), 'Now playing');
});

test('the close button stops, clears the session and leaves; nothing is written afterwards', async () => {
  const h = await playing();
  h.media.tick(h.audio(), 30);
  assert.ok(h.session());
  const audio = h.audio();
  control(h, 'stop').click();
  assert.equal(audio.paused, true);
  assert.equal(h.session(), null);
  assert.equal(h.card().hasAttribute('data-leaving'), true);
  control(h, 'toggle').click();
  assert.equal(h.media.plays.length, 1, 'a leaving card is inert');
  h.advance(300);
  assert.equal(h.card(), null);
  h.fire('pagehide');
  assert.equal(h.session(), null);
  h.$('[data-gala-listen-open="current"]').click();
  assert.equal(
    h.$$('.g-listen').length,
    1,
    'the top-bar button brings the player back',
  );
  assert.equal(h.media.plays.length, 2);
  assert.deepEqual(h.errors, []);
});

test('the status line announces "Playing: {title}" politely, after a short beat', async () => {
  const h = await playing();
  const status = h.$('[data-gala-listen-slot="status"]');
  assert.equal(status.getAttribute('aria-live'), 'polite');
  assert.equal(status.textContent, '');
  h.advance(100);
  assert.equal(status.textContent, 'Playing: Episode 3');
});

test('resume: the position is written on play, on pause, every 5 s of play and on pagehide', async () => {
  const h = await playing();
  assert.equal(h.session().position, 0);
  h.media.tick(h.audio(), 4);
  assert.equal(h.session().position, 0, 'not yet');
  h.media.tick(h.audio(), 1);
  assert.equal(h.session().position, 5, 'every 5 s');
  h.media.tick(h.audio(), 2.5);
  assert.equal(h.session().position, 5);
  h.fire('pagehide');
  assert.equal(h.session().position, 7, 'pagehide');
  h.media.tick(h.audio(), 1);
  h.audio().pause();
  assert.equal(h.session().position, 8, 'pause');
  assert.deepEqual(Object.keys(h.session()).sort(), [
    'index',
    'order',
    'position',
    'queue',
    'rate',
  ]);
});

test('resume: the next page shows the player paused at the saved position and does not autoplay', async () => {
  const queue = [track(3), track(2), track(1)];
  const h = await bootListen({
    gtag: true,
    page: 'plain',
    session: { queue, index: 1, position: 95, rate: 1.25, order: 'newest' },
  });
  assert.ok(h.card(), 'no timers needed');
  assert.equal(h.$('.g-listen__invite').hidden, true);
  assert.equal(h.$('.g-listen__player').hidden, false);
  assert.equal(text(h, 'label'), 'Now playing · 2 of 3');
  assert.equal(text(h, 'name'), 'Episode 2');
  assert.equal(text(h, 'time'), '1:35 / 9:00');
  assert.equal(h.$('.g-listen__seek').value, '95');
  assert.equal(control(h, 'toggle').getAttribute('aria-label'), 'Play');
  assert.equal(h.$('.i-play').hidden, false);
  assert.equal(h.audio().paused, true);
  assert.equal(h.audio().currentTime, 95);
  assert.equal(h.audio().getAttribute('src'), queue[1].audio);
  assert.equal(control(h, 'speed').textContent, '1.25×');
  assert.deepEqual(h.media.plays, [], 'no autoplay');
  assert.deepEqual(h.events, []);
  h.advance(60_000);
  assert.deepEqual(h.media.plays, []);
  control(h, 'toggle').click();
  assert.deepEqual(
    h.media.plays.map((p) => [p.at, p.rate]),
    [[95, 1.25]],
    'pressing play continues from there',
  );
  assert.deepEqual(h.events.at(-1)?.params, {
    listen_post: 'episode-2',
    listen_source: 'resume',
    listen_order: 'newest',
    listen_format: 'conversation',
  });
  assert.equal(h.session().position, 95);
});

test('resume: an engine that ignores an early seek still lands on the saved position once the metadata is there', async () => {
  const h = await bootListen({
    page: 'plain',
    dropEarlySeeks: true,
    session: {
      queue: [track(2)],
      index: 0,
      position: 95,
      rate: 1,
      order: 'single',
    },
  });
  assert.equal(h.audio().currentTime, 0, 'the engine dropped it');
  control(h, 'toggle').click();
  h.media.loaded(h.audio(), 540);
  assert.equal(h.audio().currentTime, 95);
  assert.equal(text(h, 'time'), '1:35 / 9:00');
  h.media.tick(h.audio(), 3);
  h.media.loaded(h.audio(), 540);
  assert.equal(
    h.audio().currentTime,
    98,
    'applied once, not on every metadata event',
  );
});

test('resume: a session whose track is unusable leaves no half-built card and is dropped', async () => {
  const h = await bootListen({
    page: 'plain',
    session: {
      queue: [{ title: 'No audio here' }],
      index: 0,
      position: 3,
      rate: 1,
      order: 'single',
    },
  });
  assert.equal(h.session(), null, 'the record is removed');
  h.advance(300);
  assert.equal(h.card(), null);
  assert.deepEqual(h.errors, []);
});

test('resume: a session that cannot be used is ignored', async () => {
  for (const raw of [
    '{oops',
    'null',
    '{"queue":[],"index":0}',
    '{"index":0}',
  ]) {
    const h = await bootListen({ run: false });
    h.window.sessionStorage.setItem(SESSION_KEY, raw);
    h.run();
    assert.equal(h.card(), null, raw);
    h.openInvite();
    assert.ok(h.card(), `${raw}: the invitation is still allowed`);
    assert.equal(h.$('.g-listen__invite').hidden, false);
  }
});

test('Media Session: metadata and the six handlers, with previous and next only when there is a queue', async () => {
  const h = await bootListen({ mediaSession: true });
  h.$('[data-gala-listen-open="current"]').click();
  assert.deepEqual(
    { ...h.mediaSession.metadata },
    {
      title: 'Episode 3',
      artist: 'Quiet Notes',
      artwork: [{ src: 'https://blog.example/cover.png' }],
    },
  );
  const handlers = h.mediaSession.handlers;
  assert.deepEqual(Object.keys(handlers).sort(), [
    'nexttrack',
    'pause',
    'play',
    'previoustrack',
    'seekbackward',
    'seekforward',
  ]);
  assert.equal(handlers.previoustrack, null);
  assert.equal(handlers.nexttrack, null);
  h.media.tick(h.audio(), 60);
  handlers.seekbackward();
  assert.equal(h.audio().currentTime, 45);
  handlers.seekforward();
  assert.equal(h.audio().currentTime, 60);
  handlers.pause();
  assert.equal(h.audio().paused, true);
  handlers.play();
  assert.equal(h.audio().paused, false);
});

test('Media Session: previous and next move through a queue and the metadata follows', async () => {
  const h = await bootListen({
    page: 'home',
    mediaSession: true,
    list: [track(3), track(2), track(1)],
  });
  h.act('play-all');
  assert.equal(h.mediaSession.metadata.title, 'Episode 3');
  assert.equal(typeof h.mediaSession.handlers.previoustrack, 'function');
  assert.equal(typeof h.mediaSession.handlers.nexttrack, 'function');
  h.mediaSession.handlers.nexttrack();
  assert.equal(h.mediaSession.metadata.title, 'Episode 2');
  h.mediaSession.handlers.nexttrack();
  assert.equal(h.mediaSession.metadata.title, 'Episode 1');
  assert.equal(
    h.mediaSession.handlers.nexttrack,
    null,
    'nothing after the last',
  );
  h.mediaSession.handlers.previoustrack();
  assert.equal(h.mediaSession.metadata.title, 'Episode 2');
});

test('Media Session: without artwork or support nothing breaks', async () => {
  const h = await bootListen({ mediaSession: true });
  h.window.document.querySelector('script[data-gala-listen-config]')?.remove();
  h.run();
  h.$('[data-gala-listen-open="current"]').click();
  assert.deepEqual(h.mediaSession.metadata.artwork, []);
  const plain = await bootListen();
  plain.$('[data-gala-listen-open="current"]').click();
  assert.deepEqual(plain.errors, []);
});

test('every sentence comes from the messages block, in the reader language', async () => {
  const german = {
    ...MESSAGES,
    'invite.body.conversation': 'Ein Gespräch von {minutes} Minuten.',
    'player.nowPlaying': 'Läuft',
    'player.position': '{index} von {count}',
    'player.play': 'Abspielen',
    'player.pause': 'Pause machen',
    'player.speed': 'Tempo {rate}',
    'player.time': '{elapsed} von {total}',
    'player.playing': 'Läuft: {title}',
  };
  const h = await bootListen({ messages: german, page: 'article' });
  h.openInvite();
  assert.equal(text(h, 'invite-body'), 'Ein Gespräch von 7 Minuten.');
  h.act('yes');
  h.advance(100);
  assert.equal(text(h, 'label'), 'Läuft');
  assert.equal(control(h, 'toggle').getAttribute('aria-label'), 'Pause machen');
  control(h, 'toggle').click();
  assert.equal(control(h, 'toggle').getAttribute('aria-label'), 'Abspielen');
  assert.equal(control(h, 'speed').getAttribute('aria-label'), 'Tempo 1');
  assert.equal(
    h.$('.g-listen__seek').getAttribute('aria-valuetext'),
    '0:00 von 7:04',
  );
  assert.equal(text(h, 'status'), 'Läuft: Episode 3');
  const queue = await bootListen({
    messages: german,
    page: 'home',
    list: [track(2), track(1)],
  });
  queue.act('play-all');
  assert.equal(text(queue, 'label'), 'Läuft · 1 von 2');
});

test('the messages block may be nested as well as dotted', async () => {
  const nest = (/** @type {Record<string, string>} */ flat) => {
    /** @type {Record<string, any>} */
    const out = {};
    for (const [key, value] of Object.entries(flat)) {
      const [group, ...rest] = key.split('.');
      out[group] ??= {};
      let node = out[group];
      for (const part of rest.slice(0, -1)) node = node[part] ??= {};
      node[rest.at(-1) ?? group] = value;
    }
    return out;
  };
  const h = await bootListen({ messages: nest(MESSAGES) });
  h.openInvite();
  assert.match(
    text(h, 'invite-body'),
    /^This post is also a 7-minute conversation/,
  );
  h.act('yes');
  assert.equal(control(h, 'toggle').getAttribute('aria-label'), 'Pause');
});

test('a page without the template or the blocks stays quiet', async () => {
  const bare = await bootListen({
    html: '<!doctype html><html><body><p>hi</p></body></html>',
  });
  bare.advance(60_000);
  assert.deepEqual(bare.errors, []);
  const noMessages = await bootListen({
    html: '<!doctype html><html><body>x</body></html>',
    run: false,
  });
  noMessages.run();
  assert.equal(noMessages.card(), null);
});

test('the shipped file is small, makes no request and injects no HTML', () => {
  assert.ok(
    Buffer.byteLength(LISTEN_SOURCE) <= SHIPPED_BYTE_CAP,
    `${Buffer.byteLength(LISTEN_SOURCE)} bytes`,
  );
  const code = LISTEN_SOURCE.replace(/\/\*[\s\S]*?\*\//g, '').replace(
    /^\s*\/\/.*$/gm,
    '',
  );
  assert.ok(
    !/innerHTML|outerHTML|insertAdjacentHTML|document\.write/.test(code),
  );
  assert.ok(
    !/\beval\(|new Function|window\.open|postMessage|import\(/.test(code),
  );
  assert.ok(
    !/\bfetch\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|new Image/.test(
      code,
    ),
  );
  assert.ok(!/document\.cookie|console\./.test(code));
  assert.match(code, /'use strict'/);
  assert.ok(code.includes("typeof W.gtag === 'function'"));
});
