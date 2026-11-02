/**
 * The interactive preview's runtime: the one template-owned script an
 * interactive preview inlines FIRST in `<head>` (see `interactive-preview.js`).
 * It makes the built page's real scripts (counts, likes, comments, Follow,
 * newsletter, contact, Listen, theme switch, search, code copy, consent) work
 * inside the App's sandboxed `srcdoc` frame, which has an opaque origin and
 * no form or same-origin rights, without letting anything reach the network or
 * the parent beyond what the preview allows:
 *
 * - `localStorage`, `sessionStorage` and `document.cookie` are in-memory, so
 *   the scripts' persistence works for the session and nothing throws. A
 *   preview reader session is seeded so likes, comments and Follow work.
 * - `fetch`, `XMLHttpRequest` and `navigator.sendBeacon` are wrapped. Only a
 *   `GET` of `<apiOrigin>/v2/public/...` read path goes to the network (no
 *   credentials, no authorization header); every other request is answered
 *   locally by a simulator and shows the "Preview only" toast.
 * - Link clicks are intercepted (capture phase) and never navigate the frame.
 * - Sign-in navigation, reloads, external script injection and form submits
 *   are neutralized (the frame has no allow-forms, so submit buttons fire the
 *   submit event the page's scripts listen for, and nothing is submitted); Listen audio resolves against the live site.
 * - The scroll position is posted to the parent and restored once.
 *
 * Plain ES2020 in one IIFE, no `eval`, no `new Function`. Configuration is the
 * JSON block `script[type="application/json"][data-gala-preview-data]`. The
 * text of this file is hashed into the preview's Content-Security-Policy, so
 * it is constant: everything that varies is in the data block.
 */

/** @type {string} the attribute that marks the runtime's JSON data block */
export const PREVIEW_DATA_ATTRIBUTE = 'data-gala-preview-data';

/** @type {string} the message the runtime posts to the parent on scroll */
export const PREVIEW_SCROLL_MESSAGE = 'gala-preview-scroll';

export const PREVIEW_RUNTIME_SOURCE = String.raw`(function () {
  'use strict';
  var W = window;
  var D = document;
  var cfg;
  try {
    cfg = JSON.parse(
      D.querySelector('script[type="application/json"][data-gala-preview-data]').textContent
    );
  } catch (error) {
    return;
  }
  var msg = cfg.messages || {};
  var API_ORIGIN = '';
  var SITE_ORIGIN = '';
  try {
    API_ORIGIN = new URL(cfg.apiOrigin).origin;
    SITE_ORIGIN = new URL(cfg.siteBase).origin;
  } catch (error) {}

  // ---- toast: the page's own toast look, one element of this runtime's ----
  var toastNode = null;
  var toastTimer = 0;
  function toast(text) {
    function show() {
      if (!D.body) return;
      if (!toastNode) {
        toastNode = D.createElement('div');
        toastNode.className = 'g-toast';
        toastNode.setAttribute('role', 'status');
        toastNode.setAttribute('aria-live', 'polite');
        toastNode.setAttribute('data-gala-preview-toast', '');
        D.body.appendChild(toastNode);
      }
      toastNode.textContent = text;
      toastNode.setAttribute('data-tone', 'info');
      toastNode.setAttribute('data-show', '');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () {
        toastNode.removeAttribute('data-show');
      }, 2600);
    }
    if (D.body) show();
    else D.addEventListener('DOMContentLoaded', show);
  }

  // ---- in-memory storage and cookies ----
  var SESSION_PREFIX = 'gala.reader.session.';
  function makeStorage(seed, seedsSession) {
    var map = new Map();
    var removed = new Set();
    Object.keys(seed || {}).forEach(function (key) {
      map.set(key, String(seed[key]));
    });
    return {
      getItem: function (key) {
        key = String(key);
        if (map.has(key)) return map.get(key);
        if (seedsSession && key.indexOf(SESSION_PREFIX) === 0 && !removed.has(key)) {
          var value = JSON.stringify({
            accessToken: 'preview-reader-token',
            expiresAt: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
            reader: { displayName: 'Preview reader', initials: 'PR' }
          });
          map.set(key, value);
          return value;
        }
        return null;
      },
      setItem: function (key, value) {
        key = String(key);
        removed.delete(key);
        map.set(key, String(value));
      },
      removeItem: function (key) {
        key = String(key);
        removed.add(key);
        map.delete(key);
      },
      clear: function () {
        map.clear();
      },
      key: function (index) {
        var keys = Array.from(map.keys());
        return index >= 0 && index < keys.length ? keys[index] : null;
      },
      get length() {
        return map.size;
      }
    };
  }
  function defineGetter(target, name, getter) {
    try {
      Object.defineProperty(target, name, { configurable: true, enumerable: true, get: getter });
    } catch (error) {}
  }
  var local = makeStorage(cfg.seed, true);
  var session = makeStorage({}, false);
  defineGetter(W, 'localStorage', function () {
    return local;
  });
  defineGetter(W, 'sessionStorage', function () {
    return session;
  });
  var jar = new Map();
  try {
    Object.defineProperty(D, 'cookie', {
      configurable: true,
      enumerable: true,
      get: function () {
        return Array.from(jar, function (pair) {
          return pair[0] + '=' + pair[1];
        }).join('; ');
      },
      set: function (line) {
        var parts = String(line).split(';');
        var first = parts[0];
        var at = first.indexOf('=');
        var name = (at < 0 ? '' : first.slice(0, at)).trim();
        var value = at < 0 ? first.trim() : first.slice(at + 1).trim();
        var gone = false;
        for (var i = 1; i < parts.length; i += 1) {
          var attribute = parts[i].trim().toLowerCase();
          if (attribute.indexOf('expires=') === 0) {
            var when = Date.parse(parts[i].trim().slice(8));
            if (Number.isFinite(when) && when <= Date.now()) gone = true;
          } else if (attribute.indexOf('max-age=') === 0) {
            if (Number(attribute.slice(8)) <= 0) gone = true;
          }
        }
        if (gone) jar.delete(name);
        else jar.set(name, value);
      }
    });
  } catch (error) {}

  // ---- network: reads of the public API are real, everything else local ----
  var realFetch = typeof W.fetch === 'function' ? W.fetch.bind(W) : null;
  var reactionBase = {};
  var reactionActive = {};
  var made = {};
  var follows = {};
  var serial = 0;
  var PUBLIC = '/v2/public/';

  function readerView() {
    return { displayName: 'Preview reader', initials: 'PR' };
  }
  function countOf(n, noun) {
    return {
      lowerBound: n,
      display: String(n),
      label: n + ' ' + (n === 1 ? noun.slice(0, -1) : noun)
    };
  }
  function problem(status, code) {
    return { status: status, body: { code: code, errors: [] } };
  }
  // The simulator: what the page's scripts expect of each write, from the
  // public API's contract. Returns {status, body}; body null means no content.
  function simulate(method, path, body) {
    var m;
    m = /^\/v2\/public\/publications\/([^/]+)\/contents\/([^/]+)\/reactions\/([^/]+)$/.exec(path);
    if (m && (method === 'PUT' || method === 'DELETE')) {
      var key = decodeURIComponent(m[3]);
      var on = method === 'PUT';
      reactionActive[key] = on;
      var base = reactionBase[key];
      return {
        status: 200,
        body: {
          active: on,
          count: typeof base === 'number' ? countOf(base + (on ? 1 : 0), 'reactions') : null
        }
      };
    }
    m = /^\/v2\/public\/publications\/([^/]+)\/contents\/([^/]+)\/comments$/.exec(path);
    if (m && method === 'POST') {
      serial += 1;
      var parentId = body && body.parentId ? String(body.parentId) : null;
      var parent = parentId ? made[parentId] : null;
      var depth = parent ? parent.depth + 1 : parentId ? 1 : 0;
      var id = 'preview-comment-' + serial;
      made[id] = { depth: depth };
      return {
        status: 201,
        body: {
          id: id,
          parentId: parentId,
          depth: depth,
          state: 'VISIBLE',
          author: readerView(),
          body: body && typeof body.body === 'string' ? body.body : '',
          createdAt: new Date().toISOString(),
          editedAt: null,
          replies: [],
          moreReplies: false,
          viewer: { isAuthor: true, canEdit: true, canDelete: true, canReply: true }
        }
      };
    }
    m = /^\/v2\/public\/comments\/([^/]+)\/revisions$/.exec(path);
    if (m && method === 'POST') {
      var knownDepth = made[decodeURIComponent(m[1])];
      return {
        status: 200,
        body: {
          id: decodeURIComponent(m[1]),
          parentId: null,
          depth: knownDepth ? knownDepth.depth : 0,
          state: 'VISIBLE',
          author: readerView(),
          body: body && typeof body.body === 'string' ? body.body : '',
          createdAt: new Date().toISOString(),
          editedAt: new Date().toISOString(),
          replies: [],
          moreReplies: false,
          viewer: { isAuthor: true, canEdit: true, canDelete: true, canReply: true }
        }
      };
    }
    if (/^\/v2\/public\/comments\/[^/]+$/.test(path) && method === 'DELETE') {
      return { status: 204, body: null };
    }
    if (/^\/v2\/public\/comments\/[^/]+\/(reports|appeals)$/.test(path) && method === 'POST') {
      return { status: 201, body: {} };
    }
    m = /^\/v2\/public\/publications\/([^/]+)\/authors\/([^/]+)\/follow$/.exec(path);
    if (m) {
      var author = decodeURIComponent(m[2]);
      if (method === 'PUT') follows[author] = true;
      else if (method === 'DELETE') follows[author] = false;
      return { status: 200, body: { following: follows[author] === true } };
    }
    if (/^\/v2\/public\/publications\/[^/]+\/newsletter-subscriptions$/.test(path) && method === 'POST') {
      return { status: 202, body: {} };
    }
    if (/^\/v2\/public\/publications\/[^/]+\/contact-messages$/.test(path) && method === 'POST') {
      return { status: 202, body: {} };
    }
    if (path === '/v2/reader/tokens/current' && method === 'DELETE') {
      return { status: 204, body: null };
    }
    if (path === '/v2/reader/tokens' && method === 'POST') {
      return problem(400, 'SIGN_IN_UNAVAILABLE');
    }
    if (method === 'GET') return problem(404, 'NOT_FOUND');
    // Any other write: accepted, nothing kept.
    return { status: 204, body: null };
  }
  // A read that carries the signed-in reader's own state, never fetched.
  function isReaderState(path) {
    return /\/authors\/[^/]+\/follow$/.test(path);
  }
  function jsonResponse(result) {
    var empty = result.body === null || result.status === 204;
    return new Response(empty ? null : JSON.stringify(result.body), {
      status: result.status,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  function noteInteractions(url, response) {
    if (!/\/contents\/[^/]+\/interactions$/.test(url.pathname)) return;
    try {
      response
        .clone()
        .json()
        .then(function (view) {
          var items = view && view.reactions && view.reactions.items;
          (items || []).forEach(function (item) {
            if (item && item.count && typeof item.count.lowerBound === 'number') {
              reactionBase[item.key] = item.count.lowerBound;
            }
          });
        })
        .catch(function () {});
    } catch (error) {}
  }
  function searchResponse() {
    return new Response(cfg.searchIndex || '{"documents":[]}', {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  function isSearchIndex(url) {
    var button = D.querySelector('[data-action="search"]');
    var declared = button && button.getAttribute('data-search-index');
    if (declared) {
      try {
        if (new URL(declared, D.baseURI).href === url.href) return true;
      } catch (error) {}
    }
    return /\/search-index\.json$/.test(url.pathname);
  }
  function wait(ms, value) {
    return new Promise(function (resolve) {
      setTimeout(function () {
        resolve(value);
      }, ms);
    });
  }
  // One request, any API: resolves to a Response, never touches the network
  // unless it is a GET of a public read path of the API origin.
  function handle(method, rawUrl, bodyText, signal) {
    var url = null;
    try {
      url = new URL(String(rawUrl), D.baseURI);
    } catch (error) {}
    method = String(method || 'GET').toUpperCase();
    if (!url) return Promise.resolve(jsonResponse(problem(400, 'BAD_URL')));
    if (method === 'GET' && isSearchIndex(url)) {
      return wait(20).then(searchResponse);
    }
    if (
      method === 'GET' &&
      realFetch &&
      url.origin === API_ORIGIN &&
      url.pathname.indexOf(PUBLIC) === 0 &&
      !isReaderState(url.pathname)
    ) {
      return realFetch(url.href, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        headers: { Accept: 'application/json' },
        signal: signal || undefined
      }).then(function (response) {
        noteInteractions(url, response);
        return response;
      });
    }
    var body = null;
    if (typeof bodyText === 'string' && bodyText) {
      try {
        body = JSON.parse(bodyText);
      } catch (error) {}
    }
    var path = url.origin === API_ORIGIN ? url.pathname : '/unknown' + url.pathname;
    var result = simulate(method, path, body);
    if (method !== 'GET') toast(msg.notSaved);
    return wait(120).then(function () {
      return jsonResponse(result);
    });
  }
  function bodyTextOf(body) {
    if (typeof body === 'string') return body;
    if (body && typeof body.toString === 'function' && body instanceof URLSearchParams) {
      return body.toString();
    }
    return '';
  }

  if (realFetch) {
    W.fetch = function (input, init) {
      init = init || {};
      var request = typeof Request !== 'undefined' && input instanceof Request ? input : null;
      var method = init.method || (request ? request.method : 'GET');
      var url = request ? request.url : input && input.href ? input.href : String(input);
      var signal = init.signal || (request ? request.signal : null);
      if (init.body !== undefined && init.body !== null) {
        return handle(method, url, bodyTextOf(init.body), signal);
      }
      if (request && String(method).toUpperCase() !== 'GET' && String(method).toUpperCase() !== 'HEAD') {
        return request
          .clone()
          .text()
          .then(
            function (text) {
              return handle(method, url, text, signal);
            },
            function () {
              return handle(method, url, '', signal);
            }
          );
      }
      return handle(method, url, '', signal);
    };
  }

  // XMLHttpRequest: the same pipeline, with the same events.
  var XHR = function () {
    this.readyState = 0;
    this.status = 0;
    this.statusText = '';
    this.responseText = '';
    this.response = null;
    this.responseType = '';
    this.responseURL = '';
    this.timeout = 0;
    this.withCredentials = false;
    this._listeners = {};
    this._headers = {};
    this._done = false;
  };
  XHR.UNSENT = 0;
  XHR.OPENED = 1;
  XHR.HEADERS_RECEIVED = 2;
  XHR.LOADING = 3;
  XHR.DONE = 4;
  XHR.prototype.UNSENT = 0;
  XHR.prototype.OPENED = 1;
  XHR.prototype.HEADERS_RECEIVED = 2;
  XHR.prototype.LOADING = 3;
  XHR.prototype.DONE = 4;
  XHR.prototype.addEventListener = function (type, listener) {
    (this._listeners[type] = this._listeners[type] || []).push(listener);
  };
  XHR.prototype.removeEventListener = function (type, listener) {
    this._listeners[type] = (this._listeners[type] || []).filter(function (l) {
      return l !== listener;
    });
  };
  XHR.prototype._fire = function (type) {
    var event = { type: type, target: this, currentTarget: this };
    var handler = this['on' + type];
    if (typeof handler === 'function') {
      try {
        handler.call(this, event);
      } catch (error) {}
    }
    (this._listeners[type] || []).slice().forEach(function (listener) {
      try {
        if (typeof listener === 'function') listener.call(this, event);
        else if (listener && typeof listener.handleEvent === 'function') listener.handleEvent(event);
      } catch (error) {}
    }, this);
  };
  XHR.prototype.open = function (method, url) {
    this._method = method;
    this._url = url;
    this.readyState = 1;
    this._fire('readystatechange');
  };
  XHR.prototype.setRequestHeader = function (name, value) {
    this._headers[String(name).toLowerCase()] = String(value);
  };
  XHR.prototype.overrideMimeType = function () {};
  XHR.prototype.getResponseHeader = function (name) {
    return String(name).toLowerCase() === 'content-type' && this.readyState === 4
      ? 'application/json'
      : null;
  };
  XHR.prototype.getAllResponseHeaders = function () {
    return this.readyState === 4 ? 'content-type: application/json\r\n' : '';
  };
  XHR.prototype.abort = function () {
    if (this._done) return;
    this._done = true;
    this.readyState = 0;
    this._fire('abort');
    this._fire('loadend');
  };
  XHR.prototype.send = function (body) {
    var self = this;
    handle(this._method, this._url, bodyTextOf(body), null).then(
      function (response) {
        if (self._done) return;
        return response.text().then(function (text) {
          self._done = true;
          self.status = response.status;
          self.statusText = response.statusText || '';
          self.responseURL = String(self._url);
          self.responseText = text;
          if (self.responseType === 'json') {
            try {
              self.response = JSON.parse(text);
            } catch (error) {
              self.response = null;
            }
          } else {
            self.response = text;
          }
          self.readyState = 4;
          self._fire('readystatechange');
          self._fire('load');
          self._fire('loadend');
        });
      },
      function () {
        if (self._done) return;
        self._done = true;
        self.readyState = 4;
        self._fire('readystatechange');
        self._fire('error');
        self._fire('loadend');
      }
    );
  };
  if (typeof W.XMLHttpRequest === 'function') W.XMLHttpRequest = XHR;

  try {
    W.navigator.sendBeacon = function () {
      toast(msg.notSaved);
      return true;
    };
  } catch (error) {}

  // ---- links: keep the built hrefs, never navigate the frame ----
  function openOut(url) {
    try {
      W.open(url, '_blank', 'noopener');
    } catch (error) {}
  }
  function liveUrlFor(url) {
    if (!cfg.liveBaseUrl) return null;
    var live;
    var base;
    try {
      live = new URL(cfg.liveBaseUrl);
      base = new URL(cfg.siteBase);
    } catch (error) {
      return null;
    }
    var basePath = base.pathname.charAt(base.pathname.length - 1) === '/' ? base.pathname : base.pathname + '/';
    var livePath = live.pathname.charAt(live.pathname.length - 1) === '/' ? live.pathname : live.pathname + '/';
    var rest = url.pathname.indexOf(basePath) === 0 ? url.pathname.slice(basePath.length) : url.pathname.replace(/^\//, '');
    return live.origin + livePath + rest + url.search + url.hash;
  }
  function jump(fragment) {
    var id = fragment;
    try {
      id = decodeURIComponent(fragment);
    } catch (error) {}
    var target = id ? D.getElementById(id) || D.getElementsByName(id)[0] : null;
    if (!id || id.toLowerCase() === 'top') {
      W.scrollTo(0, 0);
      return;
    }
    if (target) {
      try {
        target.scrollIntoView({ block: 'start' });
      } catch (error) {}
      if (!/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(target.tagName) && !target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
      }
      try {
        target.focus({ preventScroll: true });
      } catch (error) {}
    }
  }
  function route(anchor) {
    var raw = (anchor.getAttribute('href') || '').trim();
    if (!raw) return;
    if (raw.charAt(0) === '#') {
      jump(raw.slice(1));
      return;
    }
    var url;
    try {
      url = new URL(raw, cfg.siteBase);
    } catch (error) {
      return;
    }
    if (url.protocol === 'mailto:') {
      openOut(url.href);
      return;
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
    if (url.origin === SITE_ORIGIN) {
      var live = liveUrlFor(url);
      if (live) openOut(live);
      else toast(msg.notPublished);
      return;
    }
    openOut(url.href);
  }
  function onLink(event) {
    var node = event.target;
    var anchor = node && node.closest ? node.closest('a[href], area[href]') : null;
    if (!anchor) return;
    event.preventDefault();
    if (event.type === 'auxclick' && event.button !== 1) return;
    route(anchor);
  }
  D.addEventListener('click', onLink, true);
  D.addEventListener('auxclick', onLink, true);
  // The search dialog opens its first hit with Enter by assigning location;
  // do it through the link route instead.
  D.addEventListener(
    'keydown',
    function (event) {
      var target = event.target;
      if (event.key !== 'Enter' || !target || !target.classList || !target.classList.contains('g-search-input')) return;
      var hit = D.querySelector('#gala-search-results [aria-selected="true"]') || D.querySelector('#gala-search-results a');
      event.preventDefault();
      event.stopPropagation();
      if (hit) route(hit);
    },
    true
  );
  D.addEventListener(
    'submit',
    function (event) {
      event.preventDefault();
    },
    true
  );
  // The frame cannot submit forms (no allow-forms): the browser would drop a
  // submit button's click before any submit event. Fire the submit event the
  // page's scripts listen for ourselves; nothing is ever submitted.
  D.addEventListener(
    'click',
    function (event) {
      var node = event.target;
      var control = node && node.closest ? node.closest('button, input[type="submit"], input[type="image"]') : null;
      if (!control || !control.form || control.disabled) return;
      var type = (control.getAttribute('type') || 'submit').toLowerCase();
      if (type !== 'submit' && type !== 'image') return;
      event.preventDefault();
      try {
        control.form.dispatchEvent(
          new SubmitEvent('submit', { bubbles: true, cancelable: true, submitter: control })
        );
      } catch (error) {}
    },
    true
  );
  // Sign-in is a navigation to the App; a reload would lose the preview.
  D.addEventListener(
    'gala:navigate',
    function (event) {
      event.preventDefault();
      toast(msg.signInUnavailable);
    },
    true
  );
  D.addEventListener(
    'gala:reload',
    function (event) {
      event.preventDefault();
    },
    true
  );

  // ---- no external script is ever injected (analytics providers included) ----
  try {
    var scriptSrc = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src');
    Object.defineProperty(HTMLScriptElement.prototype, 'src', {
      configurable: true,
      enumerable: scriptSrc ? scriptSrc.enumerable : true,
      get: scriptSrc ? scriptSrc.get : undefined,
      set: function () {}
    });
    HTMLScriptElement.prototype.setAttribute = function (name, value) {
      if (String(name).toLowerCase() === 'src') return;
      return Element.prototype.setAttribute.call(this, name, value);
    };
  } catch (error) {}

  // ---- Listen: audio comes from the live site, else a quiet notice ----
  function audioNotice(element) {
    setTimeout(function () {
      var card = element.closest ? element.closest('aside') : null;
      var status = (card || D).querySelector('[data-gala-listen-slot="status"]');
      if (status) status.textContent = msg.audioUnavailable;
    }, 150);
  }
  function audioUrl(value) {
    if (/^(data|blob):/i.test(value)) return value;
    var url;
    try {
      url = new URL(value, cfg.siteBase);
    } catch (error) {
      return null;
    }
    if (url.origin === SITE_ORIGIN) return liveUrlFor(url);
    try {
      return cfg.liveBaseUrl && url.origin === new URL(cfg.liveBaseUrl).origin ? url.href : null;
    } catch (error) {
      return null;
    }
  }
  try {
    var mediaSrc = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'src');
    if (mediaSrc && mediaSrc.set) {
      Object.defineProperty(HTMLMediaElement.prototype, 'src', {
        configurable: true,
        enumerable: mediaSrc.enumerable,
        get: mediaSrc.get,
        set: function (value) {
          var resolved = audioUrl(String(value));
          if (resolved === null) {
            audioNotice(this);
            return;
          }
          mediaSrc.set.call(this, resolved);
        }
      });
    }
  } catch (error) {}
  D.addEventListener(
    'error',
    function (event) {
      var target = event.target;
      if (target && target.tagName === 'AUDIO') audioNotice(target);
    },
    true
  );

  // ---- the copy-link button copies the page's address, not the frame's ----
  try {
    if (W.navigator.clipboard && typeof W.navigator.clipboard.writeText === 'function') {
      var writeText = W.navigator.clipboard.writeText.bind(W.navigator.clipboard);
      W.navigator.clipboard.writeText = function (text) {
        if (String(text) === W.location.href) {
          var canonical = D.querySelector('link[rel="canonical"]');
          if (canonical && canonical.href) text = canonical.href;
        }
        return writeText(text);
      };
    }
  } catch (error) {}

  // ---- scroll: tell the parent, restore the saved position once ----
  var reporting = !(cfg.scrollY > 0);
  var lastPost = 0;
  var pending = 0;
  function post() {
    pending = 0;
    lastPost = Date.now();
    try {
      W.parent.postMessage({ type: 'gala-preview-scroll', y: Math.round(W.scrollY) }, '*');
    } catch (error) {}
  }
  W.addEventListener(
    'scroll',
    function () {
      if (!reporting) return;
      var wait = 100 - (Date.now() - lastPost);
      if (wait <= 0) post();
      else if (!pending) pending = setTimeout(post, wait);
    },
    { passive: true }
  );
  if (cfg.scrollY > 0) {
    var restored = false;
    var restore = function () {
      if (restored) return;
      restored = true;
      W.requestAnimationFrame(function () {
        W.scrollTo(0, cfg.scrollY);
        reporting = true;
      });
    };
    var settle = function () {
      var waits = [];
      if (D.fonts && D.fonts.ready) waits.push(D.fonts.ready);
      Array.prototype.forEach.call(D.images, function (image) {
        if (!image.complete) {
          waits.push(
            new Promise(function (resolve) {
              image.addEventListener('load', resolve, { once: true });
              image.addEventListener('error', resolve, { once: true });
            })
          );
        }
      });
      Promise.all(waits).then(restore, restore);
      setTimeout(restore, 3000);
    };
    if (D.readyState === 'complete') settle();
    else W.addEventListener('load', settle);
  }
})();
`;
