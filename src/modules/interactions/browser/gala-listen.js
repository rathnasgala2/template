/**
 * The Listen browser script, emitted by the renderer as
 * `assets/gala-listen-v1.js` when a build offers audio versions of posts. A
 * same-origin external file (CSP `script-src 'self'`), loaded with `defer`.
 * Plain ES2020, no dependencies, one IIFE. It makes no request of its own: the
 * only traffic is the audio element's and, when `window.gtag` exists, GA4.
 *
 * Input is server-rendered: JSON blocks `data-gala-listen-config`, `-messages`,
 * `-current` (an article with audio) and `-tracks` (the home playlist, newest
 * first), the `<template data-gala-listen-ui>` the card is cloned from, the
 * top-bar `[data-gala-listen-open]` control and the home page
 * `[data-gala-listen-list]` section. The page reads completely without it.
 * Styling hooks the script sets on the card: `data-playing` while audio plays,
 * `data-leaving` for the 300 ms before it is removed; panels, rows and
 * controls it shows or hides use the `hidden` attribute.
 *
 * State: localStorage `gala.listen.declinedUntil.v1` (epoch ms) and
 * sessionStorage `gala.listen.session.v1` (`{queue, index, position, rate,
 * order}`, resumed paused on the next page). Every access is guarded.
 *
 * GA4, only while `typeof window.gtag === 'function'` (the analytics module
 * defines it after consent): listen_invite_shown, listen_play, listen_decline,
 * listen_complete. Block text reaches the DOM through `textContent` and
 * `setAttribute` only; there is no `innerHTML`.
 */

(function () {
  'use strict';

  /** @typedef {(...a: any[]) => any} F */
  const W = /** @type {any} */ (window);
  const DECLINE_KEY = 'gala.listen.declinedUntil.v1';
  const SESSION_KEY = 'gala.listen.session.v1';
  const SPEEDS = [1, 1.25, 1.5];
  const PREVIEW = 5;

  /** @type {(s: string, r?: ParentNode) => any} */
  const $ = (s, r = document) => r.querySelector(s);
  /** @type {F} */
  const blob = (n) => {
    try {
      return JSON.parse($('script[data-gala-listen-' + n + ']').textContent);
    } catch {
      return null;
    }
  };
  const tpl = $('template[data-gala-listen-ui]');
  if (!tpl) return;
  const cfg = blob('config') || {};
  const say = blob('messages') || {};
  const cur = blob('current');
  const all = blob('tracks') || [];
  const list = $('[data-gala-listen-list]');
  /** @type {F} */
  const markRow = (id) => {
    if (!list) return;
    for (const li of list.querySelectorAll('[data-gala-listen-track]')) {
      if (li.getAttribute('data-gala-listen-track') === id) {
        li.setAttribute('aria-current', 'true');
      } else li.removeAttribute('aria-current');
    }
  };

  /** @type {F} */
  const msg = (k, v = {}) =>
    String(
      say[k] ??
        k
          .split('.')
          .reduce(
            (/** @type {any} */ o, /** @type {string} */ p) => o?.[p],
            say,
          ) ??
        '',
    ).replace(/\{(\w+)\}/g, (m, n) => v[n] ?? m);
  /** @type {F} */
  const clock = (s) => {
    s = Math.max(0, Math.floor(s) || 0);
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  };
  /** @type {F} */
  const st = (kind, key, val) => {
    try {
      const s = W[kind];
      if (val === undefined) return s.getItem(key);
      if (val === null) s.removeItem(key);
      else s.setItem(key, val);
    } catch {
      // Storage blocked: a decline lasts for this page view, nothing resumes.
    }
  };
  /** @type {F} */
  const ga = (name, params) => {
    try {
      if (typeof W.gtag === 'function') W.gtag('event', name, params);
    } catch {
      // Analytics never breaks playback.
    }
  };

  /** @type {any} */
  let el = null;
  /** @type {any} */
  let audio = null;
  /** @type {any[]} */
  let q = [];
  let i = 0;
  let order = 'single';
  let source = 'invite';
  let rate = 1;
  let mark = 0;
  let seekTo = 0;
  let counted = false;
  let invited = false;
  let ready = false;
  let expanded = false;

  /** @type {F} */
  const slot = (n) => $('[data-gala-listen-slot="' + n + '"]', el);
  /** @type {F} */
  const act = (n) => $('[data-gala-listen-act="' + n + '"]', el);

  function paint() {
    if (!el || !q[i]) return;
    const a = audio;
    const playing = !a.paused && !a.ended && !a.error;
    const d = Number.isFinite(a.duration) ? a.duration : q[i].durationSeconds;
    const seek = $('.g-listen__seek', el);
    el.toggleAttribute('data-playing', playing);
    act('toggle').setAttribute(
      'aria-label',
      msg(playing ? 'player.pause' : 'player.play'),
    );
    $('.i-pause', el).hidden = !playing;
    $('.i-play', el).hidden = playing;
    seek.max = String(Math.round(d));
    seek.value = String(Math.floor(a.currentTime));
    seek.setAttribute(
      'aria-valuetext',
      msg('player.time', { elapsed: clock(a.currentTime), total: clock(d) }),
    );
    slot('time').textContent = clock(a.currentTime) + ' / ' + clock(d);
  }

  function save() {
    if (!el || !q[i] || audio.ended) return;
    mark = audio.currentTime;
    st(
      'sessionStorage',
      SESSION_KEY,
      JSON.stringify({
        queue: q,
        index: i,
        position: Math.floor(mark),
        rate,
        order,
      }),
    );
  }

  function leave() {
    const c = el;
    if (!c) return;
    el = audio = null;
    q = [];
    markRow(null);
    st('sessionStorage', SESSION_KEY, null);
    c.setAttribute('data-leaving', '');
    c.querySelector('audio').pause();
    setTimeout(() => c.remove(), 300);
  }

  function speedLabel() {
    const b = act('speed');
    b.textContent = rate + '×';
    b.setAttribute('aria-label', msg('player.speed', { rate }));
  }

  /** @type {F} */
  const skip = (d) => {
    const end = Number.isFinite(audio.duration) ? audio.duration : Infinity;
    audio.currentTime = Math.min(Math.max(0, audio.currentTime + d), end);
    paint();
  };

  function play() {
    const t = q[i];
    if (!el || !t) return;
    if (!counted) {
      counted = true;
      ga('listen_play', {
        listen_post: t.slug,
        listen_source: source,
        listen_order: order,
        listen_format: t.format,
      });
      setTimeout(() => {
        if (el) {
          slot('status').textContent = msg('player.playing', {
            title: t.title,
          });
        }
      }, 60);
    }
    Promise.resolve(audio.play()).catch(paint);
    paint();
  }

  /** @type {F} */
  const go = (n) => {
    cue(n, 0);
    play();
  };
  const prev = () => {
    if (audio.currentTime > 3 || !i) skip(-audio.currentTime);
    else go(i - 1);
  };
  const next = () => {
    if (i < q.length - 1) go(i + 1);
  };

  /** @type {F} */
  const cue = (n, pos) => {
    const t = q[(i = n)];
    const multi = q.length > 1;
    counted = false;
    audio.src = t.audio;
    audio.playbackRate = audio.defaultPlaybackRate = rate;
    seekTo = pos || 0;
    if (pos) {
      try {
        audio.currentTime = pos;
      } catch {
        // Not loaded yet in this engine: loadedmetadata applies seekTo.
      }
    }
    const name = slot('name');
    name.textContent = t.title;
    name.href = t.url;
    markRow(t.id);
    slot('label').textContent =
      msg('player.nowPlaying') +
      (multi
        ? ' · ' + msg('player.position', { index: n + 1, count: q.length })
        : '');
    act('prev').hidden = act('next').hidden = !multi;
    act('next').disabled = n >= q.length - 1;
    speedLabel();
    const ms = navigator.mediaSession;
    if (ms && W.MediaMetadata) {
      /** @type {Record<string, F | null>} */
      const h = {
        play,
        pause: () => audio.pause(),
        seekbackward: () => skip(-15),
        seekforward: () => skip(15),
        previoustrack: multi ? prev : null,
        nexttrack: multi && n < q.length - 1 ? next : null,
      };
      try {
        ms.metadata = new W.MediaMetadata({
          title: t.title,
          artist: cfg.siteTitle || '',
          artwork: cfg.artwork ? [{ src: cfg.artwork }] : [],
        });
      } catch {
        // Media Session is optional.
      }
      for (const k in h) {
        try {
          ms.setActionHandler(/** @type {any} */ (k), h[k]);
        } catch {
          // An action this browser does not know.
        }
      }
    }
    paint();
    save();
  };

  function mount() {
    if (el) return;
    invited = true; // any card counts: the invitation never follows a player
    const card = (el = tpl.content.firstElementChild.cloneNode(true));
    const a = (audio = $('audio', card));
    document.body.append(card);
    /** @type {F} */
    const on = (type, f) =>
      a.addEventListener(type, () => {
        if (a === audio) f();
      });
    for (const type of ['play', 'timeupdate', 'durationchange', 'error'])
      on(type, paint);
    on('loadedmetadata', () => {
      if (seekTo && Math.abs(audio.currentTime - seekTo) > 1) {
        audio.currentTime = seekTo;
      }
      seekTo = 0;
    });
    on('pause', () => {
      save();
      paint();
    });
    on('timeupdate', () => {
      if (Math.abs(audio.currentTime - mark) >= 5) save();
    });
    on('ended', () => {
      ga('listen_complete', { listen_post: q[i].slug, listen_source: source });
      counted = false; // a replay is a new play
      if (i < q.length - 1) go(i + 1);
      else st('sessionStorage', SESSION_KEY, null);
      paint();
    });
    const seek = $('.g-listen__seek', card);
    seek.addEventListener('input', () => {
      audio.currentTime = Number(seek.value);
      paint();
    });
  }

  function showPlayer() {
    $('.g-listen__invite', el).hidden = true;
    $('.g-listen__player', el).hidden = false;
    // The card is no longer named by the invitation's title.
    el.removeAttribute('aria-labelledby');
  }

  /** @type {F} */
  const start = (tracks, ord, src, n) => {
    q = tracks;
    order = ord;
    source = src;
    mount();
    showPlayer();
    cue(n || 0, 0);
    play();
  };

  function tryInvite() {
    const banner = $('.g-consent');
    if (
      !ready ||
      invited ||
      document.visibilityState !== 'visible' ||
      (banner && !banner.hidden) ||
      Number(st('localStorage', DECLINE_KEY)) > Date.now()
    ) {
      return;
    }
    mount();
    slot('invite-body').textContent = msg('invite.body.' + cur.format, {
      minutes: Math.max(1, Math.round(cur.durationSeconds / 60)),
    });
    ga('listen_invite_shown', { listen_post: cur.slug });
  }

  // The home page playlist.
  const sel = list && $('[data-gala-listen-order]', list);
  const shown = () => (sel.value === 'oldest' ? all.slice().reverse() : all);
  /** @type {F} */
  const shuffle = (a) => {
    a = a.slice();
    for (let n = a.length - 1; n > 0; n--) {
      const j = Math.floor(Math.random() * (n + 1));
      [a[n], a[j]] = [a[j], a[n]];
    }
    return a;
  };
  function render() {
    shown().forEach((/** @type {any} */ t, /** @type {number} */ n) => {
      const li = $('[data-gala-listen-track="' + t.id + '"]', list);
      if (!li) return;
      li.parentNode.append(li);
      li.hidden = !expanded && n >= PREVIEW;
    });
    $('[data-gala-listen-act="show-all"]', list).hidden =
      expanded || all.length <= PREVIEW;
  }
  function focusPlayAll() {
    const b = list && $('[data-gala-listen-act="play-all"]', list);
    if (b) b.focus({ preventScroll: true });
  }

  /** @type {Record<string, (b: Element) => void>} */
  const acts = {
    'open-current'() {
      if (el && q[i] && q[i].id === cur.id) play();
      else start([cur], 'single', 'nav');
    },
    'open-playlist': focusPlayAll,
    yes() {
      start([cur], 'single', 'invite');
      act('toggle').focus({ preventScroll: true });
    },
    no() {
      st('localStorage', DECLINE_KEY, String(Date.now() + 30 * 864e5));
      ga('listen_decline', { listen_post: cur.slug });
      leave();
    },
    later: leave,
    stop: leave,
    toggle() {
      if (audio.paused || audio.ended) play();
      else audio.pause();
    },
    back: () => skip(-15),
    prev,
    next,
    speed() {
      rate = SPEEDS[(SPEEDS.indexOf(rate) + 1) % SPEEDS.length];
      audio.playbackRate = audio.defaultPlaybackRate = rate;
      speedLabel();
      save();
    },
    'play-all': () => start(shown(), sel.value, 'playlist'),
    shuffle: () => start(shuffle(all), 'shuffle', 'playlist'),
    'play-track'(b) {
      const id = b.getAttribute('data-gala-listen-track-id');
      const s = shown();
      start(
        s,
        sel.value,
        'track',
        s.findIndex((/** @type {any} */ t) => t.id === id),
      );
    },
    'show-all'() {
      expanded = true;
      render();
    },
  };

  document.addEventListener('click', (e) => {
    const b = /** @type {Element} */ (e.target).closest?.(
      '[data-gala-listen-act],[data-gala-listen-open]',
    );
    if (!b || b.closest('[data-leaving]')) return;
    const k =
      b.getAttribute('data-gala-listen-act') ||
      'open-' + b.getAttribute('data-gala-listen-open');
    if (acts[k]) acts[k](b);
  });
  document.addEventListener(
    'keydown',
    (e) => {
      if (e.key === 'Escape' && el && !$('.g-listen__invite', el).hidden) {
        leave();
      }
    },
    true,
  );
  document.addEventListener('visibilitychange', tryInvite);
  W.addEventListener('pagehide', save);

  if (list && all.length) {
    $('[data-gala-listen-controls]', list).hidden = false;
    list
      .querySelectorAll('[data-gala-listen-act="play-track"]')
      .forEach((/** @type {any} */ b) => (b.hidden = false));
    sel.addEventListener('change', render);
    render();
    W.addEventListener('hashchange', () => {
      if (location.hash === '#listen') focusPlayAll();
    });
    // Arriving from another page: the browser's own jump to #listen moves focus after this
    // deferred script runs, so focus Play all once the page has loaded.
    if (location.hash === '#listen') {
      if (document.readyState === 'complete') focusPlayAll();
      else W.addEventListener('load', focusPlayAll, { once: true });
    }
  }

  try {
    const s = JSON.parse(st('sessionStorage', SESSION_KEY));
    if (s) {
      if (typeof s.queue[s.index].audio !== 'string')
        throw new Error('session');
      q = s.queue;
      order = s.order || 'single';
      source = 'resume';
      rate = SPEEDS.includes(s.rate) ? s.rate : 1;
      mount();
      showPlayer();
      cue(s.index, s.position);
    }
  } catch {
    // An unusable session: drop any half-built card and the stored record.
    leave();
    st('sessionStorage', SESSION_KEY, null);
  }
  if (cur) {
    setTimeout(() => {
      ready = true;
      tryInvite();
    }, 2500);
    const banner = $('.g-consent');
    if (banner) {
      new MutationObserver(tryInvite).observe(banner, {
        attributes: true,
        attributeFilter: ['hidden'],
      });
    }
  }
})();
