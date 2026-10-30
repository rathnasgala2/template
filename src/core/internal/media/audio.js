/**
 * Listen audio: each published article's audio file is verified against the
 * digest and size the build input declares and is emitted once, as-is (no
 * transcoding), at its content-addressed path
 * (`assets/listen/<slug>.<first 8 hex of sha256>.<ext>`, see
 * `internal/listen.js`) with one `manifestAsset` row of its media type.
 *
 * Like the image pipeline, this reads the caller-mounted read-only source
 * tree (`options.sourceDirectory`) and fails closed before anything is
 * written: a path that escapes the tree, a missing file, a file over the
 * per-file ceiling, or bytes that do not hash to the declared digest. The
 * bytes are hashed here and copied at write time, so a publication's audio is
 * never held in memory all at once.
 */

import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { MediaPipelineError } from '../../errors.js';
import { audioDigestHex } from '../listen.js';

/** The most bytes one audio file may have (the publish intake's ceiling). */
export const MAX_LISTEN_AUDIO_BYTES = 25 * 1024 * 1024;

/** The most audio bytes one publication may carry. */
export const MAX_LISTEN_AUDIO_TOTAL_BYTES = 512 * 1024 * 1024;

/**
 * @typedef {object} ListenAudioFile one file to copy into the output
 * @property {string} path its output-relative path (before the base path)
 * @property {string} source its absolute path in the source tree
 */

/**
 * Verify and plan the emission of every entry's audio.
 *
 * @param {readonly import('../listen.js').ListenEntry[]} entries the
 *   published articles with audio
 * @param {{sourceDirectory: string}} options the read-only source tree
 * @returns {Promise<{assets: import('../../../../types/index.d.ts').ManifestAssetEntry[], files: ListenAudioFile[]}>}
 *   the manifest rows (output-relative paths) and the files to copy, both
 *   sorted by path, one per distinct output path
 */
export async function processListenAudio(entries, { sourceDirectory }) {
  const root = path.resolve(sourceDirectory) + path.sep;
  /** @type {Map<string, {asset: import('../../../../types/index.d.ts').ManifestAssetEntry, file: ListenAudioFile}>} */
  const byPath = new Map();
  let totalBytes = 0;
  for (const { listen, path: outputPath } of entries) {
    if (byPath.has(outputPath)) continue;
    const { audio } = listen;
    const source = path.resolve(sourceDirectory, audio.sourcePath);
    if (!source.startsWith(root)) {
      throw new MediaPipelineError(
        'MEDIA_FORMAT_INVALID',
        'audio path escapes the source directory',
        audio.sourcePath,
      );
    }
    /** @type {Buffer} */
    let bytes;
    try {
      bytes = await readFile(source);
    } catch {
      throw new MediaPipelineError(
        'MEDIA_FORMAT_INVALID',
        'referenced audio file is missing or unreadable',
        audio.sourcePath,
      );
    }
    if (bytes.byteLength > MAX_LISTEN_AUDIO_BYTES) {
      throw new MediaPipelineError(
        'MEDIA_RESOURCE_EXCEEDED',
        `audio is ${bytes.byteLength} bytes, exceeding the ${MAX_LISTEN_AUDIO_BYTES}-byte ceiling`,
        audio.sourcePath,
      );
    }
    const hex = createHash('sha256').update(bytes).digest('hex');
    if (
      bytes.byteLength !== audio.bytes ||
      hex !== audioDigestHex(audio.sha256)
    ) {
      throw new MediaPipelineError(
        'MEDIA_SOURCE_DIGEST_MISMATCH',
        `audio bytes are ${bytes.byteLength} long and hash to sha256:${hex} but build-input declared ${audio.bytes} bytes and ${audio.sha256}`,
        audio.sourcePath,
      );
    }
    totalBytes += bytes.byteLength;
    if (totalBytes > MAX_LISTEN_AUDIO_TOTAL_BYTES) {
      throw new MediaPipelineError(
        'MEDIA_RESOURCE_EXCEEDED',
        `publication audio exceeds the ${MAX_LISTEN_AUDIO_TOTAL_BYTES}-byte ceiling`,
        'publication',
      );
    }
    byPath.set(outputPath, {
      asset: {
        path: outputPath,
        mediaType: audio.mediaType,
        byteLength: String(bytes.byteLength),
        sha256: `sha256:${hex}`,
        // The path carries the digest, so the file never changes in place.
        immutable: true,
      },
      file: { path: outputPath, source },
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
