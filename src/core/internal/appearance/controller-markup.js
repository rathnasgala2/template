/**
 * The server-rendered colour-mode toggle, placed in the header-actions slot:
 * one icon button that the site script reveals and wires to cycle
 * system, light, dark (with a circular-reveal view transition where the
 * browser supports it). It is rendered `hidden` because it does nothing
 * without the script; with JavaScript off the site simply follows the
 * server-rendered default palette and no dead control is shown.
 *
 * The button's accessible name carries the current mode (for example
 * "Appearance: System"); the script keeps it current from the three
 * `data-label-*` attributes, which are the only localized text it needs.
 * Which of the three mode icons shows is pure CSS, keyed off the root's
 * selection attribute. The markup carries no inline `on*` handler and no
 * `javascript:` URL, so it needs no CSP allowance beyond `script-src 'self'`.
 */

import { escapeHtml } from '../skeleton.js';
import { icon } from '../icons.js';
import {
  APPEARANCE_DEFAULT_MODE,
  APPEARANCE_MODE_DARK,
  APPEARANCE_MODE_LIGHT,
  APPEARANCE_MODE_SYSTEM,
  APPEARANCE_TOGGLE_ID,
} from './contract.js';

/**
 * Render the appearance toggle button.
 *
 * @param {object} options rendering options
 * @param {Readonly<Record<string, string | ((...args: string[]) => string)>>} options.messages
 *   the resolved message catalog
 * @returns {string} the control markup
 */
export function renderAppearanceControl({ messages }) {
  const control = /** @type {string} */ (messages.appearanceControlLabel);
  /** @type {Record<string, string>} */
  const modeText = {
    [APPEARANCE_MODE_LIGHT]: /** @type {string} */ (
      messages.appearanceModeLightLabel
    ),
    [APPEARANCE_MODE_DARK]: /** @type {string} */ (
      messages.appearanceModeDarkLabel
    ),
    [APPEARANCE_MODE_SYSTEM]: /** @type {string} */ (
      messages.appearanceModeSystemLabel
    ),
  };
  const labelOf = (/** @type {string} */ mode) =>
    escapeHtml(`${control}: ${modeText[mode]}`);
  const labelAttributes = [
    APPEARANCE_MODE_SYSTEM,
    APPEARANCE_MODE_LIGHT,
    APPEARANCE_MODE_DARK,
  ]
    .map((mode) => ` data-label-${mode}="${labelOf(mode)}"`)
    .join('');
  const modeIcon = (
    /** @type {string} */ mode,
    /** @type {string} */ iconName,
  ) => `<span class="g-mode-icon g-mode-${mode}">${icon(iconName)}</span>`;
  return (
    `<button class="g-icon-btn" id="${escapeHtml(APPEARANCE_TOGGLE_ID)}" type="button" hidden` +
    ` data-action="mode"${labelAttributes} aria-label="${labelOf(APPEARANCE_DEFAULT_MODE)}" title="${labelOf(APPEARANCE_DEFAULT_MODE)}">` +
    modeIcon(APPEARANCE_MODE_SYSTEM, 'monitor') +
    modeIcon(APPEARANCE_MODE_LIGHT, 'sun') +
    modeIcon(APPEARANCE_MODE_DARK, 'moon') +
    `</button>`
  );
}
