# Adding a chrome locale

Chrome strings (navigation, listings, consent, follow, contact, removed-post and
version pages) come from one catalog module per locale.

1. Copy `src/core/internal/messages/en.js` to
   `src/core/internal/messages/<tag>.js` (lower-case BCP-47 tag, e.g. `es.js`,
   `zh-hant.js`, `sr-latn.js`) and translate the values. Keep every key, in the
   same order.
2. Register it in `src/core/internal/messages/registry.js`: add
   `import es from './es.js';` and one line `es,` (or `'zh-hant': zhHant,` for a
   hyphenated tag) in `CATALOGS`.
3. Run `node --test test/messages-parity.test.js`. It checks the exact `en` key
   set, the same placeholders per key and non-empty text.

Placeholders: function values (`(count) => ...`) must use every argument the
`en` function uses, no more and no fewer; the argument names stay the same.
Reorder them freely to fit the grammar. Keep punctuation such as `{`-free
template literals; do not add HTML. `formatDate` takes `YYYY-MM-DD` and must
return a localized date (use
`Intl.DateTimeFormat(tag, { dateStyle: 'medium', timeZone: 'UTC' })`).

Tone: plain, short UI labels, the wording a native reader expects on a website.
Keep brand and product names untranslated (Galascribe, RSS, GitHub, JavaScript,
Ctrl, Command).

Lookup order for a page language: exact tag, language plus script, primary
subtag, then `en`. `zh` resolves to `zh-hans` (`zh-TW`/`zh-HK`/`zh-MO` to
`zh-hant`), `no` and `nn` to `nb`, `iw` to `he`. A site without language
variants uses its `defaultLanguage` catalog for all chrome.
