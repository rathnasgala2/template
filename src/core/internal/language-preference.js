/**
 * The remembered-language script: an external same-origin file (CSP
 * `script-src 'self'`) emitted only when the build has at least one language
 * section, as `assets/gala-language-v1.js`. A click on a language chip stores
 * that chip's `lang` under one `localStorage` key (the only writer); every
 * page then, as the blocking script runs in `<head>` after the hreflang
 * alternates, replaces its location with the same-origin alternate in the
 * stored language. Every storage access is guarded and every failure is
 * swallowed; with JavaScript off the site is unchanged.
 */

import { minifyScript } from './appearance/minify-script.js';

/** @type {string} the emitted script's output-relative path */
export const LANGUAGE_SCRIPT_PATH = 'assets/gala-language-v1.js';

/** @type {string} */
export const LANGUAGE_SCRIPT_MEDIA_TYPE =
  'application/javascript; charset=utf-8';

/** @type {string} the `localStorage` key holding the reader's language */
export const LANGUAGE_STORAGE_KEY = 'gala:language:v1';

/** @type {string} the `sessionStorage` key holding the last redirect target */
export const LANGUAGE_REDIRECT_KEY = 'gala:language:redirect:v1';

const READABLE_SCRIPT_SOURCE = String.raw`(function () {
  var K = ${JSON.stringify(LANGUAGE_STORAGE_KEY)};
  var M = ${JSON.stringify(LANGUAGE_REDIRECT_KEY)};
  var d = document;
  var l = location;
  function f(v) {
    return String(v || '').toLowerCase();
  }
  function s(e) {
    try {
      var c = e.target.closest('a.g-lang-chip');
      var v = c && c.getAttribute('lang');
      if (v) localStorage.setItem(K, v);
    } catch (x) {}
  }
  try {
    d.addEventListener('click', s, true);
    d.addEventListener('auxclick', s, true);
  } catch (x) {}
  try {
    var p = f(localStorage.getItem(K));
    if (!p || p === f(d.documentElement.lang)) {
      sessionStorage.removeItem(M);
      return;
    }
    var a = d.querySelectorAll('link[rel="alternate"][hreflang]');
    for (var i = 0; i < a.length; i++) {
      if (a[i].hasAttribute('type') || f(a[i].getAttribute('hreflang')) !== p) continue;
      var u = new URL(a[i].getAttribute('href'), l.href);
      if (p === 'x-default' || u.origin !== l.origin || u.pathname === l.pathname) return;
      if (sessionStorage.getItem(M) === u.pathname) return;
      sessionStorage.setItem(M, u.pathname);
      l.replace(u.pathname + l.search + l.hash);
      return;
    }
  } catch (x) {}
})();
`;

/** @type {string} the exact emitted script text */
export const LANGUAGE_SCRIPT_SOURCE = minifyScript(READABLE_SCRIPT_SOURCE);

/** @type {string} the unminified source, for tests */
export const LANGUAGE_SCRIPT_READABLE_SOURCE = READABLE_SCRIPT_SOURCE;
