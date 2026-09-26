/**
 * The template-owned `gala-base` cascade layer (TPL-H3/TPL-M7): a
 * stylesheet this renderer itself writes on every build, independent of
 * whether a theme is selected, carrying sane defaults for every
 * contract-mandated chrome element (`internal/skeleton.js`'s skip link,
 * headings, code/table overflow, image sizing, responsive spacing) plus the
 * one rule that makes the closed token catalog's
 * `color-focus`/`focus-width` tokens actually paint a ring (THD-H1): a real
 * `outline-style: solid` under `:focus-visible`.
 *
 * This file is not admitted through, or generated from, the theme package
 * pipeline in `internal/theme-assets.js` — it is not subject to
 * `check-css-hooks.mjs`'s closed selector-admission grammar and may use any
 * selector, property or pseudo-class, including `:focus-visible`,
 * `html`/`body` and functional colors, because it is authored by the
 * template, not by a theme. Its bytes are a pure function of this module's
 * own literal source, not of any per-publication or per-theme input, so a
 * fixed, non-content-addressed output path carries no collision risk
 * (mirrors `internal/appearance/bootstrap-script.js`'s own reasoning for its
 * fixed path).
 *
 * Every custom property this file reads (`--gala-*`) is read through a
 * fallback value, since a theme is optional (`internal/theme-assets.js`'s
 * `defaultThemeStylesheetLinksHtml` fallback path never defines any
 * `--gala-*` property at all) — this layer must still produce a sane,
 * legible default with no theme selected whatsoever.
 *
 * Cascade-layer precedence (TPL-M7): this layer's own declarations always
 * lose to a theme's `gala-tokens`/`gala-components`/`gala-utilities` layer
 * declarations for the same property on the same element, because this
 * stylesheet's own first line is the fixed `@layer gala-base, gala-tokens,
 * gala-components, gala-utilities, gala-print;` order statement — layer
 * order is declared once, explicitly, independent of `<link>` emission
 * order, and independent of which optional stylesheets a theme ships (a
 * theme that omits `utilities.css` never populates `gala-utilities`, which
 * is harmless: an empty layer in a declared order does nothing). A bare
 * `@layer name, name, ...;` statement is not itself a style rule, so it
 * needs no `'unsafe-inline'`/nonce/hash exemption from the
 * `style-src 'self'` CSP baseline the way an inline `<style>` element would
 * (TPL-H4): it ships as the first bytes of this external, same-origin
 * stylesheet, and `internal/eleventy-render.js` always emits this
 * stylesheet's own `<link>` before every theme stylesheet `<link>`.
 */

import { ORDERED_LAYERS } from './styling-contract.js';

/** @type {string} the candidate-output-directory-relative path this
 * stylesheet is always written to (never content-addressed; see module
 * documentation). */
export const GALA_BASE_STYLESHEET_PATH = 'assets/gala-base-v1.css';

/** @type {string} the `manifestAsset`/`manifestRoute` `mediaType` for this
 * stylesheet. */
export const GALA_BASE_STYLESHEET_MEDIA_TYPE = 'text/css; charset=utf-8';

/**
 * The exact `gala-base` layer source, byte-for-byte deterministic across
 * builds (no interpolated per-build value of any kind). Its first line is
 * the fixed layer-order statement every published page relies on (see
 * module documentation).
 *
 * @type {string}
 */
export const GALA_BASE_STYLESHEET_SOURCE = `@layer ${ORDERED_LAYERS.join(', ')};

@layer gala-base {
  [data-gala-publication-root] {
    box-sizing: border-box;
  }
  [data-gala-publication-root] *,
  [data-gala-publication-root] *::before,
  [data-gala-publication-root] *::after {
    box-sizing: inherit;
  }

  /* Skip link: the first focusable element on every page, visually hidden
     until it receives keyboard focus, so it is announced and reachable by
     assistive technology and keyboard users without being the first visible
     line of every published page. */
  [data-gala-publication-root] a[href="#main-content"] {
    position: absolute;
    top: -9999px;
    left: 0;
    z-index: 9999;
    padding: var(--gala-space-2, 0.5rem) var(--gala-space-4, 1rem);
    background-color: var(--gala-color-surface, Canvas);
    color: var(--gala-color-text, CanvasText);
  }
  [data-gala-publication-root] a[href="#main-content"]:focus-visible {
    top: 0;
  }

  /* The one rule that makes the closed token catalog's color-focus/
     focus-width tokens actually paint a ring: outline-style is never set by
     the token catalog alone (outline-color/outline-width longhands paint
     nothing without it), and this layer's own low cascade precedence means
     any theme-declared outline-color/outline-width in gala-components still
     wins for the same element. */
  [data-gala-publication-root] :focus-visible {
    outline-style: solid;
    outline-width: var(--gala-focus-width, 2px);
    outline-color: var(--gala-color-focus, Highlight);
    outline-offset: 2px;
  }

  /* Type scale, expressed with clamp() so it scales between a phone and a
     desktop viewport without a discrete breakpoint; no theme sets this. */
  [data-gala-publication-root] h1 {
    font-size: clamp(1.75rem, 1.4rem + 1.5vw, 2.5rem);
    line-height: 1.2;
  }
  [data-gala-publication-root] h2 {
    font-size: clamp(1.375rem, 1.2rem + 0.8vw, 1.875rem);
    line-height: 1.25;
  }
  [data-gala-publication-root] h3 {
    font-size: clamp(1.125rem, 1.05rem + 0.4vw, 1.375rem);
    line-height: 1.3;
  }
  [data-gala-publication-root] h4,
  [data-gala-publication-root] h5,
  [data-gala-publication-root] h6 {
    font-size: clamp(1rem, 0.96rem + 0.2vw, 1.125rem);
    line-height: 1.35;
  }
  [data-gala-publication-root] p,
  [data-gala-publication-root] li {
    font-size: 1rem;
    line-height: 1.6;
  }
  [data-gala-publication-root] code,
  [data-gala-publication-root] pre {
    /* Corrects the monospace optical-size mismatch against surrounding
       proportional text at the same nominal font-size. */
    font-size: 0.9em;
  }

  /* Overflow/wrap containment: constrains a fenced code block or an
     unbroken long token in prose to the viewport, never the whole page. */
  [data-gala-publication-root] pre {
    overflow-x: auto;
  }
  [data-gala-publication-root] article {
    overflow-wrap: anywhere;
  }
  [data-gala-publication-root] img {
    max-width: 100%;
    height: auto;
  }

  /* Responsive spacing: a small step at a tablet-and-up viewport width, so
     header/main padding is not identical at 320px and 2560px. */
  [data-gala-publication-root] header,
  [data-gala-publication-root] footer {
    padding: var(--gala-space-4, 1rem) var(--gala-space-4, 1rem);
  }
  [data-gala-publication-root] main {
    padding: var(--gala-space-4, 1rem);
  }
  @media (min-width: 48rem) {
    [data-gala-publication-root] header,
    [data-gala-publication-root] footer {
      padding: var(--gala-space-4, 1rem) var(--gala-space-6, 1.5rem);
    }
    [data-gala-publication-root] main {
      padding: var(--gala-space-6, 1.5rem);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    [data-gala-publication-root] *,
    [data-gala-publication-root] *::before,
    [data-gala-publication-root] *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
    }
  }
}
`;
