/**
 * The article preview runs where a browser runs it: a child process removes
 * `process`, `Buffer`, `global` and `require` from the global scope once the
 * preview entry and its catalogs are loaded, renders an article, a page, the
 * home page, a language section home, a profile page and a policy page (Markdown with a highlighted
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
  renderContentPreview,
  renderHomePreview,
  renderPolicyPreview,
  renderProfilePreview,
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
  const { post } = input;
  const site = Object.fromEntries(
    Object.entries(input).filter(
      ([key]) => key !== 'post' && key !== 'siblings',
    ),
  );
  const homeInput = {
    ...site,
    posts: [
      {
        frontmatter: {
          ...post.frontmatter,
          hero: {
            file: { path: 'img/dot.png' },
            alt: 'A dot',
            role: 'informative',
          },
        },
        markdown: post.markdown,
      },
      {
        frontmatter: {
          ...post.frontmatter,
          id: '019c0000-0000-7000-8000-000000000002',
          title: 'Tamil',
          language: 'ta',
          slug: 'tamil',
          translationOf: 'hello',
          tags: [],
        },
        markdown: 'தமிழ்\n',
      },
    ],
  };
  const pageInput = {
    ...site,
    post: {
      frontmatter: {
        ...post.frontmatter,
        id: '019c0000-0000-7000-8000-000000000003',
        kind: 'page',
        slug: 'colophon',
        title: 'Colophon',
      },
      markdown: '# Colophon\n\nA page.\n',
    },
  };
  const profileInput = {
    ...site,
    profile: { route: '/about', body: { markdown: 'About **us**.\n' } },
  };
  const policyInput = {
    ...site,
    policies: {
      terms: { title: 'Terms', body: { markdown: 'Be kind.\n' } },
      privacy: { title: 'Privacy', body: { markdown: 'No data.\n' } },
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
  const expectedHome = renderHomePreview(homeInput, {
    ...options,
    getMessages: await loadMessagesFor(previewLanguages(homeInput)),
  });
  const get = async (/** @type {any} */ i) =>
    loadMessagesFor(['en-US', 'ta', ...previewLanguages(i)]);
  const withAll = { ...options, getMessages: await get(homeInput) };
  const expectedPage = renderContentPreview(pageInput, withAll);
  const expectedSection = renderHomePreview(homeInput, {
    ...withAll,
    language: 'ta',
  });
  const expectedProfile = renderProfilePreview(profileInput, withAll);
  const expectedPolicy = renderPolicyPreview(
    policyInput,
    { page: 'terms' },
    withAll,
  );
  assert.equal(expectedPage.route, '/colophon');
  assert.equal(expectedSection.route, '/ta');
  assert.equal(expectedProfile.route, '/about');
  assert.equal(expectedPolicy.route, '/terms');
  assert.ok(expectedPolicy.html.includes('<h2>Galascribe</h2>'));
  assert.equal(expectedHome.route, '/');
  assert.match(expectedHome.html, /data-gala-home-layout=/);
  assert.ok(
    expectedHome.html.includes('alt="A dot"'),
    'home lists the post with its hero',
  );
  assert.ok(
    expected.html.includes('<span class="token keyword">const</span>'),
    'the fences are highlighted',
  );

  const directory = await mkdtemp(path.join(tmpdir(), 'gala-preview-runtime-'));
  try {
    const requestFile = path.join(directory, 'request.json');
    await writeFile(
      requestFile,
      JSON.stringify({
        input,
        homeInput,
        pageInput,
        profileInput,
        policyInput,
        options,
      }),
    );
    const { stdout } = await run(
      process.execPath,
      [
        fileURLToPath(
          new URL(
            '../scripts/preview-without-node-globals.mjs',
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
    assert.deepEqual(actual.home, expectedHome);
    assert.deepEqual(actual.page, expectedPage);
    assert.deepEqual(actual.section, expectedSection);
    assert.deepEqual(actual.profile, expectedProfile);
    assert.deepEqual(actual.policy, expectedPolicy);
    assert.deepEqual(actual.warnings, []);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
