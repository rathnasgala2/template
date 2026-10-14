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

// Element resets in gala-base must never outrank component classes: a
// (0,1,1) `button` reset beat `.g-composer__signin` and broke its contrast.
test('root element resets stay below component specificity and order', () => {
  const css = GALA_BASE_COMPONENT_CSS;
  const root = '\\[data-gala-publication-root\\]';
  const firstComponent = css.search(/^\s*\.g-/m);
  assert.ok(firstComponent > 0, 'has component rules');
  for (const list of ['img', 'a', 'button', 'h1, h2, h3, p', 'ul, ol']) {
    const at = css.indexOf(`[data-gala-publication-root] :where(${list}) {`);
    assert.ok(at >= 0, `${list} reset is wrapped in :where()`);
    assert.ok(at < firstComponent, `${list} reset precedes component rules`);
  }
  assert.doesNotMatch(
    css,
    new RegExp(
      `${root} (?:button|img|h[1-6]|p|ul|ol|a|input|select|textarea)\\b`,
    ),
    'no bare element-type reset at (0,1,1)',
  );
});

/**
 * @param {string} selector exact selector text of a rule
 * @returns {string} the rule's declaration block
 */
function ruleBody(selector) {
  const start = GALA_BASE_COMPONENT_CSS.indexOf(`${selector} {`);
  assert.ok(start >= 0, `rule ${selector} exists`);
  return GALA_BASE_COMPONENT_CSS.slice(
    start,
    GALA_BASE_COMPONENT_CSS.indexOf('}', start),
  );
}

test('informational counts, times and tombstones use text-muted, never text-faint (WCAG 1.4.3)', () => {
  for (const selector of [
    '.g-pill-count',
    '.g-reaction__count',
    '.g-comments__count',
    '.g-comment__time',
    '.g-comment--tombstone > .g-comment__body',
  ]) {
    const body = ruleBody(selector);
    assert.ok(
      !body.includes('--gala-color-text-faint'),
      `${selector} avoids text-faint`,
    );
    assert.ok(
      body.includes('--gala-color-text-muted'),
      `${selector} uses text-muted`,
    );
  }
});

test('a count inside a painted chip inherits the chip text colour', () => {
  const selectors = [
    '.g-pill[aria-current="page"] .g-pill-count',
    '.g-reaction[aria-pressed="true"] .g-reaction__count',
    '.g-reaction--active .g-reaction__count',
  ];
  const at = GALA_BASE_COMPONENT_CSS.indexOf(selectors[0]);
  assert.ok(at >= 0, 'painted-chip count rule exists');
  const block = GALA_BASE_COMPONENT_CSS.slice(
    at,
    GALA_BASE_COMPONENT_CSS.indexOf('}', at),
  );
  for (const selector of selectors)
    assert.ok(block.includes(selector), selector);
  assert.match(block, /color:\s*inherit/);
});

test('the search placeholder is text-muted at full opacity', () => {
  const body = ruleBody('.g-search-input::placeholder');
  assert.match(body, /color:\s*var\(--gala-color-text-muted\)/);
  assert.match(body, /opacity:\s*1/);
});

test('default text-muted reaches 4.5:1 on canvas and surface in both modes', () => {
  for (const [name, mode] of MODES) {
    for (const bg of ['color-canvas', 'color-surface']) {
      const r = ratio(tok('color-text-muted', mode), tok(bg, mode));
      assert.ok(r >= 4.5, `${name} text-muted on ${bg}: ${r.toFixed(2)}`);
    }
  }
});

test('the selected search result is styled on the option anchor itself', () => {
  assert.ok(
    !GALA_BASE_COMPONENT_CSS.includes('[aria-selected="true"] > .g-search-hit'),
    'no rule selects a child of the selected element',
  );
  assert.match(
    ruleBody('.g-search-hit[aria-selected="true"], .g-search-hit:hover'),
    /background:\s*var\(--gala-color-surface-raised\)/,
  );
  assert.ok(
    ruleBody('.g-search-hit[aria-selected="true"] > .g-icon').includes(
      'opacity: 1',
    ),
  );
});

test('the Featured badge text uses the accent text token (link), never the icon-grade token', () => {
  const body = ruleBody('.g-badge');
  assert.match(body, /color:\s*var\(--gala-color-link\)/);
  assert.ok(!body.includes('icon-accent'), 'badge text is not icon-accent');
  for (const [name, mode] of MODES) {
    const r = ratio(tok('color-link', mode), tok('color-canvas', mode));
    assert.ok(r >= 4.5, `${name} link on canvas: ${r.toFixed(2)}`);
  }
});
