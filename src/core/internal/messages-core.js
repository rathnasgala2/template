/**
 * Catalog selection with no catalog data: which catalog a BCP-47 tag
 * resolves to, and a lookup over whichever catalogs the host has loaded.
 * `messages.js` (every catalog, for Node) and `messages-load.js` (one
 * locale at a time, for a browser) both build on it. See `messages.js` for
 * the lookup order.
 */

/**
 * @typedef {Readonly<Record<string, string | ((...args: string[]) => string)>>} MessageCatalog
 */

/**
 * Every catalog key, lower-case BCP-47. Must equal the keys of
 * `messages/registry.js` (test/messages-parity.test.js).
 *
 * @type {readonly string[]}
 */
export const CATALOG_KEYS = Object.freeze([
  'ar',
  'az',
  'bg',
  'bn',
  'bs',
  'ca',
  'cs',
  'da',
  'de',
  'el',
  'en',
  'es',
  'et',
  'fa',
  'fi',
  'fr',
  'he',
  'hi',
  'hr',
  'hu',
  'hy',
  'id',
  'is',
  'it',
  'ja',
  'ka',
  'kk',
  'kn',
  'ko',
  'lt',
  'lv',
  'mk',
  'ml',
  'mr',
  'ms',
  'nb',
  'ne',
  'nl',
  'pl',
  'pt',
  'ro',
  'ru',
  'sk',
  'sl',
  'sq',
  'sr',
  'sr-latn',
  'sv',
  'ta',
  'te',
  'th',
  'tr',
  'uk',
  'ur',
  'uz',
  'vi',
  'zh-hans',
  'zh-hant',
]);

/** @type {string} */
export const DEFAULT_LOCALE = 'en';

const KEY_SET = new Set(CATALOG_KEYS);

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
 * Resolve a BCP-47 language tag to a catalog key; an unknown or empty tag
 * yields `en`.
 *
 * @param {string} [bcp47] a language tag (typically
 *   `publication.defaultLanguage` or a per-content `frontmatter.language`)
 * @returns {string} a member of {@link CATALOG_KEYS}
 */
export function resolveCatalogKey(bcp47) {
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
    if (KEY_SET.has(candidate)) return candidate;
  }
  return DEFAULT_LOCALE;
}

/**
 * A `getMessages` over the catalogs a host has loaded, keyed by catalog key.
 * A tag that resolves to a catalog that was not loaded throws, rather than
 * quietly rendering another language.
 *
 * @param {Readonly<Record<string, MessageCatalog>>} catalogs the loaded
 *   catalogs; must include `en`
 * @returns {(bcp47?: string) => MessageCatalog} the lookup
 */
export function createGetMessages(catalogs) {
  return (bcp47) => {
    const key = resolveCatalogKey(bcp47);
    if (!Object.hasOwn(catalogs, key)) {
      throw new Error(`the "${key}" message catalog is not loaded`);
    }
    return catalogs[key];
  };
}
