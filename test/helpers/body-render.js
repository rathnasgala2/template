/**
 * Shared by the tests that build a whole site from a rich fixture whose
 * content record has a Markdown body and a staged `media[]` inventory.
 */

import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { renderPublication } from '../../src/core/index.js';
import { normalizeAuthoredMarkdown } from '../../src/core/internal/content-security.js';
import { buildRichFixture } from './page-kind-fixtures.js';
import { createRenderDirectories, testProvenance } from './render-fixtures.js';
import { applyCurrentRenderPolicy } from './schema-fixtures.js';
import { sha256Of } from './media-fixtures.js';

/**
 * @typedef {{path: string, bytes: Buffer, mediaType?: string}} StagedFile
 */

/**
 * Give one content record a Markdown body and a `media[]` inventory, staging
 * each inventoried file's bytes under the render's source directory.
 *
 * @param {any} buildInput the build input, mutated in place
 * @param {string} sourceDirectory the render's source directory
 * @param {number} index the content record to change
 * @param {string} markdown the record's authored Markdown body
 * @param {StagedFile[]} files the record's inventory
 * @returns {Promise<void>}
 */
export async function setBody(
  buildInput,
  sourceDirectory,
  index,
  markdown,
  files,
) {
  const record = buildInput.content[index];
  record.body = normalizeAuthoredMarkdown(markdown).html;
  record.media = [];
  for (const file of files) {
    const absolute = path.join(sourceDirectory, file.path);
    await mkdir(path.dirname(absolute), { recursive: true });
    await writeFile(absolute, file.bytes);
    record.media.push({
      path: file.path,
      sourceDigest: sha256Of(file.bytes),
      mediaType: file.mediaType ?? 'image/png',
      byteLength: file.bytes.byteLength,
    });
  }
}

/**
 * Render a rich fixture after `prepare` has set bodies and inventories.
 *
 * @param {(buildInput: any, sourceDirectory: string) => Promise<void>} prepare
 * @returns {Promise<{manifest: any, outputDirectory: string, read: (file: string) => Promise<string>, cleanup: () => Promise<void>}>}
 */
export async function render(prepare) {
  const buildInput = /** @type {any} */ (await buildRichFixture());
  const dirs = await createRenderDirectories();
  await prepare(buildInput, dirs.sourceDirectory);
  await applyCurrentRenderPolicy(buildInput);
  const { manifest } = await renderPublication(buildInput, {
    outputDirectory: dirs.outputDirectory,
    workDirectory: dirs.workDirectory,
    sourceDirectory: dirs.sourceDirectory,
    provenance: testProvenance(),
  });
  return {
    manifest,
    outputDirectory: dirs.outputDirectory,
    read: (file) => readFile(path.join(dirs.outputDirectory, file), 'utf8'),
    cleanup: dirs.cleanup,
  };
}

/**
 * Render a rich fixture that is expected to fail, returning the rejection
 * and whether the output directory exists afterwards.
 *
 * @param {(buildInput: any, sourceDirectory: string) => Promise<void>} prepare
 * @returns {Promise<{error: unknown, outputExists: boolean}>}
 */
export async function renderExpectingRejection(prepare) {
  const buildInput = /** @type {any} */ (await buildRichFixture());
  const dirs = await createRenderDirectories();
  try {
    await prepare(buildInput, dirs.sourceDirectory);
    await applyCurrentRenderPolicy(buildInput);
    let error;
    try {
      await renderPublication(buildInput, {
        outputDirectory: dirs.outputDirectory,
        workDirectory: dirs.workDirectory,
        sourceDirectory: dirs.sourceDirectory,
        provenance: testProvenance(),
      });
    } catch (caught) {
      error = caught;
    }
    const outputExists = await readdir(dirs.outputDirectory).then(
      () => true,
      () => false,
    );
    return { error, outputExists };
  } finally {
    await dirs.cleanup();
  }
}
