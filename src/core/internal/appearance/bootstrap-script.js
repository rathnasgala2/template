/**
 * The exact deterministic site script: the one and only browser script this
 * renderer ever emits, an external same-origin file (CSP `script-src 'self'`)
 * that touches no cookie, account or tracking identifier and no storage key
 * other than the two namespaced ones named below. Every page is fully
 * readable and navigable with JavaScript off; this script only enhances.
 *
 * Two independent phases inside the one file:
 *
 * 1. A synchronous, top-level phase that runs when this blocking
 *    (non-`defer`/`async`/`module`) `<script src>` executes in `<head>`,
 *    before `<body>` is parsed and so before any themed paint: it resolves
 *    the stored colour-mode selection (or `system`) against
 *    `prefers-color-scheme` and sets the two root attributes, subscribes to
 *    live system-preference changes (applied only while the selection is
 *    `system`), and registers the cross-document view-transition listeners
 *    (`pageswap` / `pagereveal` fire before `DOMContentLoaded`). It never
 *    mutates `documentElement.style`, so it can never hide the document.
 * 2. A `DOMContentLoaded` phase of independent enhancements, each wrapped in
 *    its own try/catch and each a no-op when its server-rendered markup is
 *    missing: the colour-mode toggle (system, light, dark, with a circular
 *    reveal via a same-document view transition), the search dialog (lazy
 *    `fetch` of the static index named by `data-search-index`; `/` and
 *    Ctrl/Cmd+K; arrow keys and Enter), code blocks (language label and Copy
 *    button), contents highlighting (IntersectionObserver on `data-toc`),
 *    the share group (copy link, bookmark in `localStorage`), and a
 *    reading-progress fallback where scroll-driven animations are
 *    unsupported.
 *
 * Security: every piece of text the script puts in the DOM is assigned with
 * `textContent` or `setAttribute`; fetched search data is never parsed as
 * HTML. The only `innerHTML` assignments are the script's own constant icon
 * path strings. Localized strings are never embedded here: they are read
 * from `data-*` attributes the server renders on `.g-toast` and on the
 * toggle button.
 *
 * Every name and value below is read from `internal/appearance/contract.js`,
 * the one module that owns them, so the server-rendered markup and this
 * script can never drift apart on a literal.
 */

import {
  APPEARANCE_MODE_DARK,
  APPEARANCE_MODE_LIGHT,
  APPEARANCE_MODE_SYSTEM,
  APPEARANCE_RESOLVED_MODE_ATTRIBUTE,
  APPEARANCE_SELECTION_ATTRIBUTE,
  APPEARANCE_TOGGLE_ID,
  APPEARANCE_STORAGE_KEY,
} from './contract.js';

/** @type {string} the `localStorage` key holding saved article paths. */
export const SAVED_STORAGE_KEY = 'gala:saved:v1';

/**
 * The exact script source, byte-for-byte deterministic across builds: every
 * interpolated value is a fixed literal from `contract.js`.
 *
 * @type {string}
 */
export const APPEARANCE_BOOTSTRAP_SCRIPT_SOURCE = String.raw`(function () {
  'use strict';
  var STORAGE_KEY = ${JSON.stringify(APPEARANCE_STORAGE_KEY)};
  var SAVED_KEY = ${JSON.stringify(SAVED_STORAGE_KEY)};
  var RESOLVED_ATTRIBUTE = ${JSON.stringify(APPEARANCE_RESOLVED_MODE_ATTRIBUTE)};
  var SELECTION_ATTRIBUTE = ${JSON.stringify(APPEARANCE_SELECTION_ATTRIBUTE)};
  var TOGGLE_ID = ${JSON.stringify(APPEARANCE_TOGGLE_ID)};
  var MODE_LIGHT = ${JSON.stringify(APPEARANCE_MODE_LIGHT)};
  var MODE_DARK = ${JSON.stringify(APPEARANCE_MODE_DARK)};
  var MODE_SYSTEM = ${JSON.stringify(APPEARANCE_MODE_SYSTEM)};
  var root = document.documentElement;
  var NS = 'http://www.w3.org/2000/svg';

  function isKnownMode(value) {
    return value === MODE_LIGHT || value === MODE_DARK || value === MODE_SYSTEM;
  }
  function readStoredSelection() {
    try {
      var value = window.localStorage.getItem(STORAGE_KEY);
      if (isKnownMode(value)) return value;
    } catch (error) {
      // Storage blocked: fall back to MODE_SYSTEM below.
    }
    return MODE_SYSTEM;
  }
  function writeStoredSelection(mode) {
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch (error) {
      // Storage blocked: the choice simply does not persist.
    }
  }
  function matches(query) {
    try {
      return !!(window.matchMedia && window.matchMedia(query).matches);
    } catch (error) {
      return false;
    }
  }
  function resolveMode(selection) {
    if (selection === MODE_LIGHT || selection === MODE_DARK) return selection;
    return matches('(prefers-color-scheme: dark)') ? MODE_DARK : MODE_LIGHT;
  }
  function applySelection(selection) {
    root.setAttribute(SELECTION_ATTRIBUTE, selection);
    root.setAttribute(RESOLVED_ATTRIBUTE, resolveMode(selection));
  }
  function reducedMotion() {
    return matches('(prefers-reduced-motion: reduce)');
  }

  // Phase 1 (synchronous, pre-paint): resolve and apply immediately.
  applySelection(readStoredSelection());

  if (window.matchMedia) {
    try {
      var media = window.matchMedia('(prefers-color-scheme: dark)');
      var onSystemChange = function () {
        if (readStoredSelection() === MODE_SYSTEM) applySelection(MODE_SYSTEM);
      };
      if (typeof media.addEventListener === 'function') {
        media.addEventListener('change', onSystemChange);
      } else if (typeof media.addListener === 'function') {
        media.addListener(onSystemChange);
      }
    } catch (error) {
      // No live subscription: the resolved mode stays static until next load.
    }
  }

  // ---- shared helpers ----
  function make(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function svg(paths) {
    var node = document.createElementNS(NS, 'svg');
    node.setAttribute('class', 'g-icon');
    node.setAttribute('viewBox', '0 0 24 24');
    node.setAttribute('aria-hidden', 'true');
    node.setAttribute('focusable', 'false');
    node.innerHTML = paths;
    return node;
  }
  var ICON_SEARCH = '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>';
  var ICON_ARROW = '<path d="M5 12h14M13 6l6 6-6 6"/>';
  var ICON_COPY = '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>';
  var ICON_CHECK = '<path d="m5 12 5 5 9-10"/>';
  var toast = null;
  var toastTimer = 0;
  function text(name, fallback) {
    return (toast && toast.getAttribute('data-' + name)) || fallback;
  }
  function say(message, tone) {
    if (!toast) return;
    toast.textContent = message;
    toast.setAttribute('data-tone', tone || 'info');
    toast.setAttribute('data-show', '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.removeAttribute('data-show');
    }, 2200);
  }
  function inView(node) {
    var rect = node.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < window.innerHeight;
  }
  function resolveUrl(href) {
    try {
      return new URL(href, window.location.href).href;
    } catch (error) {
      return '';
    }
  }
  function writeClipboard(value) {
    if (!(navigator.clipboard && navigator.clipboard.writeText)) {
      return Promise.reject(new Error('no clipboard'));
    }
    return navigator.clipboard.writeText(value);
  }

  // ---- cross-document cover morph (fires before DOMContentLoaded) ----
  function cardImageFor(url) {
    var links = document.querySelectorAll('.g-card-link, .g-hero-media');
    for (var i = 0; i < links.length; i += 1) {
      if (resolveUrl(links[i].getAttribute('href')) !== url) continue;
      var holder = links[i].closest('.g-card') || links[i];
      var image = holder.querySelector('img');
      if (image && inView(image)) return image;
    }
    return null;
  }
  function nameCover(node, transition) {
    if (!node) return;
    node.style.viewTransitionName = 'gala-cover';
    var clear = function () {
      node.style.viewTransitionName = '';
    };
    transition.finished.then(clear, clear);
  }
  window.addEventListener('pageswap', function (event) {
    try {
      if (!event.viewTransition) return;
      var entry = event.activation && event.activation.entry;
      var target = entry ? entry.url : '';
      var cover = document.querySelector('.g-article-cover img');
      nameCover(
        (target && cardImageFor(target)) || (cover && inView(cover) ? cover : null),
        event.viewTransition
      );
    } catch (error) {
      // Cosmetic only.
    }
  });
  window.addEventListener('pagereveal', function (event) {
    try {
      if (!event.viewTransition) return;
      var cover = document.querySelector('.g-article-cover img');
      var from = window.navigation && window.navigation.activation && window.navigation.activation.from;
      nameCover(cover || (from && cardImageFor(from.url)), event.viewTransition);
    } catch (error) {
      // Cosmetic only.
    }
  });

  // ---- phase 2 enhancements ----
  function enhanceMode() {
    var button = document.getElementById(TOGGLE_ID);
    if (!button) return;
    var order = [MODE_SYSTEM, MODE_LIGHT, MODE_DARK];
    var sync = function () {
      var label = button.getAttribute('data-label-' + readStoredSelection());
      if (label) {
        button.setAttribute('aria-label', label);
        button.setAttribute('title', label);
      }
    };
    button.hidden = false;
    sync();
    button.addEventListener('click', function () {
      var next = order[(order.indexOf(readStoredSelection()) + 1) % order.length];
      var apply = function () {
        writeStoredSelection(next);
        applySelection(next);
        sync();
      };
      if (
        resolveMode(next) === root.getAttribute(RESOLVED_ATTRIBUTE) ||
        typeof document.startViewTransition !== 'function' ||
        reducedMotion()
      ) {
        apply();
        return;
      }
      var rect = button.getBoundingClientRect();
      var x = rect.left + rect.width / 2;
      var y = rect.top + rect.height / 2;
      var radius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );
      root.classList.add('g-vt-reveal');
      var transition = document.startViewTransition(apply);
      var done = function () {
        root.classList.remove('g-vt-reveal');
      };
      transition.ready
        .then(function () {
          root.animate(
            { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + radius + 'px at ' + x + 'px ' + y + 'px)'] },
            { duration: 650, easing: 'cubic-bezier(.2,.8,.2,1)', pseudoElement: '::view-transition-new(root)' }
          );
        })
        .catch(function () {});
      transition.finished.then(done, done);
    });
  }

  function enhanceSearch() {
    var button = document.querySelector('[data-action="search"]');
    var indexUrl = button && button.getAttribute('data-search-index');
    if (!button || !indexUrl || !window.fetch || typeof HTMLDialogElement === 'undefined') return;
    var dialog = null;
    var input = null;
    var list = null;
    var documents = null;
    var loading = null;
    var options = [];
    var selected = -1;

    var kbd = make('kbd', 'g-kbd', '/');
    button.appendChild(kbd);
    button.hidden = false;

    function load() {
      if (!loading) {
        loading = window
          .fetch(indexUrl, { credentials: 'same-origin' })
          .then(function (response) {
            if (!response.ok) throw new Error('index');
            return response.json();
          })
          .then(function (data) {
            documents = (data && Array.isArray(data.documents) ? data.documents : []).filter(function (doc) {
              return doc && typeof doc.title === 'string' && typeof doc.route === 'string';
            });
          })
          .catch(function () {
            documents = null;
            loading = null;
          });
      }
      return loading;
    }
    function field(doc, name) {
      var value = doc[name];
      if (Array.isArray(value)) value = value.join(' ');
      return typeof value === 'string' ? value.toLowerCase() : '';
    }
    function search(query) {
      var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
      var scored = [];
      documents.forEach(function (doc) {
        var total = 0;
        for (var i = 0; i < terms.length; i += 1) {
          var term = terms[i];
          var score =
            (field(doc, 'title').indexOf(term) !== -1 ? 8 : 0) +
            (field(doc, 'tags').indexOf(term) !== -1 ? 4 : 0) +
            (field(doc, 'description').indexOf(term) !== -1 ? 2 : 0) +
            (field(doc, 'excerpt').indexOf(term) !== -1 ? 1 : 0);
          if (score === 0) return;
          total += score;
        }
        scored.push({ doc: doc, score: total });
      });
      scored.sort(function (a, b) {
        if (b.score !== a.score) return b.score - a.score;
        return String(b.doc.publishedAt || '').localeCompare(String(a.doc.publishedAt || ''));
      });
      return scored.slice(0, 8).map(function (entry) {
        return entry.doc;
      });
    }
    function pathOf(route) {
      var url = resolveUrl(route);
      if (!/^https?:/.test(url)) return '';
      var parsed = new URL(url);
      return parsed.pathname + parsed.search + parsed.hash;
    }
    function select(index) {
      selected = index;
      options.forEach(function (option, i) {
        option.setAttribute('aria-selected', String(i === index));
      });
      if (options[index]) {
        input.setAttribute('aria-activedescendant', options[index].id);
        options[index].scrollIntoView({ block: 'nearest' });
      } else {
        input.removeAttribute('aria-activedescendant');
      }
    }
    function show(results, emptyKey, emptyFallback) {
      list.textContent = '';
      options = [];
      results.forEach(function (doc, index) {
        var path = pathOf(doc.route);
        if (!path) return;
        var item = make('li');
        item.setAttribute('role', 'option');
        item.id = 'gala-search-hit-' + index;
        var link = make('a', 'g-search-hit');
        link.setAttribute('href', path);
        var body = make('span', 'g-search-hit-text');
        body.appendChild(make('span', 'g-search-hit-title', doc.title));
        var meta = Array.isArray(doc.tags) && doc.tags.length ? doc.tags.join(', ') : '';
        meta = [meta, typeof doc.description === 'string' ? doc.description : ''].filter(Boolean).join(' - ');
        if (meta) body.appendChild(make('span', 'g-search-hit-meta', meta));
        link.appendChild(body);
        link.appendChild(svg(ICON_ARROW));
        item.appendChild(link);
        list.appendChild(item);
        options.push(item);
      });
      if (options.length === 0) {
        list.appendChild(make('li', 'g-search-empty', text(emptyKey, emptyFallback)));
      }
      select(options.length ? 0 : -1);
    }
    function update() {
      if (!documents) {
        show([], 'search-unavailable', 'Search is unavailable right now.');
        return;
      }
      var query = input.value.trim();
      var results = query
        ? search(query)
        : documents.slice().sort(function (a, b) {
            return String(b.publishedAt || '').localeCompare(String(a.publishedAt || ''));
          }).slice(0, 6);
      show(results, 'search-empty', 'No articles match your search.');
    }
    function build() {
      dialog = make('dialog', 'g-search');
      dialog.setAttribute('aria-label', text('search-label', 'Search'));
      var box = make('div', 'g-search-box');
      box.appendChild(svg(ICON_SEARCH));
      input = make('input', 'g-search-input');
      input.type = 'search';
      input.setAttribute('autocomplete', 'off');
      input.setAttribute('spellcheck', 'false');
      input.setAttribute('placeholder', text('search-placeholder', 'Search'));
      input.setAttribute('aria-label', text('search-label', 'Search'));
      input.setAttribute('role', 'combobox');
      input.setAttribute('aria-expanded', 'true');
      input.setAttribute('aria-controls', 'gala-search-results');
      box.appendChild(input);
      list = make('ul', 'g-search-results');
      list.id = 'gala-search-results';
      list.setAttribute('role', 'listbox');
      dialog.appendChild(box);
      dialog.appendChild(list);
      document.body.appendChild(dialog);
      input.addEventListener('input', update);
      input.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          if (!options.length) return;
          event.preventDefault();
          var step = event.key === 'ArrowDown' ? 1 : -1;
          select((selected + step + options.length) % options.length);
        } else if (event.key === 'Escape') {
          // A search input would clear its text first; close straight away.
          event.preventDefault();
          dialog.close();
        } else if (event.key === 'Enter') {
          var link = options[Math.max(selected, 0)] && options[Math.max(selected, 0)].querySelector('a');
          if (link) {
            event.preventDefault();
            window.location.assign(link.getAttribute('href'));
          }
        }
      });
      dialog.addEventListener('click', function (event) {
        if (event.target === dialog) dialog.close();
      });
    }
    function open() {
      if (!dialog) build();
      if (dialog.open) return;
      input.value = '';
      dialog.showModal();
      input.focus();
      list.textContent = '';
      load().then(function () {
        if (dialog.open) update();
      });
    }
    button.addEventListener('click', open);
    document.addEventListener('keydown', function (event) {
      var active = document.activeElement;
      var typing = active && (/^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName) || active.isContentEditable);
      if (
        (event.key === '/' && !typing && !event.ctrlKey && !event.metaKey && !event.altKey) ||
        ((event.metaKey || event.ctrlKey) && String(event.key).toLowerCase() === 'k')
      ) {
        event.preventDefault();
        open();
      }
    });
  }

  function enhanceCode() {
    var blocks = document.querySelectorAll('pre[class*="language-"]');
    Array.prototype.forEach.call(blocks, function (pre) {
      if (!pre.parentNode || pre.parentNode.classList.contains('g-codeblock')) return;
      var match = /language-([A-Za-z0-9_+#-]+)/.exec(pre.className);
      var wrapper = make('div', 'g-codeblock');
      var bar = make('div', 'g-codebar');
      if (match) bar.appendChild(make('span', 'g-codebar-lang', match[1]));
      var copy = make('button', 'g-copy');
      copy.type = 'button';
      var idle = make('span', 'g-copy-idle');
      idle.appendChild(svg(ICON_COPY));
      idle.appendChild(document.createTextNode(' ' + text('copy', 'Copy')));
      var done = make('span', 'g-copy-done');
      done.appendChild(svg(ICON_CHECK));
      done.appendChild(document.createTextNode(' ' + text('copied', 'Copied')));
      copy.appendChild(idle);
      copy.appendChild(done);
      bar.appendChild(copy);
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(bar);
      wrapper.appendChild(pre);
      copy.addEventListener('click', function () {
        var code = pre.querySelector('code') || pre;
        writeClipboard(code.textContent).then(
          function () {
            copy.setAttribute('data-copied', '');
            setTimeout(function () {
              copy.removeAttribute('data-copied');
            }, 1600);
          },
          function () {
            var selection = window.getSelection();
            var range = document.createRange();
            range.selectNodeContents(code);
            selection.removeAllRanges();
            selection.addRange(range);
            say(text('code-selected', 'Code selected.'), 'warning');
          }
        );
      });
    });
  }

  function enhanceContents() {
    var links = document.querySelectorAll('[data-toc]');
    if (!links.length) return;
    Array.prototype.forEach.call(links, function (link) {
      link.addEventListener('click', function () {
        var details = link.closest('details');
        if (details) details.open = false;
      });
    });
    if (!('IntersectionObserver' in window)) return;
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          Array.prototype.forEach.call(links, function (link) {
            link.setAttribute('aria-current', String(link.getAttribute('data-toc') === entry.target.id));
          });
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );
    var seen = {};
    Array.prototype.forEach.call(links, function (link) {
      var id = link.getAttribute('data-toc');
      var heading = id && !seen[id] ? document.getElementById(id) : null;
      if (heading) {
        seen[id] = true;
        observer.observe(heading);
      }
    });
  }

  function readSaved() {
    try {
      var value = JSON.parse(window.localStorage.getItem(SAVED_KEY) || '[]');
      return Array.isArray(value) ? value.filter(function (item) { return typeof item === 'string'; }) : [];
    } catch (error) {
      return [];
    }
  }
  function writeSaved(items) {
    try {
      window.localStorage.setItem(SAVED_KEY, JSON.stringify(items.slice(-200)));
    } catch (error) {
      // Storage blocked: the pressed state still toggles for this view.
    }
  }
  function enhanceShare() {
    var group = document.querySelector('.g-share');
    if (!group) return;
    group.hidden = false;
    var path = window.location.pathname;
    var copyLink = group.querySelector('[data-action="copy-link"]');
    var bookmark = group.querySelector('[data-action="bookmark"]');
    if (copyLink) {
      copyLink.addEventListener('click', function () {
        writeClipboard(window.location.href).then(
          function () {
            say(text('link-copied', 'Link copied.'), 'success');
          },
          function () {
            say(text('copy-blocked', 'Copying is blocked here.'), 'warning');
          }
        );
      });
    }
    if (bookmark) {
      bookmark.setAttribute('aria-pressed', String(readSaved().indexOf(path) !== -1));
      bookmark.addEventListener('click', function () {
        var on = bookmark.getAttribute('aria-pressed') !== 'true';
        var items = readSaved().filter(function (item) { return item !== path; });
        if (on) items.push(path);
        writeSaved(items);
        bookmark.setAttribute('aria-pressed', String(on));
        say(on ? text('saved', 'Saved for later.') : text('unsaved', 'Removed.'), 'success');
      });
    }
  }

  function enhanceProgress() {
    var bar = document.querySelector('.g-progress');
    if (!bar) return;
    var supported = !!(window.CSS && CSS.supports && CSS.supports('animation-timeline: scroll()'));
    if (supported && !reducedMotion()) return;
    var frame = 0;
    var paint = function () {
      frame = 0;
      var max = root.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ')';
    };
    window.addEventListener(
      'scroll',
      function () {
        if (!frame) frame = window.requestAnimationFrame(paint);
      },
      { passive: true }
    );
    paint();
  }

  function enhance() {
    toast = document.querySelector('.g-toast');
    [enhanceMode, enhanceSearch, enhanceCode, enhanceContents, enhanceShare, enhanceProgress].forEach(function (step) {
      try {
        step();
      } catch (error) {
        // One failed enhancement never blocks the others.
      }
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhance);
  } else {
    enhance();
  }
})();
`;
