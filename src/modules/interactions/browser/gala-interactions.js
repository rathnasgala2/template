/**
 * The reader-interactions browser script, emitted by the renderer as
 * `assets/gala-interactions-v1.js` on article routes of publications whose
 * repository enables the interactions module. A same-origin external file
 * (CSP `script-src 'self'`), loaded with `defer`. Plain ES2020, no
 * dependencies, no build step, one IIFE.
 *
 * It enhances the server-rendered `[data-gala-interactions]` section (reaction
 * buttons, comment region, status live region) and nothing else; the article
 * is fully readable with it absent or failing. Configuration comes only from
 * that element's `data-*` attributes.
 *
 * Reader sign-in is a top-level redirect to the App plus OAuth 2.0
 * authorization code with PKCE (RFC 7636):
 *
 * 1. `state` and `codeVerifier` are random, the challenge is the SHA-256 of
 *    the verifier, and `{state, codeVerifier, intent, createdAt}` is kept in
 *    `sessionStorage["gala.reader.pending.<publicationId>"]`.
 * 2. The page navigates (top level) to `<appOrigin>/reader/connect?...`.
 * 3. On return the URL fragment carries `gala-reader-code` and
 *    `gala-reader-state`. The fragment is replaced with `#comments` at once,
 *    the state is compared, the code is exchanged for a publication-scoped
 *    bearer token, which is kept in
 *    `localStorage["gala.reader.session.<publicationId>"]`, and the pending
 *    intent is replayed (a reaction is applied; a comment draft is restored
 *    into the composer and never auto-posted).
 *
 * Every request is `mode: 'cors'`, `credentials: 'omit'`, bounded by a 15 s
 * `AbortController` timeout, and carries the bearer token explicitly. Comment
 * POSTs carry an `Idempotency-Key` that is reused while the same draft is
 * retried.
 *
 * Appeals: a signed-in reader's thread read also carries that reader's own
 * removed or held comments, each with an `own` object (`state` REMOVED or HELD,
 * the `appeal` so far or null, and `canAppeal`) and no body. Such a comment is
 * shown as "Removed by the site's moderators" (held: "Hidden while the
 * moderators review it"), headed by a one-line context, "Your comment from
 * <relative date>" (from `createdAt`), that tells the reader which comment it
 * is; when `canAppeal` is true it offers an Appeal button that opens a note
 * field (up to 1,000 characters) and posts `{note}` to
 * `/v2/public/comments/{commentId}/appeals` with the bearer token. The
 * appeal's state (pending, restored, kept removed) is written under the
 * comment, and only there: sending an appeal updates the comment's state and
 * redraws it, it never adds a sentence of its own, so "Appeal sent. ..." shows
 * once, from the state, whether the reader has just sent it or the thread was
 * read again. There is one appeal per removal; the moderators decide, never the
 * script.
 *
 * Not used, by design: iframes, popups (`window.open`), `postMessage`,
 * FedCM, cookies, third-party scripts or requests.
 *
 * Security: every piece of text from the API reaches the DOM through
 * `textContent`, `createTextNode` or `setAttribute`; API data is never parsed
 * as HTML and no `innerHTML` is used at all. URLs in comments are linked by
 * splitting text nodes, only for http(s), with
 * `rel="nofollow ugc noopener noreferrer"`.
 *
 * Storage: every `localStorage` / `sessionStorage` access is wrapped; with
 * storage unavailable reading still works and sign-in explains why it
 * cannot proceed.
 *
 * Navigation seam: sign-in dispatches a cancelable `gala:navigate` event on
 * the section (detail `{url}`) before assigning `location`; preventing it
 * keeps the page in place (used by the tests, which cannot navigate a DOM
 * emulation).
 */

(function () {
  'use strict';

  const root = /** @type {HTMLElement} */ (
    document.querySelector('[data-gala-interactions]')
  );
  if (!root) return;

  // ---------------------------------------------------------------- constants
  const REQUEST_TIMEOUT_MS = 15000;
  const COMMENT_LIMIT = 10000;
  const COUNTER_THRESHOLD = 500;
  const NOTE_LIMIT = 1000;
  const PENDING_MAX_AGE_MS = 15 * 60 * 1000;
  const RELATIVE_DAYS_LIMIT = 7;
  const LINK_REL = 'nofollow ugc noopener noreferrer';
  const URL_PATTERN = /https?:\/\/[^\s<>"']+/g;
  const TRAILING_PUNCTUATION = /[.,;:!?'")\]}]+$/;

  const MESSAGES = {
    signInAgain: 'Sign in again to continue.',
    tooFast: "You're posting too quickly. Try again in a minute.",
    commentsClosed: 'Comments are closed.',
    empty: 'Write something first.',
    tooLong: "That's longer than 10,000 characters.",
    tooManyLinks: 'Too many links in one comment.',
    blocked:
      "That comment contains something we can't post (for example a password or key).",
    network: "Couldn't reach Galascribe. Your draft is kept.",
    unavailable: 'Responses are unavailable right now.',
    storageBlocked:
      'Your browser blocked storage this site needs to sign you in.',
    signInUnsupported: "This browser can't sign you in on this page.",
    signInFailed: "Sign-in didn't complete. Try again.",
    signInInvalid: "That sign-in link wasn't valid. Try again.",
    generic: 'Something went wrong. Try again.',
    repliesOff: 'Replies are turned off.',
    tooDeep: "Replies can't go any deeper.",
    parentGone: 'The comment you replied to is no longer available.',
    duplicate: 'You already posted that.',
    restricted: "Your account can't comment here right now.",
    editClosed: 'The edit window has closed.',
    notAuthor: 'Only the author can change this comment.',
    gone: 'That comment is no longer available.',
    posted: 'Comment posted.',
    updated: 'Comment updated.',
    deleted: 'Comment deleted.',
    reported: 'Thanks. Your report was received.',
    signedOut: 'Signed out.',
    signInLabel: 'Sign in with GitHub to join the conversation',
    signInShort: 'Sign in with GitHub',
    post: 'Post',
    save: 'Save',
    cancel: 'Cancel',
    reply: 'Reply',
    edit: 'Edit',
    remove: 'Delete',
    report: 'Report',
    confirmDelete: 'Delete this comment?',
    composerLabel: 'Write a comment',
    replyLabel: 'Write a reply',
    editLabel: 'Edit your comment',
    signedInAs: 'Signed in as ',
    signOut: 'Sign out',
    showMoreReplies: 'Show more replies',
    deletedTombstone: 'This comment was deleted.',
    removedTombstone: 'This comment was removed.',
    ownFrom: 'Your comment from ',
    removedOwn: "Removed by the site's moderators",
    heldOwn: 'Hidden while the moderators review it',
    appeal: 'Appeal',
    appealAria: 'Appeal this decision',
    appealLabel:
      'Tell the moderators why this should be restored (up to 1,000 characters)',
    appealSend: 'Send',
    appealSent: 'Appeal sent. The moderators will look again.',
    appealRestored: 'Restored after review',
    appealDenied: 'Kept removed after review',
    appealEmpty: 'Write why you are appealing first.',
    appealTooLong: "That's longer than 1,000 characters.",
    appealExists: 'You already appealed this decision.',
    appealNotAllowed: "This comment can't be appealed.",
    appealTooMany: "You've sent several appeals today. Try again tomorrow.",
    reportTitle: 'Report this comment',
    reportReason: 'Reason',
    reportNote: 'Details (optional)',
    reportSubmit: 'Send report',
    justNow: 'just now',
    edited: ' (edited)',
  };

  const REPORT_REASONS = [
    ['SPAM', 'Spam'],
    ['HARASSMENT', 'Harassment'],
    ['HATE', 'Hate speech'],
    ['SEXUAL_CONTENT', 'Sexual content'],
    ['VIOLENCE', 'Violence'],
    ['PRIVACY', 'Private information'],
    ['SELF_HARM', 'Self-harm'],
    ['OTHER', 'Something else'],
  ];

  // -------------------------------------------------------------- configuration
  const data = root.dataset;
  const config = {
    apiOrigin: String(data.apiOrigin || '').replace(/\/+$/, ''),
    appOrigin: String(data.appOrigin || '').replace(/\/+$/, ''),
    publicationId: data.publicationId || '',
    contentId: data.contentId || '',
    canonicalUrl: data.canonicalUrl || '',
    reactionsEnabled: data.reactionsEnabled === 'true',
    commentsEnabled: data.commentsEnabled === 'true',
    countReactions: data.countReactions !== 'false',
    countComments: data.countComments !== 'false',
    allowReplies: data.allowReplies === 'true',
    maxDepth: clampDepth(Number.parseInt(data.maxDepth || '3', 10)),
  };
  if (!config.apiOrigin || !config.publicationId || !config.contentId) return;

  const PENDING_KEY = 'gala.reader.pending.' + config.publicationId;
  const SESSION_KEY = 'gala.reader.session.' + config.publicationId;
  const PUBLICATION_PATH =
    '/v2/public/publications/' + encodeURIComponent(config.publicationId);
  const CONTENT_PATH =
    PUBLICATION_PATH + '/contents/' + encodeURIComponent(config.contentId);

  // ------------------------------------------------------------------ elements
  const statusEl = /** @type {HTMLElement | null} */ (
    root.querySelector('[data-gala-status]')
  );
  const reactionsEl = /** @type {HTMLElement | null} */ (
    root.querySelector('[data-gala-reactions]')
  );
  const commentsEl = /** @type {HTMLElement | null} */ (
    root.querySelector('[data-gala-comments]')
  );
  const noticeEl = /** @type {HTMLElement | null} */ (
    root.querySelector('[data-gala-static-notice]')
  );
  const slotEl = /** @type {HTMLElement | null} */ (
    root.querySelector('[data-gala-composer-slot]')
  );
  const listEl = /** @type {HTMLElement | null} */ (
    root.querySelector('[data-gala-comment-list]')
  );
  const moreEl = /** @type {HTMLButtonElement | null} */ (
    root.querySelector('[data-gala-more]')
  );
  const countEl = /** @type {HTMLElement | null} */ (
    root.querySelector('[data-gala-comment-count]')
  );
  const titleEl = /** @type {HTMLElement | null} */ (
    root.querySelector('.g-comments__title')
  );

  // --------------------------------------------------------------------- state

  /**
   * @typedef {'localStorage' | 'sessionStorage'} StorageKind
   * @typedef {{displayName: string, initials: string}} ReaderView
   * @typedef {{accessToken: string, expiresAt: string, reader: ReaderView}} Session
   * @typedef {{lowerBound: number, display: string, label: string}} PublicCount
   * @typedef {{isAuthor: boolean, canEdit: boolean, canDelete: boolean, canReply: boolean}} CommentViewer
   * @typedef {{state: 'PENDING' | 'RESTORED' | 'DENIED', decidedAt?: string}} CommentAppeal
   * @typedef {{state: 'REMOVED' | 'HELD', appeal: CommentAppeal | null, canAppeal: boolean}} CommentOwn
   * @typedef {{id: string, parentId: string | null, depth: number, state: 'VISIBLE' | 'REMOVED' | 'DELETED' | 'HELD', author: ReaderView | null, body: string | null, createdAt: string, editedAt: string | null, replies: CommentView[], moreReplies: boolean, viewer: CommentViewer, own?: CommentOwn}} CommentView
   * @typedef {{items: CommentView[], nextCursor: string | null, count: PublicCount | null}} CommentPage
   * @typedef {{key: string, label: string, visual: {kind: string, token: string}, count: PublicCount | null, viewerActive: boolean}} ReactionItem
   * @typedef {{enabled: boolean, items: ReactionItem[]}} ReactionsBlock
   * @typedef {{reactions: ReactionsBlock, comments: {enabled: boolean, open: boolean, allowReplies: boolean, maxDepth: number}, viewer: ReaderView | null, asOf: string}} InteractionsView
   * @typedef {{kind: 'reaction', key: string} | {kind: 'comment', parentId: string | null, body: string} | {kind: 'signin'}} Intent
   * @typedef {{auth?: boolean, body?: unknown, idempotencyKey?: string}} ApiOptions
   * @typedef {HTMLLIElement & {_comment: CommentView}} CommentItem
   * @typedef {{mode: string, parentId: string | null, commentId: string | null, draft: {body: string, parentId: string | null, key: string} | null, busy: boolean, update: () => void, element: HTMLElement, input: HTMLTextAreaElement, close: () => void}} Composer
   * @typedef {{mode: 'new' | 'reply' | 'edit', parentId?: string | null, commentId?: string | null, body?: string, onDone?: (result: any) => void, onCancel?: () => void}} ComposerOptions
   */
  /** @type {{accessToken: string, expiresAt: string, reader: {displayName: string, initials: string}} | null} */
  let session = /** @type {Session | null} */ (null);
  let memorySession = /** @type {Session | null} */ (null);
  const live = {
    allowReplies: config.allowReplies,
    maxDepth: config.maxDepth,
    commentsOpen: config.commentsEnabled,
    nextCursor: /** @type {string | null} */ (null),
    loadedIds: new Set(),
  };
  const composers = new Set();
  let rootComposer = /** @type {Composer | null} */ (null);
  let inline = /** @type {{composer: Composer, item: CommentItem} | null} */ (
    null
  );
  let loadToken = 0;

  // ------------------------------------------------------------------- helpers
  /**
   * @param {number} value
   * @returns {number}
   */
  function clampDepth(value) {
    if (!Number.isFinite(value)) return 3;
    return Math.min(4, Math.max(1, value));
  }

  /**
   * @template {keyof HTMLElementTagNameMap} K
   * @param {K} tag
   * @param {string} [className]
   * @param {string} [text]
   * @returns {HTMLElementTagNameMap[K]}
   */
  function make(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  /**
   * @param {string} className
   * @param {string} text
   * @param {string} [label]
   * @returns {HTMLButtonElement}
   */
  function button(className, text, label) {
    const node = make('button', className, text);
    node.type = 'button';
    if (label) node.setAttribute('aria-label', label);
    return node;
  }

  let idCounter = 0;
  /**
   * @param {string} prefix
   * @returns {string}
   */
  function uniqueId(prefix) {
    idCounter += 1;
    return 'g-' + prefix + '-' + idCounter;
  }

  /**
   * @param {string} message
   */
  function announce(message) {
    if (!statusEl) return;
    // Clear first so repeating the same text is announced again.
    statusEl.textContent = '';
    setTimeout(() => {
      statusEl.textContent = message;
    }, 30);
  }

  /**
   * @param {string} message
   */
  function announceNow(message) {
    if (statusEl) statusEl.textContent = message;
  }

  /**
   * @param {string} text
   * @returns {number}
   */
  function codePoints(text) {
    let n = 0;
    for (const ch of text) n += ch ? 1 : 0;
    return n;
  }

  /**
   * @param {Uint8Array} bytes
   * @returns {string}
   */
  function base64url(bytes) {
    let binary = '';
    for (let i = 0; i < bytes.length; i += 1) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  /**
   * @param {number} byteLength
   * @returns {string}
   */
  function randomToken(byteLength) {
    const bytes = new Uint8Array(byteLength);
    crypto.getRandomValues(bytes);
    return base64url(bytes);
  }

  function reducedMotion() {
    try {
      return !!(
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      );
    } catch {
      return false;
    }
  }

  /**
   * @param {HTMLElement|null|undefined} node
   */
  function focusNode(node) {
    if (!node) return;
    try {
      node.focus({ preventScroll: reducedMotion() });
    } catch {
      node.focus();
    }
    if (node.scrollIntoView) {
      try {
        node.scrollIntoView({
          block: 'nearest',
          behavior: reducedMotion() ? 'auto' : 'smooth',
        });
      } catch {
        // Scrolling is a nicety only.
      }
    }
  }

  // ------------------------------------------------------------------- storage
  /**
   * @param {StorageKind} kind
   * @returns {Storage}
   */
  function store(kind) {
    return kind === 'localStorage'
      ? window.localStorage
      : window.sessionStorage;
  }
  /**
   * @param {StorageKind} kind
   * @param {string} key
   * @returns {string|null}
   */
  function storageGet(kind, key) {
    try {
      return store(kind).getItem(key);
    } catch {
      return null;
    }
  }
  /**
   * @param {StorageKind} kind
   * @param {string} key
   * @param {string} value
   * @returns {boolean}
   */
  function storageSet(kind, key, value) {
    try {
      store(kind).setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }
  /**
   * @param {StorageKind} kind
   * @param {string} key
   */
  function storageRemove(kind, key) {
    try {
      store(kind).removeItem(key);
    } catch {
      // Nothing to remove if storage is unavailable.
    }
  }
  /**
   * @param {StorageKind} kind
   * @returns {boolean}
   */
  function storageWorks(kind) {
    const probe = 'gala.reader.probe';
    if (!storageSet(kind, probe, '1')) return false;
    storageRemove(kind, probe);
    return true;
  }

  /**
   * @param {StorageKind} kind
   * @param {string} key
   * @returns {Record<string, any>|null}
   */
  function readJson(kind, key) {
    const raw = storageGet(kind, key);
    if (!raw) return null;
    try {
      const value = JSON.parse(raw);
      return value && typeof value === 'object' ? value : null;
    } catch {
      return null;
    }
  }

  /**
   * @returns {Session | null}
   */
  function loadSession() {
    const stored = readJson('localStorage', SESSION_KEY) || memorySession;
    if (
      !stored ||
      typeof stored.accessToken !== 'string' ||
      !stored.accessToken ||
      !stored.reader ||
      typeof stored.reader.displayName !== 'string'
    ) {
      if (stored) storageRemove('localStorage', SESSION_KEY);
      return null;
    }
    const expires = Date.parse(stored.expiresAt);
    if (!Number.isFinite(expires) || expires <= Date.now()) {
      storageRemove('localStorage', SESSION_KEY);
      memorySession = null;
      return null;
    }
    return /** @type {Session} */ (stored);
  }

  /**
   * @param {Session} value
   */
  function saveSession(value) {
    memorySession = value;
    storageSet('localStorage', SESSION_KEY, JSON.stringify(value));
  }

  function sessionName() {
    return session ? session.reader.displayName : '';
  }

  function clearSession() {
    session = null;
    memorySession = null;
    storageRemove('localStorage', SESSION_KEY);
  }

  // ------------------------------------------------------------------- network
  class ApiError extends Error {
    /**
     * @param {string} kind
     * @param {number} status
     * @param {string} code
     * @param {string} reason
     */
    constructor(kind, status, code, reason) {
      super(kind);
      this.kind = kind;
      this.status = status;
      this.code = code;
      this.reason = reason;
    }
  }

  /**
   * @param {string} method
   * @param {string} path
   * @param {ApiOptions} [options]
   * @returns {Promise<any>}
   */
  async function api(method, path, options) {
    const opts = options || {};
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    /** @type {Record<string, string>} */
    const headers = { Accept: 'application/json' };
    if (opts.auth !== false && session) {
      headers.Authorization = 'Bearer ' + session.accessToken;
    }
    if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
    if (opts.idempotencyKey) headers['Idempotency-Key'] = opts.idempotencyKey;
    let response;
    try {
      response = await fetch(config.apiOrigin + path, {
        method,
        headers,
        body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
        mode: 'cors',
        credentials: 'omit',
        signal: controller.signal,
      });
    } catch {
      throw new ApiError('network', 0, '', '');
    } finally {
      clearTimeout(timer);
    }
    let payload = null;
    if (response.status !== 204) {
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }
    }
    if (response.ok) return payload;
    const code =
      payload && typeof payload.code === 'string' ? payload.code : '';
    throw new ApiError('problem', response.status, code, reasonOf(payload));
  }

  /**
   * @param {any} payload
   * @returns {string}
   */
  function reasonOf(payload) {
    if (!payload || typeof payload !== 'object') return '';
    if (typeof payload.reason === 'string') return payload.reason;
    const known = ['EMPTY', 'TOO_LONG', 'TOO_MANY_LINKS', 'BLOCKED_PATTERN'];
    if (Array.isArray(payload.errors)) {
      for (const entry of payload.errors) {
        if (entry && known.includes(entry.code)) return entry.code;
        if (entry && known.includes(entry.reason)) return entry.reason;
      }
    }
    return '';
  }

  // Turn a failed call into the reader-facing sentence. A 401 (or a token for
  // another publication) also drops the stored session.
  /**
   * @param {unknown} error
   * @returns {string}
   */
  function failureMessage(error) {
    if (!(error instanceof ApiError)) return MESSAGES.generic;
    if (error.kind === 'network') return MESSAGES.network;
    if (error.status === 401 || error.code === 'READER_TOKEN_SCOPE') {
      handleSignedOutByServer();
      return MESSAGES.signInAgain;
    }
    if (error.status === 429 || error.code === 'RATE_LIMITED') {
      return MESSAGES.tooFast;
    }
    switch (error.code) {
      case 'COMMENTS_CLOSED':
        return MESSAGES.commentsClosed;
      case 'COMMENT_INVALID':
        if (error.reason === 'EMPTY') return MESSAGES.empty;
        if (error.reason === 'TOO_LONG') return MESSAGES.tooLong;
        if (error.reason === 'TOO_MANY_LINKS') return MESSAGES.tooManyLinks;
        if (error.reason === 'BLOCKED_PATTERN') return MESSAGES.blocked;
        return MESSAGES.generic;
      case 'REPLIES_NOT_ALLOWED':
        return MESSAGES.repliesOff;
      case 'REPLY_TOO_DEEP':
        return MESSAGES.tooDeep;
      case 'PARENT_NOT_FOUND':
        return MESSAGES.parentGone;
      case 'DUPLICATE_COMMENT':
        return MESSAGES.duplicate;
      case 'READER_RESTRICTED':
        return MESSAGES.restricted;
      case 'EDIT_WINDOW_CLOSED':
        return MESSAGES.editClosed;
      case 'NOT_COMMENT_AUTHOR':
        return MESSAGES.notAuthor;
      case 'COMMENT_NOT_FOUND':
        return MESSAGES.gone;
      default:
        return MESSAGES.generic;
    }
  }

  function handleSignedOutByServer() {
    if (!session && !memorySession) return;
    clearSession();
    refreshComposers();
  }

  // ----------------------------------------------------------- sign-in (PKCE)
  /**
   * @param {Intent} intent
   * @returns {Promise<void>}
   */
  async function startSignIn(intent) {
    if (!storageWorks('sessionStorage') || !storageWorks('localStorage')) {
      announceNow(MESSAGES.storageBlocked);
      showNotice(MESSAGES.storageBlocked);
      return;
    }
    if (!crypto || !crypto.subtle || !crypto.getRandomValues) {
      announceNow(MESSAGES.signInUnsupported);
      return;
    }
    let challenge;
    const state = randomToken(32);
    const verifier = randomToken(64);
    try {
      const digest = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(verifier),
      );
      challenge = base64url(new Uint8Array(digest));
    } catch {
      announceNow(MESSAGES.signInUnsupported);
      return;
    }
    const stored = storageSet(
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
      announceNow(MESSAGES.storageBlocked);
      showNotice(MESSAGES.storageBlocked);
      return;
    }
    const target =
      config.appOrigin +
      '/reader/connect?publication=' +
      encodeURIComponent(config.publicationId) +
      '&return=' +
      encodeURIComponent(config.canonicalUrl + '#comments') +
      '&state=' +
      encodeURIComponent(state) +
      '&challenge=' +
      encodeURIComponent(challenge);
    navigate(target);
  }

  /**
   * @param {string} url
   */
  function navigate(url) {
    const event = new CustomEvent('gala:navigate', {
      detail: { url },
      cancelable: true,
      bubbles: true,
    });
    if (root.dispatchEvent(event)) window.location.assign(url);
  }

  // Handle a return from the App: read the fragment, scrub it from the URL
  // immediately, verify state, exchange the code. Resolves to the intent to
  // replay (or null).
  async function completeSignInFromFragment() {
    const hash = window.location.hash || '';
    if (hash.indexOf('gala-reader-') === -1) return null;
    const params = new URLSearchParams(hash.replace(/^#/, ''));
    const code = params.get('gala-reader-code');
    const returnedState = params.get('gala-reader-state');
    try {
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search + '#comments',
      );
    } catch {
      // The fragment stays visible; the single-use code is still protected.
    }
    const pending = readJson('sessionStorage', PENDING_KEY);
    storageRemove('sessionStorage', PENDING_KEY);
    if (
      !pending ||
      !code ||
      !returnedState ||
      pending.state !== returnedState ||
      typeof pending.codeVerifier !== 'string' ||
      !(Date.now() - Number(pending.createdAt) < PENDING_MAX_AGE_MS)
    ) {
      announceNow(MESSAGES.signInInvalid);
      return null;
    }
    try {
      const result = await api('POST', '/v2/reader/tokens', {
        auth: false,
        body: {
          code,
          codeVerifier: pending.codeVerifier,
          publicationId: config.publicationId,
        },
      });
      if (!result || typeof result.accessToken !== 'string' || !result.reader) {
        throw new ApiError('problem', 200, '', '');
      }
      session = {
        accessToken: result.accessToken,
        expiresAt: result.expiresAt,
        reader: result.reader,
      };
      saveSession(session);
    } catch (error) {
      announceNow(
        error instanceof ApiError && error.kind === 'network'
          ? MESSAGES.network
          : MESSAGES.signInFailed,
      );
      return null;
    }
    return pending.intent && typeof pending.intent === 'object'
      ? pending.intent
      : { kind: 'signin' };
  }

  async function signOut() {
    if (session) {
      try {
        await api('DELETE', '/v2/reader/tokens/current');
      } catch {
        // Whether or not the server heard us, this browser forgets the token.
      }
    }
    clearSession();
    refreshComposers();
    announce(MESSAGES.signedOut);
    loadAll();
  }

  // ------------------------------------------------------------------- notices
  let noticeNode = noticeEl;

  /**
   * @param {string} text
   */
  function showNotice(text) {
    const node = noticeNode || make('p', 'g-interactions__notice');
    if (!noticeNode) {
      noticeNode = node;
      root.appendChild(node);
    }
    node.textContent = text;
    node.hidden = false;
  }

  function hideNotice() {
    if (noticeNode) noticeNode.hidden = true;
  }

  // ----------------------------------------------------------------- reactions
  const reactionBusy = new Set();

  function reactionButtons() {
    return reactionsEl
      ? Array.from(
          /** @type {NodeListOf<HTMLButtonElement>} */ (
            reactionsEl.querySelectorAll('[data-reaction-key]')
          ),
        )
      : [];
  }

  /**
   * @param {HTMLElement} node
   * @param {boolean} active
   */
  function setPressed(node, active) {
    node.setAttribute('aria-pressed', active ? 'true' : 'false');
    node.classList.toggle('g-reaction--active', !!active);
  }

  /**
   * @param {HTMLElement} node
   * @param {PublicCount|null|undefined} count
   * @param {string} noun
   */
  function setCount(node, count, noun) {
    const target = node.querySelector('[data-gala-count]');
    if (!target) return;
    if (count && config.countReactions && typeof count.display === 'string') {
      target.textContent = count.display;
      const label = node.querySelector('.g-reaction__label');
      const base = label ? label.textContent : '';
      node.setAttribute(
        'aria-label',
        (base ? base + ': ' : '') + (count.label || count.display + ' ' + noun),
      );
    } else {
      target.textContent = '';
      node.removeAttribute('aria-label');
    }
  }

  /**
   * @param {ReactionsBlock|null|undefined} block
   */
  function applyReactions(block) {
    if (!reactionsEl) return;
    if (!block || block.enabled === false) {
      reactionsEl.hidden = true;
      return;
    }
    const items = new Map();
    for (const item of block.items || []) items.set(item.key, item);
    for (const node of reactionButtons()) {
      const key = node.getAttribute('data-reaction-key');
      const item = items.get(key);
      if (!item) {
        node.hidden = true;
        continue;
      }
      node.hidden = false;
      node.disabled = false;
      setPressed(node, !!item.viewerActive);
      setCount(node, item.count, 'reactions');
    }
  }

  /**
   * @param {HTMLElement} node
   * @param {boolean} wantActive
   * @returns {Promise<void>}
   */
  async function setReaction(node, wantActive) {
    const key = node.getAttribute('data-reaction-key');
    if (!key || reactionBusy.has(key)) return;
    reactionBusy.add(key);
    const wasActive = node.getAttribute('aria-pressed') === 'true';
    const wasCount = node.querySelector('[data-gala-count]');
    const previousText = wasCount ? wasCount.textContent : '';
    const previousLabel = node.getAttribute('aria-label');
    setPressed(node, wantActive);
    const path = CONTENT_PATH + '/reactions/' + encodeURIComponent(key);
    try {
      const result = await api(wantActive ? 'PUT' : 'DELETE', path);
      setPressed(
        node,
        result && typeof result.active === 'boolean'
          ? result.active
          : wantActive,
      );
      if (result) setCount(node, result.count, 'reactions');
    } catch (error) {
      setPressed(node, wasActive);
      if (wasCount) wasCount.textContent = previousText;
      if (previousLabel === null) node.removeAttribute('aria-label');
      else node.setAttribute('aria-label', previousLabel);
      announce(failureMessage(error));
    } finally {
      reactionBusy.delete(key);
    }
  }

  /**
   * @param {Event} event
   */
  function onReactionClick(event) {
    const node = /** @type {HTMLElement} */ (event.currentTarget);
    if (!session) {
      startSignIn({
        kind: 'reaction',
        key: node.getAttribute('data-reaction-key') || '',
      });
      return;
    }
    setReaction(node, node.getAttribute('aria-pressed') !== 'true');
  }

  // ------------------------------------------------------------------- linkify
  /**
   * @param {HTMLElement} parent
   * @param {string} text
   */
  function appendLinkified(parent, text) {
    let last = 0;
    URL_PATTERN.lastIndex = 0;
    let match = URL_PATTERN.exec(text);
    while (match) {
      let candidate = match[0];
      const trimmed = candidate.replace(TRAILING_PUNCTUATION, '');
      candidate = trimmed || candidate;
      let href = '';
      try {
        const parsed = new URL(candidate);
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
          href = parsed.href;
        }
      } catch {
        href = '';
      }
      if (href) {
        if (match.index > last) {
          parent.appendChild(
            document.createTextNode(text.slice(last, match.index)),
          );
        }
        const anchor = make('a', '', candidate);
        anchor.setAttribute('href', href);
        anchor.setAttribute('rel', LINK_REL);
        parent.appendChild(anchor);
        last = match.index + candidate.length;
      }
      URL_PATTERN.lastIndex = match.index + Math.max(candidate.length, 1);
      match = URL_PATTERN.exec(text);
    }
    if (last < text.length) {
      parent.appendChild(document.createTextNode(text.slice(last)));
    }
  }

  /**
   * @param {string} text
   * @returns {HTMLElement}
   */
  function renderBody(text) {
    const body = make('div', 'g-comment__body');
    const lines = String(text).split('\n');
    lines.forEach((line, index) => {
      if (index > 0) body.appendChild(document.createElement('br'));
      appendLinkified(body, line);
    });
    return body;
  }

  // ---------------------------------------------------------------------- time
  function languageTag() {
    const lang = document.documentElement.getAttribute('lang');
    return lang || undefined;
  }

  /**
   * @param {string} iso
   * @param {boolean} edited
   * @returns {string}
   */
  function timeLabel(iso, edited) {
    const when = Date.parse(iso);
    let label = iso;
    if (Number.isFinite(when)) {
      const seconds = Math.round((when - Date.now()) / 1000);
      const elapsed = Math.abs(seconds);
      try {
        if (elapsed < 45) {
          label = MESSAGES.justNow;
        } else if (elapsed >= RELATIVE_DAYS_LIMIT * 86400) {
          label = new Intl.DateTimeFormat(languageTag(), {
            dateStyle: 'medium',
          }).format(when);
        } else {
          const formatter = new Intl.RelativeTimeFormat(languageTag(), {
            numeric: 'auto',
            style: 'short',
          });
          if (elapsed < 3600) {
            label = formatter.format(Math.round(seconds / 60), 'minute');
          } else if (elapsed < 86400) {
            label = formatter.format(Math.round(seconds / 3600), 'hour');
          } else {
            label = formatter.format(Math.round(seconds / 86400), 'day');
          }
        }
      } catch {
        label = new Date(when).toISOString().slice(0, 10);
      }
    }
    return edited ? label + MESSAGES.edited : label;
  }

  /**
   * @param {string} iso
   * @returns {string}
   */
  function fullDate(iso) {
    const when = Date.parse(iso);
    if (!Number.isFinite(when)) return '';
    try {
      return new Intl.DateTimeFormat(languageTag(), {
        dateStyle: 'long',
        timeStyle: 'short',
      }).format(when);
    } catch {
      return new Date(when).toISOString();
    }
  }

  /**
   * A comment's `<time>` element: the given text, the machine-readable date
   * and the full date as its tooltip.
   *
   * @param {string} iso
   * @param {string} text
   * @returns {HTMLElement}
   */
  function timeElement(iso, text) {
    const time = make('time', 'g-comment__time', text);
    time.setAttribute('datetime', iso);
    const title = fullDate(iso);
    if (title) time.setAttribute('title', title);
    return time;
  }

  // ------------------------------------------------------------------ comments
  /**
   * @param {PublicCount|null|undefined} count
   */
  function setCommentCount(count) {
    if (!countEl) return;
    if (count && config.countComments && typeof count.display === 'string') {
      countEl.textContent = count.display;
      countEl.setAttribute('role', 'img');
      countEl.setAttribute('aria-label', count.label || count.display);
    } else {
      countEl.textContent = '';
      countEl.removeAttribute('role');
      countEl.removeAttribute('aria-label');
    }
  }

  /**
   * The state of the signed-in reader's own removed or held comment, which
   * arrives with an `own` object and no body.
   *
   * @param {CommentView} comment
   * @returns {CommentOwn | null}
   */
  function ownView(comment) {
    const own = comment.own;
    return own &&
      typeof own === 'object' &&
      (own.state === 'REMOVED' || own.state === 'HELD')
      ? own
      : null;
  }

  /**
   * The one-line context of the reader's own removed or held comment, which
   * arrives with no body: "Your comment from <relative date>". Null when the
   * comment has no usable `createdAt`.
   *
   * @param {CommentView} comment
   * @returns {HTMLElement | null}
   */
  function ownContext(comment) {
    if (!Number.isFinite(Date.parse(comment.createdAt))) return null;
    return timeElement(
      comment.createdAt,
      MESSAGES.ownFrom + timeLabel(comment.createdAt, false),
    );
  }

  /**
   * The line saying where the reader's appeal stands, if there is one.
   *
   * @param {CommentView} comment
   * @returns {HTMLElement | null}
   */
  function appealResult(comment) {
    const appeal = comment.own && comment.own.appeal;
    const text = !appeal
      ? ''
      : appeal.state === 'PENDING'
        ? MESSAGES.appealSent
        : appeal.state === 'RESTORED'
          ? MESSAGES.appealRestored
          : appeal.state === 'DENIED'
            ? MESSAGES.appealDenied
            : '';
    return text ? make('p', 'g-interactions__notice', text) : null;
  }

  /**
   * @param {CommentView} comment
   * @returns {boolean}
   */
  function canReplyTo(comment) {
    if (!live.commentsOpen || !live.allowReplies) return false;
    if (comment.state !== 'VISIBLE' || ownView(comment)) return false;
    if (comment.depth >= live.maxDepth - 1) return false;
    if (session && comment.viewer && comment.viewer.canReply === false) {
      return false;
    }
    return true;
  }

  /**
   * @param {CommentView} comment
   * @returns {CommentItem}
   */
  function renderComment(comment) {
    const item = /** @type {any} */ (make('li', 'g-comment'));
    item.id = 'g-comment-' + comment.id;
    item.setAttribute('tabindex', '-1');
    item.setAttribute('data-comment-id', comment.id);
    item.setAttribute('data-depth', String(comment.depth));
    item._comment = comment;
    live.loadedIds.add(comment.id);
    fillComment(item, comment);
    return item;
  }

  /**
   * @param {CommentItem} item
   * @param {CommentView} comment
   */
  function fillComment(item, comment) {
    const existingReplies = item.querySelector(':scope > .g-comment__replies');
    while (item.firstChild) item.removeChild(item.firstChild);
    item._comment = comment;
    const own = ownView(comment);
    item.classList.toggle(
      'g-comment--tombstone',
      comment.state !== 'VISIBLE' || !!own,
    );
    item.classList.toggle(
      'g-comment--mine',
      !!own || !!(comment.viewer && comment.viewer.isAuthor),
    );

    const head = make('div', 'g-comment__head');
    if (own) {
      // No body comes back for these, so say which comment it is by its date.
      const context = ownContext(comment);
      if (context) item.appendChild(context);
      item.appendChild(
        make(
          'p',
          'g-comment__body',
          own.state === 'HELD' ? MESSAGES.heldOwn : MESSAGES.removedOwn,
        ),
      );
      const result = appealResult(comment);
      if (result) item.appendChild(result);
      if (own.canAppeal === true) item.appendChild(renderAppealAction(item));
    } else if (comment.state === 'VISIBLE' && comment.author) {
      const avatar = make('span', 'g-comment__avatar', comment.author.initials);
      avatar.setAttribute('aria-hidden', 'true');
      head.appendChild(avatar);
      head.appendChild(
        make('span', 'g-comment__author', comment.author.displayName),
      );
      head.appendChild(
        timeElement(
          comment.createdAt,
          timeLabel(comment.createdAt, !!comment.editedAt),
        ),
      );
      item.appendChild(head);
      item.appendChild(renderBody(comment.body || ''));
      // A comment restored on appeal says so.
      const result = appealResult(comment);
      if (result) item.appendChild(result);
      item.appendChild(renderActions(item, comment));
    } else {
      item.appendChild(
        make(
          'p',
          'g-comment__body',
          comment.state === 'REMOVED'
            ? MESSAGES.removedTombstone
            : MESSAGES.deletedTombstone,
        ),
      );
    }
    if (existingReplies) {
      item.appendChild(existingReplies);
    } else if (comment.replies && comment.replies.length) {
      item.appendChild(renderReplies(comment));
    }
    if (comment.moreReplies) addMoreReplies(item, comment);
  }

  /**
   * @param {CommentView} comment
   * @returns {HTMLElement}
   */
  function renderReplies(comment) {
    const list = make('ol', 'g-comment__replies');
    for (const reply of comment.replies || []) {
      list.appendChild(renderComment(reply));
    }
    return list;
  }

  /**
   * @param {HTMLElement} item
   * @returns {HTMLElement}
   */
  function ensureReplies(item) {
    let list = /** @type {HTMLElement | null} */ (
      item.querySelector(':scope > .g-comment__replies')
    );
    if (!list) {
      list = make('ol', 'g-comment__replies');
      const more = item.querySelector(':scope > .g-comment__more-replies');
      if (more) item.insertBefore(list, more);
      else item.appendChild(list);
    }
    return list;
  }

  /**
   * @param {CommentItem} item
   * @param {CommentView} comment
   */
  function addMoreReplies(item, comment) {
    const more = button(
      'g-comment__action g-comment__more-replies',
      MESSAGES.showMoreReplies,
    );
    let cursor = /** @type {string | null} */ (null);
    let first = true;
    more.addEventListener('click', async () => {
      more.disabled = true;
      try {
        const query = new URLSearchParams({ parentId: comment.id });
        if (cursor) query.set('cursor', cursor);
        const page = await api(
          'GET',
          CONTENT_PATH + '/comments?' + query.toString(),
        );
        const list = ensureReplies(item);
        if (first) {
          while (list.firstChild) list.removeChild(list.firstChild);
          first = false;
        }
        for (const reply of page.items || [])
          list.appendChild(renderComment(reply));
        cursor = page.nextCursor || null;
        if (!cursor) more.remove();
        else more.disabled = false;
      } catch (error) {
        more.disabled = false;
        announce(failureMessage(error));
      }
    });
    item.appendChild(more);
  }

  /**
   * @param {CommentItem} item
   * @param {CommentView} comment
   * @returns {HTMLElement}
   */
  function renderActions(item, comment) {
    const actions = make('div', 'g-comment__actions');
    const name = comment.author ? comment.author.displayName : '';
    if (canReplyTo(comment)) {
      const reply = button(
        'g-comment__action',
        MESSAGES.reply,
        MESSAGES.reply + ' to ' + name,
      );
      reply.addEventListener('click', () =>
        openInlineComposer(item, 'reply', reply),
      );
      actions.appendChild(reply);
    }
    if (comment.viewer && comment.viewer.canEdit) {
      const edit = button(
        'g-comment__action',
        MESSAGES.edit,
        MESSAGES.edit + ' your comment',
      );
      edit.addEventListener('click', () =>
        openInlineComposer(item, 'edit', edit),
      );
      actions.appendChild(edit);
    }
    if (comment.viewer && comment.viewer.canDelete) {
      const remove = button(
        'g-comment__action',
        MESSAGES.remove,
        MESSAGES.remove + ' your comment',
      );
      remove.addEventListener('click', () =>
        confirmDelete(item, remove, actions),
      );
      actions.appendChild(remove);
    }
    if (!(comment.viewer && comment.viewer.isAuthor)) {
      const report = button(
        'g-comment__action',
        MESSAGES.report,
        MESSAGES.report + ' comment by ' + name,
      );
      report.addEventListener('click', () => openReport(item, report));
      actions.appendChild(report);
    }
    return actions;
  }

  /**
   * @param {CommentItem} item
   * @param {HTMLElement} trigger
   * @param {HTMLElement} actions
   */
  function confirmDelete(item, trigger, actions) {
    trigger.hidden = true;
    const box = make('span', 'g-comment__confirm');
    box.setAttribute('role', 'group');
    box.setAttribute('aria-label', MESSAGES.confirmDelete);
    box.appendChild(make('span', '', MESSAGES.confirmDelete + ' '));
    const yes = button('g-comment__action', MESSAGES.remove);
    const no = button('g-comment__action', MESSAGES.cancel);
    box.appendChild(yes);
    box.appendChild(no);
    actions.appendChild(box);
    no.focus();
    const close = () => {
      box.remove();
      trigger.hidden = false;
      focusNode(trigger);
    };
    no.addEventListener('click', close);
    box.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        close();
      }
    });
    yes.addEventListener('click', async () => {
      yes.disabled = true;
      no.disabled = true;
      try {
        await api(
          'DELETE',
          '/v2/public/comments/' + encodeURIComponent(item._comment.id),
        );
        applyDeleted(item);
        announce(MESSAGES.deleted);
      } catch (error) {
        yes.disabled = false;
        no.disabled = false;
        announce(failureMessage(error));
      }
    });
  }

  /**
   * @param {CommentItem} item
   */
  function applyDeleted(item) {
    const replies = item.querySelector(':scope > .g-comment__replies');
    const hasReplies = !!(replies && replies.children.length);
    const parentList = /** @type {HTMLElement | null} */ (item.parentNode);
    if (hasReplies) {
      const next = Object.assign({}, item._comment, {
        state: 'DELETED',
        author: null,
        body: null,
        viewer: {
          isAuthor: false,
          canEdit: false,
          canDelete: false,
          canReply: false,
        },
      });
      fillComment(item, next);
      focusNode(item);
      return;
    }
    item.remove();
    live.loadedIds.delete(item._comment.id);
    if (
      parentList &&
      parentList.classList.contains('g-comment__replies') &&
      !parentList.children.length
    ) {
      parentList.remove();
    }
    focusNode(titleEl || commentsEl);
  }

  // ------------------------------------------------------------------ composer
  /**
   * @param {Composer} composer
   * @param {string} body
   * @returns {string}
   */
  function currentDraftKey(composer, body) {
    if (
      !composer.draft ||
      composer.draft.body !== body ||
      composer.draft.parentId !== composer.parentId
    ) {
      composer.draft = {
        body,
        parentId: composer.parentId,
        key: crypto.randomUUID(),
      };
    }
    return composer.draft.key;
  }

  /**
   * @param {ComposerOptions} options
   * @returns {Composer}
   */
  function createComposer(options) {
    const composer = /** @type {Composer} */ ({
      mode: options.mode,
      parentId: options.parentId || null,
      commentId: options.commentId || null,
      draft: null,
      busy: false,
    });
    const wrapper = make('div', 'g-composer');
    const inputId = uniqueId('composer');
    const label = make(
      'label',
      '',
      options.mode === 'reply'
        ? MESSAGES.replyLabel
        : options.mode === 'edit'
          ? MESSAGES.editLabel
          : MESSAGES.composerLabel,
    );
    label.setAttribute('for', inputId);
    const input = make('textarea', 'g-composer__input');
    input.id = inputId;
    input.rows = options.mode === 'new' ? 4 : 3;
    input.value = options.body || '';
    const counter = make('p', 'g-composer__counter');
    counter.id = uniqueId('counter');
    counter.hidden = true;
    input.setAttribute('aria-describedby', counter.id);
    const error = make('p', 'g-composer__error');
    error.setAttribute('role', 'alert');
    error.hidden = true;
    const actions = make('div', 'g-composer__actions');
    const submit = button(
      'g-composer__submit',
      options.mode === 'edit' ? MESSAGES.save : MESSAGES.post,
    );
    const signin = button(
      'g-composer__signin',
      options.mode === 'new' ? MESSAGES.signInLabel : MESSAGES.signInShort,
    );
    const cancel = button('g-composer__cancel', MESSAGES.cancel);
    cancel.hidden = options.mode === 'new';
    actions.appendChild(submit);
    actions.appendChild(signin);
    actions.appendChild(cancel);
    wrapper.appendChild(label);
    wrapper.appendChild(input);
    wrapper.appendChild(counter);
    wrapper.appendChild(error);
    wrapper.appendChild(actions);

    let identity = null;
    if (options.mode === 'new') {
      identity = make('p', 'g-composer__identity');
      wrapper.appendChild(identity);
    }

    /**
     * @param {string} text
     */
    function showError(text) {
      error.textContent = text;
      error.hidden = !text;
      if (text) announceNow(text);
    }

    function updateCounter() {
      const used = codePoints(input.value);
      const remaining = COMMENT_LIMIT - used;
      if (remaining < COUNTER_THRESHOLD) {
        counter.hidden = false;
        counter.textContent =
          remaining >= 0
            ? remaining + ' characters left'
            : 'Over the limit by ' + -remaining + ' characters';
      } else {
        counter.hidden = true;
        counter.textContent = '';
      }
    }

    composer.update = () => {
      const signedIn = !!session;
      const hasDraft = input.value !== '';
      const showInput = signedIn || hasDraft || options.mode === 'edit';
      label.hidden = !showInput;
      input.hidden = !showInput;
      submit.hidden = !signedIn;
      signin.hidden = signedIn;
      if (identity) {
        while (identity.firstChild) identity.removeChild(identity.firstChild);
        identity.hidden = !signedIn;
        if (signedIn) {
          identity.appendChild(
            document.createTextNode(
              MESSAGES.signedInAs + sessionName() + ' · ',
            ),
          );
          const out = button('g-interactions__signout', MESSAGES.signOut);
          out.addEventListener('click', signOut);
          identity.appendChild(out);
        }
      }
      updateCounter();
    };

    composer.element = wrapper;
    composer.input = input;
    composer.close = () => {
      composers.delete(composer);
      wrapper.remove();
    };

    input.addEventListener('input', () => {
      updateCounter();
      showError('');
    });
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && options.mode !== 'new') {
        event.preventDefault();
        cancel.click();
      }
    });
    cancel.addEventListener('click', () => {
      composer.close();
      if (options.onCancel) options.onCancel();
    });
    signin.addEventListener('click', () => {
      startSignIn({
        kind: 'comment',
        parentId: composer.parentId,
        body: input.value,
      });
    });
    submit.addEventListener('click', async () => {
      if (composer.busy) return;
      const body = input.value.trim();
      if (!body) {
        showError(MESSAGES.empty);
        return;
      }
      if (codePoints(body) > COMMENT_LIMIT) {
        showError(MESSAGES.tooLong);
        return;
      }
      composer.busy = true;
      submit.disabled = true;
      submit.setAttribute('aria-busy', 'true');
      showError('');
      try {
        let result;
        if (composer.mode === 'edit') {
          result = await api(
            'POST',
            '/v2/public/comments/' +
              encodeURIComponent(String(composer.commentId)) +
              '/revisions',
            { body: { body } },
          );
        } else {
          result = await api('POST', CONTENT_PATH + '/comments', {
            body: { body, parentId: composer.parentId },
            idempotencyKey: currentDraftKey(composer, body),
          });
        }
        composer.draft = null;
        input.value = '';
        updateCounter();
        if (options.onDone) options.onDone(result);
      } catch (failure) {
        showError(failureMessage(failure));
      } finally {
        composer.busy = false;
        submit.disabled = false;
        submit.removeAttribute('aria-busy');
      }
    });

    composers.add(composer);
    composer.update();
    return composer;
  }

  function refreshComposers() {
    for (const composer of composers) composer.update();
  }

  /**
   * @param {string} body
   */
  function mountRootComposer(body) {
    if (!slotEl) return;
    if (rootComposer) rootComposer.close();
    while (slotEl.firstChild) slotEl.removeChild(slotEl.firstChild);
    if (!live.commentsOpen) {
      slotEl.appendChild(
        make('p', 'g-interactions__notice', MESSAGES.commentsClosed),
      );
      rootComposer = null;
      return;
    }
    rootComposer = createComposer({
      mode: 'new',
      body,
      onDone: (comment) => {
        insertNewComment(comment, null);
      },
    });
    slotEl.appendChild(rootComposer.element);
  }

  /**
   * @param {CommentView} comment
   * @param {HTMLElement|null} parentItem
   */
  function insertNewComment(comment, parentItem) {
    const item = renderComment(comment);
    if (parentItem) {
      ensureReplies(parentItem).appendChild(item);
    } else if (listEl) {
      listEl.insertBefore(item, listEl.firstChild);
    }
    announce(MESSAGES.posted);
    focusNode(item);
  }

  function closeInline() {
    if (inline) {
      inline.composer.close();
      inline = null;
    }
  }

  /**
   * @param {CommentItem} item
   * @param {'reply'|'edit'} mode
   * @param {HTMLElement|null} trigger
   * @param {string} [presetBody]
   */
  function openInlineComposer(item, mode, trigger, presetBody) {
    closeInline();
    const comment = item._comment;
    const done = (/** @type {any} */ result) => {
      /** @type {{composer: Composer}} */ (inline).composer.close();
      inline = null;
      if (mode === 'edit') {
        fillComment(item, result);
        announce(MESSAGES.updated);
        focusNode(item);
      } else {
        insertNewComment(result, item);
      }
    };
    const composer = createComposer({
      mode,
      parentId: mode === 'reply' ? comment.id : null,
      commentId: comment.id,
      body: mode === 'edit' ? comment.body || '' : presetBody || '',
      onDone: done,
      onCancel: () => {
        inline = null;
        if (trigger && trigger.isConnected) focusNode(trigger);
        else focusNode(item);
      },
    });
    inline = { composer, item };
    const replies = item.querySelector(':scope > .g-comment__replies');
    if (replies) item.insertBefore(composer.element, replies);
    else item.appendChild(composer.element);
    focusNode(composer.input);
  }

  // -------------------------------------------------------------------- report
  /**
   * @param {CommentItem} item
   * @param {HTMLElement} trigger
   */
  function openReport(item, trigger) {
    if (!session) {
      startSignIn({ kind: 'signin' });
      return;
    }
    const dialog = make('dialog', 'g-report');
    const titleId = uniqueId('report-title');
    dialog.setAttribute('aria-labelledby', titleId);
    const heading = make('h3', '', MESSAGES.reportTitle);
    heading.id = titleId;
    const reasonId = uniqueId('report-reason');
    const reasonLabel = make('label', '', MESSAGES.reportReason);
    reasonLabel.setAttribute('for', reasonId);
    const select = make('select');
    select.id = reasonId;
    for (const pair of REPORT_REASONS) {
      const option = make('option', '', pair[1]);
      option.value = pair[0];
      select.appendChild(option);
    }
    const noteId = uniqueId('report-note');
    const noteLabel = make('label', '', MESSAGES.reportNote);
    noteLabel.setAttribute('for', noteId);
    const note = make('textarea');
    note.id = noteId;
    note.rows = 3;
    note.setAttribute('maxlength', String(NOTE_LIMIT));
    const error = make('p', 'g-composer__error');
    error.setAttribute('role', 'alert');
    error.hidden = true;
    const actions = make('div', 'g-composer__actions');
    const send = button('g-composer__submit', MESSAGES.reportSubmit);
    const cancel = button('g-composer__cancel', MESSAGES.cancel);
    actions.appendChild(send);
    actions.appendChild(cancel);
    for (const node of [
      heading,
      reasonLabel,
      select,
      noteLabel,
      note,
      error,
      actions,
    ]) {
      dialog.appendChild(node);
    }

    let closed = false;
    const finish = () => {
      if (closed) return;
      closed = true;
      if (dialog.open && typeof dialog.close === 'function') {
        try {
          dialog.close();
        } catch {
          dialog.removeAttribute('open');
        }
      } else {
        dialog.removeAttribute('open');
      }
      dialog.remove();
      focusNode(trigger.isConnected ? trigger : item);
    };
    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      finish();
    });
    dialog.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        finish();
      }
    });
    cancel.addEventListener('click', finish);
    send.addEventListener('click', async () => {
      send.disabled = true;
      error.hidden = true;
      /** @type {{reasonCode: string, note?: string}} */
      const payload = { reasonCode: select.value };
      const text = note.value.trim();
      if (text) payload.note = text.slice(0, NOTE_LIMIT);
      try {
        await api(
          'POST',
          '/v2/public/comments/' +
            encodeURIComponent(item._comment.id) +
            '/reports',
          { body: payload },
        );
        finish();
        announce(MESSAGES.reported);
      } catch (failure) {
        send.disabled = false;
        error.textContent = failureMessage(failure);
        error.hidden = false;
      }
    });

    root.appendChild(dialog);
    if (typeof dialog.showModal === 'function') {
      try {
        dialog.showModal();
      } catch {
        dialog.setAttribute('open', '');
      }
    } else {
      dialog.setAttribute('open', '');
    }
    focusNode(select);
  }

  // -------------------------------------------------------------------- appeal
  /**
   * @param {CommentItem} item
   * @returns {HTMLElement}
   */
  function renderAppealAction(item) {
    const actions = make('div', 'g-comment__actions');
    const appeal = button(
      'g-comment__action',
      MESSAGES.appeal,
      MESSAGES.appealAria,
    );
    appeal.addEventListener('click', () => openAppeal(item, appeal));
    actions.appendChild(appeal);
    return actions;
  }

  /**
   * The sentence for a failed appeal; the problems an appeal adds are named
   * here, everything else is worded as for any other request.
   *
   * @param {unknown} error
   * @returns {string}
   */
  function appealFailureMessage(error) {
    if (error instanceof ApiError && error.kind === 'problem') {
      if (error.code === 'APPEAL_EXISTS') return MESSAGES.appealExists;
      if (error.code === 'APPEAL_NOT_ALLOWED') return MESSAGES.appealNotAllowed;
      if (error.status === 429 || error.code === 'RATE_LIMITED') {
        return MESSAGES.appealTooMany;
      }
    }
    return failureMessage(error);
  }

  /**
   * Show the new state of an appeal under its comment.
   *
   * @param {CommentItem} item
   * @param {CommentAppeal | null} appeal
   */
  function applyAppeal(item, appeal) {
    const comment = item._comment;
    fillComment(
      item,
      Object.assign({}, comment, {
        own: Object.assign({}, comment.own, { appeal, canAppeal: false }),
      }),
    );
    focusNode(item);
  }

  /**
   * @param {CommentItem} item
   * @param {HTMLElement} trigger
   */
  function openAppeal(item, trigger) {
    if (!session) {
      startSignIn({ kind: 'signin' });
      return;
    }
    const wrapper = make('div', 'g-composer');
    const inputId = uniqueId('appeal');
    const label = make('label', '', MESSAGES.appealLabel);
    label.setAttribute('for', inputId);
    const input = make('textarea', 'g-composer__input');
    input.id = inputId;
    input.rows = 3;
    input.setAttribute('maxlength', String(NOTE_LIMIT));
    const error = make('p', 'g-composer__error');
    error.setAttribute('role', 'alert');
    error.hidden = true;
    const actions = make('div', 'g-composer__actions');
    const send = button('g-composer__submit', MESSAGES.appealSend);
    const cancel = button('g-composer__cancel', MESSAGES.cancel);
    actions.appendChild(send);
    actions.appendChild(cancel);
    for (const node of [label, input, error, actions]) {
      wrapper.appendChild(node);
    }

    /**
     * @param {string} text
     */
    const showError = (text) => {
      error.textContent = text;
      error.hidden = !text;
      if (text) announceNow(text);
    };
    const close = () => {
      wrapper.remove();
      trigger.hidden = false;
    };
    cancel.addEventListener('click', () => {
      close();
      focusNode(trigger);
    });
    input.addEventListener('input', () => showError(''));
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        cancel.click();
      }
    });
    send.addEventListener('click', async () => {
      if (!session) {
        startSignIn({ kind: 'signin' });
        return;
      }
      const note = input.value.trim();
      if (!note) {
        showError(MESSAGES.appealEmpty);
        return;
      }
      if (codePoints(note) > NOTE_LIMIT) {
        showError(MESSAGES.appealTooLong);
        return;
      }
      send.disabled = true;
      send.setAttribute('aria-busy', 'true');
      showError('');
      try {
        await api(
          'POST',
          '/v2/public/comments/' +
            encodeURIComponent(item._comment.id) +
            '/appeals',
          { body: { note } },
        );
        // "Appeal sent" is drawn by the redraw alone, under the comment where
        // focus lands; the status line does not repeat it.
        close();
        applyAppeal(item, { state: 'PENDING' });
      } catch (failure) {
        const message = appealFailureMessage(failure);
        if (
          failure instanceof ApiError &&
          (failure.code === 'APPEAL_EXISTS' ||
            failure.code === 'APPEAL_NOT_ALLOWED')
        ) {
          // The server's answer is final for this removal: stop offering it.
          close();
          applyAppeal(
            item,
            failure.code === 'APPEAL_EXISTS'
              ? item._comment.own?.appeal || { state: 'PENDING' }
              : item._comment.own?.appeal || null,
          );
          announce(message);
        } else {
          send.disabled = false;
          showError(message);
        }
      } finally {
        send.removeAttribute('aria-busy');
      }
    });

    trigger.hidden = true;
    const replies = item.querySelector(':scope > .g-comment__replies');
    if (replies) item.insertBefore(wrapper, replies);
    else item.appendChild(wrapper);
    focusNode(input);
  }

  // ------------------------------------------------------------------- loading
  /**
   * @param {CommentPage} page
   * @param {boolean} replace
   */
  function renderPage(page, replace) {
    if (!listEl) return;
    if (replace) {
      while (listEl.firstChild) listEl.removeChild(listEl.firstChild);
      live.loadedIds.clear();
    }
    for (const comment of page.items || []) {
      if (live.loadedIds.has(comment.id)) continue;
      listEl.appendChild(renderComment(comment));
    }
    live.nextCursor = page.nextCursor || null;
    if (moreEl) moreEl.hidden = !live.nextCursor;
  }

  async function loadAll() {
    const token = (loadToken += 1);
    let failures = 0;
    const tasks = [];
    tasks.push(
      api('GET', CONTENT_PATH + '/interactions').then(
        (view) => {
          if (token !== loadToken) return;
          if (view.viewer && session) {
            session.reader = view.viewer;
            saveSession(session);
          }
          if (view.comments) {
            live.commentsOpen =
              view.comments.enabled !== false && view.comments.open !== false;
            if (typeof view.comments.allowReplies === 'boolean') {
              live.allowReplies = view.comments.allowReplies;
            }
            if (Number.isFinite(view.comments.maxDepth)) {
              live.maxDepth = clampDepth(view.comments.maxDepth);
            }
            if (view.comments.enabled === false && commentsEl)
              commentsEl.hidden = true;
          }
          applyReactions(view.reactions);
          refreshComposers();
          if (rootComposer && !live.commentsOpen) mountRootComposer('');
        },
        (error) => {
          failures += 1;
          if (error instanceof ApiError && error.status === 401)
            failureMessage(error);
        },
      ),
    );
    if (config.commentsEnabled && listEl) {
      tasks.push(
        api('GET', CONTENT_PATH + '/comments').then(
          (page) => {
            if (token !== loadToken) return;
            renderPage(page, true);
            setCommentCount(page.count);
          },
          (error) => {
            failures += 1;
            if (error instanceof ApiError && error.status === 401)
              failureMessage(error);
          },
        ),
      );
    }
    await Promise.all(tasks);
    if (token !== loadToken) return;
    if (failures > 0) {
      showNotice(MESSAGES.unavailable);
      announceNow(MESSAGES.unavailable);
    } else {
      hideNotice();
    }
  }

  async function loadMore() {
    if (!live.nextCursor || !moreEl) return;
    moreEl.disabled = true;
    try {
      const query = new URLSearchParams({ cursor: live.nextCursor });
      const page = await api(
        'GET',
        CONTENT_PATH + '/comments?' + query.toString(),
      );
      renderPage(page, false);
    } catch (error) {
      announce(failureMessage(error));
    } finally {
      moreEl.disabled = false;
    }
  }

  // -------------------------------------------------------------------- replay
  /**
   * @param {Intent|null} intent
   * @returns {Promise<void>}
   */
  async function replay(intent) {
    if (!intent) return;
    if (intent.kind === 'reaction' && typeof intent.key === 'string') {
      const node = reactionButtons().find(
        (candidate) =>
          candidate.getAttribute('data-reaction-key') === intent.key,
      );
      if (
        node &&
        !node.hidden &&
        node.getAttribute('aria-pressed') !== 'true'
      ) {
        await setReaction(node, true);
      }
      if (node) focusNode(node);
    } else if (intent.kind === 'comment') {
      const body = typeof intent.body === 'string' ? intent.body : '';
      /** @type {any} */
      const target = intent.parentId
        ? listEl &&
          listEl.querySelector(
            '[data-comment-id="' + cssEscape(intent.parentId) + '"]',
          )
        : null;
      if (target && target._comment && canReplyTo(target._comment)) {
        openInlineComposer(target, 'reply', null, body);
      } else if (rootComposer) {
        rootComposer.input.value = body;
        rootComposer.update();
        focusNode(rootComposer.input);
      }
    } else if (session) {
      announce(MESSAGES.signedInAs + sessionName() + '.');
    }
  }

  /**
   * @param {string} value
   * @returns {string}
   */
  function cssEscape(value) {
    return String(value).replace(/[^A-Za-z0-9_-]/g, '');
  }

  // ---------------------------------------------------------------------- init
  async function init() {
    if (noticeNode) noticeNode.hidden = true;
    for (const node of reactionButtons()) {
      node.addEventListener('click', onReactionClick);
    }
    if (moreEl) moreEl.addEventListener('click', loadMore);

    session = loadSession();
    if (config.commentsEnabled) mountRootComposer('');

    const intent = await completeSignInFromFragment();
    if (!session) session = loadSession();
    refreshComposers();
    await loadAll();
    if (intent) await replay(intent);
  }

  init().catch(() => {
    showNotice(MESSAGES.unavailable);
  });
})();
