/**
 * The IndexNow key file: `<publication.id>.txt` under the site base, holding
 * the id and one newline, a manifest asset and in no discovery output.
 */

import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

import { renderPublication } from '../src/core/index.js';
import {
  indexNowKey,
  indexNowKeyFileContent,
  indexNowRoute,
} from '../src/core/internal/indexnow.js';
import { buildRichFixture } from './helpers/page-kind-fixtures.js';
import {
  createRenderDirectories,
  testProvenance,
} from './helpers/render-fixtures.js';
import { applyCurrentRenderPolicy } from './helpers/schema-fixtures.js';

/**
 * @param {{baseUrl?: string, basePath?: string}} overrides build input overrides
 * @returns {Promise<{id: string, manifest: any, files: Record<string, string>}>}
 *   the publication id, the manifest and every manifest file's text
 */
async function render(overrides) {
  const buildInput = /** @type {any} */ (await buildRichFixture());
  buildInput.basePath = '/';
  for (const record of buildInput.content) {
    record.frontmatter.route = `/${record.frontmatter.slug ?? 'fixture-1'}`;
  }
  Object.assign(buildInput, overrides);
  await applyCurrentRenderPolicy(buildInput);
  const { outputDirectory, workDirectory, sourceDirectory, cleanup } =
    await createRenderDirectories();
  try {
    const { manifest } = await renderPublication(buildInput, {
      outputDirectory,
      workDirectory,
      sourceDirectory,
      provenance: testProvenance(),
    });
    /** @type {Record<string, string>} */
    const files = {};
    for (const route of manifest.routes) {
      files[route.path] = await readFile(
        path.join(outputDirectory, route.path),
        'utf8',
      );
    }
    return { id: buildInput.publication.id, manifest, files };
  } finally {
    await cleanup();
  }
}

/**
 * @param {string} id the publication id
 * @param {{manifest: any, files: Record<string, string>}} out a render
 * @param {string} keyPath the expected manifest path of the key file
 * @returns {void}
 */
function assertKeyFile(id, out, keyPath) {
  assert.equal(out.files[keyPath], `${id}\n`);
  const row = out.manifest.routes.find(
    (/** @type {any} */ r) => r.path === keyPath,
  );
  assert.ok(row, 'key file is a manifest row');
  assert.equal(row.routeClass, 'asset');
  assert.equal(row.mediaType, 'text/plain; charset=utf-8');
  for (const [file, text] of Object.entries(out.files)) {
    if (file === keyPath) continue;
    if (/sitemap|search-index|llms|feed|atom|rss/.test(file)) {
      assert.ok(!text.includes(id + '.txt'), `${file} must not list the key`);
    }
  }
}

test('key file at the host root', async () => {
  const out = await render({ baseUrl: 'https://example.test/' });
  assertKeyFile(out.id, out, `${out.id}.txt`);
});

test('key file under a baseUrl path and a basePath', async () => {
  const withUrl = await render({ baseUrl: 'https://example.test/site/' });
  assertKeyFile(withUrl.id, withUrl, `${withUrl.id}.txt`);
  const withBase = await render({
    baseUrl: 'https://example.test/',
    basePath: '/blog',
  });
  assertKeyFile(withBase.id, withBase, `blog/${withBase.id}.txt`);
});

test('key helpers validate the IndexNow grammar', () => {
  const id = '0b6f1c52-3d4e-4a8b-9c1d-5e7f8a9b0c1d';
  assert.equal(indexNowKey({ id }), id);
  assert.equal(indexNowRoute(id), `/${id}.txt`);
  assert.equal(indexNowKeyFileContent(id), `${id}\n`);
  for (const bad of ['short', 'has space-1234', 'a'.repeat(129), '', 5]) {
    assert.throws(() => indexNowKey({ id: bad }));
  }
});
