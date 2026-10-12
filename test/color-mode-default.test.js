/**
 * Template 4.1.0, "Visitors see": `appearance.colorMode` reaches the page.
 * The default is rendered as `data-gala-color-mode-default` and, for `light`
 * or `dark`, as the server-resolved mode; the page script prefers the
 * reader's stored choice, else the author's default, else `system`; a single
 * allowed mode renders no toggle and sets `color-scheme` to that mode.
 */

import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

import { JSDOM } from 'jsdom';
import { parse } from 'parse5';

import { renderPublication } from '../src/core/index.js';
import {
  APPEARANCE_ALLOWED_ATTRIBUTE,
  APPEARANCE_DEFAULT_ATTRIBUTE,
  APPEARANCE_RESOLVED_MODE_ATTRIBUTE,
  APPEARANCE_ROOT_ATTRIBUTE,
  APPEARANCE_SELECTION_ATTRIBUTE,
  APPEARANCE_STORAGE_KEY,
  APPEARANCE_TOGGLE_ID,
  resolveColorModePresentation,
} from '../src/core/internal/appearance/contract.js';
import { APPEARANCE_BOOTSTRAP_SCRIPT_SOURCE } from '../src/core/internal/appearance/bootstrap-script.js';
import { renderAppearanceControl } from '../src/core/internal/appearance/controller-markup.js';
import { getMessages } from '../src/core/internal/messages.js';
import {
  createRenderDirectories,
  testProvenance,
} from './helpers/render-fixtures.js';
import { loadCanonicalBuildInput } from './helpers/schema-fixtures.js';

/**
 * @param {import('parse5').DefaultTreeAdapterMap['node']} node
 * @param {(node: any) => boolean} predicate
 * @param {any[]} [out]
 * @returns {any[]} matching descendants
 */
function collect(node, predicate, out = []) {
  if (predicate(node)) out.push(node);
  for (const child of /** @type {any} */ (node).childNodes ?? []) {
    collect(child, predicate, out);
  }
  return out;
}

/**
 * @param {any} element a parse5 element
 * @param {string} name attribute name
 * @returns {string | undefined} its value
 */
const attr = (element, name) =>
  element.attrs.find((/** @type {any} */ a) => a.name === name)?.value;

/**
 * Render the canonical build input with one `colorMode` and read back the
 * facts of its home page.
 *
 * @param {{allowed: string[], default: string}} colorMode
 * @returns {Promise<{root: Record<string, string | undefined>, scheme: string | undefined, toggles: number}>}
 */
async function renderWith(colorMode) {
  const buildInput = await loadCanonicalBuildInput();
  buildInput.appearance.colorMode = colorMode;
  const { outputDirectory, workDirectory, sourceDirectory, cleanup } =
    await createRenderDirectories();
  try {
    const { manifest } = await renderPublication(buildInput, {
      outputDirectory,
      workDirectory,
      sourceDirectory,
      provenance: testProvenance(),
    });
    const routes = manifest.routes.filter(
      (route) => route.routeClass === 'html' || route.routeClass === 'error',
    );
    assert.ok(routes.length > 1);
    /** @type {any} */
    let first;
    for (const route of routes) {
      const html = await readFile(
        path.join(outputDirectory, route.path),
        'utf8',
      );
      const document = parse(html);
      const htmlElement = collect(document, (n) => n.tagName === 'html')[0];
      const facts = {
        root: {
          present: attr(htmlElement, APPEARANCE_ROOT_ATTRIBUTE),
          resolved: attr(htmlElement, APPEARANCE_RESOLVED_MODE_ATTRIBUTE),
          default: attr(htmlElement, APPEARANCE_DEFAULT_ATTRIBUTE),
          allowed: attr(htmlElement, APPEARANCE_ALLOWED_ATTRIBUTE),
        },
        scheme: attr(
          collect(
            document,
            (n) => n.tagName === 'meta' && attr(n, 'name') === 'color-scheme',
          )[0],
          'content',
        ),
        toggles: collect(
          document,
          (n) =>
            n.tagName === 'button' && attr(n, 'id') === APPEARANCE_TOGGLE_ID,
        ).length,
      };
      if (first === undefined) first = facts;
      assert.deepEqual(facts, first, `${route.path}: every page agrees`);
    }
    return first;
  } finally {
    await cleanup();
  }
}

const ALL = ['system', 'light', 'dark'];

test('a dark default is the server-resolved mode, on every page', async () => {
  const facts = await renderWith({ allowed: ALL, default: 'dark' });
  assert.equal(facts.root.default, 'dark');
  assert.equal(facts.root.resolved, 'dark');
  assert.equal(facts.root.allowed, 'light dark system');
  assert.equal(facts.scheme, 'light dark');
  assert.equal(facts.toggles, 1);
});

test('a light default is the server-resolved mode', async () => {
  const facts = await renderWith({ allowed: ALL, default: 'light' });
  assert.equal(facts.root.default, 'light');
  assert.equal(facts.root.resolved, 'light');
  assert.equal(facts.toggles, 1);
});

test('a system default renders the attribute and keeps the light server default', async () => {
  const facts = await renderWith({ allowed: ALL, default: 'system' });
  assert.equal(facts.root.default, 'system');
  assert.equal(facts.root.resolved, 'light');
  assert.equal(facts.scheme, 'light dark');
  assert.equal(facts.toggles, 1);
});

test('a single allowed light or dark mode renders no toggle and sets color-scheme to it', async () => {
  for (const mode of ['light', 'dark']) {
    const facts = await renderWith({ allowed: [mode], default: mode });
    assert.equal(facts.toggles, 0, `${mode}: no toggle`);
    assert.equal(facts.scheme, mode, `${mode}: color-scheme`);
    assert.equal(facts.root.resolved, mode);
    assert.equal(facts.root.allowed, mode);
  }
});

test('a single allowed system mode renders no toggle and keeps color-scheme light dark', async () => {
  const facts = await renderWith({ allowed: ['system'], default: 'system' });
  assert.equal(facts.toggles, 0);
  assert.equal(facts.scheme, 'light dark');
});

test('two allowed modes keep the toggle', async () => {
  const facts = await renderWith({
    allowed: ['light', 'dark'],
    default: 'dark',
  });
  assert.equal(facts.toggles, 1);
  assert.equal(facts.root.allowed, 'light dark');
  assert.equal(facts.scheme, 'light dark');
});

test('resolveColorModePresentation falls back to the former fixed behaviour without colorMode', () => {
  const presentation = resolveColorModePresentation(undefined);
  assert.equal(presentation.defaultMode, 'system');
  assert.equal(presentation.resolvedMode, 'light');
  assert.equal(presentation.colorScheme, 'light dark');
  assert.equal(presentation.toggle, true);
  assert.equal(
    renderAppearanceControl({ messages: getMessages('en'), toggle: false }),
    '',
  );
});

// --- the page script ---

/**
 * @param {object} options
 * @param {string | undefined} options.defaultMode root default attribute
 * @param {string | undefined} options.allowed root allowed attribute
 * @param {boolean} [options.prefersDark] system preference
 * @param {string} [options.stored] stored reader choice
 * @returns {import('jsdom').DOMWindow} the window after the script ran
 */
function runScript({ defaultMode, allowed, prefersDark = false, stored }) {
  const controlHtml = renderAppearanceControl({ messages: getMessages('en') });
  const attributes =
    (defaultMode === undefined
      ? ''
      : ` ${APPEARANCE_DEFAULT_ATTRIBUTE}="${defaultMode}"`) +
    (allowed === undefined
      ? ''
      : ` ${APPEARANCE_ALLOWED_ATTRIBUTE}="${allowed}"`);
  const dom = new JSDOM(
    `<!doctype html><html ${APPEARANCE_ROOT_ATTRIBUTE}${attributes}><head></head><body>${controlHtml}</body></html>`,
    { runScripts: 'dangerously', url: 'https://fixture.example.test/' },
  );
  const { window } = dom;
  window.matchMedia = (/** @type {string} */ query) => ({
    matches: query === '(prefers-color-scheme: dark)' ? prefersDark : false,
    addEventListener() {},
    removeEventListener() {},
  });
  if (stored !== undefined) {
    window.localStorage.setItem(APPEARANCE_STORAGE_KEY, stored);
  }
  window.eval(APPEARANCE_BOOTSTRAP_SCRIPT_SOURCE);
  window.document.dispatchEvent(new window.Event('DOMContentLoaded'));
  return window;
}

const facts = (/** @type {import('jsdom').DOMWindow} */ window) => {
  const root = window.document.documentElement;
  return [
    root.getAttribute(APPEARANCE_SELECTION_ATTRIBUTE),
    root.getAttribute(APPEARANCE_RESOLVED_MODE_ATTRIBUTE),
  ];
};

test('script: a reader with no stored choice gets the author default, whatever the system prefers', () => {
  assert.deepEqual(
    facts(
      runScript({
        defaultMode: 'dark',
        allowed: 'system light dark',
        prefersDark: false,
      }),
    ),
    ['dark', 'dark'],
  );
  assert.deepEqual(
    facts(
      runScript({
        defaultMode: 'light',
        allowed: 'system light dark',
        prefersDark: true,
      }),
    ),
    ['light', 'light'],
  );
  assert.deepEqual(
    facts(
      runScript({
        defaultMode: 'system',
        allowed: 'system light dark',
        prefersDark: true,
      }),
    ),
    ['system', 'dark'],
  );
});

test('script: no author default (older markup) falls back to system', () => {
  assert.deepEqual(
    facts(
      runScript({
        defaultMode: undefined,
        allowed: undefined,
        prefersDark: true,
      }),
    ),
    ['system', 'dark'],
  );
});

test('script: the reader stored choice wins over the author default', () => {
  assert.deepEqual(
    facts(
      runScript({
        defaultMode: 'dark',
        allowed: 'system light dark',
        stored: 'light',
      }),
    ),
    ['light', 'light'],
  );
});

test('script: a stored choice the author no longer allows is ignored', () => {
  assert.deepEqual(
    facts(runScript({ defaultMode: 'dark', allowed: 'dark', stored: 'light' })),
    ['dark', 'dark'],
  );
});

test('script: the toggle cycles only through allowed modes', () => {
  const window = runScript({ defaultMode: 'dark', allowed: 'light dark' });
  const button = window.document.getElementById(APPEARANCE_TOGGLE_ID);
  assert.ok(button);
  assert.equal(button.hidden, false);
  const seen = [facts(window)[0]];
  for (let i = 0; i < 3; i += 1) {
    button.click();
    seen.push(facts(window)[0]);
  }
  assert.deepEqual(seen, ['dark', 'light', 'dark', 'light']);
});

test('script: with a single allowed mode the toggle stays hidden', () => {
  const window = runScript({ defaultMode: 'dark', allowed: 'dark' });
  const button = window.document.getElementById(APPEARANCE_TOGGLE_ID);
  assert.ok(button);
  assert.equal(button.hidden, true);
});
