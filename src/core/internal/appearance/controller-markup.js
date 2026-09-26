/**
 * The server-rendered Light/Dark/System appearance control, placed in the
 * header-actions slot. The control must be a native `select`, a radio
 * group, or a conforming menu/radio pattern; a three-state unlabeled icon
 * cycle is rejected.
 *
 * Scoped decision (documented, not silently assumed): of those three
 * admitted patterns, this module implements a native `<select>` bound to a
 * visible, programmatically associated `<label>`. A native select needs no
 * `aria-pressed`/`aria-checked` bookkeeping of its own — its accessible
 * state is the browser-native selected-`<option>` relationship, exposed to
 * every platform accessibility API without any ARIA authored here — and it
 * is keyboard-operable (arrow keys, type-ahead, Enter/Space to open) by
 * native semantics alone, with no custom widget code to keep synchronized.
 * The select's initial selected option is always
 * {@link APPEARANCE_DEFAULT_MODE} (`system`): the actual stored/resolved
 * value is applied to `select.value` by the pre-paint bootstrap script's own
 * `DOMContentLoaded` phase once it runs (see `bootstrap-script.js`), so this
 * server-rendered default is only ever visible for the brief instant before
 * that phase completes, or permanently with JavaScript disabled — exactly
 * the required no-JS fallback: with JavaScript disabled, `system` is
 * preserved.
 *
 * This markup carries no inline `on*` handler and no `javascript:` URL, so
 * it needs no CSP allowance beyond the renderer's existing
 * `script-src 'self'` baseline; the bootstrap script (an external, same-
 * origin file) is what makes it interactive.
 */

import { escapeHtml } from '../skeleton.js';
import {
  APPEARANCE_DEFAULT_MODE,
  APPEARANCE_MODE_DARK,
  APPEARANCE_MODE_LIGHT,
  APPEARANCE_MODE_SYSTEM,
  APPEARANCE_SELECT_ID,
} from './contract.js';

/**
 * Render the appearance control's inner markup (a `<label>` plus its bound
 * `<select>`), for insertion into the header-actions slot.
 *
 * @param {object} options rendering options
 * @param {Readonly<Record<string, string | ((...args: string[]) => string)>>} options.messages
 *   the resolved message catalog
 * @returns {string} the control markup
 */
export function renderAppearanceControl({ messages }) {
  const label = escapeHtml(
    /** @type {string} */ (messages.appearanceControlLabel),
  );
  const selectId = escapeHtml(APPEARANCE_SELECT_ID);
  /** @type {readonly {value: string, text: string}[]} */
  const modes = [
    {
      value: APPEARANCE_MODE_LIGHT,
      text: /** @type {string} */ (messages.appearanceModeLightLabel),
    },
    {
      value: APPEARANCE_MODE_DARK,
      text: /** @type {string} */ (messages.appearanceModeDarkLabel),
    },
    {
      value: APPEARANCE_MODE_SYSTEM,
      text: /** @type {string} */ (messages.appearanceModeSystemLabel),
    },
  ];
  const options = modes
    .map(({ value, text }) => {
      const selectedAttribute =
        value === APPEARANCE_DEFAULT_MODE ? ' selected' : '';
      return `<option value="${escapeHtml(value)}"${selectedAttribute}>${escapeHtml(text)}</option>`;
    })
    .join('');
  return (
    `<label for="${selectId}">${label}</label>` +
    `<select id="${selectId}" name="${selectId}">${options}</select>`
  );
}
