/**
 * The article preview runs where a browser runs it: a child process removes
 * `process`, `Buffer`, `global` and `require` from the global scope once the
 * preview entry and its catalogs are loaded, renders an article (Markdown with a highlighted
 * fence, an image, a theme and palette), and the document equals the one
 * rendered here with those globals present.
 */

import { strict as assert } from 'node:assert';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

import {
  loadMessagesFor,
  previewLanguages,
  renderArticlePreview,
} from '../src/core/preview.js';

const run = promisify(execFile);
const THEME = fileURLToPath(
  new URL('./fixtures/theme-fixture-full', import.meta.url),
);
const AUTHOR = '019c0000-0000-7000-8000-000000000001';
const PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

test('the preview renders with process, Buffer, global and require removed', async () => {
  const themeJson = JSON.parse(
    await readFile(path.join(THEME, 'theme.json'), 'utf8'),
  );
  const input = {
    publication: {
      id: AUTHOR,
      title: 'Browser Demo',
      description: 'A publication',
      defaultLanguage: 'en-US',
    },
    authors: [
      { id: AUTHOR, displayName: 'Ann Author', avatar: { path: 'a.png' } },
    ],
    navigation: { items: [] },
    appearance: {
      colorMode: { default: 'system', allowed: ['system', 'light', 'dark'] },
    },
    post: {
      frontmatter: {
        id: AUTHOR,
        title: 'Hello',
        language: 'en-US',
        slug: 'hello',
        publishedAt: '2026-01-02T09:00:00.000Z',
        authorIds: [AUTHOR],
        tags: ['one'],
      },
      markdown:
        '# Hello\n\nText.\n\n```javascript\nconst a = 1;\n```\n\n```markup\n<p class="x">hi</p>\n```\n\n![Dot](img/dot.png)\n',
    },
    siblings: [],
    baseUrl: 'https://blog.example/',
    basePath: '/',
    media: {
      'a.png': { url: PNG, width: 1, height: 1 },
      'img/dot.png': { url: PNG, width: 1, height: 1 },
    },
    theme: {
      themeJson,
      stylesheets: await Promise.all(
        themeJson.stylesheets.map(async (/** @type {string} */ name) => ({
          filename: name,
          css: await readFile(path.join(THEME, name), 'utf8'),
        })),
      ),
    },
  };
  const options = {
    preview: {
      inlineStyles: true,
      omitScripts: true,
      contentSecurityPolicy: "default-src 'none'; img-src data:",
      inertLinks: true,
      colorMode: 'light',
    },
  };
  const expected = renderArticlePreview(input, {
    ...options,
    getMessages: await loadMessagesFor(previewLanguages(input)),
  });
  assert.ok(
    expected.html.includes('<span class="token keyword">const</span>'),
    'the fences are highlighted',
  );

  const directory = await mkdtemp(path.join(tmpdir(), 'gala-preview-runtime-'));
  try {
    const requestFile = path.join(directory, 'request.json');
    await writeFile(requestFile, JSON.stringify({ input, options }));
    const { stdout } = await run(
      process.execPath,
      [
        fileURLToPath(
          new URL(
            './helpers/preview-without-node-globals.mjs',
            import.meta.url,
          ),
        ),
        requestFile,
        pathToFileURL(
          fileURLToPath(new URL('../src/core/preview.js', import.meta.url)),
        ).href,
      ],
      { maxBuffer: 16 * 1024 * 1024 },
    );
    const actual = JSON.parse(stdout);
    assert.equal(actual.html, expected.html);
    assert.equal(actual.title, expected.title);
    assert.deepEqual(actual.warnings, []);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
