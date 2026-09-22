/**
 * The exact deterministic pre-paint appearance bootstrap script (brief S2
 * section 3: "a versioned deterministic pre-paint bootstrap owned by
 * `template`/`core` resolves local selection plus system preference and sets
 * the root state before first themed paint. It is covered by the artifact
 * digest, is CSP-compatible under `script-src 'self'` (therefore an external
 * file, not inline), touches no network, account, content or unrelated
 * storage key, and cannot hide the document indefinitely").
 *
 * This is the one and only browser bootstrap S2 ever emits ("Module absence
 * and CSP equality": "the appearance controller is the only browser
 * bootstrap"). Every name and value it embeds is read from
 * `internal/appearance/contract.js`, the one module that owns them, so the
 * server-rendered control markup and this script can never drift apart on a
 * literal.
 *
 * Two independent phases, both inside the same one external file so the
 * template never ships a second script:
 *
 * 1. A synchronous, top-level phase that runs immediately when this
 *    blocking, non-`defer`/non-`async`/non-`module` `<script src>` executes
 *    in `<head>` — before `<body>` is parsed, and so before any themed
 *    paint. It resolves the stored selection (or `system`, gracefully
 *    substituted for a missing/unreadable/invalid stored value — storage
 *    failure never leaves the session unusable) against
 *    `prefers-color-scheme` and sets both root attributes.
 * 2. A `DOMContentLoaded`-deferred phase that wires the server-rendered
 *    `<select>` control's `change` event once `<body>` exists (it cannot run
 *    any earlier: the control has not been parsed yet at phase 1's own
 *    execution point) and subscribes to live `prefers-color-scheme` changes,
 *    updating the resolved attribute only while the current selection is
 *    exactly `system` (brief: "an explicit `light`/`dark` choice is not
 *    overridden by later system changes").
 *
 * Deliberately absent: no `document.documentElement.style` mutation of any
 * kind (in particular, no hide-until-ready visibility toggle — brief:
 * "cannot hide the document indefinitely" — this script never needs one,
 * since it only ever sets attributes, never inline style), no network
 * request, no cookie, no account/tracking identifier, no storage key other
 * than {@link APPEARANCE_STORAGE_KEY}.
 */

import {
  APPEARANCE_MODE_DARK,
  APPEARANCE_MODE_LIGHT,
  APPEARANCE_MODE_SYSTEM,
  APPEARANCE_RESOLVED_MODE_ATTRIBUTE,
  APPEARANCE_SELECTION_ATTRIBUTE,
  APPEARANCE_SELECT_ID,
  APPEARANCE_STORAGE_KEY,
} from './contract.js';

/**
 * The exact bootstrap script source, byte-for-byte deterministic across
 * builds: every interpolated value below is a fixed literal from
 * `contract.js`, never a per-publication or per-build input.
 *
 * @type {string}
 */
export const APPEARANCE_BOOTSTRAP_SCRIPT_SOURCE = `(function () {
  'use strict';
  var STORAGE_KEY = ${JSON.stringify(APPEARANCE_STORAGE_KEY)};
  var RESOLVED_ATTRIBUTE = ${JSON.stringify(APPEARANCE_RESOLVED_MODE_ATTRIBUTE)};
  var SELECTION_ATTRIBUTE = ${JSON.stringify(APPEARANCE_SELECTION_ATTRIBUTE)};
  var SELECT_ID = ${JSON.stringify(APPEARANCE_SELECT_ID)};
  var MODE_LIGHT = ${JSON.stringify(APPEARANCE_MODE_LIGHT)};
  var MODE_DARK = ${JSON.stringify(APPEARANCE_MODE_DARK)};
  var MODE_SYSTEM = ${JSON.stringify(APPEARANCE_MODE_SYSTEM)};

  function isKnownMode(value) {
    return value === MODE_LIGHT || value === MODE_DARK || value === MODE_SYSTEM;
  }

  function readStoredSelection() {
    try {
      var value = window.localStorage.getItem(STORAGE_KEY);
      if (isKnownMode(value)) {
        return value;
      }
    } catch (error) {
      // Storage blocked (private mode, disabled site data, quota): the
      // session stays usable and this load falls back to MODE_SYSTEM below.
    }
    return MODE_SYSTEM;
  }

  function writeStoredSelection(mode) {
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch (error) {
      // Storage blocked: the selection simply does not persist past this
      // load; the visible page state this call site also applies still
      // updates normally.
    }
  }

  function systemPrefersDark() {
    try {
      return !!(
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      );
    } catch (error) {
      return false;
    }
  }

  function resolveMode(selection) {
    if (selection === MODE_LIGHT || selection === MODE_DARK) {
      return selection;
    }
    return systemPrefersDark() ? MODE_DARK : MODE_LIGHT;
  }

  function applySelection(selection) {
    var root = document.documentElement;
    root.setAttribute(SELECTION_ATTRIBUTE, selection);
    root.setAttribute(RESOLVED_ATTRIBUTE, resolveMode(selection));
  }

  // Phase 1 (synchronous, pre-paint): resolve and apply immediately.
  applySelection(readStoredSelection());

  // Live system-preference changes, only while the reader's own selection is
  // still exactly "system" (an explicit light/dark choice is never
  // overridden by a later system change).
  if (window.matchMedia) {
    try {
      var media = window.matchMedia('(prefers-color-scheme: dark)');
      var onSystemChange = function () {
        if (readStoredSelection() === MODE_SYSTEM) {
          applySelection(MODE_SYSTEM);
        }
      };
      if (typeof media.addEventListener === 'function') {
        media.addEventListener('change', onSystemChange);
      } else if (typeof media.addListener === 'function') {
        media.addListener(onSystemChange);
      }
    } catch (error) {
      // No live system-change subscription available: the resolved mode
      // this load already applied simply stays static until next load.
    }
  }

  // Phase 2 (deferred): wire the server-rendered control once it exists.
  document.addEventListener('DOMContentLoaded', function () {
    var select = document.getElementById(SELECT_ID);
    if (!select) return;
    select.value = readStoredSelection();
    select.addEventListener('change', function () {
      var next = select.value;
      if (!isKnownMode(next)) return;
      writeStoredSelection(next);
      applySelection(next);
    });
  });
})();
`;
