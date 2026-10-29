/**
 * Core-owned chrome message catalog lookup. Every user-visible string this
 * package's own generated chrome emits (skip link, navigation and breadcrumb
 * labels, pagination, generated listing headings, the error and removed-post
 * pages, the appearance control, the version page, consent and audience
 * controls) is looked up by key through {@link getMessages}, never written
 * inline at its call site.
 *
 * The catalogs live one module per locale in `./messages/<tag>.js` and are
 * registered in `./messages/registry.js`; `en` is the reference key set and
 * the fallback. Per-content localization of *authored* content is
 * `publication`/`content` data, not core chrome.
 *
 * Lookup order for a tag (case-insensitive, `_` read as `-`):
 * 1. the exact tag (`zh-hant`, `sr-latn`, `pt-br` when registered);
 * 2. language plus script (`zh-Hant-TW` -> `zh-hant`);
 * 3. the primary subtag, after these mappings: `zh` -> `zh-hans`
 *    (Traditional regions `zh-TW`, `zh-HK`, `zh-MO` -> `zh-hant`),
 *    `no`/`nn` -> `nb`, `iw` -> `he`;
 * 4. `en`.
 */
import { CATALOGS } from './messages/registry.js';

/** @type {string} */
const DEFAULT_LOCALE = 'en';

/** Traditional-script regions for a bare `zh-<region>` tag. */
const ZH_HANT_REGIONS = new Set(['tw', 'hk', 'mo']);

/** Primary-subtag mappings applied before the primary lookup. */
const PRIMARY_ALIASES = Object.freeze({
  zh: 'zh-hans',
  no: 'nb',
  nn: 'nb',
  iw: 'he',
});

/**
 * Resolve the message catalog for a BCP-47 language tag. See the file header
 * for the lookup order; an unknown or empty tag yields the `en` catalog.
 *
 * @param {string} [bcp47] a language tag (typically
 *   `publication.defaultLanguage` or a per-content `frontmatter.language`)
 * @returns {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 *   the resolved catalog
 */
export function getMessages(bcp47) {
  const parts = (bcp47 ?? '')
    .trim()
    .toLowerCase()
    .replace(/_/g, '-')
    .split('-');
  const language = parts[0] ?? '';
  const script = parts.find((part, i) => i > 0 && /^[a-z]{4}$/.test(part));
  const region = parts.find(
    (part, i) => i > 0 && /^([a-z]{2}|\d{3})$/.test(part),
  );
  /** @type {string[]} */
  const candidates = [parts.join('-')];
  if (script) candidates.push(`${language}-${script}`);
  if (language === 'zh' && !script && region && ZH_HANT_REGIONS.has(region)) {
    candidates.push('zh-hant');
  }
  candidates.push(
    /** @type {Record<string, string>} */ (PRIMARY_ALIASES)[language] ??
      language,
    language,
  );
  for (const candidate of candidates) {
    if (Object.hasOwn(CATALOGS, candidate)) return CATALOGS[candidate];
  }
  return CATALOGS[DEFAULT_LOCALE];
}
