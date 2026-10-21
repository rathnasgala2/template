/**
 * The reader-consent browser script: an external same-origin file (CSP
 * `script-src 'self'` plus the provider's own origin) emitted only when
 * `build-input.modules.analytics` is present, as `assets/gala-consent-v1.js`.
 * Plain ES2020 in one IIFE: no eval, no `new Function`, no cookie set (it only expires Google's own on decline). The
 * reader's choice lives in `localStorage` under `gala.consent.v1` as
 * `{"version":1,"analytics":true|false,"at":"<ISO>"}`; every storage access is
 * guarded, so unavailable storage simply means "no stored choice".
 *
 * Nothing from the provider is requested before the reader accepts. The
 * per-kind loader table (`PROVIDERS`) is the only provider-specific code, so a
 * second provider is one entry there and one in `providers.js`.
 */

import { minifyScript } from '../appearance/minify-script.js';

/** @type {string} the emitted script's output-relative path */
export const CONSENT_SCRIPT_PATH = 'assets/gala-consent-v1.js';

/** @type {string} */
export const CONSENT_SCRIPT_MEDIA_TYPE =
  'application/javascript; charset=utf-8';

/** @type {string} the `localStorage` key holding the reader's choice */
export const CONSENT_STORAGE_KEY = 'gala.consent.v1';

const READABLE_SCRIPT_SOURCE = String.raw`(function () {
  'use strict';
  var STORAGE_KEY = ${JSON.stringify(CONSENT_STORAGE_KEY)};
  var loaded = {};

  // One entry per provider kind. load() runs only after the reader accepts;
  // revoke() runs when a loaded provider is declined later in the session.
  var PROVIDERS = {
    'google-analytics-4': {
      load: function (id) {
        window.dataLayer = window.dataLayer || [];
        if (typeof window.gtag !== 'function') {
          window.gtag = function () {
            window.dataLayer.push(arguments);
          };
        }
        window.gtag('consent', 'default', {
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
          analytics_storage: 'denied'
        });
        window.gtag('consent', 'update', { analytics_storage: 'granted' });
        window.gtag('js', new Date());
        window.gtag('config', id);
        var script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
        document.head.appendChild(script);
      },
      regrant: function () {
        window.gtag('consent', 'update', { analytics_storage: 'granted' });
      },
      revoke: function () {
        window.gtag('consent', 'update', { analytics_storage: 'denied' });
        clearCookies();
      }
    }
  };

  // Best-effort removal of Google's own cookies: _ga and _ga_*, written
  // expired for the path with no domain and for the host and each parent
  // domain down to two labels.
  function clearCookies() {
    try {
      var names = [];
      var parts = document.cookie ? document.cookie.split(';') : [];
      for (var i = 0; i < parts.length; i++) {
        var name = parts[i].split('=')[0].trim();
        if (name === '_ga' || name.indexOf('_ga_') === 0) names.push(name);
      }
      var labels = location.hostname.split('.');
      var domains = [];
      for (var d = 0; labels.length - d >= 2; d++) domains.push(labels.slice(d).join('.'));
      for (var n = 0; n < names.length; n++) {
        var expired = names[n] + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        document.cookie = expired;
        for (var k = 0; k < domains.length; k++) document.cookie = expired + '; domain=' + domains[k];
      }
    } catch (error) {}
  }

  function readChoice() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (parsed && parsed.version === 1 && typeof parsed.analytics === 'boolean') return parsed;
    } catch (error) {}
    return null;
  }

  function writeChoice(analytics) {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: 1, analytics: analytics, at: new Date().toISOString() })
      );
    } catch (error) {}
  }

  function announce(analytics) {
    document.dispatchEvent(new CustomEvent('gala:consent', { detail: { analytics: analytics } }));
  }

  function start() {
    var banner = document.querySelector('[data-gala-consent]');
    if (!banner) return;
    var kind = banner.getAttribute('data-provider-kind');
    var id = banner.getAttribute('data-measurement-id');
    var provider = Object.prototype.hasOwnProperty.call(PROVIDERS, kind) ? PROVIDERS[kind] : null;
    if (!provider || !id) return;

    function show() {
      banner.removeAttribute('hidden');
      banner.focus();
    }
    function hide() {
      banner.setAttribute('hidden', '');
      var opener = document.querySelector('.g-consent-open');
      if (opener && !opener.hasAttribute('hidden')) opener.focus();
    }
    function enable() {
      if (loaded[kind]) provider.regrant();
      else {
        loaded[kind] = true;
        provider.load(id);
      }
    }
    function decide(analytics) {
      writeChoice(analytics);
      hide();
      if (analytics) enable();
      announce(analytics);
      if (!analytics && loaded[kind]) {
        provider.revoke();
        // A loaded provider script keeps pinging until the page is gone;
        // the seam lets tests keep the page.
        var reload = new CustomEvent('gala:reload', { cancelable: true });
        if (document.dispatchEvent(reload)) location.reload();
      }
    }

    var accept = banner.querySelector('.g-consent-accept');
    var decline = banner.querySelector('.g-consent-decline');
    if (accept) accept.addEventListener('click', function () { decide(true); });
    if (decline) decline.addEventListener('click', function () { decide(false); });

    var openers = document.querySelectorAll('.g-consent-open');
    for (var i = 0; i < openers.length; i++) {
      openers[i].removeAttribute('hidden');
      openers[i].addEventListener('click', show);
    }

    var stored = readChoice();
    if (!stored) {
      show();
      return;
    }
    if (stored.analytics) enable();
    announce(stored.analytics);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
`;

/**
 * The shipped script: the readable source minified like the appearance
 * script (comments, indentation and blank lines removed; nothing renamed).
 *
 * @type {string}
 */
export const CONSENT_SCRIPT_SOURCE = minifyScript(READABLE_SCRIPT_SOURCE);
