/**
 * The reading-signals browser script, emitted by the renderer as
 * `assets/gala-signals-v1.js` on article routes of publications whose
 * repository enables the interactions module (Today, spec section 10, D16). A
 * same-origin external file (CSP `script-src 'self'`), loaded with `defer`.
 * Plain ES2020, no dependencies, one IIFE.
 *
 * It tells Galascribe how far a signed-in reader got through a post, so their
 * daily picks (Today) learn from what they actually read. It does nothing
 * unless the page carries the interactions root (`[data-gala-interactions]`,
 * whose `data-api-origin`, `data-publication-id` and `data-content-id` it
 * reads) AND this browser holds a reader session for the site
 * (`localStorage["gala.reader.session.<publicationId>"]`, the token the
 * interactions and audience scripts keep). A visitor without a session sends
 * nothing; the page never shows anything for this script.
 *
 * Events, batched and sent as `POST {api}/v2/reader/signals`
 * `{batchId, events[]}` with the bearer token (at most 50 an envelope):
 * `VIEW` once on load (and `OPEN` with the Today item id when the address
 * carries `?gala-item=<id>`), `SCROLL` with the highest of 25/50/75/100
 * percent newly reached, `DWELL` with the seconds the page was visible since
 * the last envelope (the API adds them up; a page caps at 20 minutes). An
 * envelope goes every 15 s while there is something to say, and once more
 * (`keepalive`) when the page is hidden or left. Every event has its own id
 * and the envelope its own, so a retry never counts twice.
 *
 * Consent lives server-side: a reader who has not allowed it (or Today being
 * off) answers 403/404, after which this page sends nothing more and the
 * browser stays quiet for the site for an hour
 * (`sessionStorage["gala.signals.off.<publicationId>"]`). A 401 does the same
 * for the page. A network failure keeps the events for the next envelope.
 *
 * Security: no DOM writes, no cookie, no third-party request; every request is
 * `mode: 'cors'`, `credentials: 'omit'`, bounded by a 10 s timeout.
 */

(function () {
  'use strict';

  const FLUSH_MS = 15000;
  const REQUEST_TIMEOUT_MS = 10000;
  const QUIET_MS = 60 * 60 * 1000;
  const MAX_EVENTS = 50;
  const MAX_DWELL_SECONDS = 1200;
  const THRESHOLDS = [25, 50, 75, 100];

  const root = /** @type {HTMLElement | null} */ (
    document.querySelector('[data-gala-interactions]')
  );
  if (!root) return;
  const apiOrigin = String(root.dataset.apiOrigin || '').replace(/\/+$/, '');
  const publicationId = root.dataset.publicationId || '';
  const contentId = root.dataset.contentId || '';
  if (!apiOrigin || !publicationId || !contentId) return;

  const SESSION_KEY = 'gala.reader.session.' + publicationId;
  const OFF_KEY = 'gala.signals.off.' + publicationId;

  /**
   * @param {'localStorage' | 'sessionStorage'} kind
   * @param {string} key
   * @returns {any} the parsed value, or null
   */
  function readJson(kind, key) {
    try {
      const raw = window[kind].getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /**
   * @param {'localStorage' | 'sessionStorage'} kind
   * @param {string} key
   * @param {unknown} value `null` removes
   */
  function writeJson(kind, key, value) {
    try {
      if (value === null) window[kind].removeItem(key);
      else window[kind].setItem(key, JSON.stringify(value));
    } catch {
      // Storage is a nicety here.
    }
  }

  /** @returns {string | null} the reader's bearer token while it is valid */
  function accessToken() {
    const stored = readJson('localStorage', SESSION_KEY);
    if (
      !stored ||
      typeof stored.accessToken !== 'string' ||
      !stored.accessToken
    )
      return null;
    const expires = Date.parse(stored.expiresAt);
    if (!Number.isFinite(expires) || expires <= Date.now()) return null;
    return stored.accessToken;
  }

  const token = accessToken();
  if (!token) return;
  const quietUntil = readJson('sessionStorage', OFF_KEY);
  if (typeof quietUntil === 'number' && quietUntil > Date.now()) return;

  /** @returns {string} a random v4 UUID */
  function uuid() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    const bytes = new Uint8Array(16);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < 16; i += 1)
        bytes[i] = Math.floor(Math.random() * 256);
    }
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join(
      '',
    );
    return (
      hex.slice(0, 8) +
      '-' +
      hex.slice(8, 12) +
      '-' +
      hex.slice(12, 16) +
      '-' +
      hex.slice(16, 20) +
      '-' +
      hex.slice(20)
    );
  }

  /** @returns {string | null} the Today item this open came from, when the address says */
  function itemFromAddress() {
    try {
      const value = new URL(window.location.href).searchParams.get('gala-item');
      return value && /^[0-9a-f-]{36}$/i.test(value) ? value : null;
    } catch {
      return null;
    }
  }

  /** @type {Array<Record<string, unknown>>} */
  let queue = [];
  let stopped = false;
  let reachedPercent = 0;
  let dwellMs = 0;
  let dwellSentSeconds = 0;
  let visibleSince = document.visibilityState === 'visible' ? Date.now() : null;
  /** @type {ReturnType<typeof setInterval> | null} */
  let timer = null;
  let sending = false;

  /**
   * @param {string} kind
   * @param {Record<string, unknown>} [extra]
   */
  function push(kind, extra) {
    if (stopped) return;
    queue.push({
      eventId: uuid(),
      kind,
      contentId,
      publicationId,
      itemId: null,
      at: new Date().toISOString(),
      scrollPercent: null,
      dwellSeconds: null,
      ...extra,
    });
    if (queue.length > MAX_EVENTS)
      queue = queue.slice(queue.length - MAX_EVENTS);
  }

  /** Folds the visible time so far into `dwellMs`. */
  function settleDwell() {
    if (visibleSince !== null) {
      dwellMs += Math.max(0, Date.now() - visibleSince);
      visibleSince = document.visibilityState === 'visible' ? Date.now() : null;
    }
  }

  /** Turns the visible time since the last envelope into a `DWELL` event. */
  function queueDwell() {
    settleDwell();
    const seconds = Math.floor(dwellMs / 1000);
    if (seconds < 1) return;
    const room = MAX_DWELL_SECONDS - dwellSentSeconds;
    const send = Math.min(seconds, room);
    dwellMs -= seconds * 1000;
    if (send < 1) return;
    dwellSentSeconds += send;
    push('DWELL', { dwellSeconds: send });
  }

  function stop() {
    stopped = true;
    queue = [];
    if (timer !== null) clearInterval(timer);
    timer = null;
    window.removeEventListener('scroll', onScroll);
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('pagehide', onLeave);
  }

  function quiet() {
    writeJson('sessionStorage', OFF_KEY, Date.now() + QUIET_MS);
    stop();
  }

  /**
   * @param {boolean} leaving whether the page is being hidden or left
   * @returns {Promise<void>} settled when the envelope is answered
   */
  async function flush(leaving) {
    if (stopped || sending) return;
    queueDwell();
    if (queue.length === 0) return;
    const events = queue.slice(0, MAX_EVENTS);
    queue = queue.slice(events.length);
    sending = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(apiOrigin + '/v2/reader/signals', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({ batchId: uuid(), events }),
        mode: 'cors',
        credentials: 'omit',
        keepalive: leaving,
        signal: controller.signal,
      });
      if (
        response.status === 401 ||
        response.status === 403 ||
        response.status === 404
      ) {
        quiet();
      } else if (response.status >= 500) {
        queue = events.concat(queue).slice(0, MAX_EVENTS);
      }
    } catch {
      // Offline or timed out: say it next time.
      queue = events.concat(queue).slice(0, MAX_EVENTS);
    } finally {
      clearTimeout(timeout);
      sending = false;
    }
  }

  /** @returns {number} how far down the page the reader has been, 0..100 */
  function scrolledPercent() {
    const el = document.documentElement;
    const height = el.scrollHeight;
    const view = el.clientHeight || window.innerHeight || 0;
    if (!height || height <= view) return 100;
    const top = el.scrollTop || window.pageYOffset || 0;
    return Math.max(
      0,
      Math.min(100, Math.round(((top + view) / height) * 100)),
    );
  }

  let scrollQueued = false;
  function onScroll() {
    if (scrollQueued || stopped) return;
    scrollQueued = true;
    const measure = () => {
      scrollQueued = false;
      const percent = scrolledPercent();
      let reached = 0;
      for (const threshold of THRESHOLDS) {
        if (percent >= threshold) reached = threshold;
      }
      if (reached > reachedPercent) {
        reachedPercent = reached;
        push('SCROLL', { scrollPercent: reached });
      }
    };
    if (typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(measure);
    } else {
      setTimeout(measure, 0);
    }
  }

  function onVisibility() {
    if (document.visibilityState === 'visible') {
      if (visibleSince === null) visibleSince = Date.now();
      return;
    }
    settleDwell();
    visibleSince = null;
    void flush(true);
  }

  function onLeave() {
    settleDwell();
    visibleSince = null;
    void flush(true);
  }

  const itemId = itemFromAddress();
  push('VIEW');
  if (itemId) push('OPEN', { itemId });
  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pagehide', onLeave);
  timer = setInterval(() => void flush(false), FLUSH_MS);
})();
