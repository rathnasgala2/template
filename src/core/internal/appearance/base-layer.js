/**
 * The template-owned `gala-base` cascade layer: the stylesheet this renderer
 * itself writes on every build, independent of whether a theme is selected.
 * Since contract 3.0.0 it owns the whole layout and every component rule of
 * the site (header, cards, article, prose, code, search dialog, footer,
 * responsive breakpoints, scroll-driven and view-transition motion). A theme
 * supplies only design values (the closed token catalog, `--gala-<token-key>`
 * custom properties declared in the `gala-tokens` layer) plus optional skin
 * CSS; no component rule below contains a literal colour, font family or
 * radius, so restyling the site is a token change.
 *
 * Two parts, both inside one `@layer gala-base { ... }` block:
 *
 * 1. {@link GALA_BASE_DEFAULT_TOKEN_CSS}: a compact default value for every
 *    token, light and dark, so a publication with no theme selected is still
 *    legible. Being in the lowest layer, any theme token declaration wins
 *    regardless of selector specificity.
 * 2. {@link GALA_BASE_COMPONENT_CSS}: the component rules, which read tokens
 *    only (`test/base-layer-tokens.test.js` enforces that every `var()` names
 *    a catalog token and that no component rule carries a colour literal).
 *
 * The layer-order statement (`@layer gala-base, gala-tokens, ...;`) is the
 * stylesheet's first line, so layer order is independent of `<link>` order
 * and needs no inline `<style>` (CSP `style-src 'self'`). A top-level
 * `@view-transition { navigation: auto; }` (inside
 * `prefers-reduced-motion: no-preference`) opts every page into
 * cross-document view transitions; the optional site script names the cover
 * image so it morphs between a card and its article.
 *
 * Its bytes are a pure function of this module's own source, never of any
 * per-publication or per-theme input, so a fixed output path carries no
 * collision risk.
 */

import { ORDERED_LAYERS } from './styling-contract.js';

/** @type {string} the candidate-output-directory-relative path this
 * stylesheet is always written to (never content-addressed). */
export const GALA_BASE_STYLESHEET_PATH = 'assets/gala-base-v1.css';

/** @type {string} the `manifestAsset`/`manifestRoute` `mediaType` for this
 * stylesheet. */
export const GALA_BASE_STYLESHEET_MEDIA_TYPE = 'text/css; charset=utf-8';

/**
 * Default value of every token as `[light, dark]` (a bare string is the same
 * in both palettes), mirroring the reference "Default" theme. The key order
 * is the catalog's own byte order.
 *
 * @type {Readonly<Record<string, string | string[]>>}
 */
export const GALA_BASE_DEFAULT_TOKENS = Object.freeze({
  'border-button': 'none',
  'border-card': ['1px solid #e2e6ec', '1px solid #232a34'],
  'border-chip': 'none',
  'border-code': ['none', '1px solid #232a34'],
  'border-media-divider': 'none',
  'border-quote': ['4px solid #2b59ff', '4px solid #7b97ff'],
  'border-row-divider': 'none',
  'border-section-rule': 'none',
  'border-width': '1px',
  'card-inset': '0.5rem',
  'card-pad': '0.75rem 0.9rem 1.1rem',
  'card-title-size': '1.25rem',
  'chip-pad': '0.28rem 0.65rem',
  'color-accent': ['#2b59ff', '#7b97ff'],
  'color-accent-2': ['#00a3a3', '#3fd0c9'],
  'color-border': ['#e2e6ec', '#232a34'],
  'color-btn-panel': '#ffffff',
  'color-btn-panel-text': ['#2b59ff', '#18245c'],
  'color-btn-text': ['#ffffff', '#0b1020'],
  'color-canvas': ['#f7f8fa', '#0b0d11'],
  'color-chip-text': ['#1d3fc4', '#b5c6ff'],
  'color-code-canvas': ['#0f1520', '#0f1319'],
  'color-code-text': '#e6edf6',
  'color-danger': ['#c92a2a', '#ff8787'],
  'color-focus': ['#2b59ff', '#9db2ff'],
  'color-footer': ['#ffffff', '#12161c'],
  'color-header': ['#f7f8facc', '#0b0d11b8'],
  'color-icon-accent': ['#2b59ff', '#7b97ff'],
  'color-input': '#ffffff1a',
  'color-input-border': '#ffffff4d',
  'color-link': ['#2148e0', '#9db2ff'],
  'color-link-underline': ['#2148e059', '#9db2ff59'],
  'color-link-underline-hover': ['#2148e0', '#9db2ff'],
  'color-link-visited': ['#5b3fc4', '#b79dff'],
  'color-on-accent': ['#ffffff', '#0b1020'],
  'color-overlay': ['#0a0e1473', '#00000099'],
  'color-panel-muted': '#ffffffc7',
  'color-panel-text': '#ffffff',
  'color-selection': ['#cfdbff', '#2a3a7a'],
  'color-success': ['#1f8a4c', '#5fd18b'],
  'color-surface': ['#ffffff', '#12161c'],
  'color-surface-raised': ['#eef1f5', '#1a1f27'],
  'color-syntax-comment': '#7d8aa0',
  'color-syntax-function': '#7cc7ff',
  'color-syntax-keyword': '#c4a7ff',
  'color-syntax-number': '#ffc27a',
  'color-syntax-string': '#9be3a5',
  'color-text': ['#0f1419', '#e8ecf2'],
  'color-text-faint': ['#8a94a3', '#6b7686'],
  'color-text-muted': ['#556070', '#9aa5b5'],
  'color-toc-active': '#00000000',
  'color-toc-active-text': ['#0f1419', '#e8ecf2'],
  'color-warning': ['#b26a00', '#ffb454'],
  'content-measure': '42rem',
  'decor-size': '100% 46rem',
  'display-max': '4rem',
  'display-style': 'normal',
  'duration-base': '320ms',
  'duration-fast': '160ms',
  'duration-slow': '700ms',
  'ease-spring': 'cubic-bezier(0.34, 1.4, 0.64, 1)',
  'ease-standard': 'cubic-bezier(0.2, 0.8, 0.2, 1)',
  'focus-width': '3px',
  'font-body':
    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  'font-display':
    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  'font-label':
    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  'font-mono': 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
  'font-ui':
    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  'label-transform': 'uppercase',
  'lift-x': '0',
  'lift-y': '-4px',
  'link-offset': '0.22em',
  'link-offset-hover': '0.3em',
  'link-skip-ink': 'auto',
  'link-thickness': '0.08em',
  'media-filter': 'none',
  'media-filter-hover': 'none',
  'media-zoom': '1.045',
  'paint-button': ['#2b59ff', '#7b97ff'],
  'paint-chip': ['#e8eeff', '#1a2346'],
  'paint-page-decor': [
    'radial-gradient(60rem 28rem at 88% -8%, #dfe7ff 0%, transparent 62%)',
    'radial-gradient(60rem 28rem at 88% -8%, #17204a 0%, transparent 62%)',
  ],
  'paint-panel': [
    'linear-gradient(135deg, #1d3fc4, #2b59ff 55%, #00a3a3)',
    'linear-gradient(135deg, #18245c, #2a3f9e 55%, #0f6f6c)',
  ],
  'prose-leading': '1.75',
  'prose-size': '1.125rem',
  'quote-align': 'start',
  'quote-mark': 'none',
  'quote-pad': '0.25em 0 0.25em 1.25em',
  'quote-style': 'normal',
  'quote-transform': 'none',
  'radius-avatar': '50%',
  'radius-large': '22px',
  'radius-media': '10px',
  'radius-medium': '14px',
  'radius-pill': '999px',
  'radius-small': '8px',
  'row-pad': '0',
  'shadow-avatar-ring': [
    '0 0 0 2px #f7f8fa, 0 0 0 3px #e2e6ec',
    '0 0 0 2px #0b0d11, 0 0 0 3px #232a34',
  ],
  'shadow-button': [
    '0 1px 2px #1018281f, 0 6px 16px -8px #2b59ff8c',
    '0 6px 18px -8px #7b97ff99',
  ],
  'shadow-card': [
    '0 1px 2px #1018280d, 0 10px 24px -14px #1018282e',
    'inset 0 1px 0 #ffffff08, 0 12px 28px -16px #000000b3',
  ],
  'shadow-card-hover': [
    '0 2px 4px #1018280f, 0 28px 48px -22px #10182852',
    'inset 0 1px 0 #ffffff0d, 0 30px 50px -24px #000000d9',
  ],
  'shadow-dialog': [
    '0 40px 80px -20px #0a0e1473',
    '0 40px 80px -20px #000000cc',
  ],
  'space-1': '0.25rem',
  'space-2': '0.5rem',
  'space-3': '0.75rem',
  'space-4': '1rem',
  'space-6': '1.5rem',
  'space-8': '2rem',
  'title-transform': 'none',
  'tracking-display': '-0.035em',
  'tracking-label': '0.08em',
  'tracking-title': '-0.015em',
  'weight-display': '800',
  'weight-normal': '400',
  'weight-strong': '700',
  'weight-title': '700',
  'weight-ui': '600',
});

/** @type {readonly string[]} every token key this layer defaults, sorted. */
export const GALA_BASE_DEFAULT_TOKEN_KEYS = Object.freeze(
  Object.keys(GALA_BASE_DEFAULT_TOKENS),
);

/**
 * @param {number} index 0 for light, 1 for dark
 * @returns {string} the declaration list for one palette
 */
function defaultDeclarations(index) {
  return Object.entries(GALA_BASE_DEFAULT_TOKENS)
    .map(([key, value]) => {
      const resolved = typeof value === 'string' ? value : (value[index] ?? '');
      return `--gala-${key}:${resolved};`;
    })
    .join('');
}

/**
 * Default token values, light then dark, in the template's own layer.
 *
 * @type {string}
 */
export const GALA_BASE_DEFAULT_TOKEN_CSS =
  `[data-gala-publication-root]{color-scheme:light;${defaultDeclarations(0)}}\n` +
  `[data-gala-publication-root][data-gala-resolved-color-mode="dark"]{color-scheme:dark;${defaultDeclarations(1)}}\n`;

/**
 * The component rules: tokens only, no colour literal.
 *
 * @type {string}
 */
export const GALA_BASE_COMPONENT_CSS = `
  /* ---------- root ---------- */
  [data-gala-publication-root] {
    min-height: 100vh;
    scroll-padding-top: 6rem;
    background: var(--gala-paint-page-decor) no-repeat, var(--gala-color-canvas);
    background-size: var(--gala-decor-size), auto;
    color: var(--gala-color-text);
    font-family: var(--gala-font-body);
    font-weight: var(--gala-weight-normal);
    font-size: 1rem;
    line-height: 1.55;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
  }
  [data-gala-publication-root] body {
    margin: 0;
    transition: background-color var(--gala-duration-base) var(--gala-ease-standard), color var(--gala-duration-base) var(--gala-ease-standard);
  }
  [data-gala-publication-root] *, [data-gala-publication-root] *::before, [data-gala-publication-root] *::after { box-sizing: border-box; }
  [data-gala-publication-root] [hidden] { display: none !important; }
  [data-gala-publication-root] ::selection { background: var(--gala-color-selection); color: var(--gala-color-text); }
  /* The one rule that makes the focus tokens paint a ring: outline-style is
     never set by a token, and this layer's low precedence lets a theme's
     outline-color/outline-width still win. */
  [data-gala-publication-root] :focus-visible {
    outline-style: solid;
    outline-width: var(--gala-focus-width);
    outline-color: var(--gala-color-focus);
    outline-offset: 3px;
  }
  [data-gala-publication-root] img { display: block; max-width: 100%; height: auto; }
  [data-gala-publication-root] a { color: inherit; text-decoration: none; }
  [data-gala-publication-root] h1, [data-gala-publication-root] h2, [data-gala-publication-root] h3, [data-gala-publication-root] p { margin: 0; }
  [data-gala-publication-root] button { font: inherit; color: inherit; }
  [data-gala-publication-root] ul, [data-gala-publication-root] ol { margin: 0; padding: 0; list-style: none; }

  .g-wrap { width: 100%; max-width: 76rem; margin-inline: auto; padding-inline: clamp(16px, 4vw, 40px); }
  .g-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
  .g-main { outline: none; }
  .g-icon { width: 1.1em; height: 1.1em; flex: none; fill: none; stroke: currentColor; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }
  .g-dot { display: inline-block; width: 3px; height: 3px; border-radius: 50%; background: currentColor; opacity: .55; margin-inline: .55em; vertical-align: middle; }
  .g-skip { position: absolute; left: var(--gala-space-4); top: -4rem; z-index: 50; padding: var(--gala-space-3) var(--gala-space-4); background: var(--gala-paint-button); color: var(--gala-color-btn-text); border-radius: var(--gala-radius-small); font-family: var(--gala-font-ui); }
  .g-skip:focus { top: var(--gala-space-4); }

  /* ---------- type primitives ---------- */
  .g-label {
    display: inline-flex; align-items: center; gap: .45em;
    font-family: var(--gala-font-label); font-size: .75rem; font-weight: var(--gala-weight-ui);
    text-transform: var(--gala-label-transform); letter-spacing: var(--gala-tracking-label); color: var(--gala-color-text-muted);
  }
  .g-hero h2, .g-article-head h1, .g-topic-hero h1 {
    font-family: var(--gala-font-display); font-weight: var(--gala-weight-display); font-style: var(--gala-display-style);
    font-size: clamp(2.25rem, 1.2rem + 3.6vw, var(--gala-display-max)); line-height: 1.02;
    letter-spacing: var(--gala-tracking-display); text-transform: var(--gala-title-transform); text-wrap: balance;
  }
  .g-topic-hero h1 { font-size: clamp(2rem, 1.2rem + 2.8vw, calc(var(--gala-display-max) * .8)); }
  .g-hero h2 a { background: linear-gradient(currentColor, currentColor) 0 100% / 0 .06em no-repeat; transition: background-size var(--gala-duration-slow) var(--gala-ease-standard); }
  .g-hero h2 a:hover { background-size: 100% .06em; }
  .g-dek { font-size: clamp(1.075rem, 1rem + .35vw, 1.3rem); line-height: 1.5; color: var(--gala-color-text-muted); text-wrap: pretty; max-width: 40rem; }
  .g-section-head h2, .g-series-card h2, .g-panel h2 {
    font-family: var(--gala-font-display); font-weight: var(--gala-weight-title); font-size: clamp(1.45rem, 1.2rem + .9vw, 2rem);
    letter-spacing: var(--gala-tracking-title); text-transform: var(--gala-title-transform); line-height: 1.15;
  }
  .g-meta { display: inline-flex; align-items: center; flex-wrap: wrap; font-family: var(--gala-font-ui); font-size: .8125rem; color: var(--gala-color-text-muted); font-variant-numeric: tabular-nums; }
  .g-meta > span:last-child { display: inline-flex; align-items: center; gap: .3em; }
  .g-meta .g-icon { width: .95em; height: .95em; }
  .g-kbd { font-family: var(--gala-font-mono); font-size: .7rem; padding: .1rem .4rem; border-radius: var(--gala-radius-small); border: var(--gala-border-width) solid var(--gala-color-border); color: var(--gala-color-text-muted); background: var(--gala-color-surface); }

  /* ---------- controls ---------- */
  .g-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: .55em;
    min-height: 2.75rem; padding: .7rem 1.2rem; border-radius: var(--gala-radius-pill);
    background: var(--gala-paint-button); color: var(--gala-color-btn-text); border: var(--gala-border-button); box-shadow: var(--gala-shadow-button);
    font-family: var(--gala-font-ui); font-weight: var(--gala-weight-ui); font-size: .9375rem; letter-spacing: -0.005em;
    cursor: pointer; white-space: nowrap;
    transition: transform var(--gala-duration-fast) var(--gala-ease-standard), box-shadow var(--gala-duration-base) var(--gala-ease-standard), filter var(--gala-duration-base) var(--gala-ease-standard);
  }
  .g-btn .g-icon { transition: transform var(--gala-duration-base) var(--gala-ease-spring); }
  .g-btn:hover { filter: brightness(1.07) saturate(1.05); transform: translateY(-2px); }
  .g-btn:hover .g-icon { transform: translateX(3px); }
  .g-btn:active { transform: scale(.97); }

  .g-icon-btn {
    display: inline-grid; place-items: center; width: 2.5rem; height: 2.5rem; flex: none; padding: 0;
    border-radius: var(--gala-radius-pill); border: var(--gala-border-width) solid transparent; background: transparent; color: var(--gala-color-text-muted); cursor: pointer;
    transition: background-color var(--gala-duration-fast) var(--gala-ease-standard), color var(--gala-duration-fast) var(--gala-ease-standard), transform var(--gala-duration-fast) var(--gala-ease-standard);
  }
  .g-icon-btn .g-icon { width: 1.2rem; height: 1.2rem; }
  .g-icon-btn:hover { background: var(--gala-color-surface-raised); color: var(--gala-color-text); }
  .g-icon-btn:active { transform: scale(.92); }
  .g-icon-btn[aria-pressed="true"] { color: var(--gala-color-accent); }
  .g-icon-btn[aria-pressed="true"] .g-icon { fill: currentColor; }
  .g-mode-icon { display: none; animation: g-spin-in var(--gala-duration-slow) var(--gala-ease-spring); }
  .g-mode-system { display: inline-grid; }
  [data-gala-color-mode-selection="light"] .g-mode-system, [data-gala-color-mode-selection="dark"] .g-mode-system { display: none; }
  [data-gala-color-mode-selection="light"] .g-mode-light, [data-gala-color-mode-selection="dark"] .g-mode-dark { display: inline-grid; }
  @keyframes g-spin-in { from { transform: rotate(-90deg) scale(.6); opacity: 0; } }

  .g-chip {
    display: inline-flex; align-items: center; gap: .35em; position: relative; z-index: 2;
    padding: var(--gala-chip-pad); border-radius: var(--gala-radius-pill); border: var(--gala-border-chip);
    background: var(--gala-paint-chip); color: var(--gala-color-chip-text);
    font-family: var(--gala-font-label); font-size: .72rem; font-weight: var(--gala-weight-ui);
    text-transform: var(--gala-label-transform); letter-spacing: var(--gala-tracking-label); line-height: 1.3;
    transition: filter var(--gala-duration-fast) var(--gala-ease-standard), transform var(--gala-duration-fast) var(--gala-ease-standard);
  }
  .g-chip:hover { filter: brightness(.96) saturate(1.2); }
  .g-badge { display: inline-flex; align-items: center; gap: .35em; font-family: var(--gala-font-label); font-size: .72rem; font-weight: var(--gala-weight-ui); text-transform: var(--gala-label-transform); letter-spacing: var(--gala-tracking-label); color: var(--gala-color-icon-accent); }
  .g-series-tag { display: inline-flex; align-items: center; gap: .35em; font-family: var(--gala-font-ui); font-size: .78rem; color: var(--gala-color-text-muted); }
  .g-avatar { display: inline-grid; place-items: center; width: 2.5rem; height: 2.5rem; aspect-ratio: 1 / 1; border-radius: var(--gala-radius-avatar); object-fit: cover; flex: none; box-shadow: var(--gala-shadow-avatar-ring); background: var(--gala-paint-button); color: var(--gala-color-btn-text); font-family: var(--gala-font-display); font-weight: var(--gala-weight-display); font-size: .9rem; overflow: hidden; }
  .g-byline { display: flex; align-items: center; gap: var(--gala-space-3); min-width: 0; }
  .g-byline-text { display: grid; gap: .1rem; min-width: 0; font-family: var(--gala-font-ui); font-weight: var(--gala-weight-ui); font-size: .9375rem; }
  .g-byline-text a:hover { text-decoration: underline; }
  .g-byline-text .g-meta { font-weight: var(--gala-weight-normal); }

  /* ---------- header ---------- */
  .g-progress {
    position: fixed; inset: env(safe-area-inset-top, 0px) 0 auto 0; height: 3px; z-index: 40;
    background: linear-gradient(90deg, var(--gala-color-accent), var(--gala-color-accent-2)); transform-origin: 0 50%; transform: scaleX(0);
  }
  .g-header {
    position: sticky; top: env(safe-area-inset-top, 0px); z-index: 30;
    background: var(--gala-color-header); border-bottom: var(--gala-border-width) solid var(--gala-color-border);
    -webkit-backdrop-filter: blur(16px) saturate(1.5); backdrop-filter: blur(16px) saturate(1.5);
  }
  .g-header-row { display: flex; align-items: center; gap: var(--gala-space-6); min-height: 4.25rem; }
  .g-brand { display: inline-flex; align-items: center; gap: .7rem; min-width: 0; }
  .g-mark {
    display: inline-grid; place-items: center; width: 2.25rem; height: 2.25rem; flex: none; overflow: hidden;
    border-radius: var(--gala-radius-medium); background: var(--gala-paint-button); color: var(--gala-color-btn-text); border: var(--gala-border-button);
    font-family: var(--gala-font-display); font-weight: var(--gala-weight-display); font-size: .9rem; letter-spacing: -0.04em;
    transition: transform var(--gala-duration-base) var(--gala-ease-spring);
  }
  .g-mark img { width: 100%; height: 100%; object-fit: cover; }
  .g-brand:hover .g-mark { transform: rotate(-8deg) scale(1.06); }
  .g-brand-text { display: grid; line-height: 1.15; min-width: 0; }
  .g-brand-name { font-family: var(--gala-font-display); font-weight: var(--gala-weight-title); font-size: 1.125rem; letter-spacing: var(--gala-tracking-title); text-transform: var(--gala-title-transform); white-space: nowrap; }
  .g-brand-tag { font-family: var(--gala-font-ui); font-size: .75rem; color: var(--gala-color-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .g-nav { margin-inline: auto; }
  .g-nav > ul { display: flex; gap: .25rem; }
  .g-nav li { position: relative; }
  .g-nav a {
    position: relative; display: block; padding: .5rem .8rem; border-radius: var(--gala-radius-pill);
    font-family: var(--gala-font-ui); font-size: .9rem; font-weight: var(--gala-weight-ui); color: var(--gala-color-text-muted);
    transition: color var(--gala-duration-fast) var(--gala-ease-standard), background-color var(--gala-duration-fast) var(--gala-ease-standard);
  }
  .g-nav a:hover { color: var(--gala-color-text); background: var(--gala-color-surface-raised); }
  .g-nav a[aria-current="page"] { color: var(--gala-color-text); }
  .g-nav a[aria-current="page"]::after { content: ""; position: absolute; left: .8rem; right: .8rem; bottom: .15rem; height: 2px; border-radius: 2px; background: var(--gala-color-accent); }
  .g-nav li > ul {
    display: none; position: absolute; left: 0; top: 100%; z-index: 5; min-width: 12rem; padding: var(--gala-space-2);
    background: var(--gala-color-surface); border: var(--gala-border-card); border-radius: var(--gala-radius-medium); box-shadow: var(--gala-shadow-card-hover);
  }
  .g-nav li:hover > ul, .g-nav li:focus-within > ul { display: grid; }
  .g-actions { display: flex; align-items: center; gap: .35rem; margin-left: auto; }
  .g-nav + .g-actions { margin-left: 0; }
  .g-actions > [data-gala-slot] { display: contents; }
  .g-search-btn {
    display: inline-flex; align-items: center; gap: .5rem; height: 2.5rem; padding: 0 .55rem 0 .8rem; min-width: 11rem;
    border-radius: var(--gala-radius-pill); border: var(--gala-border-width) solid var(--gala-color-border); background: var(--gala-color-surface); color: var(--gala-color-text-muted);
    font-family: var(--gala-font-ui); font-size: .875rem; cursor: pointer; transition: border-color var(--gala-duration-fast) var(--gala-ease-standard), color var(--gala-duration-fast) var(--gala-ease-standard);
  }
  .g-search-btn:hover { color: var(--gala-color-text); border-color: var(--gala-color-text-muted); }
  .g-search-btn > span:not(.g-kbd) { margin-right: auto; }
  .g-menu { display: none; }
  .g-menu summary { display: grid; place-items: center; width: 2.5rem; height: 2.5rem; border-radius: var(--gala-radius-pill); color: var(--gala-color-text-muted); cursor: pointer; list-style: none; }
  .g-menu summary::-webkit-details-marker { display: none; }
  .g-menu summary:hover, .g-menu[open] summary { background: var(--gala-color-surface-raised); color: var(--gala-color-text); }
  .g-menu summary .g-icon { width: 1.3rem; height: 1.3rem; }
  .g-menu > ul {
    position: absolute; left: 0; right: 0; top: 100%; display: grid; max-height: calc(100vh - 5rem); overflow-y: auto;
    padding: var(--gala-space-2) clamp(16px, 4vw, 40px) var(--gala-space-6); background: var(--gala-color-surface); border-bottom: var(--gala-border-width) solid var(--gala-color-border);
    box-shadow: var(--gala-shadow-card-hover); animation: g-drop var(--gala-duration-base) var(--gala-ease-standard);
  }
  .g-menu li > a { display: flex; align-items: center; padding: .85rem .25rem; border-bottom: var(--gala-border-width) solid var(--gala-color-border); font-family: var(--gala-font-display); font-weight: var(--gala-weight-title); font-size: 1.15rem; }
  .g-menu li > a[aria-current="page"] { color: var(--gala-color-link); }
  .g-menu li ul { padding-left: var(--gala-space-4); }
  @keyframes g-drop { from { opacity: 0; transform: translateY(-8px); } }

  /* ---------- home: hero ---------- */
  .g-hero { display: grid; grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); gap: clamp(1.5rem, 4vw, 3.5rem); align-items: center; padding-block: clamp(2rem, 5vw, 4rem) clamp(1.5rem, 3vw, 2.5rem); }
  .g-hero-media { display: block; aspect-ratio: 4 / 3; border-radius: var(--gala-radius-large); overflow: hidden; background: var(--gala-color-surface-raised); border: var(--gala-border-card); box-shadow: var(--gala-shadow-card); max-width: 100%; }
  .g-hero-media img { width: 100%; height: 100%; object-fit: cover; filter: var(--gala-media-filter); transition: transform 1.2s var(--gala-ease-standard), filter var(--gala-duration-slow) var(--gala-ease-standard); }
  .g-hero-media:hover img { transform: scale(var(--gala-media-zoom)); filter: var(--gala-media-filter-hover); }
  .g-hero-body { display: grid; gap: 1.25rem; justify-items: start; min-width: 0; }
  .g-eyebrow { display: flex; align-items: center; gap: var(--gala-space-3); flex-wrap: wrap; }
  .g-hero-body > * { animation: g-rise-in .8s var(--gala-ease-standard) both; }
  .g-hero-body > :nth-child(2) { animation-delay: 60ms; }
  .g-hero-body > :nth-child(3) { animation-delay: 120ms; }
  .g-hero-body > :nth-child(4) { animation-delay: 180ms; }
  .g-hero-body > :nth-child(5) { animation-delay: 240ms; }
  @keyframes g-rise-in { from { opacity: 0; transform: translateY(14px); } }

  /* topic pills */
  .g-topic-strip { padding-block: var(--gala-space-2) var(--gala-space-4); }
  .g-pills { display: flex; gap: var(--gala-space-2); overflow-x: auto; scrollbar-width: none; padding-block: var(--gala-space-1); }
  .g-pills::-webkit-scrollbar { display: none; }
  .g-pill {
    display: inline-flex; align-items: center; gap: var(--gala-space-2); padding: .55rem .9rem; white-space: nowrap;
    border-radius: var(--gala-radius-pill); border: var(--gala-border-width) solid var(--gala-color-border); background: var(--gala-color-surface);
    font-family: var(--gala-font-ui); font-size: .875rem; font-weight: var(--gala-weight-ui);
    transition: border-color var(--gala-duration-fast) var(--gala-ease-standard), transform var(--gala-duration-fast) var(--gala-ease-standard), background-color var(--gala-duration-fast) var(--gala-ease-standard);
  }
  .g-pill .g-icon { color: var(--gala-color-icon-accent); }
  .g-pill:hover { border-color: var(--gala-color-text); transform: translateY(-1px); }
  .g-pill[aria-current="page"] { background: var(--gala-paint-button); color: var(--gala-color-btn-text); border: var(--gala-border-button); }
  .g-pill[aria-current="page"] .g-icon { color: inherit; }
  .g-pill-count { font-size: .75rem; color: var(--gala-color-text-faint); font-variant-numeric: tabular-nums; padding-left: var(--gala-space-2); border-left: var(--gala-border-width) solid var(--gala-color-border); }

  /* ---------- sections ---------- */
  .g-section { padding-block: clamp(2rem, 5vw, 3.5rem); }
  .g-section-head { display: flex; align-items: baseline; justify-content: space-between; gap: var(--gala-space-4); padding-top: .9rem; margin-bottom: var(--gala-space-6); border-top: var(--gala-border-section-rule); }
  .g-more { display: inline-flex; align-items: center; gap: .35rem; font-family: var(--gala-font-ui); font-size: .875rem; font-weight: var(--gala-weight-ui); color: var(--gala-color-link); white-space: nowrap; }
  .g-more .g-icon { transition: transform var(--gala-duration-base) var(--gala-ease-spring); }
  .g-more:hover .g-icon { transform: translateX(4px); }

  /* ---------- cards ---------- */
  .g-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: clamp(1rem, 2.5vw, 1.75rem); }
  .g-card {
    position: relative; display: flex; flex-direction: column; min-width: 0;
    background: var(--gala-color-surface); border: var(--gala-border-card); border-radius: var(--gala-radius-large); padding: var(--gala-card-inset);
    box-shadow: var(--gala-shadow-card);
    transition: transform var(--gala-duration-base) var(--gala-ease-standard), box-shadow var(--gala-duration-base) var(--gala-ease-standard), border-color var(--gala-duration-base) var(--gala-ease-standard);
  }
  /* The title link stretches over the whole card through ::after, so the
     card stays one click target while the link has a real accessible name. */
  .g-card-link::after { content: ""; position: absolute; inset: 0; z-index: 1; border-radius: var(--gala-radius-large); }
  .g-card:hover { transform: translate(var(--gala-lift-x), var(--gala-lift-y)); box-shadow: var(--gala-shadow-card-hover); }
  .g-card-media { margin: 0; aspect-ratio: 16 / 10; overflow: hidden; border-radius: var(--gala-radius-media); background: var(--gala-color-surface-raised); border-bottom: var(--gala-border-media-divider); max-width: 100%; }
  .g-card-media img { width: 100%; height: 100%; object-fit: cover; filter: var(--gala-media-filter); transition: transform 1s var(--gala-ease-standard), filter var(--gala-duration-slow) var(--gala-ease-standard); }
  .g-card:hover .g-card-media img { transform: scale(var(--gala-media-zoom)); filter: var(--gala-media-filter-hover); }
  .g-card-placeholder { display: grid; place-items: center; aspect-ratio: 16 / 10; width: 100%; overflow: hidden; border-radius: var(--gala-radius-media); background: var(--gala-paint-panel); color: var(--gala-color-panel-text); }
  .g-card-placeholder .g-icon { width: 2.25rem; height: 2.25rem; opacity: .85; }
  .g-hero-media .g-card-placeholder { height: 100%; aspect-ratio: auto; border-radius: 0; }
  .g-card-body { display: flex; flex-direction: column; gap: .6rem; padding: var(--gala-card-pad); flex: 1; min-width: 0; }
  .g-card-top { display: flex; align-items: center; justify-content: space-between; gap: var(--gala-space-2); min-height: 1.6rem; }
  .g-card h2, .g-card h3 {
    font-family: var(--gala-font-display); font-weight: var(--gala-weight-title); font-size: var(--gala-card-title-size); line-height: 1.22;
    letter-spacing: var(--gala-tracking-title); text-transform: var(--gala-title-transform); text-wrap: balance;
    transition: color var(--gala-duration-fast) var(--gala-ease-standard);
  }
  .g-card:hover h2, .g-card:hover h3 { color: var(--gala-color-link); }
  .g-card-excerpt { color: var(--gala-color-text-muted); font-size: .9375rem; line-height: 1.55; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
  .g-card-foot { display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: .35rem; }
  .g-card-foot > span[aria-hidden] { display: inline-grid; place-items: center; width: 2rem; height: 2rem; border-radius: var(--gala-radius-pill); color: var(--gala-color-icon-accent); opacity: 0; transform: translateX(-8px); transition: opacity var(--gala-duration-base) var(--gala-ease-standard), transform var(--gala-duration-base) var(--gala-ease-spring); }
  .g-card:hover .g-card-foot > span[aria-hidden], .g-card:focus-within .g-card-foot > span[aria-hidden] { opacity: 1; transform: none; }
  .g-card:focus-within { box-shadow: var(--gala-shadow-card-hover); }
  .g-card-link:focus-visible { outline-offset: 2px; }

  /* row variant (listings) */
  .g-list { display: grid; gap: clamp(1rem, 2.5vw, 1.5rem); }
  .g-card-row { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 3fr); align-items: center; padding-bottom: var(--gala-row-pad); border-bottom: var(--gala-border-row-divider); }
  .g-card-row .g-card-media, .g-card-row .g-card-placeholder { aspect-ratio: 16 / 9; height: 100%; border-bottom: 0; border-right: var(--gala-border-media-divider); }
  .g-card-row .g-card-body { padding: clamp(1rem, 2.5vw, 1.75rem); }
  .g-card-row h2, .g-card-row h3 { font-size: clamp(1.3rem, 1rem + 1vw, 1.75rem); }

  /* ---------- series ---------- */
  .g-series-card {
    position: relative; display: grid; gap: var(--gala-space-4); padding: clamp(1.25rem, 3vw, 1.75rem); overflow: hidden;
    border-radius: var(--gala-radius-large); background: var(--gala-color-surface); border: var(--gala-border-card); box-shadow: var(--gala-shadow-card);
  }
  .g-series-card::before { content: ""; position: absolute; inset: 0 0 auto 0; height: 4px; background: linear-gradient(90deg, var(--gala-color-accent), var(--gala-color-accent-2)); }
  .g-series-card h2 { font-size: 1.6rem; }
  .g-series-list { display: grid; gap: var(--gala-space-1); }
  .g-series-list a { display: flex; align-items: center; gap: var(--gala-space-3); padding: .55rem .5rem; border-radius: var(--gala-radius-small); font-family: var(--gala-font-ui); font-size: .9rem; transition: background-color var(--gala-duration-fast) var(--gala-ease-standard); }
  .g-series-list a:hover { background: var(--gala-color-surface-raised); }
  .g-series-n { display: inline-grid; place-items: center; width: 1.75rem; height: 1.75rem; flex: none; border-radius: var(--gala-radius-avatar); border: var(--gala-border-width) solid var(--gala-color-border); font-size: .78rem; font-weight: var(--gala-weight-ui); font-variant-numeric: tabular-nums; }
  .g-series-list [aria-current="true"] .g-series-n { background: var(--gala-paint-button); color: var(--gala-color-btn-text); border: var(--gala-border-button); }
  .g-series-here { margin-left: auto; font-size: .72rem; color: var(--gala-color-text-muted); white-space: nowrap; }
  .g-series-card .g-btn { justify-self: start; }

  /* ---------- newsletter panel ---------- */
  .g-newsletter { padding-block: clamp(1rem, 3vw, 2rem) clamp(3rem, 6vw, 5rem); }
  .g-panel {
    position: relative; display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: clamp(1.25rem, 4vw, 3rem); align-items: center;
    padding: clamp(1.5rem, 5vw, 3.25rem); border-radius: var(--gala-radius-large); overflow: hidden;
    background: var(--gala-paint-panel); color: var(--gala-color-panel-text); border: var(--gala-border-card); box-shadow: var(--gala-shadow-card);
  }
  .g-panel::after { content: ""; position: absolute; width: 22rem; height: 22rem; right: -6rem; top: -10rem; border-radius: 50%; background: radial-gradient(closest-side, var(--gala-color-panel-text), transparent); opacity: .12; pointer-events: none; }
  .g-panel-copy { display: grid; gap: var(--gala-space-3); min-width: 0; }
  .g-panel .g-label, .g-panel-copy p:not(.g-label) { color: var(--gala-color-panel-muted); }
  .g-panel h2 { font-weight: var(--gala-weight-display); font-size: clamp(1.6rem, 1.2rem + 1.6vw, 2.5rem); line-height: 1.08; letter-spacing: var(--gala-tracking-display); text-wrap: balance; }
  .g-panel-copy p:not(.g-label) { max-width: 30rem; }
  .g-panel .g-btn { position: relative; z-index: 1; min-height: 3rem; background: var(--gala-color-btn-panel); color: var(--gala-color-btn-panel-text); border: var(--gala-border-button); box-shadow: none; }

  /* ---------- article ---------- */
  .g-article-head { display: grid; gap: 1.1rem; justify-items: start; max-width: 54rem; padding-block: clamp(1.5rem, 4vw, 3rem) clamp(1.5rem, 3vw, 2.25rem); }
  .g-crumbs { font-family: var(--gala-font-ui); font-size: .8125rem; color: var(--gala-color-text-muted); }
  .g-crumbs ol { display: flex; align-items: center; flex-wrap: wrap; gap: .35rem; }
  .g-crumbs li + li::before { content: "/"; margin-right: .35rem; color: var(--gala-color-text-faint); }
  .g-crumbs a:hover { color: var(--gala-color-text); }
  .g-crumbs [aria-current] { color: var(--gala-color-text); }
  .g-article-labels { display: flex; align-items: center; flex-wrap: wrap; gap: .5rem 1rem; }
  .g-article-head h1 { font-size: clamp(2.25rem, 1.2rem + 3.8vw, var(--gala-display-max)); }
  .g-article-meta { display: flex; align-items: center; justify-content: space-between; gap: var(--gala-space-4); width: 100%; padding-top: 1.1rem; border-top: var(--gala-border-width) solid var(--gala-color-border); flex-wrap: wrap; }
  .g-share { display: flex; gap: var(--gala-space-1); }
  .g-article-cover { margin-block: 0; }
  .g-article-cover img { width: 100%; height: auto; aspect-ratio: 21 / 9; object-fit: cover; border-radius: var(--gala-radius-large); border: var(--gala-border-card); box-shadow: var(--gala-shadow-card); filter: var(--gala-media-filter); }
  .g-article-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, var(--gala-content-measure)) minmax(0, 1fr); gap: clamp(1.5rem, 4vw, 3.5rem); padding-block: clamp(2rem, 5vw, 3.5rem) var(--gala-space-4); }
  .g-article-grid > .g-prose { grid-column: 2; }
  .g-toc { position: sticky; top: 6rem; align-self: start; justify-self: end; width: min(100%, 15rem); display: grid; gap: var(--gala-space-3); }
  .g-toc-list { display: grid; border-left: var(--gala-border-width) solid var(--gala-color-border); }
  .g-toc-list a { display: block; margin-left: -1px; padding: .4rem .9rem; border-left: var(--gala-border-width) solid transparent; font-family: var(--gala-font-ui); font-size: .85rem; line-height: 1.35; color: var(--gala-color-text-muted); transition: color var(--gala-duration-fast) var(--gala-ease-standard), border-color var(--gala-duration-fast) var(--gala-ease-standard); }
  .g-toc-list a:hover { color: var(--gala-color-text); }
  .g-toc-list a[aria-current="true"] { color: var(--gala-color-toc-active-text); background: var(--gala-color-toc-active); border-left-color: var(--gala-color-accent); font-weight: var(--gala-weight-ui); }
  .g-toc-mobile { display: none; margin-bottom: var(--gala-space-6); border: var(--gala-border-width) solid var(--gala-color-border); border-radius: var(--gala-radius-medium); background: var(--gala-color-surface); }
  .g-toc-mobile summary { display: flex; align-items: center; gap: var(--gala-space-2); padding: .8rem 1rem; cursor: pointer; font-family: var(--gala-font-ui); font-weight: var(--gala-weight-ui); font-size: .9rem; list-style: none; }
  .g-toc-mobile summary::-webkit-details-marker { display: none; }
  .g-toc-mobile .g-toc-list { margin: 0 1rem 1rem; }

  /* prose */
  .g-prose { font-family: var(--gala-font-body); font-size: var(--gala-prose-size); line-height: var(--gala-prose-leading); min-width: 0; overflow-wrap: anywhere; }
  .g-prose > * + * { margin-top: 1.35em; }
  .g-prose p { text-wrap: pretty; }
  .g-prose h2, .g-prose h3, .g-prose h4 { font-family: var(--gala-font-display); font-weight: var(--gala-weight-title); line-height: 1.2; letter-spacing: var(--gala-tracking-title); text-transform: var(--gala-title-transform); text-wrap: balance; scroll-margin-top: 6rem; }
  .g-prose h2 { margin-top: 2.2em; font-size: clamp(1.5rem, 1.25rem + .9vw, 1.95rem); }
  .g-prose h3 { margin-top: 1.8em; margin-bottom: 0; font-size: clamp(1.25rem, 1.1rem + .6vw, 1.5rem); }
  .g-prose h4 { margin-top: 1.6em; font-size: 1.125rem; }
  .g-prose strong, .g-prose b { font-weight: var(--gala-weight-strong); }
  .g-prose a:not(.g-tag, [data-toc]) { color: var(--gala-color-link); text-decoration: underline; text-decoration-color: var(--gala-color-link-underline); text-decoration-thickness: var(--gala-link-thickness); text-underline-offset: var(--gala-link-offset); text-decoration-skip-ink: var(--gala-link-skip-ink); transition: text-decoration-color var(--gala-duration-fast) var(--gala-ease-standard), text-underline-offset var(--gala-duration-fast) var(--gala-ease-standard); }
  .g-prose a:not(.g-tag, [data-toc]):visited { color: var(--gala-color-link-visited); }
  .g-prose a:not(.g-tag, [data-toc]):hover { text-decoration-color: var(--gala-color-link-underline-hover); text-underline-offset: var(--gala-link-offset-hover); }
  .g-prose ul:not(.g-tags), .g-prose ol:not(.g-toc-list) { padding-left: 1.4em; }
  .g-prose ul:not(.g-tags) { list-style: disc; }
  .g-prose ol:not(.g-toc-list) { list-style: decimal; }
  .g-prose li + li { margin-top: .5em; }
  .g-toc-list li + li { margin-top: 0; }
  .g-prose li::marker { color: var(--gala-color-icon-accent); font-weight: var(--gala-weight-ui); }
  .g-prose :not(pre) > code { font-family: var(--gala-font-mono); font-size: .86em; padding: .12em .4em; border-radius: var(--gala-radius-small); background: var(--gala-color-surface-raised); border: var(--gala-border-width) solid var(--gala-color-border); overflow-wrap: anywhere; }
  .g-prose blockquote {
    margin-inline: 0; margin-block: 2em; padding: var(--gala-quote-pad); border-left: var(--gala-border-quote); text-align: var(--gala-quote-align);
    font-family: var(--gala-font-display); font-weight: var(--gala-weight-title); font-style: var(--gala-quote-style); text-transform: var(--gala-quote-transform);
    font-size: clamp(1.4rem, 1.15rem + 1vw, 1.85rem); line-height: 1.3; letter-spacing: var(--gala-tracking-title); text-wrap: balance;
  }
  .g-prose blockquote::before { content: var(--gala-quote-mark); display: block; font-size: 3em; line-height: .6; color: var(--gala-color-accent); }
  .g-prose blockquote > * + * { margin-top: .6em; }
  .g-prose img { width: 100%; border-radius: var(--gala-radius-medium); border: var(--gala-border-card); filter: var(--gala-media-filter); }
  .g-prose figure { margin-inline: 0; }
  .g-prose figcaption { margin-top: .6rem; font-family: var(--gala-font-ui); font-size: .8125rem; color: var(--gala-color-text-muted); }
  .g-prose hr { border: 0; border-top: var(--gala-border-width) solid var(--gala-color-border); margin-block: 2.5em; }
  .g-prose table { display: block; max-width: 100%; overflow-x: auto; border-collapse: collapse; font-size: .92em; }
  .g-prose th, .g-prose td { padding: .5em .8em; border: var(--gala-border-width) solid var(--gala-color-border); text-align: start; }
  .g-prose th { background: var(--gala-color-surface-raised); font-weight: var(--gala-weight-strong); }

  /* code blocks: the bare <pre> is already a finished block; the optional
     script wraps it in .g-codeblock with a language label and copy button. */
  .g-prose pre, .g-codeblock { margin-inline: 0; border-radius: var(--gala-radius-medium); overflow: hidden; background: var(--gala-color-code-canvas); color: var(--gala-color-code-text); border: var(--gala-border-code); box-shadow: var(--gala-shadow-card); }
  .g-prose pre { padding: 1rem 1.15rem 1.2rem; overflow-x: auto; font-family: var(--gala-font-mono); font-size: .85rem; line-height: 1.65; tab-size: 2; overflow-wrap: normal; }
  .g-prose pre code { font-family: inherit; }
  .g-prose .g-codeblock > pre { margin: 0; border: 0; border-radius: 0; box-shadow: none; background: transparent; }
  .g-codebar { display: flex; align-items: center; gap: var(--gala-space-3); padding: .55rem .6rem .55rem 1rem; border-bottom: var(--gala-border-width) solid var(--gala-color-input-border); font-family: var(--gala-font-ui); font-size: .78rem; }
  .g-codebar-lang { font-family: var(--gala-font-mono); text-transform: uppercase; letter-spacing: .06em; font-size: .7rem; padding: .15rem .45rem; border-radius: var(--gala-radius-small); background: var(--gala-color-input); }
  .g-copy { margin-left: auto; display: inline-flex; align-items: center; gap: .35rem; padding: .35rem .6rem; border-radius: var(--gala-radius-small); border: 0; background: transparent; color: inherit; cursor: pointer; opacity: .75; font-size: .75rem; transition: opacity var(--gala-duration-fast) var(--gala-ease-standard), background-color var(--gala-duration-fast) var(--gala-ease-standard); }
  .g-copy:hover { opacity: 1; background: var(--gala-color-input); }
  .g-copy .g-icon { width: .95rem; height: .95rem; }
  .g-copy-done { display: none; }
  .g-copy[data-copied] .g-copy-idle { display: none; }
  .g-copy[data-copied] .g-copy-done { display: inline-flex; align-items: center; gap: .35rem; color: var(--gala-color-success); animation: g-spin-in var(--gala-duration-base) var(--gala-ease-spring); }
  .token.keyword, .token.atrule, .token.selector, .token.tag, .token.important, .token.operator.keyword { color: var(--gala-color-syntax-keyword); }
  .token.string, .token.char, .token.attr-value, .token.template-string, .token.regex, .token.inserted { color: var(--gala-color-syntax-string); }
  .token.comment, .token.prolog, .token.doctype, .token.cdata { color: var(--gala-color-syntax-comment); font-style: italic; }
  .token.number, .token.boolean, .token.constant, .token.symbol, .token.null { color: var(--gala-color-syntax-number); }
  .token.function, .token.class-name, .token.builtin, .token.function-variable { color: var(--gala-color-syntax-function); }
  .token.deleted { color: var(--gala-color-danger); }
  .token.bold { font-weight: var(--gala-weight-strong); }
  .token.italic { font-style: italic; }

  .g-tags { display: flex; flex-wrap: wrap; gap: var(--gala-space-2); margin-top: 2.5em; font-size: 1rem; line-height: 1.5; }
  .g-prose .g-tags > li { margin-top: 0; }
  .g-tag { display: inline-flex; align-items: center; gap: var(--gala-space-1); padding: .3rem .7rem; border-radius: var(--gala-radius-pill); border: var(--gala-border-width) solid var(--gala-color-border); font-family: var(--gala-font-ui); font-size: .8rem; color: var(--gala-color-text-muted); transition: color var(--gala-duration-fast) var(--gala-ease-standard), border-color var(--gala-duration-fast) var(--gala-ease-standard); }
  .g-tag:hover { color: var(--gala-color-text); border-color: var(--gala-color-text); }
  .g-tag .g-icon { width: .85em; height: .85em; }

  /* article footer */
  .g-article-foot { display: grid; gap: var(--gala-space-6); max-width: calc(var(--gala-content-measure) + 2 * clamp(16px, 4vw, 40px)); padding-block: var(--gala-space-4) var(--gala-space-8); }
  .g-author-card { display: flex; gap: 1.25rem; align-items: flex-start; padding: var(--gala-space-6); border-radius: var(--gala-radius-large); background: var(--gala-color-surface); border: var(--gala-border-card); }
  .g-author-card .g-avatar { width: 4.5rem; height: 4.5rem; font-size: 1.4rem; }
  .g-author-name { font-family: var(--gala-font-display); font-weight: var(--gala-weight-title); font-size: 1.25rem; margin: .2rem 0 .35rem !important; }
  .g-author-name a:hover { color: var(--gala-color-link); }
  .g-author-bio { color: var(--gala-color-text-muted); font-size: .9375rem; }
  .g-series-box { display: grid; gap: var(--gala-space-3); padding: 1.25rem; border-radius: var(--gala-radius-large); border: var(--gala-border-width) dashed var(--gala-color-border); }
  .g-pager { display: grid; grid-template-columns: 1fr 1fr; gap: var(--gala-space-4); }
  .g-pager-link { display: grid; align-content: start; gap: .4rem; padding: 1.1rem 1.25rem; border-radius: var(--gala-radius-medium); border: var(--gala-border-width) solid var(--gala-color-border); background: var(--gala-color-surface); transition: transform var(--gala-duration-base) var(--gala-ease-standard), border-color var(--gala-duration-base) var(--gala-ease-standard), box-shadow var(--gala-duration-base) var(--gala-ease-standard); }
  .g-pager-link:hover { border-color: var(--gala-color-text); transform: translate(var(--gala-lift-x), var(--gala-lift-y)); box-shadow: var(--gala-shadow-card-hover); }
  .g-pager-link > span:last-child { font-family: var(--gala-font-display); font-weight: var(--gala-weight-title); line-height: 1.3; text-wrap: balance; }
  .g-pager-next { grid-column: 2; text-align: right; justify-items: end; }
  .g-pager-next .g-label { flex-direction: row; }

  /* ---------- listing pages ---------- */
  .g-topic-hero { display: grid; gap: 1.25rem; justify-items: start; padding-block: clamp(1.5rem, 4vw, 3rem) var(--gala-space-2); }
  .g-topic-hero > .g-pills { max-width: 100%; }
  .g-topic-head { display: flex; align-items: center; gap: 1.25rem; }
  .g-topic-icon { display: inline-grid; place-items: center; width: clamp(3.5rem, 8vw, 5rem); aspect-ratio: 1; flex: none; overflow: hidden; border-radius: var(--gala-radius-large); background: var(--gala-paint-button); color: var(--gala-color-btn-text); border: var(--gala-border-button); box-shadow: var(--gala-shadow-button); }
  .g-topic-icon .g-icon { width: 45%; height: 45%; }
  .g-topic-icon .g-avatar { width: 100%; height: 100%; border-radius: 0; box-shadow: none; }

  /* pagination */
  .g-pagination { padding-block: var(--gala-space-8) var(--gala-space-2); font-family: var(--gala-font-ui); font-size: .9rem; }
  .g-pagination ul { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: var(--gala-space-3); }
  .g-pagination a, .g-pagination li > span { display: inline-flex; align-items: center; min-height: 2.5rem; padding: 0 1.1rem; border-radius: var(--gala-radius-pill); border: var(--gala-border-width) solid var(--gala-color-border); background: var(--gala-color-surface); font-weight: var(--gala-weight-ui); }
  .g-pagination a:hover { border-color: var(--gala-color-text); }
  .g-pagination li > span { color: var(--gala-color-text-faint); background: transparent; }
  .g-pagination li[aria-current="page"] { color: var(--gala-color-text-muted); }

  /* ---------- search dialog (built by the optional script) ---------- */
  .g-search {
    width: min(40rem, calc(100% - 32px)); max-height: min(34rem, 80vh); margin: 12vh auto auto; padding: 0;
    border: var(--gala-border-card); border-radius: var(--gala-radius-large); background: var(--gala-color-surface); color: var(--gala-color-text); box-shadow: var(--gala-shadow-dialog);
    overflow: hidden;
  }
  .g-search[open] { animation: g-pop var(--gala-duration-base) var(--gala-ease-spring); }
  .g-search::backdrop { background: var(--gala-color-overlay); -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px); }
  @keyframes g-pop { from { opacity: 0; transform: translateY(-10px) scale(.97); } }
  .g-search-box { display: flex; align-items: center; gap: var(--gala-space-3); padding: .9rem 1.1rem; border-bottom: var(--gala-border-width) solid var(--gala-color-border); color: var(--gala-color-text-muted); }
  .g-search-input { flex: 1; min-width: 0; border: 0; background: transparent; color: var(--gala-color-text); font: inherit; font-family: var(--gala-font-ui); font-size: 1.05rem; outline: none; }
  .g-search-input::-webkit-search-cancel-button { display: none; }
  .g-search-results { margin: 0; padding: var(--gala-space-2); overflow-y: auto; max-height: 26rem; }
  .g-search-hit { display: flex; align-items: center; gap: .9rem; padding: .6rem .7rem; border-radius: var(--gala-radius-medium); }
  .g-search-hit > .g-icon { margin-left: auto; color: var(--gala-color-text-faint); opacity: 0; transition: opacity var(--gala-duration-fast) var(--gala-ease-standard); }
  .g-search-hit-text { display: grid; gap: .1rem; min-width: 0; }
  .g-search-hit-title { font-family: var(--gala-font-ui); font-weight: var(--gala-weight-ui); }
  .g-search-hit-meta { font-family: var(--gala-font-ui); font-size: .8125rem; color: var(--gala-color-text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  [aria-selected="true"] > .g-search-hit, .g-search-hit:hover { background: var(--gala-color-surface-raised); }
  [aria-selected="true"] > .g-search-hit > .g-icon { opacity: 1; color: var(--gala-color-accent); }
  .g-search-empty { padding: var(--gala-space-6) var(--gala-space-4); color: var(--gala-color-text-muted); font-family: var(--gala-font-ui); text-align: center; }

  /* toast */
  .g-toast {
    position: fixed; left: 50%; bottom: var(--gala-space-6); z-index: 60; max-width: calc(100% - 2rem); padding: .7rem 1.1rem;
    border-radius: var(--gala-radius-pill); background: var(--gala-color-accent); color: var(--gala-color-on-accent); box-shadow: var(--gala-shadow-dialog);
    font-family: var(--gala-font-ui); font-size: .875rem; text-align: center; opacity: 0; visibility: hidden; transform: translate(-50%, 1rem);
    transition: opacity var(--gala-duration-base) var(--gala-ease-standard), transform var(--gala-duration-base) var(--gala-ease-standard), visibility var(--gala-duration-base);
  }
  .g-toast[data-show] { opacity: 1; visibility: visible; transform: translate(-50%, 0); }
  .g-toast[data-tone="success"] { border-left: .35rem solid var(--gala-color-success); }
  .g-toast[data-tone="warning"] { border-left: .35rem solid var(--gala-color-warning); }
  .g-toast[data-tone="danger"] { border-left: .35rem solid var(--gala-color-danger); }

  /* ---------- footer ---------- */
  .g-footer { border-top: var(--gala-border-width) solid var(--gala-color-border); background: var(--gala-color-footer); margin-top: var(--gala-space-8); }
  .g-footer-grid { display: grid; grid-template-columns: minmax(0, 2fr) repeat(3, minmax(0, 1fr)); gap: var(--gala-space-8); padding-block: clamp(2.5rem, 5vw, 4rem) var(--gala-space-8); }
  .g-footer-brand { display: grid; gap: var(--gala-space-4); justify-items: start; align-content: start; }
  .g-footer-about { color: var(--gala-color-text-muted); font-size: .9375rem; max-width: 26rem; }
  .g-social { display: flex; gap: var(--gala-space-1); margin-left: -.5rem; }
  .g-footer-col { display: grid; align-content: start; gap: .65rem; font-family: var(--gala-font-ui); font-size: .9rem; min-width: 0; }
  .g-footer-col ul { display: grid; gap: .65rem; }
  .g-footer-col a { color: var(--gala-color-text-muted); width: fit-content; transition: color var(--gala-duration-fast) var(--gala-ease-standard); }
  .g-footer-col a:hover { color: var(--gala-color-text); }
  .g-footer-col .g-label { margin-bottom: var(--gala-space-1); }
  .g-footer-base { display: flex; justify-content: space-between; gap: var(--gala-space-4); flex-wrap: wrap; padding-block: 1.25rem var(--gala-space-8); border-top: var(--gala-border-width) solid var(--gala-color-border); font-family: var(--gala-font-ui); font-size: .8125rem; color: var(--gala-color-text-muted); }

  /* ---------- responsive ---------- */
  @media (max-width: 1100px) {
    .g-article-grid { grid-template-columns: minmax(0, 1fr); justify-items: center; }
    .g-article-grid > .g-prose { grid-column: 1; width: 100%; max-width: var(--gala-content-measure); }
    .g-toc { display: none; }
    .g-toc-mobile { display: block; }
  }
  @media (max-width: 960px) {
    .g-nav { display: none; }
    .g-actions { margin-left: auto; }
    .g-menu { display: block; }
    .g-search-btn { min-width: 0; padding: 0; width: 2.5rem; justify-content: center; border-color: transparent; background: transparent; }
    .g-search-btn > span { display: none; }
    .g-hero { grid-template-columns: minmax(0, 1fr); }
    .g-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .g-panel { grid-template-columns: minmax(0, 1fr); }
    .g-panel .g-btn { justify-self: start; }
    .g-footer-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .g-footer-brand { grid-column: 1 / -1; }
  }
  @media (max-width: 640px) {
    .g-brand-tag { display: none; }
    .g-grid { grid-template-columns: minmax(0, 1fr); }
    .g-card-row { grid-template-columns: minmax(0, 1fr); }
    .g-card-row .g-card-media, .g-card-row .g-card-placeholder { border-right: 0; border-bottom: var(--gala-border-media-divider); height: auto; }
    .g-pager { grid-template-columns: minmax(0, 1fr); }
    .g-pager-next { grid-column: 1; }
    .g-article-cover img { aspect-ratio: 16 / 10; }
    .g-footer-grid { grid-template-columns: minmax(0, 1fr); }
    .g-author-card { flex-direction: column; }
    .g-topic-head { align-items: flex-start; }
  }

  /* ---------- motion: scroll-driven and view transitions ---------- */
  @media (prefers-reduced-motion: no-preference) {
    [data-gala-publication-root] { scroll-behavior: smooth; }
    @supports (animation-timeline: scroll()) {
      .g-header { animation: g-header-settle linear both; animation-timeline: scroll(root); animation-range: 0 96px; }
      @keyframes g-header-settle { from { background: transparent; border-bottom-color: transparent; -webkit-backdrop-filter: none; backdrop-filter: none; } }
      .g-progress { animation: g-read linear both; animation-timeline: scroll(root); }
      @keyframes g-read { from { transform: scaleX(0); } to { transform: scaleX(1); } }
    }
    @supports (animation-timeline: view()) {
      .g-grid > .g-card, .g-list > .g-card, .g-panel, .g-series-card, .g-author-card, .g-series-box, .g-prose > pre, .g-codeblock, .g-prose > figure, .g-prose > blockquote {
        animation: g-reveal linear both; animation-timeline: view(); animation-range: entry 0% entry 55%;
      }
      @keyframes g-reveal { from { opacity: .15; transform: translateY(28px) scale(.985); } }
    }
    ::view-transition-old(root), ::view-transition-new(root) { animation-duration: 280ms; animation-timing-function: var(--gala-ease-standard); }
    ::view-transition-group(gala-cover) { animation-duration: 560ms; animation-timing-function: var(--gala-ease-standard); }
    ::view-transition-image-pair(gala-cover) { isolation: auto; }
    ::view-transition-old(gala-cover), ::view-transition-new(gala-cover) { height: 100%; object-fit: cover; overflow: clip; animation: none; mix-blend-mode: normal; }
  }
  html.g-vt-reveal::view-transition-old(root), html.g-vt-reveal::view-transition-new(root) { animation: none; mix-blend-mode: normal; }
  @media (prefers-reduced-motion: reduce) {
    [data-gala-publication-root] *, [data-gala-publication-root] *::before, [data-gala-publication-root] *::after { animation: none !important; transition-duration: 1ms !important; scroll-behavior: auto !important; }
  }
`
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]+/gm, '')
  .replace(/\n{2,}/g, '\n');

/**
 * The exact `gala-base` stylesheet, byte-for-byte deterministic across
 * builds. Its first line is the fixed layer-order statement every published
 * page relies on.
 *
 * @type {string}
 */
export const GALA_BASE_STYLESHEET_SOURCE =
  `@layer ${ORDERED_LAYERS.join(', ')};\n` +
  `@layer gala-base {\n${GALA_BASE_DEFAULT_TOKEN_CSS}${GALA_BASE_COMPONENT_CSS}}\n` +
  `@media (prefers-reduced-motion: no-preference) {\n@view-transition { navigation: auto; }\n}\n`;
