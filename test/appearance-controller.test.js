/**
 * Task packet S2-T07 acceptance tests: the Light/Dark/System appearance
 * controller, its pre-paint bootstrap, storage handling, CSP consistency,
 * the no-JS fallback, and two-build determinism of the new artifact.
 *
 * The JSDOM section executes the *actual* generated
 * `APPEARANCE_BOOTSTRAP_SCRIPT_SOURCE` bytes (never a hand-reimplemented
 * mirror of its logic), so a regression in the shipped script itself is
 * what these tests catch — pinned exact test-only DOM dependency:
 * `jsdom@30.0.1` (`package.json` devDependencies, `save-exact` per
 * `.npmrc`).
 */

import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

import { JSDOM } from 'jsdom';
import { parse } from 'parse5';

import { renderPublication } from '../src/core/index.js';
import {
  APPEARANCE_BOOTSTRAP_SCRIPT_MEDIA_TYPE,
  APPEARANCE_BOOTSTRAP_SCRIPT_PATH,
  APPEARANCE_MODE_VALUES,
  APPEARANCE_RESOLVED_MODE_ATTRIBUTE,
  APPEARANCE_ROOT_ATTRIBUTE,
  APPEARANCE_SELECTION_ATTRIBUTE,
  APPEARANCE_SERVER_DEFAULT_RESOLVED_MODE,
  APPEARANCE_SELECT_ID,
  APPEARANCE_STORAGE_KEY,
  COLOR_SCHEME_META_CONTENT,
  appearanceBootstrapScriptHref,
} from '../src/core/internal/appearance/contract.js';
import { APPEARANCE_BOOTSTRAP_SCRIPT_SOURCE } from '../src/core/internal/appearance/bootstrap-script.js';
import { renderAppearanceControl } from '../src/core/internal/appearance/controller-markup.js';
import { getMessages } from '../src/core/internal/messages.js';
import { projectFixedAssetPath } from '../src/core/internal/route.js';
import {
  createRenderDirectories,
  testProvenance,
} from './helpers/render-fixtures.js';
import { loadCanonicalBuildInput } from './helpers/schema-fixtures.js';

const CSP_BASELINE_STRING =
  "default-src 'none'; base-uri 'none'; object-src 'none'; " +
  "frame-ancestors 'none'; form-action 'none'; script-src 'self'; " +
  "style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'none'; " +
  "media-src 'self'; manifest-src 'self'; worker-src 'none'";

// --- contract.js: the fixed constants module ---

test('appearance/contract.js fixes the exact DEC-097 root/palette attribute names', () => {
  assert.equal(APPEARANCE_ROOT_ATTRIBUTE, 'data-gala-publication-root');
  assert.equal(
    APPEARANCE_RESOLVED_MODE_ATTRIBUTE,
    'data-gala-resolved-color-mode',
  );
  assert.notEqual(APPEARANCE_SELECTION_ATTRIBUTE, APPEARANCE_ROOT_ATTRIBUTE);
  assert.notEqual(
    APPEARANCE_SELECTION_ATTRIBUTE,
    APPEARANCE_RESOLVED_MODE_ATTRIBUTE,
  );
  assert.deepEqual(APPEARANCE_MODE_VALUES, ['light', 'dark', 'system']);
});

// --- controller-markup.js: the server-rendered control ---

test('renderAppearanceControl renders a labelled native select with message-catalog option text, defaulting to system', () => {
  const messages = getMessages('en');
  const html = renderAppearanceControl({ messages });
  const document = parse(`<!doctype html><html><body>${html}</body></html>`);
  const select = findByTag(document, 'select');
  assert.ok(select, 'a <select> must be rendered');
  assert.equal(attr(select, 'id'), APPEARANCE_SELECT_ID);
  const label = findByTag(document, 'label');
  assert.ok(label, 'a <label> must be rendered');
  assert.equal(attr(label, 'for'), APPEARANCE_SELECT_ID);
  assert.equal(textContent(label).trim(), 'Appearance');

  const options = collectByTag(select, 'option');
  assert.deepEqual(
    options.map((option) => attr(option, 'value')),
    ['light', 'dark', 'system'],
  );
  assert.deepEqual(
    options.map((option) => textContent(option)),
    ['Light', 'Dark', 'System'],
  );
  const selected = options.filter((option) => attr(option, 'selected') === '');
  assert.equal(selected.length, 1, 'exactly one option is server-selected');
  assert.equal(attr(selected[0], 'value'), 'system');
});

test('renderAppearanceControl HTML-escapes catalog text', () => {
  const html = renderAppearanceControl({
    messages: {
      appearanceControlLabel: '<b>Appearance</b>',
      appearanceModeLightLabel: 'Light',
      appearanceModeDarkLabel: 'Dark',
      appearanceModeSystemLabel: 'System',
    },
  });
  assert.ok(!html.includes('<b>Appearance</b>'));
  assert.ok(html.includes('&lt;b&gt;Appearance&lt;/b&gt;'));
});

// --- bootstrap-script.js: static analysis of the shipped bytes ---

test('the bootstrap script is a plain classic script with no network/eval/cookie access', () => {
  const source = APPEARANCE_BOOTSTRAP_SCRIPT_SOURCE;
  assert.ok(!/\beval\s*\(/.test(source));
  assert.ok(!/\bnew Function\b/.test(source));
  assert.ok(!/\bfetch\s*\(/.test(source));
  assert.ok(!/XMLHttpRequest/.test(source));
  assert.ok(!/document\.cookie/.test(source));
  assert.ok(!/\.style\s*[.[]/.test(source), 'never mutates inline style');
  for (const key of ['localStorage', APPEARANCE_STORAGE_KEY]) {
    assert.ok(source.includes(key));
  }
});

// --- JSDOM execution: the actual controller logic ---

/**
 * Build a fresh jsdom window with a minimal document carrying the
 * server-rendered appearance control, and a controllable
 * `window.matchMedia('(prefers-color-scheme: dark)')` mock.
 *
 * @param {object} [options] setup options
 * @param {boolean} [options.matchMediaAvailable] when `false`, `matchMedia`
 *   is left undefined (simulating an old/non-conforming browser)
 * @param {boolean} [options.initialPrefersDark] the mock's initial
 *   `(prefers-color-scheme: dark)` match state
 * @returns {{window: import('jsdom').DOMWindow, setPrefersDark: (value: boolean) => void}}
 *   the window and a helper to fire a live system-preference change
 */
function createWindow({
  matchMediaAvailable = true,
  initialPrefersDark = false,
} = {}) {
  const controlHtml = renderAppearanceControl({ messages: getMessages('en') });
  const dom = new JSDOM(
    `<!doctype html><html><head></head><body>${controlHtml}</body></html>`,
    { runScripts: 'dangerously', url: 'https://fixture.example.test/' },
  );
  const { window } = dom;

  let prefersDark = initialPrefersDark;
  /** @type {Set<(event: {matches: boolean}) => void>} */
  const listeners = new Set();
  if (matchMediaAvailable) {
    window.matchMedia = (query) => {
      if (query !== '(prefers-color-scheme: dark)') {
        return {
          matches: false,
          addEventListener() {},
          removeEventListener() {},
        };
      }
      return {
        get matches() {
          return prefersDark;
        },
        addEventListener: (type, fn) => {
          if (type === 'change') listeners.add(fn);
        },
        removeEventListener: (type, fn) => listeners.delete(fn),
      };
    };
  }

  return {
    window,
    setPrefersDark(value) {
      prefersDark = value;
      for (const fn of listeners) fn({ matches: value });
    },
  };
}

/**
 * Run the shipped bootstrap script in `window`, then dispatch a synthetic
 * `DOMContentLoaded` event (jsdom already fired the real one during initial
 * parse, before the script ever ran) so its deferred control-wiring phase
 * executes too.
 *
 * @param {import('jsdom').DOMWindow} window a jsdom window
 * @returns {void}
 */
function runBootstrapScript(window) {
  window.eval(APPEARANCE_BOOTSTRAP_SCRIPT_SOURCE);
  window.document.dispatchEvent(new window.Event('DOMContentLoaded'));
}

test('pre-paint phase: no stored value and no matchMedia resolves to light (documented fallback)', () => {
  const { window } = createWindow({ matchMediaAvailable: false });
  runBootstrapScript(window);
  const root = window.document.documentElement;
  assert.equal(root.getAttribute(APPEARANCE_SELECTION_ATTRIBUTE), 'system');
  assert.equal(root.getAttribute(APPEARANCE_RESOLVED_MODE_ATTRIBUTE), 'light');
});

test('pre-paint phase: no stored value resolves system through prefers-color-scheme', () => {
  const { window } = createWindow({ initialPrefersDark: true });
  runBootstrapScript(window);
  const root = window.document.documentElement;
  assert.equal(root.getAttribute(APPEARANCE_SELECTION_ATTRIBUTE), 'system');
  assert.equal(root.getAttribute(APPEARANCE_RESOLVED_MODE_ATTRIBUTE), 'dark');
});

test('pre-paint phase: an explicit stored choice is used directly, independent of system preference', () => {
  const { window } = createWindow({ initialPrefersDark: true });
  window.localStorage.setItem(APPEARANCE_STORAGE_KEY, 'light');
  runBootstrapScript(window);
  const root = window.document.documentElement;
  assert.equal(root.getAttribute(APPEARANCE_SELECTION_ATTRIBUTE), 'light');
  assert.equal(root.getAttribute(APPEARANCE_RESOLVED_MODE_ATTRIBUTE), 'light');
});

test('pre-paint phase: an unknown stored value is ignored and treated as system', () => {
  const { window } = createWindow({ initialPrefersDark: false });
  window.localStorage.setItem(APPEARANCE_STORAGE_KEY, 'lite');
  runBootstrapScript(window);
  const root = window.document.documentElement;
  assert.equal(root.getAttribute(APPEARANCE_SELECTION_ATTRIBUTE), 'system');
  assert.equal(root.getAttribute(APPEARANCE_RESOLVED_MODE_ATTRIBUTE), 'light');
});

test('storage failure leaves the session usable and defaults to system', () => {
  const { window } = createWindow({ initialPrefersDark: false });
  Object.defineProperty(window, 'localStorage', {
    get() {
      throw new window.DOMException('blocked', 'SecurityError');
    },
  });
  assert.doesNotThrow(() => runBootstrapScript(window));
  const root = window.document.documentElement;
  assert.equal(root.getAttribute(APPEARANCE_SELECTION_ATTRIBUTE), 'system');
  assert.equal(root.getAttribute(APPEARANCE_RESOLVED_MODE_ATTRIBUTE), 'light');
});

test('live system-preference change updates the resolved attribute only while selection stays system', () => {
  const { window, setPrefersDark } = createWindow({
    initialPrefersDark: false,
  });
  runBootstrapScript(window);
  const root = window.document.documentElement;
  assert.equal(root.getAttribute(APPEARANCE_RESOLVED_MODE_ATTRIBUTE), 'light');

  setPrefersDark(true);
  assert.equal(root.getAttribute(APPEARANCE_RESOLVED_MODE_ATTRIBUTE), 'dark');
});

test('an explicit choice is never overridden by a later system-preference change', () => {
  const { window, setPrefersDark } = createWindow({
    initialPrefersDark: false,
  });
  window.localStorage.setItem(APPEARANCE_STORAGE_KEY, 'light');
  runBootstrapScript(window);
  const root = window.document.documentElement;
  assert.equal(root.getAttribute(APPEARANCE_RESOLVED_MODE_ATTRIBUTE), 'light');

  setPrefersDark(true);
  assert.equal(
    root.getAttribute(APPEARANCE_RESOLVED_MODE_ATTRIBUTE),
    'light',
    'an explicit light choice must not flip to dark on a system change',
  );
});

test('the select control is wired once the document exists, and its initial value reflects the stored selection', () => {
  const { window } = createWindow({ initialPrefersDark: false });
  window.localStorage.setItem(APPEARANCE_STORAGE_KEY, 'dark');
  runBootstrapScript(window);
  const select = window.document.getElementById(APPEARANCE_SELECT_ID);
  assert.equal(select.value, 'dark');
});

test('changing the control persists the selection and updates the root attributes immediately, without reload', () => {
  const { window } = createWindow({ initialPrefersDark: false });
  runBootstrapScript(window);
  const select = window.document.getElementById(APPEARANCE_SELECT_ID);
  select.value = 'dark';
  select.dispatchEvent(new window.Event('change', { bubbles: true }));

  const root = window.document.documentElement;
  assert.equal(root.getAttribute(APPEARANCE_SELECTION_ATTRIBUTE), 'dark');
  assert.equal(root.getAttribute(APPEARANCE_RESOLVED_MODE_ATTRIBUTE), 'dark');
  assert.equal(window.localStorage.getItem(APPEARANCE_STORAGE_KEY), 'dark');
});

test('a storage write failure on change still updates the visible state (session stays usable)', () => {
  const { window } = createWindow({ initialPrefersDark: false });
  runBootstrapScript(window);
  window.localStorage.setItem = () => {
    throw new window.DOMException('blocked', 'SecurityError');
  };
  const select = window.document.getElementById(APPEARANCE_SELECT_ID);
  select.value = 'dark';
  assert.doesNotThrow(() =>
    select.dispatchEvent(new window.Event('change', { bubbles: true })),
  );
  const root = window.document.documentElement;
  assert.equal(root.getAttribute(APPEARANCE_RESOLVED_MODE_ATTRIBUTE), 'dark');
});

// --- Integration through renderPublication ---

/**
 * @typedef {{nodeName: string, tagName?: string, attrs?: {name: string, value: string}[], childNodes?: Parse5Node[], value?: string}} Parse5Node
 */

/**
 * Depth-first search for the first descendant element with the given tag.
 *
 * @param {Parse5Node} node a parse5 document/element node
 * @param {string} tagName the tag name to find
 * @returns {Parse5Node | undefined} the first match, if any
 */
function findByTag(node, tagName) {
  if (node.tagName === tagName) return node;
  for (const child of node.childNodes ?? []) {
    const found = findByTag(child, tagName);
    if (found) return found;
  }
  return undefined;
}

/**
 * Depth-first collection of every descendant element with the given tag.
 *
 * @param {Parse5Node} node a parse5 document/element node
 * @param {string} tagName the tag name to collect
 * @param {Parse5Node[]} out accumulator
 * @returns {Parse5Node[]} `out`
 */
function collectByTag(node, tagName, out = []) {
  if (node.tagName === tagName) out.push(node);
  for (const child of node.childNodes ?? []) collectByTag(child, tagName, out);
  return out;
}

/**
 * @param {Parse5Node} element a parse5 element node
 * @param {string} name an attribute name
 * @returns {string | undefined} the attribute's value, if present
 */
function attr(element, name) {
  return element.attrs?.find((a) => a.name === name)?.value;
}

/**
 * @param {Parse5Node} element the element to read text content from
 * @returns {string} the concatenated text of every descendant text node
 */
function textContent(element) {
  let text = '';
  for (const child of element.childNodes ?? []) {
    if (child.nodeName === '#text') text += child.value ?? '';
    else text += textContent(child);
  }
  return text;
}

test('S2-T07 acceptance: every rendered route carries the appearance control, the root attribute, the color-scheme meta and exactly one script tag', async () => {
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

    // S2-T08 added non-HTML manifest routes (feeds, sitemap, search
    // index) that never go through the shared skeleton layout at all;
    // this assertion only makes sense for the `routeClass: 'html'` subset
    // (the generated `404.html` error page still uses the layout, so it is
    // included).
    for (const route of manifest.routes.filter(
      (candidate) =>
        candidate.routeClass === 'html' || candidate.routeClass === 'error',
    )) {
      const html = await readFile(
        path.join(outputDirectory, route.path),
        'utf8',
      );
      const document = parse(html);
      const htmlElement = findByTag(document, 'html');
      assert.ok(
        htmlElement.attrs.some((a) => a.name === APPEARANCE_ROOT_ATTRIBUTE),
        `${route.path}: <html> must carry ${APPEARANCE_ROOT_ATTRIBUTE}`,
      );
      // The bootstrap script is the only browser bootstrap this renderer
      // ever emits (brief S2 section 3, "Module absence and CSP equality").
      const scripts = collectByTag(document, 'script');
      assert.equal(scripts.length, 1, `${route.path}: exactly one <script>`);
      assert.equal(
        attr(scripts[0], 'src'),
        appearanceBootstrapScriptHref(buildInput.basePath),
        `${route.path}: script src must be basePath-joined (S2-T12)`,
      );
      assert.equal(attr(scripts[0], 'defer'), undefined);
      assert.equal(attr(scripts[0], 'async'), undefined);
      assert.equal(attr(scripts[0], 'type'), undefined);

      const metas = collectByTag(document, 'meta');
      const colorSchemeMeta = metas.find(
        (m) => attr(m, 'name') === 'color-scheme',
      );
      assert.ok(colorSchemeMeta, `${route.path}: color-scheme meta present`);
      assert.equal(attr(colorSchemeMeta, 'content'), COLOR_SCHEME_META_CONTENT);

      const select = findByTag(document, 'select');
      assert.ok(select, `${route.path}: appearance control select present`);
      assert.equal(attr(select, 'id'), APPEARANCE_SELECT_ID);

      // TPL-C1 fix: the resolved-mode attribute is now server-rendered as
      // the fixed light default, so a JS-free reader (or a load where the
      // bootstrap script fails) still matches
      // `RESOLVED_PALETTE_SELECTORS.light` and sees a fully themed page,
      // never unstyled UA-default HTML. A scripted reader's phase 1 always
      // overwrites this attribute synchronously before first paint.
      assert.equal(
        attr(htmlElement, APPEARANCE_RESOLVED_MODE_ATTRIBUTE),
        APPEARANCE_SERVER_DEFAULT_RESOLVED_MODE,
        `${route.path}: resolved-mode attribute must be server-rendered as the light default`,
      );
    }
  } finally {
    await cleanup();
  }
});

test('S2-T07 acceptance: the bootstrap script is written to the candidate output directory and entered into the manifest', async () => {
  const buildInput = await loadCanonicalBuildInput();
  const joinedScriptPath = projectFixedAssetPath(
    buildInput.basePath,
    `/${APPEARANCE_BOOTSTRAP_SCRIPT_PATH}`,
  );
  const { outputDirectory, workDirectory, sourceDirectory, cleanup } =
    await createRenderDirectories();
  try {
    const { manifest } = await renderPublication(buildInput, {
      outputDirectory,
      workDirectory,
      sourceDirectory,
      provenance: testProvenance(),
    });

    // basePath fix (independent-review finding B2): the manifest path and
    // the physical file are both joined with `basePath`, matching the
    // `<script src>` this renderer emits.
    const asset = manifest.assets.find((a) => a.path === joinedScriptPath);
    assert.ok(asset, 'the bootstrap script must have a manifestAsset row');
    assert.equal(asset.mediaType, APPEARANCE_BOOTSTRAP_SCRIPT_MEDIA_TYPE);

    const bytes = await readFile(path.join(outputDirectory, joinedScriptPath));
    assert.equal(String(bytes.byteLength), asset.byteLength);
    assert.equal(bytes.toString('utf8'), APPEARANCE_BOOTSTRAP_SCRIPT_SOURCE);

    // Never mistaken for an HTML route.
    assert.ok(!manifest.routes.some((r) => r.path === joinedScriptPath));
  } finally {
    await cleanup();
  }
});

test('S2-T07 determinism: two clean builds emit byte-identical bootstrap script bytes and manifest asset rows', async () => {
  const buildInput = await loadCanonicalBuildInput();
  const joinedScriptPath = projectFixedAssetPath(
    buildInput.basePath,
    `/${APPEARANCE_BOOTSTRAP_SCRIPT_PATH}`,
  );
  const provenance = testProvenance();
  const first = await createRenderDirectories();
  const second = await createRenderDirectories();
  try {
    const resultA = await renderPublication(buildInput, {
      outputDirectory: first.outputDirectory,
      workDirectory: first.workDirectory,
      sourceDirectory: first.sourceDirectory,
      provenance,
    });
    const resultB = await renderPublication(buildInput, {
      outputDirectory: second.outputDirectory,
      workDirectory: second.workDirectory,
      sourceDirectory: second.sourceDirectory,
      provenance,
    });

    const assetA = resultA.manifest.assets.find(
      (a) => a.path === joinedScriptPath,
    );
    const assetB = resultB.manifest.assets.find(
      (a) => a.path === joinedScriptPath,
    );
    assert.deepEqual(assetA, assetB);

    const bytesA = await readFile(
      path.join(first.outputDirectory, joinedScriptPath),
    );
    const bytesB = await readFile(
      path.join(second.outputDirectory, joinedScriptPath),
    );
    assert.ok(bytesA.equals(bytesB));
  } finally {
    await first.cleanup();
    await second.cleanup();
  }
});

// --- CSP consistency: the bootstrap script is external, never inline, so
// the CSP baseline carries no hash, nonce or 'unsafe-inline' ---

test('CSP consistency: the baseline is unchanged and carries no script hash, nonce or unsafe-inline (the bootstrap is external, not inline)', async () => {
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
    // S2-T08 added non-HTML manifest routes (feeds, sitemap, search
    // index) that never go through the shared skeleton layout at all;
    // this assertion only makes sense for the `routeClass: 'html'` subset
    // (the generated `404.html` error page still uses the layout, so it is
    // included).
    for (const route of manifest.routes.filter(
      (candidate) =>
        candidate.routeClass === 'html' || candidate.routeClass === 'error',
    )) {
      const html = await readFile(
        path.join(outputDirectory, route.path),
        'utf8',
      );
      const match = html.match(
        /<meta http-equiv="Content-Security-Policy" content="([^"]*)">/,
      );
      assert.ok(match, `${route.path}: CSP meta present`);
      assert.equal(match[1], CSP_BASELINE_STRING);
      assert.ok(!match[1].includes('sha256-'));
      assert.ok(!match[1].includes('nonce-'));
      assert.ok(!match[1].includes('unsafe-inline'));
    }
  } finally {
    await cleanup();
  }
});
