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
  for (const name of [
    'interactions',
    'counts',
    'signals',
    'audience',
    'listen',
  ]) {
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
    { interactive: { ...interactive, viewer: 'admin' } },
  ]) {
    assert.throws(() => render(bad), PreviewInputError, JSON.stringify(bad));
  }
  assert.ok(render({ interactive: { ...interactive, liveBaseUrl: null } }));
  const viewerOf = (/** @type {any} */ i) =>
    JSON.parse(
      /data-gala-preview-data>([\s\S]*?)<\/script>/.exec(
        render({ interactive: i }).html,
      )?.[1] ?? '{}',
    ).viewer;
  assert.equal(viewerOf(interactive), 'reader');
  assert.equal(viewerOf({ ...interactive, viewer: 'visitor' }), 'visitor');
  assert.equal(viewerOf({ ...interactive, viewer: 'reader' }), 'reader');
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

const API = 'https://api.galascribe.com';
const COUNTS = `${API}/v2/public/publications/p/interaction-counts?contentIds=a`;

test('interactive.cache is validated', async () => {
  const getMessages = await loadMessagesFor(previewLanguages(input()));
  const render = (/** @type {any} */ cache) =>
    renderContentPreview(input(), {
      getMessages,
      preview: { interactive: { apiOrigin: API, cache } },
    });
  const entry = { status: 200, body: '{}' };
  assert.ok(render({ [COUNTS]: entry }));
  assert.ok(render({}));
  const big = 'x'.repeat(64 * 1024);
  assert.ok(render({ [COUNTS]: { status: 200, body: big } }));
  const many = Object.fromEntries(
    Array.from({ length: 16 }, (_, i) => [
      `${COUNTS}${i}`,
      { status: 200, body: big },
    ]),
  );
  assert.ok(render(many), 'exactly 1 MB is allowed');
  for (const bad of [
    [],
    null,
    'x',
    { 'https://evil.example/v2/public/x': entry },
    { [`${API}/v2/private/x`]: entry },
    { [`${API}.evil.example/v2/public/x`]: entry },
    { [COUNTS]: { status: 404, body: '{}' } },
    { [COUNTS]: { status: 200, body: 5 } },
    { [COUNTS]: { status: 200 } },
    { [COUNTS]: null },
    { [COUNTS]: { status: 200, body: `${big}x` } },
    { [COUNTS]: { status: 200, body: 'é'.repeat(32 * 1024 + 1) } },
    { ...many, [`${COUNTS}z`]: entry },
  ]) {
    assert.throws(
      () => render(bad),
      PreviewInputError,
      JSON.stringify(bad)?.slice(0, 80),
    );
  }
});

test('a hostile cache body cannot leave the data block', async () => {
  const getMessages = await loadMessagesFor(previewLanguages(input()));
  const body = '{"a":"</script><script>window.__ran=1</script><!-- x"}';
  const { html } = renderContentPreview(input(), {
    getMessages,
    preview: {
      interactive: {
        apiOrigin: API,
        cache: { [COUNTS]: { status: 200, body } },
      },
    },
  });
  const block = /data-gala-preview-data>([\s\S]*?)<\/script>/.exec(html)?.[1];
  assert.ok(block);
  assert.ok(!/<\/script|<!--|<script/i.test(block));
  assert.equal(JSON.parse(block).cache[COUNTS].body, body);
  const scripts = [...html.matchAll(/<script\b([^>]*)>/g)].map((m) => m[1]);
  assert.ok(
    scripts.every(
      (attrs) => attrs === '' || /type="application\/(ld\+)?json"/.test(attrs),
    ),
  );
  assert.ok(!html.includes('window.__ran=1</script>'));
});

test('the cache only changes the data block', async () => {
  const getMessages = await loadMessagesFor(previewLanguages(input()));
  const render = (/** @type {any} */ extra) =>
    renderContentPreview(input(), {
      getMessages,
      preview: { interactive: { apiOrigin: API, ...extra } },
    }).html;
  const strip = (/** @type {string} */ html) =>
    html.replace(/(data-gala-preview-data>)[\s\S]*?(<\/script>)/, '$1$2');
  assert.equal(
    strip(render({ cache: { [COUNTS]: { status: 200, body: '{}' } } })),
    strip(render({})),
  );
});

test('the runtime reports real GETs and serves the cache', () => {
  assert.match(PREVIEW_RUNTIME_SOURCE, /gala-preview-cache/);
  assert.match(PREVIEW_RUNTIME_SOURCE, /cfg\.cache/);
});

test('addresses the build refuses are refused by the preview', async () => {
  const getMessages = await loadMessagesFor(previewLanguages(input()));
  const refuse = (
    /** @type {(i: any) => void} */ edit,
    /** @type {RegExp} */ re,
  ) => {
    const bad = input();
    edit(bad);
    assert.throws(
      () => renderContentPreview(bad, { getMessages }),
      (/** @type {any} */ error) =>
        error instanceof PreviewInputError &&
        error.issues.some((/** @type {string} */ issue) => re.test(issue)),
      String(re),
    );
  };
  const accept = (/** @type {(i: any) => void} */ edit) => {
    const ok = input();
    edit(ok);
    assert.ok(renderContentPreview(ok, { getMessages }).html);
  };
  const item = (/** @type {any} */ extra) => ({
    type: 'external',
    label: 'L',
    children: [],
    ...extra,
  });
  for (const scheme of [
    'javascript:alert(1)',
    'data:text/html,x',
    'file:///etc/passwd',
    'vbscript:x',
    ' JaVaScRiPt:x',
    'http://a.example/',
    '//a.example/',
    'mailto:a@b.c',
  ]) {
    refuse((i) => {
      i.navigation = {
        items: [
          item({ url: 'https://ok.example/' }),
          item({ url: 'https://ok.example/' }),
          item({ url: scheme }),
        ],
      };
    }, /^navigation\.items\[2\]\.url uses an address the site can't publish \(/);
  }
  refuse((i) => {
    i.navigation = { items: [item({ url: 'javascript:x' })] };
  }, /\(javascript:\)/);
  refuse((i) => {
    i.navigation = { items: [], footerItems: [item({ url: 'data:x' })] };
  }, /^navigation\.footerItems\[0\]\.url .*\(data:\)/);
  refuse((i) => {
    i.navigation = {
      items: [
        { type: 'internal', label: 'L', route: 'javascript:x', children: [] },
      ],
    };
  }, /^navigation\.items\[0\]\.route .*\(javascript:\)/);
  refuse((i) => {
    i.navigation = {
      items: [
        { type: 'internal', label: 'L', route: '//evil.example', children: [] },
      ],
    };
  }, /navigation\.items\[0\]\.route/);
  refuse((i) => {
    i.navigation = {
      items: [
        {
          type: 'external',
          label: 'L',
          url: 'https://ok.example/',
          children: [item({ url: 'vbscript:x' })],
        },
      ],
    };
  }, /^navigation\.items\[0\]\.children\[0\]\.url .*\(vbscript:\)/);
  refuse((i) => {
    i.publication.socialLinks = [{ type: 'github', uri: 'javascript:x' }];
  }, /^publication\.socialLinks\[0\]\.uri .*\(javascript:\)/);
  refuse((i) => {
    i.publication.socialLinks = [{ type: 'github', uri: 'mailto:a@b.c' }];
  }, /socialLinks\[0\]\.uri/);
  refuse((i) => {
    i.publication.socialLinks = [{ type: 'email', uri: 'https://ok.example/' }];
  }, /socialLinks\[0\]\.uri/);
  refuse((i) => {
    i.publication.socialLinks = [
      { type: 'website', uri: 'https://user@ok.example/' },
    ];
  }, /socialLinks\[0\]\.uri/);
  refuse((i) => {
    i.authors[0].links = [{ type: 'website', uri: 'file:///x' }];
  }, /^authors\[0\]\.links\[0\]\.uri .*\(file:\)/);
  refuse((i) => {
    i.publication.newsletter = { url: 'data:x', title: 't', text: 't' };
  }, /^publication\.newsletter\.url .*\(data:\)/);
  accept((i) => {
    i.navigation = {
      items: [
        item({ url: 'https://ok.example/a?b#c' }),
        { type: 'internal', label: 'L', route: '/about/', children: [] },
      ],
      footerItems: [{ type: 'internal', label: 'L', route: '/', children: [] }],
    };
    i.publication.socialLinks = [
      { type: 'email', uri: 'mailto:a@b.c' },
      { type: 'github', uri: 'https://github.com/x' },
    ];
    i.authors[0].links = [{ type: 'website', uri: 'https://ok.example/' }];
    i.publication.newsletter = { mode: 'galascribe', title: 't', text: 't' };
  });
});
