/**
 * The template-owned `gala-base` layer reads design values only through the
 * closed theme-contract 3 token catalog, and the one site script ships with a
 * strict policy. Covers: every `var(--gala-...)` in the base layer names a
 * catalog token; no component rule carries a colour literal; the default
 * token block defines exactly the catalog; every published `g-*` hook the
 * server renders has a rule; exactly one script per page; and the CSP allows
 * only `connect-src 'self'` beyond the previous baseline.
 */

import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

import { renderPublication } from '../src/core/index.js';
import {
  GALA_BASE_COMPONENT_CSS,
  GALA_BASE_DEFAULT_TOKEN_CSS,
  GALA_BASE_DEFAULT_TOKEN_KEYS,
  GALA_BASE_STYLESHEET_SOURCE,
} from '../src/core/internal/appearance/base-layer.js';
import { APPEARANCE_BOOTSTRAP_SCRIPT_SOURCE } from '../src/core/internal/appearance/bootstrap-script.js';
import { COMPONENT_CLASS_GROUPS } from '../src/core/internal/appearance/styling-contract.js';
import { CONTENT_SECURITY_POLICY_META_BASELINE } from '../src/core/internal/render-policy-content.js';
import {
  createRenderDirectories,
  testProvenance,
} from './helpers/render-fixtures.js';
import { executableScriptCount } from './helpers/html-facts.js';
import { loadCanonicalBuildInput } from './helpers/schema-fixtures.js';

// The theme-contract 3 token keys, hard-coded from the design document
// scrap/20261005_default-theme-redesign.md, section 1 ("Token list"), sorted
// by UTF-8 byte order. A change to the catalog must change this list on
// purpose.
const CONTRACT_3_TOKEN_KEYS = [
  ...[
    'color-accent',
    'color-accent-2',
    'color-border',
    'color-btn-panel',
    'color-btn-panel-text',
    'color-btn-text',
    'color-canvas',
    'color-chip-text',
    'color-code-canvas',
    'color-code-text',
    'color-danger',
    'color-focus',
    'color-footer',
    'color-header',
    'color-icon-accent',
    'color-input',
    'color-input-border',
    'color-link',
    'color-link-underline',
    'color-link-underline-hover',
    'color-link-visited',
    'color-on-accent',
    'color-overlay',
    'color-panel-muted',
    'color-panel-text',
    'color-selection',
    'color-success',
    'color-surface',
    'color-surface-raised',
    'color-syntax-comment',
    'color-syntax-function',
    'color-syntax-keyword',
    'color-syntax-number',
    'color-syntax-string',
    'color-text',
    'color-text-faint',
    'color-text-muted',
    'color-toc-active',
    'color-toc-active-text',
    'color-warning',
  ],
  ...['paint-button', 'paint-chip', 'paint-page-decor', 'paint-panel'],
  ...[
    'border-button',
    'border-card',
    'border-chip',
    'border-code',
    'border-media-divider',
    'border-quote',
    'border-row-divider',
    'border-section-rule',
  ],
  ...[
    'shadow-avatar-ring',
    'shadow-button',
    'shadow-card',
    'shadow-card-hover',
    'shadow-dialog',
  ],
  ...['font-body', 'font-display', 'font-label', 'font-mono', 'font-ui'],
  ...[
    'weight-display',
    'weight-normal',
    'weight-strong',
    'weight-title',
    'weight-ui',
  ],
  ...[
    'border-width',
    'card-inset',
    'card-title-size',
    'content-measure',
    'display-max',
    'focus-width',
    'lift-x',
    'lift-y',
    'link-offset',
    'link-offset-hover',
    'link-thickness',
    'prose-size',
    'radius-avatar',
    'radius-large',
    'radius-media',
    'radius-medium',
    'radius-pill',
    'radius-small',
    'row-pad',
    'space-1',
    'space-2',
    'space-3',
    'space-4',
    'space-6',
    'space-8',
    'tracking-display',
    'tracking-label',
    'tracking-title',
  ],
  ...['card-pad', 'chip-pad', 'quote-pad'],
  ...['media-zoom', 'prose-leading'],
  ...['duration-base', 'duration-fast', 'duration-slow'],
  ...['ease-spring', 'ease-standard'],
  ...[
    'decor-size',
    'display-style',
    'quote-style',
    'label-transform',
    'title-transform',
    'quote-transform',
    'link-skip-ink',
    'media-filter',
    'media-filter-hover',
    'quote-align',
    'quote-mark',
  ],
].sort((a, b) => Buffer.compare(Buffer.from(a), Buffer.from(b)));

test('the contract-3 token list has the documented 116 distinct keys', () => {
  assert.equal(CONTRACT_3_TOKEN_KEYS.length, 116);
  assert.equal(new Set(CONTRACT_3_TOKEN_KEYS).size, 116);
});

test('the base layer defaults exactly the contract-3 tokens, light and dark', () => {
  assert.deepEqual(
    [...GALA_BASE_DEFAULT_TOKEN_KEYS].sort(),
    [...CONTRACT_3_TOKEN_KEYS].sort(),
  );
  for (const key of CONTRACT_3_TOKEN_KEYS) {
    const declaration = new RegExp(`--gala-${key}:`, 'g');
    assert.equal(
      GALA_BASE_DEFAULT_TOKEN_CSS.match(declaration)?.length,
      2,
      `${key} is defaulted once per palette`,
    );
  }
});

test('every var() in the base layer names a contract-3 token (no other custom property is read)', () => {
  const known = new Set(CONTRACT_3_TOKEN_KEYS.map((key) => `--gala-${key}`));
  const names = [
    ...GALA_BASE_STYLESHEET_SOURCE.matchAll(/var\(\s*(--[a-z0-9-]+)/g),
  ].map((match) => match[1]);
  assert.ok(names.length > 300, 'the layer actually reads tokens');
  const unknown = [...new Set(names)].filter((name) => !known.has(name));
  assert.deepEqual(unknown, [], 'every var() is a contract-3 token');
  const used = new Set(names);
  const unused = [...known].filter((name) => !used.has(name));
  assert.deepEqual(unused, [], 'every contract-3 token is consumed');
  assert.ok(
    !/var\([^)]*,/.test(
      GALA_BASE_STYLESHEET_SOURCE.replace(/rgb\([^)]*\)/g, ''),
    ),
    'no var() carries a fallback literal',
  );
});

test('no component rule carries a colour literal (hex, rgb, hsl, color-mix, named)', () => {
  const css = GALA_BASE_COMPONENT_CSS;
  assert.ok(!/#[0-9a-fA-F]{3,8}\b/.test(css), 'no hex colour');
  assert.ok(
    !/\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix)\(/.test(css),
    'no colour function',
  );
  const named =
    /(?:^|[\s:,(])(?:white|black|red|green|blue|gray|grey|orange|yellow|purple|pink|teal|navy|silver)(?=[\s;,)])/i;
  assert.ok(
    !named.test(css.replace(/\/\*[\s\S]*?\*\//g, '')),
    'no named colour',
  );
});

test('every server-rendered g-* hook has a rule in the base layer', () => {
  const scriptOnly = new Set(COMPONENT_CLASS_GROUPS.script);
  // Pure structure hooks a theme may style but the template needs no rule for.
  const noRuleNeeded = new Set([
    'g-article',
    'g-article-foot',
    'g-main',
    'g-newsletter',
    'g-panel-copy',
  ]);
  const missing = Object.values(COMPONENT_CLASS_GROUPS)
    .flat()
    .filter((name) => !scriptOnly.has(name) && !noRuleNeeded.has(name))
    .filter(
      (name) =>
        !new RegExp(`\\.${name}(?![a-z0-9-])`).test(GALA_BASE_COMPONENT_CSS),
    );
  assert.deepEqual(missing, []);
  for (const name of scriptOnly) {
    assert.ok(
      new RegExp(`\\.${name}(?![a-z0-9-])`).test(GALA_BASE_COMPONENT_CSS),
      `${name} (script-created) has a rule`,
    );
  }
});

test('the base layer keeps reduced-motion handling, focus-visible, scroll-driven @supports and the cross-document view transition', () => {
  const source = GALA_BASE_STYLESHEET_SOURCE;
  assert.match(source, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(source, /:focus-visible \{[^}]*outline-style: solid/);
  assert.match(source, /@supports \(animation-timeline: scroll\(\)\)/);
  assert.match(source, /@supports \(animation-timeline: view\(\)\)/);
  assert.match(
    source,
    /@media \(prefers-reduced-motion: no-preference\) \{\n@view-transition \{ navigation: auto; \}\n\}/,
  );
  // A reveal animation starts at partial opacity but its implicit end state
  // is the natural one, so nothing is invisible at rest.
  assert.ok(!/@keyframes g-reveal \{[^}]*opacity: 0[^.]/.test(source));
});

test('every page carries exactly one script, the CSP allows connect-src self only for the index, and the toast carries the script strings', async () => {
  const buildInput = await loadCanonicalBuildInput();
  const { outputDirectory, workDirectory, sourceDirectory, cleanup } =
    await createRenderDirectories();
  try {
    const { manifest } = await renderPublication(buildInput, {
      outputDirectory,
      workDirectory,
      sourceDirectory,
      provenance: testProvenance(),
    });
    const pages = manifest.routes.filter(
      (route) => route.routeClass === 'html',
    );
    assert.ok(pages.length > 3);
    for (const route of pages) {
      const html = await readFile(
        path.join(outputDirectory, route.path),
        'utf8',
      );
      assert.equal(
        executableScriptCount(html),
        1,
        `${route.path}: one executable script`,
      );
      assert.equal(html.match(/<script[^>]*\bsrc=/g)?.length, 1);
      assert.ok(
        html.includes(`content="${CONTENT_SECURITY_POLICY_META_BASELINE}"`),
      );
      assert.ok(
        html.includes('class="g-toast"'),
        `${route.path}: toast present`,
      );
      assert.ok(
        html.includes('data-search-index='),
        `${route.path}: search hook`,
      );
    }
  } finally {
    await cleanup();
  }
});

test('the CSP baseline differs from the strict baseline only by connect-src self', () => {
  const csp = CONTENT_SECURITY_POLICY_META_BASELINE;
  assert.match(csp, /default-src 'none'/);
  assert.match(csp, /connect-src 'self'/);
  assert.match(csp, /script-src 'self'/);
  assert.match(csp, /style-src 'self'/);
  assert.ok(!/unsafe-inline|unsafe-eval|https?:|data:/.test(csp));
  assert.match(csp, /worker-src 'none'/);
  assert.match(csp, /form-action 'none'/);
});

test('the script never embeds language, fetches only the declared index and creates only published classes', () => {
  const source = APPEARANCE_BOOTSTRAP_SCRIPT_SOURCE;
  const published = new Set(Object.values(COMPONENT_CLASS_GROUPS).flat());
  // State classes the script toggles on the root, not themable components.
  const state = new Set(['g-vt-reveal']);
  for (const name of new Set(source.match(/'g-[a-z0-9-]+'/g) ?? [])) {
    const bare = name.slice(1, -1);
    assert.ok(published.has(bare) || state.has(bare), `${bare} is published`);
  }
  assert.ok(source.includes("getAttribute('data-search-index')"));
});
