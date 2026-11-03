/**
 * Content files: each PDF a `file` block links is verified against the digest
 * and length the build input declares and emitted once, as-is, at its
 * content-hashed path (`content-files.js`) with one `manifestAsset` row.
 *
 * Built on the same rules as Listen audio (`audio.js`): the caller-mounted
 * read-only source tree, a path that must stay inside it, a ceiling, a digest
 * match, and nothing written before every file has passed. A file must also
 * start with the `%PDF-` signature; the extension and the declared media type
 * are not trusted.
 *
 * The manifest row's media type is `application/octet-stream`: the
 * artifact-manifest schema pinned here (3.26.0) has no `application/pdf`
 * member. Hosts serve the file by its `.pdf` extension.
 */

import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { MediaPipelineError } from '../../errors.js';

/** The most bytes one emitted file may have. */
export const MAX_CONTENT_FILE_BYTES = 10 * 1024 * 1024;

/** The manifest media type of an emitted PDF (see the module comment). */
export const FILE_MANIFEST_MEDIA_TYPE = 'application/octet-stream';

/**
 * @param {readonly import('./content-files.js').FileReference[]} references
 *   the resolved files
 * @param {{sourceDirectory: string}} options the read-only source tree
 * @returns {Promise<{assets: import('../../../../types/index.d.ts').ManifestAssetEntry[], files: {path: string, source: string}[]}>}
 *   the manifest rows and the files to copy (output-relative paths), sorted
 *   by path, one per distinct output path
 */
export async function processContentFiles(references, { sourceDirectory }) {
  const root = path.resolve(sourceDirectory) + path.sep;
  /** @type {Map<string, {asset: import('../../../../types/index.d.ts').ManifestAssetEntry, file: {path: string, source: string}}>} */
  const byPath = new Map();
  for (const reference of references) {
    if (byPath.has(reference.outputPath)) continue;
    const source = path.resolve(sourceDirectory, reference.path);
    if (!source.startsWith(root)) {
      throw new MediaPipelineError(
        'MEDIA_FORMAT_INVALID',
        'file path escapes the source directory',
        reference.path,
      );
    }
    /** @type {Buffer} */
    let bytes;
    try {
      bytes = await readFile(source);
    } catch {
      throw new MediaPipelineError(
        'MEDIA_FORMAT_INVALID',
        'referenced file is missing or unreadable',
        reference.path,
      );
    }
    if (bytes.byteLength > MAX_CONTENT_FILE_BYTES) {
      throw new MediaPipelineError(
        'MEDIA_RESOURCE_EXCEEDED',
        `file is ${bytes.byteLength} bytes, exceeding the ${MAX_CONTENT_FILE_BYTES}-byte ceiling`,
        reference.path,
      );
    }
    const digest = `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
    if (
      bytes.byteLength !== reference.byteLength ||
      digest !== reference.sourceDigest
    ) {
      throw new MediaPipelineError(
        'MEDIA_SOURCE_DIGEST_MISMATCH',
        `file bytes are ${bytes.byteLength} long and hash to ${digest} but build-input declared ${reference.byteLength} bytes and ${reference.sourceDigest}`,
        reference.path,
      );
    }
    if (bytes.subarray(0, 5).toString('latin1') !== '%PDF-') {
      throw new MediaPipelineError(
        'MEDIA_FORMAT_INVALID',
        'file does not start with the %PDF- signature',
        reference.path,
      );
    }
    byPath.set(reference.outputPath, {
      asset: {
        path: reference.outputPath,
        mediaType: FILE_MANIFEST_MEDIA_TYPE,
        byteLength: String(bytes.byteLength),
        sha256: digest,
        // The path carries the digest, so the file never changes in place.
        immutable: true,
      },
      file: { path: reference.outputPath, source },
    });
  }
  const sorted = [...byPath.values()].sort((a, b) =>
    Buffer.compare(
      Buffer.from(a.file.path, 'utf8'),
      Buffer.from(b.file.path, 'utf8'),
    ),
  );
  return {
    assets: sorted.map((item) => item.asset),
    files: sorted.map((item) => item.file),
  };
}
