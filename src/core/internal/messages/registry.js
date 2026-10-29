/**
 * Registry of chrome message catalogs, keyed by lower-case BCP-47 tag. To add
 * a locale, create `<tag>.js` beside this file (copy `en.js`, translate the
 * values) and add one import and one line below; see docs/LOCALES.md.
 */
import en from './en.js';
import ta from './ta.js';

/** @type {Readonly<Record<string, Readonly<Record<string, string | ((...args: string[]) => string)>>>>} */
export const CATALOGS = Object.freeze({
  en,
  ta,
});
