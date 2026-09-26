/**
 * Deterministic base-direction resolution from a BCP-47 language tag.
 *
 * `build-input:2.0.0` carries a validated `bcp47` language tag on the
 * publication (`defaultLanguage`) and on every content record
 * (`frontmatter.language`) but no separate `dir`/direction field (checked
 * against `node_modules/@rathnasgala2/schemas/schemas/build-input.schema.json`:
 * no `$defs` entry or property named `dir`/`direction` exists anywhere in the
 * schema). The semantic skeleton must still set an accurate `dir` attribute
 * even for localized content with mixed direction, so this module derives it from the
 * tag's primary language subtag against the closed set of right-to-left
 * script languages in Unicode CLDR's exemplar set — the same approach HTML's
 * own `Intl.Locale` `textInfo.direction` uses, reimplemented here as a small
 * static table so this renderer adds no new runtime dependency and stays
 * fully deterministic (no ICU data version drift across Node builds).
 *
 * This is a deliberately scoped decision, not a full BCP-47 script/region
 * override resolver (a tag can in principle override direction with an
 * explicit script subtag, e.g. `az-Arab` vs `az-Latn`); the closed language
 * subtag list below is sufficient for every right-to-left language in the S2
 * fixture corpus and is documented here for the same reason `route.js` scopes
 * its own route-projection engine.
 */

/**
 * Primary BCP-47 language subtags (lowercase) whose default script is
 * written right-to-left.
 *
 * @type {ReadonlySet<string>}
 */
const RTL_PRIMARY_LANGUAGE_SUBTAGS = new Set([
  'ar', // Arabic
  'arc', // Aramaic
  'dv', // Divehi
  'fa', // Persian
  'ha', // Hausa (Arabic script usage)
  'he', // Hebrew
  'khw', // Khowar
  'ks', // Kashmiri
  'ku', // Kurdish (Sorani, Arabic script usage)
  'ps', // Pashto
  'sd', // Sindhi
  'ug', // Uyghur
  'ur', // Urdu
  'yi', // Yiddish
]);

/**
 * Resolve the base text direction for a validated `bcp47` language tag.
 *
 * @param {string} bcp47 a schema-validated BCP-47 language tag (structurally
 *   already `^[A-Za-z0-9-]+$`)
 * @returns {'ltr' | 'rtl'} the resolved base direction
 */
export function resolveTextDirection(bcp47) {
  const primarySubtag = bcp47.split('-')[0]?.toLowerCase() ?? '';
  return RTL_PRIMARY_LANGUAGE_SUBTAGS.has(primarySubtag) ? 'rtl' : 'ltr';
}
