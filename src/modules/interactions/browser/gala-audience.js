/**
 * The audience browser script, emitted by the renderer as
 * `assets/gala-audience-v1.js` on pages that carry an audience element: the
 * author Follow control (bylines, author cards, author pages), the Galascribe
 * newsletter signup and the contact form. A same-origin external file (CSP
 * `script-src 'self'`), loaded with `defer`. Plain ES2020, no dependencies,
 * one IIFE.
 *
 * Configuration comes from its own `<script>` tag (`data-api-origin`,
 * `data-app-origin`, `data-publication-id`, `data-canonical-url`) and one
 * `<script type="application/json" data-gala-audience-messages>` block that
 * holds every run-time sentence in the page's language. It enhances the
 * server-rendered `[data-gala-audience]` elements and nothing else; the page
 * reads completely without it. Each enhanced element is revealed only here:
 * a Follow control and the contact form ship `hidden`, and the newsletter
 * panel swaps its no-JavaScript Subscribe link for the signup form.
 *
 * Follow: `GET|PUT|DELETE {api}/v2/public/publications/{publicationId}/
 * authors/{authorId}/follow` with the reader's publication-scoped bearer
 * token. A reader without a token who clicks Follow is sent to the App's
 * reader connect (OAuth 2.0 code with PKCE, exactly as the interactions
 * script does it; the token lives in the same
 * `localStorage["gala.reader.session.<publicationId>"]`) and the follow is
 * applied when the page loads again. The pending record carries the intent
 * `{kind: "follow", authorId}`; the interactions script leaves a sign-in
 * return with that intent to this script, and this script leaves every other
 * intent to it. The state is read with GET only when a token exists.
 *
 * Newsletter: `POST .../newsletter-subscriptions` `{email, trap}`. Every
 * accepted answer (including a honeypot hit) reads "Check your inbox to
 * confirm"; a full or unavailable newsletter, a rate limit and a bad address
 * have their own sentences.
 *
 * Contact: `POST .../contact-messages` `{name, email, message, trap,
 * elapsedMs, website?, phone?}`; `elapsedMs` is the time since the page
 * loaded. Field problems show beside the field; the form-level answers are
 * sent, unavailable and rate limited.
 *
 * Security: API data never reaches the DOM except through `textContent`; no
 * `innerHTML`, popup, `postMessage`, cookie or third-party request. Every
 * request is `mode: 'cors'`, `credentials: 'omit'`, bounded by a 15 s timeout.
 *
 * Navigation seam: sign-in dispatches a cancelable, bubbling `gala:navigate`
 * event on the control (detail `{url}`) before assigning `location`;
 * preventing it keeps the page in place (used by the tests).
 */

(function () {
  'use strict';

  const REQUEST_TIMEOUT_MS = 15000;
  const PENDING_MAX_AGE_MS = 15 * 60 * 1000;
  const ELAPSED_MAX_MS = 86400000;
  const GENERIC = 'Something went wrong. Try again.';

  const tag = /** @type {HTMLElement | null} */ (
    document.querySelector('script[data-gala-audience-script]')
  );
  if (!tag) return;
  const apiOrigin = String(tag.dataset.apiOrigin || '').replace(/\/+$/, '');
  const appOrigin = String(tag.dataset.appOrigin || '').replace(/\/+$/, '');
  const publicationId = tag.dataset.publicationId || '';
  const canonicalUrl = tag.dataset.canonicalUrl || '';
  if (!apiOrigin || !publicationId) return;

  /** @type {Record<string, string>} */
  let messages = {};
  try {
    const block = document.querySelector(
      'script[type="application/json"][data-gala-audience-messages]',
    );
    const parsed = block ? JSON.parse(block.textContent || '{}') : {};
    if (parsed && typeof parsed === 'object') messages = parsed;
  } catch {
    messages = {};
  }
  /**
   * @param {string} key
   * @returns {string} the page-language sentence, else a plain English one
   */
  const say = (key) =>
    typeof messages[key] === 'string' && messages[key]
      ? messages[key]
      : GENERIC;

  const PENDING_KEY = 'gala.reader.pending.' + publicationId;
  const SESSION_KEY = 'gala.reader.session.' + publicationId;
  const PUBLICATION_PATH =
    '/v2/public/publications/' + encodeURIComponent(publicationId);

  // ------------------------------------------------------------------ storage
  /**
   * @param {'localStorage' | 'sessionStorage'} kind
   * @param {string} key
   * @returns {any} the parsed JSON object, or null
   */
  function readJson(kind, key) {
    try {
      const raw = window[kind].getItem(key);
      const value = raw ? JSON.parse(raw) : null;
      return value && typeof value === 'object' ? value : null;
    } catch {
      return null;
    }
  }
  /**
   * @param {'localStorage' | 'sessionStorage'} kind
   * @param {string} key
   * @param {string | null} value a string to store, null to remove
   * @returns {boolean} whether the storage took it
   */
  function writeStorage(kind, key, value) {
    try {
      if (value === null) window[kind].removeItem(key);
      else window[kind].setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  /** @type {{accessToken: string, expiresAt: string} | null} */
  let session = null;
  /** @returns {typeof session} the stored reader session when still valid */
  function loadSession() {
    const stored = readJson('localStorage', SESSION_KEY);
    if (!stored || typeof stored.accessToken !== 'string') return null;
    const expires = Date.parse(stored.expiresAt);
    if (
      !stored.accessToken ||
      !Number.isFinite(expires) ||
      expires <= Date.now()
    ) {
      writeStorage('localStorage', SESSION_KEY, null);
      return null;
    }
    return { accessToken: stored.accessToken, expiresAt: stored.expiresAt };
  }
  function dropSession() {
    session = null;
    writeStorage('localStorage', SESSION_KEY, null);
    // The follower count is only for a signed-in team member.
    for (const count of Array.from(
      document.querySelectorAll('[data-follow-count]'),
    )) {
      /** @type {HTMLElement} */ (count).hidden = true;
      const text = count.querySelector('[data-follow-count-text]');
      if (text) text.textContent = '';
    }
  }

  // ------------------------------------------------------------------ network
  class ApiError extends Error {
    /**
     * @param {string} kind `network` or `problem`
     * @param {number} status
     * @param {string} code
     * @param {{pointer: string, code: string}[]} errors
     */
    constructor(kind, status, code, errors) {
      super(kind);
      this.kind = kind;
      this.status = status;
      this.code = code;
      this.errors = errors;
    }
  }

  /**
   * @param {string} method
   * @param {string} path
   * @param {{auth?: boolean, body?: unknown}} [options]
   * @returns {Promise<any>} the parsed body (null when there is none)
   */
  async function api(method, path, options) {
    const opts = options || {};
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    /** @type {Record<string, string>} */
    const headers = { Accept: 'application/json' };
    if (opts.auth && session)
      headers.Authorization = 'Bearer ' + session.accessToken;
    if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
    let response;
    try {
      response = await fetch(apiOrigin + path, {
        method,
        headers,
        body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
        mode: 'cors',
        credentials: 'omit',
        signal: controller.signal,
      });
    } catch {
      throw new ApiError('network', 0, '', []);
    } finally {
      clearTimeout(timer);
    }
    /** @type {any} */
    let payload;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
    if (response.ok) return payload;
    throw new ApiError(
      'problem',
      response.status,
      payload && typeof payload.code === 'string' ? payload.code : '',
      payload && Array.isArray(payload.errors) ? payload.errors : [],
    );
  }

  /**
   * The sentence for a failed call that has no sentence of its own.
   *
   * @param {unknown} error
   * @returns {string}
   */
  function commonFailure(error) {
    if (!(error instanceof ApiError)) return say('generic');
    if (error.kind === 'network') return say('network');
    if (error.status === 429 || error.code === 'RATE_LIMITED') {
      return say('rateLimited');
    }
    return say('generic');
  }

  // --------------------------------------------------------------- announcing
  /**
   * Set a live region's sentence. Cleared first so repeating the same text is
   * announced again.
   *
   * @param {Element | null} region
   * @param {string} sentence
   */
  function announce(region, sentence) {
    if (!region) return;
    region.textContent = '';
    setTimeout(() => {
      region.textContent = sentence;
    }, 30);
  }

  // ------------------------------------------------------- sign-in (PKCE)
  let redirecting = false;
  window.addEventListener('pageshow', (event) => {
    // A page restored from the back/forward cache after the App redirect.
    if (event.persisted) redirecting = false;
  });

  /**
   * @param {Uint8Array} bytes
   * @returns {string} unpadded base64url
   */
  function base64url(bytes) {
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
  /**
   * @param {number} length
   * @returns {string} a random base64url token of that many random bytes
   */
  function randomToken(length) {
    return base64url(crypto.getRandomValues(new Uint8Array(length)));
  }

  /**
   * Send the reader to the App's reader connect with a PKCE challenge, keeping
   * the intent to replay when the page loads again.
   *
   * @param {{kind: 'follow', authorId: string}} intent
   * @param {HTMLElement} control the control that asked (receives the
   *   navigation event and the announcement)
   */
  async function startSignIn(intent, control) {
    const status = control.querySelector('[role="status"]');
    if (redirecting) return;
    // Held from here, so a second click while the challenge is computed does
    // nothing; released on every way out except the navigation itself.
    redirecting = true;
    /** @param {string} key */
    const fail = (key) => {
      redirecting = false;
      announce(status, say(key));
    };
    if (!appOrigin || !canonicalUrl) {
      fail('generic');
      return;
    }
    if (!window.crypto || !crypto.subtle || !crypto.getRandomValues) {
      fail('signInUnsupported');
      return;
    }
    const state = randomToken(32);
    const verifier = randomToken(64);
    let challenge;
    try {
      const digest = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(verifier),
      );
      challenge = base64url(new Uint8Array(digest));
    } catch {
      fail('signInUnsupported');
      return;
    }
    const stored = writeStorage(
      'sessionStorage',
      PENDING_KEY,
      JSON.stringify({
        state,
        codeVerifier: verifier,
        intent,
        createdAt: Date.now(),
      }),
    );
    if (!stored) {
      fail('storageBlocked');
      return;
    }
    const url =
      appOrigin +
      '/reader/connect?publication=' +
      encodeURIComponent(publicationId) +
      '&return=' +
      encodeURIComponent(canonicalUrl) +
      '&state=' +
      encodeURIComponent(state) +
      '&challenge=' +
      encodeURIComponent(challenge);
    const event = new CustomEvent('gala:navigate', {
      detail: { url },
      cancelable: true,
      bubbles: true,
    });
    if (control.dispatchEvent(event)) window.location.assign(url);
  }

  /**
   * Handle a return from the App when the pending intent is a follow: scrub
   * the fragment, verify the state, exchange the code for the token.
   *
   * @returns {Promise<{kind: string, authorId: string} | null>} the follow to
   *   apply, or null
   */
  async function completeSignIn() {
    const hash = window.location.hash || '';
    if (hash.indexOf('gala-reader-') === -1) return null;
    const pending = readJson('sessionStorage', PENDING_KEY);
    // Every other intent belongs to the interactions script.
    if (!pending || !pending.intent || pending.intent.kind !== 'follow') {
      return null;
    }
    const params = new URLSearchParams(hash.replace(/^#/, ''));
    const code = params.get('gala-reader-code');
    const returned = params.get('gala-reader-state');
    try {
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search,
      );
    } catch {
      // The fragment stays visible; the single-use code is still protected.
    }
    writeStorage('sessionStorage', PENDING_KEY, null);
    if (
      !code ||
      !returned ||
      pending.state !== returned ||
      typeof pending.codeVerifier !== 'string' ||
      !(Date.now() - Number(pending.createdAt) < PENDING_MAX_AGE_MS)
    ) {
      return {
        kind: 'invalid',
        authorId: String(pending.intent.authorId || ''),
      };
    }
    try {
      const result = await api('POST', '/v2/reader/tokens', {
        body: { code, codeVerifier: pending.codeVerifier, publicationId },
      });
      if (!result || typeof result.accessToken !== 'string' || !result.reader) {
        throw new ApiError('problem', 200, '', []);
      }
      writeStorage(
        'localStorage',
        SESSION_KEY,
        JSON.stringify({
          accessToken: result.accessToken,
          expiresAt: result.expiresAt,
          reader: result.reader,
        }),
      );
      session = loadSession();
      // Tell the interactions script, when this page has one, that a reader is
      // now signed in.
      document.dispatchEvent(new CustomEvent('gala:reader-session'));
    } catch (error) {
      return {
        kind:
          error instanceof ApiError && error.kind === 'network'
            ? 'network'
            : 'failed',
        authorId: String(pending.intent.authorId || ''),
      };
    }
    return pending.intent;
  }

  // -------------------------------------------------------------------- follow
  /** @returns {HTMLElement[]} every Follow control on the page */
  const followControls = () =>
    /** @type {HTMLElement[]} */ (
      Array.from(document.querySelectorAll('[data-gala-audience="follow"]'))
    );
  /**
   * @param {string} authorId
   * @returns {HTMLElement[]} the controls for one author
   */
  const controlsFor = (authorId) =>
    followControls().filter((control) => control.dataset.authorId === authorId);

  /**
   * `pending` keeps whichever half (Follow, or Following with Unfollow) the
   * control was showing and only marks it busy; the other two states choose
   * the half to show.
   *
   * @param {HTMLElement} control
   * @param {'idle' | 'following' | 'pending'} state
   */
  function setFollowState(control, state) {
    control.dataset.state = state;
    const busy = state === 'pending';
    if (busy) control.setAttribute('aria-busy', 'true');
    else control.removeAttribute('aria-busy');
    const on = /** @type {HTMLElement | null} */ (
      control.querySelector('[data-follow-on]')
    );
    const follow = /** @type {HTMLElement | null} */ (
      control.querySelector('[data-follow-action="follow"]')
    );
    if (!busy) {
      if (on) on.hidden = state !== 'following';
      if (follow) follow.hidden = state === 'following';
    }
    for (const button of Array.from(control.querySelectorAll('button'))) {
      if (busy) button.setAttribute('aria-disabled', 'true');
      else button.removeAttribute('aria-disabled');
    }
  }
  /**
   * @param {string} authorId
   * @param {boolean} following
   */
  function showFollowing(authorId, following) {
    for (const control of controlsFor(authorId)) {
      control.removeAttribute('data-error');
      setFollowState(control, following ? 'following' : 'idle');
    }
  }

  /**
   * Show or hide the follower count (visible only to the site's team: the
   * API sends `followers` to nobody else) on every control for one author.
   * Anything but a non-negative integer number hides it.
   *
   * @param {string} authorId
   * @param {unknown} followers the answer's `followers`
   */
  function showFollowers(authorId, followers) {
    const valid =
      typeof followers === 'number' &&
      Number.isInteger(followers) &&
      followers >= 0 &&
      Boolean(messages.followersOne && messages.followersOther);
    let label = '';
    if (valid) {
      const n = /** @type {number} */ (followers);
      let formatted = String(n);
      try {
        formatted = n.toLocaleString(document.documentElement.lang || 'en');
      } catch {
        // An unknown language tag keeps the plain digits.
      }
      label = (
        n === 1 ? messages.followersOne : messages.followersOther
      ).replace('{count}', formatted);
    }
    for (const control of controlsFor(authorId)) {
      const count = /** @type {HTMLElement | null} */ (
        control.querySelector('[data-follow-count]')
      );
      const text = control.querySelector('[data-follow-count-text]');
      if (!count || !text) continue;
      text.textContent = label;
      count.hidden = !valid;
    }
  }

  /**
   * @param {unknown} error
   * @param {boolean} adding whether the call was a follow
   * @returns {string} the sentence for the failure
   */
  function followFailure(error, adding) {
    if (error instanceof ApiError) {
      if (error.status === 401 || error.code === 'READER_TOKEN_SCOPE') {
        dropSession();
        return say(adding ? 'signInFailed' : 'generic');
      }
      if (error.code === 'FOLLOWS_DISABLED') return say('followDisabled');
      if (
        error.code === 'AUTHOR_NOT_FOUND' ||
        error.code === 'PUBLICATION_NOT_LIVE'
      ) {
        return say('authorGone');
      }
    }
    return commonFailure(error);
  }

  /**
   * Follow or unfollow, and show the outcome on every control for the author.
   *
   * @param {HTMLElement} control the control the reader used
   * @param {boolean} adding
   * @returns {Promise<void>}
   */
  async function applyFollow(control, adding) {
    const authorId = control.dataset.authorId || '';
    const name = control.dataset.authorName || '';
    const status = control.querySelector('[role="status"]');
    control.removeAttribute('data-error');
    if (status) status.textContent = '';
    setFollowState(control, 'pending');
    try {
      const result = await api(
        adding ? 'PUT' : 'DELETE',
        PUBLICATION_PATH +
          '/authors/' +
          encodeURIComponent(authorId) +
          '/follow',
        { auth: true },
      );
      const following =
        result && typeof result.following === 'boolean'
          ? result.following
          : adding;
      showFollowing(authorId, following);
      showFollowers(authorId, result && result.followers);
      announce(
        status,
        say(following ? 'followed' : 'unfollowed').replace('{name}', name),
      );
    } catch (error) {
      const sentence = followFailure(error, adding);
      setFollowState(control, adding ? 'idle' : 'following');
      control.setAttribute('data-error', '');
      announce(status, sentence);
    }
  }

  /**
   * @param {HTMLElement} control
   * @param {string} action `follow` or `unfollow`
   */
  async function onFollowAction(control, action) {
    if (control.dataset.state === 'pending') return;
    if (action === 'unfollow') {
      await applyFollow(control, false);
      return;
    }
    if (!session) {
      await startSignIn(
        { kind: 'follow', authorId: control.dataset.authorId || '' },
        control,
      );
      return;
    }
    await applyFollow(control, true);
  }

  /**
   * Read each distinct author's state once, when a token exists.
   *
   * @returns {Promise<void>}
   */
  async function readFollowStates() {
    if (!session) return;
    const ids = [
      ...new Set(followControls().map((c) => c.dataset.authorId || '')),
    ];
    await Promise.all(
      ids.map(async (authorId) => {
        try {
          const result = await api(
            'GET',
            PUBLICATION_PATH +
              '/authors/' +
              encodeURIComponent(authorId) +
              '/follow',
            { auth: true },
          );
          showFollowing(authorId, Boolean(result && result.following));
          showFollowers(authorId, result && result.followers);
        } catch (error) {
          if (error instanceof ApiError && error.status === 401) dropSession();
          if (
            error instanceof ApiError &&
            (error.code === 'AUTHOR_NOT_FOUND' ||
              error.code === 'PUBLICATION_NOT_LIVE')
          ) {
            for (const control of controlsFor(authorId)) control.hidden = true;
          }
        }
      }),
    );
  }

  async function initFollow() {
    const controls = followControls();
    if (controls.length === 0) return;
    session = loadSession();
    for (const control of controls) {
      for (const button of Array.from(
        control.querySelectorAll('[data-follow-action]'),
      )) {
        button.addEventListener('click', () => {
          if (button.getAttribute('aria-disabled') === 'true') return;
          onFollowAction(
            control,
            button.getAttribute('data-follow-action') || '',
          );
        });
      }
      control.hidden = false;
    }
    const returned = await completeSignIn();
    if (!session) session = loadSession();
    await readFollowStates();
    if (!returned) return;
    const target = controlsFor(returned.authorId)[0];
    if (!target) return;
    const status = target.querySelector('[role="status"]');
    if (returned.kind === 'follow') {
      if (session) await applyFollow(target, true);
      else announce(status, say('signInFailed'));
    } else if (returned.kind === 'network') {
      announce(status, say('network'));
    } else if (returned.kind === 'invalid') {
      announce(status, say('signInInvalid'));
    } else {
      announce(status, say('signInFailed'));
    }
    const focusTarget = target.querySelector('button:not([hidden])');
    if (focusTarget instanceof HTMLElement && !target.hidden)
      focusTarget.focus();
  }

  // --------------------------------------------------------------------- forms
  /**
   * Run a submit handler once at a time, with the button marked busy.
   *
   * @param {HTMLFormElement} form
   * @param {() => Promise<void>} work
   */
  async function guarded(form, work) {
    if (form.dataset.busy === 'true') return;
    const submit = form.querySelector('button[type="submit"]');
    form.dataset.busy = 'true';
    if (submit) {
      submit.setAttribute('aria-busy', 'true');
      submit.setAttribute('aria-disabled', 'true');
    }
    try {
      await work();
    } finally {
      form.dataset.busy = 'false';
      if (submit) {
        submit.removeAttribute('aria-busy');
        submit.removeAttribute('aria-disabled');
      }
    }
  }

  /**
   * @param {HTMLInputElement | HTMLTextAreaElement} input
   * @param {string | null} problem the sentence, or null to clear
   * @param {Element | null} slot the field's error element, if it has one
   */
  function markField(input, problem, slot) {
    if (problem === null) input.removeAttribute('aria-invalid');
    else input.setAttribute('aria-invalid', 'true');
    if (slot) {
      slot.textContent = problem === null ? '' : problem;
      /** @type {HTMLElement} */ (slot).hidden = problem === null;
    }
  }

  /**
   * @param {HTMLInputElement | HTMLTextAreaElement} input
   * @returns {string | null} the sentence for a field that fails the browser's
   *   own constraints, or null when it is fine
   */
  function constraintProblem(input) {
    if (
      input.validity.valueMissing ||
      (input.required && !input.value.trim())
    ) {
      return say('required');
    }
    if (input.validity.typeMismatch) {
      return input.type === 'email' ? say('emailInvalid') : say('invalid');
    }
    if (input.validity.tooLong) return say('invalid');
    return null;
  }

  // ---------------------------------------------------------------- newsletter
  /** @param {HTMLElement} section */
  function initNewsletter(section) {
    const form = /** @type {HTMLFormElement | null} */ (
      section.querySelector('[data-gala-newsletter-form]')
    );
    const link = /** @type {HTMLElement | null} */ (
      section.querySelector('[data-gala-newsletter-link]')
    );
    if (!form) return;
    const email = /** @type {HTMLInputElement} */ (
      form.elements.namedItem('email')
    );
    const trap = /** @type {HTMLInputElement | null} */ (
      form.elements.namedItem('trap')
    );
    const status = form.querySelector('[data-form-status]');
    if (link) link.hidden = true;
    form.hidden = false;
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      guarded(form, async () => {
        const problem = constraintProblem(email);
        markField(email, problem, null);
        if (problem !== null) {
          announce(status, problem);
          email.focus();
          return;
        }
        if (status) status.textContent = '';
        try {
          await api('POST', PUBLICATION_PATH + '/newsletter-subscriptions', {
            body: { email: email.value.trim(), trap: trap ? trap.value : '' },
          });
          form.dataset.state = 'sent';
          email.value = '';
          announce(status, say('checkInbox'));
        } catch (error) {
          form.dataset.state = 'error';
          let sentence = commonFailure(error);
          if (error instanceof ApiError) {
            if (
              error.code === 'NEWSLETTER_FULL' ||
              error.code === 'NEWSLETTER_UNAVAILABLE'
            ) {
              sentence = say('newsletterFull');
            } else if (error.status === 400) {
              markField(email, say('emailInvalid'), null);
              sentence = say('emailInvalid');
              email.focus();
            }
          }
          announce(status, sentence);
        }
      });
    });
  }

  // ------------------------------------------------------------------- contact
  const CONTACT_FIELDS = ['name', 'email', 'website', 'phone', 'message'];

  /** @param {HTMLFormElement} form */
  function initContact(form) {
    const status = form.querySelector('[data-form-status]');
    const trap = /** @type {HTMLInputElement | null} */ (
      form.elements.namedItem('trap')
    );
    const started = Date.now();
    const elapsed = () => {
      const ms =
        window.performance && typeof performance.now === 'function'
          ? performance.now()
          : Date.now() - started;
      return Math.min(ELAPSED_MAX_MS, Math.max(0, Math.round(ms)));
    };
    /**
     * @param {string} name
     * @returns {HTMLInputElement | HTMLTextAreaElement | null}
     */
    const field = (name) =>
      /** @type {HTMLInputElement | HTMLTextAreaElement | null} */ (
        form.elements.namedItem(name)
      );
    /**
     * @param {string} name
     * @param {string | null} problem
     */
    const mark = (name, problem) => {
      const input = field(name);
      if (input) {
        markField(
          input,
          problem,
          form.querySelector('[data-field-error="' + name + '"]'),
        );
      }
    };
    form.hidden = false;
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      guarded(form, async () => {
        if (status) status.textContent = '';
        let firstBad = null;
        for (const name of CONTACT_FIELDS) {
          const input = field(name);
          if (!input) continue;
          const problem = constraintProblem(input);
          mark(name, problem);
          if (problem !== null && !firstBad) firstBad = input;
        }
        if (firstBad) {
          firstBad.focus();
          return;
        }
        /** @type {Record<string, string | number>} */
        const body = {
          name: /** @type {HTMLInputElement} */ (field('name')).value.trim(),
          email: /** @type {HTMLInputElement} */ (field('email')).value.trim(),
          message: /** @type {HTMLTextAreaElement} */ (
            field('message')
          ).value.trim(),
          trap: trap ? trap.value : '',
          elapsedMs: elapsed(),
        };
        for (const name of ['website', 'phone']) {
          const input = field(name);
          if (input && input.value.trim()) body[name] = input.value.trim();
        }
        try {
          await api('POST', PUBLICATION_PATH + '/contact-messages', { body });
          form.dataset.state = 'sent';
          form.reset();
          announce(status, say('contactSent'));
        } catch (error) {
          form.dataset.state = 'error';
          let sentence = commonFailure(error);
          if (error instanceof ApiError) {
            if (
              error.code === 'CONTACT_FORM_UNAVAILABLE' ||
              error.code === 'PUBLICATION_NOT_LIVE'
            ) {
              sentence = say('contactUnavailable');
            } else if (error.code === 'RATE_LIMITED' || error.status === 429) {
              sentence = say('contactRateLimited');
            } else if (error.status === 400) {
              sentence = say('invalid');
              let focused = false;
              for (const entry of error.errors) {
                const name = String(entry.pointer || '').replace(/^\//, '');
                if (!CONTACT_FIELDS.includes(name) || !field(name)) continue;
                mark(
                  name,
                  name === 'message'
                    ? say('messageLinks')
                    : name === 'email'
                      ? say('emailInvalid')
                      : say('invalid'),
                );
                if (!focused) {
                  /** @type {HTMLElement} */ (field(name)).focus();
                  focused = true;
                }
              }
            }
          }
          announce(status, sentence);
        }
      });
    });
  }

  // ---------------------------------------------------------------------- init
  for (const section of Array.from(
    document.querySelectorAll('[data-gala-audience="newsletter"]'),
  )) {
    initNewsletter(/** @type {HTMLElement} */ (section));
  }
  for (const form of Array.from(
    document.querySelectorAll('[data-gala-audience="contact"]'),
  )) {
    initContact(/** @type {HTMLFormElement} */ (form));
  }
  initFollow().catch(() => {
    // The page reads the same without the Follow control.
  });
})();
