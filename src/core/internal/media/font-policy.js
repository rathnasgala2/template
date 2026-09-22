/**
 * Font policy for `appearance.fontAssets` (brief S2 section 3: "Custom fonts
 * require licensing, glyph and language coverage plus fallback evidence, and
 * no remote font is ever retrieved").
 *
 * `build-input:2.0.0`'s `resolvedFile` shape (the only shape
 * `appearance.fontAssets` entries use) is `{path, sourceDigest}` — a
 * repository-relative path plus a digest, nothing else. There is no
 * schema-carried field anywhere in `build-input` for a font's license text,
 * glyph set, or language-coverage claim (`grep`-verified against the
 * published `@rathnasgala2/schemas` package); a custom font's licensing,
 * glyph-coverage and fallback *evidence* is therefore necessarily an
 * authoring-process and documentation concern outside this schema's data
 * model, not a field this renderer can validate — this repository's README
 * states that requirement in those terms rather than fabricating a
 * validation step against a field that does not exist. What this module
 * *does* enforce, structurally, for every font this pipeline processes:
 *
 * - the file is bounded WOFF2 (exact `wOF2` signature, size at most
 *   `MAX_FONT_SOURCE_BYTES`) — anything else is `MEDIA_FONT_FORMAT_INVALID`;
 * - `resolvedFile.path` is always a `repoRelativePath` (schema-enforced
 *   before this renderer ever runs: no scheme, no host, no `://`), so a
 *   remote font reference cannot enter `build-input` in the first place, and
 *   this pipeline never performs a network fetch to resolve one — "no
 *   remote font is ever retrieved" holds by construction, not by a runtime
 *   check with something to catch.
 */

import { MediaPipelineError } from '../../errors.js';
import { MAX_FONT_SOURCE_BYTES } from './limits.js';

const WOFF2_SIGNATURE = Buffer.from([0x77, 0x4f, 0x46, 0x32]); // "wOF2"

/**
 * Validate one font asset's bytes are bounded WOFF2.
 *
 * @param {Buffer} bytes complete font file bytes
 * @param {string} referencePath the source path, for error messages
 * @returns {void}
 */
export function assertFontPolicy(bytes, referencePath) {
  if (bytes.length > MAX_FONT_SOURCE_BYTES) {
    throw new MediaPipelineError(
      'MEDIA_RESOURCE_EXCEEDED',
      `font source is ${bytes.length} bytes, exceeding the ${MAX_FONT_SOURCE_BYTES}-byte ceiling`,
      referencePath,
    );
  }
  if (bytes.length < 4 || !bytes.subarray(0, 4).equals(WOFF2_SIGNATURE)) {
    throw new MediaPipelineError(
      'MEDIA_FONT_FORMAT_INVALID',
      'font is not a WOFF2 file (missing "wOF2" signature); no other font format is admitted as author media',
      referencePath,
    );
  }
}
