/**
 * The interactive preview's static guarantees: the generated script texts are
 * exactly the files the build writes, the runtime is valid and constant, the
 * option is validated and exclusive, the runtime-only messages exist in every
 * catalog, and the document carries no way to run anything but the listed
 * scripts. (Behavior in a real browser is proved by the Playwright suite run
 * at release time; page parity is `preview-parity.test.js`.)
 */

import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import vm from 'node:vm';

import { PREVIEW_SCRIPT_TEXTS } from '../src/core/internal/preview-scripts-data.js';
import { PREVIEW_RUNTIME_SOURCE } from '../src/core/internal/preview-runtime-source.js';
import { CATALOGS } from '../src/core/internal/messages/registry.js';
import {
  PreviewInputError,
  loadMessagesFor,
  previewLanguages,
  renderContactPreview,
  renderContentPreview,
} from '../src/core/preview.js';

const AUTHOR = '019c0000-0000-7000-8000-000000000001';

test('the generated script texts are the browser script files, byte for byte', async () => {
  for (const name of ['interactions', 'counts', 'audience', 'listen']) {
    const text = await readFile(
      new URL(
        `../src/modules/interactions/browser/gala-${name}.js`,
        import.meta.url,
      ),
      'utf8',
    );
    assert.equal(
      /** @type {Record<string, string>} */ (PREVIEW_SCRIPT_TEXTS)[name],
      text,
      `${name}: run node scripts/generate-preview-scripts.mjs`,
    );
  }
});

test('the runtime parses, is constant, and holds no eval', () => {
  new vm.Script(PREVIEW_RUNTIME_SOURCE);
  assert.ok(!/\beval\s*\(|new Function|unsafe-/.test(PREVIEW_RUNTIME_SOURCE));
  assert.ok(!PREVIEW_RUNTIME_SOURCE.includes('</script'));
  for (const text of Object.values(PREVIEW_SCRIPT_TEXTS)) {
    assert.ok(!/<\/script|<!--/i.test(text));
  }
});

test('every catalog has the four runtime-only messages', () => {
  for (const [tag, catalog] of Object.entries(CATALOGS)) {
    for (const key of [
      'previewNotSavedLabel',
      'previewSignInUnavailableLabel',
      'previewNotPublishedLabel',
      'previewAudioUnavailableLabel',
    ]) {
      assert.equal(typeof catalog[key], 'string', `${tag}.${key}`);
    }
  }
});

/** @returns {any} a minimal content input */
function input() {
  return {
    publication: {
      id: AUTHOR,
      title: 'Demo',
      defaultLanguage: 'en',
      contactForm: { enabled: true, fields: { website: false, phone: false } },
    },
    authors: [{ id: AUTHOR, displayName: 'Ann' }],
    navigation: { items: [] },
    appearance: {
      colorMode: { default: 'system', allowed: ['system', 'light', 'dark'] },
    },
    post: {
      frontmatter: {
        id: AUTHOR,
        title: 'Hello <script>window.__ran = 1</script>',
        language: 'en',
        slug: 'hello',
        publishedAt: '2025-01-01T00:00:00.000Z',
        authorIds: [AUTHOR],
      },
      markdown:
        'Text <img src=x onerror="window.__ran=1"> [x](javascript:window.__ran=1)\n\n<form action="https://evil.example"><input name=a></form>\n',
    },
    baseUrl: 'https://example.com/',
    basePath: '/',
  };
}

test('the option is validated and exclusive', async () => {
  const getMessages = await loadMessagesFor(previewLanguages(input()));
  const render = (/** @type {any} */ preview) =>
    renderContentPreview(input(), { getMessages, preview });
  const interactive = { apiOrigin: 'https://api.galascribe.com' };
  assert.ok(render({ interactive }).html.includes('data-gala-preview-data'));
  for (const bad of [
    { interactive, omitScripts: true },
    { interactive, inertLinks: true },
    { interactive, contentSecurityPolicy: "default-src 'none'" },
    { interactive, inlineStyles: false },
    { interactive: {} },
    { interactive: { apiOrigin: 'ftp://x' } },
    { interactive: { ...interactive, liveBaseUrl: 'nope' } },
    { interactive: { ...interactive, scrollY: -1 } },
    { interactive: { ...interactive, extra: 1 } },
  ]) {
    assert.throws(() => render(bad), PreviewInputError, JSON.stringify(bad));
  }
  assert.ok(render({ interactive: { ...interactive, liveBaseUrl: null } }));
});

test('hostile titles and bodies add no script, handler or reachable form action', async () => {
  const getMessages = await loadMessagesFor(previewLanguages(input()));
  const { html } = renderContentPreview(input(), {
    getMessages,
    preview: { interactive: { apiOrigin: 'https://api.galascribe.com' } },
  });
  const scripts = [...html.matchAll(/<script\b([^>]*)>/g)].map((m) => m[1]);
  // The data block, the runtime, the bootstrap, and JSON-LD: nothing else.
  assert.ok(
    scripts.every(
      (attrs) => attrs === '' || /type="application\/(ld\+)?json"/.test(attrs),
    ),
    scripts.join('|'),
  );
  const markup = html.replace(/<script[\s\S]*?<\/script>/g, '');
  assert.equal(
    /<[a-z][^>]*\son[a-z]+\s*=[^>]{0,60}/i.exec(
      markup.replace(/"[^"]*"/g, '""'),
    )?.[0],
    undefined,
  );
  assert.ok(!/href="javascript:/i.test(html));
  assert.ok(!/<form\b/i.test(markup), 'no form from the body');
});

test('the contact page renders only while the form is on', async () => {
  const on = input();
  const getMessages = await loadMessagesFor(previewLanguages(on));
  const page = renderContactPreview(on, { getMessages });
  assert.equal(page.route, '/contact');
  assert.match(page.html, /g-contact/);
  const off = input();
  off.publication.contactForm.enabled = false;
  assert.throws(
    () => renderContactPreview(off, { getMessages }),
    PreviewInputError,
  );
});
