/**
 * Media pipeline orchestration.
 *
 * `build-input:2.0.0` never carries raw asset bytes for a `resolvedFile`
 * reference — only its repository-relative `path` and a `sourceDigest`:
 * `build` exposes this decoded set as a read-only source mount. This
 * pipeline therefore reads actual bytes from
 * `options.sourceDirectory`, the caller-mounted read-only source tree, and
 * fails closed (`MEDIA_SOURCE_DIGEST_MISMATCH`) if what it reads there does
 * not hash to the digest `build-input` declared — the same fail-closed
 * posture as every other adapter boundary in this renderer.
 *
 * Every distinct image/font reference in the publication (publication
 * default image, each author's avatar, each content record's hero and
 * social image, every content image a rendered body references (resolved
 * by `content-images.js` before this pipeline runs), the appearance
 * package's brand mark, wordmark and font assets) is collected once,
 * deduplicated by path, processed once per distinct source digest, and
 * turned into one or more content-addressed output files under
 * `assets/media/` in the candidate output directory plus one
 * `manifestAsset`-shaped row per output file. `manifestAsset` has no field
 * for a separate source/transform/output digest triple or for width/height
 * (`grep`-verified against the published schema); this pipeline expresses
 * that provenance the only way the closed shape allows: the source digest a
 * derivative was produced from is the same path's `manifestIncludedSource`
 * row (already emitted by `collectIncludedSources`), the output digest is
 * the asset row's own `sha256`, and the width/format transform is encoded
 * in the content-addressed path and `mediaType` themselves.
 */

import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { MediaPipelineError } from '../../errors.js';
import { decodeJpeg, encodeJpeg } from './jpeg-codec.js';
import {
  MAX_FONTS_PER_PUBLICATION,
  MAX_IMAGES_PER_PUBLICATION,
  MAX_IMAGE_SOURCE_BYTES,
  MAX_TOTAL_MEDIA_BYTES_PER_PUBLICATION,
  DERIVATIVE_WIDTHS,
} from './limits.js';
import { assertFontPolicy } from './font-policy.js';
import { decodePng, encodePng } from './png-codec.js';
import { applyExifOrientation, resizeRaster } from './resize.js';
import { MEDIA_TYPE_BY_FORMAT, sniffMediaFormat } from './sniff.js';
import { probeAvif } from './avif-probe.js';
import { probeGif } from './gif-probe.js';
import { probeWebp } from './webp-probe.js';

/** @type {Readonly<Record<string, string>>} media type -> file extension */
const EXTENSION_BY_MEDIA_TYPE = Object.freeze({
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
  'font/woff2': 'woff2',
});

/**
 * @typedef {{path: string, sourceDigest: string}} ImageReference
 */

/**
 * One output file of a processed image: its output path and pixel size.
 *
 * @typedef {{path: string, width: number, height: number}} MediaVariant
 */

/**
 * Collect every distinct image reference in `buildInput`, deduplicated by
 * path (rejecting a path reused with a conflicting digest).
 *
 * @param {import('../../../../types/index.d.ts').NormalizedBuildInput} buildInput
 *   the validated build input
 * @param {readonly ImageReference[]} contentImages the assets rendered
 *   bodies reference, already resolved by `content-images.js`
 * @returns {ImageReference[]} the distinct image references, in
 *   first-seen order
 */
function collectImageReferences(buildInput, contentImages) {
  /** @type {Map<string, ImageReference>} */
  const byPath = new Map();
  /** @type {(ref: ImageReference | undefined) => void} */
  const add = (ref) => {
    if (!ref) return;
    const existing = byPath.get(ref.path);
    if (existing && existing.sourceDigest !== ref.sourceDigest) {
      throw new MediaPipelineError(
        'MEDIA_SOURCE_DIGEST_MISMATCH',
        'the same path is referenced with two different declared digests',
        ref.path,
      );
    }
    byPath.set(ref.path, ref);
  };

  add(buildInput.publication.defaultImage);
  for (const author of buildInput.authors) add(author.avatar);
  for (const record of buildInput.content) {
    if (record.frontmatter.hero) add(record.frontmatter.hero.file);
    add(record.frontmatter.socialImage);
  }
  for (const reference of contentImages) add(reference);
  add(buildInput.appearance.brandMark);
  add(buildInput.appearance.wordmark);

  return [...byPath.values()];
}

/**
 * Collect every distinct font reference in `buildInput`, deduplicated by
 * path.
 *
 * @param {import('../../../../types/index.d.ts').NormalizedBuildInput} buildInput
 *   the validated build input
 * @returns {ImageReference[]} the distinct font references
 */
function collectFontReferences(buildInput) {
  /** @type {Map<string, ImageReference>} */
  const byPath = new Map();
  for (const font of buildInput.appearance.fontAssets ?? []) {
    byPath.set(font.path, font);
  }
  return [...byPath.values()];
}

/**
 * Read one referenced source file and verify its bytes match the declared
 * digest, failing closed on any mismatch, traversal attempt, or oversize
 * file.
 *
 * @param {string} sourceDirectory the caller-mounted read-only source root
 * @param {ImageReference} reference the reference to read and verify
 * @returns {Promise<Buffer>} the verified file bytes
 */
async function readAndVerify(sourceDirectory, reference) {
  const resolved = path.resolve(sourceDirectory, reference.path);
  const root = path.resolve(sourceDirectory) + path.sep;
  if (!resolved.startsWith(root)) {
    throw new MediaPipelineError(
      'MEDIA_FORMAT_INVALID',
      'reference path escapes the source directory',
      reference.path,
    );
  }
  let bytes;
  try {
    bytes = await readFile(resolved);
  } catch {
    throw new MediaPipelineError(
      'MEDIA_FORMAT_INVALID',
      'referenced source file is missing or unreadable',
      reference.path,
    );
  }
  if (bytes.length > MAX_IMAGE_SOURCE_BYTES) {
    throw new MediaPipelineError(
      'MEDIA_RESOURCE_EXCEEDED',
      `source is ${bytes.length} bytes, exceeding the ${MAX_IMAGE_SOURCE_BYTES}-byte ceiling`,
      reference.path,
    );
  }
  const actualDigest = `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
  if (actualDigest !== reference.sourceDigest) {
    throw new MediaPipelineError(
      'MEDIA_SOURCE_DIGEST_MISMATCH',
      `source bytes hash to ${actualDigest} but build-input declared ${reference.sourceDigest}`,
      reference.path,
    );
  }
  return bytes;
}

/**
 * @param {Buffer} bytes derivative file bytes
 * @returns {string} `sha256:` plus 64 lowercase hexadecimal characters
 */
function digest(bytes) {
  return `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
}

/**
 * Build the content-addressed output path for one media variant.
 *
 * @param {string} sourceDigest the reference's declared `sourceDigest`
 * @param {string} variant `'original'` or `'<width>w'`
 * @param {string} extension the file extension (no leading dot)
 * @returns {string} a `repoRelativePath`-shaped output path
 */
function derivativePath(sourceDigest, variant, extension) {
  const hex = sourceDigest.replace(/^sha256:/, '');
  return `assets/media/${hex}/${variant}.${extension}`;
}

/**
 * @typedef {{path: string, bytes: Buffer}} PipelineOutputFile
 */

/**
 * Process one image reference into its canonical original plus every
 * admitted responsive derivative.
 *
 * @param {Buffer} bytes verified source bytes
 * @param {ImageReference} reference the reference these bytes back
 * @returns {(PipelineOutputFile & {width: number, height: number})[]} the
 *   output files this reference produces, each with its pixel size: the
 *   canonical original first, then every derivative in ascending width
 */
function processImage(bytes, reference) {
  const format = sniffMediaFormat(bytes);
  if (format === 'svg') {
    throw new MediaPipelineError(
      'MEDIA_SVG_REJECTED',
      'SVG is never processed as author media',
      reference.path,
    );
  }
  if (format === 'unknown') {
    throw new MediaPipelineError(
      'MEDIA_FORMAT_INVALID',
      'unrecognized image format (checked from decoded bytes, not extension)',
      reference.path,
    );
  }

  if (format === 'webp' || format === 'avif' || format === 'gif') {
    // Bounded container/dimension validation only, and the original bytes
    // pass through unmodified; see webp-probe.js, avif-probe.js and
    // gif-probe.js module documentation for the documented scope decision.
    const probe = { webp: probeWebp, avif: probeAvif, gif: probeGif }[format];
    const size = probe(bytes, reference.path);
    const extension = EXTENSION_BY_MEDIA_TYPE[MEDIA_TYPE_BY_FORMAT[format]];
    return [
      {
        path: derivativePath(reference.sourceDigest, 'original', extension),
        bytes,
        width: size.width,
        height: size.height,
      },
    ];
  }

  /** @type {{width: number, height: number, rgba: Buffer}} */
  let oriented;
  /** @type {(raster: {width: number, height: number, rgba: Buffer}) => Buffer} */
  let encode;
  /** @type {'png' | 'jpg'} */
  let extension;
  if (format === 'png') {
    oriented = decodePng(bytes, reference.path);
    encode = encodePng;
    extension = 'png';
  } else {
    const decodedJpeg = decodeJpeg(bytes, reference.path);
    oriented = applyExifOrientation(decodedJpeg, decodedJpeg.orientation);
    encode = encodeJpeg;
    extension = 'jpg';
  }

  const outputs = [
    {
      path: derivativePath(reference.sourceDigest, 'original', extension),
      bytes: encode(oriented),
      width: oriented.width,
      height: oriented.height,
    },
  ];

  const widths = DERIVATIVE_WIDTHS.filter((w) => w < oriented.width);
  for (const width of widths) {
    const resized = resizeRaster(oriented, width, reference.path);
    outputs.push({
      path: derivativePath(reference.sourceDigest, `${width}w`, extension),
      bytes: encode(resized),
      width: resized.width,
      height: resized.height,
    });
  }
  return outputs;
}

/**
 * Process every image and font reference in `buildInput` into content-
 * addressed output files plus their `manifestAsset` rows.
 *
 * @param {import('../../../../types/index.d.ts').NormalizedBuildInput} buildInput
 *   the validated build input
 * @param {{sourceDirectory: string, contentImages?: readonly ImageReference[]}} options
 *   the media pipeline's own options: the read-only source root, and the
 *   assets rendered bodies reference (`content-images.js`)
 * @returns {Promise<{assets: import('../../../../types/index.d.ts').ManifestAssetEntry[], files: PipelineOutputFile[], dimensions: Record<string, {width: number, height: number}>, variants: Record<string, MediaVariant[]>}>}
 *   the asset manifest rows, the output files backing them, the pixel
 *   dimensions of each image's canonical original keyed by its output path
 *   (`manifestAsset` has no width/height field, so this is the one place the
 *   renderer learns them, for `<img width height>` and structured data),
 *   and every output file of each image keyed by its source digest, in
 *   ascending width (for `srcset`)
 */
export async function processMedia(
  buildInput,
  { sourceDirectory, contentImages = [] },
) {
  const imageReferences = collectImageReferences(buildInput, contentImages);
  if (imageReferences.length > MAX_IMAGES_PER_PUBLICATION) {
    throw new MediaPipelineError(
      'MEDIA_RESOURCE_EXCEEDED',
      `publication references ${imageReferences.length} distinct images, exceeding the ${MAX_IMAGES_PER_PUBLICATION} ceiling`,
      'publication',
    );
  }
  const fontReferences = collectFontReferences(buildInput);
  if (fontReferences.length > MAX_FONTS_PER_PUBLICATION) {
    throw new MediaPipelineError(
      'MEDIA_RESOURCE_EXCEEDED',
      `publication references ${fontReferences.length} distinct fonts, exceeding the ${MAX_FONTS_PER_PUBLICATION} ceiling`,
      'appearance',
    );
  }

  /** @type {PipelineOutputFile[]} */
  const files = [];
  /** @type {Record<string, {width: number, height: number}>} */
  const dimensions = {};
  /** @type {Record<string, MediaVariant[]>} */
  const variants = {};
  let totalBytes = 0;

  for (const reference of imageReferences) {
    const bytes = await readAndVerify(sourceDirectory, reference);
    // Output paths are content-addressed: two paths with identical bytes
    // produce identical files, so each distinct digest is processed (and
    // emitted) once.
    if (Object.hasOwn(variants, reference.sourceDigest)) continue;
    const outputs = processImage(bytes, reference);
    for (const output of outputs) {
      totalBytes += output.bytes.byteLength;
      files.push({ path: output.path, bytes: output.bytes });
    }
    const [original] = outputs;
    dimensions[original.path] = {
      width: original.width,
      height: original.height,
    };
    variants[reference.sourceDigest] = outputs
      .map(({ path: outputPath, width, height }) => ({
        path: outputPath,
        width,
        height,
      }))
      .sort((a, b) => a.width - b.width);
  }

  for (const reference of fontReferences) {
    const bytes = await readAndVerify(sourceDirectory, reference);
    assertFontPolicy(bytes, reference.path);
    totalBytes += bytes.byteLength;
    files.push({
      path: derivativePath(reference.sourceDigest, 'original', 'woff2'),
      bytes,
    });
  }

  if (totalBytes > MAX_TOTAL_MEDIA_BYTES_PER_PUBLICATION) {
    throw new MediaPipelineError(
      'MEDIA_RESOURCE_EXCEEDED',
      `media pipeline output is ${totalBytes} bytes, exceeding the ${MAX_TOTAL_MEDIA_BYTES_PER_PUBLICATION}-byte publication ceiling`,
      'publication',
    );
  }

  // Deterministic path order: derivativePath is a pure function of
  // (sourceDigest, variant, extension), so sorting the finished file list by
  // its own output path — rather than by reference-discovery order — is
  // what makes this pipeline's manifest.assets ordering independent of
  // `build-input`'s own field ordering.
  files.sort((a, b) =>
    Buffer.compare(Buffer.from(a.path, 'utf8'), Buffer.from(b.path, 'utf8')),
  );

  const assets = files.map((file) => {
    const extension = file.path.slice(file.path.lastIndexOf('.') + 1);
    const mediaType =
      extension === 'woff2'
        ? 'font/woff2'
        : extension === 'jpg'
          ? 'image/jpeg'
          : `image/${extension}`;
    return /** @type {import('../../../../types/index.d.ts').ManifestAssetEntry} */ ({
      path: file.path,
      mediaType,
      byteLength: String(file.bytes.byteLength),
      sha256: digest(file.bytes),
      immutable: true,
    });
  });

  return { assets, files, dimensions, variants };
}
