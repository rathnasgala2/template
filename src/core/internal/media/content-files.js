/**
 * Content files: the PDFs a body's `file` blocks (`fenced-blocks.js`) link.
 *
 * A `file` block's `<a href>` is a repository-relative path. Like a body
 * image it must name an entry of its own document's `content[].media[]` (here
 * one of `mediaType` `application/pdf`); `renderPublication` resolves every
 * reference before anything is written and fails closed with a
 * `MEDIA_REFERENCE_UNRESOLVED` diagnostic for one that names none. The
 * resolved file is emitted once at a content-hashed path
 * (`assets/files/<name>.<first 8 hex of sha256>.pdf`, `media/files.js`) and
 * the page links that path.
 *
 * The path rule is the one body images use
 * (`repositoryPathOfImageSource`).
 */

import { BuildInputValidationError } from '../../errors.js';
import { unescapeHtml } from '../skeleton.js';
import { bodyScopes, repositoryPathOfImageSource } from './content-images.js';

/** The `media[]` media type a `file` block resolves to. */
export const FILE_MEDIA_TYPE = 'application/pdf';

/** The output directory of emitted files. */
export const FILE_OUTPUT_DIRECTORY = 'assets/files';

/**
 * @typedef {object} FileReference one resolved file
 * @property {string} path its repository path
 * @property {string} sourceDigest `sha256:` plus 64 lowercase hex characters
 * @property {number} byteLength its declared length
 * @property {string} outputPath its output-relative path (before the base
 *   path), content-hashed
 */

/** Every `file` block's link in a policy-conformant body. */
const FILE_LINK =
  /<figure class="g-file" data-gala-block="file"><a href="([^"]*)">/g;

const DOCUMENTATION_URL = 'https://github.com/rathnasgala2/template#file';

/**
 * @param {string} path a repository path
 * @param {string} sourceDigest the file's `sha256:<hex>` digest
 * @returns {string} `assets/files/<name>.<hash8>.pdf`
 */
export function fileOutputPath(path, sourceDigest) {
  const base = path.split('/').at(-1) ?? '';
  const name =
    base
      .replace(/\.pdf$/i, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48)
      .replace(/-+$/g, '') || 'file';
  return `${FILE_OUTPUT_DIRECTORY}/${name}.${sourceDigest.slice(7, 15)}.pdf`;
}

/**
 * Resolve every file block of every body, before anything is written.
 *
 * @param {import('../../../../types/index.d.ts').NormalizedBuildInput} buildInput
 *   the validated, render-policy-verified build input
 * @returns {Map<string, FileReference>} each distinct raw `href` value to the
 *   file it resolves to
 * @throws {BuildInputValidationError} when a file block names no PDF the
 *   document inventories
 */
export function resolveContentFiles(buildInput) {
  /** @type {Map<string, FileReference>} */
  const resolved = new Map();
  /** @type {Record<string, string>[]} */
  const diagnostics = [];
  for (const scope of bodyScopes(buildInput)) {
    for (const [, href] of scope.body.matchAll(FILE_LINK)) {
      const path = repositoryPathOfImageSource(href);
      const entry = scope.media.find(
        (file) => file.path === path && file.mediaType === FILE_MEDIA_TYPE,
      );
      if (entry) {
        if (!resolved.has(href)) {
          resolved.set(href, {
            path: entry.path,
            sourceDigest: entry.sourceDigest,
            byteLength: entry.byteLength,
            outputPath: fileOutputPath(entry.path, entry.sourceDigest),
          });
        }
        continue;
      }
      const reference = unescapeHtml(href);
      diagnostics.push({
        code: 'MEDIA_REFERENCE_UNRESOLVED',
        severity: 'ERROR',
        instancePointer: scope.pointer,
        actualValueClass: 'string',
        rule: 'template:content-file-reference',
        reference,
        remediation: `The file "${reference}" in ${scope.sourcePath} names no PDF inventoried for that document. Commit the PDF and reference it by its repository-relative path, or remove the block.`,
        documentationUrl: DOCUMENTATION_URL,
      });
    }
  }
  if (diagnostics.length > 0) throw new BuildInputValidationError(diagnostics);
  return resolved;
}
