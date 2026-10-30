/**
 * The Listen script's home-page playlist (design section 4), executed as
 * shipped in JSDOM: revealed controls, ordering, Play all, Shuffle (a seeded
 * random), per-row play, "Show all", auto-advance, previous and next, and the
 * focus on Play all after the `#listen` jump. Harness: `helpers/listen-dom.js`.
 */

import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { bootListen, tracks } from './helpers/listen-dom.js';

// Row titles in DOM order, the visible ones, and the files played so far.
const rowTitles = (/** @type {any} */ h) =>
  h
    .$$('[data-gala-listen-track]')
    .map((/** @type {Element} */ li) => li.querySelector('a')?.textContent);
const visibleRows = (/** @type {any} */ h) =>
  h
    .$$('[data-gala-listen-track]')
    .filter((/** @type {HTMLElement} */ li) => !li.hidden)
    .map((/** @type {Element} */ li) => li.querySelector('a')?.textContent);
const played = (/** @type {any} */ h) =>
  h.media.plays.map((/** @type {{src: string}} */ p) => p.src.split('/').pop());
// Pick newest or oldest in the order select.
const choose = (/** @type {any} */ h, /** @type {string} */ order) => {
  h.$('[data-gala-listen-order]').value = order;
  h.$('[data-gala-listen-order]').dispatchEvent(
    new h.window.Event('change', { bubbles: true }),
  );
};
// The file episode n plays (1 is the oldest).
const file = (/** @type {number} */ n) =>
  `episode-${n}.${String(n).repeat(8)}.mp3`;

test('with JavaScript the controls and the row play buttons appear; without it they stay hidden', async () => {
  const off = await bootListen({ page: 'home', run: false });
  assert.equal(off.$('[data-gala-listen-controls]').hidden, true);
  assert.ok(
    off
      .$$('[data-gala-listen-act="play-track"]')
      .every((/** @type {HTMLElement} */ b) => b.hidden),
  );
  const h = await bootListen({ page: 'home', list: tracks(3) });
  assert.equal(h.$('[data-gala-listen-controls]').hidden, false);
  const buttons = h.$$('[data-gala-listen-act="play-track"]');
  assert.equal(buttons.length, 3);
  assert.ok(buttons.every((/** @type {HTMLElement} */ b) => !b.hidden));
  assert.deepEqual(h.errors, []);
});

test('up to 5 episodes are all shown; more show 5 and a Show all N button', async () => {
  for (const count of [1, 3, 5]) {
    const h = await bootListen({ page: 'home', list: tracks(count) });
    assert.equal(visibleRows(h).length, count);
    assert.equal(
      h.$('[data-gala-listen-act="show-all"]').hidden,
      true,
      String(count),
    );
  }
  const h = await bootListen({ page: 'home', list: tracks(7) });
  assert.deepEqual(visibleRows(h), [
    'Episode 7',
    'Episode 6',
    'Episode 5',
    'Episode 4',
    'Episode 3',
  ]);
  const more = h.$('[data-gala-listen-act="show-all"]');
  assert.equal(more.hidden, false);
  assert.equal(more.textContent, 'Show all 7');
  more.click();
  assert.equal(visibleRows(h).length, 7);
  assert.equal(more.hidden, true);
});

test('the order select re-orders the visible list and keeps the first five showing', async () => {
  const h = await bootListen({ page: 'home', list: tracks(7) });
  choose(h, 'oldest');
  assert.deepEqual(rowTitles(h), [
    'Episode 1',
    'Episode 2',
    'Episode 3',
    'Episode 4',
    'Episode 5',
    'Episode 6',
    'Episode 7',
  ]);
  assert.deepEqual(visibleRows(h), [
    'Episode 1',
    'Episode 2',
    'Episode 3',
    'Episode 4',
    'Episode 5',
  ]);
  choose(h, 'newest');
  assert.equal(rowTitles(h)[0], 'Episode 7');
  h.act('show-all');
  choose(h, 'oldest');
  assert.equal(visibleRows(h).length, 7, 'stays expanded');
});

test('Play all plays the selected order from the first episode', async () => {
  const h = await bootListen({ page: 'home', list: tracks(3), gtag: true });
  h.act('play-all');
  assert.deepEqual(played(h), [file(3)], 'newest first by default');
  assert.deepEqual(
    h.session().queue.map((/** @type {any} */ t) => t.slug),
    ['episode-3', 'episode-2', 'episode-1'],
  );
  assert.equal(
    h.$('[data-gala-listen-slot="label"]').textContent,
    'Now playing · 1 of 3',
  );
  assert.deepEqual(h.events.at(-1)?.params, {
    listen_post: 'episode-3',
    listen_source: 'playlist',
    listen_order: 'newest',
    listen_format: 'conversation',
  });
  const old = await bootListen({ page: 'home', list: tracks(3), gtag: true });
  choose(old, 'oldest');
  old.act('play-all');
  assert.deepEqual(played(old), [file(1)]);
  assert.deepEqual(
    old.session().queue.map((/** @type {any} */ t) => t.slug),
    ['episode-1', 'episode-2', 'episode-3'],
  );
  assert.equal(old.events.at(-1)?.params.listen_order, 'oldest');
});

test('Shuffle is one Fisher-Yates pass per press and plays from the first of the shuffled queue', async () => {
  const h = await bootListen({
    page: 'home',
    list: tracks(6),
    gtag: true,
    seed: 7,
  });
  let draws = 0;
  const random = h.window.Math.random;
  h.window.Math.random = () => {
    draws += 1;
    return random();
  };
  h.act('shuffle');
  assert.equal(draws, 5, 'n - 1 draws for n episodes');
  const first = h.session().queue.map((/** @type {any} */ t) => t.slug);
  assert.deepEqual([...first].sort(), [
    'episode-1',
    'episode-2',
    'episode-3',
    'episode-4',
    'episode-5',
    'episode-6',
  ]);
  assert.deepEqual(
    played(h),
    [file(Number(first[0].split('-')[1]))],
    'plays from the first',
  );
  assert.equal(h.session().order, 'shuffle');
  assert.deepEqual(h.events.at(-1)?.params.listen_order, 'shuffle');
  assert.equal(h.events.at(-1)?.params.listen_source, 'playlist');
  assert.equal(
    rowTitles(h)[0],
    'Episode 6',
    'the visible list keeps its order',
  );
  h.act('shuffle');
  assert.equal(draws, 10, 'a second press draws again');
  const same = await bootListen({
    page: 'home',
    list: tracks(6),
    gtag: true,
    seed: 7,
  });
  same.act('shuffle');
  assert.deepEqual(
    same.session().queue.map((/** @type {any} */ t) => t.slug),
    first,
    'seeded: reproducible',
  );
});

test('Shuffle is Fisher-Yates, not a biased sort: pinned by constant draws', async () => {
  const slugs = async (/** @type {number} */ draw) => {
    const h = await bootListen({ page: 'home', list: tracks(3) });
    h.window.Math.random = () => draw;
    h.act('shuffle');
    return h.session().queue.map((/** @type {any} */ t) => t.slug);
  };
  // newest first the list is [3, 2, 1]; draws of 0 rotate it, draws near 1 keep it
  assert.deepEqual(await slugs(0), ['episode-2', 'episode-1', 'episode-3']);
  assert.deepEqual(await slugs(0.999), ['episode-3', 'episode-2', 'episode-1']);
});

test('per-row play continues from that row onward in the shown order', async () => {
  const h = await bootListen({ page: 'home', list: tracks(5), gtag: true });
  h.$$('[data-gala-listen-act="play-track"]')[1].click();
  assert.deepEqual(played(h), [file(4)]);
  assert.equal(
    h.$('[data-gala-listen-slot="label"]').textContent,
    'Now playing · 2 of 5',
  );
  assert.deepEqual(h.events.at(-1)?.params, {
    listen_post: 'episode-4',
    listen_source: 'track',
    listen_order: 'newest',
    listen_format: 'conversation',
  });
  h.media.end(h.audio());
  h.media.end(h.audio());
  h.media.end(h.audio());
  assert.deepEqual(played(h), [file(4), file(3), file(2), file(1)]);
  h.media.end(h.audio());
  assert.equal(h.media.plays.length, 4, 'the end of the list ends the queue');
});

test('per-row play follows the order the reader chose', async () => {
  const h = await bootListen({ page: 'home', list: tracks(4), gtag: true });
  choose(h, 'oldest');
  const rows = h.$$('[data-gala-listen-act="play-track"]');
  assert.equal(
    rows[2].getAttribute('data-gala-listen-track-id'),
    tracks(4)[1].id,
    'DOM follows the select',
  );
  rows[2].click();
  assert.deepEqual(played(h), [file(3)]);
  h.media.end(h.audio());
  assert.deepEqual(played(h), [file(3), file(4)]);
  assert.equal(
    h.events.find((e) => e.name === 'listen_play')?.params.listen_order,
    'oldest',
  );
});

test('rows hidden behind Show all still play in the queue', async () => {
  const h = await bootListen({ page: 'home', list: tracks(7) });
  h.act('play-all');
  for (let n = 0; n < 6; n += 1) h.media.end(h.audio());
  assert.deepEqual(played(h), [7, 6, 5, 4, 3, 2, 1].map(file));
});

test('auto-advance reports the finished episode, starts the next and keeps the speed', async () => {
  const h = await bootListen({ page: 'home', list: tracks(3), gtag: true });
  h.act('play-all');
  h.act('speed');
  h.media.end(h.audio());
  assert.deepEqual(
    h.events.filter((e) => e.name === 'listen_complete').map((e) => e.params),
    [{ listen_post: 'episode-3', listen_source: 'playlist' }],
  );
  assert.deepEqual(played(h), [file(3), file(2)]);
  assert.equal(h.media.plays[1].rate, 1.25, 'the chosen speed carries over');
  assert.equal(
    h.$('[data-gala-listen-slot="label"]').textContent,
    'Now playing · 2 of 3',
  );
  assert.equal(h.$('[data-gala-listen-slot="name"]').textContent, 'Episode 2');
  assert.equal(
    h.$('[data-gala-listen-slot="name"]').getAttribute('href'),
    '/episode-2/',
  );
  assert.equal(h.session().index, 1);
  assert.equal(h.events.at(-1)?.name, 'listen_play');
  assert.equal(h.events.at(-1)?.params.listen_post, 'episode-2');
});

test('when the last episode ends the queue ends: reported, no resume, toggle reads Play', async () => {
  const h = await bootListen({ page: 'home', list: tracks(2), gtag: true });
  h.act('play-all');
  h.media.end(h.audio());
  h.media.end(h.audio());
  assert.equal(h.events.filter((e) => e.name === 'listen_complete').length, 2);
  assert.equal(h.media.plays.length, 2);
  assert.equal(h.session(), null, 'a finished queue is not resumed');
  h.fire('pagehide');
  assert.equal(h.session(), null);
  assert.equal(
    h.$('[data-gala-listen-act="toggle"]').getAttribute('aria-label'),
    'Play',
  );
  assert.equal(h.card().hasAttribute('data-playing'), false);
});

test('playing a finished episode again is a new play and a new completion', async () => {
  const h = await bootListen({ page: 'article', gtag: true });
  h.$('[data-gala-listen-open="current"]').click();
  h.media.loaded(h.audio(), 424);
  h.media.end(h.audio());
  h.act('toggle');
  assert.equal(h.audio().currentTime, 0, 'starts over');
  h.media.end(h.audio());
  assert.deepEqual(
    h.events.map((e) => e.name),
    ['listen_play', 'listen_complete', 'listen_play', 'listen_complete'],
  );
});

test('previous and next show only for a queue of more than one; previous restarts after 3 s', async () => {
  const single = await bootListen({ page: 'article' });
  single.$('[data-gala-listen-open="current"]').click();
  assert.equal(single.$('[data-gala-listen-act="prev"]').hidden, true);
  assert.equal(single.$('[data-gala-listen-act="next"]').hidden, true);

  const h = await bootListen({ page: 'home', list: tracks(3) });
  h.act('play-all');
  const prev = h.$('[data-gala-listen-act="prev"]');
  const next = h.$('[data-gala-listen-act="next"]');
  assert.equal(prev.hidden, false);
  assert.equal(next.hidden, false);
  assert.equal(next.disabled, false);
  next.click();
  assert.deepEqual(played(h), [file(3), file(2)]);
  h.media.tick(h.audio(), 2);
  prev.click();
  assert.deepEqual(
    played(h),
    [file(3), file(2), file(3)],
    'within 3 s: the previous episode',
  );
  next.click();
  h.media.tick(h.audio(), 5);
  prev.click();
  assert.deepEqual(
    played(h),
    [file(3), file(2), file(3), file(2)],
    'after 3 s: restart, same episode',
  );
  assert.equal(h.audio().currentTime, 0);
  assert.equal(
    h.$('[data-gala-listen-slot="label"]').textContent,
    'Now playing · 2 of 3',
  );
  next.click();
  assert.equal(next.disabled, true, 'nothing after the last episode');
  next.click();
  assert.equal(h.media.plays.length, 5);
  h.media.tick(h.audio(), 1);
  prev.click();
  assert.equal(
    h.$('[data-gala-listen-slot="label"]').textContent,
    'Now playing · 2 of 3',
  );
  prev.click();
  prev.click();
  assert.equal(
    h.$('[data-gala-listen-slot="label"]').textContent,
    'Now playing · 1 of 3',
  );
  const before = h.media.plays.length;
  prev.click();
  assert.equal(h.media.plays.length, before, 'the first episode only restarts');
});

test('after the #listen jump Play all has focus, whether the page loads there, navigates there or the link is pressed again', async () => {
  const onLoad = await bootListen({ page: 'home', hash: '#listen' });
  assert.equal(
    onLoad.document.activeElement,
    onLoad.$('[data-gala-listen-act="play-all"]'),
  );
  assert.equal(onLoad.$('[data-gala-listen-controls]').hidden, false);

  const h = await bootListen({ page: 'home' });
  assert.notEqual(
    h.document.activeElement,
    h.$('[data-gala-listen-act="play-all"]'),
  );
  h.window.history.pushState(null, '', '#listen');
  h.fire('hashchange');
  assert.equal(
    h.document.activeElement,
    h.$('[data-gala-listen-act="play-all"]'),
  );

  h.$('[data-gala-listen-act="shuffle"]').focus();
  const proceeded = h
    .$('a[data-gala-listen-open="playlist"]')
    .dispatchEvent(
      new h.window.MouseEvent('click', { bubbles: true, cancelable: true }),
    );
  assert.equal(proceeded, true, 'the browser still does the jump');
  assert.equal(
    h.document.activeElement,
    h.$('[data-gala-listen-act="play-all"]'),
  );
});

test('a playlist whose rows are missing from the page does not break the rest', async () => {
  const h = await bootListen({ page: 'home', list: tracks(3) });
  h.$('[data-gala-listen-track]').remove();
  choose(h, 'oldest');
  h.act('play-all');
  assert.equal(h.media.plays.length, 1);
  assert.deepEqual(h.errors, []);
});
