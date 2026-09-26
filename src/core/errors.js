/**
 * Typed failure modes for the renderer adapter. Every rejection the adapter
 * raises before or during rendering is one of these two classes, never a
 * bare `Error`, so a caller (eventually `publish-kernel`) can distinguish
 * "the supplied build input is not schema-valid" from "the caller's own
 * adapter options are incomplete or unsafe" without string-matching a
 * message (brief S2 section 3: "fails closed on invalid input").
 */

/**
 * The supplied `build-input:2.0.0` candidate failed schema validation and
 * was never rendered. `diagnostics` is the exact
 * `validateGalaDocument` result from `@rathnasgala2/schemas`.
 */
export class BuildInputValidationError extends Error {
  /**
   * @param {readonly Record<string, unknown>[]} diagnostics
   *   the schema validator's diagnostics for the rejected instance
   */
  constructor(diagnostics) {
    super(
      `build-input:2.0.0 failed schema validation (${diagnostics.length} diagnostic(s))`,
    );
    this.name = 'BuildInputValidationError';
    /** @type {readonly Record<string, unknown>[]} */
    this.diagnostics = diagnostics;
  }
}

/**
 * The caller's adapter options (directories, provenance pass-through facts)
 * were missing, malformed, or violated the adapter's filesystem-confinement
 * contract. Rendering never started.
 */
export class RenderOptionsError extends Error {
  /**
   * @param {string} message what was wrong with the supplied options
   */
  constructor(message) {
    super(message);
    this.name = 'RenderOptionsError';
  }
}

/**
 * The media pipeline (S2-T05) rejected an image or font reference: an
 * unrecognized or malformed format, a decompression or resource ceiling
 * crossing, an unconditionally-rejected SVG image input, a font that is not
 * bounded WOFF2, or a source file whose bytes do not match its declared
 * `build-input` digest. Every one of these fails closed — before any
 * derivative is written and before rendering completes — never as a warning
 * or silent fallback (brief S2 section 3: "Reject decompression or resource
 * excess"; "SVG is never processed as author media").
 */
export class MediaPipelineError extends Error {
  /**
   * @param {string} reasonCode a stable, machine-checkable reason code (for
   *   example `MEDIA_SVG_REJECTED`, `MEDIA_RESOURCE_EXCEEDED`,
   *   `MEDIA_FORMAT_INVALID`, `MEDIA_SOURCE_DIGEST_MISMATCH`,
   *   `MEDIA_FONT_FORMAT_INVALID`)
   * @param {string} message a human-readable description
   * @param {string} referencePath the repository-relative source path this
   *   rejection concerns
   */
  constructor(reasonCode, message, referencePath) {
    super(`${reasonCode}: ${message} (${referencePath})`);
    this.name = 'MediaPipelineError';
    /** @type {string} */
    this.reasonCode = reasonCode;
    /** @type {string} */
    this.referencePath = referencePath;
  }
}

/**
 * The output-security pipeline rejected something before it could reach
 * rendered output: a `renderableBody.renderPolicy` reference that does not
 * byte-equal the published render-policy identity, a non-empty module or
 * placement value, or sanitized output that still matched a forbidden
 * pattern (an adapter defect, never expected of admitted content). Rendering
 * never completes for the affected build (brief S2 section 3: "fail-closed
 * behaviour on any content the policy rejects").
 */
export class RenderPolicyViolationError extends Error {
  /**
   * @param {string} message what the render policy rejected
   */
  constructor(message) {
    super(message);
    this.name = 'RenderPolicyViolationError';
  }
}

/**
 * The selected theme package's `theme.json` (or its declared file set) did
 * not conform to the closed shape `internal/theme-assets.js` needs to copy
 * its stylesheets/passive assets and render its `<link>` elements: an
 * invalid `stylesheets` list shape, a schema/contract-integrity violation
 * (which also covers an inadmissible `cssLayers` projection — see
 * `urn:gala:schema:theme-contract:2.0.0`), or a missing declared file (task
 * packet S2-T12).
 */
export class ThemeAssetError extends Error {
  /**
   * @param {string} reasonCode a stable, machine-checkable reason code (for
   *   example `THEME_STYLESHEETS_INVALID`, `THEME_CONTRACT_SCHEMA_INVALID`)
   * @param {string} message a human-readable description
   */
  constructor(reasonCode, message) {
    super(`${reasonCode}: ${message}`);
    this.name = 'ThemeAssetError';
    /** @type {string} */
    this.reasonCode = reasonCode;
  }
}

/**
 * The assembled `artifact-manifest:2.0.0` candidate failed schema
 * validation. This indicates an adapter defect (every field it emits should
 * be schema-valid by construction), so it is reported distinctly from the
 * two caller-facing errors above.
 */
export class ArtifactManifestValidationError extends Error {
  /**
   * @param {readonly Record<string, unknown>[]} diagnostics
   *   the schema validator's diagnostics for the rejected instance
   */
  constructor(diagnostics) {
    super(
      `artifact-manifest:2.0.0 produced by the renderer failed schema validation ` +
        `(${diagnostics.length} diagnostic(s)); this is an adapter defect`,
    );
    this.name = 'ArtifactManifestValidationError';
    /** @type {readonly Record<string, unknown>[]} */
    this.diagnostics = diagnostics;
  }
}
