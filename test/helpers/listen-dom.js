/**
 * Shared harness for the Listen script's tests: the DOM contract of the design
 * (section 3) as markup, then the shipped `gala-listen.js` run in JSDOM with a
 * scripted media element, a fake clock, a seeded random, optional gtag and
 * Media Session, and storage that can be blocked. Nothing here mirrors the
 * script's logic.
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { JSDOM } from 'jsdom';

import { CONSENT_SCRIPT_SOURCE } from '../../src/core/internal/analytics/consent-script.js';
import { renderConsentBanner } from '../../src/core/internal/analytics/markup.js';
import { getMessages } from '../../src/core/internal/messages.js';

/** The one place that names where the script lives. */
export const LISTEN_SCRIPT_PATH = path.resolve(
  import.meta.dirname,
  '../../src/modules/interactions/browser/gala-listen.js',
);
export const LISTEN_SOURCE = await readFile(LISTEN_SCRIPT_PATH, 'utf8');

export const PAGE = 'https://blog.example/';
export const DECLINE_KEY = 'gala.listen.declinedUntil.v1';
export const SESSION_KEY = 'gala.listen.session.v1';
export const DAY = 86_400_000;
/** The fake clock's start (epoch ms). */
export const T0 = 1_800_000_000_000;

/** English source strings (design section 5), keyed as the blob carries them. */
export const MESSAGES = Object.freeze({
  'nav.label': 'Listen',
  'nav.current': 'Listen to this post',
  'invite.title': 'Hands busy? Listen instead.',
  'invite.body.conversation':
    'This post is also a {minutes}-minute conversation. Good for a drive, a workout or the dishes.',
  'invite.body.narration': 'This post is also a {minutes}-minute narration.',
  'invite.body.debate': 'This post is also a {minutes}-minute debate.',
  'invite.body.skit': 'This post is also a {minutes}-minute skit.',
  'invite.play': 'Play it',
  'invite.decline': 'No thanks',
  'invite.note': 'AI voices, adapted from this post.',
  'invite.close': 'Close for now',
  'player.region': 'Audio player',
  'player.nowPlaying': 'Now playing',
  'player.position': '{index} of {count}',
  'player.play': 'Play',
  'player.pause': 'Pause',
  'player.back': 'Back 15 seconds',
  'player.previous': 'Previous episode',
  'player.next': 'Next episode',
  'player.speed': 'Playback speed {rate} times',
  'player.seek': 'Position',
  'player.time': '{elapsed} of {total}',
  'player.close': 'Stop and close',
  'player.playing': 'Playing: {title}',
  'list.heading': 'Listen to this blog',
  'list.summary': '{count} episodes · {duration}',
  'list.playAll': 'Play all',
  'list.shuffle': 'Shuffle',
  'list.order': 'Order',
  'list.newest': 'Newest first',
  'list.oldest': 'Oldest first',
  'list.showAll': 'Show all {count}',
  'list.playTrack': 'Play {title}',
  'duration.minutes': '{minutes} min',
  'duration.hoursMinutes': '{hours} h {minutes} min',
});

/**
 * @param {number} n 1-based episode number (1 is the oldest)
 * @param {Record<string, unknown>} [extra] overrides
 * @returns {Record<string, any>} a track object as the build writes it
 */
export function track(n, extra = {}) {
  const slug = `episode-${n}`;
  return {
    id: `0190b1f0-0000-7000-8000-0000000000${String(n).padStart(2, '0')}`,
    slug,
    title: `Episode ${n}`,
    url: `/${slug}/`,
    audio: `/assets/listen/${slug}.${String(n).repeat(8)}.mp3`,
    durationSeconds: 420 + n * 60,
    format: 'conversation',
    publishedAt: new Date(Date.UTC(2026, 9, n)).toISOString(),
    ...extra,
  };
}

/**
 * @param {number} count how many episodes
 * @returns {Record<string, any>[]} the home page blob: newest first
 */
export function tracks(count) {
  return Array.from({ length: count }, (_, k) => track(count - k));
}

const ICON = (/** @type {string} */ cls = '') =>
  `<svg class="${cls}" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 2v10l9-5z"/></svg>`;
const BARS =
  '<svg width="22" height="22" viewBox="0 0 22 22"><g class="g-bars"><rect x="3" y="6" width="3" height="12"/><rect x="9" y="2" width="3" height="16"/><rect x="15" y="8" width="3" height="10"/></g></svg>';

/**
 * @param {unknown} value any JSON value
 * @returns {string} JSON safe inside a script element
 */
function json(value) {
  return JSON.stringify(value).replaceAll('<', '\\u003c');
}

/**
 * @param {Record<string, string>} m the messages
 * @returns {string} the UI template, as the build writes it
 */
function uiTemplate(m) {
  return (
    `<template data-gala-listen-ui><aside class="g-listen" aria-labelledby="g-listen-title">` +
    `<div class="g-listen__invite"><span class="g-listen__icon" aria-hidden="true">${BARS}</span>` +
    `<p class="g-listen__title" id="g-listen-title">${m['invite.title']}</p>` +
    `<p class="g-listen__body" data-gala-listen-slot="invite-body"></p>` +
    `<div class="g-listen__actions"><button type="button" class="g-listen__yes" data-gala-listen-act="yes">${ICON()}${m['invite.play']}</button>` +
    `<button type="button" class="g-listen__no" data-gala-listen-act="no">${m['invite.decline']}</button></div>` +
    `<p class="g-listen__note">${m['invite.note']}</p>` +
    `<button type="button" class="g-listen__close" data-gala-listen-act="later" aria-label="${m['invite.close']}">${ICON()}</button></div>` +
    `<div class="g-listen__player" role="region" aria-label="${m['player.region']}" hidden>` +
    `<div class="g-listen__now"><span class="g-listen__icon" aria-hidden="true">${BARS}</span><div class="g-listen__meta">` +
    `<p class="g-listen__label" data-gala-listen-slot="label"></p><a class="g-listen__name" data-gala-listen-slot="name" href=""></a></div></div>` +
    `<input class="g-listen__seek" id="g-listen-seek" type="range" min="0" step="1" value="0" aria-label="${m['player.seek']}">` +
    `<div class="g-listen__row"><span class="g-listen__time" data-gala-listen-slot="time" aria-hidden="true"></span>` +
    `<button type="button" class="g-listen__round" data-gala-listen-act="prev" aria-label="${m['player.previous']}" hidden>${ICON()}</button>` +
    `<button type="button" class="g-listen__round" data-gala-listen-act="back" aria-label="${m['player.back']}">${ICON()}</button>` +
    `<button type="button" class="g-listen__toggle" data-gala-listen-act="toggle" aria-label="${m['player.pause']}">${ICON('i-pause')}${ICON('i-play').replace('<svg ', '<svg hidden ')}</button>` +
    `<button type="button" class="g-listen__round" data-gala-listen-act="next" aria-label="${m['player.next']}" hidden>${ICON()}</button>` +
    `<button type="button" class="g-listen__speed" data-gala-listen-act="speed">1×</button></div>` +
    `<button type="button" class="g-listen__close" data-gala-listen-act="stop" aria-label="${m['player.close']}">${ICON()}</button>` +
    `<p class="g-listen__status" data-gala-listen-slot="status" aria-live="polite"></p></div>` +
    `<audio preload="none"></audio></aside></template>`
  );
}

/**
 * @param {Record<string, any>[]} list the home blob (newest first)
 * @param {Record<string, string>} m the messages
 * @returns {string} the home page playlist section
 */
function playlistSection(list, m) {
  const rows = list
    .map(
      (t) =>
        `<li data-gala-listen-track="${t.id}"><button type="button" data-gala-listen-act="play-track" data-gala-listen-track-id="${t.id}" aria-label="Play ${t.title}" hidden>${ICON()}</button>` +
        `<a href="${t.url}">${t.title}</a> <span class="g-listen-list__len">7 min</span> <time datetime="${t.publishedAt}">date</time></li>`,
    )
    .join('');
  return (
    `<section id="listen" class="g-listen-list" aria-labelledby="g-listen-list-title" data-gala-listen-list>` +
    `<div class="g-listen-list__head"><h2 id="g-listen-list-title">${m['list.heading']}</h2><p class="g-listen-list__summary">${list.length} episodes</p></div>` +
    `<div class="g-listen-list__controls" data-gala-listen-controls hidden>` +
    `<button type="button" data-gala-listen-act="play-all">${ICON()}${m['list.playAll']}</button>` +
    `<button type="button" data-gala-listen-act="shuffle">${ICON()}${m['list.shuffle']}</button>` +
    `<label for="g-listen-order">${m['list.order']}</label>` +
    `<select id="g-listen-order" data-gala-listen-order><option value="newest">${m['list.newest']}</option><option value="oldest">${m['list.oldest']}</option></select></div>` +
    `<ol class="g-listen-list__tracks" data-gala-listen-tracklist>${rows}</ol>` +
    `<button type="button" data-gala-listen-act="show-all" hidden>Show all ${list.length}</button>` +
    `<script type="application/json" data-gala-listen-tracks>${json(list)}</script></section>`
  );
}

/**
 * The first-party consent banner and script are the real ones; see
 * `src/core/internal/analytics`.
 *
 * @returns {string} the banner, hidden as the build writes it
 */
function consentBanner() {
  return renderConsentBanner({
    module: /** @type {any} */ ({
      config: {
        provider: { kind: 'google-analytics-4', measurementId: 'G-TEST123' },
      },
    }),
    messages: getMessages('en'),
    publicBasePath: '/',
    routeProfile: 'directory-index',
  });
}

/**
 * @param {object} [options] what the page carries
 * @param {'article' | 'home' | 'plain'} [options.page] article with audio,
 *   home page with the playlist, or any other page
 * @param {Record<string, any>} [options.current] the article's track
 * @param {Record<string, any>[]} [options.list] the home page tracks
 * @param {Record<string, any>} [options.messages] the messages blob
 * @param {boolean} [options.banner] render the consent banner (hidden)
 * @returns {string} a full document in the shape section 3 describes
 */
export function listenPage(options = {}) {
  const page = options.page ?? 'article';
  const messages = options.messages ?? MESSAGES;
  const flat = /** @type {Record<string, string>} */ (
    options.messages ? { ...MESSAGES, ...options.messages } : MESSAGES
  );
  const current = options.current ?? track(3, { durationSeconds: 424 });
  const nav =
    page === 'article'
      ? `<button type="button" class="g-listen-nav" data-gala-listen-open="current" aria-label="${flat['nav.current']}">${ICON()}<span class="g-listen-nav__label">${flat['nav.label']}</span></button>`
      : `<a class="g-listen-nav" href="/#listen" data-gala-listen-open="playlist">${ICON()}<span class="g-listen-nav__label">${flat['nav.label']}</span></a>`;
  return (
    `<!doctype html><html lang="en"><head>` +
    `<script type="application/json" data-gala-listen-config>${json({ siteTitle: 'Quiet Notes', playlistUrl: '/#listen', artwork: 'https://blog.example/cover.png' })}</script>` +
    `<script type="application/json" data-gala-listen-messages>${json(messages)}</script>` +
    `${page === 'article' ? `<script type="application/json" data-gala-listen-current>${json(current)}</script>` : ''}` +
    `${uiTemplate(flat)}</head><body><header>${nav}</header>` +
    `<main>${page === 'home' ? playlistSection(options.list ?? tracks(3), flat) : '<article><h1>Post</h1></article>'}</main>` +
    `${options.banner ? consentBanner() : ''}</body></html>`
  );
}

/**
 * A scripted media element: state lives beside the element, `src` resets it as
 * a real load does, and `play()`/`pause()` fire the events a browser fires.
 *
 * @param {any} window the JSDOM window
 * @returns {{plays: {src: string | null, at: number, rate: number}[], engine: {dropEarlySeeks: boolean}, tick: (el: any, seconds: number) => void, loaded: (el: any, duration: number) => void, end: (el: any) => void}} the scripting hooks
 */
function installMedia(window) {
  const proto = window.HTMLMediaElement.prototype;
  /** @type {WeakMap<object, any>} */
  const states = new WeakMap();
  /** @type {{src: string | null, at: number, rate: number}[]} */
  const plays = [];
  // An engine that ignores a seek made before the metadata is there.
  const engine = { dropEarlySeeks: false };
  const state = (/** @type {object} */ el) => {
    if (!states.has(el)) {
      states.set(el, {
        paused: true,
        ended: false,
        time: 0,
        duration: NaN,
        rate: 1,
        defaultRate: 1,
      });
    }
    return states.get(el);
  };
  const fire = (/** @type {any} */ el, /** @type {string} */ type) =>
    el.dispatchEvent(new window.Event(type));
  const define = (/** @type {string} */ name, /** @type {any} */ d) =>
    Object.defineProperty(proto, name, { configurable: true, ...d });
  define('paused', {
    get() {
      return state(this).paused;
    },
  });
  define('ended', {
    get() {
      return state(this).ended;
    },
  });
  define('duration', {
    get() {
      return state(this).duration;
    },
  });
  define('currentTime', {
    get() {
      return state(this).time;
    },
    set(/** @type {number} */ v) {
      if (engine.dropEarlySeeks && !Number.isFinite(state(this).duration))
        return;
      state(this).time = Number(v);
      state(this).ended = false;
      fire(this, 'timeupdate');
    },
  });
  define('playbackRate', {
    get() {
      return state(this).rate;
    },
    set(/** @type {number} */ v) {
      state(this).rate = Number(v);
    },
  });
  define('defaultPlaybackRate', {
    get() {
      return state(this).defaultRate;
    },
    set(/** @type {number} */ v) {
      state(this).defaultRate = Number(v);
    },
  });
  const original = Object.getOwnPropertyDescriptor(proto, 'src');
  define('src', {
    get() {
      return original?.get?.call(this);
    },
    set(/** @type {string} */ v) {
      original?.set?.call(this, v);
      const s = state(this);
      Object.assign(s, {
        paused: true,
        ended: false,
        time: 0,
        duration: NaN,
        rate: s.defaultRate,
      });
    },
  });
  proto.play = function play() {
    const s = state(this);
    if (s.ended) s.time = 0;
    s.paused = false;
    s.ended = false;
    plays.push({ src: this.getAttribute('src'), at: s.time, rate: s.rate });
    fire(this, 'play');
    return Promise.resolve();
  };
  proto.pause = function pause() {
    const s = state(this);
    if (s.paused) return;
    s.paused = true;
    fire(this, 'pause');
  };
  return {
    plays,
    engine,
    tick(el, seconds) {
      state(el).time += seconds;
      fire(el, 'timeupdate');
    },
    loaded(el, duration) {
      state(el).duration = duration;
      fire(el, 'loadedmetadata');
      fire(el, 'durationchange');
    },
    end(el) {
      const s = state(el);
      if (Number.isFinite(s.duration)) s.time = s.duration;
      s.ended = true;
      s.paused = true;
      fire(el, 'pause');
      fire(el, 'ended');
    },
  };
}

/**
 * A clock the script cannot outrun: timers run only when advanced.
 *
 * @param {any} window the JSDOM window
 * @returns {{now: () => number, advance: (ms: number) => void, pending: () => number}} the clock
 */
function installClock(window) {
  let now = T0;
  let seq = 0;
  /** @type {Map<number, {at: number, fn: (...a: any[]) => void, args: any[]}>} */
  const timers = new Map();
  window.Date.now = () => now;
  window.setTimeout = (
    /** @type {(...a: any[]) => void} */ fn,
    ms = 0,
    /** @type {any[]} */ ...args
  ) => {
    seq += 1;
    timers.set(seq, { at: now + Number(ms), fn, args });
    return seq;
  };
  window.clearTimeout = (/** @type {number} */ id) => timers.delete(id);
  return {
    now: () => now,
    pending: () => timers.size,
    advance(ms) {
      const end = now + ms;
      for (;;) {
        let due = null;
        for (const [id, t] of timers) {
          if (t.at <= end && (!due || t.at < due.t.at)) due = { id, t };
        }
        if (!due) break;
        timers.delete(due.id);
        now = Math.max(now, due.t.at);
        due.t.fn(...due.t.args);
      }
      now = end;
    },
  };
}

/** @returns {Promise<void>} resolves once pending microtasks (observers) ran */
export function settle() {
  return new Promise((resolve) => setImmediate(resolve));
}

/**
 * @param {number} seed any integer
 * @returns {() => number} a seeded random in [0, 1) (mulberry32)
 */
export function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Boot the shipped script in a fresh DOM.
 *
 * @param {object} [options] page and environment
 * @param {string} [options.html] a prepared document (default: from `page`)
 * @param {'article' | 'home' | 'plain'} [options.page] see {@link listenPage}
 * @param {Record<string, any>} [options.current] the article's track
 * @param {Record<string, any>[]} [options.list] the home page tracks
 * @param {Record<string, any>} [options.messages] the messages blob
 * @param {boolean} [options.banner] render the consent banner (hidden)
 * @param {boolean} [options.bannerOpen] show it before the script runs
 * @param {string} [options.hash] the URL fragment the page loads with
 * @param {number} [options.declinedUntil] stored decline (epoch ms)
 * @param {Record<string, any>} [options.session] stored player session
 * @param {boolean} [options.blockStorage] make both storages throw
 * @param {boolean} [options.gtag] define a recording `window.gtag`
 * @param {boolean} [options.mediaSession] provide Media Session and metadata
 * @param {boolean} [options.dropEarlySeeks] an engine that ignores a seek made
 *   before the metadata is there
 * @param {number} [options.seed] seed `Math.random`
 * @param {boolean} [options.run] evaluate the script (default true)
 * @returns {Promise<any>} the harness
 */
export async function bootListen(options = {}) {
  const dom = new JSDOM(options.html ?? listenPage(options), {
    url: PAGE + (options.hash ?? ''),
    runScripts: 'outside-only',
    pretendToBeVisual: true,
  });
  const { window } = dom;
  const clock = installClock(window);
  const media = installMedia(window);
  media.engine.dropEarlySeeks = options.dropEarlySeeks === true;
  window.Math.random = seeded(options.seed ?? 1);
  /** @type {{name: string, params: any}[]} */
  const events = [];
  /** @type {string[][]} */
  const gtagCalls = [];
  // Values built inside the window have its own prototypes: copy them as JSON.
  const record = (
    /** @type {string} */ kind,
    /** @type {string} */ name,
    /** @type {any} */ params,
  ) => {
    gtagCalls.push([kind, name]);
    if (kind === 'event') {
      events.push({ name, params: JSON.parse(JSON.stringify(params ?? null)) });
    }
  };
  if (options.gtag) window.gtag = record;
  /** @type {{metadata: any, handlers: Record<string, any>, setActionHandler: (n: string, f: unknown) => void}} */
  const mediaSession = {
    metadata: null,
    handlers: {},
    setActionHandler(name, fn) {
      this.handlers[name] = fn;
    },
  };
  if (options.mediaSession) {
    window.MediaMetadata = class {
      /** @param {Record<string, unknown>} init the metadata */
      constructor(init) {
        Object.assign(this, JSON.parse(JSON.stringify(init)));
      }
    };
    Object.defineProperty(window.navigator, 'mediaSession', {
      value: mediaSession,
      configurable: true,
    });
  }
  if (options.declinedUntil !== undefined) {
    window.localStorage.setItem(DECLINE_KEY, String(options.declinedUntil));
  }
  if (options.session) {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(options.session));
  }
  if (options.bannerOpen) {
    window.document.querySelector('.g-consent')?.removeAttribute('hidden');
  }
  if (options.blockStorage) {
    const denied = () => {
      throw new window.DOMException('denied', 'SecurityError');
    };
    Object.defineProperties(window, {
      localStorage: { configurable: true, get: denied },
      sessionStorage: { configurable: true, get: denied },
    });
  }
  /** @type {string[]} */
  const errors = [];
  window.addEventListener('error', (/** @type {ErrorEvent} */ e) =>
    errors.push(e.message),
  );
  const run = () => window.eval(LISTEN_SOURCE);
  if (options.run !== false) run();
  const doc = window.document;
  const $ = (/** @type {string} */ s) => doc.querySelector(s);
  return {
    window,
    document: doc,
    clock,
    media,
    events,
    gtagCalls,
    installGtag: () => {
      window.gtag = record;
    },
    errors,
    mediaSession,
    run,
    $,
    $$: (/** @type {string} */ s) => Array.from(doc.querySelectorAll(s)),
    // The live card and its audio element.
    card: () => $('.g-listen'),
    audio: () => $('.g-listen audio'),
    // Move the fake clock; openInvite waits out the 2.5 s invitation delay.
    advance: (/** @type {number} */ ms) => clock.advance(ms),
    openInvite: () => clock.advance(2500),
    // Click the control with this data-gala-listen-act.
    act: (/** @type {string} */ act) =>
      $(`[data-gala-listen-act="${act}"]`)?.click(),
    // Dispatch a keydown on the document, or a window event by type.
    key: (/** @type {string} */ key) =>
      doc.dispatchEvent(
        new window.KeyboardEvent('keydown', { key, bubbles: true }),
      ),
    fire: (/** @type {string} */ name) =>
      window.dispatchEvent(new window.Event(name)),
    local: (/** @type {string} */ key) => window.localStorage.getItem(key),
    session: () => {
      const raw = window.sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    },
    // Run the real consent script the way the page does: once it is ready.
    consent: async () => {
      if (doc.readyState === 'loading') {
        await new Promise((resolve) =>
          doc.addEventListener('DOMContentLoaded', resolve),
        );
      }
      window.eval(CONSENT_SCRIPT_SOURCE);
    },
    // Change the tab's visibility and tell the page.
    visibility: (/** @type {'visible' | 'hidden'} */ state) => {
      Object.defineProperty(doc, 'visibilityState', {
        configurable: true,
        get: () => state,
      });
      doc.dispatchEvent(new window.Event('visibilitychange'));
    },
  };
}
