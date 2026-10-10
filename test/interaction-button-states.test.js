/**
 * Interaction-button states: the base layer owns the enabled / disabled /
 * working distinction for every button the interactions script renders, and
 * the default tokens keep the enabled and disabled looks apart in both modes.
 */

import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import {
  GALA_BASE_COMPONENT_CSS,
  GALA_BASE_DEFAULT_TOKENS,
} from '../src/core/internal/appearance/base-layer.js';

/**
 * @param {string} hex #rrggbb colour
 * @returns {number} relative luminance
 */
function luminance(hex) {
  const channels = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

/**
 * @param {string} a first #rrggbb colour
 * @param {string} b second #rrggbb colour
 * @returns {number} WCAG contrast ratio
 */
function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * @param {string} hex foreground #rrggbb colour
 * @param {string} over background #rrggbb colour
 * @param {number} alpha foreground opacity
 * @returns {string} the flattened #rrggbb colour
 */
function flatten(hex, over, alpha) {
  const mix = [1, 3, 5].map((i) => {
    const f = parseInt(hex.slice(i, i + 2), 16);
    const b = parseInt(over.slice(i, i + 2), 16);
    return Math.round(f * alpha + b * (1 - alpha))
      .toString(16)
      .padStart(2, '0');
  });
  return '#' + mix.join('');
}

const OPACITY = 0.6;

/**
 * @param {string} token default-token key
 * @param {0 | 1} mode 0 light, 1 dark
 * @returns {string} the token value in that mode
 */
function tok(token, mode) {
  const value = GALA_BASE_DEFAULT_TOKENS[token];
  return Array.isArray(value) ? value[mode] : String(value);
}

const MODES = /** @type {const} */ ([
  ['light', 0],
  ['dark', 1],
]);

test('primary buttons (Post, Save, Send, Sign in): enabled and disabled text and background differ by at least 1.5:1 in both modes', () => {
  for (const [name, mode] of MODES) {
    const enabledBg = tok('paint-button', mode);
    const enabledText = tok('color-btn-text', mode);
    const disabledBg = tok('color-surface-raised', mode);
    const disabledText = flatten(
      tok('color-text-faint', mode),
      disabledBg,
      OPACITY,
    );
    const bgRatio = ratio(enabledBg, disabledBg);
    const textRatio = ratio(enabledText, disabledText);
    assert.ok(bgRatio >= 1.5, `${name} background ${bgRatio.toFixed(2)}`);
    assert.ok(textRatio >= 1.5, `${name} text ${textRatio.toFixed(2)}`);
  }
});

test('secondary buttons (Like, reactions, Reply, Cancel, Edit, Delete, Report): enabled and disabled text differ by at least 1.5:1 in both modes', () => {
  for (const [name, mode] of MODES) {
    const enabledText = tok('color-text-muted', mode);
    const disabledBg = tok('color-surface-raised', mode);
    const disabledText = flatten(
      tok('color-text-faint', mode),
      disabledBg,
      OPACITY,
    );
    const textRatio = ratio(enabledText, flatten(disabledText, disabledBg, 1));
    assert.ok(textRatio >= 1.5, `${name} text ${textRatio.toFixed(2)}`);
  }
});

const BUTTON_CLASSES = [
  '.g-reaction',
  '.g-comments__more',
  '.g-composer__cancel',
  '.g-comment__action',
  '.g-composer__submit',
  '.g-composer__signin',
  '.g-report button[type="submit"]',
  '.g-report button[type="button"]',
  '.g-interactions__signout',
];

test('the base layer styles the disabled state of every interaction button: muted tokens, reduced opacity, not-allowed, for :disabled and aria-disabled', () => {
  for (const selector of BUTTON_CLASSES) {
    const disabled = `${selector}:is(:disabled, [aria-disabled="true"]):not([aria-busy="true"])`;
    const start = GALA_BASE_COMPONENT_CSS.indexOf(disabled);
    assert.notEqual(start, -1, `${selector} has a disabled rule`);
    const open = GALA_BASE_COMPONENT_CSS.indexOf('{', start);
    const close = GALA_BASE_COMPONENT_CSS.indexOf('}', open);
    const body = GALA_BASE_COMPONENT_CSS.slice(open, close);
    assert.match(body, /opacity: \.6/, `${selector} opacity`);
    assert.match(body, /cursor: not-allowed/, `${selector} cursor`);
    assert.match(body, /var\(--gala-color-text-faint\)/, `${selector} colour`);
  }
  assert.match(
    GALA_BASE_COMPONENT_CSS,
    /background: var\(--gala-color-surface-raised\)[^}]*dashed var\(--gala-color-border\)/,
  );
});

test('the working state is distinct from disabled: a progress cursor and a spinner, excluded from the muted rule', () => {
  assert.match(
    GALA_BASE_COMPONENT_CSS,
    /\[aria-busy="true"\]\s*\{\s*cursor: progress/,
  );
  assert.match(
    GALA_BASE_COMPONENT_CSS,
    /\[aria-busy="true"\]::after \{[^}]*animation: g-busy-spin/,
  );
  assert.match(GALA_BASE_COMPONENT_CSS, /@keyframes g-busy-spin/);
  assert.match(
    GALA_BASE_COMPONENT_CSS,
    /prefers-reduced-motion: reduce\) \{\s*\.g-reaction\[aria-busy="true"\]::after/,
  );
});

test('enabled interaction buttons keep a pointer cursor', () => {
  for (const selector of BUTTON_CLASSES) {
    const escaped = selector.replace(/[.[\]"()]/g, '\\$&');
    const rule = new RegExp(
      `(?:^|[\\n,])\\s*${escaped}(?:\\s*,[^{}]*)?\\s*\\{([^}]*)\\}`,
    );
    const match = rule.exec(GALA_BASE_COMPONENT_CSS);
    assert.ok(match, `${selector} has a base rule`);
    assert.match(match[1], /cursor: pointer/, selector);
  }
});
