/**
 * The single module `contracts/theme-styling-contract.jcs` (S2-T12) targets
 * for every Light/Dark/System appearance name this renderer owns (task
 * packet S2-T07: "the `data-` attribute/class names the controller sets must
 * be fixed constants exported from one module"; DEC-097's closed
 * `templateStylingContract` catalog, section "Closed theme-package and
 * stylesheet admission": the required root attribute row
 * `{name:data-gala-publication-root,match:presence,values:[],role:root}` and
 * the required palette attribute row
 * `{name:data-gala-resolved-color-mode,match:exact-value,values:[dark,light],role:state}`;
 * "The template renderer emits the exact root attribute and maintains
 * exactly one `data-gala-resolved-color-mode="light"|"dark"` value on that
 * same element before theme CSS is observed").
 *
 * Two attributes are exposed, deliberately kept separate (brief S2 section 3:
 * "selection and resolved state are exposed separately through
 * template-owned root attributes; theme CSS consumes only resolved state"):
 *
 * - {@link APPEARANCE_ROOT_ATTRIBUTE} and {@link APPEARANCE_RESOLVED_MODE_ATTRIBUTE}
 *   are the two DEC-097-fixed theme-facing attributes above — part of the
 *   published styling contract S2-T12 emits, never renamed here independent
 *   of that contract.
 * - {@link APPEARANCE_SELECTION_ATTRIBUTE} is this renderer's own
 *   template-internal bookkeeping attribute (the reader's raw `light` /
 *   `dark` / `system` choice, as opposed to `system`'s *resolved* value). It
 *   is not a theme-styling-contract hook — DEC-097's attribute catalog does
 *   not name it, and no theme selector may target it — but its name is still
 *   fixed here, in this one module, exactly like the two contract-owned
 *   attributes, so no other module ever invents its own literal for it.
 *
 * Both the pre-paint bootstrap script ({@link ../appearance/bootstrap-script.js})
 * and the server-rendered control markup ({@link ../appearance/controller-markup.js})
 * import every name/value from here; neither ever writes an attribute name,
 * a mode value or the storage key as its own literal.
 */

import { joinBasePathAndRoute } from '../route.js';

/**
 * The DEC-097 `templateStylingContract.publicationRootSelector` attribute:
 * a bare-presence attribute the template always renders on the document's
 * root element (`<html>`), independent of JavaScript (`match:presence`).
 *
 * @type {string}
 */
export const APPEARANCE_ROOT_ATTRIBUTE = 'data-gala-publication-root';

/**
 * The DEC-097 `templateStylingContract.resolvedPaletteSelectors` attribute:
 * an exact-value attribute (`"light"` or `"dark"`, never `"system"`) the
 * pre-paint bootstrap script sets on the root element before first themed
 * paint. Theme CSS consumes only this attribute, never
 * {@link APPEARANCE_SELECTION_ATTRIBUTE}.
 *
 * @type {string}
 */
export const APPEARANCE_RESOLVED_MODE_ATTRIBUTE =
  'data-gala-resolved-color-mode';

/**
 * Template-internal bookkeeping attribute carrying the reader's raw
 * selection (`light` / `dark` / `system`), as opposed to
 * {@link APPEARANCE_RESOLVED_MODE_ATTRIBUTE}'s resolved value. Not part of
 * the published theme styling contract; no theme selector may target it.
 *
 * @type {string}
 */
export const APPEARANCE_SELECTION_ATTRIBUTE = 'data-gala-color-mode-selection';

/** @type {'light'} */
export const APPEARANCE_MODE_LIGHT = 'light';
/** @type {'dark'} */
export const APPEARANCE_MODE_DARK = 'dark';
/** @type {'system'} */
export const APPEARANCE_MODE_SYSTEM = 'system';

/**
 * Every canonical machine-readable selection value (brief S2 section 3:
 * "canonical machine values are `light`, `dark`, `system`; `lite` is not a
 * value").
 *
 * @type {readonly ['light', 'dark', 'system']}
 */
export const APPEARANCE_MODE_VALUES = Object.freeze([
  APPEARANCE_MODE_LIGHT,
  APPEARANCE_MODE_DARK,
  APPEARANCE_MODE_SYSTEM,
]);

/**
 * Every value {@link APPEARANCE_RESOLVED_MODE_ATTRIBUTE} may carry. `system`
 * always resolves to one of these two; it is never a third selector value
 * (DEC-097: "`system` is resolved to one of those values rather than
 * becoming a third selector").
 *
 * @type {readonly ['light', 'dark']}
 */
export const APPEARANCE_RESOLVED_MODE_VALUES = Object.freeze([
  APPEARANCE_MODE_LIGHT,
  APPEARANCE_MODE_DARK,
]);

/**
 * TPL-C1 fix: the server-rendered default for
 * {@link APPEARANCE_RESOLVED_MODE_ATTRIBUTE} on `<html>`, present on every
 * page independent of JavaScript (`internal/eleventy-render.js`'s
 * `SKELETON_LAYOUT_SOURCE`). `light` is chosen because it is the value the
 * bootstrap script's own `resolveMode` already falls back to when
 * `prefers-color-scheme` cannot be read (`internal/appearance/
 * bootstrap-script.js`'s `systemPrefersDark` catch branch), so the
 * server-rendered default and the script's own no-signal fallback agree.
 * The bootstrap script's phase 1 always overwrites this attribute
 * synchronously before first paint for a reader whose browser runs it, so
 * this default is observed only by a reader (or crawler) that never runs
 * script at all.
 *
 * @type {'light'}
 */
export const APPEARANCE_SERVER_DEFAULT_RESOLVED_MODE = APPEARANCE_MODE_LIGHT;

/**
 * The initial reader default (brief S2 section 3: "initial reader default is
 * `system`").
 *
 * @type {'system'}
 */
export const APPEARANCE_DEFAULT_MODE = APPEARANCE_MODE_SYSTEM;

/**
 * The one versioned local-storage key the pre-paint bootstrap script and the
 * control's change handler both read/write (brief S2 section 3: "selection
 * is stored under one versioned local key"). The trailing `v1` is this
 * key's own version; a future incompatible storage format change mints a new
 * key rather than reinterpreting old values, so an old browser's already
 * stored `v1` value is simply orphaned (ignored, never migrated or deleted)
 * rather than misread as a new format.
 *
 * @type {string}
 */
export const APPEARANCE_STORAGE_KEY = 'gala:appearance:color-mode:v1';

/**
 * The `id` the server-rendered `<select>` control carries, so the bootstrap
 * script's post-`DOMContentLoaded` wiring can find it with a single
 * `document.getElementById` call. Also used as the paired `<label for>`
 * target.
 *
 * @type {string}
 */
export const APPEARANCE_SELECT_ID = 'gala-appearance-color-mode';

/**
 * The candidate-output-directory-relative path the deterministic pre-paint
 * bootstrap script is written to (task packet S2-T07: "entered into the
 * manifest through the S2-T03 path with `{path,byteLength,sha256}`"). Not
 * content-addressed (unlike the S2-T05 media pipeline's derivative paths):
 * this file's bytes are a pure function of this module's own constants, not
 * of any per-publication input, so a stable path carries no collision risk.
 * The `v1` component versions the bootstrap script's own behaviour,
 * independent of {@link APPEARANCE_STORAGE_KEY}'s own versioning.
 *
 * @type {string}
 */
export const APPEARANCE_BOOTSTRAP_SCRIPT_PATH =
  'assets/gala-appearance-bootstrap-v1.js';

/**
 * The root-absolute `<script src>` reference for a root (`/`) `basePath`
 * publication. Every actual render joins this with the publication's own
 * `basePath` through {@link appearanceBootstrapScriptHref} instead of using
 * this literal directly (S2-T12 basePath fix, LOCAL-7 follow-up: an earlier
 * version of this module used this root-absolute literal unconditionally,
 * which 404s under a non-root `basePath` publication). This constant is
 * retained as the one-place root-`basePath` literal every test and the
 * `joinBasePathAndRoute` call below both agree on.
 *
 * @type {string}
 */
export const APPEARANCE_BOOTSTRAP_SCRIPT_HREF = `/${APPEARANCE_BOOTSTRAP_SCRIPT_PATH}`;

/**
 * The `basePath`-joined `<script src>` reference every generated page's
 * skeleton layout actually uses (S2-T12 basePath fix).
 *
 * @param {string} basePath the build input's `basePath`
 * @returns {string} the joined `href`
 */
export function appearanceBootstrapScriptHref(basePath) {
  return joinBasePathAndRoute(basePath, APPEARANCE_BOOTSTRAP_SCRIPT_HREF);
}

/**
 * The `manifestAsset`/`manifestRoute` `mediaType` enum member for a
 * JavaScript file (`@rathnasgala2/schemas`' `artifact-manifest.schema.json`).
 *
 * @type {string}
 */
export const APPEARANCE_BOOTSTRAP_SCRIPT_MEDIA_TYPE =
  'application/javascript; charset=utf-8';

/**
 * The `<meta name="color-scheme">` content value: both palettes are
 * admitted, so the browser's own user-agent styling (form controls,
 * scrollbars) and initial paint follow `prefers-color-scheme` immediately,
 * independent of this renderer's own resolved-mode attribute (brief S2
 * section 3: "`color-scheme` meta/CSS handling"; "with JavaScript disabled,
 * CSS media queries preserve `system`").
 *
 * @type {string}
 */
export const COLOR_SCHEME_META_CONTENT = 'light dark';
