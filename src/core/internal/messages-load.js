/**
 * Load chrome message catalogs one locale at a time, so a browser bundle
 * carries only the locales a page needs (`messages.js` imports all of them
 * for Node). Each catalog is its own dynamic import, so a bundler splits
 * them into separate chunks.
 */

import {
  CATALOG_KEYS,
  DEFAULT_LOCALE,
  createGetMessages,
  resolveCatalogKey,
} from './messages-core.js';

/**
 * @typedef {import('./messages-core.js').MessageCatalog} MessageCatalog
 */

/** @type {Readonly<Record<string, () => Promise<{default: MessageCatalog}>>>} */
const LOADERS = Object.freeze({
  ar: () => import('./messages/ar.js'),
  az: () => import('./messages/az.js'),
  bg: () => import('./messages/bg.js'),
  bn: () => import('./messages/bn.js'),
  bs: () => import('./messages/bs.js'),
  ca: () => import('./messages/ca.js'),
  cs: () => import('./messages/cs.js'),
  da: () => import('./messages/da.js'),
  de: () => import('./messages/de.js'),
  el: () => import('./messages/el.js'),
  en: () => import('./messages/en.js'),
  es: () => import('./messages/es.js'),
  et: () => import('./messages/et.js'),
  fa: () => import('./messages/fa.js'),
  fi: () => import('./messages/fi.js'),
  fr: () => import('./messages/fr.js'),
  he: () => import('./messages/he.js'),
  hi: () => import('./messages/hi.js'),
  hr: () => import('./messages/hr.js'),
  hu: () => import('./messages/hu.js'),
  hy: () => import('./messages/hy.js'),
  id: () => import('./messages/id.js'),
  is: () => import('./messages/is.js'),
  it: () => import('./messages/it.js'),
  ja: () => import('./messages/ja.js'),
  ka: () => import('./messages/ka.js'),
  kk: () => import('./messages/kk.js'),
  kn: () => import('./messages/kn.js'),
  ko: () => import('./messages/ko.js'),
  lt: () => import('./messages/lt.js'),
  lv: () => import('./messages/lv.js'),
  mk: () => import('./messages/mk.js'),
  ml: () => import('./messages/ml.js'),
  mr: () => import('./messages/mr.js'),
  ms: () => import('./messages/ms.js'),
  nb: () => import('./messages/nb.js'),
  ne: () => import('./messages/ne.js'),
  nl: () => import('./messages/nl.js'),
  pl: () => import('./messages/pl.js'),
  pt: () => import('./messages/pt.js'),
  ro: () => import('./messages/ro.js'),
  ru: () => import('./messages/ru.js'),
  sk: () => import('./messages/sk.js'),
  sl: () => import('./messages/sl.js'),
  sq: () => import('./messages/sq.js'),
  sr: () => import('./messages/sr.js'),
  'sr-latn': () => import('./messages/sr-latn.js'),
  sv: () => import('./messages/sv.js'),
  ta: () => import('./messages/ta.js'),
  te: () => import('./messages/te.js'),
  th: () => import('./messages/th.js'),
  tr: () => import('./messages/tr.js'),
  uk: () => import('./messages/uk.js'),
  ur: () => import('./messages/ur.js'),
  uz: () => import('./messages/uz.js'),
  vi: () => import('./messages/vi.js'),
  'zh-hans': () => import('./messages/zh-hans.js'),
  'zh-hant': () => import('./messages/zh-hant.js'),
});

/**
 * Load one catalog by key.
 *
 * @param {string} key a member of `CATALOG_KEYS`
 * @returns {Promise<MessageCatalog>} the catalog
 */
export async function loadCatalog(key) {
  if (!Object.hasOwn(LOADERS, key)) {
    throw new RangeError(`"${key}" is not a message catalog key`);
  }
  return (await LOADERS[key]()).default;
}

/**
 * Load `en` (the fallback) and the catalog each given tag resolves to, and
 * return a `getMessages` over them.
 *
 * @param {readonly string[]} languages the BCP-47 tags the render will ask for
 * @returns {Promise<(bcp47?: string) => MessageCatalog>} the lookup
 */
export async function loadMessagesFor(languages) {
  const keys = new Set([DEFAULT_LOCALE, ...languages.map(resolveCatalogKey)]);
  /** @type {Record<string, MessageCatalog>} */
  const catalogs = {};
  for (const key of keys) {
    catalogs[key] = await loadCatalog(key);
  }
  return createGetMessages(catalogs);
}

export { CATALOG_KEYS, resolveCatalogKey };
